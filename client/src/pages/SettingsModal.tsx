import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Zap, 
  ExternalLink,
  Database,
  Server
} from 'lucide-react';
import { SystemConfig, KeyPoolItem, KeyPoolResponse } from '../types';
import { fetchKeyPool, addKeyToPool, deleteKeyFromPool, fetchConfig } from '../services/api';

interface SettingsModalProps {
  config: SystemConfig | null;
  onClose: () => void;
  onConfigUpdated: (config: SystemConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onClose,
  onConfigUpdated
}) => {
  const [keyPool, setKeyPool] = useState<KeyPoolItem[]>([]);
  const [poolSummary, setPoolSummary] = useState<KeyPoolResponse | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [loadingPool, setLoadingPool] = useState(true);
  const [addingKey, setAddingKey] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoadingPool(true);
    try {
      const data = await fetchKeyPool();
      setKeyPool(data.keys || []);
      setPoolSummary(data);

      const latestConfig = await fetchConfig().catch(() => null);
      if (latestConfig) {
        onConfigUpdated(latestConfig);
      }
    } catch (err: any) {
      console.warn('Failed to load key pool:', err.message);
    } finally {
      setLoadingPool(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setAddingKey(true);
    setFeedback(null);
    try {
      const res = await addKeyToPool(newApiKey.trim());
      setFeedback({ success: true, message: res.message || 'API key validated and added to pool!' });
      setNewApiKey('');
      await loadKeys();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Invalid ElevenLabs API Key' });
    } finally {
      setAddingKey(false);
    }
  };

  const handleDeleteKey = async (index: number) => {
    setDeletingIndex(index);
    setFeedback(null);
    try {
      await deleteKeyFromPool(index);
      await loadKeys();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to remove key' });
    } finally {
      setDeletingIndex(null);
    }
  };

  const totalCapacity = keyPool.reduce((sum, k) => sum + (k.characterLimit || 0), 0);
  const totalUsed = keyPool.reduce((sum, k) => sum + (k.characterCount || 0), 0);
  const totalRemaining = poolSummary?.totalRemainingCharacters ?? Math.max(0, totalCapacity - totalUsed);
  const overallPercent = totalCapacity > 0 ? Math.min(100, Math.round((totalUsed / totalCapacity) * 100)) : 0;

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container settings-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <KeyRound size={22} className="text-cyan" />
            <div>
              <div className="modal-title">Multi-API Key Pool & Failover</div>
              <div className="modal-subtitle">Add multiple ElevenLabs accounts with automatic quota failover</div>
            </div>
          </div>
          <button className="btn-ghost btn-icon" onClick={onClose} title="Close Settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Top Aggregated Pool Status */}
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
                <span><strong>{keyPool.filter(k => k.status === 'ready').length}</strong> of <strong>{keyPool.length}</strong> keys ready</span>
                <span className="stat-dot">•</span>
                <span><strong>{totalRemaining.toLocaleString()}</strong> chars available</span>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm refresh-pool-btn"
              onClick={loadKeys}
              disabled={loadingPool}
              title="Refresh quota status for all keys"
            >
              <RefreshCw size={13} className={loadingPool ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Aggregate Progress Bar */}
          {keyPool.length > 0 && totalCapacity > 0 && (
            <div className="quota-meter-box">
              <div className="quota-labels">
                <span>Combined Pool Quota</span>
                <span>{overallPercent}% ({totalUsed.toLocaleString()} / {totalCapacity.toLocaleString()} used)</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${overallPercent}%` }} />
              </div>
            </div>
          )}

          {/* Key List Section */}
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
                  const keyPercent = keyLimit > 0 ? Math.min(100, Math.round((keyUsed / keyLimit) * 100)) : 0;
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
                            onClick={() => handleDeleteKey(idx)}
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
                          <div className="meter-track-mini">
                            <div 
                              className={`meter-fill ${keyPercent > 90 ? 'meter-fill-warn' : ''}`} 
                              style={{ width: `${keyPercent}%` }} 
                            />
                          </div>
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

          {/* Add New Key Form Card */}
          <div className="add-key-card">
            <div className="add-key-header">
              <Plus size={16} className="text-cyan" />
              <span className="add-key-title">Add Another ElevenLabs API Key to Pool</span>
            </div>

            <form onSubmit={handleAddKey} className="add-key-form-inner">
              <div className="key-form-row">
                <input
                  type="password"
                  className="input-control key-input-field"
                  placeholder="Paste ElevenLabs xi-api-key here (e.g. sk_...)"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  id="add-api-key-input"
                  disabled={addingKey}
                />
                <button
                  type="submit"
                  className="btn btn-primary add-key-submit-btn"
                  disabled={addingKey || !newApiKey.trim()}
                >
                  <Plus size={16} />
                  <span>{addingKey ? 'Validating...' : 'Add Key'}</span>
                </button>
              </div>

              {feedback && (
                <div className={`feedback-alert ${feedback.success ? 'feedback-success' : 'feedback-error'}`}>
                  {feedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* MySQL Database Status Card */}
          <div className="add-key-card" style={{ marginTop: '0' }}>
            <div className="add-key-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} className="text-cyan" />
                <span className="add-key-title">MySQL Database Engine</span>
              </div>
              <span 
                className="badge" 
                style={{ 
                  background: config?.database?.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: config?.database?.connected ? '#34D399' : '#FBBF24',
                  borderColor: config?.database?.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  padding: '3px 10px'
                }}
              >
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: config?.database?.connected ? '#10B981' : '#F59E0B' 
                }}></span>
                {config?.database?.connected ? 'MySQL Connected' : 'Filesystem Fallback'}
              </span>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '10px', 
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              background: 'rgba(0,0,0,0.25)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>HOST & PORT</span>
                <strong style={{ color: '#E2E8F0' }}>{config?.database?.host || 'localhost'}:{config?.database?.port || 3306}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>DATABASE</span>
                <strong style={{ color: '#38BDF8' }}>{config?.database?.database || 'kurdish_tts_db'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>STORED SAMPLES</span>
                <strong style={{ color: '#A78BFA' }}>{config?.database?.sampleCount ?? 0} samples</strong>
              </div>
            </div>
            
            {config?.database?.error && (
              <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#FBBF24', background: 'rgba(245, 158, 11, 0.08)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                ℹ️ <strong>Storage Note:</strong> Running on file storage mode ({config.database.error}). To connect MySQL, configure <code>DB_PASSWORD</code> in your <code>.env</code> file.
              </div>
            )}
          </div>

          {/* Tips / Explanations */}
          <div className="tips-section">
            <div className="tips-title">⚡ How Multi-Key Auto-Failover Works:</div>
            <ul className="tips-list">
              <li>You can add 2, 3, or more free/paid ElevenLabs accounts to this pool.</li>
              <li>Generations automatically use the first ready key. If that key exhausts its quota (401/402/429), the engine <strong>immediately switches to the next account</strong> without failing your request.</li>
              <li>Keys are stored locally in your environment (<code>.env</code> & <code>keys.json</code>) and never exposed publicly.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <a
            href="https://elevenlabs.io/app/settings/api-keys"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <span>Get ElevenLabs Key</span>
            <ExternalLink size={13} />
          </a>

          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>

      <style>{`
        .settings-modal-box {
          max-width: 680px;
          width: 95vw;
        }

        .settings-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: calc(85vh - 120px);
          overflow-y: auto;
        }

        .settings-body > * {
          flex-shrink: 0;
        }

        .pool-summary-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .summary-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .summary-title {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
        }

        .summary-stats {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-dot {
          color: var(--border-medium);
        }

        .quota-meter-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quota-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .meter-track {
          height: 6px;
          background: rgba(30, 41, 59, 0.9);
          border-radius: 3px;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #38BDF8, #10B981);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .meter-fill-warn {
          background: linear-gradient(90deg, #F59E0B, #EF4444);
        }

        .section-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .keys-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .key-card {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all var(--transition-fast);
        }

        .key-card:hover {
          border-color: rgba(56, 189, 248, 0.4);
        }

        .key-exhausted {
          opacity: 0.7;
          border-color: rgba(245, 158, 11, 0.4);
        }

        .key-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .key-info-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .key-index-badge {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: var(--font-mono);
        }

        .key-masked {
          font-family: var(--font-mono);
          font-size: 0.86rem;
          color: #F8FAFC;
        }

        .key-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-danger-icon {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-danger-icon:hover {
          color: #F87171;
          background: rgba(239, 68, 68, 0.15);
        }

        .key-quota-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .key-quota-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .meter-track-mini {
          height: 4px;
          background: rgba(30, 41, 59, 0.9);
          border-radius: 2px;
          overflow: hidden;
        }

        .key-error-msg {
          font-size: 0.75rem;
          color: #F87171;
        }

        .loading-keys-state {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-muted);
          justify-content: center;
        }

        .empty-keys-box {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-md);
        }

        .empty-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #FBBF24;
        }

        .empty-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .add-key-card {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.35);
          border-radius: var(--radius-md);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .add-key-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #38BDF8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .add-key-form-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .key-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .key-input-field {
          flex: 1;
          min-width: 0;
          min-height: 44px;
          height: 44px;
          background: #0B0F17;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 0.92rem;
          color: #FFFFFF;
        }

        .add-key-submit-btn {
          height: 44px;
          padding: 0 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .feedback-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
        }

        .feedback-success {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .feedback-error {
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .tips-section {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .tips-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #38BDF8;
          margin-bottom: 6px;
        }

        .tips-list {
          padding-left: 18px;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
