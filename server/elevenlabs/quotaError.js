import { removeExhaustedKeyFromPool } from './keyPoolManager.js';

export function classifyElevenLabsFailure(status, text) {
  let message = text, code = '';
  try {
    const body = JSON.parse(text);
    message = body.detail?.message || body.message || text;
    code = String(body.detail?.status || body.error?.code || body.code || '').toLowerCase();
  } catch { /* Some API errors are plain text. */ }
  const exhausted = ['quota_exceeded', 'insufficient_credits', 'insufficient_credit_balance', 'credit_balance_too_low'].includes(code)
    || /exceeds your quota|insufficient credits|out of credits|credits? (?:balance )?exhausted|quota (?:is )?exhausted/i.test(message);
  return { message, exhausted, isQuotaError: exhausted || [401, 402, 429].includes(status) };
}

export function elevenLabsFailure(status, text, key) {
  const failure = classifyElevenLabsFailure(status, text);
  if (failure.exhausted) removeExhaustedKeyFromPool(key);
  const error = new Error(`ElevenLabs API generation failed (${status}): ${failure.message}`);
  error.statusCode = status;
  error.isQuotaError = failure.isQuotaError;
  error.isCreditExhausted = failure.exhausted;
  return error;
}
