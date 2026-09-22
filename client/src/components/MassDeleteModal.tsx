import React, { useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  Layers, 
  Check, 
  Volume2, 
  Clock, 
  HardDrive,
  Star,
  Search,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { Sample } from '../types';
import { batchDeleteSamples } from '../services/api';
import { getSampleGender } from './ExportDatasetModal';

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
type DatePreset = 'not_today' | 'today_only' | 'older_7_days' | 'older_30_days' | 'custom';

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
  // Tab & Preset selection
  const [activeTab, setActiveTab] = useState<DeleteTab>(() => selectedSampleIds.size > 0 ? 'selected' : 'date');
  const [datePreset, setDatePreset] = useState<DatePreset>('not_today');

  // Custom date range state
  const [customDateType, setCustomDateType] = useState<'before' | 'after' | 'between'>('before');
  const [customDateStart, setCustomDateStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customDateEnd, setCustomDateEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Metadata filter states
  const [metaCriteriaType, setMetaCriteriaType] = useState<'dialect' | 'voice' | 'method' | 'rating' | 'missing_audio'>('dialect');
  const [metaDialect, setMetaDialect] = useState<'sorani' | 'badini'>('sorani');
  const [metaVoice, setMetaVoice] = useState<string>(() => availableVoices[0]?.name || 'Puck');
  const [metaMethod, setMetaMethod] = useState<string>('gemini_api');
  const [metaRatingOption, setMetaRatingOption] = useState<'unrated' | 'low_quality'>('unrated');

  // Safety confirmation states
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  // Time boundaries
  const timeInfo = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const sevenDaysAgo = startOfToday - (7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = startOfToday - (30 * 24 * 60 * 60 * 1000);

    let notTodayCount = 0;
    let todayCount = 0;
    let older7DaysCount = 0;
    let older30DaysCount = 0;

    for (const s of samples) {
      const t = s.created_at ? new Date(s.created_at).getTime() : 0;
      if (t < startOfToday) notTodayCount++;
      else todayCount++;

      if (t < sevenDaysAgo) older7DaysCount++;
      if (t < thirtyDaysAgo) older30DaysCount++;
    }

    return {
      startOfToday,
      sevenDaysAgo,
      thirtyDaysAgo,
      notTodayCount,
      todayCount,
      older7DaysCount,
      older30DaysCount
    };
  }, [samples]);

  // Compute matching samples to delete based on the selected mode
  const matchingSamples = useMemo(() => {
    if (activeTab === 'selected') {
      return samples.filter(s => selectedSampleIds.has(s.id));
    }

    if (activeTab === 'active_filter') {
      return currentFilteredSamples;
    }

    if (activeTab === 'date') {
      if (datePreset === 'not_today') {
        return samples.filter(s => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          return t < timeInfo.startOfToday;
        });
      }

      if (datePreset === 'today_only') {
        return samples.filter(s => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          return t >= timeInfo.startOfToday;
        });
      }

      if (datePreset === 'older_7_days') {
        return samples.filter(s => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          return t < timeInfo.sevenDaysAgo;
        });
      }

      if (datePreset === 'older_30_days') {
        return samples.filter(s => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          return t < timeInfo.thirtyDaysAgo;
        });
      }

      if (datePreset === 'custom') {
        const startTimestamp = customDateStart ? new Date(`${customDateStart}T00:00:00`).getTime() : 0;
        const endTimestamp = customDateEnd ? new Date(`${customDateEnd}T23:59:59.999`).getTime() : Infinity;

        return samples.filter(s => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          if (customDateType === 'before') {
            return t <= endTimestamp;
          }
          if (customDateType === 'after') {
            return t >= startTimestamp;
          }
          if (customDateType === 'between') {
            return t >= startTimestamp && t <= endTimestamp;
          }
          return false;
        });
      }
    }

    if (activeTab === 'metadata') {
      if (metaCriteriaType === 'dialect') {
        return samples.filter(s => (s.dialect || 'sorani').toLowerCase() === metaDialect.toLowerCase());
      }

      if (metaCriteriaType === 'voice') {
        return samples.filter(s => {
          const v = (s.voice_name || (s as any).voiceName || s.voice_id || '').trim().toLowerCase();
          return v.includes(metaVoice.toLowerCase()) || metaVoice.toLowerCase().includes(v);
        });
      }

      if (metaCriteriaType === 'method') {
        return samples.filter(s => (s.method || '').toLowerCase() === metaMethod.toLowerCase());
      }

      if (metaCriteriaType === 'rating') {
        if (metaRatingOption === 'unrated') {
          return samples.filter(s => {
            const r = s.ratings?.overall || (s as any).rating;
            return r === undefined || r === null || r === 0;
          });
        }
        if (metaRatingOption === 'low_quality') {
          return samples.filter(s => {
            const r = s.ratings?.overall || (s as any).rating;
            return typeof r === 'number' && r > 0 && r <= 2;
          });
        }
      }

      if (metaCriteriaType === 'missing_audio') {
        return samples.filter(s => !s.hasAudio || (s.audio_size !== undefined && s.audio_size === 0));
      }
    }

    return [];
  }, [
    activeTab,
    datePreset,
    customDateType,
    customDateStart,
    customDateEnd,
    metaCriteriaType,
    metaDialect,
    metaVoice,
    metaMethod,
    metaRatingOption,
    samples,
    currentFilteredSamples,
    selectedSampleIds,
    timeInfo
  ]);

  // Compute aggregated statistics for the matching set
  const stats = useMemo(() => {
    const count = matchingSamples.length;
    const totalDurationSec = matchingSamples.reduce((acc, s) => {
      const d = s.duration_seconds || s.durationSeconds || 0;
      return acc + (typeof d === 'number' ? d : 0);
    }, 0);

    const formatDuration = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      if (h > 0) return `${h}h ${m}m ${s}s`;
      if (m > 0) return `${m}m ${s}s`;
      return `${s}s`;
    };

    const remainingCount = Math.max(0, samples.length - count);
    const percentOfTotal = samples.length > 0 ? ((count / samples.length) * 100).toFixed(1) : '0';

    return {
      count,
      totalDurationSec,
      durationFormatted: formatDuration(totalDurationSec),
      remainingCount,
      percentOfTotal
    };
  }, [matchingSamples, samples]);

  // Safety verification check: typing 'DELETE' for > 50 items, or checkbox for <= 50
  const isConfirmed = useMemo(() => {
    if (stats.count === 0) return false;
    if (stats.count > 50) {
      return confirmText.trim().toUpperCase() === 'DELETE';
    }
    return confirmChecked;
  }, [stats.count, confirmText, confirmChecked]);

  // Execute mass deletion
  const handleExecuteDelete = async () => {
    if (!isConfirmed || stats.count === 0 || isDeleting) return;

    const idsToDelete = matchingSamples.map(s => s.id);
    setIsDeleting(true);
    setDeleteProgress({ current: 0, total: idsToDelete.length });

    try {
      // Execute chunked deletion in batches of 400 for safety and progress reporting
      const chunkSize = 400;
      const allDeletedIds: string[] = [];

      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        const res = await batchDeleteSamples(chunk);
        if (res.deletedIds && res.deletedIds.length > 0) {
          allDeletedIds.push(...res.deletedIds);
        }
        setDeleteProgress({ current: Math.min(i + chunkSize, idsToDelete.length), total: idsToDelete.length });
      }

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
    } finally {
      setIsDeleting(false);
      setDeleteProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1050 }}>
      <div 
        className="modal-content glass-card" 
        style={{ 
          maxWidth: '780px', 
          width: '95%', 
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 24px rgba(239, 68, 68, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '1.2rem 1.5rem', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{ 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px', 
                padding: '8px',
                color: '#f87171'
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Mass Delete Dataset Samples
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Permanently purge audio WAV files, transcripts, and database rows with granular filters.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
            disabled={isDeleting}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Main Mode Navigation Tabs */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '5px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.07)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('date')}
              className={`btn btn-sm ${activeTab === 'date' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '8px',
                background: activeTab === 'date' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent',
                color: activeTab === 'date' ? '#ffffff' : '#94a3b8',
                border: 'none'
              }}
            >
              <Calendar size={14} />
              <span>Date Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active_filter')}
              className={`btn btn-sm ${activeTab === 'active_filter' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '8px',
                background: activeTab === 'active_filter' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent',
                color: activeTab === 'active_filter' ? '#ffffff' : '#94a3b8',
                border: 'none'
              }}
            >
              <Filter size={14} />
              <span>Active View ({currentFilteredSamples.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`btn btn-sm ${activeTab === 'metadata' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '8px',
                background: activeTab === 'metadata' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent',
                color: activeTab === 'metadata' ? '#ffffff' : '#94a3b8',
                border: 'none'
              }}
            >
              <ListFilter size={14} />
              <span>Metadata Rule</span>
            </button>

            {selectedSampleIds.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('selected')}
                className={`btn btn-sm ${activeTab === 'selected' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  background: activeTab === 'selected' ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent',
                  color: activeTab === 'selected' ? '#ffffff' : '#94a3b8',
                  border: 'none'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Selected ({selectedSampleIds.size})</span>
              </button>
            )}
          </div>

          {/* TAB CONTENT 1: Date Presets */}
          {activeTab === 'date' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Date Condition:
              </span>

              {/* Preset 1: Not Today / Created Before Today (Exact user request) */}
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: datePreset === 'not_today' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: datePreset === 'not_today' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="date_preset"
                    checked={datePreset === 'not_today'}
                    onChange={() => setDatePreset('not_today')}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
                      Not Today (Created Before Today)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Delete all older samples prior to today's date. Keeps today's newly generated samples intact.
                    </div>
                  </div>
                </div>
                <span className="badge badge-warning" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {timeInfo.notTodayCount.toLocaleString()} samples
                </span>
              </label>

              {/* Preset 2: Created Today Only */}
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: datePreset === 'today_only' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: datePreset === 'today_only' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="date_preset"
                    checked={datePreset === 'today_only'}
                    onChange={() => setDatePreset('today_only')}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
                      Created Today Only
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Purge samples created today (useful if a bad test run was generated).
                    </div>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {timeInfo.todayCount.toLocaleString()} samples
                </span>
              </label>

              {/* Preset 3: Older than 7 Days */}
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: datePreset === 'older_7_days' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: datePreset === 'older_7_days' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="date_preset"
                    checked={datePreset === 'older_7_days'}
                    onChange={() => setDatePreset('older_7_days')}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
                      Older than 7 Days
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Delete samples created over one week ago.
                    </div>
                  </div>
                </div>
                <span className="badge badge-secondary" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {timeInfo.older7DaysCount.toLocaleString()} samples
                </span>
              </label>

              {/* Preset 4: Older than 30 Days */}
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: datePreset === 'older_30_days' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: datePreset === 'older_30_days' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="radio"
                    name="date_preset"
                    checked={datePreset === 'older_30_days'}
                    onChange={() => setDatePreset('older_30_days')}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
                      Older than 30 Days
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Delete samples created over one month ago.
                    </div>
                  </div>
                </div>
                <span className="badge badge-secondary" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {timeInfo.older30DaysCount.toLocaleString()} samples
                </span>
              </label>

              {/* Preset 5: Custom Date Range */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: datePreset === 'custom' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: datePreset === 'custom' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: datePreset === 'custom' ? '12px' : '0' }}>
                  <input
                    type="radio"
                    name="date_preset"
                    checked={datePreset === 'custom'}
                    onChange={() => setDatePreset('custom')}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>
                    Custom Date Range
                  </div>
                </label>

                {datePreset === 'custom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', paddingLeft: '28px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Range Type</label>
                      <select 
                        className="select-control"
                        value={customDateType}
                        onChange={(e) => setCustomDateType(e.target.value as any)}
                        style={{ width: '100%', fontSize: '0.82rem' }}
                      >
                        <option value="before">Created Before Date</option>
                        <option value="after">Created After Date</option>
                        <option value="between">Created Between Dates</option>
                      </select>
                    </div>

                    {(customDateType === 'after' || customDateType === 'between') && (
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Date</label>
                        <input
                          type="date"
                          className="input-control"
                          value={customDateStart}
                          onChange={(e) => setCustomDateStart(e.target.value)}
                          style={{ width: '100%', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}

                    {(customDateType === 'before' || customDateType === 'between') && (
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>End Date</label>
                        <input
                          type="date"
                          className="input-control"
                          value={customDateEnd}
                          onChange={(e) => setCustomDateEnd(e.target.value)}
                          style={{ width: '100%', fontSize: '0.82rem' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB CONTENT 2: Active View Filter */}
          {activeTab === 'active_filter' && (
            <div className="glass-card" style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Filter size={16} color="#f87171" />
                <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem' }}>
                  Delete Current Filtered View
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 10px 0' }}>
                Purge all samples currently matching your active filters and search terms on the Dataset Manager page.
              </p>
              <div style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>
                Matching Visible Items: <strong>{currentFilteredSamples.length.toLocaleString()}</strong> of {samples.length.toLocaleString()} total samples.
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: Specific Metadata Criteria */}
          {activeTab === 'metadata' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Select Delete Criteria Rule</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMetaCriteriaType('dialect')}
                    className={`btn btn-sm ${metaCriteriaType === 'dialect' ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    By Dialect
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaCriteriaType('voice')}
                    className={`btn btn-sm ${metaCriteriaType === 'voice' ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    By Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaCriteriaType('method')}
                    className={`btn btn-sm ${metaCriteriaType === 'method' ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    By Method
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaCriteriaType('rating')}
                    className={`btn btn-sm ${metaCriteriaType === 'rating' ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    By Rating
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaCriteriaType('missing_audio')}
                    className={`btn btn-sm ${metaCriteriaType === 'missing_audio' ? 'btn-danger' : 'btn-secondary'}`}
                  >
                    Missing Audio
                  </button>
                </div>
              </div>

              {/* Sub-selector based on criteria type */}
              <div className="glass-card" style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)' }}>
                {metaCriteriaType === 'dialect' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Kurdish Dialect</label>
                    <select
                      className="select-control"
                      value={metaDialect}
                      onChange={(e) => setMetaDialect(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="sorani">Central Kurdish (Sorani)</option>
                      <option value="badini">Northern Kurdish (Badini / Kurmanji)</option>
                    </select>
                  </div>
                )}

                {metaCriteriaType === 'voice' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Voice Name</label>
                    <select
                      className="select-control"
                      value={metaVoice}
                      onChange={(e) => setMetaVoice(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {availableVoices.map(v => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.count.toLocaleString()} samples)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {metaCriteriaType === 'method' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Synthesis Method</label>
                    <select
                      className="select-control"
                      value={metaMethod}
                      onChange={(e) => setMetaMethod(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="gemini_api">Google Gemini API</option>
                      <option value="elevenlabs_api">ElevenLabs API</option>
                      <option value="elevenlabs_web">ElevenLabs Web / Normal Voice</option>
                    </select>
                  </div>
                )}

                {metaCriteriaType === 'rating' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Rating Condition</label>
                    <select
                      className="select-control"
                      value={metaRatingOption}
                      onChange={(e) => setMetaRatingOption(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="unrated">Unrated Samples Only (0 Stars / Unreviewed)</option>
                      <option value="low_quality">Low Quality Samples (Rating ≤ 2 Stars)</option>
                    </select>
                  </div>
                )}

                {metaCriteriaType === 'missing_audio' && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                    Identifies records that are missing their <code>.wav</code> audio file or where the file size is 0 bytes.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: Selected Items */}
          {activeTab === 'selected' && (
            <div className="glass-card" style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={16} color="#f87171" />
                <span style={{ fontWeight: 700, color: '#f87171', fontSize: '0.92rem' }}>
                  Delete {selectedSampleIds.size} Checked Samples
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Will delete the {selectedSampleIds.size} specific items you manually selected using checkboxes in the table or card view.
              </p>
            </div>
          )}

          {/* REAL-TIME IMPACT SUMMARY & VISUAL PROGRESS */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '14px', 
              background: 'rgba(15, 23, 42, 0.7)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Impact Summary
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.count > 0 ? '#f87171' : '#94a3b8' }}>
                  {stats.count.toLocaleString()} samples to delete ({stats.percentOfTotal}%)
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Audio Duration: <strong style={{ color: '#f1f5f9' }}>{stats.durationFormatted}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Remaining in Dataset: <strong style={{ color: '#38bdf8' }}>{stats.remainingCount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div 
                style={{ 
                  width: `${stats.percentOfTotal}%`, 
                  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
              <div 
                style={{ 
                  width: `${100 - parseFloat(stats.percentOfTotal)}%`, 
                  background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', 
                  transition: 'width 0.3s ease' 
                }} 
              />
            </div>
          </div>

          {/* COLLAPSIBLE MATCHING PREVIEW */}
          {stats.count > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                  Sample Preview (Showing first {Math.min(30, stats.count)} matching items):
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  IDs: {matchingSamples.slice(0, 5).map(s => `#${s.id}`).join(', ')}{stats.count > 5 ? '...' : ''}
                </span>
              </div>

              <div 
                style={{ 
                  maxHeight: '140px', 
                  overflowY: 'auto', 
                  borderRadius: '8px', 
                  background: 'rgba(0, 0, 0, 0.25)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '6px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {matchingSamples.slice(0, 30).map(sample => (
                  <div 
                    key={sample.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      padding: '4px 6px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem', padding: '1px 5px' }}>
                        #{sample.id}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {sample.voice_name || (sample as any).voiceName || 'Voice'}
                      </span>
                      <span 
                        style={{ 
                          color: '#e2e8f0', 
                          direction: 'rtl', 
                          fontFamily: 'Rabar, Tahoma, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '360px'
                        }}
                      >
                        {sample.text}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DANGER SAFETY CONFIRMATION SECTION */}
          {stats.count > 0 && (
            <div 
              style={{ 
                padding: '12px 14px', 
                borderRadius: '10px', 
                background: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#f87171" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f87171' }}>
                  Permanent Action Confirmation
                </span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#fca5a5', margin: 0, lineHeight: 1.4 }}>
                This will physically delete the WAV audio files and MySQL records permanently. You cannot recover these samples after deletion.
              </p>

              {stats.count > 50 ? (
                <div style={{ marginTop: '4px' }}>
                  <label style={{ fontSize: '0.76rem', color: '#fca5a5', display: 'block', marginBottom: '4px' }}>
                    Type <strong style={{ color: '#ffffff', background: '#dc2626', padding: '1px 6px', borderRadius: '4px' }}>DELETE</strong> to confirm mass purge of {stats.count.toLocaleString()} samples:
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Type DELETE to confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    style={{
                      width: '100%',
                      borderColor: confirmText.toUpperCase() === 'DELETE' ? '#22c55e' : '#ef4444',
                      background: 'rgba(0,0,0,0.4)',
                      color: '#ffffff',
                      fontWeight: 700
                    }}
                  />
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600 }}>
                    I confirm I want to permanently delete these {stats.count} sample(s).
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Active Deletion Progress */}
          {isDeleting && deleteProgress && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#f87171' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={14} className="spin" />
                  Deleting samples from disk and database...
                </span>
                <span>{deleteProgress.current} / {deleteProgress.total}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: '#ef4444', 
                    width: `${(deleteProgress.current / deleteProgress.total) * 100}%`,
                    transition: 'width 0.2s ease'
                  }} 
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div 
          className="modal-footer" 
          style={{ 
            padding: '1rem 1.5rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.4)'
          }}
        >
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-danger btn-md"
            onClick={handleExecuteDelete}
            disabled={!isConfirmed || stats.count === 0 || isDeleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              boxShadow: isConfirmed && stats.count > 0 ? '0 4px 14px rgba(239, 68, 68, 0.4)' : 'none',
              opacity: isConfirmed && stats.count > 0 ? 1 : 0.5
            }}
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
