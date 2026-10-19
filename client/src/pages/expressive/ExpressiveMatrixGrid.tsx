import React, { useState } from 'react';
import { Sparkles, Flame, HeartCrack, Smile, MinusCircle, Check, Zap } from 'lucide-react';
import { MATRIX_CONDITIONS, MatrixCondition } from './expressiveConstants';

interface ExpressiveMatrixGridProps {
  selectedConditionId: string;
  onSelectCondition: (condition: MatrixCondition) => void;
  onSelectBatchConditions?: (conditions: MatrixCondition[]) => void;
}

export const ExpressiveMatrixGrid: React.FC<ExpressiveMatrixGridProps> = ({
  selectedConditionId,
  onSelectCondition,
  onSelectBatchConditions
}) => {
  const [filterEmotion, setFilterEmotion] = useState<'all' | 'neutral' | 'happy' | 'sad' | 'angry'>('all');
  const [filterDelivery, setFilterDelivery] = useState<'all' | 'normal' | 'whisper' | 'laughing_speech'>('all');

  const filtered = MATRIX_CONDITIONS.filter(c => {
    if (filterEmotion !== 'all' && c.emotion !== filterEmotion) return false;
    if (filterDelivery !== 'all' && c.delivery !== filterDelivery) return false;
    return true;
  });

  const getEmotionBadge = (emotion: string) => {
    switch (emotion) {
      case 'neutral': return { icon: <MinusCircle size={14} />, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' };
      case 'happy': return { icon: <Smile size={14} />, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'sad': return { icon: <HeartCrack size={14} />, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'angry': return { icon: <Flame size={14} />, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default: return { icon: <Sparkles size={14} />, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
    }
  };

  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'high': return { text: 'HIGH (0.90)', color: '#F43F5E' };
      case 'medium': return { text: 'MED (0.60)', color: '#F59E0B' };
      case 'low': return { text: 'LOW (0.25)', color: '#10B981' };
      default: return { text: 'NONE (0.0)', color: '#64748B' };
    }
  };

  const selectDifficultMixes = () => {
    const diffIds = ['ang_whisp_high', 'ang_laugh_high', 'sad_whisp_high', 'hap_laugh_high', 'neu_whisp'];
    const diffConditions = MATRIX_CONDITIONS.filter(c => diffIds.includes(c.id));
    if (onSelectBatchConditions) onSelectBatchConditions(diffConditions);
  };

  const selectAll27 = () => {
    if (onSelectBatchConditions) onSelectBatchConditions(MATRIX_CONDITIONS);
  };

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--card-bg, #1e2230)', border: '1px solid var(--border-color, #2d3348)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#8B5CF6' }} />
            The 27 Expression & Delivery Matrix
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
            Strictly maps 4 emotions × 3 deliveries × 3 intensity tiers per Audar Pilot prompt.
          </p>
        </div>

        {/* Quick Batch Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={selectDifficultMixes}
            title="Batch queue the 5 most challenging pilot mixes: Angry Whisper, Bitter Laugh, Sad Whisper..."
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Zap size={14} style={{ color: '#F59E0B' }} />
            Select 5 Hardest Mixes
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={selectAll27}
            title="Select all 27 matrix combinations for full matrix generation"
            style={{ fontSize: '0.78rem' }}
          >
            Queue All 27 Matrix
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: '8px' }}>
          {(['all', 'neutral', 'happy', 'sad', 'angry'] as const).map(em => (
            <button
              key={em}
              onClick={() => setFilterEmotion(em)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: filterEmotion === em ? '#6366F1' : 'transparent',
                color: filterEmotion === em ? '#fff' : '#94A3B8',
                fontWeight: filterEmotion === em ? 600 : 400,
                textTransform: 'capitalize',
                fontSize: '0.78rem'
              }}
            >
              {em}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: '8px' }}>
          {(['all', 'normal', 'whisper', 'laughing_speech'] as const).map(del => (
            <button
              key={del}
              onClick={() => setFilterDelivery(del)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: filterDelivery === del ? '#3B82F6' : 'transparent',
                color: filterDelivery === del ? '#fff' : '#94A3B8',
                fontWeight: filterDelivery === del ? 600 : 400,
                fontSize: '0.78rem'
              }}
            >
              {del === 'all' ? 'All Deliveries' : del === 'laughing_speech' ? 'Laughing' : del.toUpperCase()}
            </button>
          ))}
        </div>

        <span style={{ color: '#64748B', fontSize: '0.78rem' }}>Showing {filtered.length} of 27</span>
      </div>

      {/* Matrix Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '0.65rem',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {filtered.map(condition => {
          const isSelected = selectedConditionId === condition.id;
          const emBadge = getEmotionBadge(condition.emotion);
          const intBadge = getIntensityBadge(condition.intensityLabel);

          return (
            <div
              key={condition.id}
              onClick={() => onSelectCondition(condition)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #8B5CF6' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-box)',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: emBadge.color,
                  background: emBadge.bg,
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {emBadge.icon}
                  {condition.emotion.toUpperCase()}
                </span>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: intBadge.color,
                  background: 'var(--bg-box-subtle)',
                  border: '1px solid var(--border-subtle)',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}>
                  {intBadge.text}
                </span>
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                {condition.deliveryLabel}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                {condition.description}
              </div>

              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: '#8B5CF6',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={12} color="#fff" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

