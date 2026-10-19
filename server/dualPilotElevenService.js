import { callElevenLabsTTS } from './elevenlabs/ttsClient.js';
import { getKeyPool } from './elevenlabs/keyPoolManager.js';
import { getElevenLabsEmotionSettings } from './shared/v20EmotionCatalog.js';
import { dualPilotIdentity, saveDualPilotSample, cachedGeminiMaster } from './shared/dualPilotRunStore.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';
import { readPcmWav } from './shared/wavPcm.js';

let elevenlabsKeyIndex = 0;

/**
 * Returns the next ElevenLabs key via round-robin rotation.
 */
export function getRotatedElevenLabsKey() {
  const pool = getKeyPool();
  if (!pool || pool.length === 0) {
    throw new Error('No ElevenLabs API keys configured. Please add keys in the Key Pool.');
  }
  const key = pool[elevenlabsKeyIndex % pool.length];
  elevenlabsKeyIndex = (elevenlabsKeyIndex + 1) % pool.length;
  return { key, keyIndex: elevenlabsKeyIndex, totalKeys: pool.length };
}

/**
 * Generates an individual paragraph take via ElevenLabs with rotating key pool.
 */
export async function generateElevenLabsDualPilotTake(params = {}) {
  const {
    text,
    voiceId,
    voiceName = 'Eleven Voice',
    modelId = 'eleven_v4_turbo',
    emotion = 'neutral',
    intensity = 0.8,
    deliveryStyle = 'normal',
    voiceSettings: rawVoiceSettings
  } = params;

  if (!text || !text.trim()) throw new Error('Text is required for ElevenLabs take.');
  if (!voiceId) throw new Error('Voice ID is required for ElevenLabs.');

  const pool = getKeyPool();
  if (pool.length === 0) {
    throw new Error('No ElevenLabs API keys configured. Please add keys in the Key Pool.');
  }

  // Automatic condition owns the requested emotion; user tags cannot override it.
  const parsed = extractEmotionAndCleanText(text);
  const detectedEmotion = emotion || 'neutral';
  const detectedTag = `[${detectedEmotion}]`;
  const cleanSpokenText = parsed.cleanText || text.trim();

  const voiceSettings = rawVoiceSettings || getElevenLabsEmotionSettings(detectedEmotion, intensity);

  // Preserve the explicit emotion cue in the provider request.
  let promptText = `${detectedTag} ${cleanSpokenText}`;
  if (deliveryStyle === 'whisper' && !promptText.startsWith('[whisper]')) {
    promptText = `[whisper] ${promptText}`;
  }

  console.log(`\n🟢 [ElevenLabs v4 Turbo] Take: voice="${voiceName}" (${voiceId}) | Emotion=[${detectedEmotion}] (Intensity: ${intensity}${parsed.hasInlineTag ? ', inline tag detected' : ''})`);
  console.log(`   ├─ Emotion Settings: Style=${voiceSettings.style}, Stability=${voiceSettings.stability}, SimBoost=${voiceSettings.similarity_boost}`);
  console.log(`   ├─ Spoken Text (clean): "${promptText.slice(0, 65)}${promptText.length > 65 ? '...' : ''}"`);

  const errors = [];
  for (let attempt = 0; attempt < pool.length; attempt++) {
    params.signal?.throwIfAborted();
    const { key } = getRotatedElevenLabsKey();
    const maskedKey = `${key.slice(0, 4)}...${key.slice(-4)}`;
    console.log(`   ├─ Attempt ${attempt + 1}/${pool.length}: Dispatching via key ${maskedKey} (pcm_24000)...`);

    try {
      const result = await cachedGeminiMaster(params, () => callElevenLabsTTS({
        apiKey: key,
        text: promptText,
        voiceId,
        modelId,
        voiceSettings,
        outputFormat: 'pcm_24000',
        signal: params.signal
      }), 'elevenlabs');

      const wavBuffer = result.audioBuffer;
      let duration = 0;
      try {
        const wav = readPcmWav(wavBuffer);
        duration = wav.duration;
      } catch {
        duration = Math.max(0.5, Number((wavBuffer.length / (24000 * 2)).toFixed(2)));
      }

      let savedDatasetId = null;
      if (params.saveToDataset !== false) {
        try {
          const saved = await saveDualPilotSample({
            ...dualPilotIdentity(params, 'elevenlabs'),
            customMetadata: { voice_gender: params.gender || 'unknown' },
            text: cleanSpokenText, // strictly clean text, never inline tag
            speaker_name: voiceName,
            dialect: params.dialect || 'sorani',
            language: params.language || 'ckb',
            emotion: detectedEmotion,
            emotion_intensity: intensity,
            emotionTag: detectedTag,
            method: 'elevenlabs_api',
            modelId: modelId,
            voiceId,
            voiceName,
            audioBuffer: wavBuffer,
            notes: `Dual Pilot V20 (ElevenLabs v4 Turbo)`,
            allowDuplicateText: true
          });
          savedDatasetId = saved.id;
          console.log(`   💾 [Dataset Manager] Registered ElevenLabs take as Sample #${saved.id} (Emotion: ${detectedEmotion})`);
        } catch (sErr) {
          sErr.isDatasetError = true; throw sErr;
        }
      }

      console.log(`   ✓ [ElevenLabs v4 Turbo] Success! Duration: ${duration.toFixed(2)}s | ${(wavBuffer.length / 1024).toFixed(1)} KB (24kHz WAV)\n`);

      return {
        success: true,
        provider: 'elevenlabs',
        modelId,
        voiceId,
        voiceName,
        text: cleanSpokenText,
        rawText: text.trim(),
        emotion: detectedEmotion,
        emotionTag: detectedTag,
        hasInlineTag: parsed.hasInlineTag,
        duration,
        keyUsedMasked: maskedKey,
        savedDatasetId,
        audioUrl: savedDatasetId && params.runId ? `/api/dataset/${savedDatasetId}/audio` : `data:audio/wav;base64,${wavBuffer.toString('base64')}`
      };
    } catch (err) {
      console.warn(`   ⚠️ [ElevenLabs v4 Turbo] Attempt failed with key ${maskedKey}: ${err.message}`);
      if (params.signal?.aborted || err.code === 'EEXIST' || err.isDatasetError) throw err;
      errors.push(`Key ${maskedKey}: ${err.message}`);
      if (attempt === pool.length - 1) break;
    }
  }

  console.error(`   ❌ [ElevenLabs v4 Turbo] All keys in pool failed.`);
  throw new Error(`All ElevenLabs keys failed: ${errors.join(' | ')}`);
}

