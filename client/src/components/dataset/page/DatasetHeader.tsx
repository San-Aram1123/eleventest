import React from 'react';
import {
  Database,
  Download,
  Filter,
  Sparkles,
  BarChart3,
  Copy,
  Trash2,
  Clock,
  FileArchive,
  ShieldCheck
} from 'lucide-react';

interface DatasetHeaderProps {
  duplicateGroupCount: number;
  durationOutlierCount: number;
  selectedCount: number;
  onOpenExportModal: () => void;
  onOpenAudarStatsModal: () => void;
  onOpenDuplicatesModal: () => void;
  onOpenMassDeleteModal: () => void;
  onOpenDurationOutliersModal: () => void;
  onOpenPairedValidateModal: () => void;
  onOpenPairedExportModal: () => void;
}

export const DatasetHeader: React.FC<DatasetHeaderProps> = ({
  duplicateGroupCount,
  durationOutlierCount,
  selectedCount,
  onOpenExportModal,
  onOpenAudarStatsModal,
  onOpenDuplicatesModal,
  onOpenMassDeleteModal,
  onOpenDurationOutliersModal,
  onOpenPairedValidateModal,
  onOpenPairedExportModal
}) => {
  return (
    <div className="dataset-page-header">
      <div>
        <h1 className="page-title">
          <Database size={24} className="text-cyan inline-icon" />
          <span>Kurdish Speech Dataset Manager</span>
        </h1>
        <p className="page-description">
          Authoritative repository of all generated Kurdish WAV audio files, Asosoft Kurdish orthography, and Audar Canonical Speech Schema.
        </p>
      </div>

      <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Main Filtered Export / Download Modal Trigger */}
        <button
          onClick={onOpenExportModal}
          className="btn btn-accent btn-md"
          id="btn-open-export-modal"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            color: '#ffffff',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px'
          }}
          title="Download dataset with filters (All, Male Voices, Female Voices, Dialect, etc.)"
        >
          <Download size={17} />
          <span>Export / Download Dataset</span>
          <Filter size={13} style={{ opacity: 0.85 }} />
        </button>

        {/* Quick Audar Canonical Export */}
        <button
          onClick={onOpenExportModal}
          className="btn btn-secondary btn-md"
          id="btn-download-audar-canonical-zip"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          title="Export full dataset formatted strictly according to Audar Canonical Schema"
        >
          <Sparkles size={17} style={{ color: '#38bdf8' }} />
          <span>Audar Export</span>
        </button>

        {/* Audar Schema & Stats Modal trigger */}
        <button
          onClick={onOpenAudarStatsModal}
          className="btn btn-secondary btn-md"
          id="btn-audar-schema-stats"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          title="View Kurdish Phoneme Coverage and Audar Schema specifications"
        >
          <BarChart3 size={17} />
          <span>Audar Schema & Stats</span>
        </button>

        {/* Find & Clean Duplicates Modal Button */}
        <button
          onClick={onOpenDuplicatesModal}
          className="btn btn-secondary btn-md"
          id="btn-find-duplicates"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            borderColor: duplicateGroupCount > 0 ? 'rgba(245, 158, 11, 0.45)' : undefined,
            background: duplicateGroupCount > 0 ? 'rgba(245, 158, 11, 0.12)' : undefined,
            color: duplicateGroupCount > 0 ? '#FBBF24' : undefined,
            fontWeight: 600
          }}
          title="Scan dataset for identical or duplicate Kurdish transcripts and prune takes"
        >
          <Copy size={16} />
          <span>Find Duplicates</span>
          {duplicateGroupCount > 0 && (
            <span
              style={{
                background: '#F59E0B',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '10px',
                lineHeight: '1.3'
              }}
            >
              {duplicateGroupCount}
            </span>
          )}
        </button>

        {/* Mass Delete Modal Button */}
        <button
          onClick={onOpenMassDeleteModal}
          className="btn btn-secondary btn-md"
          id="btn-mass-delete"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            borderColor: 'rgba(239, 68, 68, 0.45)',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#f87171',
            fontWeight: 600
          }}
          title="Mass delete samples (Not today, date ranges, filters, selected)"
        >
          <Trash2 size={16} />
          <span>Mass Delete</span>
          {selectedCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '10px',
                lineHeight: '1.3'
              }}
            >
              {selectedCount}
            </span>
          )}
        </button>

        {/* Duration Outlier Cleanup Button */}
        <button
          onClick={onOpenDurationOutliersModal}
          className="btn btn-secondary btn-md"
          id="btn-duration-outliers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            borderColor: durationOutlierCount > 0 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.1)',
            background: durationOutlierCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            color: durationOutlierCount > 0 ? '#fbbf24' : '#94a3b8',
            fontWeight: 600
          }}
          title="Delete outlier audios 6s and less or over 16.5s"
        >
          <Clock size={16} />
          <span>Clean Outliers (≤6s / &gt;16.5s)</span>
          {durationOutlierCount > 0 && (
            <span
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '10px',
                lineHeight: '1.3'
              }}
            >
              {durationOutlierCount}
            </span>
          )}
        </button>

        {/* Raw Dataset Export */}
        <button
          onClick={onOpenExportModal}
          className="btn btn-secondary btn-sm"
          id="btn-download-dataset-zip"
          title="Download raw audio and JSON files with custom filters"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <FileArchive size={15} />
          <span>Raw ZIP</span>
        </button>

        {/* Validate Paired Emotion Rules */}
        <button
          onClick={onOpenPairedValidateModal}
          className="btn btn-secondary btn-sm"
          title="Validate paired emotion dataset rules (same speaker, same text, 6 emotions)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
        >
          <ShieldCheck size={15} />
          <span>Validate Paired</span>
        </button>

        {/* Paired Emotion Dataset Export */}
        <button
          onClick={onOpenPairedExportModal}
          className="btn btn-primary btn-sm"
          title="Export paired emotion dataset with required schema"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}
        >
          <Download size={15} />
          <span>Paired Export</span>
        </button>
      </div>
    </div>
  );
};
