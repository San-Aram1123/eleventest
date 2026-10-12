import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  ensureDatasetDir,
  getAllSamples,
  getSample,
  getSampleAudio,
  updateSampleMetadata,
  deleteSample,
  deleteSamples,
  deleteDurationOutliers,
  exportDatasetZip,
  sampleMatchesFilter,
  resolveSampleGender
} from '../datasetService.js';
import { extractEmotionAndCleanText, normalizeEmotionName } from '../emotionUtils.js';
import { exportAudarCanonicalZip, getAudarDatasetSummary } from '../audarExporter.js';

const router = express.Router();

/**
 * Bulk repair emotions for existing samples in the dataset
 */
router.post('/repair-emotions', async (req, res) => {
  try {
    const { sampleIds, targetEmotion, rawScript, autoScan } = req.body;
    const allSamples = await getAllSamples();
    const updated = [];

    if (rawScript && typeof rawScript === 'string') {
      const paragraphs = rawScript.split(/\r?\n\s*\r?\n+/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        const parsed = extractEmotionAndCleanText(p);
        if (parsed.emotion === 'neutral' && !parsed.emotionTag) continue;

        const matched = allSamples.find(s => {
          const sText = s.text.replace(/\s+/g, ' ').trim();
          const cleanP = parsed.cleanText.replace(/\s+/g, ' ').trim();
          return cleanP.includes(sText.slice(0, 20)) || sText.includes(cleanP.slice(0, 20));
        });

        if (matched) {
          await updateSampleMetadata(matched.id, {
            emotion: parsed.emotion,
            emotion_tag: parsed.emotionTag,
            emotionTag: parsed.emotionTag
          });
          updated.push({ id: matched.id, emotion: parsed.emotion, tag: parsed.emotionTag });
        }
      }
    } else if (Array.isArray(sampleIds) && sampleIds.length > 0 && targetEmotion) {
      const canonical = normalizeEmotionName(targetEmotion);
      const tag = `[${canonical}]`;
      for (const id of sampleIds) {
        await updateSampleMetadata(id, { emotion: canonical, emotion_tag: tag, emotionTag: tag });
        updated.push({ id, emotion: canonical, tag });
      }
    } else if (autoScan) {
      for (const s of allSamples) {
        const parsed = extractEmotionAndCleanText(s.text);
        if (parsed.emotion !== 'neutral' && s.emotion !== parsed.emotion) {
          await updateSampleMetadata(s.id, {
            emotion: parsed.emotion,
            emotion_tag: parsed.emotionTag,
            emotionTag: parsed.emotionTag
          });
          updated.push({ id: s.id, emotion: parsed.emotion, tag: parsed.emotionTag });
        }
      }
    }

    res.json({ success: true, updatedCount: updated.length, updated });
  } catch (err) {
    console.error('Repair Emotions Error:', err);
    res.status(500).json({ error: err.message || 'Failed to repair emotions' });
  }
});

/**
 * Get all samples in dataset
 */
router.get('/', async (req, res) => {
  try {
    const samples = await getAllSamples();
    res.json({ samples, count: samples.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Download dataset as raw ZIP
 */
router.get('/export/zip', async (req, res) => {
  try {
    await exportDatasetZip(res, req.query);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

/**
 * Download dataset formatted strictly in Audar Canonical Speech Schema
 */
router.get('/export/audar-zip', async (req, res) => {
  try {
    await exportAudarCanonicalZip(res, req.query);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

/**
 * Get Audar Canonical Dataset Summary & Phonetic Coverage Report
 */
router.get('/export/audar-summary', async (req, res) => {
  try {
    const summary = await getAudarDatasetSummary(req.query);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Preview matching sample counts and estimated size before exporting
 */
router.get('/export/preview', async (req, res) => {
  try {
    const allSamples = await getAllSamples();
    const matched = allSamples.filter(s => sampleMatchesFilter(s, req.query));
    const totalDuration = matched.reduce((acc, s) => acc + (s.duration_seconds || s.durationSeconds || 0), 0);
    const totalSize = matched.reduce((acc, s) => acc + (s.audio_size || 0), 0);
    const maleCount = matched.filter(s => resolveSampleGender(s) === 'male').length;
    const femaleCount = matched.filter(s => resolveSampleGender(s) === 'female').length;

    res.json({
      count: matched.length,
      totalSamples: allSamples.length,
      maleCount,
      femaleCount,
      totalDurationSeconds: Math.round(totalDuration * 10) / 10,
      totalAudioSizeBytes: totalSize,
      filters: req.query
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch delete multiple samples by ID
 */
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of sample IDs is required' });
    }
    const result = await deleteSamples(ids);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete all samples outside duration bounds
 */
router.post('/delete-outliers', async (req, res) => {
  try {
    const minSeconds = req.body?.minSeconds !== undefined ? parseFloat(req.body.minSeconds) : 6.0;
    const maxSeconds = req.body?.maxSeconds !== undefined ? parseFloat(req.body.maxSeconds) : 16.5;
    const result = await deleteDurationOutliers(minSeconds, maxSeconds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get single sample by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const sample = await getSample(req.params.id);
    if (!sample) return res.status(404).json({ error: 'Sample not found' });
    res.json({ sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve raw audio file (WAV / MP3)
 */
router.get('/:id/audio', (req, res) => {
  try {
    const buffer = getSampleAudio(req.params.id);
    if (!buffer) return res.status(404).send('Audio file not found');

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
router.get('/:id/download/:type', (req, res) => {
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
    }
    return res.status(400).send('Invalid file type requested');
  } catch (err) {
    res.status(500).send('Error downloading file');
  }
});

/**
 * Update metadata or ratings for a sample
 */
router.patch('/:id', async (req, res) => {
  try {
    const updated = await updateSampleMetadata(req.params.id, req.body);
    res.json({ success: true, sample: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a sample (WAV + MySQL row + JSON)
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteSample(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Sample not found or already deleted' });
    res.json({ success: true, message: `Sample ${req.params.id} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
