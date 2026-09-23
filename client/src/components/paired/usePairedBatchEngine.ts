import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { runFamilySlicedApi, runSingleEmotionApi } from './pairedBatchRunner';
import { MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from './pairedConstants';
import { SelectedEmotion, PairedBatchState } from './types';
import { BatchErrorItem } from './BatchErrorInspector';
import { Sample } from '../../types';

interface BatchEngineParams {
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  startIdx: number;
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  mode: 'sliced' | 'individual';
  randomizeVoices: boolean;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function usePairedBatchEngine(params: BatchEngineParams) {
  const {
    sentences, enabledEmotionsList, startIdx, speakerId, voiceName,
    language, mode, randomizeVoices, onSampleCreated, addToast
  } = params;

  const [batchState, setBatchState] = useState<PairedBatchState>({
    isActive: false, isPaused: false, currentSentenceIdx: 0,
    totalSentences: 0, currentEmotionIdx: 0, totalEmotionsPerSentence: 0,
    currentFamilyId: '', currentEmotion: '', completedClips: 0,
    totalClipsToGenerate: 0, errors: []
  });

  const [currentSpeakerInfo, setCurrentSpeakerInfo] = useState({ speaker: 'spk01', voice: 'Puck' });
  const [stopReason, setStopReason] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<BatchErrorItem[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);

  const totalClips = sentences.length * enabledEmotionsList.length;

  const handleStartBatch = async () => {
    if (isRunningRef.current || batchState.isActive) return;
    if (!sentences.length) {
      addToast({ type: 'error', title: 'No sentences provided', message: 'Enter at least one sentence.' });
      return;
    }
    if (!enabledEmotionsList.length) {
      addToast({ type: 'error', title: 'No emotions selected', message: 'Enable at least one emotion.' });
      return;
    }

    isRunningRef.current = true;
    abortControllerRef.current = new AbortController();
    isPausedRef.current = false;
    setStopReason(null);
    setErrorList([]);
    setStartTime(Date.now());
    let completed = 0;
    let consecutiveErrors = 0;

    setBatchState({
      isActive: true, isPaused: false, currentSentenceIdx: 0,
      totalSentences: sentences.length, currentEmotionIdx: 0,
      totalEmotionsPerSentence: enabledEmotionsList.length,
      currentFamilyId: '', currentEmotion: '', completedClips: 0,
      totalClipsToGenerate: totalClips, mode, errors: []
    });

    try {
      for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      if (abortControllerRef.current?.signal.aborted) break;
      const sentence = sentences[sIdx];

      let curSpeaker = speakerId;
      let curVoice = voiceName;
      if (randomizeVoices) {
        const isMale = (sIdx % 2 === 0);
        const pool = isMale ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
        const picked = pool[Math.floor(sIdx / 2) % pool.length];
        curSpeaker = picked.id;
        curVoice = picked.voice;
      }
      const familyId = `${curSpeaker}_${String(startIdx + sIdx).padStart(3, '0')}`;
      setCurrentSpeakerInfo({ speaker: curSpeaker, voice: curVoice });

      while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
        await new Promise(r => setTimeout(r, 400));
      }
      if (abortControllerRef.current?.signal.aborted) break;

      if (mode === 'sliced') {
        setBatchState(p => ({ ...p, currentSentenceIdx: sIdx + 1, currentFamilyId: familyId, currentEmotion: 'all' }));
        let sliceSuccess = false;
        let lastErrorMsg = '';

        for (let attempt = 1; attempt <= 2; attempt++) {
          if (abortControllerRef.current?.signal.aborted) break;
          try {
            const resData = await runFamilySlicedApi({
              speakerId: curSpeaker, voiceName: curVoice, language, sentence,
              sentenceIndex: startIdx + sIdx, familyId, emotions: enabledEmotionsList,
              signal: abortControllerRef.current.signal
            });
            const samples = resData.samples || [];
            if (!samples || samples.length === 0) {
              throw new Error('Server returned 0 audio samples.');
            }

            samples.forEach(s => onSampleCreated(s));
            completed += samples.length;
            consecutiveErrors = 0;
            sliceSuccess = true;
            setBatchState(p => ({ ...p, completedClips: completed }));
            break;
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            lastErrorMsg = err.message || 'Unknown network error';
            if (attempt < 2 && !abortControllerRef.current?.signal.aborted) {
              await new Promise(r => setTimeout(r, 5000));
            }
          }
        }

        if (abortControllerRef.current?.signal.aborted) break;

        if (!sliceSuccess) {
          consecutiveErrors++;
          setErrorList(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), familyId, emotion: 'all', error: lastErrorMsg }]);
          if (consecutiveErrors >= 5) {
            setStopReason(`Halted automatically after 5 consecutive failures: ${lastErrorMsg}`);
            break;
          }
        } else if (sIdx < sentences.length - 1) {
          // Pacing between sentences to prevent single key RPM burst limits
          await new Promise(r => setTimeout(r, 2000));
        }
      } else {
        for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
          while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
            await new Promise(r => setTimeout(r, 400));
          }
          if (abortControllerRef.current?.signal.aborted) break;
          const target = enabledEmotionsList[eIdx];
          setBatchState(p => ({ ...p, currentSentenceIdx: sIdx + 1, currentEmotionIdx: eIdx + 1, currentFamilyId: familyId, currentEmotion: target.emotion }));
          let takeSuccess = false;
          let lastTakeError = '';

          for (let attempt = 1; attempt <= 3; attempt++) {
            if (abortControllerRef.current?.signal.aborted) break;
            try {
              const sample = await runSingleEmotionApi({
                speakerId: curSpeaker, voiceName: curVoice, language, sentence,
                sentenceIndex: startIdx + sIdx, familyId, emotion: target.emotion,
                intensity: target.intensity, signal: abortControllerRef.current.signal
              });
              if (sample) {
                onSampleCreated(sample);
                takeSuccess = true;
                completed++;
                consecutiveErrors = 0;
                setBatchState(p => ({ ...p, completedClips: completed }));
                break;
              }
            } catch (err: any) {
              if (err.name === 'AbortError') break;
              lastTakeError = err.message || 'Unknown error';
              if (attempt < 3) {
                await new Promise(r => setTimeout(r, 1500));
              }
            }
          }

          if (abortControllerRef.current?.signal.aborted) break;

          if (!takeSuccess) {
            consecutiveErrors++;
            setErrorList(prev => [...prev, {
              timestamp: new Date().toLocaleTimeString(),
              familyId,
              emotion: target.emotion,
              error: lastTakeError || 'Failed after 3 attempts'
            }]);
            setStopReason(`Halted at ${familyId}_${target.emotion} to protect family completeness: ${lastTakeError}`);
            break;
          }

          // Gentle pacing between emotion takes (800ms)
          if (eIdx < enabledEmotionsList.length - 1) {
            await new Promise(r => setTimeout(r, 800));
          }
        }
        if (consecutiveErrors > 0) break;
      }
    }

      if (abortControllerRef.current?.signal.aborted) {
        setStopReason('Stopped by user');
      } else if (completed === totalClips && totalClips > 0) {
        setStopReason('Completed successfully');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        addToast({ type: 'success', title: 'Batch Finished!', message: `${completed} clips saved.` });
      } else if (completed < totalClips) {
        setStopReason(`Finished with missing clips (${completed}/${totalClips} synthesized)`);
        addToast({
          type: 'error',
          title: 'Batch Finished (Incomplete)',
          message: `${totalClips - completed} clip(s) failed or were skipped.`
        });
      }
    } finally {
      isRunningRef.current = false;
      setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    isRunningRef.current = false;
    setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
    setStopReason('Stopped by user');
    addToast({ type: 'info', title: 'Batch stopped' });
  };

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setBatchState(p => ({ ...p, isPaused: isPausedRef.current }));
  };

  return {
    batchState, currentSpeakerInfo, stopReason, errorList, startTime, totalClips,
    handleStartBatch, handleStop, togglePause, clearErrors: () => setErrorList([])
  };
}
