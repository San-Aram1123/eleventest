import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { generateContextLabMaster, validateLabOptions } from '../contextLabService.js';
import { buildContextLabBatchPrompt } from '../contextLabPrompt.js';
import { checkLocalSpeakerModels } from '../alignment/localSpeakerBridge.js';
import { getGeminiKeyPool } from '../geminiService.js';
import { acquireLease } from './fileStore.js';
import { createJobStore } from './jobStore.js';
import { saveAutoClips } from './saveClips.js';
import { processAutoJob } from './worker.js';
import { logAutoProgress } from './progressLog.js';
import { analyzeAutoMaster } from './localAnalysis.js';

async function checkAutoReady({ localOnly = false } = {}) {
  if (!localOnly && !getGeminiKeyPool().length) throw new Error('Enable at least one Gemini project key before starting automation.');
  return checkLocalSpeakerModels();
}

function configuration(params) {
  if (!Array.isArray(params.paragraphs) || !params.paragraphs.length || params.paragraphs.length > 3000 ||
      params.paragraphs.some(text => typeof text !== 'string' || !text.trim()) || params.paragraphs.join('').length > 1000000) {
    throw new Error('Provide 1–3000 nonempty paragraphs, up to one million characters.');
  }
  const model = params.model || 'gemini-3.8-flash-tts';
  if (!['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview'].includes(model)) throw new Error('Select a supported exact TTS model.');
  const paragraphs = [];
  let voices;
  for (let offset = 0; offset < params.paragraphs.length; offset += 6) {
    voices = buildContextLabBatchPrompt(params.paragraphs.slice(offset, offset + 6), params);
    // Keep the pasted UTF-8 text for dataset metadata; the shared prompt builder
    // applies its existing synthesis normalization only when making a request.
    paragraphs.push(...params.paragraphs.slice(offset, offset + 6).map(text => text.trim()));
  }
  const options = validateLabOptions(params.options, 6);
  delete options.expectedBoundaries;
  return { paragraphs, config: { model, dialect: params.dialect === 'badini' ? 'badini' : 'sorani',
    speaker1Voice: voices.cleanSpk1, speaker2Voice: voices.cleanSpk2, options } };
}

export function createAutoJobManager({ store = createJobStore(), generate = generateContextLabMaster,
  analyze = analyzeAutoMaster, saveClips = saveAutoClips, preflight = checkAutoReady,
  autoStart = true } = {}) {
  let pumping = false;
  function snapshot(job) {
    const savedCount = job.batches.reduce((sum, batch) => sum + (batch.saved?.length || 0), 0);
    return { ...job, savedCount, totalParagraphs: job.paragraphs.length,
      generatedGroups: job.batches.filter(batch => fs.existsSync(store.batchFile(job.id, batch.number, 'master.wav'))).length,
      completedGroups: job.batches.filter(batch => ['saved', 'rejected', 'generation_failed'].includes(batch.status)).length,
      pauseRequested: store.pauseRequested(job.id), batches: job.batches.map(batch => ({ ...batch,
        masterUrl: fs.existsSync(store.batchFile(job.id, batch.number, 'master.wav')) ?
          `/api/context-auto/jobs/${job.id}/batches/${batch.number}/master` : null,
        diagnosticsUrl: fs.existsSync(store.batchFile(job.id, batch.number, 'analysis.json')) ?
          `/api/context-auto/jobs/${job.id}/batches/${batch.number}/diagnostics` : null })) };
  }
  async function pump() {
    if (pumping) return;
    pumping = true;
    const releaseRunner = acquireLease(path.join(store.root, 'runner.lock'));
    if (!releaseRunner) { pumping = false; return; }
    try {
      while (true) {
        const next = store.list().reverse().find(job => job.status === 'queued');
        if (!next) break;
        const releaseJob = store.lock(next.id);
        if (!releaseJob) break;
        try {
          await preflight({ localOnly: next.retryAnalysisOnly === true });
          await processAutoJob(store.load(next.id), { store, generate, analyze, saveClips });
        }
        catch (error) {
          const current = store.load(next.id);
          current.status = 'paused'; current.message = `Worker stopped: ${error.message}`; store.save(current);
          logAutoProgress(current, current.message, null, store.root);
        } finally { releaseJob(); }
      }
    } finally { releaseRunner(); pumping = false; }
  }
  const schedule = () => { if (autoStart) setImmediate(() => void pump().catch(error => console.error('[Context Auto]', error.message))); };
  async function create(params) {
    const prepared = configuration(params);
    const fingerprint = createHash('sha256').update(JSON.stringify(prepared)).digest('hex');
    store.directory(params.id); // Validate before any side effects.
    let existing;
    try { existing = store.load(params.id); } catch (error) { if (!/not found/.test(error.message)) throw error; }
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new Error('This request ID belongs to different text or settings.');
      schedule(); return snapshot(store.recover(existing));
    }
    await preflight(); // Missing local models must fail before spending synthesis quota.
    const release = store.lock(params.id);
    if (!release) throw new Error('This job is already being created. Reconnect to it.');
    try {
      try { existing = store.load(params.id); } catch (error) { if (!/not found/.test(error.message)) throw error; }
      if (existing) {
        if (existing.fingerprint !== fingerprint) throw new Error('Request ID conflict.');
        return snapshot(existing);
      }
      const firstIndex = store.reserve(prepared.paragraphs.length);
      const batches = [];
      for (let offset = 0; offset < prepared.paragraphs.length; offset += 6) batches.push({
        number: batches.length, offset, startIndex: firstIndex + offset,
        paragraphs: prepared.paragraphs.slice(offset, offset + 6), status: 'pending', saved: []
      });
      const job = { id: params.id, fingerprint, ...prepared, firstIndex, batches, status: 'queued',
        createdAt: new Date().toISOString(), message: 'Queued. Indices reserved; waiting for the background worker.' };
      store.save(job);
      logAutoProgress(job, `Queued ${job.paragraphs.length} paragraphs; dataset indices ${job.firstIndex}-${job.firstIndex + job.paragraphs.length - 1}.`, null, store.root);
      schedule(); return snapshot(job);
    } finally { release(); }
  }
  function get(id) { const job = store.recover(store.load(id)); schedule(); return snapshot(job); }
  function list() { schedule(); return store.list().map(job => snapshot(store.recover(job))); }
  function action(id, command) {
    store.load(id);
    if (command === 'pause') { store.pause(id, true); return get(id); }
    if (!['resume', 'retry-analysis'].includes(command)) throw new Error('Unknown automation action.');
    const release = store.lock(id);
    if (!release) throw new Error('This job is still working. Pause waits until the current group finishes.');
    try {
      const job = store.load(id);
      job.retryAnalysisOnly = command === 'retry-analysis';
      if (command === 'retry-analysis') {
        for (const batch of job.batches) {
          if (batch.status === 'rejected' && fs.existsSync(store.batchFile(id, batch.number, 'master.wav'))) {
            batch.status = 'pending'; batch.error = null;
          }
        }
      }
      store.pause(id, false); job.status = 'queued'; job.finishedAt = null; store.save(job); schedule(); return snapshot(job);
    } finally { release(); }
  }
  if (autoStart) {
    for (const job of store.list()) store.recover(job);
    schedule();
    // Also pick up jobs submitted to another server while its runner was busy.
    const timer = setInterval(() => {
      try {
        const jobs = store.list().map(job => store.recover(job));
        if (jobs.some(job => job.status === 'queued')) schedule();
      } catch (error) { console.error('[Context Auto] Recovery:', error.message); }
    }, 5000);
    timer.unref();
  }
  return { create, get, list, action, pump, store };
}
