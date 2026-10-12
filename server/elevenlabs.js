import {
  getKeyPool,
  saveKeyPool,
  getApiKey,
  validateApiKey,
  addKeyToPool,
  removeKeyFromPool,
  getKeyPoolDetails
} from './elevenlabs/keyPoolManager.js';
import { getVoices, getModels } from './elevenlabs/modelCatalog.js';
import { callElevenLabsTTS } from './elevenlabs/ttsClient.js';

// Re-exports for 100% backward compatibility
export {
  getKeyPool,
  saveKeyPool,
  getApiKey,
  validateApiKey,
  addKeyToPool,
  removeKeyFromPool,
  getKeyPoolDetails,
  getVoices,
  getModels
};

/**
 * Generates speech with automatic multi-key pool failover.
 */
export async function generateSpeech({
  text,
  emotionTag = '',
  includeTagInPrompt = true,
  voiceId,
  modelId = 'eleven_v3',
  voiceSettings = {},
  outputFormat = 'mp3_44100_128',
  apiKey
}) {
  const pool = apiKey ? [apiKey.trim()] : getKeyPool();
  if (pool.length === 0) {
    throw new Error('No ElevenLabs API keys configured. Please add one or more keys in Settings or Key Manager.');
  }
  if (!text || !text.trim()) {
    throw new Error('Kurdish text input cannot be empty');
  }
  if (!voiceId) {
    throw new Error('Voice ID is required for speech generation');
  }

  let promptText = text.trim();
  if (emotionTag && emotionTag.trim() && includeTagInPrompt) {
    promptText = `${emotionTag.trim()} ${promptText}`;
  }

  const errors = [];
  for (let i = 0; i < pool.length; i++) {
    const currentKey = pool[i];
    const maskedKey = `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}`;

    try {
      console.log(`[TTS Engine] Attempting synthesis with Key #${i + 1} (${maskedKey})...`);
      const result = await callElevenLabsTTS({
        apiKey: currentKey,
        text: promptText,
        voiceId,
        modelId,
        voiceSettings,
        outputFormat
      });

      console.log(`[TTS Engine] Success with Key #${i + 1} (${maskedKey})!`);
      return { ...result, keyUsedMasked: maskedKey, keyIndex: i };
    } catch (err) {
      console.warn(`[TTS Engine] Key #${i + 1} (${maskedKey}) failed: ${err.message}`);
      errors.push(`Key #${i + 1} (${maskedKey}): ${err.message}`);
      if (i === pool.length - 1) break;
      console.log(`[TTS Engine] Automatically failing over to next API key in pool (Key #${i + 2})...`);
    }
  }

  throw new Error(`All ${pool.length} ElevenLabs API keys in pool failed or ran out of quota (${errors.length} keys failed). Please add another ElevenLabs key in Settings.`);
}
