import React, { FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface DatasetPaginationBarProps {
  startIndex: number;
  endIndex: number;
  totalItems: number;
  totalPages: number;
  safeCurrentPage: number;
  pageNumbers: (number | string)[];
  goToPage: (page: number) => void;
  jumpPageInput: string;
  onJumpInputChange: (v: string) => void;
  onJumpSubmit: (e: FormEvent) => void;
}

export const DatasetPaginationBar: React.FC<DatasetPaginationBarProps> = ({
  startIndex,
  endIndex,
  totalItems,
  totalPages,
  safeCurrentPage,
  pageNumbers,
  goToPage,
  jumpPageInput,
  onJumpInputChange,
  onJumpSubmit
}) => {
  if (totalPages <= 1) return null;

  return (
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
      <form className="pagination-right" onSubmit={onJumpSubmit}>
        <span className="jump-label">Go to:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          className="input-control jump-input"
          placeholder={`${safeCurrentPage}`}
          value={jumpPageInput}
          onChange={(e) => onJumpInputChange(e.target.value)}
        />
        <button type="submit" className="jump-submit-btn">Go</button>
      </form>
    </div>
  );
};
