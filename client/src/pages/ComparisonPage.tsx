import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import { MetadataModal } from '../components/MetadataModal';
import { Sample, SampleRatings } from '../types';
import { updateSample } from '../services/api';
import { EmptyStateView } from '../components/shared/EmptyStateView';
import { MatchingPairsBar } from '../components/comparison/MatchingPairsBar';
import { ComparisonSelectorBar } from '../components/comparison/ComparisonSelectorBar';
import { ComparisonSampleCard } from '../components/comparison/ComparisonSampleCard';

interface ComparisonPageProps {
  samples: Sample[];
  onSampleUpdated: (sample: Sample) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  samples,
  onSampleUpdated,
  addToast
}) => {
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);

  const textGroups = samples.reduce((acc, sample) => {
    const key = sample.text.trim();
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {} as Record<string, Sample[]>);

  const matchingPairs = Object.entries(textGroups).filter(([_, list]) => list.length >= 2);

  const sampleA = samples.find(s => s.id === selectedIdA) || (samples.length > 0 ? samples[0] : null);
  const sampleB = samples.find(s => s.id === selectedIdB) || (samples.length > 1 ? samples[1] : null);

  const handleSelectMatchingPair = (pairSamples: Sample[]) => {
    const apiSample = pairSamples.find(s => s.method === 'elevenlabs_api') || pairSamples[0];
    const webSample = pairSamples.find(s => s.method === 'elevenlabs_web') || pairSamples[1] || pairSamples[0];
    setSelectedIdA(apiSample.id);
    setSelectedIdB(webSample.id);
  };

  const handleSaveRatings = async (sample: Sample | null, side: string, ratings: SampleRatings) => {
    if (!sample) return;
    try {
      const updated = await updateSample(sample.id, { ratings });
      onSampleUpdated(updated);
      addToast({ type: 'success', title: 'Ratings Saved', message: `Ratings saved for Sample ${side} (${sample.id})` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    }
  };

  if (samples.length < 2) {
    return (
      <div className="compare-page-root">
        <div className="page-header">
          <h1 className="page-title">
            <GitCompare size={24} className="text-cyan inline-icon" />
            <span>Compare API vs Normal Web Workflow</span>
          </h1>
          <p className="page-description">
            Side-by-side A/B evaluation of Kurdish speech naturalness, emotional inflection, and pronunciation.
          </p>
        </div>

        <EmptyStateView
          icon={<GitCompare size={48} className="text-dim" />}
          title="Need at least 2 Samples to Compare"
          description="Generate speech using both the ElevenLabs API and Normal Web Workflow tabs to compare them side-by-side!"
          className="empty-compare-card"
        />
      </div>
    );
  }

  return (
    <div className="compare-page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GitCompare size={24} className="text-cyan inline-icon" />
            <span>Compare API vs Normal Web Workflow</span>
          </h1>
          <p className="page-description">
            Side-by-side A/B benchmark of Kurdish speech quality, Kurdish vowel pronunciation, and emotional accuracy.
          </p>
        </div>
      </div>

      <MatchingPairsBar
        matchingPairs={matchingPairs}
        onSelectMatchingPair={handleSelectMatchingPair}
      />

      <ComparisonSelectorBar
        samples={samples}
        selectedIdA={sampleA?.id || ''}
        onSelectIdA={setSelectedIdA}
        selectedIdB={sampleB?.id || ''}
        onSelectIdB={setSelectedIdB}
      />

      <div className="grid-2 compare-grid">
        <ComparisonSampleCard
          sample={sampleA}
          side="A"
          onSaveRatings={(r) => handleSaveRatings(sampleA, 'A', r)}
          onInspect={setInspectingSample}
        />
        <ComparisonSampleCard
          sample={sampleB}
          side="B"
          onSaveRatings={(r) => handleSaveRatings(sampleB, 'B', r)}
          onInspect={setInspectingSample}
        />
      </div>

      {inspectingSample && (
        <MetadataModal
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            onSampleUpdated(updated);
          }}
        />
      )}
    </div>
  );
};
