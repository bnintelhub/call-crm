import React from 'react';
import DashboardStats from '../../components/supervisor/dashboard/DashboardStats';
import Charts from '../../components/supervisor/dashboard/Charts';
import RecentActivity from '../../components/supervisor/dashboard/RecentActivity';

export const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
      <DashboardStats />
      <Charts />
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
