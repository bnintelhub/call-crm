import type { OrgStatus } from '../types';

const STATUS_CONFIG: Record<
  OrgStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  active: {
    label: 'Active',
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#059669',
    border: 'rgba(16, 185, 129, 0.35)',
    dot: '#10b981',
  },
  trial: {
    label: 'Trial',
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#d97706',
    border: 'rgba(245, 158, 11, 0.35)',
    dot: '#f59e0b',
  },
  grace: {
    label: 'Grace (Due)',
    bg: 'rgba(249, 115, 22, 0.12)',
    text: '#ea580c',
    border: 'rgba(249, 115, 22, 0.35)',
    dot: '#f97316',
  },
  expired: {
    label: 'Expired',
    bg: 'rgba(239, 68, 68, 0.12)',
    text: '#dc2626',
    border: 'rgba(239, 68, 68, 0.35)',
    dot: '#ef4444',
  },
  suspended: {
    label: 'Suspended',
    bg: 'rgba(100, 116, 139, 0.14)',
    text: '#475569',
    border: 'rgba(100, 116, 139, 0.35)',
    dot: '#64748b',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'rgba(148, 163, 184, 0.12)',
    text: '#64748b',
    border: 'rgba(148, 163, 184, 0.3)',
    dot: '#94a3b8',
  },
};

export function StatusBadge({ status }: { status: OrgStatus }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.suspended;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        background: conf.bg,
        color: conf.text,
        border: `1px solid ${conf.border}`,
        lineHeight: 1.3,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: conf.dot,
        }}
      />
      {conf.label}
    </span>
  );
}

export function formatInr(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatWhen(iso: string | null) {
  if (!iso) return 'Never';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function daysUntil(dateStr: string) {
  const end = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86400000);
}

export function quotaPct(used: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}
