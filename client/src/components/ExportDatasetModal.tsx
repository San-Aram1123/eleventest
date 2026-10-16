import React, { useState, useMemo } from 'react';
import { X, Download } from 'lucide-react';
import { Sample, DatasetExportFilters } from '../types';
import { getZipExportUrl, getAudarZipExportUrl, getV20ZipExportUrl } from '../services/api';
import { getSampleGender, GEMINI_FEMALE_VOICES, GEMINI_MALE_VOICES } from '../utils/genderUtils';
import { formatDuration } from '../utils/audioFormatters';
import { ExportPresetSelector, PresetType } from './dataset/export/ExportPresetSelector';
import { ExportCustomFilters } from './dataset/export/ExportCustomFilters';
import { ExportPreviewStatsCard } from './dataset/export/ExportPreviewStatsCard';
import { ExportDownloadCards } from './dataset/export/ExportDownloadCards';

export { getSampleGender, GEMINI_FEMALE_VOICES, GEMINI_MALE_VOICES };

interface ExportDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  currentFilteredSamples: Sample[];
  availableVoices: { name: string; count: number }[];
  addToast?: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

export const ExportDatasetModal: React.FC<ExportDatasetModalProps> = ({
  isOpen,
  onClose,
  samples,
  currentFilteredSamples,
  availableVoices,
  addToast
}) => {
  const [preset, setPreset] = useState<PresetType>('all');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterVoice, setFilterVoice] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterDialect, setFilterDialect] = useState<string>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState<'raw' | 'audar' | 'v20' | null>(null);

  const { maleCount, femaleCount, soraniCount, badiniCount, ckbCount, enCount } = useMemo(() => {
    let m = 0;
    let f = 0;
    let sCount = 0;
    let bCount = 0;
    let cCount = 0;
    let eCount = 0;
    for (const s of samples) {
      if (getSampleGender(s) === 'male') m++;
      else f++;
      const d = String(s.dialect || 'sorani').toLowerCase();
      if (d === 'badini') bCount++;
      else sCount++;
      const l = String(s.language || (s as any).customMetadata?.language || (d === 'badini' ? 'kmr' : 'ckb')).toLowerCase();
      if (l === 'en') eCount++;
      else if (l === 'ckb') cCount++;
    }
    return { maleCount: m, femaleCount: f, soraniCount: sCount, badiniCount: bCount, ckbCount: cCount, enCount: eCount };
  }, [samples]);

  const handleSelectPreset = (newPreset: PresetType) => {
    setPreset(newPreset);
    if (newPreset === 'all' || newPreset === 'male' || newPreset === 'female') {
      setFilterGender(newPreset === 'male' ? 'male' : newPreset === 'female' ? 'female' : 'all');
      setFilterVoice('all');
      setFilterLanguage('all');
      setFilterDialect('all');
      setFilterEmotion('all');
      setFilterMethod('all');
    }
  };

  const effectiveFilters: DatasetExportFilters = useMemo(() => {
    if (preset === 'current') return { ids: currentFilteredSamples.map((s) => s.id) };
    if (preset === 'male') return { gender: 'male' };
    if (preset === 'female') return { gender: 'female' };
    if (preset === 'all') return {};

    const f: DatasetExportFilters = {};
    if (filterGender !== 'all') f.gender = filterGender;
    if (filterVoice !== 'all') f.voice = filterVoice;
    if (filterLanguage !== 'all') f.language = filterLanguage;
    if (filterDialect !== 'all') f.dialect = filterDialect;
    if (filterEmotion !== 'all') f.emotion = filterEmotion;
    if (filterMethod !== 'all') f.method = filterMethod;
    return f;
  }, [preset, currentFilteredSamples, filterGender, filterVoice, filterLanguage, filterDialect, filterEmotion, filterMethod]);

  const matchedSamples = useMemo(() => {
    if (preset === 'current') return currentFilteredSamples;
    if (preset === 'all') return samples;
    if (preset === 'male') return samples.filter((s) => getSampleGender(s) === 'male');
    if (preset === 'female') return samples.filter((s) => getSampleGender(s) === 'female');

    return samples.filter((s) => {
      if (filterGender !== 'all' && getSampleGender(s) !== filterGender) return false;
      if (filterVoice !== 'all') {
        const v = String(s.voice_name || s.voice_id || '').toLowerCase();
        if (!v.includes(filterVoice.toLowerCase())) return false;
      }
      if (filterLanguage !== 'all') {
        const l = String(s.language || (s as any).customMetadata?.language || (s.dialect === 'badini' ? 'kmr' : 'ckb')).toLowerCase();
        if (l !== filterLanguage.toLowerCase()) return false;
      }
      if (filterDialect !== 'all') {
        const d = String(s.dialect || 'sorani').toLowerCase();
        if (d !== filterDialect.toLowerCase()) return false;
      }
      if (filterEmotion !== 'all') {
        const em = String(s.emotion || 'neutral').toLowerCase();
        const tag = String(s.emotion_tag || '').toLowerCase();
        if (!em.includes(filterEmotion.toLowerCase()) && !tag.includes(filterEmotion.toLowerCase())) return false;
      }
      if (filterMethod !== 'all' && s.method !== filterMethod) return false;
      return true;
    });
  }, [preset, samples, currentFilteredSamples, filterGender, filterVoice, filterLanguage, filterDialect, filterEmotion, filterMethod]);

  const matchedStats = useMemo(() => {
    let totalSec = 0;
    let totalBytes = 0;
    let m = 0;
    let f = 0;
    for (const s of matchedSamples) {
      totalSec += s.duration_seconds || s.durationSeconds || 0;
      totalBytes += s.audio_size || 0;
      if (getSampleGender(s) === 'male') m++;
      else f++;
    }
    const sizeMb = (totalBytes / (1024 * 1024)).toFixed(1);

    return {
      count: matchedSamples.length,
      maleCount: m,
      femaleCount: f,
      durationFormatted: formatDuration(totalSec),
      sizeMb: totalBytes > 0 ? `${sizeMb} MB` : 'Estimating...'
    };
  }, [matchedSamples]);

  const rawZipUrl = useMemo(() => getZipExportUrl(effectiveFilters), [effectiveFilters]);
  const audarZipUrl = useMemo(() => getAudarZipExportUrl(effectiveFilters), [effectiveFilters]);
  const v20ZipUrl = useMemo(() => getV20ZipExportUrl(effectiveFilters), [effectiveFilters]);

  const handleCopyLink = (type: 'raw' | 'audar' | 'v20') => {
    const relativeUrl = type === 'raw' ? rawZipUrl : type === 'audar' ? audarZipUrl : v20ZipUrl;
    navigator.clipboard.writeText(`${window.location.origin}${relativeUrl}`).then(() => {
      setCopiedLink(type);
      addToast?.({ type: 'success', title: 'Link Copied', message: 'Direct download link copied to clipboard!' });
      setTimeout(() => setCopiedLink(null), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-container glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '95%',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)'
        }}
      >
        <div className="modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
                color: '#0f172a',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Export & Download Kurdish Dataset
              </h2>
              <p className="modal-subtitle" style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Filter which voice genders, dialects, or models to include in your ZIP archive
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <ExportPresetSelector
            preset={preset}
            onSelectPreset={handleSelectPreset}
            samplesCount={samples.length}
            maleCount={maleCount}
            femaleCount={femaleCount}
            currentFilteredCount={currentFilteredSamples.length}
          />

          {preset === 'custom' && (
            <ExportCustomFilters
              filterGender={filterGender}
              setFilterGender={setFilterGender}
              filterVoice={filterVoice}
              setFilterVoice={setFilterVoice}
              availableVoices={availableVoices}
              filterLanguage={filterLanguage}
              setFilterLanguage={setFilterLanguage}
              filterDialect={filterDialect}
              setFilterDialect={setFilterDialect}
              filterEmotion={filterEmotion}
              setFilterEmotion={setFilterEmotion}
              filterMethod={filterMethod}
              setFilterMethod={setFilterMethod}
              samplesCount={samples.length}
              maleCount={maleCount}
              femaleCount={femaleCount}
              ckbCount={ckbCount}
              enCount={enCount}
              badiniCount={badiniCount}
              soraniCount={soraniCount}
            />
          )}

          <ExportPreviewStatsCard matchedStats={matchedStats} totalSamplesCount={samples.length} />

          <ExportDownloadCards
            rawZipUrl={rawZipUrl}
            audarZipUrl={audarZipUrl}
            v20ZipUrl={v20ZipUrl}
            matchedCount={matchedStats.count}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
          />
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Ready to export <strong>{matchedStats.count}</strong> samples ({matchedStats.durationFormatted})
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
