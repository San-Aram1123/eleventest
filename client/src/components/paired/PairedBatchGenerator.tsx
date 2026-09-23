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
  const [voiceName, setVoiceName] = useState('Puck');
  const [startIdx, setStartIdx] = useState(1);
  const [mode, setMode] = useState<'sliced' | 'individual'>('individual');
  const [randomizeVoices, setRandomizeVoices] = useState(false);

  const [emotions, setEmotions] = useState<Record<string, SelectedEmotion>>(() => {
    const map: Record<string, SelectedEmotion> = {};
    REQUIRED_EMOTIONS.forEach(r => { map[r.id] = { emotion: r.id, intensity: r.defaultIntensity, enabled: true }; });
    OPTIONAL_EMOTIONS.forEach(o => { map[o.id] = { emotion: o.id, intensity: o.defaultIntensity, enabled: false }; });
    return map;
  });

  const [batchState, setBatchState] = useState<PairedBatchState>({
    isActive: false,
    isPaused: false,
    currentSentenceIdx: 0,
    totalSentences: 0,
    currentEmotionIdx: 0,
    totalEmotionsPerSentence: 0,
    currentFamilyId: '',
    currentEmotion: '',
    completedClips: 0,
    totalClipsToGenerate: 0,
    errors: []
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
      isActive: true,
      isPaused: false,
      currentSentenceIdx: 0,
      totalSentences: sentences.length,
      currentEmotionIdx: 0,
      totalEmotionsPerSentence: enabledEmotionsList.length,
      currentFamilyId: '',
      currentEmotion: '',
      completedClips: 0,
      totalClipsToGenerate: totalClips,
      mode,
      errors: []
    });

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      if (abortControllerRef.current?.signal.aborted) break;
      const sentence = sentences[sIdx];

      // Determine speaker & voice (Fixed or 50/50 Male/Female alternating)
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
            emotions: enabledEmotionsList, signal: abortControllerRef.current.signal
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
      addToast({
        type: 'success',
        title: 'Batch Complete!',
        message: `Successfully generated ${completed} clips across ${sentences.length} families.`
      });
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setBatchState(prev => ({ ...prev, isActive: false, isPaused: false }));
    addToast({ type: 'info', title: 'Batch stopped' });
  };

  return (
    <div className="modal-backdrop" onClick={batchState.isActive ? undefined : onClose}>
      <div className="modal-container paired-modal glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#fff' }}>
              <Layers size={20} />
            </div>
            <div>
              <h2 className="modal-title">Paired Emotion Batch Studio</h2>
              <p className="modal-subtitle">Generate Decoupled Kurdish Speech: Same Speaker + Same Sentence + Multiple Emotions</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={batchState.isActive ? handleStop : onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
          <BatchStateProgressCard batchState={batchState} totalClips={totalClips} mode={mode} />
          <GenerationModeSelector mode={mode} onChange={setMode} sentenceCount={sentences.length} emotionCount={enabledEmotionsList.length} disabled={batchState.isActive} />
          <SentenceInputSection text={sentencesText} onChange={setSentencesText} language={language} onLanguageChange={setLanguage} startIdx={startIdx} />
          <SpeakerConfigSection
            speakerId={speakerId}
            onSpeakerIdChange={setSpeakerId}
            voiceName={voiceName}
            onVoiceNameChange={setVoiceName}
            startIdx={startIdx}
            onStartIdxChange={setStartIdx}
            randomizeVoices={randomizeVoices}
            onRandomizeVoicesChange={setRandomizeVoices}
          />
          <EmotionSelectorSection emotions={emotions} onChange={setEmotions} />
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Batch: <strong style={{ color: '#f8fafc' }}>{sentences.length} sentences</strong> × <strong style={{ color: '#f8fafc' }}>{enabledEmotionsList.length} emotions</strong> = <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{totalClips} clips</strong>
            <span style={{ marginLeft: '0.75rem', color: mode === 'sliced' ? '#c084fc' : '#38bdf8', fontWeight: 600 }}>
              ({mode === 'sliced' ? `${sentences.length} API Calls` : `${totalClips} API Calls`})
            </span>
            {randomizeVoices && (
              <span style={{ marginLeft: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>
                • 50/50 Male & Female Pool
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {batchState.isActive ? (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => { isPausedRef.current = !isPausedRef.current; setBatchState(p => ({ ...p, isPaused: isPausedRef.current })); }}>
                  <Pause size={16} /> {batchState.isPaused ? 'Resume' : 'Pause'}
                </button>
                <button type="button" className="btn btn-danger" onClick={handleStop}><Square size={16} /> Stop Batch</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleStartBatch} disabled={totalClips === 0} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                  <Sparkles size={16} /> Start Batch ({totalClips} Clips • {mode === 'sliced' ? `${sentences.length} Requests` : `${totalClips} Requests`})
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
