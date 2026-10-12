import React, { useEffect, useState } from 'react';
import { Download, Save, Activity } from 'lucide-react';
import { LabBatchResponse } from '../../services/contextSwitchingApi';
import { downloadLabDiagnostics, getLabEngineResults } from '../../services/contextLabUtils';
import { contextLabEngineMeta } from '../../data/contextLabEngines';
import { ContextMasterAudioPlayer } from './ContextMasterAudioPlayer';
import { ContextIterativeProcessCard } from './ContextIterativeProcessCard';
import { ContextLabClipPlayer } from './ContextLabClipPlayer';
import { ContextLabEngineDiagnostics } from './ContextLabEngineDiagnostics';
import { ContextLabProposals } from './ContextLabProposals';
import { ContextLabBoundaryPreview } from './ContextLabBoundaryPreview';
import { playExclusiveAudio } from '../../services/audioPlayback';

interface ContextLabResultsViewProps {
  result: LabBatchResponse | null;
  isSaving: boolean;
  isActive: boolean;
  onSaveToDataset: (engineKey: string) => void;
  onReuseMaster: () => void;
}

export const ContextLabResultsView: React.FC<ContextLabResultsViewProps> = ({ result, isSaving, isActive, onSaveToDataset, onReuseMaster }) => {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  useEffect(() => setPlayingKey(null), [result]);
  if (!result) return null;
  const engines = Object.entries(getLabEngineResults(result));
  const accepted = engines.filter(([, engine]) => engine.success && engine.clips.length > 0);
  const totalLines = Math.max(0, ...accepted.map(([, engine]) => engine.clips.length));
  const togglePlay = async (key: string) => {
    const audio = document.getElementById(`audio_${key}`) as HTMLAudioElement | null;
    if (!audio) return;
    if (playingKey === key) { audio.pause(); setPlayingKey(null); return; }
    if (playingKey) (document.getElementById(`audio_${playingKey}`) as HTMLAudioElement | null)?.pause();
    try { await playExclusiveAudio(audio); setPlayingKey(key); } catch { setPlayingKey(null); }
  };
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.6rem', flexWrap: 'wrap', marginBottom: '.85rem' }}>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', fontWeight: 700 }}>
          <Activity size={18} /> Master analysis results
          <span style={{ color: '#94a3b8', fontSize: '.75rem', fontWeight: 400 }}>{result.reusedMaster ? 'Existing audio' : 'New master'}</span>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {result.masterAudioUrl && <button className="btn btn-secondary btn-sm" type="button" disabled={isActive} onClick={onReuseMaster}>
            Use this master · 0 TTS calls
          </button>}
          <button className="btn btn-secondary btn-sm" type="button" onClick={() => downloadLabDiagnostics(result)}>
            <Download size={13} /> Diagnostics JSON
          </button>
        </div>
      </div>
      {result.masterAudioUrl && <ContextMasterAudioPlayer masterAudioUrl={result.masterAudioUrl}
        durationSeconds={result.durationSeconds} speaker1Voice={result.speaker1Voice} speaker2Voice={result.speaker2Voice} />}
      {result.warnings?.map((warning, index) => <p key={index} style={{ color: '#fbbf24', fontSize: '.8rem' }}>{warning}</p>)}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '.65rem', marginBottom: '1rem' }}>
        {engines.map(([engineId, engine]) => <ContextLabEngineDiagnostics key={engineId} engineId={engineId} result={engine} />)}
      </div>
      {result.masterAudioUrl && <ContextLabProposals engines={engines} masterAudioUrl={result.masterAudioUrl} />}
      {Boolean(result.iterativeAttempts?.length) && <ContextIterativeProcessCard attempts={result.iterativeAttempts!} />}
      {accepted.length > 0 && <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '.78rem', color: '#94a3b8' }}>Acceptance is a model check, not a transcript verification. Listen to each boundary before saving. Agreement between methods is not proof of correctness.</p>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {accepted.map(([id]) => <button key={id} className="btn btn-secondary btn-sm" type="button"
            disabled={isSaving || isActive || !result.success} onClick={() => onSaveToDataset(id)}>
            <Save size={13} /> Save {contextLabEngineMeta(id).label} slices
          </button>)}
        </div>
      </div>}
      {Array.from({ length: totalLines }, (_, index) => {
        const first = accepted.find(([, engine]) => engine.clips[index])?.[1].clips[index];
        const cuts = accepted.map(([, engine]) => engine.clips[index]?.end).filter((cut): cut is number => typeof cut === 'number');
        const spread = cuts.length > 1 ? (Math.max(...cuts) - Math.min(...cuts)) * 1000 : null;
        return <div key={index} className="glass-card" style={{ padding: '.9rem', marginBottom: '.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: index % 2 === 0 ? '#93c5fd' : '#f472b6' }}>
              Line {index + 1} · {first?.speakerName} · Speaker {index % 2 + 1}
            </span>
            {spread !== null && index < totalLines - 1 && <span style={{ fontSize: '.75rem', color: spread > 200 ? '#fbbf24' : '#94a3b8' }}>
              End boundary spread: {spread.toFixed(0)} ms
            </span>}
          </div>
          <div dir="auto" style={{ fontSize: '.85rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '.6rem' }}>{first?.text}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '.5rem' }}>
            {accepted.map(([id, engine]) => <ContextLabClipPlayer key={id} clip={engine.clips[index]}
              label={contextLabEngineMeta(id).label} color={contextLabEngineMeta(id).color} icon={<Activity size={12} />}
              keyPrefix={id} idx={index} isPlaying={playingKey === `${id}_${index}`}
              onTogglePlay={() => void togglePlay(`${id}_${index}`)} onEnded={() => setPlayingKey(null)} />)}
          </div>
          {result.masterAudioUrl && index < totalLines - 1 && <ContextLabBoundaryPreview masterAudioUrl={result.masterAudioUrl}
            cuts={accepted.filter(([, engine]) => Boolean(engine.clips[index])).map(([engineId, engine]) => ({ engineId, seconds: engine.clips[index].end }))} />}
        </div>;
      })}
    </div>
  );
};
