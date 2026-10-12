import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { KeyPoolItem, KeyPoolResponse } from '../../types';
import { QuotaProgressBar } from '../shared/QuotaProgressBar';

export interface KeyPoolSummaryCardProps {
  keyPool: KeyPoolItem[];
  poolSummary: KeyPoolResponse | null;
  loadingPool: boolean;
  onRefresh: () => void;
}

export const KeyPoolSummaryCard: React.FC<KeyPoolSummaryCardProps> = ({
  keyPool,
  poolSummary,
  loadingPool,
  onRefresh
}) => {
  const totalCapacity = keyPool.reduce((sum, k) => sum + (k.characterLimit || 0), 0);
  const totalUsed = keyPool.reduce((sum, k) => sum + (k.characterCount || 0), 0);
  const totalRemaining = poolSummary?.totalRemainingCharacters ?? Math.max(0, totalCapacity - totalUsed);
  const readyCount = keyPool.filter(k => k.status === 'ready').length;

  return (
    <>
      <div className="pool-summary-card">
        <div className="summary-left">
          <div className="summary-title-row">
            <span className="summary-title">Key Pool Health</span>
            <span className="badge badge-emerald">
              <Zap size={12} />
              <span>Auto-Failover Active</span>
            </span>
          </div>
          <div className="summary-stats">
            <span><strong>{readyCount}</strong> of <strong>{keyPool.length}</strong> keys ready</span>
            <span className="stat-dot">•</span>
            <span><strong>{totalRemaining.toLocaleString()}</strong> chars available</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm refresh-pool-btn"
          onClick={onRefresh}
          disabled={loadingPool}
          title="Refresh quota status for all keys"
        >
          <RefreshCw size={13} className={loadingPool ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {keyPool.length > 0 && totalCapacity > 0 && (
        <QuotaProgressBar
          used={totalUsed}
          total={totalCapacity}
          label="Combined Pool Quota"
        />
      )}
    </>
  );
};
