import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GeminiVoice, KurdishDialect, LongSplitChunk, Sample } from '../../types';
import { SplitterFileQueueItem, SplitterVoiceStrategy, SplitterBatchStatus } from './splitterTypes';
import { generateLongSplitSpeech, saveSplitChunksToDataset } from '../../services/api';
import { filterUniqueParagraphs } from '../../utils/kurdishTextSplitter';

interface UseSplitterBatchRunnerOptions {
  allParagraphs: string[];
  setAllParagraphs: (p: string[]) => void;
  setRawText: (t: string) => void;
  packetSize: number;
  voiceStrategy: SplitterVoiceStrategy;
  selectedVoice: string;
  voices: GeminiVoice[];
  selectedModel: string;
  dialect: KurdishDialect;
  defaultEmotion: string;
  splitterPromptInstruction: string;
  packetDelayMs?: number;
  fileQueueRef: React.MutableRefObject<SplitterFileQueueItem[]>;
  setFileQueue: React.Dispatch<React.SetStateAction<SplitterFileQueueItem[]>>;
  activeFileIdRef: React.MutableRefObject<string | null>;
  setActiveFileId: (id: string | null) => void;
  uploadedFileName: string;
  setUploadedFileName: (f: string) => void;
  autoAdvanceRef: React.MutableRefObject<boolean>;
  autoRemoveDupsRef: React.MutableRefObject<boolean>;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const useSplitterBatchRunner = ({
  allParagraphs,
  setAllParagraphs,
  setRawText,
  packetSize,
  voiceStrategy,
  selectedVoice,
  voices,
  selectedModel,
  dialect,
  defaultEmotion,
  splitterPromptInstruction,
  packetDelayMs = 2000,
  fileQueueRef,
  setFileQueue,
  activeFileIdRef,
  setActiveFileId,
  uploadedFileName,
  setUploadedFileName,
  autoAdvanceRef,
  autoRemoveDupsRef,
  onSampleCreated,
  addToast
}: UseSplitterBatchRunnerOptions) => {
  const [batchStatus, setBatchStatus] = useState<SplitterBatchStatus>('idle');
  const [currentPacketIndex, setCurrentPacketIndex] = useState<number>(0);
  const [completedPacketIndices, setCompletedPacketIndices] = useState<number[]>([]);
  const completedIndicesRef = useRef<Set<number>>(new Set());
  const [batchLog, setBatchLog] = useState<string[]>([]);
  const [completedChunks, setCompletedChunks] = useState<LongSplitChunk[]>([]);
  const [failedPacketIndices, setFailedPacketIndices] = useState<number[]>([]);
  const isRunningRef = useRef<boolean>(false);
  const handleStartBatchRef = useRef<((override?: string[]) => Promise<void>) | null>(null);

  const femaleVoices = voices.filter(v => v.gender === 'Female');
  const maleVoices = voices.filter(v => v.gender === 'Male');
  const appendBatchLog = (msg: string) => setBatchLog(prev => [msg, ...prev.slice(0, 40)]);

  const resetProgress = () => {
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setCompletedChunks([]);
    setFailedPacketIndices([]);
    setBatchStatus('idle');
  };

  const pickVoiceForPacket = (packetIdx: number, excludeList: string[] = []): string => {
    const pick = (pool: GeminiVoice[]) => {
      const candidates = pool.filter(v => !excludeList.includes(v.id));
      const finalPool = candidates.length > 0 ? candidates : pool;
      return finalPool.length > 0 ? finalPool[Math.floor(Math.random() * finalPool.length)].id : selectedVoice;
    };
    if (voiceStrategy === 'random_female') return pick(femaleVoices);
    if (voiceStrategy === 'random_male') return pick(maleVoices);
    if (voiceStrategy === 'mix_gender') return pick(packetIdx % 2 === 0 ? femaleVoices : maleVoices);
    if (excludeList.includes(selectedVoice)) {
      const v = voices.find(x => x.id === selectedVoice);
      return pick(v?.gender === 'Female' ? femaleVoices : maleVoices);
    }
    return selectedVoice;
  };

  const processPacketWithRetry = async (pIdx: number, packetParagraphs: string[], totalPackets: number): Promise<boolean> => {
    const attemptedVoices: string[] = [];
    let lastError = '';

    for (let attempt = 0; attempt <= 2; attempt++) {
      if (!isRunningRef.current) return false;
      const packetVoice = pickVoiceForPacket(pIdx, attemptedVoices);
      attemptedVoices.push(packetVoice);
      const prefix = attempt > 0 ? `[Auto-Retry ${attempt}/2] ` : '';
      appendBatchLog(`${prefix}[Packet ${pIdx + 1}/${totalPackets}] Generating ${packetParagraphs.length} chunks via 1 API call with ${packetVoice}...`);

      try {
        const res = await generateLongSplitSpeech({
          paragraphs: packetParagraphs,
          voiceName: packetVoice,
          dialect,
          model: selectedModel,
          emotion: defaultEmotion,
          promptInstruction: splitterPromptInstruction.trim() || undefined
        });

        const saveRes = await saveSplitChunksToDataset({
          chunks: res.chunks,
          voiceName: packetVoice,
          dialect,
          model: selectedModel
        });

        if (saveRes.success && saveRes.savedSamples) {
          saveRes.savedSamples.forEach(s => onSampleCreated(s));
          const marked = res.chunks.map((c, i) => ({ ...c, status: 'saved' as const, voiceName: packetVoice, savedSample: saveRes.savedSamples[i] }));
          completedIndicesRef.current.add(pIdx);
          setCompletedPacketIndices(Array.from(completedIndicesRef.current));
          setCompletedChunks(prev => [...prev, ...marked]);
          setFailedPacketIndices(prev => prev.filter(idx => idx !== pIdx));
          setCurrentPacketIndex(pIdx + 1);

          const activeId = activeFileIdRef.current;
          if (activeId) {
            setFileQueue(prev => prev.map(f => f.id === activeId ? { ...f, completedPackets: completedIndicesRef.current.size, savedSamplesCount: (f.savedSamplesCount || 0) + saveRes.savedCount } : f));
          }
          appendBatchLog(`✔ [Packet ${pIdx + 1}/${totalPackets}] Saved ${saveRes.savedCount} samples with voice ${packetVoice}.`);
          return true;
        }
      } catch (err: any) {
        lastError = err.message || 'Unknown error';
        if (attempt < 2 && isRunningRef.current) {
          appendBatchLog(`⚠️ [Auto-Retry ${attempt + 1}/2] Packet ${pIdx + 1} failed (${lastError}). Retrying...`);
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    if (isRunningRef.current) {
      setFailedPacketIndices(prev => Array.from(new Set([...prev, pIdx])));
      appendBatchLog(`❌ [Packet ${pIdx + 1}/${totalPackets}] All attempts failed: ${lastError}`);
      addToast({ type: 'error', title: `Packet #${pIdx + 1} Failed`, message: lastError });
      setCurrentPacketIndex(pIdx + 1);
    }
    return false;
  };

  const advanceToNextQueuedFile = async (completedFileId?: string | null) => {
    let currentQueue = fileQueueRef.current;
    if (completedFileId) {
      currentQueue = currentQueue.map(f => f.id === completedFileId ? { ...f, status: 'completed' as const } : f);
      setFileQueue(currentQueue);
    }
    const nextFile = currentQueue.find(f => f.status === 'queued');
    if (!nextFile) {
      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({ type: 'success', title: 'All Queue Files Completed! 🎉', message: 'All queued .txt files successfully synthesized!' });
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      return;
    }
    if (!autoAdvanceRef.current) {
      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({ type: 'info', title: 'File Completed', message: `Finished "${nextFile.fileName}". Auto-advance is off.` });
      return;
    }

    let processed = autoRemoveDupsRef.current ? filterUniqueParagraphs(nextFile.paragraphs).unique : nextFile.paragraphs;
    const calculatedPackets = Math.max(1, Math.ceil(processed.length / packetSize));

    setFileQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'active' as const, paragraphs: processed, content: processed.join('\n\n'), totalPackets: calculatedPackets } : f.id === completedFileId ? { ...f, status: 'completed' as const } : f));
    setActiveFileId(nextFile.id);
    setAllParagraphs(processed);
    setRawText(processed.join('\n\n'));
    setUploadedFileName(nextFile.fileName);
    resetProgress();

    appendBatchLog(`▶ Auto-advancing to queued file "${nextFile.fileName}" (${processed.length} samples)...`);
    await new Promise(r => setTimeout(r, 1200));
    if (isRunningRef.current && handleStartBatchRef.current) await handleStartBatchRef.current(processed);
  };

  const handleStartBatch = async (overrideParagraphs?: string[]) => {
    handleStartBatchRef.current = handleStartBatch;
    let target = overrideParagraphs || allParagraphs;
    if (autoRemoveDupsRef.current) {
      const res = filterUniqueParagraphs(target);
      if (res.removedCount > 0) { target = res.unique; setAllParagraphs(res.unique); setRawText(res.unique.join('\n\n')); }
    }
    const packets: string[][] = [];
    for (let i = 0; i < target.length; i += packetSize) packets.push(target.slice(i, i + packetSize));
    if (packets.length === 0) { addToast({ type: 'error', title: 'No Paragraphs Loaded' }); return; }

    if (currentPacketIndex === 0 && completedIndicesRef.current.size === 0) { setFailedPacketIndices([]); setCompletedChunks([]); }
    setBatchStatus('running');
    isRunningRef.current = true;
    const curActiveId = activeFileIdRef.current;
    if (curActiveId) setFileQueue(prev => prev.map(f => f.id === curActiveId ? { ...f, status: 'active', totalPackets: packets.length } : f));

    for (let pIdx = currentPacketIndex; pIdx < packets.length; pIdx++) {
      if (!isRunningRef.current) break;
      if (completedIndicesRef.current.has(pIdx)) continue;
      setCurrentPacketIndex(pIdx);
      const success = await processPacketWithRetry(pIdx, packets[pIdx], packets.length);
      if (success && pIdx < packets.length - 1 && isRunningRef.current) await new Promise(r => setTimeout(r, packetDelayMs));
    }

    if (isRunningRef.current) {
      const finishedActiveId = activeFileIdRef.current;
      if (finishedActiveId) setFileQueue(prev => prev.map(f => f.id === finishedActiveId ? { ...f, status: 'completed', completedPackets: packets.length } : f));
      const remaining = fileQueueRef.current.filter(f => f.status === 'queued' && f.id !== finishedActiveId);
      if (autoAdvanceRef.current && remaining.length > 0) { await advanceToNextQueuedFile(finishedActiveId); return; }
      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({ type: 'success', title: 'Batch Completed!', message: `Successfully synthesized all ${target.length} samples!` });
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    }
  };

  useEffect(() => { handleStartBatchRef.current = handleStartBatch; });

  const handleRetryFailed = async (packets: string[][]) => {
    if (failedPacketIndices.length === 0) return;
    setBatchStatus('running');
    isRunningRef.current = true;
    for (const pIdx of [...failedPacketIndices]) {
      if (!isRunningRef.current) break;
      setCurrentPacketIndex(pIdx);
      if (!packets[pIdx]?.length) continue;
      const success = await processPacketWithRetry(pIdx, packets[pIdx], packets.length);
      if (success && isRunningRef.current) await new Promise(r => setTimeout(r, packetDelayMs));
    }
    setBatchStatus('completed');
    isRunningRef.current = false;
  };

  return {
    batchStatus,
    setBatchStatus,
    currentPacketIndex,
    setCurrentPacketIndex,
    completedPacketIndices,
    setCompletedPacketIndices,
    completedIndicesRef,
    failedPacketIndices,
    setFailedPacketIndices,
    completedChunks,
    setCompletedChunks,
    batchLog,
    isRunningRef,
    appendBatchLog,
    resetProgress,
    handleStartBatch,
    handleRetryFailed,
    handlePauseBatch: () => { isRunningRef.current = false; setBatchStatus('paused'); },
    handleStopBatch: () => { isRunningRef.current = false; setBatchStatus('stopped'); },
    handleResetBatch: () => { isRunningRef.current = false; resetProgress(); addToast({ type: 'info', title: 'Batch Reset' }); }
  };
};
