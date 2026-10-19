import React from 'react';
import { RefreshCw, Check, XCircle, Clock, RotateCcw, Trash2, Play, X } from 'lucide-react';
import { GeminiBatchItem } from '../../../types';
import { AudioPlayer } from '../../AudioPlayer';

interface GeminiBatchItemRowProps {
  item: GeminiBatchItem;
  isCurrent: boolean;
  onRetrySingleLine: (item: GeminiBatchItem) => void;
  onDeleteBatchSample: (item: GeminiBatchItem) => void;
  onDeleteAndRegenerate: (item: GeminiBatchItem) => void;
  onRemoveSingleBatchItem: (id: number) => void;
}

export const GeminiBatchItemRow: React.FC<GeminiBatchItemRowProps> = ({
  item,
  isCurrent,
  onRetrySingleLine,
  onDeleteBatchSample,
  onDeleteAndRegenerate,
  onRemoveSingleBatchItem
}) => {
  return (
    <div
      className={`batch-line-card ${isCurrent ? 'batch-line-active' : ''} ${item.status === 'completed' ? 'batch-line-completed' : ''} ${item.status === 'failed' ? 'batch-line-failed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: isCurrent ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-box)',
        border: isCurrent ? '1px solid #38BDF8' : (item.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.25)' : (item.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)')),
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            #{item.lineNumber}
          </span>

          {/* Status Badge */}
          {item.status === 'processing' && (
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={11} className="spin" />
              <span>Synthesizing...</span>
            </span>
          )}
          {item.status === 'completed' && (
            <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={11} />
              <span>Completed (Sample #{item.sample?.id}, {item.duration}s)</span>
            </span>
          )}
          {item.status === 'failed' && (
            <span className="badge badge-danger" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={11} />
              <span>Failed</span>
            </span>
          )}
          {item.status === 'pending' && (
            <span className="badge badge-purple" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} />
              <span>Queued</span>
            </span>
          )}

          {/* Assigned Voice Badge */}
          {item.voiceName && (
            <span
              className={`badge ${item.voiceGender === 'Female' ? 'badge-pink' : 'badge-blue'}`}
              style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px' }}
              title={`Voice: ${item.voiceName} (${item.voiceGender || 'Male'})`}
            >
              <span style={{ fontWeight: 700 }}>{item.voiceGender === 'Female' ? '♀' : '♂'}</span>
              <span style={{ fontWeight: 600 }}>{item.voiceName}</span>
            </span>
          )}

          {item.keyUsed && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
              Key: {item.keyUsed}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.status === 'completed' && item.sample && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => onDeleteAndRegenerate(item)}
                title="Re-generate this specific line"
                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={11} />
                <span>Re-generate</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={() => onDeleteBatchSample(item)}
                title="Delete this audio from dataset and reset line"
                style={{ 
                  fontSize: '0.72rem', 
                  padding: '3px 8px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#F87171'
                }}
              >
                <Trash2 size={11} />
                <span>Delete Audio</span>
              </button>
            </>
          )}

          {item.status === 'failed' && (
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => onRetrySingleLine(item)}
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              <RotateCcw size={11} />
              <span>Retry</span>
            </button>
          )}

          {item.status === 'pending' && (
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => onRetrySingleLine(item)}
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              <Play size={11} />
              <span>Generate</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => onRemoveSingleBatchItem(item.id)}
            title="Remove this line from batch list"
            style={{ 
              fontSize: '0.72rem', 
              padding: '3px 8px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '3px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <X size={12} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Kurdish Text */}
      <div dir="rtl" className="transcript-box" style={{ padding: '8px 12px', fontSize: '0.98rem', background: 'var(--bg-box-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
        {item.text}
      </div>

      {/* Error Message if Failed */}
      {item.error && (
        <div style={{ fontSize: '0.74rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>
          ⚠️ {item.error}
        </div>
      )}

      {/* Embedded Audio Player if Completed */}
      {item.sample && (
        <div style={{ marginTop: '4px' }}>
          <AudioPlayer
            src={item.sample.audioUrl || `/api/dataset/${item.sample.id}/audio`}
            sampleId={item.sample.id}
          />
        </div>
      )}
    </div>
  );
};
