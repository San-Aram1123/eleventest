import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Database, 
  GitCompare, 
  Settings, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SystemConfig } from '../types';

interface NavbarProps {
  activeTab: 'api' | 'normal' | 'dataset' | 'compare';
  onSelectTab: (tab: 'api' | 'normal' | 'dataset' | 'compare') => void;
  onOpenSettings: () => void;
  config: SystemConfig | null;
  datasetCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  config,
  datasetCount
}) => {
  return (
    <header className="navbar-root">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => onSelectTab('api')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <span className="brand-flag-badge">Kurdish</span>
            <div className="brand-logo-icon">🎙️</div>
          </div>
          <div>
            <div className="brand-title">
              <span className="text-gradient">Kurdish TTS</span> Studio
            </div>
            <div className="brand-subtitle">
              ElevenLabs Dataset Engine & A/B Benchmark
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav">
          <button
            id="nav-tab-api"
            className={`nav-tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => onSelectTab('api')}
          >
            <Sparkles size={18} className="nav-tab-icon" />
            <span>API Generation</span>
          </button>

          <button
            id="nav-tab-normal"
            className={`nav-tab-btn ${activeTab === 'normal' ? 'active' : ''}`}
            onClick={() => onSelectTab('normal')}
          >
            <Layers size={18} className="nav-tab-icon" />
            <span>Normal Web Workflow</span>
          </button>

          <button
            id="nav-tab-dataset"
            className={`nav-tab-btn ${activeTab === 'dataset' ? 'active' : ''}`}
            onClick={() => onSelectTab('dataset')}
          >
            <Database size={18} className="nav-tab-icon" />
            <span>Dataset Manager</span>
            {datasetCount > 0 && (
              <span className="nav-count-badge">{datasetCount}</span>
            )}
          </button>

          <button
            id="nav-tab-compare"
            className={`nav-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => onSelectTab('compare')}
          >
            <GitCompare size={18} className="nav-tab-icon" />
            <span>Compare A/B</span>
          </button>
        </nav>

        {/* Right Actions & Status */}
        <div className="navbar-actions">
          {/* API Status Pill */}
          <button 
            className={`api-status-pill ${config?.keyValid ? 'status-valid' : 'status-warning'}`}
            onClick={onOpenSettings}
            title={config?.keyValid ? `Connected to ElevenLabs (${config.userInfo?.character_count ?? 0} chars used)` : 'Configure ElevenLabs API Key'}
          >
            {config?.keyValid ? (
              <>
                <CheckCircle2 size={15} className="status-icon" />
                <span className="status-text">
                  ElevenLabs: {config.userInfo?.tier ? `${config.userInfo.tier.toUpperCase()}` : 'Connected'}
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={15} className="status-icon" />
                <span className="status-text">Configure API Key</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            className="btn btn-secondary btn-icon"
            onClick={onOpenSettings}
            title="Settings & API Key"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .navbar-root {
          background: rgba(11, 15, 23, 0.85);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 12px 24px;
        }

        .navbar-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          user-select: none;
        }

        .brand-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-logo-icon {
          font-size: 26px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-md);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.25);
        }

        .brand-flag-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #10B981, #F59E0B, #EF4444);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.7);
          padding: 4px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--text-muted);
          border: none;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-tab-btn.active {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15));
          color: #38BDF8;
          box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.35);
        }

        .nav-tab-icon {
          transition: transform var(--transition-fast);
        }

        .nav-tab-btn:hover .nav-tab-icon {
          transform: scale(1.1);
        }

        .nav-count-badge {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: var(--radius-full);
          margin-left: 2px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .api-status-pill.status-valid {
          background: rgba(16, 185, 129, 0.12);
          color: #34D399;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .api-status-pill.status-valid:hover {
          background: rgba(16, 185, 129, 0.22);
        }

        .api-status-pill.status-warning {
          background: rgba(245, 158, 11, 0.12);
          color: #FBBF24;
          border-color: rgba(245, 158, 11, 0.3);
        }

        .api-status-pill.status-warning:hover {
          background: rgba(245, 158, 11, 0.22);
        }

        .btn-icon {
          width: 38px;
          height: 38px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        @media (max-width: 960px) {
          .brand-subtitle, .status-text {
            display: none;
          }
          .nav-tab-btn span {
            display: none;
          }
          .nav-tab-btn {
            padding: 8px 12px;
          }
        }
      `}</style>
    </header>
  );
};
