import React, { useState, useRef, useEffect } from 'react';
import { Package, Sparkles, Layers, Sliders, Play, RotateCcw } from 'lucide-react';
import { 
  PILOT_SPEAKERS, 
  PILOT_DEFAULT_SENTENCES, 
  MATRIX_CONDITIONS, 
  MatrixCondition, 
  PilotSpeaker, 
  ExpressiveTake 
} from './expressiveConstants';
import { 
  MIXED_CONDITIONS, 
  MIXED_18_CONDITIONS, 
  MIXED_54_CONDITIONS, 
  MIXED_9_CONDITIONS, 
  MixedCondition 
} from './expressiveMixedConstants';
import { ExpressiveLanguage } from './expressiveFamilyTypes';
import { useExpressiveBatchRunner, BatchExecutionMode } from './useExpressiveBatchRunner';
import { ExpressiveBatchSetup } from './ExpressiveBatchSetup';
import { ExpressiveBatchProgressBar } from './ExpressiveBatchProgressBar';
import { ExpressiveFamiliesView } from './ExpressiveFamiliesView';
import { ExpressiveExportModal } from './ExpressiveExportModal';
import { ExpressiveMatrixGrid } from './ExpressiveMatrixGrid';
import { ExpressiveMixedGrid } from './ExpressiveMixedGrid';
import { ExpressiveCustomMixer } from './ExpressiveCustomMixer';
import { ExpressiveInputBar } from './ExpressiveInputBar';
import { ExpressiveTakesList } from './ExpressiveTakesList';
import { generateGeminiSpeech, fetchNextFamilyIndex } from '../../services/api';
import { loadStoredExpressiveBatch } from './expressiveBatchStorage';

interface ExpressivePilotPageProps {
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ExpressivePilotPage: React.FC<ExpressivePilotPageProps> = ({ addToast }) => {
  const [topTab, setTopTab] = useState<'batch' | 'playground'>('batch');
  const initialBatch = loadStoredExpressiveBatch();

  // Automated Batch Setup State
  const [sentencesText, setSentencesText] = useState(() => 
    initialBatch?.sentences?.length 
      ? initialBatch.sentences.join('\n') 
      : PILOT_DEFAULT_SENTENCES.slice(0, 3).map(s => s.text).join('\n')
  );
  const [language, setLanguage] = useState<ExpressiveLanguage>(initialBatch?.language || 'ckb');
  const [batchSpeaker, setBatchSpeaker] = useState<PilotSpeaker>(() => {
    if (initialBatch?.selectedSpeakerId) {
      return PILOT_SPEAKERS.find(s => s.id === initialBatch.selectedSpeakerId) || PILOT_SPEAKERS[0];
    }
    return PILOT_SPEAKERS[0];
  });
  const [autoRotate, setAutoRotate] = useState(initialBatch ? initialBatch.autoRotateSpeakers : true);
  const [startIdx, setStartIdx] = useState(initialBatch?.startIdx || 1);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
  const [presetTier, setPresetTier] = useState<'core27' | 'hardest5' | 'mixed9' | 'mixed18' | 'mixed54' | 'all81'>('all81');
  const [batchMode, setBatchMode] = useState<BatchExecutionMode>(initialBatch?.batchMode || 'sliced');
  const [chunkSize, setChunkSize] = useState<number>(initialBatch?.chunkSize || 6);

  // Interactive Playground State
  const [playMode, setPlayMode] = useState<'core' | 'mixed' | 'custom'>('core');
  const [singleSpeaker, setSingleSpeaker] = useState<PilotSpeaker>(PILOT_SPEAKERS[0]);
  const [singleSentenceId, setSingleSentenceId] = useState(PILOT_DEFAULT_SENTENCES[0].id);
  const [singleText, setSingleText] = useState(PILOT_DEFAULT_SENTENCES[0].text);
  const [singleCoreCond, setSingleCoreCond] = useState<MatrixCondition>(MATRIX_CONDITIONS[0]);
  const [singleMixCond, setSingleMixCond] = useState<MixedCondition>(MIXED_CONDITIONS[0]);
  const [isSingleGen, setIsSingleGen] = useState(false);

  // Audio Playback & Modal State
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [singleTakes, setSingleTakes] = useState<ExpressiveTake[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshNextIndex = async () => {
    if (loadStoredExpressiveBatch()?.isActive) return;
    setIsRefreshingIndex(true);
    try {
      const res = await fetchNextFamilyIndex();
      if (res && typeof res.nextIndex === 'number') {
        setStartIdx(res.nextIndex);
      }
    } catch (e) {
      console.warn('Failed to fetch next family index:', e);
    } finally {
      setIsRefreshingIndex(false);
    }
  };

  useEffect(() => {
    refreshNextIndex();
  }, []);

  const getActiveBatchConditions = () => {
    switch (presetTier) {
      case 'core27': return MATRIX_CONDITIONS;
      case 'hardest5': {
        const diffIds = ['ang_whisp_high', 'ang_laugh_high', 'sad_whisp_high', 'hap_laugh_high', 'neu_whisp'];
        return MATRIX_CONDITIONS.filter(c => diffIds.includes(c.id));
      }
      case 'mixed9': return MIXED_9_CONDITIONS;
      case 'mixed18': return MIXED_18_CONDITIONS;
      case 'mixed54': return MIXED_54_CONDITIONS;
      case 'all81': return [...MATRIX_CONDITIONS, ...MIXED_54_CONDITIONS];
    }
  };

  const parsedSentences = sentencesText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  const runner = useExpressiveBatchRunner({
    sentences: parsedSentences,
    conditions: getActiveBatchConditions(),
    language,
    selectedSpeaker: batchSpeaker,
    autoRotateSpeakers: autoRotate,
    startIdx,
    batchMode,
    chunkSize,
    addToast
  });

  const handleTogglePlay = (take: ExpressiveTake) => {
    if (!take.audioBase64 && !take.audioBlobUrl) return;
    if (audioRef.current) audioRef.current.pause();
    if (currentlyPlayingId === take.id) {
      setCurrentlyPlayingId(null);
      return;
    }
    const audioSrc = take.audioBlobUrl || `data:audio/wav;base64,${take.audioBase64}`;
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    setCurrentlyPlayingId(take.id);
    audio.play().catch(e => console.error(e));
    audio.onended = () => setCurrentlyPlayingId(null);
  };

  const handleTestSingle = async (directive: string, em: string, int: number, del: 'normal' | 'whisper' | 'laughing_speech', idPrefix: string) => {
    if (!singleText.trim()) return;
    setIsSingleGen(true);
    try {
      const cleanId = `exp_single_${singleSpeaker.voiceName.toLowerCase()}_${Date.now().toString(36)}`;
      const res = await generateGeminiSpeech({
        text: singleText,
        voiceName: singleSpeaker.voiceName,
        dialect: 'sorani',
        model: 'gemini-3.8-flash-tts',
        promptInstruction: `You are a native Central Kurdish (Sorani) voice actor for Audar speech synthesis. ${directive}`,
        saveToDataset: false,
        customId: cleanId
      });
      if (res.success && res.audioBase64) {
        const take: ExpressiveTake = {
          id: cleanId,
          scriptId: singleSentenceId,
          transcript: singleText,
          speakerId: singleSpeaker.id,
          speakerName: singleSpeaker.name,
          speakerGender: singleSpeaker.gender,
          language: 'ckb',
          emotion: em as any,
          emotionIntensity: int,
          delivery: del,
          intensityLabel: int >= 0.8 ? 'high' : int >= 0.5 ? 'medium' : 'low',
          conditionId: idPrefix,
          duration: res.durationSeconds || 3.5,
          audioBase64: res.audioBase64,
          createdAt: Date.now(),
          status: 'approved',
          review: { reviewer_id: 'REVIEWER_01', emotion_correct: true, delivery_correct: true, intensity_level: 'high', naturalness: 4 }
        };
        setSingleTakes(prev => [take, ...prev]);
        handleTogglePlay(take);
        addToast?.({ type: 'success', title: 'Take Ready' });
      }
    } catch (err: any) { addToast?.({ type: 'error', title: 'Failed', message: err.message }); }
    finally { setIsSingleGen(false); }
  };

  // Collect all takes from families + single playground takes
  const allTakes = [...runner.families.flatMap(f => f.takes), ...singleTakes];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#8B5CF6' }}>☀️</span> Audar Expressive Dataset Studio
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>
            Automated Family Generation in Kurdish, Arabic & English powered by Gemini 3.8 Flash TTS.
          </p>
        </div>

        <button
          onClick={() => setIsExportOpen(true)}
          className="btn btn-primary btn-sm"
          disabled={allTakes.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Package size={15} /> Export Audar Package ({allTakes.length} Clips)
        </button>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setTopTab('batch')}
          className={`btn btn-sm ${topTab === 'batch' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600 }}
        >
          <Layers size={16} /> Automated Family Batch (Kurdish • Arabic • English)
        </button>
        <button
          onClick={() => setTopTab('playground')}
          className={`btn btn-sm ${topTab === 'playground' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600 }}
        >
          <Sliders size={16} /> Interactive Lab & Dual Sliders
        </button>
      </div>

      {topTab === 'batch' ? (
        <>
          <ExpressiveBatchSetup
            sentencesText={sentencesText}
            onChangeSentencesText={setSentencesText}
            language={language}
            onChangeLanguage={setLanguage}
            selectedSpeaker={batchSpeaker}
            onChangeSpeaker={setBatchSpeaker}
            autoRotateSpeakers={autoRotate}
            onToggleAutoRotate={setAutoRotate}
            startIdx={startIdx}
            onChangeStartIdx={setStartIdx}
            onRefreshNextIndex={refreshNextIndex}
            isRefreshingNextIndex={isRefreshingIndex}
            selectedPresetTier={presetTier}
            onChangePresetTier={setPresetTier}
            batchMode={batchMode}
            onChangeBatchMode={setBatchMode}
            chunkSize={chunkSize}
            onChangeChunkSize={setChunkSize}
            onStartBatch={runner.startBatch}
            isBatchActive={runner.batchState.isActive}
          />

          <ExpressiveBatchProgressBar
            batchState={runner.batchState}
            startTime={runner.startTime}
            onTogglePause={runner.togglePause}
            onStop={runner.stopBatch}
          />

          <ExpressiveFamiliesView
            families={runner.families}
            currentlyPlayingId={currentlyPlayingId}
            onTogglePlay={handleTogglePlay}
            onClearAllFamilies={() => runner.setFamilies([])}
          />
        </>
      ) : (
        <>
          <ExpressiveInputBar
            selectedSpeaker={singleSpeaker}
            onSelectSpeaker={setSingleSpeaker}
            selectedSentenceId={singleSentenceId}
            sentenceText={singleText}
            onSelectSentence={s => { setSingleSentenceId(s.id); setSingleText(s.text); }}
            onChangeSentenceText={setSingleText}
            onGenerateNeutralReference={() => handleTestSingle('Speak in neutral calm baseline.', 'neutral', 0, 'normal', 'neu_ref')}
            isGenerating={isSingleGen}
          />

          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            <button onClick={() => setPlayMode('core')} className={`btn btn-sm ${playMode === 'core' ? 'btn-primary' : 'btn-secondary'}`}>Core 27-Matrix</button>
            <button onClick={() => setPlayMode('mixed')} className={`btn btn-sm ${playMode === 'mixed' ? 'btn-primary' : 'btn-secondary'}`}>Pilot Mixed 9</button>
            <button onClick={() => setPlayMode('custom')} className={`btn btn-sm ${playMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}>Custom Sliders</button>
          </div>

          {playMode === 'core' && <ExpressiveMatrixGrid selectedConditionId={singleCoreCond.id} onSelectCondition={c => { setSingleCoreCond(c); handleTestSingle(c.actingDirective, c.emotion, c.intensityValue, c.delivery, c.id); }} />}
          {playMode === 'mixed' && <ExpressiveMixedGrid selectedConditionId={singleMixCond.id} onSelectCondition={m => { setSingleMixCond(m); handleTestSingle(m.actingDirective, m.primaryEmotion, m.primaryIntensity, 'normal', m.id); }} />}
          {playMode === 'custom' && <ExpressiveCustomMixer onGenerateCustom={cfg => handleTestSingle(cfg.directive, cfg.emotionA, cfg.intensityA, cfg.delivery, 'custom_mix')} isGenerating={isSingleGen} />}

          <ExpressiveTakesList takes={singleTakes} currentlyPlayingId={currentlyPlayingId} onTogglePlay={handleTogglePlay} onDeleteTake={id => setSingleTakes(prev => prev.filter(t => t.id !== id))} />
        </>
      )}

      {isExportOpen && <ExpressiveExportModal takes={allTakes} onClose={() => setIsExportOpen(false)} />}
    </div>
  );
};
