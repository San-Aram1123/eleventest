import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENV_FILE_PATH = path.resolve(__dirname, '../../.env');
export const GEMINI_KEYS_FILE_PATH = path.resolve(__dirname, '../../gemini_keys.json');
export const GEMINI_DISABLED_KEYS_FILE_PATH = path.resolve(__dirname, '../../gemini_disabled_keys.json');

export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const GEMINI_VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Upbeat and lively tone (Recommended Default)' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Informative, authoritative narrator' }, { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Passionate, strong tone' },
  { id: 'Orus', name: 'Orus', gender: 'Male', description: 'Calm, steady tone' }, { id: 'Enceladus', name: 'Enceladus', gender: 'Male', description: 'Soft, breathy tone' },
  { id: 'Iapetus', name: 'Iapetus', gender: 'Male', description: 'Clear, crisp tone' }, { id: 'Umbriel', name: 'Umbriel', gender: 'Male', description: 'Smooth, relaxed tone' },
  { id: 'Algieba', name: 'Algieba', gender: 'Male', description: 'Melodic tone' }, { id: 'Rasalgethi', name: 'Rasalgethi', gender: 'Male', description: 'Professional narrator' },
  { id: 'Schedar', name: 'Schedar', gender: 'Male', description: 'Balanced tone' }, { id: 'Pulcherrima', name: 'Pulcherrima', gender: 'Male', description: 'Dynamic tone' },
  { id: 'Achird', name: 'Achird', gender: 'Male', description: 'Warm, kind tone' }, { id: 'Zubenelgenubi', name: 'Zubenelgenubi', gender: 'Male', description: 'Casual tone' },
  { id: 'Algenib', name: 'Algenib', gender: 'Male', description: 'Hearty tone' }, { id: 'Alnilam', name: 'Alnilam', gender: 'Male', description: 'Confident tone' },
  { id: 'Sadachbia', name: 'Sadachbia', gender: 'Male', description: 'Animated tone' }, { id: 'Sadaltager', name: 'Sadaltager', gender: 'Male', description: 'Wise tone' },
  { id: 'Arlo', name: 'Arlo', gender: 'Male', description: 'Approachable tone' }, { id: 'Knox', name: 'Knox', gender: 'Male', description: 'Conversational tone' },
  { id: 'Koda', name: 'Koda', gender: 'Male', description: 'Direct tone' }, { id: 'Ludo', name: 'Ludo', gender: 'Male', description: 'Instructional tone' },
  { id: 'Mako', name: 'Mako', gender: 'Male', description: 'Fast-paced tone' }, { id: 'Milo', name: 'Milo', gender: 'Male', description: 'Talkshow tone' },
  { id: 'Neno', name: 'Neno', gender: 'Male', description: 'Deep tone' }, { id: 'Olin', name: 'Olin', gender: 'Male', description: 'Precise tone' },
  { id: 'Rami', name: 'Rami', gender: 'Male', description: 'Modern tone' }, { id: 'Riko', name: 'Riko', gender: 'Male', description: 'Documentary narrator' },
  { id: 'Varo', name: 'Varo', gender: 'Male', description: 'Chill tone' }, { id: 'Zeno', name: 'Zeno', gender: 'Male', description: 'Cool tone' },
  { id: 'Aoede', name: 'Aoede', gender: 'Female', description: 'Relaxed, natural, gentle tone (Recommended Default)' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Bright, vibrant tone' }, { id: 'Leda', name: 'Leda', gender: 'Female', description: 'Youthful tone' },
  { id: 'Callirrhoe', name: 'Callirrhoe', gender: 'Female', description: 'Warm tone' }, { id: 'Autonoe', name: 'Autonoe', gender: 'Female', description: 'Cheerful tone' },
  { id: 'Despina', name: 'Despina', gender: 'Female', description: 'Smooth tone' }, { id: 'Erinome', name: 'Erinome', gender: 'Female', description: 'Articulate tone' },
  { id: 'Laomedeia', name: 'Laomedeia', gender: 'Female', description: 'Upbeat tone' }, { id: 'Achernar', name: 'Achernar', gender: 'Female', description: 'Soft tone' },
  { id: 'Vindemiatrix', name: 'Vindemiatrix', gender: 'Female', description: 'Delicate tone' }, { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Firm tone' },
  { id: 'Sulafat', name: 'Sulafat', gender: 'Female', description: 'Comforting tone' }, { id: 'Gacrux', name: 'Gacrux', gender: 'Female', description: 'Mature tone' },
  { id: 'Lora', name: 'Lora', gender: 'Female', description: 'Medium-pitch tone' }, { id: 'Lumi', name: 'Lumi', gender: 'Female', description: 'Teacher tone' },
  { id: 'Nika', name: 'Nika', gender: 'Female', description: 'Approachable tone' }, { id: 'Nyla', name: 'Nyla', gender: 'Female', description: 'Modern tone' },
  { id: 'Rina', name: 'Rina', gender: 'Female', description: 'Friendly host tone' }, { id: 'Sami', name: 'Sami', gender: 'Female', description: 'Narrator tone' },
  { id: 'Sola', name: 'Sola', gender: 'Female', description: 'Clear tone' }, { id: 'Tari', name: 'Tari', gender: 'Female', description: 'Cinematic tone' },
  { id: 'Tavi', name: 'Tavi', gender: 'Female', description: 'Talkshow tone' }, { id: 'Tova', name: 'Tova', gender: 'Female', description: 'Soothing tone' },
  { id: 'Veda', name: 'Veda', gender: 'Female', description: 'Radio host tone' }, { id: 'Zali', name: 'Zali', gender: 'Female', description: 'Lively tone' },
  { id: 'Zuri', name: 'Zuri', gender: 'Female', description: 'Articulate tone' }
];

export const KNOWN_AUDIO_MODELS = [
  { id: 'gemini-3.8-flash-tts', name: 'Gemini 3.8 Flash TTS (Default)', isDefault: true },
  { id: 'gemini-3.8-flash-lite-tts', name: 'Gemini 3.8 Flash-Lite TTS' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' }
];
