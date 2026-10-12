import React from 'react';
import { Sample } from '../../../types';
import { MetadataModal } from '../../MetadataModal';
import { AudarExportModal } from '../../AudarExportModal';
import { DuplicateManagerModal } from '../../DuplicateManagerModal';
import { ExportDatasetModal } from '../../ExportDatasetModal';
import { MassDeleteModal } from '../../MassDeleteModal';
import { DurationOutlierModal } from '../../DurationOutlierModal';
import { PairedValidationModal } from '../../paired/PairedValidationModal';
import { PairedExportModal } from '../../paired/PairedExportModal';

interface DatasetModalsProps {
  samples: Sample[];
  filteredAndSortedSamples: Sample[];
  availableVoices: { name: string; count: number }[];
  selectedIds: Set<string>;
  inspectingSample: Sample | null;
  setInspectingSample: (s: Sample | null) => void;
  onSampleUpdated: (s: Sample) => void;
  onSampleDeleted: (id: string) => void;
  onBatchDeleted: (ids: string[]) => void;
  showAudarModal: boolean;
  setShowAudarModal: (b: boolean) => void;
  showDuplicatesModal: boolean;
  setShowDuplicatesModal: (b: boolean) => void;
  showExportModal: boolean;
  setShowExportModal: (b: boolean) => void;
  showMassDeleteModal: boolean;
  setShowMassDeleteModal: (b: boolean) => void;
  showDurationOutlierModal: boolean;
  setShowDurationOutlierModal: (b: boolean) => void;
  showPairedValidateModal: boolean;
  setShowPairedValidateModal: (b: boolean) => void;
  showPairedExportModal: boolean;
  setShowPairedExportModal: (b: boolean) => void;
  addToast: (t: any) => void;
}

export const DatasetModals: React.FC<DatasetModalsProps> = ({
  samples,
  filteredAndSortedSamples,
  availableVoices,
  selectedIds,
  inspectingSample,
  setInspectingSample,
  onSampleUpdated,
  onSampleDeleted,
  onBatchDeleted,
  showAudarModal,
  setShowAudarModal,
  showDuplicatesModal,
  setShowDuplicatesModal,
  showExportModal,
  setShowExportModal,
  showMassDeleteModal,
  setShowMassDeleteModal,
  showDurationOutlierModal,
  setShowDurationOutlierModal,
  showPairedValidateModal,
  setShowPairedValidateModal,
  showPairedExportModal,
  setShowPairedExportModal,
  addToast
}) => {
  return (
    <>
      {inspectingSample && (
        <MetadataModal
          sample={inspectingSample}
          onClose={() => setInspectingSample(null)}
          onSampleUpdated={(updated) => {
            setInspectingSample(updated);
            onSampleUpdated(updated);
          }}
        />
      )}

      <ExportDatasetModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        samples={samples}
        currentFilteredSamples={filteredAndSortedSamples}
        availableVoices={availableVoices}
        addToast={addToast}
      />

      <AudarExportModal isOpen={showAudarModal} onClose={() => setShowAudarModal(false)} />

      <DuplicateManagerModal
        isOpen={showDuplicatesModal}
        onClose={() => setShowDuplicatesModal(false)}
        samples={samples}
        onSampleDeleted={onSampleDeleted}
        onBatchDeleted={onBatchDeleted}
        addToast={addToast}
      />

      <MassDeleteModal
        isOpen={showMassDeleteModal}
        onClose={() => setShowMassDeleteModal(false)}
        samples={samples}
        currentFilteredSamples={filteredAndSortedSamples}
        availableVoices={availableVoices}
        selectedSampleIds={selectedIds}
        onBatchDeleted={onBatchDeleted}
        addToast={addToast}
      />

      <DurationOutlierModal
        isOpen={showDurationOutlierModal}
        onClose={() => setShowDurationOutlierModal(false)}
        samples={samples}
        onDeleted={onBatchDeleted}
        addToast={addToast}
        minSeconds={6.0}
        maxSeconds={16.5}
      />

      {showPairedValidateModal && (
        <PairedValidationModal
          isOpen={showPairedValidateModal}
          onClose={() => setShowPairedValidateModal(false)}
        />
      )}

      {showPairedExportModal && (
        <PairedExportModal
          isOpen={showPairedExportModal}
          onClose={() => setShowPairedExportModal(false)}
          samples={samples}
          addToast={addToast}
        />
      )}
    </>
  );
};
