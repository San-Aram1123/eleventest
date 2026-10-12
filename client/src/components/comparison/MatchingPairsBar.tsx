import React from 'react';
import { Sparkles } from 'lucide-react';
import { Sample } from '../../types';

export interface MatchingPairsBarProps {
  matchingPairs: Array<[string, Sample[]]>;
  onSelectMatchingPair: (samples: Sample[]) => void;
}

export const MatchingPairsBar: React.FC<MatchingPairsBarProps> = ({
  matchingPairs,
  onSelectMatchingPair
}) => {
  if (matchingPairs.length === 0) return null;

  return (
    <div className="glass-card matching-pairs-card">
      <div className="pairs-title">
        <Sparkles size={15} className="text-amber" />
        <span>Found {matchingPairs.length} Matching Kurdish Text Group{matchingPairs.length > 1 ? 's' : ''}:</span>
      </div>
      <div className="pairs-list">
        {matchingPairs.map(([text, list], idx) => (
          <button
            key={idx}
            className="pair-select-btn"
            onClick={() => onSelectMatchingPair(list)}
            title={text}
          >
            <span className="pair-count-badge">{list.length} versions</span>
            <span className="kurdish-text pair-text" dir="rtl">{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
