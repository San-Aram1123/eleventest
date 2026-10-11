import React from 'react';
import { Filter, X, Sparkles, Shuffle } from 'lucide-react';
import { EXPRESSIVE_FILTER_EMOTIONS } from '../../utils/expressiveEmotionUtils';

interface ExpressiveEmotionFilterBarProps {
  selectedEmotions: string[];
  onToggleEmotion: (id: string) => void;
  onClearEmotions: () => void;
  matchMode: 'any' | 'all';
  onChangeMatchMode: (mode: 'any' | 'all') => void;
  totalCount?: number;
  filteredCount?: number;
}

export const ExpressiveEmotionFilterBar: React.FC<ExpressiveEmotionFilterBarProps> = ({
  selectedEmotions,
  onToggleEmotion,
  onClearEmotions,
  matchMode,
  onChangeMatchMode,
  totalCount,
  filteredCount
}) => {
  const isAnyFilterActive = selectedEmotions.length > 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.65rem 0.9rem',
      background: 'rgba(15, 23, 42, 0.65)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      borderRadius: '8px',
      marginBottom: '0.85rem',
      flexWrap: 'wrap',
      gap: '0.6rem'
    }}>
      {/* Emotion Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '2px' }}>
          <Filter size={13} /> Filter Emotions:
        </span>

        {EXPRESSIVE_FILTER_EMOTIONS.map(em => {
          const isSelected = selectedEmotions.includes(em.id);

          return (
            <button
              key={em.id}
              onClick={() => onToggleEmotion(em.id)}
              style={{
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                padding: '3px 8px',
                borderRadius: '5px',
                border: isSelected ? `1px solid ${em.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected ? `${em.color}28` : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#FFFFFF' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: em.color,
                opacity: isSelected ? 1 : 0.6
              }} />
              {em.label}
            </button>
          );
        })}

        {isAnyFilterActive && (
          <button
            onClick={onClearEmotions}
            style={{
              fontSize: '0.72rem',
              padding: '3px 7px',
              borderRadius: '5px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#F87171',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Clear all emotion filters"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Match Mode & Filtered Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {selectedEmotions.length > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
            padding: '2px',
            fontSize: '0.72rem'
          }}>
            <button
              onClick={() => onChangeMatchMode('all')}
              style={{
                padding: '2px 7px',
                borderRadius: '4px',
                border: 'none',
                background: matchMode === 'all' ? '#8B5CF6' : 'transparent',
                color: matchMode === 'all' ? '#FFFFFF' : '#94A3B8',
                fontWeight: matchMode === 'all' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Match Mix / All: Takes or families combining both selected emotions"
            >
              <Sparkles size={11} /> Mix / All (AND)
            </button>
            <button
              onClick={() => onChangeMatchMode('any')}
              style={{
                padding: '2px 7px',
                borderRadius: '4px',
                border: 'none',
                background: matchMode === 'any' ? '#3B82F6' : 'transparent',
                color: matchMode === 'any' ? '#FFFFFF' : '#94A3B8',
                fontWeight: matchMode === 'any' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Match Any: Takes or families containing any selected emotion"
            >
              <Shuffle size={11} /> Any (OR)
            </button>
          </div>
        )}

        {typeof totalCount === 'number' && typeof filteredCount === 'number' && isAnyFilterActive && (
          <span style={{ fontSize: '0.75rem', color: '#C084FC', fontWeight: 600 }}>
            {filteredCount} of {totalCount} families
          </span>
        )}
      </div>
    </div>
  );
};

