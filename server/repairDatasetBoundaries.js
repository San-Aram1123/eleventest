import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { refineWavSlice, parseWavPcm, detectSpeechBoundaries } from './waveformBoundaryRefiner.js';
import { evaluateQcConfidence } from './pairedEmotionConfig.js';
import { updateDbSampleMetadata, isDbConnected } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Runs dataset-wide waveform boundary audit and repair.
 * Refines leading/trailing silence on all paired/sliced audio clips,
 * backs up originals, updates sidecar metadata, and produces an audit report.
 */
export async function repairDatasetBoundaries(options = {}) {
  const { dryRun = false, forceAll = false } = options;

  if (!fs.existsSync(DATASET_ROOT)) {
    return { error: 'Dataset directory does not exist', totalClips: 0 };
  }

  const backupDir = path.join(DATASET_ROOT, '.boundary_backup');
  if (!dryRun && !fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const allFiles = fs.readdirSync(DATASET_ROOT);
  const wavFiles = allFiles.filter(f => f.toLowerCase().endsWith('.wav') && !f.startsWith('.'));

  const stats = {
    totalClips: 0,
    alreadyValid: 0,
    repaired: 0,
    stillRequiringReview: 0,
    clippedStarts: 0,
    clippedEnds: 0,
    whisperClipsReviewed: 0,
    leadingBeforeList: [],
    leadingAfterList: [],
    trailingBeforeList: [],
    trailingAfterList: [],
    distributionsBefore: {
      '0-100ms': 0,
      '100-200ms': 0,
      '200-250ms': 0,
      '250-500ms': 0,
      '500-1000ms': 0,
      '>1000ms': 0
    },
    distributionsAfter: {
      '0-100ms': 0,
      '100-200ms': 0,
      '200-250ms': 0,
      '250-500ms': 0,
      '500-1000ms': 0,
      '>1000ms': 0
    },
    repairedClipsList: []
  };

  function getBucket(ms) {
    if (ms <= 100) return '0-100ms';
    if (ms <= 200) return '100-200ms';
    if (ms <= 250) return '200-250ms';
    if (ms <= 500) return '250-500ms';
    if (ms <= 1000) return '500-1000ms';
    return '>1000ms';
  }

  for (const wavFile of wavFiles) {
    const wavPath = path.join(DATASET_ROOT, wavFile);
    const sampleId = wavFile.replace(/\.wav$/i, '');
    const jsonPath = path.join(DATASET_ROOT, `${sampleId}.json`);

    let sidecar = {};
    if (fs.existsSync(jsonPath)) {
      try {
        sidecar = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (_) {}
    }

    const emotion = String(sidecar.emotion || '').toLowerCase();
    const isWhisper = emotion === 'whisper';
    if (isWhisper) stats.whisperClipsReviewed++;

    let wavBuf;
    try {
      wavBuf = fs.readFileSync(wavPath);
    } catch (_) {
      continue;
    }

    let parsed;
    try {
      parsed = parseWavPcm(wavBuf);
    } catch (_) {
      continue;
    }

    stats.totalClips++;

    // Measure BEFORE
    const boundsBefore = detectSpeechBoundaries(parsed.samples, parsed.sampleRate, { isWhisper });
    const leadingBefore = Math.round(boundsBefore.detectedStartMs);
    const trailingBefore = Math.max(0, Math.round(boundsBefore.totalDurMs - boundsBefore.detectedEndMs));

    stats.leadingBeforeList.push(leadingBefore);
    stats.trailingBeforeList.push(trailingBefore);
    stats.distributionsBefore[getBucket(leadingBefore)]++;

    const needsRepair = forceAll || (leadingBefore > 200) || (trailingBefore > 260);

    let finalLeading = leadingBefore;
    let finalTrailing = trailingBefore;
    let bMetrics = null;

    if (needsRepair && boundsBefore.hasSpeech) {
      const refinement = refineWavSlice(wavBuf, { isWhisper, emotion });
      bMetrics = refinement.boundaryMetrics;

      if (refinement.boundaryMetrics.was_trimmed) {
        finalLeading = bMetrics.leading_silence_ms;
        finalTrailing = bMetrics.trailing_silence_ms;

        if (!dryRun) {
          // Backup original once
          const backupPath = path.join(backupDir, wavFile);
          if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(wavPath, backupPath);
          }
          // Overwrite with refined audio
          fs.writeFileSync(wavPath, refinement.refinedBuffer);
        }

        stats.repaired++;
        stats.repairedClipsList.push({
          sampleId,
          leadingBefore,
          leadingAfter: finalLeading,
          trailingBefore,
          trailingAfter: finalTrailing,
          savedMs: (leadingBefore - finalLeading) + (trailingBefore - finalTrailing)
        });
      } else {
        stats.alreadyValid++;
      }
    } else {
      stats.alreadyValid++;
    }

    stats.leadingAfterList.push(finalLeading);
    stats.trailingAfterList.push(finalTrailing);
    stats.distributionsAfter[getBucket(finalLeading)]++;

    if (bMetrics?.speech_start_clipped) stats.clippedStarts++;
    if (bMetrics?.speech_end_clipped) stats.clippedEnds++;

    // Update metadata sidecar
    if (!dryRun && fs.existsSync(jsonPath)) {
      try {
        const segConf = Number(sidecar.segmentation_confidence ?? sidecar.customMetadata?.segmentation_confidence ?? 1.0);
        const qcEval = evaluateQcConfidence(segConf, bMetrics || {
          leading_silence_ms: finalLeading,
          trailing_silence_ms: finalTrailing,
          speech_start_clipped: false,
          speech_end_clipped: false
        });

        sidecar.training_ready = qcEval.training_ready;
        sidecar.qc_status = qcEval.status;
        sidecar.qc_grade = qcEval.grade;
        if (!sidecar.customMetadata) sidecar.customMetadata = {};
        sidecar.customMetadata.training_ready = qcEval.training_ready;
        sidecar.customMetadata.qc_status = qcEval.status;
        sidecar.customMetadata.qc_grade = qcEval.grade;
        sidecar.customMetadata.leading_silence_ms = finalLeading;
        sidecar.customMetadata.trailing_silence_ms = finalTrailing;
        if (bMetrics) {
          sidecar.customMetadata.boundary_metrics = bMetrics;
          sidecar.customMetadata.was_waveform_trimmed = bMetrics.was_trimmed;
        }

        if (!qcEval.training_ready) {
          stats.stillRequiringReview++;
        }

        fs.writeFileSync(jsonPath, JSON.stringify(sidecar, null, 2));

        if (isDbConnected()) {
          updateDbSampleMetadata(sampleId, {
            training_ready: qcEval.training_ready ? 1 : 0,
            qc_status: qcEval.status,
            customMetadata: JSON.stringify(sidecar.customMetadata)
          }).catch(() => {});
        }
      } catch (_) {}
    }
  }

  // Calculate averages & maximums
  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const max = (arr) => arr.length ? Math.max(...arr) : 0;

  const report = {
    totalClips: stats.totalClips,
    alreadyValid: stats.alreadyValid,
    repaired: stats.repaired,
    stillRequiringReview: stats.stillRequiringReview,
    whisperClipsReviewed: stats.whisperClipsReviewed,
    clippedStarts: stats.clippedStarts,
    clippedEnds: stats.clippedEnds,
    averageLeadingSilenceBeforeMs: avg(stats.leadingBeforeList),
    averageLeadingSilenceAfterMs: avg(stats.leadingAfterList),
    maximumLeadingSilenceBeforeMs: max(stats.leadingBeforeList),
    maximumLeadingSilenceAfterMs: max(stats.leadingAfterList),
    averageTrailingSilenceBeforeMs: avg(stats.trailingBeforeList),
    averageTrailingSilenceAfterMs: avg(stats.trailingAfterList),
    distributionsBefore: stats.distributionsBefore,
    distributionsAfter: stats.distributionsAfter,
    dryRun
  };

  printAuditReport(report);
  return report;
}

/**
 * Formats and prints the Section 19 audit report to stdout.
 */
export function printAuditReport(r) {
  console.log('\n========================================================');
  console.log('       DATASET WAVEFORM BOUNDARY AUDIT REPORT');
  console.log('========================================================');
  console.log(`Total clips analyzed:           ${r.totalClips}`);
  console.log(`Clips already valid:            ${r.alreadyValid}`);
  console.log(`Clips repaired:                 ${r.repaired}`);
  console.log(`Clips still requiring review:   ${r.stillRequiringReview}`);
  console.log(`Whisper clips reviewed:         ${r.whisperClipsReviewed}`);
  console.log(`Potentially clipped starts:     ${r.clippedStarts}`);
  console.log(`Potentially clipped ends:       ${r.clippedEnds}\n`);

  console.log(`Average leading silence BEFORE: ${r.averageLeadingSilenceBeforeMs} ms`);
  console.log(`Average leading silence AFTER:  ${r.averageLeadingSilenceAfterMs} ms`);
  console.log(`Maximum leading silence BEFORE: ${r.maximumLeadingSilenceBeforeMs} ms`);
  console.log(`Maximum leading silence AFTER:  ${r.maximumLeadingSilenceAfterMs} ms`);
  console.log(`Average trailing silence BEFORE: ${r.averageTrailingSilenceBeforeMs} ms`);
  console.log(`Average trailing silence AFTER:  ${r.averageTrailingSilenceAfterMs} ms\n`);

  console.log('--- LEADING SILENCE DISTRIBUTION (BEFORE vs AFTER) ---');
  const buckets = ['0-100ms', '100-200ms', '200-250ms', '250-500ms', '500-1000ms', '>1000ms'];
  for (const b of buckets) {
    const beforeCount = r.distributionsBefore[b] || 0;
    const afterCount = r.distributionsAfter[b] || 0;
    console.log(`  ${b.padEnd(10)}: ${String(beforeCount).padStart(5)} clips  ➜  ${String(afterCount).padStart(5)} clips`);
  }
  console.log('========================================================\n');
}

// Allow standalone execution from CLI
if (process.argv[1] && process.argv[1].endsWith('repairDatasetBoundaries.js')) {
  const isDry = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');
  repairDatasetBoundaries({ dryRun: isDry, forceAll: isForce })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Repair error:', err);
      process.exit(1);
    });
}
