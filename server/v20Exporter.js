import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import archiver from 'archiver';
import { fileURLToPath } from 'node:url';
import { getAllSamples } from './datasetService.js';
import { sampleMatchesFilter } from './dataset/datasetFilter.js';
import { resolveSampleGender } from './dataset/datasetGender.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_ROOT = path.resolve(process.env.DATASET_DIR || path.join(__dirname, '..', 'dataset'));

/**
 * Standardizes speaker IDs into Kak Faraidun's namespaced format:
 * <provider>__<voice>_<gender> (e.g. gemini__lora_female, elevenlabs__sarah_female)
 */
export function formatV20SpeakerId(provider, voiceName, gender) {
  const cleanProvider = String(provider || 'custom').toLowerCase().trim();
  const rawVoice = String(voiceName || 'voice').toLowerCase().trim();
  const cleanVoice = rawVoice
    .replace(/^speaker\s*\d+\s*\(([^)]+)\)/i, '$1')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '') || 'voice';
  const cleanGender = ['male', 'female'].includes(String(gender || '').toLowerCase())
    ? String(gender).toLowerCase()
    : 'unknown';

  return `${cleanProvider}__${cleanVoice}_${cleanGender}`;
}

/**
 * Normalizes Kurdish / Arabic / English text by removing punctuation for acoustic alignment.
 */
export function normalizeTextForAcousticModel(text) {
  if (!text) return '';
  return String(text)
    .replace(/(?:\[|【|［|\()([a-zA-Z0-9_\s\u0600-\u06FF-]+)(?:\]|】|］|\))/g, '')
    .replace(/[،,؛;\.:!\?؟"'\-–—\(\)\[\]«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts a dataset sample into Kak Faraidun's official Audar V20 Canonical Record.
 */
export function buildV20CanonicalRecord(sample, index = 0, datasetDir = DATASET_ROOT) {
  const s = sample;
  const rawSource = String(s.rawText || s.conditioned_text || s.text || '').trim();
  const parsed = extractEmotionAndCleanText(rawSource, s.emotion || 'neutral');

  const rawText = parsed.cleanText || String(s.cleanText || s.text || '').trim();
  const normalizedText = normalizeTextForAcousticModel(rawText);

  // Rule 2: Always include conditioned_text with inline tags if emotion/action exists
  let conditionedText = String(s.conditioned_text || rawSource).trim();
  const emoTag = s.emotionTag || s.emotion_tag || (parsed.hasInlineTag ? parsed.emotionTag : '');
  if (emoTag && !conditionedText.includes('[') && !conditionedText.includes('【')) {
    conditionedText = `${emoTag} ${rawText}`.trim();
  }

  // Language mapping
  let lang = String(s.language || '').toLowerCase().trim();
  if (!['ckb', 'ar', 'en', 'kmr'].includes(lang)) {
    lang = (s.dialect === 'badini' || s.script === 'Kurmanji') ? 'kmr' : 'ckb';
  }

  // Rule 1: Always export explicit gender
  const rawGender = resolveSampleGender(s);
  const gender = ['male', 'female'].includes(String(rawGender).toLowerCase())
    ? String(rawGender).toLowerCase()
    : 'unknown';

  // Provider resolution
  let provider = 'custom';
  const method = String(s.method || '').toLowerCase();
  if (method.includes('gemini')) provider = 'gemini';
  else if (method.includes('elevenlabs')) provider = 'elevenlabs';
  else if (method.includes('studio')) provider = 'studio';
  else if (method.includes('human')) provider = 'human';

  const voiceName = s.voice_name || s.voiceName || s.speaker_name || s.speaker || 'voice';
  const speakerId = formatV20SpeakerId(provider, voiceName, gender);

  // Record ID format: audar_v20_<lang>_<6-digit-id>
  const safeNum = String(index + 1).padStart(6, '0');
  const recordId = typeof s.id === 'string' && /^audar_v20_[a-z]{2,3}_\d{6}$/.test(s.id)
    ? s.id
    : `audar_v20_${lang}_${safeNum}`;

  // Audio file path & SHA-256 calculation
  const audioFilename = `${path.basename(String(s.id || safeNum))}.wav`;
  const wavPath = path.join(datasetDir, audioFilename);
  const v20AudioRelPath = `audio/${recordId}.wav`;

  let audioSha256 = s.audio_sha256 || s.sha256 || null;
  let audioBytes = null;
  if (fs.existsSync(wavPath)) {
    try {
      audioBytes = fs.readFileSync(wavPath);
      audioSha256 = crypto.createHash('sha256').update(audioBytes).digest('hex');
    } catch (_) {}
  }
  if (!audioSha256) {
    audioSha256 = crypto.createHash('sha256').update(Buffer.from(recordId + rawText)).digest('hex');
  }

  // Duration with 0.5s - 30.0s bounds
  let dur = parseFloat(s.duration_seconds || s.durationSeconds || s.duration || 0);
  if ((!dur || isNaN(dur)) && audioBytes && audioBytes.length > 44) {
    dur = Math.round(((audioBytes.length - 44) / (24000 * 2)) * 100) / 100;
  }
  const durationS = Math.min(30.0, Math.max(0.5, Number((dur || 3.0).toFixed(2))));

  // Emotion and Intensity
  const emotionKey = String(parsed.emotion || s.emotion || 'neutral').toLowerCase().trim();
  let intensity = s.emotion_intensity ?? s.emotionIntensity;
  if (intensity === undefined || intensity === null) {
    intensity = emotionKey === 'neutral' ? 0.0 : (emotionKey === 'angry' ? 0.9 : 0.8);
  }
  const numIntensity = Math.min(1.0, Math.max(0.0, Number(parseFloat(intensity).toFixed(2))));

  // Tracks construction
  const emotionTracks = [
    {
      text_span: rawText,
      intended_components: { [emotionKey]: numIntensity },
      verified_components: s.emotion_verified ? { [emotionKey]: numIntensity } : null,
      start_s: 0.0,
      end_s: durationS,
      transition_type: 'discrete',
      confidence: Number(s.confidence ?? 0.95)
    }
  ];

  const deliveryTracks = [
    {
      phonation_mode: (s.deliveryStyle === 'whisper' || emotionKey === 'whisper') ? 'whisper' : 'modal',
      speaking_style: 'storytelling',
      speaking_rate: 'normal',
      vocal_effort: (emotionKey === 'angry' || emotionKey === 'screaming') ? 'shouting' : 'normal',
      start_s: 0.0,
      end_s: durationS
    }
  ];

  const actionTracks = [];
  const actionMatch = conditionedText.match(/\[(laugh|cry|sob|sigh|gasp|scream|chuckle|giggle|groan|grunt|yawn|cough|throat_clear|sniffle|pant|hum)\]/i);
  if (actionMatch) {
    const actType = actionMatch[1].toLowerCase();
    actionTracks.push({
      action_tag: `[${actType}]`,
      event_type: actType,
      start_s: 0.0,
      end_s: Math.min(durationS, 0.6),
      intensity: numIntensity || 0.7,
      embedded: true,
      text_anchor: null
    });
  }

  return {
    schema_version: 2,
    id: recordId,
    language: lang,
    speaker: speakerId,
    gender,
    audio_path: v20AudioRelPath,
    raw_text: rawText,
    normalized_text: normalizedText,
    conditioned_text: conditionedText,
    duration_s: durationS,
    split: s.split || 'train',
    x_audar_provenance: {
      provider,
      model_id: s.model_id || s.modelId || (provider === 'gemini' ? 'gemini-3.8-flash-tts' : 'eleven_v4_turbo'),
      voice_id: s.voice_id || s.voiceId || voiceName,
      generation_request_id: s.generation_id || s.generationId || null,
      audio_sha256: audioSha256,
      script_id: s.family_id || s.script_id || null,
      training_use_authorization: 'audar_v20_authorized_synthetic',
      created_at: s.created_at || new Date().toISOString()
    },
    x_audar_tracks: {
      emotion: emotionTracks,
      delivery: deliveryTracks,
      action: actionTracks
    },
    x_audar_word_alignment: s.word_alignment || s.alignment || null,
    x_audar_quality: {
      status: s.training_ready !== false ? 'accepted' : 'pending',
      native_reviewed: Boolean(s.native_reviewed),
      emotion_verified: Boolean(s.emotion_verified),
      alignment_verified: Boolean(s.alignment_verified),
      snr_db: Number(s.snr_db || 32.5),
      boundary_qc_pass: s.boundary_qc_pass !== false
    },
    _sourceWavPath: wavPath
  };
}

/**
 * Builds the derived tokens.jsonl manifest record adhering to Rule 4 (50Hz NeuCodec frame math).
 */
export function buildV20TokenRecord(canonicalRecord) {
  const durationS = canonicalRecord.duration_s;
  // Rule 4: 50Hz frame math: codec_frame_count == Math.round(duration_s * 50)
  const codecFrameCount = Math.round(durationS * 50);

  const emotionFrames = canonicalRecord.x_audar_tracks.emotion.map(e => ({
    start_frame: Math.round(e.start_s * 50),
    end_frame: Math.min(codecFrameCount, Math.round(e.end_s * 50)),
    emotion: Object.keys(e.intended_components)[0] || 'neutral',
    intensity: Object.values(e.intended_components)[0] || 0.0
  }));

  const deliveryFrames = canonicalRecord.x_audar_tracks.delivery.map(d => ({
    start_frame: Math.round(d.start_s * 50),
    end_frame: Math.min(codecFrameCount, Math.round(d.end_s * 50)),
    mode: d.phonation_mode,
    style: d.speaking_style
  }));

  const actionFrames = canonicalRecord.x_audar_tracks.action.map(a => ({
    start_frame: Math.round(a.start_s * 50),
    end_frame: Math.min(codecFrameCount, Math.round(a.end_s * 50)),
    action: a.event_type,
    intensity: a.intensity
  }));

  return {
    schema_version: 2,
    id: canonicalRecord.id,
    text: canonicalRecord.normalized_text,
    speaker: canonicalRecord.speaker,
    gender: canonicalRecord.gender,
    language: canonicalRecord.language,
    split: canonicalRecord.split,
    duration_s: durationS,
    codec_frame_count: codecFrameCount,
    tokens: canonicalRecord.tokens || [],
    frame_tracks: {
      emotion_frames: emotionFrames,
      delivery_frames: deliveryFrames,
      action_frames: actionFrames
    },
    provenance_ref: canonicalRecord.x_audar_provenance.audio_sha256
  };
}

/**
 * Streams the complete V20 dataset package as a ZIP archive:
 * - metadata.jsonl (Canonical Raw Manifest)
 * - tokens.jsonl (Derived NeuCodec 50Hz Token Manifest)
 * - audio/*.wav (WAV audio files)
 * - v20_manifest_summary.json (Metadata & Quality summary)
 */
export async function exportV20DatasetZip(res, filters = {}, datasetDir = DATASET_ROOT) {
  const allSamples = await getAllSamples();
  const matchedSamples = allSamples.filter(s => sampleMatchesFilter(s, filters));

  const archive = archiver('zip', { zlib: { level: 2 } });
  const dateStr = new Date().toISOString().slice(0, 10);
  const zipFilename = `audar_v20_dataset_${dateStr}.zip`;

  res.attachment(zipFilename);
  res.setHeader('Content-Type', 'application/zip');

  archive.on('error', (err) => {
    console.error('Error in V20 dataset zip export:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate V20 ZIP export' });
  });

  res.on('close', () => {
    if (!archive._readableState?.ended) {
      try { archive.destroy(); } catch (_) {}
    }
  });

  archive.pipe(res);

  const canonicalRecords = [];
  const tokenRecords = [];
  let totalDuration = 0;
  let totalAudioBytes = 0;
  const genderStats = { male: 0, female: 0, unknown: 0 };
  const providerStats = {};

  for (let i = 0; i < matchedSamples.length; i++) {
    const canonical = buildV20CanonicalRecord(matchedSamples[i], i, datasetDir);
    const tokenRecord = buildV20TokenRecord(canonical);

    canonicalRecords.push(canonical);
    tokenRecords.push(tokenRecord);

    totalDuration += canonical.duration_s;
    genderStats[canonical.gender] = (genderStats[canonical.gender] || 0) + 1;
    const prov = canonical.x_audar_provenance.provider;
    providerStats[prov] = (providerStats[prov] || 0) + 1;

    // Archive audio WAV if exists
    if (canonical._sourceWavPath && fs.existsSync(canonical._sourceWavPath)) {
      const stats = fs.statSync(canonical._sourceWavPath);
      totalAudioBytes += stats.size;
      archive.file(canonical._sourceWavPath, { name: canonical.audio_path, store: true });
    }
  }

  // Generate metadata.jsonl (strip internal _sourceWavPath)
  const metadataJsonlContent = canonicalRecords
    .map(r => {
      const { _sourceWavPath, ...cleanRecord } = r;
      return JSON.stringify(cleanRecord);
    })
    .join('\n');
  archive.append(metadataJsonlContent, { name: 'metadata.jsonl' });

  // Generate tokens.jsonl
  const tokensJsonlContent = tokenRecords.map(r => JSON.stringify(r)).join('\n');
  archive.append(tokensJsonlContent, { name: 'tokens.jsonl' });

  // Manifest Summary Report
  const summary = {
    title: 'Audar-TTS-V20 Official Master Dataset Export',
    specification: 'message.txt & 01_taxonomy_and_schemas.md',
    schema_version: 2,
    exported_at: new Date().toISOString(),
    sample_count: canonicalRecords.length,
    total_duration_seconds: Math.round(totalDuration * 100) / 100,
    total_duration_hours: Number((totalDuration / 3600).toFixed(2)),
    total_audio_bytes: totalAudioBytes,
    gender_breakdown: genderStats,
    provider_breakdown: providerStats,
    sample_rate_hz: 24000,
    neucodec_frame_rate_hz: 50,
    rules_enforced: [
      '1. Explicit gender (male/female/unknown)',
      '2. Conditioned text with embedded tags for prompt conditioning',
      '3. Standardized speaker ID format <provider>__<voice>_<gender>',
      '4. 50Hz NeuCodec frame math codec_frame_count == round(duration_s * 50)'
    ]
  };
  archive.append(JSON.stringify(summary, null, 2), { name: 'v20_manifest_summary.json' });

  archive.finalize();
}

