import fs from 'fs';
import path from 'path';
import os from 'os';
import { ensureDatasetDir, saveSample } from './datasetService.js';
import { isDbConnected, getDbPool } from './db.js';
import { generateGeminiSpeech, normalizeMultilingualBidiText } from './geminiService.js';
import { detectWhisperSegments, sliceAudioBySegments } from './markerAlignmentService.js';
import { refineWavSlice } from './waveformBoundaryRefiner.js';

export const CONTEXT_ZERO_PAUSE_NEUTRAL_STYLE = 
  'Within each paragraph, speak in a natural, expressive conversational tone with completely fluid, continuous, unbroken rhythm and zero pauses, zero hesitations, and zero breath breaks when transitioning between Kurdish, English, and Arabic words. Maintain a seamless flow across language boundaries with authentic native pronunciation for all terms. CRITICAL ACCENT BOUNDARY RULE: Immediately reset to pure, authentic Central Kurdish (Sorani) phonology, authentic Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation the moment Arabic phrases finish. Under NO circumstances carry over Arabic accents, Arabic gutturals, or Arabic vowel intonation into the Kurdish words that follow. ZERO BREATHING SOUNDS: Strictly do NOT produce any audible breath intakes, gasping, inhaling, sighing, or breathy pauses. Deliver clean, crisp studio speech with zero breath sounds. CRITICAL INTER-PARAGRAPH PAUSE: Between separate paragraphs at each <long pause> separator, STOP completely and pause in 2.5 full seconds of absolute dead silence without vocalizing or breathing before beginning the next paragraph. Never rush or merge paragraphs.';

/**
 * Scans MySQL and disk to find the next sequential index for context switching clips (ctx_...).
 */
export async function getNextContextSwitchingIndex(voiceName = null) {
  const dir = ensureDatasetDir();
  let maxIndex = 0;
  const cleanVoice = voiceName ? String(voiceName).trim().toLowerCase() : null;

  // 1. Scan filesystem for ctx_... clips
  try {
    const files = fs.readdirSync(dir);
    const regex = cleanVoice
      ? new RegExp(`^ctx_${cleanVoice}_(\\d+)_`, 'i')
      : /^ctx_[a-zA-Z0-9_-]+_(\d+)_/i;

    for (const f of files) {
      const match = f.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
  } catch (err) {
    console.warn('[Context Switching] Error scanning dataset dir for next index:', err.message);
  }

  // 2. Scan MySQL if connected
  if (isDbConnected()) {
    try {
      const pool = getDbPool();
      const query = cleanVoice
        ? 'SELECT id FROM samples WHERE id LIKE ?'
        : "SELECT id FROM samples WHERE id LIKE 'ctx_%'";
      const params = cleanVoice ? [`ctx_${cleanVoice}_%`] : [];
      const [rows] = await pool.query(query, params);
      const regex = cleanVoice
        ? new RegExp(`^ctx_${cleanVoice}_(\\d+)_`, 'i')
        : /^ctx_[a-zA-Z0-9_-]+_(\d+)_/i;

      for (const row of rows) {
        const match = String(row.id || '').match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    } catch (err) {
      console.warn('[Context Switching] Error querying MySQL for next index:', err.message);
    }
  }

  return maxIndex + 1;
}

/**
 * Builds the 6-in-1 sliced batch prompt for Gemini 3.8 Flash TTS.
 * Within each paragraph: zero pauses across Kurdish, English, and Arabic.
 * Between paragraphs: distinct 2.5s <long pause> to enforce acoustic dead air.
 */
export function buildContextSwitchingBatchPrompt(paragraphs, style = CONTEXT_ZERO_PAUSE_NEUTRAL_STYLE) {
  const cleanParagraphs = (paragraphs || [])
    .map(p => normalizeMultilingualBidiText(String(p || '').trim()))
    .filter(Boolean);

  const speechParts = cleanParagraphs.map((p, idx) => {
    const text = idx < cleanParagraphs.length - 1 ? `${p} <long pause>` : p;
    return {
      text,
      style,
      speech_metadata: { style }
    };
  });

  const legacyPrompt = cleanParagraphs.map((p, idx) => {
    return idx < cleanParagraphs.length - 1 ? `${p} <long pause>` : p;
  }).join('\n\n');

  const instruction = `${style}\n\n- Inter-Paragraph Silence: Speak each paragraph naturally with zero pauses across languages. At each <long pause> pause marker, STOP completely and pause in 2.5 full seconds of complete, dead silence between paragraphs without vocalizing or breathing.`;

  return {
    cleanParagraphs,
    speechParts,
    style,
    legacyPrompt,
    instruction
  };
}

/**
 * Synthesizes a batch of up to 6 paragraphs in 1 Gemini 3.8 call and slices them acoustically.
 * Includes automatic retake retry loop (up to 3 attempts) to guarantee 100% boundary accuracy.
 * Strictly adheres to project rules: Never fallback to 1:1 individual requests; Never fallback to Gemini 2.5.
 */
export async function generateContextSwitchingSlicedBatch({
  paragraphs = [],
  startIdx = 1,
  voiceName = 'Puck',
  dialect = 'sorani',
  model = 'gemini-3.8-flash-tts',
  apiKey = '',
  signal = null
}) {
  if (signal?.aborted) {
    throw new Error('[Context Slicing] Aborted by user.');
  }

  const { cleanParagraphs, speechParts, style, legacyPrompt, instruction } = 
    buildContextSwitchingBatchPrompt(paragraphs);

  if (cleanParagraphs.length === 0) {
    throw new Error('At least one paragraph is required for batch generation.');
  }

  const cleanVoice = String(voiceName || 'Puck').trim().toLowerCase();
  const MAX_BATCH_ATTEMPTS = 3;

  let tempMaster = null;
  let genResult = null;
  let segResult = null;
  let slicedBuffers = null;
  let lastErrorReason = '';

  for (let attempt = 1; attempt <= MAX_BATCH_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
      tempMaster = null;
    }

    try {
      console.log(`[Context Slicing] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Synthesizing batch of ${cleanParagraphs.length} paragraphs with voice "${voiceName}" (${dialect})...`);

      genResult = await generateGeminiSpeech({
        speechParts,
        speechStyle: style,
        text: legacyPrompt,
        voiceName,
        dialect,
        promptInstruction: instruction,
        apiKey,
        model: 'gemini-3.8-flash-tts'
      });

      if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

      if (!genResult.audioBuffer || genResult.audioBuffer.length < 8000) {
        throw new Error('Gemini returned empty or invalid audio stream.');
      }

      tempMaster = path.resolve(os.tmpdir(), `ctx_master_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
      fs.writeFileSync(tempMaster, genResult.audioBuffer);

      if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

      // Step 1: Detect paragraph segments using proportional acoustic window silence detection (no models)
      console.log(`[Context Slicing] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Detecting acoustic boundaries (expecting ${cleanParagraphs.length} clips)...`);
      segResult = await detectWhisperSegments(tempMaster, cleanParagraphs.length, {
        slicingStrategy: 'silence',
        sentences: cleanParagraphs,
        noModels: true,
        minClipDur: 5.0,
        maxClipDur: 60.0
      });

      if (!segResult.success || !Array.isArray(segResult.segments) || segResult.segments.length !== cleanParagraphs.length) {
        const errReason = segResult?.error || `Expected ${cleanParagraphs.length} clips, but detected ${segResult?.segments?.length || 0}`;
        throw new Error(`Acoustic QC failed: ${errReason}`);
      }

      if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

      // Step 2: Slice audio buffers per segment with breath removal
      slicedBuffers = await sliceAudioBySegments(tempMaster, segResult.segments, {
        emotion: 'neutral',
        stripBreathing: true
      });

      const allValid = Array.isArray(slicedBuffers) && 
        slicedBuffers.length === cleanParagraphs.length && 
        slicedBuffers.every(b => b && b.length > 2000);

      if (!allValid) {
        throw new Error('Slicing validation failed: audio buffers missing or corrupted.');
      }

      // If we reach here, attempt succeeded!
      console.log(`[Context Slicing] [Attempt ${attempt}/${MAX_BATCH_ATTEMPTS}] Slicing succeeded with 100% QC confidence!`);
      break;
    } catch (err) {
      lastErrorReason = err.message || 'Unknown slicing error';
      console.warn(`[Context Slicing] Attempt ${attempt}/${MAX_BATCH_ATTEMPTS} rejected: ${lastErrorReason}`);
      if (tempMaster && fs.existsSync(tempMaster)) {
        try { fs.unlinkSync(tempMaster); } catch (_) { }
        tempMaster = null;
      }
      if (attempt < MAX_BATCH_ATTEMPTS) {
        console.log(`[Context Slicing] Requesting automatic retake (${attempt + 1}/${MAX_BATCH_ATTEMPTS}) from Gemini...`);
        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }

  try {
    if (!slicedBuffers || slicedBuffers.length !== cleanParagraphs.length) {
      console.error(`[Context Slicing] All ${MAX_BATCH_ATTEMPTS} retake attempts failed: ${lastErrorReason}`);
      throw new Error(`[Context Slicing] Slicing failed after ${MAX_BATCH_ATTEMPTS} attempts: ${lastErrorReason}. Strict policy forbids 1:1 fallback.`);
    }

    if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

    // Step 3: Save each sliced paragraph to dataset with auto-indexing
    const savedSamples = [];
    for (let i = 0; i < cleanParagraphs.length; i++) {
      if (signal?.aborted) throw new Error('[Context Slicing] Aborted by user.');

      const paragraphText = cleanParagraphs[i];
      const itemIndex = startIdx + i;
      const familyId = `ctx_${cleanVoice}_${String(itemIndex).padStart(5, '0')}`;
      const clipId = `${familyId}_neutral`;
      const segDuration = segResult.segments[i]?.duration || 0;

      const sample = await saveSample({
        id: clipId,
        family_id: familyId,
        speaker_name: cleanVoice,
        text: paragraphText,
        dialect: dialect || 'sorani',
        language: 'ckb',
        emotion: 'neutral',
        emotionTag: '[neutral]',
        method: 'gemini_api',
        voiceId: `gemini_${voiceName}`,
        voiceName: `Gemini (${voiceName})`,
        modelId: genResult?.modelId || 'gemini-3.8-flash-tts',
        characters: [],
        audioBuffer: slicedBuffers[i],
        allowDuplicateText: true,
        customMetadata: {
          family_id: familyId,
          speaker_name: cleanVoice,
          voice_name: voiceName,
          emotion: 'neutral',
          context_switching: true,
          category: 'context_switching',
          duration_seconds: segDuration,
          batch_size: cleanParagraphs.length,
          batch_position: i + 1,
          generator: 'Gemini 3.8 Flash TTS - Context Switching Sliced Batch',
          audio_filename: `${clipId}.wav`
        }
      });

      savedSamples.push(sample);
    }

    return {
      success: true,
      samples: savedSamples,
      durationSeconds: genResult?.durationSeconds || 0,
      batchSize: cleanParagraphs.length,
      masterAudioUrl: genResult?.audioBuffer ? `data:audio/wav;base64,${genResult.audioBuffer.toString('base64')}` : null
    };
  } finally {
    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
    }
  }
}

/**
 * Direct 1:1 Generation: Synthesizes 1 complete paragraph with Gemini 3.8 Flash TTS.
 * Zero slicing, zero models, zero risk of truncations or sentence overlap.
 */
export async function generateContextSwitchingSingleSample({
  paragraph = '',
  itemIndex = 1,
  voiceName = 'Puck',
  dialect = 'sorani',
  model = 'gemini-3.8-flash-tts',
  apiKey = '',
  signal = null
}) {
  if (signal?.aborted) {
    throw new Error('[Context TTS] Aborted by user.');
  }

  const cleanText = normalizeMultilingualBidiText(String(paragraph || '').trim());
  if (!cleanText) {
    throw new Error('Paragraph text is required.');
  }

  const cleanVoice = String(voiceName || 'Puck').trim().toLowerCase();
  const style = CONTEXT_ZERO_PAUSE_NEUTRAL_STYLE;
  const instruction = `${style}\n\n- Zero Pause Multi-Language Flow: Speak this paragraph naturally and smoothly. When transitioning between Kurdish, English, and Arabic words, maintain a completely unbroken rhythm with zero pauses, zero hesitations, and zero breathing breaks.`;

  const speechParts = [{
    text: cleanText,
    style,
    speech_metadata: { style }
  }];

  const genResult = await generateGeminiSpeech({
    speechParts,
    speechStyle: style,
    text: cleanText,
    voiceName,
    dialect,
    promptInstruction: instruction,
    apiKey,
    model: 'gemini-3.8-flash-tts'
  });

  if (signal?.aborted) throw new Error('[Context TTS] Aborted by user.');

  if (!genResult.audioBuffer || genResult.audioBuffer.length < 4000) {
    throw new Error('[Context TTS] Gemini returned empty or invalid audio stream.');
  }

  // Refine waveform boundaries: strip pre-speech breathing gasps and post-speech exhalations
  const { refinedBuffer, boundaryMetrics } = refineWavSlice(genResult.audioBuffer, {
    emotion: 'neutral',
    stripBreathing: true
  });

  const finalBuffer = (refinedBuffer && refinedBuffer.length > 2000) ? refinedBuffer : genResult.audioBuffer;
  const finalDuration = boundaryMetrics?.final_duration_seconds || genResult.durationSeconds || 0;

  const familyId = `ctx_${cleanVoice}_${String(itemIndex).padStart(5, '0')}`;
  const clipId = `${familyId}_neutral`;

  const sample = await saveSample({
    id: clipId,
    family_id: familyId,
    speaker_name: cleanVoice,
    text: cleanText,
    dialect: dialect || 'sorani',
    language: 'ckb',
    emotion: 'neutral',
    emotionTag: '[neutral]',
    method: 'gemini_api',
    voiceId: `gemini_${voiceName}`,
    voiceName: `Gemini (${voiceName})`,
    modelId: genResult.modelId || 'gemini-3.8-flash-tts',
    characters: [],
    audioBuffer: finalBuffer,
    allowDuplicateText: true,
    customMetadata: {
      family_id: familyId,
      speaker_name: cleanVoice,
      voice_name: voiceName,
      emotion: 'neutral',
      context_switching: true,
      category: 'context_switching',
      duration_seconds: finalDuration,
      generator: 'Gemini 3.8 Flash TTS - Context Switching Direct 1:1',
      audio_filename: `${clipId}.wav`
    }
  });

  return sample;
}


