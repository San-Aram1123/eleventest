import React from 'react';
import { Languages, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLanguageLabel } from '../../../hooks/useDatasetFilters';

interface DatasetStatsBarProps {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  totalSamplesCount: number;
  safeCurrentPage: number;
  totalPages: number;
  filterVoice: string;
  onClearVoice: () => void;
  filterLanguage: string;
  onClearLanguage: () => void;
  filterKey: string;
  onClearKey: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const DatasetStatsBar: React.FC<DatasetStatsBarProps> = ({
  totalItems,
  startIndex,
  endIndex,
  totalSamplesCount,
  safeCurrentPage,
  totalPages,
  filterVoice,
  onClearVoice,
  filterLanguage,
  onClearLanguage,
  filterKey,
  onClearKey,
  onPrevPage,
  onNextPage
}) => {
  return (
    <div className="filter-stats-bar">
      <div className="stats-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span className="stats-count">
          Showing <strong>{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong>{totalItems}</strong> samples
          {totalItems !== totalSamplesCount && (
            <span className="stats-filtered-tag"> (filtered from {totalSamplesCount} total)</span>
          )}
        </span>

        {filterVoice !== 'all' && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onClearVoice}
            style={{
              fontSize: '0.74rem',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '2px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Click to clear voice filter"
          >
            <span>Voice: <strong>{filterVoice}</strong></span>
            <span style={{ fontWeight: 700, marginLeft: '2px' }}>✕</span>
          </button>
        )}

        {filterLanguage !== 'all' && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onClearLanguage}
            style={{
              fontSize: '0.74rem',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '2px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Click to clear language filter"
          >
            <Languages size={11} />
            <span>Lang: <strong>{getLanguageLabel(filterLanguage)}</strong></span>
            <span style={{ fontWeight: 700, marginLeft: '2px' }}>✕</span>
          </button>
        )}

        {filterKey !== 'all' && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onClearKey}
            style={{
              fontSize: '0.74rem',
              color: '#c084fc',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              padding: '2px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Click to clear key filter"
          >
            <Key size={11} />
            <span>Key: <strong>{filterKey}</strong></span>
            <span style={{ fontWeight: 700, marginLeft: '2px' }}>✕</span>
          </button>
        )}

        <span className="page-indicator-pill">
          Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      {totalPages > 1 && (
        <div className="top-pager-controls">
          <button
            className="pager-btn-sm"
            onClick={onPrevPage}
            disabled={safeCurrentPage <= 1}
            title="Previous Page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <button
            className="pager-btn-sm"
            onClick={onNextPage}
            disabled={safeCurrentPage >= totalPages}
            title="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
