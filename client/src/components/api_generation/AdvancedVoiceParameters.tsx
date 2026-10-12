import React from 'react';
import { Sliders } from 'lucide-react';

export interface AdvancedVoiceParametersProps {
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
}

export const AdvancedVoiceParameters: React.FC<AdvancedVoiceParametersProps> = ({
  showAdvanced,
  onToggleAdvanced,
  stability,
  onStabilityChange,
  similarityBoost,
  onSimilarityBoostChange,
  styleExaggeration,
  onStyleExaggerationChange,
  speakerBoost,
  onSpeakerBoostChange
}) => {
  return (
    <>
      <div className="advanced-settings-toggle">
        <button
          type="button"
          className="aux-btn"
          onClick={onToggleAdvanced}
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
              onChange={(e) => onStabilityChange(parseFloat(e.target.value))}
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
              onChange={(e) => onSimilarityBoostChange(parseFloat(e.target.value))}
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
              onChange={(e) => onStyleExaggerationChange(parseFloat(e.target.value))}
              className="range-slider"
            />
          </div>

          <label className="checkbox-label" style={{ marginTop: 6 }}>
            <input
              type="checkbox"
              checked={speakerBoost}
              onChange={(e) => onSpeakerBoostChange(e.target.checked)}
            />
            <span>Enable Speaker Boost (Improves clarity and volume)</span>
          </label>
        </div>
      )}
    </>
  );
};
