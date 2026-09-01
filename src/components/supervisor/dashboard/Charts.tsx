import React from 'react';

export const Charts: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
      <div className="agent-table-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Hourly Call Volume
        </h4>
        <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', paddingBottom: '0.5rem' }}>
          {[35, 55, 80, 95, 70, 88, 62, 45].map((val, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
              <div
                style={{
                  width: '100%',
                  height: `${val * 1.5}px`,
                  background: 'var(--accent-primary)',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.85,
                }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{9 + idx}h</span>
            </div>
          ))}
        </div>
      </div>

      <div className="agent-table-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Disposition Breakdown
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'PTP Promised', pct: 45, color: '#10b981' },
            { label: 'Callback Scheduled', pct: 25, color: '#6366f1' },
            { label: 'Dispute / Grievance', pct: 15, color: '#f59e0b' },
            { label: 'Not Reachable / RNR', pct: 15, color: '#ef4444' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.pct}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Charts;
