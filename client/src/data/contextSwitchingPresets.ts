export interface ContextSwitchPreset {
  id: string;
  title: string;
  category: string;
  emotion: string;
  text: string;
  description: string;
}

export const CONTEXT_SWITCH_PRESETS: ContextSwitchPreset[] = [
  {
    id: 'tech_backend',
    title: '1. Software & Tech Team',
    category: 'Technology',
    emotion: 'excited',
    description: 'Tech terms (team, project, backend, database, optimize) + Arabic invocation',
    text: 'ئەمڕۆ کۆبوونەوەم لەگەڵ team-ەکەمان کرد دەربارەی project-ە نوێیەکە، لە ڕاستیدا backend زۆر باش کار دەکات بەڵام دەبێت database-ەکە optimize بکەین، واللهِ ئەنجامەکە زۆر نایاب دەبێت إن شاء الله.'
  },
  {
    id: 'startup_investor',
    title: '2. Startup & Investor Pitch',
    category: 'Business',
    emotion: 'serious',
    description: 'Business terms (presentation, finalize, investor, market research, metrics) + Arabic',
    text: 'پێویستە ئەمڕۆ presentation-ەکەمان finalize بکەین بۆ investor-ەکان، چونکە market research نیشانی دەدات داواکاری زۆرە، الحمد لله هەموو metrics-ەکان زۆر positive-ن و بێگومان دەستکەوتی گەورەمان دەبێت.'
  },
  {
    id: 'cafe_espresso',
    title: '3. Coffee Shop Order',
    category: 'Daily Life',
    emotion: 'friendly',
    description: 'Casual cafe order with English beverage names and Arabic blessings',
    text: 'بەیانیت باش کاکە گیان، دەتوانیت یەک double espresso بۆ من ئامادە بکەیت بە almond milk؟ بەڕاستی بەیانیان بەبێ coffee هیچ energy-م نییە، بارك الله فيك دەستت خۆش بێت.'
  },
  {
    id: 'academic_paper',
    title: '4. University Research Paper',
    category: 'Education',
    emotion: 'neutral',
    description: 'Academic workflow (research paper, submit, conference, feedback, deadline)',
    text: 'ئەم هەفتەیە دەبێت research paper-ەکەم submit بکەم بۆ conference، پرۆفیسۆرەکەمان گوتی feedback زۆر باشە بەڵام دەبێت analysis-ی زیاتر بکەیت، سبحان الله کات زۆر خێرا تێدەپەڕێت و deadline زۆر نزیکە.'
  },
  {
    id: 'medical_checkup',
    title: '5. Medical Clinic & Health',
    category: 'Healthcare',
    emotion: 'friendly',
    description: 'Clinical terms (blood test, checkup, immune system, recovery) + Arabic',
    text: 'دکتۆرەکە گوتی پێویستە blood test و checkup گشتی ئەنجام بدەیت بۆ ئەوەی immune system-ت بەهێزتر بێت، تەندروستی گەورەترین نیعمەتە، ما شاء الله نەشتەرگەرییەکە بە سەرکەوتوویی تەواو بوو و recovery زۆر خێرایە.'
  },
  {
    id: 'customer_support',
    title: '6. Customer Support Desk',
    category: 'Customer Service',
    emotion: 'friendly',
    description: 'Support hotline (customer service, account, password reset, email)',
    text: 'سڵاو بەڕێزم، زۆر سوپاس بۆ پەیوەندیکردنت بە customer service، کێشەی account-ەکەت چارەسەر کرا و password reset لینکەکەمان بۆ email-ەکەت نارد، جزاك الله خيراً ئەگەر هەر پرسیارێکی ترت هەیە لە خزمەتداین.'
  },
  {
    id: 'media_youtube',
    title: '7. Social Media & Creator',
    category: 'Media',
    emotion: 'happy',
    description: 'Creator metrics (YouTube, Instagram, views, engagement, content creation)',
    text: 'ڤیدیۆی تازەمان لەسەر YouTube و Instagram بڵاو کردەوە، views و engagement زۆر سەرسوڕهێنەرە، بە تایبەتی لە comments خەڵک زۆر پشتگیری دەکەن، لا حول ولا قوة إلا بالله ساڵانێکی زۆر کارکردن ئەمڕۆ بەرهەمی هەبوو.'
  },
  {
    id: 'travel_airport',
    title: '8. Airport & Travel Logistics',
    category: 'Travel',
    emotion: 'excited',
    description: 'Airport logistics (airport, luggage, check-in, boarding pass, gate, on time)',
    text: 'ئێستا لە airport گەیشتم و luggage-ەکانم check-in کرد، چاوەڕێی boarding pass دەکەم بۆ ئەوەی بەرەو gate بڕۆم، تەیارەکە on time دەفڕێت، فی أمان الله دەست بەم گەشتە دەکەین بە هیوای سەفەرێکی ئارام.'
  },
  {
    id: 'fitness_gym',
    title: '9. Fitness & Gym Workout',
    category: 'Fitness',
    emotion: 'excited',
    description: 'Workout routine (workout, gym, cardio, weight training, muscle recovery)',
    text: 'ئەمڕۆ workout-ێکی زۆر قورسم کرد لە gym، بە تایبەتی لەسەر cardio و weight training، پێویستە پرۆتینی زیاتر وەربگرم بۆ muscle recovery، قدر الله وما شاء فعل بەڵام بەردەوام دەبین تا دەگەین بە fitness goal-ەکانمان.'
  },
  {
    id: 'online_shopping',
    title: '10. E-Commerce & Delivery',
    category: 'Shopping',
    emotion: 'happy',
    description: 'Online purchase (laptop, website, package, delivery speed, mobile app, specification)',
    text: 'ئەو laptop-ەی لە website داوام کردبوو گەیشت، package-ەکەی زۆر پارێزراو بوو و delivery speed زۆر ناوازە بوو، tracking code-م لە mobile app داخڵ کرد، تبارك الله هەموو specification-ەکان ڕێک وەک ئەوەیە لە description نووسرابوو.'
  }
];

export const ALL_10_PRESETS_TEXT = CONTEXT_SWITCH_PRESETS.map((p) => p.text).join('\n\n');

export const CONTEXT_EMOTIONS = [
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'excited', label: 'Excited', emoji: '⚡' },
  { id: 'whisper', label: 'Whisper', emoji: '🤫' },
  { id: 'serious', label: 'Serious', emoji: '💼' },
  { id: 'friendly', label: 'Friendly', emoji: '🤝' },
];

export const CONTEXT_VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'Male (Lively)' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female (Natural)' },
  { id: 'Charon', name: 'Charon', gender: 'Male (Authoritative)' },
  { id: 'Lora', name: 'Lora', gender: 'Female (Expressive)' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male (Energetic)' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female (Calm)' },
];

export function extractParagraphsArray(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  return rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

export function parseParagraphsFromText(rawText: string) {
  const paragraphs = extractParagraphsArray(rawText);
  return paragraphs.map((text, idx) => ({
    id: `p_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    text,
    status: 'idle' as const
  }));
}


/**
 * Builds style directive for Gemini 3.8 Flash TTS enforcing zero-pause, seamless code-switching flow.
 */
export function getZeroPausePromptInstruction(emotion: string): string {
  let emotionTone = 'in a natural, expressive conversational tone';
  switch (emotion) {
    case 'happy':
      emotionTone = 'in a joyful, lively, and cheerful tone';
      break;
    case 'excited':
      emotionTone = 'with high energy, enthusiasm, and an excited tone';
      break;
    case 'sad':
      emotionTone = 'in a somber, melancholic, and gentle tone';
      break;
    case 'angry':
      emotionTone = 'in a sharp, firm, and assertive tone';
      break;
    case 'whisper':
      emotionTone = 'in a quiet, intimate, whispered tone';
      break;
    case 'serious':
      emotionTone = 'in a formal, professional, and serious tone';
      break;
    case 'friendly':
      emotionTone = 'in a warm, welcoming, and friendly conversational tone';
      break;
    default:
      break;
  }

  return `Within each paragraph, speak ${emotionTone} with completely fluid, continuous, unbroken rhythm and zero pauses, zero hesitations, and zero breath breaks when transitioning between Kurdish, English, and Arabic words. Maintain a seamless flow across language boundaries with authentic native pronunciation for all terms. CRITICAL ACCENT BOUNDARY RULE: Immediately reset to pure, authentic Central Kurdish (Sorani) phonology, authentic Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation the moment Arabic phrases finish. Under NO circumstances carry over Arabic accents, Arabic gutturals, or Arabic vowel intonation into the Kurdish words that follow. ZERO BREATHING SOUNDS: Strictly do NOT produce any audible breath intakes, gasping, inhaling, sighing, or breathy pauses. Deliver clean, crisp studio speech with zero breath sounds. CRITICAL INTER-PARAGRAPH PAUSE: Between separate paragraphs at each ellipsis (... ...), STOP completely and pause in 2.0 full seconds of absolute dead silence without vocalizing or breathing before beginning the next paragraph. Never rush or merge paragraphs.`;
}

