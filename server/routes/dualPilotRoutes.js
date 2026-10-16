import express from 'express';
import { generateGeminiDualPilotBatch, generateElevenLabsDualPilotTake } from '../dualPilotService.js';
import { getAvailableGeminiVoices, getGeminiKeyPoolDetails } from '../geminiService.js';
import { getVoices as getElevenVoices, getModels as getElevenModels, getKeyPoolDetails as getElevenKeyPoolDetails } from '../elevenlabs.js';
import { runGeminiEmotionExperiment } from '../dualPilotEmotionExperiment.js';

const router = express.Router();
const activeControllers = new Set();

router.get('/config', async (_req, res) => {
  try {
    const [geminiVoices, geminiKeys, elevenVoices, elevenModels, elevenKeys] = await Promise.all([
      getAvailableGeminiVoices().catch(() => ['Puck', 'Aoede', 'Charon', 'Fenrir']),
      getGeminiKeyPoolDetails().catch(() => []),
      getElevenVoices().catch(() => []),
      getElevenModels().catch(() => []),
      getElevenKeyPoolDetails().catch(() => [])
    ]);

    res.json({
      gemini: {
        model: 'gemini-3.8-flash-tts',
        voices: geminiVoices,
        defaultFemaleVoice: 'Aoede',
        defaultMaleVoice: 'Puck',
        keys: geminiKeys
      },
      elevenlabs: {
        defaultModel: 'eleven_v4_turbo',
        models: elevenModels,
        voices: elevenVoices,
        keys: elevenKeys
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gemini-chunk', async (req, res) => {
  const pCount = req.body.paragraphs?.length || 0;
  console.log(`\n📥 [API] POST /api/dual-pilot/gemini-chunk (${pCount} paragraphs, emotion: ${req.body.emotion || 'neutral'})`);
  const controller = new AbortController();
  activeControllers.add(controller);
  req.on('close', () => controller.abort());

  try {
    const result = await generateGeminiDualPilotBatch({ ...req.body, signal: controller.signal });
    res.json(result);
  } catch (err) {
    console.error(`❌ [API] Gemini chunk failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  } finally {
    activeControllers.delete(controller);
  }
});

router.post('/gemini-emotion-experiment', async (req, res) => {
  const controller = new AbortController();
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const send = event => { if (!res.writableEnded) res.write(`data: ${JSON.stringify(event)}\n\n`); };
  res.on('close', () => controller.abort());
  try {
    const result = await runGeminiEmotionExperiment({ ...req.body, signal: controller.signal, onProgress: send });
    send({ stage: 'result', result });
  } catch (error) {
    send({ stage: 'error', detail: error.message });
  } finally {
    res.end();
  }
});

router.post('/elevenlabs-take', async (req, res) => {
  console.log(`\n📥 [API] POST /api/dual-pilot/elevenlabs-take (voice: "${req.body.voiceName || req.body.voiceId}", emotion: ${req.body.emotion || 'neutral'})`);
  try {
    const result = await generateElevenLabsDualPilotTake(req.body);
    res.json(result);
  } catch (err) {
    console.error(`❌ [API] ElevenLabs take failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

router.post('/abort', (_req, res) => {
  for (const c of activeControllers) c.abort();
  activeControllers.clear();
  res.json({ success: true, message: 'Dual pilot operations aborted.' });
});

export default router;

