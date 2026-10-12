import React from 'react';
import { Zap, KeyRound, Plus, Settings } from 'lucide-react';
import { SystemConfig } from '../../types';

export interface KeyPoolBannerProps {
  config: SystemConfig | null;
  onOpenSettings: () => void;
  onToggleQuickAdd: () => void;
  isQuickAddOpen: boolean;
}

export const KeyPoolBanner: React.FC<KeyPoolBannerProps> = ({
  config,
  onOpenSettings,
  onToggleQuickAdd,
  isQuickAddOpen
}) => {
  const poolCount = config?.poolSize || (config?.isKeyConfigured ? 1 : 0);

  return (
    <div className={`glass-card api-config-banner ${config?.keyValid ? 'config-connected' : 'config-missing'}`}>
      <div className="config-banner-left">
        <div className="config-icon-badge">
          {config?.keyValid ? (
            <Zap size={20} className="text-emerald" />
          ) : (
            <KeyRound size={20} className="text-amber" />
          )}
        </div>
        <div className="config-info">
          <div className="config-status-title">
            <span>ElevenLabs Multi-Key Pool:</span>
            {config?.keyValid ? (
              <>
                <span className="badge badge-emerald">{poolCount} Key{poolCount > 1 ? 's' : ''} Active</span>
                <span className="badge badge-purple">Auto-Failover On</span>
              </>
            ) : (
              <span className="badge badge-amber">No Keys Configured</span>
            )}
          </div>
          <div className="config-status-desc">
            {config?.keyValid
              ? `Pool active with ${poolCount} account(s). If any key runs out of quota, generation automatically switches to the next available account.`
              : 'Add one or more ElevenLabs API keys to enable synthesis. Multiple accounts will automatically failover.'}
          </div>
        </div>
      </div>

      <div className="config-banner-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onToggleQuickAdd}
        >
          <Plus size={14} />
          <span>{isQuickAddOpen ? 'Cancel' : 'Quick Add Key'}</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenSettings}
        >
          <Settings size={14} />
          <span>Manage Key Pool</span>
        </button>
      </div>
    </div>
  );
};
