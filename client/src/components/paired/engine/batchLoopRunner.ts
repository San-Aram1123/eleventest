import { SelectedEmotion } from '../types';
import { FailedBatchTask } from './types';
import { executeSlicedSubChunk, executeIndividualTake } from './batchTakeRunner';

export interface SlicedLoopContext {
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  chunkSize: number;
  sessionStartIdx: number;
  model?: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  slicingStrategy?: 'kurdish_align' | 'markers' | 'silence';
  signal: AbortSignal;
  getSpeaker: (idx: number) => { id: string; voice: string };
  waitIfPaused: () => Promise<void>;
  updateCurrentTarget: (info: { sentenceIdx: number; emotionIdx: number; familyId: string; emotion: string }) => void;
  isTaskCompleted: (key: string) => boolean;
  onTakeResult: (key: string, famId: string, em: string, samples: any[], task: FailedBatchTask) => void;
  onSpeakerChanged: (info: { speaker: string; voice: string }) => void;
}

export async function runSlicedBatchLoop(ctx: SlicedLoopContext) {
  const {
    sentences, enabledEmotionsList, chunkSize, sessionStartIdx,
    model, language, slicingStrategy, signal, getSpeaker, waitIfPaused,
    updateCurrentTarget, isTaskCompleted, onTakeResult, onSpeakerChanged
  } = ctx;

  const CHUNK_SIZE = Math.max(1, Math.min(12, chunkSize || 3));
  for (let cStart = 0; cStart < sentences.length; cStart += CHUNK_SIZE) {
    if (signal.aborted) break;
    const chunk = sentences.slice(cStart, cStart + CHUNK_SIZE);
    const chunkStartIdx = sessionStartIdx + cStart;
    const spk = getSpeaker(Math.floor(cStart / CHUNK_SIZE));
    onSpeakerChanged({ speaker: spk.id, voice: spk.voice });

    for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
      await waitIfPaused();
      if (signal.aborted) break;
      const target = enabledEmotionsList[eIdx];
      const isWhisper = (target.emotion || '').toLowerCase() === 'whisper';
      const subChunkSize = (isWhisper && (model || '').includes('3.1') && chunk.length > 3) ? 3 : chunk.length;
      const famId = `${spk.id}_${String(chunkStartIdx).padStart(3, '0')}`;
      updateCurrentTarget({ sentenceIdx: Math.min(sentences.length, cStart + chunk.length), emotionIdx: eIdx + 1, familyId: famId, emotion: target.emotion });

      for (let s = 0; s < chunk.length; s += subChunkSize) {
        if (signal.aborted) break;
        const scSentences = chunk.slice(s, s + subChunkSize);
        const scStartIdx = chunkStartIdx + s;
        const key = `sliced_${spk.id}_${scStartIdx}_${target.emotion}`;
        if (isTaskCompleted(key)) continue;

        const res = await executeSlicedSubChunk({
          speakerId: spk.id, voiceName: spk.voice, language, sentences: scSentences,
          startIdx: scStartIdx, emotion: target.emotion, intensity: target.intensity,
          model, slicingStrategy, signal
        });
        const scFam = `${spk.id}_${String(scStartIdx).padStart(3, '0')}`;
        onTakeResult(key, scFam, target.emotion, res.samples, {
          id: key, mode: 'sliced', sentences: scSentences, startIdx: scStartIdx, emotion: target.emotion,
          intensity: target.intensity, speakerId: spk.id, voiceName: spk.voice, familyId: scFam, error: res.error || 'Failed'
        });
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

export interface IndividualLoopContext {
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  sessionStartIdx: number;
  model?: string;
  language: 'ckb' | 'kmr' | 'ar' | 'en';
  signal: AbortSignal;
  getSpeaker: (idx: number) => { id: string; voice: string };
  waitIfPaused: () => Promise<void>;
  updateCurrentTarget: (info: { sentenceIdx: number; emotionIdx: number; familyId: string; emotion: string }) => void;
  isTaskCompleted: (key: string) => boolean;
  onTakeResult: (key: string, famId: string, em: string, samples: any[], task: FailedBatchTask) => void;
  onSpeakerChanged: (info: { speaker: string; voice: string }) => void;
}

export async function runIndividualBatchLoop(ctx: IndividualLoopContext) {
  const {
    sentences, enabledEmotionsList, sessionStartIdx, model, language,
    signal, getSpeaker, waitIfPaused, updateCurrentTarget, isTaskCompleted,
    onTakeResult, onSpeakerChanged
  } = ctx;

  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    if (signal.aborted) break;
    const sIndex = sessionStartIdx + sIdx;
    const spk = getSpeaker(sIdx);
    const famId = `${spk.id}_${String(sIndex).padStart(3, '0')}`;
    onSpeakerChanged({ speaker: spk.id, voice: spk.voice });

    for (let eIdx = 0; eIdx < enabledEmotionsList.length; eIdx++) {
      await waitIfPaused();
      if (signal.aborted) break;
      const target = enabledEmotionsList[eIdx];
      const key = `indiv_${famId}_${target.emotion}`;
      if (isTaskCompleted(key)) continue;

      updateCurrentTarget({ sentenceIdx: sIdx + 1, emotionIdx: eIdx + 1, familyId: famId, emotion: target.emotion });
      const res = await executeIndividualTake({
        speakerId: spk.id, voiceName: spk.voice, language, sentence: sentences[sIdx],
        sentenceIndex: sIndex, familyId: famId, emotion: target.emotion, intensity: target.intensity,
        model, signal
      });
      onTakeResult(key, famId, target.emotion, res.sample ? [res.sample] : [], {
        id: key, mode: 'individual', sentences: [sentences[sIdx]], sentenceIndex: sIndex, startIdx: sIndex,
        emotion: target.emotion, intensity: target.intensity, speakerId: spk.id, voiceName: spk.voice, familyId: famId, error: res.error || 'Failed'
      });
    }
  }
}
