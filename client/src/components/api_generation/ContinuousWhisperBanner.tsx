import React from 'react';
import { Wind } from 'lucide-react';

export interface ContinuousWhisperBannerProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ContinuousWhisperBanner: React.FC<ContinuousWhisperBannerProps> = ({
  checked,
  onChange
}) => {
  return (
    <div className="whisper-banner-card">
      <label className="whisper-checkbox-row">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
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
  );
};
