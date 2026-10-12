import express from 'express';
import {
  getLatestMasterAudio, getMasterAudioHistory,
  getMasterAudioById, clearMasterAudioHistory
} from '../pairedSlicingService.js';
import { validatePairedDataset } from '../pairedValidation.js';
import { generatePairedMetadataCsv, exportPairedZipArchive } from '../pairedExporter.js';
import { repairDatasetBoundaries } from '../repairDatasetBoundaries.js';

const router = express.Router();

/**
 * Streams an in-memory master audio take directly to browser for user preview.
 */
router.get('/master-audio/stream', (req, res) => {
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
router.get('/master-audio/list', (req, res) => {
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

  res.json({ count: items.length, items });
});

/**
 * Clears the in-memory master audio history.
 */
router.post('/master-audio/clear', (req, res) => {
  clearMasterAudioHistory();
  res.json({ success: true, count: 0 });
});

/**
 * Returns metadata about the latest in-memory master audio take.
 */
router.get('/master-audio/info', (req, res) => {
  const master = getLatestMasterAudio();
  if (!master || !master.audioBuffer) return res.json({ available: false });

  res.json({
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
router.get('/validate', async (req, res) => {
  try {
    const report = await validatePairedDataset();
    res.json(report);
  } catch (err) {
    console.error('[Paired API] Error validating dataset:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Exports metadata.csv with exact required schema
 */
router.get('/export-csv', async (req, res) => {
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
router.get('/export-zip', async (req, res) => {
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
router.post('/repair-boundaries', async (req, res) => {
  try {
    const { dryRun = false, force = false } = req.body || {};
    const report = await repairDatasetBoundaries({ dryRun: Boolean(dryRun), forceAll: Boolean(force) });
    res.json(report);
  } catch (err) {
    console.error('[Paired API] Error repairing boundaries:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
