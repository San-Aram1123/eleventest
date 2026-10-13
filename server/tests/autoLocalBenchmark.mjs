import { persistentSpeakerDetector } from '../alignment/localSpeakerWorker.js';
// Optional free end-to-end automation check: real neural models, local speech fixture,
// durable job journal and real dataset files in a disposable directory. No API calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createAutoJobManager } from '../contextAuto/jobManager.js';
import { createJobStore } from '../contextAuto/jobStore.js';
import { createAutoClipSaver } from '../contextAuto/saveClips.js';
import { analyzeContextLabMaster } from '../contextLabService.js';
import { checkLocalSpeakerModels } from '../alignment/localSpeakerBridge.js';
import { saveSample } from '../dataset/datasetMutations.js';
import { readPcmWav } from '../shared/wavPcm.js';

const fixture = path.resolve(process.argv[2] || 'scratch/lab-fixture');
const metadata = JSON.parse(fs.readFileSync(path.join(fixture, 'fixture_metadata.json'), 'utf8'));
const master = fs.readFileSync(path.join(fixture, 'short_handoffs.wav'));
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'context-auto-model-benchmark-'));
try {
  const store = createJobStore(path.join(directory, '.context-auto'), directory);
  let syntheses = 0;
  const saveClips = createAutoClipSaver({
    get: async id => {
      const file = path.join(directory, `${id}.json`);
      return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
    },
    getAudio: id => fs.readFileSync(path.join(directory, `${id}.wav`)),
    save: params => saveSample(params, { datasetDir: directory, invalidateCacheFn: () => {} })
  });
  const dependencies = { store, saveClips, autoStart: false, preflight: checkLocalSpeakerModels,
    generate: async params => {
      syntheses++;
      await params.onMasterReady({ audioBuffer: master });
      return { audioBuffer: master };
    } };
  const manager = createAutoJobManager(dependencies);
  const job = await manager.create({ id: randomUUID(), paragraphs: metadata.paragraphs,
    speaker1Voice: 'Puck', speaker2Voice: 'Aoede', model: 'gemini-3.8-flash-tts' });
  await manager.pump();
  const completed = manager.get(job.id);
  assert.equal(completed.status, 'completed', JSON.stringify(completed.batches));
  assert.equal(completed.savedCount, 5);
  assert.equal(completed.batches[0].selectedEngine, 'speaker_consensus');
  const joined = Buffer.concat(completed.batches[0].saved.map(item => readPcmWav(fs.readFileSync(path.join(directory, `${item.id}.wav`))).data));
  assert.deepEqual(joined, readPcmWav(master).data);
  const restored = createAutoJobManager({ ...dependencies, generate: async () => { throw new Error('Unexpected replay'); } });
  restored.action(job.id, 'resume'); await restored.pump();
  assert.equal(restored.get(job.id).savedCount, 5); assert.equal(syntheses, 1);
  console.log(JSON.stringify({ success: true, realModels: true, selectedEngine: completed.batches[0].selectedEngine,
    savedCount: completed.savedCount, exactPcmCoverage: true, restoredWithoutReplay: true, remoteApiCalls: 0 }));
} finally { persistentSpeakerDetector.close(); fs.rmSync(directory, { recursive: true, force: true }); }
