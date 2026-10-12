import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { resolveSampleGender } from './datasetGender.js';
import { sampleMatchesFilter } from './datasetFilter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', '..', 'dataset'));

/**
 * Streams the filtered dataset as a ZIP archive.
 * Supports filtering by gender (male/female/all), voice, dialect, language, emotion, method, and specific sample IDs.
 */
export async function exportDatasetZip(res, filters = {}, getAllSamplesFn = null, datasetDir = DEFAULT_DATASET_ROOT) {
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  const allSamples = getAllSamplesFn ? await getAllSamplesFn() : [];
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

  res.on('close', () => {
    if (!archive._readableState?.ended) {
      try { archive.destroy(); } catch (_) {}
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
    const wavPath = path.join(datasetDir, `${baseId}.wav`);
    const jsonPath = path.join(datasetDir, `${baseId}.json`);

    if (fs.existsSync(wavPath)) {
      const stats = fs.statSync(wavPath);
      totalAudioBytes += stats.size;
      archive.file(wavPath, { name: `dataset/${baseId}.wav`, store: true });
    }

    if (fs.existsSync(jsonPath)) {
      archive.file(jsonPath, { name: `dataset/${baseId}.json` });
    } else {
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
