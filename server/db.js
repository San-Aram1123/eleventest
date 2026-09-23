import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

let pool = null;
let dbStatus = {
  configured: false,
  connected: false,
  error: null,
  database: process.env.DB_NAME || 'kurdish_tts_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  sampleCount: 0
};

/**
 * Returns database config from environment variables.
 */
export function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kurdish_tts_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
}

/**
 * Checks if MySQL database is active and connected.
 */
export function isDbConnected() {
  return dbStatus.connected && pool !== null;
}

/**
 * Returns current database connection and health status.
 */
export function getDbStatus() {
  return { ...dbStatus };
}

/**
 * Tests a custom or current connection configuration.
 */
export async function testDbConnection(config = null) {
  const cfg = config || getDbConfig();
  const testConn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    connectTimeout: 5000
  });
  await testConn.query('SELECT 1');
  await testConn.end();
  return true;
}

/**
 * Initializes the MySQL database, creates tables, and migrates existing files.
 */
export async function initDatabase() {
  const cfg = getDbConfig();
  dbStatus.host = cfg.host;
  dbStatus.port = cfg.port;
  dbStatus.database = cfg.database;
  dbStatus.configured = true;

  try {
    // 1. Connect without selecting database to ensure database exists with utf8mb4
    const adminConn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      connectTimeout: 5000
    });

    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci`
    );
    await adminConn.end();

    // 2. Initialize connection pool targeting the database
    pool = mysql.createPool({
      ...cfg,
      database: cfg.database
    });

    // 3. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS samples (
        id VARCHAR(64) PRIMARY KEY,
        text TEXT NOT NULL,
        dialect VARCHAR(64) DEFAULT 'sorani',
        emotion VARCHAR(64) DEFAULT 'neutral',
        emotion_tag JSON DEFAULT NULL,
        voice_id VARCHAR(128) DEFAULT NULL,
        voice_name VARCHAR(255) DEFAULT NULL,
        model_id VARCHAR(128) DEFAULT NULL,
        method VARCHAR(64) DEFAULT 'elevenlabs_api',
        rating INT DEFAULT NULL,
        rating_clarity INT DEFAULT NULL,
        rating_naturalness INT DEFAULT NULL,
        rating_emotion INT DEFAULT NULL,
        rating_dialect INT DEFAULT NULL,
        rating_notes TEXT DEFAULT NULL,
        wav_filename VARCHAR(255) NOT NULL,
        audio_size INT DEFAULT 0,
        duration_seconds FLOAT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        metadata_extra JSON DEFAULT NULL,
        INDEX idx_created_at (created_at),
        INDEX idx_dialect (dialect),
        INDEX idx_emotion (emotion),
        INDEX idx_rating (rating)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Safe non-destructive column addition if table already existed
    try {
      await pool.query("ALTER TABLE samples ADD COLUMN dialect VARCHAR(64) DEFAULT 'sorani'");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE samples ADD COLUMN family_id VARCHAR(128) DEFAULT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE samples ADD COLUMN emotion_intensity FLOAT DEFAULT 0.0");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE samples ADD COLUMN speaker_name VARCHAR(255) DEFAULT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE samples ADD COLUMN language VARCHAR(32) DEFAULT 'ckb'");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE samples ADD INDEX idx_family_id (family_id)");
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(64) DEFAULT 'elevenlabs',
        api_key VARCHAR(255) UNIQUE NOT NULL,
        label VARCHAR(255) DEFAULT NULL,
        status VARCHAR(64) DEFAULT 'ready',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_provider (provider)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await pool.query("ALTER TABLE api_keys ADD COLUMN provider VARCHAR(64) DEFAULT 'elevenlabs'");
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_queue (
        id VARCHAR(64) PRIMARY KEY,
        text TEXT NOT NULL,
        emotion VARCHAR(64) DEFAULT 'neutral',
        status VARCHAR(32) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    dbStatus.connected = true;
    dbStatus.error = null;

    // 4. Auto-migrate existing JSON files into MySQL
    await migrateDiskSamplesToDb();

    // 5. Auto-sync configured API keys into MySQL api_keys table
    await migrateApiKeysToDb();

    // 6. Update sample count
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM samples');
    dbStatus.sampleCount = countRows[0]?.count || 0;

    console.log(`[MySQL] Database '${cfg.database}' initialized successfully. Samples count: ${dbStatus.sampleCount}`);
    return true;
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.error = err.message;
    console.warn(`[MySQL] Warning: Could not connect to MySQL database: ${err.message}`);
    console.warn(`[MySQL] Falling back to file-based JSON storage. To connect MySQL, configure DB_PASSWORD in .env`);
    return false;
  }
}

/**
 * Migrates existing dataset JSON files from disk into MySQL if not already present.
 */
export async function migrateDiskSamplesToDb() {
  if (!isDbConnected()) return;
  if (!fs.existsSync(DATASET_ROOT)) return;

  try {
    const files = fs.readdirSync(DATASET_ROOT);
    const jsonFiles = files.filter(f => f.toLowerCase().endsWith('.json'));

    let importedCount = 0;
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(DATASET_ROOT, file);
        const raw = fs.readFileSync(filePath, 'utf8');
        const meta = JSON.parse(raw);

        if (!meta.id || !meta.text) continue;

        const wavName = `${meta.id}.wav`;
        const wavPath = path.join(DATASET_ROOT, wavName);
        let audioSize = 0;
        if (fs.existsSync(wavPath)) {
          audioSize = fs.statSync(wavPath).size;
        }

        // Format dates safely for MySQL DATETIME
        let createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (meta.created_at) {
          try {
            createdAt = new Date(meta.created_at).toISOString().slice(0, 19).replace('T', ' ');
          } catch (e) {}
        }

        const emotionTagJson = meta.emotion_tag ? JSON.stringify(Array.isArray(meta.emotion_tag) ? meta.emotion_tag : [meta.emotion_tag]) : null;
        const extraObj = {
          ...(meta.metadata_extra || {}),
          ...(meta.customMetadata || {})
        };
        if (meta.used_key && !extraObj.used_key) extraObj.used_key = meta.used_key;
        if (meta.generator && !extraObj.generator) extraObj.generator = meta.generator;
        if (meta.detected_tags && !extraObj.detected_tags) extraObj.detected_tags = meta.detected_tags;
        if (meta.is_multilingual !== undefined && extraObj.is_multilingual === undefined) extraObj.is_multilingual = meta.is_multilingual;
        if ((meta.voice_gender || meta.gender) && !extraObj.voice_gender) {
          extraObj.voice_gender = meta.voice_gender || meta.gender;
        }
        const extraJson = Object.keys(extraObj).length > 0 ? JSON.stringify(extraObj) : null;

        let calculatedDur = meta.duration_seconds;
        if (!calculatedDur && audioSize > 44) {
          calculatedDur = Math.round(((Math.max(0, audioSize - 44) / 48000) + Number.EPSILON) * 100) / 100;
        }

        const familyId = meta.family_id || extraObj.family_id || null;
        const emotionIntensity = meta.emotion_intensity !== undefined ? meta.emotion_intensity : (extraObj.emotion_intensity !== undefined ? extraObj.emotion_intensity : null);
        const speakerName = meta.speaker_name || extraObj.speaker_name || null;
        const language = meta.language || extraObj.language || 'ckb';

        await pool.query(
          `INSERT INTO samples (
            id, text, dialect, emotion, emotion_tag, voice_id, voice_name, model_id, method,
            rating, rating_clarity, rating_naturalness, rating_emotion, rating_dialect, rating_notes,
            wav_filename, audio_size, duration_seconds, created_at, metadata_extra,
            family_id, emotion_intensity, speaker_name, language
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            text = VALUES(text),
            dialect = VALUES(dialect),
            emotion = VALUES(emotion),
            emotion_tag = VALUES(emotion_tag),
            rating = VALUES(rating),
            rating_clarity = VALUES(rating_clarity),
            rating_naturalness = VALUES(rating_naturalness),
            rating_emotion = VALUES(rating_emotion),
            rating_dialect = VALUES(rating_dialect),
            rating_notes = VALUES(rating_notes),
            audio_size = VALUES(audio_size),
            duration_seconds = VALUES(duration_seconds),
            metadata_extra = VALUES(metadata_extra),
            family_id = VALUES(family_id),
            emotion_intensity = VALUES(emotion_intensity),
            speaker_name = VALUES(speaker_name),
            language = VALUES(language);`,
          [
            String(meta.id),
            meta.text,
            meta.dialect || 'sorani',
            meta.emotion || 'neutral',
            emotionTagJson,
            meta.voice_id || null,
            meta.voice_name || null,
            meta.model_id || null,
            meta.method || 'elevenlabs_api',
            meta.rating !== undefined ? meta.rating : null,
            meta.rating_clarity !== undefined ? meta.rating_clarity : null,
            meta.rating_naturalness !== undefined ? meta.rating_naturalness : null,
            meta.rating_emotion !== undefined ? meta.rating_emotion : null,
            meta.rating_dialect !== undefined ? meta.rating_dialect : null,
            meta.rating_notes || null,
            wavName,
            audioSize,
            calculatedDur || 0,
            createdAt,
            extraJson,
            familyId,
            emotionIntensity,
            speakerName,
            language
          ]
        );
        importedCount++;
      } catch (err) {
        console.error(`Error migrating sample ${file} to MySQL:`, err.message);
      }
    }

    if (importedCount > 0) {
      console.log(`[MySQL] Migrated/synced ${importedCount} samples from disk to MySQL.`);
    }
  } catch (err) {
    console.error('[MySQL] Error scanning disk dataset for migration:', err.message);
  }
}

/**
 * Parses a MySQL row into a rich Sample object.
 */
export function parseDbRowToSample(r) {
  if (!r) return null;
  let parsedTags = [];
  if (r.emotion_tag) {
    try {
      parsedTags = typeof r.emotion_tag === 'string' ? JSON.parse(r.emotion_tag) : r.emotion_tag;
    } catch (e) {}
  }
  let parsedExtra = r.metadata_extra || {};
  if (typeof parsedExtra === 'string') {
    try { parsedExtra = JSON.parse(parsedExtra); } catch (e) {}
  }
  const resolvedGender = r.voice_gender || parsedExtra?.voice_gender || parsedExtra?.gender || undefined;
  const wavPath = path.join(DATASET_ROOT, r.wav_filename || `${r.id}.wav`);
  return {
    id: r.id,
    family_id: r.family_id || parsedExtra?.family_id || undefined,
    emotion_intensity: r.emotion_intensity !== undefined && r.emotion_intensity !== null ? parseFloat(r.emotion_intensity) : (parsedExtra?.emotion_intensity !== undefined ? parseFloat(parsedExtra.emotion_intensity) : 0.0),
    speaker_name: r.speaker_name || parsedExtra?.speaker_name || r.voice_name || undefined,
    text: r.text,
    dialect: r.dialect || 'sorani',
    emotion: r.emotion,
    emotion_tag: parsedTags,
    voice_id: r.voice_id,
    voice_name: r.voice_name,
    voice_gender: resolvedGender,
    metadata_extra: parsedExtra,
    customMetadata: parsedExtra,
    used_key: parsedExtra?.used_key || r.used_key || undefined,
    model_id: r.model_id,
    method: r.method,
    language: r.language || parsedExtra?.language || 'ckb',
    script: (r.dialect || 'sorani') === 'badini' ? 'Kurmanji' : 'Sorani',
    json_filename: `${r.id}.json`,
    audio_filename: r.wav_filename || `${r.id}.wav`,
    rating: r.rating,
    rating_clarity: r.rating_clarity,
    rating_naturalness: r.rating_naturalness,
    rating_emotion: r.rating_emotion,
    rating_dialect: r.rating_dialect,
    rating_notes: r.rating_notes,
    audio_size: r.audio_size,
    duration_seconds: r.duration_seconds,
    created_at: r.created_at,
    updated_at: r.updated_at,
    hasAudio: fs.existsSync(wavPath),
    audioUrl: `/api/dataset/${r.id}/audio`
  };
}

/**
 * Reads all samples from MySQL database.
 */
export async function getAllDbSamples() {
  if (!isDbConnected()) return null;
  const [rows] = await pool.query(`
    SELECT * FROM samples 
    ORDER BY created_at DESC, id DESC
  `);

  return rows.map(r => parseDbRowToSample(r));
}

/**
 * Gets a single sample by ID from MySQL.
 */
export async function getDbSample(id) {
  if (!isDbConnected()) return null;
  const [rows] = await pool.query('SELECT * FROM samples WHERE id = ? LIMIT 1', [String(id)]);
  if (rows.length === 0) return null;

  return parseDbRowToSample(rows[0]);
}

/**
 * Saves a new sample or updates an existing sample in MySQL.
 */
export async function saveDbSample(meta) {
  if (!isDbConnected()) return null;
  const wavName = `${meta.id}.wav`;
  let createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (meta.created_at) {
    try {
      createdAt = new Date(meta.created_at).toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) {}
  }
  const emotionTagJson = meta.emotion_tag ? JSON.stringify(Array.isArray(meta.emotion_tag) ? meta.emotion_tag : [meta.emotion_tag]) : null;
  const extraObj = {
    ...(meta.metadata_extra || {}),
    ...(meta.customMetadata || {})
  };
  if (meta.used_key && !extraObj.used_key) extraObj.used_key = meta.used_key;
  if (meta.generator && !extraObj.generator) extraObj.generator = meta.generator;
  if (meta.detected_tags && !extraObj.detected_tags) extraObj.detected_tags = meta.detected_tags;
  if (meta.is_multilingual !== undefined && extraObj.is_multilingual === undefined) extraObj.is_multilingual = meta.is_multilingual;
  if ((meta.voice_gender || meta.gender) && !extraObj.voice_gender) {
    extraObj.voice_gender = meta.voice_gender || meta.gender;
  }
  if (meta.family_id && !extraObj.family_id) extraObj.family_id = meta.family_id;
  if (meta.emotion_intensity !== undefined && extraObj.emotion_intensity === undefined) extraObj.emotion_intensity = meta.emotion_intensity;
  if (meta.speaker_name && !extraObj.speaker_name) extraObj.speaker_name = meta.speaker_name;
  if (meta.language && !extraObj.language) extraObj.language = meta.language;
  const extraJson = Object.keys(extraObj).length > 0 ? JSON.stringify(extraObj) : null;

  await pool.query(
    `INSERT INTO samples (
      id, text, dialect, emotion, emotion_tag, voice_id, voice_name, model_id, method,
      rating, rating_clarity, rating_naturalness, rating_emotion, rating_dialect, rating_notes,
      wav_filename, audio_size, duration_seconds, created_at, metadata_extra,
      family_id, emotion_intensity, speaker_name, language
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      text = VALUES(text),
      dialect = VALUES(dialect),
      emotion = VALUES(emotion),
      emotion_tag = VALUES(emotion_tag),
      voice_id = VALUES(voice_id),
      voice_name = VALUES(voice_name),
      model_id = VALUES(model_id),
      method = VALUES(method),
      rating = VALUES(rating),
      rating_clarity = VALUES(rating_clarity),
      rating_naturalness = VALUES(rating_naturalness),
      rating_emotion = VALUES(rating_emotion),
      rating_dialect = VALUES(rating_dialect),
      rating_notes = VALUES(rating_notes),
      audio_size = VALUES(audio_size),
      duration_seconds = VALUES(duration_seconds),
      metadata_extra = VALUES(metadata_extra),
      family_id = VALUES(family_id),
      emotion_intensity = VALUES(emotion_intensity),
      speaker_name = VALUES(speaker_name),
      language = VALUES(language);`,
    [
      String(meta.id),
      meta.text,
      meta.dialect || 'sorani',
      meta.emotion || 'neutral',
      emotionTagJson,
      meta.voice_id || null,
      meta.voice_name || null,
      meta.model_id || null,
      meta.method || 'elevenlabs_api',
      meta.rating !== undefined ? meta.rating : null,
      meta.rating_clarity !== undefined ? meta.rating_clarity : null,
      meta.rating_naturalness !== undefined ? meta.rating_naturalness : null,
      meta.rating_emotion !== undefined ? meta.rating_emotion : null,
      meta.rating_dialect !== undefined ? meta.rating_dialect : null,
      meta.rating_notes || null,
      wavName,
      meta.audio_size || 0,
      meta.duration_seconds || 0,
      createdAt,
      extraJson,
      meta.family_id || null,
      meta.emotion_intensity !== undefined && meta.emotion_intensity !== null ? meta.emotion_intensity : 0.0,
      meta.speaker_name || null,
      meta.language || 'ckb'
    ]
  );

  return getDbSample(meta.id);
}

/**
 * Updates metadata for a sample in MySQL.
 */
export async function updateDbSampleMetadata(id, patch) {
  if (!isDbConnected()) return null;
  const existing = await getDbSample(id);
  if (!existing) return null;

  const merged = { ...existing, ...patch };
  return await saveDbSample(merged);
}

/**
 * Deletes a sample from MySQL.
 */
export async function deleteDbSample(id) {
  if (!isDbConnected()) return false;
  const [result] = await pool.query('DELETE FROM samples WHERE id = ?', [String(id)]);
  return result.affectedRows > 0;
}

/**
 * Bulk deletes multiple samples from MySQL in safe batches of 500.
 * @param {string[]} ids
 */
export async function deleteDbSamples(ids) {
  if (!isDbConnected() || !Array.isArray(ids) || ids.length === 0) return 0;

  let totalDeleted = 0;
  const chunkSize = 500;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize).map(id => String(id));
    if (chunk.length === 0) continue;
    const placeholders = chunk.map(() => '?').join(',');
    const [result] = await pool.query(
      `DELETE FROM samples WHERE id IN (${placeholders})`,
      chunk
    );
    totalDeleted += result.affectedRows || 0;
  }

  return totalDeleted;
}

/**
 * Computes next sequential ID from MySQL.
 */
export async function getNextDbSampleId(method = 'elevenlabs_api', usePrefix = false) {
  if (!isDbConnected()) return null;

  if (usePrefix && method === 'elevenlabs_web') {
    const [rows] = await pool.query("SELECT id FROM samples WHERE id LIKE 'normal_%'");
    let maxIndex = 0;
    const regex = /^normal_(\d+)$/i;
    for (const r of rows) {
      const match = String(r.id).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
    return `normal_${String(maxIndex + 1).padStart(3, '0')}`;
  } else {
    const [rows] = await pool.query("SELECT id FROM samples WHERE id NOT LIKE 'normal_%'");
    let maxIndex = 0;
    const regex = /^(\d+)$/i;
    for (const r of rows) {
      const match = String(r.id).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIndex) maxIndex = num;
      }
    }
    return String(maxIndex + 1).padStart(3, '0');
  }
}

/**
 * Synchronizes API keys into MySQL api_keys table.
 */
export async function syncApiKeysToDb(provider, keys) {
  if (!isDbConnected() || !Array.isArray(keys) || keys.length === 0) return;
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
    const keysJsonPath = path.resolve(__dirname, '..', 'keys.json');
    const geminiKeysJsonPath = path.resolve(__dirname, '..', 'gemini_keys.json');

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


/**
 * Normalizes Kurdish text for robust duplicate comparison in DB checks.
 */
export function normalizeKurdishTextForComparison(t) {
  if (!t) return '';
  return String(t)
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // remove bracketed tags like [laugh]
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Searches MySQL for an existing sample matching normalized Kurdish text.
 */
export async function findDbSampleByNormalizedText(normText) {
  if (!isDbConnected() || !normText) return null;
  try {
    const samples = await getAllDbSamples();
    for (const s of samples) {
      const sNorm = normalizeKurdishTextForComparison(s.cleanText || s.text);
      if (sNorm && sNorm === normText) {
        return s;
      }
    }
    return null;
  } catch (e) {
    console.warn('[MySQL] findDbSampleByNormalizedText error:', e.message);
    return null;
  }
}

