export interface GeminiPresetPrompt {
  label: string;
  text: string;
  emotion: string;
}

export const SORANI_PRESETS: GeminiPresetPrompt[] = [
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

export const BADINI_PRESETS: GeminiPresetPrompt[] = [
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
