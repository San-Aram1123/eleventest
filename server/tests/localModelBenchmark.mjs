// Optional real-model HTTP benchmark. Requires the explicit local model setup.
// No speech generation, API keys, dataset writes, or external inference calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import express from 'express';
import router from '../routes/contextLabRoutes.js';
import { decodeWavDataUrl, readPcmWav } from '../shared/wavPcm.js';

const directory = path.resolve(process.argv[2] || 'scratch/lab-fixture');
const short = process.argv.includes('--short');
const metadata = JSON.parse(fs.readFileSync(path.join(directory, 'fixture_metadata.json'), 'utf8'));
const master = fs.readFileSync(path.join(directory, short ? 'short_handoffs.wav' : 'alternating_trimmed.wav'));
const options = JSON.parse(fs.readFileSync(path.join(directory, short ? 'options_short.json' : 'options_trimmed.json'), 'utf8'));
const app = express();
app.use('/api', router);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
try {
  const form = new FormData();
  form.append('masterAudio', new Blob([master], { type: 'audio/wav' }), 'master.wav');
  form.append('paragraphs', JSON.stringify(metadata.paragraphs));
  form.append('speaker1Voice', 'Puck');
  form.append('speaker2Voice', 'Aoede');
  form.append('detectionEngine', 'all');
  form.append('options', JSON.stringify(options));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/context-switching/analyze-lab-master`, {
    method: 'POST', body: form,
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.reusedMaster, true);
  assert.deepEqual(decodeWavDataUrl(result.masterAudioUrl), master);
  const table = [];
  for (const [engine, item] of Object.entries(result.engineResults)) {
    if (item.success) {
      assert.equal(item.clips.length, metadata.paragraphs.length);
      const reconstructed = Buffer.concat(item.clips.map(clip => readPcmWav(decodeWavDataUrl(clip.audioUrl)).data));
      assert.deepEqual(reconstructed, readPcmWav(master).data, `${engine}: PCM was altered or lost`);
    } else {
      assert.deepEqual(item.clips, []);
    }
    table.push({ engine, accepted: item.success, elapsedMs: item.diagnostics?.elapsedMs,
      maeMs: item.diagnostics?.metrics?.boundaryMaeMs, error: item.error });
  }
  for (const name of ['speaker_embedding', 'speaker_resnet', 'speaker_eres2net', 'speaker_consensus']) {
    assert.equal(result.engineResults[name]?.success, true, JSON.stringify(result.engineResults[name]?.diagnostics));
  }
  if (short) assert.equal(result.engineResults.speaker_strict.success, false);
  console.log(JSON.stringify({ fixture: short ? '35ms_handoffs' : '150ms_handoffs', exactPcmCoverage: true, table }, null, 2));
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
