import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPersistentSpeakerDetector } from '../alignment/localSpeakerWorker.js';
import { harness } from './fixtures/autoHarness.js';
import { createTestWav } from './fixtures/wavFixture.js';

test('persistent slicer reuses one Python process for separate masters and validates each result', async t => {
  const h = harness(t); const filename = path.join(h.directory, 'single.wav'); fs.writeFileSync(filename, createTestWav());
  const worker = createPersistentSpeakerDetector(); t.after(() => worker.close());
  const first = await worker.detect(filename, 1);
  const pid = worker.pid;
  assert.equal(first.success, true); assert.ok(pid);
  const second = await worker.detect(filename, 1);
  assert.equal(second.success, true); assert.equal(worker.pid, pid);
  assert.equal(second.engines.speaker_embedding.segments.length, 1);
});

test('timed out local work fails without replay, and a subsequent explicit request gets a new worker', async t => {
  const h = harness(t); const filename = path.join(h.directory, 'single.wav'); fs.writeFileSync(filename, createTestWav());
  const worker = createPersistentSpeakerDetector({ script: fileURLToPath(new URL('./fixtures/fakeSpeakerWorker.py', import.meta.url)), timeoutMs: 500 });
  t.after(() => worker.close());
  assert.equal((await worker.detect(filename, 1)).success, true);
  const firstPid = worker.pid;
  await assert.rejects(worker.detect(filename, 1, 'all', { stall: true }), /timed out/);
  assert.equal(worker.pid, null);
  assert.equal((await worker.detect(filename, 1)).success, true); assert.notEqual(worker.pid, firstPid);
});
