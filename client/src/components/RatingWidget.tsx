import React, { useState } from 'react';
import '../styles/ratingWidget.css';
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
    </div>
  );
};
