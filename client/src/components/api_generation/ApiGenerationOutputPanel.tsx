import React from 'react';
import { Volume2 } from 'lucide-react';
import { Sample, SampleRatings } from '../../types';
import { SampleResultCard } from '../shared/SampleResultCard';
import { EmptyStateView } from '../shared/EmptyStateView';

export interface ApiGenerationOutputPanelProps {
  currentSample: Sample | null;
  activePlaybackTime: number;
  onTimeUpdate: (time: number) => void;
  onSaveRatings: (ratings: SampleRatings) => void;
  onInspect: (sample: Sample) => void;
  resultRef: React.Ref<HTMLDivElement>;
}

export const ApiGenerationOutputPanel: React.FC<ApiGenerationOutputPanelProps> = ({
  currentSample,
  activePlaybackTime,
  onTimeUpdate,
  onSaveRatings,
  onInspect,
  resultRef
}) => {
  return (
    <div ref={resultRef} className="generation-output-container sticky-output-panel">
      {currentSample ? (
        <SampleResultCard
          sample={currentSample}
          autoPlay={true}
          showAlignment={true}
          activePlaybackTime={activePlaybackTime}
          onTimeUpdate={onTimeUpdate}
          onSaveRatings={onSaveRatings}
          onInspect={onInspect}
          className="glass-card-glow"
        />
      ) : (
        <EmptyStateView
          icon={<Volume2 size={36} className="text-cyan" />}
          title="Ready for Speech Generation"
          description={
            <>
              Enter your Kurdish text on the left, insert tags like <code>[laugh]</code> or enable{' '}
              <code>Continuous Whisper</code>, and press <strong>Generate Kurdish Speech</strong>.
            </>
          }
          features={[
            'Interactive result panel opens directly in view',
            'Preserves clean Kurdish text in 001.json stripping tags',
            'Supports multiple inline emotion tags & continuous whisper'
          ]}
        />
      )}
    </div>
  );
};
