import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SettingsModal } from './pages/SettingsModal';
import { ApiGenerationPage } from './pages/ApiGenerationPage';
import { NormalWorkflowPage } from './pages/NormalWorkflowPage';
import { DatasetManagerPage } from './pages/DatasetManagerPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { Sample, SystemConfig } from './types';
import { fetchConfig, fetchDataset } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'api' | 'normal' | 'dataset' | 'compare'>('api');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  // Handle sample creation (from API or Normal workflow)
  const handleSampleCreated = (newSample: Sample) => {
    setSamples((prev) => {
      const index = prev.findIndex((s) => s.id === newSample.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = newSample;
        return updated;
      }
      return [newSample, ...prev];
    });
  };

  // Handle sample update
  const handleSampleUpdated = (updated: Sample) => {
    setSamples((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  // Handle sample delete
  const handleSampleDeleted = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        config={config}
        datasetCount={samples.length}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {activeTab === 'api' && (
          <ApiGenerationPage
            config={config}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSampleCreated={handleSampleCreated}
            addToast={addToast}
            onConfigUpdated={setConfig}
          />
        )}

        {activeTab === 'normal' && (
          <NormalWorkflowPage
            onSampleCreated={handleSampleCreated}
            addToast={addToast}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetManagerPage
            samples={samples}
            onSampleUpdated={handleSampleUpdated}
            onSampleDeleted={handleSampleDeleted}
            addToast={addToast}
          />
        )}

        {activeTab === 'compare' && (
          <ComparisonPage
            samples={samples}
            onSampleUpdated={handleSampleUpdated}
            addToast={addToast}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-flag">☀️</span>
            <span>Kurdish TTS Dataset Studio</span>
          </div>
          <div className="footer-info">
            Strict UTF-8 Kurdish Sorani Unicode Preservation • ElevenLabs Audio Engine
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onClose={() => setIsSettingsOpen(false)}
          onConfigUpdated={(newCfg) => setConfig(newCfg)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <style>{`
        .app-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-footer {
          border-top: 1px solid var(--border-subtle);
          background: rgba(11, 15, 23, 0.9);
          padding: 16px 24px;
          margin-top: 40px;
        }

        .footer-content {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-dim);
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .footer-flag {
          font-size: 1rem;
        }

        .footer-info {
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};
