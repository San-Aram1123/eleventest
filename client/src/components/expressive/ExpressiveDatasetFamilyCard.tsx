import React, { useState, useMemo } from 'react';
import { Play, Pause, User, Clock, Layers, Code, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Sample } from '../../types';
import { formatFriendlyTime } from '../paired/FamilyCard';
import { MATRIX_CONDITIONS } from '../../pages/expressive/expressiveConstants';
import { MIXED_54_CONDITIONS, MIXED_18_CONDITIONS } from '../../pages/expressive/expressiveMixedConstants';
import { parseUniversalEmotions, matchesEmotionFilter } from '../../utils/expressiveEmotionUtils';

export interface ExpressiveDatasetFamilyGroup {
  familyId: string;
  speaker: string;
  text: string;
  dialect: string;
  language?: string;
  gender?: 'male' | 'female' | string;
  takes: Sample[];
  latestTimestamp?: number;
  latestCreatedAt?: string | null;
}

interface ExpressiveDatasetFamilyCardProps {
  family: ExpressiveDatasetFamilyGroup;
  playingClipId?: string | null;
  recentSampleIds?: Set<string>;
  timeZone?: string;
  onPlay: (sample: Sample) => void;
  filterEmotions?: string[];
  matchMode?: 'any' | 'all';
}

function resolveTakeDetails(sample: Sample) {
  const condId = String(
    (sample as any).customMetadata?.condition_id ||
    (sample as any).customMetadata?.expressive_condition ||
    (sample as any).condition_id ||
    ''
  );

  const matrix = MATRIX_CONDITIONS.find(c => c.id === condId || sample.id.endsWith(c.id));
  if (matrix) {
    return {
      title: matrix.label,
      conditionId: matrix.id,
      emotion: matrix.emotion,
      delivery: matrix.deliveryLabel,
      intensityVal: matrix.intensityValue,
      intensityLabel: matrix.intensityLabel.toUpperCase(),
      components: null,
      color: matrix.emotion === 'angry' ? '#EF4444' : matrix.emotion === 'sad' ? '#3B82F6' : matrix.emotion === 'happy' ? '#F59E0B' : '#8B5CF6'
    };
  }

  const mixed = MIXED_54_CONDITIONS.find(c => c.id === condId || sample.id.endsWith(c.id))
    || MIXED_18_CONDITIONS.find(c => c.id === condId || sample.id.endsWith(c.id));
  if (mixed) {
    return {
      title: mixed.label,
      conditionId: mixed.id,
      emotion: mixed.primaryEmotion,
      delivery: 'Normal Speech',
      intensityVal: mixed.primaryIntensity,
      intensityLabel: mixed.primaryIntensity >= 0.8 ? 'HIGH' : mixed.primaryIntensity >= 0.5 ? 'MED' : 'LOW',
      components: mixed.intensityDescription,
      color: '#EC4899'
    };
  }

  const emo = String(sample.emotion || 'neutral').toLowerCase();
  const rawInt = Number(sample.emotion_intensity ?? (sample as any).customMetadata?.emotion_intensity ?? 0.8);
  const intLbl = rawInt >= 0.8 ? 'HIGH' : rawInt >= 0.5 ? 'MED' : 'LOW';

  return {
    title: condId ? `${condId}` : `${emo.toUpperCase()} (${intLbl})`,
    conditionId: condId || emo,
    emotion: emo,
    delivery: (sample as any).customMetadata?.delivery || 'normal',
    intensityVal: rawInt,
    intensityLabel: intLbl,
    components: (sample as any).customMetadata?.components || null,
    color: emo === 'angry' ? '#EF4444' : emo === 'sad' ? '#3B82F6' : emo === 'happy' ? '#F59E0B' : emo === 'fear' ? '#8B5CF6' : '#10B981'
  };
}

export const ExpressiveDatasetFamilyCard: React.FC<ExpressiveDatasetFamilyCardProps> = ({
  family: f,
  playingClipId,
  recentSampleIds,
  timeZone,
  onPlay,
  filterEmotions = [],
  matchMode = 'any'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showJson, setShowJson] = useState(false);

  const friendlyTime = formatFriendlyTime(f.latestCreatedAt, timeZone);
  const isRtl = f.language !== 'en';
  const hasRecentlyAddedClip = f.takes.some(t => recentSampleIds?.has(t.id));

  const visibleTakes = useMemo(() => {
    if (!filterEmotions || filterEmotions.length === 0) return f.takes;
    return f.takes.filter(s => {
      const extracted = parseUniversalEmotions(s);
      return matchesEmotionFilter(extracted, filterEmotions, matchMode);
    });
  }, [f.takes, filterEmotions, matchMode]);

  return (
    <div
      className={`glass-card family-card ${hasRecentlyAddedClip ? 'family-card-active-glow' : ''}`}
      style={{
        padding: '1.1rem 1.25rem',
        marginBottom: '1.25rem',
        borderLeft: '4px solid #8B5CF6',
        position: 'relative'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#C084FC' }}>{f.familyId}</code>
          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <User size={12} /> {f.speaker}
          </span>
          {f.gender && (
            <span className="badge" style={{
              background: f.gender === 'female' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: f.gender === 'female' ? '#f472b6' : '#60a5fa',
              fontSize: '0.75rem', fontWeight: 600
            }}>
              {f.gender === 'female' ? '♀ Female' : '♂ Male'}
            </span>
          )}
          <span className="badge" style={{ background: 'var(--bg-box-subtle)', color: 'var(--text-secondary)' }}>
            {f.language === 'en' ? 'English (en)' : f.language === 'ar' ? 'Arabic (ar)' : f.language === 'kmr' ? 'Badini (kmr)' : 'Sorani (ckb)'}
          </span>
          {hasRecentlyAddedClip && (
            <span className="badge badge-recently-active">
              <Sparkles size={11} /> Live Update
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {friendlyTime && (
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <Clock size={11} />
              <span>{friendlyTime}</span>
            </span>
          )}
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={12} /> {visibleTakes.length !== f.takes.length ? `${visibleTakes.length} / ${f.takes.length} Takes` : `${f.takes.length} Takes`}
          </span>
          <button onClick={() => setShowJson(!showJson)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '2px 7px' }}>
            <Code size={12} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '2px 7px' }}>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Transcript */}
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)', fontFamily: isRtl ? "'Noto Naskh Arabic', 'Rabar', sans-serif" : 'inherit', marginBottom: '0.85rem', lineHeight: 1.6 }}>
        {f.text}
      </div>

      {/* JSON Inspector */}
      {showJson && (
        <pre style={{ background: 'var(--bg-box-subtle)', color: '#38BDF8', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '6px', margin: '0 0 0.85rem 0', fontSize: '0.72rem', overflowX: 'auto', maxHeight: '160px' }}>
          {JSON.stringify(f.takes, null, 2)}
        </pre>
      )}

      {/* Detailed Takes Grid */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
          {visibleTakes.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', padding: '0.5rem 0' }}>
              No takes match the active emotion filter in this family.
            </div>
          ) : (
            visibleTakes.map(sample => {
              const isPlaying = playingClipId === sample.id;
              const info = resolveTakeDetails(sample);
              const duration = sample.duration_seconds || (sample as any).customMetadata?.duration_seconds || 0;

              return (
                <div
                  key={sample.id}
                  style={{
                    background: 'var(--bg-box)',
                    border: isPlaying ? `2px solid ${info.color}` : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isPlaying ? `0 0 12px ${info.color}40` : 'none'
                  }}
                >
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={info.title}>
                      {info.title}
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.68rem', background: `${info.color}20`, color: info.color, padding: '1px 5px', borderRadius: '4px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {info.emotion}
                      </span>
                      <span style={{ fontSize: '0.68rem', background: info.intensityLabel === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: info.intensityLabel === 'HIGH' ? '#FCA5A5' : '#FDE68A', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        Int: {info.intensityLabel} ({info.intensityVal.toFixed(2)})
                      </span>
                      {info.delivery && info.delivery !== 'normal' && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.15)', color: '#D8B4FE', padding: '1px 5px', borderRadius: '4px' }}>
                          {info.delivery}
                        </span>
                      )}
                      {duration > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {Number(duration).toFixed(1)}s
                        </span>
                      )}
                    </div>

                    {info.components && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '3px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={info.components}>
                        {info.components}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlay(sample)}
                    style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      borderRadius: '50%',
                      background: isPlaying ? '#EF4444' : info.color,
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                    title={isPlaying ? 'Pause' : 'Play Take'}
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
