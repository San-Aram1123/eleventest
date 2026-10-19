import { Sample } from '../client/src/types';
export interface V20Family { id: string; runId: string; provider: string; speaker: string; language: string;
  text: string; takes: Record<string, Sample[]>; present: number; duplicates: number }
export function v20FamilyId(sample: Sample): string | null;
export function groupV20Families(samples: Sample[], emotions: string[]): V20Family[];
