import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sample, Voice, Model, EmotionType, SystemConfig, SampleRatings } from '../../types';
import { generateApiSpeech, fetchVoices, fetchModels, updateSample, addKeyToPool } from '../../services/api';
import { EMOTIONS } from '../../constants/emotions';

interface UseApiGenerationStateProps {
  config: SystemConfig | null;
  onOpenSettings: () => void;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  onConfigUpdated?: (config: SystemConfig) => void;
}

export function useApiGenerationState({
  config,
  onOpenSettings,
  onSampleCreated,
  addToast,
  onConfigUpdated
}: UseApiGenerationStateProps) {
  const [kurdishText, setKurdishText] = useState('سڵاو! [laugh] چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('laughing');
  const [selectedEmotions] = useState<string[]>(['laughing']);
  const [whisperEntire, setWhisperEntire] = useState(false);
  const [showInlineKeyEdit, setShowInlineKeyEdit] = useState(false);

  const [voices, setVoices] = useState<Voice[]>([]);
  const [, setModels] = useState<Model[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('eleven_v3');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [styleExaggeration, setStyleExaggeration] = useState(0.0);
  const [speakerBoost, setSpeakerBoost] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCatalog();
  }, [config?.keyValid]);

  const loadCatalog = async () => {
    if (!config?.keyValid) return;
    setLoadingVoices(true);
    try {
      const [vList, mList] = await Promise.all([fetchVoices().catch(() => []), fetchModels().catch(() => [])]);
      setVoices(vList);
      setModels(mList);
      if (vList.length > 0 && !selectedVoiceId) setSelectedVoiceId(vList[0].voice_id);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kurdishText.trim()) {
      addToast({ type: 'error', title: 'Input Error', message: 'Please enter Kurdish text to generate speech.' });
      return;
    }
    if (!config?.keyValid) {
      addToast({ type: 'error', title: 'API Key Missing', message: 'Please add at least one ElevenLabs API Key in Settings.' });
      onOpenSettings();
      return;
    }

    const currentVoice = voices.find(v => v.voice_id === selectedVoiceId);
    const effectiveModelId = isCustomModel ? (customModelText.trim() || 'eleven_v3') : selectedModelId;
    const activeEmotionObj = EMOTIONS.find(e => e.value === selectedEmotion);

    setGenerating(true);
    try {
      const response = await generateApiSpeech({
        text: kurdishText.trim(),
        emotion: selectedEmotion,
        emotions: selectedEmotions,
        emotionTag: activeEmotionObj?.tag || '',
        includeTagInPrompt: true,
        whisperEntire,
        voiceId: selectedVoiceId || '21m00Tcm4TlvDq8ikWAM',
        voiceName: currentVoice ? currentVoice.name : undefined,
        modelId: effectiveModelId,
        voiceSettings: {
          stability: whisperEntire ? 0.35 : stability,
          similarity_boost: similarityBoost,
          style: whisperEntire ? 0.45 : styleExaggeration,
          use_speaker_boost: speakerBoost
        }
      });

      const newSample = response.sample;
      setCurrentSample(newSample);
      onSampleCreated(newSample);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      addToast({ type: 'success', title: 'Speech Generated Successfully!', message: `Saved as ${newSample.id}.wav` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Speech Generation Failed', message: err.message || 'ElevenLabs API error.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRatings = async (ratings: SampleRatings) => {
    if (!currentSample) return;
    try {
      const updated = await updateSample(currentSample.id, { ratings });
      setCurrentSample(updated);
      onSampleCreated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: 'Evaluation saved to metadata JSON.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  const handleAddInlineKey = async (apiKey: string) => {
    try {
      const res = await addKeyToPool(apiKey);
      addToast({ type: 'success', title: 'API Key Added to Pool', message: res.message || 'Key added successfully.' });
      onConfigUpdated?.({
        status: 'ok',
        isKeyConfigured: true,
        keyValid: true,
        poolSize: res.pool.length,
        validationError: null,
        maskedKey: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
      });
      setShowInlineKeyEdit(false);
      loadCatalog();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Validation Failed', message: err.message || 'Invalid API Key.' });
    }
  };

  return {
    kurdishText, setKurdishText,
    selectedEmotion, setSelectedEmotion,
    whisperEntire, setWhisperEntire,
    showInlineKeyEdit, setShowInlineKeyEdit,
    voices, selectedVoiceId, setSelectedVoiceId,
    selectedModelId, setSelectedModelId,
    isCustomModel, setIsCustomModel,
    customModelText, setCustomModelText,
    loadingVoices, loadCatalog,
    showAdvanced, setShowAdvanced,
    stability, setStability,
    similarityBoost, setSimilarityBoost,
    styleExaggeration, setStyleExaggeration,
    speakerBoost, setSpeakerBoost,
    generating, currentSample, setCurrentSample,
    activePlaybackTime, setActivePlaybackTime,
    inspectingSample, setInspectingSample,
    resultRef,
    handleGenerate, handleSaveRatings, handleAddInlineKey
  };
}
