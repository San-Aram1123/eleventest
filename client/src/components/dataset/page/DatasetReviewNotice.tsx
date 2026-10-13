import React, { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { Sample } from '../../../types';
import { getSampleReview, markSampleReviewed } from '../../../services/sampleReview';

export const DatasetReviewNotice: React.FC<{ sample: Sample; onSampleUpdated?: (sample: Sample) => void }> = ({ sample, onSampleUpdated }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const review = getSampleReview(sample);
  if (!review.pending) return null;
  const approve = async () => {
    setBusy(true); setError('');
    try { onSampleUpdated?.(await markSampleReviewed(sample.id)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Review failed.'); }
    finally { setBusy(false); }
  };
  return <div style={{ border: '1px solid #f59e0b66', borderRadius: 6, padding: '.5rem', marginTop: '.5rem', color: '#fbbf24', fontSize: '.75rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
      <AlertTriangle size={13} /><strong>Pending review</strong>
      {onSampleUpdated && <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void approve()}>
        <Check size={12} />{busy ? 'Saving…' : 'Mark reviewed'}</button>}
    </div>
    <details style={{ marginTop: '.35rem' }}>
      <summary style={{ cursor: 'pointer' }}>Speaker boundary warning</summary>
      {review.warnings.map((warning, i) => <p key={i} style={{ margin: '.4rem 0' }}>{warning}</p>)}
      {typeof review.start === 'number' && typeof review.end === 'number' &&
        <p>Clip in original master: {review.start.toFixed(2)}–{review.end.toFixed(2)} seconds.</p>}
      {review.masterUrl && <a href={review.masterUrl} download style={{ marginInlineEnd: '.75rem' }}>Original master WAV</a>}
      {review.diagnosticsUrl && <a href={review.diagnosticsUrl} download>Boundary diagnostics</a>}
    </details>
    {error && <p role="alert">{error}</p>}
  </div>;
};
