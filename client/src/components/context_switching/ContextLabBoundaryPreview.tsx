import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { contextLabEngineMeta } from '../../data/contextLabEngines';
import { playExclusiveAudio } from '../../services/audioPlayback';

interface ContextLabBoundaryPreviewProps {
  masterAudioUrl: string;
  cuts: Array<{ engineId: string; seconds: number }>;
}

export const ContextLabBoundaryPreview: React.FC<ContextLabBoundaryPreviewProps> = ({ masterAudioUrl, cuts }) => {
  const audio = useRef<HTMLAudioElement>(null);
  const stopAt = useRef(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const preview = async (engineId: string, seconds: number) => {
    if (!audio.current) return;
    if (playing === engineId) { audio.current.pause(); return; }
    audio.current.currentTime = Math.max(0, seconds - 1.5);
    stopAt.current = seconds + 1.5;
    setFailed(false);
    try { await playExclusiveAudio(audio.current); setPlaying(engineId); }
    catch { setPlaying(null); setFailed(true); }
  };
  return <div style={{ marginTop: '.7rem', paddingTop: '.6rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
    <audio ref={audio} src={masterAudioUrl} preload="none" onPause={() => setPlaying(null)} onEnded={() => setPlaying(null)}
      onTimeUpdate={() => { if (audio.current && audio.current.currentTime >= stopAt.current) audio.current.pause(); }} />
    <div style={{ fontSize: '.72rem', color: '#94a3b8', marginBottom: '.4rem' }}>Hear each cut in the uncut master (1.5s before and after):</div>
    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
      {cuts.map(cut => <button key={cut.engineId} type="button" className="btn btn-secondary btn-sm"
        onClick={() => void preview(cut.engineId, cut.seconds)} style={{ fontSize: '.7rem', color: contextLabEngineMeta(cut.engineId).color }}>
        {playing === cut.engineId ? <Pause size={11} /> : <Play size={11} />}
        {contextLabEngineMeta(cut.engineId).label} · {cut.seconds.toFixed(2)}s
      </button>)}
    </div>
    {failed && <p role="alert" style={{ color: '#fca5a5', fontSize: '.72rem' }}>The browser could not play this preview. Download the master to inspect the boundary.</p>}
  </div>;
};
