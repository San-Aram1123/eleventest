import express from 'express';
import {
  validateApiKey,
  getVoices,
  getModels,
  generateSpeech,
  getKeyPool,
  addKeyToPool,
  removeKeyFromPool,
  getKeyPoolDetails
} from '../elevenlabs.js';
import { getDbStatus, testDbConnection } from '../db.js';
import { saveSample } from '../datasetService.js';

const router = express.Router();

/**
 * Check system status, key pool size, database health, and primary key status
 */
router.get('/config', async (req, res) => {
  const pool = getKeyPool();
  const isKeyConfigured = pool.length > 0;

  let userInfo = null;
  let keyValid = false;
  let validationError = null;

  if (isKeyConfigured) {
    try {
      userInfo = await validateApiKey(pool[0]);
      keyValid = true;
    } catch (err) {
      validationError = err.message;
    }
  }

  res.json({
    status: 'ok',
    isKeyConfigured,
    keyValid,
    validationError,
    poolSize: pool.length,
    maskedKey: isKeyConfigured ? `${pool[0].slice(0, 4)}...${pool[0].slice(-4)}` : null,
    userInfo: userInfo ? {
      tier: userInfo.subscription?.tier,
      character_count: userInfo.subscription?.character_count,
      character_limit: userInfo.subscription?.character_limit,
      can_extend_character_limit: userInfo.subscription?.can_extend_character_limit,
      status: userInfo.subscription?.status
    } : null,
    database: getDbStatus()
  });
});

/**
 * Get MySQL database connection status
 */
router.get('/config/db', (req, res) => {
  res.json(getDbStatus());
});

/**
 * Test or re-initialize MySQL database connection with custom credentials
 */
router.post('/config/db/test', async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;
    await testDbConnection({
      host: host || process.env.DB_HOST || 'localhost',
      port: parseInt(port || process.env.DB_PORT || '3306', 10),
      user: user || process.env.DB_USER || 'root',
      password: password !== undefined ? password : (process.env.DB_PASSWORD || ''),
      database: database || process.env.DB_NAME || 'kurdish_tts_db'
    });
    res.json({ success: true, message: 'MySQL connection successful!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * Get detailed health, quota, and status for all keys in the pool
 */
router.get('/config/keys', async (req, res) => {
  try {
    const keys = await getKeyPoolDetails();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    const totalRemaining = keys.reduce((acc, k) => acc + (k.remainingCharacters || 0), 0);

    res.json({
      keys,
      totalKeys: keys.length,
      readyKeys: readyCount,
      totalRemainingCharacters: totalRemaining
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add a new API key to the key pool
 */
router.post('/config/keys', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key string is required' });
    }

    const result = await addKeyToPool(apiKey);
    const poolDetails = await getKeyPoolDetails();

    res.json({
      success: true,
      message: `API Key (${result.maskedKey}) added to pool successfully`,
      pool: poolDetails
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a key from the key pool by index
 */
router.delete('/config/keys/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid key index' });
    }

    removeKeyFromPool(index);
    const poolDetails = await getKeyPoolDetails();

    res.json({
      success: true,
      message: 'API Key removed from pool',
      pool: poolDetails
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Single key update / add
 */
router.post('/config/key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key string is required' });
    }

    const result = await addKeyToPool(apiKey);

    res.json({
      success: true,
      message: `API Key (${result.maskedKey}) configured successfully`,
      userInfo: {
        tier: result.userInfo.subscription?.tier,
        character_count: result.userInfo.subscription?.character_count,
        character_limit: result.userInfo.subscription?.character_limit
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Fetch ElevenLabs voices catalog
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = await getVoices();
    res.json({ voices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Fetch ElevenLabs models catalog
 */
router.get('/models', async (req, res) => {
  try {
    const models = await getModels();
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate speech via ElevenLabs API, with timestamps/alignment,
 * preserving clean Unicode text and saving 001.wav + MySQL row
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      text,
      emotion = 'neutral',
      emotions = [],
      emotionTag = '',
      includeTagInPrompt = true,
      whisperEntire = false,
      dialect = 'sorani',
      voiceId,
      voiceName = '',
      modelId = 'eleven_v3',
      voiceSettings = {},
      customId
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Kurdish text is required' });
    }

    if (!voiceId) {
      return res.status(400).json({ error: 'ElevenLabs Voice ID is required' });
    }

    const inlineTags = (text.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
    const uniqueTags = [...new Set([
      ...inlineTags,
      ...(whisperEntire ? ['[whisper]'] : []),
      ...(emotionTag ? [emotionTag] : [])
    ].filter(Boolean))];

    const cleanText = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();

    let promptText = text.trim();
    if (whisperEntire && !promptText.startsWith('[whisper]') && !promptText.startsWith('[whispering]')) {
      promptText = `[whisper] ${promptText}`;
    }
    if (emotionTag && !promptText.includes(emotionTag) && includeTagInPrompt) {
      promptText = `${emotionTag} ${promptText}`;
    }

    const generationResult = await generateSpeech({
      text: promptText,
      emotionTag: '',
      includeTagInPrompt: false,
      voiceId,
      modelId,
      voiceSettings
    });

    const finalEmotion = uniqueTags.length > 0
      ? uniqueTags.map(t => t.replace(/[\[\]]/g, '')).join(', ')
      : (Array.isArray(emotions) && emotions.length > 0 ? emotions.join(', ') : emotion);

    const sample = await saveSample({
      id: customId,
      text: cleanText || text.trim(),
      dialect: dialect || 'sorani',
      emotion: finalEmotion,
      emotionTag: uniqueTags.join(' '),
      method: 'elevenlabs_api',
      voiceId,
      voiceName,
      modelId,
      generationId: generationResult.generationId,
      characters: generationResult.characters,
      alignment: generationResult.alignment,
      audioBuffer: generationResult.audioBuffer,
      customMetadata: {
        prompt_with_tags: promptText,
        whisper_entire: Boolean(whisperEntire),
        detected_tags: uniqueTags
      }
    });

    res.json({
      success: true,
      sample
    });
  } catch (err) {
    console.error('API Generation Error:', err);
    res.status(500).json({ error: err.message || 'Speech generation failed' });
  }
});

export default router;
