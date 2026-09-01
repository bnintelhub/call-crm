import React from 'react';
import { CheckCircle2, PhoneCall, Upload, UserPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'call' | 'allocation' | 'agent' | 'ptp';
  title: string;
  subtitle: string;
  time: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'allocation',
    title: 'New Allocation Batch Uploaded',
    subtitle: 'Moneyview_Personal Loan_Fresh_2026_09-01 (450 accounts)',
    time: '10 mins ago',
  },
  {
    id: 'act-2',
    type: 'agent',
    title: 'Agent Onboarded',
    subtitle: 'Rahul Kumar (BN5265) assigned to Telecalling Desk',
    time: '25 mins ago',
  },
  {
    id: 'act-3',
    type: 'ptp',
    title: 'High Value PTP Recorded',
    subtitle: 'Preeti Kumari logged ₹85,000 commitment for A/C #LN884920',
    time: '1 hour ago',
  },
];

export const RecentActivity: React.FC = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'allocation': return <Upload size={16} style={{ color: '#6366f1' }} />;
      case 'agent': return <UserPlus size={16} style={{ color: '#10b981' }} />;
      case 'ptp': return <CheckCircle2 size={16} style={{ color: '#f59e0b' }} />;
      default: return <PhoneCall size={16} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div className="agent-table-card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        Recent Supervisor Activity Feed
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {mockActivities.map((act) => (
          <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              {getIcon(act.type)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {act.title}
              </p>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {act.subtitle}
              </p>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
