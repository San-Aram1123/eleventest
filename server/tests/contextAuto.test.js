import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createAutoJobManager } from '../contextAuto/jobManager.js';
import { selectBestEngine } from '../contextAuto/selection.js';
import { readPcmWav } from '../shared/wavPcm.js';
import { writeExclusiveFile } from '../shared/exclusiveFile.js';
import { harness, autoRequest, acceptedAnalysis, MASTER } from './fixtures/autoHarness.js';

test('groups six paragraphs per master, saves the best engine and exact PCM, with monotonic indices', async t => {
  const h = harness(t);
  const request = autoRequest(14, { model: 'gemini-3.1-flash-tts-preview' });
  const created = await h.manager.create(request);
  assert.deepEqual(created.batches.map(batch => batch.paragraphs.length), [6, 6, 2]);
  await h.manager.pump();
  const job = h.manager.get(created.id);
  assert.equal(job.status, 'completed'); assert.equal(job.savedCount, 14);
  assert.deepEqual(h.calls.map(call => call.paragraphs.length), [6, 6, 2]);
  assert.ok(h.calls.every(call => call.detectionEngine === 'all' && call.apiKey === '' && call.model === request.model));
  assert.deepEqual(job.batches.flatMap(batch => batch.saved.map(item => item.index)), Array.from({ length: 14 }, (_, i) => i + 1));
  for (const batch of job.batches) {
    assert.equal(batch.selectedEngine, 'speaker_consensus');
    const combined = Buffer.concat(batch.saved.map(item => readPcmWav(fs.readFileSync(path.join(h.directory, `${item.id}.wav`))).data));
    assert.deepEqual(combined, readPcmWav(MASTER).data);
  }
  const first = JSON.parse(fs.readFileSync(path.join(h.directory, `${job.batches[0].saved[0].id}.json`), 'utf8'));
  assert.equal(first.text, request.paragraphs[0]); assert.equal(first.metadata_extra.auto_job_id, job.id);
});

test('repeated create requests reuse the same job and reservations; different settings reject the reused ID', async t => {
  const h = harness(t); const request = autoRequest(6);
  const first = await h.manager.create(request);
  const repeat = await h.manager.create(request);
  assert.equal(first.id, repeat.id); assert.equal(first.firstIndex, repeat.firstIndex);
  await assert.rejects(h.manager.create({ ...request, model: 'gemini-3.1-flash-tts-preview' }), /different text|conflict/);
  const next = await h.manager.create(autoRequest(2)); assert.equal(next.firstIndex, 7);
});

test('missing local models fail preflight before a job reserves indices or synthesizes', async t => {
  const h = harness(t, { preflight: async () => { throw new Error('Missing ERes2Net model'); } });
  await assert.rejects(h.manager.create(autoRequest()), /Missing ERes2Net/);
  assert.equal(h.calls.length, 0); assert.equal(h.store.list().length, 0);
  assert.equal(fs.existsSync(path.join(h.store.root, 'indices.json')), false);
});

test('pause completes the current group and resumes at the next six without repeating generation', async t => {
  const h = harness(t); const original = h.dependencies.generate;
  h.dependencies.generate = async params => {
    const result = await original(params);
    h.store.pause(request.id, true); return result;
  };
  const manager = createAutoJobManager(h.dependencies); const request = autoRequest(12);
  await manager.create(request); await manager.pump();
  assert.equal(manager.get(request.id).status, 'paused'); assert.equal(manager.get(request.id).savedCount, 6);
  h.dependencies.generate = original;
  const restored = createAutoJobManager(h.dependencies);
  restored.action(request.id, 'resume'); await restored.pump();
  assert.equal(restored.get(request.id).savedCount, 12); assert.equal(h.calls.length, 2);
});

test('rejected masters are retained while later groups proceed; retry is local analysis only', async t => {
  const h = harness(t); const original = h.dependencies.analyze;
  h.dependencies.analyze = async params => {
    const result = await original(params);
    return h.analyses.length === 1 ? { success: false, durationSeconds: 12, engineResults: {} } : result;
  };
  const manager = createAutoJobManager(h.dependencies); const request = autoRequest(12);
  await manager.create(request); await manager.pump();
  let job = manager.get(request.id);
  assert.equal(job.status, 'completed_with_errors'); assert.equal(job.savedCount, 6);
  assert.ok(job.batches[0].masterUrl); assert.ok(job.batches[0].diagnosticsUrl);
  manager.action(job.id, 'retry-analysis'); await manager.pump(); job = manager.get(job.id);
  assert.equal(job.savedCount, 12); assert.equal(h.calls.length, 2); assert.equal(h.analyses.length, 3);
});

test('resume after partial save reuses existing clips and the master without duplicates', async t => {
  const h = harness(t); let interrupted = false;
  h.dependencies.saveClips = (job, batch, selection, master, checkpoint) => h.saver(job, batch, selection, master, async () => {
    await checkpoint();
    if (!interrupted && batch.saved.length === 2) { interrupted = true; throw new Error('Simulated process interruption'); }
  });
  const manager = createAutoJobManager(h.dependencies); const request = autoRequest(6);
  await manager.create(request); await manager.pump();
  assert.equal(manager.get(request.id).status, 'paused'); assert.equal(manager.get(request.id).savedCount, 2);
  const journal = h.store.load(request.id); journal.batches[0].saved = []; h.store.save(journal);
  const restored = createAutoJobManager({ ...h.dependencies, saveClips: h.saver });
  restored.action(request.id, 'resume'); await restored.pump();
  assert.equal(restored.get(request.id).savedCount, 6); assert.equal(h.calls.length, 1);
  assert.equal(h.writes.length, 6); assert.equal(new Set(h.writes).size, 6);
});

test('restart with a checkpointed master resumes analysis without synthesis', async t => {
  const h = harness(t); const created = await h.manager.create(autoRequest(6));
  const job = h.store.load(created.id); job.status = 'running'; job.batches[0].status = 'analyzing'; h.store.save(job);
  fs.writeFileSync(h.store.batchFile(job.id, 0, 'master.wav'), MASTER);
  const restored = createAutoJobManager(h.dependencies);
  assert.equal(restored.get(job.id).status, 'paused');
  restored.action(job.id, 'resume'); await restored.pump();
  assert.equal(restored.get(job.id).savedCount, 6); assert.equal(h.calls.length, 0); assert.equal(h.analyses.length, 1);
});

test('restart during generation flags the uncertain group and never resends it automatically', async t => {
  const h = harness(t); const created = await h.manager.create(autoRequest(12));
  const job = h.store.load(created.id); job.status = 'running'; job.batches[0].status = 'generating'; h.store.save(job);
  const restored = createAutoJobManager(h.dependencies);
  assert.equal(restored.get(job.id).batches[0].status, 'generation_failed');
  restored.action(job.id, 'resume'); await restored.pump();
  const result = restored.get(job.id);
  assert.equal(result.savedCount, 6); assert.equal(result.status, 'completed_with_errors'); assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].paragraphs, job.batches[1].paragraphs);
});

test('generation errors pause the queue rather than retrying synthesis or burning through later groups', async t => {
  let attempts = 0;
  const h = harness(t, { generate: async () => { attempts++; throw new Error('All project keys exhausted'); } });
  const created = await h.manager.create(autoRequest(18)); await h.manager.pump();
  const job = h.manager.get(created.id);
  assert.equal(attempts, 1); assert.equal(job.status, 'paused'); assert.equal(job.batches[1].status, 'pending');
});

test('multiple managers sharing the same journal cannot process a job twice', async t => {
  const h = harness(t); await h.manager.create(autoRequest(6));
  const second = createAutoJobManager(h.dependencies);
  await Promise.all([h.manager.pump(), second.pump()]);
  assert.equal(h.calls.length, 1); assert.equal(h.writes.length, 6);
});

test('indices advance beyond existing context files and reserved unsaved jobs', async t => {
  const h = harness(t);
  fs.writeFileSync(path.join(h.directory, 'ctx_lab_puck_00050_neutral.json'), '{}');
  const first = await h.manager.create(autoRequest(6));
  const second = await h.manager.create(autoRequest(1));
  assert.equal(first.firstIndex, 51); assert.equal(second.firstIndex, 57);
});

test('automatic selection rejects acoustic-only results and flags neural disagreement for review', () => {
  const paragraphs = autoRequest(2).paragraphs;
  assert.throws(() => selectBestEngine(acceptedAnalysis(paragraphs, ['timbre_dp']), paragraphs), /No complete neural/);
  const result = acceptedAnalysis(paragraphs, ['speaker_embedding', 'speaker_resnet']);
  result.engineResults.speaker_resnet.segments = [{ start: 0, end: 6.5 }, { start: 6.5, end: 12 }];
  const selected = selectBestEngine(result, paragraphs);
  assert.equal(selected.pendingReview, true);
  assert.equal(selected.disagreements[0].spreadMs, 500);
  assert.match(selected.reviewWarnings[0], /500 ms/);
});

test('existing dataset collisions are rejected without replacing either audio or metadata', async t => {
  const h = harness(t); const created = await h.manager.create(autoRequest(1));
  const id = 'ctx_auto_0000001_puck_neutral';
  fs.writeFileSync(path.join(h.directory, `${id}.json`), JSON.stringify({ id, text: 'Unrelated sample' }));
  fs.writeFileSync(path.join(h.directory, `${id}.wav`), MASTER);
  await h.manager.pump();
  assert.equal(h.manager.get(created.id).status, 'paused');
  assert.equal(JSON.parse(fs.readFileSync(path.join(h.directory, `${id}.json`), 'utf8')).text, 'Unrelated sample');
  assert.deepEqual(fs.readFileSync(path.join(h.directory, `${id}.wav`)), MASTER);
});

test('exclusive file publication cannot truncate an existing target', t => {
  const h = harness(t); const filename = path.join(h.directory, 'exclusive.json');
  writeExclusiveFile(filename, 'original');
  assert.throws(() => writeExclusiveFile(filename, 'replacement'), /exist/i);
  assert.equal(fs.readFileSync(filename, 'utf8'), 'original');
});
