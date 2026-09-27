import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Sample } from '../../types';
import { REQUIRED_EMOTIONS } from './pairedConstants';
import { FamilyCard, FamilyGroup } from './FamilyCard';

interface PairedFamiliesViewProps {
  samples: Sample[];
  onPlayAudio?: (url: string, sampleId: string) => void;
  activeAudioId?: string | null;
  recentSampleIds?: Set<string>;
  isLiveSyncActive?: boolean;
}

export const PairedFamiliesView: React.FC<PairedFamiliesViewProps> = ({
  samples,
  onPlayAudio,
  activeAudioId,
  recentSampleIds,
  isLiveSyncActive = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Group samples by family_id
  const families = useMemo(() => {
    const map = new Map<string, {
      familyId: string;
      speaker: string;
      text: string;
      dialect: string;
      clips: Record<string, Sample>;
    }>();

    for (const s of samples) {
      let fId = s.family_id || (s as any).customMetadata?.family_id;
      if (!fId && typeof s.id === 'string') {
        const match = s.id.match(/^([a-zA-Z0-9]+_\d{3,4})_[a-zA-Z0-9_]+$/);
        if (match) fId = match[1];
      }
      if (!fId) continue;

      if (!map.has(fId)) {
        map.set(fId, {
          familyId: fId,
          speaker: s.speaker_name || (s as any).customMetadata?.speaker_name || s.voice_name || 'spk01',
          text: s.text || '',
          dialect: s.dialect || 'sorani',
          clips: {}
        });
      }

      const emo = String(s.emotion || 'neutral').toLowerCase().trim();
      map.get(fId)!.clips[emo] = s;
    }

    return Array.from(map.values()).sort((a, b) => a.familyId.localeCompare(b.familyId));
  }, [samples]);

  // Filtered families
  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      const presentCount = REQUIRED_EMOTIONS.filter(e => !!f.clips[e.id]).length;
      const isComplete = presentCount === REQUIRED_EMOTIONS.length;

      if (filterStatus === 'complete' && !isComplete) return false;
      if (filterStatus === 'incomplete' && isComplete) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const matchesId = f.familyId.toLowerCase().includes(term);
        const matchesSpeaker = f.speaker.toLowerCase().includes(term);
        const matchesText = f.text.toLowerCase().includes(term);
        if (!matchesId && !matchesSpeaker && !matchesText) return false;
      }
      return true;
    });
  }, [families, searchTerm, filterStatus]);

  const handlePlay = (s: Sample) => {
    const url = s.audioUrl || `/api/dataset/${s.id}/audio`;
    if (playingClipId === s.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingClipId(null);
      if (onPlayAudio) onPlayAudio('', '');
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setPlayingClipId(null);
      if (onPlayAudio) onPlayAudio('', '');
    };
    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      setPlayingClipId(null);
      if (onPlayAudio) onPlayAudio('', '');
    };
    audio.play().catch(e => {
      console.warn('Audio play failed:', e);
      setPlayingClipId(null);
    });
    setPlayingClipId(s.id);
    if (onPlayAudio) onPlayAudio(url, s.id);
  };

  const totalComplete = families.filter(f => REQUIRED_EMOTIONS.every(e => !!f.clips[e.id])).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Filter Toolbar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Search family ID, speaker, or Kurdish text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
            <button
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus('all')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              All ({families.length})
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'complete' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus('complete')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Complete ({totalComplete})
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'incomplete' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus('incomplete')}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Incomplete ({families.length - totalComplete})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLiveSyncActive && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '2px 8px'
              }}
              title="Real-time dataset listener active. New emotion takes will animate into their families automatically."
            >
              <span className="live-sync-indicator-dot" />
              <span style={{ fontWeight: 600 }}>Live Sync</span>
            </div>
          )}
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Showing <strong style={{ color: '#38bdf8' }}>{filteredFamilies.length}</strong> families
          </div>
        </div>
      </div>

      {/* Families List */}
      {filteredFamilies.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No paired emotion families found matching current criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredFamilies.map((f) => (
            <FamilyCard
              key={f.familyId}
              family={f}
              activeAudioId={activeAudioId}
              playingClipId={playingClipId}
              recentSampleIds={recentSampleIds}
              onPlay={handlePlay}
            />
          ))}
        </div>
      )}
    </div>
  );
};
