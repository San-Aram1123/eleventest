import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { Sample } from '../types';
import { deleteSample, batchDeleteSamples } from '../services/api';
import { DuplicateGroupCard, DuplicateGroup } from './dataset/duplicates/DuplicateGroupCard';
import { DuplicateToolbar } from './dataset/duplicates/DuplicateToolbar';
import { useDuplicateGroups } from './dataset/duplicates/useDuplicateGroups';

interface DuplicateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  onSampleDeleted: (id: string) => void;
  onBatchDeleted?: (ids: string[]) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const DuplicateManagerModal: React.FC<DuplicateManagerModalProps> = ({
  isOpen,
  onClose,
  samples,
  onSampleDeleted,
  onBatchDeleted,
  addToast
}) => {
  const [matchMode, setMatchMode] = useState<'exact' | 'normalized'>('exact');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isBatchOperating, setIsBatchOperating] = useState(false);
  const [copiedTextKey, setCopiedTextKey] = useState<string | null>(null);

  const { duplicateGroups, totalDuplicateSamples, redundantCount } = useDuplicateGroups(
    samples,
    matchMode,
    searchQuery
  );

  if (!isOpen) return null;

  const handleDeleteSingle = async (sampleId: string) => {
    if (isDeletingId) return;
    if (!window.confirm(`Delete sample #${sampleId} and its audio file from dataset & MySQL?`)) return;

    setIsDeletingId(sampleId);
    try {
      await deleteSample(sampleId);
      onSampleDeleted(sampleId);
      addToast({
        type: 'success',
        title: 'Sample Deleted',
        message: `Sample #${sampleId} was safely deleted from dataset & MySQL.`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message || 'Failed to delete sample.' });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleKeepOnlyOne = async (keepSampleId: string, group: DuplicateGroup) => {
    const idsToDelete = group.samples.filter((s) => s.id !== keepSampleId).map((s) => s.id);
    if (idsToDelete.length === 0) return;

    if (!window.confirm(`Keep #${keepSampleId} and permanently delete the other ${idsToDelete.length} take(s)?`)) return;

    setIsBatchOperating(true);
    try {
      await batchDeleteSamples(idsToDelete);
      for (const id of idsToDelete) onSampleDeleted(id);
      if (onBatchDeleted) onBatchDeleted(idsToDelete);

      addToast({
        type: 'success',
        title: 'Duplicates Cleaned',
        message: `Kept #${keepSampleId}. Deleted ${idsToDelete.length} redundant take(s).`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Batch Delete Error', message: err.message || 'Failed to clean duplicates.' });
    } finally {
      setIsBatchOperating(false);
    }
  };

  const handleAutoCleanAll = async (keepPolicy: 'newest' | 'oldest') => {
    if (duplicateGroups.length === 0) return;

    const idsToDelete: string[] = [];
    for (const group of duplicateGroups) {
      const keepIndex = keepPolicy === 'newest' ? 0 : group.samples.length - 1;
      for (let i = 0; i < group.samples.length; i++) {
        if (i !== keepIndex) idsToDelete.push(group.samples[i].id);
      }
    }

    if (idsToDelete.length === 0) return;
    const policyName = keepPolicy === 'newest' ? 'NEWEST take' : 'OLDEST take';

    if (!window.confirm(`Are you sure you want to Auto-Clean ALL duplicate groups?\n\nThis will keep the ${policyName} of each sentence and delete ${idsToDelete.length} redundant audio samples from disk and MySQL.`)) return;

    setIsBatchOperating(true);
    try {
      await batchDeleteSamples(idsToDelete);
      for (const id of idsToDelete) onSampleDeleted(id);
      if (onBatchDeleted) onBatchDeleted(idsToDelete);

      addToast({
        type: 'success',
        title: 'Auto-Clean Completed!',
        message: `Successfully pruned ${idsToDelete.length} redundant duplicate samples. Kept the ${policyName}s.`
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Auto-Clean Failed', message: err.message || 'Failed to execute auto-clean.' });
    } finally {
      setIsBatchOperating(false);
    }
  };

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedTextKey(key);
    setTimeout(() => setCopiedTextKey(null), 2000);
  };

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.25)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px'
        }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}
            >
              <Copy size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
                Dataset Duplicate Finder & Cleaner
              </h2>
              <p className="modal-subtitle" style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                Compare multiple audio takes for the same Kurdish sentence, listen side-by-side, and prune redundant samples.
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <DuplicateToolbar
          matchMode={matchMode}
          onMatchModeChange={setMatchMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          groupsCount={duplicateGroups.length}
          totalDuplicateSamples={totalDuplicateSamples}
          redundantCount={redundantCount}
          isBatchOperating={isBatchOperating}
          onAutoCleanAll={handleAutoCleanAll}
        />

        <div className="modal-body" style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {duplicateGroups.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', border: '2px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '1rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                No Duplicates Found!
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.5 }}>
                {searchQuery ? 'No duplicate sentences matched your search query.' : 'Every Kurdish transcript in your dataset is unique. There are no duplicate audio records.'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            duplicateGroups.map((group) => (
              <DuplicateGroupCard
                key={group.normalizedKey}
                group={group}
                copiedTextKey={copiedTextKey}
                onCopyText={copyText}
                onKeepOnlyOne={handleKeepOnlyOne}
                onDeleteSingle={handleDeleteSingle}
                isDeletingId={isDeletingId}
                isBatchOperating={isBatchOperating}
              />
            ))
          )}
        </div>

        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Deleting a sample permanently removes its `.json` and `.wav` files and synchronizes with MySQL.
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
