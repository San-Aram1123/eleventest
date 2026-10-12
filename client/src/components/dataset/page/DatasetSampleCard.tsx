import React from 'react';
import { FileCode, Trash2, Key } from 'lucide-react';
import { Sample, SampleRatings } from '../../../types';
import { AudioPlayer } from '../../AudioPlayer';
import { RatingWidget } from '../../RatingWidget';
import {
  getSampleLanguage,
  getLanguageLabel,
  getSampleUsedKey,
  parseSampleEmotions,
  getEmotionBadgeClass
} from '../../../hooks/useDatasetFilters';

interface DatasetSampleCardProps {
  sample: Sample;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onInspect: (sample: Sample) => void;
  onDelete: (id: string) => void;
  onRatingChange: (id: string, ratings: SampleRatings) => void;
}

export const DatasetSampleCard: React.FC<DatasetSampleCardProps> = ({
  sample,
  isSelected,
  onToggleSelect,
  onInspect,
  onDelete,
  onRatingChange
}) => {
  const lang = getSampleLanguage(sample);
  const usedKey = getSampleUsedKey(sample);
  const emotions = parseSampleEmotions(sample);

  return (
    <div
      className="glass-card sample-item-card"
      style={{ borderColor: isSelected ? 'rgba(239, 68, 68, 0.5)' : undefined }}
    >
      <div className="sample-card-header">
        <div className="sample-id-badge-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(sample.id)}
            style={{
              cursor: 'pointer',
              accentColor: '#ef4444',
              width: '16px',
              height: '16px',
              borderRadius: '3px'
            }}
            title={isSelected ? 'Deselect sample' : 'Select sample for mass delete'}
          />
          <span className="sample-id-pill">#{sample.id}</span>
          <span
            className="badge badge-lang"
            style={{
              background: lang === 'en' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: lang === 'en' ? '#60a5fa' : '#34d399',
              border: `1px solid ${lang === 'en' ? 'rgba(59, 130, 246, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
              fontWeight: 700,
              fontSize: '0.72rem'
            }}
            title={`Language: ${getLanguageLabel(lang)}`}
          >
            {lang.toUpperCase()}
          </span>
          {emotions.map((em, idx) => (
            <span key={idx} className={`badge ${getEmotionBadgeClass(em)}`}>
              {em.toUpperCase()}
            </span>
          ))}
          <span
            className={`badge ${
              sample.method === 'gemini_api'
                ? 'badge-purple'
                : sample.method === 'elevenlabs_api'
                  ? 'badge-cyan'
                  : 'badge-emerald'
            }`}
          >
            {sample.method === 'gemini_api' ? 'Gemini' : sample.method === 'elevenlabs_api' ? 'ElevenLabs' : 'Web'}
          </span>
          {usedKey && (
            <span
              className="badge badge-key"
              style={{
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px'
              }}
              title={`API Key: ${usedKey}`}
            >
              <Key size={11} style={{ opacity: 0.9 }} />
              <span>{usedKey}</span>
            </span>
          )}
        </div>

        <div className="sample-card-actions">
          <button
            className="aux-btn"
            onClick={() => onInspect(sample)}
            title="Inspect & Edit Metadata JSON"
          >
            <FileCode size={13} />
            <span>JSON</span>
          </button>
          <button
            className="aux-btn btn-danger"
            onClick={() => onDelete(sample.id)}
            title="Delete Sample"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Spoken Text Box */}
      <div className="sample-kurdish-box">
        <div className="kurdish-text sample-kurdish-text" dir={lang === 'en' ? 'ltr' : 'rtl'}>
          {sample.text}
        </div>
      </div>

      {/* Meta details */}
      <div className="sample-details-row">
        <div className="detail-item">
          <span className="detail-label">Voice:</span>
          <span className="detail-val">{sample.voice_name || sample.voice_id || 'TTS Voice'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Model:</span>
          <span className="detail-val">{sample.model_id || 'Preview'}</span>
        </div>
        {usedKey && (
          <div className="detail-item" title={`API Key: ${usedKey}`}>
            <span className="detail-label">Key:</span>
            <span
              className="detail-val"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                color: '#c084fc',
                fontSize: '0.76rem',
                fontWeight: 600
              }}
            >
              {usedKey}
            </span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="sample-audio-wrap">
        <AudioPlayer
          src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
          sampleId={sample.id}
          showDownload={true}
          initialDuration={sample.duration_seconds || sample.durationSeconds}
        />
      </div>

      {/* Ratings */}
      <div className="sample-rating-wrap">
        <RatingWidget
          ratings={sample.ratings}
          onSaveRatings={(ratings) => onRatingChange(sample.id, ratings)}
          compact={true}
        />
      </div>
    </div>
  );
};
