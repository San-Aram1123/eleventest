import React from 'react';
import { Search, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';

interface DuplicateToolbarProps {
  matchMode: 'exact' | 'normalized';
  onMatchModeChange: (m: 'exact' | 'normalized') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  groupsCount: number;
  totalDuplicateSamples: number;
  redundantCount: number;
  isBatchOperating: boolean;
  onAutoCleanAll: (policy: 'newest' | 'oldest') => void;
}

export const DuplicateToolbar: React.FC<DuplicateToolbarProps> = ({
  matchMode,
  onMatchModeChange,
  searchQuery,
  onSearchChange,
  groupsCount,
  totalDuplicateSamples,
  redundantCount,
  isBatchOperating,
  onAutoCleanAll
}) => {
  return (
    <>
      {/* Controls Bar */}
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-box-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Compare Mode:</span>
          <div style={{ display: 'flex', background: 'var(--bg-box)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onMatchModeChange('exact')}
              style={{ background: matchMode === 'exact' ? '#38BDF8' : 'transparent', color: matchMode === 'exact' ? '#0F172A' : 'var(--text-secondary)', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Exact Text
            </button>
            <button
              onClick={() => onMatchModeChange('normalized')}
              style={{ background: matchMode === 'normalized' ? '#38BDF8' : 'transparent', color: matchMode === 'normalized' ? '#0F172A' : 'var(--text-secondary)', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clean & Normalized
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 200px', maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search duplicates by text or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 10px 6px 30px', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Quick Stats & Bulk Actions Bar */}
      {groupsCount > 0 && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {groupsCount} Duplicate Group{groupsCount === 1 ? '' : 's'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              ({totalDuplicateSamples} total takes, <strong style={{ color: '#F59E0B' }}>{redundantCount}</strong> redundant)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onAutoCleanAll('newest')}
              disabled={isBatchOperating}
              className="btn btn-sm"
              style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38BDF8', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '6px', padding: '5px 10px', cursor: isBatchOperating ? 'not-allowed' : 'pointer' }}
              title="Keep the latest generated take of every sentence and delete older ones"
            >
              <Sparkles size={14} />
              <span>Auto-Clean: Keep Newest</span>
            </button>

            <button
              onClick={() => onAutoCleanAll('oldest')}
              disabled={isBatchOperating}
              className="btn btn-sm"
              style={{ background: 'var(--bg-box-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '6px', padding: '5px 10px', cursor: isBatchOperating ? 'not-allowed' : 'pointer' }}
              title="Keep the original first take of every sentence and delete retakes"
            >
              <RotateCcw size={13} />
              <span>Keep Oldest</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
