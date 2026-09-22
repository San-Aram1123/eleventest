import React from 'react';
import { 
  Sparkles, 
  Database, 
  GitCompare, 
  Settings, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Bot,
  Sun,
  Moon
} from 'lucide-react';
import { SystemConfig } from '../types';

interface NavbarProps {
  activeTab: 'api' | 'gemini' | 'dataset' | 'compare';
  onSelectTab: (tab: 'api' | 'gemini' | 'dataset' | 'compare') => void;
  onOpenSettings: () => void;
  config: SystemConfig | null;
  datasetCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  config,
  datasetCount,
  theme,
  onToggleTheme
}) => {
  const poolCount = config?.poolSize || (config?.isKeyConfigured ? 1 : 0);

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
              ElevenLabs & Gemini Voice Testing & Dataset Engine
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
            <span>ElevenLabs</span>
          </button>

          <button
            id="nav-tab-gemini"
            className={`nav-tab-btn ${activeTab === 'gemini' ? 'active' : ''}`}
            onClick={() => onSelectTab('gemini')}
          >
            <Bot size={18} className="nav-tab-icon" />
            <span>Gemini Studio</span>
            <span className="nav-count-badge" style={{ background: '#7C3AED' }}>2.0</span>
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
            <span>Compare & Evaluate</span>
          </button>
        </nav>

        {/* Right Actions & Status */}
        <div className="navbar-actions">
          {/* Key Pool Status Pill */}
          <button 
            className={`api-status-pill ${config?.keyValid ? 'status-valid' : 'status-warning'}`}
            onClick={onOpenSettings}
            title={config?.keyValid ? `Key Pool Active: ${poolCount} keys configured with automatic failover` : 'Configure ElevenLabs API Keys'}
          >
            {config?.keyValid ? (
              <>
                <CheckCircle2 size={15} className="status-icon" />
                <span className="status-text">
                  {poolCount > 1 ? `${poolCount} Keys (Failover On)` : `1 Key (${config.userInfo?.tier?.toUpperCase() || 'Ready'})`}
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={15} className="status-icon" />
                <span className="status-text">Add API Keys</span>
              </>
            )}
          </button>

          {/* Theme Switcher Button */}
          <button
            id="btn-toggle-theme"
            className="btn btn-secondary btn-icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
            style={{ 
              transition: 'all 0.2s ease',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#FFFFFF',
              boxShadow: theme === 'light' ? '0 1px 4px rgba(15, 23, 42, 0.08)' : undefined
            }}
          >
            {theme === 'dark' ? (
              <Sun size={18} color="#FBBF24" />
            ) : (
              <Moon size={18} color="#6366F1" />
            )}
          </button>

          {/* Settings / Key Pool Button */}
          <button
            id="btn-open-settings"
            className="btn btn-secondary btn-icon"
            onClick={onOpenSettings}
            title="Multi-Key Pool & Settings"
          >
            <KeyRound size={18} />
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
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.1));
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
        }

        .brand-flag-badge {
          position: absolute;
          top: -7px;
          right: -6px;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          background: linear-gradient(90deg, #10B981, #F59E0B, #EF4444);
          color: #FFFFFF;
          padding: 1px 5px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 0.74rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 2px;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.75);
          padding: 4px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-subtle);
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }

        .nav-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-tab-btn.active {
          color: #FFFFFF;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(129, 140, 248, 0.2));
          border: 1px solid rgba(56, 189, 248, 0.4);
          box-shadow: 0 2px 10px rgba(56, 189, 248, 0.2);
        }

        .nav-tab-btn.active .nav-tab-icon {
          color: #38BDF8;
        }

        .nav-count-badge {
          font-size: 0.7rem;
          background: #0284C7;
          color: #FFFFFF;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .api-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .status-valid {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34D399;
        }

        .status-valid:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
        }

        .status-warning {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          color: #FBBF24;
        }

        .status-warning:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
        }

        .btn-icon {
          padding: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </header>
  );
};
