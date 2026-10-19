import React, { useState, useRef } from 'react';
import { Play, Pause, Square, Sparkles, X, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SentenceInputSection } from './SentenceInputSection';
import { SpeakerConfigSection } from './SpeakerConfigSection';
import { EmotionSelectorSection } from './EmotionSelectorSection';
import { GenerationModeSelector } from './GenerationModeSelector';
import { BatchStateProgressCard } from './BatchStateProgressCard';
import { runFamilySlicedApi, runSingleEmotionApi } from './pairedBatchRunner';
import { REQUIRED_EMOTIONS, OPTIONAL_EMOTIONS, MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from './pairedConstants';
import { SelectedEmotion, PairedBatchState } from './types';
import { Sample } from '../../types';

interface PairedBatchGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const PairedBatchGenerator: React.FC<PairedBatchGeneratorProps> = ({
  isOpen,
  onClose,
  onSampleCreated,
  addToast
}) => {
  const [sentencesText, setSentencesText] = useState('');
  const [language, setLanguage] = useState<'ckb' | 'kmr' | 'ar' | 'en'>('ckb');
  const [speakerId, setSpeakerId] = useState('spk01');
  const [voiceName, setVoiceName] = useState('Arlo');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash-tts');
  const [startIdx, setStartIdx] = useState(1);
  const [mode, setMode] = useState<'sliced' | 'individual'>('individual');
  const [randomizeVoices, setRandomizeVoices] = useState(false);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);

  const fetchNextIndex = React.useCallback(async () => {
    setIsRefreshingIndex(true);
    try {
      const res = await fetch(`/api/paired/next-index?speakerId=${encodeURIComponent(speakerId)}`);
      const data = await res.json();
      if (data && typeof data.nextIndex === 'number' && Number.isFinite(data.nextIndex)) {
        setStartIdx(data.nextIndex);
      }
    } catch {} finally {
      setIsRefreshingIndex(false);
    }
  }, [speakerId]);

  React.useEffect(() => {
    if (isOpen) fetchNextIndex();
  }, [isOpen, fetchNextIndex]);

  const [emotions, setEmotions] = useState<Record<string, SelectedEmotion>>(() => {
    const map: Record<string, SelectedEmotion> = {};
    REQUIRED_EMOTIONS.forEach(r => { map[r.id] = { emotion: r.id, intensity: r.defaultIntensity, enabled: true }; });
    OPTIONAL_EMOTIONS.forEach(o => { map[o.id] = { emotion: o.id, intensity: o.defaultIntensity, enabled: false }; });
    return map;
  });

  const [batchState, setBatchState] = useState<PairedBatchState>({
    isActive: false, isPaused: false, currentSentenceIdx: 0, totalSentences: 0,
    currentEmotionIdx: 0, totalEmotionsPerSentence: 0, currentFamilyId: '',
    currentEmotion: '', completedClips: 0, totalClipsToGenerate: 0, errors: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isPausedRef = useRef(false);

  if (!isOpen) return null;

  const sentences = sentencesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const enabledEmotionsList = Object.values(emotions).filter(e => e.enabled);
  const totalClips = sentences.length * enabledEmotionsList.length;

  const handleStartBatch = async () => {
    if (!sentences.length) {
      addToast({ type: 'error', title: 'No sentences provided', message: 'Enter at least one sentence.' });
      return;
    }
    if (!enabledEmotionsList.length) {
      addToast({ type: 'error', title: 'No emotions selected', message: 'Enable at least one emotion.' });
      return;
    }

    abortControllerRef.current = new AbortController();
    isPausedRef.current = false;
    let completed = 0;
    const errorsList: Array<{ familyId: string; emotion: string; error: string }> = [];

    setBatchState({
      isActive: true, isPaused: false, currentSentenceIdx: 0, totalSentences: sentences.length,
      currentEmotionIdx: 0, totalEmotionsPerSentence: enabledEmotionsList.length,
      currentFamilyId: '', currentEmotion: '', completedClips: 0, totalClipsToGenerate: totalClips,
      mode, errors: []
    });

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

      while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
        await new Promise(r => setTimeout(r, 400));
      }
      if (abortControllerRef.current?.signal.aborted) break;

      if (mode === 'sliced') {
        setBatchState(prev => ({ ...prev, currentSentenceIdx: sIdx + 1, currentFamilyId: familyId, currentEmotion: 'all' }));
        try {
          const resData = await runFamilySlicedApi({
            speakerId: curSpeaker, voiceName: curVoice, language, sentence,
            sentenceIndex: startIdx + sIdx, familyId,
            emotions: enabledEmotionsList,
            model: selectedModel,
            signal: abortControllerRef.current.signal
          });
          const samples = resData.samples || [];
          samples.forEach(s => onSampleCreated(s));
          completed += samples.length;
          setBatchState(prev => ({ ...prev, completedClips: completed }));
        } catch (err: any) {
          if (err.name === 'AbortError') break;
          errorsList.push({ familyId, emotion: 'all', error: err.message });
          setBatchState(prev => ({ ...prev, errors: [...errorsList] }));
        }
      } else {
        for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
          while (isPausedRef.current && !abortControllerRef.current?.signal.aborted) {
            await new Promise(r => setTimeout(r, 400));
          }
          if (abortControllerRef.current?.signal.aborted) break;
          const target = enabledEmotionsList[eIdx];
          setBatchState(prev => ({ ...prev, currentSentenceIdx: sIdx + 1, currentEmotionIdx: eIdx + 1, currentFamilyId: familyId, currentEmotion: target.emotion }));
          try {
            const sample = await runSingleEmotionApi({
              speakerId: curSpeaker, voiceName: curVoice, language, sentence,
              sentenceIndex: startIdx + sIdx, familyId,
              emotion: target.emotion, intensity: target.intensity,
              model: selectedModel,
              signal: abortControllerRef.current.signal
            });
            if (sample) onSampleCreated(sample);
            completed++;
            setBatchState(prev => ({ ...prev, completedClips: completed }));
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            errorsList.push({ familyId, emotion: target.emotion, error: err.message });
            setBatchState(prev => ({ ...prev, errors: [...errorsList] }));
          }
        }
      }
    }

    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
    if (completed > 0) {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      addToast({ type: 'success', title: 'Batch Complete!', message: `Generated ${completed} clips across ${sentences.length} families.` });
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
    addToast({ type: 'info', title: 'Batch stopped' });
  };

  return (
    <div className="modal-backdrop" onClick={batchState.isActive ? undefined : onClose}>
      <div
        className="modal-container paired-modal"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '22px',
          border: '1px solid var(--border-medium)',
          borderTop: '1px solid var(--border-specular)',
          backdropFilter: 'blur(32px) saturate(190%)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0A84FF 0%, #BF5AF2 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem', letterSpacing: '-0.02em' }}>Paired Emotion Batch Studio</h2>
              <p className="modal-subtitle">Generate Decoupled Kurdish Speech: Same Speaker + Same Sentence + Multiple Emotions</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={batchState.isActive ? handleStop : onClose} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <BatchStateProgressCard batchState={batchState} totalClips={totalClips} mode={mode} />
          <GenerationModeSelector mode={mode} onChange={setMode} sentenceCount={sentences.length} emotionCount={enabledEmotionsList.length} disabled={batchState.isActive} />
          <SentenceInputSection text={sentencesText} onChange={setSentencesText} language={language} onLanguageChange={setLanguage} startIdx={startIdx} />
          <SpeakerConfigSection
            speakerId={speakerId} onSpeakerIdChange={setSpeakerId}
            voiceName={voiceName} onVoiceNameChange={setVoiceName}
            startIdx={startIdx} onStartIdxChange={setStartIdx}
            randomizeVoices={randomizeVoices} onRandomizeVoicesChange={setRandomizeVoices}
            selectedModel={selectedModel} onSelectedModelChange={setSelectedModel}
            onRefreshNextIndex={fetchNextIndex} isRefreshingNextIndex={isRefreshingIndex}
          />
          <EmotionSelectorSection emotions={emotions} onChange={setEmotions} />
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-box-subtle)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Batch: <strong style={{ color: 'var(--text-primary)' }}>{sentences.length} sentences</strong> × <strong style={{ color: 'var(--text-primary)' }}>{enabledEmotionsList.length} emotions</strong> = <strong style={{ color: '#0A84FF', fontSize: '1.02rem' }}>{totalClips} clips</strong>
            <span style={{ marginLeft: '0.75rem', color: mode === 'sliced' ? '#BF5AF2' : '#0A84FF', fontWeight: 600 }}>
              ({mode === 'sliced' ? `${sentences.length} API Calls` : `${totalClips} API Calls`})
            </span>
            {randomizeVoices && <span style={{ marginLeft: '0.75rem', color: '#30D158', fontWeight: 600 }}>• 50/50 Voice Pool</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {batchState.isActive ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => { isPausedRef.current = !isPausedRef.current; setBatchState(p => ({ ...p, isPaused: isPausedRef.current })); }} style={{ borderRadius: '9999px', padding: '6px 14px', fontSize: '0.82rem' }}>
                  <Pause size={15} /> {batchState.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button type="button" className="btn btn-danger" onClick={handleStop} style={{ borderRadius: '9999px', padding: '6px 14px', fontSize: '0.82rem' }}><Square size={15} /> Stop Batch</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '9999px', padding: '6px 16px', fontSize: '0.82rem' }}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleStartBatch} disabled={totalClips === 0} style={{ borderRadius: '9999px', padding: '6px 18px', fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(145deg, #0A84FF, #0066CC)', boxShadow: '0 4px 14px rgba(10, 132, 255, 0.35)' }}>
                  <Sparkles size={15} /> Start Batch ({totalClips} Clips)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
