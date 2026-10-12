import { useState, useRef, useEffect } from 'react';
import { Sample } from '../../types';
import {
  executeContextLabBatch,
  abortContextSwitchingBatchOnServer,
  saveLabClipsToDataset,
  LabClip,
  BoundaryComparison,
  DetectionEngineType
} from '../../services/contextSwitchingApi';
import { ContextBatchState } from './useContextBatchRunner';

interface UseContextLabRunnerProps {
  paragraphs: string[];
  startIdx: number;
  detectionEngine: DetectionEngineType;
  speaker1Voice: string;
  speaker2Voice: string;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useContextLabRunner({
  paragraphs,
  startIdx,
  detectionEngine,
  speaker1Voice,
  speaker2Voice,
  onSampleCreated,
  addToast
}: UseContextLabRunnerProps) {
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

  const [pyannoteClips, setPyannoteClips] = useState<LabClip[]>([]);
  const [triHybridClips, setTriHybridClips] = useState<LabClip[]>([]);
  const [singleClips, setSingleClips] = useState<LabClip[]>([]);
  const [comparisonTable, setComparisonTable] = useState<BoundaryComparison[]>([]);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      addToast({ type: 'error', title: 'No lines to generate' });
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

    setPyannoteClips([]);
    setTriHybridClips([]);
    setSingleClips([]);
    setComparisonTable([]);
    setMasterAudioUrl(null);

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

      while (isPausedRef.current && isRunningRef.current && !abortControllerRef.current?.signal.aborted) {
        await new Promise(r => setTimeout(r, 300));
      }

      if (!isRunningRef.current || abortControllerRef.current?.signal.aborted) break;

      setBatchState(prev => ({ ...prev, currentChunkIdx: c + 1 }));

      const chunkParagraphs = paragraphs.slice(c * chunkSize, (c + 1) * chunkSize);
      const chunkStartIdx = startIdx + (c * chunkSize);

      try {
        const result = await executeContextLabBatch({
          paragraphs: chunkParagraphs,
          startIdx: chunkStartIdx,
          speaker1Voice,
          speaker2Voice,
          detectionEngine,
          signal: abortControllerRef.current.signal
        });

        if (result.success) {
          if (Array.isArray(result.pyannoteClips)) setPyannoteClips(prev => [...prev, ...result.pyannoteClips!]);
          if (Array.isArray(result.triHybridClips)) setTriHybridClips(prev => [...prev, ...result.triHybridClips!]);
          if (Array.isArray(result.clips)) setSingleClips(prev => [...prev, ...result.clips!]);
          if (Array.isArray(result.comparisonTable)) setComparisonTable(result.comparisonTable);
          if (result.masterAudioUrl) setMasterAudioUrl(result.masterAudioUrl);

          completedCount += chunkParagraphs.length;
          setBatchState(prev => ({ ...prev, completedParagraphs: completedCount }));
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || abortControllerRef.current?.signal.aborted) break;
        const msg = `Batch ${c + 1}/${totalChunks} failed: ${err.message || 'Unknown Slicing Error'}`;
        console.error('[Context Lab Runner]', msg);
        newErrors.push(msg);
        setBatchState(prev => ({ ...prev, errors: [...newErrors] }));
        addToast({ type: 'error', title: `Batch ${c + 1} Error`, message: err.message });
      }

      if (c < totalChunks - 1 && isRunningRef.current) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isRunningRef.current = false;

    setBatchState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false
    }));

    if (completedCount > 0) {
      addToast({
        type: 'success',
        title: 'Slicing Complete',
        message: `Successfully processed ${completedCount} clips with ${detectionEngine} engine!`
      });
    }
  };

  const handleSaveToDataset = async (engineKey: string) => {
    let clipsToSave: LabClip[] = [];
    if (engineKey === 'pyannote') clipsToSave = pyannoteClips;
    else if (engineKey === 'tri_hybrid') clipsToSave = triHybridClips;
    else clipsToSave = singleClips.length > 0 ? singleClips : pyannoteClips;

    if (clipsToSave.length === 0) return;

    setIsSaving(true);
    try {
      const res = await saveLabClipsToDataset({
        clips: clipsToSave,
        startIdx
      });
      if (res.success && Array.isArray(res.samples)) {
        for (const s of res.samples) onSampleCreated(s);
        addToast({
          type: 'success',
          title: 'Saved to Dataset',
          message: `Saved ${res.count} clips (${engineKey}) to your dataset!`
        });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to Save', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setBatchState(prev => ({ ...prev, isPaused: isPausedRef.current }));
  };

  const stopBatch = () => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    abortContextSwitchingBatchOnServer();
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
    addToast({ type: 'info', title: 'Batch stopped by user' });
  };

  return {
    batchState,
    pyannoteClips,
    triHybridClips,
    singleClips,
    comparisonTable,
    masterAudioUrl,
    isSaving,
    handleSaveToDataset,
    startBatch,
    togglePause,
    stopBatch
  };
}
