import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { acquireLease, atomicJson, leaseAlive, readJson } from './fileStore.js';

const defaultRoot = fileURLToPath(new URL('../../dataset', import.meta.url));
export const AUTO_ROOT = path.join(path.resolve(process.env.DATASET_DIR || defaultRoot), '.context-auto');

export function createJobStore(root = AUTO_ROOT, datasetDir = path.dirname(root)) {
  fs.mkdirSync(root, { recursive: true });
  const validId = id => {
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) throw new Error('Invalid automation job ID.');
    return id;
  };
  const directory = id => path.join(root, validId(id));
  const filename = id => path.join(directory(id), 'job.json');
  const batchFile = (id, number, name) => {
    if (!Number.isSafeInteger(number) || number < 0) throw new Error('Invalid group number.');
    return path.join(directory(id), `batch-${number}-${name}`);
  };
  function save(job) {
    job.updatedAt = new Date().toISOString();
    atomicJson(filename(job.id), job);
  }
  function load(id) {
    const job = readJson(filename(id));
    if (!job) throw new Error('Automation job not found.');
    return job;
  }
  function list() {
    return fs.readdirSync(root, { withFileTypes: true }).filter(item => item.isDirectory() && /^[a-f0-9-]{36}$/i.test(item.name))
      .flatMap(item => { const job = readJson(filename(item.name)); return job ? [job] : []; })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function reserve(count) {
    const release = acquireLease(path.join(root, 'indices.lock'));
    if (!release) throw new Error('Dataset indices are being reserved. Try again shortly.');
    try {
      let next = readJson(path.join(root, 'indices.json'), { next: 1 }).next;
      for (const name of fs.readdirSync(datasetDir)) {
        const match = name.match(/^ctx_.*?_(\d+)(?:_[a-z_-]+)?\.(?:wav|json)$/i)
          || name.match(/^ctx_auto_(\d+)_/i);
        if (match) next = Math.max(next, Number(match[1]) + 1);
      }
      if (!Number.isSafeInteger(next) || next < 1 || !Number.isSafeInteger(next + count)) throw new Error('Invalid dataset index ledger.');
      atomicJson(path.join(root, 'indices.json'), { next: next + count });
      return next;
    } finally { release(); }
  }
  function recover(job) {
    if (job.status !== 'running' || leaseAlive(path.join(directory(job.id), 'worker.lock'))) return job;
    const release = acquireLease(path.join(directory(job.id), 'worker.lock'));
    if (!release) return job;
    try {
      job = load(job.id);
      if (job.status !== 'running') return job;
      for (const current of job.batches.filter(batch => batch.status === 'generating')) {
        if (fs.existsSync(batchFile(job.id, current.number, 'master.wav'))) current.status = 'ready';
        else {
          current.status = 'generation_failed';
          current.error = 'Server stopped before a master was checkpointed. This group will not be generated again automatically.';
        }
      }
      if (job.pipeline) { job.pipeline.generationState = 'paused'; job.pipeline.analysisState = 'paused'; job.pipeline.generatingGroup = null; job.pipeline.analyzingGroup = null; }
      job.status = 'paused';
      job.message = 'Recovered after server restart. Resume keeps saved clips and reuses checkpointed masters.';
      save(job);
      return job;
    } finally { release(); }
  }
  return { root, directory, batchFile, save, load, list, reserve, recover,
    lock: id => acquireLease(path.join(directory(id), 'worker.lock')),
    pause: (id, value) => atomicJson(path.join(directory(id), 'control.json'), { pause: value }),
    pauseRequested: id => readJson(path.join(directory(id), 'control.json'), {}).pause === true };
}
