import fs from 'fs';
import { generateGeminiSpeech } from './geminiService.js';
import { saveSample, ensureDatasetDir } from './datasetService.js';
import {
  getEmotionPromptDirective,
  getEmotionSpeechStyle,
  REQUIRED_EMOTIONS,
  EMOTION_PROFILE_VERSION,
  EMOTION_STYLE_PROFILES,
  evaluateQcConfidence
} from './pairedEmotionConfig.js';
import { refineWavSlice } from './waveformBoundaryRefiner.js';
import { isDbConnected, getAllDbSamples } from './db.js';

/**
 * Formats a sentence index into a standard 3-digit string: 1 -> '001'.
 */
export function formatSentenceId(index) {
  return String(index).padStart(3, '0');
}

/**
 * Builds standard family ID: e.g. 'spk01_001'.
 */
export function buildFamilyId(speakerId, sentenceIndex) {
  const cleanSpk = String(speakerId || 'spk01').trim();
  const numStr = formatSentenceId(sentenceIndex);
  return `${cleanSpk}_${numStr}`;
}

/**
 * Builds standard clip filename / ID: e.g. 'spk01_001_neutral'.
 */
export function buildClipId(familyId, emotion) {
  return `${familyId}_${emotion.toLowerCase()}`;
}

/**
 * Scans dataset and database to find the absolute highest existing sentence/family index globally
 * across all speakers (e.g. spk01_001, spk02_012), ensuring each new batch creates brand new
 * sequential families without ever overwriting past runs.
 */
export async function getNextFamilyIndex(speakerId = null) {
  const cleanSpk = speakerId ? String(speakerId).trim() : null;
  const dir = ensureDatasetDir();
  let maxIndex = 0;

  // 1. Scan filesystem for all family indices
  try {
    const files = fs.readdirSync(dir);
    // Matches any family: e.g. spk01_006_angry.wav, spk02_012_happy.json
    const regexGlobal = /^[a-zA-Z0-9_-]+?_(\d+)_[a-zA-Z0-9_-]+/;
    for (const f of files) {
      const match = f.match(regexGlobal);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }

    if (cleanSpk) {
      const regexSpk = new RegExp(`^${cleanSpk}_(\\d+)_`, 'i');
      for (const f of files) {
        const match = f.match(regexSpk);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxIndex) maxIndex = num;
        }
      }
    }
  } catch (err) {
    console.warn(`[Paired] Error scanning family index from disk:`, err.message);
  }

  // 2. Scan MySQL database if connected
  try {
    if (isDbConnected()) {
      const dbSamples = await getAllDbSamples();
      if (Array.isArray(dbSamples)) {
        for (const s of dbSamples) {
          const fId = s.family_id || s.metadata_extra?.family_id;
          if (fId) {
            const m = String(fId).match(/_(\d+)$/);
            if (m) {
              const num = parseInt(m[1], 10);
              if (num > maxIndex) maxIndex = num;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[Paired] Error scanning family index from DB:`, err.message);
  }

  return maxIndex + 1;
}

/**
 * Generates a single emotion take for a given sentence and family.
 */
export async function generatePairedEmotionClip({
  speakerId = 'spk01',
  voiceName = 'Puck',
  dialect = 'sorani',
  language = 'ckb',
  sentence = '',
  sentenceIndex = 1,
  familyId = null,
  emotion = 'neutral',
  intensity = null,
  model = 'gemini-3.8-flash-tts',
  apiKey = ''
}) {
  const cleanSentence = String(sentence || '').trim();
  if (!cleanSentence) {
    throw new Error('Sentence text is required');
  }

  const fId = familyId || buildFamilyId(speakerId, sentenceIndex);
  const clipEmotion = String(emotion || 'neutral').toLowerCase();
  const clipId = buildClipId(fId, clipEmotion);
  const targetLang = language || (dialect === 'badini' ? 'kmr' : 'ckb');

  // Fallback to default intensity if not provided
  let finalIntensity = intensity;
  if (finalIntensity === null || finalIntensity === undefined) {
    const foundReq = REQUIRED_EMOTIONS.find(e => e.id === clipEmotion);
    finalIntensity = foundReq ? foundReq.defaultIntensity : 0.8;
  }
  finalIntensity = Math.max(0.0, Math.min(1.0, parseFloat(finalIntensity) || 0.0));

  const emoKey = String(clipEmotion || 'neutral').toLowerCase();
  const styleDirective = getEmotionSpeechStyle(emoKey, finalIntensity, targetLang);
  const instruction = getEmotionPromptDirective(clipEmotion, finalIntensity, targetLang);

  console.log(`[Paired Batch] Synthesizing clip "${clipId}.wav" (${clipEmotion}, lang=${targetLang}, intensity=${finalIntensity}) with voice "${voiceName}" using speech_metadata.style...`);

  const genResult = await generateGeminiSpeech({
    text: cleanSentence,
    speechStyle: styleDirective,
    voiceName,
    dialect: targetLang === 'kmr' ? 'badini' : 'sorani',
    promptInstruction: instruction,
    apiKey,
    model
  });

  // Automatically refine audio boundaries against the actual audio waveform
  const { refinedBuffer, boundaryMetrics: bMetrics } = refineWavSlice(genResult.audioBuffer, {
    isWhisper: clipEmotion === 'whisper',
    emotion: clipEmotion
  });

  const finalDurationSeconds = bMetrics?.final_duration_seconds || genResult.durationSeconds || 0;
  const qcEval = evaluateQcConfidence(1.0, bMetrics);

  const sample = await saveSample({
    id: clipId,
    family_id: fId,
    emotion_intensity: finalIntensity,
    speaker_name: speakerId,
    text: cleanSentence,
    dialect: targetLang === 'kmr' ? 'badini' : 'sorani',
    language: targetLang,
    emotion: clipEmotion,
    emotionTag: `[${clipEmotion}]`,
    method: 'gemini_api',
    voiceId: `gemini_${voiceName}`,
    voiceName: `Gemini (${voiceName})`,
    modelId: genResult.modelId || model,
    characters: genResult.characters || [],
    audioBuffer: refinedBuffer,
    allowDuplicateText: true,
    training_ready: qcEval.training_ready,
    qc_status: qcEval.status,
    qc_grade: qcEval.grade,
    customMetadata: {
      family_id: fId,
      speaker_name: speakerId,
      emotion_intensity: finalIntensity,
      duration_seconds: finalDurationSeconds,
      language: targetLang,
      rendered_tts_text: cleanSentence,
      speech_style: EMOTION_STYLE_PROFILES[clipEmotion]?.style || clipEmotion,
      vocal_events: [],
      segmentation_strategy: 'individual_1to1',
      segmentation_confidence: 1.0,
      boundary_metrics: bMetrics,
      leading_silence_ms: bMetrics?.leading_silence_ms ?? 0,
      trailing_silence_ms: bMetrics?.trailing_silence_ms ?? 0,
      boundary_qc_pass: bMetrics?.boundary_qc_pass ?? true,
      was_waveform_trimmed: bMetrics?.was_trimmed ?? false,
      qc_status: qcEval.status,
      qc_grade: qcEval.grade,
      training_ready: qcEval.training_ready,
      review_required: qcEval.review_required,
      emotion_profile_version: EMOTION_PROFILE_VERSION,
      api_generation_mode: 'individual_1to1',
      model: genResult.modelId || model,
      generator: `Google Gemini TTS (${genResult.modelId || model}) - Paired Emotion Mode`,
      audio_filename: `${clipId}.wav`
    }
  });

  return {
    success: true,
    sample,
    familyId: fId,
    clipId,
    audioUrl: sample.audioUrl || `/api/dataset/${clipId}/audio`,
    durationSeconds: finalDurationSeconds
  };
}

/**
 * Generates all selected emotions for one family (one sentence).
 */
export async function generateFullFamilySet({
  speakerId = 'spk01',
  voiceName = 'Puck',
  dialect = 'sorani',
  language = 'ckb',
  sentence = '',
  sentenceIndex = 1,
  emotions = [],
  model = 'gemini-3.8-flash-tts',
  apiKey = '',
  onProgress = null
}) {
  const fId = buildFamilyId(speakerId, sentenceIndex);
  const targetEmotions = (emotions && emotions.length > 0)
    ? emotions
    : REQUIRED_EMOTIONS.map(e => ({ emotion: e.id, intensity: e.defaultIntensity }));

  const results = [];
  const errors = [];

  for (let i = 0; i < targetEmotions.length; i++) {
    const item = targetEmotions[i];
    const emotionName = typeof item === 'string' ? item : item.emotion;
    const intensity = typeof item === 'object' ? item.intensity : null;

    let res = null;
    let lastErr = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        res = await generatePairedEmotionClip({
          speakerId,
          voiceName,
          dialect,
          language,
          sentence,
          sentenceIndex,
          familyId: fId,
          emotion: emotionName,
          intensity,
          model,
          apiKey
        });
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`[Paired Batch] Take ${fId}_${emotionName} attempt ${attempt}/2 failed: ${err.message}`);
        if (attempt < 2) await new Promise(r => setTimeout(r, 1500));
      }
    }

    if (res) {
      results.push(res);
      if (onProgress) {
        onProgress({ familyId: fId, emotion: emotionName, completed: i + 1, total: targetEmotions.length, success: true });
      }
    } else {
      errors.push({ familyId: fId, emotion: emotionName, error: lastErr?.message || 'Failed after 2 attempts' });
      if (onProgress) {
        onProgress({ familyId: fId, emotion: emotionName, completed: i + 1, total: targetEmotions.length, success: false, error: lastErr?.message });
      }
    }
  }

  return {
    familyId: fId,
    speakerId,
    sentence,
    totalRequested: targetEmotions.length,
    successfulCount: results.length,
    clips: results,
    errors
  };
}
