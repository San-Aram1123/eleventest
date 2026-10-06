import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateGeminiSpeech } from './geminiService.js';
import { saveSample } from './datasetService.js';
import {
  getEmotionPromptDirective,
  getEmotionSpeechStyle,
  REQUIRED_EMOTIONS,
  EMOTION_PROFILE_VERSION,
  SLICER_VERSION,
  EMOTION_STYLE_PROFILES,
  evaluateQcConfidence,
  injectMidSentenceLaugh
} from './pairedEmotionConfig.js';
import { buildFamilyId, buildClipId } from './pairedBatchService.js';
import { detectWhisperSegments, sliceAudioBySegments } from './markerAlignmentService.js';

export const orderEmotionsForSlicing = (emotions) => [
  ...emotions.filter(e => (e.emotion || e.id || e).toLowerCase() !== 'whisper'),
  ...emotions.filter(e => (e.emotion || e.id || e).toLowerCase() === 'whisper')
];

let masterAudioHistory = [];

export function pushMasterAudioTake(info) {
  masterAudioHistory.unshift(info);
  if (masterAudioHistory.length > 15) {
    masterAudioHistory.pop();
  }
}

export function getMasterAudioHistory() {
  return masterAudioHistory;
}

export function getMasterAudioById(id) {
  if (!id) return masterAudioHistory[0] || null;
  return masterAudioHistory.find(item => item.id === id) || null;
}

export function clearMasterAudioHistory() {
  masterAudioHistory = [];
}

export function setLatestMasterAudio(info) {
  pushMasterAudioTake(info);
}

export function getLatestMasterAudio() {
  return masterAudioHistory[0] || null;
}

/**
 * Builds an optimized multi-sentence prompt for one emotion with Gemini 3.8 <long pause> separators.
 * Constructs structured parts with native speech_metadata.style.
 */
export function buildTransposedBatchPrompt(sentences, emotion, intensity = 0.8, language = 'ckb', slicingStrategy = 'silence') {
  const isBadini = language === 'kmr';
  const targetLang = language || (isBadini ? 'kmr' : 'ckb');
  const styleDirective = getEmotionSpeechStyle(emotion, intensity, targetLang);
  const englishNums = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

  const isCackle = String(emotion || '').toLowerCase() === 'cackle' || String(emotion || '').toLowerCase() === 'laugh';

  // For cackle/laugh, automatically inject [laugh] in the middle of sentences if not already present
  const preparedSentences = (sentences || []).map(s => {
    const trimmed = String(s || '').trim();
    return isCackle ? injectMidSentenceLaugh(trimmed) : trimmed;
  });

  let speechParts;
  let legacyPrompt;

  if (slicingStrategy === 'markers') {
    // Spoken markers format
    speechParts = preparedSentences.map((s, idx) => {
      const marker = `Marker ${englishNums[idx] || (idx + 1)}`;
      const text = `${marker}: ${s}`;
      const partStyle = `${styleDirective}. Pronounce "${marker}:" in clear, neutral English, then speak the Kurdish sentence in the requested emotional style without omitting any words.`;
      return {
        text,
        style: partStyle,
        speech_metadata: { style: partStyle }
      };
    });

    legacyPrompt = preparedSentences.map((s, idx) => {
      const marker = `Marker ${englishNums[idx] || (idx + 1)}`;
      return `${marker}: ${s}`;
    }).join('\n\n');
  } else {
    // Acoustic silence format with <long pause>
    speechParts = preparedSentences.map((s, idx) => {
      const text = idx < preparedSentences.length - 1 ? `${s} <long pause>` : s;
      return {
        text,
        style: styleDirective,
        speech_metadata: { style: styleDirective }
      };
    });

    legacyPrompt = preparedSentences.map((s, idx) => {
      return idx < preparedSentences.length - 1 ? `${s} <long pause>` : s;
    }).join('\n');
  }

  let instruction = getEmotionPromptDirective(emotion, intensity, targetLang);
  if (isCackle) {
    instruction += " When you encounter [laugh], laugh or chuckle naturally out loud mid-sentence without pronouncing the bracketed word, and continue speaking in a lively, amused cackling tone.";
  }
  if (slicingStrategy === 'markers') {
    instruction += " Pronounce each English marker (Marker One, Marker Two, ...) clearly, crisply, and neutrally. Immediately after each marker, speak the Kurdish sentence in the requested emotional style without omitting any words.";
  } else {
    instruction += " Speak each Kurdish sentence naturally in the requested emotional style without omitting any words. Pause clearly between sentences.";
  }

  return {
    speechParts,
    styleDirective,
    prompt: legacyPrompt,
    instruction
  };
}

/**
 * Synthesizes a batch of sentences for ONE emotion in 1 Gemini call,
 * segments them via faster-whisper VAD (650ms min silence), and maps to deterministic family_ids.
 * Strictly never falls back to 1:1 individual requests per project policy.
 */
export async function generateTransposedEmotionBatch({
  speakerId = 'spk01',
  voiceName = 'Puck',
  dialect = 'sorani',
  language = 'ckb',
  sentences = [],
  startIdx = 1,
  emotion = 'neutral',
  intensity = 0.8,
  model = 'gemini-3.8-flash-tts',
  apiKey = '',
  slicingStrategy = 'silence'
}) {
  const cleanSentences = (sentences || []).map(s => String(s || '').trim()).filter(Boolean);
  if (cleanSentences.length === 0) {
    throw new Error('At least one sentence is required for batch generation.');
  }

  const targetEmotion = String(emotion || 'neutral').toLowerCase();
  const numIntensity = Math.max(0.0, Math.min(1.0, parseFloat(intensity) || 0.8));

  let tempMaster = null;
  try {
    const { speechParts, styleDirective, prompt, instruction } = buildTransposedBatchPrompt(
      cleanSentences,
      targetEmotion,
      numIntensity,
      language,
      slicingStrategy
    );
    console.log(`[Transposed Batch] Synthesizing ${cleanSentences.length} sentences for emotion "${targetEmotion}" with voice "${voiceName}" (strategy: ${slicingStrategy})...`);

    const genResult = await generateGeminiSpeech({
      speechParts,
      speechStyle: styleDirective,
      text: prompt,
      voiceName,
      dialect: language === 'kmr' ? 'badini' : 'sorani',
      promptInstruction: instruction,
      apiKey,
      model
    });

    if (!genResult.audioBuffer || genResult.audioBuffer.length < 8000) {
      throw new Error('[Transposed Batch] Gemini returned an empty or invalid audio stream.');
    }

    tempMaster = path.resolve(os.tmpdir(), `transposed_master_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.wav`);
    fs.writeFileSync(tempMaster, genResult.audioBuffer);

    // Cache master audio in memory history for user preview (NOT saved to dataset folder)
    const masterTakeId = `master_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    pushMasterAudioTake({
      id: masterTakeId,
      audioBuffer: genResult.audioBuffer,
      emotion: targetEmotion,
      voiceName,
      speakerId,
      sentenceCount: cleanSentences.length,
      model: genResult.modelId || model,
      audioBytes: genResult.audioBuffer.length,
      createdAt: Date.now()
    });

    // Step 1: Detect sentence segments using chosen strategy (kurdish_align, markers, or silence)
    console.log(`[Transposed Batch] Segmenting audio with strategy "${slicingStrategy}" (expecting ${cleanSentences.length} sentences)...`);
    const segResult = await detectWhisperSegments(tempMaster, cleanSentences.length, { slicingStrategy, sentences: cleanSentences });

    const segConfidence = Number(segResult.confidence || 0.95);
    if (!segResult.success || segResult.hasOutlier || segConfidence < 0.70) {
      const errReason = segResult.error || segResult.outlierReason || `Segmentation confidence too low (${segConfidence})`;
      console.error(`[Transposed Batch] Slicing QC failed: ${errReason}`);
      throw new Error(`[Transposed Batch] Slicing aborted: ${errReason}`);
    }

    // Step 2: Slice audio buffers per segment with automatic waveform boundary refinement
    const slicedBuffers = await sliceAudioBySegments(tempMaster, segResult.segments, {
      isWhisper: targetEmotion === 'whisper',
      emotion: targetEmotion
    });
    const allValid = slicedBuffers.length === cleanSentences.length && slicedBuffers.every(b => b && b.length > 3000);
    if (!allValid) {
      throw new Error('[Transposed Batch] Slicing validation failed: audio buffers too small.');
    }

    // Guardrail: Disallow merged runaway takes or dropped takes (adaptive based on word count & emotion)
    for (let i = 0; i < slicedBuffers.length; i++) {
      const bMetrics = slicedBuffers.sliceMetrics?.[i];
      const dur = bMetrics?.final_duration_seconds || segResult.segments[i]?.duration || 0;
      const wordCount = (cleanSentences[i] || '').split(/\s+/).filter(Boolean).length;
      // Generous ceiling to accommodate emotional delivery (sad, crying, laughing pauses) & long text
      const maxAllowedDur = Math.max(32.0, wordCount * 2.2 + 8.0);
      if (dur > maxAllowedDur) {
        throw new Error(`[Transposed Batch] Slicing validation failed: Clip ${i + 1} duration is ${dur.toFixed(2)}s (> ${maxAllowedDur.toFixed(1)}s, multiple sentences merged). Aborting take.`);
      }
      if (dur < 0.6) {
        throw new Error(`[Transposed Batch] Slicing validation failed: Clip ${i + 1} duration is ${dur.toFixed(2)}s (< 0.6s, sentence dropped by Gemini). Aborting take.`);
      }
    }

    // Save samples with deterministic family_id
    const savedSamples = [];
    for (let i = 0; i < cleanSentences.length; i++) {
      const sentenceText = cleanSentences[i];
      const sentenceIndex = startIdx + i;
      const fId = buildFamilyId(speakerId, sentenceIndex);
      const clipId = buildClipId(fId, targetEmotion);
      const bMetrics = slicedBuffers.sliceMetrics?.[i] || null;
      const segDuration = bMetrics?.final_duration_seconds || segResult.segments[i]?.duration || 0;

      // Combined evaluation per clip: segmentation confidence + waveform boundary quality
      const clipQcEval = evaluateQcConfidence(segConfidence, bMetrics);

      const sample = await saveSample({
        id: clipId,
        family_id: fId,
        emotion_intensity: numIntensity,
        speaker_name: speakerId,
        text: sentenceText,
        dialect: language === 'kmr' ? 'badini' : 'sorani',
        language,
        emotion: targetEmotion,
        emotionTag: `[${targetEmotion}]`,
        method: 'gemini_api',
        voiceId: `gemini_${voiceName}`,
        voiceName: `Gemini (${voiceName})`,
        modelId: genResult.modelId || model,
        characters: [],
        audioBuffer: slicedBuffers[i],
        allowDuplicateText: true,
        training_ready: clipQcEval.training_ready,
        qc_status: clipQcEval.status,
        qc_grade: clipQcEval.grade,
        customMetadata: {
          family_id: fId,
          speaker_name: speakerId,
          emotion_intensity: numIntensity,
          duration_seconds: segDuration,
          language,
          rendered_tts_text: (targetEmotion === 'cackle' || targetEmotion === 'laugh' ? injectMidSentenceLaugh(sentenceText) : sentenceText) + (i < cleanSentences.length - 1 ? ' <long pause>' : ''),
          speech_style: EMOTION_STYLE_PROFILES[targetEmotion]?.style || targetEmotion,
          vocal_events: (targetEmotion === 'cackle' || targetEmotion === 'laugh') ? ['[laugh]'] : [],
          segmentation_strategy: segResult.strategy || slicingStrategy || 'gemini38_long_pause',
          segmentation_confidence: segConfidence,
          boundary_metrics: bMetrics,
          leading_silence_ms: bMetrics?.leading_silence_ms ?? 0,
          trailing_silence_ms: bMetrics?.trailing_silence_ms ?? 0,
          boundary_qc_pass: bMetrics?.boundary_qc_pass ?? true,
          was_waveform_trimmed: bMetrics?.was_trimmed ?? false,
          qc_status: clipQcEval.status,
          qc_grade: clipQcEval.grade,
          training_ready: clipQcEval.training_ready,
          review_required: clipQcEval.review_required,
          has_duration_outlier: !!segResult.hasOutlier,
          outlier_reason: segResult.outlierReason || null,
          qc_metrics: segResult.qcMetrics || null,
          emotion_profile_version: EMOTION_PROFILE_VERSION,
          slicer_version: SLICER_VERSION,
          batch_size: cleanSentences.length,
          batch_position: i + 1,
          model: genResult.modelId || model,
          api_generation_mode: 'transposed_emotion_batch',
          generator: `Gemini Transposed Batch (${genResult.modelId || model}) - Paired Emotion Mode`,
          audio_filename: `${clipId}.wav`
        }
      });
      savedSamples.push(sample);
    }

    // Overall batch evaluation based on segmentation confidence and clip results
    const overallQcEval = evaluateQcConfidence(segConfidence);
    const allClipsTrainingReady = savedSamples.length > 0 && savedSamples.every(s => s.training_ready !== false);
    const anyClipReviewRequired = savedSamples.some(s => s.review_required === true || s.customMetadata?.review_required === true);

    const finalTrainingReady = overallQcEval.training_ready && allClipsTrainingReady;
    const finalReviewRequired = overallQcEval.review_required || anyClipReviewRequired || !allClipsTrainingReady;

    return {
      success: true,
      emotion: targetEmotion,
      sentenceCount: cleanSentences.length,
      samples: savedSamples,
      qcStatus: overallQcEval.status,
      qcGrade: overallQcEval.grade,
      trainingReady: finalTrainingReady,
      requiresReview: finalReviewRequired,
      confidence: segConfidence,
      quotaSavings: `${Math.round(((cleanSentences.length - 1) / cleanSentences.length) * 100)}%`
    };
  } finally {
    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
    }
  }
}

/**
 * Legacy compatibility export for single sentence calls.
 */
export async function generatePairedFamilySliced(params) {
  return generateTransposedEmotionBatch({
    ...params,
    sentences: [params.sentence],
    emotion: params.emotions?.[0]?.emotion || 'neutral'
  });
}
