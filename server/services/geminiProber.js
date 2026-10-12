import { GEMINI_API_BASE, GEMINI_VOICES, KNOWN_AUDIO_MODELS } from './geminiConstants.js';
import {
  getAllGeminiKeys,
  getDisabledGeminiKeys,
  getGeminiKeyPool,
  getOrCreateKeyMetric,
  isGoogleKeyInvalid
} from './geminiKeyPool.js';

export async function probeGeminiKeyQuota(apiKey) {
  const key = String(apiKey || '').trim();
  if (!key) throw new Error('Gemini API Key is empty.');
  const metric = getOrCreateKeyMetric(key);
  const now = Date.now();

  if (metric.retryAvailableAt && now < metric.retryAvailableAt) {
    const rem = Math.max(1, Math.ceil((metric.retryAvailableAt - now) / 1000));
    return { valid: metric.lastStatus !== 'invalid', status: metric.lastStatus, quotaType: metric.quotaType || 'minute', quotaLimit: metric.quotaLimit || '10', dailyResetInfo: metric.dailyResetInfo, hasQuota: false, remainingSeconds: rem, cooldownDurationSeconds: metric.cooldownDurationSeconds || 30, error: metric.lastError, httpStatus: 429 };
  }

  try {
    const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}`);
    if (res.ok) {
      if (metric.lastStatus !== 'invalid') {
        metric.lastStatus = 'ready'; metric.lastError = null; metric.retryAvailableAt = null; metric.cooldownDurationSeconds = 0;
      }
      return { valid: true, status: 'ready', hasQuota: true, remainingSeconds: 0, cooldownDurationSeconds: 0, error: null, httpStatus: 200 };
    }

    const text = await res.text();
    let errorMsg = `Google API Error (${res.status})`;
    try { errorMsg = JSON.parse(text).error?.message || errorMsg; } catch {}

    if (isGoogleKeyInvalid(res.status, errorMsg)) {
      metric.lastStatus = 'invalid'; metric.lastError = errorMsg; metric.retryAvailableAt = null; metric.cooldownDurationSeconds = 0;
      return { valid: false, status: 'invalid', hasQuota: false, remainingSeconds: 0, cooldownDurationSeconds: 0, error: errorMsg, httpStatus: res.status };
    }

    return { valid: true, status: metric.lastStatus || 'ready', quotaType: metric.quotaType || 'minute', quotaLimit: metric.quotaLimit || '10', dailyResetInfo: metric.dailyResetInfo, hasQuota: (metric.lastStatus || 'ready') === 'ready', remainingSeconds: 0, cooldownDurationSeconds: 0, error: errorMsg, httpStatus: res.status };
  } catch (err) {
    return { valid: metric.lastStatus !== 'invalid', status: metric.lastStatus || 'ready', quotaType: metric.quotaType || 'minute', quotaLimit: metric.quotaLimit || '10', dailyResetInfo: metric.dailyResetInfo, hasQuota: (metric.lastStatus || 'ready') === 'ready', remainingSeconds: 0, cooldownDurationSeconds: 0, error: err.message, httpStatus: 500 };
  }
}

export async function validateGeminiApiKey(apiKey) {
  const probe = await probeGeminiKeyQuota(apiKey);
  if (!probe.valid && probe.status === 'invalid') throw new Error(probe.error || 'Invalid Gemini API key or access denied.');
  return { valid: true, status: probe.status, hasQuota: probe.hasQuota };
}

export async function probeAllGeminiKeys() {
  const pool = getAllGeminiKeys();
  if (pool.length === 0) return [];
  const disabledKeys = getDisabledGeminiKeys();
  const results = [];

  for (let idx = 0; idx < pool.length; idx++) {
    const key = pool[idx];
    const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
    const metric = getOrCreateKeyMetric(key);
    const isEnabled = !disabledKeys.has(key);

    if (!isEnabled) {
      results.push({
        id: `gemini_key_${idx}`, index: idx, maskedKey: masked, status: 'disabled', isEnabled: false,
        quotaType: 'minute', quotaLimit: '10', dailyResetInfo: null, isValid: true, hasQuota: false,
        error: 'Turned off by user (Excluded from generation & rotation)', totalRequests: metric.totalRequests,
        successCount: metric.successCount, failureCount: metric.failureCount, lastUsedAt: metric.lastUsedAt,
        retryAvailableAt: null, remainingSeconds: 0, cooldownDurationSeconds: 0, httpStatus: 200
      });
      continue;
    }

    const probe = await probeGeminiKeyQuota(key);
    results.push({
      id: `gemini_key_${idx}`, index: idx, maskedKey: masked, status: probe.status, isEnabled: true,
      quotaType: probe.quotaType || 'minute', quotaLimit: probe.quotaLimit || '10', dailyResetInfo: probe.dailyResetInfo,
      isValid: probe.valid, hasQuota: probe.hasQuota, error: probe.error, totalRequests: metric.totalRequests,
      successCount: metric.successCount, failureCount: metric.failureCount, lastUsedAt: metric.lastUsedAt,
      retryAvailableAt: metric.retryAvailableAt, remainingSeconds: probe.remainingSeconds,
      cooldownDurationSeconds: probe.cooldownDurationSeconds || 0, httpStatus: probe.httpStatus || 200
    });

    if (idx < pool.length - 1) await new Promise(r => setTimeout(r, 20));
  }
  return results;
}

function formatMetricDetail(idx, masked, metric, isEnabled, isDaily, remainingSec) {
  if (!isEnabled) {
    return {
      id: `gemini_key_${idx}`, index: idx, maskedKey: masked, status: 'disabled', isEnabled: false,
      quotaType: 'minute', quotaLimit: '10', dailyResetInfo: null, isValid: true, hasQuota: false,
      error: 'Turned off by user (Excluded from generation & rotation)', totalRequests: metric.totalRequests,
      successCount: metric.successCount, failureCount: metric.failureCount, lastUsedAt: metric.lastUsedAt,
      retryAvailableAt: null, remainingSeconds: 0, cooldownDurationSeconds: 0
    };
  }
  const inCooldown = remainingSec > 0;
  const isReady = !inCooldown && (metric.lastStatus === 'ready' || !metric.lastStatus);
  return {
    id: `gemini_key_${idx}`, index: idx, maskedKey: masked,
    status: inCooldown ? (isDaily ? 'daily_exhausted' : 'exhausted') : (isReady ? 'ready' : metric.lastStatus),
    isEnabled: true, quotaType: isDaily ? 'daily' : (metric.quotaType || 'minute'), quotaLimit: metric.quotaLimit || '10',
    dailyResetInfo: metric.dailyResetInfo || (isDaily ? 'Resets at Midnight Pacific Time (PT) / 10:00 AM' : null),
    isValid: metric.lastStatus !== 'invalid', hasQuota: isReady,
    error: isReady ? null : (metric.lastError || (isDaily ? 'Free Tier Daily Limit Reached' : `Cooldown active (${remainingSec}s)`)),
    totalRequests: metric.totalRequests, successCount: metric.successCount, failureCount: metric.failureCount,
    lastUsedAt: metric.lastUsedAt, retryAvailableAt: inCooldown ? metric.retryAvailableAt : null,
    remainingSeconds: inCooldown ? remainingSec : 0, cooldownDurationSeconds: inCooldown ? (metric.cooldownDurationSeconds || 60) : 0
  };
}

export async function getGeminiKeyPoolDetails(forceLiveProbe = false) {
  const pool = getAllGeminiKeys();
  if (pool.length === 0) return [];
  if (forceLiveProbe) return await probeAllGeminiKeys();

  const disabledKeys = getDisabledGeminiKeys();
  const now = Date.now();

  return pool.map((key, idx) => {
    const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
    const metric = getOrCreateKeyMetric(key);
    const isEnabled = !disabledKeys.has(key);
    const isDaily = metric.lastStatus === 'daily_exhausted' || metric.quotaType === 'daily';
    const remainingSec = (metric.retryAvailableAt && now < metric.retryAvailableAt)
      ? Math.max(1, Math.ceil((metric.retryAvailableAt - now) / 1000))
      : 0;

    if (metric.retryAvailableAt && now >= metric.retryAvailableAt) {
      metric.retryAvailableAt = null; metric.cooldownDurationSeconds = null;
      metric.cooldownStartedAt = null; metric.lastStatus = 'ready'; metric.lastError = null; metric.quotaType = 'minute';
    }

    return formatMetricDetail(idx, masked, metric, isEnabled, isDaily, remainingSec);
  });
}

export async function reloadAndValidateGeminiKeys() {
  return await probeAllGeminiKeys();
}

let cachedGeminiModels = null;
let cachedGeminiModelsExpiresAt = 0;

export async function getAvailableGeminiModels(overrideKey) {
  const now = Date.now();
  if (!overrideKey && cachedGeminiModels && now < cachedGeminiModelsExpiresAt) return cachedGeminiModels;
  const pool = overrideKey ? [overrideKey] : getGeminiKeyPool();
  if (pool.length === 0) return KNOWN_AUDIO_MODELS;

  for (const activeKey of pool) {
    const metric = getOrCreateKeyMetric(activeKey);
    if (metric.lastStatus === 'invalid' || (metric.retryAvailableAt && now < metric.retryAvailableAt)) continue;

    try {
      const res = await fetch(`${GEMINI_API_BASE}/models?key=${activeKey}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data?.models)) continue;

      const discovered = data.models
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => ({ id: m.name.replace(/^models\//, ''), name: m.displayName || m.name.replace(/^models\//, ''), description: m.description }));

      // Prioritize 3.8 Flash TTS, 3.8 Flash-Lite TTS, 3.1 Flash TTS (Gemini 2.5 score bonuses purged)
      const score = (id) => (id === 'gemini-3.8-flash-tts' ? 40 : (id.includes('3.8') ? 35 : (id === 'gemini-3.1-flash-tts-preview' ? 30 : (id.includes('3.1') ? 25 : (id.includes('tts') ? 15 : (id.includes('audio') ? 12 : 0))))));
      const sorted = discovered.sort((a, b) => score(b.id) - score(a.id));

      if (sorted.length > 0) {
        if (!overrideKey) { cachedGeminiModels = sorted; cachedGeminiModelsExpiresAt = now + (30 * 60 * 1000); }
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

export async function getAvailableGeminiVoices(overrideKey = null) {
  const now = Date.now();
  if (!overrideKey && cachedGeminiVoices && now < cachedGeminiVoicesExpiresAt) return cachedGeminiVoices;
  const pool = overrideKey ? [overrideKey] : getGeminiKeyPool();
  if (pool.length === 0) return GEMINI_VOICES;

  for (const activeKey of pool) {
    const metric = getOrCreateKeyMetric(activeKey);
    if (metric.lastStatus === 'invalid' || (metric.retryAvailableAt && now < metric.retryAvailableAt)) continue;

    try {
      let pageToken = '', pageCount = 0;
      const dynamicVoices = new Map(GEMINI_VOICES.map(v => [v.id.toLowerCase(), { ...v }]));
      do {
        const res = await fetch(`${GEMINI_API_BASE}/voices?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}&key=${activeKey}`);
        if (!res.ok) break;
        const data = await res.json();
        if (Array.isArray(data?.voices)) {
          for (const v of data.voices) {
            const rawName = v.display_name || v.id;
            if (!rawName) continue;
            const keyName = rawName.toLowerCase();
            const gender = v.gender && v.gender !== 'Neutral' ? (v.gender.charAt(0).toUpperCase() + v.gender.slice(1).toLowerCase()) : 'Male';
            if (dynamicVoices.has(keyName)) {
              const ex = dynamicVoices.get(keyName);
              if (v.description && ex.description.length < v.description.length) ex.description = v.description;
            } else {
              dynamicVoices.set(keyName, { id: rawName, name: rawName, gender, description: v.description || `${rawName} voice` });
            }
          }
        }
        pageToken = data.next_page_token || '';
        pageCount++;
      } while (pageToken && pageCount < 3);

      const voiceList = Array.from(dynamicVoices.values());
      if (voiceList.length > 0) {
        if (!overrideKey) { cachedGeminiVoices = voiceList; cachedGeminiVoicesExpiresAt = now + (60 * 60 * 1000); }
        return voiceList;
      }
    } catch (err) { console.warn('Could not fetch dynamic voices list for key:', err.message); }
  }
  return GEMINI_VOICES;
}
