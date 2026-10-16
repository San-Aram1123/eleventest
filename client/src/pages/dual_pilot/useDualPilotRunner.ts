import { useState, useRef, useCallback } from 'react';
import { DualPilotFamily, DualPilotTake, DualPilotConfig, DualPilotBatchProgress } from './dualPilotTypes';
import { generateGeminiDualPilotChunk, generateElevenLabsDualPilotTake, abortDualPilotBatch } from './dualPilotApi';
import { V20_PRESET_TIERS, V20BatchCondition, V20_ALL_50_EMOTIONS } from './v20Conditions';

interface UseDualPilotRunnerProps {
  paragraphs?: string[];
  geminiParagraphs?: string[];
  elevenParagraphs?: string[];
  config: DualPilotConfig;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export function useDualPilotRunner({ paragraphs = [], geminiParagraphs, elevenParagraphs, config, addToast }: UseDualPilotRunnerProps) {
  const gList = geminiParagraphs || paragraphs;
  const eList = elevenParagraphs || paragraphs;
  const [families, setFamilies] = useState<DualPilotFamily[]>([]);
  const [progress, setProgress] = useState<DualPilotBatchProgress>({
    isActive: false,
    stage: 'idle',
    currentConditionIndex: 0,
    totalConditions: 0,
    currentConditionLabel: '',
    currentChunk: 0,
    totalChunks: 0,
    completedTakes: 0,
    totalExpectedTakes: 0
  });
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback((take: DualPilotTake) => {
    if (currentlyPlayingId === take.id) {
      audioRef.current?.pause();
      setCurrentlyPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(take.audioUrl);
    audioRef.current = audio;
    setCurrentlyPlayingId(take.id);

    audio.onended = () => setCurrentlyPlayingId(null);
    audio.onerror = () => {
      setCurrentlyPlayingId(null);
      addToast({ type: 'error', title: 'Audio playback failed' });
    };

    audio.play().catch(e => {
      console.warn('Playback error:', e);
      setCurrentlyPlayingId(null);
    });
  }, [currentlyPlayingId, addToast]);

  const rateFamily = useCallback((familyId: string, condId: string, rating: 'gemini_better' | 'elevenlabs_better' | 'equal' | 'both_flawed') => {
    setFamilies(prev => prev.map(f => {
      if (f.familyId === familyId) {
        return { ...f, userRatings: { ...(f.userRatings || {}), [condId]: rating } };
      }
      return f;
    }));
  }, []);

  const stopBatch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    abortDualPilotBatch();
    setProgress(prev => ({ ...prev, isActive: false, stage: 'idle', error: 'Batch stopped by user.' }));
    addToast({ type: 'info', title: 'Batch stopped', message: 'Operations aborted.' });
  }, [addToast]);

  const startBatch = async () => {
    const maxSentences = Math.max(gList.length, eList.length);
    if (maxSentences === 0) {
      addToast({ type: 'error', title: 'No sentences provided', message: 'Please paste Gemini or ElevenLabs sentences.' });
      return;
    }

    const conditions: V20BatchCondition[] = config.selectedPresetId === 'quick_smoke1'
      ? (() => {
          const emotionKey = config.smokeEmotion || 'neutral';
          const emo = V20_ALL_50_EMOTIONS.find(e => e.key === emotionKey) || V20_ALL_50_EMOTIONS[0];
          return [{
            id: emo.key,
            name: `${emo.name} (${emo.sorani})`,
            soraniName: emo.sorani,
            emotion: emo.key,
            intensity: emo.defaultIntensity,
            delivery: 'normal'
          }];
        })()
      : (V20_PRESET_TIERS.find(p => p.id === config.selectedPresetId) || V20_PRESET_TIERS[0]).conditions;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Initialize families
    const initialFamilies: DualPilotFamily[] = Array.from({ length: maxSentences }).map((_, idx) => ({
      familyId: `v20_fam_${String(idx + 1).padStart(3, '0')}`,
      paragraphIndex: idx,
      transcript: gList[idx] || eList[idx] || '',
      geminiTranscript: gList[idx] || '',
      elevenlabsTranscript: eList[idx] || '',
      gender: idx % 2 === 0 ? 'Female' : 'Male',
      language: config.language,
      geminiTakes: {},
      elevenlabsTakes: {},
      userRatings: {}
    }));

    setFamilies(initialFamilies);

    const chunkSize = 6;
    const totalChunks = Math.ceil(maxSentences / chunkSize);
    const totalExpectedTakes = (gList.length + eList.length) * conditions.length;

    setProgress({
      isActive: true,
      stage: 'generating_gemini',
      currentConditionIndex: 1,
      totalConditions: conditions.length,
      currentConditionLabel: conditions[0]?.name || '',
      currentChunk: 1,
      totalChunks,
      completedTakes: 0,
      totalExpectedTakes
    });

    let completedTakesCount = 0;

    try {
      for (let c = 0; c < totalChunks; c++) {
        if (controller.signal.aborted) break;

        const chunkStart = c * chunkSize;
        const chunkGemini = gList.slice(chunkStart, chunkStart + chunkSize);
        const chunkEleven = eList.slice(chunkStart, chunkStart + chunkSize);

        // Inner loop: run all conditions in the preset automatically
        for (let condIdx = 0; condIdx < conditions.length; condIdx++) {
          if (controller.signal.aborted) break;

          const cond = conditions[condIdx];
          setProgress(prev => ({
            ...prev,
            currentChunk: c + 1,
            currentConditionIndex: condIdx + 1,
            currentConditionLabel: cond.name,
            stage: 'generating_gemini'
          }));

          // Run Gemini 3.8 master chunk and ElevenLabs takes concurrently in true parallel
          const geminiTask = async () => {
            if (chunkGemini.length === 0) return;
            const geminiRes = await generateGeminiDualPilotChunk({
              paragraphs: chunkGemini,
              femaleVoice: config.geminiFemaleVoice,
              maleVoice: config.geminiMaleVoice,
              emotion: cond.emotion,
              intensity: cond.intensity,
              deliveryStyle: cond.delivery,
              language: config.language,
              dialect: config.language === 'kmr' ? 'badini' : (config.dialect || 'sorani'),
              saveToDataset: config.saveToDataset !== false,
              signal: controller.signal
            });

            setFamilies(prev => prev.map((fam, idx) => {
              if (idx >= chunkStart && idx < chunkStart + chunkGemini.length) {
                const clipIdx = idx - chunkStart;
                const clip = geminiRes.clips[clipIdx];
                if (clip) {
                  const gTake: DualPilotTake = {
                    id: `gem_${fam.familyId}_${cond.id}`,
                    conditionId: cond.id,
                    provider: 'gemini',
                    modelId: 'gemini-3.8-flash-tts',
                    voiceName: clip.speakerName,
                    gender: fam.gender,
                    emotion: clip.emotion || cond.emotion,
                    emotionTag: clip.emotionTag,
                    intensity: cond.intensity,
                    deliveryStyle: cond.delivery,
                    duration: clip.duration,
                    audioUrl: clip.audioUrl,
                    slicingEngine: geminiRes.selectedEngine,
                    slicingScore: geminiRes.selectionScore,
                    rejected: clip.rejected,
                    rejectionReason: clip.rejectionReason,
                    createdAt: Date.now()
                  };
                  return {
                    ...fam,
                    geminiTranscript: clip.text || fam.geminiTranscript,
                    geminiTakes: { ...fam.geminiTakes, [cond.id]: gTake }
                  };
                }
              }
              return fam;
            }));

            completedTakesCount += chunkGemini.length;
            setProgress(prev => ({ ...prev, completedTakes: completedTakesCount }));
          };

          const elevenTask = async () => {
            if (chunkEleven.length === 0) return;
            for (let i = 0; i < chunkEleven.length; i += 2) {
              if (controller.signal.aborted) break;
              const batch = chunkEleven.slice(i, i + 2);
              const promises = batch.map(async (text, bIdx) => {
                const absoluteIdx = chunkStart + i + bIdx;
                const isFemale = absoluteIdx % 2 === 0;
                const voiceId = isFemale ? config.elevenFemaleVoiceId : config.elevenMaleVoiceId;
                const voiceName = isFemale ? config.elevenFemaleVoiceName : config.elevenMaleVoiceName;

                const res = await generateElevenLabsDualPilotTake({
                  text,
                  voiceId,
                  voiceName,
                  modelId: 'eleven_v4_turbo',
                  emotion: cond.emotion,
                  intensity: cond.intensity,
                  deliveryStyle: cond.delivery,
                  language: config.language,
                  dialect: config.language === 'kmr' ? 'badini' : (config.dialect || 'sorani'),
                  saveToDataset: config.saveToDataset !== false,
                  signal: controller.signal
                });

                const famId = `v20_fam_${String(absoluteIdx + 1).padStart(3, '0')}`;
                const eTake: DualPilotTake = {
                  id: `eleven_${famId}_${cond.id}`,
                  conditionId: cond.id,
                  provider: 'elevenlabs',
                  modelId: 'eleven_v4_turbo',
                  voiceName: res.voiceName,
                  voiceId: res.voiceId,
                  gender: isFemale ? 'Female' : 'Male',
                  emotion: res.emotion || cond.emotion,
                  emotionTag: res.emotionTag,
                  intensity: cond.intensity,
                  deliveryStyle: cond.delivery,
                  duration: res.duration,
                  audioUrl: res.audioUrl,
                  keyUsedMasked: res.keyUsedMasked,
                  createdAt: Date.now()
                };

                setFamilies(prev => prev.map((f, fIdx) => fIdx === absoluteIdx
                  ? { ...f, elevenlabsTranscript: res.text || f.elevenlabsTranscript, elevenlabsTakes: { ...f.elevenlabsTakes, [cond.id]: eTake } }
                  : f
                ));
              });

              await Promise.all(promises);
              completedTakesCount += batch.length;
              setProgress(prev => ({ ...prev, completedTakes: completedTakesCount }));
            }
          };

          await Promise.all([geminiTask(), elevenTask()]);

          // Small 200ms delay between conditions
          await new Promise(r => setTimeout(r, 200));
        }
      }

      setProgress(prev => ({ ...prev, isActive: false, stage: 'completed' }));
      addToast({ type: 'success', title: 'Automated Dual Batch Complete!', message: `Generated ${completedTakesCount} takes across both providers.` });
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setProgress(prev => ({ ...prev, isActive: false, stage: 'error', error: err.message }));
        addToast({ type: 'error', title: 'Batch execution stopped', message: err.message });
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  return {
    families,
    progress,
    currentlyPlayingId,
    startBatch,
    stopBatch,
    togglePlay,
    rateFamily
  };
}
