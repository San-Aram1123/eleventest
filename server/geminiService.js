import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureWavBuffer } from './wavUtils.js';
import { syncApiKeysToDb, deleteDbApiKey } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_FILE_PATH = path.resolve(__dirname, '..', '.env');
const GEMINI_KEYS_FILE_PATH = path.resolve(__dirname, '..', 'gemini_keys.json');
const GEMINI_DISABLED_KEYS_FILE_PATH = path.resolve(__dirname, '..', 'gemini_disabled_keys.json');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// In-memory runtime metrics per key (keyed by maskedKey)
const keyRuntimeMetrics = new Map();


/**
 * Calculates remaining milliseconds until Midnight Pacific Time (PT).
 * Google Cloud Free Tier quotas reset at Midnight PT (07:00 UTC during PDT).
 */
export function getMsUntilMidnightPT() {
  const now = new Date();
  const nextMidnightPT = new Date(now);
  nextMidnightPT.setUTCHours(7, 0, 0, 0); // 00:00 PT in PDT (UTC-7) is 07:00 UTC
  if (nextMidnightPT.getTime() <= now.getTime()) {
    nextMidnightPT.setUTCDate(nextMidnightPT.getUTCDate() + 1);
  }
  return Math.max(60000, nextMidnightPT.getTime() - now.getTime());
}

/**
 * Accurately extracts retry delay from Google Gemini's Quota error details and text.
 */
export function parseGoogleRetryDelayMs(errJson, errorText) {
  // 1. Check RetryInfo detail object in error details
  if (errJson && Array.isArray(errJson.error?.details)) {
    const retryInfo = errJson.error.details.find(d => 
      d['@type'] && d['@type'].includes('RetryInfo')
    );
    if (retryInfo && retryInfo.retryDelay) {
      const match = String(retryInfo.retryDelay).match(/([\d\.]+)\s*s?/i);
      if (match && match[1]) {
        const sec = parseFloat(match[1]);
        if (!isNaN(sec) && sec > 0) {
          return Math.ceil((sec + 1.5) * 1000);
        }
      }
    }
  }

  // 2. Check error message string for "Please retry in XX.XXs"
  const raw = (errJson?.error?.message || errorText || '');
  const match = raw.match(/retry\s+(?:in|after)\s+([\d\.]+)\s*s/i) ||
                raw.match(/([\d\.]+)\s*(?:seconds|s)\b/i);
  if (match && match[1]) {
    const parsedSec = parseFloat(match[1]);
    if (!isNaN(parsedSec) && parsedSec > 0) {
      return Math.ceil((parsedSec + 1.5) * 1000);
    }
  }

  return 30000; // Safe default 30s
}

/**
 * Determines whether quota exhaustion is a temporary rolling/per-minute rate limit (RPM)
 * or an actual daily free tier quota exhaustion.
 * CRITICAL FIX: If Google specifies a retry delay of <= 180 seconds, it is 100% a short
 * per-minute rate limit. DO NOT lock out the key for 18 hours!
 */
export function parseQuotaExhaustionInfo(errJson, errorText, delayMs) {
  const raw = (errJson?.error?.message || errorText || '').toLowerCase();
  const quotaId = (errJson?.error?.details?.find(d => d['@type']?.includes('QuotaFailure'))?.violations?.[0]?.quotaId || '').toLowerCase();

  // 1. FIRST PRIORITY: check if it is an explicit daily limit for this model
  const isExplicitDaily = quotaId.includes('perday') || quotaId.includes('daily') ||
                          raw.includes('daily') || 
                          raw.includes('per day') || 
                          raw.includes('per_day') || 
                          raw.includes('day limit') || 
                          raw.includes('quota per 24 hours');

  if (isExplicitDaily) {
    const msUntilReset = getMsUntilMidnightPT();
    return {
      isDaily: true,
      delayMs: msUntilReset,
      quotaType: 'daily',
      statusText: 'Free tier daily limit reached for this model. Resets at Midnight PT.'
    };
  }

  // 2. Short per-minute rate-limit cooldown (RPM or burst)
  if (delayMs && delayMs <= 300000) {
    const sec = Math.ceil(delayMs / 1000);
    return {
      isDaily: false,
      delayMs: delayMs,
      quotaType: 'minute',
      statusText: `Rate limit active (recovers in ${sec}s)`
    };
  }

  // Fallback: treat as short rate limit
  return {
    isDaily: false,
    delayMs: delayMs || 30000,
    quotaType: 'minute',
    statusText: `Rate limit active (recovers in ${Math.ceil((delayMs || 30000) / 1000)}s)`
  };
}

/**
 * Checks whether an HTTP status or error message means the key is permanently invalid or denied.
 */
export function isGoogleKeyInvalid(status, errorMsg) {
  const msg = (errorMsg || '').toLowerCase();
  return status === 401 ||
         (status === 400 && (msg.includes('api key not valid') || msg.includes('bad request') || msg.includes('key not valid'))) ||
         (status === 403 && (msg.includes('denied') || msg.includes('permission') || msg.includes('disabled') || msg.includes('unregistered') || msg.includes('blocked')));
}

/**
 * Clears any active cooldowns on all keys in memory.
 */
export function clearGeminiCooldowns() {
  for (const metric of keyRuntimeMetrics.values()) {
    if (metric.lastStatus !== 'invalid') {
      metric.retryAvailableAt = null;
      metric.cooldownDurationSeconds = null;
      metric.cooldownStartedAt = null;
      metric.lastStatus = 'ready';
      metric.lastError = null;
      metric.quotaType = 'minute';
      metric.failureCount = 0;
      if (metric.exhaustedModels) metric.exhaustedModels.clear();
    }
  }
  return { success: true, count: keyRuntimeMetrics.size };
}

// Keep backwards-compatible alias for any imports
export const parseRetryDelayMs = (err) => parseGoogleRetryDelayMs(null, err);

/**
 * Analyzes text to detect multilingual code-switching makeup across English, Kurdish, and Arabic.
 */
export function analyzeMultilingualContent(rawText) {
  if (!rawText) return { hasLatin: false, hasArabicScript: false, startsWithLatin: false, isMultilingual: false };

  // Strip emotion tags like [laugh], [whisper] so they don't count as English prose
  const textWithoutTags = rawText.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, ' ');

  const hasLatin = /[a-zA-Z]/.test(textWithoutTags);
  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(textWithoutTags);

  // Determine the script of the very first letter/word
  const trimmed = textWithoutTags.trim();
  const firstLetterMatch = trimmed.match(/^[^\p{L}\p{N}]*([\p{L}\p{N}])/u);
  const firstChar = firstLetterMatch ? firstLetterMatch[1] : '';
  const startsWithLatin = /[a-zA-Z]/.test(firstChar);

  const isMultilingual = hasLatin && hasArabicScript;

  return {
    hasLatin,
    hasArabicScript,
    startsWithLatin,
    isMultilingual,
    firstChar
  };
}

/**
 * Normalizes BiDi script boundaries to prevent punctuation and spacing collisions
 * between LTR (English) and RTL (Kurdish/Arabic) sentences.
 */
export function normalizeMultilingualBidiText(text) {
  if (!text) return '';
  let cleaned = text;

  // 1. Ensure clean spacing between Latin sentence end punctuation and Arabic script
  cleaned = cleaned.replace(/([a-zA-Z0-9][.!?])([\u0600-\u06FF])/g, '$1 $2');

  // 2. Ensure clean spacing between Arabic sentence end punctuation and Latin text
  cleaned = cleaned.replace(/([\u0600-\u06FF][.!?،؛؟])([a-zA-Z0-9])/g, '$1 $2');

  return cleaned.trim();
}

function getOrCreateKeyMetric(key) {
  const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
  if (!keyRuntimeMetrics.has(masked)) {
    keyRuntimeMetrics.set(masked, {
      maskedKey: masked,
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      lastStatus: 'ready',
      quotaType: 'minute',
      quotaLimit: '10',
      dailyResetInfo: null,
      lastError: null,
      lastUsedAt: null,
      retryAvailableAt: null,
      cooldownDurationSeconds: null,
      cooldownStartedAt: null,
      exhaustedModels: new Set()
    });
  }
  if (!keyRuntimeMetrics.get(masked).exhaustedModels) {
    keyRuntimeMetrics.get(masked).exhaustedModels = new Set();
  }
  return keyRuntimeMetrics.get(masked);
}

export const GEMINI_VOICES = [
  // --- Male Voices (29) ---
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Upbeat and lively tone (Recommended Default)' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Informative, authoritative, and measured narrator tone' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Passionate, strong, energetic tone' },
  { id: 'Orus', name: 'Orus', gender: 'Male', description: 'Calm, steady, firm tone' },
  { id: 'Enceladus', name: 'Enceladus', gender: 'Male', description: 'Soft, breathy, gentle tone' },
  { id: 'Iapetus', name: 'Iapetus', gender: 'Male', description: 'Clear, crisp, clean tone' },
  { id: 'Umbriel', name: 'Umbriel', gender: 'Male', description: 'Relaxed, easy-going, smooth tone' },
  { id: 'Algieba', name: 'Algieba', gender: 'Male', description: 'Smooth, flowing, melodic tone' },
  { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', description: 'Professional, articulate narrator tone' },
  { id: 'Schedar', name: 'Schedar', gender: 'Male', description: 'Even, balanced, steady tone' },
  { id: 'Pulcherrima', name: 'Pulcherrima', gender: 'Male', description: 'Forward, enterprising, dynamic tone' },
  { id: 'Achird', name: 'Achird', gender: 'Male', description: 'Friendly, warm, kind tone' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', gender: 'Male', description: 'Casual, relaxed, conversational tone' },
  { id: 'Algenib', name: 'Algenib', gender: 'Male', description: 'Gravelly, textured, hearty tone' },
  { id: 'Alnilam', name: 'Alnilam', gender: 'Male', description: 'Firm, confident, commanding tone' },
  { id: 'Sadachbia', name: 'Sadachbia', gender: 'Male', description: 'Lively, animated, engaging tone' },
  { id: 'Sadaltager', name: 'Sadaltager', gender: 'Male', description: 'Knowledgeable, wise, steady tone' },
  { id: 'Arlo', name: 'Arlo', gender: 'Male', description: 'Warm, approachable, natural tone' },
  { id: 'Knox', name: 'Knox', gender: 'Male', description: 'Conversational, dry humor, warm tone' },
  { id: 'Koda', name: 'Koda', gender: 'Male', description: 'Objective, direct, helpful tone' },
  { id: 'Ludo', name: 'Ludo', gender: 'Male', description: 'Confident, clear, instructional tone' },
  { id: 'Mako', name: 'Mako', gender: 'Male', description: 'Energetic, colorful, fast-paced tone' },
  { id: 'Milo', name: 'Milo', gender: 'Male', description: 'Intimate, conversational talkshow tone' },
  { id: 'Neno', name: 'Neno', gender: 'Male', description: 'Deep, velvety, unhurried tone' },
  { id: 'Olin', name: 'Olin', gender: 'Male', description: 'Light, airy, precise tone' },
  { id: 'Rami', name: 'Rami', gender: 'Male', description: 'Professional, modern interviewer tone' },
  { id: 'Riko', name: 'Riko', gender: 'Male', description: 'Clear, confident documentary narrator tone' },
  { id: 'Varo', name: 'Varo', gender: 'Male', description: 'Laid-back, encouraging, chill tone' },
  { id: 'Zeno', name: 'Zeno', gender: 'Male', description: 'Cool, confident, collaborative tone' },

  // --- Female Voices (26) ---
  { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Relaxed, natural, gentle tone (Recommended Default)' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Bright, clear, vibrant tone' },
  { id: 'Leda', name: 'Leda', gender: 'Female', description: 'Youthful, energetic, cheerful tone' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'Female', description: 'Friendly, warm, easy-going tone' },
  { id: 'Autonoe', name: 'Autonoe', gender: 'Female', description: 'Bright, cheerful, lively tone' },
  { id: 'Despina', name: 'Despina', gender: 'Female', description: 'Smooth, gentle, velvety tone' },
  { id: 'Erinome', name: 'Erinome', gender: 'Female', description: 'Clear, articulate, refined tone' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'Female', description: 'Positive, upbeat, sunny tone' },
  { id: 'Achernar', name: 'Achernar', gender: 'Female', description: 'Soft, warm, delicate tone' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', gender: 'Female', description: 'Gentle, delicate, intimate tone' },
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Firm, direct, authoritative tone' },
  { id: 'Sulafat', name: 'Sulafat', gender: 'Female', description: 'Warm, inviting, comforting tone' },
  { id: 'Gacrux', name: 'Gacrux', gender: 'Female', description: 'Mature, authoritative, professional tone' },
  { id: 'Lora', name: 'Lora', gender: 'Female', description: 'Clear, friendly, medium-pitch tone' },
  { id: 'Lumi', name: 'Lumi', gender: 'Female', description: 'Professional, approachable teacher tone' },
  { id: 'Nika', name: 'Nika', gender: 'Female', description: 'Professional, creative, approachable tone' },
  { id: 'Nyla', name: 'Nyla', gender: 'Female', description: 'Confident, clear, modern tone' },
  { id: 'Rina', name: 'Rina', gender: 'Female', description: 'Relaxed, friendly host tone' },
  { id: 'Sami', name: 'Sami', gender: 'Female', description: 'Cool, confident, collaborative narrator tone' },
  { id: 'Sola', name: 'Sola', gender: 'Female', description: 'Relaxed, pleasant, clear tone' },
  { id: 'Tari', name: 'Tari', gender: 'Female', description: 'Confident, expressive, cinematic tone' },
  { id: 'Tavi', name: 'Tavi', gender: 'Female', description: 'Intimate, stylish talkshow tone' },
  { id: 'Tova', name: 'Tova', gender: 'Female', description: 'Textured, resonant, soothing tone' },
  { id: 'Veda', name: 'Veda', gender: 'Female', description: 'Highly approachable, warm radio host tone' },
  { id: 'Zali', name: 'Zali', gender: 'Female', description: 'Engaging, empathic, lively tone' },
  { id: 'Zuri', name: 'Zuri', gender: 'Female', description: 'Natural, clear, articulate advisor tone' }
];

export const KNOWN_AUDIO_MODELS = [
  { id: 'gemini-3.8-flash-tts', name: 'Gemini 3.8 Flash TTS (Default)', isDefault: true },
  { id: 'gemini-3.8-flash-lite-tts', name: 'Gemini 3.8 Flash-Lite TTS' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' }
];

/**
 * Reads all configured Gemini API keys from all sources.
 * Checks GEMINI_API_KEYS, GEMINI_API_KEY, and gemini_keys.json.
 * @returns {string[]}
 */
export function getAllGeminiKeys() {
  const keys = new Set();
  const disabled = getDisabledGeminiKeys();

  // 1. From process.env.GEMINI_API_KEYS (comma separated)
  if (process.env.GEMINI_API_KEYS) {
    const parts = process.env.GEMINI_API_KEYS.split(',');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed && !disabled.has(trimmed)) keys.add(trimmed);
    }
  }

  // 2. From process.env.GEMINI_API_KEY (single fallback)
  if (process.env.GEMINI_API_KEY) {
    const single = process.env.GEMINI_API_KEY.trim();
    if (single && !disabled.has(single)) keys.add(single);
  }

  // 3. From gemini_keys.json if exists
  if (fs.existsSync(GEMINI_KEYS_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(GEMINI_KEYS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const k of parsed) {
          if (typeof k === 'string' && k.trim() && !disabled.has(k.trim())) {
            keys.add(k.trim());
          }
        }
      }
    } catch (e) {
      console.warn('Could not read gemini_keys.json:', e.message);
    }
  }

  return Array.from(keys);
}

/**
 * Reads the persistent list of turned-off / disabled Gemini API keys.
 * @returns {Set<string>}
 */
export function getDisabledGeminiKeys() {
  const disabled = new Set();
  if (fs.existsSync(GEMINI_DISABLED_KEYS_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(GEMINI_DISABLED_KEYS_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const k of parsed) {
          if (typeof k === 'string' && k.trim()) {
            disabled.add(k.trim());
          }
        }
      }
    } catch (e) {
      console.warn('Could not read gemini_disabled_keys.json:', e.message);
    }
  }
  return disabled;
}

/**
 * Persists the list of turned-off / disabled Gemini API keys to disk and DB.
 * @param {Set<string>|string[]} disabledKeys
 */
export function saveDisabledGeminiKeys(disabledKeys) {
  const keysArray = Array.isArray(disabledKeys) 
    ? disabledKeys 
    : Array.from(disabledKeys || []);
  const unique = Array.from(new Set(keysArray.map(k => String(k || '').trim()).filter(Boolean)));

  try {
    fs.writeFileSync(GEMINI_DISABLED_KEYS_FILE_PATH, JSON.stringify(unique, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write gemini_disabled_keys.json:', e.message);
  }
}

/**
 * Reads all active Gemini API keys (excluding turned off / disabled keys by default).
 * @param {{ includeDisabled?: boolean }} options
 * @returns {string[]}
 */
export function getGeminiKeyPool({ includeDisabled = false } = {}) {
  const allKeys = getAllGeminiKeys();
  if (includeDisabled) {
    return allKeys;
  }
  const disabled = getDisabledGeminiKeys();
  return allKeys.filter(k => !disabled.has(k));
}

/**
 * Toggles a key's enabled/disabled state by index or key substring.
 * @param {number|string} indexOrKey
 * @param {boolean|null} explicitEnabled
 */
export function toggleGeminiKey(indexOrKey, explicitEnabled = null) {
  const allKeys = getAllGeminiKeys();
  let targetKey = null;

  if (typeof indexOrKey === 'number') {
    targetKey = allKeys[indexOrKey];
  } else if (typeof indexOrKey === 'string') {
    targetKey = allKeys.find(k => k === indexOrKey || k.endsWith(indexOrKey.slice(-4)));
  }

  if (!targetKey) {
    throw new Error(`Key at identifier "${indexOrKey}" not found in Gemini pool.`);
  }

  const disabledKeys = getDisabledGeminiKeys();
  const currentlyDisabled = disabledKeys.has(targetKey);

  let willBeEnabled;
  if (typeof explicitEnabled === 'boolean') {
    willBeEnabled = explicitEnabled;
  } else {
    willBeEnabled = currentlyDisabled; // toggle: if disabled, enable it; if enabled, disable it
  }

  if (willBeEnabled) {
    disabledKeys.delete(targetKey);
  } else {
    disabledKeys.add(targetKey);
  }

  saveDisabledGeminiKeys(disabledKeys);

  const maskedKey = `${targetKey.slice(0, 4)}...${targetKey.slice(-4)}`;
  return {
    success: true,
    maskedKey,
    isEnabled: willBeEnabled,
    activeCount: allKeys.length - disabledKeys.size,
    totalCount: allKeys.length
  };
}

/**
 * Enables or disables all keys in the pool at once.
 * @param {boolean} enabled
 */
export function setAllGeminiKeysEnabled(enabled) {
  const allKeys = getAllGeminiKeys();
  const disabledKeys = new Set();
  if (!enabled) {
    for (const k of allKeys) {
      disabledKeys.add(k);
    }
  }
  saveDisabledGeminiKeys(disabledKeys);
  return {
    success: true,
    enabled,
    activeCount: enabled ? allKeys.length : 0,
    totalCount: allKeys.length
  };
}

/**
 * Enables or disables a specific subset of keys by their indices.
 * @param {number[]} indices
 * @param {boolean} enabled
 */
export function toggleMultipleGeminiKeys(indices, enabled) {
  const allKeys = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  const targetSet = new Set(indices);

  for (let idx = 0; idx < allKeys.length; idx++) {
    if (targetSet.has(idx)) {
      if (enabled) {
        disabledKeys.delete(allKeys[idx]);
      } else {
        disabledKeys.add(allKeys[idx]);
      }
    }
  }

  saveDisabledGeminiKeys(disabledKeys);
  return {
    success: true,
    enabled,
    activeCount: allKeys.length - disabledKeys.size,
    totalCount: allKeys.length
  };
}

/**
 * Saves updated Gemini key pool to .env and gemini_keys.json and MySQL
 * @param {string[]} keys
 */
export function saveGeminiKeyPool(keys) {
  const uniqueKeys = Array.from(new Set(keys.map(k => String(k || '').trim()).filter(Boolean)));

  // Update process.env
  process.env.GEMINI_API_KEYS = uniqueKeys.join(',');
  process.env.GEMINI_API_KEY = uniqueKeys[0] || '';

  // Save to gemini_keys.json
  try {
    fs.writeFileSync(GEMINI_KEYS_FILE_PATH, JSON.stringify(uniqueKeys, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write gemini_keys.json:', e.message);
  }

  // Save to .env
  try {
    let envContent = '';
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');

      if (envContent.includes('GEMINI_API_KEYS=')) {
        envContent = envContent.replace(/GEMINI_API_KEYS=.*/g, `GEMINI_API_KEYS=${uniqueKeys.join(',')}`);
      } else {
        envContent += `\nGEMINI_API_KEYS=${uniqueKeys.join(',')}\n`;
      }

      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${uniqueKeys[0] || ''}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${uniqueKeys[0] || ''}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEYS=${uniqueKeys.join(',')}\nGEMINI_API_KEY=${uniqueKeys[0] || ''}\nPORT=5000\nDATASET_DIR=dataset\n`;
    }
    fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
  } catch (e) {
    console.warn('Could not write GEMINI_API_KEYS to .env:', e.message);
  }

  // Sync to MySQL api_keys table
  syncApiKeysToDb('gemini', uniqueKeys).catch(() => {});

  return uniqueKeys;
}

/**
 * Helper to get the primary active Gemini API key.
 */
export function getGeminiApiKey(overrideKey) {
  if (overrideKey && typeof overrideKey === 'string' && overrideKey.trim()) {
    return overrideKey.trim();
  }
  const pool = getGeminiKeyPool();
  return pool[0] || '';
}

/**
 * Saves or updates a single GEMINI_API_KEY.
 */
export function saveGeminiApiKey(apiKey) {
  const trimmed = String(apiKey || '').trim();
  if (!trimmed) return '';
  const currentPool = getGeminiKeyPool();
  if (!currentPool.includes(trimmed)) {
    currentPool.unshift(trimmed);
  }
  saveGeminiKeyPool(currentPool);
  return trimmed;
}

/**
 * Validates a Gemini API key using a lightweight GET /models check.
 * CRITICAL: Uses zero audio quota and does NOT burn from the 10 daily speech generation requests.
 */
export async function probeGeminiKeyQuota(apiKey) {
  const key = String(apiKey || '').trim();
  if (!key) {
    throw new Error('Gemini API Key is empty.');
  }

  const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
  const metric = getOrCreateKeyMetric(key);
  const now = Date.now();

  // If key is in active cooldown that hasn't expired yet, report current cooldown
  if (metric.retryAvailableAt && now < metric.retryAvailableAt) {
    const remainingSeconds = Math.max(1, Math.ceil((metric.retryAvailableAt - now) / 1000));
    return {
      valid: metric.lastStatus !== 'invalid',
      status: metric.lastStatus,
      quotaType: metric.quotaType || 'minute',
      quotaLimit: metric.quotaLimit || '10',
      dailyResetInfo: metric.dailyResetInfo,
      hasQuota: false,
      remainingSeconds,
      cooldownDurationSeconds: metric.cooldownDurationSeconds || 30,
      error: metric.lastError,
      httpStatus: 429
    };
  }

  // Fast, lightweight, zero-quota verification via GET /models
  try {
    const response = await fetch(`${GEMINI_API_BASE}/models?key=${key}`);
    
    if (response.ok) {
      if (metric.lastStatus !== 'invalid') {
        metric.lastStatus = 'ready';
        metric.lastError = null;
        metric.retryAvailableAt = null;
        metric.cooldownDurationSeconds = 0;
      }
      return {
        valid: true,
        status: 'ready',
        hasQuota: true,
        remainingSeconds: 0,
        cooldownDurationSeconds: 0,
        error: null,
        httpStatus: 200
      };
    }

    const errorText = await response.text();
    let errorMsg = `Google API Error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      errorMsg = errJson.error?.message || errJson.message || errorMsg;
    } catch {}

    if (isGoogleKeyInvalid(response.status, errorMsg)) {
      metric.lastStatus = 'invalid';
      metric.lastError = errorMsg;
      metric.retryAvailableAt = null;
      metric.cooldownDurationSeconds = 0;

      return {
        valid: false,
        status: 'invalid',
        hasQuota: false,
        remainingSeconds: 0,
        cooldownDurationSeconds: 0,
        error: errorMsg,
        httpStatus: response.status
      };
    }

    return {
      valid: true,
      status: metric.lastStatus || 'ready',
      quotaType: metric.quotaType || 'minute',
      quotaLimit: metric.quotaLimit || '10',
      dailyResetInfo: metric.dailyResetInfo,
      hasQuota: (metric.lastStatus || 'ready') === 'ready',
      remainingSeconds: 0,
      cooldownDurationSeconds: 0,
      error: errorMsg,
      httpStatus: response.status
    };
  } catch (err) {
    return {
      valid: metric.lastStatus !== 'invalid',
      status: metric.lastStatus || 'ready',
      quotaType: metric.quotaType || 'minute',
      quotaLimit: metric.quotaLimit || '10',
      dailyResetInfo: metric.dailyResetInfo,
      hasQuota: (metric.lastStatus || 'ready') === 'ready',
      remainingSeconds: 0,
      cooldownDurationSeconds: 0,
      error: err.message,
      httpStatus: 500
    };
  }
}

/**
 * Validates a Gemini API key without burning any speech quota.
 */
export async function validateGeminiApiKey(apiKey) {
  const probe = await probeGeminiKeyQuota(apiKey);
  if (!probe.valid && probe.status === 'invalid') {
    throw new Error(probe.error || 'Invalid Gemini API key or access denied.');
  }
  return { valid: true, status: probe.status, hasQuota: probe.hasQuota };
}

/**
 * Adds a new Gemini key to the pool after validation.
 */
export async function addGeminiKeyToPool(newKey) {
  const trimmed = String(newKey || '').trim();
  if (!trimmed) {
    throw new Error('Gemini API key cannot be empty.');
  }

  // If input contains multiple keys (newlines/commas), route to bulk adder
  if (/[\r\n,;]/.test(trimmed)) {
    return await addMultipleGeminiKeysToPool(trimmed);
  }

  // Validate single key against Google API
  await validateGeminiApiKey(trimmed);

  const currentPool = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  if (!currentPool.includes(trimmed)) {
    currentPool.push(trimmed);
    disabledKeys.delete(trimmed);
    saveGeminiKeyPool(currentPool);
    saveDisabledGeminiKeys(disabledKeys);
  }

  return {
    success: true,
    maskedKey: `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`,
    poolSize: currentPool.length
  };
}

/**
 * Adds multiple Gemini keys to the pool in bulk (supporting newline, comma, space, or JSON array format).
 */
export async function addMultipleGeminiKeysToPool(input) {
  let keys = [];
  if (Array.isArray(input)) {
    keys = input;
  } else if (typeof input === 'string') {
    keys = input.split(/[\r\n,;'"\[\]\s]+/).filter(Boolean);
  }

  const cleanKeys = keys
    .map(k => String(k || '').trim())
    .filter(k => k.length >= 20 && !k.startsWith('{') && !k.startsWith('//'));

  if (cleanKeys.length === 0) {
    throw new Error('No valid API keys found in input. Please paste keys (e.g. AIzaSy... or AQ.Ab8...).');
  }

  const currentPool = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  let addedCount = 0;

  for (const k of cleanKeys) {
    if (!currentPool.includes(k)) {
      currentPool.push(k);
      disabledKeys.delete(k); // Ensure newly added keys are enabled
      addedCount++;
    }
  }

  if (addedCount > 0) {
    saveGeminiKeyPool(currentPool);
    saveDisabledGeminiKeys(disabledKeys);
  }

  return {
    success: true,
    addedCount,
    poolSize: currentPool.length,
    totalInput: cleanKeys.length
  };
}

/**
 * Removes a Gemini key by index or value.
 */
export function removeGeminiKeyFromPool(indexOrKey) {
  const allKeys = getAllGeminiKeys();
  let targetKey = null;
  let updated = [];

  if (typeof indexOrKey === 'number') {
    targetKey = allKeys[indexOrKey];
    updated = allKeys.filter((_, idx) => idx !== indexOrKey);
  } else {
    targetKey = allKeys.find(k => k === indexOrKey || k.endsWith(String(indexOrKey).slice(-4)));
    updated = allKeys.filter(k => k !== indexOrKey && !k.endsWith(String(indexOrKey).slice(-4)));
  }

  saveGeminiKeyPool(updated);

  if (targetKey) {
    const disabledKeys = getDisabledGeminiKeys();
    if (disabledKeys.has(targetKey)) {
      disabledKeys.delete(targetKey);
      saveDisabledGeminiKeys(disabledKeys);
    }
  }

  return {
    success: true,
    poolSize: updated.length
  };
}

/**
 * Live probes all keys in the pool against Google AI Studio API simultaneously.
 */
export async function probeAllGeminiKeys() {
  const pool = getAllGeminiKeys();
  if (pool.length === 0) return [];

  const disabledKeys = getDisabledGeminiKeys();
  const now = Date.now();
  const results = [];

  // Paced non-destructive validation using lightweight GET /models check
  // Avoids burning speech quota on 47 keys and prevents Google IP burst rate-limiting!
  for (let idx = 0; idx < pool.length; idx++) {
    const key = pool[idx];
    const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
    const metric = getOrCreateKeyMetric(key);
    const isEnabled = !disabledKeys.has(key);

    // If key is turned off by user, do not probe Google API
    if (!isEnabled) {
      results.push({
        id: `gemini_key_${idx}`,
        index: idx,
        maskedKey: masked,
        status: 'disabled',
        isEnabled: false,
        quotaType: 'minute',
        quotaLimit: '10',
        dailyResetInfo: null,
        isValid: true,
        hasQuota: false,
        error: 'Turned off by user (Excluded from generation & rotation)',
        totalRequests: metric.totalRequests,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: null,
        remainingSeconds: 0,
        cooldownDurationSeconds: 0,
        httpStatus: 200
      });
      continue;
    }

    // If key is currently in an active cooldown that has not expired yet:
    if (metric.retryAvailableAt && now < metric.retryAvailableAt) {
      const remainingSeconds = Math.max(1, Math.ceil((metric.retryAvailableAt - now) / 1000));
      results.push({
        id: `gemini_key_${idx}`,
        index: idx,
        maskedKey: masked,
        status: metric.lastStatus,
        isEnabled: true,
        quotaType: metric.quotaType || 'minute',
        quotaLimit: metric.quotaLimit || '10',
        dailyResetInfo: metric.dailyResetInfo,
        isValid: metric.lastStatus !== 'invalid',
        hasQuota: false,
        error: metric.lastError,
        totalRequests: metric.totalRequests,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: metric.retryAvailableAt,
        remainingSeconds,
        cooldownDurationSeconds: metric.cooldownDurationSeconds || 30,
        httpStatus: 429
      });
      continue;
    }

    // Fast lightweight verification via GET /models
    try {
      const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}`);
      if (res.ok) {
        metric.lastStatus = 'ready';
        metric.lastError = null;
        results.push({
          id: `gemini_key_${idx}`,
          index: idx,
          maskedKey: masked,
          status: 'ready',
          isEnabled: true,
          quotaType: metric.quotaType || 'minute',
          quotaLimit: metric.quotaLimit || '10',
          dailyResetInfo: metric.dailyResetInfo,
          isValid: true,
          hasQuota: true,
          error: null,
          totalRequests: metric.totalRequests,
          successCount: metric.successCount,
          failureCount: metric.failureCount,
          lastUsedAt: metric.lastUsedAt,
          retryAvailableAt: null,
          remainingSeconds: 0,
          cooldownDurationSeconds: 0,
          httpStatus: 200
        });
      } else {
        const errorText = await res.text();
        let errMsg = `Google API Error (${res.status})`;
        try {
          const j = JSON.parse(errorText);
          errMsg = j.error?.message || errMsg;
        } catch {}

        if (isGoogleKeyInvalid(res.status, errMsg)) {
          metric.lastStatus = 'invalid';
          metric.lastError = errMsg;
          results.push({
            id: `gemini_key_${idx}`,
            index: idx,
            maskedKey: masked,
            status: 'invalid',
            isEnabled: true,
            quotaType: 'minute',
            quotaLimit: '10',
            dailyResetInfo: null,
            isValid: false,
            hasQuota: false,
            error: errMsg,
            totalRequests: metric.totalRequests,
            successCount: metric.successCount,
            failureCount: metric.failureCount,
            lastUsedAt: metric.lastUsedAt,
            retryAvailableAt: null,
            remainingSeconds: 0,
            cooldownDurationSeconds: 0,
            httpStatus: res.status
          });
        } else {
          results.push({
            id: `gemini_key_${idx}`,
            index: idx,
            maskedKey: masked,
            status: metric.lastStatus || 'ready',
            isEnabled: true,
            quotaType: metric.quotaType || 'minute',
            quotaLimit: metric.quotaLimit || '10',
            dailyResetInfo: null,
            isValid: true,
            hasQuota: (metric.lastStatus || 'ready') === 'ready',
            error: errMsg,
            totalRequests: metric.totalRequests,
            successCount: metric.successCount,
            failureCount: metric.failureCount,
            lastUsedAt: metric.lastUsedAt,
            retryAvailableAt: metric.retryAvailableAt,
            remainingSeconds: 0,
            cooldownDurationSeconds: 0,
            httpStatus: res.status
          });
        }
      }
    } catch (e) {
      results.push({
        id: `gemini_key_${idx}`,
        index: idx,
        maskedKey: masked,
        status: metric.lastStatus || 'ready',
        isEnabled: true,
        quotaType: metric.quotaType || 'minute',
        quotaLimit: metric.quotaLimit || '10',
        dailyResetInfo: null,
        isValid: metric.lastStatus !== 'invalid',
        hasQuota: metric.lastStatus === 'ready',
        error: e.message,
        totalRequests: metric.totalRequests,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: metric.retryAvailableAt,
        remainingSeconds: 0,
        cooldownDurationSeconds: 0,
        httpStatus: 500
      });
    }

    if (idx < pool.length - 1) {
      await new Promise(r => setTimeout(r, 20));
    }
  }

  return results;
}

/**
 * Inspects all Gemini keys in the pool and returns their health status.
 * If forceLiveProbe is true, actually pings Google AI Studio in real time.
 */
export async function getGeminiKeyPoolDetails(forceLiveProbe = false) {
  const pool = getAllGeminiKeys();
  if (pool.length === 0) {
    return [];
  }

  if (forceLiveProbe) {
    return await probeAllGeminiKeys();
  }

  const disabledKeys = getDisabledGeminiKeys();
  const now = Date.now();

  const results = pool.map((key, idx) => {
    const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
    const metric = getOrCreateKeyMetric(key);
    const isEnabled = !disabledKeys.has(key);

    if (!isEnabled) {
      return {
        id: `gemini_key_${idx}`,
        index: idx,
        maskedKey: masked,
        status: 'disabled',
        isEnabled: false,
        quotaType: 'minute',
        quotaLimit: '10',
        dailyResetInfo: null,
        isValid: true,
        hasQuota: false,
        error: 'Turned off by user (Excluded from generation & rotation)',
        totalRequests: metric.totalRequests,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: null,
        remainingSeconds: 0,
        cooldownDurationSeconds: 0
      };
    }

    const isDaily = metric.lastStatus === 'daily_exhausted' || metric.quotaType === 'daily';

    if (metric.retryAvailableAt && now < metric.retryAvailableAt) {
      const remainingSeconds = Math.max(1, Math.ceil((metric.retryAvailableAt - now) / 1000));
      return {
        id: `gemini_key_${idx}`,
        index: idx,
        maskedKey: masked,
        status: isDaily ? 'daily_exhausted' : 'exhausted',
        isEnabled: true,
        quotaType: isDaily ? 'daily' : 'minute',
        quotaLimit: metric.quotaLimit || '10',
        dailyResetInfo: metric.dailyResetInfo || 'Resets at Midnight Pacific Time (PT) / 10:00 AM',
        isValid: true,
        hasQuota: false,
        error: metric.lastError || (isDaily ? 'Free Tier Daily Limit Reached (10/10 Used Today)' : `Quota cooldown active (available in ${remainingSeconds}s)`),
        totalRequests: metric.totalRequests,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: metric.retryAvailableAt,
        remainingSeconds: remainingSeconds,
        cooldownDurationSeconds: metric.cooldownDurationSeconds || 60
      };
    }

    if (metric.retryAvailableAt && now >= metric.retryAvailableAt) {
      metric.retryAvailableAt = null;
      metric.cooldownDurationSeconds = null;
      metric.cooldownStartedAt = null;
      metric.lastStatus = 'ready';
      metric.lastError = null;
      metric.quotaType = 'minute';
    }

    const isReady = (metric.lastStatus === 'ready' || !metric.lastStatus);
    return {
      id: `gemini_key_${idx}`,
      index: idx,
      maskedKey: masked,
      status: isReady ? 'ready' : metric.lastStatus,
      isEnabled: true,
      quotaType: metric.quotaType || 'minute',
      quotaLimit: metric.quotaLimit || '10',
      dailyResetInfo: metric.dailyResetInfo || null,
      isValid: metric.lastStatus !== 'invalid',
      hasQuota: isReady,
      error: isReady ? null : metric.lastError,
      totalRequests: metric.totalRequests,
      successCount: metric.successCount,
      failureCount: metric.failureCount,
      lastUsedAt: metric.lastUsedAt,
      retryAvailableAt: null,
      remainingSeconds: 0,
      cooldownDurationSeconds: 0
    };
  });

  return results;
}

/**
 * Force re-tests all Gemini API keys in the pool using live Google API calls.
 */
export async function reloadAndValidateGeminiKeys() {
  return await probeAllGeminiKeys();
}

// In-memory cache for available Gemini models to prevent redundant API queries
let cachedGeminiModels = null;
let cachedGeminiModelsExpiresAt = 0;

/**
 * Dynamically queries Google AI Studio API for available models using the first valid key in the pool.
 * Caches results in memory for 30 minutes.
 */
export async function getAvailableGeminiModels(overrideKey) {
  const now = Date.now();
  if (!overrideKey && cachedGeminiModels && now < cachedGeminiModelsExpiresAt) {
    return cachedGeminiModels;
  }

  const pool = overrideKey ? [overrideKey] : getGeminiKeyPool();
  if (pool.length === 0) {
    return KNOWN_AUDIO_MODELS;
  }

  for (const activeKey of pool) {
    const metric = getOrCreateKeyMetric(activeKey);
    // Skip keys known to be invalid or currently in rate-limit cooldown
    if (metric.lastStatus === 'invalid') continue;
    if (metric.retryAvailableAt && now < metric.retryAvailableAt) continue;

    try {
      const url = `${GEMINI_API_BASE}/models?key=${activeKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.models || !Array.isArray(data.models)) continue;

      const discovered = data.models
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => {
          const id = m.name.replace(/^models\//, '');
          return {
            id,
            name: m.displayName || id,
            description: m.description
          };
        });

      // Prioritize 3.8 Flash TTS, 3.8 Flash-Lite TTS, 3.1 Flash TTS, 2.5 Flash TTS, and Audio models
      const sorted = discovered.sort((a, b) => {
        const getScore = (m) => {
          let s = 0;
          if (m.id === 'gemini-3.8-flash-tts') s += 40;
          if (m.id.includes('3.8') && m.id.includes('tts')) s += 35;
          if (m.id === 'gemini-3.1-flash-tts-preview') s += 30;
          if (m.id.includes('3.1') && m.id.includes('tts')) s += 25;
          if (m.id === 'gemini-2.5-flash-preview-tts') s += 20;
          if (m.id.includes('tts')) s += 15;
          if (m.id.includes('audio')) s += 12;
          if (m.id.includes('2.5-flash')) s += 8;
          if (m.id.includes('2.0-flash')) s += 6;
          if (m.id.includes('flash')) s += 4;
          if (m.id.includes('exp')) s += 2;
          return s;
        };
        return getScore(b) - getScore(a);
      });

      if (sorted.length > 0) {
        if (!overrideKey) {
          cachedGeminiModels = sorted;
          cachedGeminiModelsExpiresAt = now + (30 * 60 * 1000); // 30 minutes cache
        }
        return sorted;
      }
    } catch (err) {
      console.warn('Could not fetch dynamic models list for key:', err.message);
    }
  }

  return KNOWN_AUDIO_MODELS;
}

let cachedGeminiVoices = null;
let cachedGeminiVoicesExpiresAt = 0;

/**
 * Retrieves the full list of available Gemini TTS voices.
 * Uses in-memory cache and live API discovery with robust fallback to GEMINI_VOICES.
 * @param {string|null} overrideKey
 * @returns {Promise<Array<{id: string, name: string, gender: string, description: string}>>}
 */
export async function getAvailableGeminiVoices(overrideKey = null) {
  const now = Date.now();
  if (!overrideKey && cachedGeminiVoices && now < cachedGeminiVoicesExpiresAt) {
    return cachedGeminiVoices;
  }

  const pool = overrideKey ? [overrideKey] : getGeminiKeyPool();
  if (pool.length === 0) {
    return GEMINI_VOICES;
  }

  for (const activeKey of pool) {
    const metric = getOrCreateKeyMetric(activeKey);
    if (metric.lastStatus === 'invalid') continue;
    if (metric.retryAvailableAt && now < metric.retryAvailableAt) continue;

    try {
      let pageToken = '';
      const dynamicVoices = new Map();
      
      // Seed with static GEMINI_VOICES first so curated descriptions and order are preserved
      for (const v of GEMINI_VOICES) {
        dynamicVoices.set(v.id.toLowerCase(), { ...v });
      }

      // Fetch from Google Gemini Voices API
      let pageCount = 0;
      do {
        const url = `${GEMINI_API_BASE}/voices?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}&key=${activeKey}`;
        const res = await fetch(url);
        if (!res.ok) break;

        const data = await res.json();
        if (data.voices && Array.isArray(data.voices)) {
          for (const v of data.voices) {
            const rawName = v.display_name || v.id;
            if (!rawName) continue;
            const keyName = rawName.toLowerCase();
            let gender = v.gender ? (v.gender.charAt(0).toUpperCase() + v.gender.slice(1).toLowerCase()) : 'Male';
            if (gender === 'Neutral') gender = 'Male';
            
            if (dynamicVoices.has(keyName)) {
              const existing = dynamicVoices.get(keyName);
              if (v.description && existing.description.length < v.description.length) {
                existing.description = v.description;
              }
            } else {
              dynamicVoices.set(keyName, {
                id: rawName,
                name: rawName,
                gender,
                description: v.description || `${rawName} voice`
              });
            }
          }
        }
        pageToken = data.next_page_token || '';
        pageCount++;
      } while (pageToken && pageCount < 3);

      const voiceList = Array.from(dynamicVoices.values());
      if (voiceList.length > 0) {
        if (!overrideKey) {
          cachedGeminiVoices = voiceList;
          cachedGeminiVoicesExpiresAt = now + (60 * 60 * 1000); // 1 hour cache
        }
        return voiceList;
      }
    } catch (err) {
      console.warn('Could not fetch dynamic voices list for key:', err.message);
    }
  }

  return GEMINI_VOICES;
}

/**
 * Generates speech with automatic multi-key failover and inline emotion parsing.
 * If one key hits a rate limit, quota exhaustion, or error, it automatically moves to the next key.
 */
export async function generateGeminiSpeech({
  text,
  speechParts = null,
  speechStyle = '',
  voiceName = 'Puck',
  dialect = 'sorani',
  promptInstruction = '',
  apiKey = '',
  model = 'gemini-3.8-flash-tts',
  _autoWaitAttempt = 0
}) {
  const pool = apiKey ? [apiKey] : getGeminiKeyPool();
  if (pool.length === 0) {
    const allConfigured = getAllGeminiKeys();
    if (allConfigured.length > 0) {
      throw new Error('All configured Gemini API keys are currently turned off. Please turn on at least one key in Gemini Voice Studio.');
    }
    throw new Error('No Google Gemini API Key configured. Please add at least one Gemini API Key in Gemini Studio or Settings.');
  }

  // Sanitize text: remove control characters and strip null bytes
  const sanitizedText = (text || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF]/g, '')
    .trim();

  if (!sanitizedText) {
    throw new Error('Kurdish text is required for speech generation.');
  }

  // Sanitize voiceName to ensure it strictly matches one of Google Gemini's prebuilt voices
  let cleanVoice = typeof voiceName === 'string' ? voiceName.trim() : 'Puck';
  if (cleanVoice.startsWith('gemini_')) cleanVoice = cleanVoice.replace(/^gemini_/, '');
  if (cleanVoice.startsWith('Gemini (')) cleanVoice = cleanVoice.replace(/^Gemini\s*\(([^)]+)\)$/, '$1');
  const matchedVoice = GEMINI_VOICES.find(v => v.id.toLowerCase() === cleanVoice.toLowerCase());
  cleanVoice = matchedVoice ? matchedVoice.id : cleanVoice;

  // Extract any inline tags in text (e.g. [laugh], [whisper], [sigh], [gasp], [crying], [shouting], [happy], [angry])
  const inlineTags = (sanitizedText.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
  const uniqueTags = [...new Set(inlineTags)];

  // Analyze multilingual makeup (English + Kurdish + Arabic)
  const langAnalysis = analyzeMultilingualContent(sanitizedText);
  const normalizedText = normalizeMultilingualBidiText(sanitizedText);

  // Construct prompt directing Gemini to speak Kurdish / multilingual text and express inline emotions
  let baseInstruction = promptInstruction?.trim();
  if (!baseInstruction) {
    if (langAnalysis.isMultilingual) {
      const dialectName = dialect === 'badini' ? 'Kurdish Badini (Kurmanji)' : 'Central Kurdish (Sorani)';
      const regionalIntonation = dialect === 'badini' ? 'natural Duhok/Badinan intonation for Kurdish Badini' : 'natural Erbil/Sulaymaniyah intonation for Kurdish Sorani';
      baseInstruction = `You are a professional multilingual voice actor and speech synthesizer specializing in fluent code-switching across English, ${dialectName}, and Arabic. Read and speak aloud the provided text completely, naturally, and accurately with authentic native pronunciation and ${regionalIntonation}, natural English pronunciation, and clear Arabic pronunciation.`;
    } else if (dialect === 'badini') {
      baseInstruction = 'You are a native Kurdish Badini (Kurmanji) speaker and voice narrator from the Duhok/Badinan region performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Kurdish Badini pronunciation, correct Northern Kurmanji vocabulary and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە), and natural Duhok intonation. Under NO circumstances should you speak Badini with Central Sorani phonetics or Erbil/Sulaymaniyah intonation.';
    } else {
      baseInstruction = 'You are a native Kurdish Sorani speaker performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Central Kurdish (Sorani) pronunciation, correct Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation.';
    }
  }

  let codeSwitchingDirective = '';
  let emotionDirective = '';

  // Only append code-switching and emotion directives if no custom promptInstruction was supplied
  // to avoid redundant prompt bloat exceeding Gemini audio generation token limits
  if (!promptInstruction) {
    if (langAnalysis.hasLatin || langAnalysis.isMultilingual) {
      codeSwitchingDirective = `\n- English & Arabic: Natural native pronunciation with seamless code-switching transitions; never omit opening words.`;
    }
    if (uniqueTags.length > 0) {
      emotionDirective = `\n- Emotions: Act out bracketed feelings (${uniqueTags.map(t => `[${t}]`).join(', ')}) naturally without speaking bracket words.`;
    }
  }

  const rawModel = model || 'gemini-3.8-flash-tts';
  const primaryModel = rawModel === 'gemini-3.8-flash-tts-preview' ? 'gemini-3.8-flash-tts' : rawModel;
  // Strictly enforce single model requested by user - NEVER use fallback to 2.5
  const candidateModels = [primaryModel];

  const is38Model = primaryModel.startsWith('gemini-3.8');
  let contentParts = [];

  if (is38Model) {
    if (Array.isArray(speechParts) && speechParts.length > 0) {
      // Native Gemini 3.8 multi-part structured payload: each part has text and speech_metadata.style
      contentParts = speechParts.map(p => {
        const item = { text: String(p.text || '').trim() };
        const style = p.style || p.speech_metadata?.style || speechStyle || promptInstruction;
        if (style) {
          item.speech_metadata = { style: String(style).trim() };
        }
        return item;
      });
    } else {
      // Native Gemini 3.8 single-part payload with speech_metadata.style
      const effectiveStyle = speechStyle || promptInstruction;
      const part = { text: normalizedText };
      if (effectiveStyle) {
        part.speech_metadata = { style: String(effectiveStyle).trim() };
      }
      contentParts = [part];
    }
  } else {
    // Legacy Gemini 3.1 fallback
    const prompt = promptInstruction
      ? `${baseInstruction}\n\n${normalizedText}`
      : `${baseInstruction}${codeSwitchingDirective}${emotionDirective}\n\n${normalizedText}`;
    contentParts = [{ text: prompt }];
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: contentParts
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: cleanVoice
          }
        }
      }
    }
  };

  let hasVoiceFallback = false;
  let keyErrors = [];
  let audioBuffer = null;
  let successfulModel = candidateModels[0];
  let successfulKeyMasked = '';

  const now = Date.now();

  // 1. Proactively clear expired rate-limit cooldowns so keys immediately return to 'ready'
  for (const k of pool) {
    const m = getOrCreateKeyMetric(k);
    if (m.retryAvailableAt && now >= m.retryAvailableAt) {
      m.retryAvailableAt = null;
      m.cooldownDurationSeconds = 0;
      if (m.lastStatus !== 'invalid') {
        m.lastStatus = 'ready';
        m.lastError = null;
      }
    }
  }

  // 2. Prioritize keys using self-balancing Least Recently Used (LRU) among ready keys:
  // Keys not used recently (or never used) come FIRST.
  // This automatically spreads requests across all keys in the pool evenly!
  let sortedPool = [];

  if (apiKey) {
    sortedPool = [apiKey];
  } else {
    // Filter out permanently invalid/denied keys
    const validKeys = pool.filter(k => {
      const m = getOrCreateKeyMetric(k);
      return m.lastStatus !== 'invalid';
    });

    // Keys currently ready to use (not in cooldown)
    // Sort by lastUsedAt ASC (least recently used first -> perfect rotation across entire pool)
    const readyKeys = validKeys.filter(k => {
      const m = getOrCreateKeyMetric(k);
      return !m.retryAvailableAt || now >= m.retryAvailableAt;
    }).sort((a, b) => {
      const mA = getOrCreateKeyMetric(a);
      const mB = getOrCreateKeyMetric(b);
      const tA = mA.lastUsedAt ? new Date(mA.lastUsedAt).getTime() : 0;
      const tB = mB.lastUsedAt ? new Date(mB.lastUsedAt).getTime() : 0;
      return tA - tB;
    });

    // Keys in cooldown, sorted by earliest recovery time
    const cooldownKeys = validKeys.filter(k => {
      const m = getOrCreateKeyMetric(k);
      return m.retryAvailableAt && now < m.retryAvailableAt;
    }).sort((a, b) => {
      const mA = getOrCreateKeyMetric(a);
      const mB = getOrCreateKeyMetric(b);
      return (mA.retryAvailableAt || 0) - (mB.retryAvailableAt || 0);
    });

    if (readyKeys.length > 0) {
      sortedPool = [...readyKeys, ...cooldownKeys];
    } else if (cooldownKeys.length > 0) {
      // If ALL keys in pool are in rate-limit cooldown:
      // Check if the soonest key recovers within 75 seconds (only on first attempt):
      const soonestKey = cooldownKeys[0];
      const soonestMetric = getOrCreateKeyMetric(soonestKey);
      const waitMs = Math.max(0, (soonestMetric.retryAvailableAt || 0) - Date.now());

      if (_autoWaitAttempt === 0 && waitMs <= 75000 && soonestMetric.quotaType !== 'daily') {
        console.log(`[Gemini Auto-Wait] All ${validKeys.length} keys in rate-limit cooldown. Soonest key (${soonestMetric.maskedKey}) recovers in ${(waitMs / 1000).toFixed(1)}s. Auto-waiting...`);
        await new Promise(r => setTimeout(r, waitMs + 600));
        soonestMetric.retryAvailableAt = null;
        soonestMetric.lastStatus = 'ready';
        sortedPool = [soonestKey, ...cooldownKeys.slice(1)];
      } else {
        sortedPool = cooldownKeys;
      }
    } else {
      sortedPool = pool;
    }
  }

  let voiceFallbackAttempted = false;

  for (let keyIdx = 0; keyIdx < sortedPool.length; keyIdx++) {
    const activeKey = sortedPool[keyIdx];
    const maskedKey = `${activeKey.slice(0, 4)}...${activeKey.slice(-4)}`;
    const metric = getOrCreateKeyMetric(activeKey);
    const loopNow = Date.now();

    // Fast-skip invalid keys or keys in active cooldown (unless single override key)
    if (!apiKey) {
      if (metric.lastStatus === 'invalid') {
        continue;
      }
      // If key is currently in an active quota/rate-limit cooldown, skip it immediately in 0ms!
      if (metric.retryAvailableAt && loopNow < metric.retryAvailableAt) {
        const remainingSec = Math.ceil((metric.retryAvailableAt - loopNow) / 1000);
        keyErrors.push(`Key ${maskedKey}: in quota cooldown (${remainingSec}s remaining)`);
        continue;
      }
      // If candidate model is exhausted on this key for today, skip it immediately in 0ms!
      if (metric.exhaustedModels?.has(candidateModels[0])) {
        keyErrors.push(`Key ${maskedKey}: daily quota exhausted for ${candidateModels[0]}`);
        continue;
      }
    }

    // Inter-key failover pacing (150ms)
    if (keyIdx > 0) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    metric.totalRequests++;
    metric.lastUsedAt = new Date().toISOString();

    // Try candidate models with current key
    for (const candidateModel of candidateModels) {
      if (metric.exhaustedModels?.has(candidateModel)) {
        continue;
      }

      const url = `${GEMINI_API_BASE}/models/${candidateModel}:generateContent?key=${activeKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(45000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMsg = `Gemini API Error (${response.status})`;
          let errJson = null;
          try {
            errJson = JSON.parse(errorText);
            errorMsg = errJson.error?.message || errJson.message || errorMsg;
          } catch {
            errorMsg = errorText || errorMsg;
          }

          // Extract detailed field violations or RPC reasons if provided
          let detailedReason = '';
          if (errJson?.error?.details && Array.isArray(errJson.error.details)) {
            for (const d of errJson.error.details) {
              if (d.fieldViolations && Array.isArray(d.fieldViolations)) {
                const violations = d.fieldViolations
                  .map(fv => `${fv.field ? fv.field + ': ' : ''}${fv.description || ''}`)
                  .filter(Boolean)
                  .join('; ');
                if (violations) detailedReason = violations;
              }
            }
          }
          if (detailedReason) {
            errorMsg = `${errorMsg} (${detailedReason})`;
          }

          // 1. Permanent invalid/denied key check (401, 403 denied access, disabled project)
          if (isGoogleKeyInvalid(response.status, errorMsg)) {
            metric.failureCount++;
            metric.lastStatus = 'invalid';
            metric.lastError = errorMsg;
            metric.retryAvailableAt = null;
            metric.cooldownDurationSeconds = 0;
            keyErrors.push(`Key ${maskedKey}: ${errorMsg}`);
            console.warn(`[Gemini Key Invalid] Key #${keyIdx + 1}/${sortedPool.length} (${maskedKey}) permanently invalid/denied: "${errorMsg}". Skipping...`);
            break; // Break model loop, proceed to next key
          }

          // 2. Quota / Rate-limit check -> FAILOVER TO NEXT KEY WITH ACCURATE COOLDOWN
          const isQuotaOrLimit = response.status === 429 || 
                                 errorMsg.toLowerCase().includes('quota') || 
                                 errorMsg.toLowerCase().includes('resource_exhausted') || 
                                 errorMsg.toLowerCase().includes('rate limit');

          if (isQuotaOrLimit) {
            const delayMs = parseGoogleRetryDelayMs(errJson, errorText);
            const quotaAnalysis = parseQuotaExhaustionInfo(errJson, errorText, delayMs);
            const remainingSec = Math.ceil(quotaAnalysis.delayMs / 1000);

            if (quotaAnalysis.isDaily) {
              metric.exhaustedModels = metric.exhaustedModels || new Set();
              metric.exhaustedModels.add(candidateModel);
            }

            metric.failureCount++;
            metric.lastStatus = quotaAnalysis.isDaily ? 'daily_exhausted' : 'exhausted';
            metric.quotaType = quotaAnalysis.quotaType;
            metric.quotaLimit = quotaAnalysis.isDaily ? '10/day' : '10/min';
            metric.dailyResetInfo = 'Resets at Midnight Pacific Time (PT) / 10:00 AM';
            metric.lastError = quotaAnalysis.statusText;
            metric.retryAvailableAt = Date.now() + quotaAnalysis.delayMs;
            metric.cooldownDurationSeconds = remainingSec;
            metric.cooldownStartedAt = Date.now();

            keyErrors.push(`Key ${maskedKey}: ${quotaAnalysis.statusText}`);

            // Proceed to next key in pool!
            break;
          }

          // 3. If 404 or model not found / deprecated, try next candidate model
          if (response.status === 404 || errorMsg.includes('not found') || errorMsg.includes('no longer available') || errorMsg.includes('not supported')) {
            continue;
          }

          // 4. Request payload / argument error (HTTP 400 INVALID_ARGUMENT / Bad Request)
          // If voice or multilingual phoneme alignment caused an argument rejection, attempt automatic fallback once to core verified voice
          if (response.status === 400 || errorMsg.toLowerCase().includes('invalid argument')) {
            console.error(`[Gemini 400 Bad Request] Text: "${text.slice(0, 50)}..." Voice: "${cleanVoice}". Error: ${errorMsg}`);

            if (!voiceFallbackAttempted) {
              voiceFallbackAttempted = true;
              const voiceMeta = GEMINI_VOICES.find(v => v.id.toLowerCase() === cleanVoice.toLowerCase());
              const isFemale = voiceMeta?.gender === 'Female';
              const fallbackVoice = isFemale 
                ? (cleanVoice === 'Aoede' ? 'Despina' : 'Aoede')
                : (cleanVoice === 'Puck' ? 'Fenrir' : 'Puck');

              console.warn(`[Gemini Voice Fallback] 400 rejection on voice "${cleanVoice}". Automatically attempting in-flight fallback to core voice "${fallbackVoice}"...`);
              cleanVoice = fallbackVoice;
              requestBody.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName = fallbackVoice;
              continue;
            }

            throw new Error(`Google API Invalid Argument: ${errorMsg}`);
          }

          metric.failureCount++;
          metric.lastError = errorMsg;
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        if (!candidate || !candidate.content?.parts) {
          continue;
        }

        // Find audio inline data part
        let audioPart = null;
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            audioPart = part.inlineData;
            break;
          }
        }

        if (!audioPart || !audioPart.data) {
          const textPart = candidate.content.parts.find(p => p.text)?.text;
          if (textPart) {
            console.warn(`[Gemini] Model ${candidateModel} returned text instead of audio, trying next model...`);
            continue;
          }
          continue;
        }

        const rawAudioBuffer = Buffer.from(audioPart.data, 'base64');
        audioBuffer = ensureWavBuffer(rawAudioBuffer, 24000);
        successfulModel = candidateModel;
        successfulKeyMasked = maskedKey;
        metric.successCount++;
        metric.lastStatus = 'ready';
        metric.lastError = null;
        metric.retryAvailableAt = null;

        break; // Successfully generated audio!
      } catch (err) {
        // If it's a 400 Bad Request / Invalid Argument, do NOT cascade through keys!
        // Immediately rethrow so the caller fails this specific sample and moves to the next.
        if (err.message.includes('Google API Invalid Argument') || err.message.toLowerCase().includes('invalid argument')) {
          throw err;
        }

        const isQuotaOrLimit = err.message.toLowerCase().includes('quota') || 
                               err.message.toLowerCase().includes('resource_exhausted') || 
                               err.message.toLowerCase().includes('rate limit');

        if (isQuotaOrLimit) {
          const delayMs = parseGoogleRetryDelayMs(null, err.message);
          const quotaAnalysis = parseQuotaExhaustionInfo(null, err.message, delayMs);
          const remainingSec = Math.ceil(quotaAnalysis.delayMs / 1000);

          if (quotaAnalysis.isDaily) {
            metric.exhaustedModels = metric.exhaustedModels || new Set();
            metric.exhaustedModels.add(candidateModel);
          }

          metric.failureCount++;
          metric.lastStatus = quotaAnalysis.isDaily ? 'daily_exhausted' : 'exhausted';
          metric.quotaType = quotaAnalysis.quotaType;
          metric.lastError = quotaAnalysis.statusText;
          metric.retryAvailableAt = Date.now() + quotaAnalysis.delayMs;
          metric.cooldownDurationSeconds = remainingSec;
          metric.cooldownStartedAt = Date.now();

          console.warn(`[Gemini Key Failover] Key #${keyIdx + 1}/${sortedPool.length} (${maskedKey}) quota exception (cooldown ${remainingSec}s): "${err.message}". Moving to next key...`);
          keyErrors.push(`Key ${maskedKey}: ${quotaAnalysis.statusText}`);

          break; // Break model loop, jump to next key in pool
        }

        if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('abort')) {
          metric.failureCount++;
          metric.lastStatus = 'exhausted';
          metric.lastError = 'Request timed out after 45s';
          metric.retryAvailableAt = Date.now() + 60000;
          metric.cooldownDurationSeconds = 60;
          console.warn(`[Gemini Request Timeout] Key #${keyIdx + 1}/${sortedPool.length} (${maskedKey}) connection timed out after 45s. Cooling down 60s and rotating to next key...`);
          keyErrors.push(`Key ${maskedKey}: Request timed out (45s)`);
          break; // Break model loop, jump to next key in pool
        }

        metric.failureCount++;
        metric.lastError = err.message;
        if (!err.message.includes('not found') && !err.message.includes('no longer available') && !err.message.includes('not supported')) {
          keyErrors.push(`Key ${maskedKey} on ${candidateModel}: ${err.message}`);
        }
      }
    }

    if (audioBuffer) {
      break; // Successfully synthesized audio from pool key!
    }
  }

  if (!audioBuffer) {
    // If all keys in pool hit quota limits, but the soonest key recovers within 65 seconds:
    // Auto-wait directly ONCE and retry to fulfill the synthesis without throwing an error!
    if (!apiKey && _autoWaitAttempt === 0) {
      const cooldownMetrics = pool.map(k => getOrCreateKeyMetric(k)).filter(m => m.retryAvailableAt && m.retryAvailableAt > Date.now() && m.quotaType !== 'daily');
      cooldownMetrics.sort((a, b) => (a.retryAvailableAt || 0) - (b.retryAvailableAt || 0));
      if (cooldownMetrics.length > 0) {
        const waitMs = (cooldownMetrics[0].retryAvailableAt || 0) - Date.now();
        if (waitMs <= 65000 && waitMs > 0) {
          console.log(`[Gemini Auto-Wait] All keys in pool are in short rate-limit cooldown. Soonest key (${cooldownMetrics[0].maskedKey}) recovers in ${(waitMs / 1000).toFixed(1)}s. Waiting to auto-recover...`);
          await new Promise(r => setTimeout(r, waitMs + 800));
          // Clear cooldown on that recovered key and retry call once across the full pool!
          cooldownMetrics[0].retryAvailableAt = null;
          cooldownMetrics[0].lastStatus = 'ready';
          return await generateGeminiSpeech({
            text,
            voiceName,
            dialect,
            promptInstruction,
            model,
            _autoWaitAttempt: 1
          });
        }
      }
    }

    const failedCount = keyErrors.length > 0 ? keyErrors.length : pool.length;
    throw new Error(`All ${pool.length} Gemini API Key(s) in the pool failed or are in cooldown (${failedCount} key${failedCount === 1 ? '' : 's'} checked). Please wait a moment for short rate limits to expire.`);
  }

  // Estimate duration from 24000Hz 16-bit mono PCM
  const pcmLength = Math.max(0, audioBuffer.length - 44);
  const durationSeconds = Math.round(((pcmLength / (24000 * 2)) + Number.EPSILON) * 100) / 100;

  // Clean Kurdish transcript (without tags)
  const cleanText = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();

  return {
    audioBuffer,
    cleanText: cleanText || text.trim(),
    detectedTags: uniqueTags,
    mimeType: 'audio/wav',
    durationSeconds,
    sampleRate: 24000,
    voiceName: voiceName || 'Puck',
    modelId: successfulModel,
    usedKeyMasked: successfulKeyMasked,
    isMultilingual: langAnalysis.isMultilingual,
    characters: Array.from(cleanText || text.trim())
  };
}
