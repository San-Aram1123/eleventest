import React, { useState, useMemo } from 'react';
import { Play, Pause, ChevronDown, ChevronUp, User, Code, Download } from 'lucide-react';
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
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border-medium)',
        borderTop: '1px solid var(--border-specular)',
        borderRadius: '16px',
        marginBottom: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.22)',
        transition: 'all 150ms ease'
      }}
    >
      {/* Family Header */}
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'var(--bg-box)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0A84FF 0%, #BF5AF2 100%)',
            color: '#fff',
            padding: '3px 9px',
            borderRadius: '9999px',
            letterSpacing: '-0.01em'
          }}>
            {family.familyId}
          </span>

          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(10, 132, 255, 0.12)',
            color: '#0A84FF',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: 700,
            border: '1px solid rgba(10, 132, 255, 0.25)',
            textTransform: 'uppercase'
          }}>
            {family.language}
          </span>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} /> {family.speaker.name} ({family.speaker.gender})
          </span>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            • {visibleTakes.length !== family.takes.length
                ? `Showing ${visibleTakes.length} of ${family.takes.length} Takes`
                : `${family.takes.length} Takes (${totalDuration.toFixed(1)}s total)`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={downloadFamilyJsonl}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}
            title="Download JSONL for this family"
          >
            <Download size={12} /> JSONL
          </button>

          <button
            onClick={() => setShowJson(!showJson)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 9px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}
            title="Inspect Family JSON"
          >
            <Code size={12} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 9px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)' }}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Sentence Transcript */}
      <div style={{
        padding: '0.85rem 1.25rem',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: isRtl ? 'Noto Naskh Arabic, Tahoma, sans-serif' : 'inherit',
        fontSize: '0.96rem',
        color: 'var(--text-primary)',
        lineHeight: 1.6,
        borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
      }}>
        {family.transcript}
      </div>

      {/* JSON Inspection */}
      {showJson && (
        <pre style={{
          background: 'var(--bg-box-subtle)',
          color: 'var(--text-main)',
          padding: '0.85rem 1.25rem',
          margin: 0,
          fontSize: '0.72rem',
          overflowX: 'auto',
          maxHeight: '180px',
          fontFamily: 'var(--font-mono)',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
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
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem', padding: '0.5rem 0' }}>
              No takes match the selected emotion filter in this family.
            </div>
          ) : (
            visibleTakes.map(take => {
              const isPlaying = currentlyPlayingId === take.id;

              return (
                <div
                  key={take.id}
                  style={{
                    background: 'var(--bg-box)',
                    border: isPlaying ? '1.5px solid #0A84FF' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isPlaying ? '0 0 12px rgba(10, 132, 255, 0.3)' : 'none',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', letterSpacing: '-0.01em' }} title={take.conditionId}>
                      {take.conditionId}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ textTransform: 'capitalize', color: '#BF5AF2', fontWeight: 600 }}>{take.emotion}</span>
                      <span style={{ background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                        Int: {take.intensityLabel?.toUpperCase()} ({take.emotionIntensity?.toFixed(2)})
                      </span>
                      {take.delivery && take.delivery !== 'normal' && (
                        <span style={{ background: 'rgba(191, 90, 242, 0.12)', color: '#BF5AF2', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                          {take.delivery}
                        </span>
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)' }}>({take.duration.toFixed(1)}s)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onTogglePlay(take)}
                    style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      borderRadius: '50%',
                      background: isPlaying ? 'linear-gradient(145deg, #FF453A, #D62B20)' : 'linear-gradient(145deg, #0A84FF, #0066CC)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isPlaying ? '0 2px 10px rgba(255, 69, 58, 0.4)' : '0 2px 10px rgba(10, 132, 255, 0.4)',
                      transition: 'transform 100ms ease'
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
