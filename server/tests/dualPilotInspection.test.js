import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { automaticTasks, executeAutomaticTasks } from '../../shared/dualPilotAuto.mjs';
import { groupV20Families } from '../../shared/v20Families.mjs';
import { trackedSpeechFetch, getRequestStatistics } from '../shared/requestStatistics.js';
function temporary(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v20-inspection-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir())); fs.rmSync(root, { recursive: true, force: true }); });
  return root;
}
test('ElevenLabs advances while Gemini is still generating, and both preserve their own order', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const events = [], controller = new AbortController();
  const emotions = [{ key: 'neutral' }, { key: 'happy' }];
  const pending = executeAutomaticTasks(() => automaticTasks(['G0'], ['E0','E1'], emotions), {
    signal: controller.signal,
    run: async task => { events.push(`${task.provider}:${task.condition.key}:${task.start}`); if (task.provider === 'gemini') await gate; },
    success: () => {}, failure: () => assert.fail('unexpected error')
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(events, ['gemini:neutral:0','elevenlabs:neutral:0','elevenlabs:neutral:1','elevenlabs:happy:0','elevenlabs:happy:1']);
  release(); await pending;
  assert.equal(events.at(-1), 'gemini:happy:0');
});
test('families count distinct available emotions, retain duplicate takes, and separate provider/run identities', () => {
  const prefix = 'v20_run_000003_gemini_family_000001';
  const sample = { id: `${prefix}_happy`, emotion: 'happy', text: 'Sentence', hasAudio: true, language: 'ckb' };
  const groups = groupV20Families([sample, { ...sample, id: `${prefix}_happy_copy` },
    { ...sample, id: `${prefix}_sad`, emotion: 'sad', hasAudio: false },
    { ...sample, id: sample.id.replace('_gemini_', '_elevenlabs_') },
    { ...sample, id: sample.id.replace('000003', '000004') }], ['happy','sad']);
  assert.equal(groups.length, 3);
  const family = groups.find(group => group.id === prefix);
  assert.equal(family.present, 1); assert.equal(family.duplicates, 1);
  assert.equal(family.takes.happy.length, 2);
});
test('statistics count every actual attempt by key without storing keys or transcripts', async t => {
  const root = temporary(t), before = process.env.REQUEST_STATS_DIR;
  process.env.REQUEST_STATS_DIR = root;
  t.after(() => { if (before === undefined) delete process.env.REQUEST_STATS_DIR; else process.env.REQUEST_STATS_DIR = before; });
  let count = 0;
  t.mock.method(globalThis, 'fetch', async () => { count++; if (count === 3) throw new Error('network'); return { ok: count === 1, status: count === 1 ? 200 : 429 }; });
  const key = 'sk_fake-first-secret', otherKey = 'sk_fake-second-secret';
  const options = { body: JSON.stringify({ text: 'PRIVATE TRANSCRIPT' }) };
  await trackedSpeechFetch('elevenlabs', key, 'test-model', 'https://example.invalid', options);
  await trackedSpeechFetch('elevenlabs', key, 'test-model', 'https://example.invalid', options);
  await assert.rejects(trackedSpeechFetch('gemini', otherKey, 'test-model', 'https://example.invalid', options), /network/);
  const stats = getRequestStatistics();
  const first = stats.rows.find(row => row.provider === 'elevenlabs');
  assert.equal(first.requests, 2); assert.equal(first.succeeded, 1); assert.equal(first.failed, 1); assert.equal(first.rateLimited, 1);
  assert.equal(first.unfinished, 0); assert.equal(stats.rows.length, 2);
  const log = fs.readFileSync(path.join(root, 'requests.jsonl'), 'utf8');
  assert.ok(!log.includes(key)); assert.ok(!log.includes(otherKey)); assert.ok(!log.includes('PRIVATE TRANSCRIPT'));
});
