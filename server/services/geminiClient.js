import { GEMINI_API_BASE, GEMINI_VOICES } from './geminiConstants.js';
import {
  getGeminiKeyPool,
  getAllGeminiKeys,
  getOrCreateKeyMetric,
  parseGoogleRetryDelayMs,
  parseQuotaExhaustionInfo,
  isGoogleKeyInvalid
} from './geminiKeyPool.js';
import {
  analyzeMultilingualContent,
  normalizeMultilingualBidiText,
  sanitizeVoice,
  extractInlineEmotionTags,
  buildPromptInstructions,
  buildSpeechPayloadParts,
  buildGeminiRequestBody
} from './geminiPrompts.js';
import {
  extractAudioDataFromCandidate,
  processRawAudioToWav,
  packageSpeechResult
} from './geminiAudio.js';

export async function generateGeminiSpeech({
  text,
  speechParts = null,
  speechStyle = '',
  voiceName = 'Puck',
  dialect = 'sorani',
  promptInstruction = '',
  apiKey = '',
  model = 'gemini-3.8-flash-tts',
  multiSpeakerConfig = null,
  _autoWaitAttempt = 0
}) {
  const pool = apiKey ? [apiKey] : getGeminiKeyPool();
  if (pool.length === 0) {
    const all = getAllGeminiKeys();
    if (all.length > 0) throw new Error('All configured Gemini API keys are currently turned off. Please turn on at least one key in Gemini Voice Studio.');
    throw new Error('No Google Gemini API Key configured. Please add at least one Gemini API Key in Gemini Studio or Settings.');
  }

  const sanitizedText = (text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF]/g, '').trim();
  if (!sanitizedText) throw new Error('Kurdish text is required for speech generation.');

  let cleanVoice = sanitizeVoice(voiceName);
  const uniqueTags = extractInlineEmotionTags(sanitizedText);
  const langAnalysis = analyzeMultilingualContent(sanitizedText);
  const normalizedText = normalizeMultilingualBidiText(sanitizedText);

  const { baseInstruction, codeSwitchingDirective, emotionDirective } = buildPromptInstructions({
    dialect, promptInstruction, langAnalysis, uniqueTags
  });

  const rawModel = model || 'gemini-3.8-flash-tts';
  const primaryModel = rawModel === 'gemini-3.8-flash-tts-preview' ? 'gemini-3.8-flash-tts' : rawModel;
  // Strictly enforce single model requested by user - NEVER use fallback to 2.5
  const candidateModels = [primaryModel];
  const is38Model = primaryModel.startsWith('gemini-3.8');

  const contentParts = buildSpeechPayloadParts({
    normalizedText, speechParts, speechStyle, promptInstruction, langAnalysis, is38Model,
    baseInstruction, codeSwitchingDirective, emotionDirective
  });
  const requestBody = buildGeminiRequestBody({ contentParts, cleanVoice, multiSpeakerConfig });

  let keyErrors = [];
  let audioBuffer = null;
  let successfulModel = candidateModels[0];
  let successfulKeyMasked = '';
  const now = Date.now();

  for (const k of pool) {
    const m = getOrCreateKeyMetric(k);
    if (m.retryAvailableAt && now >= m.retryAvailableAt) {
      m.retryAvailableAt = null; m.cooldownDurationSeconds = 0;
      if (m.lastStatus !== 'invalid') { m.lastStatus = 'ready'; m.lastError = null; }
    }
  }

  let sortedPool = [];
  if (apiKey) {
    sortedPool = [apiKey];
  } else {
    const validKeys = pool.filter(k => getOrCreateKeyMetric(k).lastStatus !== 'invalid');
    const readyKeys = validKeys.filter(k => {
      const m = getOrCreateKeyMetric(k);
      return !m.retryAvailableAt || now >= m.retryAvailableAt;
    }).sort((a, b) => {
      const tA = getOrCreateKeyMetric(a).lastUsedAt ? new Date(getOrCreateKeyMetric(a).lastUsedAt).getTime() : 0;
      const tB = getOrCreateKeyMetric(b).lastUsedAt ? new Date(getOrCreateKeyMetric(b).lastUsedAt).getTime() : 0;
      return tA - tB;
    });

    const cooldownKeys = validKeys.filter(k => {
      const m = getOrCreateKeyMetric(k);
      return m.retryAvailableAt && now < m.retryAvailableAt;
    }).sort((a, b) => (getOrCreateKeyMetric(a).retryAvailableAt || 0) - (getOrCreateKeyMetric(b).retryAvailableAt || 0));

    if (readyKeys.length > 0) {
      sortedPool = [...readyKeys, ...cooldownKeys];
    } else if (cooldownKeys.length > 0) {
      const soonestMetric = getOrCreateKeyMetric(cooldownKeys[0]);
      const waitMs = Math.max(0, (soonestMetric.retryAvailableAt || 0) - Date.now());
      if (_autoWaitAttempt === 0 && waitMs <= 75000 && soonestMetric.quotaType !== 'daily') {
        console.log(`[Gemini Auto-Wait] All keys in rate-limit cooldown. Soonest key (${soonestMetric.maskedKey}) recovers in ${(waitMs / 1000).toFixed(1)}s. Auto-waiting...`);
        await new Promise(r => setTimeout(r, waitMs + 600));
        soonestMetric.retryAvailableAt = null; soonestMetric.lastStatus = 'ready';
        sortedPool = [cooldownKeys[0], ...cooldownKeys.slice(1)];
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

    if (!apiKey) {
      if (metric.lastStatus === 'invalid') continue;
      if (metric.retryAvailableAt && loopNow < metric.retryAvailableAt) {
        keyErrors.push(`Key ${maskedKey}: in quota cooldown (${Math.ceil((metric.retryAvailableAt - loopNow) / 1000)}s remaining)`);
        continue;
      }
      if (metric.exhaustedModels?.has(candidateModels[0])) {
        keyErrors.push(`Key ${maskedKey}: daily quota exhausted for ${candidateModels[0]}`);
        continue;
      }
    }

    if (keyIdx > 0) await new Promise(resolve => setTimeout(resolve, 150));
    metric.totalRequests++;
    metric.lastUsedAt = new Date().toISOString();

    for (const candidateModel of candidateModels) {
      if (metric.exhaustedModels?.has(candidateModel)) continue;
      const url = `${GEMINI_API_BASE}/models/${candidateModel}:generateContent?key=${activeKey}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(45000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMsg = `Gemini API Error (${response.status})`;
          let errJson = null;
          try { errJson = JSON.parse(errorText); errorMsg = errJson.error?.message || errJson.message || errorMsg; } catch { errorMsg = errorText || errorMsg; }

          if (isGoogleKeyInvalid(response.status, errorMsg)) {
            metric.failureCount++; metric.lastStatus = 'invalid'; metric.lastError = errorMsg;
            metric.retryAvailableAt = null; metric.cooldownDurationSeconds = 0;
            keyErrors.push(`Key ${maskedKey}: ${errorMsg}`);
            console.warn(`[Gemini Key Invalid] Key #${keyIdx + 1}/${sortedPool.length} (${maskedKey}) invalid/denied: "${errorMsg}".`);
            break;
          }

          const isQuota = response.status === 429 || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('resource_exhausted') || errorMsg.toLowerCase().includes('rate limit');
          if (isQuota) {
            const delayMs = parseGoogleRetryDelayMs(errJson, errorText);
            const qInfo = parseQuotaExhaustionInfo(errJson, errorText, delayMs);
            if (qInfo.isDaily) {
              metric.exhaustedModels = metric.exhaustedModels || new Set();
              metric.exhaustedModels.add(candidateModel);
            }
            metric.failureCount++; metric.lastStatus = qInfo.isDaily ? 'daily_exhausted' : 'exhausted';
            metric.quotaType = qInfo.quotaType; metric.quotaLimit = qInfo.isDaily ? '10/day' : '10/min';
            metric.dailyResetInfo = 'Resets at Midnight Pacific Time (PT) / 10:00 AM';
            metric.lastError = qInfo.statusText; metric.retryAvailableAt = Date.now() + qInfo.delayMs;
            metric.cooldownDurationSeconds = Math.ceil(qInfo.delayMs / 1000); metric.cooldownStartedAt = Date.now();
            keyErrors.push(`Key ${maskedKey}: ${qInfo.statusText}`);
            break;
          }

          if (response.status === 404 || errorMsg.includes('not found') || errorMsg.includes('no longer available') || errorMsg.includes('not supported')) {
            continue;
          }

          if (response.status === 400 || errorMsg.toLowerCase().includes('invalid argument')) {
            console.error(`[Gemini 400 Bad Request] Text: "${text.slice(0, 50)}..." Voice: "${cleanVoice}". Error: ${errorMsg}`);
            if (!voiceFallbackAttempted) {
              voiceFallbackAttempted = true;
              const voiceMeta = GEMINI_VOICES.find(v => v.id.toLowerCase() === cleanVoice.toLowerCase());
              const fallbackVoice = voiceMeta?.gender === 'Female' ? (cleanVoice === 'Aoede' ? 'Despina' : 'Aoede') : (cleanVoice === 'Puck' ? 'Fenrir' : 'Puck');
              console.warn(`[Gemini Voice Fallback] 400 rejection on voice "${cleanVoice}". Fallback to "${fallbackVoice}"...`);
              cleanVoice = fallbackVoice;
              requestBody.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName = fallbackVoice;
              continue;
            }
            throw new Error(`Google API Invalid Argument: ${errorMsg}`);
          }

          metric.failureCount++; metric.lastError = errorMsg;
          throw new Error(errorMsg);
        }

        const data = await response.json();
        const base64Audio = extractAudioDataFromCandidate(data.candidates?.[0], candidateModel);
        if (!base64Audio) continue;

        audioBuffer = processRawAudioToWav(base64Audio, 24000);
        successfulModel = candidateModel;
        successfulKeyMasked = maskedKey;
        metric.successCount++; metric.lastStatus = 'ready'; metric.lastError = null; metric.retryAvailableAt = null;
        break;
      } catch (err) {
        if (err.message.includes('Google API Invalid Argument') || err.message.toLowerCase().includes('invalid argument')) throw err;

        const isQuota = err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('resource_exhausted') || err.message.toLowerCase().includes('rate limit');
        if (isQuota) {
          const delayMs = parseGoogleRetryDelayMs(null, err.message);
          const qInfo = parseQuotaExhaustionInfo(null, err.message, delayMs);
          if (qInfo.isDaily) {
            metric.exhaustedModels = metric.exhaustedModels || new Set();
            metric.exhaustedModels.add(candidateModel);
          }
          metric.failureCount++; metric.lastStatus = qInfo.isDaily ? 'daily_exhausted' : 'exhausted';
          metric.quotaType = qInfo.quotaType; metric.lastError = qInfo.statusText;
          metric.retryAvailableAt = Date.now() + qInfo.delayMs;
          metric.cooldownDurationSeconds = Math.ceil(qInfo.delayMs / 1000); metric.cooldownStartedAt = Date.now();
          keyErrors.push(`Key ${maskedKey}: ${qInfo.statusText}`);
          break;
        }

        if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('abort')) {
          metric.failureCount++; metric.lastStatus = 'exhausted'; metric.lastError = 'Request timed out after 45s';
          metric.retryAvailableAt = Date.now() + 60000; metric.cooldownDurationSeconds = 60;
          keyErrors.push(`Key ${maskedKey}: Request timed out (45s)`);
          break;
        }

        metric.failureCount++; metric.lastError = err.message;
        if (!err.message.includes('not found') && !err.message.includes('no longer available')) {
          keyErrors.push(`Key ${maskedKey} on ${candidateModel}: ${err.message}`);
        }
      }
    }

    if (audioBuffer) break;
  }

  if (!audioBuffer) {
    if (!apiKey && _autoWaitAttempt === 0) {
      const cooldownMetrics = pool.map(k => getOrCreateKeyMetric(k)).filter(m => m.retryAvailableAt && m.retryAvailableAt > Date.now() && m.quotaType !== 'daily')
        .sort((a, b) => (a.retryAvailableAt || 0) - (b.retryAvailableAt || 0));
      if (cooldownMetrics.length > 0) {
        const waitMs = (cooldownMetrics[0].retryAvailableAt || 0) - Date.now();
        if (waitMs <= 65000 && waitMs > 0) {
          console.log(`[Gemini Auto-Wait] Rate limit cooldown. Soonest key (${cooldownMetrics[0].maskedKey}) recovers in ${(waitMs / 1000).toFixed(1)}s. Waiting...`);
          await new Promise(r => setTimeout(r, waitMs + 800));
          cooldownMetrics[0].retryAvailableAt = null; cooldownMetrics[0].lastStatus = 'ready';
          return await generateGeminiSpeech({ text, speechParts, speechStyle, voiceName, dialect, promptInstruction, model, _autoWaitAttempt: 1 });
        }
      }
    }
    const failedCount = keyErrors.length > 0 ? keyErrors.length : pool.length;
    throw new Error(`All ${pool.length} Gemini API Key(s) in the pool failed or are in cooldown (${failedCount} key${failedCount === 1 ? '' : 's'} checked). Please wait a moment for short rate limits to expire.`);
  }

  return packageSpeechResult({ audioBuffer, text, cleanVoice, successfulModel, successfulKeyMasked, uniqueTags, langAnalysis });
}
