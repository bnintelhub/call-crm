import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { ToastContainer } from './components/shared/Toast';
import Layout from './layouts/shared/Layout';

// Auth
import Login from './pages/auth/Login';
import TelecallerDashboard from './pages/telecaller/Dashboard';
import MyData from './pages/telecaller/MyData';
import BorrowerDetails from './pages/telecaller/BorrowerDetails';
import Profile from './pages/telecaller/Profile';
import WhatsAppMessages from './pages/telecaller/WhatsAppMessages';
import PriorityTasks from './pages/telecaller/PriorityTasks';

import type { Role } from './types';
import { LEAD_AND_ABOVE } from './types';

// Role-based Dashboard selector
function DashboardRouter() {
  const { user } = useAuthStore();
  if (user?.role === 'TELECALLER') return <TelecallerDashboard />;
  return <div style={{ padding: '2rem' }}>Dashboard for {user?.role} is coming soon in another branch.</div>;
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
        
        {/* Protected — any role */}
        <Route element={<Layout requiredRole="ANY" />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/my-data" element={<MyData />} />
          <Route path="/borrower/:id" element={<BorrowerDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/whatsapp-messages" element={<WhatsAppMessages />} />
          <Route path="/priority-tasks" element={<PriorityTasks />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
