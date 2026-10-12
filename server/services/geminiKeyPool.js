import fs from 'fs';
import { syncApiKeysToDb } from '../db.js';
import {
  ENV_FILE_PATH,
  GEMINI_KEYS_FILE_PATH,
  GEMINI_DISABLED_KEYS_FILE_PATH,
  GEMINI_API_BASE
} from './geminiConstants.js';

export const keyRuntimeMetrics = new Map();

export function getMsUntilMidnightPT() {
  const now = new Date();
  const nextMidnightPT = new Date(now);
  nextMidnightPT.setUTCHours(7, 0, 0, 0); // 00:00 PT in PDT (UTC-7) is 07:00 UTC
  if (nextMidnightPT.getTime() <= now.getTime()) nextMidnightPT.setUTCDate(nextMidnightPT.getUTCDate() + 1);
  return Math.max(60000, nextMidnightPT.getTime() - now.getTime());
}

export function parseGoogleRetryDelayMs(errJson, errorText) {
  if (errJson && Array.isArray(errJson.error?.details)) {
    const retryInfo = errJson.error.details.find(d => d['@type'] && d['@type'].includes('RetryInfo'));
    if (retryInfo && retryInfo.retryDelay) {
      const match = String(retryInfo.retryDelay).match(/([\d\.]+)\s*s?/i);
      if (match && match[1]) {
        const sec = parseFloat(match[1]);
        if (!isNaN(sec) && sec > 0) return Math.ceil((sec + 1.5) * 1000);
      }
    }
  }

  const raw = (errJson?.error?.message || errorText || '');
  const match = raw.match(/retry\s+(?:in|after)\s+([\d\.]+)\s*s/i) || raw.match(/([\d\.]+)\s*(?:seconds|s)\b/i);
  if (match && match[1]) {
    const parsedSec = parseFloat(match[1]);
    if (!isNaN(parsedSec) && parsedSec > 0) return Math.ceil((parsedSec + 1.5) * 1000);
  }

  return 30000;
}

export function parseQuotaExhaustionInfo(errJson, errorText, delayMs) {
  const raw = (errJson?.error?.message || errorText || '').toLowerCase();
  const quotaId = (errJson?.error?.details?.find(d => d['@type']?.includes('QuotaFailure'))?.violations?.[0]?.quotaId || '').toLowerCase();

  const isExplicitDaily = quotaId.includes('perday') || quotaId.includes('daily') ||
    raw.includes('daily') || raw.includes('per day') || raw.includes('per_day') ||
    raw.includes('day limit') || raw.includes('quota per 24 hours');

  if (isExplicitDaily) {
    return {
      isDaily: true,
      delayMs: getMsUntilMidnightPT(),
      quotaType: 'daily',
      statusText: 'Free tier daily limit reached for this model. Resets at Midnight PT.'
    };
  }

  const dMs = (delayMs && delayMs <= 300000) ? delayMs : (delayMs || 30000);
  return { isDaily: false, delayMs: dMs, quotaType: 'minute', statusText: `Rate limit active (recovers in ${Math.ceil(dMs / 1000)}s)` };
}

export function isGoogleKeyInvalid(status, errorMsg) {
  const msg = (errorMsg || '').toLowerCase();
  return status === 401 ||
    (status === 400 && (msg.includes('api key not valid') || msg.includes('bad request') || msg.includes('key not valid'))) ||
    (status === 403 && (msg.includes('denied') || msg.includes('permission') || msg.includes('disabled') || msg.includes('unregistered') || msg.includes('blocked')));
}

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

export const parseRetryDelayMs = (err) => parseGoogleRetryDelayMs(null, err);

export function getOrCreateKeyMetric(key) {
  const masked = `${key.slice(0, 4)}...${key.slice(-4)}`;
  if (!keyRuntimeMetrics.has(masked)) {
    keyRuntimeMetrics.set(masked, {
      maskedKey: masked, totalRequests: 0, successCount: 0, failureCount: 0,
      lastStatus: 'ready', quotaType: 'minute', quotaLimit: '10', dailyResetInfo: null,
      lastError: null, lastUsedAt: null, retryAvailableAt: null,
      cooldownDurationSeconds: null, cooldownStartedAt: null, exhaustedModels: new Set()
    });
  }
  const m = keyRuntimeMetrics.get(masked);
  if (!m.exhaustedModels) m.exhaustedModels = new Set();
  return m;
}

export function getAllGeminiKeys() {
  const keys = new Set();
  const disabled = getDisabledGeminiKeys();
  if (process.env.GEMINI_API_KEYS) {
    for (const p of process.env.GEMINI_API_KEYS.split(',')) {
      const trimmed = p.trim();
      if (trimmed && !disabled.has(trimmed)) keys.add(trimmed);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    const single = process.env.GEMINI_API_KEY.trim();
    if (single && !disabled.has(single)) keys.add(single);
  }
  if (fs.existsSync(GEMINI_KEYS_FILE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(GEMINI_KEYS_FILE_PATH, 'utf8'));
      if (Array.isArray(parsed)) {
        for (const k of parsed) if (typeof k === 'string' && k.trim() && !disabled.has(k.trim())) keys.add(k.trim());
      }
    } catch (e) { console.warn('Could not read gemini_keys.json:', e.message); }
  }
  return Array.from(keys);
}

export function getDisabledGeminiKeys() {
  const disabled = new Set();
  if (fs.existsSync(GEMINI_DISABLED_KEYS_FILE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(GEMINI_DISABLED_KEYS_FILE_PATH, 'utf8'));
      if (Array.isArray(parsed)) {
        for (const k of parsed) if (typeof k === 'string' && k.trim()) disabled.add(k.trim());
      }
    } catch (e) { console.warn('Could not read gemini_disabled_keys.json:', e.message); }
  }
  return disabled;
}

export function saveDisabledGeminiKeys(disabledKeys) {
  const keysArray = Array.isArray(disabledKeys) ? disabledKeys : Array.from(disabledKeys || []);
  const unique = Array.from(new Set(keysArray.map(k => String(k || '').trim()).filter(Boolean)));
  try { fs.writeFileSync(GEMINI_DISABLED_KEYS_FILE_PATH, JSON.stringify(unique, null, 2), 'utf8'); }
  catch (e) { console.warn('Could not write gemini_disabled_keys.json:', e.message); }
}

export function getGeminiKeyPool({ includeDisabled = false } = {}) {
  const allKeys = getAllGeminiKeys();
  if (includeDisabled) return allKeys;
  const disabled = getDisabledGeminiKeys();
  return allKeys.filter(k => !disabled.has(k));
}

export function toggleGeminiKey(indexOrKey, explicitEnabled = null) {
  const allKeys = getAllGeminiKeys();
  let targetKey = typeof indexOrKey === 'number'
    ? allKeys[indexOrKey]
    : allKeys.find(k => k === indexOrKey || k.endsWith(String(indexOrKey).slice(-4)));
  if (!targetKey) throw new Error(`Key at identifier "${indexOrKey}" not found in Gemini pool.`);

  const disabledKeys = getDisabledGeminiKeys();
  const willBeEnabled = typeof explicitEnabled === 'boolean' ? explicitEnabled : disabledKeys.has(targetKey);
  if (willBeEnabled) disabledKeys.delete(targetKey);
  else disabledKeys.add(targetKey);
  saveDisabledGeminiKeys(disabledKeys);

  return {
    success: true,
    maskedKey: `${targetKey.slice(0, 4)}...${targetKey.slice(-4)}`,
    isEnabled: willBeEnabled,
    activeCount: allKeys.length - disabledKeys.size,
    totalCount: allKeys.length
  };
}

export function setAllGeminiKeysEnabled(enabled) {
  const allKeys = getAllGeminiKeys();
  const disabledKeys = new Set();
  if (!enabled) for (const k of allKeys) disabledKeys.add(k);
  saveDisabledGeminiKeys(disabledKeys);
  return { success: true, enabled, activeCount: enabled ? allKeys.length : 0, totalCount: allKeys.length };
}

export function toggleMultipleGeminiKeys(indices, enabled) {
  const allKeys = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  const targetSet = new Set(indices);
  for (let idx = 0; idx < allKeys.length; idx++) {
    if (targetSet.has(idx)) {
      if (enabled) disabledKeys.delete(allKeys[idx]);
      else disabledKeys.add(allKeys[idx]);
    }
  }
  saveDisabledGeminiKeys(disabledKeys);
  return { success: true, enabled, activeCount: allKeys.length - disabledKeys.size, totalCount: allKeys.length };
}

export function saveGeminiKeyPool(keys) {
  const uniqueKeys = Array.from(new Set(keys.map(k => String(k || '').trim()).filter(Boolean)));
  process.env.GEMINI_API_KEYS = uniqueKeys.join(',');
  process.env.GEMINI_API_KEY = uniqueKeys[0] || '';

  try {
    fs.writeFileSync(GEMINI_KEYS_FILE_PATH, JSON.stringify(uniqueKeys, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write gemini_keys.json:', e.message);
  }

  try {
    let envContent = fs.existsSync(ENV_FILE_PATH) ? fs.readFileSync(ENV_FILE_PATH, 'utf8') : '';
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
    fs.writeFileSync(ENV_FILE_PATH, envContent, 'utf8');
  } catch (e) {
    console.warn('Could not write GEMINI_API_KEYS to .env:', e.message);
  }

  syncApiKeysToDb('gemini', uniqueKeys).catch(() => { });
  return uniqueKeys;
}

export function getGeminiApiKey(overrideKey) {
  if (overrideKey && typeof overrideKey === 'string' && overrideKey.trim()) return overrideKey.trim();
  return getGeminiKeyPool()[0] || '';
}

export function saveGeminiApiKey(apiKey) {
  const trimmed = String(apiKey || '').trim();
  if (!trimmed) return '';
  const currentPool = getGeminiKeyPool();
  if (!currentPool.includes(trimmed)) currentPool.unshift(trimmed);
  saveGeminiKeyPool(currentPool);
  return trimmed;
}

export async function addGeminiKeyToPool(newKey) {
  const trimmed = String(newKey || '').trim();
  if (!trimmed) throw new Error('Gemini API key cannot be empty.');
  if (/[\r\n,;]/.test(trimmed)) return await addMultipleGeminiKeysToPool(trimmed);

  const res = await fetch(`${GEMINI_API_BASE}/models?key=${trimmed}`);
  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = `Google API Error (${res.status})`;
    try { errorMsg = JSON.parse(errorText).error?.message || errorMsg; } catch { }
    if (isGoogleKeyInvalid(res.status, errorMsg)) {
      throw new Error(errorMsg || 'Invalid Gemini API key or access denied.');
    }
  }

  const currentPool = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  if (!currentPool.includes(trimmed)) {
    currentPool.push(trimmed);
    disabledKeys.delete(trimmed);
    saveGeminiKeyPool(currentPool);
    saveDisabledGeminiKeys(disabledKeys);
  }
  return { success: true, maskedKey: `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`, poolSize: currentPool.length };
}

export async function addMultipleGeminiKeysToPool(input) {
  let keys = Array.isArray(input) ? input : (typeof input === 'string' ? input.split(/[\r\n,;'"\[\]\s]+/).filter(Boolean) : []);
  const cleanKeys = keys.map(k => String(k || '').trim()).filter(k => k.length >= 20 && !k.startsWith('{') && !k.startsWith('//'));
  if (cleanKeys.length === 0) throw new Error('No valid API keys found in input.');

  const currentPool = getAllGeminiKeys();
  const disabledKeys = getDisabledGeminiKeys();
  let addedCount = 0;
  for (const k of cleanKeys) {
    if (!currentPool.includes(k)) {
      currentPool.push(k);
      disabledKeys.delete(k);
      addedCount++;
    }
  }
  if (addedCount > 0) {
    saveGeminiKeyPool(currentPool);
    saveDisabledGeminiKeys(disabledKeys);
  }
  return { success: true, addedCount, poolSize: currentPool.length, totalInput: cleanKeys.length };
}

export function removeGeminiKeyFromPool(indexOrKey) {
  const allKeys = getAllGeminiKeys();
  let targetKey = typeof indexOrKey === 'number'
    ? allKeys[indexOrKey]
    : allKeys.find(k => k === indexOrKey || k.endsWith(String(indexOrKey).slice(-4)));
  const updated = allKeys.filter((k, idx) => typeof indexOrKey === 'number' ? idx !== indexOrKey : (k !== indexOrKey && !k.endsWith(String(indexOrKey).slice(-4))));

  saveGeminiKeyPool(updated);
  if (targetKey) {
    const disabledKeys = getDisabledGeminiKeys();
    if (disabledKeys.has(targetKey)) {
      disabledKeys.delete(targetKey);
      saveDisabledGeminiKeys(disabledKeys);
    }
  }
  return { success: true, poolSize: updated.length };
}
