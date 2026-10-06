import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { SentenceInputSection } from '../components/paired/SentenceInputSection';
import { SpeakerConfigSection } from '../components/paired/SpeakerConfigSection';
import { EmotionSelectorSection } from '../components/paired/EmotionSelectorSection';
import { GenerationModeSelector } from '../components/paired/GenerationModeSelector';
import { BatchProgressBar } from '../components/paired/BatchProgressBar';
import { BatchErrorInspector } from '../components/paired/BatchErrorInspector';
import { BatchBottomActionBar } from '../components/paired/BatchBottomActionBar';
import { MasterAudioPreviewPlayer } from '../components/paired/MasterAudioPreviewPlayer';
import { usePairedBatchEngine } from '../components/paired/usePairedBatchEngine';
import { REQUIRED_EMOTIONS, OPTIONAL_EMOTIONS } from '../components/paired/pairedConstants';
import { SelectedEmotion } from '../components/paired/types';
import { Sample } from '../types';

interface PairedEmotionBatchPageProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const PairedEmotionBatchPage: React.FC<PairedEmotionBatchPageProps> = ({
  onSampleCreated,
  addToast
}) => {
  const [sentencesText, setSentencesTextState] = useState(() => {
    try {
      return localStorage.getItem('paired_sentences_draft') || '';
    } catch {
      return '';
    }
  });

  const setSentencesText = (val: string) => {
    setSentencesTextState(val);
    try {
      localStorage.setItem('paired_sentences_draft', val);
    } catch { }
  };
  const [language, setLanguage] = useState<'ckb' | 'kmr' | 'ar' | 'en'>('ckb');
  const [speakerId, setSpeakerId] = useState('spk01');
  const [voiceName, setVoiceName] = useState('Arlo');
  const [startIdx, setStartIdx] = useState(1);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
  const [mode, setMode] = useState<'sliced' | 'individual'>('sliced');
  const [chunkSize, setChunkSize] = useState<number>(6);
  const [slicingStrategy, setSlicingStrategy] = useState<'kurdish_align' | 'markers' | 'silence'>(() => {
    try {
      const saved = localStorage.getItem('paired_slicing_strategy_v3');
      if (saved === 'kurdish_align' || saved === 'markers' || saved === 'silence') return saved;
      return 'kurdish_align';
    } catch {
      return 'kurdish_align';
    }
  });
  const [randomizeVoices, setRandomizeVoices] = useState(true);

  const handleSlicingStrategyChange = (st: 'kurdish_align' | 'markers' | 'silence') => {
    setSlicingStrategy(st);
    try {
      localStorage.setItem('paired_slicing_strategy_v3', st);
    } catch { }
  };

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      return localStorage.getItem('paired_selected_model_v1') || 'gemini-3.8-flash-tts';
    } catch {
      return 'gemini-3.8-flash-tts';
    }
  });

  const handleModelChange = (m: string) => {
    setSelectedModel(m);
    try {
      localStorage.setItem('paired_selected_model_v1', m);
    } catch { }
  };

  // Auto-fetch the next available sentence index globally from server
  const fetchNextIndex = React.useCallback(async () => {
    setIsRefreshingIndex(true);
    try {
      const res = await fetch(`/api/paired/next-index?speakerId=${encodeURIComponent(speakerId)}`);
      const data = await res.json();
      if (data && typeof data.nextIndex === 'number' && Number.isFinite(data.nextIndex)) {
        setStartIdx(data.nextIndex);
      }
    } catch (err) {
      console.warn('[Paired Studio] Failed to auto-fetch next index:', err);
    } finally {
      setIsRefreshingIndex(false);
    }
  }, [speakerId]);

  // Initial fetch on mount and whenever speaker changes
  React.useEffect(() => {
    fetchNextIndex();
  }, [fetchNextIndex]);

  const [emotions, setEmotions] = useState<Record<string, SelectedEmotion>>(() => {
    const map: Record<string, SelectedEmotion> = {};
    REQUIRED_EMOTIONS.forEach(r => { map[r.id] = { emotion: r.id, intensity: r.defaultIntensity, enabled: true }; });
    OPTIONAL_EMOTIONS.forEach(o => { map[o.id] = { emotion: o.id, intensity: o.defaultIntensity, enabled: false }; });
    return map;
  });

  const sentences = sentencesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const enabledEmotionsList = Object.values(emotions).filter(e => e.enabled);

  const engine = usePairedBatchEngine({
    sentences, enabledEmotionsList, startIdx, speakerId, voiceName,
    language, mode, model: selectedModel, chunkSize, slicingStrategy, randomizeVoices, onSampleCreated, addToast
  });

  // Re-fetch next index whenever a batch run finishes or halts
  const prevActiveRef = React.useRef(engine.batchState.isActive);
  React.useEffect(() => {
    if (prevActiveRef.current && !engine.batchState.isActive) {
      fetchNextIndex();
    }
    prevActiveRef.current = engine.batchState.isActive;
  }, [engine.batchState.isActive, fetchNextIndex]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Hero Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#fff' }}>
            <Layers size={22} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Paired Emotion Dataset Studio
          </h1>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            TTS Training Pipeline
          </span>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', fontWeight: 600 }}>
            Model: {selectedModel} (Default: 3.8 Flash TTS)
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
          Decoupled emotional speech generation: <strong>Same Speaker + Same Sentence + 6 Emotions</strong> with shared <code>family_id</code>.
        </p>
      </div>

      {/* Progress Bar & Error Catching Diagnostics */}
      <BatchProgressBar
        isActive={engine.batchState.isActive}
        isPaused={engine.batchState.isPaused}
        completedClips={engine.batchState.completedClips}
        totalClips={engine.totalClips}
        currentSentenceIdx={engine.batchState.currentSentenceIdx}
        totalSentences={sentences.length}
        currentFamilyId={engine.batchState.currentFamilyId}
        currentEmotion={engine.batchState.currentEmotion}
        currentSpeaker={engine.currentSpeakerInfo.speaker}
        currentVoice={engine.currentSpeakerInfo.voice}
        mode={mode}
        chunkSize={chunkSize}
        startTime={engine.startTime}
        onTogglePause={engine.togglePause}
        onStop={engine.handleStop}
      />

      {/* Master Audio Preview (Raw Pre-Sliced Audio - Not Saved to Dataset) */}
      <MasterAudioPreviewPlayer isBatchActive={engine.batchState.isActive} />

      <BatchErrorInspector
        stopReason={engine.stopReason}
        errors={engine.errorList}
        onClearErrors={engine.clearErrors}
      />

      {/* Main Form Cards */}
      <GenerationModeSelector
        mode={mode}
        onChange={setMode}
        chunkSize={chunkSize}
        onChunkSizeChange={setChunkSize}
        slicingStrategy={slicingStrategy}
        onSlicingStrategyChange={handleSlicingStrategyChange}
        sentenceCount={sentences.length}
        emotionCount={enabledEmotionsList.length}
        disabled={engine.batchState.isActive}
      />

      <SentenceInputSection
        text={sentencesText}
        onChange={setSentencesText}
        language={language}
        onLanguageChange={setLanguage}
        startIdx={startIdx}
      />

      <SpeakerConfigSection
        speakerId={speakerId}
        onSpeakerIdChange={setSpeakerId}
        voiceName={voiceName}
        onVoiceNameChange={setVoiceName}
        startIdx={startIdx}
        onStartIdxChange={setStartIdx}
        randomizeVoices={randomizeVoices}
        onRandomizeVoicesChange={setRandomizeVoices}
        selectedModel={selectedModel}
        onSelectedModelChange={handleModelChange}
        onRefreshNextIndex={fetchNextIndex}
        isRefreshingNextIndex={isRefreshingIndex}
      />

      <EmotionSelectorSection emotions={emotions} onChange={setEmotions} />

      {/* Sticky Bottom Action Bar */}
      <BatchBottomActionBar
        sentenceCount={sentences.length}
        emotionCount={enabledEmotionsList.length}
        totalClips={engine.totalClips}
        mode={mode}
        chunkSize={chunkSize}
        randomizeVoices={randomizeVoices}
        isActive={engine.batchState.isActive}
        isPaused={engine.batchState.isPaused}
        onTogglePause={engine.togglePause}
        onStop={engine.handleStop}
        onStart={engine.handleStartBatch}
      />
    </div>
  );
};
