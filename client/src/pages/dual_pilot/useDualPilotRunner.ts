import { useState, useRef, useCallback } from 'react';
import { automaticTasks, executeAutomaticTasks, AutoTask } from '../../../../shared/dualPilotAuto.mjs';
import { DualPilotFamily, DualPilotTake, DualPilotConfig, DualPilotBatchProgress } from './dualPilotTypes';
import { generateGeminiDualPilotChunk, generateElevenLabsDualPilotTake, abortDualPilotBatch, reserveDualPilotRun } from './dualPilotApi';
import { V20_ALL_50_EMOTIONS } from './v20Conditions';

interface Props {
  paragraphs?: string[]; geminiParagraphs?: string[]; elevenParagraphs?: string[];
  config: DualPilotConfig;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}
interface FailedTask { task: AutoTask; error: string }
const idle: DualPilotBatchProgress = { isActive: false, stage: 'idle', currentConditionIndex: 0,
  totalConditions: 50, currentConditionLabel: '', currentChunk: 0, totalChunks: 0,
  completedTakes: 0, totalExpectedTakes: 0 };

export function useDualPilotRunner({ paragraphs = [], geminiParagraphs, elevenParagraphs, config, addToast }: Props) {
  const [families, setFamilies] = useState<DualPilotFamily[]>([]);
  const [progress, setProgress] = useState(idle);
  const [failedTasks, setFailedTasks] = useState<FailedTask[]>([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const snapshot = useRef<{ runId: string; config: DualPilotConfig }>();
  const failedRef = useRef<FailedTask[]>([]);
  const familyId = (run: string, provider: string, index: number) =>
    `${run}_${provider}_family_${String(index + 1).padStart(6, '0')}`;

  const togglePlay = useCallback((take: DualPilotTake) => {
    audioRef.current?.pause();
    if (currentlyPlayingId === take.id) { setCurrentlyPlayingId(null); return; }
    const audio = new Audio(take.audioUrl); audioRef.current = audio; setCurrentlyPlayingId(take.id);
    audio.onended = () => setCurrentlyPlayingId(null);
    audio.onerror = () => setCurrentlyPlayingId(null);
    void audio.play().catch(() => setCurrentlyPlayingId(null));
  }, [currentlyPlayingId]);
  const rateFamily = useCallback((id: string, cond: string, rating: 'gemini_better' | 'elevenlabs_better' | 'equal' | 'both_flawed') => {
    setFamilies(previous => previous.map(family => family.familyId === id
      ? { ...family, userRatings: { ...family.userRatings, [cond]: rating } } : family));
  }, []);
  const stopBatch = useCallback(() => {
    abortControllerRef.current?.abort();
    void abortDualPilotBatch();
  }, []);

  const runTasks = async (tasks: Iterable<AutoTask> | (() => Iterable<AutoTask>)) => {
    const { runId, config: settings } = snapshot.current!;
    const controller = new AbortController(); abortControllerRef.current = controller;
    setProgress(previous => ({ ...previous, isActive: true }));
    const addFailure = (task: AutoTask, error: any) => {
      failedRef.current = [...failedRef.current.filter(item => item.task.key !== task.key), { task, error: error.message }];
      setFailedTasks([...failedRef.current]);
    };
    try {
      await executeAutomaticTasks(tasks, {
        signal: controller.signal,
        run: async task => {
          setProgress(previous => ({ ...previous, currentChunk: Math.floor(task.start / 6) + 1,
            currentConditionIndex: task.emotionIndex + 1, currentConditionLabel: task.condition.name,
            stage: task.provider === 'gemini' ? 'generating_gemini' : 'generating_elevenlabs' }));
          const common = { runId, startIndex: task.start, emotion: task.condition.key,
            intensity: task.condition.defaultIntensity, deliveryStyle: 'normal', language: settings.language,
            dialect: settings.language === 'kmr' ? 'badini' : settings.dialect,
            saveToDataset: settings.saveToDataset !== false, signal: controller.signal };
          if (task.provider === 'gemini') return generateGeminiDualPilotChunk({ ...common,
            paragraphs: task.paragraphs!, femaleVoice: settings.geminiFemaleVoice, maleVoice: settings.geminiMaleVoice });
          const slot = task.start % 6;
          const female = slot % 2 === 0;
          const voice = settings.elevenVoiceSlots?.[slot] || {
            voiceId: female ? settings.elevenFemaleVoiceId : settings.elevenMaleVoiceId,
            voiceName: female ? settings.elevenFemaleVoiceName : settings.elevenMaleVoiceName };
          return generateElevenLabsDualPilotTake({ ...common, text: task.text!, ...voice,
            gender: female ? 'female' : 'male', modelId: settings.elevenModel });
        },
        success: (task, result) => {
          const clips = task.provider === 'gemini' ? result.clips : [result];
          setFamilies(previous => previous.map(family => {
            const offset = family.paragraphIndex - task.start;
            if (!family.familyId.startsWith(`${runId}_${task.provider}_`) || offset < 0 || offset >= clips.length) return family;
            const clip = clips[offset];
            const take: DualPilotTake = { id: `${family.familyId}_${task.condition.key}`, conditionId: task.condition.key,
              provider: task.provider, modelId: task.provider === 'gemini' ? 'gemini-3.8-flash-tts' : settings.elevenModel,
              voiceName: clip.speakerName || clip.voiceName, voiceId: clip.voiceId, gender: family.gender,
              emotion: task.condition.key, emotionTag: `[${task.condition.key}]`, intensity: task.condition.defaultIntensity,
              deliveryStyle: 'normal', duration: clip.duration, audioUrl: clip.audioUrl,
              slicingEngine: result.selectedEngine, slicingScore: result.selectionScore, createdAt: Date.now() };
            const field = task.provider === 'gemini' ? 'geminiTakes' : 'elevenlabsTakes';
            return { ...family, [field]: { ...family[field], [task.condition.key]: take } };
          }));
          failedRef.current = failedRef.current.filter(item => item.task.key !== task.key);
          setFailedTasks([...failedRef.current]);
          setProgress(previous => ({ ...previous, completedTakes: previous.completedTakes + task.count }));
        }, failure: addFailure
      });
    } finally {
      abortControllerRef.current = null;
      setProgress(previous => ({ ...previous, isActive: false, stage: controller.signal.aborted ? 'idle' : 'completed' }));
      addToast({ type: 'info', title: controller.signal.aborted ? 'Batch stopped' : 'Batch finished',
        message: `${failedRef.current.length} failed tasks available to retry.` });
    }
  };
  const startBatch = async () => {
    if (abortControllerRef.current) return;
    const gemini = geminiParagraphs || paragraphs, eleven = elevenParagraphs || paragraphs;
    if (!gemini.length && !eleven.length) return;
    setProgress(previous => ({ ...previous, isActive: true }));
    try {
      const { runId } = await reserveDualPilotRun();
      snapshot.current = { runId, config: structuredClone(config) };
      failedRef.current = []; setFailedTasks([]);
      const initial: DualPilotFamily[] = [];
      for (const [provider, lines] of [['gemini', gemini], ['elevenlabs', eleven]] as const) {
        lines.forEach((text, index) => initial.push({ familyId: familyId(runId, provider, index), paragraphIndex: index,
          transcript: text, geminiTranscript: provider === 'gemini' ? text : undefined,
          elevenlabsTranscript: provider === 'elevenlabs' ? text : undefined,
          gender: index % 2 === 0 ? 'Female' : 'Male', language: config.language,
          geminiTakes: {}, elevenlabsTakes: {}, userRatings: {} }));
      }
      setFamilies(initial);
      setProgress({ ...idle, isActive: true, totalChunks: Math.ceil(Math.max(gemini.length, eleven.length) / 6),
        totalExpectedTakes: (gemini.length + eleven.length) * 50 });
      await runTasks(() => automaticTasks(gemini, eleven, V20_ALL_50_EMOTIONS));
    } catch (error: any) {
      setProgress(previous => ({ ...previous, isActive: false, stage: 'error', error: error.message }));
      addToast({ type: 'error', title: 'Could not start batch', message: error.message });
    }
  };
  const retryFailed = () => {
    if (!abortControllerRef.current && snapshot.current) return runTasks(failedRef.current.map(item => item.task));
  };
  const downloadFailures = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...snapshot.current, failures: failedRef.current }, null, 2)],
      { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `${snapshot.current?.runId || 'batch'}_failures.json`; link.click(); URL.revokeObjectURL(url);
  };
  return { families, progress, failedTasks, retryFailed, downloadFailures, currentlyPlayingId, startBatch, stopBatch, togglePlay, rateFamily };
}
