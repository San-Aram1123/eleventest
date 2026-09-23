import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { SentenceInputSection } from '../components/paired/SentenceInputSection';
import { SpeakerConfigSection } from '../components/paired/SpeakerConfigSection';
import { EmotionSelectorSection } from '../components/paired/EmotionSelectorSection';
import { GenerationModeSelector } from '../components/paired/GenerationModeSelector';
import { BatchProgressBar } from '../components/paired/BatchProgressBar';
import { BatchErrorInspector } from '../components/paired/BatchErrorInspector';
import { BatchBottomActionBar } from '../components/paired/BatchBottomActionBar';
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

  const sentences = sentencesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const enabledEmotionsList = Object.values(emotions).filter(e => e.enabled);

  const engine = usePairedBatchEngine({
    sentences, enabledEmotionsList, startIdx, speakerId, voiceName,
    language, mode, randomizeVoices, onSampleCreated, addToast
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Top Hero Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#fff' }}>
            <Layers size={22} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Paired Emotion Dataset Studio
          </h1>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            TTS Training Pipeline
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
        startTime={engine.startTime}
        onTogglePause={engine.togglePause}
        onStop={engine.handleStop}
      />

      <BatchErrorInspector
        stopReason={engine.stopReason}
        errors={engine.errorList}
        onClearErrors={engine.clearErrors}
      />

      {/* Main Form Cards */}
      <GenerationModeSelector
        mode={mode}
        onChange={setMode}
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
      />

      <EmotionSelectorSection emotions={emotions} onChange={setEmotions} />

      {/* Sticky Bottom Action Bar */}
      <BatchBottomActionBar
        sentenceCount={sentences.length}
        emotionCount={enabledEmotionsList.length}
        totalClips={engine.totalClips}
        mode={mode}
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
