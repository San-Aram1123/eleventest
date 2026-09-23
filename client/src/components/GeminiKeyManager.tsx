import React, { useState } from 'react';
import {
  Layers,
  RotateCcw,
  RefreshCw,
  Plus,
  AlertCircle,
  ExternalLink,
  Power,
  PowerOff
} from 'lucide-react';
import { GeminiKeyPoolItem } from '../types';
import { GeminiKeyItem } from './GeminiKeyItem';
import { GeminiKeyToolbar } from './GeminiKeyToolbar';

interface GeminiKeyManagerProps {
  keyPool: GeminiKeyPoolItem[];
  poolCount: number;
  isReloadingKeys: boolean;
  probingKeyIndex: number | null;
  customKeyInput: string;
  isSavingKey: boolean;
  onKeyInputChange: (val: string) => void;
  onAddKey: (e: React.FormEvent) => void;
  onDeleteKey: (index: number) => void;
  onToggleKey: (index: number, enabled?: boolean) => Promise<void> | void;
  onToggleAllKeys?: (enabled: boolean) => Promise<void> | void;
  onToggleBulkKeys?: (indices: number[], enabled: boolean) => Promise<void> | void;
  onProbeKey: (index: number) => void;
  onReloadKeys: () => void;
  onResetCooldowns: () => void;
  onClose: () => void;
}

export const GeminiKeyManager: React.FC<GeminiKeyManagerProps> = ({
  keyPool,
  poolCount,
  isReloadingKeys,
  probingKeyIndex,
  customKeyInput,
  isSavingKey,
  onKeyInputChange,
  onAddKey,
  onDeleteKey,
  onToggleKey,
  onToggleAllKeys,
  onToggleBulkKeys,
  onProbeKey,
  onReloadKeys,
  onResetCooldowns,
  onClose
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  const activeKeys = keyPool.filter(k => k.isEnabled !== false);
  const disabledKeys = keyPool.filter(k => k.isEnabled === false);
  const dailyExhaustedKeys = keyPool.filter(
    k => k.isEnabled !== false && (k.status === 'daily_exhausted' || (k.quotaType === 'daily' && k.status !== 'ready'))
  );

  const allSelected = keyPool.length > 0 && selectedIndices.size === keyPool.length;
  const someSelected = selectedIndices.size > 0 && selectedIndices.size < keyPool.length;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(keyPool.map((_, idx) => idx)));
    }
  };

  const handleKeySelect = (idx: number, isChecked: boolean) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (isChecked) next.add(idx);
      else next.delete(idx);
      return next;
    });
  };

  const handleBulkStateChange = async (enable: boolean) => {
    if (selectedIndices.size === 0) return;
    setIsBulkOperating(true);
    try {
      if (selectedIndices.size === keyPool.length && onToggleAllKeys) {
        await onToggleAllKeys(enable);
      } else if (onToggleBulkKeys) {
        await onToggleBulkKeys(Array.from(selectedIndices), enable);
      } else {
        for (const idx of selectedIndices) {
          await onToggleKey(idx, enable);
        }
      }
      setSelectedIndices(new Set());
    } finally {
      setIsBulkOperating(false);
    }
  };

  return (
    <div className="gemini-key-card" style={{ marginBottom: '24px' }}>
      {/* Card Header */}
      <div className="key-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} className="text-cyan" />
          <span className="key-card-title">Google Gemini Multi-Key Pool & Health Monitor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onToggleAllKeys && (
            <>
              {activeKeys.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => onToggleAllKeys(false)}
                  disabled={isBulkOperating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  title="Turn off all keys so you can selectively turn on only the ones you want"
                >
                  <PowerOff size={13} />
                  <span>Turn Off All</span>
                </button>
              )}
              {disabledKeys.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => onToggleAllKeys(true)}
                  disabled={isBulkOperating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  title="Turn on all Gemini API keys in the pool"
                >
                  <Power size={13} />
                  <span>Turn On All</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onResetCooldowns}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
            title="Reset active cooldowns across all keys and restore them to Ready status"
          >
            <RotateCcw size={13} />
            <span>Reset Cooldowns</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onReloadKeys}
            disabled={isReloadingKeys}
            title="Verify all enabled Gemini API keys in the pool (Uses 0 speech generation quota)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isReloadingKeys ? 'spin' : ''} />
            <span>{isReloadingKeys ? 'Checking Keys...' : 'Check All Keys (0 Quota)'}</span>
          </button>

          <span className="badge badge-cyan" title={`${activeKeys.length} active, ${disabledKeys.length} turned off`}>
            {activeKeys.length}/{poolCount} Active {disabledKeys.length > 0 && `(${disabledKeys.length} Off)`}
          </span>
        </div>
      </div>

      <p className="key-card-desc">
        Add multiple Google AI Studio Gemini API keys. Use <strong>Select All</strong> or the quick buttons to turn keys off and selectively enable only the ones you want.
      </p>

      {/* Daily Limit Warning Banner */}
      {dailyExhaustedKeys.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginTop: '12px',
          fontSize: '0.8rem',
          color: '#FCA5A5',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertCircle size={18} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#FECACA', fontSize: '0.84rem' }}>
              Free Tier Daily Limit Reached ({dailyExhaustedKeys.length}/{activeKeys.length} active keys exhausted today):
            </strong>
            <div style={{ marginTop: '4px', color: 'rgba(255, 255, 255, 0.88)', fontSize: '0.78rem', lineHeight: 1.45 }}>
              Google limits <code>gemini-3.1-flash-tts-preview</code> to <strong>10 requests per day per project</strong> on Free Tier.
              These keys reset at <strong>Midnight US Pacific Time (PT) (~10:00 AM Local Time)</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Add Key Form */}
      <form onSubmit={onAddKey} className="key-input-row" style={{ marginTop: '12px' }}>
        <input
          type="password"
          className="input-control"
          placeholder="Paste Google AI Studio API Key (AIzaSy...)"
          value={customKeyInput}
          onChange={(e) => onKeyInputChange(e.target.value)}
          disabled={isSavingKey}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSavingKey || !customKeyInput.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Plus size={15} />
          <span>{isSavingKey ? 'Verifying...' : 'Add to Key Pool'}</span>
        </button>
      </form>

      {/* Select All & Bulk Actions Toolbar */}
      {keyPool.length > 0 && (
        <GeminiKeyToolbar
          totalCount={keyPool.length}
          selectedCount={selectedIndices.size}
          allSelected={allSelected}
          someSelected={someSelected}
          isBulkOperating={isBulkOperating}
          onSelectAllToggle={handleSelectAllToggle}
          onBulkStateChange={handleBulkStateChange}
          onClearSelection={() => setSelectedIndices(new Set())}
        />
      )}

      {/* Key List with Live Metrics & Toggle Switches */}
      {keyPool.length > 0 && (
        <div className="key-pool-list" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {keyPool.map((k, idx) => (
            <GeminiKeyItem
              key={k.id || idx}
              item={k}
              index={idx}
              isSelected={selectedIndices.has(idx)}
              probingKeyIndex={probingKeyIndex}
              isReloadingKeys={isReloadingKeys}
              onSelect={handleKeySelect}
              onToggle={onToggleKey}
              onProbe={onProbeKey}
              onDelete={onDeleteKey}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '12px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#38BDF8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <span>Get Free Gemini API Keys from Google AI Studio</span>
          <ExternalLink size={12} />
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}
        >
          Close Monitor
        </button>
      </div>
    </div>
  );
};
