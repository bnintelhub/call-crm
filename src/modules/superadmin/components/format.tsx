import type { OrgStatus } from '../types';

const STATUS_CLASS: Record<OrgStatus, string> = {
  active: 'badge badge-success',
  trial: 'badge badge-info',
  grace: 'badge badge-warning',
  expired: 'badge badge-danger',
  suspended: 'badge badge-danger',
  cancelled: 'badge',
};

const STATUS_LABEL: Record<OrgStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  grace: 'Grace',
  expired: 'Expired',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: OrgStatus }) {
  return <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</span>;
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
