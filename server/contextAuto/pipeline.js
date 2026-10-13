import fs from 'node:fs';
import { atomicAudio } from './fileStore.js';
import { analyzeAutoBatch } from './analyzeBatch.js';
import { logAutoProgress as writeLog } from './progressLog.js';

export const MASTER_BACKLOG_LIMIT = 3;
const terminal = batch => ['saved', 'rejected', 'generation_failed'].includes(batch.status);

export async function processAutoJob(job, dependencies) {
  const { store, generate } = dependencies;
  const log = (message, batch) => writeLog(job, message, batch, store.root);
  const master = batch => store.batchFile(job.id, batch.number, 'master.wav');
  const hasMaster = batch => fs.existsSync(master(batch));
  let producerDone = false, stop = false, reason = '';
  let revision = 0;
  const waiters = new Set();
  const wake = () => { revision++; for (const resolve of waiters) resolve(); waiters.clear(); };
  const wait = previous => revision !== previous ? Promise.resolve() : new Promise(resolve => waiters.add(resolve));
  const ready = () => job.batches.filter(batch => !terminal(batch) && hasMaster(batch) &&
    !['analyzing', 'selecting', 'saving'].includes(batch.status));
  const update = () => { job.pipeline.waitingMasters = ready().length; store.save(job); wake(); };
  const paused = () => stop || store.pauseRequested(job.id);
  job.status = 'running';
  job.pipeline = { backlogLimit: MASTER_BACKLOG_LIMIT, waitingMasters: 0, generationState: 'starting',
    analysisState: 'starting', generatingGroup: null, analyzingGroup: null };
  job.message = 'Generation and slicing run concurrently; up to three masters wait for analysis.';
  for (const batch of job.batches) if (!terminal(batch) && hasMaster(batch) && batch.status !== 'save_failed') batch.status = 'ready';
  update(); log(`Pipeline started: ${job.paragraphs.length} paragraphs; backlog limit ${MASTER_BACKLOG_LIMIT}.`);

  async function produce() {
    try {
      if (job.retryAnalysisOnly) return;
      for (const batch of job.batches) {
        if (terminal(batch) || hasMaster(batch)) continue;
        while (!paused() && ready().length >= MASTER_BACKLOG_LIMIT) {
          job.pipeline.generationState = 'waiting_for_slicer'; update();
          await wait(revision);
        }
        if (paused()) return;
        batch.status = 'generating'; batch.startedAt = new Date().toISOString();
        job.pipeline.generatingGroup = batch.number + 1; job.pipeline.generationState = 'generating'; update();
        log(`Generating one master for ${batch.paragraphs.length} paragraphs using the enabled key pool.`, batch);
        try {
          const checkpoint = async ({ audioBuffer }) => {
            atomicAudio(master(batch), audioBuffer);
            batch.status = 'ready'; batch.generatedAt = new Date().toISOString(); update();
            log(`Master checkpointed; ${ready().length} waiting for slicing.`, batch);
          };
          const generated = await generate({ ...job.config, paragraphs: batch.paragraphs,
            detectionEngine: 'all', apiKey: '', onMasterReady: checkpoint });
          if (!hasMaster(batch) && generated?.audioBuffer) await checkpoint(generated);
          if (!hasMaster(batch)) throw new Error('Generator did not checkpoint its master audio.');
        } catch (error) {
          if (!hasMaster(batch)) { batch.status = 'generation_failed'; batch.error = error.message; }
          reason = `Generation stopped: ${error.message}. Checkpointed masters are still being saved; no group is resent automatically.`;
          log(reason, batch); job.pipeline.generationState = 'failed'; return;
        } finally { job.pipeline.generatingGroup = null; update(); }
      }
    } finally {
      producerDone = true;
      if (job.pipeline.generationState !== 'failed') job.pipeline.generationState = paused() ? 'paused' : 'done';
      update();
    }
  }

  async function consume() {
    while (!paused()) {
      const batch = ready()[0];
      if (!batch) {
        if (producerDone) break;
        job.pipeline.analysisState = 'waiting_for_master'; update();
        await wait(revision); continue;
      }
      batch.status = 'analyzing';
      job.pipeline.analyzingGroup = batch.number + 1; job.pipeline.analysisState = 'analyzing'; update();
      const outcome = await analyzeAutoBatch(job, batch, dependencies, () => {
        job.pipeline.analysisState = batch.status; update();
      });
      job.pipeline.analyzingGroup = null;
      if (outcome?.stop) { stop = true; reason = outcome.reason; }
      update();
    }
    job.pipeline.analysisState = paused() ? 'paused' : 'done'; update();
  }
  // Unexpected errors stop new generation; already-started requests still checkpoint.
  const protect = operation => operation().catch(error => { stop = true; reason = error.message; wake(); });
  await Promise.all([protect(produce), protect(consume)]);
  const unfinished = job.batches.some(batch => !terminal(batch));
  const failures = job.batches.filter(batch => ['rejected', 'generation_failed'].includes(batch.status)).length;
  const reviews = job.batches.filter(batch => batch.pendingReview).length;
  const saved = job.batches.reduce((sum, batch) => sum + (batch.saved?.length || 0), 0);
  job.retryAnalysisOnly = false;
  job.status = unfinished || reason || store.pauseRequested(job.id) ? 'paused' : failures ? 'completed_with_errors' : 'completed';
  job.message = reason || (job.status === 'paused' ? 'Paused. Checkpointed masters and saved clips are retained; resume continues from the backlog.' : 'Processing finished.');
  job.message += ` ${saved}/${job.paragraphs.length} clips saved; ${reviews} saved group(s) flagged for review.`;
  job.finishedAt = job.status === 'paused' ? null : new Date().toISOString(); update(); log(job.message);
}
