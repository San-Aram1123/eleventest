import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { KurdishEditor } from '../KurdishEditor';
import { Voice, EmotionType } from '../../types';
import { EMOTIONS } from '../../constants/emotions';
import { ContinuousWhisperBanner } from './ContinuousWhisperBanner';
import { VoiceModelSelector } from './VoiceModelSelector';
import { AdvancedVoiceParameters } from './AdvancedVoiceParameters';

export interface ApiGenerationFormProps {
  kurdishText: string;
  onTextChange: (text: string) => void;
  onSelectEmotion: (emotion: EmotionType) => void;
  whisperEntire: boolean;
  onWhisperEntireChange: (val: boolean) => void;
  voices: Voice[];
  selectedVoiceId: string;
  onVoiceChange: (id: string) => void;
  selectedModelId: string;
  onModelChange: (id: string) => void;
  isCustomModel: boolean;
  onIsCustomModelChange: (val: boolean) => void;
  customModelText: string;
  onCustomModelTextChange: (val: string) => void;
  loadingVoices: boolean;
  onReloadVoices: () => void;
  isKeyValid: boolean;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  stability: number;
  onStabilityChange: (val: number) => void;
  similarityBoost: number;
  onSimilarityBoostChange: (val: number) => void;
  styleExaggeration: number;
  onStyleExaggerationChange: (val: number) => void;
  speakerBoost: boolean;
  onSpeakerBoostChange: (val: boolean) => void;
  generating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ApiGenerationForm: React.FC<ApiGenerationFormProps> = ({
  kurdishText,
  onTextChange,
  onSelectEmotion,
  whisperEntire,
  onWhisperEntireChange,
  voices,
  selectedVoiceId,
  onVoiceChange,
  selectedModelId,
  onModelChange,
  isCustomModel,
  onIsCustomModelChange,
  customModelText,
  onCustomModelTextChange,
  loadingVoices,
  onReloadVoices,
  isKeyValid,
  showAdvanced,
  onToggleAdvanced,
  stability,
  onStabilityChange,
  similarityBoost,
  onSimilarityBoostChange,
  styleExaggeration,
  onStyleExaggerationChange,
  speakerBoost,
  onSpeakerBoostChange,
  generating,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="glass-card generator-form-card">
      <div className="form-group">
        <KurdishEditor
          value={kurdishText}
          onChange={onTextChange}
          onSelectPreset={(text, suggested) => {
            onTextChange(text);
            if (suggested && EMOTIONS.some(e => e.value === suggested)) {
              onSelectEmotion(suggested as EmotionType);
            }
          }}
          label="Kurdish Transcript with Inline Tags"
          disabled={generating}
          showInlineTagToolbar={true}
        />
      </div>

      <ContinuousWhisperBanner
        checked={whisperEntire}
        onChange={onWhisperEntireChange}
      />

      <VoiceModelSelector
        voices={voices}
        selectedVoiceId={selectedVoiceId}
        onVoiceChange={onVoiceChange}
        selectedModelId={selectedModelId}
        onModelChange={onModelChange}
        isCustomModel={isCustomModel}
        onIsCustomModelChange={onIsCustomModelChange}
        customModelText={customModelText}
        onCustomModelTextChange={onCustomModelTextChange}
        loadingVoices={loadingVoices}
        onReloadVoices={onReloadVoices}
        disabled={generating}
        isKeyValid={isKeyValid}
      />

      <AdvancedVoiceParameters
        showAdvanced={showAdvanced}
        onToggleAdvanced={onToggleAdvanced}
        stability={stability}
        onStabilityChange={onStabilityChange}
        similarityBoost={similarityBoost}
        onSimilarityBoostChange={onSimilarityBoostChange}
        styleExaggeration={styleExaggeration}
        onStyleExaggerationChange={onStyleExaggerationChange}
        speakerBoost={speakerBoost}
        onSpeakerBoostChange={onSpeakerBoostChange}
      />

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
  );
};
