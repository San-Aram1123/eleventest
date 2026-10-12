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
    <div className={`glass-card output-card ${className}`}>
      {/* Header */}
      <div className="output-card-header">
        <div className="output-badge-group">
          {sideBadge && (
            <span className={`side-badge ${sideBadge.className}`}>{sideBadge.label}</span>
          )}
          {statusBadgeText && (
            <span className="badge badge-emerald">{statusBadgeText}</span>
          )}
          <span className="badge badge-cyan">ID: {sample.id}</span>
          <span className={`badge emotion-badge-${sample.emotion}`}>
            {String(sample.emotion).toUpperCase()}
          </span>
          {sample.model_id && (
            <span className="badge badge-purple">{sample.model_id}</span>
          )}
          {!sample.model_id && (
            <span className={`badge ${sample.method === 'elevenlabs_api' ? 'badge-cyan' : 'badge-emerald'}`}>
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
            >
              <FileCode size={13} />
              <span>JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Preserved Kurdish Transcript Spotlight */}
      <div className="output-kurdish-box">
        <div className="output-kurdish-label">
          <span>Preserved Kurdish Transcript (Clean Unicode)</span>
          <span className="badge badge-emerald">Exact UTF-8</span>
        </div>
        <div className="kurdish-text output-kurdish-text" dir="rtl">
          {sample.text}
        </div>
      </div>

      {/* Optional Metadata Table (used in comparisons) */}
      {extraMetaRows && extraMetaRows.length > 0 && (
        <div className="compare-meta-table">
          {extraMetaRows.map((row, idx) => (
            <div key={idx} className="meta-row">
              <span className="meta-k">{row.label}:</span>
              <span className="meta-v">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Audio Player */}
      <div className="output-audio-section">
        <AudioPlayer
          src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
          sampleId={sample.id}
          autoPlay={autoPlay}
          onTimeUpdate={onTimeUpdate}
        />
      </div>

      {/* Alignment Timeline */}
      {showAlignment && sample.alignment && (
        <div className="output-alignment-section">
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
