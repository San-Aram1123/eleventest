import React, { useState, useMemo } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Filter,
  CheckCircle2,
  ListFilter,
  Loader2
} from 'lucide-react';
import { Sample } from '../types';
import { useBatchDelete } from '../hooks/useBatchDelete';
import { DeletionProgressBar } from './dataset/shared/DeletionProgressBar';
import { MassDeleteDateTab, DatePreset } from './dataset/mass_delete/MassDeleteDateTab';
import { MassDeleteMetadataTab, MetaCriteriaType } from './dataset/mass_delete/MassDeleteMetadataTab';
import { MassDeletePreviewList } from './dataset/mass_delete/MassDeletePreviewList';
import { MassDeleteConfirmSection } from './dataset/mass_delete/MassDeleteConfirmSection';
import { useMassDeleteFilter } from './dataset/mass_delete/useMassDeleteFilter';

interface MassDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  currentFilteredSamples: Sample[];
  availableVoices: { name: string; count: number }[];
  selectedSampleIds?: Set<string>;
  onBatchDeleted: (ids: string[]) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

type DeleteTab = 'date' | 'active_filter' | 'metadata' | 'selected';

export const MassDeleteModal: React.FC<MassDeleteModalProps> = ({
  isOpen,
  onClose,
  samples,
  currentFilteredSamples,
  availableVoices,
  selectedSampleIds = new Set(),
  onBatchDeleted,
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<DeleteTab>(() => selectedSampleIds.size > 0 ? 'selected' : 'date');
  const [datePreset, setDatePreset] = useState<DatePreset>('not_today');
  const [customDateType, setCustomDateType] = useState<'before' | 'after' | 'between'>('before');
  const [customDateStart, setCustomDateStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customDateEnd, setCustomDateEnd] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [metaCriteriaType, setMetaCriteriaType] = useState<MetaCriteriaType>('dialect');
  const [metaDialect, setMetaDialect] = useState<'sorani' | 'badini'>('sorani');
  const [metaVoice, setMetaVoice] = useState<string>(() => availableVoices[0]?.name || 'Puck');
  const [metaMethod, setMetaMethod] = useState<string>('gemini_api');
  const [metaRatingOption, setMetaRatingOption] = useState<'unrated' | 'low_quality'>('unrated');

  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  const { isDeleting, progress: deleteProgress, executeBatchDelete } = useBatchDelete(400);

  const { timeInfo, matchingSamples, stats } = useMassDeleteFilter({
    samples,
    currentFilteredSamples,
    selectedSampleIds,
    activeTab,
    datePreset,
    customDateType,
    customDateStart,
    customDateEnd,
    metaCriteriaType,
    metaDialect,
    metaVoice,
    metaMethod,
    metaRatingOption
  });

  const isConfirmed = useMemo(() => {
    if (stats.count === 0) return false;
    if (stats.count > 50) return confirmText.trim().toUpperCase() === 'DELETE';
    return confirmChecked;
  }, [stats.count, confirmText, confirmChecked]);

  const handleExecuteDelete = async () => {
    if (!isConfirmed || stats.count === 0 || isDeleting) return;
    const idsToDelete = matchingSamples.map((s) => s.id);
    try {
      const allDeletedIds = await executeBatchDelete(idsToDelete);
      onBatchDeleted(allDeletedIds);
      addToast({
        type: 'success',
        title: 'Mass Deletion Completed',
        message: `Permanently deleted ${allDeletedIds.length} sample(s) and associated audio files.`
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Mass Deletion Failed',
        message: err.message || 'Failed to complete bulk deletion.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '95%',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.25)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Mass Delete Dataset Samples
              </h2>
              <p className="modal-subtitle" style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Batch purge dataset records and physical audio files permanently
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close" disabled={isDeleting}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: selectedSampleIds.size > 0 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
              gap: '6px',
              background: 'var(--bg-box-subtle)',
              padding: '5px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('date')}
              className={`btn btn-sm ${activeTab === 'date' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', background: activeTab === 'date' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent', color: activeTab === 'date' ? '#ffffff' : 'var(--text-secondary)', border: 'none' }}
            >
              <Calendar size={14} />
              <span>Date Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active_filter')}
              className={`btn btn-sm ${activeTab === 'active_filter' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', background: activeTab === 'active_filter' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent', color: activeTab === 'active_filter' ? '#ffffff' : 'var(--text-secondary)', border: 'none' }}
            >
              <Filter size={14} />
              <span>Active View ({currentFilteredSamples.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`btn btn-sm ${activeTab === 'metadata' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', background: activeTab === 'metadata' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent', color: activeTab === 'metadata' ? '#ffffff' : 'var(--text-secondary)', border: 'none' }}
            >
              <ListFilter size={14} />
              <span>Metadata Rule</span>
            </button>
            {selectedSampleIds.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('selected')}
                className={`btn btn-sm ${activeTab === 'selected' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', background: activeTab === 'selected' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent', color: activeTab === 'selected' ? '#ffffff' : 'var(--text-secondary)', border: 'none' }}
              >
                <CheckCircle2 size={14} />
                <span>Selected ({selectedSampleIds.size})</span>
              </button>
            )}
          </div>

          {activeTab === 'date' && (
            <MassDeleteDateTab
              datePreset={datePreset}
              setDatePreset={setDatePreset}
              customDateType={customDateType}
              setCustomDateType={setCustomDateType}
              customDateStart={customDateStart}
              setCustomDateStart={setCustomDateStart}
              customDateEnd={customDateEnd}
              setCustomDateEnd={setCustomDateEnd}
              timeInfo={timeInfo}
            />
          )}

          {activeTab === 'active_filter' && (
            <div className="glass-card" style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Filter size={16} color="#f87171" />
                <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem' }}>Delete Current Filtered View</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                Purge all samples currently matching your active filters and search terms on the Dataset Manager page.
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Matching Visible Items: <strong>{currentFilteredSamples.length.toLocaleString()}</strong> of {samples.length.toLocaleString()} total samples.
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <MassDeleteMetadataTab
              metaCriteriaType={metaCriteriaType}
              setMetaCriteriaType={setMetaCriteriaType}
              metaDialect={metaDialect}
              setMetaDialect={setMetaDialect}
              metaVoice={metaVoice}
              setMetaVoice={setMetaVoice}
              availableVoices={availableVoices}
              metaMethod={metaMethod}
              setMetaMethod={setMetaMethod}
              metaRatingOption={metaRatingOption}
              setMetaRatingOption={setMetaRatingOption}
            />
          )}

          <MassDeletePreviewList matchingSamples={matchingSamples} stats={stats} />
          <MassDeleteConfirmSection count={stats.count} confirmText={confirmText} setConfirmText={setConfirmText} confirmChecked={confirmChecked} setConfirmChecked={setConfirmChecked} />
          <DeletionProgressBar progress={deleteProgress} />
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.4)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-md"
            onClick={handleExecuteDelete}
            disabled={!isConfirmed || stats.count === 0 || isDeleting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, boxShadow: isConfirmed && stats.count > 0 ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none', opacity: isConfirmed && stats.count > 0 ? 1 : 0.5 }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Purging Samples...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete {stats.count.toLocaleString()} Sample(s) Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
