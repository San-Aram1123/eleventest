import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Volume2, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Filter,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Sample } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { deleteSample, batchDeleteSamples } from '../services/api';

interface DuplicateGroup {
  normalizedKey: string;
  originalText: string;
  samples: Sample[];
}

interface DuplicateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: Sample[];
  onSampleDeleted: (id: string) => void;
  onBatchDeleted?: (ids: string[]) => void;
  addToast: (toast: { type: 'success' | 'error' | 'info'; title: string; message?: string }) => void;
}

/**
 * Normalizes Kurdish text for robust comparison.
 * Strips bracketed tags, zero-width characters, punctuation, and extra whitespace.
 */
function normalizeKurdishText(t: string): string {
  if (!t) return '';
  return t
    .replace(/\[([a-zA-Z0-9_\s-]+)\]/g, '') // remove inline tags like [laugh]
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width characters
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟،!?:"]/g, '') // punctuation
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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

  // Group samples by selected match mode
  const duplicateGroups = useMemo(() => {
    const map = new Map<string, { originalText: string; samples: Sample[] }>();

    for (const sample of samples) {
      const key = matchMode === 'exact' 
        ? (sample.text || '').trim()
        : normalizeKurdishText(sample.cleanText || sample.text || '');

      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, { originalText: sample.text, samples: [] });
      }
      map.get(key)!.samples.push(sample);
    }

    const groups: DuplicateGroup[] = [];
    for (const [key, val] of map.entries()) {
      if (val.samples.length > 1) {
        // Sort samples descending by creation date (newest first)
        const sorted = [...val.samples].sort((a, b) => {
          const tA = new Date(a.created_at || 0).getTime();
          const tB = new Date(b.created_at || 0).getTime();
          return tB - tA;
        });

        groups.push({
          normalizedKey: key,
          originalText: val.originalText,
          samples: sorted
        });
      }
    }

    // Filter by user search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return groups.filter(g => 
        g.originalText.toLowerCase().includes(q) ||
        g.samples.some(s => s.id.toLowerCase().includes(q) || (s.voice_name || '').toLowerCase().includes(q))
      );
    }

    return groups;
  }, [samples, matchMode, searchQuery]);

  // Overall duplicate metrics
  const totalDuplicateSamples = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + g.samples.length, 0);
  }, [duplicateGroups]);

  const redundantCount = useMemo(() => {
    return duplicateGroups.reduce((acc, g) => acc + (g.samples.length - 1), 0);
  }, [duplicateGroups]);

  if (!isOpen) return null;

  // Single sample delete handler
  const handleDeleteSingle = async (sampleId: string) => {
    if (isDeletingId) return;
    if (!window.confirm(`Delete sample #${sampleId} and its audio file from dataset & MySQL?`)) {
      return;
    }

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
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete sample.'
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Keep one take, delete other duplicates in that group
  const handleKeepOnlyOne = async (keepSampleId: string, group: DuplicateGroup) => {
    const idsToDelete = group.samples
      .filter(s => s.id !== keepSampleId)
      .map(s => s.id);

    if (idsToDelete.length === 0) return;

    if (!window.confirm(`Keep #${keepSampleId} and permanently delete the other ${idsToDelete.length} take(s) (${idsToDelete.join(', ')})?`)) {
      return;
    }

    setIsBatchOperating(true);
    try {
      await batchDeleteSamples(idsToDelete);
      for (const id of idsToDelete) {
        onSampleDeleted(id);
      }
      if (onBatchDeleted) onBatchDeleted(idsToDelete);

      addToast({
        type: 'success',
        title: 'Duplicates Cleaned',
        message: `Kept #${keepSampleId}. Deleted ${idsToDelete.length} redundant take(s).`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Batch Delete Error',
        message: err.message || 'Failed to clean duplicates.'
      });
    } finally {
      setIsBatchOperating(false);
    }
  };

  // Bulk Auto-Clean: Keep Newest (or Oldest)
  const handleAutoCleanAll = async (keepPolicy: 'newest' | 'oldest') => {
    if (duplicateGroups.length === 0) return;

    const idsToDelete: string[] = [];
    for (const group of duplicateGroups) {
      const keepIndex = keepPolicy === 'newest' ? 0 : group.samples.length - 1;
      const keepId = group.samples[keepIndex].id;

      for (let i = 0; i < group.samples.length; i++) {
        if (i !== keepIndex) {
          idsToDelete.push(group.samples[i].id);
        }
      }
    }

    if (idsToDelete.length === 0) return;

    const policyName = keepPolicy === 'newest' ? 'NEWEST take' : 'OLDEST take';
    if (!window.confirm(`Are you sure you want to Auto-Clean ALL duplicate groups?\n\nThis will keep the ${policyName} of each sentence and delete ${idsToDelete.length} redundant audio samples from disk and MySQL.`)) {
      return;
    }

    setIsBatchOperating(true);
    try {
      await batchDeleteSamples(idsToDelete);
      for (const id of idsToDelete) {
        onSampleDeleted(id);
      }
      if (onBatchDeleted) onBatchDeleted(idsToDelete);

      addToast({
        type: 'success',
        title: 'Auto-Clean Completed!',
        message: `Successfully pruned ${idsToDelete.length} redundant duplicate samples. Kept the ${policyName}s.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Auto-Clean Failed',
        message: err.message || 'Failed to execute auto-clean.'
      });
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
        {/* Modal Header */}
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

          <button 
            className="btn-close-modal" 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter / Mode Bar */}
        <div 
          style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(15, 23, 42, 0.5)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Match Mode Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>
              Matching Mode:
            </span>
            <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.4)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setMatchMode('exact')}
                style={{
                  background: matchMode === 'exact' ? '#38BDF8' : 'transparent',
                  color: matchMode === 'exact' ? '#0F172A' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Exact Text
              </button>
              <button
                onClick={() => setMatchMode('normalized')}
                title="Strips [laugh] emotion tags, ZWNJ, and punctuation for deep match"
                style={{
                  background: matchMode === 'normalized' ? '#38BDF8' : 'transparent',
                  color: matchMode === 'normalized' ? '#0F172A' : '#94A3B8',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Smart Normalized
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 200px', maxWidth: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search duplicates by text or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 10px 6px 30px',
                color: '#F8FAFC',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Quick Stats & Bulk Actions Bar */}
        {duplicateGroups.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: '0.85rem', color: '#F8FAFC', fontWeight: 600 }}>
                  {duplicateGroups.length} Duplicate Group{duplicateGroups.length === 1 ? '' : 's'}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  ({totalDuplicateSamples} total takes, <strong style={{ color: '#F59E0B' }}>{redundantCount}</strong> redundant)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAutoCleanAll('newest')}
                disabled={isBatchOperating}
                className="btn btn-sm"
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38BDF8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  cursor: isBatchOperating ? 'not-allowed' : 'pointer'
                }}
                title="Keep the latest generated take of every sentence and delete older ones"
              >
                <Sparkles size={14} />
                <span>Auto-Clean: Keep Newest</span>
              </button>

              <button
                onClick={() => handleAutoCleanAll('oldest')}
                disabled={isBatchOperating}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#CBD5E1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  cursor: isBatchOperating ? 'not-allowed' : 'pointer'
                }}
                title="Keep the original first take of every sentence and delete retakes"
              >
                <RotateCcw size={13} />
                <span>Keep Oldest</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div 
          className="modal-body" 
          style={{ 
            padding: '1.25rem', 
            overflowY: 'auto', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem' 
          }}
        >
          {duplicateGroups.length === 0 ? (
            /* Clean Empty State */
            <div 
              style={{ 
                padding: '3.5rem 1.5rem', 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  marginBottom: '1rem'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.35rem' }}>
                No Duplicates Found!
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '420px', lineHeight: 1.5 }}>
                {searchQuery 
                  ? 'No duplicate sentences matched your search query.' 
                  : 'Every Kurdish transcript in your dataset is unique. There are no duplicate audio records.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            /* List of Duplicate Groups */
            duplicateGroups.map((group, groupIdx) => {
              const takesCount = group.samples.length;
              return (
                <div
                  key={group.normalizedKey || groupIdx}
                  style={{
                    background: 'rgba(18, 24, 38, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '1rem 1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Group Header with Kurdish Text */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: '12px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingBottom: '10px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span 
                          className="badge" 
                          style={{ 
                            background: 'rgba(245, 158, 11, 0.2)', 
                            color: '#FBBF24', 
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px'
                          }}
                        >
                          {takesCount} Audio Takes
                        </span>

                        <button
                          onClick={() => copyText(group.originalText, group.normalizedKey)}
                          title="Copy Kurdish text"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedTextKey === group.normalizedKey ? '#10B981' : '#64748B',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {copiedTextKey === group.normalizedKey ? (
                            <>
                              <Check size={12} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Kurdish Text in large RTL */}
                      <div 
                        dir="rtl" 
                        style={{ 
                          fontFamily: 'Noto Sans Arabic, Vazirmatn, sans-serif',
                          fontSize: '1.05rem', 
                          lineHeight: 1.7, 
                          color: '#F1F5F9',
                          fontWeight: 500 
                        }}
                      >
                        {group.originalText}
                      </div>
                    </div>
                  </div>

                  {/* Audio Takes List for this Sentence */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.samples.map((sample, sIdx) => {
                      const isNewest = sIdx === 0;
                      const isOldest = sIdx === group.samples.length - 1;
                      const createdDate = sample.created_at ? new Date(sample.created_at) : null;
                      const formattedTime = createdDate 
                        ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '';
                      const formattedDate = createdDate 
                        ? createdDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : '';

                      return (
                        <div
                          key={sample.id}
                          style={{
                            background: isNewest 
                              ? 'rgba(56, 189, 248, 0.05)' 
                              : 'rgba(15, 23, 42, 0.4)',
                            border: isNewest 
                              ? '1px solid rgba(56, 189, 248, 0.25)' 
                              : '1px solid rgba(255, 255, 255, 0.07)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          {/* Sample Info Left */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
                            <span 
                              style={{ 
                                fontFamily: 'JetBrains Mono, monospace', 
                                fontWeight: 700, 
                                fontSize: '0.85rem',
                                color: isNewest ? '#38BDF8' : '#CBD5E1',
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              #{sample.id}
                            </span>

                            {isNewest && (
                              <span 
                                style={{ 
                                  fontSize: '0.68rem', 
                                  fontWeight: 700, 
                                  color: '#38BDF8', 
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(56, 189, 248, 0.3)'
                                }}
                              >
                                LATEST TAKE
                              </span>
                            )}

                            {isOldest && takesCount > 2 && (
                              <span 
                                style={{ 
                                  fontSize: '0.68rem', 
                                  fontWeight: 700, 
                                  color: '#94A3B8', 
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                FIRST TAKE
                              </span>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div style={{ fontSize: '0.8rem', color: '#E2E8F0', fontWeight: 600 }}>
                                {sample.voice_name || sample.voice_id || 'Gemini'} 
                                <span style={{ color: '#64748B', fontWeight: 400, marginLeft: '6px', fontSize: '0.75rem' }}>
                                  ({sample.model_id || 'Flash TTS'})
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>{formattedDate} {formattedTime}</span>
                                {(sample.duration_seconds || sample.durationSeconds) ? (
                                  <span>• {sample.duration_seconds || sample.durationSeconds}s</span>
                                ) : null}
                                {sample.audio_size ? (
                                  <span>• {(sample.audio_size / 1024).toFixed(0)} KB</span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Inline Audio Player Center */}
                          <div style={{ flex: '1 1 240px', maxWidth: '300px' }}>
                            <AudioPlayer
                              src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                              sampleId={sample.id}
                              showDownload={false}
                            />
                          </div>

                          {/* Action Buttons Right */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Keep This One button */}
                            <button
                              onClick={() => handleKeepOnlyOne(sample.id, group)}
                              disabled={isDeletingId === sample.id || isBatchOperating}
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                color: '#34D399',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '5px 9px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                              }}
                              title={`Keep #${sample.id} and delete the other take(s)`}
                            >
                              <Check size={13} />
                              <span>Keep This</span>
                            </button>

                            {/* Delete single sample button */}
                            <button
                              onClick={() => handleDeleteSingle(sample.id)}
                              disabled={isDeletingId === sample.id || isBatchOperating}
                              className="btn btn-danger btn-sm"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem'
                              }}
                              title={`Delete sample #${sample.id}`}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div 
          style={{ 
            padding: '0.85rem 1.25rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.6)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Deleting a sample permanently removes its `.json` and `.wav` files and synchronizes with MySQL.
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
