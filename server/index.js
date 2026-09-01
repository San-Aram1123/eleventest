import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import {
  ensureDatasetDir,
  getAllSamples,
  getSample,
  getSampleAudio,
  saveSample,
  updateSampleMetadata,
  deleteSample,
  exportDatasetZip,
  getNextSampleId
} from './datasetService.js';

import {
  validateApiKey,
  getVoices,
  getModels,
  generateSpeech,
  getApiKey
} from './elevenlabs.js';

import { pendingQueue } from './pendingQueue.js';
import { ensureWavBuffer } from './wavUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Multer for handling WAV uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure dataset directory exists
ensureDatasetDir();

// ==========================================
// 1. CONFIG & SYSTEM ROUTES
// ==========================================

/**
 * Check system status & API key configuration
 */
app.get('/api/config', async (req, res) => {
  const currentKey = getApiKey();
  const isKeyConfigured = Boolean(currentKey && currentKey.length > 5);

  let userInfo = null;
  let keyValid = false;
  let validationError = null;

  if (isKeyConfigured) {
    try {
      userInfo = await validateApiKey(currentKey);
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
    maskedKey: isKeyConfigured ? `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}` : null,
    userInfo: userInfo ? {
      tier: userInfo.subscription?.tier,
      character_count: userInfo.subscription?.character_count,
      character_limit: userInfo.subscription?.character_limit,
      can_extend_character_limit: userInfo.subscription?.can_extend_character_limit,
      status: userInfo.subscription?.status
    } : null
  });
});

/**
 * Save/update ElevenLabs API key dynamically
 */
app.post('/api/config/key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key string is required' });
    }

    // Validate key with ElevenLabs
    const userInfo = await validateApiKey(apiKey);

    // Save to process.env and update .env file
    process.env.ELEVENLABS_API_KEY = apiKey.trim();
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('ELEVENLABS_API_KEY=')) {
        envContent = envContent.replace(/ELEVENLABS_API_KEY=.*/g, `ELEVENLABS_API_KEY=${apiKey.trim()}`);
      } else {
        envContent += `\nELEVENLABS_API_KEY=${apiKey.trim()}\n`;
      }
    } else {
      envContent = `ELEVENLABS_API_KEY=${apiKey.trim()}\nPORT=${PORT}\nDATASET_DIR=dataset\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');

    res.json({
      success: true,
      message: 'API Key updated and validated successfully',
      userInfo: {
        tier: userInfo.subscription?.tier,
        character_count: userInfo.subscription?.character_count,
        character_limit: userInfo.subscription?.character_limit
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
 * preserving clean Unicode text and saving 001.wav + 001.json
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

    // Save sample to dataset with clean Kurdish Unicode text
    const sample = saveSample({
      id: customId,
      text: cleanText || text.trim(), // Authoritative clean Unicode Kurdish transcript
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
// 4. SECTION 2: NORMAL WEBSITE WORKFLOW
// ==========================================

/**
 * Prepare a sample before visiting ElevenLabs website.
 * Stores Kurdish text and emotion once.
 */
app.post('/api/normal/prepare', (req, res) => {
  try {
    const { text, emotion = 'neutral', emotionTag = '', notes = '', voiceName = '' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Kurdish text is required' });
    }

    const item = pendingQueue.add({
      text,
      emotion,
      emotionTag,
      notes,
      voiceName
    });

    res.json({
      success: true,
      pendingItem: item,
      allPending: pendingQueue.getAll()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all pending prepared samples
 */
app.get('/api/normal/pending', (req, res) => {
  res.json({ pending: pendingQueue.getAll() });
});

/**
 * Remove a pending item by ID
 */
app.delete('/api/normal/pending/:pendingId', (req, res) => {
  pendingQueue.remove(req.params.pendingId);
  res.json({ success: true, pending: pendingQueue.getAll() });
});

/**
 * Upload WAV from ElevenLabs website and auto-pair with the prepared sample
 */
app.post('/api/normal/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { pendingId, customId, voiceName, modelName, notes } = req.body;

    // Retrieve and consume the matching pending sample
    const pendingItem = pendingQueue.consume(pendingId);

    if (!pendingItem && !req.body.text) {
      return res.status(400).json({
        error: 'No matching prepared sample found. Please click "Copy Text & Prepare Sample" first.'
      });
    }

    const text = pendingItem ? pendingItem.text : req.body.text;
    const emotion = pendingItem ? pendingItem.emotion : (req.body.emotion || 'neutral');
    const emotionTag = pendingItem ? pendingItem.emotionTag : (req.body.emotionTag || '');
    const combinedNotes = [pendingItem?.notes, notes].filter(Boolean).join('; ');

    // Ensure uploaded audio is in valid WAV container
    const wavBuffer = ensureWavBuffer(req.file.buffer);

    // Save as normal_001.wav + normal_001.json (or next sequence)
    const sample = saveSample({
      id: customId || getNextSampleId('elevenlabs_web', true),
      text,
      emotion,
      emotionTag,
      method: 'elevenlabs_web',
      voiceName: voiceName || pendingItem?.voiceName || 'ElevenLabs Website Voice',
      modelId: modelName || 'ElevenLabs Website Model',
      notes: combinedNotes,
      audioBuffer: wavBuffer
    });

    res.json({
      success: true,
      message: 'WAV successfully matched and saved with preserved Kurdish text!',
      sample,
      remainingPending: pendingQueue.getAll()
    });
  } catch (err) {
    console.error('Normal upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process uploaded audio' });
  }
});

// ==========================================
// 5. DATASET MANAGER & EXPORT
// ==========================================

/**
 * Get all samples in dataset
 */
app.get('/api/dataset', (req, res) => {
  try {
    const samples = getAllSamples();
    res.json({ samples, count: samples.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get single sample by ID
 */
app.get('/api/dataset/:id', (req, res) => {
  try {
    const sample = getSample(req.params.id);
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
app.patch('/api/dataset/:id', (req, res) => {
  try {
    const updated = updateSampleMetadata(req.params.id, req.body);
    res.json({ success: true, sample: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a sample (WAV + JSON)
 */
app.delete('/api/dataset/:id', (req, res) => {
  try {
    const deleted = deleteSample(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Sample not found or already deleted' });
    }
    res.json({ success: true, message: `Sample ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Download complete dataset as ZIP
 */
app.get('/api/dataset/export/zip', (req, res) => {
  try {
    exportDatasetZip(res);
  } catch (err) {
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

// Start server
app.listen(PORT, () => {
  console.log(`\n Kurdish TTS Dataset Server running at http://localhost:${PORT}`);
  console.log(` Dataset folder: ${ensureDatasetDir()}`);
});
