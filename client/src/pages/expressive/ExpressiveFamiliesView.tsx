import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Search, Filter, Trash2 } from 'lucide-react';
import { ExpressiveFamily } from './expressiveFamilyTypes';
import { ExpressiveTake } from './expressiveConstants';
import { ExpressiveFamilyCard } from './ExpressiveFamilyCard';
import { FamiliesPaginationBar } from '../../components/expressive/FamiliesPaginationBar';
import { ExpressiveEmotionFilterBar } from '../../components/expressive/ExpressiveEmotionFilterBar';
import { parseUniversalEmotions, matchesEmotionFilter } from '../../utils/expressiveEmotionUtils';

interface ExpressiveFamiliesViewProps {
  families: ExpressiveFamily[];
  currentlyPlayingId: string | null;
  onTogglePlay: (take: ExpressiveTake) => void;
  onClearAllFamilies?: () => void;
}

export const ExpressiveFamiliesView: React.FC<ExpressiveFamiliesViewProps> = ({
  families,
  currentlyPlayingId,
  onTogglePlay,
  onClearAllFamilies
}) => {
  const [filterLang, setFilterLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleToggleEmotion = (id: string) => {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterLang, searchQuery, selectedEmotions, matchMode, pageSize]);

  const filtered = useMemo(() => {
    return families.filter(f => {
      if (filterLang !== 'all' && f.language !== filterLang) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = f.transcript.toLowerCase().includes(q);
        const matchesId = f.familyId.toLowerCase().includes(q);
        const matchesTakes = f.takes.some(t => t.id.toLowerCase().includes(q) || t.conditionId.toLowerCase().includes(q));
        if (!matchesText && !matchesId && !matchesTakes) return false;
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
  }, [families, filterLang, searchQuery, selectedEmotions, matchMode]);

  const totalClips = families.reduce((sum, f) => sum + f.takes.length, 0);
  const filteredClips = filtered.reduce((sum, f) => sum + f.takes.length, 0);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedFamilies = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      {/* View Header with Search and Language */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: '#8B5CF6' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>
            Generated Families ({families.length})
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            • {totalClips} Total Clips
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search families or IDs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '4px 8px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#F8FAFC', fontSize: '0.78rem', width: '150px' }}
          />

          {/* Language Filter */}
          <select
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
            style={{ padding: '4px 8px', background: '#0F172A', border: '1px solid #334155', borderRadius: '6px', color: '#F8FAFC', fontSize: '0.78rem' }}
          >
            <option value="all">All Languages</option>
            <option value="ckb">Sorani (ckb)</option>
            <option value="kmr">Badini (kmr)</option>
            <option value="ar">Arabic (ar)</option>
            <option value="en">English (en)</option>
          </select>

          {families.length > 0 && onClearAllFamilies && (
            <button
              onClick={onClearAllFamilies}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.74rem', padding: '4px 8px', color: '#EF4444' }}
              title="Clear all generated families"
            >
              <Trash2 size={13} />
            </button>
          )}
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
        filteredCount={filtered.length}
      />

      {/* Families List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          {families.length === 0
            ? 'No families generated yet. Enter sentences above and start the automated batch!'
            : 'No families match the selected filters or search criteria.'}
        </div>
      ) : (
        <>
          {paginatedFamilies.map(family => (
            <ExpressiveFamilyCard
              key={family.familyId}
              family={family}
              currentlyPlayingId={currentlyPlayingId}
              onTogglePlay={onTogglePlay}
              filterEmotions={selectedEmotions}
              matchMode={matchMode}
            />
          ))}

          {/* Page by Page Navigation Bar */}
          <FamiliesPaginationBar
            currentPage={safePage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 5, 10, 20]}
            itemName="families"
            extraSummary={
              <span style={{ color: '#C084FC', fontSize: '0.75rem' }}>
                • {filteredClips} matching clips
              </span>
            }
          />
        </>
      )}
    </div>
  );
};
