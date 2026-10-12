import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { generateGeminiSpeech, GEMINI_VOICES } from '../geminiService.js';
import { findSampleByText, saveSample } from '../datasetService.js';
import {
  splitTextIntoParagraphs,
  formatPromptWithExplicitPauses,
  detectSilences,
  calculateOptimalSplitWindows,
  sliceWavFileToBuffers
} from '../audioSplitter.js';
import { extractEmotionAndCleanText } from '../emotionUtils.js';

const router = express.Router();

// In-flight Gemini generation promises to coalesce concurrent duplicate requests
const inFlightGeminiGenerations = new Map();

/**
 * Generate Kurdish speech via Google Gemini Audio with automatic multi-key failover
 * With in-flight request deduplication and pre-generation dataset check
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      text,
      voiceName = 'Puck',
      dialect = 'sorani',
      emotion = 'neutral',
      emotions = [],
      promptInstruction = '',
      apiKey = '',
      model = 'gemini-3.8-flash-tts',
      saveToDataset = true,
      customId,
      forceRegenerate = false
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Kurdish text is required' });
    }

    const cleanInputText = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();

    // 1. PRE-GENERATION DATASET CHECK
    if (saveToDataset && !forceRegenerate && !customId) {
      const existingSample = await findSampleByText(cleanInputText || text.trim());
      if (existingSample) {
        console.log(`[Gemini Generate] Pre-check: sample already exists in dataset (#${existingSample.id}), skipping generation to save quota.`);
        return res.json({
          success: true,
          sample: existingSample,
          durationSeconds: existingSample.duration_seconds || existingSample.durationSeconds || 0,
          voiceName: existingSample.voice_name || `Gemini (${voiceName})`,
          model: existingSample.model_id || model,
          usedKeyMasked: existingSample.customMetadata?.used_key || 'Dataset Cache',
          detectedTags: existingSample.customMetadata?.detected_tags || [],
          alreadyExists: true
        });
      }
    }

    // 2. IN-FLIGHT COALESCING MUTEX
    const inFlightKey = `${cleanInputText || text.trim()}:::${voiceName}:::${dialect}`;
    let generationPromise;

    if (inFlightGeminiGenerations.has(inFlightKey)) {
      console.log(`[Gemini Generate] Coalescing concurrent request for in-flight text: "${(cleanInputText || text).slice(0, 30)}..."`);
      generationPromise = inFlightGeminiGenerations.get(inFlightKey);
    } else {
      generationPromise = generateGeminiSpeech({
        text: text.trim(),
        voiceName,
        dialect,
        promptInstruction,
        apiKey,
        model
      });
      inFlightGeminiGenerations.set(inFlightKey, generationPromise);
      generationPromise
        .catch(() => { })
        .finally(() => {
          inFlightGeminiGenerations.delete(inFlightKey);
        });
    }

    const result = await generationPromise;

    const detectedTags = result.detectedTags || [];
    const finalEmotion = detectedTags.length > 0
      ? detectedTags.map(t => t.replace(/[\[\]]/g, '')).join(', ')
      : (Array.isArray(emotions) && emotions.length > 0 ? emotions.join(', ') : emotion);

    let sample = null;
    if (saveToDataset) {
      sample = await saveSample({
        id: customId,
        text: result.cleanText || text.trim(),
        dialect: dialect || 'sorani',
        emotion: finalEmotion,
        emotionTag: detectedTags.join(' '),
        method: 'gemini_api',
        voiceId: `gemini_${voiceName}`,
        voiceName: `Gemini (${voiceName})`,
        modelId: result.modelId,
        characters: result.characters,
        audioBuffer: result.audioBuffer,
        allowDuplicateText: forceRegenerate,
        customMetadata: {
          generator: `Google Gemini (${result.modelId})`,
          voice_gender: GEMINI_VOICES.find(v => v.id === voiceName)?.gender || 'Male',
          dialect: dialect || 'sorani',
          duration_seconds: result.durationSeconds,
          sample_rate: result.sampleRate,
          detected_tags: detectedTags,
          is_multilingual: result.isMultilingual,
          used_key: result.usedKeyMasked
        }
      });
    }

    res.json({
      success: true,
      sample,
      audioBase64: !saveToDataset ? result.audioBuffer.toString('base64') : undefined,
      durationSeconds: result.durationSeconds,
      voiceName,
      model: result.modelId,
      usedKeyMasked: result.usedKeyMasked,
      isMultilingual: result.isMultilingual,
      detectedTags
    });
  } catch (err) {
    console.error('Gemini Generation Error:', err);
    res.status(500).json({ error: err.message || 'Gemini speech generation failed' });
  }
});

/**
 * Long-Paragraph Multi-Chunk Generator
 */
router.post('/generate-long-split', async (req, res) => {
  let tempMaster = null;
  try {
    const {
      text = '',
      paragraphs = [],
      voiceName = 'Puck',
      dialect = 'sorani',
      emotion = 'neutral',
      promptInstruction = '',
      apiKey = '',
      model = 'gemini-3.8-flash-tts'
    } = req.body;

    let cleanParagraphs = [];
    if (Array.isArray(paragraphs) && paragraphs.length > 0) {
      cleanParagraphs = paragraphs.map(p => typeof p === 'string' ? p.trim() : '').filter(Boolean);
    }
    if (cleanParagraphs.length === 0 && text) {
      cleanParagraphs = splitTextIntoParagraphs(text);
    }

    if (cleanParagraphs.length === 0) {
      return res.status(400).json({ error: 'Kurdish text or paragraph list is required for long-form generation' });
    }

    console.log(`[Long Split Generator] Processing ${cleanParagraphs.length} paragraphs with voice "${voiceName}" in 1 Gemini request...`);

    const { prompt, instruction } = formatPromptWithExplicitPauses(cleanParagraphs, dialect, promptInstruction);

    const result = await generateGeminiSpeech({
      text: prompt,
      voiceName,
      dialect,
      promptInstruction: instruction,
      apiKey,
      model
    });

    tempMaster = path.resolve(os.tmpdir(), `master_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.wav`);
    fs.writeFileSync(tempMaster, result.audioBuffer);

    const silences = await detectSilences(tempMaster, -30, 0.4);
    const windows = calculateOptimalSplitWindows(silences, cleanParagraphs, result.durationSeconds);
    const slicedChunks = await sliceWavFileToBuffers(tempMaster, windows);

    const mappedChunks = slicedChunks.map((c, i) => {
      const parsed = extractEmotionAndCleanText(c.text, emotion || 'neutral');
      return {
        id: i + 1,
        chunkIndex: c.chunkIndex,
        rawText: c.text,
        text: c.text,
        cleanText: parsed.cleanText || c.text,
        startTime: c.startTime,
        endTime: c.endTime,
        duration: c.duration,
        audioBase64: c.audioBuffer.toString('base64'),
        voiceName,
        dialect,
        emotion: parsed.emotion,
        emotionTag: parsed.emotionTag,
        detectedTags: parsed.detectedTags,
        status: 'ready'
      };
    });

    res.json({
      success: true,
      masterDuration: result.durationSeconds,
      voiceName,
      model: result.modelId,
      usedKeyMasked: result.usedKeyMasked,
      detectedTags: result.detectedTags || [],
      chunks: mappedChunks,
      masterAudioBase64: result.audioBuffer.toString('base64')
    });
  } catch (err) {
    console.error('Gemini Long-Split Generation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate and split long audio' });
  } finally {
    if (tempMaster && fs.existsSync(tempMaster)) {
      try { fs.unlinkSync(tempMaster); } catch (_) { }
    }
  }
});

/**
 * Save sliced chunks from Long-Paragraph generation into the official dataset
 */
router.post('/save-split-chunks', async (req, res) => {
  try {
    const {
      chunks = [],
      voiceName = 'Puck',
      dialect = 'sorani',
      model = 'gemini-3.8-flash-tts',
      allowDuplicateText = false
    } = req.body;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: 'No chunks provided to save' });
    }

    const savedSamples = [];
    const skippedDuplicates = [];
    const errors = [];
    const seenInBatch = new Set();

    for (const chunk of chunks) {
      if (!chunk.audioBase64 || (!chunk.text && !chunk.cleanText)) continue;

      try {
        const audioBuffer = Buffer.from(chunk.audioBase64, 'base64');
        const rawSource = chunk.rawText || chunk.text || chunk.cleanText || '';
        const parsed = extractEmotionAndCleanText(rawSource, chunk.emotion || 'neutral');

        const finalEmotion = (chunk.emotion && chunk.emotion !== 'neutral')
          ? chunk.emotion
          : parsed.emotion;
        const finalEmotionTag = chunk.emotionTag || parsed.emotionTag || (finalEmotion !== 'neutral' ? `[${finalEmotion}]` : undefined);
        const finalCleanText = chunk.cleanText || parsed.cleanText || rawSource;

        const normKey = finalCleanText.replace(/\s+/g, ' ').trim().toLowerCase();
        if (!allowDuplicateText && seenInBatch.has(normKey)) {
          skippedDuplicates.push({ text: finalCleanText, reason: 'Duplicate within same packet' });
          continue;
        }
        seenInBatch.add(normKey);

        if (!allowDuplicateText) {
          const existing = await findSampleByText(finalCleanText);
          if (existing) {
            savedSamples.push(existing);
            continue;
          }
        }

        const sample = await saveSample({
          text: finalCleanText,
          dialect: chunk.dialect || dialect || 'sorani',
          emotion: finalEmotion,
          emotionTag: finalEmotionTag,
          method: 'gemini_api',
          voiceId: `gemini_${chunk.voiceName || voiceName}`,
          voiceName: `Gemini (${chunk.voiceName || voiceName})`,
          modelId: model,
          audioBuffer,
          allowDuplicateText: false,
          customMetadata: {
            generator: `Google Gemini (${model}) - Multi-Chunk Split`,
            voice_gender: GEMINI_VOICES.find(v => v.id === (chunk.voiceName || voiceName))?.gender || 'Male',
            dialect: chunk.dialect || dialect || 'sorani',
            duration_seconds: chunk.duration,
            sample_rate: 24000,
            detected_tags: parsed.detectedTags,
            split_source: 'long_paragraph_single_call'
          }
        });
        savedSamples.push(sample);
      } catch (err) {
        console.error(`[Save Split Chunks] Error saving chunk #${chunk.id}:`, err);
        errors.push({ id: chunk.id, error: err.message });
      }
    }

    res.json({
      success: true,
      savedCount: savedSamples.length,
      savedSamples,
      skippedDuplicates: skippedDuplicates.length > 0 ? skippedDuplicates : undefined,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Save Split Chunks Error:', err);
    res.status(500).json({ error: err.message || 'Failed to save split chunks' });
  }
});

export default router;
