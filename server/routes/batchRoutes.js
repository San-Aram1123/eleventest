import express from 'express';
import { generatePairedEmotionClip, generateFullFamilySet, getNextFamilyIndex } from '../pairedBatchService.js';
import { generatePairedFamilySliced, generateTransposedEmotionBatch } from '../pairedSlicingService.js';
import { REQUIRED_EMOTIONS, OPTIONAL_EMOTIONS, SPEAKER_PRESETS } from '../pairedEmotionConfig.js';
import {
  generateContextSwitchingSlicedBatch,
  generateContextSwitchingSingleSample,
  getNextContextSwitchingIndex
} from '../contextSwitchingService.js';
import contextLabRoutes from './contextLabRoutes.js';

const router = express.Router();

let activeBatchMutex = Promise.resolve();
const activeBatchAbortControllers = new Set();

/**
 * Returns available emotions and speaker presets for Paired Emotion Batch
 */
router.get('/paired/config', (req, res) => {
  res.json({
    requiredEmotions: REQUIRED_EMOTIONS,
    optionalEmotions: OPTIONAL_EMOTIONS,
    speakerPresets: SPEAKER_PRESETS
  });
});

/**
 * Returns next available family index for a given speaker
 */
router.get('/paired/next-index', async (req, res) => {
  try {
    const rawSpk = req.query.speakerId;
    const speakerId = (!rawSpk || rawSpk === 'all') ? null : String(rawSpk).trim();
    const nextIndex = await getNextFamilyIndex(speakerId);
    res.json({ speakerId: speakerId || 'global', nextIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes a single emotion clip for a sentence/family
 */
router.post('/paired/generate-emotion', async (req, res) => {
  try {
    const {
      speakerId = 'spk01', voiceName = 'Puck', dialect = 'sorani', language = 'ckb',
      sentence, sentenceIndex = 1, familyId, emotion = 'neutral', intensity,
      model = 'gemini-3.8-flash-tts', apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generatePairedEmotionClip({
      speakerId, voiceName, dialect, language, sentence, sentenceIndex,
      familyId, emotion, intensity, model, apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating clip:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes an entire family (all required/selected emotions for one sentence)
 */
router.post('/paired/generate-family', async (req, res) => {
  try {
    const {
      speakerId = 'spk01', voiceName = 'Puck', dialect = 'sorani', sentence,
      sentenceIndex = 1, emotions = [], model = 'gemini-3.8-flash-tts', apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generateFullFamilySet({
      speakerId, voiceName, dialect, sentence, sentenceIndex, emotions, model, apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating family:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Synthesizes all required emotions for one sentence in 1 Gemini call and slices them
 */
router.post('/paired/generate-family-sliced', async (req, res) => {
  try {
    const {
      speakerId = 'spk01', voiceName = 'Puck', dialect = 'sorani', language = 'ckb',
      sentence, sentenceIndex = 1, familyId = null, emotions = [],
      model = 'gemini-3.8-flash-tts', apiKey = ''
    } = req.body;

    if (!sentence || !sentence.trim()) {
      return res.status(400).json({ error: 'Sentence text is required' });
    }

    const result = await generatePairedFamilySliced({
      speakerId, voiceName, dialect, language, sentence, sentenceIndex,
      familyId, emotions, model, apiKey
    });

    res.json(result);
  } catch (err) {
    console.error('[Paired API] Error generating sliced family:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Aborts any active batch generation immediately on the server when user clicks Stop.
 */
router.post('/paired/abort-batch', (req, res) => {
  console.log(`[Paired API] Stop requested by client. Aborting ${activeBatchAbortControllers.size} active batch generation(s)...`);
  for (const controller of activeBatchAbortControllers) controller.abort();
  activeBatchAbortControllers.clear();
  res.json({ success: true, message: 'Active batch generation aborted.' });
});

/**
 * Synthesizes a batch of sentences for one emotion using spoken English markers & faster-whisper alignment
 */
router.post('/paired/generate-transposed-batch', async (req, res) => {
  try {
    const {
      speakerId = 'spk01', voiceName = 'Puck', dialect = 'sorani', language = 'ckb',
      sentences = [], startIdx = 1, emotion = 'neutral', intensity = 0.8,
      model = 'gemini-3.8-flash-tts', apiKey = '', slicingStrategy = 'silence',
      conditionId = req.body.conditionId || null,
      customStyle = req.body.customStyle || req.body.speechStyle || null,
      customInstruction = req.body.customInstruction || req.body.promptInstruction || null
    } = req.body;

    if (!Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'Sentences array is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    const result = await new Promise((resolve, reject) => {
      activeBatchMutex = activeBatchMutex.catch(() => { }).then(async () => {
        try {
          if (abortController.signal.aborted) {
            return reject(new Error('Batch generation aborted by client.'));
          }
          const resBatch = await generateTransposedEmotionBatch({
            speakerId, voiceName, dialect, language, sentences, startIdx,
            emotion, intensity, model, apiKey, slicingStrategy, customStyle,
            customInstruction, conditionId, signal: abortController.signal
          });
          resolve(resBatch);
        } catch (err) {
          reject(err);
        } finally {
          activeBatchAbortControllers.delete(abortController);
        }
      });
    });

    res.json(result);
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      console.log(`[Paired API] Transposed batch cleanly aborted: ${err.message}`);
      return res.status(499).json({ error: 'Batch aborted by client' });
    }
    console.error(`[Paired API] Error generating transposed batch (${req.body?.slicingStrategy || 'silence'}):`, err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Returns the next sequential index for Context Switching clips (ctx_...).
 */
router.get('/context-switching/next-index', async (req, res) => {
  try {
    const voiceName = req.query.voiceName || null;
    const nextIndex = await getNextContextSwitchingIndex(voiceName);
    res.json({ nextIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Direct 1:1 Generation: Synthesizes 1 complete paragraph with Gemini 3.8 Flash TTS.
 */
router.post('/context-switching/generate-single', async (req, res) => {
  try {
    const {
      paragraph = '', itemIndex = 1, voiceName = 'Puck', dialect = 'sorani',
      apiKey = '', model = 'gemini-3.8-flash-tts'
    } = req.body;

    if (!paragraph || !String(paragraph).trim()) {
      return res.status(400).json({ error: 'Paragraph text is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    try {
      const sample = await generateContextSwitchingSingleSample({
        paragraph, itemIndex: Number(itemIndex) || 1, voiceName, dialect,
        apiKey, model, signal: abortController.signal
      });
      res.json({ success: true, sample });
    } finally {
      activeBatchAbortControllers.delete(abortController);
    }
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      return res.status(499).json({ error: 'Request aborted by client' });
    }
    console.error('[Context Switching API] Error generating single paragraph:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generates up to 6 paragraphs in 1 Gemini 3.8 call and slices them acoustically.
 */
router.post('/context-switching/generate-sliced-batch', async (req, res) => {
  try {
    const {
      paragraphs = [], startIdx = 1, voiceName = 'Puck', dialect = 'sorani',
      apiKey = '', model = 'gemini-3.8-flash-tts'
    } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return res.status(400).json({ error: 'Paragraphs array is required' });
    }

    const abortController = new AbortController();
    activeBatchAbortControllers.add(abortController);

    const result = await new Promise((resolve, reject) => {
      activeBatchMutex = activeBatchMutex.catch(() => { }).then(async () => {
        try {
          if (abortController.signal.aborted) {
            return reject(new Error('Batch generation aborted by client.'));
          }
          const resBatch = await generateContextSwitchingSlicedBatch({
            paragraphs, startIdx: Number(startIdx) || 1, voiceName, dialect,
            apiKey, model, signal: abortController.signal
          });
          resolve(resBatch);
        } catch (err) {
          reject(err);
        } finally {
          activeBatchAbortControllers.delete(abortController);
        }
      });
    });

    res.json(result);
  } catch (err) {
    if (err.message && err.message.includes('Aborted')) {
      console.log(`[Context Switching API] Batch cleanly aborted: ${err.message}`);
      return res.status(499).json({ error: 'Batch aborted by client' });
    }
    console.error('[Context Switching API] Error generating sliced batch:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/context-switching/abort-batch', (_req, _res, next) => {
  for (const controller of activeBatchAbortControllers) controller.abort();
  next();
});
router.use(contextLabRoutes);

export default router;
