import express from 'express';
import {
  saveGeminiApiKey, getGeminiKeyPool, getAllGeminiKeys, toggleGeminiKey,
  setAllGeminiKeysEnabled, toggleMultipleGeminiKeys, addGeminiKeyToPool,
  addMultipleGeminiKeysToPool, removeGeminiKeyFromPool, getGeminiKeyPoolDetails,
  reloadAndValidateGeminiKeys, probeGeminiKeyQuota, probeAllGeminiKeys,
  clearGeminiCooldowns, getAvailableGeminiModels, getAvailableGeminiVoices
} from '../geminiService.js';

const router = express.Router();

/**
 * Get Gemini API configuration and available voices & models
 */
router.get('/config', async (req, res) => {
  const pool = getGeminiKeyPool();
  const allKeys = getAllGeminiKeys();
  const isKeyConfigured = pool.length > 0;
  const key = pool[0] || allKeys[0] || '';
  const models = await getAvailableGeminiModels();
  const voices = await getAvailableGeminiVoices();
  res.json({
    isKeyConfigured,
    poolSize: pool.length,
    totalKeys: allKeys.length,
    maskedKey: (key) ? `${key.slice(0, 4)}...${key.slice(-4)}` : null,
    voices,
    models,
    defaultModel: 'gemini-3.8-flash-tts',
    defaultVoice: 'Puck'
  });
});

/**
 * Get all Gemini keys in the pool with health status
 */
router.get('/config/keys', async (req, res) => {
  try {
    const keys = await getGeminiKeyPoolDetails();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    const activeCount = keys.filter(k => k.isEnabled !== false).length;
    const disabledCount = keys.filter(k => k.isEnabled === false).length;
    res.json({ pool: keys, poolSize: keys.length, activeCount, disabledCount, readyCount, activeKeyIndex: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Force reload, re-test with LIVE API probe, and update health status of all Gemini keys
 */
router.post('/config/keys/reload', async (req, res) => {
  try {
    const keys = await reloadAndValidateGeminiKeys();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    res.json({
      success: true,
      message: `Live tested ${keys.length} Gemini keys (${readyCount} ready/active on Google API)`,
      pool: keys,
      poolSize: keys.length,
      readyCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Live probe all keys or single key against Google AI Studio
 */
router.post('/config/keys/probe', async (req, res) => {
  try {
    const keys = await probeAllGeminiKeys();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    res.json({ success: true, pool: keys, poolSize: keys.length, readyCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset all active Gemini rate-limit cooldowns in memory
 */
router.post('/config/keys/reset-cooldowns', async (req, res) => {
  try {
    clearGeminiCooldowns();
    const allDetails = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: 'All Gemini key cooldowns reset. Ready for requests.',
      pool: allDetails,
      poolSize: allDetails.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/config/keys/:index/probe', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const pool = getGeminiKeyPool();
    if (isNaN(index) || index < 0 || index >= pool.length) {
      return res.status(400).json({ error: 'Invalid key index' });
    }

    const key = pool[index];
    const probe = await probeGeminiKeyQuota(key);
    const allDetails = await getGeminiKeyPoolDetails();

    res.json({
      success: true,
      probe,
      keyIndex: index,
      maskedKey: `${key.slice(0, 4)}...${key.slice(-4)}`,
      pool: allDetails
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add a new Gemini API key to the pool
 */
router.post('/config/keys', async (req, res) => {
  try {
    const { apiKey, text, keys } = req.body;
    const input = apiKey || text || keys;
    if (!input || (typeof input !== 'string' && !Array.isArray(input))) {
      return res.status(400).json({ error: 'Gemini API key string or array is required' });
    }

    if (Array.isArray(input) || (typeof input === 'string' && /[\r\n,;]/.test(input.trim()))) {
      const result = await addMultipleGeminiKeysToPool(input);
      const pool = await getGeminiKeyPoolDetails();
      return res.json({
        success: true,
        message: `Successfully added ${result.addedCount} new key(s) to pool. Total keys: ${result.poolSize}`,
        addedCount: result.addedCount,
        poolSize: result.poolSize,
        pool
      });
    }

    const result = await addGeminiKeyToPool(String(input).trim());
    const pool = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: `Gemini API key (${result.maskedKey}) added to pool. Total keys: ${result.poolSize}`,
      pool
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Bulk add Gemini API keys to the pool
 */
router.post('/config/keys/bulk', async (req, res) => {
  try {
    const { input, text, keys } = req.body;
    const result = await addMultipleGeminiKeysToPool(input || text || keys);
    const pool = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: `Successfully added ${result.addedCount} new key(s) to pool. Total keys: ${result.poolSize}`,
      addedCount: result.addedCount,
      poolSize: result.poolSize,
      pool
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a Gemini API key from the pool
 */
router.delete('/config/keys/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) return res.status(400).json({ error: 'Invalid key index' });
    const result = removeGeminiKeyFromPool(index);
    res.json({ success: true, message: 'Gemini key removed from pool', poolSize: result.poolSize });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Toggle a Gemini key ON (active) or OFF (turned off)
 */
router.post('/config/keys/:index/toggle', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) return res.status(400).json({ error: 'Invalid key index' });
    const { enabled } = req.body || {};
    const result = toggleGeminiKey(index, typeof enabled === 'boolean' ? enabled : null);
    const pool = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: `Gemini key #${index + 1} (${result.maskedKey}) is now ${result.isEnabled ? 'Active (Turned ON)' : 'Turned OFF'}`,
      isEnabled: result.isEnabled,
      activeCount: result.activeCount,
      totalCount: result.totalCount,
      pool
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Toggle all Gemini keys ON or OFF at once
 */
router.post('/config/keys/toggle-all', async (req, res) => {
  try {
    const { enabled = true } = req.body || {};
    const result = setAllGeminiKeysEnabled(Boolean(enabled));
    const pool = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: `All Gemini keys are now ${result.enabled ? 'Active (Turned ON)' : 'Turned OFF'}`,
      enabled: result.enabled,
      activeCount: result.activeCount,
      totalCount: result.totalCount,
      pool
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Toggle a specific list of Gemini keys ON or OFF
 */
router.post('/config/keys/toggle-bulk', async (req, res) => {
  try {
    const { indices, enabled = true } = req.body || {};
    if (!Array.isArray(indices) || indices.length === 0) {
      return res.status(400).json({ error: 'indices array must not be empty' });
    }
    const result = toggleMultipleGeminiKeys(indices, Boolean(enabled));
    const pool = await getGeminiKeyPoolDetails();
    res.json({
      success: true,
      message: `${indices.length} Gemini keys are now ${result.enabled ? 'Active (Turned ON)' : 'Turned OFF'}`,
      enabled: result.enabled,
      activeCount: result.activeCount,
      totalCount: result.totalCount,
      pool
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Save / Update primary Gemini API key
 */
router.post('/key', (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'Gemini API key string is required' });
    }
    const saved = saveGeminiApiKey(apiKey);
    res.json({
      success: true,
      message: 'Gemini API Key configured successfully',
      maskedKey: `${saved.slice(0, 4)}...${saved.slice(-4)}`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
