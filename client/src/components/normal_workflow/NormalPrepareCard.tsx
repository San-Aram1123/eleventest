import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { KurdishEditor } from '../KurdishEditor';

export interface NormalPrepareCardProps {
  kurdishText: string;
  onTextChange: (text: string) => void;
  voiceName: string;
  onVoiceNameChange: (name: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isPreparing: boolean;
  onPrepareAndCopy: () => void;
}

export const NormalPrepareCard: React.FC<NormalPrepareCardProps> = ({
  kurdishText,
  onTextChange,
  voiceName,
  onVoiceNameChange,
  notes,
  onNotesChange,
  isPreparing,
  onPrepareAndCopy
}) => {
  return (
    <div className="glass-card prepare-card">
      <div className="card-section-title">
        <span className="step-badge">Step 1 & 2</span>
        <span>Prepare Kurdish Sample</span>
      </div>

      <div className="form-group">
        <KurdishEditor
          value={kurdishText}
          onChange={onTextChange}
          label="Kurdish Transcript with Inline Tags"
          onSelectPreset={onTextChange}
          showInlineTagToolbar={true}
        />
      </div>

      <div className="grid-2 form-row-compact">
        <div className="form-group">
          <label className="form-label">Voice Used (Optional)</label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. Adam, Rachel, Nicole"
            value={voiceName}
            onChange={(e) => onVoiceNameChange(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <input
            type="text"
            className="input-control"
            placeholder="e.g. ElevenLabs website v3 model test"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      </div>

      <div className="prepare-actions">
        <button
          type="button"
          className="btn btn-accent btn-lg pulse-glow"
          onClick={onPrepareAndCopy}
          disabled={isPreparing || !kurdishText.trim()}
          id="btn-copy-prepare"
          style={{ width: '100%' }}
        >
          <Copy size={18} />
          <span>Copy Text & Prepare Sample</span>
        </button>

        <a
          href="https://elevenlabs.io/app/speech-synthesis/text-to-speech"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-md"
          style={{ width: '100%' }}
        >
          <span>Open ElevenLabs Text to Speech</span>
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
};
