import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileCode, 
  Volume2, 
  FileArchive, 
  Star, 
  Play, 
  Pause,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Globe,
  Users,
  CheckSquare,
  Key,
  ShieldCheck
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { MetadataModal } from '../components/MetadataModal';
import { AudarExportModal } from '../components/AudarExportModal';
import { DuplicateManagerModal } from '../components/DuplicateManagerModal';
import { ExportDatasetModal, getSampleGender } from '../components/ExportDatasetModal';
import { MassDeleteModal } from '../components/MassDeleteModal';
import { RatingWidget } from '../components/RatingWidget';
import { PairedFamiliesView } from '../components/paired/PairedFamiliesView';
import { PairedValidationModal } from '../components/paired/PairedValidationModal';
import { PairedExportModal } from '../components/paired/PairedExportModal';
import { Sample, EmotionType, SampleRatings } from '../types';
import { deleteSample, updateSample, getZipExportUrl, getAudarZipExportUrl } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterVoice, setFilterVoice] = useState<string>('all');
  const [filterDialect, setFilterDialect] = useState<'all' | 'sorani' | 'badini'>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterKey, setFilterKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  
  const [activeAudioSampleId, setActiveAudioSampleId] = useState<string | null>(null);
  const [inspectingSample, setInspectingSample] = useState<Sample | null>(null);
  const [showAudarModal, setShowAudarModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMassDeleteModal, setShowMassDeleteModal] = useState(false);
  const [showPairedValidateModal, setShowPairedValidateModal] = useState(false);
  const [showPairedExportModal, setShowPairedExportModal] = useState(false);
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'families'>('cards');

  const pageTopRef = useRef<HTMLDivElement | null>(null);

  const prevIdsRef = useRef<Set<string>>(new Set(samples.map(s => s.id)));
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  // Detect newly added samples from live updates to trigger glow/pop animations
  useEffect(() => {
    const currentIds = new Set(samples.map(s => s.id));
    const newItems = samples.filter(s => !prevIdsRef.current.has(s.id));

    if (newItems.length > 0 && prevIdsRef.current.size > 0) {
      const newIdSet = new Set(newItems.map(s => s.id));
      setRecentlyAddedIds(curr => new Set([...curr, ...newIdSet]));

      // Auto-clear highlight after 6 seconds
      setTimeout(() => {
        setRecentlyAddedIds(curr => {
          const next = new Set(curr);
          newIdSet.forEach(id => next.delete(id));
          return next;
        });
      }, 6000);
    }
    prevIdsRef.current = currentIds;
  }, [samples]);

  // Real-time polling listener: refreshes dataset every 2.5s while user views Dataset Manager
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/dataset');
        if (!res.ok) return;
        const data = await res.json();
        const freshList: Sample[] = data.samples || [];

        if (isMounted && freshList.length > 0) {
          const currentIds = new Set(samples.map(s => s.id));
          const hasChanges = freshList.length !== samples.length || freshList.some(s => !currentIds.has(s.id));
          if (hasChanges) {
            onSamplesRefreshed?.(freshList);
          }
        }
      } catch {
        // silent polling catch
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [samples, onSamplesRefreshed]);

  // Helper to extract voice name/identifier consistently
  const getSampleVoice = (s: Sample): string => {
    return (s.voice_name || (s as any).voiceName || s.voice_id || (s as any).voiceId || '').trim();
  };

  // Helper to extract which API key was used for generating the sample
  const getSampleUsedKey = (s: Sample): string => {
    if (!s) return '';
    const direct = s.used_key || (s as any).key_used || (s as any).keyUsed || (s as any).usedKeyMasked;
    if (direct && typeof direct === 'string') return direct.trim();
    
    const extra = (s as any).metadata_extra || (s as any).customMetadata;
    if (extra && typeof extra === 'object') {
      const fromExtra = extra.used_key || extra.key_used || extra.keyUsed || extra.usedKeyMasked;
      if (fromExtra && typeof fromExtra === 'string') return fromExtra.trim();
    }
    return '';
  };

  // Helper to extract all emotions/tags from sample
  const parseSampleEmotions = (s: Sample): string[] => {
    const set = new Set<string>();
    if (s.emotion) {
      const parts = String(s.emotion).split(/[,/]+/).map(e => e.trim().toLowerCase());
      for (const p of parts) {
        if (p) set.add(p);
      }
    }
    if (s.emotion_tag) {
      const rawTags = Array.isArray(s.emotion_tag) ? s.emotion_tag : String(s.emotion_tag).split(/\s+/);
      for (const t of rawTags) {
        const clean = String(t).replace(/[\[\]]/g, '').trim().toLowerCase();
        if (clean) set.add(clean);
      }
    }
    if ((s as any).emotionTag) {
      const rawTags = Array.isArray((s as any).emotionTag) ? (s as any).emotionTag : String((s as any).emotionTag).split(/\s+/);
      for (const t of rawTags) {
        const clean = String(t).replace(/[\[\]]/g, '').trim().toLowerCase();
        if (clean) set.add(clean);
      }
    }
    const detected = (s as any).customMetadata?.detected_tags || (s as any).metadata_extra?.detected_tags;
    if (Array.isArray(detected)) {
      for (const t of detected) {
        const clean = String(t).replace(/[\[\]]/g, '').trim().toLowerCase();
        if (clean) set.add(clean);
      }
    }
    if (set.size > 1 && set.has('neutral')) {
      set.delete('neutral');
    }
    if (set.size === 0) {
      set.add('neutral');
    }
    return Array.from(set);
  };

  const getEmotionBadgeClass = (emotion: string): string => {
    const em = emotion.toLowerCase().trim();
    if (['neutral', 'happy', 'sad', 'angry', 'excited', 'whisper', 'whispering', 'laughing', 'laugh', 'shouting', 'shout', 'sigh', 'crying', 'cry', 'curious', 'custom'].includes(em)) {
      return `emotion-badge-${em}`;
    }
    return 'emotion-badge-custom';
  };

  // Dynamically compute list of distinct voices in dataset with sample counts
  const availableVoices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of samples) {
      const v = getSampleVoice(s);
      if (v) {
        counts.set(v, (counts.get(v) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [samples]);

  // Dynamically compute list of distinct API keys used in dataset with sample counts
  const availableKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of samples) {
      const k = getSampleUsedKey(s);
      if (k) {
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }, [samples]);

  // Reset to page 1 whenever filters, search, or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterVoice, filterDialect, filterEmotion, filterMethod, filterKey, sortBy, pageSize]);

  // Count duplicate transcript groups for the alert badge
  const duplicateGroupCount = useMemo(() => {
    const textCounts = new Map<string, number>();
    for (const s of samples) {
      const t = (s.text || '').trim();
      if (!t) continue;
      textCounts.set(t, (textCounts.get(t) || 0) + 1);
    }
    let groups = 0;
    for (const count of textCounts.values()) {
      if (count > 1) groups++;
    }
    return groups;
  }, [samples]);

  // Filter & Search & Sort Logic
  const filteredAndSortedSamples = useMemo(() => {
    const result = samples.filter((s) => {
      // Text, ID, or Voice match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.id.toLowerCase().includes(q);
        const matchText = (s.text || '').toLowerCase().includes(q);
        const matchClean = (s.cleanText || '').toLowerCase().includes(q);
        const matchVoice = getSampleVoice(s).toLowerCase().includes(q);
        const matchKey = getSampleUsedKey(s).toLowerCase().includes(q);
        if (!matchId && !matchText && !matchClean && !matchVoice && !matchKey) return false;
      }

      // Gender match
      if (filterGender !== 'all') {
        const g = getSampleGender(s);
        if (g !== filterGender) return false;
      }

      // Voice match
      if (filterVoice !== 'all') {
        const v = getSampleVoice(s);
        if (v !== filterVoice) return false;
      }

      // Dialect match
      if (filterDialect !== 'all') {
        const d = String(s.dialect || 'sorani').toLowerCase();
        if (d !== filterDialect) return false;
      }

      // Emotion match (supports multi-tag acted emotions like "angry, shouting, sad")
      if (filterEmotion !== 'all') {
        const target = filterEmotion.toLowerCase().trim();
        const sampleEmotions = parseSampleEmotions(s);
        const matches = sampleEmotions.some(em => {
          if (em === target) return true;
          if ((target === 'laughing' || target === 'laugh') && (em === 'laughing' || em === 'laugh')) return true;
          if ((target === 'whisper' || target === 'whispering') && (em === 'whisper' || em === 'whispering')) return true;
          if ((target === 'shout' || target === 'shouting') && (em === 'shout' || em === 'shouting')) return true;
          if (em.includes(target) || target.includes(em)) return true;
          return false;
        });
        if (!matches) return false;
      }

      // Method match
      if (filterMethod !== 'all' && s.method !== filterMethod) {
        return false;
      }

      // Key match
      if (filterKey !== 'all' && getSampleUsedKey(s) !== filterKey) {
        return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'id_desc') {
        return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === 'id_asc') {
        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      }
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      }
      if (sortBy === 'rating_desc') {
        const rA = a.ratings?.overall || 0;
        const rB = b.ratings?.overall || 0;
        return rB - rA;
      }
      if (sortBy === 'duration_desc') {
        const dA = a.duration_seconds || a.durationSeconds || 0;
        const dB = b.duration_seconds || b.durationSeconds || 0;
        return dB - dA;
      }
      return 0;
    });
  }, [samples, searchQuery, filterGender, filterVoice, filterDialect, filterEmotion, filterMethod, sortBy]);

  // Pagination calculations
  const totalItems = filteredAndSortedSamples.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentPaginatedSamples = useMemo(() => {
    return filteredAndSortedSamples.slice(startIndex, endIndex);
  }, [filteredAndSortedSamples, startIndex, endIndex]);

  const goToPage = (newPage: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(target);
    setActiveAudioSampleId(null);
    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum);
      setJumpPageInput('');
    }
  };

  // Generate page numbers array with ellipsis
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [safeCurrentPage, totalPages]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete sample "${id}" and its WAV/JSON files?`)) {
      return;
    }

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

  const toggleSelectSample = (id: string) => {
    setSelectedSampleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllCurrentPage = () => {
    setSelectedSampleIds((prev) => {
      const next = new Set(prev);
      const allPageSelected = currentPaginatedSamples.length > 0 && currentPaginatedSamples.every((s) => next.has(s.id));
      if (allPageSelected) {
        currentPaginatedSamples.forEach((s) => next.delete(s.id));
      } else {
        currentPaginatedSamples.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedSampleIds(new Set(filteredAndSortedSamples.map((s) => s.id)));
  };

  const clearSelection = () => {
    setSelectedSampleIds(new Set());
  };

  const handleBatchDeleted = (deletedIds: string[]) => {
    if (onBatchDeleted) {
      onBatchDeleted(deletedIds);
    } else {
      for (const id of deletedIds) {
        onSampleDeleted(id);
      }
    }
    setSelectedSampleIds((prev) => {
      const next = new Set(prev);
      for (const id of deletedIds) {
        next.delete(id);
      }
      return next;
    });
  };

  return (
    <div className="dataset-page-root" ref={pageTopRef}>
      {/* Header & ZIP Download */}
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
            onClick={() => setShowExportModal(true)}
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
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary btn-md"
            id="btn-download-audar-canonical-zip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Export full dataset formatted strictly according to Audar Canonical Schema"
          >
            <Sparkles size={17} style={{ color: '#38bdf8' }} />
            <span>Audar Export</span>
          </button>

          {/* Audar Schema & Stats Modal trigger */}
          <button
            onClick={() => setShowAudarModal(true)}
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
            onClick={() => setShowDuplicatesModal(true)}
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
            onClick={() => setShowMassDeleteModal(true)}
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
            {selectedSampleIds.size > 0 && (
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
                {selectedSampleIds.size}
              </span>
            )}
          </button>

          {/* Raw Dataset Export */}
          <button
            onClick={() => setShowExportModal(true)}
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
            onClick={() => setShowPairedValidateModal(true)}
            className="btn btn-secondary btn-sm"
            title="Validate paired emotion dataset rules (same speaker, same text, 6 emotions)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
          >
            <ShieldCheck size={15} />
            <span>Validate Paired</span>
          </button>

          {/* Paired Emotion Dataset Export */}
          <button
            onClick={() => setShowPairedExportModal(true)}
            className="btn btn-primary btn-sm"
            title="Export paired emotion dataset with required schema"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}
          >
            <Download size={15} />
            <span>Paired Export</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Controls Bar */}
      <div className="glass-card filter-card">
        <div className="filter-grid">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-control search-input"
              placeholder="Search Kurdish text, ID (e.g. 022), voice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Gender Filter */}
          <div className="filter-select-group">
            <Users size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as any)}
              title="Filter by Voice Gender"
            >
              <option value="all">All Genders</option>
              <option value="male">Male Voices Only</option>
              <option value="female">Female Voices Only</option>
            </select>
          </div>

          {/* Voice Filter */}
          <div className="filter-select-group">
            <Volume2 size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={filterVoice}
              onChange={(e) => setFilterVoice(e.target.value)}
              title="Filter by Voice"
            >
              <option value="all">All Voices ({samples.length})</option>
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.count})
                </option>
              ))}
            </select>
          </div>

          {/* Dialect Filter */}
          <div className="filter-select-group">
            <Globe size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={filterDialect}
              onChange={(e) => setFilterDialect(e.target.value as any)}
              title="Filter by Kurdish Dialect"
            >
              <option value="all">All Dialects</option>
              <option value="sorani">Sorani (سۆرانی)</option>
              <option value="badini">Badini (بادینی)</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div className="filter-select-group">
            <Filter size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={filterEmotion}
              onChange={(e) => setFilterEmotion(e.target.value)}
            >
              <option value="all">All Emotions</option>
              <option value="neutral">Neutral</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="excited">Excited</option>
              <option value="whisper">Whisper</option>
              <option value="laughing">Laughing / Laugh</option>
              <option value="shouting">Shouting / Shout</option>
              <option value="sigh">Sigh</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Method Filter */}
          <div className="filter-select-group">
            <select
              className="select-control filter-select"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="gemini_api">Gemini API</option>
              <option value="elevenlabs_api">ElevenLabs API</option>
              <option value="elevenlabs_web">Normal Web Workflow</option>
            </select>
          </div>

          {/* Key Filter */}
          {availableKeys.length > 0 && (
            <div className="filter-select-group">
              <Key size={15} className="text-muted" />
              <select
                className="select-control filter-select"
                value={filterKey}
                onChange={(e) => setFilterKey(e.target.value)}
                title="Filter by API Key"
              >
                <option value="all">All Keys ({samples.length})</option>
                {availableKeys.map((k) => (
                  <option key={k.key} value={k.key}>
                    Key: {k.key} ({k.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div className="filter-select-group">
            <ArrowUpDown size={15} className="text-muted" />
            <select
              className="select-control filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              title="Sort dataset items"
            >
              <option value="id_desc">ID: Newest First (999 → 001)</option>
              <option value="id_asc">ID: Oldest First (001 → 999)</option>
              <option value="newest">Created Date: Newest First</option>
              <option value="oldest">Created Date: Oldest First</option>
              <option value="rating_desc">Highest Rated First</option>
              <option value="duration_desc">Longest Duration First</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="filter-select-group">
            <span className="filter-label-text">Per page:</span>
            <select
              className="select-control filter-select-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              title="Samples to display per page"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
            >
              Cards
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table List View"
            >
              Table
            </button>
            <button
              className={`view-btn ${viewMode === 'families' ? 'active' : ''}`}
              onClick={() => setViewMode('families')}
              title="Paired Emotion Families View"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Layers size={13} />
              <span>Families</span>
            </button>
          </div>
        </div>

        {/* Top Status & Quick Navigation */}
        <div className="filter-stats-bar">
          <div className="stats-left" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="stats-count">
              Showing <strong>{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong>{totalItems}</strong> samples
              {totalItems !== samples.length && (
                <span className="stats-filtered-tag"> (filtered from {samples.length} total)</span>
              )}
            </span>
            {filterVoice !== 'all' && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setFilterVoice('all')}
                style={{ 
                  fontSize: '0.74rem', 
                  color: '#38BDF8', 
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Click to clear voice filter"
              >
                <span>Voice: <strong>{filterVoice}</strong></span>
                <span style={{ fontWeight: 700, marginLeft: '2px' }}>✕</span>
              </button>
            )}
            {filterKey !== 'all' && (
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => setFilterKey('all')}
                style={{ 
                  fontSize: '0.74rem', 
                  color: '#c084fc', 
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Click to clear key filter"
              >
                <Key size={11} />
                <span>Key: <strong>{filterKey}</strong></span>
                <span style={{ fontWeight: 700, marginLeft: '2px' }}>✕</span>
              </button>
            )}
            <span className="page-indicator-pill">
              Page <strong>{safeCurrentPage}</strong> of <strong>{totalPages}</strong>
            </span>
          </div>

          {totalPages > 1 && (
            <div className="top-pager-controls">
              <button
                className="pager-btn-sm"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage <= 1}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button
                className="pager-btn-sm"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage >= totalPages}
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Batch Selection Banner */}
      {selectedSampleIds.size > 0 && (
        <div 
          className="glass-card selection-action-banner" 
          style={{ 
            padding: '12px 20px', 
            background: 'rgba(239, 68, 68, 0.09)', 
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderRadius: 'var(--radius-md)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Trash2 size={16} />
              <span>{selectedSampleIds.size} sample{selectedSampleIds.size === 1 ? '' : 's'} selected</span>
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={selectAllCurrentPage}
              style={{ fontSize: '0.76rem', color: '#94a3b8', textDecoration: 'underline' }}
            >
              Toggle This Page ({currentPaginatedSamples.length})
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={selectAllFiltered}
              style={{ fontSize: '0.76rem', color: '#38bdf8', textDecoration: 'underline' }}
            >
              Select All Filtered ({filteredAndSortedSamples.length})
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={clearSelection}
              style={{ fontSize: '0.76rem', color: '#cbd5e1' }}
            >
              Deselect All
            </button>
          </div>

          <button
            onClick={() => setShowMassDeleteModal(true)}
            className="btn btn-danger btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <Trash2 size={14} />
            <span>Mass Delete Selected ({selectedSampleIds.size})</span>
          </button>
        </div>
      )}

      {/* Dataset List / Grid */}
      {viewMode === 'families' ? (
        <PairedFamiliesView samples={samples} recentSampleIds={recentlyAddedIds} isLiveSyncActive={true} />
      ) : totalItems === 0 ? (
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
        <div className="samples-card-grid">
          {currentPaginatedSamples.map((sample) => (
            <div key={sample.id} className="glass-card sample-item-card" style={{ borderColor: selectedSampleIds.has(sample.id) ? 'rgba(239, 68, 68, 0.5)' : undefined }}>
              <div className="sample-card-header">
                <div className="sample-id-badge-group" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedSampleIds.has(sample.id)}
                    onChange={() => toggleSelectSample(sample.id)}
                    style={{ 
                      cursor: 'pointer', 
                      accentColor: '#ef4444', 
                      width: '16px', 
                      height: '16px',
                      borderRadius: '3px'
                    }}
                    title={selectedSampleIds.has(sample.id) ? 'Deselect sample' : 'Select sample for mass delete'}
                  />
                  <span className="sample-id-pill">#{sample.id}</span>
                  {parseSampleEmotions(sample).map((em, idx) => (
                    <span key={idx} className={`badge ${getEmotionBadgeClass(em)}`}>
                      {em.toUpperCase()}
                    </span>
                  ))}
                  <span className={`badge ${
                    sample.method === 'gemini_api' 
                      ? 'badge-purple' 
                      : sample.method === 'elevenlabs_api' 
                        ? 'badge-cyan' 
                        : 'badge-emerald'
                  }`}>
                    {sample.method === 'gemini_api' ? 'Gemini' : sample.method === 'elevenlabs_api' ? 'ElevenLabs' : 'Web'}
                  </span>
                  {getSampleUsedKey(sample) && (
                    <span 
                      className="badge badge-key"
                      style={{
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: '#c084fc',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.72rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 7px'
                      }}
                      title={`API Key: ${getSampleUsedKey(sample)}`}
                    >
                      <Key size={11} style={{ opacity: 0.9 }} />
                      <span>{getSampleUsedKey(sample)}</span>
                    </span>
                  )}
                </div>

                <div className="sample-card-actions">
                  <button
                    className="aux-btn"
                    onClick={() => setInspectingSample(sample)}
                    title="Inspect & Edit Metadata JSON"
                  >
                    <FileCode size={13} />
                    <span>JSON</span>
                  </button>
                  <button
                    className="aux-btn btn-danger"
                    onClick={() => handleDelete(sample.id)}
                    title="Delete Sample"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Kurdish Text Box */}
              <div className="sample-kurdish-box">
                <div className="kurdish-text sample-kurdish-text" dir="rtl">
                  {sample.text}
                </div>
              </div>

              {/* Meta details */}
              <div className="sample-details-row">
                <div className="detail-item">
                  <span className="detail-label">Voice:</span>
                  <span className="detail-val">{sample.voice_name || sample.voice_id || 'TTS Voice'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Model:</span>
                  <span className="detail-val">{sample.model_id || 'Preview'}</span>
                </div>
                {getSampleUsedKey(sample) && (
                  <div className="detail-item" title={`API Key: ${getSampleUsedKey(sample)}`}>
                    <span className="detail-label">Key:</span>
                    <span 
                      className="detail-val"
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        color: '#c084fc',
                        fontSize: '0.76rem',
                        fontWeight: 600
                      }}
                    >
                      {getSampleUsedKey(sample)}
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Player (Lazy-loaded with initialDuration) */}
              <div className="sample-audio-wrap">
                <AudioPlayer
                  src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                  sampleId={sample.id}
                  showDownload={true}
                  initialDuration={sample.duration_seconds || sample.durationSeconds}
                />
              </div>

              {/* Ratings */}
              <div className="sample-rating-wrap">
                <RatingWidget
                  ratings={sample.ratings}
                  onSaveRatings={(ratings) => handleRatingChange(sample.id, ratings)}
                  compact={true}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card table-view-card">
          <div className="dataset-table-container">
            <table className="dataset-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox"
                      checked={currentPaginatedSamples.length > 0 && currentPaginatedSamples.every((s) => selectedSampleIds.has(s.id))}
                      onChange={selectAllCurrentPage}
                      title="Select / Deselect all on current page"
                      style={{ cursor: 'pointer', accentColor: '#ef4444', width: '15px', height: '15px' }}
                    />
                  </th>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Kurdish Transcript (RTL)</th>
                  <th style={{ width: '100px' }}>Emotion</th>
                  <th style={{ width: '100px' }}>Method</th>
                  <th style={{ width: '160px' }}>Voice / Model</th>
                  <th style={{ minWidth: '260px' }}>Audio Playback</th>
                  <th style={{ width: '140px' }}>Rating</th>
                  <th style={{ width: '100px' }}>Date</th>
                  <th style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPaginatedSamples.map((sample) => (
                  <tr key={sample.id} style={{ background: selectedSampleIds.has(sample.id) ? 'rgba(239, 68, 68, 0.08)' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedSampleIds.has(sample.id)}
                        onChange={() => toggleSelectSample(sample.id)}
                        style={{ cursor: 'pointer', accentColor: '#ef4444', width: '15px', height: '15px' }}
                        title="Select sample"
                      />
                    </td>
                    <td>
                      <span className="sample-id-pill">#{sample.id}</span>
                    </td>
                    <td className="kurdish-table-cell" dir="rtl">
                      {sample.text}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {parseSampleEmotions(sample).map((em, idx) => (
                          <span key={idx} className={`badge ${getEmotionBadgeClass(em)}`}>
                            {em}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        sample.method === 'gemini_api' 
                          ? 'badge-purple' 
                          : sample.method === 'elevenlabs_api' 
                            ? 'badge-cyan' 
                            : 'badge-emerald'
                      }`}>
                        {sample.method === 'gemini_api' ? 'Gemini' : sample.method === 'elevenlabs_api' ? 'ElevenLabs' : 'Web'}
                      </span>
                      {getSampleUsedKey(sample) && (
                        <div style={{ marginTop: '5px' }}>
                          <span 
                            className="badge badge-key"
                            style={{ 
                              background: 'rgba(168, 85, 247, 0.15)', 
                              color: '#c084fc', 
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              fontSize: '10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '1px 5px'
                            }}
                            title={`API Key: ${getSampleUsedKey(sample)}`}
                          >
                            <Key size={10} />
                            {getSampleUsedKey(sample)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="voice-cell">
                      <div className="voice-name">{sample.voice_name || sample.voice_id || 'Voice'}</div>
                      <div className="model-name">{sample.model_id || 'v2'}</div>
                    </td>
                    <td style={{ minWidth: 260 }}>
                      <AudioPlayer
                        src={sample.audioUrl || `/api/dataset/${sample.id}/audio`}
                        sampleId={sample.id}
                        showDownload={false}
                        initialDuration={sample.duration_seconds || sample.durationSeconds}
                      />
                    </td>
                    <td>
                      <RatingWidget
                        ratings={sample.ratings}
                        onSaveRatings={(ratings) => handleRatingChange(sample.id, ratings)}
                        compact={true}
                      />
                    </td>
                    <td className="date-cell">
                      {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="aux-btn"
                          onClick={() => setInspectingSample(sample)}
                          title="Inspect Metadata"
                        >
                          <FileCode size={13} />
                        </button>
                        <a
                          href={`/api/dataset/${sample.id}/download/wav`}
                          download={`${sample.id}.wav`}
                          className="aux-btn"
                          title="Download WAV"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          className="aux-btn btn-danger"
                          onClick={() => handleDelete(sample.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Pagination Bar */}
      {totalPages > 1 && (
        <div className="glass-card pagination-bottom-card">
          <div className="pagination-left">
            <span className="pagination-summary">
              Showing <strong>{startIndex + 1} - {endIndex}</strong> of <strong>{totalItems}</strong> samples
            </span>
          </div>

          <div className="pagination-center">
            {/* First Page */}
            <button
              className="pagination-btn"
              onClick={() => goToPage(1)}
              disabled={safeCurrentPage <= 1}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous Page */}
            <button
              className="pagination-btn"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
              <span className="btn-text-desktop">Prev</span>
            </button>

            {/* Numbered Page Pills */}
            <div className="pagination-pages-list">
              {pageNumbers.map((num, idx) => {
                if (num === '...') {
                  return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>;
                }
                const pageNumber = num as number;
                const isActive = pageNumber === safeCurrentPage;
                return (
                  <button
                    key={`page-${pageNumber}`}
                    className={`pagination-num-btn ${isActive ? 'active' : ''}`}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              className="pagination-btn"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              title="Next Page"
            >
              <span className="btn-text-desktop">Next</span>
              <ChevronRight size={16} />
            </button>

            {/* Last Page */}
            <button
              className="pagination-btn"
              onClick={() => goToPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          {/* Jump to Page Form */}
          <form className="pagination-right" onSubmit={handleJumpSubmit}>
            <span className="jump-label">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="input-control jump-input"
              placeholder={`${safeCurrentPage}`}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
            />
            <button type="submit" className="jump-submit-btn">Go</button>
          </form>
        </div>
      )}

      {/* Metadata Inspection Modal */}
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

      {/* Filtered Dataset Export Modal */}
      <ExportDatasetModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        samples={samples}
        currentFilteredSamples={filteredAndSortedSamples}
        availableVoices={availableVoices}
        addToast={addToast}
      />

      {/* Audar Canonical Export Modal */}
      <AudarExportModal
        isOpen={showAudarModal}
        onClose={() => setShowAudarModal(false)}
      />

      {/* Dataset Duplicates Cleaner Modal */}
      <DuplicateManagerModal
        isOpen={showDuplicatesModal}
        onClose={() => setShowDuplicatesModal(false)}
        samples={samples}
        onSampleDeleted={onSampleDeleted}
        onBatchDeleted={handleBatchDeleted}
        addToast={addToast}
      />

      {/* Mass Delete Modal */}
      <MassDeleteModal
        isOpen={showMassDeleteModal}
        onClose={() => setShowMassDeleteModal(false)}
        samples={samples}
        currentFilteredSamples={filteredAndSortedSamples}
        availableVoices={availableVoices}
        selectedSampleIds={selectedSampleIds}
        onBatchDeleted={handleBatchDeleted}
        addToast={addToast}
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

      <style>{`
        .dataset-page-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dataset-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filter-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-grid {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }

        .search-input {
          padding-left: 36px;
        }

        .filter-select-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-label-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .filter-select {
          min-width: 150px;
        }

        .filter-select-sm {
          width: 70px;
          padding: 6px 8px;
        }

        .view-mode-toggle {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 2px;
        }

        .view-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .view-btn.active {
          background: #0284C7;
          color: #fff;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.4);
        }

        .filter-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 10px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .stats-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .stats-filtered-tag {
          color: #FBBF24;
          font-size: 0.76rem;
        }

        .page-indicator-pill {
          background: rgba(56, 189, 248, 0.12);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-family: var(--font-mono);
        }

        .top-pager-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pager-btn-sm {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          border-radius: var(--radius-sm);
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pager-btn-sm:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38BDF8;
        }

        .pager-btn-sm:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .samples-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }

        .sample-item-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sample-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sample-id-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .sample-id-pill {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .sample-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sample-kurdish-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          min-height: 70px;
          display: flex;
          align-items: center;
        }

        .sample-kurdish-text {
          font-size: 1.15rem;
          color: #FFFFFF;
          line-height: 1.7;
          width: 100%;
        }

        .sample-details-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.76rem;
          color: var(--text-dim);
          border-top: 1px solid var(--border-subtle);
          padding-top: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .detail-val {
          color: var(--text-main);
          font-weight: 500;
        }

        .empty-dataset-state {
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .dataset-table-container {
          overflow-x: auto;
        }

        .dataset-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .dataset-table th {
          padding: 12px 14px;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border-medium);
          background: rgba(15, 23, 42, 0.6);
        }

        .dataset-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-main);
        }

        .dataset-table tr:hover td {
          background: rgba(56, 189, 248, 0.05);
        }

        .kurdish-table-cell {
          font-family: var(--font-kurdish);
          font-size: 1.1rem;
          max-width: 280px;
          line-height: 1.6;
        }

        .voice-cell .voice-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .voice-cell .model-name {
          font-size: 0.72rem;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }

        .date-cell {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .table-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Bottom Pagination Bar */
        .pagination-bottom-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .pagination-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pagination-summary {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .pagination-center {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-pages-list {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-btn {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.5);
          color: #38BDF8;
        }

        .pagination-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .pagination-num-btn {
          min-width: 34px;
          height: 34px;
          padding: 0 6px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-family: var(--font-mono);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .pagination-num-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main);
          border-color: var(--border-medium);
        }

        .pagination-num-btn.active {
          background: linear-gradient(135deg, #0284C7, #0369A1);
          border-color: #38BDF8;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
          font-weight: 700;
        }

        .pagination-ellipsis {
          color: var(--text-dim);
          padding: 0 4px;
          font-size: 0.9rem;
          user-select: none;
        }

        .pagination-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .jump-label {
          font-size: 0.78rem;
          color: var(--text-dim);
        }

        .jump-input {
          width: 58px;
          padding: 5px 8px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }

        .jump-submit-btn {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38BDF8;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .jump-submit-btn:hover {
          background: #0284C7;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .btn-text-desktop {
            display: none;
          }
          .pagination-bottom-card {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .pagination-left,
          .pagination-right {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
