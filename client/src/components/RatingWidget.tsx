import React, { useState } from 'react';
import { Star, MessageSquare, Check, Sparkles } from 'lucide-react';
import { SampleRatings } from '../types';

interface RatingWidgetProps {
  ratings?: SampleRatings;
  onSaveRatings: (ratings: SampleRatings) => Promise<void> | void;
  compact?: boolean;
}

const RATING_CRITERIA = [
  { key: 'naturalness', label: 'Naturalness', desc: 'Human-like cadence, flow, and pacing' },
  { key: 'emotion', label: 'Emotion Expression', desc: 'Accuracy of intended emotional delivery' },
  { key: 'pronunciation', label: 'Pronunciation', desc: 'Accuracy of Kurdish Sorani vowels & consonants' },
  { key: 'overall', label: 'Overall Quality', desc: 'Suitability for Kurdish TTS dataset' }
] as const;

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  ratings,
  onSaveRatings,
  compact = false
}) => {
  const [current, setCurrent] = useState<SampleRatings>({
    naturalness: ratings?.naturalness || 0,
    emotion: ratings?.emotion || 0,
    pronunciation: ratings?.pronunciation || 0,
    overall: ratings?.overall || 0,
    notes: ratings?.notes || ''
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleScoreChange = (key: keyof Omit<SampleRatings, 'notes'>, value: number) => {
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    if (compact) {
      onSaveRatings(updated);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveRatings(current);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (compact) {
    return (
      <div className="compact-rating-root">
        <div className="compact-stars-row">
          <span className="compact-label">Overall:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (current.overall || 0) ? 'filled' : ''}`}
              onClick={() => handleScoreChange('overall', star)}
              title={`${star} / 5`}
            >
              <Star size={14} />
            </button>
          ))}
          {current.overall > 0 && <span className="score-num">({current.overall}/5)</span>}
        </div>

        <style>{`
          .compact-rating-root {
            display: inline-flex;
            align-items: center;
          }
          .compact-stars-row {
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .compact-label {
            font-size: 0.75rem;
            color: var(--text-dim);
            margin-right: 4px;
          }
          .star-btn {
            background: transparent;
            border: none;
            color: rgba(148, 163, 184, 0.3);
            cursor: pointer;
            padding: 1px;
            display: flex;
            align-items: center;
            transition: transform 0.1s ease, color 0.1s ease;
          }
          .star-btn:hover {
            transform: scale(1.2);
            color: #FBBF24;
          }
          .star-btn.filled {
            color: #F59E0B;
          }
          .score-num {
            font-family: var(--font-mono);
            font-size: 0.72rem;
            color: #FBBF24;
            margin-left: 4px;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rating-card">
      <div className="rating-header">
        <div className="rating-title-group">
          <Star size={16} className="text-amber" />
          <span className="rating-card-title">Dataset Quality Rating (1–5)</span>
        </div>
        {savedSuccess && (
          <span className="save-badge">
            <Check size={13} />
            <span>Ratings Saved</span>
          </span>
        )}
      </div>

      <div className="criteria-grid">
        {RATING_CRITERIA.map((crit) => {
          const score = current[crit.key] || 0;
          return (
            <div key={crit.key} className="criteria-item">
              <div className="criteria-info">
                <span className="criteria-name">{crit.label}</span>
                <span className="criteria-desc">{crit.desc}</span>
              </div>

              <div className="stars-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-pill ${star <= score ? 'active' : ''}`}
                    onClick={() => handleScoreChange(crit.key, star)}
                    title={`${crit.label}: ${star} Star${star > 1 ? 's' : ''}`}
                  >
                    <Star size={15} fill={star <= score ? 'currentColor' : 'none'} />
                    <span>{star}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Input */}
      <div className="rating-notes-box">
        <div className="notes-label">
          <MessageSquare size={13} />
          <span>Linguistic Notes & Pronunciation Feedback:</span>
        </div>
        <textarea
          className="input-control notes-textarea"
          value={current.notes || ''}
          onChange={(e) => setCurrent({ ...current, notes: e.target.value })}
          placeholder="e.g. Kurdish vowels 'ێ' and 'ۆ' sounded natural, slight robot tone on angry inflection..."
          rows={2}
        />
      </div>

      <div className="rating-footer">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check size={14} />
              <span>Save Evaluation to JSON</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .rating-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rating-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rating-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rating-card-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .text-amber {
          color: #F59E0B;
        }

        .save-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .criteria-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .criteria-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.5);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          gap: 12px;
        }

        .criteria-info {
          display: flex;
          flex-direction: column;
        }

        .criteria-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .criteria-desc {
          font-size: 0.72rem;
          color: var(--text-dim);
        }

        .stars-selector {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .star-pill {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-dim);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.76rem;
          font-family: var(--font-mono);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .star-pill:hover {
          background: rgba(245, 158, 11, 0.15);
          color: #FBBF24;
          border-color: #F59E0B;
          transform: translateY(-1px);
        }

        .star-pill.active {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
          border-color: #F59E0B;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
        }

        .rating-notes-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .notes-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .notes-textarea {
          font-size: 0.85rem;
          padding: 8px 12px;
          resize: vertical;
        }

        .rating-footer {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
};
