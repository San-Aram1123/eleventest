import React from 'react';
import { ListOrdered, Search, Trash2 } from 'lucide-react';
import { GeminiBatchItem } from '../../../types';
import { GeminiBatchItemRow } from './GeminiBatchItemRow';

interface GeminiBatchItemsTableProps {
  batchItems: GeminiBatchItem[];
  filteredBatchItems: GeminiBatchItem[];
  totalLines: number;
  completedLines: number;
  failedLines: number;
  pendingLines: number;
  batchFilter: 'all' | 'completed' | 'failed' | 'pending';
  setBatchFilter: (filter: 'all' | 'completed' | 'failed' | 'pending') => void;
  currentProcessingId: number | null;
  isScanningDataset: boolean;
  batchState: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  onScanDatasetDuplicates: () => void;
  onRemovePendingLines: () => void;
  onRemoveCompletedLines: () => void;
  onRetrySingleLine: (item: GeminiBatchItem) => void;
  onDeleteBatchSample: (item: GeminiBatchItem) => void;
  onDeleteAndRegenerate: (item: GeminiBatchItem) => void;
  onRemoveSingleBatchItem: (id: number) => void;
}

export const GeminiBatchItemsTable: React.FC<GeminiBatchItemsTableProps> = ({
  batchItems,
  filteredBatchItems,
  totalLines,
  completedLines,
  failedLines,
  pendingLines,
  batchFilter,
  setBatchFilter,
  currentProcessingId,
  isScanningDataset,
  batchState,
  onScanDatasetDuplicates,
  onRemovePendingLines,
  onRemoveCompletedLines,
  onRetrySingleLine,
  onDeleteBatchSample,
  onDeleteAndRegenerate,
  onRemoveSingleBatchItem
}) => {
  if (batchItems.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <ListOrdered size={18} className="text-cyan" />
            <span className="card-title">Parsed Kurdish Lines ({batchItems.length})</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
              <span className="badge badge-pink" style={{ fontSize: '0.7rem', padding: '1px 7px' }} title="Total lines assigned female voices">
                ♀ {batchItems.filter(i => i.voiceGender === 'Female').length} Female
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '1px 7px' }} title="Total lines assigned male voices">
                ♂ {batchItems.filter(i => i.voiceGender === 'Male').length} Male
              </span>
            </div>
          </div>

          {/* Smart Duplicate Scan Button */}
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={onScanDatasetDuplicates}
            disabled={isScanningDataset || batchState === 'running'}
            title="Scan current pending lines against the database"
            style={{ 
              fontSize: '0.74rem', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px', 
              padding: '3px 10px',
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Search size={12} className={isScanningDataset ? 'spin' : ''} />
            <span>{isScanningDataset ? 'Checking Dataset...' : '🔍 Scan Dataset Duplicates'}</span>
          </button>
        </div>

        {/* Filter Pills & Bulk Cleanups */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" className={`btn btn-xs ${batchFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBatchFilter('all')}>All ({totalLines})</button>
          <button type="button" className={`btn btn-xs ${batchFilter === 'completed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBatchFilter('completed')}>Completed ({completedLines})</button>
          <button type="button" className={`btn btn-xs ${batchFilter === 'failed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBatchFilter('failed')}>Failed ({failedLines})</button>
          <button type="button" className={`btn btn-xs ${batchFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setBatchFilter('pending')}>Pending ({pendingLines})</button>

          {pendingLines > 0 && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={onRemovePendingLines} style={{ fontSize: '0.72rem', color: '#F87171', padding: '3px 8px' }}>
              <Trash2 size={11} /><span>Remove Pending ({pendingLines})</span>
            </button>
          )}

          {completedLines > 0 && (
            <button type="button" className="btn btn-ghost btn-xs" onClick={onRemoveCompletedLines} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 8px' }}>
              <span>Remove Completed ({completedLines})</span>
            </button>
          )}
        </div>
      </div>

      <div className="card-body" style={{ padding: '8px 16px 16px 16px' }}>
        <div className="batch-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredBatchItems.map((item) => (
            <GeminiBatchItemRow
              key={item.id}
              item={item}
              isCurrent={currentProcessingId === item.id}
              onRetrySingleLine={onRetrySingleLine}
              onDeleteBatchSample={onDeleteBatchSample}
              onDeleteAndRegenerate={onDeleteAndRegenerate}
              onRemoveSingleBatchItem={onRemoveSingleBatchItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
