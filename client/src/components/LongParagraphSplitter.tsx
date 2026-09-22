import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Layers,
  FileText,
  RotateCcw,
  Check,
  Download,
  Info,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Upload,
  Square,
  Shuffle,
  Dices,
  Files,
  Sliders,
  Globe2,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  GeminiVoice, 
  GeminiModel, 
  KurdishDialect, 
  LongSplitChunk, 
  LongSplitResponse, 
  Sample 
} from '../types';
import { 
  generateLongSplitSpeech, 
  saveSplitChunksToDataset,
  resetGeminiCooldowns
} from '../services/api';

interface LongParagraphSplitterProps {
  voices: GeminiVoice[];
  models: { id: string; name: string }[];
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  dialect: KurdishDialect;
  setDialect: (d: KurdishDialect) => void;
  customInstruction: string;
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

const PRESET_STORIES = [
  {
    title: 'سەردانی هاوڕێ (4 Chunks - Emotion & Sorani)',
    dialect: 'sorani' as KurdishDialect,
    paragraphs: [
      'ئەم بەیانییە زوو لە خەو هەستام و پەنجەرەکەم کردەوە، [happy] هەواکە زۆر فێنک و ئارام بوو، بۆیە دەستم کرد بە ئامادەکردنی قاوەیەک.',
      'لەناکاو هاوڕێیەکی کۆنم پەیوەندی کرد و پێی وتم کە لە نزیک ماڵەکەمانە! [laugh] دوای ئەو هەموو ساڵە هەر بڕوام نەدەکرد.',
      'کاتێک گەیشت زۆر دڵخۆش بووین و یادەوەرییە کۆنەکانی قۆناغی خوێندنگەمان بیرکەوتەوە، [laugh] بە دەنگی بەرز پێدەکەنین.',
      'هەرچەندە کاتەکە زۆر خێرا تێپەڕی، [sigh] بەڵام ئەم سەردانە بووە یەکێک لە خۆشترین ڕۆژەکانی ئەم مانگە بۆ من.'
    ]
  },
  {
    title: 'ڕاپۆرتی کەشوهەوا (3 Chunks - Formal Sorani)',
    dialect: 'sorani' as KurdishDialect,
    paragraphs: [
      'بەپێی دواین پێشبینییەکانی کەشناسی لە هەرێمی کوردستان، شەپۆلێکی بارانبارین و فێنکبوونەوە لە ناوچە شاخاوییەکان دەست پێدەکات.',
      'شارەزایانی ژینگە داوا لە هاووڵاتییان دەکەن کە لە کاتی گەشتکردن بۆ دۆڵ و کوێستانەکان، ژینگەی سروشتی بە خاوێنی ڕابگرن.',
      'پاراستنی سەرچاوەکانی ئاو و دارستانەکان ئەرکێکی نیشتمانییە لە پێناو داهاتوویەکی تەندروست بۆ نەوەکانی داهاتوومان.'
    ]
  },
  {
    title: 'دەشتی نەینەوا و بادینان (3 Chunks - Badini)',
    dialect: 'badini' as KurdishDialect,
    paragraphs: [
      'سپێدەیا ئەڤرۆ ل دەڤەرا بادینان و باژێرێ دهۆکێ هەوایەکێ زۆر فێنک و خوەش هەبوو، خەلک بەرەڤ کارێ خوە دچوون.',
      'چیایێن دەڤەرێ و سروشتێ زاخۆ و ئامێدیێ د ڤی وەرزیدا تابلۆیەکا سەرنجڕاکێش و جوان پێشکێشی گەشتیاران دکەن.',
      'هەمی دەمێ هیڤیا مە ئەوە ئارامی و پێشکەفتن ل هەمی گوند و باژێرێن کوردستانێ بەردەوام بیت.'
    ]
  },
  {
    title: 'تەکنەلۆژیا و ژیری دەستکرد (4 Chunks - Tech/Multi)',
    dialect: 'sorani' as KurdishDialect,
    paragraphs: [
      'Today we are demonstrating advanced speech synthesis technology running on state of the art neural models.',
      'سیستەمەکە دەتوانێت دەقێکی درێژ وەربگرێت و لە یەک داواکاریدا بیخوێنێتەوە بە شێوەیەکی تەواو سروشتی و بێ کەموکوڕی.',
      'پاشان بە هاوکاری فلتەری بێدەنگی، پارچە دەنگییەکان بە وردی دابەش دەکرێن بێ ئەوەی هیچ ڕستەیەک ببڕدرێت.',
      'This breakthrough drastically multiplies API quota efficiency and creates high quality training datasets with ease.'
    ]
  },
  {
    title: 'چیرۆکا سێ زمانی (4 Chunks - Trilingual Badini)',
    dialect: 'badini' as KurdishDialect,
    paragraphs: [
      'سپێدەیا ئەڤرۆ ل دهۆکێ مە دەست ب تاقیکرنەکا نوو یا زیرەکیا دەستکرد کر.',
      'المطبخ جان ريحته طيبة والگهوة جاهزة حتى نبدي يوم عمل جديد.',
      'The multi-language speech synthesis switch between English, Kurdish Badini, and Arabic is completely seamless.',
      'هیڤیا مە ئەوە ئەڤ تەکنەلۆژیایە خزمەتەکا مەزن پێشکێشی زمانێ کوردی ب گشت زارەڤان بکەت.'
    ]
  }
];

export interface SplitterFileQueueItem {
  id: string;
  fileName: string;
  content: string;
  paragraphs: string[];
  status: 'queued' | 'active' | 'completed' | 'failed';
  totalPackets: number;
  completedPackets?: number;
  savedSamplesCount?: number;
}

export const LongParagraphSplitter: React.FC<LongParagraphSplitterProps> = ({
  voices,
  models,
  selectedVoice,
  setSelectedVoice,
  selectedModel,
  setSelectedModel,
  dialect,
  setDialect,
  customInstruction,
  onSampleCreated,
  addToast
}) => {
  // Workflow Mode: 'automated_batch' (bulk runner) vs 'manual_review' (single test packet)
  const [workflowMode, setWorkflowMode] = useState<'automated_batch' | 'manual_review'>('automated_batch');

  // Default preset demo paragraphs
  const DEFAULT_SAMPLE_PARAGRAPHS = [
    'ئەم بەیانییە زوو لە خەو هەستام و پەنجەرەکەم کردەوە، [happy] هەواکە زۆر فێنک و ئارام بوو، بۆیە دەستم کرد بە ئامادەکردنی قاوەیەک.',
    'لەناکاو هاوڕێیەکی کۆنم پەیوەندی کرد و پێی وتم کە لە نزیک ماڵەکەمانە! [laugh] دوای ئەو هەموو ساڵە هەر بڕوام نەدەکرد.',
    'کاتێک گەیشت زۆر دڵخۆش بووین و یادەوەرییە کۆنەکانی قۆناغی خوێندنگەمان بیرکەوتەوە، [laugh] بە دەنگی بەرز پێدەکەنین.',
    'هەرچەندە کاتەکە زۆر خێرا تێپەڕی، [sigh] بەڵام ئەم سەردانە بووە یەکێک لە خۆشترین ڕۆژەکانی ئەم مانگە بۆ من.'
  ];

  // Multi-File Queue State
  const [fileQueue, setFileQueue] = useState<SplitterFileQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_splitter_queue_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('gemini_splitter_active_file_id_v1');
      if (saved) return saved;
      const q = localStorage.getItem('gemini_splitter_queue_v1');
      if (q) {
        const parsed = JSON.parse(q) as SplitterFileQueueItem[];
        const found = parsed.find(f => f.status === 'active') || parsed[0];
        if (found) return found.id;
      }
    } catch (e) {}
    return null;
  });

  // Input text & paragraphs (restored from active file in queue if present)
  const [allParagraphs, setAllParagraphs] = useState<string[]>(() => {
    try {
      const q = localStorage.getItem('gemini_splitter_queue_v1');
      const aid = localStorage.getItem('gemini_splitter_active_file_id_v1');
      if (q) {
        const parsed = JSON.parse(q) as SplitterFileQueueItem[];
        const found = (aid ? parsed.find(f => f.id === aid) : null) || parsed.find(f => f.status === 'active') || parsed[0];
        if (found && found.paragraphs?.length > 0) return found.paragraphs;
      }
    } catch (e) {}
    return DEFAULT_SAMPLE_PARAGRAPHS;
  });

  const [rawText, setRawText] = useState<string>(() => {
    try {
      const q = localStorage.getItem('gemini_splitter_queue_v1');
      const aid = localStorage.getItem('gemini_splitter_active_file_id_v1');
      if (q) {
        const parsed = JSON.parse(q) as SplitterFileQueueItem[];
        const found = (aid ? parsed.find(f => f.id === aid) : null) || parsed.find(f => f.status === 'active') || parsed[0];
        if (found && found.content) return found.content;
      }
    } catch (e) {}
    return '';
  });

  const [uploadedFileName, setUploadedFileName] = useState<string>(() => {
    try {
      const q = localStorage.getItem('gemini_splitter_queue_v1');
      const aid = localStorage.getItem('gemini_splitter_active_file_id_v1');
      if (q) {
        const parsed = JSON.parse(q) as SplitterFileQueueItem[];
        const found = (aid ? parsed.find(f => f.id === aid) : null) || parsed.find(f => f.status === 'active') || parsed[0];
        if (found && found.fileName) return found.fileName;
      }
    } catch (e) {}
    return '';
  });

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isAppendingRef = useRef<boolean>(false);

  const [autoAdvanceNextFile, setAutoAdvanceNextFile] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gemini_splitter_auto_advance_v1');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Enabled by default so sequential processing moves to next file
  });

  const [autoRemoveDuplicates, setAutoRemoveDuplicates] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gemini_splitter_auto_remove_dups_v1');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true; // Enabled by default to automatically filter duplicate paragraphs before sending
  });

  const fileQueueRef = useRef<SplitterFileQueueItem[]>(fileQueue);
  const activeFileIdRef = useRef<string | null>(activeFileId);
  const autoAdvanceNextFileRef = useRef<boolean>(autoAdvanceNextFile);
  const autoRemoveDuplicatesRef = useRef<boolean>(autoRemoveDuplicates);
  const handleStartBatchRef = useRef<((overrideParagraphs?: string[]) => Promise<void>) | null>(null);

  useEffect(() => {
    fileQueueRef.current = fileQueue;
    try {
      localStorage.setItem('gemini_splitter_queue_v1', JSON.stringify(fileQueue));
    } catch (e) {}
  }, [fileQueue]);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
    try {
      if (activeFileId) localStorage.setItem('gemini_splitter_active_file_id_v1', activeFileId);
      else localStorage.removeItem('gemini_splitter_active_file_id_v1');
    } catch (e) {}
  }, [activeFileId]);

  useEffect(() => {
    autoAdvanceNextFileRef.current = autoAdvanceNextFile;
    try {
      localStorage.setItem('gemini_splitter_auto_advance_v1', String(autoAdvanceNextFile));
    } catch (e) {}
  }, [autoAdvanceNextFile]);

  useEffect(() => {
    autoRemoveDuplicatesRef.current = autoRemoveDuplicates;
    try {
      localStorage.setItem('gemini_splitter_auto_remove_dups_v1', String(autoRemoveDuplicates));
    } catch (e) {}
  }, [autoRemoveDuplicates]);

  // Packet configuration
  const [packetSize, setPacketSize] = useState<number>(4); // default 4 paragraphs per Gemini call
  const [voiceStrategy, setVoiceStrategy] = useState<'fixed' | 'random_female' | 'random_male' | 'mix_gender'>('mix_gender');
  const [defaultEmotion, setDefaultEmotion] = useState<string>('neutral');
  const [packetDelayMs, setPacketDelayMs] = useState<number>(2000);
  const [showParagraphPreview, setShowParagraphPreview] = useState<boolean>(true);

  // Splitter Prompt Instruction state (empty = server auto-optimizes with authentic vowels & 5-rule code-switching)
  const [splitterPromptInstruction, setSplitterPromptInstruction] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gemini_splitter_prompt_v1');
      if (saved !== null) return saved;
    } catch (e) {}
    return '';
  });
  const [showPromptSettings, setShowPromptSettings] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('gemini_splitter_prompt_v1', splitterPromptInstruction);
    } catch (e) {}
  }, [splitterPromptInstruction]);

  const handleDialectSelect = (d: KurdishDialect) => {
    setDialect(d);
    if (splitterPromptInstruction.trim()) {
      if (d === 'badini') {
        setSplitterPromptInstruction(prev => 
          prev.replace(/Kurdish\s*\(\s*Sorani\s*\)/gi, 'Kurdish (Badini)')
              .replace(/Central Kurdish \(Sorani\)/gi, 'Kurdish Badini (Kurmanji)')
              .replace(/Sorani/gi, 'Badini')
        );
      } else {
        setSplitterPromptInstruction(prev => 
          prev.replace(/Kurdish\s*\(\s*Badini\s*\)/gi, 'Kurdish (Sorani)')
              .replace(/Kurdish Badini \(Kurmanji\)/gi, 'Central Kurdish (Sorani)')
              .replace(/Badini/gi, 'Sorani')
        );
      }
    }
  };

  const [isResettingCooldowns, setIsResettingCooldowns] = useState<boolean>(false);
  const handleResetCooldowns = async () => {
    setIsResettingCooldowns(true);
    try {
      await resetGeminiCooldowns();
      addToast({
        type: 'success',
        title: 'Cooldowns Reset',
        message: 'All Gemini API keys have been reset to ready status.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Failed to reset key cooldowns'
      });
    } finally {
      setIsResettingCooldowns(false);
    }
  };

  // Automated Batch Runner State
  const [batchStatus, setBatchStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>('idle');
  const [currentPacketIndex, setCurrentPacketIndex] = useState<number>(0);
  const [completedPacketIndices, setCompletedPacketIndices] = useState<number[]>([]);
  const completedIndicesRef = useRef<Set<number>>(new Set());
  const [batchLog, setBatchLog] = useState<string[]>([]);
  const [completedChunks, setCompletedChunks] = useState<LongSplitChunk[]>([]);
  const [failedPacketIndices, setFailedPacketIndices] = useState<number[]>([]);
  const isRunningRef = useRef<boolean>(false);
  const activePlayingAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activePlayingId, setActivePlayingId] = useState<number | null>(null);

  // Manual Review Mode State
  const [manualResponse, setManualResponse] = useState<LongSplitResponse | null>(null);
  const [manualChunks, setManualChunks] = useState<LongSplitChunk[]>([]);
  const [isManualGenerating, setIsManualGenerating] = useState(false);
  const [isManualSavingAll, setIsManualSavingAll] = useState(false);

  // Compute voice pools
  const femaleVoices = voices.filter(v => v.gender === 'Female');
  const maleVoices = voices.filter(v => v.gender === 'Male');

  // Merges standalone tag lines (e.g. [whisper] alone on line 1) with the following paragraph
  const mergeStandaloneTags = (items: string[]): string[] => {
    const merged: string[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isPureTag = /^(?:\[|【|［|\()[a-zA-Z0-9_\s\u0600-\u06FF-]+(?:\]|】|］|\))$/i.test(item) ||
                        /^[a-zA-Z\u0600-\u06FF]{2,15}:$/i.test(item);
      if (isPureTag && i + 1 < items.length) {
        merged.push(`${item} ${items[i + 1]}`.trim());
        i++; // skip next since merged
      } else {
        merged.push(item);
      }
    }
    return merged;
  };

  // Helper: detect emotion badge info from paragraph text
  const getEmotionBadgeInfo = (text: string) => {
    const bracketRegex = /(?:\[|【|［|\()([a-zA-Z0-9_\s\u0600-\u06FF-]+)(?:\]|】|］|\))/g;
    const tags: string[] = [];
    let m;
    while ((m = bracketRegex.exec(text)) !== null) {
      const t = m[1].toLowerCase().trim();
      if (t) tags.push(t);
    }
    const prefixMatch = text.match(/^([a-zA-Z\u0600-\u06FF]{2,15}):\s+/);
    if (prefixMatch) {
      tags.push(prefixMatch[1].toLowerCase().trim());
    }
    if (tags.length > 0) {
      const tag = tags[0];
      let color = '#38BDF8';
      let bg = 'rgba(56, 189, 248, 0.15)';
      if (['whisper', 'whispering', 'soft', 'چرپە'].includes(tag)) {
        color = '#22D3EE';
        bg = 'rgba(34, 211, 238, 0.2)';
      } else if (['happy', 'cheerful', 'joy', 'دڵخۆش'].includes(tag)) {
        color = '#34D399';
        bg = 'rgba(52, 211, 153, 0.2)';
      } else if (['excited', 'حەماسی'].includes(tag)) {
        color = '#FBBF24';
        bg = 'rgba(251, 191, 36, 0.2)';
      } else if (['laugh', 'giggle', 'laughter', 'پێکەنین'].includes(tag)) {
        color = '#F59E0B';
        bg = 'rgba(245, 158, 11, 0.2)';
      } else if (['angry', 'shouting', 'تووڕە', 'هاوار'].includes(tag)) {
        color = '#F87171';
        bg = 'rgba(248, 113, 113, 0.2)';
      } else if (['sad', 'crying', 'خەمبار', 'گریان'].includes(tag)) {
        color = '#818CF8';
        bg = 'rgba(129, 140, 248, 0.2)';
      } else if (['calm', 'peaceful', 'ئارام', 'هێمن'].includes(tag)) {
        color = '#60A5FA';
        bg = 'rgba(96, 165, 250, 0.2)';
      } else if (['surprise', 'سەرسام'].includes(tag)) {
        color = '#EC4899';
        bg = 'rgba(244, 114, 182, 0.2)';
      } else if (['nervous', 'tired', 'ترساو', 'ماندوو'].includes(tag)) {
        color = '#A78BFA';
        bg = 'rgba(167, 139, 250, 0.2)';
      }
      return { tag, color, bg, hasTag: true };
    }
    return {
      tag: defaultEmotion,
      color: defaultEmotion !== 'neutral' ? '#F59E0B' : '#64748B',
      bg: defaultEmotion !== 'neutral' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
      hasTag: false
    };
  };

  // Text parser: splits by blank lines or single lines uniformly, merges tags with following text
  const parseRawTextToParagraphs = (text: string): string[] => {
    if (!text) return [];
    // Strip UTF-8 BOM and zero-width spaces that might corrupt lines from Notepad / Windows
    const cleanText = text.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D]/g, '').trim();
    if (!cleanText) return [];

    // Check if explicit delimiter "---" was used
    if (cleanText.includes('---')) {
      const byDelim = cleanText
        .split(/---+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      return mergeStandaloneTags(byDelim);
    }

    // If text contains double newlines (paragraphs separated by blank lines)
    if (/\r?\n\s*\r?\n/.test(cleanText)) {
      const byParagraphs = cleanText
        .split(/\r?\n\s*\r?\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      return mergeStandaloneTags(byParagraphs);
    }

    // Otherwise split by single lines (1 sentence or paragraph per line)
    const lines = cleanText
      .split(/\r?\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return mergeStandaloneTags(lines.length > 0 ? lines : [cleanText]);
  };

  // Normalization helper: strips bracketed tags (e.g. [happy], 【whisper】, (sigh)), zero-width chars, and collapses spacing
  const normalizeParagraph = (p: string): string => {
    return p
      .replace(/(?:\[|【|［|\()[^\]】］\)]*(?:\]|】|］|\))/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Filter unique paragraphs while strictly preserving original order
  const filterUniqueParagraphs = (paragraphs: string[]): { unique: string[]; removedCount: number } => {
    const seen = new Set<string>();
    const cleaned: string[] = [];
    paragraphs.forEach(p => {
      const norm = normalizeParagraph(p);
      if (!norm) return;
      if (seen.has(norm)) return;
      seen.add(norm);
      cleaned.push(p);
    });
    return { unique: cleaned, removedCount: paragraphs.length - cleaned.length };
  };

  // Calculate duplicate paragraphs in allParagraphs (ignoring emotion brackets and spacing)
  const duplicateParagraphStats = React.useMemo(() => {
    const seen = new Map<string, number>();
    let duplicateCount = 0;
    allParagraphs.forEach(p => {
      const norm = normalizeParagraph(p);
      if (!norm) return;
      const count = seen.get(norm) || 0;
      if (count >= 1) duplicateCount++;
      seen.set(norm, count + 1);
    });
    return { duplicateCount, uniqueCount: seen.size };
  }, [allParagraphs]);

  // Remove duplicate paragraphs while preserving order
  const handleRemoveDuplicates = () => {
    const { unique, removedCount } = filterUniqueParagraphs(allParagraphs);
    setAllParagraphs(unique);
    setRawText(unique.join('\n\n'));
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setCompletedChunks([]);
    setBatchStatus('idle');
    addToast({
      type: 'success',
      title: 'Duplicates Removed',
      message: `Removed ${removedCount} duplicate paragraphs. ${unique.length} unique paragraphs remain.`
    });
  };

  // Handle Packet Size Change with Safe Boundary Reset
  const handlePacketSizeChange = (newSize: number) => {
    if (newSize === packetSize) return;
    if (batchStatus === 'running') {
      addToast({
        type: 'error',
        title: 'Batch In Progress',
        message: 'Please pause or stop the batch before changing packet size.'
      });
      return;
    }
    setPacketSize(newSize);
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setCompletedChunks([]);
    setBatchStatus('idle');

    // Recalculate total packets for all files in queue
    setFileQueue(prev => prev.map(f => ({
      ...f,
      totalPackets: Math.max(1, Math.ceil(f.paragraphs.length / newSize))
    })));

    addToast({
      type: 'info',
      title: `Packet Size Set to ${newSize} Chunks`,
      message: `Each API call will process up to ${newSize} paragraphs. (${Math.ceil(allParagraphs.length / newSize)} packets for active file).`
    });
  };

  // Handle Multi-File Upload & Queue Processing
  const handleProcessMultipleFiles = async (files: File[], isAppend: boolean = false) => {
    const validFiles = files.filter(f => f.name.match(/\.(txt|csv|tsv|jsonl)$/i));
    if (validFiles.length === 0) {
      addToast({ type: 'error', title: 'Unsupported Files', message: 'Please upload Kurdish .txt files.' });
      return;
    }

    const readFile = (file: File): Promise<{ fileName: string; content: string; paragraphs: string[]; originalCount: number; removedCount: number }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = (ev.target?.result as string) || '';
          let paragraphs = parseRawTextToParagraphs(content);
          const originalCount = paragraphs.length;
          let removedCount = 0;
          if (autoRemoveDuplicatesRef.current) {
            const res = filterUniqueParagraphs(paragraphs);
            paragraphs = res.unique;
            removedCount = res.removedCount;
          }
          resolve({ 
            fileName: file.name, 
            content: paragraphs.join('\n\n'), 
            paragraphs,
            originalCount,
            removedCount
          });
        };
        reader.readAsText(file);
      });
    };

    const loaded = await Promise.all(validFiles.map(readFile));
    const totalDupsRemoved = loaded.reduce((acc, f) => acc + f.removedCount, 0);

    const newItems: SplitterFileQueueItem[] = loaded.map(lf => ({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName: lf.fileName,
      content: lf.content,
      paragraphs: lf.paragraphs,
      status: 'queued',
      totalPackets: Math.max(1, Math.ceil(lf.paragraphs.length / packetSize))
    }));

    if (newItems.length === 0) return;

    if (totalDupsRemoved > 0) {
      setBatchLog(prev => [
        `🧹 Auto-removed ${totalDupsRemoved} duplicate paragraphs across ${loaded.length} file(s) before queuing.`,
        ...prev.slice(0, 40)
      ]);
    }

    // Determine whether to activate the first new file
    // If not appending (e.g. user dropped or browsed new files), or if no batch is running and current is completed/demo,
    // ALWAYS activate the first new file!
    const currentActiveFile = fileQueueRef.current.find(f => f.id === activeFileIdRef.current);
    const shouldActivateFirst = !isRunningRef.current && (
      !isAppend || 
      fileQueueRef.current.length === 0 || 
      !currentActiveFile || 
      currentActiveFile.status === 'completed' ||
      !uploadedFileName
    );

    if (shouldActivateFirst) {
      newItems[0].status = 'active';
      const first = newItems[0];
      
      const updatedQueue = isAppend
        ? [...fileQueueRef.current.map(f => f.status === 'active' ? { ...f, status: 'queued' as const } : f), ...newItems]
        : newItems;

      setFileQueue(updatedQueue);
      setActiveFileId(first.id);
      setAllParagraphs(first.paragraphs);
      setRawText(first.content);
      setUploadedFileName(first.fileName);
      setCurrentPacketIndex(0);
      completedIndicesRef.current.clear();
      setCompletedPacketIndices([]);
      setCompletedChunks([]);
      setBatchStatus('idle');

      const dupMsg = totalDupsRemoved > 0 ? ` (Auto-removed ${totalDupsRemoved} duplicates)` : '';

      if (newItems.length > 1) {
        addToast({
          type: 'info',
          title: 'Multiple Files Loaded & Ready',
          message: `Activated "${first.fileName}" (${first.paragraphs.length} samples, ${first.totalPackets} packets)${dupMsg}. ${newItems.length - 1} more file(s) queued for sequential processing.`
        });
      } else {
        addToast({
          type: 'success',
          title: 'File Loaded & Activated',
          message: `Loaded ${first.paragraphs.length} paragraphs from "${first.fileName}" (${first.totalPackets} packets of ${packetSize} chunks)${dupMsg}.`
        });
      }
    } else {
      // Append to queue while a batch is already running or active
      setFileQueue(prev => [...prev, ...newItems]);
      const dupMsg = totalDupsRemoved > 0 ? ` (${totalDupsRemoved} duplicates removed)` : '';
      addToast({
        type: 'success',
        title: 'Files Added to Queue',
        message: `Added ${newItems.length} file(s) to queue (${fileQueueRef.current.length + newItems.length} total in queue)${dupMsg}.`
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleProcessMultipleFiles(files, isAppendingRef.current);
    }
    isAppendingRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      isAppendingRef.current = false;
      handleProcessMultipleFiles(files, false);
    }
  };

  const handleSwitchActiveFile = (fileId: string) => {
    if (isRunningRef.current || batchStatus === 'running') {
      addToast({
        type: 'info',
        title: 'Batch In Progress',
        message: 'Please pause or stop the current batch before switching files.'
      });
      return;
    }

    const target = fileQueue.find(f => f.id === fileId);
    if (!target) return;

    let targetParagraphs = target.paragraphs;
    let targetContent = target.content;
    let targetPackets = target.totalPackets;

    if (autoRemoveDuplicatesRef.current) {
      const { unique, removedCount } = filterUniqueParagraphs(target.paragraphs);
      if (removedCount > 0) {
        targetParagraphs = unique;
        targetContent = unique.join('\n\n');
        targetPackets = Math.max(1, Math.ceil(unique.length / packetSize));
      }
    }

    setFileQueue(prev => prev.map(f => {
      if (f.id === fileId) return { ...f, status: 'active', paragraphs: targetParagraphs, content: targetContent, totalPackets: targetPackets };
      if (f.status === 'active') return { ...f, status: f.completedPackets ? 'completed' : 'queued' };
      return f;
    }));

    setActiveFileId(target.id);
    setAllParagraphs(targetParagraphs);
    setRawText(targetContent);
    setUploadedFileName(target.fileName);
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setCompletedChunks([]);
    setBatchStatus('idle');

    addToast({
      type: 'info',
      title: 'Switched Active File',
      message: `Now viewing "${target.fileName}" (${targetParagraphs.length} samples, ${targetPackets} packets).`
    });
  };

  const handleRemoveFileFromQueue = (fileId: string) => {
    if (isRunningRef.current && activeFileId === fileId) {
      addToast({
        type: 'info',
        title: 'File Is Active',
        message: 'Stop the batch before removing the currently active file.'
      });
      return;
    }

    const remaining = fileQueue.filter(f => f.id !== fileId);
    setFileQueue(remaining);

    if (activeFileId === fileId) {
      const nextActive = remaining.find(f => f.status === 'queued') || remaining[0] || null;
      if (nextActive) {
        setActiveFileId(nextActive.id);
        setUploadedFileName(nextActive.fileName);
        setAllParagraphs(nextActive.paragraphs);
        setRawText(nextActive.content);
        setFileQueue(prev => prev.map(f => f.id === nextActive.id ? { ...f, status: 'active' } : f));
      } else {
        setActiveFileId(null);
        setUploadedFileName('');
        setAllParagraphs(DEFAULT_SAMPLE_PARAGRAPHS);
        setRawText('');
      }
      setCurrentPacketIndex(0);
      completedIndicesRef.current.clear();
      setCompletedPacketIndices([]);
      setCompletedChunks([]);
      setBatchStatus('idle');
    }
  };

  const handleMoveFileInQueue = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fileQueue.length) return;
    setFileQueue(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const handleClearCompletedFilesInQueue = () => {
    setFileQueue(prev => prev.filter(f => f.status !== 'completed'));
    addToast({
      type: 'info',
      title: 'Queue Cleaned',
      message: 'Removed completed files from queue.'
    });
  };

  const handleClearAllFilesInQueue = () => {
    if (isRunningRef.current) {
      handleStopBatch();
    }
    setFileQueue([]);
    setActiveFileId(null);
    handleResetBatch();
    setUploadedFileName('');
    setAllParagraphs([]);
    setRawText('');
  };

  const handleRawTextChange = (txt: string) => {
    setRawText(txt);
    const parsed = parseRawTextToParagraphs(txt);
    setAllParagraphs(parsed);
    if (batchStatus !== 'running') {
      setCurrentPacketIndex(0);
      completedIndicesRef.current.clear();
      setCompletedPacketIndices([]);
      setCompletedChunks([]);
      setBatchStatus('idle');
    }
  };

  // Group all paragraphs into packets
  const packets: string[][] = [];
  for (let i = 0; i < allParagraphs.length; i += packetSize) {
    packets.push(allParagraphs.slice(i, i + packetSize));
  }

  // Pick voice for packet based on voiceStrategy, optionally excluding already-attempted voices
  const pickVoiceForPacket = (packetIdx: number, excludeList: string[] = []): string => {
    if (voiceStrategy === 'random_female') {
      const candidates = femaleVoices.filter(v => !excludeList.includes(v.id));
      const pool = candidates.length > 0 ? candidates : femaleVoices;
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)].id;
      }
    } else if (voiceStrategy === 'random_male') {
      const candidates = maleVoices.filter(v => !excludeList.includes(v.id));
      const pool = candidates.length > 0 ? candidates : maleVoices;
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)].id;
      }
    } else if (voiceStrategy === 'mix_gender') {
      // 50/50 alternating: Even packet -> Female, Odd packet -> Male
      const isFemale = packetIdx % 2 === 0;
      const basePool = isFemale ? femaleVoices : maleVoices;
      const candidates = basePool.filter(v => !excludeList.includes(v.id));
      const pool = candidates.length > 0 ? candidates : basePool;
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)].id;
      }
    } else {
      // Fixed voice fallback if the selected fixed voice already failed on this packet
      if (excludeList.includes(selectedVoice)) {
        const v = voices.find(x => x.id === selectedVoice);
        const targetPool = v?.gender === 'Female' ? femaleVoices : maleVoices;
        const candidates = targetPool.filter(x => !excludeList.includes(x.id));
        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)].id;
        }
      }
    }
    return selectedVoice;
  };

  // Advance to next file in multi-file queue
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
      addToast({
        type: 'success',
        title: 'All Queue Files Completed! 🎉',
        message: 'All queued .txt files have been successfully synthesized, sliced, and saved into your dataset!'
      });
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      return;
    }

    if (!autoAdvanceNextFileRef.current) {
      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({
        type: 'info',
        title: 'File Completed',
        message: `Finished "${currentQueue.find(f => f.id === completedFileId)?.fileName || 'file'}". Auto-advance is off. Switch to "${nextFile.fileName}" when ready.`
      });
      return;
    }

    // Auto-remove duplicates before moving to and sending next file
    let processedParagraphs = nextFile.paragraphs;
    let removedDupsCount = 0;

    if (autoRemoveDuplicatesRef.current) {
      const { unique, removedCount } = filterUniqueParagraphs(nextFile.paragraphs);
      processedParagraphs = unique;
      removedDupsCount = removedCount;
    }

    const calculatedPackets = Math.max(1, Math.ceil(processedParagraphs.length / packetSize));

    // Mark next file as active and update with deduplicated content/packet count
    setFileQueue(prev => prev.map(f => {
      if (f.id === nextFile.id) {
        return { 
          ...f, 
          status: 'active' as const,
          paragraphs: processedParagraphs,
          content: processedParagraphs.join('\n\n'),
          totalPackets: calculatedPackets
        };
      }
      if (f.id === completedFileId) return { ...f, status: 'completed' as const };
      return f;
    }));

    setActiveFileId(nextFile.id);
    setAllParagraphs(processedParagraphs);
    setRawText(processedParagraphs.join('\n\n'));
    setUploadedFileName(nextFile.fileName);
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setFailedPacketIndices([]);
    setCompletedChunks([]);

    if (removedDupsCount > 0) {
      addToast({
        type: 'success',
        title: 'Auto-Removed Duplicates',
        message: `Removed ${removedDupsCount} duplicate paragraphs from "${nextFile.fileName}" before sending. (${processedParagraphs.length} unique remaining)`
      });
      setBatchLog(prev => [
        `🧹 [${nextFile.fileName}] Auto-removed ${removedDupsCount} duplicate paragraphs before sending (${processedParagraphs.length} unique remaining).`,
        ...prev.slice(0, 40)
      ]);
    }

    addToast({
      type: 'info',
      title: 'Auto-Advancing to Next File',
      message: `Moving to "${nextFile.fileName}" (${processedParagraphs.length} samples, ${calculatedPackets} packets)...`
    });

    setBatchLog(prev => [
      `▶ Auto-advancing to queued file "${nextFile.fileName}" (${processedParagraphs.length} samples, ${calculatedPackets} packets)...`,
      ...prev.slice(0, 40)
    ]);

    // Delay between files to give server/network a breather
    await new Promise(r => setTimeout(r, 1200));

    if (isRunningRef.current && handleStartBatchRef.current) {
      await handleStartBatchRef.current(processedParagraphs);
    }
  };

  // Start Automated Batch with Automatic Retries and Multi-File Queue Support
  const handleStartBatch = async (overrideParagraphs?: string[]) => {
    handleStartBatchRef.current = handleStartBatch;
    let targetParagraphs = overrideParagraphs || allParagraphs;

    // Auto-remove duplicates before creating packets and sending em
    if (autoRemoveDuplicatesRef.current) {
      const { unique, removedCount } = filterUniqueParagraphs(targetParagraphs);
      if (removedCount > 0) {
        targetParagraphs = unique;
        setAllParagraphs(unique);
        setRawText(unique.join('\n\n'));
        const currentActiveId = activeFileIdRef.current;
        if (currentActiveId) {
          setFileQueue(prev => prev.map(f => f.id === currentActiveId ? {
            ...f,
            paragraphs: unique,
            content: unique.join('\n\n'),
            totalPackets: Math.max(1, Math.ceil(unique.length / packetSize))
          } : f));
        }
        addToast({
          type: 'success',
          title: 'Auto-Removed Duplicates',
          message: `Auto-removed ${removedCount} duplicate paragraphs before sending (${unique.length} unique samples remaining).`
        });
        setBatchLog(prev => [
          `🧹 Auto-removed ${removedCount} duplicates before sending packets. Remaining: ${unique.length} unique samples (${Math.ceil(unique.length / packetSize)} packets).`,
          ...prev.slice(0, 40)
        ]);
      }
    }

    const currentPackets: string[][] = [];
    for (let i = 0; i < targetParagraphs.length; i += packetSize) {
      currentPackets.push(targetParagraphs.slice(i, i + packetSize));
    }

    if (currentPackets.length === 0) {
      addToast({ type: 'error', title: 'No Paragraphs Loaded' });
      return;
    }

    if (currentPacketIndex === 0 && completedIndicesRef.current.size === 0) {
      setFailedPacketIndices([]);
      setCompletedChunks([]);
    }

    setBatchStatus('running');
    isRunningRef.current = true;

    // Update active file status in queue to 'active'
    const currentActiveId = activeFileIdRef.current;
    if (currentActiveId) {
      setFileQueue(prev => prev.map(f => f.id === currentActiveId ? { ...f, status: 'active', totalPackets: currentPackets.length } : f));
    }

    addToast({
      type: 'info',
      title: batchStatus === 'paused' ? 'Batch Resumed' : 'Automated Batch Started',
      message: `Processing ${currentPackets.length} packets (${targetParagraphs.length} samples total) with atomic duplicate prevention.`
    });

    const MAX_AUTO_RETRIES = 2; // Up to 2 automatic retries (3 total attempts per packet)

    for (let pIdx = currentPacketIndex; pIdx < currentPackets.length; pIdx++) {
      if (!isRunningRef.current) break;

      // Skip already completed packets to guarantee zero duplicates
      if (completedIndicesRef.current.has(pIdx)) {
        continue;
      }

      setCurrentPacketIndex(pIdx);
      const packetParagraphs = currentPackets[pIdx];
      let packetSuccess = false;
      let lastErrorMessage = '';
      const attemptedVoices: string[] = [];

      for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
        if (!isRunningRef.current) break;

        const isAutoRetry = attempt > 0;
        const packetVoice = pickVoiceForPacket(pIdx, attemptedVoices);
        attemptedVoices.push(packetVoice);
        const voiceObj = voices.find(v => v.id === packetVoice);
        const gender = voiceObj?.gender || 'Male';

        const activeItem = fileQueueRef.current.find(f => f.id === activeFileIdRef.current);
        const fileNameTag = activeItem ? `[${activeItem.fileName}] ` : (uploadedFileName ? `[${uploadedFileName}] ` : '');

        const attemptPrefix = isAutoRetry
          ? `${fileNameTag}[Auto-Retry ${attempt}/${MAX_AUTO_RETRIES}] Packet ${pIdx + 1}/${currentPackets.length}`
          : `${fileNameTag}[Packet ${pIdx + 1}/${currentPackets.length}]`;

        setBatchLog(prev => [
          `${attemptPrefix} Generating ${packetParagraphs.length} chunks via 1 API call with ${packetVoice} (${gender})...`,
          ...prev.slice(0, 40)
        ]);

        try {
          // 1. Single API Call to Gemini + FFmpeg Silence Slicing
          const res = await generateLongSplitSpeech({
            paragraphs: packetParagraphs,
            voiceName: packetVoice,
            dialect,
            model: selectedModel,
            emotion: defaultEmotion,
            promptInstruction: splitterPromptInstruction.trim() || undefined
          });

          // 2. Automatically Save Sliced Chunks to Dataset (MySQL + WAV)
          const saveRes = await saveSplitChunksToDataset({
            chunks: res.chunks,
            voiceName: packetVoice,
            dialect,
            model: selectedModel
          });

          if (saveRes.success && saveRes.savedSamples) {
            saveRes.savedSamples.forEach(s => onSampleCreated(s));
            const markedSaved = res.chunks.map((c, i) => ({
              ...c,
              status: 'saved' as const,
              voiceName: packetVoice,
              savedSample: saveRes.savedSamples[i]
            }));

            // Atomically register completed packet index
            completedIndicesRef.current.add(pIdx);
            setCompletedPacketIndices(Array.from(completedIndicesRef.current));
            setCompletedChunks(prev => [...prev, ...markedSaved]);
            setFailedPacketIndices(prev => prev.filter(idx => idx !== pIdx));

            // CRITICAL FIX: Advance index immediately to next packet
            setCurrentPacketIndex(pIdx + 1);

            // Update queue item progress
            const activeId = activeFileIdRef.current;
            if (activeId) {
              setFileQueue(prev => prev.map(f => {
                if (f.id === activeId) {
                  return {
                    ...f,
                    completedPackets: completedIndicesRef.current.size,
                    savedSamplesCount: (f.savedSamplesCount || 0) + saveRes.savedCount
                  };
                }
                return f;
              }));
            }

            const successTag = isAutoRetry ? `✔ [Auto-Retry Succeeded]` : `✔`;
            setBatchLog(prev => [
              `${successTag} ${fileNameTag}[Packet ${pIdx + 1}/${currentPackets.length}] Saved ${saveRes.savedCount} samples (${res.masterDuration.toFixed(1)}s audio) with voice ${packetVoice}.`,
              ...prev.slice(0, 40)
            ]);
            packetSuccess = true;
            break; // Success! Break out of retry loop
          }
        } catch (err: any) {
          lastErrorMessage = err.message || 'Unknown error';
          console.warn(`[Packet ${pIdx + 1}] Attempt ${attempt + 1} failed:`, lastErrorMessage);

          if (attempt < MAX_AUTO_RETRIES && isRunningRef.current) {
            setBatchLog(prev => [
              `⚠️ ${fileNameTag}[Auto-Retry ${attempt + 1}/${MAX_AUTO_RETRIES}] Packet ${pIdx + 1} failed (${lastErrorMessage}). Automatically retrying with alternative voice...`,
              ...prev.slice(0, 40)
            ]);
            // Backoff pause before auto-retry
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }

      if (!packetSuccess && isRunningRef.current) {
        const activeItem = fileQueueRef.current.find(f => f.id === activeFileIdRef.current);
        const fileNameTag = activeItem ? `[${activeItem.fileName}] ` : (uploadedFileName ? `[${uploadedFileName}] ` : '');
        setFailedPacketIndices(prev => Array.from(new Set([...prev, pIdx])));
        setBatchLog(prev => [
          `❌ ${fileNameTag}[Packet ${pIdx + 1}/${currentPackets.length}] All attempts failed: ${lastErrorMessage}`,
          ...prev.slice(0, 40)
        ]);
        addToast({
          type: 'error',
          title: `Packet #${pIdx + 1} Failed`,
          message: lastErrorMessage
        });

        // Advance index even on failure so user can proceed or retry failed later
        setCurrentPacketIndex(pIdx + 1);

        // If stopped, break out
        if (!isRunningRef.current) break;
      }

      // Delay between packets to prevent rate limits
      if (packetSuccess && pIdx < currentPackets.length - 1 && isRunningRef.current) {
        await new Promise(r => setTimeout(r, packetDelayMs));
      }
    }

    if (isRunningRef.current) {
      const finishedActiveId = activeFileIdRef.current;
      if (finishedActiveId) {
        setFileQueue(prev => prev.map(f => {
          if (f.id === finishedActiveId) {
            return {
              ...f,
              status: 'completed',
              completedPackets: currentPackets.length
            };
          }
          return f;
        }));
      }

      // Check if there are queued files to process next
      const remainingQueued = fileQueueRef.current.filter(f => f.status === 'queued' && f.id !== finishedActiveId);

      if (autoAdvanceNextFileRef.current && remainingQueued.length > 0) {
        addToast({
          type: 'success',
          title: `File Finished: ${uploadedFileName || 'Current File'}`,
          message: `Saved all samples. Auto-advancing to next queued file (${remainingQueued.length} remaining in queue)...`
        });
        await advanceToNextQueuedFile(finishedActiveId);
        return;
      }

      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({
        type: 'success',
        title: 'Batch Completed!',
        message: `Successfully synthesized and sliced all ${targetParagraphs.length} samples!`
      });
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    }
  };

  useEffect(() => {
    handleStartBatchRef.current = handleStartBatch;
  });

  // Retry only the failed packets with Automatic Retries
  const handleRetryFailed = async () => {
    if (failedPacketIndices.length === 0) return;

    setBatchStatus('running');
    isRunningRef.current = true;

    addToast({
      type: 'info',
      title: 'Retrying Failed Packets',
      message: `Retrying ${failedPacketIndices.length} failed packet${failedPacketIndices.length > 1 ? 's' : ''} with auto-recovery...`
    });

    const MAX_AUTO_RETRIES = 2;
    const indicesToRetry = [...failedPacketIndices];
    for (const pIdx of indicesToRetry) {
      if (!isRunningRef.current) break;

      setCurrentPacketIndex(pIdx);
      const packetParagraphs = packets[pIdx];
      if (!packetParagraphs || packetParagraphs.length === 0) continue;

      let packetSuccess = false;
      let lastErrorMessage = '';
      const attemptedVoices: string[] = [];

      for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
        if (!isRunningRef.current) break;

        const isAutoRetry = attempt > 0;
        const packetVoice = pickVoiceForPacket(pIdx, attemptedVoices);
        attemptedVoices.push(packetVoice);
        const voiceObj = voices.find(v => v.id === packetVoice);
        const gender = voiceObj?.gender || 'Male';

        const attemptPrefix = isAutoRetry
          ? `[Retry Auto-Attempt ${attempt}/${MAX_AUTO_RETRIES}] Packet ${pIdx + 1}/${packets.length}`
          : `[Retry Packet ${pIdx + 1}/${packets.length}]`;

        setBatchLog(prev => [
          `${attemptPrefix} Retrying with fresh voice ${packetVoice} (${gender})...`,
          ...prev.slice(0, 40)
        ]);

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
            const markedSaved = res.chunks.map((c, i) => ({
              ...c,
              status: 'saved' as const,
              voiceName: packetVoice,
              savedSample: saveRes.savedSamples[i]
            }));

            completedIndicesRef.current.add(pIdx);
            setCompletedPacketIndices(Array.from(completedIndicesRef.current));
            setCompletedChunks(prev => [...prev, ...markedSaved]);
            setFailedPacketIndices(prev => prev.filter(idx => idx !== pIdx));

            setBatchLog(prev => [
              `✔ [Retry Succeeded] Packet ${pIdx + 1} saved ${saveRes.savedCount} samples with voice ${packetVoice}!`,
              ...prev.slice(0, 40)
            ]);
            packetSuccess = true;
            break;
          }
        } catch (err: any) {
          lastErrorMessage = err.message || 'Unknown error';
          console.warn(`Retry failed for packet #${pIdx + 1} (attempt ${attempt + 1}):`, lastErrorMessage);

          if (attempt < MAX_AUTO_RETRIES && isRunningRef.current) {
            setBatchLog(prev => [
              `⚠️ [Retry Auto-Attempt ${attempt + 1}/${MAX_AUTO_RETRIES}] Packet ${pIdx + 1} failed (${lastErrorMessage}). Retrying with alternative voice...`,
              ...prev.slice(0, 40)
            ]);
            await new Promise(r => setTimeout(r, 1500));
          }
        }
      }

      if (!packetSuccess && isRunningRef.current) {
        setBatchLog(prev => [
          `❌ [Retry Failed] Packet ${pIdx + 1} Error: ${lastErrorMessage}`,
          ...prev.slice(0, 40)
        ]);
        addToast({
          type: 'error',
          title: `Retry Failed for Packet #${pIdx + 1}`,
          message: lastErrorMessage
        });
      }

      if (packetSuccess && isRunningRef.current) {
        await new Promise(r => setTimeout(r, packetDelayMs));
      }
    }

    if (isRunningRef.current) {
      setBatchStatus('completed');
      isRunningRef.current = false;
      addToast({
        type: 'success',
        title: 'Retry Finished',
        message: 'Completed retry run for failed packets.'
      });
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handlePauseBatch = () => {
    isRunningRef.current = false;
    setBatchStatus('paused');
  };

  const handleStopBatch = () => {
    isRunningRef.current = false;
    setBatchStatus('stopped');
  };

  const handleResetBatch = () => {
    isRunningRef.current = false;
    setBatchStatus('idle');
    setCurrentPacketIndex(0);
    completedIndicesRef.current.clear();
    setCompletedPacketIndices([]);
    setCompletedChunks([]);
    setFailedPacketIndices([]);
    addToast({
      type: 'info',
      title: 'Batch Reset',
      message: 'Batch state and completed progress reset to 0.'
    });
  };

  const handlePlayAudio = (chunkId: number, base64: string) => {
    if (activePlayingId === chunkId) {
      activePlayingAudioRef.current?.pause();
      setActivePlayingId(null);
    } else {
      activePlayingAudioRef.current?.pause();
      const audio = new Audio(`data:audio/wav;base64,${base64}`);
      audio.onended = () => setActivePlayingId(null);
      activePlayingAudioRef.current = audio;
      audio.play().catch(e => console.warn(e));
      setActivePlayingId(chunkId);
    }
  };

  // Manual Review Mode: Generate 1 Test Packet
  const handleGenerateManualPacket = async () => {
    const testList = allParagraphs.slice(0, packetSize);
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
      addToast({
        type: 'success',
        title: 'Single Packet Generated & Sliced',
        message: `Generated ${res.masterDuration.toFixed(1)}s audio in 1 call, sliced into ${res.chunks.length} clean samples!`
      });
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
      const res = await saveSplitChunksToDataset({
        chunks: manualChunks,
        voiceName: selectedVoice,
        dialect,
        model: selectedModel
      });
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

  return (
    <div className="long-splitter-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
      {/* Top Banner with Quota Calculation */}
      <div 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(129, 140, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8'
              }}
            >
              <Scissors size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#F8FAFC' }}>
                  Smart Long-Paragraph Audio Splitter and Automated Batch
                </h3>
                <span 
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}
                >
                  ⚡ {packetSize}x Quota Multiplier
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Upload or paste paragraphs separated by blank lines. The engine sends <strong>{packetSize} paragraphs per Gemini request</strong> with 1.5s silence pauses, then auto-slices via FFmpeg with zero mid-sentence cutoffs.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Presets:</span>
            {PRESET_STORIES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-xs btn-ghost"
                onClick={() => {
                  setAllParagraphs(p.paragraphs);
                  setRawText(p.paragraphs.join('\n\n'));
                  handleDialectSelect(p.dialect);
                  addToast({ type: 'info', title: `Loaded Preset: ${p.title}` });
                }}
                style={{
                  fontSize: '0.74rem',
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <BookOpen size={12} style={{ marginRight: '4px' }} />
                {p.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Controls */}
      <div className="studio-grid" style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
        {/* Left: Input Text & Drag-and-Drop File Upload */}
        <div className="studio-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          {/* File Drag and Drop Zone */}
          <div
            className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop}
            onClick={() => {
              isAppendingRef.current = false;
              fileInputRef.current?.click();
            }}
            style={{
              padding: '18px',
              border: isDragOver ? '2px dashed #38BDF8' : '2px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              background: isDragOver ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".txt,.csv,.tsv,.jsonl"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
              <Upload size={20} className="text-cyan" style={{ flexShrink: 0 }} />
              <div style={{ textAlign: 'left', minWidth: 0, overflow: 'hidden' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uploadedFileName
                    ? `Active File: ${uploadedFileName} (${allParagraphs.length} samples)${fileQueue.length > 1 ? ` • ${fileQueue.length} files in queue` : ''}`
                    : 'Drop Kurdish .txt files here (Single or Multiple) or click to browse'}
                </span>
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  {uploadedFileName
                    ? 'Click or drop new files here to replace queue, or click "+ Add Files" in queue card below to append.'
                    : 'Supports multiple .txt files: automatically advances to the next file upon completion.'}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-File Sequential Queue Card */}
          {fileQueue.length > 0 && (
            <div 
              className="card"
              style={{
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.6) 100%)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div 
                className="card-header" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '10px',
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8'
                  }}>
                    <Files size={15} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F8FAFC' }}>
                    Multi-File Batch Queue
                  </span>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    {fileQueue.filter(f => f.status === 'completed').length} / {fileQueue.length} Finished
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Auto-Remove Duplicates Toggle */}
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: autoRemoveDuplicates ? '#38BDF8' : 'var(--text-muted)',
                      fontWeight: 600,
                      background: autoRemoveDuplicates ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: autoRemoveDuplicates ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    title="When enabled, automatically eliminates duplicate paragraphs before sending packets (active file & next queued files)"
                  >
                    <input 
                      type="checkbox"
                      checked={autoRemoveDuplicates}
                      onChange={(e) => setAutoRemoveDuplicates(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#38BDF8' }}
                    />
                    <span>Auto-Remove Duplicates</span>
                  </label>

                  {/* Auto-Advance Sequential Toggle */}
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: autoAdvanceNextFile ? '#34D399' : 'var(--text-muted)',
                      fontWeight: 600,
                      background: autoAdvanceNextFile ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: autoAdvanceNextFile ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    title="When enabled, finishing the active file automatically begins synthesizing the next queued file"
                  >
                    <input 
                      type="checkbox"
                      checked={autoAdvanceNextFile}
                      onChange={(e) => setAutoAdvanceNextFile(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#10B981' }}
                    />
                    <span>Auto-Advance Next File</span>
                  </label>

                  {/* Add more files button */}
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      isAppendingRef.current = true;
                      fileInputRef.current?.click();
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      padding: '4px 8px',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    <Plus size={12} />
                    <span>Add Files</span>
                  </button>
                </div>
              </div>

              {/* Queue Items List */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {fileQueue.map((item, idx) => {
                  const isActive = item.id === activeFileId;
                  const isCompleted = item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: isActive 
                          ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)' 
                          : isCompleted 
                          ? 'rgba(16, 185, 129, 0.06)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isActive 
                          ? '1px solid rgba(56, 189, 248, 0.45)' 
                          : isCompleted 
                          ? '1px solid rgba(16, 185, 129, 0.25)' 
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        gap: '10px'
                      }}
                    >
                      {/* Left: Index & File Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <span style={{ 
                          fontSize: '0.74rem', 
                          fontWeight: 700, 
                          color: isActive ? '#38BDF8' : 'var(--text-dim)',
                          width: '20px',
                          textAlign: 'center'
                        }}>
                          #{idx + 1}
                        </span>

                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ 
                              fontSize: '0.84rem', 
                              fontWeight: isActive ? 700 : 500, 
                              color: isActive ? '#F8FAFC' : '#CBD5E1',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '260px'
                            }}>
                              {item.fileName}
                            </span>
                            {isActive && (
                              <span style={{
                                background: 'rgba(56, 189, 248, 0.25)',
                                color: '#38BDF8',
                                fontSize: '0.66rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700
                              }}>
                                ACTIVE
                              </span>
                            )}
                            {isCompleted && (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#34D399',
                                fontSize: '0.66rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}>
                                <CheckCircle2 size={10} /> DONE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>{item.paragraphs.length} samples</span>
                            <span>•</span>
                            <span>{item.totalPackets} packets</span>
                            {item.completedPackets ? (
                              <>
                                <span>•</span>
                                <span style={{ color: '#34D399' }}>{item.completedPackets}/{item.totalPackets} packets done</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        {!isActive && batchStatus !== 'running' && (
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost"
                            onClick={() => handleSwitchActiveFile(item.id)}
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#94A3B8' }}
                            title="Switch to this file as active"
                          >
                            Switch
                          </button>
                        )}

                        {/* Reorder Buttons */}
                        {fileQueue.length > 1 && batchStatus !== 'running' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-xs btn-ghost"
                              disabled={idx === 0}
                              onClick={() => handleMoveFileInQueue(idx, 'up')}
                              style={{ padding: '2px 4px', opacity: idx === 0 ? 0.3 : 0.8 }}
                              title="Move up"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-ghost"
                              disabled={idx === fileQueue.length - 1}
                              onClick={() => handleMoveFileInQueue(idx, 'down')}
                              style={{ padding: '2px 4px', opacity: idx === fileQueue.length - 1 ? 0.3 : 0.8 }}
                              title="Move down"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </>
                        )}

                        {/* Remove file button */}
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={() => handleRemoveFileFromQueue(item.id)}
                          style={{ padding: '3px 6px', color: '#F87171' }}
                          title="Remove file from queue"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Queue Actions Footer */}
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.74rem'
                }}
              >
                <span style={{ color: 'var(--text-dim)' }}>
                  💡 Files execute sequentially from top to bottom.
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {fileQueue.some(f => f.status === 'completed') && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={handleClearCompletedFilesInQueue}
                      style={{ fontSize: '0.72rem', color: '#94A3B8' }}
                    >
                      Clear Completed
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost"
                    onClick={handleClearAllFilesInQueue}
                    style={{ fontSize: '0.72rem', color: '#F87171' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Raw Text Area */}
          <div className="card" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
            <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexWrap: 'wrap' }}>
                <FileText size={18} className="text-cyan" style={{ flexShrink: 0 }} />
                <span className="card-title">Kurdish Paragraphs Editor</span>
                <span className="badge" style={{ fontSize: '0.75rem' }}>
                  {allParagraphs.length} Samples
                </span>
                {duplicateParagraphStats.duplicateCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={handleRemoveDuplicates}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#FCA5A5',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Remove duplicate paragraphs to prevent multiple recordings of identical text"
                  >
                    <AlertCircle size={12} />
                    <span>Remove {duplicateParagraphStats.duplicateCount} Duplicates</span>
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#A78BFA' }}>
                Grouped into <strong>{packets.length}</strong> API Packets
              </div>
            </div>

            <div className="card-body" style={{ minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
              <textarea
                value={rawText || allParagraphs.join('\n\n')}
                onChange={(e) => handleRawTextChange(e.target.value)}
                placeholder="دەقە کوردییەکان لێرە بنووسە یان دابنێ. هەر بڕگەیەک بە دێڕێکی بەتاڵ جیا بکەرەوە... پشتگیری تاگی هەستەکان وەک [laugh]، [whisper]، [happy]، [sigh] دەکات."
                rows={9}
                dir="rtl"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-kurdish)',
                  fontSize: '0.96rem',
                  padding: '12px',
                  lineHeight: 1.7,
                  resize: 'vertical',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              />

              {/* Stats Bar */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  flexWrap: 'wrap',
                  gap: '6px',
                  minWidth: 0
                }}
              >
                <div>
                  <strong>{allParagraphs.length}</strong> Paragraphs • <strong>{packets.length}</strong> Packets • <strong>{packetSize}</strong> per Call
                </div>
                <div style={{ color: '#38BDF8' }}>
                  ⚡ Uses <strong>{packets.length} API Calls</strong> instead of {allParagraphs.length} calls! (Saves {Math.max(0, allParagraphs.length - packets.length)} calls)
                </div>
              </div>

              {/* Live Paragraph & Detected Emotion Tags Inspector */}
              {allParagraphs.length > 0 && (
                <div style={{ marginTop: '12px', minWidth: 0, maxWidth: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} className="text-amber" />
                      <span>Detected Paragraph Emotions ({allParagraphs.length}):</span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost"
                      onClick={() => setShowParagraphPreview(prev => !prev)}
                      style={{ fontSize: '0.74rem', padding: '2px 8px' }}
                    >
                      {showParagraphPreview ? 'Hide List' : 'Show List'}
                    </button>
                  </div>

                  {showParagraphPreview && (
                    <div 
                      style={{
                        maxHeight: '190px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        minWidth: 0,
                        maxWidth: '100%'
                      }}
                    >
                      {allParagraphs.map((p, idx) => {
                        const badge = getEmotionBadgeInfo(p);
                        const packetNum = Math.floor(idx / packetSize) + 1;
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '5px 8px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '4px',
                              borderLeft: `3px solid ${badge.color}`,
                              minWidth: 0,
                              maxWidth: '100%',
                              overflow: 'hidden'
                            }}
                          >
                            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                              #{idx + 1} (P{packetNum})
                            </span>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: badge.color,
                                background: badge.bg,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                whiteSpace: 'nowrap',
                                textTransform: 'lowercase',
                                flexShrink: 0
                              }}
                            >
                              {badge.tag}
                            </span>
                            <span 
                              dir="rtl" 
                              style={{ 
                                fontSize: '0.8rem', 
                                color: 'var(--text-muted)', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                flex: 1,
                                minWidth: 0
                              }}
                              title={p}
                            >
                              {p}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Batch Configuration & Voice Strategy */}
        <div className="studio-right" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, maxWidth: '100%' }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shuffle size={18} className="text-cyan" />
                <span className="card-title">Voice Strategy and Packet Sizing</span>
              </div>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Gemini Model & Cooldown Recovery */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="field-label" style={{ margin: 0 }}>
                    Gemini TTS Model:
                  </label>
                  <button
                    type="button"
                    onClick={handleResetCooldowns}
                    disabled={isResettingCooldowns}
                    className="chip-btn"
                    style={{ fontSize: '0.7rem', padding: '2px 8px', color: '#38BDF8' }}
                    title="Reset rate-limit cooldowns across all API keys in memory"
                  >
                    <RefreshCw size={11} className={isResettingCooldowns ? 'spin' : ''} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Reset Cooldowns
                  </button>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="select"
                  style={{ width: '100%', padding: '6px 8px', fontSize: '0.84rem' }}
                >
                  <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS (Auto-fallback to 2.5)</option>
                  <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS (High Quota)</option>
                </select>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {selectedModel === 'gemini-3.1-flash-tts-preview' ? (
                    <span>⚡ Automatically falls back to 2.5 Flash TTS when 3.1 reaches 10/day project quota.</span>
                  ) : (
                    <span>⚡ Direct mode on 2.5 Flash TTS with independent daily quota.</span>
                  )}
                </div>
              </div>

              {/* Dialect */}
              <div>
                <label className="field-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Kurdish Dialect:</span>
                  <span style={{ fontSize: '0.72rem', color: dialect === 'badini' ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 600 }}>
                    {dialect === 'badini' ? 'Duhok / Kurmanji' : 'Erbil / Sorani'}
                  </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${dialect === 'sorani' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleDialectSelect('sorani')}
                  >
                    Sorani (سۆرانی)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${dialect === 'badini' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleDialectSelect('badini')}
                  >
                    Badini (بادینی)
                  </button>
                </div>
              </div>

              {/* Default Emotion Fallback */}
              <div>
                <label className="field-label" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Default Emotion (Fallback):</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Inline [tags] always take priority</span>
                </label>
                <select
                  value={defaultEmotion}
                  onChange={(e) => setDefaultEmotion(e.target.value)}
                  className="select"
                  style={{ width: '100%', padding: '6px 8px', fontSize: '0.86rem' }}
                >
                  <option value="neutral">Auto-detect from [tags] (Fallback: neutral)</option>
                  <option value="whisper">Auto-detect from [tags] (Fallback: whisper)</option>
                  <option value="happy">Auto-detect from [tags] (Fallback: happy)</option>
                  <option value="calm">Auto-detect from [tags] (Fallback: calm)</option>
                  <option value="excited">Auto-detect from [tags] (Fallback: excited)</option>
                  <option value="laugh">Auto-detect from [tags] (Fallback: laugh)</option>
                  <option value="sad">Auto-detect from [tags] (Fallback: sad)</option>
                  <option value="angry">Auto-detect from [tags] (Fallback: angry)</option>
                  <option value="nervous">Auto-detect from [tags] (Fallback: nervous)</option>
                </select>
              </div>

              {/* Dialect Directives & 3-Language Prompt Settings */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowPromptSettings(prev => !prev)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, padding: 0 }}
                  >
                    <Sliders size={14} className="text-cyan" />
                    <span>Dialect Directives & 3-Language Prompt</span>
                    {showPromptSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <span style={{ fontSize: '0.7rem', color: splitterPromptInstruction ? 'var(--warning)' : 'var(--success)', fontWeight: 500 }}>
                    {splitterPromptInstruction ? 'Custom Directives' : 'Auto-Optimized (Active)'}
                  </span>
                </div>

                {showPromptSettings && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      <button
                        type="button"
                        className="chip-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => setSplitterPromptInstruction('')}
                        title="Use server auto-optimized prompt with authentic vowels & 5-rule code-switching"
                      >
                        ⚡ Reset to Auto-Optimized
                      </button>
                      <button
                        type="button"
                        className="chip-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => {
                          if (dialect === 'badini') {
                            setSplitterPromptInstruction('You are a native Kurdish Badini (Kurmanji) speaker and voice narrator from the Duhok/Badinan region performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Kurdish Badini pronunciation, correct Northern Kurmanji vocabulary and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە), and natural Duhok intonation. Under NO circumstances should you speak Badini with Central Sorani phonetics or Erbil/Sulaymaniyah intonation.');
                          } else {
                            setSplitterPromptInstruction('You are a native Kurdish Sorani speaker and voice narrator performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Central Kurdish (Sorani) pronunciation, correct Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation.');
                          }
                        }}
                      >
                        {dialect === 'badini' ? 'Duhok Badini Directive' : 'Erbil Sorani Directive'}
                      </button>
                      <button
                        type="button"
                        className="chip-btn"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                        onClick={() => setSplitterPromptInstruction(`You are an expert multilingual voice actor and speech synthesizer proficient in English, Kurdish (${dialect === 'badini' ? 'Badini' : 'Sorani'}), and Arabic. Read aloud every single sentence completely without skipping. Speak English with fluent English phonetics, Kurdish with authentic ${dialect === 'badini' ? 'Badini (Kurmanji) Duhok' : 'Central Sorani Erbil'} pronunciation, and Arabic with clear Arabic pronunciation. Seamlessly code-switch accents between English, Kurdish, and Arabic.`)}
                      >
                        <Globe2 size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Trilingual Directive
                      </button>
                    </div>

                    <textarea
                      className="input-control"
                      rows={3}
                      placeholder={dialect === 'badini'
                        ? 'Auto-configured for native Duhok Badini pronunciation (ڤ, خ، ح، غ، ۆ، ێ، ە) + Trilingual Code-Switching...'
                        : 'Auto-configured for native Central Kurdish Sorani pronunciation (ۆ, ێ، ە) + Trilingual Code-Switching...'
                      }
                      value={splitterPromptInstruction}
                      onChange={(e) => setSplitterPromptInstruction(e.target.value)}
                      style={{ fontSize: '0.78rem', fontFamily: 'monospace', width: '100%', resize: 'vertical' }}
                    />
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                      {dialect === 'badini' ? (
                        <span>
                          ℹ️ <strong>Badini Mode:</strong> Generates speech with authentic Duhok/Badinan intonation and Kurmanji vowels. Text must be written in Badini vocabulary (e.g., ئەڤرۆ، چاوا یی، دچمە) rather than Sorani.
                        </span>
                      ) : (
                        <span>
                          ℹ️ <strong>Sorani Mode:</strong> Generates speech with authentic Central Kurdish (Erbil/Sulaymaniyah) pronunciation.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Strategy Buttons */}
              <div>
                <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>
                  Packet Voice Allocation Strategy:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${voiceStrategy === 'mix_gender' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setVoiceStrategy('mix_gender')}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      border: voiceStrategy === 'mix_gender' ? '1px solid #C084FC' : '1px solid rgba(192, 132, 252, 0.3)',
                      background: voiceStrategy === 'mix_gender' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(192, 132, 252, 0.05)',
                      color: '#C084FC'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Dices size={13} />
                      <span>⚖ 50/50 Mix Gender</span>
                    </div>
                    <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>Alternates ♀ / ♂</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-xs ${voiceStrategy === 'random_female' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setVoiceStrategy('random_female')}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      border: voiceStrategy === 'random_female' ? '1px solid #EC4899' : '1px solid rgba(236, 72, 153, 0.3)',
                      background: voiceStrategy === 'random_female' ? 'rgba(236, 72, 153, 0.22)' : 'rgba(236, 72, 153, 0.05)',
                      color: '#F472B6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Shuffle size={13} />
                      <span>♀ Random Female</span>
                    </div>
                    <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>{femaleVoices.length} Female Voices</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-xs ${voiceStrategy === 'random_male' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setVoiceStrategy('random_male')}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      border: voiceStrategy === 'random_male' ? '1px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.3)',
                      background: voiceStrategy === 'random_male' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.05)',
                      color: '#38BDF8'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Shuffle size={13} />
                      <span>♂ Random Male</span>
                    </div>
                    <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>{maleVoices.length} Male Voices</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-xs ${voiceStrategy === 'fixed' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setVoiceStrategy('fixed')}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Volume2 size={13} />
                      <span>Fixed Voice</span>
                    </div>
                    <span style={{ fontSize: '0.66rem', opacity: 0.85 }}>Use Selected Below</span>
                  </button>
                </div>
              </div>

              {/* Voice Picker (used if Fixed or fallback) */}
              {voiceStrategy === 'fixed' && (
                <div>
                  <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Selected Single Voice:
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="select"
                    style={{ width: '100%', padding: '6px 8px', fontSize: '0.86rem' }}
                  >
                    {voices.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender}) — {v.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Packet Size (Paragraphs per request) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="field-label" style={{ margin: 0 }}>
                    Packet Size (Paragraphs per 1 API Call):
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 600 }}>
                    {packets.length} packet{packets.length > 1 ? 's' : ''} total
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[3, 4, 5, 6, 8, 10, 12].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`btn btn-xs ${packetSize === num ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handlePacketSizeChange(num)}
                      style={{ padding: '6px 2px', fontWeight: 700, fontSize: '0.74rem' }}
                      title={`Send ${num} paragraphs per single Gemini API call (${num}x quota multiplier)`}
                    >
                      {num} Chunks
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {allParagraphs.length > 0 && allParagraphs.length < packetSize ? (
                    <span style={{ color: '#FBBF24' }}>
                      ⚠️ Active file has only {allParagraphs.length} samples, so Packet 1 will process all {allParagraphs.length} chunks.
                    </span>
                  ) : (
                    <span>
                      Processes up to {packetSize} paragraphs per request ({allParagraphs.length} total samples in active file).
                    </span>
                  )}
                </div>
              </div>

              {/* Mode Switcher: Automated Batch VS Manual Review */}
              <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <button
                  type="button"
                  className={`btn btn-xs ${workflowMode === 'automated_batch' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setWorkflowMode('automated_batch')}
                  style={{ flex: 1 }}
                >
                  ⚡ Automated Batch Runner
                </button>
                <button
                  type="button"
                  className={`btn btn-xs ${workflowMode === 'manual_review' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setWorkflowMode('manual_review')}
                  style={{ flex: 1 }}
                >
                  🔍 Single-Packet Manual Review
                </button>
              </div>

              {/* Automated Runner Actions */}
              {workflowMode === 'automated_batch' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Multi-File Queue Status Indicator */}
                  {fileQueue.length > 1 && (
                    <div
                      style={{
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#94A3B8'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: 600 }}>
                        <Files size={14} />
                        Queue File {Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)} of {fileQueue.length}: {uploadedFileName || 'Active File'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: autoRemoveDuplicates ? '#38BDF8' : 'var(--text-dim)'
                          }}
                          title="Auto-Remove Duplicates before sending packets"
                        >
                          Auto-Dedupe: {autoRemoveDuplicates ? 'ON' : 'OFF'}
                        </span>
                        <span>•</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: autoAdvanceNextFile ? '#34D399' : '#F59E0B'
                          }}
                        >
                          Auto-Advance: {autoAdvanceNextFile ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  )}

                  {batchStatus === 'running' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handlePauseBatch}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Pause size={16} />
                        <span>Pause Batch</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleStopBatch}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Square size={16} />
                        <span>Stop Batch</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleStartBatch()}
                        disabled={allParagraphs.length === 0}
                        style={{
                          flex: 1,
                          minWidth: '220px',
                          padding: '12px',
                          fontSize: '0.94rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)'
                        }}
                      >
                        <Sparkles size={18} />
                        <span>
                          {batchStatus === 'paused'
                            ? `Resume Batch (Packet ${currentPacketIndex + 1}/${packets.length})`
                            : currentPacketIndex > 0 && currentPacketIndex < packets.length
                            ? `Continue Batch (Packet ${currentPacketIndex + 1}/${packets.length})`
                            : fileQueue.length > 1
                            ? `Start Automated Batch (${packets.length} Packets • File ${Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)}/${fileQueue.length})`
                            : `Start Automated Batch (${packets.length} Packets / ${allParagraphs.length} Chunks)`}
                        </span>
                      </button>

                      {(completedChunks.length > 0 || currentPacketIndex > 0) && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={handleResetBatch}
                          style={{
                            padding: '12px 16px',
                            fontSize: '0.92rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            whiteSpace: 'nowrap'
                          }}
                          title="Reset batch progress to 0"
                        >
                          <RotateCcw size={15} />
                          <span>Reset Progress</span>
                        </button>
                      )}

                      {failedPacketIndices.length > 0 && (
                        <button
                          type="button"
                          className="btn"
                          onClick={handleRetryFailed}
                          style={{
                            padding: '12px 18px',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: 'rgba(245, 158, 11, 0.18)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.45)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                          title="Retry only the packets that failed during batch execution"
                        >
                          <RotateCcw size={16} />
                          <span>Retry Failed ({failedPacketIndices.length})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Review Button */
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateManualPacket}
                  disabled={isManualGenerating || allParagraphs.length === 0}
                  style={{
                    padding: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {isManualGenerating ? (
                    <>
                      <RotateCcw className="spin" size={16} />
                      <span>Generating and Slicing Packet #1...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate First {packetSize} Chunks for Manual Review</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AUTOMATED BATCH PROGRESS & LIVE ACTIVITY LOG              */}
      {/* ========================================================= */}
      {workflowMode === 'automated_batch' && (batchStatus === 'running' || completedChunks.length > 0) && (
        <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Zap size={18} className="text-cyan" />
              <span className="card-title">Live Automated Batch Progress</span>
              <span className="badge badge-cyan">
                {completedChunks.length} / {allParagraphs.length} Saved
              </span>
              {uploadedFileName && (
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', fontSize: '0.72rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  File: {uploadedFileName} ({allParagraphs.length} samples)
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {fileQueue.length > 1 && (
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Queue File <strong>{Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)}</strong> of <strong>{fileQueue.length}</strong> •
                </span>
              )}
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Packet <strong>{Math.min(currentPacketIndex + 1, Math.max(1, packets.length))}</strong> of <strong>{Math.max(1, packets.length)}</strong> ({packets[currentPacketIndex]?.length || Math.min(packetSize, allParagraphs.length)} chunks)
              </span>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Progress Bar */}
            <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
              <div 
                style={{
                  width: `${Math.min(100, (completedChunks.length / Math.max(1, allParagraphs.length)) * 100)}%`,
                  background: 'linear-gradient(90deg, #38BDF8, #818CF8)',
                  height: '100%',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Failed Packets Alert & Quick Retry */}
            {failedPacketIndices.length > 0 && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ color: '#f87171' }} />
                  <span>
                    <strong>{failedPacketIndices.length} packet{failedPacketIndices.length > 1 ? 's' : ''}</strong> failed during batch run.
                  </span>
                </div>
                {batchStatus !== 'running' && (
                  <button
                    type="button"
                    className="btn btn-warning btn-xs"
                    onClick={handleRetryFailed}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      padding: '4px 10px'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Retry Failed ({failedPacketIndices.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* Live Terminal Log */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                maxHeight: '140px',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                color: '#94A3B8',
                minWidth: 0,
                maxWidth: '100%'
              }}
            >
              {batchLog.length === 0 ? (
                <div>Waiting to start...</div>
              ) : (
                batchLog.map((line, idx) => (
                  <div key={idx} style={{ color: line.startsWith('✔') ? '#34D399' : line.startsWith('❌') ? '#F87171' : '#E2E8F0', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {line}
                  </div>
                ))
              )}
            </div>

            {/* Live Sliced Samples Grid */}
            {completedChunks.length > 0 && (
              <div style={{ minWidth: 0, maxWidth: '100%' }}>
                <h5 style={{ margin: '8px 0', fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC' }}>
                  Recently Sliced and Saved Samples ({completedChunks.length}):
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '10px', minWidth: 0, maxWidth: '100%' }}>
                  {completedChunks.slice(-8).map((chunk, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        minWidth: 0,
                        maxWidth: '100%',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.74rem', color: '#34D399', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          ✔ Sample #{chunk.savedSample?.id || idx + 1}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {chunk.voiceName} • {chunk.duration.toFixed(1)}s {chunk.emotion && chunk.emotion !== 'neutral' && <span style={{ color: '#F59E0B', fontWeight: 600 }}>• [{chunk.emotion}]</span>}
                        </span>
                      </div>
                      <div dir="rtl" style={{ fontSize: '0.84rem', color: 'var(--text-kurdish)', maxHeight: '42px', overflow: 'hidden', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {chunk.cleanText || chunk.text}
                      </div>
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost"
                        onClick={() => handlePlayAudio(idx, chunk.audioBase64)}
                        style={{ alignSelf: 'flex-start', padding: '3px 8px', fontSize: '0.72rem' }}
                      >
                        {activePlayingId === idx ? <Pause size={12} /> : <Play size={12} />}
                        <span style={{ marginLeft: '4px' }}>Listen</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MANUAL REVIEW MODE SHOWCASE                               */}
      {/* ========================================================= */}
      {workflowMode === 'manual_review' && manualResponse && manualChunks.length > 0 && (
        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)' }}>
          <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} className="text-green" />
              <span className="card-title">Manual Review: Sliced Chunks ({manualChunks.length})</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={handleSaveManualChunks}
              disabled={isManualSavingAll || manualChunks.every(c => c.status === 'saved')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              <span>Save All to Dataset</span>
            </button>
          </div>

          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {manualChunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.78rem' }}>Chunk #{chunk.id}</span>
                    {chunk.emotion && chunk.emotion !== 'neutral' && (
                      <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.72rem', background: 'rgba(245, 158, 11, 0.18)', padding: '1px 6px', borderRadius: '4px' }}>
                        [{chunk.emotion}]
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#A78BFA', fontSize: '0.72rem' }}>⏱ {chunk.duration.toFixed(2)}s</span>
                </div>
                <div dir="rtl" style={{ fontSize: '0.9rem', color: 'var(--text-kurdish)', minHeight: '44px' }}>
                  {chunk.cleanText || chunk.text}
                </div>
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => handlePlayAudio(chunk.id, chunk.audioBase64)}
                  style={{ alignSelf: 'flex-start', padding: '4px 10px' }}
                >
                  {activePlayingId === chunk.id ? <Pause size={12} /> : <Play size={12} />}
                  <span style={{ marginLeft: '4px' }}>Play Audio</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
