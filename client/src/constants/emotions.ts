import { EmotionType } from '../types';

export interface EmotionItem {
  value: EmotionType;
  label: string;
  tag: string;
  color: string;
  desc?: string;
}

export const EMOTIONS: EmotionItem[] = [
  { value: 'neutral', label: 'Neutral', tag: '', color: 'neutral', desc: 'Standard baseline tone' },
  { value: 'laughing', label: 'Laughing', tag: '[laugh]', color: 'laughing', desc: 'Native v3 laughter & cheerful delivery' },
  { value: 'happy', label: 'Happy', tag: '[happy]', color: 'happy', desc: 'Joyful & upbeat inflection' },
  { value: 'whisper', label: 'Whisper', tag: '[whisper]', color: 'whisper', desc: 'Soft breathy whisper' },
  { value: 'angry', label: 'Angry', tag: '[angry]', color: 'angry', desc: 'Sharp, aggressive intensity' },
  { value: 'sad', label: 'Sad', tag: '[sad]', color: 'sad', desc: 'Melancholic, slower cadence' },
  { value: 'excited', label: 'Excited', tag: '[excited]', color: 'excited', desc: 'Energetic, dynamic pitch' },
  { value: 'custom', label: 'Custom Tag', tag: '[laugh]', color: 'custom', desc: 'User-defined audio tag prompt' }
];

export const getEmotionTag = (emotion: EmotionType | string): string => {
  const match = EMOTIONS.find(e => e.value === emotion);
  return match?.tag || '';
};
