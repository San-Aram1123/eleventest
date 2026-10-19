import { createHash } from 'node:crypto';
import { saveSample } from '../datasetService.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeExclusiveFile } from './exclusiveFile.js';

const datasetRoot = path.resolve(process.env.DATASET_DIR || fileURLToPath(new URL('../../dataset/', import.meta.url)));
export function reserveDualPilotRun(root = datasetRoot) {
  const runs = path.join(root, '.dual-pilot-runs');
  fs.mkdirSync(runs, { recursive: true });
  let index = Math.max(0, ...fs.readdirSync(runs).map(name => Number(name.match(/^v20_run_(\d+)$/)?.[1]) || 0)) + 1;
  while (true) {
    const runId = `v20_run_${String(index).padStart(6, '0')}`;
    try { fs.mkdirSync(path.join(runs, runId)); return { runId }; }
    catch (error) { if (error.code !== 'EEXIST') throw error; index++; }
  }
}
export function dualPilotIdentity(params, provider, position = 0) {
  if (!params.runId) return {};
  if (!/^v20_run_\d{6,}$/.test(params.runId)) throw new Error('Invalid run ID.');
  const index = Number(params.startIndex ?? 0) + position;
  if (!Number.isSafeInteger(index) || index < 0) throw new Error('Invalid sentence index.');
  const familyId = `${params.runId}_${provider}_family_${String(index + 1).padStart(6, '0')}`;
  const emotion = String(params.emotion || 'neutral');
  if (!/^[a-z_]+$/.test(emotion)) throw new Error('Invalid emotion ID.');
  return { id: `${familyId}_${emotion}`, family_id: familyId, exclusive: true };
}
const inflight = new Map();
export async function cachedDualPilotTask(params, provider, generate, root = datasetRoot) {
  if (!params.runId || params.saveToDataset === false) return generate();
  const identity = dualPilotIdentity(params, provider);
  const directory = path.join(root, '.dual-pilot-runs', params.runId);
  if (!fs.existsSync(directory)) throw new Error('Reserve a batch run before generating.');
  const fingerprint = createHash('sha256').update(JSON.stringify([
    params.paragraphs, params.text, params.voices, params.femaleVoice, params.maleVoice,
    params.voiceId, params.modelId, params.language, params.dialect, params.intensity, params.deliveryStyle
  ])).digest('hex');
  const requestFile = path.join(directory, `${identity.id}.request`);
  if (!fs.existsSync(requestFile)) writeExclusiveFile(requestFile, fingerprint);
  if (fs.readFileSync(requestFile, 'utf8') !== fingerprint) throw new Error('Retry inputs differ from the reserved task. Start a new run.');
  const filename = path.join(directory, `${identity.id}.json`);
  if (fs.existsSync(filename)) return JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (inflight.has(filename)) return inflight.get(filename);
  const pending = (async () => {
    const result = await generate();
    writeExclusiveFile(filename, JSON.stringify(result));
    return result;
  })();
  inflight.set(filename, pending);
  try { return await pending; } finally { inflight.delete(filename); }
}

export async function saveDualPilotSample(sample) {
  if (sample.id && sample.exclusive) {
    const filename = path.join(datasetRoot, `${sample.id}.json`);
    if (fs.existsSync(filename)) {
      const existing = JSON.parse(fs.readFileSync(filename, 'utf8'));
      if (existing.text !== sample.text || existing.emotion !== sample.emotion || existing.voice_name !== sample.voiceName) {
        throw new Error('Existing take identity differs; refusing to overwrite it.');
      }
      if (!fs.existsSync(path.join(datasetRoot, `${sample.id}.wav`))) throw new Error('Existing take audio is missing.');
      return { ...existing, audioUrl: `/api/dataset/${sample.id}/audio` };
    }
  }
  return saveSample(sample);
}
export async function cachedGeminiMaster(params, generate, provider = 'gemini') {
  if (!params.runId || params.saveToDataset === false) return generate();
  const identity = dualPilotIdentity(params, provider);
  const directory = path.join(datasetRoot, '.dual-pilot-runs', params.runId);
  const filename = path.join(directory, `${identity.id}_master.wav`);
  if (fs.existsSync(filename)) return { audioBuffer: fs.readFileSync(filename) };
  const generated = await generate();
  writeExclusiveFile(filename, generated.audioBuffer);
  return generated;
}
