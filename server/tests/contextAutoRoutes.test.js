import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { createContextAutoRouter } from '../routes/contextAutoRoutes.js';
import { harness, autoRequest, MASTER } from './fixtures/autoHarness.js';

test('automation HTTP API persists, reconnects, and downloads masters without external synthesis', async t => {
  const h = harness(t);
  const app = express(); app.use(express.json()); app.use('/api/context-auto', createContextAutoRouter(h.manager));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}/api/context-auto`;
  const input = autoRequest(7);
  const post = async (url, body) => fetch(`${base}${url}`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  const create = await post('/jobs', input); assert.equal(create.status, 200);
  const queued = await create.json(); assert.equal(queued.status, 'queued');
  const repeat = await (await post('/jobs', input)).json(); assert.equal(repeat.firstIndex, queued.firstIndex);
  await h.manager.pump();
  const restored = await (await fetch(`${base}/jobs/${input.id}`)).json();
  assert.equal(restored.savedCount, 7); assert.equal(restored.batches.length, 2); assert.equal(h.calls.length, 2);
  const history = await (await fetch(`${base}/jobs`)).json(); assert.equal(history.jobs[0].id, input.id);
  const audio = await fetch(`http://127.0.0.1:${server.address().port}${restored.batches[0].masterUrl}`);
  assert.deepEqual(Buffer.from(await audio.arrayBuffer()), MASTER);
  const diagnostics = await (await fetch(`http://127.0.0.1:${server.address().port}${restored.batches[0].diagnosticsUrl}`)).json();
  assert.equal(diagnostics.masterAudioUrl, undefined); assert.equal(diagnostics.engineResults.speaker_embedding.clips[0].audioUrl, undefined);
  assert.equal((await post(`/jobs/${input.id}/not-an-action`)).status, 400);
  assert.equal((await fetch(`${base}/jobs/not-a-path`)).status, 400);
  assert.equal((await fetch(`${base}/jobs/${input.id}/batches/999/master`)).status, 404);
});
