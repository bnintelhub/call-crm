import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', flexWrap: 'wrap', gap: '0.5rem' }}>
      {totalItems !== undefined && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} records)
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginLeft: 'auto' }}>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="crm-pagination-btn"
          style={{
            padding: '0.375rem 0.625rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            color: currentPage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{ padding: '0 0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="crm-pagination-btn"
          style={{
            padding: '0.375rem 0.625rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            color: currentPage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
