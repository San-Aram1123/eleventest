import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GeminiBatchItem, BatchFileQueueItem, GeminiVoice, Sample } from '../../../types';
import { fetchDataset } from '../../../services/api';
import { normalizeKurdishCompare } from '../../../utils/kurdishNormalize';

interface UseGeminiFileQueueOptions {
  voices: GeminiVoice[];
  selectedVoice: string;
  batchVoiceMode: 'fixed' | 'random_female' | 'random_male' | 'mix_gender';
  isBatchRunningRef: React.MutableRefObject<boolean>;
  isPausedRef: React.MutableRefObject<boolean>;
  isStoppedRef: React.MutableRefObject<boolean>;
  startBatchExecutionRef: React.MutableRefObject<((itemsToRun: GeminiBatchItem[], forceRegenerate?: boolean) => Promise<void>) | null>;
  setBatchItems: React.Dispatch<React.SetStateAction<GeminiBatchItem[]>>;
  batchItemsRef: React.MutableRefObject<GeminiBatchItem[]>;
  setBatchState: (state: 'idle' | 'running' | 'paused' | 'completed' | 'stopped') => void;
  setCurrentProcessingId: (id: number | null) => void;
  onClearBatch: () => void;
  onStopBatch: () => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  initialQueue?: BatchFileQueueItem[];
  initialActiveFileId?: string | null;
  initialUploadedFileName?: string;
  initialRawBatchInput?: string;
  initialAutoAdvance?: boolean;
}

export function useGeminiFileQueue({
  voices, selectedVoice, batchVoiceMode, isBatchRunningRef, isPausedRef, isStoppedRef,
  startBatchExecutionRef, setBatchItems, batchItemsRef, setBatchState, setCurrentProcessingId,
  onClearBatch, onStopBatch, addToast, initialQueue, initialActiveFileId,
  initialUploadedFileName, initialRawBatchInput, initialAutoAdvance
}: UseGeminiFileQueueOptions) {
  const [uploadedFileName, setUploadedFileName] = useState<string>(() => initialUploadedFileName || '');
  const [rawBatchInput, setRawBatchInput] = useState<string>(() => initialRawBatchInput || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fileQueue, setFileQueue] = useState<BatchFileQueueItem[]>(() => initialQueue || []);
  const [activeFileId, setActiveFileId] = useState<string | null>(() => initialActiveFileId || null);
  const [autoAdvanceNextFile, setAutoAdvanceNextFile] = useState<boolean>(() => {
    const saved = localStorage.getItem('gemini_batch_auto_advance');
    return saved !== null ? saved === 'true' : (initialAutoAdvance ?? true);
  });

  const fileQueueRef = useRef<BatchFileQueueItem[]>(fileQueue);
  const activeFileIdRef = useRef<string | null>(activeFileId);
  const autoAdvanceNextFileRef = useRef<boolean>(autoAdvanceNextFile);

  useEffect(() => { fileQueueRef.current = fileQueue; }, [fileQueue]);
  useEffect(() => { activeFileIdRef.current = activeFileId; }, [activeFileId]);
  useEffect(() => {
    autoAdvanceNextFileRef.current = autoAdvanceNextFile;
    localStorage.setItem('gemini_batch_auto_advance', String(autoAdvanceNextFile));
  }, [autoAdvanceNextFile]);

  const parseLinesToItems = async (content: string, fileName = 'file.txt', silentToast = false): Promise<GeminiBatchItem[]> => {
    const rawLines = content.split(/\r?\n/);
    const parsed: GeminiBatchItem[] = [];
    let count = 1;
    let existingDataset: Sample[] = [];
    try { existingDataset = await fetchDataset(); } catch (e) { console.warn('Dataset fetch failed:', e); }

    let matchedDuplicates = 0;
    const nonEmptyCount = rawLines.filter(l => l.trim().length > 0).length;
    const numFemale = Math.floor(nonEmptyCount / 2);
    const preallocated: ('Female' | 'Male')[] = [...Array(numFemale).fill('Female'), ...Array(nonEmptyCount - numFemale).fill('Male')];
    for (let i = preallocated.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [preallocated[i], preallocated[j]] = [preallocated[j], preallocated[i]];
    }

    for (const raw of rawLines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const inlineTags = (trimmed.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
      const clean = trimmed.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();
      const normText = normalizeKurdishCompare(clean || trimmed);

      let lineVoice = selectedVoice, lineGender: 'Male' | 'Female' = 'Male';
      if (batchVoiceMode === 'random_female') {
        const females = voices.filter(v => v.gender === 'Female');
        if (females.length > 0) { lineVoice = females[Math.floor(Math.random() * females.length)].id; lineGender = 'Female'; }
      } else if (batchVoiceMode === 'random_male') {
        const males = voices.filter(v => v.gender === 'Male');
        if (males.length > 0) { lineVoice = males[Math.floor(Math.random() * males.length)].id; lineGender = 'Male'; }
      } else if (batchVoiceMode === 'mix_gender') {
        const assigned = preallocated[count - 1] || (count % 2 === 1 ? 'Female' : 'Male');
        const pool = assigned === 'Female' ? voices.filter(v => v.gender === 'Female') : voices.filter(v => v.gender === 'Male');
        if (pool.length > 0) { lineVoice = pool[Math.floor(Math.random() * pool.length)].id; lineGender = assigned; }
      } else {
        const found = voices.find(v => v.id === selectedVoice);
        lineVoice = selectedVoice; lineGender = (found?.gender === 'Female' ? 'Female' : 'Male');
      }

      const match = normText.length > 0 ? existingDataset.find(s => normalizeKurdishCompare(s.cleanText || s.text) === normText) : undefined;
      if (match) {
        matchedDuplicates++;
        parsed.push({
          id: count, lineNumber: count, text: trimmed, cleanText: clean || trimmed, status: 'completed',
          sample: match, duration: match.durationSeconds, tags: inlineTags,
          voiceName: match.voice_name?.replace(/^Gemini \((.*)\)$/, '$1') || lineVoice, voiceGender: lineGender, keyUsed: `Dataset #${match.id}`
        });
      } else {
        parsed.push({ id: count, lineNumber: count, text: trimmed, cleanText: clean || trimmed, status: 'pending', voiceName: lineVoice, voiceGender: lineGender, tags: inlineTags });
      }
      count++;
    }

    setUploadedFileName(fileName);
    setBatchItems(parsed);
    if (!silentToast) {
      setBatchState('idle'); setCurrentProcessingId(null);
      if (matchedDuplicates > 0) {
        addToast({ type: 'success', title: 'Duplicates Detected', message: `Loaded ${parsed.length} lines: ${matchedDuplicates} exist in dataset, ${parsed.length - matchedDuplicates} queued.` });
      } else {
        addToast({ type: 'success', title: 'File Parsed', message: `Loaded ${parsed.length} line(s) from "${fileName}".` });
      }
    }
    return parsed;
  };

  const handleProcessMultipleFiles = async (selectedFiles: File[]) => {
    const valid = selectedFiles.filter(f => f.name.match(/\.(txt|csv|tsv|jsonl)$/i));
    if (valid.length === 0) {
      addToast({ type: 'error', title: 'Unsupported Format', message: 'Upload .txt, .csv, .tsv, or .jsonl files.' });
      return;
    }
    const readFile = (file: File): Promise<{ fileName: string; content: string; lineCount: number }> => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => {
        const content = (ev.target?.result as string) || '';
        res({ fileName: file.name, content, lineCount: content.split(/\r?\n/).filter(l => l.trim().length > 0).length });
      };
      reader.readAsText(file);
    });

    const loaded = await Promise.all(valid.map(readFile));
    const newItems: BatchFileQueueItem[] = loaded.map(lf => ({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName: lf.fileName, content: lf.content, lineCount: lf.lineCount, status: 'queued', addedAt: new Date().toISOString()
    }));

    const cur = fileQueueRef.current;
    if (cur.length === 0 || (!activeFileIdRef.current && batchItemsRef.current.length === 0)) {
      newItems[0].status = 'active';
      setFileQueue(newItems);
      setActiveFileId(newItems[0].id);
      await parseLinesToItems(newItems[0].content, newItems[0].fileName);
    } else {
      setFileQueue(prev => [...prev, ...newItems]);
      addToast({ type: 'success', title: 'Files Queued', message: `Added ${newItems.length} file(s) to queue.` });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleProcessMultipleFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) handleProcessMultipleFiles(files);
  };

  const handleParseRawInput = async () => {
    if (!rawBatchInput.trim()) {
      addToast({ type: 'error', title: 'Input Empty', message: 'Please paste Kurdish text with multiple lines.' });
      return;
    }
    const fileName = `Pasted_Text_${fileQueue.length + 1}.txt`;
    const lineCount = rawBatchInput.split(/\r?\n/).filter(l => l.trim().length > 0).length;
    const item: BatchFileQueueItem = {
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName, content: rawBatchInput, lineCount, status: 'queued', addedAt: new Date().toISOString()
    };
    if (fileQueue.length === 0 || (!activeFileId && batchItemsRef.current.length === 0)) {
      item.status = 'active'; setFileQueue([item]); setActiveFileId(item.id);
      await parseLinesToItems(rawBatchInput, fileName);
    } else {
      setFileQueue(prev => [...prev, item]);
      addToast({ type: 'success', title: 'Pasted Text Queued', message: `Added "${fileName}" (${lineCount} lines) to queue.` });
    }
    setRawBatchInput('');
  };

  const handleSwitchActiveFile = async (fileId: string) => {
    if (isBatchRunningRef.current) {
      addToast({ type: 'info', title: 'Batch In Progress', message: 'Pause or stop batch before switching files.' });
      return;
    }
    const target = fileQueue.find(f => f.id === fileId);
    if (!target) return;
    setFileQueue(prev => prev.map(f => f.id === fileId ? { ...f, status: 'active' } : f.status === 'active' ? { ...f, status: f.completedLines ? 'completed' : 'queued' } : f));
    setActiveFileId(target.id);
    await parseLinesToItems(target.content, target.fileName);
  };

  const handleRemoveFileFromQueue = (fileId: string) => {
    if (isBatchRunningRef.current && activeFileId === fileId) {
      addToast({ type: 'info', title: 'File Is Active', message: 'Stop batch before removing active file.' });
      return;
    }
    setFileQueue(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) { setActiveFileId(null); setUploadedFileName(''); setBatchItems([]); }
  };

  const handleMoveFileInQueue = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fileQueue.length) return;
    setFileQueue(prev => {
      const copy = [...prev]; const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved); return copy;
    });
  };

  const handleClearCompletedFilesInQueue = () => {
    setFileQueue(prev => prev.filter(f => f.status !== 'completed'));
    addToast({ type: 'info', title: 'Queue Cleaned', message: 'Removed completed files from queue.' });
  };

  const handleClearAllFilesInQueue = () => {
    if (isBatchRunningRef.current) onStopBatch();
    setFileQueue([]); setActiveFileId(null); onClearBatch();
  };

  const advanceToNextQueuedFile = async (finishedFileId?: string | null, forceStart = true) => {
    if (isStoppedRef.current || isPausedRef.current) return;
    if (finishedFileId) setFileQueue(prev => prev.map(f => f.id === finishedFileId ? { ...f, status: 'completed' } : f));
    const nextFile = fileQueueRef.current.find(f => f.status === 'queued' && f.id !== finishedFileId);
    if (!nextFile) {
      setBatchState('completed');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      addToast({ type: 'success', title: 'All Files Finished!', message: 'Every file in queue has been processed.' });
      return;
    }
    setActiveFileId(nextFile.id);
    setFileQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'active' } : f));
    await new Promise(r => setTimeout(r, 1000));
    if (isStoppedRef.current || isPausedRef.current) return;
    const parsed = await parseLinesToItems(nextFile.content, nextFile.fileName, true);
    const toRun = parsed.filter(it => it.status === 'pending');
    if (toRun.length > 0 && forceStart && startBatchExecutionRef.current) {
      startBatchExecutionRef.current(toRun);
    } else if (toRun.length === 0) {
      await advanceToNextQueuedFile(nextFile.id, forceStart);
    }
  };

  return {
    uploadedFileName, setUploadedFileName, rawBatchInput, setRawBatchInput,
    isDragOver, fileInputRef, fileQueue, setFileQueue, activeFileId, setActiveFileId,
    autoAdvanceNextFile, setAutoAdvanceNextFile, fileQueueRef, activeFileIdRef, autoAdvanceNextFileRef,
    parseLinesToItems, handleProcessMultipleFiles, handleFileChange, handleDragOver, handleDragLeave, handleDrop,
    handleParseRawInput, handleSwitchActiveFile, handleRemoveFileFromQueue, handleMoveFileInQueue,
    handleClearCompletedFilesInQueue, handleClearAllFilesInQueue, advanceToNextQueuedFile
  };
}
