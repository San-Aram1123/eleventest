import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureWavBuffer } from './wavUtils.js';
import { syncApiKeysToDb, deleteDbApiKey } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env');
const KEYS_FILE_PATH = path.resolve(__dirname, '..', 'keys.json');

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Reads all configured ElevenLabs API keys.
 * Checks ELEVENLABS_API_KEYS, ELEVENLABS_API_KEY, and keys.json.
 * @returns {string[]}
 */
export function getKeyPool() {
  const keys = new Set();

  // 1. From process.env.ELEVENLABS_API_KEYS (comma separated)
  if (process.env.ELEVENLABS_API_KEYS) {
    const parts = process.env.ELEVENLABS_API_KEYS.split(',');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed) keys.add(trimmed);
    }
  }

  // 2. From process.env.ELEVENLABS_API_KEY (single fallback)
  if (process.env.ELEVENLABS_API_KEY) {
    const single = process.env.ELEVENLABS_API_KEY.trim();
    if (single) keys.add(single);
  }

  // 3. From keys.json if exists
  if (fs.existsSync(KEYS_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(KEYS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const k of parsed) {
          if (typeof k === 'string' && k.trim()) {
            keys.add(k.trim());
          }
        }
      }
    } catch (e) {
      console.warn('Could not read keys.json:', e.message);
    }
  }

  return Array.from(keys);
}

/**
 * Saves updated key pool to .env and keys.json and MySQL
 * @param {string[]} keys
 */
export function saveKeyPool(keys) {
  const uniqueKeys = Array.from(new Set(keys.map(k => k.trim()).filter(Boolean)));
  
  // Update process.env
  process.env.ELEVENLABS_API_KEYS = uniqueKeys.join(',');
  process.env.ELEVENLABS_API_KEY = uniqueKeys[0] || '';

  // Save to keys.json
  try {
    fs.writeFileSync(KEYS_FILE_PATH, JSON.stringify(uniqueKeys, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write keys.json:', e.message);
  }

  // Save to .env
  try {
    let envContent = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
      
      if (envContent.includes('ELEVENLABS_API_KEYS=')) {
        envContent = envContent.replace(/ELEVENLABS_API_KEYS=.*/g, `ELEVENLABS_API_KEYS=${uniqueKeys.join(',')}`);
      } else {
        envContent += `\nELEVENLABS_API_KEYS=${uniqueKeys.join(',')}\n`;
      }

      if (envContent.includes('ELEVENLABS_API_KEY=')) {
        envContent = envContent.replace(/ELEVENLABS_API_KEY=.*/g, `ELEVENLABS_API_KEY=${uniqueKeys[0] || ''}`);
      } else {
        envContent += `\nELEVENLABS_API_KEY=${uniqueKeys[0] || ''}\n`;
      }
    } else {
      envContent = `ELEVENLABS_API_KEYS=${uniqueKeys.join(',')}\nELEVENLABS_API_KEY=${uniqueKeys[0] || ''}\nPORT=5000\nDATASET_DIR=dataset\n`;
    }
    fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
  } catch (e) {
    console.warn('Could not write .env:', e.message);
  }

  // Sync to MySQL api_keys table
  syncApiKeysToDb('elevenlabs', uniqueKeys).catch(() => {});

  return uniqueKeys;
}

/**
 * Helper to get the primary active ElevenLabs API key.
 */
export function getApiKey(overrideKey) {
  if (overrideKey && overrideKey.trim()) {
    return overrideKey.trim();
  }
  const pool = getKeyPool();
  return pool[0] || '';
}

/**
 * Validates an API key and fetches user subscription details.
 * @param {string} apiKey
 */
export async function validateApiKey(apiKey) {
  const key = (apiKey || getApiKey()).trim();
  if (!key) {
    throw new Error('ElevenLabs API Key is not provided.');
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
    headers: {
      'xi-api-key': key
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `ElevenLabs API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      message = errJson.detail?.message || errJson.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Adds a new API key to the key pool after validation.
 * @param {string} newKey
 */
export async function addKeyToPool(newKey) {
  const trimmed = newKey.trim();
  if (!trimmed) {
    throw new Error('API key cannot be empty');
  }

  // Validate with ElevenLabs API
  const userInfo = await validateApiKey(trimmed);

  const currentPool = getKeyPool();
  if (!currentPool.includes(trimmed)) {
    currentPool.push(trimmed);
    saveKeyPool(currentPool);
  }

  return {
    success: true,
    maskedKey: `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`,
    userInfo,
    poolSize: currentPool.length
  };
}

/**
 * Removes an API key by index or value.
 * @param {number|string} indexOrKey
 */
export function removeKeyFromPool(indexOrKey) {
  const pool = getKeyPool();
  let updated = [];

  if (typeof indexOrKey === 'number') {
    updated = pool.filter((_, idx) => idx !== indexOrKey);
  } else {
    updated = pool.filter(k => k !== indexOrKey && !k.endsWith(indexOrKey.slice(-4)));
  }

  saveKeyPool(updated);
  return {
    success: true,
    poolSize: updated.length
  };
}

/**
 * Inspects all keys in the pool and returns their individual quota & health status.
 */
export async function getKeyPoolDetails() {
  const pool = getKeyPool();
  if (pool.length === 0) {
    return [];
  }

  const results = await Promise.all(
    pool.map(async (key, idx) => {
      const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
      try {
        const userInfo = await validateApiKey(key);
        const sub = userInfo.subscription || {};
        const charCount = sub.character_count || 0;
        const charLimit = sub.character_limit || 10000;
        const remaining = Math.max(0, charLimit - charCount);
        const isExhausted = remaining <= 0;

        return {
          id: `key_${idx}`,
          index: idx,
          maskedKey: masked,
          tier: sub.tier || 'free',
          characterCount: charCount,
          characterLimit: charLimit,
          remainingCharacters: remaining,
          status: isExhausted ? 'exhausted' : (sub.status === 'active' || !sub.status ? 'ready' : sub.status),
          isValid: true,
          error: null
        };
      } catch (err) {
        return {
          id: `key_${idx}`,
          index: idx,
          maskedKey: masked,
          tier: 'unknown',
          characterCount: 0,
          characterLimit: 0,
          remainingCharacters: 0,
          status: 'invalid',
          isValid: false,
          error: err.message
        };
      }
    })
  );

  return results;
}

/**
 * Fetch available voices from ElevenLabs using the first working key.
 */
export async function getVoices(overrideKey) {
  const pool = overrideKey ? [overrideKey] : getKeyPool();
  if (pool.length === 0) {
    throw new Error('ElevenLabs API Key is required to fetch voices');
  }

  let lastError = null;
  for (const key of pool) {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: { 'xi-api-key': key }
      });

      if (response.ok) {
        const data = await response.json();
        return (data.voices || []).map(voice => ({
          voice_id: voice.voice_id,
          name: voice.name,
          category: voice.category,
          preview_url: voice.preview_url,
          labels: voice.labels || {},
          description: voice.description || ''
        }));
      }
      lastError = new Error(await response.text());
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(`Failed to fetch voices with key pool: ${lastError?.message}`);
}

/**
 * Fetch available models from ElevenLabs.
 */
export async function getModels(overrideKey) {
  const pool = overrideKey ? [overrideKey] : getKeyPool();
  if (pool.length === 0) {
    return getDefaultModels();
  }

  for (const key of pool) {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
        headers: { 'xi-api-key': key }
      });

      if (response.ok) {
        const data = await response.json();
        return (data || []).map(m => ({
          model_id: m.model_id,
          name: m.name,
          description: m.description,
          can_do_text_to_speech: m.can_do_text_to_speech,
          can_do_voice_conversion: m.can_do_voice_conversion,
          languages: m.languages || []
        }));
      }
    } catch (e) {
      // Continue to next key
    }
  }

  return getDefaultModels();
}

function getDefaultModels() {
  return [
    {
      model_id: 'eleven_v3',
      name: 'ElevenLabs v3',
      description: 'Latest flagship model with emotional audio tags support ([laugh], [whisper], [sigh], [angry]).'
    },
    {
      model_id: 'eleven_multilingual_v3',
      name: 'Eleven Multilingual v3',
      description: 'Multilingual v3 synthesis with rich expressive control.'
    },
    {
      model_id: 'eleven_turbo_v3',
      name: 'Eleven Turbo v3',
      description: 'Ultra-fast low latency v3 synthesis.'
    },
    {
      model_id: 'eleven_multilingual_v2',
      name: 'Eleven Multilingual v2',
      description: 'Stable multilingual synthesis across 29 languages including Arabic & Kurdish script.'
    },
    {
      model_id: 'eleven_turbo_v2_5',
      name: 'Eleven Turbo v2.5',
      description: 'Fast multilingual generation.'
    },
    {
      model_id: 'eleven_flash_v2_5',
      name: 'Eleven Flash v2.5',
      description: 'Ultra low latency 75ms response time.'
    }
  ];
}

/**
 * Performs a single TTS request with a specific key.
 */
async function callElevenLabsTTS({
  apiKey,
  text,
  voiceId,
  modelId,
  voiceSettings,
  outputFormat
}) {
  const urlWithTimestamps = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${encodeURIComponent(outputFormat)}`;

  const requestBody = {
    text,
    model_id: modelId,
    voice_settings: {
      stability: voiceSettings.stability ?? 0.5,
      similarity_boost: voiceSettings.similarity_boost ?? 0.75,
      style: voiceSettings.style ?? 0.0,
      use_speaker_boost: voiceSettings.use_speaker_boost ?? true
    }
  };

  const response = await fetch(urlWithTimestamps, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const generationId = response.headers.get('history-item-id') || 
                       response.headers.get('request-id') || 
                       'gen_' + Date.now();

  if (response.ok) {
    const data = await response.json();
    const rawAudioBase64 = data.audio_base64;
    if (!rawAudioBase64) {
      throw new Error('ElevenLabs API returned response without audio data');
    }

    const rawBuffer = Buffer.from(rawAudioBase64, 'base64');
    const audioBuffer = ensureWavBuffer(rawBuffer, 44100);

    return {
      audioBuffer,
      alignment: data.alignment || null,
      characters: data.alignment?.characters || [],
      generationId
    };
  }

  // Handle fallback to binary stream
  const errorText = await response.text();
  let isQuotaError = response.status === 401 || response.status === 402 || response.status === 429;
  let parsedMsg = errorText;
  try {
    const errJson = JSON.parse(errorText);
    parsedMsg = errJson.detail?.message || errJson.message || errorText;
    if (errJson.detail?.status === 'quota_exceeded' || parsedMsg.toLowerCase().includes('quota') || parsedMsg.toLowerCase().includes('credit') || parsedMsg.toLowerCase().includes('character limit')) {
      isQuotaError = true;
    }
  } catch {}

  // If quota / auth error, throw immediately with quota flag
  if (isQuotaError) {
    const quotaErr = new Error(`Key quota exhausted / auth error (${response.status}): ${parsedMsg}`);
    quotaErr.isQuotaError = true;
    quotaErr.statusCode = response.status;
    throw quotaErr;
  }

  // Try standard endpoint fallback
  const fallbackUrl = `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${encodeURIComponent(outputFormat)}`;
  const fallbackResponse = await fetch(fallbackUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/*'
    },
    body: JSON.stringify(requestBody)
  });

  if (!fallbackResponse.ok) {
    const fallbackErr = await fallbackResponse.text();
    let fbMsg = fallbackErr;
    let fbIsQuota = fallbackResponse.status === 401 || fallbackResponse.status === 402 || fallbackResponse.status === 429;
    try {
      const errJson = JSON.parse(fallbackErr);
      fbMsg = errJson.detail?.message || errJson.message || fallbackErr;
      if (errJson.detail?.status === 'quota_exceeded' || fbMsg.toLowerCase().includes('quota')) {
        fbIsQuota = true;
      }
    } catch {}
    const err = new Error(`ElevenLabs API generation failed (${fallbackResponse.status}): ${fbMsg}`);
    err.isQuotaError = fbIsQuota;
    err.statusCode = fallbackResponse.status;
    throw err;
  }

  const rawArrayBuffer = await fallbackResponse.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);
  const audioBuffer = ensureWavBuffer(rawBuffer, 44100);

  return {
    audioBuffer,
    alignment: null,
    characters: [],
    generationId: fallbackResponse.headers.get('history-item-id') || 'gen_' + Date.now()
  };
}

/**
 * Generates speech with automatic multi-key pool failover.
 * If Key #1 runs out of quota or hits rate limits, automatically falls back to Key #2, etc.
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
      return {
        ...result,
        keyUsedMasked: maskedKey,
        keyIndex: i
      };
    } catch (err) {
      console.warn(`[TTS Engine] Key #${i + 1} (${maskedKey}) failed: ${err.message}`);
      errors.push(`Key #${i + 1} (${maskedKey}): ${err.message}`);

      // If this is the last key, stop and throw
      if (i === pool.length - 1) {
        break;
      }
      console.log(`[TTS Engine] Automatically failing over to next API key in pool (Key #${i + 2})...`);
    }
  }

  throw new Error(`All ${pool.length} ElevenLabs API keys in pool failed or ran out of quota (${errors.length} keys failed). Please add another ElevenLabs key in Settings.`);
}
