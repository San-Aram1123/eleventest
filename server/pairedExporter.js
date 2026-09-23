import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { getAllSamples } from './datasetService.js';
import { validatePairedDataset } from './pairedValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Builds array of paired records formatted strictly for export.
 */
export async function buildPairedRecords(customSamples = null) {
  const allSamples = customSamples || (await getAllSamples());
  const pairedRecords = [];

  for (const s of allSamples) {
    let fId = s.family_id || s.customMetadata?.family_id || s.metadata_extra?.family_id;
    if (!fId && typeof s.id === 'string') {
      const match = s.id.match(/^([a-zA-Z0-9]+_\d{3,4})_[a-zA-Z0-9_]+$/);
      if (match) fId = match[1];
    }

    if (!fId) continue; // Only include paired emotion clips

    const cleanText = String(s.text || '').replace(/[\r\n|]+/g, ' ').trim();
    const speaker = s.speaker_name || s.customMetadata?.speaker_name || s.voice_name || 'spk01';
    const lang = s.language || s.customMetadata?.language || ((s.dialect === 'badini') ? 'kmr' : 'ckb');
    const emo = String(s.emotion || 'neutral').toLowerCase().trim();

    let intensity = s.emotion_intensity ?? s.customMetadata?.emotion_intensity;
    if (intensity === undefined || intensity === null) {
      intensity = emo === 'neutral' ? 0.0 : (emo === 'angry' ? 0.9 : 0.8);
    }
    const numIntensity = Number(intensity).toFixed(1);

    const audioFilename = `${s.id}.wav`;
    const sourceWavPath = path.join(DATASET_ROOT, audioFilename);

    pairedRecords.push({
      sampleId: s.id,
      audioFile: audioFilename,
      text: cleanText,
      speakerName: speaker,
      language: lang,
      emotion: emo,
      emotionIntensity: numIntensity,
      familyId: fId,
      sourceWavPath,
      existsOnDisk: fs.existsSync(sourceWavPath)
    });
  }

  // Sort by familyId ascending, then emotion order
  return pairedRecords.sort((a, b) => {
    if (a.familyId !== b.familyId) return a.familyId.localeCompare(b.familyId);
    return a.emotion.localeCompare(b.emotion);
  });
}

/**
 * Generates raw pipe-separated metadata.csv content string.
 */
export async function generatePairedMetadataCsv(customSamples = null) {
  const records = await buildPairedRecords(customSamples);
  const header = 'audio_file|text|speaker_name|language|emotion|emotion_intensity|family_id';
  const lines = [header];

  for (const r of records) {
    lines.push(`${r.audioFile}|${r.text}|${r.speakerName}|${r.language}|${r.emotion}|${r.emotionIntensity}|${r.familyId}`);
  }

  return lines.join('\n') + '\n';
}

/**
 * Streams complete Paired Emotion Dataset as a ZIP file.
 */
export async function exportPairedZipArchive(res) {
  const records = await buildPairedRecords();
  const validationReport = await validatePairedDataset();
  const csvContent = await generatePairedMetadataCsv();

  const timestamp = new Date().toISOString().slice(0, 10);
  const archiveName = `kurdish_paired_emotions_${timestamp}.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err) => {
    console.error('[Paired Export] Archive error:', err);
    if (!res.headersSent) res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  // 1. metadata.csv
  archive.append(csvContent, { name: 'metadata.csv' });

  // 2. validation_report.json
  archive.append(JSON.stringify(validationReport, null, 2), { name: 'validation_report.json' });

  // 3. audio/ files
  for (const r of records) {
    if (r.existsOnDisk) {
      archive.file(r.sourceWavPath, { name: `audio/${r.audioFile}` });
    }
  }

  await archive.finalize();
}
