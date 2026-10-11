import { 
  PilotSpeaker, 
  PILOT_SPEAKERS, 
  MatrixCondition, 
  ExpressiveTake 
} from './expressiveConstants';
import { MixedCondition } from './expressiveMixedConstants';
import { ExpressiveLanguage, EXPRESSIVE_LANGUAGES } from './expressiveFamilyTypes';
import { executeTransposedSlicedBatch, executeIndividualTake } from './expressiveBatchApi';

export interface BatchLoopContext {
  sentences: string[];
  conditions: (MatrixCondition | MixedCondition)[];
  language: ExpressiveLanguage;
  selectedSpeaker: PilotSpeaker;
  autoRotateSpeakers: boolean;
  startIdx: number;
  chunkSize: number;
  isPaused: () => boolean;
  isRunning: () => boolean;
  isTaskCompleted: (taskKey: string) => boolean;
  signal?: AbortSignal;
  onTake: (take: ExpressiveTake, sentenceIdx: number, speaker: PilotSpeaker) => void;
  onStepProgress: (taskKey: string, addedClips: number, famId: string, sentenceIdx: number, condLabel: string) => void;
  onError: (msg: string) => void;
}

export async function runSlicedLoop(ctx: BatchLoopContext): Promise<void> {
  const { sentences, conditions, language, selectedSpeaker, autoRotateSpeakers, startIdx, chunkSize } = ctx;
  const langConfig = EXPRESSIVE_LANGUAGES.find(l => l.id === language) || EXPRESSIVE_LANGUAGES[0];
  const effectiveChunk = Math.max(1, Math.min(chunkSize, sentences.length));

  for (let cStart = 0; cStart < sentences.length; cStart += effectiveChunk) {
    if (!ctx.isRunning() || ctx.signal?.aborted) return;
    const chunkSentences = sentences.slice(cStart, cStart + effectiveChunk);
    const chunkSpeaker = autoRotateSpeakers
      ? PILOT_SPEAKERS[Math.floor(cStart / effectiveChunk) % PILOT_SPEAKERS.length]
      : selectedSpeaker;
    const chunkStartSentenceIdx = (startIdx || 1) + cStart;

    for (let cIdx = 0; cIdx < conditions.length; cIdx++) {
      while (ctx.isPaused() && ctx.isRunning() && !ctx.signal?.aborted) {
        await new Promise(r => setTimeout(r, 400));
      }
      if (!ctx.isRunning() || ctx.signal?.aborted) return;

      const cond = conditions[cIdx];
      const taskKey = `slice_${cStart}_${cond.id}`;
      if (ctx.isTaskCompleted(taskKey)) continue;

      const familyId = `${chunkSpeaker.id}_${chunkStartSentenceIdx.toString().padStart(3, '0')}`;
      try {
        const takes = await executeTransposedSlicedBatch({
          chunkSentences,
          chunkStartIdx: chunkStartSentenceIdx - 1,
          speaker: chunkSpeaker,
          language,
          condition: cond,
          systemPersona: langConfig.systemPersona,
          signal: ctx.signal
        });

        if (!ctx.isRunning() || ctx.signal?.aborted) return;

        for (let tIdx = 0; tIdx < takes.length; tIdx++) {
          ctx.onTake(takes[tIdx], chunkStartSentenceIdx + tIdx, chunkSpeaker);
        }

        ctx.onStepProgress(taskKey, takes.length, familyId, chunkStartSentenceIdx, cond.label);
      } catch (err: any) {
        if (!ctx.isRunning() || ctx.signal?.aborted || err?.name === 'AbortError') {
          console.log(`[Expressive Batch Sliced] Aborted cleanly on ${cond.id}.`);
          return;
        }
        console.warn(`[Expressive Batch Sliced] Error on ${cond.id}:`, err);
        ctx.onError(`Chunk ${chunkStartSentenceIdx} • ${cond.id}: ${err.message}`);
      }

      if (!ctx.isRunning() || ctx.signal?.aborted) return;
      await new Promise(r => setTimeout(r, 250));
    }
  }
}

export async function runIndividualLoop(ctx: BatchLoopContext): Promise<void> {
  const { sentences, conditions, language, selectedSpeaker, autoRotateSpeakers, startIdx } = ctx;
  const langConfig = EXPRESSIVE_LANGUAGES.find(l => l.id === language) || EXPRESSIVE_LANGUAGES[0];

  for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
    if (!ctx.isRunning() || ctx.signal?.aborted) return;
    const sentenceText = sentences[sIdx];
    const sentenceNum = (startIdx || 1) + sIdx;
    const speaker = autoRotateSpeakers
      ? PILOT_SPEAKERS[sIdx % PILOT_SPEAKERS.length]
      : selectedSpeaker;
    const familyId = `${speaker.id}_${sentenceNum.toString().padStart(3, '0')}`;

    for (let cIdx = 0; cIdx < conditions.length; cIdx++) {
      while (ctx.isPaused() && ctx.isRunning() && !ctx.signal?.aborted) {
        await new Promise(r => setTimeout(r, 400));
      }
      if (!ctx.isRunning() || ctx.signal?.aborted) return;

      const cond = conditions[cIdx];
      const taskKey = `ind_${sIdx}_${cond.id}`;
      if (ctx.isTaskCompleted(taskKey)) continue;

      try {
        const take = await executeIndividualTake({
          sentenceText,
          sentenceIdx: sentenceNum,
          familyId,
          speaker,
          language,
          condition: cond,
          systemPersona: langConfig.systemPersona,
          signal: ctx.signal
        });

        if (!ctx.isRunning() || ctx.signal?.aborted) return;

        if (take) {
          ctx.onTake(take, sentenceNum, speaker);
          ctx.onStepProgress(taskKey, 1, familyId, sentenceNum, cond.label);
        }
      } catch (err: any) {
        if (!ctx.isRunning() || ctx.signal?.aborted || err?.name === 'AbortError') {
          console.log(`[Expressive Batch Individual] Aborted cleanly on ${cond.id}.`);
          return;
        }
        ctx.onError(`${familyId} • ${cond.id}: ${err.message}`);
      }

      if (!ctx.isRunning() || ctx.signal?.aborted) return;
      await new Promise(r => setTimeout(r, 200));
    }
  }
}
