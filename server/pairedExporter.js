import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { getAllSamples } from './datasetService.js';
import { validatePairedDataset } from './pairedValidation.js';
import { evaluateQcConfidence } from './pairedEmotionConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Builds array of paired records formatted strictly for export.
 * Enforces training-ready QC filter:
 * >= 0.85        PASS
 * 0.70 - 0.849   WARNING / review
 * < 0.70         FAIL — do not mark training-ready
 */
export async function buildPairedRecords(customSamples = null, options = {}) {
  const { onlyTrainingReady = true } = options;
  const allSamples = customSamples || (await getAllSamples());
  const pairedRecords = [];
  const excludedRecords = [];

  for (const s of allSamples) {
    let fId = s.family_id || s.customMetadata?.family_id || s.metadata_extra?.family_id;
    if (!fId && typeof s.id === 'string') {
      const match = s.id.match(/^([a-zA-Z0-9]+_\d{3,4})_[a-zA-Z0-9_]+$/);
      if (match) fId = match[1];
    }

    if (!fId) continue; // Only include paired emotion clips

    // QC Confidence & Training-Ready enforcement
    const conf = Number(s.segmentation_confidence ?? s.customMetadata?.segmentation_confidence ?? 1.0);
    const qc = evaluateQcConfidence(conf);
    const trainingReady = (s.training_ready !== undefined && s.training_ready !== null)
      ? Boolean(s.training_ready)
      : (s.customMetadata?.training_ready !== undefined ? Boolean(s.customMetadata.training_ready) : qc.training_ready);
    const qcStatus = s.qc_status || s.customMetadata?.qc_status || qc.status;
    const qcGrade = s.qc_grade || s.customMetadata?.qc_grade || qc.grade;

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

    const record = {
      sampleId: s.id,
      audioFile: audioFilename,
      text: cleanText,
      speakerName: speaker,
      language: lang,
      emotion: emo,
      emotionIntensity: numIntensity,
      familyId: fId,
      sourceWavPath,
      existsOnDisk: fs.existsSync(sourceWavPath),
      confidence: conf,
      trainingReady,
      qcStatus,
      qcGrade
    };

    // Boundary QC inspection
    const bMetrics = s.boundary_metrics || s.customMetadata?.boundary_metrics;
    const leadingSilenceMs = s.leading_silence_ms ?? s.customMetadata?.leading_silence_ms ?? bMetrics?.leading_silence_ms;
    const trailingSilenceMs = s.trailing_silence_ms ?? s.customMetadata?.trailing_silence_ms ?? bMetrics?.trailing_silence_ms;
    const boundaryQcPass = s.boundary_qc_pass ?? s.customMetadata?.boundary_qc_pass ?? bMetrics?.boundary_qc_pass;

    const hasExcessiveSilence = (leadingSilenceMs !== undefined && leadingSilenceMs > 250) ||
                                (trailingSilenceMs !== undefined && trailingSilenceMs > 300);

    // Strict training-ready enforcement:
    // Any clip with confidence < 0.70, training_ready === false, boundary_qc_pass === false, or excessive silence is excluded from training export
    if (onlyTrainingReady && (!trainingReady || conf < 0.70 || qcStatus === 'FAIL' || boundaryQcPass === false || hasExcessiveSilence)) {
      let failReason = s.customMetadata?.outlier_reason;
      if (hasExcessiveSilence) {
        failReason = `Acoustic boundary violation: leading=${leadingSilenceMs ?? 'unknown'}ms (max 250ms), trailing=${trailingSilenceMs ?? 'unknown'}ms (max 300ms)`;
      } else if (boundaryQcPass === false) {
        failReason = 'Boundary QC failed: clipped speech at onset or release';
      } else if (!failReason) {
        failReason = `Confidence ${conf.toFixed(2)} < 0.70 threshold (FAIL - not training-ready)`;
      }

      excludedRecords.push({
        sampleId: s.id,
        familyId: fId,
        confidence: conf,
        leadingSilenceMs,
        trailingSilenceMs,
        reason: failReason
      });
      continue;
    }

    pairedRecords.push(record);
  }

  // Sort by familyId ascending, then emotion order
  pairedRecords.sort((a, b) => {
    if (a.familyId !== b.familyId) return a.familyId.localeCompare(b.familyId);
    return a.emotion.localeCompare(b.emotion);
  });

  pairedRecords.excludedRecords = excludedRecords;
  return pairedRecords;
}

/**
 * Generates raw pipe-separated metadata.csv content string.
 */
export async function generatePairedMetadataCsv(customSamples = null, options = {}) {
  const records = await buildPairedRecords(customSamples, options);
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
export async function exportPairedZipArchive(res, options = {}) {
  const records = await buildPairedRecords(null, options);
  const validationReport = await validatePairedDataset();
  const csvContent = await generatePairedMetadataCsv(null, options);

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

  // 2. validation_report.json (enriched with training-readiness statistics)
  const enrichedReport = {
    ...validationReport,
    exportQc: {
      onlyTrainingReady: options.onlyTrainingReady !== false,
      includedTrainingClips: records.length,
      excludedClipsCount: records.excludedRecords?.length || 0,
      excludedClips: records.excludedRecords || []
    }
  };
  archive.append(JSON.stringify(enrichedReport, null, 2), { name: 'validation_report.json' });

  // 3. audio/ files
  for (const r of records) {
    if (r.existsOnDisk) {
      archive.file(r.sourceWavPath, { name: `audio/${r.audioFile}` });
    }
  }

  await archive.finalize();
}
