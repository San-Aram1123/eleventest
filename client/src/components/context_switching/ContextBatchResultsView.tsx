import React, { useState } from 'react';
import { 
  ListOrdered, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Download, 
  CheckCircle2 
} from 'lucide-react';
import { Sample } from '../../types';
import { ContextParagraphCard, ParagraphItem } from './ContextParagraphCard';
import { ContextMasterAudioPlayer } from './ContextMasterAudioPlayer';

interface ContextBatchResultsViewProps {
  samples: Sample[];
  selectedVoice: string;
  masterAudioUrl?: string | null;
}

export const ContextBatchResultsView: React.FC<ContextBatchResultsViewProps> = ({
  samples,
  selectedVoice,
  masterAudioUrl
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');

  if (samples.length === 0) return null;

  const filteredSamples = samples.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (s.text && s.text.toLowerCase().includes(q)) || (s.id && s.id.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filteredSamples.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedSamples = filteredSamples.slice(startIndex, startIndex + pageSize);

  const totalDuration = samples.reduce((acc, s) => acc + (s.duration_seconds || s.durationSeconds || 0), 0);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListOrdered size={18} className="text-primary" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Generated Dataset Clips ({samples.length.toLocaleString()} total • {Math.round(totalDuration)}s total audio)
          </span>
        </div>

        {/* Search and Page Size */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search transcript..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="form-control"
              style={{ padding: '0.35rem 0.5rem 0.35rem 1.6rem', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="form-select"
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {masterAudioUrl && (
        <ContextMasterAudioPlayer
          masterAudioUrl={masterAudioUrl}
          speaker1Voice={selectedVoice}
          speaker2Voice={selectedVoice}
        />
      )}

      {/* Paginated Card List */}
      <div>
        {paginatedSamples.map((sample, idx) => {
          const item: ParagraphItem = {
            id: sample.id,
            text: sample.text,
            status: 'completed',
            audioUrl: sample.audioUrl || `/api/dataset/${sample.id}/audio`,
            durationSeconds: sample.duration_seconds || sample.durationSeconds || 0,
            sample: sample,
            error: null
          };

          return (
            <ContextParagraphCard
              key={sample.id || startIndex + idx}
              index={startIndex + idx}
              item={item}
              selectedEmotion="neutral"
              selectedVoice={sample.voice_name || selectedVoice}
            />
          );
        })}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.65rem 1rem', background: 'var(--bg-box)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredSamples.length)} of {filteredSamples.length}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safePage <= 1}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Page {safePage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safePage >= totalPages}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

