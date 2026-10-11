import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import {
  isDbConnected,
  getAllDbSamples,
  getDbSample,
  saveDbSample,
  updateDbSampleMetadata as updateDbSample,
  deleteDbSample,
  deleteDbSamples,
  getNextDbSampleId,
  findDbSampleByNormalizedText,
  normalizeKurdishTextForComparison
} from './db.js';

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
 * Generates the next sequential ID, keeping MySQL and disk in strict lockstep.
 * @param {'elevenlabs_api' | 'elevenlabs_web'} method 
 * @param {boolean} usePrefix - whether to prefix with 'normal_' for web workflow or use pure numbers
 * @returns {Promise<string>} e.g. '001', '002' or 'normal_001'
 */
export async function getNextSampleId(method = 'elevenlabs_api', usePrefix = false) {
  ensureDatasetDir();

  let dbNextId = null;
  if (isDbConnected()) {
    try {
      dbNextId = await getNextDbSampleId(method, usePrefix);
    } catch (e) {
      console.warn('MySQL getNextDbSampleId error, falling back to disk:', e.message);
    }
  }

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
    const diskNextNum = maxIndex + 1;
    if (dbNextId) {
      const dbMatch = String(dbNextId).match(/^normal_(\d+)$/i);
      const dbNum = dbMatch ? parseInt(dbMatch[1], 10) : 0;
      const finalNum = Math.max(diskNextNum, dbNum);
      return `normal_${String(finalNum).padStart(3, '0')}`;
    }
    return `normal_${String(diskNextNum).padStart(3, '0')}`;
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
    const diskNextNum = maxIndex + 1;
    if (dbNextId) {
      const dbNum = parseInt(dbNextId, 10) || 0;
      const finalNum = Math.max(diskNextNum, dbNum);
      return String(finalNum).padStart(3, '0');
    }
    return String(diskNextNum).padStart(3, '0');
  }
}

/**
 * Searches MySQL and disk for an existing sample matching normalized Kurdish text.
 */
export async function findSampleByText(text) {
  if (!text) return null;
  const norm = normalizeKurdishTextForComparison(text);
  if (!norm) return null;

  if (isDbConnected()) {
    try {
      const dbSample = await findDbSampleByNormalizedText(norm);
      if (dbSample) return dbSample;
    } catch (e) {
      console.warn('MySQL findDbSampleByNormalizedText error:', e.message);
    }
  }

  // Fallback scan of all samples
  const all = await getAllSamples();
  return all.find(s => normalizeKurdishTextForComparison(s.cleanText || s.text) === norm) || null;
}


let samplesCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000;

export function invalidateSamplesCache() {
  samplesCache = null;
  lastCacheTime = 0;
}

/**
 * Reads all metadata samples from MySQL database or the dataset folder.
 * Returns an array of sample metadata objects sorted by creation date or ID.
 */
export async function getAllSamples(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && samplesCache && (now - lastCacheTime < CACHE_TTL_MS)) {
    return samplesCache;
  }

  ensureDatasetDir();

  if (isDbConnected()) {
    try {
      const dbSamples = await getAllDbSamples();
      if (dbSamples && dbSamples.length > 0) {
        samplesCache = dbSamples;
        lastCacheTime = Date.now();
        return dbSamples;
      }
    } catch (e) {
      console.warn('MySQL getAllDbSamples error, falling back to disk:', e.message);
    }
  }

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
  const sorted = samples.sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    if (timeB !== timeA) return timeB - timeA;
    return String(b.id).localeCompare(String(a.id));
  });

  samplesCache = sorted;
  lastCacheTime = Date.now();
  return sorted;
}

/**
 * Gets a specific sample metadata by ID from MySQL or disk.
 * @param {string} id 
 */
export async function getSample(id) {
  ensureDatasetDir();
  const safeId = path.basename(id);

  if (isDbConnected()) {
    try {
      const dbSample = await getDbSample(safeId);
      if (dbSample) return dbSample;
    } catch (e) {
      console.warn(`MySQL getDbSample error for ${safeId}, falling back to disk:`, e.message);
    }
  }

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
 * Saves a new sample atomically: saving audio WAV on disk, metadata in MySQL, and writing JSON backup.
 * Strictest UTF-8 preservation for Kurdish text.
 */
export async function saveSample({
  id,
  family_id,
  emotion_intensity,
  speaker_name,
  text,
  dialect = 'sorani',
  emotion = 'neutral',
  emotionTag = '',
  method = 'elevenlabs_api',
  voiceId = '',
  voiceName = '',
  modelId = '',
  generationId = '',
  language = 'ckb',
  characters = [],
  alignment = null,
  audioBuffer,
  ratings = null,
  notes = '',
  customMetadata = {},
  allowDuplicateText = false
}) {
  ensureDatasetDir();

  // If no custom ID was specified and duplicates are disallowed, check if already exists
  if (!id && !allowDuplicateText && !family_id) {
    const existing = await findSampleByText(text);
    if (existing) {
      console.log(`[Dataset] Sample with matching Kurdish text already exists (#${existing.id}). Returning existing sample to prevent duplicates.`);
      return existing;
    }
  }

  // If no ID provided, calculate next available sequential ID
  const sampleId = id || (await getNextSampleId(method, method === 'elevenlabs_web'));
  const safeId = path.basename(sampleId);

  const wavFileName = `${safeId}.wav`;
  const jsonFileName = `${safeId}.json`;
  const wavPath = path.join(DATASET_ROOT, wavFileName);
  const jsonPath = path.join(DATASET_ROOT, jsonFileName);

  // Write audio WAV buffer
  let audioSize = 0;
  if (audioBuffer && Buffer.isBuffer(audioBuffer)) {
    fs.writeFileSync(wavPath, audioBuffer);
    audioSize = audioBuffer.length;
  }

  const resolvedFamilyId = family_id || customMetadata.family_id || undefined;
  const resolvedIntensity = emotion_intensity !== undefined && emotion_intensity !== null
    ? parseFloat(emotion_intensity)
    : (customMetadata.emotion_intensity !== undefined ? parseFloat(customMetadata.emotion_intensity) : 0.0);
  const resolvedSpeaker = speaker_name || customMetadata.speaker_name || voiceName || undefined;
  const resolvedLang = language || customMetadata.language || 'ckb';

  let calculatedDuration = customMetadata.duration_seconds || customMetadata.durationSeconds || 0;
  if (!calculatedDuration && audioBuffer && Buffer.isBuffer(audioBuffer) && audioBuffer.length > 44) {
    calculatedDuration = Math.round(((Math.max(0, audioBuffer.length - 44) / (24000 * 2)) + Number.EPSILON) * 100) / 100;
  }

  const resolvedGender = resolveSampleGender({
    voice_gender: customMetadata.voice_gender || customMetadata.gender,
    gender: customMetadata.gender,
    voice_name: voiceName,
    voice_id: voiceId,
    speaker_name: resolvedSpeaker,
    id: safeId
  });

  // Construct structured metadata
  const metadata = {
    id: safeId,
    family_id: resolvedFamilyId,
    emotion_intensity: resolvedIntensity,
    speaker_name: resolvedSpeaker,
    gender: resolvedGender,
    voice_gender: resolvedGender,
    text: String(text || '').trim(),
    dialect: dialect || 'sorani',
    emotion: String(emotion || 'neutral').toLowerCase(),
    emotion_tag: emotionTag || undefined,
    voice_id: voiceId || undefined,
    voice_name: voiceName || undefined,
    model_id: modelId || undefined,
    generation_id: generationId || undefined,
    method: method || 'elevenlabs_api',
    language: resolvedLang,
    script: dialect === 'badini' ? 'Kurmanji' : 'Sorani',
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
    audio_size: audioSize,
    duration_seconds: calculatedDuration,
    created_at: new Date().toISOString(),
    audio_filename: wavFileName,
    json_filename: jsonFileName,
    ...customMetadata
  };

  // Write UTF-8 JSON backup file
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), { encoding: 'utf-8' });

  // Save to MySQL
  if (isDbConnected()) {
    try {
      await saveDbSample({
        ...metadata,
        gender: resolvedGender,
        voice_gender: resolvedGender,
        family_id: resolvedFamilyId,
        emotion_intensity: resolvedIntensity,
        speaker_name: resolvedSpeaker,
        language: resolvedLang,
        rating: metadata.ratings?.overall || 0,
        rating_clarity: metadata.ratings?.pronunciation || 0,
        rating_naturalness: metadata.ratings?.naturalness || 0,
        rating_emotion: metadata.ratings?.emotion || 0,
        rating_notes: metadata.ratings?.notes || metadata.notes || null,
        audio_size: audioSize,
        duration_seconds: calculatedDuration
      });
    } catch (err) {
      console.error(`[MySQL] Failed to save sample ${safeId} to database:`, err.message);
    }
  }

  invalidateSamplesCache();
  return {
    ...metadata,
    hasAudio: !!audioBuffer,
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Updates metadata for an existing sample in MySQL and disk backup.
 * @param {string} id 
 * @param {object} updates 
 */
export async function updateSampleMetadata(id, updates = {}) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const jsonPath = path.join(DATASET_ROOT, `${safeId}.json`);

  let existing = {};
  if (fs.existsSync(jsonPath)) {
    try {
      const existingRaw = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
      existing = JSON.parse(existingRaw);
    } catch (e) {}
  } else if (isDbConnected()) {
    const dbItem = await getDbSample(safeId);
    if (dbItem) existing = dbItem;
  }

  const updated = {
    ...existing,
    ...updates,
    id: safeId, // ID must never change
    updated_at: new Date().toISOString()
  };

  // Preserve nested ratings if partial update
  if (updates.ratings) {
    updated.ratings = {
      ...(existing.ratings || {}),
      ...updates.ratings
    };
  }

  // Update disk JSON backup
  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), { encoding: 'utf-8' });

  // Update MySQL
  if (isDbConnected()) {
    try {
      await updateDbSample(safeId, {
        ...updated,
        rating: updated.ratings?.overall || updated.rating || 0,
        rating_clarity: updated.ratings?.pronunciation || updated.rating_clarity || 0,
        rating_naturalness: updated.ratings?.naturalness || updated.rating_naturalness || 0,
        rating_emotion: updated.ratings?.emotion || updated.rating_emotion || 0,
        rating_notes: updated.ratings?.notes || updated.notes || updated.rating_notes || null
      });
    } catch (err) {
      console.error(`[MySQL] Failed to update sample ${safeId} in database:`, err.message);
    }
  }

  invalidateSamplesCache();
  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
  return {
    ...updated,
    hasAudio: fs.existsSync(wavPath),
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Deletes a sample from MySQL and disk.
 * @param {string} id 
 */
export async function deleteSample(id) {
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

  if (isDbConnected()) {
    try {
      const dbDeleted = await deleteDbSample(safeId);
      if (dbDeleted) deleted = true;
    } catch (err) {
      console.error(`[MySQL] Failed to delete sample ${safeId} from database:`, err.message);
    }
  }

  if (deleted) {
    invalidateSamplesCache();
  }
  return deleted;
}

/**
 * Bulk deletes multiple samples from MySQL and disk.
 * High-performance batch unlinking of WAV and JSON files plus chunked SQL deletion.
 * @param {string[]} ids
 */
export async function deleteSamples(ids) {
  ensureDatasetDir();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: true, count: 0, deletedIds: [] };
  }

  const deletedIds = [];
  for (const id of ids) {
    const safeId = path.basename(String(id));
    const jsonPath = path.join(DATASET_ROOT, `${safeId}.json`);
    const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
    if (fs.existsSync(jsonPath)) {
      try { fs.unlinkSync(jsonPath); } catch (e) {}
    }
    if (fs.existsSync(wavPath)) {
      try { fs.unlinkSync(wavPath); } catch (e) {}
    }
    deletedIds.push(safeId);
  }

  if (isDbConnected() && deletedIds.length > 0) {
    try {
      await deleteDbSamples(deletedIds);
    } catch (err) {
      console.error('[MySQL] Failed to bulk delete samples from database:', err.message);
    }
  }

  if (deletedIds.length > 0) {
    invalidateSamplesCache();
  }

  return {
    success: true,
    count: deletedIds.length,
    deletedIds
  };
}

/**
 * Deletes all audio samples whose duration is under minSeconds or over maxSeconds.
 * Purges both WAV and JSON files and cleans up MySQL entries.
 * @param {number} minSeconds
 * @param {number} maxSeconds
 */
export async function deleteDurationOutliers(minSeconds = 6.0, maxSeconds = 16.5) {
  const all = await getAllSamples();
  const outlierIds = [];
  let underCount = 0;
  let overCount = 0;

  for (const s of all) {
    const dur = Number(s.duration_seconds ?? s.durationSeconds ?? s.customMetadata?.duration_seconds ?? 0);
    if (dur <= minSeconds) {
      outlierIds.push(s.id);
      underCount++;
    } else if (dur > maxSeconds) {
      outlierIds.push(s.id);
      overCount++;
    }
  }

  const res = await deleteSamples(outlierIds);
  return {
    success: true,
    count: res.count,
    deletedIds: res.deletedIds,
    underCount,
    overCount,
    minSeconds,
    maxSeconds
  };
}

// All 26 Google Gemini Female HD Voices (Gemini 3.8 + Gemini 3.1)
export const GEMINI_FEMALE_VOICES = new Set([
  // Gemini 3.8 Headline Female Voices
  'lora', 'nyla', 'sola', 'tari', 'lumi', 'nika', 'riko', 'rina', 'tavi', 'tova', 'veda', 'zali', 'zuri',
  // Gemini 3.1 & Classic HD Female Voices
  'aoede', 'kore', 'zephyr', 'leda', 'callirrhoe', 'autonoe', 'despina', 
  'erinome', 'laomedeia', 'achernar', 'gacrux', 'vindemiatrix', 'sulafat'
]);

// All 26 Google Gemini Male HD Voices (Gemini 3.8 + Gemini 3.1)
export const GEMINI_MALE_VOICES = new Set([
  // Gemini 3.8 Headline Male Voices
  'arlo', 'knox', 'rami', 'mako', 'milo', 'koda', 'ludo', 'neno', 'olin', 'sami', 'varo', 'zeno',
  // Gemini 3.1 & Classic HD Male Voices
  'puck', 'charon', 'fenrir', 'orus', 'enceladus', 'iapetus', 'umbriel', 
  'algieba', 'algenib', 'rasalgethi', 'alnilam', 'schedar', 'pulcherrima', 
  'achird', 'zubenelgenubi', 'sadachbia', 'sadaltager'
]);

/**
 * Resolves the gender of a sample accurately.
 * Checks voice_gender, gender, customMetadata, and known voice names.
 */
export function resolveSampleGender(sample) {
  if (!sample) return 'male';
  const g = String(
    sample.voice_gender ||
    sample.gender ||
    sample.customMetadata?.voice_gender ||
    sample.customMetadata?.gender ||
    sample.metadata_extra?.voice_gender ||
    sample.metadata_extra?.gender ||
    ''
  ).toLowerCase().trim();

  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';

  // Check speaker id: e.g. spk01 (male), spk02 (female)
  const spkMatch = String(sample.speaker_name || sample.id || sample.customMetadata?.speaker_name || '').match(/spk(\d+)/i);
  if (spkMatch) {
    const spkNum = parseInt(spkMatch[1], 10);
    if (!isNaN(spkNum)) {
      return spkNum % 2 === 0 ? 'female' : 'male';
    }
  }

  const v = String(sample.voice_name || sample.voice_id || sample.voiceName || sample.voiceId || '').toLowerCase();
  const clean = v.replace(/^gemini[\s_]*\(?|\)$/gi, '').trim();

  if (GEMINI_FEMALE_VOICES.has(clean)) return 'female';
  if (GEMINI_MALE_VOICES.has(clean)) return 'male';

  for (const name of GEMINI_FEMALE_VOICES) {
    if (v.includes(name)) return 'female';
  }
  for (const name of GEMINI_MALE_VOICES) {
    if (v.includes(name)) return 'male';
  }

  // Common ElevenLabs female voices fallback
  if (v.includes('rachel') || v.includes('sarah') || v.includes('charlotte') || v.includes('alice') || v.includes('lily') || v.includes('nicole') || v.includes('glinda') || v.includes('mimi') || v.includes('freya') || v.includes('dorothy') || v.includes('serena')) {
    return 'female';
  }

  return 'male';
}

/**
 * Checks if a sample matches given export filter criteria.
 */
export function sampleMatchesFilter(sample, filters = {}) {
  if (!sample) return false;
  if (!filters || Object.keys(filters).length === 0) return true;

  // 1. Specific sample IDs filter (comma-separated or array)
  if (filters.ids) {
    const idSet = new Set(
      Array.isArray(filters.ids)
        ? filters.ids.map(id => String(id).trim().toLowerCase())
        : String(filters.ids).split(',').map(id => id.trim().toLowerCase())
    );
    if (!idSet.has(String(sample.id).toLowerCase())) {
      return false;
    }
  }

  // 2. Gender filter
  if (filters.gender && filters.gender !== 'all') {
    const targetGender = String(filters.gender).toLowerCase().trim();
    const sampleGender = resolveSampleGender(sample);
    if (sampleGender !== targetGender) {
      return false;
    }
  }

  // 3. Voice filter
  if (filters.voice && filters.voice !== 'all') {
    const targetVoice = String(filters.voice).toLowerCase().trim();
    const sampleVoice = String(sample.voice_name || sample.voice_id || '').toLowerCase();
    if (!sampleVoice.includes(targetVoice)) {
      return false;
    }
  }

  // 4. Dialect filter
  if (filters.dialect && filters.dialect !== 'all') {
    const targetDialect = String(filters.dialect).toLowerCase().trim();
    const sampleDialect = String(sample.dialect || 'sorani').toLowerCase().trim();
    if (sampleDialect !== targetDialect) {
      return false;
    }
  }

  // 4b. Language filter (e.g. ckb, kmr, ar, en)
  if (filters.language && filters.language !== 'all') {
    const targetLang = String(filters.language).toLowerCase().trim();
    const sampleLang = String(
      sample.language || 
      sample.customMetadata?.language || 
      sample.metadata_extra?.language || 
      (sample.dialect === 'badini' ? 'kmr' : 'ckb')
    ).toLowerCase().trim();
    if (sampleLang !== targetLang) {
      return false;
    }
  }

  // 5. Emotion filter
  if (filters.emotion && filters.emotion !== 'all') {
    const targetEmotion = String(filters.emotion).toLowerCase().trim();
    const sampleEmotion = String(sample.emotion || 'neutral').toLowerCase();
    const sampleEmotionTag = String(sample.emotion_tag || '').toLowerCase();
    if (!sampleEmotion.includes(targetEmotion) && !sampleEmotionTag.includes(targetEmotion)) {
      return false;
    }
  }

  // 6. Synthesis Method filter
  if (filters.method && filters.method !== 'all') {
    const targetMethod = String(filters.method).toLowerCase().trim();
    const sampleMethod = String(sample.method || '').toLowerCase().trim();
    if (sampleMethod !== targetMethod) {
      return false;
    }
  }

  // 7. General text / search query filter
  if (filters.search && String(filters.search).trim()) {
    const query = String(filters.search).toLowerCase().trim();
    const matchId = String(sample.id || '').toLowerCase().includes(query);
    const matchText = String(sample.text || '').toLowerCase().includes(query);
    const matchClean = String(sample.cleanText || '').toLowerCase().includes(query);
    const matchVoice = String(sample.voice_name || sample.voice_id || '').toLowerCase().includes(query);
    const matchLang = String(sample.language || '').toLowerCase().includes(query);
    if (!matchId && !matchText && !matchClean && !matchVoice && !matchLang) {
      return false;
    }
  }

  return true;
}

/**
 * Streams the filtered dataset as a ZIP archive.
 * Supports filtering by gender (male/female/all), voice, dialect, language, emotion, method, and specific sample IDs.
 */
export async function exportDatasetZip(res, filters = {}) {
  ensureDatasetDir();
  const allSamples = await getAllSamples();
  const matchedSamples = allSamples.filter(s => sampleMatchesFilter(s, filters));

  const archive = archiver('zip', {
    zlib: { level: 1 } // Fast compression for JSON metadata
  });

  // Construct descriptive filename based on applied filters
  let filenamePrefix = 'kurdish_tts';
  if (filters.gender && filters.gender !== 'all') {
    filenamePrefix += `_${filters.gender.toLowerCase()}_voices`;
  }
  if (filters.voice && filters.voice !== 'all') {
    const safeVoice = filters.voice.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    filenamePrefix += `_${safeVoice}`;
  }
  if (filters.language && filters.language !== 'all') {
    filenamePrefix += `_${filters.language.toLowerCase()}`;
  }
  if (filters.dialect && filters.dialect !== 'all') {
    filenamePrefix += `_${filters.dialect.toLowerCase()}`;
  }
  if (filters.emotion && filters.emotion !== 'all') {
    filenamePrefix += `_${filters.emotion.toLowerCase()}`;
  }
  const dateStr = new Date().toISOString().slice(0, 10);
  const exportFilename = `${filenamePrefix}_${dateStr}.zip`;

  res.attachment(exportFilename);
  res.setHeader('Content-Type', 'application/zip');

  archive.on('error', (err) => {
    console.error('Error generating dataset zip:', err);
    if (!res.headersSent) {
      res.status(500).send({ error: 'Failed to generate dataset ZIP' });
    }
  });

  archive.pipe(res);

  let totalDuration = 0;
  let totalAudioBytes = 0;
  const voiceBreakdown = {};
  const genderBreakdown = { male: 0, female: 0 };

  for (const s of matchedSamples) {
    const gender = resolveSampleGender(s);
    genderBreakdown[gender] = (genderBreakdown[gender] || 0) + 1;
    const vName = s.voice_name || s.voice_id || 'Unknown';
    voiceBreakdown[vName] = (voiceBreakdown[vName] || 0) + 1;

    const duration = s.duration_seconds || s.durationSeconds || 0;
    totalDuration += duration;

    const baseId = path.basename(String(s.id));
    const wavPath = path.join(DATASET_ROOT, `${baseId}.wav`);
    const jsonPath = path.join(DATASET_ROOT, `${baseId}.json`);

    if (fs.existsSync(wavPath)) {
      const stats = fs.statSync(wavPath);
      totalAudioBytes += stats.size;
      archive.file(wavPath, { name: `dataset/${baseId}.wav`, store: true });
    }

    if (fs.existsSync(jsonPath)) {
      archive.file(jsonPath, { name: `dataset/${baseId}.json` });
    } else {
      // If sample metadata came from DB and disk JSON was not present
      const { hasAudio, audioUrl, ...jsonMetadata } = s;
      archive.append(JSON.stringify(jsonMetadata, null, 2), { name: `dataset/${baseId}.json` });
    }
  }

  // Include an export manifest inside the archive
  const manifest = {
    title: 'Kurdish Speech Dataset Export',
    generator: 'Audar Kurdish TTS Dataset Platform',
    exportedAt: new Date().toISOString(),
    filterApplied: filters,
    sampleCount: matchedSamples.length,
    totalDatasetSamples: allSamples.length,
    totalAudioDurationSeconds: Math.round(totalDuration * 100) / 100,
    totalAudioDurationFormatted: `${Math.floor(totalDuration / 60)}m ${Math.round(totalDuration % 60)}s`,
    totalAudioSizeBytes: totalAudioBytes,
    genderBreakdown,
    voiceBreakdown,
    format: 'WAV 24kHz mono + UTF-8 JSON'
  };
  archive.append(JSON.stringify(manifest, null, 2), { name: 'dataset/export_manifest.json' });

  archive.finalize();
}

