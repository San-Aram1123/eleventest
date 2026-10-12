import fs from 'fs';
import path from 'path';
import {
  isDbConnected,
  saveDbSample,
  updateDbSampleMetadata as updateDbSample,
  deleteDbSample,
  deleteDbSamples
} from '../db.js';
import { resolveSampleGender } from './datasetGender.js';
import { getNextSampleId } from './datasetIdService.js';

/**
 * Saves a new sample atomically: saving audio WAV on disk, metadata in MySQL, and writing JSON backup.
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
}, { datasetDir, findSampleByTextFn, invalidateCacheFn }) {
  if (!id && !allowDuplicateText && !family_id && findSampleByTextFn) {
    const existing = await findSampleByTextFn(text);
    if (existing) {
      console.log(`[Dataset] Sample with matching Kurdish text already exists (#${existing.id}). Returning existing sample.`);
      return existing;
    }
  }

  const sampleId = id || (await getNextSampleId(method, method === 'elevenlabs_web', datasetDir));
  const safeId = path.basename(sampleId);
  const wavFileName = `${safeId}.wav`;
  const jsonFileName = `${safeId}.json`;
  const wavPath = path.join(datasetDir, wavFileName);
  const jsonPath = path.join(datasetDir, jsonFileName);

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
    ratings: ratings || { naturalness: 0, emotion: 0, pronunciation: 0, overall: 0, notes: '' },
    notes: notes || undefined,
    audio_size: audioSize,
    duration_seconds: calculatedDuration,
    created_at: new Date().toISOString(),
    audio_filename: wavFileName,
    json_filename: jsonFileName,
    ...customMetadata
  };

  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), { encoding: 'utf-8' });

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

  if (invalidateCacheFn) invalidateCacheFn();
  return {
    ...metadata,
    hasAudio: !!audioBuffer,
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Updates metadata for an existing sample in MySQL and disk backup.
 */
export async function updateSampleMetadata(id, updates = {}, { datasetDir, getDbSampleFn, invalidateCacheFn }) {
  const safeId = path.basename(id);
  const jsonPath = path.join(datasetDir, `${safeId}.json`);

  let existing = {};
  if (fs.existsSync(jsonPath)) {
    try { existing = JSON.parse(fs.readFileSync(jsonPath, { encoding: 'utf-8' })); } catch (_) {}
  } else if (isDbConnected() && getDbSampleFn) {
    const dbItem = await getDbSampleFn(safeId);
    if (dbItem) existing = dbItem;
  }

  const updated = {
    ...existing,
    ...updates,
    id: safeId,
    updated_at: new Date().toISOString()
  };

  if (updates.ratings) {
    updated.ratings = { ...(existing.ratings || {}), ...updates.ratings };
  }

  fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), { encoding: 'utf-8' });

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

  if (invalidateCacheFn) invalidateCacheFn();
  const wavPath = path.join(datasetDir, `${safeId}.wav`);
  return {
    ...updated,
    hasAudio: fs.existsSync(wavPath),
    audioUrl: `/api/dataset/${safeId}/audio`
  };
}

/**
 * Deletes a single sample from disk and MySQL.
 */
export async function deleteSample(id, { datasetDir, invalidateCacheFn }) {
  const safeId = path.basename(id);
  const jsonPath = path.join(datasetDir, `${safeId}.json`);
  const wavPath = path.join(datasetDir, `${safeId}.wav`);

  let deleted = false;
  if (fs.existsSync(jsonPath)) { try { fs.unlinkSync(jsonPath); deleted = true; } catch (_) {} }
  if (fs.existsSync(wavPath)) { try { fs.unlinkSync(wavPath); deleted = true; } catch (_) {} }

  if (isDbConnected()) {
    try {
      const dbDeleted = await deleteDbSample(safeId);
      if (dbDeleted) deleted = true;
    } catch (err) {
      console.error(`[MySQL] Failed to delete sample ${safeId} from database:`, err.message);
    }
  }

  if (deleted && invalidateCacheFn) invalidateCacheFn();
  return deleted;
}

/**
 * Bulk deletes multiple samples from disk and MySQL.
 */
export async function deleteSamples(ids, { datasetDir, invalidateCacheFn }) {
  if (!Array.isArray(ids) || ids.length === 0) return { success: true, count: 0, deletedIds: [] };

  const deletedIds = [];
  for (const id of ids) {
    const safeId = path.basename(String(id));
    const jsonPath = path.join(datasetDir, `${safeId}.json`);
    const wavPath = path.join(datasetDir, `${safeId}.wav`);
    if (fs.existsSync(jsonPath)) { try { fs.unlinkSync(jsonPath); } catch (_) {} }
    if (fs.existsSync(wavPath)) { try { fs.unlinkSync(wavPath); } catch (_) {} }
    deletedIds.push(safeId);
  }

  if (isDbConnected() && deletedIds.length > 0) {
    try {
      await deleteDbSamples(deletedIds);
    } catch (err) {
      console.error('[MySQL] Failed to bulk delete samples from database:', err.message);
    }
  }

  if (deletedIds.length > 0 && invalidateCacheFn) invalidateCacheFn();
  return { success: true, count: deletedIds.length, deletedIds };
}

/**
 * Deletes duration outliers under minSeconds or over maxSeconds.
 */
export async function deleteDurationOutliers(minSeconds = 6.0, maxSeconds = 16.5, { getAllSamplesFn, datasetDir, invalidateCacheFn }) {
  const all = await getAllSamplesFn();
  const outlierIds = [];
  let underCount = 0;
  let overCount = 0;

  for (const s of all) {
    const dur = Number(s.duration_seconds ?? s.durationSeconds ?? s.customMetadata?.duration_seconds ?? 0);
    if (dur <= minSeconds) { outlierIds.push(s.id); underCount++; }
    else if (dur > maxSeconds) { outlierIds.push(s.id); overCount++; }
  }

  const res = await deleteSamples(outlierIds, { datasetDir, invalidateCacheFn });
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
