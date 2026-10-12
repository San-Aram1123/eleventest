import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, KeyRound, ExternalLink } from 'lucide-react';
import { SystemConfig, KeyPoolItem, KeyPoolResponse } from '../types';
import { fetchKeyPool, addKeyToPool, deleteKeyFromPool, fetchConfig } from '../services/api';
import { KeyPoolSummaryCard } from '../components/settings/KeyPoolSummaryCard';
import { KeyPoolList } from '../components/settings/KeyPoolList';
import { AddKeyCard } from '../components/settings/AddKeyCard';
import { DatabaseStatusCard } from '../components/settings/DatabaseStatusCard';
import { KeyPoolTipsSection } from '../components/settings/KeyPoolTipsSection';

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

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container settings-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <KeyRound size={22} className="text-cyan" />
            <div>
              <div className="modal-title">Multi-API Key Pool &amp; Failover</div>
              <div className="modal-subtitle">Add multiple ElevenLabs accounts with automatic quota failover</div>
            </div>
          </div>
          <button className="btn-ghost btn-icon" onClick={onClose} title="Close Settings">
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          <KeyPoolSummaryCard
            keyPool={keyPool}
            poolSummary={poolSummary}
            loadingPool={loadingPool}
            onRefresh={loadKeys}
          />

          <KeyPoolList
            keyPool={keyPool}
            loadingPool={loadingPool}
            deletingIndex={deletingIndex}
            onDeleteKey={handleDeleteKey}
          />

          <AddKeyCard
            newApiKey={newApiKey}
            onApiKeyChange={setNewApiKey}
            addingKey={addingKey}
            feedback={feedback}
            onAddKey={handleAddKey}
          />

          <DatabaseStatusCard database={config?.database} />

          <KeyPoolTipsSection />
        </div>

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
    </div>
  );

  return createPortal(modalContent, document.body);
};
