import { useState, useRef } from 'react';
import { MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from './pairedConstants';
import { BatchEngineParams, FailedBatchTask } from './engine/types';
import { useBatchProgressTracker } from './engine/useBatchProgressTracker';
import { useBatchErrorManager } from './engine/useBatchErrorManager';
import { useBatchDatasetScanner } from './engine/useBatchDatasetScanner';
import { executeRetryTask } from './engine/batchTakeRunner';
import { runSlicedBatchLoop, runIndividualBatchLoop } from './engine/batchLoopRunner';

export type { FailedBatchTask, BatchEngineParams };

export function usePairedBatchEngine(params: BatchEngineParams) {
  const {
    sentences, enabledEmotionsList, startIdx, speakerId, voiceName,
    language, mode, model, chunkSize = 3, slicingStrategy = 'silence',
    randomizeVoices, onSampleCreated, addToast
  } = params;

  const totalClips = sentences.length * enabledEmotionsList.length;
  const progress = useBatchProgressTracker();
  const errors = useBatchErrorManager();

  const [currentSpeakerInfo, setCurrentSpeakerInfo] = useState({ speaker: 'spk01', voice: 'Arlo' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const sessionStartIdxRef = useRef<number>(startIdx);

  const { completedTaskKeysRef } = useBatchDatasetScanner({
    isActive: progress.batchState.isActive,
    sentences, enabledEmotionsList, startIdx, speakerId, chunkSize, randomizeVoices,
    onFoundExistingClips: (found, total, sIdx) => {
      sessionStartIdxRef.current = startIdx;
      progress.initSessionProgress(found, total, sIdx);
    }
  });

  const getSpeaker = (idx: number) => {
    if (!randomizeVoices) return { id: speakerId, voice: voiceName };
    const pool = (idx % 2 === 0) ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
    const picked = pool[Math.floor(idx / 2) % pool.length];
    return { id: picked.id, voice: picked.voice };
  };

  const waitIfPaused = async () => {
    while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
      await new Promise(r => setTimeout(r, 400));
    }
  };

  const handleTakeResult = (key: string, famId: string, em: string, samples: any[], task: FailedBatchTask) => {
    if (samples.length > 0) {
      samples.forEach(s => onSampleCreated(s));
      progress.addCompletedClips(samples.length);
      completedTaskKeysRef.current.add(key);
      errors.recordTaskSuccess(key, famId, em);
    } else {
      errors.recordFailedTask(task);
    }
  };

  const runBatchLoop = async ({ isResume = false }: { isResume?: boolean } = {}) => {
    if (isRunningRef.current) return;
    if (!sentences.length || !enabledEmotionsList.length) {
      return addToast({ type: 'error', title: 'Batch Error', message: 'Sentences and emotions are required.' });
    }
    isRunningRef.current = true;
    abortControllerRef.current = new AbortController();
    isPausedRef.current = false;
    if (!isResume) {
      completedTaskKeysRef.current.clear();
      errors.resetForFreshRun();
      sessionStartIdxRef.current = startIdx;
    }
    progress.startTracking({ isResume, totalSentences: sentences.length, totalEmotions: enabledEmotionsList.length, totalClips, mode });

    try {
      if (mode === 'sliced') {
        await runSlicedBatchLoop({
          sentences, enabledEmotionsList, chunkSize, sessionStartIdx: sessionStartIdxRef.current,
          model, language, slicingStrategy, signal: abortControllerRef.current.signal,
          getSpeaker, waitIfPaused, updateCurrentTarget: progress.updateCurrentTarget,
          isTaskCompleted: k => completedTaskKeysRef.current.has(k),
          onTakeResult: handleTakeResult,
          onSpeakerChanged: setCurrentSpeakerInfo
        });
      } else {
        await runIndividualBatchLoop({
          sentences, enabledEmotionsList, sessionStartIdx: sessionStartIdxRef.current,
          model, language, signal: abortControllerRef.current.signal,
          getSpeaker, waitIfPaused, updateCurrentTarget: progress.updateCurrentTarget,
          isTaskCompleted: k => completedTaskKeysRef.current.has(k),
          onTakeResult: handleTakeResult,
          onSpeakerChanged: setCurrentSpeakerInfo
        });
      }
      progress.finishTracking({ totalClips, isAborted: !!abortControllerRef.current?.signal.aborted, addToast });
    } finally {
      isRunningRef.current = false;
    }
  };

  const handleRetryFailed = async () => {
    if (isRunningRef.current) return;
    const tasks = Array.from(errors.failedTasksMapRef.current.values());
    if (!tasks.length) return addToast({ type: 'info', title: 'No failed clips to retry' });

    isRunningRef.current = true;
    abortControllerRef.current = new AbortController();
    progress.setBatchState(p => ({ ...p, isActive: true, isPaused: false }));

    try {
      for (const task of tasks) {
        await waitIfPaused();
        if (abortControllerRef.current?.signal.aborted) break;
        progress.updateCurrentTarget({ sentenceIdx: 1, emotionIdx: 1, familyId: task.familyId, emotion: task.emotion });
        const res = await executeRetryTask({ task, language, model, slicingStrategy, signal: abortControllerRef.current.signal });
        task.error = res.error || task.error;
        handleTakeResult(task.id, task.familyId, task.emotion, res.samples, task);
      }
    } finally {
      isRunningRef.current = false;
      progress.setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
    }
  };

  return {
    batchState: progress.batchState,
    currentSpeakerInfo,
    stopReason: progress.stopReason,
    errorList: errors.errorList,
    startTime: progress.startTime,
    totalClips,
    canResume: !progress.batchState.isActive && (progress.batchState.completedClips > 0 || errors.failedTasks.length > 0) && (progress.batchState.completedClips < totalClips),
    failedCount: errors.failedTasks.length,
    failedTasks: errors.failedTasks,
    handleStartBatch: () => runBatchLoop({ isResume: false }),
    handleResumeBatch: () => runBatchLoop({ isResume: true }),
    handleRetryFailed,
    handleStop: () => {
      abortControllerRef.current?.abort();
      isRunningRef.current = false;
      progress.setStopReason('Stopped by user');
      progress.setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
      addToast({ type: 'info', title: 'Batch stopped' });
    },
    togglePause: () => {
      isPausedRef.current = !isPausedRef.current;
      progress.setBatchState(p => ({ ...p, isPaused: isPausedRef.current }));
    },
    clearErrors: errors.clearErrors
  };
}
