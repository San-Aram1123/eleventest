import { createHash } from 'node:crypto';
import { getSample, getSampleAudio, saveSample } from '../datasetService.js';
import { readPcmWav, slicePcmWav } from '../shared/wavPcm.js';
import { validateEngineResult } from '../alignment/localSpeakerBridge.js';

export function createAutoClipSaver({ get = getSample, getAudio = getSampleAudio, save = saveSample } = {}) {
  return async function saveClips(job, batch, selection, master, checkpoint) {
    const duration = readPcmWav(master).duration;
    const checked = validateEngineResult({ success: true, segments: selection.segments },
      batch.paragraphs.length, job.config.options, duration);
    if (!checked.success) throw new Error(checked.error);
    const buffers = slicePcmWav(master, checked.segments);
    for (let offset = 0; offset < buffers.length; offset++) {
      const voice = offset % 2 ? job.config.speaker2Voice : job.config.speaker1Voice;
      const speaker = voice.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const index = batch.startIndex + offset;
      const family = `ctx_auto_${String(index).padStart(7, '0')}_${speaker}`;
      const id = `${family}_neutral`;
      const digest = createHash('sha256').update(buffers[offset]).digest('hex');
      const existing = await get(id);
      let sample;
      if (existing) {
        const audio = await getAudio(id);
        const provenance = existing.metadata_extra || existing.customMetadata || existing;
        if (provenance.auto_job_id !== job.id || provenance.auto_paragraph !== batch.offset + offset ||
            existing.text !== batch.paragraphs[offset] || provenance.audio_sha256 !== digest ||
            !audio || !Buffer.from(audio).equals(buffers[offset])) {
          throw new Error(`Dataset collision at ${id}; existing data was preserved.`);
        }
        sample = existing;
      } else {
        sample = await save({ id, family_id: family, speaker_name: speaker, text: batch.paragraphs[offset],
          dialect: job.config.dialect, language: 'ckb', emotion: 'neutral', emotionTag: '[neutral]',
          method: 'gemini_api', voiceId: `gemini_${voice}`, voiceName: `Gemini (${voice})`,
          modelId: job.config.model, audioBuffer: buffers[offset], allowDuplicateText: true, exclusive: true,
          customMetadata: { auto_job_id: job.id, auto_batch: batch.number, auto_paragraph: batch.offset + offset,
            auto_index: index, slicing_engine: selection.engine, audio_sha256: digest,
            ...(selection.pendingReview ? { review_status: 'pending', review_warnings: selection.reviewWarnings,
              review_disagreements: selection.disagreements,
              review_master_url: `/api/context-auto/jobs/${job.id}/batches/${batch.number}/master`,
              review_diagnostics_url: `/api/context-auto/jobs/${job.id}/batches/${batch.number}/diagnostics`,
              review_start_seconds: checked.segments[offset].start, review_end_seconds: checked.segments[offset].end } : {}),
            duration_seconds: readPcmWav(buffers[offset]).duration }
        });
      }
      batch.saved = batch.saved || [];
      if (!batch.saved.some(item => item.id === id)) batch.saved.push({ id: sample.id, index, voice,
        audioUrl: sample.audioUrl || `/api/dataset/${id}/audio` });
      await checkpoint();
    }
  };
}

export const saveAutoClips = createAutoClipSaver();
