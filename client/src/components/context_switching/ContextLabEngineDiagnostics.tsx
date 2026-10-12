import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { contextLabEngineMeta } from '../../data/contextLabEngines';
import { LabEngineResult } from '../../services/contextSwitchingApi';

interface ContextLabEngineDiagnosticsProps {
  engineId: string;
  result: LabEngineResult;
}

export const ContextLabEngineDiagnostics: React.FC<ContextLabEngineDiagnosticsProps> = ({ engineId, result }) => {
  const meta = contextLabEngineMeta(engineId);
  const diagnostics = result.diagnostics || {};
  const confidence = typeof diagnostics.minConfidence === 'number' ? diagnostics.minConfidence : null;
  const metrics = diagnostics.metrics as Record<string, unknown> | undefined;
  const warnings = Array.isArray(diagnostics.warnings) ? diagnostics.warnings.map(String) : [];
  if (typeof diagnostics.warning === 'string') warnings.push(diagnostics.warning);
  return (
    <div className="glass-card" style={{ padding: '.85rem', border: `1px solid ${result.success ? meta.color + '55' : '#ef444455'}`, borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', fontWeight: 700, color: meta.color }}>
        {result.success ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{meta.label}
      </div>
      <div style={{ fontSize: '.78rem', marginTop: '.4rem', color: result.success ? '#cbd5e1' : '#fca5a5' }}>
        {result.success ? `Accepted ${result.clips.length} slices` : `Rejected: ${result.error || 'No safe boundary sequence.'}`}
        {confidence !== null && <span> · minimum identity score {confidence.toFixed(3)} (uncalibrated)</span>}
      </div>
      {typeof diagnostics.enrollment === 'string' && <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.3rem' }}>
        Speaker enrollment: {diagnostics.enrollment === 'reference' ? 'uploaded reference voices' : diagnostics.enrollment === 'global_cluster' ? 'inferred from this master' : diagnostics.enrollment}
      </div>}
      {metrics && typeof metrics.boundaryMaeMs === 'number' && <div style={{ marginTop: '.3rem', fontSize: '.75rem', color: '#93c5fd' }}>
        Mean boundary error: {metrics.boundaryMaeMs.toFixed(1)} ms
        {typeof metrics.maxBoundaryErrorMs === 'number' && ` · worst: ${metrics.maxBoundaryErrorMs.toFixed(1)} ms`}
      </div>}
      {warnings.map((warning, index) => <div key={index} style={{ color: '#fbbf24', fontSize: '.75rem', marginTop: '.4rem' }}>{warning}</div>)}
      {Object.keys(diagnostics).length > 0 && <details style={{ marginTop: '.6rem' }}>
        <summary style={{ color: '#94a3b8', fontSize: '.75rem', cursor: 'pointer' }}>Full diagnostics</summary>
        <pre style={{ fontSize: '.7rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 290, overflow: 'auto' }}>
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </details>}
    </div>
  );
};
