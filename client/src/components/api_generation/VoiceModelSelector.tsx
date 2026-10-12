import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Voice } from '../../types';

export interface VoiceModelSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  isCustomModel: boolean;
  onIsCustomModelChange: (isCustom: boolean) => void;
  customModelText: string;
  onCustomModelTextChange: (text: string) => void;
  loadingVoices: boolean;
  onReloadVoices: () => void;
  disabled?: boolean;
  isKeyValid?: boolean;
}

export const VoiceModelSelector: React.FC<VoiceModelSelectorProps> = ({
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
  disabled = false,
  isKeyValid = false
}) => {
  return (
    <div className="grid-2 form-row-compact">
      {/* Voice Selector */}
      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label" style={{ marginBottom: 0 }}>
            Voice ID / Preset
          </label>
          {isKeyValid && (
            <button
              type="button"
              className="reload-btn"
              onClick={onReloadVoices}
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
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={disabled}
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
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={disabled}
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
              onIsCustomModelChange(true);
            } else {
              onIsCustomModelChange(false);
              onModelChange(e.target.value);
            }
          }}
          disabled={disabled}
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
            onChange={(e) => onCustomModelTextChange(e.target.value)}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
