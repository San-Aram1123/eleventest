import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isDbConnected,
  getAllDbSamples,
  getDbSample,
  findDbSampleByNormalizedText,
  normalizeKurdishTextForComparison
} from './db.js';
import {
  GEMINI_FEMALE_VOICES,
  GEMINI_MALE_VOICES,
  resolveSampleGender
} from './dataset/datasetGender.js';
import { sampleMatchesFilter } from './dataset/datasetFilter.js';
import { ensureDatasetDir as ensureDir, getNextSampleId as getNextId } from './dataset/datasetIdService.js';
import { exportDatasetZip as exportZip } from './dataset/datasetExport.js';
import {
  saveSample as mutateSaveSample,
  updateSampleMetadata as mutateUpdateSample,
  deleteSample as mutateDeleteSample,
  deleteSamples as mutateDeleteSamples,
  deleteDurationOutliers as mutateDeleteOutliers
} from './dataset/datasetMutations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

// Re-exports for 100% backward compatibility
export {
  GEMINI_FEMALE_VOICES,
  GEMINI_MALE_VOICES,
  resolveSampleGender
} from './dataset/datasetGender.js';
export { sampleMatchesFilter } from './dataset/datasetFilter.js';

export function ensureDatasetDir() {
  return ensureDir(DATASET_ROOT);
}

export async function getNextSampleId(method = 'elevenlabs_api', usePrefix = false) {
  return getNextId(method, usePrefix, DATASET_ROOT);
}

export async function exportDatasetZip(res, filters = {}) {
  return exportZip(res, filters, getAllSamples, DATASET_ROOT);
}

let samplesCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000;

export function invalidateSamplesCache() {
  samplesCache = null;
  lastCacheTime = 0;
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

  const all = await getAllSamples();
  return all.find(s => normalizeKurdishTextForComparison(s.cleanText || s.text) === norm) || null;
}

/**
 * Reads all metadata samples from MySQL database or the dataset folder.
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
      const wavPath = path.join(DATASET_ROOT, `${metadata.id}.wav`);
      samples.push({
        ...metadata,
        hasAudio: fs.existsSync(wavPath),
        audioUrl: `/api/dataset/${metadata.id}/audio`
      });
    } catch (err) {
      console.error(`Error reading sample JSON file ${file}:`, err);
    }
  }

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
  if (!fs.existsSync(jsonPath)) return null;
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
 */
export function getSampleAudio(id) {
  ensureDatasetDir();
  const safeId = path.basename(id);
  const wavPath = path.join(DATASET_ROOT, `${safeId}.wav`);
  if (!fs.existsSync(wavPath)) return null;
  return fs.readFileSync(wavPath);
}

/**
 * Saves a new sample atomically: saving audio WAV on disk, metadata in MySQL, and writing JSON backup.
 */
export async function saveSample(params) {
  ensureDatasetDir();
  return mutateSaveSample(params, {
    datasetDir: DATASET_ROOT,
    findSampleByTextFn: findSampleByText,
    invalidateCacheFn: invalidateSamplesCache
  });
}

/**
 * Updates metadata for an existing sample in MySQL and disk backup.
 */
export async function updateSampleMetadata(id, updates = {}) {
  ensureDatasetDir();
  return mutateUpdateSample(id, updates, {
    datasetDir: DATASET_ROOT,
    getDbSampleFn: getDbSample,
    invalidateCacheFn: invalidateSamplesCache
  });
}

/**
 * Deletes a sample from MySQL and disk.
 */
export async function deleteSample(id) {
  ensureDatasetDir();
  return mutateDeleteSample(id, {
    datasetDir: DATASET_ROOT,
    invalidateCacheFn: invalidateSamplesCache
  });
}

/**
 * Bulk deletes multiple samples from MySQL and disk.
 */
export async function deleteSamples(ids) {
  ensureDatasetDir();
  return mutateDeleteSamples(ids, {
    datasetDir: DATASET_ROOT,
    invalidateCacheFn: invalidateSamplesCache
  });
}

/**
 * Deletes all audio samples whose duration is under minSeconds or over maxSeconds.
 */
export async function deleteDurationOutliers(minSeconds = 6.0, maxSeconds = 16.5) {
  return mutateDeleteOutliers(minSeconds, maxSeconds, {
    getAllSamplesFn: getAllSamples,
    datasetDir: DATASET_ROOT,
    invalidateCacheFn: invalidateSamplesCache
  });
}
