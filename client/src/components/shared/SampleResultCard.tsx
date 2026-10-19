import React from 'react';
import { FileCode } from 'lucide-react';
import { Sample, SampleRatings } from '../../types';
import { AudioPlayer } from '../AudioPlayer';
import { AlignmentTimeline } from '../AlignmentTimeline';
import { RatingWidget } from '../RatingWidget';

export interface SampleResultCardProps {
  sample: Sample;
  sideBadge?: { label: string; className: string };
  statusBadgeText?: string;
  showAlignment?: boolean;
  activePlaybackTime?: number;
  autoPlay?: boolean;
  onTimeUpdate?: (time: number) => void;
  onSaveRatings?: (ratings: SampleRatings) => void;
  onInspect?: (sample: Sample) => void;
  extraMetaRows?: Array<{ label: string; value: string }>;
  className?: string;
}

export const SampleResultCard: React.FC<SampleResultCardProps> = ({
  sample,
  sideBadge,
  statusBadgeText,
  showAlignment = false,
  activePlaybackTime = 0,
  autoPlay = false,
  onTimeUpdate,
  onSaveRatings,
  onInspect,
  extraMetaRows,
  className = ''
}) => {
  const methodLabel = sample.method === 'elevenlabs_api' ? 'ElevenLabs API' : 'Normal Website';

  return (
    <div
      className={`glass-card output-card ${className}`}
      style={{
        borderRadius: '16px',
        border: '1px solid var(--border-medium)',
        borderTop: '1px solid var(--border-specular)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.22)',
        padding: '1.25rem'
      }}
    >
      {/* Header */}
      <div className="output-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div className="output-badge-group" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {sideBadge && (
            <span className={`side-badge ${sideBadge.className}`} style={{ borderRadius: '9999px', padding: '3px 10px', fontSize: '0.74rem', fontWeight: 800 }}>
              {sideBadge.label}
            </span>
          )}
          {statusBadgeText && (
            <span className="badge badge-emerald" style={{ borderRadius: '9999px', fontSize: '0.72rem' }}>{statusBadgeText}</span>
          )}
          <span className="badge badge-cyan" style={{ borderRadius: '9999px', fontSize: '0.72rem' }}>ID: {sample.id}</span>
          <span className={`badge emotion-badge-${sample.emotion}`} style={{ borderRadius: '9999px', fontSize: '0.72rem' }}>
            {String(sample.emotion).toUpperCase()}
          </span>
          {sample.model_id && (
            <span className="badge badge-purple" style={{ borderRadius: '9999px', fontSize: '0.72rem' }}>{sample.model_id}</span>
          )}
          {!sample.model_id && (
            <span className={`badge ${sample.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`} style={{ borderRadius: '9999px', fontSize: '0.72rem' }}>
              {methodLabel}
            </span>
          )}
        </div>

        {onInspect && (
          <div className="output-header-actions">
            <button
              type="button"
              className="aux-btn"
              onClick={() => onInspect(sample)}
              title="Inspect full JSON metadata"
              style={{ borderRadius: '9999px', padding: '4px 10px', fontSize: '0.74rem' }}
            >
              <FileCode size={13} />
              <span>JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Preserved Kurdish Transcript Spotlight */}
      <div className="output-kurdish-box" style={{ background: 'var(--bg-box)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px 18px', marginBottom: '0.85rem' }}>
        <div className="output-kurdish-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          <span>Preserved Kurdish Transcript (Clean Unicode)</span>
          <span className="badge badge-emerald" style={{ borderRadius: '9999px', fontSize: '0.68rem', padding: '2px 8px' }}>Exact UTF-8</span>
        </div>
        <div className="kurdish-text output-kurdish-text" dir="rtl" style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
          {sample.text}
        </div>
      </div>

      {/* Optional Metadata Table (used in comparisons) */}
      {extraMetaRows && extraMetaRows.length > 0 && (
        <div className="compare-meta-table" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', background: 'var(--bg-box)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
          {extraMetaRows.map((row, idx) => (
            <div key={idx} className="meta-row" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="meta-k" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>{row.label}:</span>
              <span className="meta-v" style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Audio Player */}
      <div className="output-audio-section" style={{ marginBottom: '0.75rem' }}>
        <AudioPlayer
          src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
          sampleId={sample.id}
          autoPlay={autoPlay}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Alignment Timeline */}
      {showAlignment && sample.alignment && (
        <div className="output-alignment-section" style={{ marginBottom: '0.75rem' }}>
          <AlignmentTimeline
            alignment={sample.alignment}
            currentTime={activePlaybackTime}
          />
        </div>
      )}

      {/* Rating Widget */}
      {onSaveRatings && (
        <div className="output-rating-section">
          <RatingWidget
            ratings={sample.ratings}
            onSaveRatings={onSaveRatings}
          />
        </div>
      )}
    </div>
  );
};
