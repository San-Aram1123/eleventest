import { PilotSpeaker, ExpressiveTake, MatrixCondition } from './expressiveConstants';
import { MixedCondition } from './expressiveMixedConstants';

export type ExpressiveLanguage = 'ckb' | 'kmr' | 'ar' | 'en';

export interface ExpressiveLanguageConfig {
  id: ExpressiveLanguage;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  systemPersona: string;
  sampleSentences: string[];
}

export const EXPRESSIVE_LANGUAGES: ExpressiveLanguageConfig[] = [
  {
    id: 'ckb',
    name: 'Kurdish Sorani',
    nativeName: 'کوردیی ناوەندی (سۆرانی)',
    direction: 'rtl',
    systemPersona: 'You are a native Central Kurdish (Sorani) voice actor from Erbil/Sulaymaniyah for Audar expressive speech synthesis. Read and speak aloud the Kurdish text with authentic Sorani vowels (ۆ, ێ, ە) and natural regional intonation.',
    sampleSentences: [
      'ئەمڕۆ زۆر ماندووم و کاتێکی زۆرم لە دەستدا.',
      'بڕوا ناکەم ئەم شتە بەڕاستی ڕوویدابێت!',
      'هەموو شتێک بە تەواوی ئامادەیە بۆ سبەی بەیانی.',
      'کەی دەگەینە ئەوێ؟ چاوەڕوانییەکان درێژەیان کێشا.',
      'ئەوە چی بوو ڕوویدا؟ بۆچی پێتان نەوتم؟'
    ]
  },
  {
    id: 'kmr',
    name: 'Kurdish Badini',
    nativeName: 'کوردیی باکووری (بادینی)',
    direction: 'rtl',
    systemPersona: 'You are a native Kurdish Badini (Kurmanji) voice actor from the Duhok region for Audar speech synthesis. Read and speak aloud the text with authentic Northern Kurmanji vowels (ڤ, خ، ح، غ، ۆ، ێ، ە) and natural Duhok intonation.',
    sampleSentences: [
      'ئەڤرو ئەز گەلەک وەستیام و دەمەکێ درێژ دەرباز بوو.',
      'باوەڕ ناکەم ئەڤ چەندە ب دروستی چێبووبیت!',
      'هەمی تشت ب تەمامی یێ ئامادەیە بو سبەهی سپێدێ.',
      'کەنگی دێ گەهینە وێرێ؟ چاڤەڕێبوون گەلەک یا درێژ بوو.',
      'ئەو چ بوو قەومی؟ بوچی هەوە ل دەمێ وی دا نەگوتە من؟'
    ]
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية (فصحى)',
    direction: 'rtl',
    systemPersona: 'You are a native Arabic voice actor performing speech synthesis for the Audar expressive dataset. Read and speak aloud the text with authentic Modern Standard Arabic pronunciation, crisp articulation, and natural intonation.',
    sampleSentences: [
      'اليوم أنا متعب للغاية وقد أضعت الكثير من الوقت.',
      'لا أستطيع أن أصدق أن هذا قد حدث بالفعل!',
      'كل شيء جاهز تمامًا لصباح الغد كما تم التخطيط له.',
      'متى سنصل إلى هناك؟ لقد طال الانتظار كثيرًا.',
      'ماذا حدث للتو؟ لماذا لم تخبرني بذلك في حينه؟'
    ]
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English (US/UK)',
    direction: 'ltr',
    systemPersona: 'You are a professional native English voice actor performing expressive speech synthesis for the Audar dataset. Read and speak aloud the text naturally with clear articulation, native phrasing, and authentic emotional expression.',
    sampleSentences: [
      'Today has been completely exhausting and I lost so much time.',
      'I honestly cannot believe this actually happened!',
      'Everything is fully prepared and ready for tomorrow morning.',
      'When are we finally arriving? This waiting has taken far too long.',
      'What on earth just happened? Why did nobody tell me sooner?'
    ]
  }
];

export interface ExpressiveFamily {
  familyId: string;
  sentenceIndex: number;
  transcript: string;
  language: ExpressiveLanguage;
  speaker: PilotSpeaker;
  takes: ExpressiveTake[];
  createdAt: number;
}

export interface AutomatedBatchState {
  isActive: boolean;
  isPaused: boolean;
  currentFamilyId: string;
  currentSentenceIdx: number;
  totalSentences: number;
  currentConditionLabel: string;
  completedClips: number;
  totalClips: number;
  usedKeyMasked?: string;
  errors: string[];
}

