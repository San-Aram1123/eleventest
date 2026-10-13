import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DatasetReviewSection: React.FC<{ pendingCount: number; pendingOnly: boolean; onChange: (pending: boolean) => void }> = props =>
  <div className="glass-card" style={{ padding: '.85rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '.6rem' }}>
      <AlertTriangle size={17} color="#fbbf24" /><strong>Review queue</strong>
      <button type="button" className={`btn ${props.pendingOnly ? 'btn-secondary' : 'btn-primary'} btn-sm`}
        onClick={() => props.onChange(false)}>All samples</button>
      <button type="button" className={`btn ${props.pendingOnly ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        onClick={() => props.onChange(true)}>Pending review ({props.pendingCount})</button>
    </div>
    <p style={{ fontSize: '.78rem', color: '#94a3b8', margin: '.5rem 0 0' }}>
      Warning clips remain exportable. Listen to the clip, check the original handoff if needed, then mark it reviewed.
    </p>
  </div>;
