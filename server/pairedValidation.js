import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllSamples } from './datasetService.js';
import { REQUIRED_EMOTIONS, evaluateQcConfidence } from './pairedEmotionConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Normalizes Kurdish text for checking text uniformity within a family.
 */
function normalizeForComparison(t) {
  if (!t || typeof t !== 'string') return '';
  return t
    .replace(/[\[\]\(\)\{\}\u200C\u200B\s]+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Validates the entire dataset for Paired Emotion requirements.
 */
export async function validatePairedDataset(customSamples = null) {
  const samples = customSamples || (await getAllSamples());
  const requiredEmotionsList = REQUIRED_EMOTIONS.map(e => e.id);

  const familiesMap = new Map();

  for (const s of samples) {
    // Determine family_id (from field or fallback from id pattern e.g. spk01_001_neutral)
    let fId = s.family_id || s.customMetadata?.family_id || s.metadata_extra?.family_id;
    if (!fId && typeof s.id === 'string') {
      const match = s.id.match(/^([a-zA-Z0-9]+_\d{3,4})_[a-zA-Z0-9_]+$/);
      if (match) fId = match[1];
    }

    if (!fId) continue; // Skip non-paired samples

    if (!familiesMap.has(fId)) {
      familiesMap.set(fId, []);
    }
    familiesMap.get(fId).push(s);
  }

  const familyReports = [];
  let validFamiliesCount = 0;
  let incompleteFamiliesCount = 0;
  let errorCount = 0;
  let totalPairedClips = 0;
  let totalPassClips = 0;
  let totalWarningClips = 0;
  let totalFailClips = 0;

  for (const [fId, familySamples] of familiesMap.entries()) {
    totalPairedClips += familySamples.length;
    const issues = [];
    const missingEmotions = [];

    // 1. Check speakers uniformity
    const speakers = new Set();
    for (const s of familySamples) {
      const spk = s.speaker_name || s.customMetadata?.speaker_name || s.voice_name || 'unknown';
      speakers.add(spk);
    }
    const primarySpeaker = Array.from(speakers)[0];
    if (speakers.size > 1) {
      issues.push(`Mismatched speakers inside family: ${Array.from(speakers).join(', ')}`);
    }

    // 2. Check text uniformity and empty transcripts
    const textNorms = new Set();
    let sampleText = '';
    for (const s of familySamples) {
      const rawText = (s.text || '').trim();
      if (!rawText) {
        issues.push(`Clip ${s.id} has an empty transcript`);
      } else {
        if (!sampleText) sampleText = rawText;
        textNorms.add(normalizeForComparison(rawText));
      }
    }
    if (textNorms.size > 1) {
      issues.push('Text differs across emotion variations in this family');
    }

    // 3. Check physical audio file existence on disk
    for (const s of familySamples) {
      const wavPath = path.join(DATASET_ROOT, `${s.id}.wav`);
      const existsOnDisk = fs.existsSync(wavPath);
      if (!existsOnDisk && !s.hasAudio) {
        issues.push(`Audio file missing on disk: ${s.id}.wav`);
      }
    }

    // 4. Check presence of all required emotions
    const presentEmotions = new Set();
    const emotionClipMap = {};

    for (const s of familySamples) {
      const emo = String(s.emotion || 'neutral').toLowerCase().trim();
      presentEmotions.add(emo);
      emotionClipMap[emo] = {
        id: s.id,
        intensity: s.emotion_intensity ?? s.customMetadata?.emotion_intensity ?? 0.8,
        audioUrl: s.audioUrl || `/api/dataset/${s.id}/audio`
      };
    }

    for (const reqEmo of requiredEmotionsList) {
      if (!presentEmotions.has(reqEmo)) {
        missingEmotions.push(reqEmo);
      }
    }

    // 5. Check QC Confidence, Waveform Boundaries & Training-Readiness:
    // >= 0.85        PASS
    // 0.70 - 0.849   WARNING / review
    // < 0.70         FAIL — do not mark training-ready
    // AND leading_silence_ms <= 250, trailing_silence_ms <= 300, speech_start_clipped !== true
    let familyQcGrade = 'PASS';
    for (const s of familySamples) {
      const conf = Number(s.segmentation_confidence ?? s.customMetadata?.segmentation_confidence ?? 1.0);
      const bMetrics = s.boundary_metrics || s.customMetadata?.boundary_metrics || null;
      const qc = evaluateQcConfidence(conf, bMetrics);
      const isTrainingReady = (s.training_ready !== undefined && s.training_ready !== null)
        ? Boolean(s.training_ready)
        : (s.customMetadata?.training_ready !== undefined ? Boolean(s.customMetadata.training_ready) : qc.training_ready);

      if (qc.status === 'FAIL' || !isTrainingReady || conf < 0.70 || qc.boundaryPass === false) {
        familyQcGrade = 'FAIL';
        totalFailClips++;
        const failReason = (qc.boundaryIssues && qc.boundaryIssues.length > 0)
          ? qc.boundaryIssues.join('; ')
          : `confidence check (${conf.toFixed(2)} < 0.70)`;
        issues.push(`Clip ${s.id} failed QC (${failReason}) — FAIL / not training-ready`);
      } else if (qc.status === 'WARNING') {
        if (familyQcGrade !== 'FAIL') familyQcGrade = 'WARNING';
        totalWarningClips++;
      } else {
        totalPassClips++;
      }
    }

    const isComplete = missingEmotions.length === 0;
    const hasFatalIssues = issues.length > 0;

    let status = 'valid';
    if (hasFatalIssues) {
      status = 'invalid';
      errorCount++;
    } else if (!isComplete) {
      status = 'incomplete';
      incompleteFamiliesCount++;
    } else {
      validFamiliesCount++;
    }

    familyReports.push({
      familyId: fId,
      speaker: primarySpeaker,
      text: sampleText,
      status,
      qcGrade: familyQcGrade,
      trainingReady: familyQcGrade !== 'FAIL',
      presentCount: familySamples.length,
      requiredCount: requiredEmotionsList.length,
      presentEmotions: Array.from(presentEmotions),
      missingEmotions,
      emotionClipMap,
      issues
    });
  }

  // Sort reports by familyId ascending
  familyReports.sort((a, b) => a.familyId.localeCompare(b.familyId));

  const totalFamilies = familiesMap.size;
  const isAllValid = totalFamilies > 0 && errorCount === 0 && incompleteFamiliesCount === 0;

  return {
    timestamp: new Date().toISOString(),
    totalFamilies,
    validFamiliesCount,
    incompleteFamiliesCount,
    errorCount,
    totalPairedClips,
    qcSummary: {
      passClips: totalPassClips,
      warningClips: totalWarningClips,
      failClips: totalFailClips,
      trainingReadyClips: totalPassClips + totalWarningClips
    },
    requiredEmotions: requiredEmotionsList,
    isCompliant: isAllValid,
    completionPercentage: totalFamilies > 0 ? Math.round((validFamiliesCount / totalFamilies) * 100) : 0,
    families: familyReports
  };
}
