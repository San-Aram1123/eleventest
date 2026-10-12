import { useMemo } from 'react';
import { Sample } from '../../../types';
import { getSampleDuration, formatDurationDetailed } from '../../../utils/audioFormatters';
import { DatePreset } from './MassDeleteDateTab';
import { MetaCriteriaType } from './MassDeleteMetadataTab';

interface UseMassDeleteFilterProps {
  samples: Sample[];
  currentFilteredSamples: Sample[];
  selectedSampleIds: Set<string>;
  activeTab: 'date' | 'active_filter' | 'metadata' | 'selected';
  datePreset: DatePreset;
  customDateType: 'before' | 'after' | 'between';
  customDateStart: string;
  customDateEnd: string;
  metaCriteriaType: MetaCriteriaType;
  metaDialect: 'sorani' | 'badini';
  metaVoice: string;
  metaMethod: string;
  metaRatingOption: 'unrated' | 'low_quality';
}

export function useMassDeleteFilter({
  samples,
  currentFilteredSamples,
  selectedSampleIds,
  activeTab,
  datePreset,
  customDateType,
  customDateStart,
  customDateEnd,
  metaCriteriaType,
  metaDialect,
  metaVoice,
  metaMethod,
  metaRatingOption
}: UseMassDeleteFilterProps) {
  const timeInfo = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = startOfToday - 30 * 24 * 60 * 60 * 1000;

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

    return { startOfToday, sevenDaysAgo, thirtyDaysAgo, notTodayCount, todayCount, older7DaysCount, older30DaysCount };
  }, [samples]);

  const matchingSamples = useMemo(() => {
    if (activeTab === 'selected') {
      return samples.filter((s) => selectedSampleIds.has(s.id));
    }
    if (activeTab === 'active_filter') {
      return currentFilteredSamples;
    }
    if (activeTab === 'date') {
      if (datePreset === 'not_today') return samples.filter((s) => (s.created_at ? new Date(s.created_at).getTime() : 0) < timeInfo.startOfToday);
      if (datePreset === 'today_only') return samples.filter((s) => (s.created_at ? new Date(s.created_at).getTime() : 0) >= timeInfo.startOfToday);
      if (datePreset === 'older_7_days') return samples.filter((s) => (s.created_at ? new Date(s.created_at).getTime() : 0) < timeInfo.sevenDaysAgo);
      if (datePreset === 'older_30_days') return samples.filter((s) => (s.created_at ? new Date(s.created_at).getTime() : 0) < timeInfo.thirtyDaysAgo);
      if (datePreset === 'custom') {
        const start = customDateStart ? new Date(`${customDateStart}T00:00:00`).getTime() : 0;
        const end = customDateEnd ? new Date(`${customDateEnd}T23:59:59.999`).getTime() : Infinity;
        return samples.filter((s) => {
          const t = s.created_at ? new Date(s.created_at).getTime() : 0;
          if (customDateType === 'before') return t <= end;
          if (customDateType === 'after') return t >= start;
          if (customDateType === 'between') return t >= start && t <= end;
          return false;
        });
      }
    }
    if (activeTab === 'metadata') {
      if (metaCriteriaType === 'dialect') return samples.filter((s) => (s.dialect || 'sorani').toLowerCase() === metaDialect.toLowerCase());
      if (metaCriteriaType === 'voice') {
        return samples.filter((s) => {
          const v = (s.voice_name || (s as any).voiceName || s.voice_id || '').trim().toLowerCase();
          return v.includes(metaVoice.toLowerCase()) || metaVoice.toLowerCase().includes(v);
        });
      }
      if (metaCriteriaType === 'method') return samples.filter((s) => (s.method || '').toLowerCase() === metaMethod.toLowerCase());
      if (metaCriteriaType === 'rating') {
        if (metaRatingOption === 'unrated') {
          return samples.filter((s) => {
            const r = s.ratings?.overall || (s as any).rating;
            return r === undefined || r === null || r === 0;
          });
        }
        if (metaRatingOption === 'low_quality') {
          return samples.filter((s) => {
            const r = s.ratings?.overall || (s as any).rating;
            return typeof r === 'number' && r > 0 && r <= 2;
          });
        }
      }
      if (metaCriteriaType === 'missing_audio') {
        return samples.filter((s) => !s.hasAudio || (s.audio_size !== undefined && s.audio_size === 0));
      }
    }
    return [];
  }, [
    activeTab, datePreset, customDateType, customDateStart, customDateEnd,
    metaCriteriaType, metaDialect, metaVoice, metaMethod, metaRatingOption,
    samples, currentFilteredSamples, selectedSampleIds, timeInfo
  ]);

  const stats = useMemo(() => {
    const count = matchingSamples.length;
    const totalDurationSec = matchingSamples.reduce((acc, s) => acc + getSampleDuration(s), 0);
    const remainingCount = Math.max(0, samples.length - count);
    const percentOfTotal = samples.length > 0 ? ((count / samples.length) * 100).toFixed(1) : '0';
    return {
      count,
      totalDurationSec,
      durationFormatted: formatDurationDetailed(totalDurationSec),
      remainingCount,
      percentOfTotal
    };
  }, [matchingSamples, samples]);

  return { timeInfo, matchingSamples, stats };
}
