import React from 'react';
import { Sparkles } from 'lucide-react';
import { PRESET_EXAMPLES } from './editorConstants';

interface KurdishPresetsBarProps {
  onSelectPreset: (text: string, suggestedEmotion?: string) => void;
}

export const KurdishPresetsBar: React.FC<KurdishPresetsBarProps> = ({ onSelectPreset }) => {
  return (
    <div className="presets-bar">
      <div className="presets-title">
        <Sparkles size={12} />
        <span>Presets:</span>
      </div>
      <div className="presets-list">
        {PRESET_EXAMPLES.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-pill"
            onClick={() => onSelectPreset(preset.text, preset.emotion)}
            title={preset.text}
          >
            {preset.title}
          </button>
        ))}
      </div>
    </div>
  );
};
