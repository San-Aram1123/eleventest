import { EmotionItem, SpeakerPreset } from './types';

export const REQUIRED_EMOTIONS: EmotionItem[] = [
  { id: 'neutral', name: 'Neutral', kurdish: 'ئاسایی', defaultIntensity: 0.0, description: 'Natural, steady tone' },
  { id: 'happy', name: 'Happy', kurdish: 'دڵخۆش', defaultIntensity: 0.8, description: 'Warm and cheerful' },
  { id: 'laugh', name: 'Laugh', kurdish: 'پێکەنین', defaultIntensity: 0.8, description: 'Smiling and amused' },
  { id: 'sad', name: 'Sad', kurdish: 'خەمبار', defaultIntensity: 0.8, description: 'Subdued and sorrowful' },
  { id: 'angry', name: 'Angry', kurdish: 'تووڕە', defaultIntensity: 0.9, description: 'Forceful and irritated' },
  { id: 'whisper', name: 'Whisper', kurdish: 'چرپە', defaultIntensity: 0.7, description: 'Soft and quiet' }
];

export const OPTIONAL_EMOTIONS: EmotionItem[] = [
  { id: 'excited', name: 'Excited', kurdish: 'حەماسی', defaultIntensity: 0.8, description: 'High energy and enthusiasm' },
  { id: 'sigh', name: 'Sigh', kurdish: 'ئاخ / ئاهـ', defaultIntensity: 0.7, description: 'Weary or relieved breath' },
  { id: 'tender', name: 'Tender', kurdish: 'نەرم و میهرەبان', defaultIntensity: 0.7, description: 'Gentle and affectionate' },
  { id: 'fearful', name: 'Fearful', kurdish: 'ترساو', defaultIntensity: 0.8, description: 'Nervous and urgent' },
  { id: 'curious', name: 'Curious', kurdish: 'سەرسام', defaultIntensity: 0.7, description: 'Inquisitive question' }
];

export const SPEAKER_PRESETS: SpeakerPreset[] = [
  { id: 'spk01', name: 'Speaker 01 (Puck)', voice: 'Puck', gender: 'male', description: 'Upbeat male narrator' },
  { id: 'spk02', name: 'Speaker 02 (Aoede)', voice: 'Aoede', gender: 'female', description: 'Warm female voice' },
  { id: 'spk03', name: 'Speaker 03 (Fenrir)', voice: 'Fenrir', gender: 'male', description: 'Passionate and strong' },
  { id: 'spk04', name: 'Speaker 04 (Zephyr)', voice: 'Zephyr', gender: 'female', description: 'Bright and clear' },
  { id: 'spk05', name: 'Speaker 05 (Orus)', voice: 'Orus', gender: 'male', description: 'Calm and steady' },
  { id: 'spk06', name: 'Speaker 06 (Leda)', voice: 'Leda', gender: 'female', description: 'Youthful and energetic' },
  { id: 'spk07', name: 'Speaker 07 (Enceladus)', voice: 'Enceladus', gender: 'male', description: 'Soft and gentle' },
  { id: 'spk08', name: 'Speaker 08 (Kore)', voice: 'Kore', gender: 'female', description: 'Relaxed and pleasant' },
  { id: 'spk09', name: 'Speaker 09 (Iapetus)', voice: 'Iapetus', gender: 'male', description: 'Crisp and articulate' },
  { id: 'spk10', name: 'Speaker 10 (Callirrhoe)', voice: 'Callirrhoe', gender: 'female', description: 'Smooth and refined' },
  { id: 'spk11', name: 'Speaker 11 (Umbriel)', voice: 'Umbriel', gender: 'male', description: 'Easy-going narrator' },
  { id: 'spk12', name: 'Speaker 12 (Autonoe)', voice: 'Autonoe', gender: 'female', description: 'Engaging female tone' },
  { id: 'spk13', name: 'Speaker 13 (Algieba)', voice: 'Algieba', gender: 'male', description: 'Smooth and melodic' },
  { id: 'spk14', name: 'Speaker 14 (Despina)', voice: 'Despina', gender: 'female', description: 'Warm and expressive' },
  { id: 'spk15', name: 'Speaker 15 (Rasalgethi)', voice: 'Rasalgethi', gender: 'male', description: 'Professional narrator' },
  { id: 'spk16', name: 'Speaker 16 (Erinome)', voice: 'Erinome', gender: 'female', description: 'Clear and soothing' },
  { id: 'spk17', name: 'Speaker 17 (Schedar)', voice: 'Schedar', gender: 'male', description: 'Balanced and firm' },
  { id: 'spk18', name: 'Speaker 18 (Laomedeia)', voice: 'Laomedeia', gender: 'female', description: 'Articulate and crisp' },
  { id: 'spk19', name: 'Speaker 19 (Pulcherrima)', voice: 'Pulcherrima', gender: 'male', description: 'Dynamic and forward' },
  { id: 'spk20', name: 'Speaker 20 (Achernar)', voice: 'Achernar', gender: 'female', description: 'Gentle and expressive' }
];

export const MALE_SPEAKER_PRESETS = SPEAKER_PRESETS.filter(p => p.gender === 'male');
export const FEMALE_SPEAKER_PRESETS = SPEAKER_PRESETS.filter(p => p.gender === 'female');

export const SAMPLE_SENTENCES_BY_LANG: Record<string, string[]> = {
  ckb: [
    'ئەمڕۆ زۆر ماندووم.',
    'کەی دەگەینە ئەوێ؟',
    'ئەوە چی بوو ڕوویدا؟',
    'بڕوا ناکەم ئەمە ڕاست بێت.',
    'چاوەڕێی هەواڵێکی باشم.',
    'هەموو شتێک بە تەواوی ئامادەیە.',
    'دەتوانیت دووبارەی بکەیتەوە؟',
    'ئەم شوێنە زۆر بێدەنگ و تاریکە.',
    'هیوادارم سبەی ڕۆژێکی خۆش بێت.',
    'هیچ کاتێک ئەمەم لەبیر ناچێت.'
  ],
  kmr: [
    'ئەڤرۆ ئەز گەلەک وەستیامە.',
    'کەنگی دێ گەهینە وێرێ؟',
    'ئەو چ بوو چێبووی؟',
    'باوەر ناکەم ئەڤە یا دروست بیت.',
    'ل هیڤیا دەنگوباسەکێ باشم.',
    'هەمی تشت ب تەمامی یێ بەرهەڤە.',
    'ما تو دشێی دووبارە بێژی؟',
    'ئەڤ جهە گەلەک بێدەنگ و تاریکە.',
    'هیڤیا من ئەوە سوبەهی ڕۆژەکا خۆش بیت.',
    'چ جاران ئەڤە ژ بیرا من ناچیت.'
  ],
  ar: [
    'أنا متعب جدا اليوم.',
    'متى سنصل إلى هناك؟',
    'ما الذي حدث للتو؟',
    'لا أستطيع تصديق أن هذا حقيقي.',
    'أنا في انتظار أخبار سارة.',
    'كل شيء جاهز تماماً الآن.',
    'هل يمكنك إعادة ما قلته؟',
    'هذا المكان هادئ ومظلم جداً.',
    'أتمنى أن يكون الغد يوماً جميلاً.',
    'لن أنسى هذا الموقف أبداً.'
  ],
  en: [
    'I am very tired today.',
    'When will we arrive there?',
    'What was that that just happened?',
    'I cannot believe this is real.',
    'I am waiting for good news.',
    'Everything is completely ready.',
    'Could you please repeat that?',
    'This place is very quiet and dark.',
    'I hope tomorrow will be a wonderful day.',
    'I will never forget this moment.'
  ]
};

export const SAMPLE_KURDISH_SENTENCES = SAMPLE_SENTENCES_BY_LANG.ckb;
