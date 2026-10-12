import React from 'react';
import { Bot, Globe2, Cpu, ShieldCheck, ChevronUp, ChevronDown, RefreshCw, AlertCircle, Sparkles, Upload, Layers } from 'lucide-react';
import { KurdishDialect } from '../../../types';

interface GeminiPageHeaderProps {
  dialect: KurdishDialect;
  selectedModel: string;
  poolCount: number;
  readyKeyCount: number;
  activeKeyCount: number;
  disabledKeyCount: number;
  dailyExhaustedCount: number;
  minuteCooldownCount: number;
  minCooldownSeconds: number;
  showKeyManager: boolean;
  setShowKeyManager: (show: boolean | ((prev: boolean) => boolean)) => void;
  isReloadingKeys: boolean;
  onReloadKeys: () => void;
  activeTab: 'single' | 'bulk' | 'paired';
  setActiveTab: (tab: 'single' | 'bulk' | 'paired') => void;
  batchItemsCount: number;
}

export const GeminiPageHeader: React.FC<GeminiPageHeaderProps> = ({
  dialect,
  selectedModel,
  poolCount,
  readyKeyCount,
  activeKeyCount,
  disabledKeyCount,
  dailyExhaustedCount,
  minuteCooldownCount,
  minCooldownSeconds,
  showKeyManager,
  setShowKeyManager,
  isReloadingKeys,
  onReloadKeys,
  activeTab,
  setActiveTab,
  batchItemsCount
}) => {
  return (
    <div className="gemini-page-header">
      <div className="header-badge-row">
        <span className="badge badge-cyan">
          <Bot size={13} />
          <span>Google Gemini Voice Studio</span>
        </span>
        <span className="badge badge-purple">
          <Globe2 size={13} />
          <span>Dialect: {dialect === 'badini' ? 'Badini (بادینی)' : 'Sorani (سۆرانی)'}</span>
        </span>
        <span className="badge badge-purple">
          <Cpu size={13} />
          <span>{selectedModel}</span>
        </span>

        {poolCount > 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <button 
              type="button" 
              className={`badge ${readyKeyCount > 0 ? 'badge-success' : (dailyExhaustedCount > 0 ? 'badge-danger' : 'badge-amber')}`}
              onClick={() => setShowKeyManager(prev => !prev)}
              style={{ cursor: 'pointer', border: readyKeyCount > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : (dailyExhaustedCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)') }}
              title="Click to view all Gemini API Keys, toggles, and live quota cooldowns"
            >
              <ShieldCheck size={13} />
              <span>{readyKeyCount}/{activeKeyCount} Keys Ready</span>
              {disabledKeyCount > 0 && (
                <span style={{ opacity: 0.85, color: '#94A3B8', fontSize: '0.72rem' }}>
                  ({disabledKeyCount} Off)
                </span>
              )}
              {dailyExhaustedCount > 0 && readyKeyCount === 0 && (
                <span style={{ opacity: 0.95, color: '#FCA5A5', fontWeight: 600 }}>
                  ({dailyExhaustedCount} Daily Limit Reached • Resets Midnight PT)
                </span>
              )}
              {minuteCooldownCount > 0 && readyKeyCount === 0 && dailyExhaustedCount === 0 && (
                <span style={{ opacity: 0.9, color: '#FDE047', fontWeight: 600 }}>
                  ({minuteCooldownCount} in cooldown • next in {minCooldownSeconds}s)
                </span>
              )}
              {showKeyManager ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs reload-keys-btn"
              onClick={onReloadKeys}
              disabled={isReloadingKeys}
              title="Force test and reload all Gemini API keys in the pool"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.74rem' }}
            >
              <RefreshCw size={12} className={isReloadingKeys ? 'spin' : ''} />
              <span>{isReloadingKeys ? 'Checking Keys...' : 'Reload Keys'}</span>
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            className="badge badge-amber"
            onClick={() => setShowKeyManager(true)}
            style={{ cursor: 'pointer' }}
          >
            <AlertCircle size={13} />
            <span>Add Gemini API Keys</span>
          </button>
        )}
      </div>

      <div className="gemini-title-section">
        <h1 className="page-title">
          <span className="text-gradient">Gemini Voice Studio</span> (Sorani & Badini)
        </h1>
        <p className="page-description">
          Synthesize high-fidelity Kurdish speech in both <strong>Sorani</strong> and <strong>Badini</strong> dialects with <strong>Puck</strong> and <strong>Gemini 3.8 / 3.1 Flash TTS</strong>. Includes automatic multi-key failover, resilient bulk text processing, and inline emotions.
        </p>
      </div>

      <div className="studio-tabs-row" style={{ marginTop: '16px' }}>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'single' ? 'studio-tab-active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          <Sparkles size={16} />
          <span>Single Synthesis Studio</span>
        </button>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'bulk' ? 'studio-tab-active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          <Upload size={16} />
          <span>Bulk File & Multi-Line Batch</span>
          {batchItemsCount > 0 && (
            <span className="tab-counter-badge">{batchItemsCount} lines</span>
          )}
        </button>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'paired' ? 'studio-tab-active' : ''}`}
          onClick={() => setActiveTab('paired')}
          style={activeTab === 'paired' ? {
            borderColor: '#a855f7',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
            color: '#f8fafc'
          } : {
            borderColor: 'rgba(168, 85, 247, 0.4)',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            color: '#f8fafc'
          }}
          title="Open Paired Emotion Batch Studio (same speaker, same sentence, 6 emotions)"
        >
          <Layers size={16} color="#c084fc" />
          <span style={{ fontWeight: 600 }}>Paired Emotion Batch Studio</span>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '0.7rem' }}>
            TTS Training
          </span>
        </button>
      </div>
    </div>
  );
};
