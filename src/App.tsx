import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from './components/ui/Toast';
import Layout from './components/layout/Layout';

// Auth
import Login from './pages/auth/Login';
// Dashboards (role-based)
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TelecallerDashboard from './pages/dashboard/TelecallerDashboard';
import OperationsManagerDashboard from './pages/dashboard/OperationsManagerDashboard';
import TeamLeadDashboard from './pages/dashboard/TeamLeadDashboard';
import IVRPage from './pages/ivr/IVRPage';
import AllocationList from './pages/allocation/AllocationList';
import UploadAllocationPage from './pages/allocation/UploadAllocationPage';
import AgentListPage from './pages/agent/AgentListPage';
import CampaignPage from './pages/campaign/CampaignPage';

import type { Role } from './types';
import { LEAD_AND_ABOVE } from './types';

// Role-based Dashboard selector
function DashboardRouter() {
  const { user } = useAuthStore();
  if (user?.role === 'TELECALLER') return <TelecallerDashboard />;
  if (user?.role === 'TEAM_LEAD') return <TeamLeadDashboard />;
  if (user?.role === 'OPERATIONS_MANAGER') return <OperationsManagerDashboard />;
  return <AdminDashboard />; // SUPER_ADMIN, ADMIN
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected layout routes */}
        <Route element={<Layout requiredRole="ANY" />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/allocation" element={<AllocationList />} />
          <Route path="/allocation-list" element={<AllocationList />} />
          <Route path="/allocation/upload-allocation" element={<UploadAllocationPage />} />
          <Route path="/upload-allocation" element={<UploadAllocationPage />} />
          <Route path="/agents" element={<AgentListPage />} />
          <Route path="/agent-list" element={<AgentListPage />} />
          <Route path="/ivr/agent-list" element={<AgentListPage />} />
          <Route path="/campaigns" element={<CampaignPage />} />
          <Route path="/campaign" element={<CampaignPage />} />
          <Route path="/ivr/campaigns" element={<CampaignPage />} />
          <Route path="/ivr/allocation-list" element={<AllocationList />} />
          <Route path="/ivr/upload-allocation" element={<UploadAllocationPage />} />
          <Route path="/ivr/:tab" element={<IVRPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
