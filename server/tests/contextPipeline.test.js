import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { setImmediate as tick } from 'node:timers/promises';
import { createAutoJobManager } from '../contextAuto/jobManager.js';
import { harness, autoRequest, acceptedAnalysis, MASTER } from './fixtures/autoHarness.js';

async function until(predicate) {
  const deadline = Date.now() + 5000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error('Pipeline condition timed out'); await tick(); }
}

test('generation overlaps slicing, bounds backlog to three, and resumes without replay', async t => {
  const h = harness(t);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  t.after(() => release());
  let firstAnalyzing = false;
  h.dependencies.analyze = async params => {
    firstAnalyzing = true; await gate; return acceptedAnalysis(params.paragraphs);
  };
  const manager = createAutoJobManager(h.dependencies);
  const input = autoRequest(48); await manager.create(input);
  const processing = manager.pump();
  await until(() => firstAnalyzing && h.calls.length === 4);
  await tick(); await tick();
  let job = manager.get(input.id);
  assert.equal(job.pipeline.waitingMasters, 3);
  assert.equal(job.pipeline.generationState, 'waiting_for_slicer');
  assert.equal(job.pipeline.analyzingGroup, 1);
  assert.equal(h.calls.length, 4, 'Only one active master plus three queued masters may be generated');
  manager.action(input.id, 'pause'); release(); await processing;
  job = manager.get(input.id);
  assert.equal(job.status, 'paused'); assert.equal(job.savedCount, 6); assert.equal(job.pipeline.waitingMasters, 3);
  const restored = createAutoJobManager({ ...h.dependencies, analyze: async params => acceptedAnalysis(params.paragraphs) });
  restored.action(input.id, 'resume'); await restored.pump();
  assert.equal(restored.get(input.id).savedCount, 48); assert.equal(h.calls.length, 8);
  assert.equal(new Set(h.writes).size, 48);
});

test('generation failure stops new requests while the slicer drains checkpointed masters', async t => {
  const h = harness(t); const generate = h.dependencies.generate; let attempts = 0;
  h.dependencies.generate = async params => {
    if (++attempts === 2) throw new Error('Keys exhausted');
    return generate(params);
  };
  const manager = createAutoJobManager(h.dependencies); const input = autoRequest(24);
  await manager.create(input); await manager.pump();
  const job = manager.get(input.id);
  assert.equal(attempts, 2); assert.equal(job.savedCount, 6); assert.equal(job.status, 'paused');
  assert.equal(job.batches[1].status, 'generation_failed'); assert.equal(job.batches[2].status, 'pending');
});

test('restart finds uncertain generation even while an earlier batch was analyzing', async t => {
  const h = harness(t); const input = autoRequest(24); await h.manager.create(input);
  const job = h.store.load(input.id);
  job.status = 'running'; job.batches[0].status = 'analyzing'; job.batches[1].status = 'generating'; job.batches[2].status = 'ready';
  for (const number of [0, 2]) fs.writeFileSync(h.store.batchFile(input.id, number, 'master.wav'), MASTER);
  h.store.save(job);
  const restored = createAutoJobManager(h.dependencies);
  assert.equal(restored.get(input.id).batches[1].status, 'generation_failed');
  restored.action(input.id, 'resume'); await restored.pump();
  assert.equal(restored.get(input.id).savedCount, 18); assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].paragraphs, job.batches[3].paragraphs);
});
