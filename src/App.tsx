import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { ToastContainer } from './components/shared/Toast';
import AppRoutes from './routes/AppRoutes';

// SuperAdmin module (self-contained)
import SuperAdminApp from './modules/superadmin/SuperAdminApp';
import { useAuthStore } from './store/authStore';
import { Routes, Route, Navigate } from 'react-router-dom';

function RootApp() {
  const { user, isAuthenticated } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <Routes>
      {/* SuperAdmin gets its own isolated shell */}
      <Route path="/superadmin/*" element={<SuperAdminApp />} />
      {/* All other roles use the main AppRoutes */}
      <Route path="/*" element={<AppRoutes />} />
    </Routes>
  );
}

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <RootApp />
    </BrowserRouter>
  );
}

export default App;
