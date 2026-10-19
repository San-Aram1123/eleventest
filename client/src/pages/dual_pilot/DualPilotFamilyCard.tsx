import React, { useState } from 'react';
import { Play, Pause, Bot, Sparkles, Award } from 'lucide-react';
import { DualPilotFamily, DualPilotTake } from './dualPilotTypes';

interface DualPilotFamilyCardProps {
  family: DualPilotFamily;
  currentlyPlayingId: string | null;
  onTogglePlay: (take: DualPilotTake) => void;
  onRateFamily: (familyId: string, condId: string, rating: 'gemini_better' | 'elevenlabs_better' | 'equal' | 'both_flawed') => void;
}

export const DualPilotFamilyCard: React.FC<DualPilotFamilyCardProps> = ({
  family,
  currentlyPlayingId,
  onTogglePlay,
  onRateFamily
}) => {
  const showGemini = Boolean(family.geminiTranscript || Object.keys(family.geminiTakes).length);
  const showEleven = Boolean(family.elevenlabsTranscript || Object.keys(family.elevenlabsTakes).length);
  const isFemale = family.gender === 'Female';
  const genderColor = isFemale ? '#EC4899' : '#3B82F6';

  const conditionKeys = Array.from(new Set([
    ...Object.keys(family.geminiTakes),
    ...Object.keys(family.elevenlabsTakes)
  ]));

  const [activeCond, setActiveCond] = useState<string>(conditionKeys[0] || '');
  const selectedCond = activeCond || conditionKeys[0] || '';

  const gTake = family.geminiTakes[selectedCond];
  const eTake = family.elevenlabsTakes[selectedCond];

  const currentRating = family.userRatings?.[selectedCond];

  const isPlayingGemini = Boolean(gTake && currentlyPlayingId === gTake.id);
  const isPlayingEleven = Boolean(eTake && currentlyPlayingId === eTake.id);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-medium)',
      borderRadius: '10px',
      marginBottom: '1rem',
      overflow: 'hidden'
    }}>
      {/* Family Header */}
      <div style={{
        padding: '0.65rem 1rem',
        background: 'var(--bg-box)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            padding: '1px 6px',
            borderRadius: '4px',
            background: `${genderColor}22`,
            color: genderColor,
            fontWeight: 700,
            fontSize: '0.72rem',
            border: `1px solid ${genderColor}44`
          }}>
            Line {family.paragraphIndex + 1} • {family.gender}{family.language ? ` • ${family.language.toUpperCase()}` : ''}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            ({conditionKeys.length} Conditions Generated)
          </span>
        </div>

        {/* Evaluation Buttons */}
        {selectedCond && gTake && eTake && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {currentRating && (
              <span className="badge" style={{
                background: currentRating === 'gemini_better' ? '#7C3AED33' :
                            currentRating === 'elevenlabs_better' ? '#10B98133' : '#3B82F633',
                color: currentRating === 'gemini_better' ? '#C4B5FD' :
                       currentRating === 'elevenlabs_better' ? '#6EE7B7' : '#93C5FD',
                fontSize: '0.7rem'
              }}>
                <Award size={11} style={{ display: 'inline', marginRight: '3px' }} />
                {currentRating.replace('_', ' ').toUpperCase()}
              </span>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onRateFamily(family.familyId, selectedCond, 'gemini_better')}
              style={{
                fontSize: '0.72rem',
                padding: '2px 7px',
                background: currentRating === 'gemini_better' ? '#7C3AED44' : undefined,
                borderColor: currentRating === 'gemini_better' ? '#7C3AED' : undefined
              }}
            >
              Gemini Wins
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onRateFamily(family.familyId, selectedCond, 'elevenlabs_better')}
              style={{
                fontSize: '0.72rem',
                padding: '2px 7px',
                background: currentRating === 'elevenlabs_better' ? '#10B98144' : undefined,
                borderColor: currentRating === 'elevenlabs_better' ? '#10B981' : undefined
              }}
            >
              11Labs Wins
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onRateFamily(family.familyId, selectedCond, 'equal')}
              style={{
                fontSize: '0.72rem',
                padding: '2px 7px',
                background: currentRating === 'equal' ? '#3B82F644' : undefined,
                borderColor: currentRating === 'equal' ? '#3B82F6' : undefined
              }}
            >
              Equal
            </button>
          </div>
        )}
      </div>

      {/* Transcript Text */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {family.geminiTranscript && family.elevenlabsTranscript && family.geminiTranscript !== family.elevenlabsTranscript ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', direction: 'ltr' }}>
            <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(124, 58, 237, 0.08)', borderRadius: '6px', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
              <span style={{ fontSize: '0.72rem', color: '#A78BFA', fontWeight: 700, display: 'block', marginBottom: '4px', textAlign: 'left', direction: 'ltr' }}>Gemini Text:</span>
              <div style={{ direction: 'rtl', fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif', fontSize: '0.98rem', color: '#F8FAFC', lineHeight: 1.6, textAlign: 'right' }}>
                {family.geminiTranscript}
              </div>
            </div>
            <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, display: 'block', marginBottom: '4px', textAlign: 'left', direction: 'ltr' }}>11Labs Text:</span>
              <div style={{ direction: 'rtl', fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif', fontSize: '0.98rem', color: '#F8FAFC', lineHeight: 1.6, textAlign: 'right' }}>
                {family.elevenlabsTranscript}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ direction: 'rtl', fontFamily: 'Noto Naskh Arabic, Tahoma, sans-serif', fontSize: '0.98rem', color: '#F8FAFC', lineHeight: 1.6, textAlign: 'right' }}>
            {family.geminiTranscript || family.elevenlabsTranscript || family.transcript}
          </div>
        )}
      </div>

      {/* Condition Pills Selector */}
      {conditionKeys.length > 0 && (
        <div style={{ padding: '0.45rem 1rem', display: 'flex', gap: '6px', overflowX: 'auto', background: 'var(--bg-box)', borderBottom: '1px solid var(--border-subtle)' }}>
          {conditionKeys.map(cId => {
            const isSel = cId === selectedCond;
            return (
              <button
                key={cId}
                onClick={() => setActiveCond(cId)}
                style={{
                  background: isSel ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-box-subtle)',
                  border: isSel ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
                  color: isSel ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize'
                }}
              >
                {cId.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Takes Grid */}
      <div style={{
        padding: '0.75rem 1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Gemini Take Card */}
        {showGemini && <div style={{
          background: 'rgba(191, 90, 242, 0.08)',
          border: isPlayingGemini ? '1px solid #BF5AF2' : '1px solid rgba(191, 90, 242, 0.22)',
          borderTop: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '14px',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={15} style={{ color: '#BF5AF2' }} />
              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#F5F5F7' }}>
                Gemini 3.8: {gTake?.voiceName || 'Pending'}
              </span>
            </div>
            {gTake ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#0A84FF', fontWeight: 600 }}>{gTake.slicingEngine || 'best_engine'}</span>
                <span>• {gTake.duration.toFixed(1)}s</span>
                <span style={{ textTransform: 'capitalize', color: '#BF5AF2' }}>[{gTake.emotion}]</span>
                {gTake.rejected && (
                  <span style={{ color: 'var(--accent-red)', background: 'rgba(255, 69, 58, 0.15)', padding: '1px 6px', borderRadius: '9999px', fontWeight: 700 }} title={gTake.rejectionReason || 'Rejected by silence duration guardrail'}>
                    REJECTED ({gTake.duration < 6 ? '<6s' : '>=16s'})
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>Waiting for batch condition...</div>
            )}
          </div>

          {gTake && (
            <button
              onClick={() => onTogglePlay(gTake)}
              style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', background: isPlayingGemini ? '#FF453A' : '#BF5AF2', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'transform 0.15s ease' }}
              title={isPlayingGemini ? 'Pause Gemini' : 'Play Gemini'}
            >
              {isPlayingGemini ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
            </button>
          )}
        </div>}

        {/* ElevenLabs Take Card */}
        {showEleven && <div style={{ background: 'rgba(48, 209, 88, 0.08)', border: isPlayingEleven ? '1px solid #30D158' : '1px solid rgba(48, 209, 88, 0.22)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '14px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: '#30D158' }} />
              <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#F5F5F7' }}>
                ElevenLabs v4 Turbo: {eTake?.voiceName || 'Pending'}
              </span>
            </div>
            {eTake ? (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <span style={{ color: '#30D158', fontFamily: 'monospace' }}>Key: {eTake.keyUsedMasked}</span>
                <span>• {eTake.duration.toFixed(1)}s</span>
                <span style={{ textTransform: 'capitalize', color: '#30D158' }}>[{eTake.emotion}]</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>Waiting for generation...</div>
            )}
          </div>

          {eTake && (
            <button
              onClick={() => onTogglePlay(eTake)}
              style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '50%', background: isPlayingEleven ? '#FF453A' : '#30D158', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', transition: 'transform 0.15s ease' }}
              title={isPlayingEleven ? 'Pause ElevenLabs' : 'Play ElevenLabs'}
            >
              {isPlayingEleven ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
            </button>
          )}
        </div>}
      </div>
    </div>
  );
};
