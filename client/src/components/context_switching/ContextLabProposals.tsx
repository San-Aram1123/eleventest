import React from 'react';
import { LabEngineResult } from '../../services/contextSwitchingApi';
import { contextLabEngineMeta } from '../../data/contextLabEngines';
import { ContextLabBoundaryPreview } from './ContextLabBoundaryPreview';

export const ContextLabProposals: React.FC<{
  engines: Array<[string, LabEngineResult]>;
  masterAudioUrl: string;
}> = ({ engines, masterAudioUrl }) => {
  const rejected = engines.filter(([, result]) => !result.success).flatMap(([engineId, result]) => {
    const proposals = result.diagnostics?.proposedBoundaries;
    if (!Array.isArray(proposals)) return [];
    return proposals.flatMap((proposal: Record<string, unknown>, index) =>
      typeof proposal.midpoint === 'number' && Number.isFinite(proposal.midpoint)
        ? [{ engineId, index, seconds: proposal.midpoint, accepted: proposal.accepted === true,
             reason: String(proposal.reason || 'Unverified proposal') }] : []);
  });
  if (!rejected.length) return null;
  return <details className="glass-card" style={{ padding: '.85rem', marginBottom: '1rem' }} open>
    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Audition rejected boundary proposals</summary>
    <p style={{ fontSize: '.78rem', color: '#fbbf24' }}>
      These are inspection points in the original master. No clips from a rejected result can be saved.
    </p>
    {rejected.map(item => <div key={`${item.engineId}_${item.index}`} style={{ marginBottom: '.8rem' }}>
      <span style={{ fontSize: '.78rem' }}>{contextLabEngineMeta(item.engineId).label} · Boundary {item.index + 1} ·
        {item.accepted ? ' locally supported; another boundary failed' : ` ${item.reason}`}</span>
      <ContextLabBoundaryPreview masterAudioUrl={masterAudioUrl} cuts={[{ engineId: item.engineId, seconds: item.seconds }]} />
    </div>)}
  </details>;
};
