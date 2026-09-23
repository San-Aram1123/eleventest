import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Save, 
  Sliders, 
  Zap, 
  Play, 
  Pause,
  Square,
  RefreshCw, 
  FileAudio,
  Languages,
  Info,
  ExternalLink,
  Tag,
  Cpu,
  Layers,
  Plus,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe2,
  Upload,
  FileText,
  RotateCcw,
  Check,
  XCircle,
  Clock,
  ListFilter,
  ListOrdered,
  Download,
  Search,
  CheckCheck,
  X,
  Mic,
  Shuffle,
  Dices,
  Scissors,
  Files,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { KurdishEditor } from '../components/KurdishEditor';
import { AudioPlayer } from '../components/AudioPlayer';
import { RatingWidget } from '../components/RatingWidget';
import { LongParagraphSplitter } from '../components/LongParagraphSplitter';
import { PairedEmotionBatchPage } from './PairedEmotionBatchPage';
import { 
  Sample, 
  GeminiVoice, 
  GeminiConfig, 
  SampleRatings, 
  GeminiKeyPoolItem,
  GeminiBatchItem,
  BatchFileQueueItem,
  KurdishDialect 
} from '../types';
import { 
  fetchGeminiConfig, 
  fetchGeminiKeyPool, 
  reloadGeminiKeyPool,
  resetGeminiCooldowns,
  probeGeminiKeys,
  addGeminiKeyToPool, 
  deleteGeminiKeyFromPool, 
  toggleGeminiKey,
  toggleAllGeminiKeys,
  toggleBulkGeminiKeys,
  generateGeminiSpeech, 
  updateSample,
  deleteSample,
  fetchDataset
} from '../services/api';
import { GeminiKeyManager } from '../components/GeminiKeyManager';

interface GeminiGenerationPageProps {
  onSampleCreated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const FALLBACK_GEMINI_VOICES: GeminiVoice[] = [
  // --- Male Voices (12) ---
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Upbeat and lively tone (Recommended Default)' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Passionate, strong, energetic tone' },
  { id: 'Orus', name: 'Orus', gender: 'Male', description: 'Calm, steady, firm tone' },
  { id: 'Enceladus', name: 'Enceladus', gender: 'Male', description: 'Soft, breathy, gentle tone' },
  { id: 'Iapetus', name: 'Iapetus', gender: 'Male', description: 'Clear, crisp, clean tone' },
  { id: 'Umbriel', name: 'Umbriel', gender: 'Male', description: 'Relaxed, easy-going, smooth tone' },
  { id: 'Algieba', name: 'Algieba', gender: 'Male', description: 'Smooth, flowing, melodic tone' },
  { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', description: 'Professional, articulate narrator tone' },
  { id: 'Schedar', name: 'Schedar', gender: 'Male', description: 'Even, balanced, steady tone' },
  { id: 'Pulcherrima', name: 'Pulcherrima', gender: 'Male', description: 'Forward, enterprising, dynamic tone' },
  { id: 'Achird', name: 'Achird', gender: 'Male', description: 'Friendly, warm, kind tone' },
  { id: 'Zubenelgenubi', name: 'Zubenelgenubi', gender: 'Male', description: 'Casual, relaxed, conversational tone' },

  // --- Female Voices (10) ---
  { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Relaxed, natural, gentle tone (Recommended Default)' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Bright, clear, vibrant tone' },
  { id: 'Leda', name: 'Leda', gender: 'Female', description: 'Youthful, energetic, cheerful tone' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'Female', description: 'Friendly, warm, easy-going tone' },
  { id: 'Autonoe', name: 'Autonoe', gender: 'Female', description: 'Bright, cheerful, lively tone' },
  { id: 'Despina', name: 'Despina', gender: 'Female', description: 'Smooth, gentle, velvety tone' },
  { id: 'Erinome', name: 'Erinome', gender: 'Female', description: 'Clear, articulate, refined tone' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'Female', description: 'Positive, upbeat, sunny tone' },
  { id: 'Achernar', name: 'Achernar', gender: 'Female', description: 'Soft, warm, delicate tone' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', gender: 'Female', description: 'Gentle, delicate, intimate tone' }
];

const GEMINI_EMOTION_TAGS = [
  { tag: '[laugh]', label: 'Laugh', desc: 'Natural Kurdish laughter inflection', color: '#10B981' },
  { tag: '[whisper]', label: 'Whisper', desc: 'Soft breathy whisper', color: '#A78BFA' },
  { tag: '[happy]', label: 'Happy', desc: 'Joyful & cheerful delivery', color: '#F59E0B' },
  { tag: '[sad]', label: 'Sad', desc: 'Melancholic & slow cadence', color: '#60A5FA' },
  { tag: '[angry]', label: 'Angry', desc: 'Sharp intense emphasis', color: '#EF4444' },
  { tag: '[sigh]', label: 'Sigh', desc: 'Expressive sigh / breath', color: '#38BDF8' },
  { tag: '[shouting]', label: 'Shout', desc: 'Loud energetic exclamation', color: '#EC4899' },
  { tag: '[giggle]', label: 'Giggle', desc: 'Light cheerful giggle', color: '#34D399' },
  { tag: '[crying]', label: 'Crying', desc: 'Emotional tearful tone', color: '#818CF8' }
];

const SORANI_PRESETS = [
  { 
    label: 'سڵاو لەگەڵ پێکەنین (Happy + Laugh)', 
    text: 'سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش و ناوازە ڕوویدا.',
    emotion: 'laugh'
  },
  { 
    label: 'چرپەی نهێنی (Whisper Secret)', 
    text: '[whisper] گوێ بگرە، دەمەوێت نهێنییەکی زۆر گرنگت پێ بڵێم.',
    emotion: 'whisper'
  },
  { 
    label: 'دەقی هەستیار (Emotional Story)', 
    text: 'کاتێک لە لووتکەی شاخی پیرەمەگروون وەستابووم، [sigh] هەموو شارەکە وەک تابلۆیەکی ڕەنگاوڕەنگ لە پێش چاوم دەدرەوشایەوە.',
    emotion: 'happy'
  },
  { 
    label: 'تێکەڵ: ئینگلیزی + کوردی + عەرەبی (Multilingual)', 
    text: 'Welcome everyone to our presentation! ئەمڕۆ باسی تەکنەلۆژیا دەکەین. أهلاً وسهلاً بكم جميعاً.',
    emotion: 'neutral'
  },
  { 
    label: 'پێناسەی فەرمی (Formal / News)', 
    text: 'بەپێی دواین ڕاپۆرتی کەشناسی، لە ماوەی بیست و چوار کاتژمێری داهاتوودا پلەکانی گەرما لە سەرانسەری هەرێمی کوردستان دادەبەزن.',
    emotion: 'neutral'
  },
  { 
    label: 'پرسیار و گفتوگۆ (Dialogue)', 
    text: 'ئایا دەزانیت [laugh] جیاوازی چییە لە نێوان دەنگەکانی ڕێی قەڵەو و ڕێی باریک لە زمانی کوردیدا؟',
    emotion: 'laugh'
  }
];

const BADINI_PRESETS = [
  { 
    label: 'سلاڤ دگەل کەنینێ (Happy + Laugh)', 
    text: 'سلاڤ! [laugh] ئەڤرۆ ئەز گەلەکێ کەیفخوەشم، [laugh] ژبەرکو تشتەکێ گەلەک خوەش و ناوازە چێبوو.',
    emotion: 'laugh'
  },
  { 
    label: 'چرپەیا نهێنی (Whisper Secret)', 
    text: '[whisper] گوهێ خوە بدێ، دڤێت ئەز نهێنیەکا گەلەک گرنگ بۆ تە بێژم.',
    emotion: 'whisper'
  },
  { 
    label: 'دەقێ هەستیار (Emotional Story)', 
    text: 'دەما ئەز ل سەرێ چیایێ گارەی راوەستایی، [sigh] هەمی باژێر وەکی تابلۆیەکی ڕەنگاوڕەنگ د پێش چاڤێن من دا د درەوشیا.',
    emotion: 'happy'
  },
  { 
    label: 'تێکەڵ: ئینگلیزی + بادینی + عەرەبی (Multilingual)', 
    text: 'Good morning everyone! ئەڤرۆ دێ بەحسێ زانستێ کەشوهەوایی کەین. مرحباً بكم جميعاً.',
    emotion: 'neutral'
  },
  { 
    label: 'پێناسەیا فەرمی (Formal / News)', 
    text: 'ل دویڤ داوی راپۆرتا سەقای، د ماوێ بیست و چوار دەمژمێرێن بهێت دا پلەیێن گەرماتیێ ل سەرانسەری پارێزگەها دهۆکێ دێ نزم بن.',
    emotion: 'neutral'
  },
  { 
    label: 'پرسیار و گەنگەشە (Dialogue)', 
    text: 'ما تو دزانی [laugh] جوداهیا سەرەکی د ناڤبەرا زارەڤێ بادینی و سۆرانی دا د زمانی کوردیدا چییە؟',
    emotion: 'laugh'
  }
];

const BATCH_STORAGE_KEY = 'kurdish_tts_gemini_batch_v2';

interface StoredGeminiBatchState {
  version: number;
  savedAt: string;
  activeTab?: 'single' | 'bulk' | 'paired';
  uploadedFileName?: string;
  rawBatchInput?: string;
  batchItems: GeminiBatchItem[];
  fileQueue?: BatchFileQueueItem[];
  activeFileId?: string | null;
  autoAdvanceNextFile?: boolean;
  batchState?: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  batchDelayMs?: number;
  batchFilter?: 'all' | 'completed' | 'failed' | 'pending';
  batchVoiceMode?: 'fixed' | 'random_female' | 'random_male' | 'mix_gender';
  dialect?: KurdishDialect;
  selectedVoice?: string;
  selectedModel?: string;
  customInstruction?: string;
}

function getStoredBatchState(): StoredGeminiBatchState | null {
  try {
    const raw = localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.batchItems)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved batch state:', e);
  }
  return null;
}

function saveStoredBatchState(state: StoredGeminiBatchState) {
  try {
    localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save batch state to storage:', e);
  }
}

function clearStoredBatchState() {
  try {
    localStorage.removeItem(BATCH_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Normalizes Kurdish text for robust duplicate comparison against existing dataset items.
 * Removes inline bracket tags, zero-width characters, punctuation, and extraneous spaces.
 */
function normalizeKurdishCompare(t: string): string {
  if (!t) return '';
  return t
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // strip [laugh], [whisper], etc.
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width spaces/joiners
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export const GeminiGenerationPage: React.FC<GeminiGenerationPageProps> = ({
  onSampleCreated,
  addToast
}) => {
  const initialSaved = useRef(getStoredBatchState()).current;

  // Mode selection: 'single' vs 'bulk' vs 'paired'
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'paired'>(() => initialSaved?.activeTab || 'single');
  // Sub-mode inside bulk: 'standard' (existing line-by-line batch) vs 'long_split' (single-call multi-chunk)
  const [bulkSubMode, setBulkSubMode] = useState<'standard' | 'long_split'>('standard');

  // Common configuration
  const [dialect, setDialect] = useState<KurdishDialect>(() => initialSaved?.dialect || 'sorani');
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfig | null>(null);
  const [keyPool, setKeyPool] = useState<GeminiKeyPoolItem[]>([]);
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [isReloadingKeys, setIsReloadingKeys] = useState(false);
  
  // Voice & Model selection
  const [selectedVoice, setSelectedVoice] = useState(() => initialSaved?.selectedVoice || 'Puck');
  const [selectedModel, setSelectedModel] = useState(() => initialSaved?.selectedModel || 'gemini-3.1-flash-tts-preview');
  const [customInstruction, setCustomInstruction] = useState(() => initialSaved?.customInstruction || '');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [probingKeyIndex, setProbingKeyIndex] = useState<number | null>(null);

  // Voice filtering & distribution controls
  const [singleVoiceGenderFilter, setSingleVoiceGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [singleVoiceSearch, setSingleVoiceSearch] = useState('');
  const [batchVoiceMode, setBatchVoiceMode] = useState<'fixed' | 'random_female' | 'random_male' | 'mix_gender'>(
    () => initialSaved?.batchVoiceMode || 'fixed'
  );
  const [batchVoiceGenderFilter, setBatchVoiceGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');

  // Computed voices and models lists available across all component handlers
  const voices = geminiConfig?.voices?.length ? geminiConfig.voices : FALLBACK_GEMINI_VOICES;
  const models = geminiConfig?.models?.length ? geminiConfig.models : [
    { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS (Default / Recommended)' },
    { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS' },
    { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro Preview TTS' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }
  ];

  const filteredSingleVoices = voices.filter(v => {
    if (singleVoiceGenderFilter !== 'all' && v.gender !== singleVoiceGenderFilter) return false;
    if (singleVoiceSearch.trim()) {
      const q = singleVoiceSearch.toLowerCase().trim();
      return v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q);
    }
    return true;
  });

  // ----------------------------------------------------
  // SINGLE GENERATION STATE
  // ----------------------------------------------------
  const [text, setText] = useState('سڵاو! [laugh] من مۆدێلی دەنگی جێمینایم بە دەنگی پاک (Puck) و بە زمانی کوردی سۆرانی [happy] قسە دەکەم.');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSample, setGeneratedSample] = useState<Sample | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [usedKeyMasked, setUsedKeyMasked] = useState<string>('');
  const [activeRatings, setActiveRatings] = useState<SampleRatings>({
    naturalness: 0,
    emotion: 0,
    pronunciation: 0,
    overall: 0,
    notes: ''
  });

  // ----------------------------------------------------
  // BULK FILE & BATCH PROCESSING STATE
  // ----------------------------------------------------
  const [uploadedFileName, setUploadedFileName] = useState<string>(() => initialSaved?.uploadedFileName || '');
  const [rawBatchInput, setRawBatchInput] = useState<string>(() => initialSaved?.rawBatchInput || '');
  const [batchItems, setBatchItems] = useState<GeminiBatchItem[]>(() => initialSaved?.batchItems || []);
  const [batchState, setBatchState] = useState<'idle' | 'running' | 'paused' | 'completed' | 'stopped'>(() => {
    if (!initialSaved?.batchItems || initialSaved.batchItems.length === 0) return 'idle';
    if (initialSaved.batchState === 'running') return 'paused';
    return initialSaved.batchState || 'idle';
  });
  const [currentProcessingId, setCurrentProcessingId] = useState<number | null>(null);
  const [batchDelayMs, setBatchDelayMs] = useState<number>(() => initialSaved?.batchDelayMs || 1000);
  const [batchFilter, setBatchFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>(() => initialSaved?.batchFilter || 'all');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanningDataset, setIsScanningDataset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multi-File Queue State
  const [fileQueue, setFileQueue] = useState<BatchFileQueueItem[]>(() => initialSaved?.fileQueue || []);
  const [activeFileId, setActiveFileId] = useState<string | null>(() => initialSaved?.activeFileId || null);
  const [autoAdvanceNextFile, setAutoAdvanceNextFile] = useState<boolean>(() => {
    const saved = localStorage.getItem('gemini_batch_auto_advance');
    if (saved !== null) return saved === 'true';
    if (initialSaved?.autoAdvanceNextFile !== undefined) return initialSaved.autoAdvanceNextFile;
    return true; // Enabled by default so multiple files run sequentially
  });

  const fileQueueRef = useRef<BatchFileQueueItem[]>(fileQueue);
  const activeFileIdRef = useRef<string | null>(activeFileId);
  const autoAdvanceNextFileRef = useRef<boolean>(autoAdvanceNextFile);

  useEffect(() => {
    fileQueueRef.current = fileQueue;
  }, [fileQueue]);

  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  useEffect(() => {
    autoAdvanceNextFileRef.current = autoAdvanceNextFile;
    localStorage.setItem('gemini_batch_auto_advance', String(autoAdvanceNextFile));
  }, [autoAdvanceNextFile]);

  // Auto-resume on rate-limit / circuit breaker state
  const [autoResumeEnabled, setAutoResumeEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('gemini_auto_resume_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoResumeMinutes, setAutoResumeMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('gemini_auto_resume_minutes');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [autoResumeCountdown, setAutoResumeCountdown] = useState<number | null>(null);
  const autoResumeTimerRef = useRef<any>(null);

  const clearAutoResumeTimer = () => {
    if (autoResumeTimerRef.current) {
      clearInterval(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    setAutoResumeCountdown(null);
  };

  // Execution control refs for reliable loop pausing/stopping and strict concurrency prevention
  const batchRunIdRef = useRef(0);
  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);
  const isBatchRunningRef = useRef(false);
  const activeProcessingLineNumbersRef = useRef<Set<number>>(new Set());
  const batchItemsRef = useRef<GeminiBatchItem[]>([]);
  const startBatchExecutionRef = useRef<((itemsToRun: GeminiBatchItem[], forceRegenerate?: boolean) => Promise<void>) | null>(null);

  // Cleanup auto-resume interval on unmount
  useEffect(() => {
    return () => {
      if (autoResumeTimerRef.current) {
        clearInterval(autoResumeTimerRef.current);
      }
    };
  }, []);

  // Keep ref synchronized with state
  useEffect(() => {
    batchItemsRef.current = batchItems;
  }, [batchItems]);

  // Auto-persist batch state to LocalStorage
  useEffect(() => {
    if (batchItems.length > 0 || uploadedFileName || rawBatchInput || fileQueue.length > 0) {
      saveStoredBatchState({
        version: 2,
        savedAt: new Date().toISOString(),
        activeTab,
        uploadedFileName,
        rawBatchInput,
        batchItems,
        fileQueue,
        activeFileId,
        autoAdvanceNextFile,
        batchState: batchState === 'running' ? 'paused' : batchState,
        batchDelayMs,
        batchFilter,
        dialect,
        selectedVoice,
        selectedModel,
        customInstruction,
        batchVoiceMode
      });
    }
  }, [
    batchItems,
    batchState,
    uploadedFileName,
    rawBatchInput,
    fileQueue,
    activeFileId,
    autoAdvanceNextFile,
    batchDelayMs,
    batchFilter,
    batchVoiceMode,
    dialect,
    selectedVoice,
    selectedModel,
    customInstruction,
    activeTab
  ]);

  useEffect(() => {
    loadConfigAndPool();
  }, []);

  // Live 1-second countdown ticker for key quota cooldown recovery
  useEffect(() => {
    const timer = setInterval(() => {
      setKeyPool(prev => {
        let hasChanges = false;
        const updated = prev.map(k => {
          if (k.remainingSeconds !== undefined && k.remainingSeconds > 0) {
            hasChanges = true;
            const nextSec = k.remainingSeconds - 1;
            if (nextSec <= 0) {
              return {
                ...k,
                status: 'ready' as const,
                remainingSeconds: 0,
                error: null
              };
            }
            return {
              ...k,
              remainingSeconds: nextSec
            };
          }
          return k;
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadConfigAndPool = async () => {
    try {
      const [cfg, poolData] = await Promise.all([
        fetchGeminiConfig().catch(() => null),
        fetchGeminiKeyPool().catch(() => ({ pool: [], poolSize: 0, activeKeyIndex: 0 }))
      ]);
      if (cfg) {
        setGeminiConfig(cfg);
        // Only apply system default if user hasn't already restored or chosen a custom voice/model
        setSelectedVoice(prev => (prev && prev !== 'Puck') ? prev : (initialSaved?.selectedVoice || cfg.defaultVoice || 'Puck'));
        setSelectedModel(prev => (prev && prev !== 'gemini-3.1-flash-tts-preview') ? prev : (initialSaved?.selectedModel || cfg.defaultModel || 'gemini-3.1-flash-tts-preview'));
      }
      setKeyPool(poolData.pool || []);
    } catch (err: any) {
      console.warn('Failed to load Gemini config:', err.message);
    }
  };

  const handleReloadKeys = async () => {
    setIsReloadingKeys(true);
    try {
      const res = await reloadGeminiKeyPool();
      setKeyPool(res.pool || []);
      const readyCount = res.readyCount ?? (res.pool || []).filter(k => k.status === 'ready').length;
      addToast({
        type: 'success',
        title: 'Gemini Keys Live Probed',
        message: `${readyCount} of ${res.poolSize} keys responded HTTP 200 (Active with Quota on Google API).`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Probe Keys',
        message: err.message || 'Error validating keys against Google AI Studio'
      });
    } finally {
      setIsReloadingKeys(false);
    }
  };

  const handleResetCooldowns = async () => {
    try {
      const res = await resetGeminiCooldowns();
      setKeyPool(res.pool || []);
      addToast({
        type: 'success',
        title: 'Cooldowns Cleared',
        message: 'All Gemini key rate-limit cooldowns have been cleared. Keys are ready!'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Could not reset cooldowns'
      });
    }
  };

  const handleProbeSingleKey = async (idx: number) => {
    setProbingKeyIndex(idx);
    try {
      const res = await probeGeminiKeys(idx);
      if (res.pool) {
        setKeyPool(res.pool);
      }
      const probe = res.probe;
      if (probe?.hasQuota) {
        addToast({
          type: 'success',
          title: `Key #${idx + 1} (${res.maskedKey}) is LIVE`,
          message: `Google API responded HTTP 200 OK. Key has quota and is active right now!`
        });
      } else if (probe?.status === 'exhausted') {
        addToast({
          type: 'info',
          title: `Key #${idx + 1} (${res.maskedKey}) Quota Limited`,
          message: `Google API responded HTTP 429: ${probe.error?.slice(0, 100) || 'Rate limit active'}. Retry in ${probe.remainingSeconds}s.`
        });
      } else {
        addToast({
          type: 'error',
          title: `Key #${idx + 1} (${res.maskedKey}) Denied`,
          message: `Google API responded HTTP ${probe?.httpStatus || 400}: ${probe?.error || 'Access Denied / Invalid key'}`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: `Key #${idx + 1} Probe Error`,
        message: err.message
      });
    } finally {
      setProbingKeyIndex(null);
    }
  };

  const handleDialectChange = (newDialect: KurdishDialect) => {
    setDialect(newDialect);
    if (newDialect === 'badini') {
      if (activeTab === 'single') {
        setText('سلاڤ! [laugh] ئەز مۆدێلا دەنگی یا جێمینایم ب دەنگێ پاک (Puck) و ب زارەڤێ کوردیێ بادینی [happy] د ئاخڤم.');
      }
      if (customInstruction.includes('Kurdish (Sorani)')) {
        setCustomInstruction(customInstruction.replace(/Kurdish\s*\(\s*Sorani\s*\)/gi, 'Kurdish (Badini)'));
      }
      addToast({ type: 'info', title: 'Dialect Changed', message: 'Switched to Kurdish Badini (Northern Kurmanji / Duhok).' });
    } else {
      if (activeTab === 'single') {
        setText('سڵاو! [laugh] من مۆدێلی دەنگی جێمینایم بە دەنگی پاک (Puck) و بە زمانی کوردی سۆرانی [happy] قسە دەکەم.');
      }
      if (customInstruction.includes('Kurdish (Badini)')) {
        setCustomInstruction(customInstruction.replace(/Kurdish\s*\(\s*Badini\s*\)/gi, 'Kurdish (Sorani)'));
      }
      addToast({ type: 'info', title: 'Dialect Changed', message: 'Switched to Kurdish Sorani (Central Kurdish).' });
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyInput.trim()) return;

    setIsSavingKey(true);
    try {
      const res = await addGeminiKeyToPool(customKeyInput.trim());
      addToast({ type: 'success', title: 'Gemini Key Added to Pool', message: res.message });
      setCustomKeyInput('');
      await loadConfigAndPool();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to Add Gemini Key', message: err.message });
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteKey = async (index: number) => {
    try {
      await deleteGeminiKeyFromPool(index);
      addToast({ type: 'info', title: 'Key Removed', message: 'Gemini key deleted from failover pool.' });
      await loadConfigAndPool();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to Delete Key', message: err.message });
    }
  };

  const handleToggleKey = async (index: number, enabled?: boolean) => {
    try {
      const res = await toggleGeminiKey(index, enabled);
      if (res.pool) {
        setKeyPool(res.pool);
      }
      addToast({
        type: 'info',
        title: res.isEnabled ? 'Gemini Key Turned ON' : 'Gemini Key Turned OFF',
        message: res.message
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Toggle Key',
        message: err.message || 'Could not update key state'
      });
    }
  };

  const handleToggleAllKeys = async (enabled: boolean) => {
    try {
      const res = await toggleAllGeminiKeys(enabled);
      if (res.pool) {
        setKeyPool(res.pool);
      }
      addToast({
        type: 'info',
        title: enabled ? 'All Keys Enabled' : 'All Keys Turned OFF',
        message: res.message
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Toggle Keys',
        message: err.message || 'Could not update keys'
      });
    }
  };

  const handleToggleBulkKeys = async (indices: number[], enabled: boolean) => {
    try {
      const res = await toggleBulkGeminiKeys(indices, enabled);
      if (res.pool) {
        setKeyPool(res.pool);
      }
      addToast({
        type: 'info',
        title: enabled ? `${indices.length} Keys Enabled` : `${indices.length} Keys Turned OFF`,
        message: res.message
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Toggle Selected Keys',
        message: err.message || 'Could not update keys'
      });
    }
  };

  // Cursor-aware insertion for single text editor
  const insertAtCursor = (textToInsert: string, isTag = false) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText(prev => `${prev} ${textToInsert}`);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    const before = text.substring(0, start);
    const after = text.substring(end);

    let formatted = textToInsert;
    if (isTag) {
      const needsLeadingSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
      const needsTrailingSpace = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');
      formatted = `${needsLeadingSpace ? ' ' : ''}${textToInsert}${needsTrailingSpace ? ' ' : ' '}`;
    }

    const updated = before + formatted + after;
    setText(updated);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + formatted.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleInsertTag = (tag: string) => {
    insertAtCursor(tag, true);
    addToast({
      type: 'info',
      title: `Tag ${tag} Inserted`,
      message: `Inserted ${tag} at cursor position.`
    });
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      addToast({ type: 'error', title: 'Text Required', message: 'Please enter Kurdish text to synthesize.' });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateGeminiSpeech({
        text: text.trim(),
        voiceName: selectedVoice,
        dialect: dialect,
        model: selectedModel,
        promptInstruction: customInstruction.trim() || undefined,
        saveToDataset: true
      });

      if (res.sample) {
        setGeneratedSample(res.sample);
        setGeneratedAudioUrl(res.sample.audioUrl || `/api/dataset/${res.sample.id}/audio`);
        setDuration(res.durationSeconds || 0);
        setDetectedTags(res.detectedTags || []);
        setUsedKeyMasked(res.usedKeyMasked || '');
        onSampleCreated(res.sample);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });

        addToast({
          type: 'success',
          title: `${dialect === 'badini' ? 'Badini' : 'Sorani'} Audio Generated!`,
          message: `Sample #${res.sample.id} created with '${selectedVoice}' on ${res.model} (${res.durationSeconds}s)`
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gemini Generation Failed',
        message: err.message || 'Error generating speech with Gemini'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRatingsChange = async (newRatings: SampleRatings) => {
    setActiveRatings(newRatings);
    if (generatedSample) {
      try {
        const updated = await updateSample(generatedSample.id, { ratings: newRatings });
        setGeneratedSample(updated);
        addToast({ type: 'success', title: 'Rating Saved', message: 'Evaluation recorded in dataset & MySQL.' });
      } catch (err: any) {
        addToast({ type: 'error', title: 'Failed to update rating', message: err.message });
      }
    }
  };

  // ----------------------------------------------------
  // BULK FILE UPLOAD & LINE PARSER LOGIC
  // ----------------------------------------------------
  const parseLinesToItems = async (content: string, fileName = 'file.txt', silentToast = false): Promise<GeminiBatchItem[]> => {
    const rawLines = content.split(/\r?\n/);
    const parsed: GeminiBatchItem[] = [];
    let count = 1;

    // Fetch existing dataset samples to automatically check for duplicates
    let existingDataset: Sample[] = [];
    try {
      existingDataset = await fetchDataset();
    } catch (e) {
      console.warn('Could not fetch dataset for duplicate detection:', e);
    }

    let matchedDuplicates = 0;

    // Pre-calculate 50/50 balanced gender sequence for mix_gender mode
    const nonEmptyCount = rawLines.filter(l => l.trim().length > 0).length;
    const numFemaleLines = Math.floor(nonEmptyCount / 2);
    const numMaleLines = nonEmptyCount - numFemaleLines;
    const preallocatedMixGenders: ('Female' | 'Male')[] = [
      ...Array(numFemaleLines).fill('Female'),
      ...Array(numMaleLines).fill('Male')
    ];
    for (let i = preallocatedMixGenders.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [preallocatedMixGenders[i], preallocatedMixGenders[j]] = [preallocatedMixGenders[j], preallocatedMixGenders[i]];
    }

    for (const raw of rawLines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      const inlineTags = (trimmed.match(/\[([a-zA-Z0-9_\s-]+)\]/g) || []);
      const clean = trimmed.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '').replace(/\s+/g, ' ').trim();
      const normText = normalizeKurdishCompare(clean || trimmed);

      // Determine voice according to current batchVoiceMode
      let lineVoice = selectedVoice;
      let lineGender: 'Male' | 'Female' = 'Male';

      if (batchVoiceMode === 'random_female') {
        const femaleVoices = voices.filter(v => v.gender === 'Female');
        if (femaleVoices.length > 0) {
          const picked = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
          lineVoice = picked.id;
          lineGender = 'Female';
        }
      } else if (batchVoiceMode === 'random_male') {
        const maleVoices = voices.filter(v => v.gender === 'Male');
        if (maleVoices.length > 0) {
          const picked = maleVoices[Math.floor(Math.random() * maleVoices.length)];
          lineVoice = picked.id;
          lineGender = 'Male';
        }
      } else if (batchVoiceMode === 'mix_gender') {
        const assignedGender = preallocatedMixGenders[count - 1] || (count % 2 === 1 ? 'Female' : 'Male');
        const pool = assignedGender === 'Female'
          ? voices.filter(v => v.gender === 'Female')
          : voices.filter(v => v.gender === 'Male');
        if (pool.length > 0) {
          const picked = pool[Math.floor(Math.random() * pool.length)];
          lineVoice = picked.id;
          lineGender = assignedGender;
        }
      } else {
        const found = voices.find(v => v.id === selectedVoice);
        lineVoice = selectedVoice;
        lineGender = (found?.gender === 'Female' ? 'Female' : 'Male');
      }

      // Check if this line is already synthesized and saved in the dataset
      const matchedSample = normText.length > 0
        ? existingDataset.find(s => {
            const sNorm = normalizeKurdishCompare(s.cleanText || s.text);
            return sNorm === normText;
          })
        : undefined;

      if (matchedSample) {
        matchedDuplicates++;
        parsed.push({
          id: count,
          lineNumber: count,
          text: trimmed,
          cleanText: clean || trimmed,
          status: 'completed',
          sample: matchedSample,
          duration: matchedSample.durationSeconds,
          tags: inlineTags,
          voiceName: matchedSample.voice_name?.replace(/^Gemini \((.*)\)$/, '$1') || lineVoice,
          voiceGender: lineGender,
          keyUsed: `Dataset #${matchedSample.id}`
        });
      } else {
        parsed.push({
          id: count,
          lineNumber: count,
          text: trimmed,
          cleanText: clean || trimmed,
          status: 'pending',
          voiceName: lineVoice,
          voiceGender: lineGender,
          tags: inlineTags
        });
      }
      count++;
    }

    setUploadedFileName(fileName);
    setBatchItems(parsed);
    if (!silentToast) {
      setBatchState('idle');
      setCurrentProcessingId(null);
    }

    if (!silentToast) {
      if (matchedDuplicates > 0) {
        addToast({
          type: 'success',
          title: 'Dataset Duplicates Auto-Detected!',
          message: `Loaded ${parsed.length} lines: ${matchedDuplicates} already exist in Dataset (marked Completed & skipped), ${parsed.length - matchedDuplicates} new lines queued.`
        });
      } else {
        addToast({
          type: 'success',
          title: 'File Parsed Successfully',
          message: `Loaded ${parsed.length} line(s) from "${fileName}". Ready to generate speech!`
        });
      }
    }

    return parsed;
  };

  const handleProcessMultipleFiles = async (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(f => 
      f.name.match(/\.(txt|csv|tsv|jsonl)$/i)
    );

    if (validFiles.length === 0) {
      addToast({
        type: 'error',
        title: 'Unsupported File Format',
        message: 'Please upload Kurdish text files (.txt, .csv, .tsv, .jsonl).'
      });
      return;
    }

    const readFile = (file: File): Promise<{ fileName: string; content: string; lineCount: number }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = (event.target?.result as string) || '';
          const lineCount = content.split(/\r?\n/).filter(l => l.trim().length > 0).length;
          resolve({ fileName: file.name, content, lineCount });
        };
        reader.readAsText(file);
      });
    };

    const loadedFiles = await Promise.all(validFiles.map(readFile));

    const newQueueItems: BatchFileQueueItem[] = loadedFiles.map(lf => ({
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName: lf.fileName,
      content: lf.content,
      lineCount: lf.lineCount,
      status: 'queued',
      addedAt: new Date().toISOString()
    }));

    const currentQueue = fileQueueRef.current;
    if (currentQueue.length === 0 || (!activeFileIdRef.current && batchItemsRef.current.length === 0)) {
      newQueueItems[0].status = 'active';
      const first = newQueueItems[0];
      setFileQueue(newQueueItems);
      setActiveFileId(first.id);
      await parseLinesToItems(first.content, first.fileName);
      if (newQueueItems.length > 1) {
        addToast({
          type: 'info',
          title: 'Multiple Files Queued',
          message: `Loaded "${first.fileName}" (${first.lineCount} lines). ${newQueueItems.length - 1} more file(s) waiting in queue for sequential processing.`
        });
      }
    } else {
      setFileQueue(prev => [...prev, ...newQueueItems]);
      addToast({
        type: 'success',
        title: 'Files Added to Queue',
        message: `Added ${newQueueItems.length} file(s) to Queue (${currentQueue.length + newQueueItems.length} total in queue).`
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleProcessMultipleFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      handleProcessMultipleFiles(files);
    }
  };

  const handleParseRawInput = async () => {
    if (!rawBatchInput.trim()) {
      addToast({ type: 'error', title: 'Input Empty', message: 'Please paste Kurdish text with multiple lines.' });
      return;
    }
    const fileName = `Pasted_Text_${fileQueue.length + 1}.txt`;
    const lineCount = rawBatchInput.split(/\r?\n/).filter(l => l.trim().length > 0).length;
    const newQueueItem: BatchFileQueueItem = {
      id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      fileName,
      content: rawBatchInput,
      lineCount,
      status: 'queued',
      addedAt: new Date().toISOString()
    };

    if (fileQueue.length === 0 || (!activeFileId && batchItems.length === 0)) {
      newQueueItem.status = 'active';
      setFileQueue([newQueueItem]);
      setActiveFileId(newQueueItem.id);
      await parseLinesToItems(rawBatchInput, fileName);
    } else {
      setFileQueue(prev => [...prev, newQueueItem]);
      addToast({
        type: 'success',
        title: 'Pasted Text Queued',
        message: `Added "${fileName}" (${lineCount} lines) to File Queue.`
      });
    }
    setRawBatchInput('');
  };

  const handleSwitchActiveFile = async (fileId: string) => {
    if (isBatchRunningRef.current || batchState === 'running') {
      addToast({
        type: 'info',
        title: 'Batch In Progress',
        message: 'Please pause or stop the current batch before switching files.'
      });
      return;
    }

    const targetFile = fileQueue.find(f => f.id === fileId);
    if (!targetFile) return;

    setFileQueue(prev => prev.map(f => {
      if (f.id === fileId) return { ...f, status: 'active' };
      if (f.status === 'active') return { ...f, status: f.completedLines ? 'completed' : 'queued' };
      return f;
    }));
    setActiveFileId(targetFile.id);
    await parseLinesToItems(targetFile.content, targetFile.fileName);
  };

  const handleRemoveFileFromQueue = (fileId: string) => {
    if (isBatchRunningRef.current && activeFileId === fileId) {
      addToast({
        type: 'info',
        title: 'File Is Active',
        message: 'Stop the batch before removing the currently processing file.'
      });
      return;
    }

    setFileQueue(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileId(null);
      setUploadedFileName('');
      setBatchItems([]);
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
    if (isBatchRunningRef.current) {
      handleStopBatch();
    }
    setFileQueue([]);
    setActiveFileId(null);
    handleClearBatch();
  };

  /**
   * Randomizes voices across all paragraphs in the batch strictly by gender (0% mix).
   * If Female is selected: 100% Female voices, 0% Male voices.
   * If Male is selected: 100% Male voices, 0% Female voices.
   */
  const handleRandomizeVoices = (gender: 'Female' | 'Male') => {
    const targetVoices = voices.filter(v => v.gender === gender);
    if (targetVoices.length === 0) return;

    const newMode = gender === 'Female' ? 'random_female' : 'random_male';
    setBatchVoiceMode(newMode);

    setBatchItems(prev => prev.map(item => {
      // Completed items preserve their recorded voice
      if (item.status === 'completed') return item;
      const picked = targetVoices[Math.floor(Math.random() * targetVoices.length)];
      return {
        ...item,
        voiceName: picked.id,
        voiceGender: gender
      };
    }));

    addToast({
      type: 'success',
      title: `Randomized ${gender} Voices Active`,
      message: `Assigned a different random ${gender.toLowerCase()} voice to each paragraph (strictly 100% ${gender.toLowerCase()}, 0% ${gender === 'Female' ? 'male' : 'female'}).`
    });
  };

  /**
   * Randomizes voices across all paragraphs in the batch with a balanced 50/50 gender distribution.
   * 50% Female voices and 50% Male voices assigned to paragraphs, choosing varied voices
   * from the 13 Female and 17 Male Gemini HD voice pools.
   */
  const handleRandomizeMixVoices = () => {
    const femaleVoices = voices.filter(v => v.gender === 'Female');
    const maleVoices = voices.filter(v => v.gender === 'Male');
    if (femaleVoices.length === 0 && maleVoices.length === 0) return;

    setBatchVoiceMode('mix_gender');

    setBatchItems(prev => {
      const pendingItems = prev.filter(item => item.status !== 'completed');
      const totalToAssign = pendingItems.length;
      if (totalToAssign === 0) return prev;

      const numFemale = Math.floor(totalToAssign / 2);
      const numMale = totalToAssign - numFemale;

      const genders: ('Female' | 'Male')[] = [
        ...Array(numFemale).fill('Female'),
        ...Array(numMale).fill('Male')
      ];

      // Natural Fisher-Yates shuffle for balanced randomized distribution
      for (let i = genders.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [genders[i], genders[j]] = [genders[j], genders[i]];
      }

      let genderIdx = 0;
      return prev.map(item => {
        if (item.status === 'completed') return item;
        const assignedGender = genders[genderIdx++];
        const pool = assignedGender === 'Female' ? femaleVoices : maleVoices;
        const picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
        return {
          ...item,
          voiceName: picked?.id || (assignedGender === 'Female' ? 'Aoede' : 'Puck'),
          voiceGender: assignedGender
        };
      });
    });

    addToast({
      type: 'success',
      title: 'Mix Gender (50/50) Active',
      message: 'Assigned 50/50 balanced male and female voices across paragraphs.'
    });
  };

  // ----------------------------------------------------
  // RESILIENT BATCH SYNTHESIS ENGINE
  // ----------------------------------------------------
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Triggers clean resumption: resets failed lines to pending, reloads key pool, and starts batch synthesis
  const triggerResumeBatch = async () => {
    clearAutoResumeTimer();
    await loadConfigAndPool();

    // Signal any previous loop to cancel cleanly
    batchRunIdRef.current++;
    isStoppedRef.current = false;
    isPausedRef.current = false;
    isBatchRunningRef.current = false;

    // Reset any failed items to pending so they get retried with refreshed keys
    const currentItems = batchItemsRef.current;
    const resetItems = currentItems.map(it => 
      it.status === 'failed' ? { ...it, status: 'pending' as const, error: undefined } : it
    );
    setBatchItems(resetItems);
    batchItemsRef.current = resetItems;

    const toRun = resetItems.filter(it => it.status === 'pending');
    if (toRun.length > 0) {
      startBatchExecution(toRun, true);
    } else {
      setBatchState('completed');
    }
  };

  const advanceToNextQueuedFile = async (finishedFileId?: string | null, forceStart = true) => {
    if (isStoppedRef.current || isPausedRef.current) return;

    if (finishedFileId) {
      setFileQueue(prev => prev.map(f => f.id === finishedFileId ? { ...f, status: 'completed' } : f));
    }

    const queue = fileQueueRef.current;
    const nextFile = queue.find(f => f.status === 'queued' && f.id !== finishedFileId);

    if (!nextFile) {
      setBatchState('completed');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      addToast({
        type: 'success',
        title: 'All Queued Files Finished!',
        message: 'Every file in the queue has been successfully synthesized and processed.'
      });
      return;
    }

    setActiveFileId(nextFile.id);
    setFileQueue(prev => prev.map(f => f.id === nextFile.id ? { ...f, status: 'active' } : f));

    addToast({
      type: 'info',
      title: 'Advancing to Next File',
      message: `Loading "${nextFile.fileName}" (${nextFile.lineCount} lines)...`
    });

    await sleep(1000);
    if (isStoppedRef.current || isPausedRef.current) return;

    const parsedItems = await parseLinesToItems(nextFile.content, nextFile.fileName, true);
    const toRun = parsedItems.filter(it => it.status === 'pending');

    if (toRun.length > 0 && forceStart) {
      addToast({
        type: 'info',
        title: `Starting: ${nextFile.fileName}`,
        message: `Synthesizing ${toRun.length} pending line(s)...`
      });
      if (startBatchExecutionRef.current) {
        startBatchExecutionRef.current(toRun);
      }
    } else if (toRun.length === 0) {
      addToast({
        type: 'info',
        title: `Skipping: ${nextFile.fileName}`,
        message: 'All lines already exist in dataset. Advancing to next queued file...'
      });
      await advanceToNextQueuedFile(nextFile.id, forceStart);
    }
  };

  const startBatchExecution = async (itemsToRun: GeminiBatchItem[], forceRegenerate = false) => {
    startBatchExecutionRef.current = startBatchExecution;
    if (itemsToRun.length === 0) {
      addToast({ type: 'info', title: 'No Lines to Process', message: 'All lines are already completed or list is empty.' });
      return;
    }

    // Unique run ID for this execution instance (supersedes any previous runs)
    const currentRunId = ++batchRunIdRef.current;
    isBatchRunningRef.current = true;
    isPausedRef.current = false;
    isStoppedRef.current = false;
    setBatchState('running');

    let completedInRun = 0;
    let failedInRun = 0;

    try {
      for (let i = 0; i < itemsToRun.length; i++) {
        if (batchRunIdRef.current !== currentRunId) return;
        const item = itemsToRun[i];

        // Check if stopped / cancelled
        if (isStoppedRef.current) {
          if (batchRunIdRef.current === currentRunId) {
            setBatchState('stopped');
            setCurrentProcessingId(null);
            addToast({ type: 'info', title: 'Batch Stopped', message: 'Batch synthesis was cancelled by user.' });
          }
          return;
        }

        // Check if paused
        while (isPausedRef.current) {
          if (batchRunIdRef.current !== currentRunId) return;
          setBatchState('paused');
          await sleep(400);
          if (batchRunIdRef.current !== currentRunId) return;
          if (isStoppedRef.current) {
            if (batchRunIdRef.current === currentRunId) {
              setBatchState('stopped');
              setCurrentProcessingId(null);
            }
            return;
          }
        }

        if (batchRunIdRef.current !== currentRunId) return;

        // Re-read latest status from batchItemsRef to ensure line wasn't completed in another run or scan
        const currentFreshItem = batchItemsRef.current.find(it => it.id === item.id);
        if (currentFreshItem && currentFreshItem.status === 'completed' && !forceRegenerate) {
          console.log(`[Batch Execution] Line #${item.lineNumber} is already completed. Skipping.`);
          continue;
        }

        // Prevent in-flight duplication
        if (activeProcessingLineNumbersRef.current.has(item.id)) {
          console.log(`[Batch Execution] Line #${item.lineNumber} is already in-flight. Skipping duplicate call.`);
          continue;
        }

        activeProcessingLineNumbersRef.current.add(item.id);
        setBatchState('running');
        setCurrentProcessingId(item.id);

        // Update state to 'processing'
        setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing', error: undefined } : it));

        try {
          // Strictly determine voice respecting batchVoiceMode and assigned item voice
          let effectiveVoice = item.voiceName || selectedVoice;
          if (batchVoiceMode === 'random_female') {
            const femaleVoices = voices.filter(v => v.gender === 'Female');
            if (!item.voiceName || item.voiceGender !== 'Female') {
              effectiveVoice = femaleVoices[Math.floor(Math.random() * femaleVoices.length)]?.id || 'Aoede';
            }
          } else if (batchVoiceMode === 'random_male') {
            const maleVoices = voices.filter(v => v.gender === 'Male');
            if (!item.voiceName || item.voiceGender !== 'Male') {
              effectiveVoice = maleVoices[Math.floor(Math.random() * maleVoices.length)]?.id || 'Puck';
            }
          } else if (batchVoiceMode === 'mix_gender') {
            if (!item.voiceName || !item.voiceGender) {
              const targetGender: 'Female' | 'Male' = Math.random() < 0.5 ? 'Female' : 'Male';
              const targetVoices = voices.filter(v => v.gender === targetGender);
              effectiveVoice = targetVoices[Math.floor(Math.random() * targetVoices.length)]?.id || (targetGender === 'Female' ? 'Aoede' : 'Puck');
            }
          }

          const res = await generateGeminiSpeech({
            text: item.text,
            voiceName: effectiveVoice,
            dialect: dialect,
            model: selectedModel,
            promptInstruction: customInstruction.trim() || undefined,
            saveToDataset: true,
            forceRegenerate: forceRegenerate || item.status === 'failed'
          });

          if (batchRunIdRef.current !== currentRunId) return;

          if (res.sample) {
            onSampleCreated(res.sample);
            completedInRun++;

            const resolvedGender = voices.find(v => v.id === effectiveVoice)?.gender || item.voiceGender || (batchVoiceMode === 'random_female' ? 'Female' : 'Male');

            setBatchItems(prev => prev.map(it => it.id === item.id ? {
              ...it,
              status: 'completed',
              sample: res.sample,
              duration: res.durationSeconds,
              voiceName: effectiveVoice,
              voiceGender: resolvedGender as 'Male' | 'Female',
              keyUsed: res.alreadyExists ? `Dataset #${res.sample?.id} (Pre-checked)` : res.usedKeyMasked,
              error: undefined
            } : it));
          } else {
            throw new Error('Failed to create sample from response');
          }
        } catch (err: any) {
          if (batchRunIdRef.current !== currentRunId) return;
          failedInRun++;
          const errorMessage = err.message || 'Speech generation failed';

          setBatchItems(prev => prev.map(it => it.id === item.id ? {
            ...it,
            status: 'failed',
            error: errorMessage
          } : it));

          // Check if ALL keys in pool are completely exhausted or circuit breaker tripped
          const isFatalPoolExhaustion = errorMessage.toLowerCase().includes('all') && 
                                       (errorMessage.toLowerCase().includes('exhausted') || errorMessage.toLowerCase().includes('failed'));

          if (isFatalPoolExhaustion) {
            // Terminate current loop cleanly so there are no locked loops in background
            batchRunIdRef.current++;
            isStoppedRef.current = true;
            isPausedRef.current = false;
            setBatchState('paused');
            await loadConfigAndPool();

            if (autoResumeEnabled) {
              const totalSec = autoResumeMinutes * 60;
              setAutoResumeCountdown(totalSec);
              clearAutoResumeTimer();
              let remaining = totalSec;

              addToast({
                type: 'info',
                title: `Auto-Resume Activated (${autoResumeMinutes}m)`,
                message: `Google rate limit hit. Waiting ${autoResumeMinutes} min before automatically continuing.`
              });

              autoResumeTimerRef.current = setInterval(async () => {
                remaining -= 1;
                setAutoResumeCountdown(remaining);
                if (remaining <= 0) {
                  clearAutoResumeTimer();
                  addToast({
                    type: 'info',
                    title: 'Auto-Resuming Batch...',
                    message: 'Quota window elapsed. Reloading pool and resuming synthesis...'
                  });
                  await triggerResumeBatch();
                }
              }, 1000);
            } else {
              addToast({
                type: 'error',
                title: 'API Keys Exhausted (Batch Paused)',
                message: 'All Gemini keys in the pool hit quota limits. Please add new keys or click "Reload Keys" once quotas refresh, then click Resume.'
              });
            }
            return; // Clean exit from loop!
          } else {
            // Normal resilient line error -> inform and continue to next line
            console.warn(`Line #${item.lineNumber} failed: ${errorMessage}. Continuing batch...`);
          }
        } finally {
          activeProcessingLineNumbersRef.current.delete(item.id);
        }

        // Respect rate-limit delay buffer between requests
        if (i < itemsToRun.length - 1 && !isStoppedRef.current && batchRunIdRef.current === currentRunId) {
          await sleep(batchDelayMs);
        }
      }

      if (batchRunIdRef.current !== currentRunId) return;

      setCurrentProcessingId(null);
      if (!isStoppedRef.current && !isPausedRef.current) {
        const finishedId = activeFileIdRef.current;

        setFileQueue(prev => prev.map(f => {
          if (f.id === finishedId || f.fileName === uploadedFileName) {
            return {
              ...f,
              status: 'completed',
              completedLines: (f.completedLines || 0) + completedInRun,
              failedLines: (f.failedLines || 0) + failedInRun
            };
          }
          return f;
        }));

        const hasMoreQueued = fileQueueRef.current.some(f => f.status === 'queued' && f.id !== finishedId);

        if (autoAdvanceNextFileRef.current && hasMoreQueued) {
          isBatchRunningRef.current = false;
          await advanceToNextQueuedFile(finishedId, true);
          return;
        } else {
          setBatchState('completed');

          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.7 }
          });

          addToast({
            type: 'success',
            title: 'Batch Generation Finished!',
            message: `Completed: ${completedInRun} line(s), Failed: ${failedInRun} line(s). Saved to Kurdish TTS Dataset.`
          });
        }
      }
    } finally {
      if (batchRunIdRef.current === currentRunId) {
        isBatchRunningRef.current = false;
        setCurrentProcessingId(null);
      }
    }
  };

  const handleStartBatch = () => {
    clearAutoResumeTimer();

    // Prevent double clicking or concurrent batch loops
    if (isBatchRunningRef.current || batchState === 'running') {
      console.warn('[Batch Execution] Start Batch ignored because batch is already running.');
      return;
    }

    // Start from all pending or failed items
    const itemsToProcess = batchItems.filter(it => it.status === 'pending' || it.status === 'failed');
    if (itemsToProcess.length === 0) {
      // If all are completed, reset all and start fresh
      const reset = batchItems.map(it => ({ ...it, status: 'pending' as const, error: undefined }));
      setBatchItems(reset);
      startBatchExecution(reset);
      return;
    }

    startBatchExecution(itemsToProcess);
  };

  const handlePauseBatch = () => {
    isPausedRef.current = true;
    setBatchState('paused');
    addToast({ type: 'info', title: 'Batch Paused', message: 'Click "Resume" to continue generating speech.' });
  };

  const handleResumeBatch = async () => {
    await triggerResumeBatch();
    addToast({ type: 'success', title: 'Batch Resumed', message: 'Continuing line-by-line speech generation...' });
  };

  const handleStopBatch = () => {
    clearAutoResumeTimer();
    batchRunIdRef.current++;
    isStoppedRef.current = true;
    isPausedRef.current = false;
    isBatchRunningRef.current = false;
    setBatchState('stopped');
    setCurrentProcessingId(null);
  };

  const handleRetrySingleLine = async (item: GeminiBatchItem) => {
    if (activeProcessingLineNumbersRef.current.has(item.id)) return;
    activeProcessingLineNumbersRef.current.add(item.id);

    // Strictly determine voice respecting batchVoiceMode and assigned item voice
    let effectiveVoice = item.voiceName || selectedVoice;
    if (batchVoiceMode === 'random_female') {
      const femaleVoices = voices.filter(v => v.gender === 'Female');
      if (!item.voiceName || item.voiceGender !== 'Female') {
        effectiveVoice = femaleVoices[Math.floor(Math.random() * femaleVoices.length)]?.id || 'Aoede';
      }
    } else if (batchVoiceMode === 'random_male') {
      const maleVoices = voices.filter(v => v.gender === 'Male');
      if (!item.voiceName || item.voiceGender !== 'Male') {
        effectiveVoice = maleVoices[Math.floor(Math.random() * maleVoices.length)]?.id || 'Puck';
      }
    } else if (batchVoiceMode === 'mix_gender') {
      if (!item.voiceName || !item.voiceGender) {
        const targetGender: 'Female' | 'Male' = Math.random() < 0.5 ? 'Female' : 'Male';
        const targetVoices = voices.filter(v => v.gender === targetGender);
        effectiveVoice = targetVoices[Math.floor(Math.random() * targetVoices.length)]?.id || (targetGender === 'Female' ? 'Aoede' : 'Puck');
      }
    }

    setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'processing', error: undefined } : it));
    try {
      const res = await generateGeminiSpeech({
        text: item.text,
        voiceName: effectiveVoice,
        dialect: dialect,
        model: selectedModel,
        promptInstruction: customInstruction.trim() || undefined,
        saveToDataset: true,
        forceRegenerate: true // Explicit single line retry allows fresh generation
      });

      if (res.sample) {
        onSampleCreated(res.sample);
        const resolvedGender = voices.find(v => v.id === effectiveVoice)?.gender || item.voiceGender || (batchVoiceMode === 'random_female' ? 'Female' : 'Male');
        setBatchItems(prev => prev.map(it => it.id === item.id ? {
          ...it,
          status: 'completed',
          sample: res.sample,
          duration: res.durationSeconds,
          voiceName: effectiveVoice,
          voiceGender: resolvedGender as 'Male' | 'Female',
          keyUsed: res.usedKeyMasked,
          error: undefined
        } : it));
        addToast({ type: 'success', title: `Line #${item.lineNumber} Generated!`, message: `Sample #${res.sample.id} created with voice "${effectiveVoice}".` });
      }
    } catch (err: any) {
      setBatchItems(prev => prev.map(it => it.id === item.id ? {
        ...it,
        status: 'failed',
        error: err.message || 'Generation failed'
      } : it));
      addToast({ type: 'error', title: `Line #${item.lineNumber} Retry Failed`, message: err.message });
    } finally {
      activeProcessingLineNumbersRef.current.delete(item.id);
    }
  };

  const handleDeleteBatchSample = async (item: GeminiBatchItem) => {
    if (!item.sample?.id) return;
    const sampleId = item.sample.id;

    try {
      await deleteSample(sampleId);
      setBatchItems(prev => prev.map(it => it.id === item.id ? {
        ...it,
        status: 'pending',
        sample: undefined,
        duration: undefined,
        keyUsed: undefined,
        error: undefined
      } : it));

      addToast({
        type: 'info',
        title: `Sample #${sampleId} Deleted`,
        message: `Audio for Line #${item.lineNumber} was removed from the dataset. Line reset to Queued.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Sample',
        message: err.message || 'Error deleting audio file'
      });
    }
  };

  const handleDeleteAndRegenerate = async (item: GeminiBatchItem) => {
    if (item.sample?.id) {
      try {
        await deleteSample(item.sample.id);
      } catch (err) {
        console.warn('Could not delete prior sample:', err);
      }
    }
    await handleRetrySingleLine(item);
  };

  const handleRetryFailedLines = () => {
    clearAutoResumeTimer();

    // Invalidate any active loop and signal exit
    batchRunIdRef.current++;
    isStoppedRef.current = false;
    isPausedRef.current = false;
    isBatchRunningRef.current = false;

    const currentItems = batchItemsRef.current;
    const failedItems = currentItems.filter(it => it.status === 'failed');
    if (failedItems.length === 0) {
      addToast({ type: 'info', title: 'No Failed Lines', message: 'There are no failed lines to retry.' });
      return;
    }

    const failedIds = new Set(failedItems.map(it => it.id));
    const resetItems = currentItems.map(it => 
      failedIds.has(it.id) ? { ...it, status: 'pending' as const, error: undefined } : it
    );
    setBatchItems(resetItems);
    batchItemsRef.current = resetItems;

    addToast({
      type: 'info',
      title: 'Retrying Failed Lines',
      message: `Queueing ${failedItems.length} failed line(s) for fresh synthesis...`
    });

    const toRun = resetItems.filter(it => failedIds.has(it.id));
    startBatchExecution(toRun, true);
  };

  const handleScanDatasetDuplicates = async () => {
    if (batchItems.length === 0) {
      addToast({ type: 'info', title: 'Batch List Empty', message: 'Upload a file or paste lines first.' });
      return;
    }

    setIsScanningDataset(true);
    try {
      const dataset = await fetchDataset();
      let matchedCount = 0;

      setBatchItems(prev => prev.map(item => {
        // If already completed with a valid sample, keep as is
        if (item.status === 'completed' && item.sample) return item;

        const normItem = normalizeKurdishCompare(item.cleanText || item.text);
        const match = dataset.find(s => {
          const sNorm = normalizeKurdishCompare(s.cleanText || s.text);
          return sNorm === normItem;
        });

        if (match) {
          matchedCount++;
          return {
            ...item,
            status: 'completed',
            sample: match,
            duration: match.durationSeconds,
            keyUsed: `Dataset #${match.id}`,
            error: undefined
          };
        }
        return item;
      }));

      if (matchedCount > 0) {
        addToast({
          type: 'success',
          title: 'Duplicate Scan Complete',
          message: `Found ${matchedCount} existing sample(s) in dataset. They are marked Completed & skipped during batch run.`
        });
      } else {
        addToast({
          type: 'info',
          title: 'Scan Complete',
          message: 'No existing dataset matches found for pending lines in queue.'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Scan Failed',
        message: err.message || 'Could not fetch dataset'
      });
    } finally {
      setIsScanningDataset(false);
    }
  };

  const handleRemoveSingleBatchItem = (id: number) => {
    setBatchItems(prev => prev.filter(it => it.id !== id));
  };

  const handleRemovePendingLines = () => {
    const pendingCount = batchItems.filter(it => it.status === 'pending').length;
    if (pendingCount === 0) {
      addToast({ type: 'info', title: 'No Pending Lines', message: 'There are no pending lines to remove.' });
      return;
    }
    setBatchItems(prev => prev.filter(it => it.status !== 'pending'));
    addToast({
      type: 'info',
      title: 'Pending Lines Removed',
      message: `Removed ${pendingCount} pending line(s) from the queue.`
    });
  };

  const handleRemoveCompletedLines = () => {
    const completedCount = batchItems.filter(it => it.status === 'completed').length;
    if (completedCount === 0) {
      addToast({ type: 'info', title: 'No Completed Lines', message: 'There are no completed lines to remove.' });
      return;
    }
    setBatchItems(prev => prev.filter(it => it.status !== 'completed'));
    addToast({
      type: 'info',
      title: 'Completed Lines Removed',
      message: `Removed ${completedCount} completed line(s) from view.`
    });
  };

  const handleClearBatch = () => {
    if (batchState === 'running') {
      handleStopBatch();
    }
    setBatchItems([]);
    setUploadedFileName('');
    setRawBatchInput('');
    setBatchState('idle');
    setCurrentProcessingId(null);
    clearStoredBatchState();
    addToast({
      type: 'info',
      title: 'Batch List Cleared',
      message: 'Batch session and saved progress have been reset.'
    });
  };

  // ----------------------------------------------------
  // COMPUTED STATS
  // ----------------------------------------------------
  const currentPresets = dialect === 'badini' ? BADINI_PRESETS : SORANI_PRESETS;
  const poolCount = keyPool.length || (geminiConfig?.isKeyConfigured ? 1 : 0);
  const activeKeyCount = keyPool.filter(k => k.isEnabled !== false).length;
  const disabledKeyCount = keyPool.filter(k => k.isEnabled === false).length;
  const readyKeyCount = keyPool.filter(k => k.isEnabled !== false && k.status === 'ready').length;
  const dailyExhaustedKeys = keyPool.filter(k => k.isEnabled !== false && (k.status === 'daily_exhausted' || (k.quotaType === 'daily' && k.status !== 'ready')));
  const minuteCooldownKeys = keyPool.filter(k => k.isEnabled !== false && k.status === 'exhausted' && k.quotaType !== 'daily' && (k.remainingSeconds !== undefined && k.remainingSeconds > 0));
  const minCooldownSeconds = minuteCooldownKeys.length > 0 
    ? Math.min(...minuteCooldownKeys.map(k => k.remainingSeconds || 60))
    : 0;
  const exhaustedKeyCount = dailyExhaustedKeys.length + minuteCooldownKeys.length;

  const totalLines = batchItems.length;
  const completedLines = batchItems.filter(it => it.status === 'completed').length;
  const failedLines = batchItems.filter(it => it.status === 'failed').length;
  const pendingLines = batchItems.filter(it => it.status === 'pending').length;
  const progressPercent = totalLines > 0 ? Math.round((completedLines / totalLines) * 100) : 0;

  const filteredBatchItems = batchItems.filter(it => {
    if (batchFilter === 'completed') return it.status === 'completed';
    if (batchFilter === 'failed') return it.status === 'failed';
    if (batchFilter === 'pending') return it.status === 'pending' || it.status === 'processing';
    return true;
  });

  return (
    <div className="gemini-studio-page">
      {/* Header Banner */}
      <div className="gemini-page-header">
        <div className="header-badge-row">
          <span className="badge badge-cyan">
            <Bot size={13} />
            <span>Google Gemini Voice Studio</span>
          </span>
          <span className="badge badge-purple">
            <Globe2 size={13} />
            <span>Dialect: {dialect === 'badini' ? 'Badini (بادینی)' : 'Sorani (سۆرانی)'}</span>
          </span>
          <span className="badge badge-purple">
            <Cpu size={13} />
            <span>{selectedModel}</span>
          </span>

          {/* Key Pool Status & Reload Button */}
          {poolCount > 0 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button" 
                className={`badge ${readyKeyCount > 0 ? 'badge-success' : (dailyExhaustedKeys.length > 0 ? 'badge-danger' : 'badge-amber')}`}
                onClick={() => setShowKeyManager(!showKeyManager)}
                style={{ cursor: 'pointer', border: readyKeyCount > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : (dailyExhaustedKeys.length > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)') }}
                title="Click to view all Gemini API Keys, toggles, and live quota cooldowns"
              >
                <ShieldCheck size={13} />
                <span>{readyKeyCount}/{activeKeyCount} Keys Ready</span>
                {disabledKeyCount > 0 && (
                  <span style={{ opacity: 0.85, color: '#94A3B8', fontSize: '0.72rem' }}>
                    ({disabledKeyCount} Off)
                  </span>
                )}
                {dailyExhaustedKeys.length > 0 && readyKeyCount === 0 && (
                  <span style={{ opacity: 0.95, color: '#FCA5A5', fontWeight: 600 }}>
                    ({dailyExhaustedKeys.length} Daily Limit Reached • Resets Midnight PT)
                  </span>
                )}
                {minuteCooldownKeys.length > 0 && readyKeyCount === 0 && dailyExhaustedKeys.length === 0 && (
                  <span style={{ opacity: 0.9, color: '#FDE047', fontWeight: 600 }}>
                    ({minuteCooldownKeys.length} in cooldown • next in {minCooldownSeconds}s)
                  </span>
                )}
                {showKeyManager ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-xs reload-keys-btn"
                onClick={handleReloadKeys}
                disabled={isReloadingKeys}
                title="Force test and reload all Gemini API keys in the pool"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.74rem' }}
              >
                <RefreshCw size={12} className={isReloadingKeys ? 'spin' : ''} />
                <span>{isReloadingKeys ? 'Checking Keys...' : 'Reload Keys'}</span>
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="badge badge-amber"
              onClick={() => setShowKeyManager(true)}
              style={{ cursor: 'pointer' }}
            >
              <AlertCircle size={13} />
              <span>Add Gemini API Keys</span>
            </button>
          )}
        </div>

        <div className="gemini-title-section">
          <h1 className="page-title">
            <span className="text-gradient">Gemini Voice Studio</span> (Sorani & Badini)
          </h1>
          <p className="page-description">
            Synthesize high-fidelity Kurdish speech in both <strong>Sorani</strong> and <strong>Badini</strong> dialects with <strong>Puck</strong> and <strong>Gemini 3.1 Flash TTS</strong>. Includes automatic multi-key failover, resilient bulk text processing, and inline emotions.
          </p>
        </div>

        {/* Tab Selector: Single vs. Bulk Mode */}
        <div className="studio-tabs-row" style={{ marginTop: '16px' }}>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'single' ? 'studio-tab-active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <Sparkles size={16} />
            <span>Single Synthesis Studio</span>
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'bulk' ? 'studio-tab-active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            <Upload size={16} />
            <span>Bulk File & Multi-Line Batch</span>
            {batchItems.length > 0 && (
              <span className="tab-counter-badge">{batchItems.length} lines</span>
            )}
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'paired' ? 'studio-tab-active' : ''}`}
            onClick={() => setActiveTab('paired')}
            style={activeTab === 'paired' ? {
              borderColor: '#a855f7',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
              color: '#f8fafc'
            } : {
              borderColor: 'rgba(168, 85, 247, 0.4)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              color: '#f8fafc'
            }}
            title="Open Paired Emotion Batch Studio (same speaker, same sentence, 6 emotions)"
          >
            <Layers size={16} color="#c084fc" />
            <span style={{ fontWeight: 600 }}>Paired Emotion Batch Studio</span>
            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.3)', color: '#c084fc', fontSize: '0.7rem' }}>
              TTS Training
            </span>
          </button>
        </div>
      </div>

      {/* Multi-Key Pool Drawer & Live Monitor */}
      {(showKeyManager || poolCount === 0) && (
        <GeminiKeyManager
          keyPool={keyPool}
          poolCount={poolCount}
          isReloadingKeys={isReloadingKeys}
          probingKeyIndex={probingKeyIndex}
          customKeyInput={customKeyInput}
          isSavingKey={isSavingKey}
          onKeyInputChange={setCustomKeyInput}
          onAddKey={handleAddKey}
          onDeleteKey={handleDeleteKey}
          onToggleKey={handleToggleKey}
          onToggleAllKeys={handleToggleAllKeys}
          onToggleBulkKeys={handleToggleBulkKeys}
          onProbeKey={handleProbeSingleKey}
          onReloadKeys={handleReloadKeys}
          onResetCooldowns={handleResetCooldowns}
          onClose={() => setShowKeyManager(false)}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 1: SINGLE SYNTHESIS STUDIO                            */}
      {/* ========================================================= */}
      {activeTab === 'single' && (
        <div className="studio-grid">
          {/* Left Column: Dialect, Text, Emotions & Voice Config */}
          <div className="studio-left">
            {/* Dialect Selector Card */}
            <div className="card dialect-card">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Languages size={18} className="text-cyan" />
                  <span className="card-title">Kurdish Dialect Selection (زارەڤێ کوردی)</span>
                </div>
                <span className="badge badge-purple">
                  {dialect === 'sorani' ? 'Central Kurdish' : 'Northern Kurmanji'}
                </span>
              </div>
              <div className="card-body">
                <div className="dialect-grid">
                  <button
                    type="button"
                    className={`dialect-box ${dialect === 'sorani' ? 'dialect-box-active' : ''}`}
                    onClick={() => handleDialectChange('sorani')}
                  >
                    <div className="dialect-box-top">
                      <strong className="dialect-box-title">Sorani (سۆرانی)</strong>
                      {dialect === 'sorani' && <CheckCircle2 size={16} className="text-cyan" />}
                    </div>
                    <p className="dialect-box-desc">
                      Central Kurdish (Erbil, Sulaymaniyah, Halabja, Mukriyan). Vowels: ۆ, ێ, ە
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`dialect-box ${dialect === 'badini' ? 'dialect-box-active' : ''}`}
                    onClick={() => handleDialectChange('badini')}
                  >
                    <div className="dialect-box-top">
                      <strong className="dialect-box-title">Badini (بادینی / بهدینی)</strong>
                      {dialect === 'badini' && <CheckCircle2 size={16} className="text-cyan" />}
                    </div>
                    <p className="dialect-box-desc">
                      Northern Kurmanji (Duhok, Zakho, Amadiya, Akre). Sounds: ڤ, خ، ح، غ
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Emotions Toolbar */}
            <div className="card emotion-tags-card">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} className="text-cyan" />
                  <span className="card-title">Inline Emotional Cues & Vocal Effects</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#38BDF8' }}>
                  Inserts at cursor location
                </span>
              </div>
              <div className="card-body">
                <div className="emotion-chips-grid">
                  {GEMINI_EMOTION_TAGS.map((em) => (
                    <button
                      key={em.tag}
                      type="button"
                      className="emotion-tag-chip"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertTag(em.tag)}
                      title={em.desc}
                      style={{ borderColor: `${em.color}40` }}
                    >
                      <span className="tag-pill" style={{ background: `${em.color}25`, color: em.color }}>
                        {em.tag}
                      </span>
                      <span className="tag-name">{em.label}</span>
                    </button>
                  ))}
                </div>
                <div className="emotion-hint">
                  💡 <strong>How it works:</strong> Place tags like <code>[laugh]</code> or <code>[whisper]</code> directly inside your Kurdish sentence. Gemini performs that emotion at that exact moment without speaking the tag words.
                </div>
              </div>
            </div>

            {/* Kurdish Textarea */}
            <div className="card">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Languages size={18} className="text-cyan" />
                  <span className="card-title">{dialect === 'badini' ? 'Badini Kurdish Text' : 'Sorani Kurdish Text'}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {text.length} characters
                </span>
              </div>

              <div className="card-body">
                {/* Dialect-specific Presets */}
                <div className="preset-chips">
                  <span className="preset-label">{dialect === 'badini' ? 'نموونەیێن بادینی:' : 'نموونەکانی سۆرانی:'}</span>
                  {currentPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="chip-btn"
                      onClick={() => setText(p.text)}
                      title={p.text}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Text Area */}
                <div style={{ marginTop: '12px' }}>
                  <textarea
                    ref={textareaRef}
                    className="input-control text-area-kurdish"
                    dir="auto"
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={dialect === 'badini' ? 'دەقێ بادینی ل ڤێرە بنڤیسە...' : 'دەقی سۆرانی لێرە بنووسە...'}
                  />
                </div>

                {/* Multilingual Code-Switching Detection Banner */}
                {(() => {
                  const withoutTags = text.replace(/\[([a-zA-Z0-9_\s-]+)\]/g, ' ');
                  const hasLatin = /[a-zA-Z]/.test(withoutTags);
                  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(withoutTags);
                  const startsWithLatin = /[a-zA-Z]/.test(withoutTags.trim().match(/^[^\p{L}\p{N}]*([\p{L}\p{N}])/u)?.[1] || '');
                  
                  if (!hasLatin || !hasArabicScript) return null;
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: '#38BDF8',
                      marginTop: '10px'
                    }}>
                      <Globe2 size={16} style={{ flexShrink: 0, color: '#22D3EE' }} />
                      <div>
                        <strong>Multilingual Code-Switching Active:</strong> Detected mixed English + Kurdish/Arabic. {startsWithLatin ? 'Initial English sentence will be spoken immediately in clear English without skipping.' : 'Languages will switch seamlessly.'}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Voice & Model Grid */}
            <div className="card">
              <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mic size={18} className="text-cyan" />
                  <span className="card-title">Select Gemini Voice ({voices.length}) & Model</span>
                </div>
                <select
                  className="input-control select-model-dropdown"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem', height: '32px' }}
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="card-body">
                {/* Voice Gender Filters & Search Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${singleVoiceGenderFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setSingleVoiceGenderFilter('all')}
                      style={{ fontSize: '0.74rem', padding: '3px 9px' }}
                    >
                      All ({voices.length})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${singleVoiceGenderFilter === 'Male' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setSingleVoiceGenderFilter('Male')}
                      style={{ fontSize: '0.74rem', padding: '3px 9px', color: singleVoiceGenderFilter === 'Male' ? undefined : '#60A5FA' }}
                    >
                      ♂ Male ({voices.filter(v => v.gender === 'Male').length})
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${singleVoiceGenderFilter === 'Female' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setSingleVoiceGenderFilter('Female')}
                      style={{ fontSize: '0.74rem', padding: '3px 9px', color: singleVoiceGenderFilter === 'Female' ? undefined : '#F472B6' }}
                    >
                      ♀ Female ({voices.filter(v => v.gender === 'Female').length})
                    </button>
                  </div>
                  <div style={{ position: 'relative', minWidth: '180px', flex: '1', maxWidth: '260px' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Search 30 HD voices..."
                      value={singleVoiceSearch}
                      onChange={(e) => setSingleVoiceSearch(e.target.value)}
                      style={{ fontSize: '0.78rem', height: '28px', padding: '2px 8px 2px 26px' }}
                    />
                    <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    {singleVoiceSearch && (
                      <button
                        type="button"
                        onClick={() => setSingleVoiceSearch('')}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable Voice Grid */}
                <div className="voice-grid" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', paddingBottom: '4px' }}>
                  {filteredSingleVoices.map((v) => (
                    <div
                      key={v.id}
                      className={`voice-card ${selectedVoice === v.id ? 'voice-card-active' : ''}`}
                      onClick={() => setSelectedVoice(v.id)}
                    >
                      <div className="voice-card-top">
                        <strong className="voice-name">{v.name}</strong>
                        <span className={`gender-badge ${v.gender === 'Female' ? 'badge-pink' : 'badge-blue'}`}>
                          {v.gender === 'Female' ? '♀ Female' : '♂ Male'}
                        </span>
                      </div>
                      <p className="voice-desc">{v.description}</p>
                    </div>
                  ))}
                  {filteredSingleVoices.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No voices found matching "{singleVoiceSearch}".
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Prompt Instruction */}
            <div className="card">
              <div className="card-header">
                <Sliders size={18} className="text-cyan" />
                <span className="card-title">Dialect Accent & Pronunciation Directives</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="field-label" style={{ margin: 0 }}>
                    Custom System Prompt Directive ({dialect === 'badini' ? 'Badini Mode' : 'Sorani Mode'}):
                  </label>
                  <button
                    type="button"
                    className="chip-btn"
                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                    onClick={() => setCustomInstruction(`You are an expert multilingual voice actor and speech synthesizer proficient in English, Kurdish (${dialect === 'badini' ? 'Badini' : 'Sorani'}), and Arabic. Read aloud every single sentence completely without skipping. If an English sentence starts the paragraph, speak it immediately in natural, clear English. Seamlessly code-switch accents between English, Kurdish, and Arabic.`)}
                    title="Load ready-made trilingual code-switching prompt directive"
                  >
                    <Globe2 size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Multilingual Directive
                  </button>
                </div>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder={dialect === 'badini' ? 'Auto-configured for native Duhok Badini pronunciation...' : 'Auto-configured for native Central Kurdish Sorani pronunciation...'}
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              className="btn btn-primary btn-lg generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={20} className="spin" />
                  <span>Synthesizing with {selectedVoice} on {selectedModel.split('-')[1] || 'Gemini'}...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate {dialect === 'badini' ? 'Badini' : 'Sorani'} Speech ({selectedVoice})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Audio Playback, Evaluation & Comparison */}
          <div className="studio-right">
            {generatedSample ? (
              <div className="card result-card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileAudio size={18} className="text-cyan" />
                    <span className="card-title">Generated Audio & Evaluation</span>
                  </div>
                  <span className="badge badge-success">
                    Sample #{generatedSample.id}
                  </span>
                </div>

                <div className="card-body">
                  {/* Visual Audio Player */}
                  <div className="player-wrapper">
                    <AudioPlayer 
                      src={generatedAudioUrl || generatedSample.audioUrl || `/api/dataset/${generatedSample.id}/audio`}
                      sampleId={generatedSample.id}
                    />
                  </div>

                  {/* Metadata Pill Grid */}
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="meta-lbl">DIALECT</span>
                      <strong className="meta-val text-cyan" style={{ textTransform: 'capitalize' }}>
                        {generatedSample.dialect || dialect}
                      </strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">VOICE</span>
                      <strong className="meta-val">{selectedVoice}</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">DURATION</span>
                      <strong className="meta-val">{duration}s</strong>
                    </div>
                    <div className="meta-item">
                      <span className="meta-lbl">KEY POOL</span>
                      <strong className="meta-val text-green">{usedKeyMasked ? `Used: ${usedKeyMasked}` : 'Auto-Failover Active'}</strong>
                    </div>
                  </div>

                  {/* Detected Inline Emotions */}
                  {detectedTags.length > 0 && (
                    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Acted Emotions:</span>
                      {detectedTags.map(tag => (
                        <span key={tag} className="badge badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Kurdish Transcript Preview */}
                  <div className="transcript-box" dir="rtl">
                    {generatedSample.text}
                  </div>

                  {/* Rating Widget */}
                  <div style={{ marginTop: '20px' }}>
                    <RatingWidget
                      ratings={generatedSample.ratings || activeRatings}
                      onSaveRatings={handleRatingsChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card empty-result-card">
                <div className="empty-content">
                  <div className="empty-icon-circle">
                    <Bot size={36} className="text-cyan" />
                  </div>
                  <h3 className="empty-title">Ready for Sorani & Badini Speech</h3>
                  <p className="empty-desc">
                    Select between <strong>Sorani (سۆرانی)</strong> and <strong>Badini (بادینی)</strong>, choose a voice (default: <strong>Puck</strong>), and press <strong>Generate Speech</strong>.
                  </p>
                  <div className="feature-bullets">
                    <div className="bullet-item">🗣️ <strong>Dual Dialect Support</strong>: Switch between Sorani and Badini anytime.</div>
                    <div className="bullet-item">🛡️ <strong>Multi-Key Failover</strong>: Auto-cascades to backup keys on quota exhaustion.</div>
                    <div className="bullet-item">🎭 <strong>Inline Emotions</strong>: Perform <code>[laugh]</code>, <code>[whisper]</code>, <code>[sigh]</code> seamlessly.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BULK FILE & MULTI-LINE BATCH PROCESSING            */}
      {/* ========================================================= */}
      {activeTab === 'bulk' && (
        <div className="bulk-studio-wrapper">
          {/* Sub-mode navigation inside Batch: Standard Multi-Line Batch vs Long Paragraph Auto-Splitter */}
          <div 
            className="batch-submode-row" 
            style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-subtle)', 
              paddingBottom: '14px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              className={`studio-tab-btn ${bulkSubMode === 'standard' ? 'studio-tab-active' : ''}`}
              onClick={() => setBulkSubMode('standard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}
            >
              <Upload size={16} />
              <span>Standard Multi-Line Batch</span>
              {batchItems.length > 0 && (
                <span className="tab-counter-badge">{batchItems.length} lines</span>
              )}
            </button>

            <button
              type="button"
              className={`studio-tab-btn ${bulkSubMode === 'long_split' ? 'studio-tab-active' : ''}`}
              onClick={() => setBulkSubMode('long_split')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.88rem',
                border: bulkSubMode === 'long_split' ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
                color: bulkSubMode === 'long_split' ? '#FFFFFF' : 'var(--text-muted)'
              }}
            >
              <Scissors size={16} className={bulkSubMode === 'long_split' ? 'text-cyan' : ''} />
              <span>⚡ Long Paragraph Auto-Splitter (1-Call Multi-Chunk)</span>
              <span 
                style={{ 
                  fontSize: '0.66rem', 
                  background: 'rgba(129, 140, 248, 0.25)', 
                  color: '#A78BFA',
                  padding: '2px 6px', 
                  borderRadius: '10px',
                  fontWeight: 700 
                }}
              >
                NEW
              </span>
            </button>
          </div>

          {bulkSubMode === 'long_split' ? (
            <LongParagraphSplitter
              voices={voices}
              models={models}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              dialect={dialect}
              setDialect={handleDialectChange}
              customInstruction={customInstruction}
              onSampleCreated={onSampleCreated}
              addToast={addToast}
            />
          ) : (
            <>
              {/* Upper Config & Upload Bar */}
              <div className="studio-grid">
            {/* Left: File Upload & Settings */}
            <div className="studio-left">
              {/* Dialect and Voice Configuration for Batch */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Volume2 size={18} className="text-cyan" />
                    <span className="card-title">Batch Voice & Dialect Strategy</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${dialect === 'sorani' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleDialectChange('sorani')}
                    >
                      Sorani (سۆرانی)
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${dialect === 'badini' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleDialectChange('badini')}
                    >
                      Badini (بادینی)
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {/* Voice Allocation Mode Buttons */}
                  <label className="field-label" style={{ marginBottom: '6px', display: 'block' }}>
                    Paragraph Voice Allocation Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    <button
                      type="button"
                      className={`btn btn-xs ${batchVoiceMode === 'random_female' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleRandomizeVoices('Female')}
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        borderRadius: 'var(--radius-sm)',
                        border: batchVoiceMode === 'random_female' ? '1px solid #EC4899' : '1px solid rgba(236, 72, 153, 0.3)',
                        background: batchVoiceMode === 'random_female' ? 'rgba(236, 72, 153, 0.22)' : 'rgba(236, 72, 153, 0.05)',
                        color: '#F472B6'
                      }}
                      title="Strictly randomize female voices across each paragraph (0% Male)"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Shuffle size={13} />
                        <span>♀ Random Female</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{voices.filter(v => v.gender === 'Female').length} Female HD Voices</span>
                    </button>

                    <button
                      type="button"
                      className={`btn btn-xs ${batchVoiceMode === 'random_male' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleRandomizeVoices('Male')}
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        borderRadius: 'var(--radius-sm)',
                        border: batchVoiceMode === 'random_male' ? '1px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.3)',
                        background: batchVoiceMode === 'random_male' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.05)',
                        color: '#38BDF8'
                      }}
                      title="Strictly randomize male voices across each paragraph (0% Female)"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Shuffle size={13} />
                        <span>♂ Random Male</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{voices.filter(v => v.gender === 'Male').length} Male HD Voices</span>
                    </button>

                    <button
                      type="button"
                      className={`btn btn-xs ${batchVoiceMode === 'mix_gender' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={handleRandomizeMixVoices}
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        borderRadius: 'var(--radius-sm)',
                        border: batchVoiceMode === 'mix_gender' ? '1px solid #10B981' : '1px solid rgba(16, 185, 129, 0.3)',
                        background: batchVoiceMode === 'mix_gender' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.05)',
                        color: '#34D399'
                      }}
                      title="Evenly distribute 50% female and 50% male voices across paragraphs"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Shuffle size={13} />
                        <span>⚥ Mix (50/50)</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>50% ♀ / 50% ♂ Balanced</span>
                    </button>

                    <button
                      type="button"
                      className={`btn btn-xs ${batchVoiceMode === 'fixed' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setBatchVoiceMode('fixed');
                        setBatchItems(prev => prev.map(it => it.status === 'completed' ? it : {
                          ...it,
                          voiceName: selectedVoice,
                          voiceGender: voices.find(v => v.id === selectedVoice)?.gender === 'Female' ? 'Female' : 'Male'
                        }));
                        addToast({
                          type: 'info',
                          title: 'Single Voice Mode',
                          message: `All batch lines will use the selected voice (${selectedVoice}).`
                        });
                      }}
                      style={{
                        padding: '8px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        borderRadius: 'var(--radius-sm)',
                        border: batchVoiceMode === 'fixed' ? '1px solid #A855F7' : '1px solid rgba(168, 85, 247, 0.3)',
                        background: batchVoiceMode === 'fixed' ? 'rgba(168, 85, 247, 0.22)' : 'rgba(168, 85, 247, 0.05)',
                        color: '#C084FC'
                      }}
                      title="Use one single fixed voice for all paragraphs"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Mic size={13} />
                        <span>Fixed Voice</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{selectedVoice}</span>
                    </button>
                  </div>

                  {/* Mode explanation banner & controls */}
                  {batchVoiceMode === 'random_female' && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(236, 72, 153, 0.1)',
                      border: '1px solid rgba(236, 72, 153, 0.25)',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F472B6', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>✨ Strictly Female Voices (0% Male Mixed)</span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Every paragraph gets a distinct random female voice from the 13 available HD voices.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={() => handleRandomizeVoices('Female')}
                          style={{
                            background: 'rgba(236, 72, 153, 0.2)',
                            color: '#F472B6',
                            border: '1px solid rgba(236, 72, 153, 0.4)',
                            fontSize: '0.73rem',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Re-randomize female voices across pending lines"
                        >
                          <Dices size={13} />
                          <span>Re-shuffle Female</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {voices.filter(v => v.gender === 'Female').map(v => (
                          <span
                            key={v.id}
                            style={{
                              fontSize: '0.67rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(236, 72, 153, 0.15)',
                              color: '#F9A8D4',
                              border: '1px solid rgba(236, 72, 153, 0.2)'
                            }}
                            title={v.description}
                          >
                            ♀ {v.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchVoiceMode === 'random_male' && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>✨ Strictly Male Voices (0% Female Mixed)</span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Every paragraph gets a distinct random male voice from the verified HD voices.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={() => handleRandomizeVoices('Male')}
                          style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#38BDF8',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            fontSize: '0.73rem',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Re-randomize male voices across pending lines"
                        >
                          <Dices size={13} />
                          <span>Re-shuffle Male</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        {voices.filter(v => v.gender === 'Male').map(v => (
                          <span
                            key={v.id}
                            style={{
                              fontSize: '0.67rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#BAE6FD',
                              border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}
                            title={v.description}
                          >
                            ♂ {v.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchVoiceMode === 'mix_gender' && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34D399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>✨ Balanced Mix Gender (50% Female / 50% Male)</span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Every paragraph is assigned a 50/50 balanced gender across verified Gemini HD voices ({voices.filter(v => v.gender === 'Female').length} Female &amp; {voices.filter(v => v.gender === 'Male').length} Male).
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs"
                          onClick={handleRandomizeMixVoices}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34D399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            fontSize: '0.73rem',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Re-randomize 50/50 mix voices across pending lines"
                        >
                          <Dices size={13} />
                          <span>Re-shuffle Mix (50/50)</span>
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.67rem', color: '#F472B6', fontWeight: 600, alignSelf: 'center', marginRight: '2px' }}>♀ Female Pool (13):</span>
                        {voices.filter(v => v.gender === 'Female').map(v => (
                          <span
                            key={v.id}
                            style={{
                              fontSize: '0.67rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(236, 72, 153, 0.15)',
                              color: '#F9A8D4',
                              border: '1px solid rgba(236, 72, 153, 0.2)'
                            }}
                            title={v.description}
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.67rem', color: '#38BDF8', fontWeight: 600, alignSelf: 'center', marginRight: '2px' }}>♂ Male Pool (17):</span>
                        {voices.filter(v => v.gender === 'Male').map(v => (
                          <span
                            key={v.id}
                            style={{
                              fontSize: '0.67rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#BAE6FD',
                              border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}
                            title={v.description}
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchVoiceMode === 'fixed' && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose Fixed Voice:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className={`btn btn-xs ${batchVoiceGenderFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setBatchVoiceGenderFilter('all')}
                            style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                          >
                            All ({voices.length})
                          </button>
                          <button
                            type="button"
                            className={`btn btn-xs ${batchVoiceGenderFilter === 'Male' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setBatchVoiceGenderFilter('Male')}
                            style={{ fontSize: '0.7rem', padding: '1px 6px', color: '#60A5FA' }}
                          >
                            ♂ Male (17)
                          </button>
                          <button
                            type="button"
                            className={`btn btn-xs ${batchVoiceGenderFilter === 'Female' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setBatchVoiceGenderFilter('Female')}
                            style={{ fontSize: '0.7rem', padding: '1px 6px', color: '#F472B6' }}
                          >
                            ♀ Female (13)
                          </button>
                        </div>
                      </div>
                      <div className="voice-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                        {voices.filter(v => batchVoiceGenderFilter === 'all' || v.gender === batchVoiceGenderFilter).map((v) => (
                          <div
                            key={v.id}
                            className={`voice-card ${selectedVoice === v.id ? 'voice-card-active' : ''}`}
                            onClick={() => {
                              setSelectedVoice(v.id);
                              setBatchItems(prev => prev.map(it => it.status === 'completed' ? it : {
                                ...it,
                                voiceName: v.id,
                                voiceGender: v.gender === 'Female' ? 'Female' : 'Male'
                              }));
                            }}
                            style={{ padding: '6px 8px' }}
                          >
                            <div className="voice-card-top" style={{ marginBottom: 0 }}>
                              <strong className="voice-name" style={{ fontSize: '0.8rem' }}>{v.name}</strong>
                              <span className={`gender-badge ${v.gender === 'Female' ? 'badge-pink' : 'badge-blue'}`} style={{ fontSize: '0.62rem', padding: '1px 4px' }}>
                                {v.gender === 'Female' ? '♀' : '♂'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delay between lines */}
                  <div className="config-sub-card" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      🛡️ Safe Delay Between Lines (Prevents Rate Limits):
                    </span>
                    <select
                      className="input-control"
                      value={batchDelayMs}
                      onChange={(e) => setBatchDelayMs(Number(e.target.value))}
                      style={{ width: 'auto', padding: '2px 8px', fontSize: '0.78rem', height: '28px' }}
                    >
                      <option value={600}>0.6s (Fast)</option>
                      <option value={1000}>1.0s (Optimal)</option>
                      <option value={1500}>1.5s (Conservative)</option>
                      <option value={3000}>3.0s (Safe)</option>
                    </select>
                  </div>

                  {/* Auto-Resume on Rate Limit Toggle & Interval */}
                  <div className="config-sub-card" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-main)', userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={autoResumeEnabled}
                        onChange={(e) => {
                          setAutoResumeEnabled(e.target.checked);
                          localStorage.setItem('gemini_auto_resume_enabled', String(e.target.checked));
                        }}
                        style={{ accentColor: '#38BDF8', width: '15px', height: '15px' }}
                      />
                      <span>🔄 Auto-Resume on Rate Limit / Cooldown</span>
                    </label>

                    {autoResumeEnabled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cooldown wait:</span>
                        <select
                          className="input-control"
                          value={autoResumeMinutes}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAutoResumeMinutes(val);
                            localStorage.setItem('gemini_auto_resume_minutes', String(val));
                          }}
                          style={{ width: 'auto', padding: '2px 8px', fontSize: '0.78rem', height: '28px' }}
                        >
                          <option value={1}>1 min</option>
                          <option value={2}>2 min (Recommended)</option>
                          <option value={3}>3 min</option>
                          <option value={5}>5 min</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Dropzone & Text Paste Card */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={18} className="text-cyan" />
                    <span className="card-title">Upload Kurdish Text Files (.txt)</span>
                  </div>
                  {uploadedFileName && (
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                      <FileText size={12} />
                      <span>{uploadedFileName}</span>
                    </span>
                  )}
                </div>

                <div className="card-body">
                  {/* Drag and Drop Zone */}
                  <div
                    className={`file-dropzone ${isDragOver ? 'dropzone-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt,.csv,.tsv,.jsonl"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-icon">
                      <Upload size={32} className="text-cyan" />
                    </div>
                    <strong style={{ fontSize: '0.92rem', color: '#E2E8F0', marginTop: '6px' }}>
                      Click to choose or Drag & Drop Kurdish .txt files (Single or Multiple)
                    </strong>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                      Support for multiple files: After finishing one file, it automatically moves to the next.
                    </p>
                  </div>

                  {/* Or Paste Raw Text */}
                  <div style={{ marginTop: '14px' }}>
                    <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Or Paste Multiple Kurdish Lines:</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>1 line = 1 audio sample</span>
                    </label>
                    <textarea
                      className="input-control text-area-kurdish"
                      dir="rtl"
                      rows={3}
                      placeholder="دێڕی یەکەم بنووسە...&#10;دێڕی دووەم بنووسە [laugh]...&#10;دێڕی سێیەم [whisper]..."
                      value={rawBatchInput}
                      onChange={(e) => setRawBatchInput(e.target.value)}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleParseRawInput}
                        disabled={!rawBatchInput.trim()}
                      >
                        <ListOrdered size={14} />
                        <span>Parse Lines to Batch</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-File Queue Card */}
              {fileQueue.length > 0 && (
                <div className="card" style={{ marginTop: '16px' }}>
                  <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Files size={18} className="text-cyan" />
                      <span className="card-title">File Queue ({fileQueue.length})</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                        {fileQueue.filter(f => f.status === 'completed').length} / {fileQueue.length} Done
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={autoAdvanceNextFile}
                          onChange={(e) => setAutoAdvanceNextFile(e.target.checked)}
                          style={{ width: '15px', height: '15px', accentColor: '#38BDF8', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: autoAdvanceNextFile ? '#38BDF8' : 'var(--text-dim)' }}>
                          Auto-Advance Next File
                        </span>
                      </label>
                      <button
                        type="button"
                        className="btn btn-xs btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add more .txt files to the queue"
                      >
                        <Plus size={12} />
                        <span>Add Files</span>
                      </button>
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {fileQueue.map((f, idx) => {
                        const isActive = f.id === activeFileId || f.status === 'active';
                        return (
                          <div
                            key={f.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: isActive ? 'rgba(56, 189, 248, 0.09)' : 'rgba(255, 255, 255, 0.03)',
                              border: isActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
                              boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                color: isActive ? '#38BDF8' : 'var(--text-dim)', 
                                minWidth: '22px', 
                                textAlign: 'center',
                                padding: '2px 5px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px'
                              }}>
                                #{idx + 1}
                              </span>
                              <FileText size={16} className={isActive ? 'text-cyan' : 'text-muted'} style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ 
                                    fontWeight: isActive ? 700 : 600, 
                                    color: isActive ? '#F8FAFC' : 'var(--text-main)', 
                                    fontSize: '0.84rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    {f.fileName}
                                  </span>
                                  {isActive && (
                                    <span className="badge badge-cyan" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                                      {batchState === 'running' ? '⚡ Synthesizing' : 'Active File'}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                  {f.lineCount} line(s)
                                  {f.completedLines !== undefined && f.completedLines > 0 && (
                                    <span style={{ color: '#34D399', marginLeft: '6px' }}>
                                      • {f.completedLines} completed
                                    </span>
                                  )}
                                  {f.failedLines !== undefined && f.failedLines > 0 && (
                                    <span style={{ color: '#F87171', marginLeft: '6px' }}>
                                      • {f.failedLines} failed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '10px' }}>
                              <span className={`badge ${
                                f.status === 'completed' ? 'badge-success' :
                                f.status === 'active' ? 'badge-cyan' :
                                f.status === 'failed' ? 'badge-danger' :
                                'badge-purple'
                              }`} style={{ fontSize: '0.68rem', textTransform: 'capitalize' }}>
                                {f.status === 'completed' && <Check size={10} style={{ marginRight: '3px' }} />}
                                {f.status}
                              </span>

                              {!isActive && batchState !== 'running' && (
                                <button
                                  type="button"
                                  className="btn btn-xs btn-secondary"
                                  onClick={() => handleSwitchActiveFile(f.id)}
                                  title="Switch active file to this file"
                                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                >
                                  Switch
                                </button>
                              )}

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  disabled={idx === 0 || batchState === 'running'}
                                  onClick={() => handleMoveFileInQueue(idx, 'up')}
                                  title="Move up in queue"
                                  style={{ padding: '1px 3px', height: '14px', minHeight: 'unset' }}
                                >
                                  <ChevronUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  disabled={idx === fileQueue.length - 1 || batchState === 'running'}
                                  onClick={() => handleMoveFileInQueue(idx, 'down')}
                                  title="Move down in queue"
                                  style={{ padding: '1px 3px', height: '14px', minHeight: 'unset' }}
                                >
                                  <ChevronDown size={11} />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                disabled={isActive && batchState === 'running'}
                                onClick={() => handleRemoveFileFromQueue(f.id)}
                                title="Remove from queue"
                                style={{ padding: '3px 6px', color: '#EF4444' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        💡 Files are processed in sequential order. After finishing one file, the next file will automatically begin.
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {fileQueue.some(f => f.status === 'completed') && (
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost"
                            onClick={handleClearCompletedFilesInQueue}
                            style={{ fontSize: '0.7rem' }}
                          >
                            Clear Completed
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={handleClearAllFilesInQueue}
                          disabled={batchState === 'running'}
                          style={{ fontSize: '0.7rem', color: '#EF4444' }}
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Batch Actions & Summary Monitor */}
            <div className="studio-right">
              <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} className="text-cyan" />
                    <span className="card-title">Batch Progress & Controls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {batchItems.length > 0 && (
                      <span className="badge badge-ghost" style={{ fontSize: '0.68rem', padding: '2px 6px', color: '#10B981', borderColor: 'rgba(16,185,129,0.3)' }} title="All batch items, completed samples, and queue states are auto-saved to browser storage">
                        💾 Saved
                      </span>
                    )}
                    <span className={`badge ${batchState === 'running' ? 'badge-cyan' : (batchState === 'completed' ? 'badge-success' : (batchState === 'paused' ? 'badge-amber' : 'badge-purple'))}`}>
                      {batchState.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  {/* Multi-File Queue Header Indicator */}
                  {fileQueue.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Files size={16} className="text-cyan" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38BDF8', flexShrink: 0 }}>
                          Queue File {Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)} of {fileQueue.length}:
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {uploadedFileName}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: autoAdvanceNextFile ? '#34D399' : 'var(--text-dim)', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
                        {autoAdvanceNextFile ? '⚡ Auto-Advance: ON' : 'Auto-Advance: OFF'}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="progress-section" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600, color: '#E2E8F0' }}>Progress</span>
                      <span style={{ color: '#38BDF8', fontWeight: 700 }}>{progressPercent}% ({completedLines}/{totalLines})</span>
                    </div>
                    <div className="progress-track" style={{ background: 'rgba(255,255,255,0.08)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progressPercent}%`, 
                          background: 'linear-gradient(90deg, #0284C7, #38BDF8, #10B981)', 
                          height: '100%',
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="meta-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    <div className="meta-item" style={{ textAlign: 'center' }}>
                      <span className="meta-lbl">TOTAL</span>
                      <strong className="meta-val">{totalLines}</strong>
                    </div>
                    <div className="meta-item" style={{ textAlign: 'center' }}>
                      <span className="meta-lbl" style={{ color: '#34D399' }}>COMPLETED</span>
                      <strong className="meta-val text-green">{completedLines}</strong>
                    </div>
                    <div className="meta-item" style={{ textAlign: 'center' }}>
                      <span className="meta-lbl" style={{ color: '#F87171' }}>FAILED</span>
                      <strong className="meta-val" style={{ color: '#F87171' }}>{failedLines}</strong>
                    </div>
                    <div className="meta-item" style={{ textAlign: 'center' }}>
                      <span className="meta-lbl" style={{ color: '#A78BFA' }}>PENDING</span>
                      <strong className="meta-val" style={{ color: '#A78BFA' }}>{pendingLines}</strong>
                    </div>
                  </div>

                  {/* Batch Request Pacing Buffer */}
                  <div style={{ marginBottom: '14px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Request Pacing Buffer:</span>
                      <span style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700 }}>{batchDelayMs}ms delay between lines</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { label: '⚡ Fast (600ms)', value: 600 },
                        { label: '⏱️ Optimal (1000ms)', value: 1000 },
                        { label: '🛡️ Safe (3000ms)', value: 3000 }
                      ].map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          className={`btn btn-xs ${batchDelayMs === p.value ? 'btn-primary' : 'btn-ghost'}`}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '0.72rem' }}
                          onClick={() => setBatchDelayMs(p.value)}
                          disabled={batchState === 'running'}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-Resume Settings on Quota Cooldown */}
                  <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: autoResumeEnabled ? '8px' : '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={autoResumeEnabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAutoResumeEnabled(checked);
                            localStorage.setItem('gemini_auto_resume_enabled', String(checked));
                            if (!checked) clearAutoResumeTimer();
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#38BDF8', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          Auto-Resume on Rate Limits
                        </span>
                      </label>
                      <span style={{ fontSize: '0.72rem', color: autoResumeEnabled ? '#34D399' : 'var(--text-dim)', fontWeight: 600 }}>
                        {autoResumeEnabled ? `Every ${autoResumeMinutes}m` : 'Off'}
                      </span>
                    </div>

                    {autoResumeEnabled && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Cooldown:</span>
                        {[1, 2, 3, 5].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            className={`btn btn-xs ${autoResumeMinutes === mins ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ flex: 1, padding: '3px 6px', fontSize: '0.72rem' }}
                            onClick={() => {
                              setAutoResumeMinutes(mins);
                              localStorage.setItem('gemini_auto_resume_minutes', String(mins));
                            }}
                          >
                            {mins} min
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Auto-Resume Countdown Banner */}
                  {autoResumeCountdown !== null && autoResumeCountdown > 0 && (
                    <div 
                      className="glass-card" 
                      style={{ 
                        marginBottom: '10px',
                        padding: '12px 14px', 
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.12) 100%)', 
                        border: '1.5px solid rgba(245, 158, 11, 0.45)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        boxShadow: '0 0 16px rgba(245, 158, 11, 0.15)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} color="#F59E0B" />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FBBF24' }}>
                            Auto-Resuming in {Math.floor(autoResumeCountdown / 60)}:{String(autoResumeCountdown % 60).padStart(2, '0')}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Google quota cooldown active. Retrying line and continuing batch synthesis once quotas reset...
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-xs btn-primary"
                          onClick={triggerResumeBatch}
                          style={{ background: '#F59E0B', color: '#000', fontWeight: 700 }}
                        >
                          ⚡ Resume Now
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-secondary"
                          onClick={() => {
                            clearAutoResumeTimer();
                            setBatchState('stopped');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {batchState === 'idle' || batchState === 'completed' || batchState === 'stopped' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleStartBatch}
                        disabled={totalLines === 0 || isBatchRunningRef.current}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Play size={18} />
                        <span>
                          Start Batch Synthesis ({pendingLines || totalLines} Lines
                          {fileQueue.length > 1 ? ` • File ${Math.max(1, fileQueue.findIndex(f => f.id === activeFileId) + 1)}/${fileQueue.length}` : ''})
                        </span>
                      </button>
                    ) : batchState === 'running' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handlePauseBatch}
                          style={{ flex: 1, justifyContent: 'center', background: '#F59E0B', color: '#000' }}
                        >
                          <Pause size={18} />
                          <span>Pause</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleStopBatch}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <Square size={18} />
                          <span>Stop</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleResumeBatch}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <Play size={18} />
                          <span>Resume Batch</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleStopBatch}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <Square size={18} />
                          <span>Stop</span>
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {failedLines > 0 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleRetryFailedLines}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <RotateCcw size={14} />
                          <span>Retry Failed ({failedLines})</span>
                        </button>
                      )}
                      {totalLines > 0 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={handleClearBatch}
                          disabled={batchState === 'running'}
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={14} />
                          <span>Clear List</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resilience Status Callout */}
                  <div className="resilience-callout" style={{ marginTop: '14px' }}>
                    🛡️ <strong>Resilient Multi-Key Failover</strong>: If any line fails or an API key runs out, the engine automatically switches to backup keys and continues with the rest of the file without crashing.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Section: Interactive Lines Table / Feed */}
          {batchItems.length > 0 && (
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <ListOrdered size={18} className="text-cyan" />
                    <span className="card-title">Parsed Kurdish Lines ({batchItems.length})</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                      <span className="badge badge-pink" style={{ fontSize: '0.7rem', padding: '1px 7px' }} title="Total lines assigned female voices">
                        ♀ {batchItems.filter(i => i.voiceGender === 'Female').length} Female
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '1px 7px' }} title="Total lines assigned male voices">
                        ♂ {batchItems.filter(i => i.voiceGender === 'Male').length} Male
                      </span>
                    </div>
                  </div>

                  {/* Smart Duplicate Scan Button */}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={handleScanDatasetDuplicates}
                    disabled={isScanningDataset || batchState === 'running'}
                    title="Scan current pending lines against the database and automatically mark existing audio as completed (skips redundant generation)"
                    style={{ 
                      fontSize: '0.74rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      padding: '3px 10px',
                      color: '#38BDF8',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Search size={12} className={isScanningDataset ? 'spin' : ''} />
                    <span>{isScanningDataset ? 'Checking Dataset...' : '🔍 Scan Dataset Duplicates'}</span>
                  </button>
                </div>

                {/* Filter Pills & Bulk Cleanups */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-xs ${batchFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setBatchFilter('all')}
                  >
                    All ({totalLines})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${batchFilter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setBatchFilter('completed')}
                  >
                    Completed ({completedLines})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${batchFilter === 'failed' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setBatchFilter('failed')}
                  >
                    Failed ({failedLines})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${batchFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setBatchFilter('pending')}
                  >
                    Pending ({pendingLines})
                  </button>

                  {/* Bulk Cleanup Actions */}
                  {pendingLines > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={handleRemovePendingLines}
                      title="Remove all pending (unprocessed) lines from the queue"
                      style={{ fontSize: '0.72rem', color: '#F87171', padding: '3px 8px' }}
                    >
                      <Trash2 size={11} />
                      <span>Remove Pending ({pendingLines})</span>
                    </button>
                  )}

                  {completedLines > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={handleRemoveCompletedLines}
                      title="Remove completed lines from the list view"
                      style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 8px' }}
                    >
                      <span>Remove Completed ({completedLines})</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="card-body" style={{ padding: '8px 16px 16px 16px' }}>
                <div className="batch-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredBatchItems.map((item) => {
                    const isCurrent = currentProcessingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`batch-line-card ${isCurrent ? 'batch-line-active' : ''} ${item.status === 'completed' ? 'batch-line-completed' : ''} ${item.status === 'failed' ? 'batch-line-failed' : ''}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          background: isCurrent ? 'rgba(2, 132, 199, 0.12)' : 'rgba(15, 23, 42, 0.65)',
                          border: isCurrent ? '1px solid #38BDF8' : (item.status === 'completed' ? '1px solid rgba(16, 185, 129, 0.25)' : (item.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)')),
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                              #{item.lineNumber}
                            </span>

                            {/* Status Badge */}
                            {item.status === 'processing' && (
                              <span className="badge badge-cyan" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={11} className="spin" />
                                <span>Synthesizing...</span>
                              </span>
                            )}
                            {item.status === 'completed' && (
                              <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={11} />
                                <span>Completed (Sample #{item.sample?.id}, {item.duration}s)</span>
                              </span>
                            )}
                            {item.status === 'failed' && (
                              <span className="badge badge-danger" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <XCircle size={11} />
                                <span>Failed</span>
                              </span>
                            )}
                            {item.status === 'pending' && (
                              <span className="badge badge-purple" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} />
                                <span>Queued</span>
                              </span>
                            )}

                            {/* Assigned Voice Badge with clear Gender indication */}
                            {item.voiceName && (
                              <span
                                className={`badge ${item.voiceGender === 'Female' ? 'badge-pink' : 'badge-blue'}`}
                                style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px' }}
                                title={`Voice: ${item.voiceName} (${item.voiceGender || 'Male'})`}
                              >
                                <span style={{ fontWeight: 700 }}>{item.voiceGender === 'Female' ? '♀' : '♂'}</span>
                                <span style={{ fontWeight: 600 }}>{item.voiceName}</span>
                              </span>
                            )}

                            {item.keyUsed && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                                Key: {item.keyUsed}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Delete Audio, Re-generate, Retry, or Generate + Remove Line Button */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.status === 'completed' && item.sample && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-xs"
                                  onClick={() => handleDeleteAndRegenerate(item)}
                                  title="Re-generate this specific line"
                                  style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <RotateCcw size={11} />
                                  <span>Re-generate</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-danger btn-xs"
                                  onClick={() => handleDeleteBatchSample(item)}
                                  title="Delete this audio from dataset and reset line"
                                  style={{ 
                                    fontSize: '0.72rem', 
                                    padding: '3px 8px', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    color: '#F87171'
                                  }}
                                >
                                  <Trash2 size={11} />
                                  <span>Delete Audio</span>
                                </button>
                              </>
                            )}

                            {item.status === 'failed' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-xs"
                                onClick={() => handleRetrySingleLine(item)}
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                <RotateCcw size={11} />
                                <span>Retry</span>
                              </button>
                            )}

                            {item.status === 'pending' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-xs"
                                onClick={() => handleRetrySingleLine(item)}
                                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                              >
                                <Play size={11} />
                                <span>Generate</span>
                              </button>
                            )}

                            {/* Individual Line Remove Button */}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleRemoveSingleBatchItem(item.id)}
                              title="Remove this line from batch list"
                              style={{ 
                                fontSize: '0.72rem', 
                                padding: '3px 8px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px',
                                color: '#94A3B8',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              <X size={12} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Kurdish Text */}
                        <div dir="rtl" className="transcript-box" style={{ padding: '8px 12px', fontSize: '0.98rem', background: 'rgba(0, 0, 0, 0.3)' }}>
                          {item.text}
                        </div>

                        {/* Error Message if Failed */}
                        {item.error && (
                          <div style={{ fontSize: '0.74rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>
                            ⚠️ {item.error}
                          </div>
                        )}

                        {/* Embedded Audio Player if Completed */}
                        {item.sample && (
                          <div style={{ marginTop: '4px' }}>
                            <AudioPlayer
                              src={item.sample.audioUrl || `/api/dataset/${item.sample.id}/audio`}
                              sampleId={item.sample.id}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAIRED EMOTION DATASET STUDIO                      */}
      {/* ========================================================= */}
      {activeTab === 'paired' && (
        <PairedEmotionBatchPage
          onSampleCreated={onSampleCreated}
          addToast={addToast}
        />
      )}

      {/* Page Styles */}
      <style>{`
        .gemini-studio-page {
          padding: 8px 0 24px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }

        .gemini-page-header {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          gap: 12px !important;
          margin-bottom: 8px !important;
          width: 100% !important;
        }

        .gemini-page-header .header-badge-row {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
          width: 100% !important;
        }

        .gemini-title-section {
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
          width: 100% !important;
          margin-top: 2px !important;
        }

        .gemini-page-header .page-title {
          font-size: 2.1rem !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          margin: 0 !important;
          line-height: 1.25 !important;
          display: block !important;
          width: 100% !important;
          color: var(--text-main) !important;
        }

        .gemini-page-header .text-gradient {
          background: linear-gradient(135deg, #38BDF8, #818CF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gemini-page-header .page-description {
          color: var(--text-muted) !important;
          font-size: 0.94rem !important;
          line-height: 1.6 !important;
          max-width: 950px !important;
          margin: 0 !important;
          display: block !important;
        }

        .gemini-page-header .studio-tabs-row {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          border-bottom: 1px solid var(--border-medium) !important;
          padding-bottom: 14px !important;
          margin-top: 14px !important;
          width: 100% !important;
        }

        .studio-tab-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: rgba(30, 41, 59, 0.7) !important;
          border: 1px solid var(--border-subtle) !important;
          color: var(--text-muted) !important;
          padding: 10px 20px !important;
          border-radius: var(--radius-md) !important;
          font-size: 0.92rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          user-select: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
        }

        .studio-tab-btn:hover {
          background: rgba(56, 189, 248, 0.15) !important;
          color: #38BDF8 !important;
          border-color: rgba(56, 189, 248, 0.4) !important;
          transform: translateY(-1px) !important;
        }

        .studio-tab-active {
          background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%) !important;
          color: #FFFFFF !important;
          border-color: rgba(56, 189, 248, 0.6) !important;
          box-shadow: 0 4px 16px rgba(2, 132, 199, 0.45) !important;
          transform: translateY(-1px) !important;
        }

        .tab-counter-badge {
          background: rgba(0, 0, 0, 0.35) !important;
          color: #38BDF8 !important;
          padding: 2px 8px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.74rem !important;
          font-weight: 700 !important;
          border: 1px solid rgba(56, 189, 248, 0.25) !important;
        }

        .badge-cyan {
          background: rgba(56, 189, 248, 0.15) !important;
          color: #38BDF8 !important;
          border: 1px solid rgba(56, 189, 248, 0.3) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.76rem !important;
          font-weight: 700 !important;
        }

        .badge-purple {
          background: rgba(168, 85, 247, 0.15) !important;
          color: #C084FC !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.76rem !important;
          font-weight: 700 !important;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #34D399 !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.76rem !important;
          font-weight: 700 !important;
        }

        .badge-amber {
          background: rgba(245, 158, 11, 0.15) !important;
          color: #FBBF24 !important;
          border: 1px solid rgba(245, 158, 11, 0.3) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.76rem !important;
          font-weight: 700 !important;
        }

        .badge-danger {
          background: rgba(239, 68, 68, 0.15) !important;
          color: #F87171 !important;
          border: 1px solid rgba(239, 68, 68, 0.3) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          padding: 4px 10px !important;
          border-radius: var(--radius-full) !important;
          font-size: 0.76rem !important;
          font-weight: 700 !important;
        }

        .file-dropzone {
          border: 2px dashed rgba(56, 189, 248, 0.35) !important;
          background: rgba(15, 23, 42, 0.5) !important;
          border-radius: var(--radius-md) !important;
          padding: 24px !important;
          text-align: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .file-dropzone:hover, .dropzone-active {
          border-color: #38BDF8 !important;
          background: rgba(56, 189, 248, 0.1) !important;
          transform: translateY(-1px) !important;
        }

        .dropzone-icon {
          width: 52px !important;
          height: 52px !important;
          border-radius: 50% !important;
          background: rgba(56, 189, 248, 0.15) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin-bottom: 6px !important;
        }

        .gemini-key-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 18px;
          backdrop-filter: blur(10px);
        }

        .key-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
        }

        .key-card-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #F8FAFC;
        }

        .key-card-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .key-input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .studio-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 20px;
          width: 100%;
          max-width: 100%;
          align-items: start;
        }

        @media (max-width: 980px) {
          .studio-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .studio-left, .studio-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
          max-width: 100%;
        }

        .dialect-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .dialect-box {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dialect-box:hover {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.8);
        }

        .dialect-box-active {
          border-color: #38BDF8 !important;
          background: rgba(56, 189, 248, 0.12) !important;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.15);
        }

        .dialect-box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .dialect-box-title {
          font-size: 0.92rem;
          color: var(--text-main);
        }

        .dialect-box-desc {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
        }

        .emotion-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .emotion-tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 5px 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .emotion-tag-chip:hover {
          background: rgba(56, 189, 248, 0.18);
          transform: translateY(-1px);
        }

        .tag-pill {
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .tag-name {
          font-size: 0.78rem;
          color: var(--text-main);
        }

        .emotion-hint {
          font-size: 0.76rem;
          color: var(--text-muted);
          background: rgba(0, 0, 0, 0.25);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border-left: 3px solid #38BDF8;
        }

        .preset-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preset-label {
          font-size: 0.76rem;
          color: var(--text-dim);
          font-weight: 700;
        }

        .chip-btn {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .chip-btn:hover {
          background: rgba(56, 189, 248, 0.15);
          color: #38BDF8;
          border-color: #38BDF8;
        }

        .text-area-kurdish {
          font-family: 'Vazirmatn', 'Noto Sans Arabic', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
        }

        .voice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }

        .voice-card {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .voice-card:hover {
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.9);
        }

        .voice-card-active {
          border-color: #38BDF8 !important;
          background: rgba(56, 189, 248, 0.12) !important;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
        }

        .voice-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .voice-name {
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .voice-desc {
          font-size: 0.72rem;
          color: var(--text-dim);
          line-height: 1.3;
          margin: 0;
        }

        .gender-badge {
          font-size: 0.68rem;
          padding: 1px 5px;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .badge-pink {
          background: rgba(236, 72, 153, 0.15);
          color: #F472B6;
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .badge-blue {
          background: rgba(59, 130, 246, 0.15);
          color: #60A5FA;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .config-sub-card {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
        }

        .resilience-callout {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          line-height: 1.5;
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .generate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          font-size: 1rem;
          font-weight: 700;
        }

        .empty-result-card {
          min-height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-content {
          text-align: center;
          padding: 24px;
          max-width: 420px;
        }

        .empty-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }

        .empty-title {
          font-size: 1.1rem;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .empty-desc {
          font-size: 0.84rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-bullets {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          background: rgba(0, 0, 0, 0.25);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .bullet-item {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .player-wrapper {
          margin-bottom: 16px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
          background: rgba(0, 0, 0, 0.25);
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-lbl {
          font-size: 0.68rem;
          color: var(--text-dim);
          font-weight: 700;
        }

        .meta-val {
          font-size: 0.86rem;
          color: #E2E8F0;
        }

        .text-green {
          color: #34D399;
        }

        .transcript-box {
          font-family: 'Vazirmatn', 'Noto Sans Arabic', sans-serif;
          font-size: 1.05rem;
          line-height: 1.8;
          color: #F1F5F9;
          background: rgba(11, 15, 23, 0.6);
          padding: 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .spin {
          animation: spin 1s infinite linear;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ========================================================= */
        /* LIGHT MODE HIGH CONTRAST OVERRIDES                       */
        /* ========================================================= */
        [data-theme="light"] .studio-tab-btn {
          background: #FFFFFF !important;
          border-color: #CBD5E1 !important;
          color: #475569 !important;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05) !important;
        }

        [data-theme="light"] .studio-tab-btn:hover {
          background: #F0F9FF !important;
          color: #0284C7 !important;
          border-color: #BAE6FD !important;
        }

        [data-theme="light"] .tab-counter-badge {
          background: #E0F2FE !important;
          color: #0369A1 !important;
          border-color: #BAE6FD !important;
        }

        [data-theme="light"] .gemini-key-card {
          background: #FFFFFF !important;
          border-color: #BAE6FD !important;
          box-shadow: 0 4px 20px -4px rgba(2, 132, 199, 0.1) !important;
        }

        [data-theme="light"] .key-card-title {
          color: #0F172A !important;
        }

        [data-theme="light"] .key-card-desc {
          color: #475569 !important;
        }

        [data-theme="light"] .key-pool-item {
          background: #F8FAFC !important;
          border-color: #E2E8F0 !important;
        }

        [data-theme="light"] .dialect-box {
          background: #FFFFFF !important;
          border: 1px solid #CBD5E1 !important;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04) !important;
        }

        [data-theme="light"] .dialect-box:hover {
          border-color: #0284C7 !important;
          background: #F0F9FF !important;
        }

        [data-theme="light"] .dialect-box-active {
          border-color: #0284C7 !important;
          background: #E0F2FE !important;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.15) !important;
        }

        [data-theme="light"] .dialect-box-title {
          color: #0F172A !important;
        }

        [data-theme="light"] .dialect-box-desc {
          color: #475569 !important;
        }

        [data-theme="light"] .emotion-tag-chip {
          background: #FFFFFF !important;
          border: 1px solid #CBD5E1 !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
        }

        [data-theme="light"] .emotion-tag-chip:hover {
          background: #F0F9FF !important;
          border-color: #0284C7 !important;
        }

        [data-theme="light"] .tag-name {
          color: #1E293B !important;
          font-weight: 600 !important;
        }

        [data-theme="light"] .emotion-hint {
          background: #F0F9FF !important;
          color: #0369A1 !important;
          border-left: 3px solid #0284C7 !important;
          border-top: 1px solid #BAE6FD !important;
          border-right: 1px solid #BAE6FD !important;
          border-bottom: 1px solid #BAE6FD !important;
        }

        [data-theme="light"] .emotion-hint strong {
          color: #0284C7 !important;
        }

        [data-theme="light"] .emotion-hint code {
          background: #E0F2FE !important;
          color: #0369A1 !important;
          padding: 2px 5px !important;
          border-radius: 4px !important;
        }

        [data-theme="light"] .chip-btn {
          background: #FFFFFF !important;
          border: 1px solid #CBD5E1 !important;
          color: #334155 !important;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04) !important;
          font-weight: 500 !important;
        }

        [data-theme="light"] .chip-btn:hover {
          background: #F0F9FF !important;
          border-color: #0284C7 !important;
          color: #0284C7 !important;
        }

        [data-theme="light"] .preset-label {
          color: #334155 !important;
          font-weight: 700 !important;
        }

        [data-theme="light"] .voice-card {
          background: #FFFFFF !important;
          border: 1px solid #CBD5E1 !important;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04) !important;
        }

        [data-theme="light"] .voice-card:hover {
          border-color: #0284C7 !important;
          background: #F0F9FF !important;
        }

        [data-theme="light"] .voice-card-active {
          border-color: #0284C7 !important;
          background: #E0F2FE !important;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.2) !important;
        }

        [data-theme="light"] .voice-name {
          color: #0F172A !important;
        }

        [data-theme="light"] .voice-desc {
          color: #64748B !important;
        }

        [data-theme="light"] .file-dropzone {
          background: #F8FAFC !important;
          border: 2px dashed #BAE6FD !important;
        }

        [data-theme="light"] .file-dropzone:hover,
        [data-theme="light"] .dropzone-active {
          background: #F0F9FF !important;
          border-color: #0284C7 !important;
        }

        [data-theme="light"] .dropzone-icon {
          background: #E0F2FE !important;
          color: #0284C7 !important;
        }

        [data-theme="light"] .config-sub-card {
          background: #F8FAFC !important;
          border-color: #E2E8F0 !important;
        }

        [data-theme="light"] .resilience-callout {
          background: #F0F9FF !important;
          border-color: #BAE6FD !important;
          color: #0369A1 !important;
        }

        [data-theme="light"] .empty-title {
          color: #0F172A !important;
        }

        [data-theme="light"] .meta-val {
          color: #0F172A !important;
        }

        [data-theme="light"] .meta-grid,
        [data-theme="light"] .feature-bullets {
          background: #F8FAFC !important;
          border: 1px solid #E2E8F0 !important;
        }
      `}</style>
    </div>
  );
};
