import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import contextLabRouter from '../routes/contextLabRoutes.js';
import { decodeWavDataUrl, readPcmWav } from '../shared/wavPcm.js';
import { createTestWav, wavDataUrl } from './fixtures/wavFixture.js';

function uploadForm(audioBuffer, fields = {}) {
  const form = new FormData();
  if (audioBuffer) form.append('masterAudio', new Blob([audioBuffer], { type: 'audio/wav' }), 'master.wav');
  form.append('paragraphs', JSON.stringify(['First turn']));
  form.append('detectionEngine', 'timbre_dp');
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

test('Context Lab HTTP upload and local analysis use no remote generation', async t => {
  const app = express();
  app.use(express.json());
  app.use('/api', contextLabRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/context-switching`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });

  await t.test('uploaded stereo PCM with RIFF metadata is analyzed, sliced and returned intact', async () => {
    const audioBuffer = createTestWav({ channels: 2, bitsPerSample: 32, metadata: true });
    const response = await fetch(`${base}/analyze-lab-master`, { method: 'POST', body: uploadForm(audioBuffer) });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, true, JSON.stringify(result.engineResults));
    assert.equal(result.reusedMaster, true);
    assert.equal(result.modelId, null);
    assert.equal(result.masterAudioUrl, wavDataUrl(audioBuffer));
    assert.equal(result.clips.length, 1);
    assert.deepEqual(readPcmWav(decodeWavDataUrl(result.clips[0].audioUrl)).data, readPcmWav(audioBuffer).data);
  });

  await t.test('silent two-turn master returns reusable audio and no fallback clips', async () => {
    const audioBuffer = createTestWav();
    readPcmWav(audioBuffer).data.fill(0);
    const response = await fetch(`${base}/analyze-lab-master`, { method: 'POST',
      body: uploadForm(audioBuffer, { paragraphs: JSON.stringify(['First', 'Second']), detectionEngine: 'all' }) });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.equal(result.masterAudioUrl, wavDataUrl(audioBuffer));
    assert.deepEqual(result.clips, []);
    assert.match(result.error, /silent/);
  });

  await t.test('malformed uploads and options fail with HTTP 400 before any analysis', async () => {
    for (const form of [
      uploadForm(null), uploadForm(Buffer.from('not a WAV')),
      uploadForm(createTestWav(), { paragraphs: '{invalid JSON' }),
      uploadForm(createTestWav(), { options: '{invalid JSON' }),
      uploadForm(createTestWav(), { detectionEngine: 'equal_split' }),
      uploadForm(createTestWav(), { options: JSON.stringify({ expectedBoundaries: [NaN] }) }),
    ]) {
      const response = await fetch(`${base}/analyze-lab-master`, { method: 'POST', body: form });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).error, 'string');
    }
  });

  await t.test('invalid generation and save requests reject without external side effects', async () => {
    for (const [endpoint, body] of [['generate-lab-batch', { paragraphs: [] }], ['save-lab-clips', { clips: [] }]]) {
      const response = await fetch(`${base}/${endpoint}`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 400);
      assert.equal(typeof (await response.json()).error, 'string');
    }
  });

  await t.test('abort endpoint succeeds when no work is queued', async () => {
    const response = await fetch(`${base}/abort-batch`, { method: 'POST' });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
  });
});
