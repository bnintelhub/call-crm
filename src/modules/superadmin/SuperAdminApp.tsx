import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SuperAdminShell from './layout/SuperAdminShell';
import SuperAdminDashboard from './pages/Dashboard';
import CompaniesPage from './pages/Companies';
import CompanyCreatePage from './pages/CompanyCreate';
import CompanyDetailPage from './pages/CompanyDetail';
import PlansPage from './pages/Plans';
import UsagePage from './pages/Usage';
import AuditLogsPage from './pages/AuditLogs';

/**
 * Isolated Super Admin app.
 * Mounted at /superadmin/* so supervisor and telecaller routes stay untouched.
 */
export default function SuperAdminApp() {
  const { isAuthenticated, token, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SuperAdminShell>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="companies/new" element={<CompanyCreatePage />} />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SuperAdminShell>
  );
}
