import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { runTransposedBatchApi, runSingleEmotionApi } from './pairedBatchRunner';
import { MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from './pairedConstants';
import { SelectedEmotion, PairedBatchState } from './types';
import { BatchErrorItem } from './BatchErrorInspector';
import { Sample } from '../../types';

export interface FailedBatchTask {
  id: string;
  mode: 'sliced' | 'individual';
  sentences: string[];
  startIdx: number;
  sentenceIndex?: number;
  emotion: string;
  intensity: number;
  speakerId: string;
  voiceName: string;
  familyId: string;
  error: string;
}

interface BatchEngineParams {
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  startIdx: number;
  speakerId: string;
  voiceName: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  mode: 'sliced' | 'individual';
  model?: string;
  chunkSize?: number;
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  randomizeVoices: boolean;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function usePairedBatchEngine(params: BatchEngineParams) {
  const {
    sentences, enabledEmotionsList, startIdx, speakerId, voiceName,
    language, mode, model, chunkSize = 3, slicingStrategy = 'silence', randomizeVoices, onSampleCreated, addToast
  } = params;

  const [batchState, setBatchState] = useState<PairedBatchState>({
    isActive: false, isPaused: false, currentSentenceIdx: 0,
    totalSentences: 0, currentEmotionIdx: 0, totalEmotionsPerSentence: 0,
    currentFamilyId: '', currentEmotion: '', completedClips: 0,
    totalClipsToGenerate: 0, errors: []
  });

  const [currentSpeakerInfo, setCurrentSpeakerInfo] = useState({ speaker: 'spk01', voice: 'Arlo' });
  const [stopReason, setStopReason] = useState<string | null>(null);
  const [errorList, setErrorList] = useState<BatchErrorItem[]>([]);
  const [failedTasks, setFailedTasks] = useState<FailedBatchTask[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const completedTaskKeysRef = useRef<Set<string>>(new Set());
  const failedTasksMapRef = useRef<Map<string, FailedBatchTask>>(new Map());
  const sessionStartIdxRef = useRef<number>(startIdx);
  const completedClipsRef = useRef<number>(0);

  const totalClips = sentences.length * enabledEmotionsList.length;

  // Auto-detect existing clips on disk/server so Resume is immediately active even across browser reloads
  useEffect(() => {
    if (batchState.isActive || !sentences.length || !enabledEmotionsList.length) return;

    let cancelled = false;
    const scanExisting = async () => {
      try {
        const res = await fetch('/api/paired/validate');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const familiesMap = new Map();
        (data.families || []).forEach((f: any) => {
          familiesMap.set(f.familyId, f.presentEmotions || []);
        });

        let found = 0;
        const CHUNK_SIZE = Math.max(1, Math.min(12, chunkSize || 3));

        for (let cStart = 0; cStart < sentences.length; cStart += CHUNK_SIZE) {
          const chunk = sentences.slice(cStart, cStart + CHUNK_SIZE);
          const chunkStartIdx = startIdx + cStart;

          let curSpeaker = speakerId;
          if (randomizeVoices) {
            const isMale = (Math.floor(cStart / CHUNK_SIZE) % 2 === 0);
            const pool = isMale ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
            const picked = pool[Math.floor(cStart / CHUNK_SIZE / 2) % pool.length];
            curSpeaker = picked.id;
          }

          for (const target of enabledEmotionsList) {
            const targetEm = (target.emotion || '').toLowerCase();
            let allExist = true;
            for (let i = 0; i < chunk.length; i++) {
              const famId = `${curSpeaker}_${String(chunkStartIdx + i).padStart(3, '0')}`;
              const present = familiesMap.get(famId) || [];
              if (!present.map((e: string) => e.toLowerCase()).includes(targetEm)) {
                allExist = false;
                break;
              }
            }
            if (allExist) {
              const taskKey = `sliced_${curSpeaker}_${chunkStartIdx}_${target.emotion}`;
              completedTaskKeysRef.current.add(taskKey);
              found += chunk.length;
            }
          }
        }

        if (found > 0 && !cancelled) {
          completedClipsRef.current = found;
          sessionStartIdxRef.current = startIdx;
          setBatchState(p => ({
            ...p,
            completedClips: found,
            totalClipsToGenerate: totalClips,
            currentSentenceIdx: Math.min(sentences.length, Math.floor(found / enabledEmotionsList.length))
          }));
        }
      } catch (err) {
        console.warn('Dataset sync scan error:', err);
      }
    };

    scanExisting();
    return () => { cancelled = true; };
  }, [sentences.length, enabledEmotionsList.length, startIdx, speakerId, mode, chunkSize, randomizeVoices]);

  const runBatchLoop = async ({ isResume = false }: { isResume?: boolean } = {}) => {
    if (isRunningRef.current) return;
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

    let completed = isResume ? completedClipsRef.current : 0;
    if (!isResume) {
      completedTaskKeysRef.current.clear();
      failedTasksMapRef.current.clear();
      setFailedTasks([]);
      setErrorList([]);
      sessionStartIdxRef.current = startIdx;
      completedClipsRef.current = 0;
      setStartTime(Date.now());
    } else {
      if (!startTime) setStartTime(Date.now());
      addToast({ type: 'info', title: 'Resuming Batch', message: `Continuing from ${completed} of ${totalClips} clips...` });
    }

    setBatchState(p => ({
      isActive: true,
      isPaused: false,
      currentSentenceIdx: p.currentSentenceIdx || 0,
      totalSentences: sentences.length,
      currentEmotionIdx: p.currentEmotionIdx || 0,
      totalEmotionsPerSentence: enabledEmotionsList.length,
      currentFamilyId: p.currentFamilyId || '',
      currentEmotion: p.currentEmotion || '',
      completedClips: completed,
      totalClipsToGenerate: totalClips,
      mode,
      errors: p.errors || []
    }));

    try {
      if (mode === 'sliced') {
        const CHUNK_SIZE = Math.max(1, Math.min(12, chunkSize || 3));
        for (let cStart = 0; cStart < sentences.length; cStart += CHUNK_SIZE) {
          if (abortControllerRef.current?.signal.aborted) break;
          const chunk = sentences.slice(cStart, cStart + CHUNK_SIZE);
          const chunkStartIdx = sessionStartIdxRef.current + cStart;

          let curSpeaker = speakerId;
          let curVoice = voiceName;
          if (randomizeVoices) {
            const isMale = (Math.floor(cStart / CHUNK_SIZE) % 2 === 0);
            const pool = isMale ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
            const picked = pool[Math.floor(cStart / CHUNK_SIZE / 2) % pool.length];
            curSpeaker = picked.id;
            curVoice = picked.voice;
          }
          setCurrentSpeakerInfo({ speaker: curSpeaker, voice: curVoice });

          for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
            while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
              await new Promise(r => setTimeout(r, 400));
            }
            if (abortControllerRef.current?.signal.aborted) break;

            const target = enabledEmotionsList[eIdx];
            const isWhisper = (target.emotion || '').toLowerCase() === 'whisper';
            const isLegacy31 = (model || '').includes('3.1');
            const subChunkSize = (isWhisper && isLegacy31 && chunk.length > 3) ? 3 : chunk.length;
            const subChunks: Array<{ sentences: string[]; startIdx: number }> = [];
            for (let s = 0; s < chunk.length; s += subChunkSize) {
              subChunks.push({
                sentences: chunk.slice(s, s + subChunkSize),
                startIdx: chunkStartIdx + s
              });
            }

            setBatchState(p => ({
              ...p,
              currentSentenceIdx: Math.min(sentences.length, cStart + chunk.length),
              currentEmotionIdx: eIdx + 1,
              currentFamilyId: `${curSpeaker}_${String(chunkStartIdx).padStart(3, '0')}`,
              currentEmotion: target.emotion
            }));

            let allSubChunksOk = true;

            for (const sc of subChunks) {
              if (abortControllerRef.current?.signal.aborted) break;
              const taskKey = `sliced_${curSpeaker}_${sc.startIdx}_${target.emotion}`;

              // Skip already completed subchunk when resuming
              if (completedTaskKeysRef.current.has(taskKey)) {
                continue;
              }

              let scSuccess = false;
              let lastErr = '';

              for (let attempt = 1; attempt <= 3; attempt++) {
                if (abortControllerRef.current?.signal.aborted) break;
                try {
                  const resData = await runTransposedBatchApi({
                    speakerId: curSpeaker, voiceName: curVoice, language,
                    sentences: sc.sentences, startIdx: sc.startIdx,
                    emotion: target.emotion, intensity: target.intensity,
                    model: model || 'gemini-3.8-flash-tts',
                    slicingStrategy,
                    signal: abortControllerRef.current.signal
                  });

                  const samples = resData.samples || [];
                  if (!samples || samples.length === 0) {
                    throw new Error('Server returned 0 audio samples.');
                  }

                  samples.forEach(s => onSampleCreated(s));
                  completed += samples.length;
                  completedClipsRef.current = completed;
                  completedTaskKeysRef.current.add(taskKey);

                  if (failedTasksMapRef.current.has(taskKey)) {
                    failedTasksMapRef.current.delete(taskKey);
                    setFailedTasks(Array.from(failedTasksMapRef.current.values()));
                    setErrorList(prev => prev.filter(e => !(e.familyId === `${curSpeaker}_${String(sc.startIdx).padStart(3, '0')}` && e.emotion === target.emotion)));
                  }

                  scSuccess = true;
                  setBatchState(p => ({ ...p, completedClips: completed }));
                  break;
                } catch (err: any) {
                  if (err.name === 'AbortError') break;
                  lastErr = err.message || 'Network error';
                  if (attempt < 3 && !abortControllerRef.current?.signal.aborted) {
                    const isRateLimit = lastErr.toLowerCase().includes('cooldown') ||
                                        lastErr.toLowerCase().includes('rate') ||
                                        lastErr.toLowerCase().includes('quota') ||
                                        lastErr.includes('429');
                    const backoffMs = isRateLimit ? (35000 + attempt * 10000) : 4000;
                    await new Promise(r => setTimeout(r, backoffMs));
                  }
                }
              }

              if (abortControllerRef.current?.signal.aborted) break;

              if (!scSuccess) {
                allSubChunksOk = false;
                const famId = `${curSpeaker}_${String(sc.startIdx).padStart(3, '0')}`;
                const failedTask: FailedBatchTask = {
                  id: taskKey,
                  mode: 'sliced',
                  sentences: sc.sentences,
                  startIdx: sc.startIdx,
                  emotion: target.emotion,
                  intensity: target.intensity,
                  speakerId: curSpeaker,
                  voiceName: curVoice,
                  familyId: famId,
                  error: lastErr
                };
                failedTasksMapRef.current.set(taskKey, failedTask);
                setFailedTasks(Array.from(failedTasksMapRef.current.values()));
                setErrorList(prev => [...prev, {
                  timestamp: new Date().toLocaleTimeString(),
                  familyId: famId,
                  emotion: target.emotion,
                  error: lastErr
                }]);

                // Do NOT break the whole batch! Continue to the next emotion/sentence so dataset generation proceeds!
              } else if (subChunks.length > 1) {
                await new Promise(r => setTimeout(r, 1200));
              }
            }

            if (abortControllerRef.current?.signal.aborted) break;

            await new Promise(r => setTimeout(r, allSubChunksOk ? 2200 : 8000));
          }
        }
      } else {
        // Individual 1:1 Request Mode
        for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
          if (abortControllerRef.current?.signal.aborted) break;
          const sentence = sentences[sIdx];
          const sIndex = sessionStartIdxRef.current + sIdx;

          let curSpeaker = speakerId;
          let curVoice = voiceName;
          if (randomizeVoices) {
            const isMale = (sIdx % 2 === 0);
            const pool = isMale ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
            const picked = pool[Math.floor(sIdx / 2) % pool.length];
            curSpeaker = picked.id;
            curVoice = picked.voice;
          }
          const familyId = `${curSpeaker}_${String(sIndex).padStart(3, '0')}`;
          setCurrentSpeakerInfo({ speaker: curSpeaker, voice: curVoice });

          for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
            while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
              await new Promise(r => setTimeout(r, 400));
            }
            if (abortControllerRef.current?.signal.aborted) break;
            const target = enabledEmotionsList[eIdx];
            const taskKey = `indiv_${familyId}_${target.emotion}`;

            // Skip already synthesized clip when resuming
            if (completedTaskKeysRef.current.has(taskKey)) {
              continue;
            }

            setBatchState(p => ({ ...p, currentSentenceIdx: sIdx + 1, currentEmotionIdx: eIdx + 1, currentFamilyId: familyId, currentEmotion: target.emotion }));
            let takeSuccess = false;
            let lastTakeError = '';

            for (let attempt = 1; attempt <= 3; attempt++) {
              if (abortControllerRef.current?.signal.aborted) break;
              try {
                const sample = await runSingleEmotionApi({
                  speakerId: curSpeaker, voiceName: curVoice, language, sentence,
                  sentenceIndex: sIndex, familyId, emotion: target.emotion,
                  intensity: target.intensity,
                  model: model || 'gemini-3.8-flash-tts',
                  signal: abortControllerRef.current.signal
                });
                if (sample) {
                  onSampleCreated(sample);
                  takeSuccess = true;
                  completed++;
                  completedClipsRef.current = completed;
                  completedTaskKeysRef.current.add(taskKey);

                  if (failedTasksMapRef.current.has(taskKey)) {
                    failedTasksMapRef.current.delete(taskKey);
                    setFailedTasks(Array.from(failedTasksMapRef.current.values()));
                    setErrorList(prev => prev.filter(e => !(e.familyId === familyId && e.emotion === target.emotion)));
                  }

                  setBatchState(p => ({ ...p, completedClips: completed }));
                  break;
                }
              } catch (err: any) {
                if (err.name === 'AbortError') break;
                lastTakeError = err.message || 'Unknown error';
                if (attempt < 3) await new Promise(r => setTimeout(r, 1500));
              }
            }

            if (abortControllerRef.current?.signal.aborted) break;

            if (!takeSuccess) {
              const failedTask: FailedBatchTask = {
                id: taskKey,
                mode: 'individual',
                sentences: [sentence],
                sentenceIndex: sIndex,
                startIdx: sIndex,
                emotion: target.emotion,
                intensity: target.intensity,
                speakerId: curSpeaker,
                voiceName: curVoice,
                familyId,
                error: lastTakeError || 'Failed after 3 attempts'
              };
              failedTasksMapRef.current.set(taskKey, failedTask);
              setFailedTasks(Array.from(failedTasksMapRef.current.values()));
              setErrorList(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(), familyId, emotion: target.emotion, error: lastTakeError || 'Failed after 3 attempts'
              }]);
              // Do NOT break the loop! Continue with remaining emotions/sentences!
            }

            if (eIdx < enabledEmotionsList.length - 1) {
              await new Promise(r => setTimeout(r, 800));
            }
          }
        }
      }

      if (abortControllerRef.current?.signal.aborted) {
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
    } finally {
      isRunningRef.current = false;
      setBatchState(p => ({ ...p, isActive: false, isPaused: false }));
    }
  };

  const handleRetryFailed = async () => {
    if (isRunningRef.current) return;
    const tasksToRetry = Array.from(failedTasksMapRef.current.values());
    if (tasksToRetry.length === 0) {
      addToast({ type: 'info', title: 'No failed clips to retry' });
      return;
    }

    isRunningRef.current = true;
    abortControllerRef.current = new AbortController();
    isPausedRef.current = false;
    setStopReason(null);
    setBatchState(p => ({ ...p, isActive: true, isPaused: false }));

    let recovered = 0;
    addToast({ type: 'info', title: 'Retrying Failed Clips', message: `Retrying ${tasksToRetry.length} failed task(s)...` });

    try {
      for (let i = 0; i < tasksToRetry.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break;

        while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
          await new Promise(r => setTimeout(r, 400));
        }
        if (abortControllerRef.current?.signal.aborted) break;

        const task = tasksToRetry[i];
        setBatchState(p => ({
          ...p,
          currentFamilyId: task.familyId,
          currentEmotion: task.emotion
        }));

        let taskOk = false;
        let lastErr = '';

        for (let attempt = 1; attempt <= 3; attempt++) {
          if (abortControllerRef.current?.signal.aborted) break;
          try {
            if (task.mode === 'sliced') {
              const resData = await runTransposedBatchApi({
                speakerId: task.speakerId,
                voiceName: task.voiceName,
                language,
                sentences: task.sentences,
                startIdx: task.startIdx,
                emotion: task.emotion,
                intensity: task.intensity,
                model: model || 'gemini-3.8-flash-tts',
                slicingStrategy,
                signal: abortControllerRef.current.signal
              });
              const samples = resData.samples || [];
              if (!samples.length) throw new Error('Server returned 0 audio samples.');
              samples.forEach(s => onSampleCreated(s));
              completedClipsRef.current += samples.length;
              completedTaskKeysRef.current.add(task.id);
              recovered += samples.length;
              taskOk = true;
              setBatchState(p => ({ ...p, completedClips: completedClipsRef.current }));
              break;
            } else {
              const sample = await runSingleEmotionApi({
                speakerId: task.speakerId,
                voiceName: task.voiceName,
                language,
                sentence: task.sentences[0] || '',
                sentenceIndex: task.sentenceIndex || task.startIdx,
                familyId: task.familyId,
                emotion: task.emotion,
                intensity: task.intensity,
                model: model || 'gemini-3.8-flash-tts',
                signal: abortControllerRef.current.signal
              });
              if (sample) {
                onSampleCreated(sample);
                completedClipsRef.current += 1;
                completedTaskKeysRef.current.add(task.id);
                recovered += 1;
                taskOk = true;
                setBatchState(p => ({ ...p, completedClips: completedClipsRef.current }));
                break;
              }
            }
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            lastErr = err.message || 'Retry error';
            if (attempt < 3 && !abortControllerRef.current?.signal.aborted) {
              await new Promise(r => setTimeout(r, 2000));
            }
          }
        }

        if (taskOk) {
          failedTasksMapRef.current.delete(task.id);
          setFailedTasks(Array.from(failedTasksMapRef.current.values()));
          setErrorList(prev => prev.filter(e => !(e.familyId === task.familyId && e.emotion === task.emotion)));
        } else {
          task.error = lastErr || task.error;
          failedTasksMapRef.current.set(task.id, task);
          setFailedTasks(Array.from(failedTasksMapRef.current.values()));
        }

        if (i < tasksToRetry.length - 1) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      const remaining = failedTasksMapRef.current.size;
      if (recovered > 0) {
        addToast({
          type: 'success',
          title: 'Retry Finished',
          message: `Successfully generated ${recovered} clip(s)! ${remaining > 0 ? `${remaining} still failed.` : 'All errors resolved!'}`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Retry Incomplete',
          message: `${remaining} clip(s) could not be synthesized.`
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

  const canResume = !batchState.isActive && (batchState.completedClips > 0 || failedTasks.length > 0) && (batchState.completedClips < totalClips);
  const failedCount = failedTasks.length;

  return {
    batchState,
    currentSpeakerInfo,
    stopReason,
    errorList,
    startTime,
    totalClips,
    canResume,
    failedCount,
    failedTasks,
    handleStartBatch: () => runBatchLoop({ isResume: false }),
    handleResumeBatch: () => runBatchLoop({ isResume: true }),
    handleRetryFailed,
    handleStop,
    togglePause,
    clearErrors: () => {
      setErrorList([]);
      failedTasksMapRef.current.clear();
      setFailedTasks([]);
    }
  };
}
