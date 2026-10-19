import React, { useMemo, useState } from 'react';
import { Layers3 } from 'lucide-react';
import { Sample } from '../../../types';
import { groupV20Families, v20FamilyId } from '../../../../../shared/v20Families.mjs';
import emotions from '../../../../../shared/v20Emotions.json';
import { V20FamilyCard } from './V20FamilyCard';
import './v20Families.css';
export function V20FamiliesView({ samples, visibleSamples, onInspect }: {
  samples: Sample[]; visibleSamples: Sample[]; onInspect: (sample: Sample) => void;
}) {
  const [run, setRun] = useState('all'), [provider, setProvider] = useState('all');
  const [completion, setCompletion] = useState('all'), [page, setPage] = useState(0);
  const groups = useMemo(() => groupV20Families(samples, emotions.map(item => item.key)), [samples]);
  const eligible = useMemo(() => new Set(visibleSamples.map(v20FamilyId).filter(Boolean)), [visibleSamples]);
  const filtered = groups.filter(group => eligible.has(group.id) && (run === 'all' || group.runId === run)
    && (provider === 'all' || group.provider === provider)
    && (completion === 'all' || (completion === 'complete' ? group.present === 50 : group.present < 50)));
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 12) - 1));
  return <section className="v20-families">
    <div className="v20-view-heading"><Layers3 size={23}/><div><h2>V20 emotion families</h2>
      <p>One paragraph, one fixed voice, 50 emotions. Providers are kept separate.</p></div></div>
    <div className="v20-family-filters">
      <select aria-label="Run" className="select-control" value={run} onChange={event => { setRun(event.target.value); setPage(0); }}>
        <option value="all">All runs</option>{[...new Set(groups.map(group => group.runId))].map(id => <option key={id}>{id}</option>)}
      </select>
      <select aria-label="Provider" className="select-control" value={provider} onChange={event => { setProvider(event.target.value); setPage(0); }}>
        <option value="all">Both providers</option><option value="gemini">Gemini</option><option value="elevenlabs">ElevenLabs</option>
      </select>
      <select aria-label="Completion" className="select-control" value={completion} onChange={event => { setCompletion(event.target.value); setPage(0); }}>
        <option value="all">Any completion</option><option value="complete">Complete (50/50)</option><option value="incomplete">Incomplete</option>
      </select><span>{filtered.length} families / {filtered.reduce((sum, group) => sum + group.present, 0)} emotion takes</span>
    </div>
    {!filtered.length && <p className="glass-card" style={{ padding: 24 }}>No V20 families match the current filters.</p>}
    {filtered.slice(currentPage * 12, (currentPage + 1) * 12).map(group => <V20FamilyCard key={group.id} family={group} onInspect={onInspect}/>)}
    <div className="v20-family-pagination"><button className="btn btn-secondary" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button>
      <span>Page {currentPage + 1} of {Math.max(1, Math.ceil(filtered.length / 12))}</span>
      <button className="btn btn-secondary" disabled={(currentPage + 1) * 12 >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next</button></div>
  </section>;
}
