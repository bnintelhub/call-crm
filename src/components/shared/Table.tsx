import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No data available',
  onRowClick,
  className = '',
}: TableProps<T>) {
  return (
    <div className={`agent-table-card ${className}`}>
      <div className="agent-table-scroll-wrapper">
        <table className="agent-data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className} style={col.width ? { width: col.width } : undefined}>
                  <div className="th-cell-content">
                    <span>{col.header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rIdx) => (
                <tr
                  key={keyExtractor(row, rIdx)}
                  className="agent-table-row"
                  onClick={() => onRowClick?.(row)}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={col.className}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="agent-empty-cell">
                  <div className="agent-empty-state">
                    <p className="agent-empty-title">{emptyText}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
