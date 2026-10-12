import React from 'react';
import { RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { KeyPoolItem } from '../../types';
import { QuotaProgressBar } from '../shared/QuotaProgressBar';

export interface KeyPoolListProps {
  keyPool: KeyPoolItem[];
  loadingPool: boolean;
  deletingIndex: number | null;
  onDeleteKey: (index: number) => void;
}

export const KeyPoolList: React.FC<KeyPoolListProps> = ({
  keyPool,
  loadingPool,
  deletingIndex,
  onDeleteKey
}) => {
  return (
    <div className="keys-section">
      <div className="section-label">Configured API Keys in Pool ({keyPool.length})</div>

      {loadingPool ? (
        <div className="loading-keys-state">
          <RefreshCw size={18} className="spin text-cyan" />
          <span>Checking API key statuses and character quotas...</span>
        </div>
      ) : keyPool.length === 0 ? (
        <div className="empty-keys-box">
          <AlertCircle size={24} className="text-amber" />
          <div>
            <div className="empty-title">No API Keys Configured</div>
            <div className="empty-desc">Add one or more ElevenLabs API keys below to enable speech generation.</div>
          </div>
        </div>
      ) : (
        <div className="keys-list">
          {keyPool.map((keyItem, idx) => {
            const keyUsed = keyItem.characterCount || 0;
            const keyLimit = keyItem.characterLimit || 10000;
            const isPrimary = idx === 0;

            return (
              <div key={keyItem.id || idx} className={`key-card ${keyItem.status === 'exhausted' ? 'key-exhausted' : ''}`}>
                <div className="key-card-header">
                  <div className="key-info-left">
                    <div className="key-index-badge">#{idx + 1}</div>
                    <code className="key-masked">{keyItem.maskedKey}</code>
                    {isPrimary && <span className="badge badge-cyan">Primary</span>}
                    <span className={`badge ${keyItem.isValid ? 'badge-emerald' : 'badge-rose'}`}>
                      {keyItem.tier ? keyItem.tier.toUpperCase() : 'KEY'}
                    </span>
                  </div>

                  <div className="key-card-actions">
                    {keyItem.status === 'exhausted' ? (
                      <span className="badge badge-amber">Exhausted (Auto-Skipped)</span>
                    ) : keyItem.isValid ? (
                      <span className="badge badge-emerald">Ready</span>
                    ) : (
                      <span className="badge badge-rose">Invalid</span>
                    )}

                    <button
                      type="button"
                      className="btn-danger-icon"
                      onClick={() => onDeleteKey(idx)}
                      disabled={deletingIndex === idx}
                      title="Remove this key from pool"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {keyItem.isValid && (
                  <div className="key-quota-row">
                    <div className="key-quota-meta">
                      <span>{keyItem.remainingCharacters.toLocaleString()} chars remaining</span>
                      <span>{keyUsed.toLocaleString()} / {keyLimit.toLocaleString()}</span>
                    </div>
                    <QuotaProgressBar
                      used={keyUsed}
                      total={keyLimit}
                      variant="mini"
                      showDetails={false}
                    />
                  </div>
                )}

                {keyItem.error && (
                  <div className="key-error-msg">{keyItem.error}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
