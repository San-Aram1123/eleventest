import { DetectionEngineType } from '../services/contextSwitchingApi';

export interface ContextLabEngine {
  id: DetectionEngineType;
  label: string;
  color: string;
  description: string;
  experimental?: boolean;
}

export const CONTEXT_LAB_ENGINES: ContextLabEngine[] = [
  { id: 'all', label: 'Compare new methods', color: '#FBBF24',
    description: 'Compare acoustic baselines, three neural architectures, and strict quiet refinement on the same master. No extra TTS calls.' },
  { id: 'timbre_dp', label: 'Timbre DP', color: '#34D399',
    description: 'Find an alternating speaker sequence from acoustic timbre with constrained dynamic programming.' },
  { id: 'spectral_change', label: 'Spectral Change', color: '#60A5FA',
    description: 'Propose handoffs from sustained spectral changes, then check for a safe quiet cut nearby.' },
  { id: 'speaker_embedding', label: 'Speaker Embedding', color: '#C084FC',
    description: 'Track CAM++ speaker identity across the master. Optional clean reference WAVs anchor the two voices.' },
  { id: 'speaker_resnet', label: 'WeSpeaker ResNet34', color: '#F59E0B',
    description: 'Independent 256-dimensional speaker model with multiscale handoff checks. Runs locally on CPU.' },
  { id: 'speaker_eres2net', label: 'ERes2Net', color: '#2DD4BF',
    description: 'Independent 192-dimensional 3D-Speaker model with multiscale handoff checks. Runs locally on CPU.' },
  { id: 'speaker_consensus', label: 'Three-model consensus', color: '#FB7185',
    description: 'Requires CAM++, ResNet34, and ERes2Net to agree on intersecting quiet handoffs. Slower, stricter corroboration.' },
  { id: 'speaker_strict', label: 'CAM++ strict quiet', color: '#94A3B8',
    description: 'Compare CAM++ against its original 180 ms search and mandatory 60 ms quiet interval.' },
  { id: 'pitch_f0', label: 'Pitch F0', color: '#F472B6', experimental: true,
    description: 'Previous pitch-based detector. Pitch overlap can make speaker boundaries ambiguous.' },
  { id: 'neural_crossover', label: 'Neural Crossover', color: '#818CF8', experimental: true,
    description: 'Previous diarization probability crossover detector; requires its local model dependencies.' },
  { id: 'pyannote', label: 'Pyannote baseline', color: '#A78BFA', experimental: true,
    description: 'Previous frame-level diarization baseline; requires its local model dependencies.' },
  { id: 'tri_hybrid', label: 'Tri-Hybrid DP', color: '#2DD4BF', experimental: true,
    description: 'Previous diarization, speech masking, and constrained segmentation experiment.' },
  { id: 'iterative_dp', label: 'Adaptive search', color: '#38BDF8', experimental: true,
    description: 'Previous iterative search. Attempt diagnostics remain available for comparison.' }
];

export function contextLabEngineMeta(id: string): ContextLabEngine {
  return CONTEXT_LAB_ENGINES.find(engine => engine.id === id) || {
    id: id as DetectionEngineType, label: id, color: '#94A3B8', description: ''
  };
}
