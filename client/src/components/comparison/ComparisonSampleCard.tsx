import React from 'react';
import { Sample, SampleRatings } from '../../types';
import { SampleResultCard } from '../shared/SampleResultCard';

export interface ComparisonSampleCardProps {
  sample: Sample | null;
  side: 'A' | 'B';
  onSaveRatings: (ratings: SampleRatings) => void;
  onInspect: (sample: Sample) => void;
}

export const ComparisonSampleCard: React.FC<ComparisonSampleCardProps> = ({
  sample,
  side,
  onSaveRatings,
  onInspect
}) => {
  if (!sample) return null;

  const sideBadge = {
    label: `Sample ${side}`,
    className: side === 'A' ? 'badge-a' : 'badge-b'
  };

  const extraMetaRows = [
    { label: 'Voice', value: sample.voice_name || sample.voice_id || 'ElevenLabs Voice' },
    { label: 'Model', value: sample.model_id || 'Multilingual' },
    { label: 'Prompt Tag', value: sample.emotion_tag || 'None' }
  ];

  return (
    <SampleResultCard
      sample={sample}
      sideBadge={sideBadge}
      extraMetaRows={extraMetaRows}
      onSaveRatings={onSaveRatings}
      onInspect={onInspect}
      className={`compare-card ${side === 'A' ? 'card-a' : 'card-b'}`}
    />
  );
};
