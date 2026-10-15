export type GenderType = 'Female' | 'Male';

export interface DualPilotTake {
  id: string;
  conditionId: string;
  provider: 'gemini' | 'elevenlabs';
  modelId: string;
  voiceName: string;
  voiceId?: string;
  gender: GenderType;
  emotion: string;
  emotionTag?: string;
  intensity: number;
  deliveryStyle: string;
  duration: number;
  audioUrl: string;
  keyUsedMasked?: string;
  slicingEngine?: string;
  slicingScore?: number;
  createdAt: number;
}

export interface DualPilotFamily {
  familyId: string;
  paragraphIndex: number;
  transcript: string;
  geminiTranscript?: string;
  elevenlabsTranscript?: string;
  gender: GenderType;
  language?: DualPilotLanguage;
  geminiTakes: Record<string, DualPilotTake>;
  elevenlabsTakes: Record<string, DualPilotTake>;
  userRatings?: Record<string, 'gemini_better' | 'elevenlabs_better' | 'equal' | 'both_flawed'>;
}

export type DualPilotLanguage = 'ckb' | 'kmr' | 'ar' | 'en' | 'mixed';

export interface LanguageOption {
  id: DualPilotLanguage;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  sampleSentences: string[];
}

export const DUAL_PILOT_LANGUAGES: LanguageOption[] = [
  {
    id: 'ckb',
    name: 'Kurdish Sorani',
    nativeName: 'کوردی (سۆرانی)',
    direction: 'rtl',
    sampleSentences: [
      'ئەمڕۆ زۆر ماندووم و کاتێکی زۆرم لە دەستدا.',
      'بڕوا ناکەم ئەم شتە بەڕاستی ڕوویدابێت!',
      'هەموو شتێک بە تەواوی ئامادەیە بۆ سبەی بەیانی.',
      'کەی دەگەینە ئەوێ؟ چاوەڕوانییەکان درێژەیان کێشا.',
      'ئەوە چی بوو ڕوویدا؟ بۆچی پێتان نەوتم؟',
      'هیچ کاتێک بێهیوا مەبە، هەمیشە دەرفەتێکی نوێ هەیە.'
    ]
  },
  {
    id: 'kmr',
    name: 'Kurdish Badini',
    nativeName: 'کوردی (بادینی)',
    direction: 'rtl',
    sampleSentences: [
      'ئەڤرو ئەز گەلەک وەستیام و دەمەکێ درێژ دەرباز بوو.',
      'باوەڕ ناکەم ئەڤ چەندە ب دروستی چێبووبیت!',
      'هەمی تشت ب تەمامی یێ ئامادەیە بو سبەهی سپێدێ.',
      'کەنگی دێ گەهینە وێرێ؟ چاڤەڕێبوون گەلەک یا درێژ بوو.',
      'ئەو چ بوو قەومی؟ بوچی هەوە ل دەمێ وی دا نەگوتە من؟',
      'چ جاران بێ هیڤی نەبە، هەر دەم دەلیڤەکا دی یا هەی.'
    ]
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية (فصحى)',
    direction: 'rtl',
    sampleSentences: [
      'اليوم أنا متعب للغاية وقد أضعت الكثير من الوقت.',
      'لا أستطيع أن أصدق أن هذا قد حدث بالفعل!',
      'كل شيء جاهز تمامًا لصباح الغد كما تم التخطيط له.',
      'متى سنصل إلى هناك؟ لقد طال الانتظار كثيرًا.',
      'ماذا حدث للتو؟ لماذا لم تخبرني بذلك في حينه؟',
      'لا تفقد الأمل أبدًا، هناك دائمًا فرصة جديدة قادمة.'
    ]
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (US/UK)',
    direction: 'ltr',
    sampleSentences: [
      'Today has been completely exhausting and I lost so much time.',
      'I honestly cannot believe this actually happened!',
      'Everything is fully prepared and ready for tomorrow morning.',
      'When are we finally arriving? This waiting has taken far too long.',
      'What on earth just happened? Why did nobody tell me sooner?',
      'Never lose hope, there is always another fresh opportunity ahead.'
    ]
  },
  {
    id: 'mixed',
    name: 'Code-Switching Mix',
    nativeName: 'کوردی + English + عربية',
    direction: 'rtl',
    sampleSentences: [
      'ئەمڕۆ کۆبوونەوەم لەگەڵ team-ەکەمان کرد دەربارەی project-ە نوێیەکە، لە ڕاستیدا backend زۆر باش کار دەکات بەڵام دەبێت database-ەکە optimize بکەین، واللهِ ئەنجامەکە زۆر نایاب دەبێت إن شاء الله.',
      'پێویستە ئەمڕۆ presentation-ەکەمان finalize بکەین بۆ investor-ەکان، چونکە market research نیشانی دەدات داواکاری زۆرە، الحمد لله هەموو metrics-ەکان زۆر positive-ن و بێگومان دەستکەوتی گەورەمان دەبێت.',
      'بەیانیت باش کاکە گیان، دەتوانیت یەک double espresso بۆ من ئامادە بکەیت بە almond milk؟ بەڕاستی بەیانیان بەبێ coffee هیچ energy-م نییە، بارك الله فيك دەستت خۆش بێت.',
      'ئەم هەفتەیە دەبێت research paper-ەکەم submit بکەم بۆ conference، پرۆفیسۆرەکەمان گوتی feedback زۆر باشە بەڵام دەبێت analysis-ی زیاتر بکەیت، سبحان الله کات زۆر خێرا تێدەپەڕێت و deadline زۆر نزیکە.',
      'دکتۆرەکە گوتی پێویستە blood test و checkup گشتی ئەنجام بدەیت بۆ ئەوەی immune system-ت بەهێزتر بێت، تەندروستی گەورەترین نیعمەتە، ما شاء الله نەشتەرگەرییەکە بە سەرکەوتوویی تەواو بوو و recovery زۆر خێرایە.',
      'پێویستە backup لە هەموو files-ەکان وەربگرین پێش ئەوەی update بکەین، security زۆر گرنگە لەم system-ەدا، بە ئیزنی خودا هیچ کێشەیەک ڕوونادات.'
    ]
  }
];

export interface DualPilotConfig {
  selectedPresetId: string;
  language: DualPilotLanguage;
  geminiFemaleVoice: string;
  geminiMaleVoice: string;
  elevenFemaleVoiceId: string;
  elevenFemaleVoiceName: string;
  elevenMaleVoiceId: string;
  elevenMaleVoiceName: string;
  elevenModel: string;
  dialect: 'sorani' | 'badini';
  chunkSize: number;
  smokeEmotion?: string;
  saveToDataset?: boolean;
}

export interface DualPilotBatchProgress {
  isActive: boolean;
  stage: 'idle' | 'generating_gemini' | 'slicing' | 'generating_elevenlabs' | 'completed' | 'error';
  currentConditionIndex: number;
  totalConditions: number;
  currentConditionLabel: string;
  currentChunk: number;
  totalChunks: number;
  completedTakes: number;
  totalExpectedTakes: number;
  error?: string;
}
