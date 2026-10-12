import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDbConnected, getDbPool } from './dbConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Synchronizes API keys into MySQL api_keys table.
 */
export async function syncApiKeysToDb(provider, keys) {
  if (!isDbConnected() || !Array.isArray(keys) || keys.length === 0) return;
  const pool = getDbPool();
  for (const key of keys) {
    if (!key || typeof key !== 'string' || !key.trim()) continue;
    try {
      await pool.query(
        `INSERT INTO api_keys (provider, api_key, label, status)
         VALUES (?, ?, ?, 'ready')
         ON DUPLICATE KEY UPDATE provider = VALUES(provider), status = 'ready'`,
        [provider, key.trim(), `${provider}_key`]
      );
    } catch (e) {
      console.warn(`[MySQL] Could not sync API key for ${provider}:`, e.message);
    }
  }
}

/**
 * Gets all API keys from MySQL for a given provider or all providers.
 */
export async function getDbApiKeys(provider = null) {
  if (!isDbConnected()) return [];
  const pool = getDbPool();
  try {
    let query = 'SELECT * FROM api_keys';
    let params = [];
    if (provider) {
      query += ' WHERE provider = ?';
      params.push(provider);
    }
    query += ' ORDER BY id ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (e) {
    console.warn('[MySQL] Could not fetch api_keys from DB:', e.message);
    return [];
  }
}

/**
 * Deletes an API key from the MySQL api_keys table.
 */
export async function deleteDbApiKey(apiKey) {
  if (!isDbConnected() || !apiKey) return;
  const pool = getDbPool();
  try {
    await pool.query('DELETE FROM api_keys WHERE api_key = ?', [String(apiKey).trim()]);
  } catch (e) {
    console.warn('[MySQL] Could not delete API key from DB:', e.message);
  }
}

/**
 * Automatically syncs keys from environment and JSON files into MySQL api_keys table.
 */
export async function migrateApiKeysToDb() {
  if (!isDbConnected()) return;
  try {
    const rootDir = path.resolve(__dirname, '..', '..');
    const keysJsonPath = path.resolve(rootDir, 'keys.json');
    const geminiKeysJsonPath = path.resolve(rootDir, 'gemini_keys.json');

    // 1. ElevenLabs Keys
    const elevenKeys = new Set();
    if (process.env.ELEVENLABS_API_KEYS) {
      process.env.ELEVENLABS_API_KEYS.split(',').forEach(k => k.trim() && elevenKeys.add(k.trim()));
    }
    if (process.env.ELEVENLABS_API_KEY) {
      elevenKeys.add(process.env.ELEVENLABS_API_KEY.trim());
    }
    if (fs.existsSync(keysJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(keysJsonPath, 'utf8'));
        if (Array.isArray(parsed)) parsed.forEach(k => k && elevenKeys.add(k.trim()));
      } catch (e) {}
    }
    await syncApiKeysToDb('elevenlabs', Array.from(elevenKeys));

    // 2. Gemini Keys
    const geminiKeys = new Set();
    if (process.env.GEMINI_API_KEYS) {
      process.env.GEMINI_API_KEYS.split(',').forEach(k => k.trim() && geminiKeys.add(k.trim()));
    }
    if (process.env.GEMINI_API_KEY) {
      geminiKeys.add(process.env.GEMINI_API_KEY.trim());
    }
    if (fs.existsSync(geminiKeysJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(geminiKeysJsonPath, 'utf8'));
        if (Array.isArray(parsed)) parsed.forEach(k => k && geminiKeys.add(k.trim()));
      } catch (e) {}
    }
    await syncApiKeysToDb('gemini', Array.from(geminiKeys));
  } catch (err) {
    console.warn('[MySQL] Key migration notice:', err.message);
  }
}
