import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

import {
  ensureDatasetDir,
  getAllSamples,
  getSample,
  getSampleAudio,
  saveSample,
  updateSampleMetadata,
  deleteSample,
  deleteSamples,
  deleteDurationOutliers,
  exportDatasetZip,
  getNextSampleId,
  findSampleByText,
  sampleMatchesFilter,
  resolveSampleGender
} from './datasetService.js';

import {
  initDatabase,
  getDbStatus,
  testDbConnection
} from './db.js';

import {
  validateApiKey,
  getVoices,
  getModels,
  generateSpeech,
  getApiKey,
  getKeyPool,
  addKeyToPool,
  removeKeyFromPool,
  getKeyPoolDetails,
  saveKeyPool
} from './elevenlabs.js';

import {
  generateGeminiSpeech,
  getGeminiApiKey,
  saveGeminiApiKey,
  getGeminiKeyPool,
  getAllGeminiKeys,
  toggleGeminiKey,
  setAllGeminiKeysEnabled,
  toggleMultipleGeminiKeys,
  addGeminiKeyToPool,
  addMultipleGeminiKeysToPool,
  removeGeminiKeyFromPool,
  getGeminiKeyPoolDetails,
  reloadAndValidateGeminiKeys,
  probeGeminiKeyQuota,
  probeAllGeminiKeys,
  clearGeminiCooldowns,
  getAvailableGeminiModels,
  getAvailableGeminiVoices,
  GEMINI_VOICES,
  KNOWN_AUDIO_MODELS
} from './geminiService.js';

import { ensureWavBuffer } from './wavUtils.js';
import {
  splitTextIntoParagraphs,
  formatPromptWithExplicitPauses,
  detectSilences,
  calculateOptimalSplitWindows,
  sliceWavFileToBuffers
} from './audioSplitter.js';
import {
  extractEmotionAndCleanText,
  normalizeEmotionName
} from './emotionUtils.js';
import {
  generatePairedEmotionClip,
  generateFullFamilySet,
  getNextFamilyIndex
} from './pairedBatchService.js';
import { validatePairedDataset } from './pairedValidation.js';
import {
  generatePairedMetadataCsv,
  exportPairedZipArchive
} from './pairedExporter.js';
import { repairDatasetBoundaries } from './repairDatasetBoundaries.js';
import {
  generatePairedFamilySliced,
  generateTransposedEmotionBatch,
  getLatestMasterAudio,
  getMasterAudioHistory,
  getMasterAudioById,
  clearMasterAudioHistory
} from './pairedSlicingService.js';
import {
  REQUIRED_EMOTIONS,
  OPTIONAL_EMOTIONS,
  SPEAKER_PRESETS
} from './pairedEmotionConfig.js';
import {
  generateContextSwitchingSlicedBatch,
  generateContextSwitchingSingleSample,
  getNextContextSwitchingIndex
} from './contextSwitchingService.js';

dotenv.config();

// Prevent server process crashes from unhandled asynchronous rejections
process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Server Warning] Caught unhandled rejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Server Warning] Caught uncaught exception:', err?.message || err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure dataset directory exists
ensureDatasetDir();

// ==========================================
// 1. CONFIG & MULTI-API KEY POOL ROUTES
// ==========================================

/**
 * Check system status, key pool size, database health, and primary key status
 */
app.get('/api/config', async (req, res) => {
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
app.get('/api/config/db', (req, res) => {
  res.json(getDbStatus());
});

/**
 * Test or re-initialize MySQL database connection with custom credentials
 */
app.post('/api/config/db/test', async (req, res) => {
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
app.get('/api/config/keys', async (req, res) => {
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
app.post('/api/config/keys', async (req, res) => {
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
app.delete('/api/config/keys/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid key index' });
    }

    const result = removeKeyFromPool(index);
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
app.post('/api/config/key', async (req, res) => {
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

// ==========================================
// 2. ELEVENLABS CATALOG (VOICES & MODELS)
// ==========================================

app.get('/api/voices', async (req, res) => {
  try {
    const voices = await getVoices();
    res.json({ voices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models', async (req, res) => {
  try {
    const models = await getModels();
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. SECTION 1: API SPEECH GENERATION
// ==========================================

/**
 * Generate speech via ElevenLabs API, with timestamps/alignment,
 * preserving clean Unicode text and saving 001.wav + MySQL row
 */
app.post('/api/generate', async (req, res) => {
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

    // Extract any inline tags in text (e.g. [laugh], [whisper], [sigh])
    const inlineTags = (text.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
    const uniqueTags = [...new Set([
      ...inlineTags,
      ...(whisperEntire ? ['[whisper]'] : []),
      ...(emotionTag ? [emotionTag] : [])
    ].filter(Boolean))];

    // Clean transcript: strip all tags from Kurdish text for storage
    const cleanText = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();

    // Construct prompt sent to ElevenLabs:
    // Keep inline tags in text, and if whisperEntire is true, ensure [whisper] is at the start
    let promptText = text.trim();
    if (whisperEntire && !promptText.startsWith('[whisper]') && !promptText.startsWith('[whispering]')) {
      promptText = `[whisper] ${promptText}`;
    }
    if (emotionTag && !promptText.includes(emotionTag) && includeTagInPrompt) {
      promptText = `${emotionTag} ${promptText}`;
    }

    // Call ElevenLabs API
    const generationResult = await generateSpeech({
      text: promptText,
      emotionTag: '', // Already incorporated into promptText
      includeTagInPrompt: false,
      voiceId,
      modelId,
      voiceSettings
    });

    // Formulate final emotion string
    const finalEmotion = uniqueTags.length > 0
      ? uniqueTags.map(t => t.replace(/[\[\]]/g, '')).join(', ')
      : (Array.isArray(emotions) && emotions.length > 0 ? emotions.join(', ') : emotion);

    // Save sample to dataset and MySQL with clean Kurdish Unicode text
    const sample = await saveSample({
      id: customId,
      text: cleanText || text.trim(), // Authoritative clean Unicode Kurdish transcript
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

// ==========================================
// 3.5. GEMINI MULTIMODAL AUDIO & SPEECH
// ==========================================

/**
 * Get Gemini API configuration and available voices & models
 */
app.get('/api/gemini/config', async (req, res) => {
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
app.get('/api/gemini/config/keys', async (req, res) => {
  try {
    const keys = await getGeminiKeyPoolDetails();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    const activeCount = keys.filter(k => k.isEnabled !== false).length;
    const disabledCount = keys.filter(k => k.isEnabled === false).length;
    res.json({
      pool: keys,
      poolSize: keys.length,
      activeCount,
      disabledCount,
      readyCount,
      activeKeyIndex: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Force reload, re-test with LIVE API probe, and update health status of all Gemini keys
 */
app.post('/api/gemini/config/keys/reload', async (req, res) => {
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
app.post('/api/gemini/config/keys/probe', async (req, res) => {
  try {
    const keys = await probeAllGeminiKeys();
    const readyCount = keys.filter(k => k.status === 'ready').length;
    res.json({
      success: true,
      pool: keys,
      poolSize: keys.length,
      readyCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset all active Gemini rate-limit cooldowns in memory
 */
app.post('/api/gemini/config/keys/reset-cooldowns', async (req, res) => {
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

app.post('/api/gemini/config/keys/:index/probe', async (req, res) => {
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
app.post('/api/gemini/config/keys', async (req, res) => {
  try {
    const { apiKey, text, keys } = req.body;
    const input = apiKey || text || keys;
    if (!input || (typeof input !== 'string' && !Array.isArray(input))) {
      return res.status(400).json({ error: 'Gemini API key string or array is required' });
    }

    // Auto-detect bulk keys (array or multi-line/comma-separated)
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
app.post('/api/gemini/config/keys/bulk', async (req, res) => {
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
app.delete('/api/gemini/config/keys/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid key index' });
    }
    const result = removeGeminiKeyFromPool(index);
    res.json({
      success: true,
      message: 'Gemini key removed from pool',
      poolSize: result.poolSize
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Toggle a Gemini key ON (active) or OFF (turned off)
 */
app.post('/api/gemini/config/keys/:index/toggle', async (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Invalid key index' });
    }
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
app.post('/api/gemini/config/keys/toggle-all', async (req, res) => {
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
app.post('/api/gemini/config/keys/toggle-bulk', async (req, res) => {
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
app.post('/api/gemini/key', (req, res) => {
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

// In-flight Gemini generation promises to coalesce concurrent duplicate requests
const inFlightGeminiGenerations = new Map();

/**
 * Generate Kurdish speech via Google Gemini Audio with automatic multi-key failover
 * With in-flight request deduplication and pre-generation dataset check
 */
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Puck',
      dialect = 'sorani',
      emotion = 'neutral',
      emotions = [],
      promptInstruction = '',
      apiKey = '',
      model = 'gemini-3.8-flash-tts',
      saveToDataset = true,
      customId,
      forceRegenerate = false
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Kurdish text is required' });
    }

    const cleanInputText = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();

    // 1. PRE-GENERATION DATASET CHECK
    // If saving to dataset and not explicitly forcing re-generation:
    // Check if sample already exists in MySQL / disk
    if (saveToDataset && !forceRegenerate && !customId) {
      const existingSample = await findSampleByText(cleanInputText || text.trim());
      if (existingSample) {
        console.log(`[Gemini Generate] Pre-check: sample already exists in dataset (#${existingSample.id}), skipping generation to save quota.`);
        return res.json({
          success: true,
          sample: existingSample,
          durationSeconds: existingSample.duration_seconds || existingSample.durationSeconds || 0,
          voiceName: existingSample.voice_name || `Gemini (${voiceName})`,
          model: existingSample.model_id || model,
          usedKeyMasked: existingSample.customMetadata?.used_key || 'Dataset Cache',
          detectedTags: existingSample.customMetadata?.detected_tags || [],
          alreadyExists: true
        });
      }
    }

    // 2. IN-FLIGHT COALESCING MUTEX
    // Keyed by normalized text + voiceName + dialect
    const inFlightKey = `${cleanInputText || text.trim()}:::${voiceName}:::${dialect}`;
    let generationPromise;

    if (inFlightGeminiGenerations.has(inFlightKey)) {
      console.log(`[Gemini Generate] Coalescing concurrent request for in-flight text: "${(cleanInputText || text).slice(0, 30)}..."`);
      generationPromise = inFlightGeminiGenerations.get(inFlightKey);
    } else {
      generationPromise = generateGeminiSpeech({
        text: text.trim(),
        voiceName,
        dialect,
        promptInstruction,
        apiKey,
        model
      });
      inFlightGeminiGenerations.set(inFlightKey, generationPromise);
      // Clean up when settled without generating unhandled promise rejections
      generationPromise
        .catch(() => { })
        .finally(() => {
          inFlightGeminiGenerations.delete(inFlightKey);
        });
    }

    const result = await generationPromise;

    const detectedTags = result.detectedTags || [];
    const finalEmotion = detectedTags.length > 0
      ? detectedTags.map(t => t.replace(/[\[\]]/g, '')).join(', ')
      : (Array.isArray(emotions) && emotions.length > 0 ? emotions.join(', ') : emotion);

    let sample = null;
    if (saveToDataset) {
      sample = await saveSample({
        id: customId,
        text: result.cleanText || text.trim(),
        dialect: dialect || 'sorani',
        emotion: finalEmotion,
        emotionTag: detectedTags.join(' '),
        method: 'gemini_api',
        voiceId: `gemini_${voiceName}`,
        voiceName: `Gemini (${voiceName})`,
        modelId: result.modelId,
        characters: result.characters,
        audioBuffer: result.audioBuffer,
        allowDuplicateText: forceRegenerate,
        customMetadata: {
          generator: `Google Gemini (${result.modelId})`,
          voice_gender: GEMINI_VOICES.find(v => v.id === voiceName)?.gender || 'Male',
          dialect: dialect || 'sorani',
          duration_seconds: result.durationSeconds,
          sample_rate: result.sampleRate,
          detected_tags: detectedTags,
          is_multilingual: result.isMultilingual,
          used_key: result.usedKeyMasked
        }
      });
    }

    res.json({
      success: true,
      sample,
      audioBase64: !saveToDataset ? result.audioBuffer.toString('base64') : undefined,
      durationSeconds: result.durationSeconds,
      voiceName,
      model: result.modelId,
      usedKeyMasked: result.usedKeyMasked,
      isMultilingual: result.isMultilingual,
      detectedTags
    });
  } catch (err) {
    console.error('Gemini Generation Error:', err);
    res.status(500).json({ error: err.message || 'Gemini speech generation failed' });
  }
});

/**
 * Long-Paragraph Multi-Chunk Generator:
 * Generates continuous speech for multiple paragraphs/lines in a SINGLE Gemini API call
 * with deliberate 1.5s silence pauses, then auto-slices via FFmpeg silence detection
 * with zero mid-sentence or mid-word cutoffs.
 */
app.post('/api/gemini/generate-long-split', async (req, res) => {
  let tempMaster = null;
  try {
    const {
      text = '',
      paragraphs = [],
      voiceName = 'Puck',
      dialect = 'sorani',
      emotion = 'neutral',
      promptInstruction = '',
      apiKey = '',
      model = 'gemini-3.8-flash-tts'
    } = req.body;

    let cleanParagraphs = [];
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      cleanParagraphs = paragraphs.map(p => typeof p === 'string' ? p.trim() : '').filter(Boolean);
    }
    if (cleanParagraphs.length === 0 && text) {
      cleanParagraphs = splitTextIntoParagraphs(text);
    }

    if (cleanParagraphs.length === 0) {
      return res.status(400).json({ error: 'Kurdish text or paragraph list is required for long-form generation' });
    }

    console.log(`[Long Split Generator] Processing ${cleanParagraphs.length} paragraphs/sections with voice "${voiceName}" (${dialect}) in 1 single Gemini request...`);

    // 1. Format prompt with deliberate 1.5s pause directives
    const { prompt, instruction } = formatPromptWithExplicitPauses(cleanParagraphs, dialect, promptInstruction);

    // 2. Call Gemini TTS in a single request
    const result = await generateGeminiSpeech({
      text: prompt,
      voiceName,
      dialect,
      promptInstruction: instruction,
      apiKey,
      model
    });

    // 3. Write master WAV to temp file for FFmpeg silence detection
    tempMaster = path.resolve(os.tmpdir(), `master_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.wav`);
    fs.writeFileSync(tempMaster, result.audioBuffer);

    // 4. Run FFmpeg silence detection
    const silences = await detectSilences(tempMaster, -30, 0.4);
    console.log(`[Long Split Generator] Master audio duration: ${result.durationSeconds}s. Found ${silences.length} candidate silences.`);

    // 5. Calculate optimal split windows matching each paragraph
    const windows = calculateOptimalSplitWindows(silences, cleanParagraphs, result.durationSeconds);

    // 6. Slice audio into clean individual WAV buffers
    const slicedChunks = await sliceWavFileToBuffers(tempMaster, windows);

    // 7. Map each chunk with base64 audio and metadata
    const mappedChunks = slicedChunks.map((c, i) => {
      const parsed = extractEmotionAndCleanText(c.text, emotion || 'neutral');
      return {
        id: i + 1,
        chunkIndex: c.chunkIndex,
        rawText: c.text,
        text: c.text,
        cleanText: parsed.cleanText || c.text,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        audioBase64: c.audioBuffer.toString('base64'),
        voiceName,
        dialect,
        emotion: parsed.emotion,
        emotionTag: parsed.emotionTag,
        detectedTags: parsed.detectedTags,
        status: 'ready'
      };
    });

    console.log(`[Long Split Generator] Sliced master audio into ${mappedChunks.length} clean chunks with zero mid-sentence cutoffs.`);

    res.json({
      success: true,
      masterDuration: result.durationSeconds,
      voiceName,
      model: result.modelId,
      usedKeyMasked: result.usedKeyMasked,
      detectedTags: result.detectedTags || [],
      chunks: mappedChunks,
      masterAudioBase64: result.audioBuffer.toString('base64')
    });
  } catch (err) {
    console.error('Gemini Long-Split Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate and split long audio' });
  } finally {
    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
    }
  }
});

/**
 * Save sliced chunks from Long-Paragraph generation into the official dataset
 */
app.post('/api/gemini/save-split-chunks', async (req, res) => {
  try {
    const {
      chunks = [],
      voiceName = 'Puck',
      dialect = 'sorani',
      model = 'gemini-3.8-flash-tts',
      allowDuplicateText = false
    } = req.body;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: 'No chunks provided to save' });
    }

    const savedSamples = [];
    const skippedDuplicates = [];
    const errors = [];
    const seenInBatch = new Set();

    for (const chunk of chunks) {
      if (!chunk.audioBase64 || (!chunk.text && !chunk.cleanText)) continue;

      try {
        const audioBuffer = Buffer.from(chunk.audioBase64, 'base64');
        const rawSource = chunk.rawText || chunk.text || chunk.cleanText || '';
        const parsed = extractEmotionAndCleanText(rawSource, chunk.emotion || 'neutral');

        const finalEmotion = (chunk.emotion && chunk.emotion !== 'neutral')
          ? chunk.emotion
          : parsed.emotion;
        const finalEmotionTag = chunk.emotionTag || parsed.emotionTag || (finalEmotion !== 'neutral' ? `[${finalEmotion}]` : undefined);
        const finalCleanText = chunk.cleanText || parsed.cleanText || rawSource;

        // Deduplication check: check in-batch repetitions first
        const normKey = finalCleanText.replace(/\s+/g, ' ').trim().toLowerCase();
        if (!allowDuplicateText && seenInBatch.has(normKey)) {
          console.log(`[Save Split Chunks] Skipping intra-batch duplicate text: "${finalCleanText.substring(0, 40)}..."`);
          skippedDuplicates.push({ text: finalCleanText, reason: 'Duplicate within same packet' });
          continue;
        }
        seenInBatch.add(normKey);

        // Deduplication check: check existing dataset in MySQL / disk
        if (!allowDuplicateText) {
          const existing = await findSampleByText(finalCleanText);
          if (existing) {
            console.log(`[Save Split Chunks] Sample with matching Kurdish text already exists (#${existing.id}). Preserving existing sample to prevent duplicates.`);
            savedSamples.push(existing);
            continue;
          }
        }

        const sample = await saveSample({
          text: finalCleanText,
          dialect: chunk.dialect || dialect || 'sorani',
          emotion: finalEmotion,
          emotionTag: finalEmotionTag,
          method: 'gemini_api',
          voiceId: `gemini_${chunk.voiceName || voiceName}`,
          voiceName: `Gemini (${chunk.voiceName || voiceName})`,
          modelId: model,
          audioBuffer,
          allowDuplicateText: false,
          customMetadata: {
            generator: `Google Gemini (${model}) - Multi-Chunk Split`,
            voice_gender: GEMINI_VOICES.find(v => v.id === (chunk.voiceName || voiceName))?.gender || 'Male',
            dialect: chunk.dialect || dialect || 'sorani',
            duration_seconds: chunk.duration,
            sample_rate: 24000,
            detected_tags: parsed.detectedTags,
            split_source: 'long_paragraph_single_call'
          }
        });
        savedSamples.push(sample);
      } catch (err) {
        console.error(`[Save Split Chunks] Error saving chunk #${chunk.id}:`, err);
        errors.push({ id: chunk.id, error: err.message });
      }
    }

    res.json({
      success: true,
      savedCount: savedSamples.length,
      savedSamples,
      skippedDuplicates: skippedDuplicates.length > 0 ? skippedDuplicates : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Save Split Chunks Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save split chunks' });
  }
});

/**
 * Bulk repair emotions for existing samples in the dataset
 * Supports:
 * - rawScript: string (full text with [tags] to auto-match against sample texts)
 * - sampleIds: string[] with optional targetEmotion
 * - autoScan: boolean (scans all samples in dataset for inline emotion cues or Kurdish keywords)
 */
app.post('/api/dataset/repair-emotions', async (req, res) => {
  try {
    const { sampleIds, targetEmotion, rawScript, autoScan } = req.body;
    const allSamples = await getAllSamples();
    const updated = [];

    if (rawScript && typeof rawScript === 'string') {
      const paragraphs = rawScript.split(/\r?\n\s*\r?\n+/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        const parsed = extractEmotionAndCleanText(p);
        if (parsed.emotion === 'neutral' && !parsed.emotionTag) continue;

        const matched = allSamples.find(s => {
          const sText = s.text.replace(/\s+/g, ' ').trim();
          const cleanP = parsed.cleanText.replace(/\s+/g, ' ').trim();
          return cleanP.includes(sText.slice(0, 20)) || sText.includes(cleanP.slice(0, 20));
        });

        if (matched) {
          await updateSampleMetadata(matched.id, {
            emotion: parsed.emotion,
            emotion_tag: parsed.emotionTag,
            emotionTag: parsed.emotionTag
          });
          updated.push({ id: matched.id, emotion: parsed.emotion, tag: parsed.emotionTag });
        }
      }
    } else if (Array.isArray(sampleIds) && sampleIds.length > 0 && targetEmotion) {
      const canonical = normalizeEmotionName(targetEmotion);
      const tag = `[${canonical}]`;
      for (const id of sampleIds) {
        await updateSampleMetadata(id, {
          emotion: canonical,
          emotion_tag: tag,
          emotionTag: tag
        });
        updated.push({ id, emotion: canonical, tag });
      }
    } else if (autoScan) {
      for (const s of allSamples) {
        const parsed = extractEmotionAndCleanText(s.text);
        if (parsed.emotion !== 'neutral' && s.emotion !== parsed.emotion) {
          await updateSampleMetadata(s.id, {
            emotion: parsed.emotion,
            emotion_tag: parsed.emotionTag,
            emotionTag: parsed.emotionTag
          });
          updated.push({ id: s.id, emotion: parsed.emotion, tag: parsed.emotionTag });
        }
      }
    }

    res.json({
      success: true,
      updatedCount: updated.length,
      updated
    });
  } catch (err) {
    console.error('Repair Emotions Error:', err);
    res.status(500).json({ error: err.message || 'Failed to repair emotions' });
  }
});

/**
 * Get all samples in dataset from MySQL / disk
 */
app.get('/api/dataset', async (req, res) => {
  try {
    const samples = await getAllSamples();
    res.json({ samples, count: samples.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get single sample by ID
 */
app.get('/api/dataset/:id', async (req, res) => {
  try {
    const sample = await getSample(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json({ sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve raw audio file (WAV / MP3)
 */
app.get('/api/dataset/:id/audio', (req, res) => {
  try {
    const buffer = getSampleAudio(req.params.id);
    if (!buffer) {
      return res.status(404).send('Audio file not found');
    }

    let contentType = 'audio/wav';
    if ((buffer.length >= 3 && buffer.toString('ascii', 0, 3) === 'ID3') ||
      (buffer.length >= 2 && buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0)) {
      contentType = 'audio/mpeg';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Error reading audio file');
  }
});

/**
 * Download single file (WAV or JSON)
 */
app.get('/api/dataset/:id/download/:type', (req, res) => {
  try {
    const { id, type } = req.params;
    const safeId = path.basename(id);
    const datasetDir = ensureDatasetDir();

    if (type === 'wav') {
      const filePath = path.join(datasetDir, `${safeId}.wav`);
      if (!fs.existsSync(filePath)) return res.status(404).send('WAV file not found');
      return res.download(filePath, `${safeId}.wav`);
    } else if (type === 'json') {
      const filePath = path.join(datasetDir, `${safeId}.json`);
      if (!fs.existsSync(filePath)) return res.status(404).send('JSON file not found');
      return res.download(filePath, `${safeId}.json`);
    } else {
      return res.status(400).send('Invalid file type requested');
    }
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

/**
 * Update metadata or ratings for a sample
 */
app.patch('/api/dataset/:id', async (req, res) => {
  try {
    const updated = await updateSampleMetadata(req.params.id, req.body);
    res.json({ success: true, sample: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a sample (WAV + MySQL row + JSON)
 */
app.delete('/api/dataset/:id', async (req, res) => {
  try {
    const deleted = await deleteSample(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sample not found or already deleted' });
    }
    res.json({ success: true, message: `Sample ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch delete multiple samples by ID
 */
app.post('/api/dataset/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of sample IDs is required' });
    }
    const result = await deleteSamples(ids);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete all samples outside duration bounds (< minSeconds or > maxSeconds)
 */
app.post('/api/dataset/delete-outliers', async (req, res) => {
  try {
    const minSeconds = req.body?.minSeconds !== undefined ? parseFloat(req.body.minSeconds) : 6.0;
    const maxSeconds = req.body?.maxSeconds !== undefined ? parseFloat(req.body.maxSeconds) : 16.5;
    const result = await deleteDurationOutliers(minSeconds, maxSeconds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

import { exportAudarCanonicalZip, getAudarDatasetSummary } from './audarExporter.js';

/**
 * Download dataset as raw ZIP with optional query filters:
 * ?gender=male|female|all&voice=...&dialect=...&emotion=...&method=...&ids=001,002...&search=...
 */
app.get('/api/dataset/export/zip', async (req, res) => {
  try {
    await exportDatasetZip(res, req.query);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

/**
 * Download dataset formatted strictly in Audar Canonical Speech Schema
 * (dataset_export/ layout with audio/, data.jsonl, metadata.csv, whisper.jsonl, manifest.json)
 * Supports query filters: ?gender=male|female|all&voice=...&dialect=...&emotion=...
 */
app.get('/api/dataset/export/audar-zip', async (req, res) => {
  try {
    await exportAudarCanonicalZip(res, req.query);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

/**
 * Get Audar Canonical Dataset Summary & Phonetic Coverage Report with optional filters
 */
app.get('/api/dataset/export/audar-summary', async (req, res) => {
  try {
    const summary = await getAudarDatasetSummary(req.query);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Preview matching sample counts and estimated size before exporting
 */
app.get('/api/dataset/export/preview', async (req, res) => {
  try {
    const allSamples = await getAllSamples();
    const matched = allSamples.filter(s => sampleMatchesFilter(s, req.query));
    const totalDuration = matched.reduce((acc, s) => acc + (s.duration_seconds || s.durationSeconds || 0), 0);
    const totalSize = matched.reduce((acc, s) => acc + (s.audio_size || 0), 0);
    const maleCount = matched.filter(s => resolveSampleGender(s) === 'male').length;
    const femaleCount = matched.filter(s => resolveSampleGender(s) === 'female').length;

    res.json({
      count: matched.length,
      totalSamples: allSamples.length,
      maleCount,
      femaleCount,
      totalDurationSeconds: Math.round(totalDuration * 10) / 10,
      totalAudioSizeBytes: totalSize,
      filters: req.query
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// PAIRED EMOTION DATASET API ENDPOINTS (Kurdish TTS Training)
// =========================================================================

/**
 * Returns available emotions and speaker presets for Paired Emotion Batch
 */
app.get('/api/paired/config', (req, res) => {
  res.json({
    requiredEmotions: REQUIRED_EMOTIONS,
    optionalEmotions: OPTIONAL_EMOTIONS,
    speakerPresets: SPEAKER_PRESETS
  });
});

/**
 * Returns next available family index for a given speaker
 */
app.get('/api/paired/next-index', async (req, res) => {
  try {
    const rawSpk = req.query.speakerId;
    const speakerId = (!rawSpk || rawSpk === 'all') ? null : String(rawSpk).trim();
    const nextIndex = await getNextFamilyIndex(speakerId);
    res.json({ speakerId: speakerId || 'global', nextIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes a single emotion clip for a sentence/family
 */
app.post('/api/paired/generate-emotion', async (req, res) => {
  try {
    const {
      speakerId = 'spk01',
      voiceName = 'Puck',
      dialect = 'sorani',
      language = 'ckb',
      sentence,
      sentenceIndex = 1,
      familyId,
      emotion = 'neutral',
      intensity,
      model = 'gemini-3.8-flash-tts',
      apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generatePairedEmotionClip({
      speakerId,
      voiceName,
      dialect,
      language,
      sentence,
      sentenceIndex,
      familyId,
      emotion,
      intensity,
      model,
      apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating clip:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes an entire family (all required/selected emotions for one sentence)
 */
app.post('/api/paired/generate-family', async (req, res) => {
  try {
    const {
      speakerId = 'spk01',
      voiceName = 'Puck',
      dialect = 'sorani',
      sentence,
      sentenceIndex = 1,
      emotions = [],
      model = 'gemini-3.8-flash-tts',
      apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generateFullFamilySet({
      speakerId,
      voiceName,
      dialect,
      sentence,
      sentenceIndex,
      emotions,
      model,
      apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating family:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes all required emotions for one sentence in 1 Gemini call and slices them (83% quota savings)
 */
app.post('/api/paired/generate-family-sliced', async (req, res) => {
  try {
    const {
      speakerId = 'spk01',
      voiceName = 'Puck',
      dialect = 'sorani',
      language = 'ckb',
      sentence,
      sentenceIndex = 1,
      familyId = null,
      emotions = [],
      model = 'gemini-3.8-flash-tts',
      apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generatePairedFamilySliced({
      speakerId,
      voiceName,
      dialect,
      language,
      sentence,
      sentenceIndex,
      familyId,
      emotions,
      model,
      apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating sliced family:', err);
    res.status(500).json({ error: err.message });
  }
});

let activeBatchMutex = Promise.resolve();
const activeBatchAbortControllers = new Set();

/**
 * Aborts any active batch generation immediately on the server when user clicks Stop.
 */
app.post('/api/paired/abort-batch', (req, res) => {
  console.log(`[Paired API] Stop requested by client. Aborting ${activeBatchAbortControllers.size} active batch generation(s)...`);
  for (const controller of activeBatchAbortControllers) {
    controller.abort();
  }
  activeBatchAbortControllers.clear();
  res.json({ success: true, message: 'Active batch generation aborted.' });
});

/**
 * Synthesizes a batch of sentences for one emotion using spoken English markers & faster-whisper alignment
 */
app.post('/api/paired/generate-transposed-batch', async (req, res) => {
  try {
    const {
      speakerId = 'spk01',
      voiceName = 'Puck',
      dialect = 'sorani',
      language = 'ckb',
      sentences = [],
      startIdx = 1,
      emotion = 'neutral',
      intensity = 0.8,
      model = 'gemini-3.8-flash-tts',
      apiKey = '',
      slicingStrategy = 'silence',
      conditionId = req.body.conditionId || null,
      customStyle = req.body.customStyle || req.body.speechStyle || null,
      customInstruction = req.body.customInstruction || req.body.promptInstruction || null
    } = req.body;

    if (!Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'Sentences array is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    // Mutex: serialize batch generation calls so concurrent requests/tabs don't race against key pool
    const result = await new Promise((resolve, reject) => {
      activeBatchMutex = activeBatchMutex.catch(() => { }).then(async () => {
        try {
          if (abortController.signal.aborted) {
            return reject(new Error('Batch generation aborted by client.'));
          }
          const resBatch = await generateTransposedEmotionBatch({
            speakerId,
            voiceName,
            dialect,
            language,
            sentences,
            startIdx,
            emotion,
            intensity,
            model,
            apiKey,
            slicingStrategy,
            customStyle,
            customInstruction,
            conditionId,
            signal: abortController.signal
          });
          resolve(resBatch);
        } catch (err) {
          reject(err);
        } finally {
          activeBatchAbortControllers.delete(abortController);
        }
      });
    });

    res.json(result);
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      console.log(`[Paired API] Transposed batch cleanly aborted: ${err.message}`);
      return res.status(499).json({ error: 'Batch aborted by client' });
    }
    console.error(`[Paired API] Error generating transposed batch (${req.body?.slicingStrategy || 'silence'}):`, err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Returns the next sequential index for Context Switching clips (ctx_...).
 */
app.get('/api/context-switching/next-index', async (req, res) => {
  try {
    const voiceName = req.query.voiceName || null;
    const nextIndex = await getNextContextSwitchingIndex(voiceName);
    res.json({ nextIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Direct 1:1 Generation: Synthesizes 1 complete paragraph with Gemini 3.8 Flash TTS.
 * Zero slicing, zero models, zero risk of truncations or overlaps.
 */
app.post('/api/context-switching/generate-single', async (req, res) => {
  try {
    const {
      paragraph = '',
      itemIndex = 1,
      voiceName = 'Puck',
      dialect = 'sorani',
      apiKey = '',
      model = 'gemini-3.8-flash-tts'
    } = req.body;

    if (!paragraph || !String(paragraph).trim()) {
      return res.status(400).json({ error: 'Paragraph text is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    try {
      const sample = await generateContextSwitchingSingleSample({
        paragraph,
        itemIndex: Number(itemIndex) || 1,
        voiceName,
        dialect,
        apiKey,
        model,
        signal: abortController.signal
      });
      res.json({ success: true, sample });
    } finally {
      activeBatchAbortControllers.delete(abortController);
    }
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      return res.status(499).json({ error: 'Request aborted by client' });
    }
    console.error('[Context Switching API] Error generating single paragraph:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generates up to 6 paragraphs in 1 Gemini 3.8 call and slices them acoustically.
 * Automatically saves clips to the dataset with deterministic IDs and JSON metadata.
 */
app.post('/api/context-switching/generate-sliced-batch', async (req, res) => {
  try {
    const {
      paragraphs = [],
      startIdx = 1,
      voiceName = 'Puck',
      dialect = 'sorani',
      apiKey = '',
      model = 'gemini-3.8-flash-tts'
    } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return res.status(400).json({ error: 'Paragraphs array is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    const result = await new Promise((resolve, reject) => {
      activeBatchMutex = activeBatchMutex.catch(() => { }).then(async () => {
        try {
          if (abortController.signal.aborted) {
            return reject(new Error('Batch generation aborted by client.'));
          }
          const resBatch = await generateContextSwitchingSlicedBatch({
            paragraphs,
            startIdx: Number(startIdx) || 1,
            voiceName,
            dialect,
            apiKey,
            model,
            signal: abortController.signal
          });
          resolve(resBatch);
        } catch (err) {
          reject(err);
        } finally {
          activeBatchAbortControllers.delete(abortController);
        }
      });
    });

    res.json(result);
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      console.log(`[Context Switching API] Batch cleanly aborted: ${err.message}`);
      return res.status(499).json({ error: 'Batch aborted by client' });
    }
    console.error('[Context Switching API] Error generating sliced batch:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Aborts any active context switching batch generation immediately.
 */
app.post('/api/context-switching/abort-batch', (req, res) => {
  console.log(`[Context Switching API] Stop requested. Aborting ${activeBatchAbortControllers.size} active batch(es)...`);
  for (const controller of activeBatchAbortControllers) {
    controller.abort();
  }
  activeBatchAbortControllers.clear();
  res.json({ success: true, message: 'Context switching batch aborted.' });
});

/**
 * Streams an in-memory master audio take directly to browser for user preview.
 * Supports ?id=... to stream any specific stacked master take from history.
 * Defaults to the latest take if no id is specified.
 */
app.get('/api/paired/master-audio/stream', (req, res) => {
  const master = req.query.id ? getMasterAudioById(String(req.query.id)) : getLatestMasterAudio();
  if (!master || !master.audioBuffer) {
    return res.status(404).json({ error: 'Master audio take not found or expired from memory.' });
  }

  res.writeHead(200, {
    'Content-Type': 'audio/wav',
    'Content-Length': master.audioBuffer.length,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(master.audioBuffer);
});

/**
 * Returns stacked list of all recent in-memory master audio takes (newest first).
 */
app.get('/api/paired/master-audio/list', (req, res) => {
  const history = getMasterAudioHistory();
  const items = history.map(item => ({
    id: item.id,
    emotion: item.emotion,
    voiceName: item.voiceName,
    speakerId: item.speakerId,
    sentenceCount: item.sentenceCount,
    model: item.model,
    audioBytes: item.audioBytes || item.audioBuffer?.length || 0,
    createdAt: item.createdAt,
    streamUrl: `/api/paired/master-audio/stream?id=${item.id}&t=${item.createdAt}`
  }));

  res.json({
    count: items.length,
    items
  });
});

/**
 * Clears the in-memory master audio history.
 */
app.post('/api/paired/master-audio/clear', (req, res) => {
  clearMasterAudioHistory();
  res.json({ success: true, count: 0 });
});

/**
 * Returns metadata about the latest in-memory master audio take (backward-compatible).
 */
app.get('/api/paired/master-audio/info', (req, res) => {
  const master = getLatestMasterAudio();
  if (!master || !master.audioBuffer) {
    return res.json({ available: false });
  }

  return res.json({
    available: true,
    id: master.id,
    emotion: master.emotion,
    voiceName: master.voiceName,
    speakerId: master.speakerId,
    sentenceCount: master.sentenceCount,
    model: master.model,
    audioBytes: master.audioBuffer.length,
    createdAt: master.createdAt,
    streamUrl: `/api/paired/master-audio/stream?id=${master.id}&t=${master.createdAt}`
  });
});

/**
 * Validates dataset compliance for Paired Emotion rule
 */
app.get('/api/paired/validate', async (req, res) => {
  try {
    const report = await validatePairedDataset();
    res.json(report);
  } catch (err) {
    console.error('[Paired API] Error validating dataset:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Exports metadata.csv with exact required schema:
 * audio_file|text|speaker_name|language|emotion|emotion_intensity|family_id
 */
app.get('/api/paired/export-csv', async (req, res) => {
  try {
    const onlyTrainingReady = req.query.include_all !== 'true';
    const csv = await generatePairedMetadataCsv(null, { onlyTrainingReady });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="metadata.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[Paired API] Error exporting CSV:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Downloads full Paired Emotion dataset as a ZIP archive
 */
app.get('/api/paired/export-zip', async (req, res) => {
  try {
    const onlyTrainingReady = req.query.include_all !== 'true';
    await exportPairedZipArchive(res, { onlyTrainingReady });
  } catch (err) {
    console.error('[Paired API] Error exporting ZIP:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

/**
 * Runs dataset-wide waveform boundary audit & repair
 */
app.post('/api/paired/repair-boundaries', async (req, res) => {
  try {
    const { dryRun = false, force = false } = req.body || {};
    const report = await repairDatasetBoundaries({ dryRun: Boolean(dryRun), forceAll: Boolean(force) });
    res.json(report);
  } catch (err) {
    console.error('[Paired API] Error repairing boundaries:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production if built
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Initialize database and start server
async function startServer() {
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Kurdish TTS Dataset Server is running!`);
    console.log(`   ➜  Local:   http://localhost:${PORT}`);

    // Find and display network IP addresses for Wi-Fi / LAN
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`   ➜  Network (${name}): http://${iface.address}:${PORT}`);
        }
      }
    }

    console.log(`   📁 Dataset folder: ${ensureDatasetDir()}`);
    const db = getDbStatus();
    if (db.connected) {
      console.log(`   🗄️ MySQL Database: Connected (DB: ${db.database}, Samples: ${db.sampleCount})\n`);
    } else {
      console.log(`   ⚠️ MySQL Database: Disconnected (${db.error || 'Fallback to file storage'})\n`);
    }
  });
}

startServer();
