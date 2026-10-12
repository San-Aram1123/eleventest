import { useState, useRef, useCallback, useEffect } from 'react';
import { Sample } from '../../types';
import { 
  executeContextSwitchingSlicedBatch, 
  abortContextSwitchingBatchOnServer 
} from '../../services/contextSwitchingApi';

export interface ContextBatchState {
  isActive: boolean;
  isPaused: boolean;
  currentChunkIdx: number;
  totalChunks: number;
  completedParagraphs: number;
  totalParagraphs: number;
  startTime: number | null;
  elapsedSeconds: number;
  errors: string[];
}

interface UseContextBatchRunnerProps {
  paragraphs: string[];
  voiceName: string;
  startIdx: number;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useContextBatchRunner({
  paragraphs,
  voiceName,
  startIdx,
  onSampleCreated,
  addToast
}: UseContextBatchRunnerProps) {
  const [batchState, setBatchState] = useState<ContextBatchState>({
    isActive: false,
    isPaused: false,
    currentChunkIdx: 0,
    totalChunks: 0,
    completedParagraphs: 0,
    totalParagraphs: 0,
    startTime: null,
    elapsedSeconds: 0,
    errors: []
  });

  const [samples, setSamples] = useState<Sample[]>([]);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Unmount cleanup to prevent memory leaks and orphaned intervals
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const chunkSize = 6;
  const totalChunks = Math.ceil(paragraphs.length / chunkSize);

  const startBatch = async () => {
    if (paragraphs.length === 0) {
      addToast({ type: 'error', title: 'No paragraphs to generate' });
      return;
    }

    isRunningRef.current = true;
    isPausedRef.current = false;
    abortControllerRef.current = new AbortController();

    const startTime = Date.now();
    setBatchState({
      isActive: true,
      isPaused: false,
      currentChunkIdx: 0,
      totalChunks,
      completedParagraphs: 0,
      totalParagraphs: paragraphs.length,
      startTime,
      elapsedSeconds: 0,
      errors: []
    });
    setSamples([]);
    setMasterAudioUrl(null);

    // Start elapsed timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setBatchState(prev => ({
        ...prev,
        elapsedSeconds: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    let completedCount = 0;
    const newErrors: string[] = [];

    for (let c = 0; c < totalChunks; c++) {
      if (!isRunningRef.current || abortControllerRef.current?.signal.aborted) break;

      // Handle pause
      while (isPausedRef.current && isRunningRef.current && !abortControllerRef.current?.signal.aborted) {
        await new Promise(r => setTimeout(r, 300));
      }

      if (!isRunningRef.current || abortControllerRef.current?.signal.aborted) break;

      const chunkStart = c * chunkSize;
      const chunkParagraphs = paragraphs.slice(chunkStart, chunkStart + chunkSize);
      const chunkStartIdx = startIdx + chunkStart;

      setBatchState(prev => ({ ...prev, currentChunkIdx: c + 1 }));

      try {
        const res = await executeContextSwitchingSlicedBatch({
          paragraphs: chunkParagraphs,
          startIdx: chunkStartIdx,
          voiceName,
          signal: abortControllerRef.current.signal
        });

        if (res.samples && res.samples.length > 0) {
          completedCount += res.samples.length;
          setSamples(prev => [...res.samples, ...prev]);
          if (res.masterAudioUrl) setMasterAudioUrl(res.masterAudioUrl);
          res.samples.forEach(s => onSampleCreated(s));
          setBatchState(prev => ({ ...prev, completedParagraphs: completedCount }));
        }
      } catch (err: any) {
        if (!isRunningRef.current || abortControllerRef.current?.signal.aborted) {
          console.log('[Context Batch] Aborted cleanly.');
          break;
        }
        const msg = `Batch #${c + 1} (Paragraphs ${chunkStart + 1}-${chunkStart + chunkParagraphs.length}): ${err.message}`;
        console.error('[Context Batch Error]', msg);
        newErrors.push(msg);
        setBatchState(prev => ({ ...prev, errors: [...newErrors] }));
      }

      if (!isRunningRef.current || abortControllerRef.current?.signal.aborted) break;
      await new Promise(r => setTimeout(r, 200));
    }

    if (timerRef.current) clearInterval(timerRef.current);
    isRunningRef.current = false;
    isPausedRef.current = false;

    setBatchState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false
    }));

    if (!abortControllerRef.current?.signal.aborted) {
      addToast({
        type: completedCount > 0 ? 'success' : 'error',
        title: 'Batch Generation Finished',
        message: `Saved ${completedCount}/${paragraphs.length} paragraphs to dataset.`
      });
    }
  };

  const togglePause = useCallback(() => {
    isPausedRef.current = !isPausedRef.current;
    setBatchState(prev => ({ ...prev, isPaused: isPausedRef.current }));
  }, []);

  const stopBatch = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortContextSwitchingBatchOnServer();
    if (timerRef.current) clearInterval(timerRef.current);
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
    addToast({ type: 'info', title: 'Batch stopped' });
  }, [addToast]);

  return {
    batchState,
    samples,
    masterAudioUrl,
    startBatch,
    togglePause,
    stopBatch
  };
}

