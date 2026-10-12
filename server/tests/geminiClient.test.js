import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import timersPromises from 'node:timers/promises';
import { syncBuiltinESMExports } from 'node:module';
import { generateGeminiSpeech } from '../services/geminiClient.js';
import { keyRuntimeMetrics } from '../services/geminiKeyPool.js';
import { GEMINI_KEYS_FILE_PATH, GEMINI_DISABLED_KEYS_FILE_PATH } from '../services/geminiConstants.js';
import { buildContextLabBatchPrompt } from '../contextLabPrompt.js';

const dummyKey = 'unit-test-only-not-a-real-key-1001';
const prompt = buildContextLabBatchPrompt(['First turn', 'Second turn']);
const request = { text: prompt.legacyPrompt, speechParts: prompt.speechParts, promptInstruction: prompt.instruction,
  multiSpeakerConfig: prompt.multiSpeakerConfig, apiKey: dummyKey, model: 'gemini-3.8-flash-tts' };

function audioResponse() {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [
    { inlineData: { mimeType: 'audio/L16;rate=24000', data: Buffer.alloc(4800).toString('base64') } },
  ] } }] }) };
}

function apiError(status, message, details = []) {
  return { ok: false, status, text: async () => JSON.stringify({ error: { message, details } }) };
}

function prepare(t) {
  keyRuntimeMetrics.clear();
  t.after(() => keyRuntimeMetrics.clear());
  for (const level of ['log', 'warn', 'error']) t.mock.method(console, level, () => {});
}

function isolateDummyPool(t, keys) {
  const originalSingle = process.env.GEMINI_API_KEY;
  const originalMultiple = process.env.GEMINI_API_KEYS;
  delete process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEYS = keys.join(',');
  const originalExists = fs.existsSync;
  t.mock.method(fs, 'existsSync', filename =>
    [GEMINI_KEYS_FILE_PATH, GEMINI_DISABLED_KEYS_FILE_PATH].includes(filename) ? false : originalExists(filename));
  t.after(() => {
    if (originalSingle === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalSingle;
    if (originalMultiple === undefined) delete process.env.GEMINI_API_KEYS;
    else process.env.GEMINI_API_KEYS = originalMultiple;
  });
}

function instantDelay(t, implementation = async () => {}) {
  const original = timersPromises.setTimeout;
  timersPromises.setTimeout = implementation;
  syncBuiltinESMExports();
  t.after(() => { timersPromises.setTimeout = original; syncBuiltinESMExports(); });
}

test('successful synthesis requests exactly the chosen 3.8 or 3.1 model', async t => {
  prepare(t);
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return audioResponse(); });
  for (const model of ['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview']) {
    const result = await generateGeminiSpeech({ ...request, model });
    assert.equal(result.modelId, model);
    assert.ok(calls.at(-1).url.includes(`/models/${model}:generateContent`));
    assert.deepEqual(calls.at(-1).body.generationConfig.speechConfig.multiSpeakerVoiceConfig, prompt.multiSpeakerConfig);
  }
  assert.equal(calls.length, 2);
  assert.ok(calls.every(call => !call.url.includes('gemini-2.5')));
});

test('quota exhaustion and unavailable models never request any fallback model', async t => {
  prepare(t);
  const urls = [];
  let response;
  t.mock.method(globalThis, 'fetch', async url => { urls.push(url); return response; });
  for (const model of ['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview']) {
    for (const status of [429, 404]) {
      keyRuntimeMetrics.clear();
      response = apiError(status, status === 429 ? 'RESOURCE_EXHAUSTED daily quota limit' : 'Model not found');
      const initial = urls.length;
      await assert.rejects(generateGeminiSpeech({ ...request, model }), /failed or are in cooldown/);
      assert.equal(urls.length - initial, 1);
      assert.ok(urls.at(-1).includes(`/models/${model}:generateContent`));
    }
  }
  assert.ok(urls.every(url => !url.includes('gemini-2.5')));
});

test('an invalid multi-speaker configuration fails immediately without voice mutation or another request', async t => {
  prepare(t);
  const bodies = [];
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    return apiError(400, 'INVALID_ARGUMENT: speaker mapping is invalid');
  });
  await assert.rejects(generateGeminiSpeech(request), /Google API Invalid Argument/);
  assert.equal(bodies.length, 1);
  assert.deepEqual(bodies[0].generationConfig.speechConfig, { multiSpeakerVoiceConfig: prompt.multiSpeakerConfig });
  assert.equal(bodies[0].generationConfig.speechConfig.voiceConfig, undefined);
});

test('cancelling an in-flight request aborts its fetch and prevents the next dummy pool key', async t => {
  prepare(t);
  isolateDummyPool(t, [dummyKey, 'unit-test-only-not-a-real-key-2002']);
  const controller = new AbortController();
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    calls++;
    assert.equal(init.signal.aborted, false);
    controller.abort();
    assert.equal(init.signal.aborted, true);
    throw new DOMException('Cancelled by test', 'AbortError');
  });
  await assert.rejects(generateGeminiSpeech({ ...request, apiKey: '', signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls, 1);
});

test('a pre-aborted synthesis never sends a request', async t => {
  prepare(t);
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return audioResponse(); });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(generateGeminiSpeech({ ...request, signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls, 0);
});

test('quota auto-wait retains exact model, multi-speaker configuration and cancellation signal', async t => {
  prepare(t);
  isolateDummyPool(t, [dummyKey]);
  const controller = new AbortController();
  const delays = [];
  instantDelay(t, async (milliseconds, _value, options) => {
    delays.push(milliseconds);
    assert.equal(options.signal, controller.signal);
  });
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), signal: init.signal });
    return calls.length === 1
      ? apiError(429, 'Rate limit, retry after 0.01s', [{ '@type': 'google.rpc.RetryInfo', retryDelay: '0.01s' }])
      : audioResponse();
  });
  const result = await generateGeminiSpeech({ ...request, apiKey: '', signal: controller.signal });
  assert.equal(calls.length, 2);
  assert.equal(delays.length, 1);
  assert.equal(result.modelId, request.model);
  assert.deepEqual(calls[1].body, calls[0].body);
  assert.deepEqual(calls[1].body.generationConfig.speechConfig.multiSpeakerVoiceConfig, prompt.multiSpeakerConfig);
  assert.ok(calls.every(call => call.url.includes(`/models/${request.model}:generateContent`)));
  controller.abort();
  assert.equal(calls[1].signal.aborted, true, 'Retried fetch must retain the original user cancellation signal');
});

test('daily quota rotates to another dummy key while keeping the exact selected model', async t => {
  prepare(t);
  isolateDummyPool(t, [dummyKey, 'unit-test-only-not-a-real-key-2002']);
  instantDelay(t);
  const urls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    urls.push(url);
    return urls.length === 1 ? apiError(429, 'Daily quota exhausted') : audioResponse();
  });
  const result = await generateGeminiSpeech({ ...request, apiKey: '', model: 'gemini-3.1-flash-tts-preview' });
  assert.equal(result.modelId, 'gemini-3.1-flash-tts-preview');
  assert.equal(urls.length, 2);
  assert.ok(urls[0].endsWith(dummyKey));
  assert.ok(urls[1].endsWith('unit-test-only-not-a-real-key-2002'));
  assert.ok(urls.every(url => url.includes('/models/gemini-3.1-flash-tts-preview:generateContent')));
});

test('cancellation during quota wait prevents a recursive synthesis request', async t => {
  prepare(t);
  isolateDummyPool(t, [dummyKey]);
  const controller = new AbortController();
  instantDelay(t, async (_milliseconds, _value, options) => {
    assert.equal(options.signal, controller.signal);
    controller.abort();
    options.signal.throwIfAborted();
  });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return apiError(429, 'Rate limit, retry after 0.01s');
  });
  await assert.rejects(generateGeminiSpeech({ ...request, apiKey: '', signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls, 1);
});
