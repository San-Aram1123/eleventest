import fs from 'node:fs';
import { atomicJson, readJson } from './fileStore.js';
import { compactAnalysis, selectBestEngine } from './selection.js';
import { logAutoProgress as writeLog } from './progressLog.js';

export async function analyzeAutoBatch(job, batch, { store, analyze, saveClips }, update) {
  const logAutoProgress = (job, message, batch) => writeLog(job, message, batch, store.root);
  const masterFile = store.batchFile(job.id, batch.number, 'master.wav');
  const selectionFile = store.batchFile(job.id, batch.number, 'selection.json');
  const analysisFile = store.batchFile(job.id, batch.number, 'analysis.json');
  let stage = 'analyzing';
  try {
    const params = { ...job.config, paragraphs: batch.paragraphs, detectionEngine: 'all' };
    let selection = readJson(selectionFile);
    if (!selection) {
      stage = 'analyzing'; batch.status = stage; update();
      logAutoProgress(job, 'Analyzing checkpointed master with all seven methods.', batch);
      const result = await analyze({ ...params, audioBuffer: fs.readFileSync(masterFile) });
      stage = 'selecting'; batch.status = stage; update();
      atomicJson(analysisFile, compactAnalysis(result));
      batch.methods = Object.entries(result.engineResults || {}).map(([engine, item]) => ({
        engine, success: item.success === true, error: item.error,
        score: item.diagnostics?.minConfidence, elapsedMs: item.diagnostics?.elapsedMs
      }));
      logAutoProgress(job, batch.methods.map(method => `${method.engine}: ${method.success ? 'accepted' : 'rejected'}`).join(' | '), batch);
      selection = selectBestEngine(result, batch.paragraphs, job.config.options);
      atomicJson(selectionFile, selection);
    }
    batch.selectedEngine = selection.engine; batch.selectionReason = selection.reason;
    batch.pendingReview = selection.pendingReview === true; batch.reviewWarnings = selection.reviewWarnings || [];
    if (batch.pendingReview) logAutoProgress(job, `Saving pending review: ${batch.reviewWarnings.join(' ')}`, batch);
    stage = 'saving'; batch.status = stage; update();
    logAutoProgress(job, `Selected ${selection.engine}; saving dataset indices ${batch.startIndex}-${batch.startIndex + batch.paragraphs.length - 1}.`, batch);
    let savedCount = 0;
    await saveClips(job, batch, selection, fs.readFileSync(masterFile), () => {
      update();
      const count = batch.saved?.length || 0;
      if (count > savedCount) {
        savedCount = count;
        logAutoProgress(job, `Dataset save ${count}/${batch.paragraphs.length}; total saved ${job.batches.reduce((sum, item) => sum + (item.saved?.length || 0), 0)}/${job.paragraphs.length}.`, batch);
      }
    });
    batch.status = 'saved'; batch.error = null; batch.finishedAt = new Date().toISOString(); update();
    logAutoProgress(job, 'Group complete.', batch);
  } catch (error) {
    batch.error = error.message;
    batch.status = stage === 'saving' ? 'save_failed' : 'rejected';
    logAutoProgress(job, `${batch.status}: ${error.message}`, batch);
    if (stage === 'saving') { update(); return { stop: true, reason: 'Saving stopped. Resume retries checkpointed saves without generating audio.' }; }

    update(); // A rejected master never causes replacement synthesis.
  }
}
