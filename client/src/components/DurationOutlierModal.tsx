import React, { useState, useMemo, useEffect } from 'react';
import { X, Trash2, Clock, Loader2, CheckCircle2, Search } from 'lucide-react';
import { Sample } from '../types';
import { deleteDurationOutliers, batchDeleteSamples } from '../services/api';
import { DurationOutlierRow } from './DurationOutlierRow';

interface DurationOutlierModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  onDeleted: (deletedIds: string[]) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
  minSeconds?: number;
  maxSeconds?: number;
}

export function getSampleDuration(s: Sample): number {
  return Number(s.duration_seconds ?? s.durationSeconds ?? (s as any).customMetadata?.duration_seconds ?? 0);
}

export const DurationOutlierModal: React.FC<DurationOutlierModalProps> = ({
  isOpen, onClose, samples, onDeleted, addToast, minSeconds = 6.0, maxSeconds = 16.5
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'short' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const { underSamples, overSamples, allOutliers } = useMemo(() => {
    const under: Sample[] = [];
    const over: Sample[] = [];
    for (const s of samples) {
      const dur = getSampleDuration(s);
      if (dur <= minSeconds) under.push(s);
      else if (dur > maxSeconds) over.push(s);
    }
    return { underSamples: under, overSamples: over, allOutliers: [...under, ...over] };
  }, [samples, minSeconds, maxSeconds]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(allOutliers.map(s => s.id)));

  useEffect(() => {
    setSelectedIds(new Set(allOutliers.map(s => s.id)));
  }, [allOutliers.length]);

  const displayedOutliers = useMemo(() => {
    let list = activeTab === 'short' ? underSamples : activeTab === 'long' ? overSamples : allOutliers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => s.id.toLowerCase().includes(q) || (s.text || '').toLowerCase().includes(q));
    }
    return list;
  }, [allOutliers, underSamples, overSamples, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    const targetIds = Array.from(selectedIds);
    if (targetIds.length === 0 || isDeleting) return;
    setIsDeleting(true);
    setCurrentlyPlayingId(null);
    try {
      let deletedList: string[] = [];
      if (targetIds.length === allOutliers.length) {
        const res = await deleteDurationOutliers(minSeconds, maxSeconds);
        deletedList = res.deletedIds;
      } else {
        const res = await batchDeleteSamples(targetIds);
        deletedList = res.deletedIds;
      }
      onDeleted(deletedList);
      addToast({
        type: 'success',
        title: 'Duration Outliers Purged',
        message: `Successfully deleted ${deletedList.length} verified outlier clips.`
      });
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Deletion Failed', message: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1050 }}>
      <div className="modal-content" style={{ maxWidth: '720px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#0b1120', border: '1px solid rgba(245, 158, 11, 0.35)', boxShadow: '0 20px 40px rgba(0,0,0,0.7)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '7px', borderRadius: '8px', color: '#fbbf24' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Review & Clean Duration Outliers</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Listen to audio & inspect Kurdish text before permanently deleting (≤ {minSeconds}s or &gt; {maxSeconds}s)</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isDeleting} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Filter Bar & Tabs */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'rgba(15, 23, 42, 0.5)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" onClick={() => setActiveTab('all')} className={`btn btn-xs ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>All Outliers ({allOutliers.length})</button>
            <button type="button" onClick={() => setActiveTab('short')} className={`btn btn-xs ${activeTab === 'short' ? 'btn-danger' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>Too Short ≤ {minSeconds}s ({underSamples.length})</button>
            <button type="button" onClick={() => setActiveTab('long')} className={`btn btn-xs ${activeTab === 'long' ? 'btn-warning' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>Too Long &gt; {maxSeconds}s ({overSamples.length})</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button type="button" onClick={() => setSelectedIds(new Set(displayedOutliers.map(s => s.id)))} style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.74rem', cursor: 'pointer' }}>Select All</button>
            <span style={{ color: '#475569' }}>|</span>
            <button type="button" onClick={() => setSelectedIds(new Set())} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.74rem', cursor: 'pointer' }}>Deselect All</button>
          </div>
        </div>

        {/* Body with Review List */}
        <div style={{ padding: '14px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input type="text" placeholder="Search by ID or Kurdish text..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '7px 10px 7px 32px', fontSize: '0.78rem', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', color: '#f8fafc' }} />
          </div>

          {displayedOutliers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedOutliers.map(sample => (
                <DurationOutlierRow
                  key={sample.id}
                  sample={sample}
                  duration={getSampleDuration(sample)}
                  minSeconds={minSeconds}
                  maxSeconds={maxSeconds}
                  isSelected={selectedIds.has(sample.id)}
                  onToggleSelect={handleToggleSelect}
                  currentlyPlayingId={currentlyPlayingId}
                  onPlayToggle={(id) => setCurrentlyPlayingId(prev => prev === id ? null : id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 10px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle2 size={32} style={{ color: '#22c55e', margin: '0 auto 8px auto' }} />
              <p style={{ margin: 0, fontWeight: 700, color: '#86efac', fontSize: '0.95rem' }}>{allOutliers.length === 0 ? 'No Duration Outliers Found!' : 'No items match filter'}</p>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.76rem' }}>All remaining clips conform to the safe training duration window [{minSeconds}s - {maxSeconds}s].</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #1e293b', background: '#090d16' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} disabled={isDeleting || selectedIds.size === 0} />
            <span>Confirm deletion of {selectedIds.size} selected clip(s)</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isDeleting}>Cancel</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={selectedIds.size === 0 || !confirmChecked || isDeleting} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              {isDeleting ? (<><Loader2 size={14} className="animate-spin" /><span>Deleting...</span></>) : (<><Trash2 size={14} /><span>Delete {selectedIds.size} Selected</span></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
