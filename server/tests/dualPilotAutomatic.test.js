import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { automaticTasks, executeAutomaticTasks } from '../../shared/dualPilotAuto.mjs';
import { reserveDualPilotRun, dualPilotIdentity, cachedDualPilotTask } from '../shared/dualPilotRunStore.js';
import { buildDualPilotGeminiPrompt } from '../dualPilotService.js';
import { getEmotionSpeechStyle } from '../pairedEmotionConfig.js';
import { V20_EMOTION_PROFILES } from '../shared/v20EmotionCatalog.js';
import { generateElevenLabsDualPilotTake } from '../dualPilotElevenService.js';

const emotions = Object.keys(V20_EMOTION_PROFILES).filter(key => !['whisper', 'cackle', 'laugh', 'sigh'].includes(key))
  .map(key => ({ key, name: key, defaultIntensity: key === 'neutral' ? 0 : 0.8 }));

test('six sentences finish all 50 emotions before the next chunk; providers keep independent text', () => {
  const g = Array.from({ length: 8 }, (_, i) => `G${i}`);
  const e = Array.from({ length: 7 }, (_, i) => `E${i}`);
  const tasks = [...automaticTasks(g, e, emotions)];
  assert.equal(tasks.filter(task => task.provider === 'gemini').length, 100);
  assert.equal(tasks.filter(task => task.provider === 'elevenlabs').length, 350);
  assert.equal(tasks.reduce((sum, task) => sum + task.count, 0), 15 * 50);
  assert.deepEqual(tasks[0].paragraphs, g.slice(0, 6));
  assert.equal(tasks[1].text, 'E0');
  assert.equal(tasks[349].condition.key, 'serene');
  assert.equal(tasks[350].start, 6);
  assert.equal(tasks[350].condition.key, 'neutral');
  assert.equal(new Set(tasks.map(task => task.key)).size, tasks.length);
});

test('a failure continues; retrying failures runs only the failed task', async () => {
  const tasks = [...automaticTasks(['G'], ['E'], emotions.slice(0, 2))];
  const failures = [], success = [];
  const controller = new AbortController();
  await executeAutomaticTasks(tasks, { signal: controller.signal,
    run: async task => { if (task === tasks[1]) throw new Error('quota'); return task.key; },
    success: task => success.push(task.key), failure: task => failures.push(task) });
  assert.equal(success.length, 3); assert.equal(failures.length, 1);
  const retried = [];
  await executeAutomaticTasks(failures, { signal: controller.signal, run: async task => retried.push(task.key),
    success: () => {}, failure: () => assert.fail('retry failed') });
  assert.deepEqual(retried, [tasks[1].key]);
});

test('automatic emotion owns all six Gemini turns; voice identity is stable', () => {
  for (const emotion of emotions) {
    const result = buildDualPilotGeminiPrompt(['[sad] A', 'B', 'C', 'D', 'E', 'F'],
      { emotion: emotion.key, intensity: emotion.defaultIntensity, language: 'en', femaleVoice: 'Aoede', maleVoice: 'Puck' });
    assert.equal(result.speechParts.length, 6);
    assert.deepEqual(result.parsedParagraphs.map(para => para.emotion), Array(6).fill(emotion.key));
    assert.deepEqual(result.voices, ['Aoede', 'Puck', 'Aoede', 'Puck', 'Aoede', 'Puck']);
    assert.equal(result.multiSpeakerConfig.speakerVoiceConfigs.length, 2);
    assert.equal(result.cleanParagraphs[0], 'A');
  }
  assert.match(getEmotionSpeechStyle('neutral', 0, 'en'), /Intensity: 0/);
});

test('run reservation and retry cache prevent collisions and duplicate generation', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dual-pilot-test-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const first = reserveDualPilotRun(root), second = reserveDualPilotRun(root);
  assert.notEqual(first.runId, second.runId);
  const params = { ...first, startIndex: 0, emotion: 'happy', text: 'Hello', saveToDataset: true };
  const identities = emotions.map(emotion => dualPilotIdentity({ ...params, emotion: emotion.key }, 'elevenlabs'));
  assert.equal(new Set(identities.map(item => item.family_id)).size, 1);
  assert.equal(new Set(identities.map(item => item.id)).size, 50);
  assert.ok(identities.every(item => item.id.length <= 64));
  assert.notEqual(dualPilotIdentity(params, 'gemini').family_id, identities[0].family_id);
  let generated = 0;
  const run = () => cachedDualPilotTask(params, 'elevenlabs', async () => ({ success: true, count: ++generated }), root);
  const results = await Promise.all([run(), run()]);
  assert.equal(generated, 1); assert.deepEqual(results[0], results[1]);
  await run(); assert.equal(generated, 1);
  await assert.rejects(cachedDualPilotTask({ ...params, text: 'Different' }, 'elevenlabs', run, root), /inputs differ/);
  assert.throws(() => dualPilotIdentity({ runId: '../bad' }, 'gemini'), /Invalid run/);
});

test('ElevenLabs sends the automatic tag and rotates keys on quota exhaustion', async t => {
  const oldKeys = process.env.ELEVENLABS_API_KEYS, oldKey = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEYS = 'fake-test-key-one,fake-test-key-two'; delete process.env.ELEVENLABS_API_KEY;
  t.after(() => {
    if (oldKeys === undefined) delete process.env.ELEVENLABS_API_KEYS; else process.env.ELEVENLABS_API_KEYS = oldKeys;
    if (oldKey === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = oldKey;
  });
  t.mock.method(fs, 'writeFileSync', () => {});
  const exists = fs.existsSync;
  t.mock.method(fs, 'existsSync', filename => (String(filename).endsWith('keys.json') || String(filename).endsWith('.env')) ? false : exists(filename));
  for (const level of ['log', 'warn', 'error']) t.mock.method(console, level, () => {});
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    requests.push({ key: options.headers['xi-api-key'], body: JSON.parse(options.body) });
    if (requests.length === 1) return { ok: false, status: 429, text: async () => JSON.stringify({ detail: { status: 'quota_exceeded', message: 'quota exceeded' } }) };
    return { ok: true, headers: new Headers(), json: async () => ({ audio_base64: Buffer.alloc(48000).toString('base64') }) };
  });
  const result = await generateElevenLabsDualPilotTake({ text: '[sad] Hello', emotion: 'happy',
    voiceId: 'test-voice', saveToDataset: false });
  assert.equal(result.emotion, 'happy'); assert.equal(result.text, 'Hello');
  assert.equal(requests.length, 2); assert.notEqual(requests[0].key, requests[1].key);
  assert.ok(requests.every(request => request.body.text === '[happy] Hello'));
  assert.ok(requests.every(request => request.body.model_id === 'eleven_v4_turbo'));
});
