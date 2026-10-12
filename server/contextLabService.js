import fs from 'fs';
import path from 'path';
import os from 'os';
import { saveSample } from './datasetService.js';
import { generateGeminiSpeech, normalizeMultilingualBidiText, sanitizeVoice } from './geminiService.js';
import { detectViaSpeakerAcoustics } from './alignment/whisperBridge.js';
import { sliceAudioBySegments } from './markerAlignmentService.js';

/**
 * Builds the pure multi-speaker batch prompt for the Context Switching Slicing Lab.
 * Enforces strict Arabic-to-Kurdish phonetic reset to prevent Arabic accent bleed.
 */
export function buildContextLabBatchPrompt(paragraphs, options = {}) {
  const {
    speaker1Voice = 'Puck',
    speaker2Voice = 'Aoede',
    dialect = 'sorani'
  } = options;

  const cleanParagraphs = (paragraphs || [])
    .map(p => normalizeMultilingualBidiText(String(p || '').trim()))
    .filter(Boolean);

  const cleanSpk1 = sanitizeVoice(speaker1Voice);
  const cleanSpk2 = sanitizeVoice(speaker2Voice);

  const isBadini = dialect === 'badini';
  const dialectName = isBadini ? 'Northern Kurdish (Badini)' : 'Central Kurdish (Sorani)';
  const intonationName = isBadini ? 'Duhok/Badinan' : 'Erbil/Sulaymaniyah';

  const accentResetDirective = `CRITICAL ARABIC-TO-KURDISH ACCENT RESET RULE:
When reading any phrase transitioning from Arabic words (e.g. religious terms, Arabic idioms, or loanwords) into Kurdish words, you MUST IMMEDIATELY and COMPLETELY reset your voice to pure, authentic native ${dialectName} phonology with natural ${intonationName} intonation.
Under NO circumstances carry over Arabic accents, Arabic gutturals (ع, ح), pharyngealization, Arabic intonation, or Arabic vowel elongation into the following Kurdish words. Pronounce Kurdish vowels (ۆ, ێ, ە) and consonants (چ, ژ, گ, ڤ, ڵ, ڕ) with crisp, authentic native Kurdish articulation.`;

  const speechParts = cleanParagraphs.map((p, idx) => {
    const isSpk1 = idx % 2 === 0;
    const speakerId = isSpk1 ? 'Speaker1' : 'Speaker2';
    return {
      text: p,
      speech_metadata: {
        speaker: speakerId,
        style: `Native ${dialectName} delivery. Strictly reset accent after Arabic phrases without carrying over Arabic phonetics into Kurdish. Hold 1.5s dead silence at the end.`
      }
    };
  });

  const legacyPrompt = speechParts.map((sp, idx) => `${idx % 2 === 0 ? 'Speaker1' : 'Speaker2'}: ${sp.text}`).join('\n\n');

  const instruction = `You are a professional multilingual voice actor performing high-fidelity speech synthesis. Speaker1 (${cleanSpk1}) and Speaker2 (${cleanSpk2}) alternate reading each line turn-by-turn with natural, fluent delivery across Kurdish, English, and Arabic.

${accentResetDirective}

Between each speaker turn, pause in 1.5 full seconds of complete, dead silence before the next speaker begins.`;

  const multiSpeakerConfig = {
    speakerVoiceConfigs: [
      {
        speaker: 'Speaker1',
        voiceConfig: { prebuiltVoiceConfig: { voiceName: cleanSpk1 } }
      },
      {
        speaker: 'Speaker2',
        voiceConfig: { prebuiltVoiceConfig: { voiceName: cleanSpk2 } }
      }
    ]
  };

  return {
    cleanParagraphs,
    speechParts,
    legacyPrompt,
    instruction,
    multiSpeakerConfig,
    cleanSpk1,
    cleanSpk2
  };
}

/**
 * Helper to build playable clip objects with embedded Base64 audio.
 */
function buildClipObjects(paragraphs, segments, buffers, engineName, spk1, spk2) {
  return paragraphs.map((text, idx) => {
    const seg = segments[idx] || {};
    const buf = buffers[idx];
    const isSpk1 = idx % 2 === 0;
    const voiceName = isSpk1 ? spk1 : spk2;
    const base64Audio = buf ? `data:audio/wav;base64,${buf.toString('base64')}` : '';

    return {
      index: idx + 1,
      engine: engineName,
      speakerName: voiceName,
      speakerTurn: isSpk1 ? 'Speaker1' : 'Speaker2',
      text,
      start: seg.start || 0,
      end: seg.end || 0,
      duration: seg.duration || 0,
      audioUrl: base64Audio,
      boundaryInfo: seg.boundary_info || null
    };
  });
}

/**
 * Executes multi-speaker batch generation and provides side-by-side comparison across:
 * - pyannote: Pyannote 3.0 Neural Diarization Baseline (Old ArgMax)
 * - tri_hybrid: Tri-Hybrid Fusion (Diarization + Silero VAD + FFmpeg Silence)
 * - all: Side-by-Side Comparison Matrix
 * Strictly adheres to project rules: Never fallback to 1:1 individual requests; Never fallback to Gemini 2.5.
 */
export async function generateContextLabBatch({
  paragraphs = [],
  startIdx = 1,
  dialect = 'sorani',
  model = 'gemini-3.8-flash-tts',
  apiKey = '',
  speaker1Voice = 'Puck',
  speaker2Voice = 'Aoede',
  detectionEngine = 'all',
  autoSaveToDataset = false,
  signal = null
}) {
  if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');

  const {
    cleanParagraphs,
    speechParts,
    legacyPrompt,
    instruction,
    multiSpeakerConfig,
    cleanSpk1,
    cleanSpk2
  } = buildContextLabBatchPrompt(paragraphs, {
    speaker1Voice,
    speaker2Voice,
    dialect
  });

  if (cleanParagraphs.length === 0) {
    throw new Error('At least one paragraph is required for batch generation.');
  }

  const validEngines = ['pyannote', 'tri_hybrid', 'all'];
  let engineMode = detectionEngine;
  if (engineMode === 'both' || engineMode === 'compare') engineMode = 'all';
  if (!validEngines.includes(engineMode)) engineMode = 'all';

  const MAX_BATCH_ATTEMPTS = 3;

  let tempMaster = null;
  let genResult = null;
  let segResult = null;
  let slicedData = {};
  let lastErrorReason = '';
  let masterAudioBase64 = null;

  for (let attempt = 1; attempt <= MAX_BATCH_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');

    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
      tempMaster = null;
    }

    try {
      console.log(`[Context Lab] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Synthesizing multi-speaker dialogue (${cleanSpk1} ↔ ${cleanSpk2}, Engine: ${engineMode})...`);

      genResult = await generateGeminiSpeech({
        speechParts,
        speechStyle: instruction,
        text: legacyPrompt,
        voiceName: cleanSpk1,
        dialect,
        promptInstruction: instruction,
        apiKey,
        model: 'gemini-3.8-flash-tts',
        multiSpeakerConfig
      });

      if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');

      if (!genResult.audioBuffer || genResult.audioBuffer.length < 8000) {
        throw new Error('Gemini returned empty or invalid audio stream.');
      }

      masterAudioBase64 = `data:audio/wav;base64,${genResult.audioBuffer.toString('base64')}`;
      tempMaster = path.resolve(os.tmpdir(), `ctx_lab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
      fs.writeFileSync(tempMaster, genResult.audioBuffer);

      if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');

      console.log(`[Context Lab] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Detecting boundaries via "${engineMode}" engine...`);
      segResult = await detectViaSpeakerAcoustics(tempMaster, cleanParagraphs.length, engineMode);

      if (!segResult.success) {
        throw new Error(`Acoustic detection failed: ${segResult.error || 'Unknown error'}`);
      }

      // Slice audio buffers
      if (engineMode === 'all') {
        const engines = segResult.engines || {};
        for (const [key, res] of Object.entries(engines)) {
          const segs = res.segments || [];
          if (segs.length === cleanParagraphs.length) {
            const bufs = await sliceAudioBySegments(tempMaster, segs, { emotion: 'neutral', stripBreathing: true });
            slicedData[key] = {
              buffers: bufs,
              clips: buildClipObjects(cleanParagraphs, segs, bufs, key, cleanSpk1, cleanSpk2)
            };
          }
        }
      } else {
        const segs = segResult.segments || [];
        if (segs.length !== cleanParagraphs.length) {
          throw new Error(`Segment count mismatch for ${engineMode}: got ${segs.length}, expected ${cleanParagraphs.length}`);
        }
        const bufs = await sliceAudioBySegments(tempMaster, segs, { emotion: 'neutral', stripBreathing: true });
        slicedData[engineMode] = {
          buffers: bufs,
          clips: buildClipObjects(cleanParagraphs, segs, bufs, engineMode, cleanSpk1, cleanSpk2)
        };
      }

      console.log(`[Context Lab] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Slicing completed successfully!`);
      break;
    } catch (err) {
      lastErrorReason = err.message || 'Unknown slicing error';
      console.warn(`[Context Lab] Attempt ${attempt}/${MAX_BATCH_ATTEMPTS} rejected: ${lastErrorReason}`);
      if (tempMaster && fs.existsSync(tempMaster)) {
        try { fs.unlinkSync(tempMaster); } catch (_) { }
        tempMaster = null;
      }
      if (attempt < MAX_BATCH_ATTEMPTS) {
        console.log(`[Context Lab] Retrying batch (${attempt + 1}/${MAX_BATCH_ATTEMPTS}) with Gemini...`);
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }

  // Cleanup temp master
  if (tempMaster && fs.existsSync(tempMaster)) {
    try { fs.unlinkSync(tempMaster); } catch (_) { }
  }

  if (signal?.aborted) throw new Error('[Context Lab] Aborted by user.');

  if (Object.keys(slicedData).length === 0) {
    throw new Error(`[Context Lab] Batch generation failed after ${MAX_BATCH_ATTEMPTS} attempts: ${lastErrorReason}. Strict policy forbids 1:1 fallback.`);
  }

  const comparisonTable = segResult.comparisonTable || [];

  return {
    success: true,
    mode: engineMode,
    masterAudioUrl: masterAudioBase64,
    pyannoteClips: slicedData.pyannote?.clips || [],
    triHybridClips: slicedData.tri_hybrid?.clips || [],
    clips: slicedData[engineMode]?.clips || slicedData.tri_hybrid?.clips || slicedData.pyannote?.clips || [],
    comparisonTable,
    durationSeconds: segResult.totalDuration || 0,
    speaker1Voice: cleanSpk1,
    speaker2Voice: cleanSpk2
  };
}
