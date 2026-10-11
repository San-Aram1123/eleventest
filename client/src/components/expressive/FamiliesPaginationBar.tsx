import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface FamiliesPaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  extraSummary?: React.ReactNode;
}

export const FamiliesPaginationBar: React.FC<FamiliesPaginationBarProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemName = 'families',
  extraSummary
}) => {
  const [jumpInput, setJumpInput] = useState('');
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setJumpInput('');
    }
  };

  // Generate page numbers array with ellipsis
  const pageNumbers: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    if (safePage <= 4) {
      pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (safePage >= totalPages - 3) {
      pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '8px',
      marginTop: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.75rem',
      fontSize: '0.82rem',
      color: '#94A3B8'
    }}>
      {/* Left: Summary & Page Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span>
          Showing <strong style={{ color: '#F8FAFC' }}>{startItem} - {endItem}</strong> of <strong style={{ color: '#F8FAFC' }}>{totalItems}</strong> {itemName}
        </span>
        {extraSummary && <span>{extraSummary}</span>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          <span style={{ fontSize: '0.75rem' }}>Per page:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '2px 6px',
              background: '#0B0F19',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#F8FAFC',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Pagination Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage <= 1}
          style={btnStyle(safePage <= 1)}
          title="First Page"
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          style={btnStyle(safePage <= 1)}
          title="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers.map((num, i) => (
          typeof num === 'number' ? (
            <button
              key={i}
              onClick={() => onPageChange(num)}
              style={{
                ...btnStyle(false),
                minWidth: '28px',
                height: '28px',
                padding: '0 6px',
                fontWeight: num === safePage ? 700 : 500,
                background: num === safePage ? '#6366F1' : 'rgba(255, 255, 255, 0.05)',
                color: num === safePage ? '#FFFFFF' : '#CBD5E1',
                borderColor: num === safePage ? '#818CF8' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {num}
            </button>
          ) : (
            <span key={i} style={{ padding: '0 4px', color: '#64748B' }}>...</span>
          )
        ))}

        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          style={btnStyle(safePage >= totalPages)}
          title="Next Page"
        >
          <ChevronRight size={14} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          style={btnStyle(safePage >= totalPages)}
          title="Last Page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Right: Jump Form */}
      {totalPages > 3 && (
        <form onSubmit={handleJump} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem' }}>Page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpInput}
            onChange={e => setJumpInput(e.target.value)}
            placeholder={`${safePage}`}
            style={{
              width: '42px',
              padding: '2px 4px',
              background: '#0B0F19',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#F8FAFC',
              fontSize: '0.75rem',
              textAlign: 'center'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '2px 8px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '4px',
              color: '#A5B4FC',
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            Go
          </button>
        </form>
      )}
    </div>
  );
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 6px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  color: disabled ? '#475569' : '#CBD5E1',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  transition: 'all 0.15s ease'
});

