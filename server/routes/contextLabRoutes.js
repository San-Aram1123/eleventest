import express from 'express';
import multer from 'multer';
import { generateContextLabBatch, analyzeContextLabMaster } from '../contextLabService.js';
import { MAX_LAB_AUDIO_BYTES, readPcmWav, decodeWavDataUrl } from '../shared/wavPcm.js';
import { saveSample } from '../datasetService.js';

const router = express.Router();
const controllers = new Set();
let queue = Promise.resolve();
const upload = multer({ storage: multer.memoryStorage(), limits: {
  fileSize: MAX_LAB_AUDIO_BYTES, files: 3, fields: 12, fieldSize: 100000
} }).fields([{ name: 'masterAudio', maxCount: 1 }, { name: 'reference1', maxCount: 1 }, { name: 'reference2', maxCount: 1 }]);

function parseField(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return typeof value === 'string' ? JSON.parse(value) : value;
}

async function runQueued(req, res, task) {
  const controller = new AbortController();
  controllers.add(controller);
  const onClose = () => { if (!res.writableEnded) controller.abort(); };
  res.on('close', onClose);
  const running = queue.catch(() => {}).then(async () => {
    if (controller.signal.aborted) throw new Error('Aborted by user.');
    return task(controller.signal);
  });
  queue = running.catch(() => {});
  try {
    const result = await running;
    if (!res.destroyed) res.json(result);
  } catch (error) {
    if (!res.destroyed) res.status(/abort/i.test(error.message) ? 499 : 400).json({ error: error.message });
  } finally {
    controllers.delete(controller);
    res.off('close', onClose);
  }
}

router.post('/context-switching/abort-batch', (_req, res) => {
  for (const controller of controllers) controller.abort();
  res.json({ success: true, message: 'Lab jobs aborted.' });
});

router.post('/context-switching/generate-lab-batch', (req, res) => runQueued(req, res,
  signal => generateContextLabBatch({ ...req.body, signal })));

router.post('/context-switching/analyze-lab-master', (req, res) => {
  upload(req, res, error => {
    if (error) return res.status(400).json({ error: error.message });
    let params;
    try {
      const audioBuffer = req.files?.masterAudio?.[0]?.buffer;
      readPcmWav(audioBuffer);
      params = {
        ...req.body, audioBuffer,
        paragraphs: parseField(req.body.paragraphs, []), options: parseField(req.body.options, {}),
        reference1Buffer: req.files?.reference1?.[0]?.buffer,
        reference2Buffer: req.files?.reference2?.[0]?.buffer
      };
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }
    return runQueued(req, res, signal => analyzeContextLabMaster({ ...params, signal }));
  });
});

router.post('/context-switching/save-lab-clips', async (req, res) => {
  try {
    const { clips, startIdx = 1, dialect = 'sorani' } = req.body;
    if (!Array.isArray(clips) || !clips.length || clips.length > 24) throw new Error('Provide 1–24 accepted clips.');
    const firstIndex = Number(startIdx);
    if (!Number.isSafeInteger(firstIndex) || firstIndex < 1) throw new Error('Invalid dataset start index.');
    // Validate the whole set before making any persistent changes.
    const prepared = clips.map(clip => {
      if (!clip.text?.trim() || !clip.speakerName || !Number.isFinite(clip.start)
        || !Number.isFinite(clip.end) || clip.end <= clip.start) throw new Error('Invalid clip metadata.');
      return { ...clip, audioBuffer: decodeWavDataUrl(clip.audioUrl) };
    });
    const samples = [];
    for (let index = 0; index < prepared.length; index++) {
      const clip = prepared[index];
      const speaker = String(clip.speakerName).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const familyId = `ctx_lab_${speaker}_${String(firstIndex + index).padStart(5, '0')}`;
      samples.push(await saveSample({
        id: `${familyId}_neutral`, family_id: familyId, speaker_name: speaker, text: clip.text,
        dialect, language: 'ckb', emotion: 'neutral', emotionTag: '[neutral]', method: 'gemini_api',
        voiceId: `gemini_${clip.speakerName}`, voiceName: `Gemini (${clip.speakerName})`,
        modelId: clip.modelId || 'local_master', characters: [], audioBuffer: clip.audioBuffer, allowDuplicateText: true
      }));
    }
    res.json({ success: true, count: samples.length, samples });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
