import { useState, useMemo, useEffect, FormEvent } from 'react';
import { Sample } from '../types';
import { getSampleGender } from '../utils/genderUtils';
import { getSampleDuration } from '../utils/audioFormatters';
import { parseUniversalEmotions, matchesEmotionFilter } from '../utils/expressiveEmotionUtils';

export function getSampleVoice(s: Sample): string {
  return (s.voice_name || (s as any).voiceName || s.voice_id || (s as any).voiceId || '').trim();
}

export function getSampleLanguage(s: Sample): string {
  if (!s) return 'ckb';
  const direct = s.language || (s as any).customMetadata?.language || (s as any).metadata_extra?.language;
  if (direct && typeof direct === 'string') {
    const l = direct.trim().toLowerCase();
    if (l) return l;
  }
  if (s.dialect === 'badini') return 'kmr';
  if (s.dialect === 'sorani') return 'ckb';
  return 'ckb';
}

export function getLanguageLabel(code: string): string {
  const c = (code || '').toLowerCase().trim();
  switch (c) {
    case 'ckb':
      return 'Kurdish Sorani (ckb)';
    case 'kmr':
      return 'Kurdish Badini (kmr)';
    case 'en':
      return 'English (en)';
    case 'ar':
      return 'Arabic (ar)';
    case 'ku':
      return 'Kurdish (ku)';
    default:
      return `${c.toUpperCase()} (${c})`;
  }
}

export function getSampleUsedKey(s: Sample): string {
  if (!s) return '';
  const direct = s.used_key || (s as any).key_used || (s as any).keyUsed || (s as any).usedKeyMasked;
  if (direct && typeof direct === 'string') return direct.trim();

  const extra = (s as any).metadata_extra || (s as any).customMetadata;
  if (extra && typeof extra === 'object') {
    const fromExtra = extra.used_key || extra.key_used || extra.keyUsed || extra.usedKeyMasked;
    if (fromExtra && typeof fromExtra === 'string') return fromExtra.trim();
  }
  return '';
}

export function parseSampleEmotions(s: Sample): string[] {
  return parseUniversalEmotions(s);
}

export function getEmotionBadgeClass(emotion: string): string {
  const em = emotion.toLowerCase().trim();
  if (['neutral', 'happy', 'sad', 'angry', 'fear', 'excited', 'whisper', 'whispering', 'laughing', 'laugh', 'cackle', 'shouting', 'shout', 'sigh', 'crying', 'cry', 'curious', 'mixed', 'custom'].includes(em)) {
    if (em === 'whispering') return 'emotion-badge-whisper';
    if (em === 'cackle' || em === 'laugh') return 'emotion-badge-laughing';
    if (em === 'shout') return 'emotion-badge-shouting';
    if (em === 'cry') return 'emotion-badge-crying';
    return `emotion-badge-${em}`;
  }
  return 'emotion-badge-custom';
}

export function useDatasetFilters(samples: Sample[], onPageChange?: () => void) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [filterVoice, setFilterVoice] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterDialect, setFilterDialect] = useState<'all' | 'sorani' | 'badini'>('all');
  const [filterEmotion, setFilterEmotion] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterKey, setFilterKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  const availableVoices = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of samples) {
      const v = getSampleVoice(s);
      if (v) counts.set(v, (counts.get(v) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [samples]);

  const availableKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of samples) {
      const k = getSampleUsedKey(s);
      if (k) counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  }, [samples]);

  const availableLanguages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of samples) {
      const l = getSampleLanguage(s);
      if (l) counts.set(l, (counts.get(l) || 0) + 1);
    }
    const standardCodes = ['ckb', 'en', 'kmr', 'ar'];
    const allCodes = new Set([...standardCodes, ...counts.keys()]);
    return Array.from(allCodes)
      .map((code) => ({ code, label: getLanguageLabel(code), count: counts.get(code) || 0 }))
      .filter((item) => item.count > 0 || standardCodes.includes(item.code))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [samples]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterVoice, filterLanguage, filterDialect, filterEmotion, filterMethod, filterKey, sortBy, pageSize]);

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

  const durationOutlierCount = useMemo(() => {
    return samples.filter(s => {
      const dur = getSampleDuration(s);
      return dur <= 6.0 || dur > 16.5;
    }).length;
  }, [samples]);

  const filteredAndSortedSamples = useMemo(() => {
    const result = samples.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.id.toLowerCase().includes(q);
        const matchText = (s.text || '').toLowerCase().includes(q);
        const matchClean = (s.cleanText || '').toLowerCase().includes(q);
        const matchVoice = getSampleVoice(s).toLowerCase().includes(q);
        const matchKey = getSampleUsedKey(s).toLowerCase().includes(q);
        const matchLang = getSampleLanguage(s).includes(q) || getLanguageLabel(getSampleLanguage(s)).toLowerCase().includes(q);
        if (!matchId && !matchText && !matchClean && !matchVoice && !matchKey && !matchLang) return false;
      }

      if (filterGender !== 'all' && getSampleGender(s) !== filterGender) return false;
      if (filterVoice !== 'all' && getSampleVoice(s) !== filterVoice) return false;
      if (filterLanguage !== 'all' && getSampleLanguage(s) !== filterLanguage) return false;
      if (filterDialect !== 'all' && String(s.dialect || 'sorani').toLowerCase() !== filterDialect) return false;

      if (filterEmotion !== 'all') {
        const sampleEmotions = parseSampleEmotions(s);
        if (!matchesEmotionFilter(sampleEmotions, [filterEmotion], 'any')) return false;
      }

      if (filterMethod !== 'all' && s.method !== filterMethod) return false;
      if (filterKey !== 'all' && getSampleUsedKey(s) !== filterKey) return false;

      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'id_desc') return b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' });
      if (sortBy === 'id_asc') return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortBy === 'rating_desc') return (b.ratings?.overall || 0) - (a.ratings?.overall || 0);
      if (sortBy === 'duration_desc') return getSampleDuration(b) - getSampleDuration(a);
      return 0;
    });
  }, [samples, searchQuery, filterGender, filterVoice, filterLanguage, filterDialect, filterEmotion, filterMethod, filterKey, sortBy]);

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
    onPageChange?.();
  };

  const handleJumpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goToPage(pageNum);
      setJumpPageInput('');
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safeCurrentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
  }, [safeCurrentPage, totalPages]);

  return {
    searchQuery, setSearchQuery,
    filterGender, setFilterGender,
    filterVoice, setFilterVoice,
    filterLanguage, setFilterLanguage,
    filterDialect, setFilterDialect,
    filterEmotion, setFilterEmotion,
    filterMethod, setFilterMethod,
    filterKey, setFilterKey,
    sortBy, setSortBy,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    jumpPageInput, setJumpPageInput,
    availableVoices, availableKeys, availableLanguages,
    duplicateGroupCount, durationOutlierCount,
    filteredAndSortedSamples, currentPaginatedSamples,
    totalItems, totalPages, safeCurrentPage, startIndex, endIndex,
    goToPage, handleJumpSubmit, pageNumbers
  };
}
