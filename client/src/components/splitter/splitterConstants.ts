import { PresetStory, SplitterFileQueueItem } from './splitterTypes';

export const DEFAULT_SAMPLE_PARAGRAPHS: string[] = [
  'ئەم بەیانییە زوو لە خەو هەستام و پەنجەرەکەم کردەوە، [happy] هەواکە زۆر فێنک و ئارام بوو، بۆیە دەستم کرد بە ئامادەکردنی قاوەیەک.',
  'لەناکاو هاوڕێیەکی کۆنم پەیوەندی کرد و پێی وتم کە لە نزیک ماڵەکەمانە! [laugh] دوای ئەو هەموو ساڵە هەر بڕوام نەدەکرد.',
  'کاتێک گەیشت زۆر دڵخۆش بووین و یادەوەرییە کۆنەکانی قۆناغی خوێندنگەمان بیرکەوتەوە، [laugh] بە دەنگی بەرز پێدەکەنین.',
  'هەرچەندە کاتەکە زۆر خێرا تێپەڕی، [sigh] بەڵام ئەم سەردانە بووە یەکێک لە خۆشترین ڕۆژەکانی ئەم مانگە بۆ من.'
];

export const PRESET_STORIES: PresetStory[] = [
  {
    title: 'سەردانی هاوڕێ (4 Chunks - Emotion & Sorani)',
    dialect: 'sorani',
    paragraphs: [
      'ئەم بەیانییە زوو لە خەو هەستام و پەنجەرەکەم کردەوە، [happy] هەواکە زۆر فێنک و ئارام بوو، بۆیە دەستم کرد بە ئامادەکردنی قاوەیەک.',
      'لەناکاو هاوڕێیەکی کۆنم پەیوەندی کرد و پێی وتم کە لە نزیک ماڵەکەمانە! [laugh] دوای ئەو هەموو ساڵە هەر بڕوام نەدەکرد.',
      'کاتێک گەیشت زۆر دڵخۆش بووین و یادەوەرییە کۆنەکانی قۆناغی خوێندنگەمان بیرکەوتەوە، [laugh] بە دەنگی بەرز پێدەکەنین.',
      'هەرچەندە کاتەکە زۆر خێرا تێپەڕی، [sigh] بەڵام ئەم سەردانە بووە یەکێک لە خۆشترین ڕۆژەکانی ئەم مانگە بۆ من.'
    ]
  },
  {
    title: 'ڕاپۆرتی کەشوهەوا (3 Chunks - Formal Sorani)',
    dialect: 'sorani',
    paragraphs: [
      'بەپێی دواین پێشبینییەکانی کەشناسی لە هەرێمی کوردستان، شەپۆلێکی بارانبارین و فێنکبوونەوە لە ناوچە شاخاوییەکان دەست پێدەکات.',
      'شارەزایانی ژینگە داوا لە هاووڵاتییان دەکەن کە لە کاتی گەشتکردن بۆ دۆڵ و کوێستانەکان، ژینگەی سروشتی بە خاوێنی ڕابگرن.',
      'پاراستنی سەرچاوەکانی ئاو و دارستانەکان ئەرکێکی نیشتمانییە لە پێناو داهاتوویەکی تەندروست بۆ نەوەکانی داهاتوومان.'
    ]
  },
  {
    title: 'دەشتی نەینەوا و بادینان (3 Chunks - Badini)',
    dialect: 'badini',
    paragraphs: [
      'سپێدەیا ئەڤرۆ ل دەڤەرا بادینان و باژێرێ دهۆکێ هەوایەکێ زۆر فێنک و خوەش هەبوو، خەلک بەرەڤ کارێ خوە دچوون.',
      'چیایێن دەڤەرێ و سروشتێ زاخۆ و ئامێدیێ د ڤی وەرزیدا تابلۆیەکا سەرنجڕاکێش و جوان پێشکێشی گەشتیاران دکەن.',
      'هەمی دەمێ هیڤیا مە ئەوە ئارامی و پێشکەفتن ل هەمی گوند و باژێرێن کوردستانێ بەردەوام بیت.'
    ]
  },
  {
    title: 'تەکنەلۆژیا و ژیری دەستکرد (4 Chunks - Tech/Multi)',
    dialect: 'sorani',
    paragraphs: [
      'Today we are demonstrating advanced speech synthesis technology running on state of the art neural models.',
      'سیستەمەکە دەتوانێت دەقێکی درێژ وەربگرێت و لە یەک داواکاریدا بیخوێنێتەوە بە شێوەیەکی تەواو سروشتی و بێ کەموکوڕی.',
      'پاشان بە هاوکاری فلتەری بێدەنگی، پارچە دەنگییەکان بە وردی دابەش دەکرێن بێ ئەوەی هیچ ڕستەیەک ببڕدرێت.',
      'This breakthrough drastically multiplies API quota efficiency and creates high quality training datasets with ease.'
    ]
  },
  {
    title: 'چیرۆکا سێ زمانی (4 Chunks - Trilingual Badini)',
    dialect: 'badini',
    paragraphs: [
      'سپێدەیا ئەڤرۆ ل دهۆکێ مە دەست ب تاقیکرنەکا نوو یا زیرەکیا دەستکرد کر.',
      'المطبخ جان ريحته طيبة والگهوة جاهزة حتى نبدي يوم عمل جديد.',
      'The multi-language speech synthesis switch between English, Kurdish Badini, and Arabic is completely seamless.',
      'هیڤیا مە ئەوە ئەڤ تەکنەلۆژیایە خزمەتەکا مەزن پێشکێشی زمانێ کوردی ب گشت زارەڤان بکەت.'
    ]
  }
];

export const PACKET_SIZE_OPTIONS: number[] = [3, 4, 5, 6, 8, 10, 12];

export const STORAGE_KEYS = {
  QUEUE: 'gemini_splitter_queue_v1',
  ACTIVE_FILE_ID: 'gemini_splitter_active_file_id_v1',
  AUTO_ADVANCE: 'gemini_splitter_auto_advance_v1',
  AUTO_REMOVE_DUPS: 'gemini_splitter_auto_remove_dups_v1',
  PROMPT: 'gemini_splitter_prompt_v1'
} as const;

export const BADINI_DIRECTIVE = 'You are a native Kurdish Badini (Kurmanji) speaker and voice narrator from the Duhok/Badinan region performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Kurdish Badini pronunciation, correct Northern Kurmanji vocabulary and vowels (ڤ, خ، ح، غ، ۆ، ێ، ە), and natural Duhok intonation. Under NO circumstances should you speak Badini with Central Sorani phonetics or Erbil/Sulaymaniyah intonation.';

export const SORANI_DIRECTIVE = 'You are a native Kurdish Sorani speaker and voice narrator performing high-quality speech synthesis. Read and speak aloud the provided Kurdish text naturally and accurately with authentic Central Kurdish (Sorani) pronunciation, correct Kurdish vowels (ۆ, ێ, ە), and natural Erbil/Sulaymaniyah intonation.';

export const getTrilingualDirective = (dialect: string) => `You are an expert multilingual voice actor and speech synthesizer proficient in English, Kurdish (${dialect === 'badini' ? 'Badini' : 'Sorani'}), and Arabic. Read aloud every single sentence completely without skipping. Speak English with fluent English phonetics, Kurdish with authentic ${dialect === 'badini' ? 'Badini (Kurmanji) Duhok' : 'Central Sorani Erbil'} pronunciation, and Arabic with clear Arabic pronunciation. Seamlessly code-switch accents between English, Kurdish, and Arabic.`;

export const getInitialQueueData = () => {
  let queue: SplitterFileQueueItem[] = [];
  let activeId: string | null = null;
  try {
    const q = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (q) queue = JSON.parse(q);
    activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE_ID);
  } catch (e) {}
  const active = (activeId ? queue.find(f => f.id === activeId) : null) || queue.find(f => f.status === 'active') || queue[0];
  return {
    queue,
    activeId: active?.id || null,
    paragraphs: active?.paragraphs?.length ? active.paragraphs : DEFAULT_SAMPLE_PARAGRAPHS,
    content: active?.content || '',
    fileName: active?.fileName || ''
  };
};
