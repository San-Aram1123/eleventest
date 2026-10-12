import { useEffect, useRef } from 'react';
import { SelectedEmotion } from '../types';
import { MALE_SPEAKER_PRESETS, FEMALE_SPEAKER_PRESETS } from '../pairedConstants';

interface DatasetScannerParams {
  isActive: boolean;
  sentences: string[];
  enabledEmotionsList: SelectedEmotion[];
  startIdx: number;
  speakerId: string;
  chunkSize?: number;
  randomizeVoices: boolean;
  onFoundExistingClips: (found: number, totalClips: number, sentenceIdx: number) => void;
}

export function useBatchDatasetScanner(params: DatasetScannerParams) {
  const {
    isActive, sentences, enabledEmotionsList, startIdx,
    speakerId, chunkSize = 3, randomizeVoices, onFoundExistingClips
  } = params;

  const completedTaskKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (isActive || !sentences.length || !enabledEmotionsList.length) return;

    let cancelled = false;
    const scanExisting = async () => {
      try {
        const res = await fetch('/api/paired/validate');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const familiesMap = new Map();
        (data.families || []).forEach((f: any) => {
          familiesMap.set(f.familyId, f.presentEmotions || []);
        });

        let found = 0;
        const CHUNK_SIZE = Math.max(1, Math.min(12, chunkSize || 3));

        for (let cStart = 0; cStart < sentences.length; cStart += CHUNK_SIZE) {
          const chunk = sentences.slice(cStart, cStart + CHUNK_SIZE);
          const chunkStartIdx = startIdx + cStart;

          let curSpeaker = speakerId;
          if (randomizeVoices) {
            const isMale = (Math.floor(cStart / CHUNK_SIZE) % 2 === 0);
            const pool = isMale ? MALE_SPEAKER_PRESETS : FEMALE_SPEAKER_PRESETS;
            const picked = pool[Math.floor(cStart / CHUNK_SIZE / 2) % pool.length];
            curSpeaker = picked.id;
          }

          for (const target of enabledEmotionsList) {
            const targetEm = (target.emotion || '').toLowerCase();
            let allExist = true;
            for (let i = 0; i < chunk.length; i++) {
              const famId = `${curSpeaker}_${String(chunkStartIdx + i).padStart(3, '0')}`;
              const present = familiesMap.get(famId) || [];
              if (!present.map((e: string) => e.toLowerCase()).includes(targetEm)) {
                allExist = false;
                break;
              }
            }
            if (allExist) {
              const taskKey = `sliced_${curSpeaker}_${chunkStartIdx}_${target.emotion}`;
              completedTaskKeysRef.current.add(taskKey);
              found += chunk.length;
            }
          }
        }

        const totalClips = sentences.length * enabledEmotionsList.length;
        if (found > 0 && !cancelled) {
          const sentenceIdx = Math.min(sentences.length, Math.floor(found / enabledEmotionsList.length));
          onFoundExistingClips(found, totalClips, sentenceIdx);
        }
      } catch (err) {
        console.warn('Dataset sync scan error:', err);
      }
    };

    scanExisting();
    return () => { cancelled = true; };
  }, [sentences.length, enabledEmotionsList.length, startIdx, speakerId, chunkSize, randomizeVoices]);

  return { completedTaskKeysRef };
}
