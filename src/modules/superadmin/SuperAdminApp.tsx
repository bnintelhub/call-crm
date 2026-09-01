import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import SuperAdminShell from './layout/SuperAdminShell';

// Super Admin Pages
import SuperAdminDashboard from './pages/Dashboard';
import CompaniesPage from './pages/Companies';
import CompanyCreatePage from './pages/CompanyCreate';
import CompanyDetailPage from './pages/CompanyDetail';
import PlansPage from './pages/Plans';
import FeaturesPage from './pages/Features';
import SubscriptionsPage from './pages/Subscriptions';
import UsagePage from './pages/Usage';
import TelephonyPage from './pages/Telephony';
import AuditLogsPage from './pages/AuditLogs';
import SettingsPage from './pages/Settings';

/**
 * Isolated BNORBIT Super Admin Control Plane.
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
        <Route path="features" element={<FeaturesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="usage" element={<UsagePage />} />
        <Route path="telephony" element={<TelephonyPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </SuperAdminShell>
  );
}
