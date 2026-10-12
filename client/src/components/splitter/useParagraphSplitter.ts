import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { KurdishDialect, LongSplitResponse, LongSplitChunk } from '../../types';
import { LongParagraphSplitterProps, SplitterVoiceStrategy, SplitterWorkflowMode } from './splitterTypes';
import { STORAGE_KEYS } from './splitterConstants';
import { resetGeminiCooldowns, generateLongSplitSpeech, saveSplitChunksToDataset } from '../../services/api';
import { useSplitterAudioPlayer } from './useSplitterAudioPlayer';
import { useSplitterFileQueue } from './useSplitterFileQueue';
import { useSplitterBatchRunner } from './useSplitterBatchRunner';

export const useParagraphSplitter = (props: LongParagraphSplitterProps) => {
  const {
    voices,
    selectedVoice,
    selectedModel,
    dialect,
    setDialect,
    onSampleCreated,
    addToast
  } = props;

  const [workflowMode, setWorkflowMode] = useState<SplitterWorkflowMode>('automated_batch');
  const [packetSize, setPacketSize] = useState<number>(4);
  const [voiceStrategy, setVoiceStrategy] = useState<SplitterVoiceStrategy>('mix_gender');
  const [defaultEmotion, setDefaultEmotion] = useState<string>('neutral');
  const [packetDelayMs] = useState<number>(2000);
  const [showParagraphPreview, setShowParagraphPreview] = useState<boolean>(true);
  const [showPromptSettings, setShowPromptSettings] = useState<boolean>(false);
  const [isResettingCooldowns, setIsResettingCooldowns] = useState<boolean>(false);

  const [splitterPromptInstruction, setSplitterPromptInstruction] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEYS.PROMPT) || ''; } catch { return ''; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.PROMPT, splitterPromptInstruction); } catch {}
  }, [splitterPromptInstruction]);

  const [manualResponse, setManualResponse] = useState<LongSplitResponse | null>(null);
  const [manualChunks, setManualChunks] = useState<LongSplitChunk[]>([]);
  const [isManualGenerating, setIsManualGenerating] = useState<boolean>(false);
  const [isManualSavingAll, setIsManualSavingAll] = useState<boolean>(false);

  const runnerRef = useRef<ReturnType<typeof useSplitterBatchRunner> | null>(null);

  const audioPlayer = useSplitterAudioPlayer();

  const queue = useSplitterFileQueue({
    packetSize,
    isBatchRunning: runnerRef.current?.batchStatus === 'running',
    onResetProgress: () => runnerRef.current?.resetProgress(),
    onStopBatch: () => runnerRef.current?.handleStopBatch(),
    addToast,
    appendBatchLog: (msg) => runnerRef.current?.appendBatchLog(msg)
  });

  const runner = useSplitterBatchRunner({
    allParagraphs: queue.allParagraphs,
    setAllParagraphs: queue.setAllParagraphs,
    setRawText: queue.setRawText,
    packetSize,
    voiceStrategy,
    selectedVoice,
    voices,
    selectedModel,
    dialect,
    defaultEmotion,
    splitterPromptInstruction,
    packetDelayMs,
    fileQueueRef: queue.fileQueueRef,
    setFileQueue: queue.setFileQueue,
    activeFileIdRef: queue.activeFileIdRef,
    setActiveFileId: queue.setActiveFileId,
    uploadedFileName: queue.uploadedFileName,
    setUploadedFileName: queue.setUploadedFileName,
    autoAdvanceRef: queue.autoAdvanceRef,
    autoRemoveDupsRef: queue.autoRemoveDupsRef,
    onSampleCreated,
    addToast
  });
  runnerRef.current = runner;

  const packets: string[][] = [];
  for (let i = 0; i < queue.allParagraphs.length; i += packetSize) {
    packets.push(queue.allParagraphs.slice(i, i + packetSize));
  }

  const handlePacketSizeChange = (newSize: number) => {
    if (newSize === packetSize) return;
    if (runner.batchStatus === 'running') {
      addToast({ type: 'error', title: 'Batch In Progress', message: 'Pause or stop batch before changing packet size.' });
      return;
    }
    setPacketSize(newSize);
    runner.resetProgress();
    queue.setFileQueue(prev => prev.map(f => ({ ...f, totalPackets: Math.max(1, Math.ceil(f.paragraphs.length / newSize)) })));
    addToast({ type: 'info', title: `Packet Size Set to ${newSize} Chunks`, message: `Each API call will process up to ${newSize} paragraphs.` });
  };

  const handleDialectSelect = (d: KurdishDialect) => {
    setDialect(d);
    if (splitterPromptInstruction.trim()) {
      if (d === 'badini') {
        setSplitterPromptInstruction(prev => prev.replace(/Kurdish\s*\(\s*Sorani\s*\)/gi, 'Kurdish (Badini)').replace(/Central Kurdish \(Sorani\)/gi, 'Kurdish Badini (Kurmanji)').replace(/Sorani/gi, 'Badini'));
      } else {
        setSplitterPromptInstruction(prev => prev.replace(/Kurdish\s*\(\s*Badini\s*\)/gi, 'Kurdish (Sorani)').replace(/Kurdish Badini \(Kurmanji\)/gi, 'Central Kurdish (Sorani)').replace(/Badini/gi, 'Sorani'));
      }
    }
  };

  const handleResetCooldowns = async () => {
    setIsResettingCooldowns(true);
    try {
      await resetGeminiCooldowns();
      addToast({ type: 'success', title: 'Cooldowns Reset', message: 'All Gemini API keys have been reset to ready status.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Reset Failed', message: err.message || 'Failed to reset key cooldowns' });
    } finally {
      setIsResettingCooldowns(false);
    }
  };

  const handleGenerateManualPacket = async () => {
    const testList = queue.allParagraphs.slice(0, packetSize);
    if (testList.length === 0) return;
    try {
      setIsManualGenerating(true);
      const res = await generateLongSplitSpeech({
        paragraphs: testList,
        voiceName: selectedVoice,
        dialect,
        model: selectedModel,
        emotion: defaultEmotion,
        promptInstruction: splitterPromptInstruction.trim() || undefined
      });
      setManualResponse(res);
      setManualChunks(res.chunks || []);
      addToast({ type: 'success', title: 'Single Packet Generated', message: `Generated ${res.masterDuration.toFixed(1)}s audio in 1 call, sliced into ${res.chunks.length} samples!` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Generation Failed', message: err.message });
    } finally {
      setIsManualGenerating(false);
    }
  };

  const handleSaveManualChunks = async () => {
    if (manualChunks.length === 0) return;
    try {
      setIsManualSavingAll(true);
      const res = await saveSplitChunksToDataset({ chunks: manualChunks, voiceName: selectedVoice, dialect, model: selectedModel });
      if (res.success) {
        setManualChunks(prev => prev.map(c => ({ ...c, status: 'saved' })));
        res.savedSamples.forEach(s => onSampleCreated(s));
        addToast({ type: 'success', title: `Saved ${res.savedCount} Samples to Dataset!` });
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsManualSavingAll(false);
    }
  };

  return {
    ...queue,
    ...runner,
    ...audioPlayer,
    workflowMode,
    setWorkflowMode,
    packetSize,
    handlePacketSizeChange,
    packets,
    voiceStrategy,
    setVoiceStrategy,
    defaultEmotion,
    setDefaultEmotion,
    splitterPromptInstruction,
    setSplitterPromptInstruction,
    showPromptSettings,
    setShowPromptSettings,
    showParagraphPreview,
    setShowParagraphPreview,
    isResettingCooldowns,
    handleResetCooldowns,
    handleDialectSelect,
    manualResponse,
    manualChunks,
    isManualGenerating,
    isManualSavingAll,
    handleGenerateManualPacket,
    handleSaveManualChunks,
    handleRetryFailedPackets: () => runner.handleRetryFailed(packets)
  };
};
