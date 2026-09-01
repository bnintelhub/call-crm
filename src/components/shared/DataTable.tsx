import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import './ui.css';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  loading?: boolean;
  actions?: React.ReactNode;
  rowKey: (row: T) => string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 20,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  emptyMessage = 'No records found',
  loading = false,
  actions,
  rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'en-IN');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    const k = col.key as string;
    if (sortKey !== k) return <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent-primary-light)' }} /> : <ChevronDown size={12} style={{ color: 'var(--accent-primary-light)' }} />;
  };

  return (
    <div>
      {(searchable || actions) && (
        <div className="datatable-toolbar">
          {searchable && (
            <div className="datatable-search">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key as string} style={col.width ? { width: col.width } : undefined}>
                  {col.sortable ? (
                    <span
                      className="sortable-header"
                      onClick={() => handleSort(col.key as string)}
                    >
                      {col.header} <SortIcon col={col} />
                    </span>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, ci) => (
                    <td key={ci}><div className="skeleton-line" style={{ height: 14, width: '70%' }} /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={rowKey(row)}>
                  {columns.map(col => (
                    <td key={col.key as string}>
                      {col.render ? col.render(row) : String(row[col.key as string] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="datatable-pagination">
          <span className="datatable-pagination-info">
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="datatable-pagination-controls">
            <button disabled={page <= 1} onClick={() => setPage(1)}>«</button>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              return (
                <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}
