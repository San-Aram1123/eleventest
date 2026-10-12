import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Sample } from '../../types';

export interface ComparisonSelectorBarProps {
  samples: Sample[];
  selectedIdA: string;
  onSelectIdA: (id: string) => void;
  selectedIdB: string;
  onSelectIdB: (id: string) => void;
}

export const ComparisonSelectorBar: React.FC<ComparisonSelectorBarProps> = ({
  samples,
  selectedIdA,
  onSelectIdA,
  selectedIdB,
  onSelectIdB
}) => {
  return (
    <div className="glass-card selector-bar">
      <div className="selector-column">
        <label className="form-label">Sample A (Left)</label>
        <select
          className="select-control"
          value={selectedIdA}
          onChange={(e) => onSelectIdA(e.target.value)}
        >
          {samples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} • [{s.method === 'elevenlabs_api' ? 'API' : 'Web'}] {s.emotion} — {s.text.slice(0, 30)}...
            </option>
          ))}
        </select>
      </div>

      <div className="compare-icon-wrap">
        <ArrowLeftRight size={20} className="text-cyan" />
      </div>

      <div className="selector-column">
        <label className="form-label">Sample B (Right)</label>
        <select
          className="select-control"
          value={selectedIdB}
          onChange={(e) => onSelectIdB(e.target.value)}
        >
          {samples.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} • [{s.method === 'elevenlabs_api' ? 'API' : 'Web'}] {s.emotion} — {s.text.slice(0, 30)}...
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
