import { generateGeminiSpeech } from './geminiService.js';
import { saveSample } from './datasetService.js';
import { getEmotionPromptDirective, REQUIRED_EMOTIONS } from './pairedEmotionConfig.js';

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
  model = 'gemini-3.1-flash-tts-preview',
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

  const instruction = getEmotionPromptDirective(clipEmotion, finalIntensity, targetLang);

  console.log(`[Paired Batch] Synthesizing clip "${clipId}.wav" (${clipEmotion}, lang=${targetLang}, intensity=${finalIntensity}) with voice "${voiceName}"...`);

  const genResult = await generateGeminiSpeech({
    text: cleanSentence,
    voiceName,
    dialect: targetLang === 'kmr' ? 'badini' : 'sorani',
    promptInstruction: instruction,
    apiKey,
    model
  });

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
    audioBuffer: genResult.audioBuffer,
    allowDuplicateText: true,
    customMetadata: {
      family_id: fId,
      speaker_name: speakerId,
      emotion_intensity: finalIntensity,
      duration_seconds: genResult.durationSeconds || 0,
      language: targetLang,
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
    durationSeconds: genResult.durationSeconds || 0
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
  model = 'gemini-3.1-flash-tts-preview',
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
