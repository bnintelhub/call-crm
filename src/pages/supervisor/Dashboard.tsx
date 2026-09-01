import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import DashboardStats from '../../components/supervisor/dashboard/DashboardStats';
import Charts from '../../components/supervisor/dashboard/Charts';
import RecentActivity from '../../components/supervisor/dashboard/RecentActivity';
import AdminDashboardBase from '../dashboard/AdminDashboard';

export const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
      <AdminDashboardBase />
    </div>
  );
};

export default Dashboard;
