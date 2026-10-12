import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { PendingSample } from '../../types';

export interface PendingQueueListProps {
  pendingList: PendingSample[];
  activePendingId: string | null;
  onSelectPending: (pendingId: string) => void;
  onDeletePending: (pendingId: string) => void;
}

export const PendingQueueList: React.FC<PendingQueueListProps> = ({
  pendingList,
  activePendingId,
  onSelectPending,
  onDeletePending
}) => {
  if (pendingList.length === 0) return null;

  return (
    <div className="glass-card pending-queue-card">
      <div className="card-section-title">
        <Clock size={16} className="text-cyan" />
        <span>Pending Prepared Samples ({pendingList.length})</span>
      </div>
      <div className="pending-items-list">
        {pendingList.map((item) => (
          <div
            key={item.pendingId}
            className={`pending-item ${activePendingId === item.pendingId ? 'active-item' : ''}`}
            onClick={() => onSelectPending(item.pendingId)}
          >
            <div className="pending-item-content">
              <div className="kurdish-text pending-item-text" dir="rtl">
                {item.text}
              </div>
              <div className="pending-item-meta">
                <span className={`badge emotion-badge-${item.emotion}`}>{item.emotion}</span>
                <span className="pending-time">{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-ghost btn-icon btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePending(item.pendingId);
              }}
              title="Remove from queue"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
