import { DatasetReviewNotice } from './DatasetReviewNotice';
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
  onSampleUpdated?: (sample: Sample) => void;
  onRatingChange: (id: string, ratings: SampleRatings) => void;
}

export const DatasetSampleCard: React.FC<DatasetSampleCardProps> = ({
  sample,
  isSelected,
  onToggleSelect,
  onInspect,
  onDelete,
  onRatingChange,
  onSampleUpdated
}) => {
  const lang = getSampleLanguage(sample);
  const usedKey = getSampleUsedKey(sample);
  const emotions = parseSampleEmotions(sample);

  return (
    <div
      className="glass-card sample-item-card"
      style={{
        borderRadius: '16px',
        border: isSelected ? '1.5px solid #FF453A' : '1px solid var(--border-medium)',
        borderTop: isSelected ? '1.5px solid #FF453A' : '1px solid var(--border-specular)',
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: isSelected ? '0 0 16px rgba(255, 69, 58, 0.25)' : '0 4px 24px rgba(0, 0, 0, 0.22)',
        padding: '1.1rem 1.25rem',
        transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <DatasetReviewNotice sample={sample} onSampleUpdated={onSampleUpdated} />
      <div className="sample-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.6rem', flexWrap: 'wrap' }}>
        <div className="sample-id-badge-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(sample.id)}
            style={{
              cursor: 'pointer',
              accentColor: '#FF453A',
              width: '16px',
              height: '16px',
              borderRadius: '4px'
            }}
            title={isSelected ? 'Deselect sample' : 'Select sample for mass delete'}
          />
          <span className="sample-id-pill" style={{ borderRadius: '9999px', padding: '3px 9px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700 }}>
            #{sample.id}
          </span>
          <span
            className="badge badge-lang"
            style={{
              background: lang === 'en' ? 'rgba(10, 132, 255, 0.12)' : 'rgba(48, 209, 88, 0.12)',
              color: lang === 'en' ? '#0A84FF' : '#30D158',
              border: `1px solid ${lang === 'en' ? 'rgba(10, 132, 255, 0.3)' : 'rgba(48, 209, 88, 0.3)'}`,
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
            title={`Language: ${getLanguageLabel(lang)}`}
          >
            {lang.toUpperCase()}
          </span>
          {emotions.map((em, idx) => (
            <span key={idx} className={`badge ${getEmotionBadgeClass(em)}`} style={{ borderRadius: '9999px', fontSize: '0.7rem' }}>
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
            style={{ borderRadius: '9999px', fontSize: '0.7rem' }}
          >
            {sample.method === 'gemini_api' ? 'Gemini 3.8' : sample.method === 'elevenlabs_api' ? 'ElevenLabs' : 'Web'}
          </span>
          {usedKey && (
            <span
              className="badge badge-key"
              style={{
                background: 'rgba(191, 90, 242, 0.12)',
                color: '#BF5AF2',
                border: '1px solid rgba(191, 90, 242, 0.3)',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px'
              }}
              title={`API Key: ${usedKey}`}
            >
              <Key size={11} />
              <span>{usedKey}</span>
            </span>
          )}
        </div>

        <div className="sample-card-actions" style={{ display: 'flex', gap: '6px' }}>
          <button
            className="aux-btn"
            onClick={() => onInspect(sample)}
            title="Inspect & Edit Metadata JSON"
            style={{ borderRadius: '9999px', padding: '4px 10px', fontSize: '0.74rem' }}
          >
            <FileCode size={13} />
            <span>JSON</span>
          </button>
          <button
            className="aux-btn btn-danger"
            onClick={() => onDelete(sample.id)}
            title="Delete Sample"
            style={{ borderRadius: '9999px', padding: '4px 9px' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Spoken Text Box */}
      <div className="sample-kurdish-box" style={{ background: 'var(--bg-box)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '12px 16px', marginBottom: '0.75rem' }}>
        <div className="kurdish-text sample-kurdish-text" dir={lang === 'en' ? 'ltr' : 'rtl'} style={{ fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
          {sample.text}
        </div>
      </div>

      {/* Meta details */}
      <div className="sample-details-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div className="detail-item">
          <span className="detail-label" style={{ color: 'var(--text-tertiary)', marginRight: '4px' }}>Voice:</span>
          <span className="detail-val" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sample.voice_name || sample.voice_id || 'TTS Voice'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label" style={{ color: 'var(--text-tertiary)', marginRight: '4px' }}>Model:</span>
          <span className="detail-val" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sample.model_id || 'Preview'}</span>
        </div>
        {usedKey && (
          <div className="detail-item" title={`API Key: ${usedKey}`}>
            <span className="detail-label" style={{ color: 'var(--text-tertiary)', marginRight: '4px' }}>Key:</span>
            <span className="detail-val" style={{ fontFamily: 'var(--font-mono)', color: '#BF5AF2', fontSize: '0.74rem', fontWeight: 600 }}>
              {usedKey}
            </span>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="sample-audio-wrap" style={{ marginBottom: '0.65rem' }}>
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
