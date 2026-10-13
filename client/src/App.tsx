import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SettingsModal } from './pages/SettingsModal';
import { ApiGenerationPage } from './pages/ApiGenerationPage';
import { GeminiGenerationPage } from './pages/GeminiGenerationPage';
import { DatasetManagerPage } from './pages/DatasetManagerPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ExpressivePilotPage } from './pages/expressive/ExpressivePilotPage';
import { ContextSwitchingPage } from './pages/ContextSwitchingPage';
import { Sample, SystemConfig } from './types';
import { fetchConfig, fetchDataset } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'gemini' | 'dataset' | 'compare' | 'expressive' | 'context-switch'>(() => window.location.hash === '#context-auto' ? 'context-switch' : 'gemini');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tts_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tts_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Add toast helper
  const addToast = React.useCallback((toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSamplesRefreshed = React.useCallback((fresh: Sample[]) => {
    setSamples(fresh);
  }, []);

  // Initial load of config and dataset
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [sysConfig, datasetList] = await Promise.all([
        fetchConfig().catch(() => ({ status: 'ok', isKeyConfigured: false, keyValid: false })),
        fetchDataset().catch(() => [])
      ]);
      setConfig(sysConfig);
      setSamples(datasetList);
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  // Handle sample creation
  const handleSampleCreated = React.useCallback((newSample: Sample) => {
    setSamples((prev) => {
      const index = prev.findIndex((s) => s.id === newSample.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = newSample;
        return updated;
      }
      return [newSample, ...prev];
    });
  }, []);

  // Handle sample update
  const handleSampleUpdated = React.useCallback((updated: Sample) => {
    setSamples((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  // Handle sample delete
  const handleSampleDeleted = React.useCallback((id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Handle batch delete of multiple samples
  const handleBatchDeleted = React.useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setSamples((prev) => prev.filter((s) => !idSet.has(s.id)));
  }, []);

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        config={config}
        datasetCount={samples.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="app-container">
        <div style={{ display: activeTab === 'api' ? 'block' : 'none' }}>
          <ApiGenerationPage
            config={config}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSampleCreated={handleSampleCreated}
            addToast={addToast}
            onConfigUpdated={setConfig}
          />
        </div>

        <div style={{ display: activeTab === 'gemini' ? 'block' : 'none' }}>
          <GeminiGenerationPage
            onSampleCreated={handleSampleCreated}
            addToast={addToast}
          />
        </div>

        <div style={{ display: activeTab === 'dataset' ? 'block' : 'none' }}>
          <DatasetManagerPage
            samples={samples}
            onSampleUpdated={handleSampleUpdated}
            onSampleDeleted={handleSampleDeleted}
            onBatchDeleted={handleBatchDeleted}
            onSamplesRefreshed={handleSamplesRefreshed}
            addToast={addToast}
          />
        </div>

        <div style={{ display: activeTab === 'compare' ? 'block' : 'none' }}>
          <ComparisonPage
            samples={samples}
            onSampleUpdated={handleSampleUpdated}
            addToast={addToast}
          />
        </div>

        <div style={{ display: activeTab === 'expressive' ? 'block' : 'none' }}>
          <ExpressivePilotPage
            addToast={addToast}
          />
        </div>

        <div style={{ display: activeTab === 'context-switch' ? 'block' : 'none' }}>
          <ContextSwitchingPage
            onSampleCreated={handleSampleCreated}
            addToast={addToast}
          />
        </div>
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-flag">☀️</span>
            <span>Kurdish TTS Dataset Studio</span>
          </div>
          <div className="footer-info">
            Strict UTF-8 Kurdish Sorani Unicode Preservation • Multi-Key ElevenLabs Engine
          </div>
        </div>
      </footer>

      {/* Multi-Key Pool & Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onConfigUpdated={setConfig}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
