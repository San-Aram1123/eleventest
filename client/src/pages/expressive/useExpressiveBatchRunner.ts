import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ExpressiveFamily, 
  AutomatedBatchState, 
  ExpressiveLanguage 
} from './expressiveFamilyTypes';
import { 
  PilotSpeaker, 
  MatrixCondition, 
  ExpressiveTake 
} from './expressiveConstants';
import { MixedCondition } from './expressiveMixedConstants';
import {
  loadStoredExpressiveBatch,
  saveStoredExpressiveBatch,
  clearStoredExpressiveBatch,
  StoredExpressiveBatch
} from './expressiveBatchStorage';
import { runSlicedLoop, runIndividualLoop, BatchLoopContext } from './expressiveBatchExecutors';
import { abortBatchOnServer } from './expressiveBatchApi';

export type BatchExecutionMode = 'sliced' | 'individual';

interface BatchRunnerParams {
  sentences: string[];
  conditions: (MatrixCondition | MixedCondition)[];
  language: ExpressiveLanguage;
  selectedSpeaker: PilotSpeaker;
  autoRotateSpeakers: boolean;
  startIdx?: number;
  batchMode?: BatchExecutionMode;
  chunkSize?: number;
  onFamilyCompleted?: (family: ExpressiveFamily) => void;
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useExpressiveBatchRunner(params: BatchRunnerParams) {
  const {
    sentences, conditions, language, selectedSpeaker, autoRotateSpeakers,
    startIdx = 1, batchMode = 'sliced', chunkSize = 6, onFamilyCompleted, addToast
  } = params;

  const [batchState, setBatchState] = useState<AutomatedBatchState>({
    isActive: false, isPaused: false, currentFamilyId: '', currentSentenceIdx: 0,
    totalSentences: 0, currentConditionLabel: '', completedClips: 0, totalClips: 0, errors: []
  });

  const [families, setFamilies] = useState<ExpressiveFamily[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const completedTasksRef = useRef<Set<string>>(new Set());
  const familiesRef = useRef<ExpressiveFamily[]>([]);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializedRef = useRef(false);

  const totalClipsToGenerate = sentences.length * conditions.length;

  const persistProgress = useCallback((extra?: Partial<StoredExpressiveBatch>) => {
    if (!isRunningRef.current) return;
    saveStoredExpressiveBatch({
      isActive: isRunningRef.current,
      isPaused: isPausedRef.current,
      sentences,
      conditionIds: conditions.map(c => c.id),
      language,
      selectedSpeakerId: selectedSpeaker.id,
      autoRotateSpeakers,
      startIdx,
      batchMode,
      chunkSize,
      completedTaskKeys: Array.from(completedTasksRef.current),
      families: familiesRef.current,
      completedClips: batchState.completedClips,
      totalClips: totalClipsToGenerate,
      startTime,
      ...extra
    });
  }, [sentences, conditions, language, selectedSpeaker, autoRotateSpeakers, startIdx, batchMode, chunkSize, batchState.completedClips, totalClipsToGenerate, startTime]);

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setBatchState(prev => ({ ...prev, isPaused: isPausedRef.current }));
    persistProgress({ isPaused: isPausedRef.current });
  };

  const stopBatch = () => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    completedTasksRef.current.clear();
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortBatchOnServer();
    clearStoredExpressiveBatch();
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
  };

  const upsertTake = (take: ExpressiveTake, sIdx: number, spk: PilotSpeaker) => {
    setFamilies(prev => {
      const idx = prev.findIndex(f => f.familyId === take.scriptId);
      let updated: ExpressiveFamily[];
      if (idx >= 0) {
        updated = [...prev];
        const existing = updated[idx].takes.filter(t => t.conditionId !== take.conditionId);
        updated[idx] = { ...updated[idx], takes: [...existing, take] };
      } else {
        updated = [
          ...prev,
          {
            familyId: take.scriptId,
            sentenceIndex: sIdx,
            transcript: take.transcript,
            language,
            speaker: spk,
            takes: [take],
            createdAt: Date.now()
          }
        ];
      }
      familiesRef.current = updated;
      return updated;
    });
  };

  const startBatch = async (isResume = false) => {
    if (!sentences.length || !conditions.length) {
      addToast?.({ type: 'error', title: 'Invalid Batch', message: 'Provide sentences and select conditions.' });
      return;
    }

    isRunningRef.current = true;
    isPausedRef.current = false;
    abortControllerRef.current = new AbortController();

    if (!isResume) {
      completedTasksRef.current.clear();
      setStartTime(Date.now());
      setBatchState({
        isActive: true, isPaused: false, currentFamilyId: '', currentSentenceIdx: 0,
        totalSentences: sentences.length, currentConditionLabel: '', completedClips: 0,
        totalClips: totalClipsToGenerate, errors: []
      });
      persistProgress({ completedClips: 0, startTime: Date.now(), isActive: true, isPaused: false });
    } else {
      setBatchState(prev => ({ ...prev, isActive: true, isPaused: false }));
      persistProgress({ isActive: true, isPaused: false });
    }

    const loopCtx: BatchLoopContext = {
      sentences,
      conditions,
      language,
      selectedSpeaker,
      autoRotateSpeakers,
      startIdx,
      chunkSize,
      isPaused: () => isPausedRef.current,
      isRunning: () => isRunningRef.current,
      isTaskCompleted: (key: string) => completedTasksRef.current.has(key),
      signal: abortControllerRef.current?.signal,
      onTake: upsertTake,
      onStepProgress: (taskKey, addedClips, famId, sentenceIdx, condLabel) => {
        if (!isRunningRef.current) return;
        completedTasksRef.current.add(taskKey);
        setBatchState(prev => {
          if (!isRunningRef.current) return prev;
          const nextCount = prev.completedClips + addedClips;
          persistProgress({ completedClips: nextCount });
          return {
            ...prev,
            currentFamilyId: famId,
            currentSentenceIdx: sentenceIdx,
            currentConditionLabel: condLabel,
            completedClips: nextCount
          };
        });
      },
      onError: (msg) => {
        setBatchState(prev => ({ ...prev, errors: [...prev.errors.slice(-4), msg] }));
      }
    };

    if (batchMode === 'sliced') await runSlicedLoop(loopCtx);
    else await runIndividualLoop(loopCtx);

    const wasRunning = isRunningRef.current;
    isRunningRef.current = false;
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));

    if (wasRunning) {
      clearStoredExpressiveBatch();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
      addToast?.({ type: 'success', title: 'Batch Completed', message: `Processed ${sentences.length} families.` });
    }
  };

  // Prevent accidental page loss while batch is actively running
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunningRef.current) {
        e.preventDefault();
        e.returnValue = 'Batch generation is in progress. Reloading will pause briefly and resume.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Auto-resume recovered batch when page reloads or build finishes
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const stored = loadStoredExpressiveBatch();
    if (stored && stored.isActive && stored.sentences?.length && !isRunningRef.current) {
      completedTasksRef.current = new Set(stored.completedTaskKeys || []);
      if (stored.families?.length) {
        setFamilies(stored.families);
        familiesRef.current = stored.families;
      }
      if (stored.startTime) setStartTime(stored.startTime);

      isPausedRef.current = true;
      setBatchState({
        isActive: true,
        isPaused: true,
        currentFamilyId: '',
        currentSentenceIdx: 0,
        totalSentences: stored.sentences.length,
        currentConditionLabel: '',
        completedClips: stored.completedClips || 0,
        totalClips: stored.totalClips || (stored.sentences.length * conditions.length),
        errors: []
      });

      addToast?.({
        type: 'info',
        title: 'Previous Batch Recovered (Paused)',
        message: `Recovered ${stored.completedClips}/${stored.totalClips || totalClipsToGenerate} completed clips. Click Resume to continue, or Stop to discard.`
      });
    }
  }, []);

  return {
    batchState,
    families,
    setFamilies,
    startTime,
    totalClipsToGenerate,
    startBatch,
    togglePause,
    stopBatch
  };
}

