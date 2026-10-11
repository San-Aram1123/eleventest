import React, { useState } from 'react';
import { Layers, Sparkles, Check, Zap, HeartHandshake, Flame, Trophy, AlertTriangle, ShieldAlert, Compass } from 'lucide-react';
import { 
  MIXED_18_CONDITIONS, 
  MIXED_54_CONDITIONS, 
  MIXED_9_CONDITIONS,
  CORE_EMOTION_PAIRS, 
  MixedCondition 
} from './expressiveMixedConstants';

interface ExpressiveMixedGridProps {
  selectedConditionId: string;
  onSelectCondition: (condition: MixedCondition) => void;
  onSelectBatchConditions?: (conditions: MixedCondition[]) => void;
}

export const ExpressiveMixedGrid: React.FC<ExpressiveMixedGridProps> = ({
  selectedConditionId,
  onSelectCondition,
  onSelectBatchConditions
}) => {
  const [viewMode, setViewMode] = useState<'balance18' | 'grid54' | 'pilot9'>('balance18');
  const [selectedPairFilter, setSelectedPairFilter] = useState<string>('all');

  const pairIcons: Record<string, { icon: React.ReactNode; color: string }> = {
    happy_sad: { icon: <HeartHandshake size={15} color="#EC4899" />, color: '#EC4899' },
    angry_sad: { icon: <Flame size={15} color="#F97316" />, color: '#F97316' },
    happy_angry: { icon: <Trophy size={15} color="#EAB308" />, color: '#EAB308' },
    fear_sad: { icon: <AlertTriangle size={15} color="#A855F7" />, color: '#A855F7' },
    fear_angry: { icon: <ShieldAlert size={15} color="#EF4444" />, color: '#EF4444' },
    happy_fear: { icon: <Compass size={15} color="#06B6D4" />, color: '#06B6D4' }
  };

  const activeDataset = viewMode === 'grid54'
    ? MIXED_54_CONDITIONS
    : viewMode === 'pilot9'
    ? MIXED_9_CONDITIONS
    : MIXED_18_CONDITIONS;

  const filteredPairs = selectedPairFilter === 'all'
    ? CORE_EMOTION_PAIRS
    : CORE_EMOTION_PAIRS.filter(p => p.key === selectedPairFilter);

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--card-bg, #1e2230)', border: '1px solid var(--border-color, #2d3348)', borderRadius: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#EC4899' }} />
            All True Mixed Emotion Possibilities ({activeDataset.length} Conditions)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
            6 Core Emotion Pairs with independent intensity blends (Low, Medium, High).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${viewMode === 'balance18' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('balance18')}
            style={{ fontSize: '0.76rem' }}
          >
            18 Dominance Tiers
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'grid54' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid54')}
            style={{ fontSize: '0.76rem' }}
          >
            Full 54 Dual-Grid (All Combos)
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'pilot9' ? 'btn-secondary' : 'btn-secondary'}`}
            onClick={() => setViewMode('pilot9')}
            style={{ fontSize: '0.76rem' }}
          >
            Pilot 9 Curated
          </button>
          {onSelectBatchConditions && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectBatchConditions(activeDataset)}
              style={{ fontSize: '0.76rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Zap size={13} /> Queue {activeDataset.length}
            </button>
          )}
        </div>
      </div>

      {/* Pair Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setSelectedPairFilter('all')}
          className={`btn btn-sm ${selectedPairFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.74rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
        >
          All 6 Pairs
        </button>
        {CORE_EMOTION_PAIRS.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPairFilter(p.key)}
            className={`btn btn-sm ${selectedPairFilter === p.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.74rem', padding: '2px 8px', whiteSpace: 'nowrap' }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Pair Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredPairs.map(pair => {
          const conditionsForPair = activeDataset.filter(c => c.pairKey === pair.key);
          if (conditionsForPair.length === 0) return null;
          const info = pairIcons[pair.key] || { icon: <Layers size={14} />, color: '#EC4899' };

          return (
            <div key={pair.key} style={{
              background: 'rgba(0,0,0,0.25)',
              padding: '0.85rem',
              borderRadius: '8px',
              border: `1px solid rgba(255,255,255,0.06)`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                {info.icon}
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>{pair.name}</span>
                <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>— {pair.context}</span>
              </div>

              {/* Conditions Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.6rem'
              }}>
                {conditionsForPair.map(cond => {
                  const isSelected = selectedConditionId === cond.id;

                  return (
                    <div
                      key={cond.id}
                      onClick={() => onSelectCondition(cond)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${info.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F8FAFC' }}>
                          {cond.label}
                        </span>
                        {isSelected && <Check size={13} style={{ color: info.color }} />}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        {cond.intensityDescription}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
