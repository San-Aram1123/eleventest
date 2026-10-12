import { useState, useRef, useEffect, useMemo } from 'react';
import { SplitterFileQueueItem } from './splitterTypes';
import { DEFAULT_SAMPLE_PARAGRAPHS, STORAGE_KEYS, getInitialQueueData } from './splitterConstants';
import {
  parseRawTextToParagraphs,
  filterUniqueParagraphs,
  calculateDuplicateStats
} from '../../utils/kurdishTextSplitter';

interface UseSplitterFileQueueOptions {
  packetSize: number;
  isBatchRunning: boolean;
  onResetProgress: () => void;
  onStopBatch: () => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  appendBatchLog: (msg: string) => void;
}

export const useSplitterFileQueue = ({
  packetSize,
  isBatchRunning,
  onResetProgress,
  onStopBatch,
  addToast,
  appendBatchLog
}: UseSplitterFileQueueOptions) => {
  const [initial] = useState(getInitialQueueData);
  const [fileQueue, setFileQueue] = useState<SplitterFileQueueItem[]>(initial.queue);
  const [activeFileId, setActiveFileId] = useState<string | null>(initial.activeId);
  const [allParagraphs, setAllParagraphs] = useState<string[]>(initial.paragraphs);
  const [rawText, setRawText] = useState<string>(initial.content);
  const [uploadedFileName, setUploadedFileName] = useState<string>(initial.fileName);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAppendingRef = useRef<boolean>(false);

  const [autoAdvanceNextFile, setAutoAdvanceNextFile] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.AUTO_ADVANCE);
      return s !== null ? s === 'true' : true;
    } catch { return true; }
  });

  const [autoRemoveDuplicates, setAutoRemoveDuplicates] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.AUTO_REMOVE_DUPS);
      return s !== null ? s === 'true' : true;
    } catch { return true; }
  });

  const fileQueueRef = useRef(fileQueue);
  fileQueueRef.current = fileQueue;
  const activeFileIdRef = useRef(activeFileId);
  activeFileIdRef.current = activeFileId;
  const autoAdvanceRef = useRef(autoAdvanceNextFile);
  autoAdvanceRef.current = autoAdvanceNextFile;
  const autoRemoveDupsRef = useRef(autoRemoveDuplicates);
  autoRemoveDupsRef.current = autoRemoveDuplicates;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(fileQueue));
      if (activeFileId) localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE_ID, activeFileId);
      else localStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE_ID);
      localStorage.setItem(STORAGE_KEYS.AUTO_ADVANCE, String(autoAdvanceNextFile));
      localStorage.setItem(STORAGE_KEYS.AUTO_REMOVE_DUPS, String(autoRemoveDuplicates));
    } catch {}
  }, [fileQueue, activeFileId, autoAdvanceNextFile, autoRemoveDuplicates]);

  const duplicateStats = useMemo(() => calculateDuplicateStats(allParagraphs), [allParagraphs]);

  const handleRemoveDuplicates = () => {
    const { unique, removedCount } = filterUniqueParagraphs(allParagraphs);
    setAllParagraphs(unique);
    setRawText(unique.join('\n\n'));
    onResetProgress();
    addToast({
      type: 'success',
      title: 'Duplicates Removed',
      message: `Removed ${removedCount} duplicates. ${unique.length} unique paragraphs remain.`
    });
  };

  const handleProcessMultipleFiles = async (files: File[], isAppend: boolean = false) => {
    const valid = files.filter(f => f.name.match(/\.(txt|csv|tsv|jsonl)$/i));
    if (valid.length === 0) {
      addToast({ type: 'error', title: 'Unsupported Files', message: 'Please upload Kurdish .txt files.' });
      return;
    }

    const loaded = await Promise.all(valid.map(file => new Promise<{ fileName: string; content: string; paragraphs: string[]; removedCount: number }>((res) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        let paras = parseRawTextToParagraphs((ev.target?.result as string) || '');
        let count = 0;
        if (autoRemoveDupsRef.current) {
          const filtered = filterUniqueParagraphs(paras);
          paras = filtered.unique;
          count = filtered.removedCount;
        }
        res({ fileName: file.name, content: paras.join('\n\n'), paragraphs: paras, removedCount: count });
      };
      reader.readAsText(file);
    })));

    const totalDupsRemoved = loaded.reduce((acc, f) => acc + f.removedCount, 0);
    const newItems: SplitterFileQueueItem[] = loaded.map(lf => ({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName: lf.fileName,
      content: lf.content,
      paragraphs: lf.paragraphs,
      status: 'queued',
      totalPackets: Math.max(1, Math.ceil(lf.paragraphs.length / packetSize))
    }));

    if (totalDupsRemoved > 0) {
      appendBatchLog(`🧹 Auto-removed ${totalDupsRemoved} duplicate paragraphs across ${loaded.length} file(s) before queuing.`);
    }

    const curActive = fileQueueRef.current.find(f => f.id === activeFileIdRef.current);
    const shouldActivate = !isBatchRunning && (!isAppend || fileQueueRef.current.length === 0 || !curActive || curActive.status === 'completed' || !uploadedFileName);

    if (shouldActivate) {
      newItems[0].status = 'active';
      const first = newItems[0];
      setFileQueue(isAppend ? [...fileQueueRef.current.map(f => f.status === 'active' ? { ...f, status: 'queued' as const } : f), ...newItems] : newItems);
      setActiveFileId(first.id);
      setAllParagraphs(first.paragraphs);
      setRawText(first.content);
      setUploadedFileName(first.fileName);
      onResetProgress();
      addToast({ type: 'success', title: 'File Activated', message: `Loaded ${first.paragraphs.length} paragraphs from "${first.fileName}".` });
    } else {
      setFileQueue(prev => [...prev, ...newItems]);
      addToast({ type: 'success', title: 'Files Queued', message: `Added ${newItems.length} file(s) to queue.` });
    }
  };

  const handleSwitchActiveFile = (fileId: string) => {
    if (isBatchRunning) {
      addToast({ type: 'info', title: 'Batch In Progress', message: 'Pause or stop batch before switching.' });
      return;
    }
    const target = fileQueue.find(f => f.id === fileId);
    if (!target) return;
    let paragraphs = target.paragraphs;
    let content = target.content;
    let packets = target.totalPackets;

    if (autoRemoveDupsRef.current) {
      const res = filterUniqueParagraphs(target.paragraphs);
      if (res.removedCount > 0) {
        paragraphs = res.unique;
        content = res.unique.join('\n\n');
        packets = Math.max(1, Math.ceil(res.unique.length / packetSize));
      }
    }

    setFileQueue(prev => prev.map(f => {
      if (f.id === fileId) return { ...f, status: 'active', paragraphs, content, totalPackets: packets };
      if (f.status === 'active') return { ...f, status: f.completedPackets ? 'completed' : 'queued' };
      return f;
    }));
    setActiveFileId(target.id);
    setAllParagraphs(paragraphs);
    setRawText(content);
    setUploadedFileName(target.fileName);
    onResetProgress();
  };

  const handleRemoveFileFromQueue = (fileId: string) => {
    if (isBatchRunning && activeFileId === fileId) {
      addToast({ type: 'info', title: 'File Is Active', message: 'Stop batch before removing active file.' });
      return;
    }
    const remaining = fileQueue.filter(f => f.id !== fileId);
    setFileQueue(remaining);
    if (activeFileId === fileId) {
      const next = remaining.find(f => f.status === 'queued') || remaining[0] || null;
      if (next) {
        setActiveFileId(next.id);
        setUploadedFileName(next.fileName);
        setAllParagraphs(next.paragraphs);
        setRawText(next.content);
        setFileQueue(prev => prev.map(f => f.id === next.id ? { ...f, status: 'active' } : f));
      } else {
        setActiveFileId(null);
        setUploadedFileName('');
        setAllParagraphs(DEFAULT_SAMPLE_PARAGRAPHS);
        setRawText('');
      }
      onResetProgress();
    }
  };

  const handleMoveFileInQueue = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= fileQueue.length) return;
    setFileQueue(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  return {
    fileQueue,
    setFileQueue,
    activeFileId,
    setActiveFileId,
    allParagraphs,
    setAllParagraphs,
    rawText,
    setRawText,
    uploadedFileName,
    setUploadedFileName,
    isDragOver,
    setIsDragOver,
    fileInputRef,
    isAppendingRef,
    autoAdvanceNextFile,
    setAutoAdvanceNextFile,
    autoRemoveDuplicates,
    setAutoRemoveDuplicates,
    duplicateStats,
    fileQueueRef,
    activeFileIdRef,
    autoAdvanceRef,
    autoRemoveDupsRef,
    handleRemoveDuplicates,
    handleProcessMultipleFiles,
    handleSwitchActiveFile,
    handleRemoveFileFromQueue,
    handleMoveFileInQueue,
    handleClearCompletedFilesInQueue: () => setFileQueue(prev => prev.filter(f => f.status !== 'completed')),
    handleClearAllFilesInQueue: () => {
      if (isBatchRunning) onStopBatch();
      setFileQueue([]);
      setActiveFileId(null);
      setUploadedFileName('');
      setAllParagraphs([]);
      setRawText('');
      onResetProgress();
    },
    handleRawTextChange: (txt: string) => {
      setRawText(txt);
      setAllParagraphs(parseRawTextToParagraphs(txt));
      if (!isBatchRunning) onResetProgress();
    }
  };
};
