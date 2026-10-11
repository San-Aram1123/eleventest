import React, { useState, useMemo } from 'react';
import { Play, Pause, ChevronDown, ChevronUp, User, Globe2, Layers, Code, Download } from 'lucide-react';
import { ExpressiveFamily } from './expressiveFamilyTypes';
import { ExpressiveTake, buildAudarRecord } from './expressiveConstants';
import { parseUniversalEmotions, matchesEmotionFilter } from '../../utils/expressiveEmotionUtils';

interface ExpressiveFamilyCardProps {
  family: ExpressiveFamily;
  currentlyPlayingId: string | null;
  onTogglePlay: (take: ExpressiveTake) => void;
  onDeleteFamily?: (familyId: string) => void;
  filterEmotions?: string[];
  matchMode?: 'any' | 'all';
}

export const ExpressiveFamilyCard: React.FC<ExpressiveFamilyCardProps> = ({
  family,
  currentlyPlayingId,
  onTogglePlay,
  onDeleteFamily,
  filterEmotions = [],
  matchMode = 'any'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showJson, setShowJson] = useState(false);

  const isRtl = family.language !== 'en';
  const totalDuration = family.takes.reduce((sum, t) => sum + (t.duration || 0), 0);

  const visibleTakes = useMemo(() => {
    if (!filterEmotions || filterEmotions.length === 0) return family.takes;
    return family.takes.filter(take => {
      const extracted = parseUniversalEmotions(take);
      return matchesEmotionFilter(extracted, filterEmotions, matchMode);
    });
  }, [family.takes, filterEmotions, matchMode]);

  const downloadFamilyJsonl = () => {
    const lines = family.takes.map(t => JSON.stringify(buildAudarRecord(t))).join('\n');
    const blob = new Blob([lines], { type: 'application/x-jsonlines;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${family.familyId}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: 'rgba(30, 34, 48, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '10px',
      marginBottom: '1rem',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}>
      {/* Family Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(0, 0, 0, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            {family.familyId}
          </span>

          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38BDF8',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            {family.language}
          </span>

          <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} /> {family.speaker.name} ({family.speaker.gender})
          </span>

          <span style={{ fontSize: '0.75rem', color: visibleTakes.length !== family.takes.length ? '#C084FC' : '#64748B' }}>
            • {visibleTakes.length !== family.takes.length
                ? `Showing ${visibleTakes.length} of ${family.takes.length} Takes`
                : `${family.takes.length} Takes (${totalDuration.toFixed(1)}s total)`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={downloadFamilyJsonl}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
            title="Download JSONL for this family"
          >
            <Download size={12} /> JSONL
          </button>

          <button
            onClick={() => setShowJson(!showJson)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
            title="Inspect Family JSON"
          >
            <Code size={12} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Sentence Transcript */}
      <div style={{
        padding: '0.75rem 1.25rem',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: isRtl ? 'Noto Naskh Arabic, Tahoma, sans-serif' : 'inherit',
        fontSize: '0.98rem',
        color: '#F8FAFC',
        lineHeight: 1.6,
        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
      }}>
        {family.transcript}
      </div>

      {/* JSON Inspection */}
      {showJson && (
        <pre style={{
          background: '#0B0F19',
          color: '#38BDF8',
          padding: '0.75rem 1.25rem',
          margin: 0,
          fontSize: '0.72rem',
          overflowX: 'auto',
          maxHeight: '180px'
        }}>
          {JSON.stringify(family.takes.map(buildAudarRecord), null, 2)}
        </pre>
      )}

      {/* Takes Grid inside Family */}
      {isExpanded && (
        <div style={{
          padding: '0.85rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.65rem'
        }}>
          {visibleTakes.length === 0 ? (
            <div style={{ color: '#64748B', fontSize: '0.78rem', padding: '0.5rem 0' }}>
              No takes match the selected emotion filter in this family.
            </div>
          ) : (
            visibleTakes.map(take => {
              const isPlaying = currentlyPlayingId === take.id;

              return (
                <div
                  key={take.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: isPlaying ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#F1F5F9', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={take.conditionId}>
                      {take.conditionId}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ textTransform: 'capitalize', color: '#C084FC', fontWeight: 600 }}>{take.emotion}</span>
                      <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FDE68A', padding: '0 4px', borderRadius: '3px', fontSize: '0.68rem' }}>
                        Int: {take.intensityLabel?.toUpperCase()} ({take.emotionIntensity?.toFixed(2)})
                      </span>
                      {take.delivery && take.delivery !== 'normal' && (
                        <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#D8B4FE', padding: '0 4px', borderRadius: '3px', fontSize: '0.68rem' }}>
                          {take.delivery}
                        </span>
                      )}
                      <span>({take.duration.toFixed(1)}s)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTogglePlay(take)}
                    style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      borderRadius: '50%',
                      background: isPlaying ? '#EF4444' : '#6366F1',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title={isPlaying ? 'Pause Take' : 'Play Take'}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
