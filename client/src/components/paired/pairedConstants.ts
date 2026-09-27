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
  // Gemini 3.8 Studio Headline Voices (Pairs 1-12)
  { id: 'spk01', name: 'Speaker 01 (Arlo)', voice: 'Arlo', gender: 'male', description: 'Approachable, warm 3.8 studio' },
  { id: 'spk02', name: 'Speaker 02 (Lora)', voice: 'Lora', gender: 'female', description: 'Clear, friendly 3.8 studio' },
  { id: 'spk03', name: 'Speaker 03 (Knox)', voice: 'Knox', gender: 'male', description: 'Crisp, confident 3.8 studio' },
  { id: 'spk04', name: 'Speaker 04 (Nyla)', voice: 'Nyla', gender: 'female', description: 'Modern, confident 3.8 studio' },
  { id: 'spk05', name: 'Speaker 05 (Rami)', voice: 'Rami', gender: 'male', description: 'Conversational 3.8 studio' },
  { id: 'spk06', name: 'Speaker 06 (Sola)', voice: 'Sola', gender: 'female', description: 'Relaxed, pleasant 3.8 studio' },
  { id: 'spk07', name: 'Speaker 07 (Mako)', voice: 'Mako', gender: 'male', description: 'Energetic, dynamic 3.8 studio' },
  { id: 'spk08', name: 'Speaker 08 (Tari)', voice: 'Tari', gender: 'female', description: 'Cinematic, expressive 3.8 studio' },
  { id: 'spk09', name: 'Speaker 09 (Milo)', voice: 'Milo', gender: 'male', description: 'Narrative, clear 3.8 studio' },
  { id: 'spk10', name: 'Speaker 10 (Lumi)', voice: 'Lumi', gender: 'female', description: 'Warm instructional 3.8 studio' },
  { id: 'spk11', name: 'Speaker 11 (Koda)', voice: 'Koda', gender: 'male', description: 'Strong, textured 3.8 studio' },
  { id: 'spk12', name: 'Speaker 12 (Nika)', voice: 'Nika', gender: 'female', description: 'Bright, fresh 3.8 studio' },
  { id: 'spk13', name: 'Speaker 13 (Ludo)', voice: 'Ludo', gender: 'male', description: 'Friendly, expressive 3.8 studio' },
  { id: 'spk14', name: 'Speaker 14 (Riko)', voice: 'Riko', gender: 'female', description: 'Crisp, articulate 3.8 studio' },
  { id: 'spk15', name: 'Speaker 15 (Neno)', voice: 'Neno', gender: 'male', description: 'Smooth, modern 3.8 studio' },
  { id: 'spk16', name: 'Speaker 16 (Rina)', voice: 'Rina', gender: 'female', description: 'Gentle, balanced 3.8 studio' },
  { id: 'spk17', name: 'Speaker 17 (Olin)', voice: 'Olin', gender: 'male', description: 'Steady, thoughtful 3.8 studio' },
  { id: 'spk18', name: 'Speaker 18 (Tavi)', voice: 'Tavi', gender: 'female', description: 'Youthful, lively 3.8 studio' },
  { id: 'spk19', name: 'Speaker 19 (Sami)', voice: 'Sami', gender: 'male', description: 'Bright, authentic 3.8 studio' },
  { id: 'spk20', name: 'Speaker 20 (Tova)', voice: 'Tova', gender: 'female', description: 'Smooth, engaging 3.8 studio' },
  { id: 'spk21', name: 'Speaker 21 (Varo)', voice: 'Varo', gender: 'male', description: 'Deep, resonant 3.8 studio' },
  { id: 'spk22', name: 'Speaker 22 (Veda)', voice: 'Veda', gender: 'female', description: 'Thoughtful, velvety 3.8 studio' },
  { id: 'spk23', name: 'Speaker 23 (Zeno)', voice: 'Zeno', gender: 'male', description: 'Dynamic, crisp 3.8 studio' },
  { id: 'spk24', name: 'Speaker 24 (Zali)', voice: 'Zali', gender: 'female', description: 'Melodic, bright 3.8 studio' },
  // Gemini 3.8 Core & Expressive Voices (Pairs 25-26)
  { id: 'spk25', name: 'Speaker 25 (Charon)', voice: 'Charon', gender: 'male', description: 'Authoritative, deep 3.8 voice' },
  { id: 'spk26', name: 'Speaker 26 (Kore)', voice: 'Kore', gender: 'female', description: 'Firm, polished 3.8 voice' },
  // Verified Versatile Pairs in Gemini 3.8 (Pairs 27-52)
  { id: 'spk27', name: 'Speaker 27 (Puck)', voice: 'Puck', gender: 'male', description: 'Upbeat, animated tone' },
  { id: 'spk28', name: 'Speaker 28 (Aoede)', voice: 'Aoede', gender: 'female', description: 'Warm, natural tone' },
  { id: 'spk29', name: 'Speaker 29 (Fenrir)', voice: 'Fenrir', gender: 'male', description: 'Passionate, strong tone' },
  { id: 'spk30', name: 'Speaker 30 (Zephyr)', voice: 'Zephyr', gender: 'female', description: 'Bright, clear tone' },
  { id: 'spk31', name: 'Speaker 31 (Orus)', voice: 'Orus', gender: 'male', description: 'Calm, steady tone' },
  { id: 'spk32', name: 'Speaker 32 (Leda)', voice: 'Leda', gender: 'female', description: 'Youthful, energetic tone' },
  { id: 'spk33', name: 'Speaker 33 (Enceladus)', voice: 'Enceladus', gender: 'male', description: 'Soft, gentle tone' },
  { id: 'spk34', name: 'Speaker 34 (Callirrhoe)', voice: 'Callirrhoe', gender: 'female', description: 'Smooth, refined tone' },
  { id: 'spk35', name: 'Speaker 35 (Iapetus)', voice: 'Iapetus', gender: 'male', description: 'Crisp, articulate tone' },
  { id: 'spk36', name: 'Speaker 36 (Autonoe)', voice: 'Autonoe', gender: 'female', description: 'Engaging, narrative tone' },
  { id: 'spk37', name: 'Speaker 37 (Algieba)', voice: 'Algieba', gender: 'male', description: 'Smooth, melodic tone' },
  { id: 'spk38', name: 'Speaker 38 (Despina)', voice: 'Despina', gender: 'female', description: 'Warm, expressive tone' },
  { id: 'spk39', name: 'Speaker 39 (Rasalgethi)', voice: 'Rasalgethi', gender: 'male', description: 'Professional narrator' },
  { id: 'spk40', name: 'Speaker 40 (Erinome)', voice: 'Erinome', gender: 'female', description: 'Clear, soothing tone' },
  { id: 'spk41', name: 'Speaker 41 (Schedar)', voice: 'Schedar', gender: 'male', description: 'Balanced, firm tone' },
  { id: 'spk42', name: 'Speaker 42 (Laomedeia)', voice: 'Laomedeia', gender: 'female', description: 'Articulate, crisp tone' },
  { id: 'spk43', name: 'Speaker 43 (Pulcherrima)', voice: 'Pulcherrima', gender: 'male', description: 'Dynamic, forward tone' },
  { id: 'spk44', name: 'Speaker 44 (Achernar)', voice: 'Achernar', gender: 'female', description: 'Gentle, expressive tone' },
  { id: 'spk45', name: 'Speaker 45 (Algenib)', voice: 'Algenib', gender: 'male', description: 'Hearty, gravelly tone' },
  { id: 'spk46', name: 'Speaker 46 (Sulafat)', voice: 'Sulafat', gender: 'female', description: 'Warm, comforting tone' },
  { id: 'spk47', name: 'Speaker 47 (Alnilam)', voice: 'Alnilam', gender: 'male', description: 'Commanding, firm tone' },
  { id: 'spk48', name: 'Speaker 48 (Gacrux)', voice: 'Gacrux', gender: 'female', description: 'Mature, professional tone' },
  { id: 'spk49', name: 'Speaker 49 (Sadachbia)', voice: 'Sadachbia', gender: 'male', description: 'Lively, animated tone' },
  { id: 'spk50', name: 'Speaker 50 (Vindemiatrix)', voice: 'Vindemiatrix', gender: 'female', description: 'Delicate, calming tone' },
  { id: 'spk51', name: 'Speaker 51 (Sadaltager)', voice: 'Sadaltager', gender: 'male', description: 'Knowledgeable, steady tone' },
  { id: 'spk52', name: 'Speaker 52 (Zuri)', voice: 'Zuri', gender: 'female', description: 'Storytelling, warm tone' }
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
