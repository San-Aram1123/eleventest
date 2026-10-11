import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowUpDown, Layers } from 'lucide-react';
import { Sample } from '../../types';
import { ExpressiveDatasetFamilyCard, ExpressiveDatasetFamilyGroup } from './ExpressiveDatasetFamilyCard';
import { parseDateSafe, getTimeZone } from '../paired/FamilyCard';
import { FamiliesPaginationBar } from './FamiliesPaginationBar';
import { ExpressiveEmotionFilterBar } from './ExpressiveEmotionFilterBar';
import { parseUniversalEmotions, matchesEmotionFilter } from '../../utils/expressiveEmotionUtils';

interface ExpressiveDatasetFamiliesViewProps {
  samples: Sample[];
  recentSampleIds?: Set<string>;
  isLiveSyncActive?: boolean;
}

export const ExpressiveDatasetFamiliesView: React.FC<ExpressiveDatasetFamiliesViewProps> = ({
  samples,
  recentSampleIds,
  isLiveSyncActive = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'id_desc' | 'id_asc'>('newest');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const [timeZone] = useState<string>(() => getTimeZone());
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleEmotion = (id: string) => {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, selectedEmotions, matchMode, pageSize]);

  const handlePlayAudio = (sample: Sample) => {
    if (audioRef.current) audioRef.current.pause();

    if (playingClipId === sample.id) {
      setPlayingClipId(null);
      return;
    }

    const audioUrl = sample.audioUrl || `/api/dataset/${sample.id}/audio`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingClipId(sample.id);

    audio.play().catch(e => console.error('Audio play error:', e));
    audio.onended = () => setPlayingClipId(null);
    audio.onerror = () => setPlayingClipId(null);
  };

  const parseTime = (dateVal?: string | number | null): number => {
    const d = parseDateSafe(dateVal);
    return d ? d.getTime() : 0;
  };

  // Group samples into expressive families
  const families = useMemo(() => {
    const map = new Map<string, ExpressiveDatasetFamilyGroup>();

    for (const s of samples) {
      let fId = s.family_id || (s as any).customMetadata?.family_id || (s as any).metadata_extra?.family_id;
      if (!fId && typeof s.id === 'string') {
        const match = s.id.match(/^(.+_\d{3,4})_[a-zA-Z0-9_]+$/);
        if (match) fId = match[1];
      }
      if (!fId) continue;

      if (!map.has(fId)) {
        map.set(fId, {
          familyId: fId,
          speaker: s.speaker_name || (s as any).customMetadata?.speaker_name || s.voice_name || 'spk01',
          text: s.text || '',
          dialect: s.dialect || 'sorani',
          language: s.language || (s as any).customMetadata?.language || (s.dialect === 'badini' ? 'kmr' : 'ckb'),
          gender: (s as any).gender || (s as any).voice_gender || (s as any).customMetadata?.gender || undefined,
          takes: [],
          latestTimestamp: 0,
          latestCreatedAt: null
        });
      }

      const fam = map.get(fId)!;
      fam.takes.push(s);

      const rawDate = s.created_at || (s as any).customMetadata?.created_at || (s as any).metadata_extra?.created_at;
      const t = parseTime(rawDate);
      if (t > (fam.latestTimestamp || 0)) {
        fam.latestTimestamp = t;
        fam.latestCreatedAt = rawDate || new Date(t).toISOString();
      }
    }

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      const timeA = a.latestTimestamp || 0;
      const timeB = b.latestTimestamp || 0;

      if (sortOrder === 'newest') return timeB !== timeA ? timeB - timeA : b.familyId.localeCompare(a.familyId, undefined, { numeric: true });
      if (sortOrder === 'oldest') return timeA !== timeB ? timeA - timeB : a.familyId.localeCompare(b.familyId, undefined, { numeric: true });
      if (sortOrder === 'id_desc') return b.familyId.localeCompare(a.familyId, undefined, { numeric: true });
      return a.familyId.localeCompare(b.familyId, undefined, { numeric: true });
    });
  }, [samples, sortOrder]);

  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesMain = f.familyId.toLowerCase().includes(term) ||
          f.text.toLowerCase().includes(term) ||
          f.speaker.toLowerCase().includes(term);
        const matchesTake = f.takes.some(t => {
          const cond = (t as any).customMetadata?.condition_id || t.emotion || '';
          return t.id.toLowerCase().includes(term) || cond.toLowerCase().includes(term);
        });
        if (!matchesMain && !matchesTake) return false;
      }

      if (selectedEmotions.length > 0) {
        const hasMatchingTake = f.takes.some(t => {
          const tags = parseUniversalEmotions(t);
          return matchesEmotionFilter(tags, selectedEmotions, matchMode);
        });
        if (!hasMatchingTake) return false;
      }

      return true;
    });
  }, [families, searchTerm, selectedEmotions, matchMode]);

  const totalTakesCount = filteredFamilies.reduce((sum, f) => sum + f.takes.length, 0);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedFamilies = filteredFamilies.slice(startIndex, startIndex + pageSize);

  return (
    <div className="paired-families-container" style={{ padding: '0.5rem 0' }}>
      {/* Top Filter Bar */}
      <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} className="text-muted" />
          <input
            type="text"
            className="input-field"
            placeholder="Search expressive families by text, ID, or condition..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.45rem 0.75rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} className="text-muted" />
            <select
              className="select-field"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="id_desc">Family ID (Z-A)</option>
              <option value="id_asc">Family ID (A-Z)</option>
            </select>
          </div>

          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#C084FC', fontWeight: 600 }}>
            {filteredFamilies.length} Families • {totalTakesCount} Takes
          </span>
        </div>
      </div>

      {/* Multi-Emotion Filter Bar */}
      <ExpressiveEmotionFilterBar
        selectedEmotions={selectedEmotions}
        onToggleEmotion={handleToggleEmotion}
        onClearEmotions={() => setSelectedEmotions([])}
        matchMode={matchMode}
        onChangeMatchMode={setMatchMode}
        totalCount={families.length}
        filteredCount={filteredFamilies.length}
      />

      {/* Families List */}
      {filteredFamilies.length === 0 ? (
        <div className="glass-card empty-dataset-state" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <Layers size={40} className="text-dim" style={{ margin: '0 auto 1rem auto' }} />
          <div className="empty-title">No Expressive Families Found</div>
          <p className="empty-sub">
            {samples.length === 0
              ? 'No samples available in the dataset. Generate samples using the Expressive Studio or Paired Studio!'
              : 'No families matched your current filters or search criteria.'}
          </p>
        </div>
      ) : (
        <>
          {paginatedFamilies.map(f => (
            <ExpressiveDatasetFamilyCard
              key={f.familyId}
              family={f}
              playingClipId={playingClipId}
              recentSampleIds={recentSampleIds}
              timeZone={timeZone}
              onPlay={handlePlayAudio}
              filterEmotions={selectedEmotions}
              matchMode={matchMode}
            />
          ))}

          {/* Page by Page Navigation Bar */}
          <FamiliesPaginationBar
            currentPage={safePage}
            totalItems={filteredFamilies.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 5, 10, 20]}
            itemName="families"
            extraSummary={
              <span style={{ color: '#C084FC', fontSize: '0.75rem' }}>
                • {totalTakesCount} takes
              </span>
            }
          />
        </>
      )}
    </div>
  );
};
