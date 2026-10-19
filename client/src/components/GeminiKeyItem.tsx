import React, { useState } from 'react';
import {
  Zap,
  Trash2,
  AlertCircle,
  Clock,
  PowerOff,
  CheckCircle2
} from 'lucide-react';
import { GeminiKeyPoolItem } from '../types';

interface GeminiKeyItemProps {
  item: GeminiKeyPoolItem;
  index: number;
  isSelected?: boolean;
  probingKeyIndex: number | null;
  isReloadingKeys: boolean;
  onSelect?: (index: number, selected: boolean) => void;
  onToggle: (index: number, nextState: boolean) => Promise<void> | void;
  onProbe: (index: number) => void;
  onDelete: (index: number) => void;
}

export const GeminiKeyItem: React.FC<GeminiKeyItemProps> = ({
  item: k,
  index: idx,
  isSelected = false,
  probingKeyIndex,
  isReloadingKeys,
  onSelect,
  onToggle,
  onProbe,
  onDelete
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const isEnabled = k.isEnabled !== false;
  const isDaily = isEnabled && (k.status === 'daily_exhausted' || (k.quotaType === 'daily' && k.status !== 'ready'));
  const isCooldown = isEnabled && !isDaily && (k.status === 'exhausted' || (k.remainingSeconds !== undefined && k.remainingSeconds > 0));
  const remainingSec = k.remainingSeconds || 0;
  const totalCooldown = k.cooldownDurationSeconds || 60;
  const progressPct = isCooldown 
    ? Math.min(100, Math.max(0, Math.round(((totalCooldown - remainingSec) / totalCooldown) * 100))) 
    : 100;

  const handleToggleClick = async () => {
    setIsToggling(true);
    try {
      await onToggle(idx, !isEnabled);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div 
      className={`key-pool-item ${!isEnabled ? 'key-pool-item-disabled' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: !isEnabled ? 'var(--bg-box-subtle)' : (isDaily ? 'rgba(239, 68, 68, 0.08)' : (isCooldown ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-box)')),
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        border: !isEnabled 
          ? '1px dashed rgba(100, 116, 139, 0.4)' 
          : (k.status === 'ready' 
            ? '1px solid rgba(16, 185, 129, 0.3)' 
            : (isDaily ? '1px solid rgba(239, 68, 68, 0.35)' : (isCooldown ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.35)')))
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onSelect && (
            <input
              type="checkbox"
              checked={Boolean(isSelected)}
              onChange={(e) => onSelect(idx, e.target.checked)}
              style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#38BDF8', margin: 0 }}
              title="Select key"
            />
          )}
          <span style={{ fontSize: '0.78rem', color: isEnabled ? 'var(--text-dim)' : '#64748B', fontWeight: 700 }}>#{idx + 1}</span>
          <code style={{ fontSize: '0.84rem', color: isEnabled ? '#38BDF8' : '#94A3B8', fontWeight: 600 }}>{k.maskedKey}</code>

          {/* Status Badges */}
          {!isEnabled ? (
            <span className="badge badge-off" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              <PowerOff size={11} />
              <span>Turned Off</span>
            </span>
          ) : (
            <>
              {k.status === 'ready' && !isCooldown && !isDaily && (
                <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={11} />
                  <span>Active / Ready</span>
                </span>
              )}

              {isDaily && (
                <span className="badge badge-danger" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.25)', color: '#FCA5A5', fontWeight: 700 }}>
                  <AlertCircle size={11} />
                  <span>🔴 Daily Limit (10/10)</span>
                </span>
              )}

              {isCooldown && (
                <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.25)', color: '#FDE047', fontWeight: 700 }}>
                  <Clock size={11} className="spin" />
                  <span>Cooldown: {remainingSec}s ({progressPct}%)</span>
                </span>
              )}

              {k.status === 'invalid' && !isCooldown && !isDaily && (
                <span className="badge badge-danger" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  Invalid / Denied
                </span>
              )}
            </>
          )}

          {(k.totalRequests !== undefined && k.totalRequests > 0) && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Reqs: <strong>{k.totalRequests}</strong> ({k.successCount || 0} OK, {k.failureCount || 0} Err)
            </span>
          )}
        </div>

        {/* Action Controls: Switch, Probe, Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            className="key-toggle-control" 
            onClick={handleToggleClick}
            title={isEnabled ? 'Turn OFF this key' : 'Turn ON this key'}
          >
            <span style={{ fontSize: '0.72rem', color: isEnabled ? '#34D399' : '#94A3B8', fontWeight: 600 }}>
              {isEnabled ? 'ON' : 'OFF'}
            </span>
            <button 
              type="button" 
              className={`key-toggle-btn ${isEnabled ? 'is-active' : 'is-off'}`}
              disabled={isToggling}
              aria-label={isEnabled ? 'Turn off key' : 'Turn on key'}
            >
              <div className="key-toggle-thumb" />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-xs"
            onClick={() => onProbe(idx)}
            disabled={!isEnabled || probingKeyIndex === idx || isReloadingKeys}
            title={!isEnabled ? 'Key is turned off' : 'Probe Google AI Studio (0 quota)'}
            style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: isEnabled ? 1 : 0.4 }}
          >
            <Zap size={11} className={probingKeyIndex === idx ? 'spin text-amber' : 'text-cyan'} />
            <span>{probingKeyIndex === idx ? 'Checking...' : '⚡ Check'}</span>
          </button>

          <button
            type="button"
            className="btn btn-icon btn-ghost text-danger"
            onClick={() => onDelete(idx)}
            title="Remove key from pool"
            style={{ padding: '4px 8px', color: '#EF4444' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar for Cooldown */}
      {isEnabled && isCooldown && (
        <div style={{ marginTop: '2px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#FDE047', marginBottom: '3px' }}>
            <span>Minute Rate-Limit Cooldown</span>
            <span>{remainingSec}s remaining</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progressPct}%`, 
                background: 'linear-gradient(90deg, #F59E0B, #10B981)', 
                height: '100%',
                transition: 'width 1s linear'
              }} 
            />
          </div>
        </div>
      )}

      {/* Status notices */}
      {!isEnabled && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-box)', padding: '5px 8px', borderRadius: '4px', fontStyle: 'italic' }}>
          🛑 <strong>Turned Off:</strong> This key will not be used in speech synthesis or rotation. Toggle ON anytime to re-enable.
        </div>
      )}

      {isEnabled && isDaily && (
        <div style={{ fontSize: '0.72rem', color: '#FCA5A5', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '4px', wordBreak: 'break-word', fontFamily: 'monospace', lineHeight: 1.4 }}>
          ⏰ <strong>Daily Quota Exhausted:</strong> Resets Midnight PT (~10:00 AM Local Time).
        </div>
      )}

      {isEnabled && k.error && !isDaily && k.status !== 'ready' && (
        <div style={{ fontSize: '0.7rem', color: isCooldown ? '#FDE047' : '#F87171', background: 'var(--bg-box)', padding: '5px 8px', borderRadius: '4px', wordBreak: 'break-word', fontFamily: 'monospace', lineHeight: 1.4 }}>
          🌐 <strong>Google API:</strong> {k.error}
        </div>
      )}
    </div>
  );
};
