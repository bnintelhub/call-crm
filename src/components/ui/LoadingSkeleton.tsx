import './ui.css';

export function SkeletonLine({ width = '100%', height = '14px' }: { width?: string; height?: string }) {
  return <div className="skeleton-line" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="flex items-center gap-3">
        <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="60%" height="20px" />
          <SkeletonLine width="40%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><SkeletonLine width="70%" height="12px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><SkeletonLine width={`${50 + Math.random() * 40}%`} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div className="stat-card" key={i}>
          <div className="skeleton-circle" style={{ width: 44, height: 44 }} />
          <div className="stat-content" style={{ flex: 1 }}>
            <SkeletonLine width="50%" height="24px" />
            <SkeletonLine width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon?: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}
