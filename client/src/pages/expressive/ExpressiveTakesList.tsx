import React from 'react';
import { ExpressiveTake } from './expressiveConstants';
import { ExpressiveAudioCard } from './ExpressiveAudioCard';

interface ExpressiveTakesListProps {
  takes: ExpressiveTake[];
  currentlyPlayingId: string | null;
  onTogglePlay: (take: ExpressiveTake) => void;
  onDeleteTake: (id: string) => void;
}

export const ExpressiveTakesList: React.FC<ExpressiveTakesListProps> = ({
  takes,
  currentlyPlayingId,
  onTogglePlay,
  onDeleteTake
}) => {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Generated Pilot Takes ({takes.length})
      </h3>
      {takes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          No takes generated yet. Select a condition and click generate.
        </div>
      ) : (
        takes.map(take => (
          <ExpressiveAudioCard
            key={take.id}
            take={take}
            isPlaying={currentlyPlayingId === take.id}
            onTogglePlay={onTogglePlay}
            onDelete={onDeleteTake}
          />
        ))
      )}
    </div>
  );
};

