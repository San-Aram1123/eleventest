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
  Moon,
  Languages
} from 'lucide-react';
import { SystemConfig } from '../types';

interface NavbarProps {
  activeTab: 'api' | 'gemini' | 'dataset' | 'compare' | 'expressive' | 'context-switch' | 'dual-pilot';
  onSelectTab: (tab: 'api' | 'gemini' | 'dataset' | 'compare' | 'expressive' | 'context-switch' | 'dual-pilot') => void;
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
    <header className="app-header">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <span className="brand-flag-icon">☀️</span>
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span>دەنگساز</span>
              <span className="brand-badge">PRO</span>
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

          <button
            id="nav-tab-expressive"
            className={`nav-tab-btn ${activeTab === 'expressive' ? 'active' : ''}`}
            onClick={() => onSelectTab('expressive')}
          >
            <Sparkles size={18} className="nav-tab-icon" style={{ color: '#C084FC' }} />
            <span>Expressive Pilot</span>
            <span className="nav-count-badge" style={{ background: '#7C3AED' }}>27</span>
          </button>

          <button
            id="nav-tab-context-switch"
            className={`nav-tab-btn ${activeTab === 'context-switch' ? 'active' : ''}`}
            onClick={() => onSelectTab('context-switch')}
          >
            <Languages size={18} className="nav-tab-icon" style={{ color: '#10B981' }} />
            <span>Context Switching</span>
            <span className="nav-count-badge" style={{ background: '#059669' }}>3-Lang</span>
          </button>

          <button
            id="nav-tab-dual-pilot"
            className={`nav-tab-btn ${activeTab === 'dual-pilot' ? 'active' : ''}`}
            onClick={() => onSelectTab('dual-pilot')}
          >
            <GitCompare size={18} className="nav-tab-icon" style={{ color: '#F472B6' }} />
            <span>Dual Pilot</span>
            <span className="nav-count-badge" style={{ background: '#EC4899' }}>V20</span>
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
                <span>Pool: {poolCount} Active</span>
              </>
            ) : (
              <>
                <AlertCircle size={15} className="status-icon" />
                <span>API Keys Needed</span>
              </>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            id="btn-toggle-theme"
            className="btn btn-secondary btn-icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: '#FBBF24' }} />
            ) : (
              <Moon size={18} style={{ color: '#6366F1' }} />
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
    </header>
  );
};
