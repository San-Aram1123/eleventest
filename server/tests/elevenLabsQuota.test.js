import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { classifyElevenLabsFailure, elevenLabsFailure } from '../elevenlabs/quotaError.js';
import { getKeyPool } from '../elevenlabs/keyPoolManager.js';

test('explicit credit exhaustion is distinct from rate limits and invalid credentials', () => {
  const payload = (status, message) => JSON.stringify({ detail: { status, message } });
  assert.equal(classifyElevenLabsFailure(401, payload('quota_exceeded', 'You have 1 credit remaining')).exhausted, true);
  assert.equal(classifyElevenLabsFailure(402, 'This request exceeds your quota of 10000').exhausted, true);
  assert.equal(classifyElevenLabsFailure(429, payload('too_many_concurrent_requests', 'Too many requests')).exhausted, false);
  assert.equal(classifyElevenLabsFailure(429, 'Rate limit reached. Retry later.').exhausted, false);
  assert.equal(classifyElevenLabsFailure(401, payload('invalid_api_key', 'Invalid key')).exhausted, false);
  assert.equal(classifyElevenLabsFailure(500, 'Internal server error').exhausted, false);
});

test('removes only the exhausted ElevenLabs key and persists the remaining pool', t => {
  const beforeKeys = process.env.ELEVENLABS_API_KEYS, beforeKey = process.env.ELEVENLABS_API_KEY;
  const geminiBefore = process.env.GEMINI_API_KEY;
  const exhausted = 'sk_dummy_exhausted_same', healthy = 'sk_dummy_healthy_same';
  process.env.ELEVENLABS_API_KEYS = `${exhausted},${healthy}`; process.env.ELEVENLABS_API_KEY = exhausted;
  t.after(() => {
    if (beforeKeys === undefined) delete process.env.ELEVENLABS_API_KEYS; else process.env.ELEVENLABS_API_KEYS = beforeKeys;
    if (beforeKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = beforeKey;
  });
  const writes = [];
  const exists = fs.existsSync;
  t.mock.method(fs, 'existsSync', file => String(file).endsWith('keys.json') || String(file).endsWith('.env') ? false : exists(file));
  t.mock.method(fs, 'writeFileSync', (file, contents) => writes.push({ file: String(file), contents }));
  t.mock.method(console, 'warn', () => {});
  const error = elevenLabsFailure(401, JSON.stringify({ detail: { status: 'quota_exceeded', message: 'Quota exhausted' } }), exhausted);
  assert.equal(error.isCreditExhausted, true);
  assert.deepEqual(getKeyPool(), [healthy]);
  assert.equal(process.env.ELEVENLABS_API_KEY, healthy);
  assert.equal(process.env.GEMINI_API_KEY, geminiBefore);
  assert.deepEqual(JSON.parse(writes.find(item => item.file.endsWith('keys.json')).contents), [healthy]);
  assert.ok(!writes.some(item => /gemini/i.test(item.file)));
  elevenLabsFailure(429, 'Too many concurrent requests', healthy);
  assert.deepEqual(getKeyPool(), [healthy]);
});
