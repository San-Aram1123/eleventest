import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PairedBatchState } from '../types';

export function useBatchProgressTracker() {
  const [batchState, setBatchState] = useState<PairedBatchState>({
    isActive: false, isPaused: false, currentSentenceIdx: 0,
    totalSentences: 0, currentEmotionIdx: 0, totalEmotionsPerSentence: 0,
    currentFamilyId: '', currentEmotion: '', completedClips: 0,
    totalClipsToGenerate: 0, errors: []
  });

  const [stopReason, setStopReason] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const completedClipsRef = useRef<number>(0);

  const initSessionProgress = (found: number, totalClips: number, sentenceIdx: number) => {
    completedClipsRef.current = found;
    setBatchState(p => ({
      ...p,
      completedClips: found,
      totalClipsToGenerate: totalClips,
      currentSentenceIdx: sentenceIdx
    }));
  };

  const startTracking = (params: {
    isResume: boolean;
    totalSentences: number;
    totalEmotions: number;
    totalClips: number;
    mode: 'sliced' | 'individual';
  }) => {
    const { isResume, totalSentences, totalEmotions, totalClips, mode } = params;
    const initialCompleted = isResume ? completedClipsRef.current : 0;
    if (!isResume) {
      completedClipsRef.current = 0;
      setStartTime(Date.now());
    } else if (!startTime) {
      setStartTime(Date.now());
    }
    setStopReason(null);
    setBatchState(p => ({
      ...p,
      isActive: true,
      isPaused: false,
      currentSentenceIdx: isResume ? p.currentSentenceIdx : 0,
      totalSentences,
      currentEmotionIdx: isResume ? p.currentEmotionIdx : 0,
      totalEmotionsPerSentence: totalEmotions,
      currentFamilyId: isResume ? p.currentFamilyId : '',
      currentEmotion: isResume ? p.currentEmotion : '',
      completedClips: initialCompleted,
      totalClipsToGenerate: totalClips,
      mode,
      errors: p.errors || []
    }));
    return initialCompleted;
  };

  const updateCurrentTarget = (info: {
    sentenceIdx: number;
    emotionIdx: number;
    familyId: string;
    emotion: string;
  }) => {
    setBatchState(p => ({
      ...p,
      currentSentenceIdx: info.sentenceIdx,
      currentEmotionIdx: info.emotionIdx,
      currentFamilyId: info.familyId,
      currentEmotion: info.emotion
    }));
  };

  const addCompletedClips = (count: number) => {
    completedClipsRef.current += count;
    setBatchState(p => ({ ...p, completedClips: completedClipsRef.current }));
  };

  const finishTracking = (params: {
    totalClips: number;
    isAborted: boolean;
    addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  }) => {
    const { totalClips, isAborted, addToast } = params;
    const completed = completedClipsRef.current;
    if (isAborted) {
      setStopReason('Stopped by user');
    } else if (completed === totalClips && totalClips > 0) {
      setStopReason('Completed successfully');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      addToast({ type: 'success', title: 'Batch Finished!', message: `${completed} clips saved.` });
    } else if (completed < totalClips) {
      const remaining = totalClips - completed;
      setStopReason(`Finished with missing clips (${completed}/${totalClips} synthesized)`);
      addToast({
        type: 'error',
        title: 'Batch Incomplete',
        message: `${remaining} clip(s) failed or were skipped. Click "Resume" or "Retry Failed" to continue.`
      });
    }
    setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
  };

  return {
    batchState,
    setBatchState,
    stopReason,
    setStopReason,
    startTime,
    setStartTime,
    completedClipsRef,
    initSessionProgress,
    startTracking,
    updateCurrentTarget,
    addCompletedClips,
    finishTracking
  };
}
