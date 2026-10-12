import { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GeminiBatchItem } from '../../../types';
import { generateGeminiSpeech, deleteSample, fetchDataset } from '../../../services/api';
import { saveStoredBatchState, clearStoredBatchState } from '../storage';
import { UseGeminiBatchRunnerOptions } from '../batch/batchTypes';
import { assignGenderVoices, assignMixGenderVoices, matchDatasetDuplicates, resolveEffectiveVoice } from '../batch/batchVoiceHelpers';

export function useGeminiBatchRunner({
  dialect, selectedVoice, selectedModel, customInstruction, voices,
  onSampleCreated, addToast, loadConfigAndPool, uploadedFileName, rawBatchInput,
  fileQueue, setFileQueue, activeFileId, autoAdvanceNextFile, fileQueueRef,
  activeFileIdRef, autoAdvanceNextFileRef, advanceToNextQueuedFile,
  initialItems, initialBatchState, initialDelayMs, initialFilter, initialVoiceMode, activeTab
}: UseGeminiBatchRunnerOptions) {
  const [batchItems, setBatchItems] = useState<GeminiBatchItem[]>(() => initialItems || []);
  const [batchState, setBatchState] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>(() => {
    if (!initialItems?.length) return 'idle';
    return initialBatchState === 'running' ? 'paused' : (initialBatchState || 'idle');
  });
  const [currentProcessingId, setCurrentProcessingId] = useState<number | null>(null);
  const [batchDelayMs, setBatchDelayMs] = useState<number>(() => initialDelayMs || 1000);
  const [batchFilter, setBatchFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>(() => initialFilter || 'all');
  const [batchVoiceMode, setBatchVoiceMode] = useState<'fixed' | 'random_female' | 'random_male' | 'mix_gender'>(() => initialVoiceMode || 'fixed');
  const [isScanningDataset, setIsScanningDataset] = useState(false);
  const [autoResumeCountdown, setAutoResumeCountdown] = useState<number | null>(null);
  const [autoResumeEnabled, setAutoResumeEnabled] = useState<boolean>(() => localStorage.getItem('gemini_auto_resume_enabled') !== 'false');
  const [autoResumeMinutes, setAutoResumeMinutes] = useState<number>(() => {
    const s = localStorage.getItem('gemini_auto_resume_minutes');
    return s ? parseInt(s, 10) : 2;
  });

  const autoResumeTimerRef = useRef<any>(null);
  const batchRunIdRef = useRef(0);
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);
  const isBatchRunningRef = useRef(false);
  const activeProcessingLineNumbersRef = useRef<Set<number>>(new Set());
  const batchItemsRef = useRef<GeminiBatchItem[]>([]);
  const startBatchExecutionRef = useRef<((itemsToRun: GeminiBatchItem[], forceRegenerate?: boolean) => Promise<void>) | null>(null);

  useEffect(() => { batchItemsRef.current = batchItems; }, [batchItems]);
  useEffect(() => () => { if (autoResumeTimerRef.current) clearInterval(autoResumeTimerRef.current); }, []);

  const clearAutoResumeTimer = () => {
    if (autoResumeTimerRef.current) { clearInterval(autoResumeTimerRef.current); autoResumeTimerRef.current = null; }
    setAutoResumeCountdown(null);
  };
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const triggerResumeBatch = useCallback(async () => {
    clearAutoResumeTimer();
    await loadConfigAndPool();
    isPausedRef.current = false;
    isStoppedRef.current = false;
    const pending = batchItemsRef.current.filter(it => it.status === 'pending' || it.status === 'failed');
    if (pending.length > 0 && startBatchExecutionRef.current) startBatchExecutionRef.current(pending);
  }, [loadConfigAndPool]);

  useEffect(() => {
    if (batchItems.length > 0 || uploadedFileName || rawBatchInput || fileQueue.length > 0) {
      saveStoredBatchState({
        version: 2, savedAt: new Date().toISOString(), activeTab, uploadedFileName, rawBatchInput, batchItems, fileQueue,
        activeFileId, autoAdvanceNextFile, batchState: batchState === 'running' ? 'paused' : batchState,
        batchDelayMs, batchFilter, dialect, selectedVoice, selectedModel, customInstruction, batchVoiceMode
      });
    }
  }, [batchItems, batchState, uploadedFileName, rawBatchInput, fileQueue, activeFileId, autoAdvanceNextFile, batchDelayMs, batchFilter, batchVoiceMode, dialect, selectedVoice, selectedModel, customInstruction, activeTab]);

  const startBatchExecution = async (itemsToRun: GeminiBatchItem[], forceRegenerate = false) => {
    startBatchExecutionRef.current = startBatchExecution;
    if (itemsToRun.length === 0) {
      addToast({ type: 'info', title: 'No Lines to Process', message: 'All lines completed or empty.' });
      return;
    }
    const currentRunId = ++batchRunIdRef.current;
    isBatchRunningRef.current = true; isPausedRef.current = false; isStoppedRef.current = false;
    setBatchState('running');
    let completedInRun = 0, failedInRun = 0;

    try {
      for (let i = 0; i < itemsToRun.length; i++) {
        if (batchRunIdRef.current !== currentRunId) return;
        const item = itemsToRun[i];
        if (isStoppedRef.current) {
          if (batchRunIdRef.current === currentRunId) { setBatchState('stopped'); setCurrentProcessingId(null); addToast({ type: 'info', title: 'Batch Stopped', message: 'Cancelled.' }); }
          return;
        }
        while (isPausedRef.current) {
          if (batchRunIdRef.current !== currentRunId) return;
          setBatchState('paused');
          await sleep(400);
          if (batchRunIdRef.current !== currentRunId || isStoppedRef.current) {
            if (isStoppedRef.current && batchRunIdRef.current === currentRunId) { setBatchState('stopped'); setCurrentProcessingId(null); }
            return;
          }
        }
        if (batchRunIdRef.current !== currentRunId) return;
        const fresh = batchItemsRef.current.find(it => it.id === item.id);
        if (fresh && fresh.status === 'completed' && !forceRegenerate) continue;
        if (activeProcessingLineNumbersRef.current.has(item.id)) continue;

        activeProcessingLineNumbersRef.current.add(item.id);
        setBatchState('running'); setCurrentProcessingId(item.id);
        setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing', error: undefined } : it));

        try {
          const effVoice = resolveEffectiveVoice(item, selectedVoice, batchVoiceMode, voices);
          const res = await generateGeminiSpeech({
            text: item.text, voiceName: effVoice, dialect, model: selectedModel,
            promptInstruction: customInstruction.trim() || undefined, saveToDataset: true, forceRegenerate: forceRegenerate || item.status === 'failed'
          });
          if (batchRunIdRef.current !== currentRunId) return;
          if (!res.sample) throw new Error('Sample creation failed');

          onSampleCreated(res.sample); completedInRun++;
          const resolvedGender = voices.find(v => v.id === effVoice)?.gender || item.voiceGender || (batchVoiceMode === 'random_female' ? 'Female' : 'Male');
          setBatchItems(prev => prev.map(it => it.id === item.id ? {
            ...it, status: 'completed', sample: res.sample, duration: res.durationSeconds, voiceName: effVoice,
            voiceGender: resolvedGender as 'Male' | 'Female', keyUsed: res.alreadyExists ? `Dataset #${res.sample?.id}` : res.usedKeyMasked, error: undefined
          } : it));
        } catch (err: any) {
          if (batchRunIdRef.current !== currentRunId) return;
          failedInRun++;
          const msg = err.message || 'Generation failed';
          setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'failed', error: msg } : it));
          if (msg.toLowerCase().includes('all') && (msg.toLowerCase().includes('exhausted') || msg.toLowerCase().includes('failed'))) {
            batchRunIdRef.current++; isStoppedRef.current = true; setBatchState('paused');
            await loadConfigAndPool();
            if (autoResumeEnabled) {
              const totalSec = autoResumeMinutes * 60; setAutoResumeCountdown(totalSec); clearAutoResumeTimer();
              let rem = totalSec;
              addToast({ type: 'info', title: `Auto-Resume (${autoResumeMinutes}m)`, message: `Rate limit hit. Waiting ${autoResumeMinutes} min.` });
              autoResumeTimerRef.current = setInterval(async () => {
                rem -= 1; setAutoResumeCountdown(rem);
                if (rem <= 0) { clearAutoResumeTimer(); addToast({ type: 'info', title: 'Auto-Resuming...', message: 'Resuming batch...' }); await triggerResumeBatch(); }
              }, 1000);
            } else {
              addToast({ type: 'error', title: 'Keys Exhausted', message: 'All keys hit limits. Click Resume when ready.' });
            }
            return;
          }
        } finally {
          activeProcessingLineNumbersRef.current.delete(item.id);
        }
        if (i < itemsToRun.length - 1 && !isStoppedRef.current && batchRunIdRef.current === currentRunId) await sleep(batchDelayMs);
      }

      if (batchRunIdRef.current !== currentRunId) return;
      setCurrentProcessingId(null);
      if (!isStoppedRef.current && !isPausedRef.current) {
        const finishedId = activeFileIdRef.current;
        setFileQueue(prev => prev.map(f => (f.id === finishedId || f.fileName === uploadedFileName) ? {
          ...f, status: 'completed', completedLines: (f.completedLines || 0) + completedInRun, failedLines: (f.failedLines || 0) + failedInRun
        } : f));
        const hasMore = fileQueueRef.current.some(f => f.status === 'queued' && f.id !== finishedId);
        if (autoAdvanceNextFileRef.current && hasMore) {
          isBatchRunningRef.current = false;
          await advanceToNextQueuedFile(finishedId, true);
        } else {
          setBatchState('completed');
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
          addToast({ type: 'success', title: 'Batch Finished!', message: `Completed: ${completedInRun}, Failed: ${failedInRun}.` });
        }
      }
    } finally {
      if (batchRunIdRef.current === currentRunId) { isBatchRunningRef.current = false; setCurrentProcessingId(null); }
    }
  };

  const handleStartBatch = () => {
    clearAutoResumeTimer();
    if (isBatchRunningRef.current || batchState === 'running') return;
    const pending = batchItems.filter(it => it.status === 'pending' || it.status === 'failed');
    if (pending.length === 0) {
      const reset = batchItems.map(it => ({ ...it, status: 'pending' as const, error: undefined }));
      setBatchItems(reset); startBatchExecution(reset); return;
    }
    startBatchExecution(pending);
  };

  const handlePauseBatch = () => { isPausedRef.current = true; setBatchState('paused'); addToast({ type: 'info', title: 'Batch Paused', message: 'Click Resume to continue.' }); };
  const handleResumeBatch = async () => { await triggerResumeBatch(); addToast({ type: 'success', title: 'Batch Resumed', message: 'Continuing...' }); };
  const handleStopBatch = () => {
    clearAutoResumeTimer(); batchRunIdRef.current++; isStoppedRef.current = true; isPausedRef.current = false;
    isBatchRunningRef.current = false; setBatchState('stopped'); setCurrentProcessingId(null);
  };

  const handleRetrySingleLine = async (item: GeminiBatchItem) => {
    if (activeProcessingLineNumbersRef.current.has(item.id)) return;
    activeProcessingLineNumbersRef.current.add(item.id);
    setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing', error: undefined } : it));
    try {
      const res = await generateGeminiSpeech({
        text: item.text, voiceName: item.voiceName || selectedVoice, dialect, model: selectedModel,
        promptInstruction: customInstruction.trim() || undefined, saveToDataset: true, forceRegenerate: true
      });
      if (res.sample) {
        onSampleCreated(res.sample);
        setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'completed', sample: res.sample, duration: res.durationSeconds, keyUsed: res.usedKeyMasked, error: undefined } : it));
        addToast({ type: 'success', title: `Line #${item.lineNumber} Generated!`, message: `Sample #${res.sample.id} created.` });
      }
    } catch (err: any) {
      setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'failed', error: err.message } : it));
      addToast({ type: 'error', title: `Line #${item.lineNumber} Failed`, message: err.message });
    } finally {
      activeProcessingLineNumbersRef.current.delete(item.id);
    }
  };

  const handleDeleteBatchSample = async (item: GeminiBatchItem) => {
    if (!item.sample?.id) return;
    try {
      await deleteSample(item.sample.id);
      setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'pending', sample: undefined, duration: undefined, keyUsed: undefined, error: undefined } : it));
      addToast({ type: 'info', title: `Sample #${item.sample.id} Deleted`, message: `Line #${item.lineNumber} reset.` });
    } catch (err: any) { addToast({ type: 'error', title: 'Delete Failed', message: err.message }); }
  };

  const handleDeleteAndRegenerate = async (item: GeminiBatchItem) => {
    if (item.sample?.id) { try { await deleteSample(item.sample.id); } catch {} }
    await handleRetrySingleLine(item);
  };

  const handleRetryFailedLines = () => {
    clearAutoResumeTimer(); batchRunIdRef.current++; isStoppedRef.current = false; isPausedRef.current = false; isBatchRunningRef.current = false;
    const failed = batchItemsRef.current.filter(it => it.status === 'failed');
    if (failed.length === 0) { addToast({ type: 'info', title: 'No Failed Lines', message: 'No failed lines.' }); return; }
    const failedIds = new Set(failed.map(it => it.id));
    const reset = batchItemsRef.current.map(it => failedIds.has(it.id) ? { ...it, status: 'pending' as const, error: undefined } : it);
    setBatchItems(reset); batchItemsRef.current = reset;
    startBatchExecution(reset.filter(it => failedIds.has(it.id)), true);
  };

  const handleScanDatasetDuplicates = async () => {
    if (batchItems.length === 0) return;
    setIsScanningDataset(true);
    try {
      const dataset = await fetchDataset();
      const { updatedItems, matchCount } = matchDatasetDuplicates(batchItems, dataset);
      setBatchItems(updatedItems);
      addToast({ type: matchCount > 0 ? 'success' : 'info', title: 'Duplicate Scan', message: matchCount > 0 ? `Matched ${matchCount} sample(s).` : 'No matches found.' });
    } catch (err: any) { addToast({ type: 'error', title: 'Scan Failed', message: err.message }); } finally { setIsScanningDataset(false); }
  };

  const handleRemoveSingleBatchItem = (id: number) => setBatchItems(prev => prev.filter(it => it.id !== id));
  const handleRemovePendingLines = () => { const c = batchItems.filter(it => it.status === 'pending').length; setBatchItems(prev => prev.filter(it => it.status !== 'pending')); addToast({ type: 'info', title: 'Removed', message: `Removed ${c} pending lines.` }); };
  const handleRemoveCompletedLines = () => { const c = batchItems.filter(it => it.status === 'completed').length; setBatchItems(prev => prev.filter(it => it.status !== 'completed')); addToast({ type: 'info', title: 'Removed', message: `Removed ${c} completed lines.` }); };
  const handleClearBatch = () => { if (batchState === 'running') handleStopBatch(); setBatchItems([]); setBatchState('idle'); setCurrentProcessingId(null); clearStoredBatchState(); };

  const handleRandomizeVoices = (gender: 'Female' | 'Male') => {
    setBatchVoiceMode(gender === 'Female' ? 'random_female' : 'random_male');
    setBatchItems(prev => assignGenderVoices(prev, voices, gender));
    addToast({ type: 'success', title: `Randomized ${gender} Voices`, message: `Assigned 100% ${gender} voices.` });
  };

  const handleRandomizeMixVoices = () => {
    setBatchVoiceMode('mix_gender');
    setBatchItems(prev => assignMixGenderVoices(prev, voices));
    addToast({ type: 'success', title: 'Mix Gender Active', message: 'Assigned 50/50 male/female voices.' });
  };

  const totalLines = batchItems.length;
  const completedLines = batchItems.filter(it => it.status === 'completed').length;
  const failedLines = batchItems.filter(it => it.status === 'failed').length;
  const pendingLines = batchItems.filter(it => it.status === 'pending').length;
  const progressPercent = totalLines > 0 ? Math.round((completedLines / totalLines) * 100) : 0;
  const filteredBatchItems = batchItems.filter(it => batchFilter === 'all' ? true : (batchFilter === 'pending' ? (it.status === 'pending' || it.status === 'processing') : it.status === batchFilter));

  return {
    batchItems, setBatchItems, batchItemsRef, batchState, setBatchState,
    currentProcessingId, setCurrentProcessingId, batchDelayMs, setBatchDelayMs,
    batchFilter, setBatchFilter, batchVoiceMode, setBatchVoiceMode, isScanningDataset,
    autoResumeEnabled, setAutoResumeEnabled, autoResumeMinutes, setAutoResumeMinutes,
    autoResumeCountdown, isBatchRunningRef, isPausedRef, isStoppedRef, startBatchExecutionRef,
    startBatchExecution, handleStartBatch, handlePauseBatch, handleResumeBatch, handleStopBatch,
    handleRetrySingleLine, handleDeleteBatchSample, handleDeleteAndRegenerate, handleRetryFailedLines,
    handleScanDatasetDuplicates, handleRemoveSingleBatchItem, handleRemovePendingLines,
    handleRemoveCompletedLines, handleClearBatch, handleRandomizeVoices, handleRandomizeMixVoices,
    totalLines, completedLines, failedLines, pendingLines, progressPercent, filteredBatchItems
  };
}
