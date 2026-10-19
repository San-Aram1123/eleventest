import React from 'react';
import { Power, PowerOff } from 'lucide-react';

interface GeminiKeyToolbarProps {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  isBulkOperating: boolean;
  onSelectAllToggle: () => void;
  onBulkStateChange: (enable: boolean) => void;
  onClearSelection: () => void;
}

export const GeminiKeyToolbar: React.FC<GeminiKeyToolbarProps> = ({
  totalCount,
  selectedCount,
  allSelected,
  someSelected,
  isBulkOperating,
  onSelectAllToggle,
  onBulkStateChange,
  onClearSelection
}) => {
  return (
    <div style={{
      marginTop: '14px',
      padding: '8px 14px',
      background: 'var(--bg-box)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none', color: 'var(--text-main)' }}>
        <input
          type="checkbox"
          checked={allSelected}
          ref={el => { if (el) el.indeterminate = someSelected; }}
          onChange={onSelectAllToggle}
          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#38BDF8' }}
        />
        <span style={{ fontWeight: 600 }}>
          {allSelected ? `Deselect All (${totalCount})` : `Select All (${totalCount} keys)`}
        </span>
        {selectedCount > 0 && (
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            {selectedCount} selected
          </span>
        )}
      </label>

      {selectedCount > 0 ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => onBulkStateChange(false)}
            disabled={isBulkOperating}
            style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title="Turn off selected keys"
          >
            <PowerOff size={11} />
            <span>Turn OFF Selected ({selectedCount})</span>
          </button>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={() => onBulkStateChange(true)}
            disabled={isBulkOperating}
            style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title="Turn on selected keys"
          >
            <Power size={11} />
            <span>Turn ON Selected ({selectedCount})</span>
          </button>
          <button
            type="button"
            className="btn btn-xs btn-ghost"
            onClick={onClearSelection}
            style={{ fontSize: '0.7rem', color: '#94A3B8' }}
          >
            Clear
          </button>
        </div>
      ) : (
        <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
          Tip: Check Select All above to turn them all off, then turn ON only the keys you want.
        </div>
      )}
    </div>
  );
};
