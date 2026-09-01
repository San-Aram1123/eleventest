import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default dataset directory (configurable via env)
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Ensures the dataset directory exists on disk.
 */
export function ensureDatasetDir() {
  if (!fs.existsSync(DATASET_ROOT)) {
    fs.mkdirSync(DATASET_ROOT, { recursive: true });
  }
  return DATASET_ROOT;
}

/**
 * Generates the next sequential ID.
 * @param {'elevenlabs_api' | 'elevenlabs_web'} method 
 * @param {boolean} usePrefix - whether to prefix with 'normal_' for web workflow or use pure numbers
 * @returns {string} e.g. '001', '002' or 'normal_001'
 */
export function getNextSampleId(method = 'elevenlabs_api', usePrefix = false) {
  ensureDatasetDir();
  const files = fs.readdirSync(DATASET_ROOT);

  if (usePrefix && method === 'elevenlabs_web') {
    // Normal web prefix: normal_001, normal_002
    let maxIndex = 0;
    const regex = /^normal_(\d+)\.(json|wav)$/i;
    for (const f of files) {
      const match = f.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
    const nextNum = maxIndex + 1;
    return `normal_${String(nextNum).padStart(3, '0')}`;
  } else {
    // Unified or default numbering: 001, 002, 003...
    let maxIndex = 0;
    const regex = /^(\d+)\.(json|wav)$/i;
    for (const f of files) {
      const match = f.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
    const nextNum = maxIndex + 1;
    return String(nextNum).padStart(3, '0');
  }
}

/**
 * Reads all metadata samples from the dataset folder.
 * Returns an array of sample metadata objects sorted by creation date or ID.
 */
export function getAllSamples() {
  ensureDatasetDir();
  const files = fs.readdirSync(DATASET_ROOT);
  const jsonFiles = files.filter(f => f.toLowerCase().endsWith('.json'));
  
  const samples = [];
  for (const file of jsonFiles) {
    try {
      const filePath = path.join(DATASET_ROOT, file);
      const raw = fs.readFileSync(filePath, { encoding: 'utf-8' });
      const metadata = JSON.parse(raw);
      
      // Verify corresponding audio file exists
      const wavPath = path.join(DATASET_ROOT, `${metadata.id}.wav`);
      const hasAudio = fs.existsSync(wavPath);
      
      samples.push({
        ...metadata,
        hasAudio,
        audioUrl: `/api/dataset/${metadata.id}/audio`
      });
    } catch (err) {
      console.error(`Error reading sample JSON file ${file}:`, err);
    }
  }

  // Sort by id / created_at descending (newest first)
  return samples.sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return String(b.id).localeCompare(String(a.id));
  });
}

/**
 * Gets a specific sample metadata by ID.
 * @param {string} id 
 */
export function getSample(id) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const jsonPath = path.join(DATASET_ROOT, `${safeId}.json`);
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  const raw = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
  const metadata = JSON.parse(raw);
  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
  return {
    ...metadata,
    hasAudio: fs.existsSync(wavPath),
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Gets the audio file buffer for a sample.
 * @param {string} id 
 */
export function getSampleAudio(id) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
  if (!fs.existsSync(wavPath)) {
    return null;
  }
  return fs.readFileSync(wavPath);
}

/**
 * Saves a new sample atomically: writing both the WAV file and the JSON metadata file.
 * Strictest UTF-8 preservation for Kurdish text.
 */
export function saveSample({
  id,
  text,
  emotion = 'neutral',
  emotionTag = '',
  method = 'elevenlabs_api',
  voiceId = '',
  voiceName = '',
  modelId = '',
  generationId = '',
  characters = [],
  alignment = null,
  audioBuffer,
  ratings = null,
  notes = '',
  customMetadata = {}
}) {
  ensureDatasetDir();

  // If no ID provided, calculate next available sequential ID
  const sampleId = id || getNextSampleId(method, method === 'elevenlabs_web');
  const safeId = path.basename(sampleId);

  const wavFileName = `${safeId}.wav`;
  const jsonFileName = `${safeId}.json`;
  const wavPath = path.join(DATASET_ROOT, wavFileName);
  const jsonPath = path.join(DATASET_ROOT, jsonFileName);

  // Write audio WAV buffer
  if (audioBuffer && Buffer.isBuffer(audioBuffer)) {
    fs.writeFileSync(wavPath, audioBuffer);
  }

  // Construct structured metadata
  const metadata = {
    id: safeId,
    text: String(text || '').trim(),
    emotion: String(emotion || 'neutral').toLowerCase(),
    emotion_tag: emotionTag || undefined,
    voice_id: voiceId || undefined,
    voice_name: voiceName || undefined,
    model_id: modelId || undefined,
    generation_id: generationId || undefined,
    method: method || 'elevenlabs_api',
    language: 'ku',
    script: 'Sorani',
    characters: characters || [],
    alignment: alignment || null,
    ratings: ratings || {
      naturalness: 0,
      emotion: 0,
      pronunciation: 0,
      overall: 0,
      notes: ''
    },
    notes: notes || undefined,
    created_at: new Date().toISOString(),
    audio_filename: wavFileName,
    json_filename: jsonFileName,
    ...customMetadata
  };

  // Write UTF-8 JSON file
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), { encoding: 'utf-8' });

  return {
    ...metadata,
    hasAudio: !!audioBuffer,
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Updates metadata for an existing sample.
 * @param {string} id 
 * @param {object} updates 
 */
export function updateSampleMetadata(id, updates = {}) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const jsonPath = path.join(DATASET_ROOT, `${safeId}.json`);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Sample with ID ${safeId} not found`);
  }

  const existingRaw = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
  const existing = JSON.parse(existingRaw);

  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // ID must never change
    updated_at: new Date().toISOString()
  };

  // Preserve nested ratings if partial update
  if (updates.ratings) {
    updated.ratings = {
      ...(existing.ratings || {}),
      ...updates.ratings
    };
  }

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), { encoding: 'utf-8' });

  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
  return {
    ...updated,
    hasAudio: fs.existsSync(wavPath),
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Deletes a sample (both .wav and .json).
 * @param {string} id 
 */
export function deleteSample(id) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const jsonPath = path.join(DATASET_ROOT, `${safeId}.json`);
  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);

  let deleted = false;
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
    deleted = true;
  }
  if (fs.existsSync(wavPath)) {
    fs.unlinkSync(wavPath);
    deleted = true;
  }
  return deleted;
}

/**
 * Streams the entire dataset as a ZIP archive.
 * Inside the ZIP:
 * dataset/
 * ├── 001.wav
 * ├── 001.json
 * ...
 */
export function exportDatasetZip(res) {
  ensureDatasetDir();
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  res.attachment(`kurdish_tts_dataset_${new Date().toISOString().slice(0, 10)}.zip`);
  res.setHeader('Content-Type', 'application/zip');

  archive.on('error', (err) => {
    console.error('Error generating dataset zip:', err);
    res.status(500).send({ error: 'Failed to generate dataset ZIP' });
  });

  archive.pipe(res);

  const files = fs.readdirSync(DATASET_ROOT);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.wav') || file.toLowerCase().endsWith('.json')) {
      const filePath = path.join(DATASET_ROOT, file);
      archive.file(filePath, { name: `dataset/${file}` });
    }
  }

  archive.finalize();
}
