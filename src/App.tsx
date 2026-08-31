import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from './components/ui/Toast';
import Layout from './components/layout/Layout';

// Auth and Public pages removed

// Dashboards (role-based)
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TelecallerDashboard from './pages/dashboard/TelecallerDashboard';
import OperationsManagerDashboard from './pages/dashboard/OperationsManagerDashboard';
import TeamLeadDashboard from './pages/dashboard/TeamLeadDashboard';

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
        
        {/* Protected — any role */}
        <Route element={<Layout requiredRole="ANY" />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
