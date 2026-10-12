import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDbConnected, getDbPool } from './dbConfig.js';
import { normalizeKurdishTextForComparison } from './dbTextNormalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', '..', 'dataset'));

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
  const resolvedGender = r.gender || r.voice_gender || parsedExtra?.gender || parsedExtra?.voice_gender || undefined;
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
    gender: resolvedGender,
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
  const pool = getDbPool();
  try {
    const [rows] = await pool.query('SELECT * FROM samples ORDER BY created_at DESC, id DESC');
    return rows.map(r => parseDbRowToSample(r));
  } catch (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      console.warn('[MySQL] Idle connection dropped, retrying with fresh connection...');
      const [rows] = await pool.query('SELECT * FROM samples ORDER BY created_at DESC, id DESC');
      return rows.map(r => parseDbRowToSample(r));
    }
    throw err;
  }
}

/**
 * Gets a single sample by ID from MySQL.
 */
export async function getDbSample(id) {
  if (!isDbConnected()) return null;
  const pool = getDbPool();
  const [rows] = await pool.query('SELECT * FROM samples WHERE id = ? LIMIT 1', [String(id)]);
  if (rows.length === 0) return null;
  return parseDbRowToSample(rows[0]);
}

/**
 * Saves a new sample or updates an existing sample in MySQL.
 */
export async function saveDbSample(meta) {
  if (!isDbConnected()) return null;
  const pool = getDbPool();
  const wavName = `${meta.id}.wav`;
  let createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (meta.created_at) {
    try {
      createdAt = new Date(meta.created_at).toISOString().slice(0, 19).replace('T', ' ');
    } catch (e) {}
  }
  const emotionTagJson = meta.emotion_tag ? JSON.stringify(Array.isArray(meta.emotion_tag) ? meta.emotion_tag : [meta.emotion_tag]) : null;
  const extraObj = { ...(meta.metadata_extra || {}), ...(meta.customMetadata || {}) };
  if (meta.used_key && !extraObj.used_key) extraObj.used_key = meta.used_key;
  if (meta.generator && !extraObj.generator) extraObj.generator = meta.generator;
  if (meta.detected_tags && !extraObj.detected_tags) extraObj.detected_tags = meta.detected_tags;
  if (meta.is_multilingual !== undefined && extraObj.is_multilingual === undefined) extraObj.is_multilingual = meta.is_multilingual;
  if ((meta.voice_gender || meta.gender) && !extraObj.voice_gender) extraObj.voice_gender = meta.voice_gender || meta.gender;
  const resolvedGender = meta.gender || meta.voice_gender || extraObj.gender || extraObj.voice_gender || null;
  if (resolvedGender && !extraObj.gender) extraObj.gender = resolvedGender;
  if (resolvedGender && !extraObj.voice_gender) extraObj.voice_gender = resolvedGender;
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
      family_id, emotion_intensity, speaker_name, language, gender, voice_gender
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      text = VALUES(text), dialect = VALUES(dialect), emotion = VALUES(emotion),
      emotion_tag = VALUES(emotion_tag), voice_id = VALUES(voice_id), voice_name = VALUES(voice_name),
      model_id = VALUES(model_id), method = VALUES(method), rating = VALUES(rating),
      rating_clarity = VALUES(rating_clarity), rating_naturalness = VALUES(rating_naturalness),
      rating_emotion = VALUES(rating_emotion), rating_dialect = VALUES(rating_dialect),
      rating_notes = VALUES(rating_notes), audio_size = VALUES(audio_size),
      duration_seconds = VALUES(duration_seconds), metadata_extra = VALUES(metadata_extra),
      family_id = VALUES(family_id), emotion_intensity = VALUES(emotion_intensity),
      speaker_name = VALUES(speaker_name), language = VALUES(language),
      gender = VALUES(gender), voice_gender = VALUES(voice_gender);`,
    [
      String(meta.id), meta.text, meta.dialect || 'sorani', meta.emotion || 'neutral', emotionTagJson,
      meta.voice_id || null, meta.voice_name || null, meta.model_id || null, meta.method || 'elevenlabs_api',
      meta.rating !== undefined ? meta.rating : null, meta.rating_clarity !== undefined ? meta.rating_clarity : null,
      meta.rating_naturalness !== undefined ? meta.rating_naturalness : null, meta.rating_emotion !== undefined ? meta.rating_emotion : null,
      meta.rating_dialect !== undefined ? meta.rating_dialect : null, meta.rating_notes || null,
      wavName, meta.audio_size || 0, meta.duration_seconds || 0, createdAt, extraJson,
      meta.family_id || null, meta.emotion_intensity !== undefined && meta.emotion_intensity !== null ? meta.emotion_intensity : 0.0,
      meta.speaker_name || null, meta.language || 'ckb', resolvedGender, resolvedGender
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
  const pool = getDbPool();
  const [result] = await pool.query('DELETE FROM samples WHERE id = ?', [String(id)]);
  return result.affectedRows > 0;
}

/**
 * Bulk deletes multiple samples from MySQL in safe batches of 500.
 */
export async function deleteDbSamples(ids) {
  if (!isDbConnected() || !Array.isArray(ids) || ids.length === 0) return 0;
  const pool = getDbPool();
  let totalDeleted = 0;
  const chunkSize = 500;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize).map(id => String(id));
    if (chunk.length === 0) continue;
    const placeholders = chunk.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM samples WHERE id IN (${placeholders})`, chunk);
    totalDeleted += result.affectedRows || 0;
  }
  return totalDeleted;
}

/**
 * Computes next sequential ID from MySQL.
 */
export async function getNextDbSampleId(method = 'elevenlabs_api', usePrefix = false) {
  if (!isDbConnected()) return null;
  const pool = getDbPool();
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
 * Searches MySQL for an existing sample matching normalized Kurdish text.
 */
export async function findDbSampleByNormalizedText(normText) {
  if (!isDbConnected() || !normText) return null;
  try {
    const samples = await getAllDbSamples();
    for (const s of samples) {
      const sNorm = normalizeKurdishTextForComparison(s.cleanText || s.text);
      if (sNorm && sNorm === normText) return s;
    }
    return null;
  } catch (e) {
    console.warn('[MySQL] findDbSampleByNormalizedText error:', e.message);
    return null;
  }
}

/**
 * Migrates existing dataset JSON files from disk into MySQL if not already present.
 */
export async function migrateDiskSamplesToDb() {
  if (!isDbConnected() || !fs.existsSync(DATASET_ROOT)) return;
  const pool = getDbPool();
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
        let audioSize = fs.existsSync(wavPath) ? fs.statSync(wavPath).size : 0;
        let createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (meta.created_at) {
          try { createdAt = new Date(meta.created_at).toISOString().slice(0, 19).replace('T', ' '); } catch (e) {}
        }
        const emotionTagJson = meta.emotion_tag ? JSON.stringify(Array.isArray(meta.emotion_tag) ? meta.emotion_tag : [meta.emotion_tag]) : null;
        const extraObj = { ...(meta.metadata_extra || {}), ...(meta.customMetadata || {}) };
        if (meta.used_key && !extraObj.used_key) extraObj.used_key = meta.used_key;
        if (meta.generator && !extraObj.generator) extraObj.generator = meta.generator;
        if (meta.detected_tags && !extraObj.detected_tags) extraObj.detected_tags = meta.detected_tags;
        if (meta.is_multilingual !== undefined && extraObj.is_multilingual === undefined) extraObj.is_multilingual = meta.is_multilingual;
        if ((meta.voice_gender || meta.gender) && !extraObj.voice_gender) extraObj.voice_gender = meta.voice_gender || meta.gender;
        const extraJson = Object.keys(extraObj).length > 0 ? JSON.stringify(extraObj) : null;
        let calculatedDur = meta.duration_seconds || (audioSize > 44 ? Math.round(((Math.max(0, audioSize - 44) / 48000) + Number.EPSILON) * 100) / 100 : 0);

        await pool.query(
          `INSERT INTO samples (
            id, text, dialect, emotion, emotion_tag, voice_id, voice_name, model_id, method,
            rating, rating_clarity, rating_naturalness, rating_emotion, rating_dialect, rating_notes,
            wav_filename, audio_size, duration_seconds, created_at, metadata_extra,
            family_id, emotion_intensity, speaker_name, language
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            text = VALUES(text), dialect = VALUES(dialect), emotion = VALUES(emotion),
            emotion_tag = VALUES(emotion_tag), rating = VALUES(rating), rating_clarity = VALUES(rating_clarity),
            rating_naturalness = VALUES(rating_naturalness), rating_emotion = VALUES(rating_emotion),
            rating_dialect = VALUES(rating_dialect), rating_notes = VALUES(rating_notes),
            audio_size = VALUES(audio_size), duration_seconds = VALUES(duration_seconds),
            metadata_extra = VALUES(metadata_extra), family_id = VALUES(family_id),
            emotion_intensity = VALUES(emotion_intensity), speaker_name = VALUES(speaker_name), language = VALUES(language);`,
          [
            String(meta.id), meta.text, meta.dialect || 'sorani', meta.emotion || 'neutral', emotionTagJson,
            meta.voice_id || null, meta.voice_name || null, meta.model_id || null, meta.method || 'elevenlabs_api',
            meta.rating !== undefined ? meta.rating : null, meta.rating_clarity !== undefined ? meta.rating_clarity : null,
            meta.rating_naturalness !== undefined ? meta.rating_naturalness : null, meta.rating_emotion !== undefined ? meta.rating_emotion : null,
            meta.rating_dialect !== undefined ? meta.rating_dialect : null, meta.rating_notes || null,
            wavName, audioSize, calculatedDur || 0, createdAt, extraJson,
            meta.family_id || extraObj.family_id || null,
            meta.emotion_intensity !== undefined ? meta.emotion_intensity : (extraObj.emotion_intensity !== undefined ? extraObj.emotion_intensity : null),
            meta.speaker_name || extraObj.speaker_name || null,
            meta.language || extraObj.language || 'ckb'
          ]
        );
        importedCount++;
      } catch (err) {
        console.error(`Error migrating sample ${file} to MySQL:`, err.message);
      }
    }
    if (importedCount > 0) console.log(`[MySQL] Migrated/synced ${importedCount} samples from disk to MySQL.`);
  } catch (err) {
    console.error('[MySQL] Error scanning disk dataset for migration:', err.message);
  }
}
