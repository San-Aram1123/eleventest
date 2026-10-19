import { dualPilotIdentity, saveDualPilotSample, cachedGeminiMaster } from './shared/dualPilotRunStore.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';
export { generateElevenLabsDualPilotTake, getRotatedElevenLabsKey } from './dualPilotElevenService.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateGeminiSpeech, sanitizeVoice, normalizeMultilingualBidiText, analyzeMultilingualContent } from './geminiService.js';
import { detectLocalSpeakerSegments, validateEngineResult } from './alignment/localSpeakerBridge.js';
import { evaluateGeminiClipAcceptance } from './shared/geminiClipAcceptance.js';
import { buildHybridCutPlan } from './hybridCutSelector.js';
import { readPcmWav, slicePcmWav } from './shared/wavPcm.js';
import { getEmotionSpeechStyle } from './pairedEmotionConfig.js';
import { detectViaSilence } from './alignment/silenceDetector.js';
import { logSlicingReport, formatSlicingFailureSummary } from './alignment/slicingLogger.js';

/**
 * Builds the multi-speaker alternating prompt for Gemini 3.8.
 * Line 0, 2, 4 = Female (Speaker1), Line 1, 3, 5 = Male (Speaker2).
 */
export function buildDualPilotGeminiPrompt(paragraphs, options = {}) {
  const rawParagraphs = paragraphs.map(p => normalizeMultilingualBidiText(String(p || '').trim())).filter(Boolean);
  if (rawParagraphs.length === 0 || rawParagraphs.length > 12) {
    throw new Error('Provide 1 to 12 paragraphs for Gemini batch synthesis.');
  }

  const femaleVoice = sanitizeVoice(options.femaleVoice || 'Aoede');
  const maleVoice = sanitizeVoice(options.maleVoice || 'Puck');
  const intensity = options.intensity ?? 0.8;
  const language = options.language || (options.dialect === 'badini' ? 'kmr' : 'ckb');
  const delivery = options.deliveryStyle || 'normal';

  let deliveryNote = '';
  if (delivery === 'whisper') {
    deliveryNote = ' Stays strictly whispered, breathy, and unvoiced throughout.';
  } else if (delivery === 'laughing_speech') {
    deliveryNote = ' Speak with bubbling chuckles and laughing speech while keeping words clearly intelligible.';
  }

  const baseEmotion = options.emotion || 'neutral';
  const parsedParagraphs = rawParagraphs.map(raw => ({
    rawText: raw, cleanText: extractEmotionAndCleanText(raw).cleanText,
    emotion: baseEmotion, emotionTag: `[${baseEmotion}]`, hasInlineTag: false
  }));
  const voices = rawParagraphs.map((_, index) => sanitizeVoice(options.voices?.[index] || (index % 2 === 0 ? femaleVoice : maleVoice)));
  const uniqueVoices = [...new Set(voices)];
  if (uniqueVoices.length > 2) throw new Error('Gemini supports at most two distinct voices per call.');

  const cleanParagraphs = parsedParagraphs.map(p => p.cleanText);

  const langAnalysis = analyzeMultilingualContent(cleanParagraphs.join(' '));
  const isCodeSwitching = language === 'mixed' || langAnalysis.isMultilingual || (langAnalysis.hasLatin && langAnalysis.hasArabicScript);

  let langLabel = 'Central Kurdish (Sorani)';
  let langIntonation = 'Central Kurdish intonation with authentic Kurdish vowels (ۆ, ێ, ە)';
  let codeSwitchingRule = '';

  if (isCodeSwitching) {
    langLabel = 'multilingual Kurdish, English, and Arabic';
    langIntonation = 'authentic Kurdish intonation, natural English pronunciation, and crisp Arabic phonetics';
    codeSwitchingRule = ' Natural fluid code-switching across Kurdish, English, and Arabic with zero pauses across transitions. Immediately reset to pure authentic Kurdish phonology after Arabic invocations without accent bleed.';
  } else if (language === 'kmr' || options.dialect === 'badini') {
    langLabel = 'Northern Kurdish Badini (Kurmanji)';
    langIntonation = 'Northern Kurdish Badini intonation with authentic regional vowels (ڤ, خ, ح, غ, ۆ, ێ, ە)';
  } else if (language === 'ar') {
    langLabel = 'Modern Standard Arabic';
    langIntonation = 'authentic Arabic phonetics, clear articulation (ع, ح, ص, ض, ط, ظ, ق) and natural cadence';
  } else if (language === 'en') {
    langLabel = 'English';
    langIntonation = 'fluent native English pronunciation, expressive cadence, and natural phrasing';
  }

  const speechParts = parsedParagraphs.map((para, index) => {
    const paraEmotionStyle = getEmotionSpeechStyle(para.emotion, intensity, language);
    const lineCombinedStyle = `${paraEmotionStyle}.${deliveryNote}${codeSwitchingRule} Maintain natural conversational ${langIntonation}.`;
    return {
      text: para.cleanText,
      speech_metadata: {
        speaker: `Speaker${uniqueVoices.indexOf(voices[index]) + 1}`,
        style: lineCombinedStyle
      }
    };
  });

  const baseDirective = 'Apply the requested emotion to every line. Speak only the transcript, without saying tag names.';
  const instruction = `You are directing two native ${langLabel} voice actors. Speaker1 (${femaleVoice}, Female) and Speaker2 (${maleVoice}, Male) alternate turns. Deliver every line in order. Pause clearly between speaker turns. ${baseDirective}.${deliveryNote}${codeSwitchingRule}`;

  return {
    cleanParagraphs,
    voices,
    parsedParagraphs,
    cleanSpk1: femaleVoice,
    cleanSpk2: maleVoice,
    speechParts,
    instruction,
    legacyPrompt: speechParts.map(p => `${p.speech_metadata.speaker}: ${p.text}`).join('\n\n'),
    multiSpeakerConfig: {
      speakerVoiceConfigs: uniqueVoices.map((voiceName, index) => ({
        speaker: `Speaker${index + 1}`, voiceConfig: { prebuiltVoiceConfig: { voiceName } }
      }))
    }
  };
}

/**
 * Executes a 6-paragraph Gemini batch:
 * 1. Generates 1 continuous master WAV via Gemini 3.8.
 * 2. Runs baseline and emotion-aware local neural speaker slicing engines.
 * 3. Applies Gemini clip acceptance and hybrid per-boundary fallback.
 * 4. Slices the master WAV into individual takes.
 */
export async function generateGeminiDualPilotBatch(params = {}) {
  const { paragraphs = [], signal } = params;
  if (signal?.aborted) throw new Error('Aborted by user.');

  const targetLanguage = params.language || (params.dialect === 'badini' ? 'kmr' : 'ckb');
  const config = buildDualPilotGeminiPrompt(paragraphs, { ...params, language: targetLanguage });
  const model = 'gemini-3.8-flash-tts'; // Strictly enforced: zero fallback to 2.5 per project rules
  const count = config.cleanParagraphs.length;

  console.log(`\n🟣 [Gemini 3.8 Master] Starting 6-chunk generation:`);
  console.log(`   ├─ Language: ${targetLanguage} | Dialect: ${params.dialect || 'sorani'}`);
  console.log(`   ├─ Emotion: ${params.emotion || 'neutral'} (intensity: ${params.intensity ?? 0.8}) | Delivery: ${params.deliveryStyle || 'normal'}`);
  console.log(`   ├─ Voices: Female="${config.cleanSpk1}" (Speaker1), Male="${config.cleanSpk2}" (Speaker2)`);
  console.log(`   ├─ Paragraphs: ${count} alternating speaker turns`);
  console.log(`   └─ Dispatching to Google Gemini 3.8 Flash TTS...`);

  const generated = await cachedGeminiMaster(params, () => generateGeminiSpeech({
    speechParts: config.speechParts,
    speechStyle: config.instruction,
    text: config.legacyPrompt,
    voiceName: config.cleanSpk1,
    dialect: targetLanguage === 'kmr' ? 'badini' : (params.dialect || 'sorani'),
    promptInstruction: config.instruction,
    apiKey: params.apiKey || '',
    model,
    multiSpeakerConfig: config.multiSpeakerConfig,
    signal
  }));

  if (signal?.aborted) throw new Error('Aborted by user.');
  const audioBuffer = generated.audioBuffer;
  const wav = readPcmWav(audioBuffer);

  console.log(`   ✓ [Gemini 3.8] Master WAV received: ${wav.duration.toFixed(2)}s (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`   ├─ Running baseline and emotion-aware neural slicers plus silence across master WAV...`);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'dual_gemini_'));
  const masterPath = path.join(directory, 'master.wav');
  fs.writeFileSync(masterPath, audioBuffer);

  try {
    const count = config.cleanParagraphs.length;
    const [detection, silenceResult] = await Promise.all([
      detectLocalSpeakerSegments(masterPath, count, 'all', {}, signal),
      detectViaSilence(masterPath, count, {
        sentences: config.cleanParagraphs,
        minClipDur: 6.0,
        maxClipDur: 16
      }).catch(err => ({ success: false, error: err.message }))
    ]);

    if (signal?.aborted) throw new Error('Aborted by user.');

    const rawEngines = detection.engines || { all: detection };
    console.log('   ├─ Running Gemini emotion-aware slicing experiments...');
    const emotionDetection = await detectLocalSpeakerSegments(masterPath, count, 'emotion_experiments', {}, signal);
    for (const [name, result] of Object.entries(emotionDetection.engines || {})) rawEngines[name] = result;
    if (!Object.keys(emotionDetection.engines || {}).length) {
      rawEngines.emotion_experiments = { ...emotionDetection, name: 'emotion_experiments' };
    }
    for (const [name, result] of Object.entries(emotionDetection.engines || {})) {
      console.log(`   │  ${result.success ? '✓' : '·'} ${name}: ${result.success ? 'proposals ready' : (result.error || 'rejected')}`);
    }

    // Register silence slicing engine from Expressive Pilot among candidates
    if (silenceResult?.success && Array.isArray(silenceResult.segments) && silenceResult.segments.length === count) {
      rawEngines.silence = {
        success: true,
        totalDuration: wav.duration,
        segments: silenceResult.segments,
        confidence: silenceResult.confidence || 0.88,
        diagnostics: {
          minConfidence: silenceResult.confidence || 0.88,
          strategy: 'silence',
          qcMetrics: silenceResult.qcMetrics || null
        }
      };
    } else {
      rawEngines.silence = {
        success: false,
        totalDuration: wav.duration,
        error: silenceResult?.error || `Expected ${count} pauses, found ${silenceResult?.segments?.length || 0}`,
        segments: silenceResult?.segments || [],
        confidence: silenceResult?.confidence || 0,
        diagnostics: {
          strategy: 'silence',
          error: silenceResult?.error || 'Acoustic pause count mismatch'
        }
      };
    }

    const engineResults = {};

    for (const [key, raw] of Object.entries(rawEngines)) {
      const checked = validateEngineResult(raw, count, {}, wav.duration);
      const originalStrictRejection = checked.success ? null : (checked.error || raw.error || 'Strict acoustic gate rejected this method.');
      const acceptance = evaluateGeminiClipAcceptance(checked, count, wav.duration);
      checked.success = acceptance.accepted;
      checked.acceptedByGeminiClipPolicy = acceptance.accepted;
      checked.diagnostics = { ...(checked.diagnostics || {}), clipAcceptancePolicy: {
        expectedCount: count, minSeconds: 6, maxSeconds: 16, accepted: acceptance.accepted,
        reason: acceptance.reason, originalStrictRejection
      } };
      if (acceptance.accepted) {
        checked.originalStrictRejection = originalStrictRejection;
        checked.error = undefined;
        try {
          const segments = acceptance.segments.map((segment, idx) => ({
            ...segment,
            start: idx === 0 ? 0 : acceptance.segments[idx - 1].end,
            end: idx === acceptance.segments.length - 1 ? wav.duration : segment.end
          }));
          const buffers = await slicePcmWav(audioBuffer, segments);
          checked.segments = segments;
          checked.buffers = buffers;
          checked.clips = config.parsedParagraphs.map((para, idx) => ({
            index: idx + 1, engine: key, text: para.cleanText, rawText: para.rawText,
            emotion: para.emotion, emotionTag: para.emotionTag, hasInlineTag: para.hasInlineTag,
            speakerName: config.voices[idx],
            gender: idx % 2 === 0 ? 'Female' : 'Male', start: segments[idx].start,
            end: segments[idx].end, duration: segments[idx].duration,
            audioUrl: `data:audio/wav;base64,${buffers[idx].toString('base64')}`
          }));
        } catch (err) {
          checked.success = false;
          checked.acceptedByGeminiClipPolicy = false;
          checked.error = `PCM buffer slicing failed: ${err.message}`;
        }
      } else {
        checked.error = acceptance.reason;
      }
      engineResults[key] = checked;
    }

    const acceptedMethods = Object.entries(engineResults).filter(([, item]) =>
      item.acceptedByGeminiClipPolicy && item.clips?.length === count && item.buffers?.length === count);
    const hybridPlan = acceptedMethods.length ? null : buildHybridCutPlan(
      Object.entries(engineResults).map(([name, item]) => ({ name, ...item })), count, wav.duration, config.cleanParagraphs);
    let selection;
    if (acceptedMethods.length) {
      acceptedMethods.sort((left, right) =>
        Number(right[1].diagnostics?.minConfidence || right[1].confidence || 0) -
        Number(left[1].diagnostics?.minConfidence || left[1].confidence || 0));
      const [engine, item] = acceptedMethods[0];
      selection = { engine, score: Number(item.diagnostics?.minConfidence || item.confidence || 0),
        segments: item.segments, pendingReview: false,
        reason: item.originalStrictRejection
          ? `Accepted by Gemini clip policy: exact ${count}-clip partition and every clip is 6.00–16.00 seconds; original strict gate: ${item.originalStrictRejection}`
          : `Accepted by Gemini clip policy: exact ${count}-clip partition and every clip is 6.00–16.00 seconds.` };
    } else if (hybridPlan?.success) {
      const acceptance = evaluateGeminiClipAcceptance(hybridPlan, count, wav.duration);
      if (acceptance.accepted) {
        const buffers = await slicePcmWav(audioBuffer, acceptance.segments);
        const clips = config.parsedParagraphs.map((para, idx) => ({
          index: idx + 1, engine: 'per_boundary_hybrid', text: para.cleanText, rawText: para.rawText,
          emotion: para.emotion, emotionTag: para.emotionTag, hasInlineTag: para.hasInlineTag,
          speakerName: config.voices[idx],
          gender: idx % 2 === 0 ? 'Female' : 'Male', start: acceptance.segments[idx].start,
          end: acceptance.segments[idx].end, duration: acceptance.segments[idx].duration,
          audioUrl: `data:audio/wav;base64,${buffers[idx].toString('base64')}`
        }));
        engineResults.per_boundary_hybrid = { success: true, acceptedByGeminiClipPolicy: true,
          segments: acceptance.segments, clips, buffers, diagnostics: { hybridPlan },
          clipAcceptancePolicy: { accepted: true, reason: acceptance.reason } };
        selection = { engine: 'per_boundary_hybrid', score: 1, segments: acceptance.segments,
          pendingReview: false, reason: `Accepted hybrid: each handoff uses the best available slicer proposal; ${acceptance.reason}` };
      }
    }
    if (!selection) {
      logSlicingReport({
        title: 'Dual Pilot Gemini Master Slicing Report',
        provider: 'Gemini 3.8',
        masterPath,
        duration: wav.duration,
        expectedCount: count,
        engineResults,
        selection: null,
        failureError: 'No Gemini method produced the expected number of clips with every duration in the inclusive 6.00–16.00 second range.'
      });
      const summary = formatSlicingFailureSummary(engineResults);
      throw new Error(`Slicing failed: no method produced exactly ${count} clips all within 6.00–16.00 seconds.\nEngine breakdown: [${summary}]`);
    }

    logSlicingReport({
      title: 'Dual Pilot Gemini Master Slicing Report',
      provider: 'Gemini 3.8',
      masterPath,
      duration: wav.duration,
      expectedCount: count,
      engineResults,
      selection
    });

    const chosenResult = engineResults[selection.engine];

    if (!chosenResult || !chosenResult.clips || chosenResult.clips.length !== count) {
      const summary = formatSlicingFailureSummary(engineResults);
      throw new Error(`Slicing failed: Best engine ${selection.engine} could not resolve clean segments. Engine breakdown: [${summary}]`);
    }

    console.log(`   ✓ [Gemini 3.8] Slicing succeeded with engine: [${selection.engine}] (Score: ${selection.score})`);
    console.log(`   └─ Sliced into ${chosenResult.clips.length} individual paragraph clips.\n`);

    // Optionally save sliced takes to Dataset Manager (MySQL & disk)
    if (params.saveToDataset !== false && chosenResult.buffers) {
      for (let i = 0; i < chosenResult.clips.length; i++) {
        const clip = chosenResult.clips[i];
        const clipEmotion = clip.emotion || params.emotion || 'neutral';
        const clipEmotionTag = clip.emotionTag || (clipEmotion !== 'neutral' ? `[${clipEmotion}]` : '');

        if (clip.rejected) {
          console.warn(`   ⚠️ [Gemini Clip Policy] Clip #${i + 1} (${clip.duration.toFixed(2)}s) is outside the inclusive 6.0–16.0s range. Skipping dataset registration.`);
          continue;
        }

        try {
          const saved = await saveDualPilotSample({
            ...dualPilotIdentity(params, 'gemini', i),
            customMetadata: { voice_gender: i % 2 === 0 ? 'female' : 'male', segmentation_strategy: selection.engine, segmentation_confidence: selection.score },
            text: clip.text,
            speaker_name: clip.speakerName,
            dialect: targetLanguage === 'kmr' ? 'badini' : (params.dialect || 'sorani'),
            language: targetLanguage,
            emotion: clipEmotion,
            emotion_intensity: params.intensity ?? 0.8,
            emotionTag: clipEmotionTag,
            method: 'gemini_api',
            modelId: model,
            voiceName: clip.speakerName,
            audioBuffer: chosenResult.buffers[i],
            notes: `Dual Pilot V20 (Gemini 3.8 / ${selection.engine})`,
            allowDuplicateText: true
          });
          clip.savedDatasetId = saved.id;
          if (params.runId) clip.audioUrl = saved.audioUrl || `/api/dataset/${saved.id}/audio`;
          console.log(`   💾 [Dataset Manager] Registered Gemini clip #${i + 1} as Sample #${saved.id} (Emotion: ${clipEmotion})`);
        } catch (sErr) {
          throw sErr;
        }
      }
    }

    return {
      success: true,
      provider: 'gemini',
      modelId: model,
      selectedEngine: selection.engine,
      selectionScore: selection.score,
      selectionReason: selection.reason,
      clips: chosenResult.clips,
      masterAudioUrl: params.runId ? '' : `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
      durationSeconds: wav.duration
    };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

