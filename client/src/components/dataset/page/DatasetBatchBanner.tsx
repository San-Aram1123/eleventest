import React from 'react';
import { Trash2 } from 'lucide-react';

interface DatasetBatchBannerProps {
  selectedCount: number;
  currentPaginatedCount: number;
  onToggleCurrentPage: () => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onOpenMassDelete: () => void;
}

export const DatasetBatchBanner: React.FC<DatasetBatchBannerProps> = ({
  selectedCount,
  currentPaginatedCount,
  onToggleCurrentPage,
  onSelectAllFiltered,
  onClearSelection,
  onOpenMassDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className="glass-card selection-action-banner"
      style={{
        padding: '12px 20px',
        background: 'rgba(239, 68, 68, 0.09)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderRadius: 'var(--radius-md)',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Trash2 size={16} />
          <span>{selectedCount} sample{selectedCount === 1 ? '' : 's'} selected</span>
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onToggleCurrentPage}
          style={{ fontSize: '0.76rem', color: '#94a3b8', textDecoration: 'underline' }}
        >
          Toggle This Page ({currentPaginatedCount})
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onSelectAllFiltered}
          style={{ fontSize: '0.76rem', color: '#38bdf8', textDecoration: 'underline' }}
        >
          Select All Filtered
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onClearSelection}
          style={{ fontSize: '0.76rem', color: '#cbd5e1' }}
        >
          Clear Selection
        </button>
      </div>

      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={onOpenMassDelete}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 700,
          background: '#ef4444',
          color: '#ffffff'
        }}
      >
        <Trash2 size={14} />
        <span>Mass Delete Selected ({selectedCount})</span>
      </button>
    </div>
  );
};
