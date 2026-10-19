import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncApiKeysToDb } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const ENV_FILE_PATH = path.resolve(ROOT_DIR, '.env');
const KEYS_FILE_PATH = path.resolve(ROOT_DIR, 'keys.json');

export const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/**
 * Reads all configured ElevenLabs API keys.
 * Checks ELEVENLABS_API_KEYS, ELEVENLABS_API_KEY, and keys.json.
 * @returns {string[]}
 */
export function getKeyPool() {
  const keys = new Set();

  if (process.env.ELEVENLABS_API_KEYS) {
    const parts = process.env.ELEVENLABS_API_KEYS.split(',');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed) keys.add(trimmed);
    }
  }

  if (process.env.ELEVENLABS_API_KEY) {
    const single = process.env.ELEVENLABS_API_KEY.trim();
    if (single) keys.add(single);
  }

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
 * Saves updated key pool to .env and keys.json and MySQL.
 * @param {string[]} keys
 */
export function saveKeyPool(keys) {
  const uniqueKeys = Array.from(new Set(keys.map(k => k.trim()).filter(Boolean)));

  process.env.ELEVENLABS_API_KEYS = uniqueKeys.join(',');
  process.env.ELEVENLABS_API_KEY = uniqueKeys[0] || '';

  try {
    fs.writeFileSync(KEYS_FILE_PATH, JSON.stringify(uniqueKeys, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write keys.json:', e.message);
  }

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
 */
export async function validateApiKey(apiKey) {
  const key = (apiKey || getApiKey()).trim();
  if (!key) {
    throw new Error('ElevenLabs API Key is not provided.');
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
    headers: { 'xi-api-key': key }
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
 */
export async function addKeyToPool(newKey) {
  const trimmed = newKey.trim();
  if (!trimmed) {
    throw new Error('API key cannot be empty');
  }

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

/** Remove exactly the exhausted key; other keys may share the same suffix. */
export function removeExhaustedKeyFromPool(key) {
  const pool = getKeyPool();
  if (!pool.includes(key)) return;
  saveKeyPool(pool.filter(item => item !== key));
  console.warn(`[ElevenLabs] Removed exhausted key ${key.slice(0, 4)}...${key.slice(-4)} from the saved pool.`);
}

/**
 * Inspects all keys in the pool and returns their individual quota & health status.
 */
export async function getKeyPoolDetails() {
  const pool = getKeyPool();
  if (pool.length === 0) return [];

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

        const isReady = !isExhausted && (sub.status === 'active' || sub.status === 'free' || sub.status === 'trialing' || !sub.status);
        return {
          id: `key_${idx}`,
          index: idx,
          maskedKey: masked,
          tier: sub.tier || 'free',
          characterCount: charCount,
          characterLimit: charLimit,
          remainingCharacters: remaining,
          status: isExhausted ? 'exhausted' : (isReady ? 'ready' : sub.status || 'ready'),
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
