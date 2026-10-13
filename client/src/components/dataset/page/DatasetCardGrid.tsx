import React from 'react';
import { Sample, SampleRatings } from '../../../types';
import { DatasetSampleCard } from './DatasetSampleCard';

interface DatasetCardGridProps {
  samples: Sample[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onInspect: (sample: Sample) => void;
  onDelete: (id: string) => void;
  onSampleUpdated?: (sample: Sample) => void;
  onRatingChange: (id: string, ratings: SampleRatings) => void;
}

export const DatasetCardGrid: React.FC<DatasetCardGridProps> = ({
  samples,
  selectedIds,
  onToggleSelect,
  onInspect,
  onDelete,
  onRatingChange,
  onSampleUpdated
}) => {
  return (
    <div className="samples-card-grid">
      {samples.map((sample) => (
        <DatasetSampleCard
          key={sample.id}
          sample={sample}
          isSelected={selectedIds.has(sample.id)}
          onToggleSelect={onToggleSelect}
          onInspect={onInspect}
          onDelete={onDelete}
          onRatingChange={onRatingChange}
          onSampleUpdated={onSampleUpdated}
        />
      ))}
    </div>
  );
};
