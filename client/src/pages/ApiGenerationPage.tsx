import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Sliders, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileCode, 
  Tag, 
  Info,
  Layers,
  Wind,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KurdishEditor } from '../components/KurdishEditor';
import { AudioPlayer } from '../components/AudioPlayer';
import { AlignmentTimeline } from '../components/AlignmentTimeline';
import { RatingWidget } from '../components/RatingWidget';
import { MetadataModal } from '../components/MetadataModal';
import { 
  Sample, 
  Voice, 
  Model, 
  EmotionType, 
  SystemConfig, 
  SampleRatings 
} from '../types';
import { 
  generateApiSpeech, 
  fetchVoices, 
  fetchModels, 
  updateSample,
  updateApiKey,
  addKeyToPool,
  fetchKeyPool 
} from '../services/api';
import { KeyRound, Save, Key, ExternalLink, Zap, Plus, Settings } from 'lucide-react';

interface ApiGenerationPageProps {
  config: SystemConfig | null;
  onOpenSettings: () => void;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  onConfigUpdated?: (config: SystemConfig) => void;
}

const EMOTIONS: { value: EmotionType; label: string; tag: string; color: string; desc: string }[] = [
  { value: 'neutral', label: 'Neutral', tag: '', color: 'neutral', desc: 'Standard baseline tone' },
  { value: 'laughing', label: 'Laughing', tag: '[laugh]', color: 'laughing', desc: 'Native v3 laughter & cheerful delivery' },
  { value: 'happy', label: 'Happy', tag: '[happy]', color: 'happy', desc: 'Joyful & upbeat inflection' },
  { value: 'whisper', label: 'Whisper', tag: '[whisper]', color: 'whisper', desc: 'Soft breathy whisper' },
  { value: 'angry', label: 'Angry', tag: '[angry]', color: 'angry', desc: 'Sharp, aggressive intensity' },
  { value: 'sad', label: 'Sad', tag: '[sad]', color: 'sad', desc: 'Melancholic, slower cadence' },
  { value: 'excited', label: 'Excited', tag: '[excited]', color: 'excited', desc: 'Energetic, dynamic pitch' },
  { value: 'custom', label: 'Custom Tag', tag: '[laugh]', color: 'custom', desc: 'User-defined audio tag prompt' }
];

export const ApiGenerationPage: React.FC<ApiGenerationPageProps> = ({
  config,
  onOpenSettings,
  onSampleCreated,
  addToast,
  onConfigUpdated
}) => {
  // Form State
  const [kurdishText, setKurdishText] = useState('سڵاو! [laugh] چۆنی؟ ئەمڕۆ زۆر دڵخۆشم، چونکە شتێکی زۆر خۆش ڕوویدا.');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('laughing');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['laughing']);
  const [customEmotionTag, setCustomEmotionTag] = useState('');
  const [includeTagInPrompt, setIncludeTagInPrompt] = useState(true);
  const [whisperEntire, setWhisperEntire] = useState(false);
  
  // Inline API Key Management
  const [showInlineKeyEdit, setShowInlineKeyEdit] = useState(false);
  const [inlineApiKey, setInlineApiKey] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);

  // Voice & Model Selection
  const [voices, setVoices] = useState<Voice[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('eleven_v3');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelText, setCustomModelText] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Advanced Voice Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [styleExaggeration, setStyleExaggeration] = useState(0.0);
  const [speakerBoost, setSpeakerBoost] = useState(true);

  // Output / Generation State
  const [generating, setGenerating] = useState(false);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [activePlaybackTime, setActivePlaybackTime] = useState(0);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);

  // Ref to result container for auto-scroll and center viewing
  const resultRef = useRef<HTMLDivElement | null>(null);

  const poolCount = config?.poolSize || (config?.isKeyConfigured ? 1 : 0);

  // Load Voices & Models on Mount or when API Key updates
  useEffect(() => {
    loadCatalog();
  }, [config?.keyValid]);

  const loadCatalog = async () => {
    if (!config?.keyValid) return;
    setLoadingVoices(true);
    try {
      const [voicesList, modelsList] = await Promise.all([
        fetchVoices().catch(() => []),
        fetchModels().catch(() => [])
      ]);
      setVoices(voicesList);
      setModels(modelsList);
      if (voicesList.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(voicesList[0].voice_id);
      }
    } catch (err) {
      console.warn('Could not load voice catalog:', err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleSelectPreset = (text: string, suggestedEmotion?: string) => {
    setKurdishText(text);
    if (suggestedEmotion && EMOTIONS.some(e => e.value === suggestedEmotion)) {
      setSelectedEmotion(suggestedEmotion as EmotionType);
    }
  };

  // Toggle multi-select emotions or insert inline tag
  const handleEmotionClick = (em: typeof EMOTIONS[0]) => {
    setSelectedEmotion(em.value);
    
    // Toggle in multi-emotions list
    if (selectedEmotions.includes(em.value)) {
      setSelectedEmotions(prev => prev.filter(e => e !== em.value));
    } else {
      setSelectedEmotions(prev => [...prev, em.value]);
    }

    if (em.tag) {
      // Append or insert tag to text if not present
      if (!kurdishText.includes(em.tag)) {
        setKurdishText(prev => `${em.tag} ${prev}`);
        addToast({
          type: 'info',
          title: `Tag ${em.tag} Added`,
          message: `Inserted ${em.tag} to prompt text.`
        });
      }
    }
  };

  const activeEmotionObj = EMOTIONS.find(e => e.value === selectedEmotion);
  const effectiveTag = selectedEmotion === 'custom' 
    ? customEmotionTag 
    : (activeEmotionObj?.tag || '');

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

    setGenerating(true);
    try {
      const response = await generateApiSpeech({
        text: kurdishText.trim(),
        emotion: selectedEmotion,
        emotions: selectedEmotions,
        emotionTag: effectiveTag,
        includeTagInPrompt,
        whisperEntire,
        voiceId: selectedVoiceId || '21m00Tcm4TlvDq8ikWAM',
        voiceName: currentVoice ? currentVoice.name : undefined,
        modelId: effectiveModelId,
        voiceSettings: {
          stability: whisperEntire ? 0.35 : stability, // Soften stability slightly for continuous whisper
          similarity_boost: similarityBoost,
          style: whisperEntire ? 0.45 : styleExaggeration, // Enhance style expression for whisper
          use_speaker_boost: speakerBoost
        }
      });

      const newSample = response.sample;
      setCurrentSample(newSample);
      onSampleCreated(newSample);

      // Smoothly bring the result directly into center view
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      addToast({
        type: 'success',
        title: 'Speech Generated Successfully!',
        message: `Sample saved as ${newSample.id}.wav and ${newSample.id}.json with clean Kurdish transcript.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Speech Generation Failed',
        message: err.message || 'ElevenLabs API returned an error.'
      });
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

  const handleSaveInlineApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineApiKey.trim()) return;
    setSavingApiKey(true);
    try {
      const res = await addKeyToPool(inlineApiKey.trim());
      addToast({
        type: 'success',
        title: 'API Key Added to Pool',
        message: res.message || 'Key validated and added to pool successfully.'
      });
      if (onConfigUpdated) {
        onConfigUpdated({
          status: 'ok',
          isKeyConfigured: true,
          keyValid: true,
          poolSize: res.pool.length,
          validationError: null,
          maskedKey: `${inlineApiKey.slice(0, 4)}...${inlineApiKey.slice(-4)}`
        });
      }
      setInlineApiKey('');
      setShowInlineKeyEdit(false);
      loadCatalog();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Validation Failed',
        message: err.message || 'Invalid ElevenLabs API Key.'
      });
    } finally {
      setSavingApiKey(false);
    }
  };

  return (
    <div className="api-page-root">
      {/* Page Title & Subtitle */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} className="text-cyan inline-icon" />
            <span>ElevenLabs Multi-Key Speech Generator</span>
          </h1>
          <p className="page-description">
            Synthesize Kurdish emotional speech with ElevenLabs v3. Supports multiple inline tags (<code>[laugh]</code>, <code>[whisper]</code>, <code>[sigh]</code>), full continuous whispering, and <strong>automatic multi-key quota failover</strong> while preserving exact clean Unicode transcripts.
          </p>
        </div>
      </div>

      {/* Prominent Multi-Key Pool & Connection Banner */}
      <div className={`glass-card api-config-banner ${config?.keyValid ? 'config-connected' : 'config-missing'}`}>
        <div className="config-banner-left">
          <div className="config-icon-badge">
            {config?.keyValid ? (
              <Zap size={20} className="text-emerald" />
            ) : (
              <KeyRound size={20} className="text-amber" />
            )}
          </div>
          <div className="config-info">
            <div className="config-status-title">
              <span>ElevenLabs Multi-Key Pool:</span>
              {config?.keyValid ? (
                <>
                  <span className="badge badge-emerald">{poolCount} Key{poolCount > 1 ? 's' : ''} Active</span>
                  <span className="badge badge-purple">Auto-Failover On</span>
                </>
              ) : (
                <span className="badge badge-amber">No Keys Configured</span>
              )}
            </div>
            <div className="config-status-desc">
              {config?.keyValid 
                ? `Pool active with ${poolCount} account(s). If any key runs out of quota, generation automatically switches to the next available account.`
                : 'Add one or more ElevenLabs API keys to enable synthesis. Multiple accounts will automatically failover.'}
            </div>
          </div>
        </div>

        <div className="config-banner-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowInlineKeyEdit(!showInlineKeyEdit)}
          >
            <Plus size={14} />
            <span>{showInlineKeyEdit ? 'Cancel' : 'Quick Add Key'}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={onOpenSettings}
          >
            <Settings size={14} />
            <span>Manage Key Pool</span>
          </button>
        </div>
      </div>

      {/* Inline API Key Form Drawer */}
      {showInlineKeyEdit && (
        <form onSubmit={handleSaveInlineApiKey} className="inline-key-form-card glass-card">
          <div className="key-form-row">
            <input
              type="password"
              className="input-control"
              placeholder="Paste xi-api-key here to add to pool (e.g. sk_...)"
              value={inlineApiKey}
              onChange={(e) => setInlineApiKey(e.target.value)}
              id="inline-api-key-input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={savingApiKey || !inlineApiKey.trim()}
            >
              <Plus size={14} />
              <span>{savingApiKey ? 'Validating...' : 'Add to Pool'}</span>
            </button>
          </div>
          <div className="key-form-hint">
            🔒 Key will be validated and added to the failover pool (<code>.env</code> & <code>keys.json</code>).
          </div>
        </form>
      )}

      <div className="api-grid-layout">
        {/* Left Column: Generation Controls */}
        <form onSubmit={handleGenerate} className="glass-card generator-form-card">
          {/* Kurdish Text Editor with Inline Audio Tag Insertion */}
          <div className="form-group">
            <KurdishEditor
              value={kurdishText}
              onChange={setKurdishText}
              onSelectPreset={handleSelectPreset}
              label="Kurdish Transcript with Inline Tags"
              disabled={generating}
              showInlineTagToolbar={true}
            />
          </div>

          {/* Whisper Entire Speech Feature */}
          <div className="whisper-banner-card">
            <label className="whisper-checkbox-row">
              <input
                type="checkbox"
                checked={whisperEntire}
                onChange={(e) => setWhisperEntire(e.target.checked)}
              />
              <div className="whisper-label-wrap">
                <div className="whisper-title">
                  <Wind size={16} className="text-purple" />
                  <span>💨 Whisper Throughout Entire Audio</span>
                  <span className="badge badge-purple">Continuous Mode</span>
                </div>
                <div className="whisper-desc">
                  Instructs ElevenLabs v3 to maintain a continuous, soft whisper from the first word to the end of the audio track.
                </div>
              </div>
            </label>
          </div>

          {/* Voice & Model Grid */}
          <div className="grid-2 form-row-compact">
            {/* Voice Selector */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Voice ID / Preset
                </label>
                {config?.keyValid && (
                  <button
                    type="button"
                    className="reload-btn"
                    onClick={loadCatalog}
                    title="Reload voices from ElevenLabs"
                  >
                    <RefreshCw size={12} className={loadingVoices ? 'spin' : ''} />
                  </button>
                )}
              </div>

              {voices.length > 0 ? (
                <select
                  className="select-control"
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  disabled={generating}
                >
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.name} ({v.category || 'voice'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input-control"
                  placeholder="Enter ElevenLabs Voice ID (e.g. 21m00Tcm4TlvDq8ikWAM)"
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  disabled={generating}
                />
              )}
            </div>

            {/* Model Selector */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" style={{ marginBottom: 0 }}>
                  ElevenLabs Model
                </label>
                <span className="badge badge-emerald">v3 Audio Tags</span>
              </div>
              <select
                className="select-control"
                value={isCustomModel ? 'custom' : selectedModelId}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomModel(true);
                  } else {
                    setIsCustomModel(false);
                    setSelectedModelId(e.target.value);
                  }
                }}
                disabled={generating}
              >
                <option value="eleven_v3">ElevenLabs v3 (Recommended — Supports [laugh], [whisper], [sigh])</option>
                <option value="eleven_multilingual_v3">Eleven Multilingual v3</option>
                <option value="eleven_turbo_v3">Eleven Turbo v3</option>
                <option value="eleven_multilingual_v2">Eleven Multilingual v2</option>
                <option value="eleven_turbo_v2_5">Eleven Turbo v2.5 (Fast Multilingual)</option>
                <option value="eleven_flash_v2_5">Eleven Flash v2.5 (Ultra Low Latency)</option>
                <option value="eleven_flash_v2">Eleven Flash v2</option>
                <option value="eleven_monolingual_v1">Eleven English v1</option>
                <option value="custom">Custom Model ID...</option>
              </select>

              {isCustomModel && (
                <input
                  type="text"
                  className="input-control"
                  style={{ marginTop: 6 }}
                  placeholder="Enter custom model ID (e.g. eleven_v3, eleven_multilingual_v3)"
                  value={customModelText}
                  onChange={(e) => setCustomModelText(e.target.value)}
                  disabled={generating}
                />
              )}
            </div>
          </div>

          {/* Collapsible Voice Settings */}
          <div className="advanced-settings-toggle">
            <button
              type="button"
              className="aux-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Sliders size={13} />
              <span>{showAdvanced ? 'Hide Advanced Parameters' : 'Advanced Parameters (Stability, Similarity Boost, Style)'}</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-settings-panel">
              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Stability: {stability.toFixed(2)}</span>
                  <span className="slider-desc">Higher = consistent / Lower = expressive</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Similarity Boost: {similarityBoost.toFixed(2)}</span>
                  <span className="slider-desc">Closeness to original speaker voice</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Style Exaggeration: {styleExaggeration.toFixed(2)}</span>
                  <span className="slider-desc">Amplifies emotional delivery</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={styleExaggeration}
                  onChange={(e) => setStyleExaggeration(parseFloat(e.target.value))}
                  className="range-slider"
                />
              </div>

              <label className="checkbox-label" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  checked={speakerBoost}
                  onChange={(e) => setSpeakerBoost(e.target.checked)}
                />
                <span>Enable Speaker Boost (Improves clarity and volume)</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-submit-row">
            <button
              type="submit"
              className="btn btn-primary btn-lg submit-btn pulse-glow"
              disabled={generating || !kurdishText.trim()}
              id="btn-generate-speech"
            >
              {generating ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  <span>Synthesizing Kurdish Audio with ElevenLabs v3...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Kurdish Speech (API)</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Output / Active Result Card (Pinned / In-View) */}
        <div ref={resultRef} className="generation-output-container sticky-output-panel">
          {currentSample ? (
            <div className="glass-card glass-card-glow output-card">
              <div className="output-card-header">
                <div className="output-badge-group">
                  <span className="badge badge-cyan">ID: {currentSample.id}</span>
                  <span className={`badge emotion-badge-${currentSample.emotion}`}>
                    {currentSample.emotion.toUpperCase()}
                  </span>
                  <span className="badge badge-purple">{currentSample.model_id}</span>
                </div>

                <div className="output-header-actions">
                  <button
                    className="aux-btn"
                    onClick={() => setInspectingSample(currentSample)}
                    title="Inspect full JSON metadata"
                  >
                    <FileCode size={13} />
                    <span>Inspect JSON</span>
                  </button>
                </div>
              </div>

              {/* Kurdish Text Spotlight */}
              <div className="output-kurdish-box">
                <div className="output-kurdish-label">
                  <span>Preserved Kurdish Transcript (Clean Unicode)</span>
                  <span className="badge badge-emerald">Exact UTF-8</span>
                </div>
                <div className="kurdish-text output-kurdish-text" dir="rtl">
                  {currentSample.text}
                </div>
              </div>

              {/* Audio Player */}
              <div className="output-audio-section">
                <AudioPlayer
                  src={currentSample.audioUrl || `/api/dataset/${currentSample.id}/audio`}
                  sampleId={currentSample.id}
                  autoPlay={true}
                  onTimeUpdate={setActivePlaybackTime}
                />
              </div>

              {/* Alignment Timeline */}
              {currentSample.alignment && (
                <div className="output-alignment-section">
                  <AlignmentTimeline
                    alignment={currentSample.alignment}
                    currentTime={activePlaybackTime}
                  />
                </div>
              )}

              {/* Rating Widget */}
              <div className="output-rating-section">
                <RatingWidget
                  ratings={currentSample.ratings}
                  onSaveRatings={handleSaveRatings}
                />
              </div>
            </div>
          ) : (
            <div className="glass-card empty-output-card">
              <div className="empty-icon-wrap">
                <Volume2 size={36} className="text-cyan" />
              </div>
              <div className="empty-title">Ready for Speech Generation</div>
              <p className="empty-sub">
                Enter your Kurdish text on the left, insert tags like <code>[laugh]</code> or enable <code>Continuous Whisper</code>, and press <strong>Generate Kurdish Speech</strong>.
              </p>
              <div className="empty-features-list">
                <div className="feature-item">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <span>Interactive result panel opens directly in view</span>
                </div>
                <div className="feature-item">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <span>Preserves clean Kurdish text in <code>001.json</code> stripping tags</span>
                </div>
                <div className="feature-item">
                  <CheckCircle2 size={15} className="text-emerald" />
                  <span>Supports multiple inline emotion tags & continuous whisper</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Inspection Modal */}
      {inspectingSample && (
        <MetadataModal
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            if (currentSample?.id === updated.id) {
              setCurrentSample(updated);
            }
          }}
        />
      )}

      <style>{`
        .api-page-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .page-title {
          font-size: 1.65rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: -0.02em;
        }

        .inline-icon {
          color: #38BDF8;
        }

        .page-description {
          font-size: 0.92rem;
          color: var(--text-muted);
          margin-top: 4px;
          max-width: 860px;
          line-height: 1.6;
        }

        .api-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .api-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .sticky-output-panel {
          position: sticky;
          top: 84px;
        }

        .generator-form-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .whisper-banner-card {
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .api-config-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          gap: 16px;
          flex-wrap: wrap;
        }

        .config-connected {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .config-missing {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .config-banner-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .config-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .config-status-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--text-main);
        }

        .config-status-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .config-banner-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inline-key-form-card {
          padding: 14px 20px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: fadeIn 0.2s ease;
        }

        .key-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .key-form-row input {
          flex: 1;
        }

        .key-form-hint {
          font-size: 0.74rem;
          color: var(--text-dim);
        }

        .whisper-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .whisper-checkbox-row input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          accent-color: #A855F7;
          cursor: pointer;
        }

        .whisper-label-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .whisper-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #E2E8F0;
        }

        .text-purple {
          color: #C084FC;
        }

        .whisper-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .form-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .emotion-prompt-preview {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .emotions-chips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        @media (max-width: 640px) {
          .emotions-chips-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .emotion-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 6px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .emotion-chip:hover {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.4);
          color: var(--text-main);
        }

        .emotion-chip.selected {
          border-color: #38BDF8;
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .emotion-chip-label {
          font-weight: 700;
          font-size: 0.82rem;
        }

        .emotion-chip-tag {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          opacity: 0.7;
          margin-top: 2px;
        }

        .custom-emotion-input-row {
          margin-top: 10px;
        }

        .form-row-compact {
          margin-bottom: 0;
        }

        .reload-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
        }

        .reload-btn:hover {
          color: var(--text-main);
        }

        .spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .advanced-settings-toggle {
          display: flex;
        }

        .advanced-settings-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .slider-desc {
          font-weight: normal;
          color: var(--text-dim);
          font-size: 0.72rem;
        }

        .range-slider {
          width: 100%;
          accent-color: #38BDF8;
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-main);
          cursor: pointer;
        }

        .form-submit-row {
          margin-top: 8px;
        }

        .submit-btn {
          width: 100%;
        }

        /* Output Card Styling */
        .output-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .output-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .output-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .output-kurdish-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 14px 16px;
        }

        .output-kurdish-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .output-kurdish-text {
          font-size: 1.25rem;
          color: #FFFFFF;
          line-height: 1.8;
        }

        .empty-output-card {
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 480px;
          justify-content: center;
        }

        .empty-icon-wrap {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .empty-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          max-width: 380px;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .empty-features-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
          width: 100%;
          max-width: 380px;
          background: rgba(15, 23, 42, 0.5);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .feature-item code {
          font-family: var(--font-mono);
          color: #38BDF8;
        }
      `}</style>
    </div>
  );
};
