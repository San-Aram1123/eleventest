import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { once } from 'node:events';
import { harness, autoRequest, acceptedAnalysis, MASTER } from './fixtures/autoHarness.js';
import { setSampleReviewStatus } from '../dataset/sampleReview.js';
import { updateSampleMetadata } from '../dataset/datasetMutations.js';
import { exportDatasetZip } from '../dataset/datasetExport.js';
import { readPcmWav } from '../shared/wavPcm.js';

function disputed(paragraphs) {
  const result = acceptedAnalysis(paragraphs, ['speaker_embedding', 'speaker_resnet']);
  result.engineResults.speaker_resnet.segments = result.engineResults.speaker_resnet.segments.map(item => ({ ...item }));
  result.engineResults.speaker_resnet.segments[0].end += .5;
  result.engineResults.speaker_resnet.segments[1].start += .5;
  delete result.engineResults.speaker_resnet.segments[0].duration;
  delete result.engineResults.speaker_resnet.segments[1].duration;
  return result;
}

test('disputed accepted cuts save all clips pending review, remain exportable, and can be reviewed', async t => {
  const h = harness(t, { generate: async params => {
    await params.onMasterReady({ audioBuffer: MASTER }); return { audioBuffer: MASTER };
  }, analyze: async params => disputed(params.paragraphs) });
  const input = autoRequest(6); await h.manager.create(input); await h.manager.pump();
  const job = h.manager.get(input.id);
  assert.equal(job.status, 'completed'); assert.equal(job.savedCount, 6); assert.equal(job.batches[0].pendingReview, true);
  const samples = job.batches[0].saved.map(item => JSON.parse(fs.readFileSync(path.join(h.directory, `${item.id}.json`), 'utf8')));
  for (const sample of samples) {
    assert.equal(sample.review_status, 'pending'); assert.match(sample.review_warnings[0], /500 ms/);
    assert.equal(sample.metadata_extra.review_status, 'pending');
  }
  assert.deepEqual(Buffer.concat(samples.map(sample => readPcmWav(fs.readFileSync(path.join(h.directory, `${sample.id}.wav`))).data)), readPcmWav(MASTER).data);
  const app = express();
  app.get('/export', (req, res) => exportDatasetZip(res, {}, async () => samples, h.directory));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const response = await fetch(`http://127.0.0.1:${server.address().port}/export`);
  assert.equal(response.status, 200);
  const zip = Buffer.from(await response.arrayBuffer());
  assert.ok(zip.includes(Buffer.from(`${samples[0].id}.wav`))); assert.ok(zip.includes(Buffer.from(`${samples[0].id}.json`)));
  const updated = await setSampleReviewStatus(samples[0].id, 'reviewed', {
    get: async () => ({ id: samples[0].id, metadata_extra: samples[0].metadata_extra }),
    update: (id, patch) => updateSampleMetadata(id, patch, { datasetDir: h.directory })
  });
  assert.equal(updated.review_status, 'reviewed'); assert.equal(updated.metadata_extra.review_status, 'reviewed');
  assert.equal(updated.customMetadata.review_status, 'reviewed'); assert.ok(updated.reviewed_at);
  assert.equal(updated.metadata_extra.auto_job_id, input.id); assert.match(updated.review_warnings[0], /500 ms/);
});

test('review status validation rejects unknown statuses and missing samples', async () => {
  await assert.rejects(setSampleReviewStatus('missing', 'invalid'), /status/);
  await assert.rejects(setSampleReviewStatus('missing', 'reviewed', { get: async () => null }), /not found/);
});

test('local-only retry never generates uncheckpointed pending groups', async t => {
  const h = harness(t); const created = await h.manager.create(autoRequest(12));
  const job = h.store.load(created.id);
  job.status = 'paused'; job.batches[0].status = 'rejected';
  fs.writeFileSync(h.store.batchFile(job.id, 0, 'master.wav'), MASTER); h.store.save(job);
  h.manager.action(job.id, 'retry-analysis'); await h.manager.pump();
  assert.equal(h.calls.length, 0); assert.equal(h.analyses.length, 1);
  assert.equal(h.manager.get(job.id).status, 'paused'); assert.equal(h.manager.get(job.id).savedCount, 6);
});
