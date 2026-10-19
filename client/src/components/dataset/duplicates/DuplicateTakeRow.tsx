import React from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Sample } from '../../../types';
import { AudioPlayer } from '../../AudioPlayer';

interface DuplicateTakeRowProps {
  sample: Sample;
  isNewest: boolean;
  isOldest: boolean;
  takesCount: number;
  onKeepOnlyOne: () => void;
  onDeleteSingle: () => void;
  isDeleting: boolean;
  isBatchOperating: boolean;
}

export const DuplicateTakeRow: React.FC<DuplicateTakeRowProps> = ({
  sample,
  isNewest,
  isOldest,
  takesCount,
  onKeepOnlyOne,
  onDeleteSingle,
  isDeleting,
  isBatchOperating
}) => {
  const d = sample.created_at ? new Date(sample.created_at) : null;
  const formattedDate = d ? d.toLocaleDateString() : '';
  const formattedTime = d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const dur = sample.duration_seconds || sample.durationSeconds;

  return (
    <div
      style={{
        background: isNewest
          ? 'var(--bg-box)'
          : 'var(--bg-box-subtle)',
        border: isNewest ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      {/* Sample Info Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: isNewest ? '#38BDF8' : 'var(--text-secondary)',
            background: 'var(--bg-box)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          #{sample.id}
        </span>

        {isNewest && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.15)',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            LATEST TAKE
          </span>
        )}

        {isOldest && takesCount > 2 && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'var(--bg-box-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '1px 6px',
              borderRadius: '4px'
            }}
          >
            FIRST TAKE
          </span>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {sample.voice_name || sample.voice_id || 'Gemini'}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', fontSize: '0.75rem' }}>
              ({sample.model_id || 'Flash TTS'})
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{formattedDate} {formattedTime}</span>
            {dur ? <span>• {dur}s</span> : null}
            {sample.audio_size ? <span>• {(sample.audio_size / 1024).toFixed(0)} KB</span> : null}
          </div>
        </div>
      </div>

      {/* Inline Audio Player Center */}
      <div style={{ flex: '1 1 240px', maxWidth: '300px' }}>
        <AudioPlayer
          src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
          sampleId={sample.id}
          showDownload={false}
          initialDuration={dur}
        />
      </div>

      {/* Action Buttons Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onKeepOnlyOne}
          disabled={isDeleting || isBatchOperating}
          className="btn btn-sm"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34D399',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '5px 9px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
          title={`Keep #${sample.id} and delete the other take(s)`}
        >
          <Check size={13} />
          <span>Keep This</span>
        </button>

        <button
          onClick={onDeleteSingle}
          disabled={isDeleting || isBatchOperating}
          className="btn btn-danger btn-sm"
          style={{
            padding: '5px 8px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem'
          }}
          title={`Delete sample #${sample.id}`}
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
