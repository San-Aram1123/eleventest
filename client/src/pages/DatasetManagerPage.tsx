import { DatasetReviewSection } from '../components/dataset/page/DatasetReviewSection';
import { getSampleReview } from '../services/sampleReview';
import React, { useState, useRef, useMemo } from 'react';
import { Database } from 'lucide-react';
import { PairedFamiliesView } from '../components/paired/PairedFamiliesView';
import { ExpressiveDatasetFamiliesView } from '../components/expressive/ExpressiveDatasetFamiliesView';
import { DatasetHeader } from '../components/dataset/page/DatasetHeader';
import { DatasetFilterBar } from '../components/dataset/page/DatasetFilterBar';
import { DatasetStatsBar } from '../components/dataset/page/DatasetStatsBar';
import { DatasetBatchBanner } from '../components/dataset/page/DatasetBatchBanner';
import { DatasetCardGrid } from '../components/dataset/page/DatasetCardGrid';
import { DatasetTableView } from '../components/dataset/page/DatasetTableView';
import { DatasetPaginationBar } from '../components/dataset/page/DatasetPaginationBar';
import { DatasetModals } from '../components/dataset/page/DatasetModals';
import { useDatasetFilters } from '../hooks/useDatasetFilters';
import { useSelectionState } from '../hooks/useSelectionState';
import { useDatasetLiveSync } from '../hooks/useDatasetLiveSync';
import { Sample, SampleRatings } from '../types';
import { deleteSample, updateSample } from '../services/api';
import '../styles/datasetManager.css';

interface DatasetManagerProps {
  samples: Sample[];
  onSampleUpdated: (sample: Sample) => void;
  onSampleDeleted: (id: string) => void;
  onBatchDeleted?: (ids: string[]) => void;
  onSamplesRefreshed?: (samples: Sample[]) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const DatasetManagerPage: React.FC<DatasetManagerProps> = ({
  samples,
  onSampleUpdated,
  onSampleDeleted,
  onBatchDeleted,
  onSamplesRefreshed,
  addToast
}) => {
  const pageTopRef = useRef<HTMLDivElement | null>(null);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);
  const [showAudarModal, setShowAudarModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMassDeleteModal, setShowMassDeleteModal] = useState(false);
  const [showDurationOutlierModal, setShowDurationOutlierModal] = useState(false);
  const [showPairedValidateModal, setShowPairedValidateModal] = useState(false);
  const [showPairedExportModal, setShowPairedExportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'families' | 'expressive_families'>('cards');

  const {
    selectedIds,
    toggle: toggleSelectSample,
    selectAll,
    toggleAll,
    clear: clearSelection,
    removeBatch: removeBatchFromSelection,
    count: selectedCount
  } = useSelectionState();

  const { recentlyAddedIds } = useDatasetLiveSync(samples, onSamplesRefreshed);

  const [pendingOnly, setPendingOnly] = useState(false);
  const pendingSamples = useMemo(() => samples.filter(sample => getSampleReview(sample).pending), [samples]);
  const filters = useDatasetFilters(pendingOnly ? pendingSamples : samples, () => {
    if (pageTopRef.current) pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete sample "${id}" and its WAV/JSON files?`)) return;
    try {
      await deleteSample(id);
      onSampleDeleted(id);
      addToast({ type: 'info', title: 'Sample Deleted', message: `Sample ${id} removed from dataset.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const handleRatingChange = async (sampleId: string, ratings: SampleRatings) => {
    try {
      const updated = await updateSample(sampleId, { ratings });
      onSampleUpdated(updated);
      addToast({ type: 'success', title: 'Rating Saved', message: `Ratings updated for ${sampleId}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Rating Failed', message: err.message });
    }
  };

  const handleBatchDeleted = (deletedIds: string[]) => {
    if (onBatchDeleted) onBatchDeleted(deletedIds);
    else for (const id of deletedIds) onSampleDeleted(id);
    removeBatchFromSelection(deletedIds);
  };

  return (
    <div className="dataset-page-root" ref={pageTopRef}>
      <DatasetHeader
        duplicateGroupCount={filters.duplicateGroupCount}
        durationOutlierCount={filters.durationOutlierCount}
        selectedCount={selectedCount}
        onOpenExportModal={() => setShowExportModal(true)}
        onOpenAudarStatsModal={() => setShowAudarModal(true)}
        onOpenDuplicatesModal={() => setShowDuplicatesModal(true)}
        onOpenMassDeleteModal={() => setShowMassDeleteModal(true)}
        onOpenDurationOutliersModal={() => setShowDurationOutlierModal(true)}
        onOpenPairedValidateModal={() => setShowPairedValidateModal(true)}
        onOpenPairedExportModal={() => setShowPairedExportModal(true)}
      />

      <DatasetReviewSection pendingCount={pendingSamples.length} pendingOnly={pendingOnly}
        onChange={value => { setPendingOnly(value); filters.goToPage(1); clearSelection(); if (value) setViewMode('cards'); }} />
      <div className="glass-card filter-card">
        <DatasetFilterBar
          searchQuery={filters.searchQuery}
          onSearchChange={filters.setSearchQuery}
          filterGender={filters.filterGender}
          onGenderChange={filters.setFilterGender}
          filterVoice={filters.filterVoice}
          onVoiceChange={filters.setFilterVoice}
          availableVoices={filters.availableVoices}
          filterLanguage={filters.filterLanguage}
          onLanguageChange={filters.setFilterLanguage}
          availableLanguages={filters.availableLanguages}
          filterDialect={filters.filterDialect}
          onDialectChange={filters.setFilterDialect}
          filterEmotion={filters.filterEmotion}
          onEmotionChange={filters.setFilterEmotion}
          filterMethod={filters.filterMethod}
          onMethodChange={filters.setFilterMethod}
          filterKey={filters.filterKey}
          onKeyChange={filters.setFilterKey}
          availableKeys={filters.availableKeys}
          sortBy={filters.sortBy}
          onSortChange={filters.setSortBy}
          pageSize={filters.pageSize}
          onPageSizeChange={filters.setPageSize}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalSamplesCount={samples.length}
        />

        <DatasetStatsBar
          totalItems={filters.totalItems}
          startIndex={filters.startIndex}
          endIndex={filters.endIndex}
          totalSamplesCount={samples.length}
          safeCurrentPage={filters.safeCurrentPage}
          totalPages={filters.totalPages}
          filterVoice={filters.filterVoice}
          onClearVoice={() => filters.setFilterVoice('all')}
          filterLanguage={filters.filterLanguage}
          onClearLanguage={() => filters.setFilterLanguage('all')}
          filterKey={filters.filterKey}
          onClearKey={() => filters.setFilterKey('all')}
          onPrevPage={() => filters.goToPage(filters.safeCurrentPage - 1)}
          onNextPage={() => filters.goToPage(filters.safeCurrentPage + 1)}
        />
      </div>

      <DatasetBatchBanner
        selectedCount={selectedCount}
        currentPaginatedCount={filters.currentPaginatedSamples.length}
        onToggleCurrentPage={() => toggleAll(filters.currentPaginatedSamples.map((s) => s.id))}
        onSelectAllFiltered={() => selectAll(filters.filteredAndSortedSamples.map((s) => s.id))}
        onClearSelection={clearSelection}
        onOpenMassDelete={() => setShowMassDeleteModal(true)}
      />

      {viewMode === 'families' ? (
        <PairedFamiliesView samples={filters.filteredAndSortedSamples} />
      ) : viewMode === 'expressive_families' ? (
        <ExpressiveDatasetFamiliesView
          samples={filters.filteredAndSortedSamples}
          recentSampleIds={recentlyAddedIds}
          isLiveSyncActive={true}
        />
      ) : filters.totalItems === 0 ? (
        <div className="glass-card empty-dataset-state">
          <Database size={40} className="text-dim" />
          <div className="empty-title">No Samples Found</div>
          <p className="empty-sub">
            {samples.length === 0
              ? 'No audio samples have been generated yet. Use Gemini Generation or ElevenLabs tab to create your first Kurdish TTS sample!'
              : 'No samples matched your search or filter criteria.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <DatasetCardGrid
          samples={filters.currentPaginatedSamples}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectSample}
          onInspect={setInspectingSample}
          onDelete={handleDelete}
          onRatingChange={handleRatingChange}
          onSampleUpdated={onSampleUpdated}
        />
      ) : (
        <DatasetTableView
          samples={filters.currentPaginatedSamples}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectSample}
          onSelectAllCurrentPage={() => toggleAll(filters.currentPaginatedSamples.map((s) => s.id))}
          onInspect={setInspectingSample}
          onDelete={handleDelete}
          onRatingChange={handleRatingChange}
          onSampleUpdated={onSampleUpdated}
        />
      )}

      <DatasetPaginationBar
        startIndex={filters.startIndex}
        endIndex={filters.endIndex}
        totalItems={filters.totalItems}
        totalPages={filters.totalPages}
        safeCurrentPage={filters.safeCurrentPage}
        pageNumbers={filters.pageNumbers}
        goToPage={filters.goToPage}
        jumpPageInput={filters.jumpPageInput}
        onJumpInputChange={filters.setJumpPageInput}
        onJumpSubmit={filters.handleJumpSubmit}
      />

      <DatasetModals
        samples={samples}
        filteredAndSortedSamples={filters.filteredAndSortedSamples}
        availableVoices={filters.availableVoices}
        selectedIds={selectedIds}
        inspectingSample={inspectingSample}
        setInspectingSample={setInspectingSample}
        onSampleUpdated={onSampleUpdated}
        onSampleDeleted={onSampleDeleted}
        onBatchDeleted={handleBatchDeleted}
        showAudarModal={showAudarModal}
        setShowAudarModal={setShowAudarModal}
        showDuplicatesModal={showDuplicatesModal}
        setShowDuplicatesModal={setShowDuplicatesModal}
        showExportModal={showExportModal}
        setShowExportModal={setShowExportModal}
        showMassDeleteModal={showMassDeleteModal}
        setShowMassDeleteModal={setShowMassDeleteModal}
        showDurationOutlierModal={showDurationOutlierModal}
        setShowDurationOutlierModal={setShowDurationOutlierModal}
        showPairedValidateModal={showPairedValidateModal}
        setShowPairedValidateModal={setShowPairedValidateModal}
        showPairedExportModal={showPairedExportModal}
        setShowPairedExportModal={setShowPairedExportModal}
        addToast={addToast}
      />
    </div>
  );
};
