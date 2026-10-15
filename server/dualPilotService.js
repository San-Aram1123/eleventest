import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateGeminiSpeech, sanitizeVoice, normalizeMultilingualBidiText, analyzeMultilingualContent } from './geminiService.js';
import { detectLocalSpeakerSegments, validateEngineResult } from './alignment/localSpeakerBridge.js';
import { selectBestEngine } from './contextAuto/selection.js';
import { readPcmWav, slicePcmWav } from './shared/wavPcm.js';
import { getEmotionPromptDirective, getEmotionSpeechStyle } from './pairedEmotionConfig.js';
import { callElevenLabsTTS } from './elevenlabs/ttsClient.js';
import { getKeyPool } from './elevenlabs/keyPoolManager.js';
import { saveSample } from './datasetService.js';
import { getElevenLabsEmotionSettings } from './shared/v20EmotionCatalog.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';

let elevenlabsKeyIndex = 0;

/**
 * Returns the next ElevenLabs key via round-robin rotation.
 */
export function getRotatedElevenLabsKey() {
  const pool = getKeyPool();
  if (!pool || pool.length === 0) {
    throw new Error('No ElevenLabs API keys configured. Please add keys in the Key Pool.');
  }
  const key = pool[elevenlabsKeyIndex % pool.length];
  elevenlabsKeyIndex = (elevenlabsKeyIndex + 1) % pool.length;
  return { key, keyIndex: elevenlabsKeyIndex, totalKeys: pool.length };
}

/**
 * Builds the multi-speaker alternating prompt for Gemini 3.8.
 * Line 0, 2, 4 = Female (Speaker1), Line 1, 3, 5 = Male (Speaker2).
 */
export function buildDualPilotGeminiPrompt(paragraphs, options = {}) {
  const rawParagraphs = paragraphs.map(p => normalizeMultilingualBidiText(String(p || '').trim())).filter(Boolean);
  if (rawParagraphs.length === 0 || rawParagraphs.length > 12) {
    throw new Error('Provide 1 to 12 paragraphs for Gemini batch synthesis.');
  }

  const femaleVoice = sanitizeVoice(options.femaleVoice || 'Aoede');
  const maleVoice = sanitizeVoice(options.maleVoice || 'Puck');
  const baseEmotion = options.emotion || 'neutral';
  const intensity = options.intensity ?? 0.8;
  const language = options.language || (options.dialect === 'badini' ? 'kmr' : 'ckb');
  const delivery = options.deliveryStyle || 'normal';

  let deliveryNote = '';
  if (delivery === 'whisper') {
    deliveryNote = ' Stays strictly whispered, breathy, and unvoiced throughout.';
  } else if (delivery === 'laughing_speech') {
    deliveryNote = ' Speak with bubbling chuckles and laughing speech while keeping words clearly intelligible.';
  }

  // Parse each paragraph for inline tags, prioritizing them over the auto condition emotion
  const parsedParagraphs = rawParagraphs.map((raw) => {
    const parsed = extractEmotionAndCleanText(raw, baseEmotion);
    const paraEmotion = parsed.hasInlineTag ? parsed.emotion : baseEmotion;
    const paraEmotionTag = parsed.hasInlineTag ? parsed.emotionTag : (baseEmotion !== 'neutral' ? `[${baseEmotion}]` : '');
    return {
      rawText: raw,
      cleanText: parsed.cleanText || raw,
      emotion: paraEmotion,
      emotionTag: paraEmotionTag,
      hasInlineTag: parsed.hasInlineTag
    };
  });

  const cleanParagraphs = parsedParagraphs.map(p => p.cleanText);

  const langAnalysis = analyzeMultilingualContent(cleanParagraphs.join(' '));
  const isCodeSwitching = language === 'mixed' || langAnalysis.isMultilingual || (langAnalysis.hasLatin && langAnalysis.hasArabicScript);

  let langLabel = 'Central Kurdish (Sorani)';
  let langIntonation = 'Central Kurdish intonation with authentic Kurdish vowels (ۆ, ێ, ە)';
  let codeSwitchingRule = '';

  if (isCodeSwitching) {
    langLabel = 'multilingual Kurdish, English, and Arabic';
    langIntonation = 'authentic Kurdish intonation, natural English pronunciation, and crisp Arabic phonetics';
    codeSwitchingRule = ' Natural fluid code-switching across Kurdish, English, and Arabic with zero pauses across transitions. Immediately reset to pure authentic Kurdish phonology after Arabic invocations without accent bleed.';
  } else if (language === 'kmr' || options.dialect === 'badini') {
    langLabel = 'Northern Kurdish Badini (Kurmanji)';
    langIntonation = 'Northern Kurdish Badini intonation with authentic regional vowels (ڤ, خ, ح, غ, ۆ, ێ, ە)';
  } else if (language === 'ar') {
    langLabel = 'Modern Standard Arabic';
    langIntonation = 'authentic Arabic phonetics, clear articulation (ع, ح, ص, ض, ط, ظ, ق) and natural cadence';
  } else if (language === 'en') {
    langLabel = 'English';
    langIntonation = 'fluent native English pronunciation, expressive cadence, and natural phrasing';
  }

  const speechParts = parsedParagraphs.map((para, index) => {
    const paraEmotionStyle = options.customStyle || getEmotionSpeechStyle(para.emotion, intensity, language);
    const lineCombinedStyle = `${paraEmotionStyle}.${deliveryNote}${codeSwitchingRule} Maintain natural conversational ${langIntonation}.`;
    return {
      text: para.cleanText,
      speech_metadata: {
        speaker: index % 2 === 0 ? 'Speaker1' : 'Speaker2',
        style: lineCombinedStyle
      }
    };
  });

  const baseDirective = options.customInstruction || getEmotionPromptDirective(baseEmotion, intensity, language);
  const instruction = `You are directing two native ${langLabel} voice actors. Speaker1 (${femaleVoice}, Female) and Speaker2 (${maleVoice}, Male) alternate turns. Deliver every line in order. ${baseDirective}.${deliveryNote}${codeSwitchingRule}`;

  return {
    cleanParagraphs,
    parsedParagraphs,
    cleanSpk1: femaleVoice,
    cleanSpk2: maleVoice,
    speechParts,
    instruction,
    legacyPrompt: speechParts.map(p => `${p.speech_metadata.speaker}: ${p.text}`).join('\n\n'),
    multiSpeakerConfig: {
      speakerVoiceConfigs: [
        { speaker: 'Speaker1', voiceConfig: { prebuiltVoiceConfig: { voiceName: femaleVoice } } },
        { speaker: 'Speaker2', voiceConfig: { prebuiltVoiceConfig: { voiceName: maleVoice } } }
      ]
    }
  };
}

/**
 * Executes a 6-paragraph Gemini batch:
 * 1. Generates 1 continuous master WAV via Gemini 3.8.
 * 2. Runs all local neural speaker slicing engines.
 * 3. Selects the best engine via selectBestEngine.
 * 4. Slices the master WAV into individual takes.
 */
export async function generateGeminiDualPilotBatch(params = {}) {
  const { paragraphs = [], signal } = params;
  if (signal?.aborted) throw new Error('Aborted by user.');

  const targetLanguage = params.language || (params.dialect === 'badini' ? 'kmr' : 'ckb');
  const config = buildDualPilotGeminiPrompt(paragraphs, { ...params, language: targetLanguage });
  const model = 'gemini-3.8-flash-tts'; // Strictly enforced: zero fallback to 2.5 per project rules
  const count = config.cleanParagraphs.length;

  console.log(`\n🟣 [Gemini 3.8 Master] Starting 6-chunk generation:`);
  console.log(`   ├─ Language: ${targetLanguage} | Dialect: ${params.dialect || 'sorani'}`);
  console.log(`   ├─ Emotion: ${params.emotion || 'neutral'} (intensity: ${params.intensity ?? 0.8}) | Delivery: ${params.deliveryStyle || 'normal'}`);
  console.log(`   ├─ Voices: Female="${config.cleanSpk1}" (Speaker1), Male="${config.cleanSpk2}" (Speaker2)`);
  console.log(`   ├─ Paragraphs: ${count} alternating speaker turns`);
  console.log(`   └─ Dispatching to Google Gemini 3.8 Flash TTS...`);

  const generated = await generateGeminiSpeech({
    speechParts: config.speechParts,
    speechStyle: config.instruction,
    text: config.legacyPrompt,
    voiceName: config.cleanSpk1,
    dialect: targetLanguage === 'kmr' ? 'badini' : (params.dialect || 'sorani'),
    promptInstruction: config.instruction,
    apiKey: params.apiKey || '',
    model,
    multiSpeakerConfig: config.multiSpeakerConfig,
    signal
  });

  if (signal?.aborted) throw new Error('Aborted by user.');
  const audioBuffer = generated.audioBuffer;
  const wav = readPcmWav(audioBuffer);

  console.log(`   ✓ [Gemini 3.8] Master WAV received: ${wav.duration.toFixed(2)}s (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`   ├─ Running 7 neural slicing engines across master WAV...`);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'dual_gemini_'));
  const masterPath = path.join(directory, 'master.wav');
  fs.writeFileSync(masterPath, audioBuffer);

  try {
    const count = config.cleanParagraphs.length;
    const detection = await detectLocalSpeakerSegments(masterPath, count, 'all', {}, signal);

    if (signal?.aborted) throw new Error('Aborted by user.');

    const rawEngines = detection.engines || { all: detection };
    const engineResults = {};

    for (const [key, raw] of Object.entries(rawEngines)) {
      const checked = validateEngineResult(raw, count, {}, wav.duration);
      if (checked.success) {
        try {
          const segments = checked.segments.map((seg, idx) => ({
            ...seg,
            start: idx === 0 ? 0 : checked.segments[idx - 1].end,
            end: idx === checked.segments.length - 1 ? wav.duration : seg.end
          }));
          const buffers = await slicePcmWav(audioBuffer, segments);
          checked.buffers = buffers;
          checked.clips = config.parsedParagraphs.map((para, idx) => ({
            index: idx + 1,
            engine: key,
            text: para.cleanText,
            rawText: para.rawText,
            emotion: para.emotion,
            emotionTag: para.emotionTag,
            hasInlineTag: para.hasInlineTag,
            speakerName: idx % 2 === 0 ? config.cleanSpk1 : config.cleanSpk2,
            gender: idx % 2 === 0 ? 'Female' : 'Male',
            start: segments[idx].start,
            end: segments[idx].end,
            duration: segments[idx].end - segments[idx].start,
            audioUrl: `data:audio/wav;base64,${buffers[idx].toString('base64')}`
          }));
        } catch {
          checked.success = false;
        }
      }
      engineResults[key] = checked;
    }

    const selection = selectBestEngine({ engineResults, durationSeconds: wav.duration }, config.cleanParagraphs, {});
    const chosenResult = engineResults[selection.engine];

    if (!chosenResult || !chosenResult.clips || chosenResult.clips.length !== count) {
      throw new Error(`Slicing failed: Best engine ${selection.engine} could not resolve clean segments.`);
    }

    console.log(`   ✓ [Gemini 3.8] Slicing succeeded with engine: [${selection.engine}] (Score: ${selection.score})`);
    console.log(`   └─ Sliced into ${chosenResult.clips.length} individual paragraph clips.\n`);

    // Optionally save sliced takes to Dataset Manager (MySQL & disk)
    if (params.saveToDataset !== false && chosenResult.buffers) {
      for (let i = 0; i < chosenResult.clips.length; i++) {
        const clip = chosenResult.clips[i];
        const clipEmotion = clip.emotion || params.emotion || 'neutral';
        const clipEmotionTag = clip.emotionTag || (clipEmotion !== 'neutral' ? `[${clipEmotion}]` : '');
        try {
          const saved = await saveSample({
            text: clip.text,
            speaker_name: clip.speakerName,
            dialect: targetLanguage === 'kmr' ? 'badini' : (params.dialect || 'sorani'),
            language: targetLanguage,
            emotion: clipEmotion,
            emotion_intensity: params.intensity ?? 0.8,
            emotionTag: clipEmotionTag,
            method: 'gemini_api',
            modelId: model,
            voiceName: clip.speakerName,
            audioBuffer: chosenResult.buffers[i],
            notes: `Dual Pilot V20 (Gemini 3.8 / ${selection.engine})`,
            allowDuplicateText: true
          });
          clip.savedDatasetId = saved.id;
          console.log(`   💾 [Dataset Manager] Registered Gemini clip #${i + 1} as Sample #${saved.id} (Emotion: ${clipEmotion})`);
        } catch (sErr) {
          console.warn(`   ⚠️ [Dataset Manager] Could not save Gemini clip #${i + 1}: ${sErr.message}`);
        }
      }
    }

    return {
      success: true,
      provider: 'gemini',
      modelId: model,
      selectedEngine: selection.engine,
      selectionScore: selection.score,
      selectionReason: selection.reason,
      clips: chosenResult.clips,
      masterAudioUrl: `data:audio/wav;base64,${audioBuffer.toString('base64')}`,
      durationSeconds: wav.duration
    };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

/**
 * Generates an individual paragraph take via ElevenLabs with rotating key pool.
 */
export async function generateElevenLabsDualPilotTake(params = {}) {
  const {
    text,
    voiceId,
    voiceName = 'Eleven Voice',
    modelId = 'eleven_v4_turbo',
    emotion = 'neutral',
    intensity = 0.8,
    deliveryStyle = 'normal',
    voiceSettings: rawVoiceSettings
  } = params;

  if (!text || !text.trim()) throw new Error('Text is required for ElevenLabs take.');
  if (!voiceId) throw new Error('Voice ID is required for ElevenLabs.');

  const pool = getKeyPool();
  if (pool.length === 0) {
    throw new Error('No ElevenLabs API keys configured. Please add keys in the Key Pool.');
  }

  // Detect inline emotion tag, prioritizing it over auto condition emotion
  const parsed = extractEmotionAndCleanText(text, emotion);
  const detectedEmotion = parsed.hasInlineTag ? parsed.emotion : (emotion || 'neutral');
  const detectedTag = parsed.hasInlineTag ? parsed.emotionTag : (detectedEmotion !== 'neutral' ? `[${detectedEmotion}]` : '');
  const cleanSpokenText = parsed.cleanText || text.trim();

  const voiceSettings = rawVoiceSettings || getElevenLabsEmotionSettings(detectedEmotion, intensity);

  // Deliver clean spoken text to ElevenLabs API so it doesn't pronounce tag words
  let promptText = cleanSpokenText;
  if (deliveryStyle === 'whisper' && !promptText.startsWith('[whisper]')) {
    promptText = `[whisper] ${promptText}`;
  }

  console.log(`\n🟢 [ElevenLabs v4 Turbo] Take: voice="${voiceName}" (${voiceId}) | Emotion=[${detectedEmotion}] (Intensity: ${intensity}${parsed.hasInlineTag ? ', inline tag detected' : ''})`);
  console.log(`   ├─ Emotion Settings: Style=${voiceSettings.style}, Stability=${voiceSettings.stability}, SimBoost=${voiceSettings.similarity_boost}`);
  console.log(`   ├─ Spoken Text (clean): "${promptText.slice(0, 65)}${promptText.length > 65 ? '...' : ''}"`);

  const errors = [];
  for (let attempt = 0; attempt < pool.length; attempt++) {
    const { key } = getRotatedElevenLabsKey();
    const maskedKey = `${key.slice(0, 4)}...${key.slice(-4)}`;
    console.log(`   ├─ Attempt ${attempt + 1}/${pool.length}: Dispatching via key ${maskedKey} (pcm_24000)...`);

    try {
      const result = await callElevenLabsTTS({
        apiKey: key,
        text: promptText,
        voiceId,
        modelId,
        voiceSettings,
        outputFormat: 'pcm_24000'
      });

      const wavBuffer = result.audioBuffer;
      let duration = 0;
      try {
        const wav = readPcmWav(wavBuffer);
        duration = wav.duration;
      } catch {
        duration = Math.max(0.5, Number((wavBuffer.length / (24000 * 2)).toFixed(2)));
      }

      let savedDatasetId = null;
      if (params.saveToDataset !== false) {
        try {
          const saved = await saveSample({
            text: cleanSpokenText, // strictly clean text, never inline tag
            speaker_name: voiceName,
            dialect: params.dialect || 'sorani',
            language: params.language || 'ckb',
            emotion: detectedEmotion,
            emotion_intensity: intensity,
            emotionTag: detectedTag,
            method: 'elevenlabs_api',
            modelId: modelId,
            voiceId,
            voiceName,
            audioBuffer: wavBuffer,
            notes: `Dual Pilot V20 (ElevenLabs v4 Turbo)`,
            allowDuplicateText: true
          });
          savedDatasetId = saved.id;
          console.log(`   💾 [Dataset Manager] Registered ElevenLabs take as Sample #${saved.id} (Emotion: ${detectedEmotion})`);
        } catch (sErr) {
          console.warn(`   ⚠️ [Dataset Manager] Could not save ElevenLabs take: ${sErr.message}`);
        }
      }

      console.log(`   ✓ [ElevenLabs v4 Turbo] Success! Duration: ${duration.toFixed(2)}s | ${(wavBuffer.length / 1024).toFixed(1)} KB (24kHz WAV)\n`);

      return {
        success: true,
        provider: 'elevenlabs',
        modelId,
        voiceId,
        voiceName,
        text: cleanSpokenText,
        rawText: text.trim(),
        emotion: detectedEmotion,
        emotionTag: detectedTag,
        hasInlineTag: parsed.hasInlineTag,
        duration,
        keyUsedMasked: maskedKey,
        savedDatasetId,
        audioUrl: `data:audio/wav;base64,${wavBuffer.toString('base64')}`
      };
    } catch (err) {
      console.warn(`   ⚠️ [ElevenLabs v4 Turbo] Attempt failed with key ${maskedKey}: ${err.message}`);
      errors.push(`Key ${maskedKey}: ${err.message}`);
      if (attempt === pool.length - 1) break;
    }
  }

  console.error(`   ❌ [ElevenLabs v4 Turbo] All keys in pool failed.`);
  throw new Error(`All ElevenLabs keys failed: ${errors.join(' | ')}`);
}

