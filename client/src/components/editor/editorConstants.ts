export interface PresetExample {
  title: string;
  emotion: string;
  text: string;
}

export interface KurdishChar {
  char: string;
  name: string;
}

export interface QuickInlineTag {
  tag: string;
  label: string;
}

export const PRESET_EXAMPLES: PresetExample[] = [
  {
    title: 'Happy with Laughs',
    emotion: 'laugh',
    text: 'سڵاو! [laugh] ئەمڕۆ زۆر دڵخۆشم، [laugh] چونکە شتێکی زۆر خۆش ڕوویدا.'
  },
  {
    title: 'Whisper Secret',
    emotion: 'whisper',
    text: '[whisper] گوێ بگرە، ئەمە نهێنییەکی زۆر گەورەیە.'
  },
  {
    title: 'Angry Question',
    emotion: 'angry',
    text: 'ئەمە چییە؟ [angry] بۆچی هەمیشە ئەمە ڕوودەدات؟'
  },
  {
    title: 'Multi-Emotions',
    emotion: 'mixed',
    text: 'سڵاو! [laugh] ئەمە زۆر خۆشە بەڵام [whisper] دەبێت زۆر هێمن بین.'
  },
  {
    title: 'Simple Greeting',
    emotion: 'neutral',
    text: 'سڵاو! چۆنی؟'
  }
];

export const KURDISH_KEYBOARD_CHARS: KurdishChar[] = [
  { char: 'ێ', name: 'Ye bi ser' },
  { char: 'ڕ', name: 'Re giran' },
  { char: 'ڵ', name: 'Lam giran' },
  { char: 'ڤ', name: 'Ve' },
  { char: 'ۆ', name: 'O' },
  { char: 'ئ', name: 'Hamza' },
  { char: 'ک', name: 'Kaf' },
  { char: 'ی', name: 'Ye' },
  { char: 'ە', name: 'He / Ae' }
];

export const QUICK_INLINE_TAGS: QuickInlineTag[] = [
  { tag: '[laugh]', label: 'Laugh' },
  { tag: '[whisper]', label: 'Whisper' },
  { tag: '[sigh]', label: 'Sigh' },
  { tag: '[gasp]', label: 'Gasp' },
  { tag: '[crying]', label: 'Crying' },
  { tag: '[shouting]', label: 'Shout' },
  { tag: '[angry]', label: 'Angry' },
  { tag: '[happy]', label: 'Happy' },
  { tag: '[giggle]', label: 'Giggle' },
  { tag: '[excited]', label: 'Excited' },
  { tag: '[cough]', label: 'Cough' }
];
