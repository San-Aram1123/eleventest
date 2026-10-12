import { useState, useEffect, useCallback } from 'react';
import { GeminiConfig, GeminiKeyPoolItem } from '../../../types';
import { FALLBACK_GEMINI_VOICES, DEFAULT_GEMINI_MODELS } from '../constants';
import {
  fetchGeminiConfig,
  fetchGeminiKeyPool,
  reloadGeminiKeyPool,
  resetGeminiCooldowns,
  probeGeminiKeys,
  addGeminiKeyToPool,
  addBulkGeminiKeysToPool,
  deleteGeminiKeyFromPool,
  toggleGeminiKey,
  toggleAllGeminiKeys,
  toggleBulkGeminiKeys
} from '../../../services/api';

interface UseGeminiKeyPoolOptions {
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  onDefaultConfigLoaded?: (defaultVoice?: string, defaultModel?: string) => void;
}

export function useGeminiKeyPool({ addToast, onDefaultConfigLoaded }: UseGeminiKeyPoolOptions) {
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig | null>(null);
  const [keyPool, setKeyPool] = useState<GeminiKeyPoolItem[]>([]);
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [isReloadingKeys, setIsReloadingKeys] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [probingKeyIndex, setProbingKeyIndex] = useState<number | null>(null);

  const loadConfigAndPool = useCallback(async () => {
    try {
      const [cfg, poolData] = await Promise.all([
        fetchGeminiConfig().catch(() => null),
        fetchGeminiKeyPool().catch(() => ({ pool: [], poolSize: 0, activeKeyIndex: 0 }))
      ]);
      if (cfg) {
        setGeminiConfig(cfg);
        if (onDefaultConfigLoaded) onDefaultConfigLoaded(cfg.defaultVoice, cfg.defaultModel);
      }
      setKeyPool(poolData.pool || []);
    } catch (err: any) {
      console.warn('Failed to load Gemini config:', err.message);
    }
  }, [onDefaultConfigLoaded]);

  useEffect(() => { loadConfigAndPool(); }, [loadConfigAndPool]);

  // Live 1-second countdown ticker for key quota cooldown recovery
  useEffect(() => {
    const timer = setInterval(() => {
      setKeyPool(prev => {
        let hasChanges = false;
        const updated = prev.map(k => {
          if (k.remainingSeconds !== undefined && k.remainingSeconds > 0) {
            hasChanges = true;
            const nextSec = k.remainingSeconds - 1;
            return nextSec <= 0 ? { ...k, status: 'ready' as const, remainingSeconds: 0, error: null } : { ...k, remainingSeconds: nextSec };
          }
          return k;
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReloadKeys = async () => {
    setIsReloadingKeys(true);
    try {
      const res = await reloadGeminiKeyPool();
      setKeyPool(res.pool || []);
      const readyCount = res.readyCount ?? (res.pool || []).filter(k => k.status === 'ready').length;
      addToast({ type: 'success', title: 'Keys Live Probed', message: `${readyCount} of ${res.poolSize} keys HTTP 200 ready.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Probe Failed', message: err.message || 'Error validating keys' });
    } finally {
      setIsReloadingKeys(false);
    }
  };

  const handleResetCooldowns = async () => {
    try {
      const res = await resetGeminiCooldowns();
      setKeyPool(res.pool || []);
      addToast({ type: 'success', title: 'Cooldowns Cleared', message: 'Rate-limit cooldowns cleared. Keys ready!' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Reset Failed', message: err.message });
    }
  };

  const handleProbeSingleKey = async (idx: number) => {
    setProbingKeyIndex(idx);
    try {
      const res = await probeGeminiKeys(idx);
      if (res.pool) setKeyPool(res.pool);
      const probe = res.probe;
      if (probe?.hasQuota) {
        addToast({ type: 'success', title: `Key #${idx + 1} LIVE`, message: `HTTP 200 OK. Key is active right now!` });
      } else if (probe?.status === 'exhausted') {
        addToast({ type: 'info', title: `Key #${idx + 1} Quota Limited`, message: `HTTP 429: Retry in ${probe.remainingSeconds}s.` });
      } else {
        addToast({ type: 'error', title: `Key #${idx + 1} Denied`, message: `HTTP ${probe?.httpStatus || 400}: ${probe?.error || 'Invalid key'}` });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: `Probe Error`, message: err.message });
    } finally {
      setProbingKeyIndex(null);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await addGeminiKeyToPool(customKeyInput.trim());
      addToast({ type: 'success', title: 'Key Added', message: res.message });
      setCustomKeyInput('');
      await loadConfigAndPool();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Add Key Failed', message: err.message });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleBulkAddKeys = async (keysText: string) => {
    try {
      const res = await addBulkGeminiKeysToPool(keysText);
      addToast({ type: 'success', title: 'Keys Imported', message: res.message || `Added ${res.addedCount} keys.` });
      await loadConfigAndPool();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Import Failed', message: err.message });
      throw err;
    }
  };

  const handleDeleteKey = async (index: number) => {
    try {
      await deleteGeminiKeyFromPool(index);
      addToast({ type: 'info', title: 'Key Removed', message: 'Key removed from pool.' });
      await loadConfigAndPool();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const handleToggleKey = async (index: number, enabled?: boolean) => {
    try {
      const res = await toggleGeminiKey(index, enabled);
      if (res.pool) setKeyPool(res.pool);
      addToast({ type: 'info', title: res.isEnabled ? 'Key ON' : 'Key OFF', message: res.message });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Toggle Failed', message: err.message });
    }
  };

  const handleToggleAllKeys = async (enabled: boolean) => {
    try {
      const res = await toggleAllGeminiKeys(enabled);
      if (res.pool) setKeyPool(res.pool);
      addToast({ type: 'info', title: enabled ? 'All Keys ON' : 'All Keys OFF', message: res.message });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Toggle All Failed', message: err.message });
    }
  };

  const handleToggleBulkKeys = async (indices: number[], enabled: boolean) => {
    try {
      const res = await toggleBulkGeminiKeys(indices, enabled);
      if (res.pool) setKeyPool(res.pool);
      addToast({ type: 'info', title: enabled ? `${indices.length} Keys ON` : `${indices.length} Keys OFF`, message: res.message });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Bulk Toggle Failed', message: err.message });
    }
  };

  // Exclude Gemini 2.5
  const voices = geminiConfig?.voices?.length ? geminiConfig.voices : FALLBACK_GEMINI_VOICES;
  const rawModels = geminiConfig?.models?.length ? geminiConfig.models : DEFAULT_GEMINI_MODELS;
  const models = rawModels.filter(m => !m.id.includes('2.5') && !m.id.includes('2.0'));

  const poolCount = keyPool.length || (geminiConfig?.isKeyConfigured ? 1 : 0);
  const activeKeyCount = keyPool.filter(k => k.isEnabled !== false).length;
  const disabledKeyCount = keyPool.filter(k => k.isEnabled === false).length;
  const readyKeyCount = keyPool.filter(k => k.isEnabled !== false && k.status === 'ready').length;
  const dailyExhaustedKeys = keyPool.filter(k => k.isEnabled !== false && (k.status === 'daily_exhausted' || (k.quotaType === 'daily' && k.status !== 'ready')));
  const minuteCooldownKeys = keyPool.filter(k => k.isEnabled !== false && k.status === 'exhausted' && k.quotaType !== 'daily' && (k.remainingSeconds !== undefined && k.remainingSeconds > 0));
  const minCooldownSeconds = minuteCooldownKeys.length > 0 ? Math.min(...minuteCooldownKeys.map(k => k.remainingSeconds || 60)) : 0;
  const exhaustedKeyCount = dailyExhaustedKeys.length + minuteCooldownKeys.length;

  return {
    geminiConfig, keyPool, showKeyManager, setShowKeyManager, isReloadingKeys,
    customKeyInput, setCustomKeyInput, isSavingKey, probingKeyIndex,
    voices, models, poolCount, activeKeyCount, disabledKeyCount, readyKeyCount,
    dailyExhaustedKeys, minuteCooldownKeys, minCooldownSeconds, exhaustedKeyCount,
    loadConfigAndPool, handleReloadKeys, handleResetCooldowns, handleProbeSingleKey,
    handleAddKey, handleBulkAddKeys, handleDeleteKey, handleToggleKey, handleToggleAllKeys, handleToggleBulkKeys
  };
}
