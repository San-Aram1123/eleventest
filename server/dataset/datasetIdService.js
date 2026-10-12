import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDbConnected, getNextDbSampleId } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', '..', 'dataset'));

/**
 * Ensures the dataset directory exists on disk.
 */
export function ensureDatasetDir(targetDir = DEFAULT_DATASET_ROOT) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

/**
 * Generates the next sequential ID, keeping MySQL and disk in strict lockstep.
 * @param {'elevenlabs_api' | 'elevenlabs_web'} method 
 * @param {boolean} usePrefix - whether to prefix with 'normal_' for web workflow or use pure numbers
 * @param {string} datasetDir
 * @returns {Promise<string>} e.g. '001', '002' or 'normal_001'
 */
export async function getNextSampleId(method = 'elevenlabs_api', usePrefix = false, datasetDir = DEFAULT_DATASET_ROOT) {
  ensureDatasetDir(datasetDir);

  let dbNextId = null;
  if (isDbConnected()) {
    try {
      dbNextId = await getNextDbSampleId(method, usePrefix);
    } catch (e) {
      console.warn('MySQL getNextDbSampleId error, falling back to disk:', e.message);
    }
  }

  const files = fs.readdirSync(datasetDir);

  if (usePrefix && method === 'elevenlabs_web') {
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
