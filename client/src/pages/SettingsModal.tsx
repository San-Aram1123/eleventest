import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { SystemConfig } from '../types';
import { updateApiKey } from '../services/api';

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
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await updateApiKey(apiKey.trim());
      setFeedback({ success: true, message: res.message || 'API Key saved and validated!' });
      
      // Update config object
      onConfigUpdated({
        status: 'ok',
        isKeyConfigured: true,
        keyValid: true,
        validationError: null,
        maskedKey: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`,
        userInfo: res.userInfo
      });
      setApiKey('');
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Invalid API key' });
    } finally {
      setLoading(false);
    }
  };

  const charCount = config?.userInfo?.character_count ?? 0;
  const charLimit = config?.userInfo?.character_limit ?? 10000;
  const usagePercent = charLimit > 0 ? Math.min(100, Math.round((charCount / charLimit) * 100)) : 0;

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container settings-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={20} className="text-cyan" />
            <div>
              <div className="modal-title">Settings & API Security</div>
              <div className="modal-subtitle">ElevenLabs API credentials and engine configurations</div>
            </div>
          </div>
          <button className="btn-ghost btn-icon" onClick={onClose} title="Close Settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* API Key Status Banner */}
          <div className={`status-banner ${config?.keyValid ? 'banner-success' : 'banner-warning'}`}>
            <div className="banner-icon">
              {config?.keyValid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <div className="banner-text">
              <div className="banner-heading">
                {config?.keyValid ? 'ElevenLabs API Connected' : 'API Key Required for API Workflow'}
              </div>
              <div className="banner-sub">
                {config?.keyValid
                  ? `Active Tier: ${config.userInfo?.tier?.toUpperCase() || 'Standard'} • ${charCount.toLocaleString()} / ${charLimit.toLocaleString()} characters used.`
                  : 'You can generate samples without an API key using the Normal Web Workflow, or enter your API key below for direct API generation.'}
              </div>
            </div>
          </div>

          {/* Usage Meter */}
          {config?.keyValid && (
            <div className="quota-meter-box">
              <div className="quota-labels">
                <span>Monthly Quota Usage</span>
                <span>{usagePercent}% ({charCount.toLocaleString()} / {charLimit.toLocaleString()})</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          )}

          {/* Key Form */}
          <form onSubmit={handleSaveKey} className="settings-form">
            <div className="form-group">
              <label className="form-label">
                ElevenLabs API Key
              </label>
              <div className="key-input-wrapper">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input-control"
                  placeholder={config?.maskedKey ? `Configured (${config.maskedKey})` : 'Paste xi-api-key here (e.g. sk_...)'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  id="settings-api-key-input"
                />
                <button
                  type="button"
                  className="show-key-toggle"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="key-security-hint">
                🔒 Stored securely in local backend environment (<code>.env</code>). Never exposed to browser bundle.
              </div>
            </div>

            {feedback && (
              <div className={`feedback-alert ${feedback.success ? 'feedback-success' : 'feedback-error'}`}>
                {feedback.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="settings-actions">
              <a
                href="https://elevenlabs.io/app/settings/api-keys"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>Get API Key</span>
                <ExternalLink size={13} />
              </a>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={loading || !apiKey.trim()}
              >
                <Save size={14} />
                <span>{loading ? 'Validating...' : 'Save & Validate Key'}</span>
              </button>
            </div>
          </form>

          {/* Helpful Tips */}
          <div className="tips-section">
            <div className="tips-title">💡 Pro Tips for Kurdish TTS Testing:</div>
            <ul className="tips-list">
              <li>Use <strong>ElevenLabs v3</strong> for expressive audio tags (<code>[laugh]</code>, <code>[whisper]</code>, <code>[sigh]</code>).</li>
              <li>When testing audio tags, the engine automatically strips tags from the stored Unicode transcript in <code>001.json</code>.</li>
              <li>The <strong>Normal Web Workflow</strong> requires zero API key and lets you test ElevenLabs' web-exclusive features or models!</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>

      <style>{`
        .settings-modal-box {
          max-width: 620px;
        }

        .settings-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-height: calc(85vh - 120px);
          overflow-y: auto;
        }

        .status-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
        }

        .banner-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34D399;
        }

        .banner-warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #FBBF24;
        }

        .banner-icon {
          margin-top: 2px;
        }

        .banner-heading {
          font-weight: 700;
          font-size: 0.92rem;
        }

        .banner-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.4;
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
          background: linear-gradient(90deg, #38BDF8, #818CF8);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .key-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .key-input-wrapper input {
          padding-right: 70px;
        }

        .show-key-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .show-key-toggle:hover {
          color: var(--text-main);
        }

        .key-security-hint {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 6px;
        }

        .feedback-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          margin-bottom: 14px;
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

        .settings-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
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
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .tips-list {
          padding-left: 18px;
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
