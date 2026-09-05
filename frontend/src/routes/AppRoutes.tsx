import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ProtectedRoute from './ProtectedRoute';
import SupervisorRoutes from './SupervisorRoutes';
import Layout from '../layouts/shared/Layout';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import NotFound from '../pages/NotFound';

// Telecaller pages (pankaj branch)
import TelecallerDashboard from '../pages/telecaller/Dashboard';
import MyData from '../pages/telecaller/MyData';
import BorrowerDetails from '../pages/telecaller/BorrowerDetails';
import Profile from '../pages/telecaller/Profile';
import WhatsAppMessages from '../pages/telecaller/WhatsAppMessages';
import PriorityTasks from '../pages/telecaller/PriorityTasks';

// Supervisor pages (zeeshan branch)
import SupervisorDashboard from '../pages/supervisor/Dashboard';
import TeamLeadDashboard from '../pages/supervisor/Dashboard';
import OperationsManagerDashboard from '../pages/supervisor/Dashboard';
import AllocationList from '../pages/allocation/AllocationList';
import UploadAllocationPage from '../pages/allocation/UploadAllocationPage';
import AgentListPage from '../pages/agent/AgentListPage';
import MapAgentsCampaignsPage from '../pages/agent/MapAgentsCampaignsPage';
import CampaignPage from '../pages/campaign/CampaignPage';
import IVRPage from '../pages/ivr/IVRPage';
import ReportsLayout from '../pages/reports/ReportsLayout';
import OneViewPage from '../pages/reports/OneViewPage';
import CCReportsPage from '../pages/reports/CCReportsPage';
import FieldReportsPage from '../pages/reports/FieldReportsPage';
import DigitalEngagementPage from '../pages/reports/DigitalEngagementPage';
import CallRecordingsPage from '../pages/reports/CallRecordingsPage';
import WhatsAppMessagesPage from '../pages/reports/WhatsAppMessagesPage';

import SuperAdminApp from '../modules/superadmin/SuperAdminApp';

function RoleDashboardSelector() {
  const { user } = useAuthStore();
  if (user?.role === 'TELECALLER') return <TelecallerDashboard />;
  if (user?.role === 'TEAM_LEAD') return <TeamLeadDashboard />;
  if (user?.role === 'OPERATIONS_MANAGER') return <OperationsManagerDashboard />;
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
    return <Navigate to="/superadmin/dashboard" replace />;
  }
  return <SupervisorDashboard />;
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* SuperAdmin Module Router */}
      <Route path="/superadmin/*" element={<SuperAdminApp />} />

      {/* Role-Specific Supervisor Router */}
      <Route path="/supervisor/*" element={<SupervisorRoutes />} />

      {/* Common Routes accessible to all authenticated roles */}
      <Route element={<Layout requiredRole="ANY" />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RoleDashboardSelector />} />

        {/* Telecaller Routes (pankaj) */}
        <Route path="/my-data" element={<MyData />} />
        <Route path="/borrower/:id" element={<BorrowerDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/priority-tasks" element={<PriorityTasks />} />
        <Route path="/whatsapp-messages" element={<WhatsAppMessages />} />
      </Route>

      {/* Supervisor/Admin-Only Routes (IVR, Allocation, Agents, Campaigns, Reports) */}
      <Route element={<Layout requiredRole="ADMIN_OR_LEAD" />}>
        {/* Allocation */}
        <Route path="/allocation" element={<Navigate to="/ivr/allocation-list" replace />} />
        <Route path="/allocation-list" element={<Navigate to="/ivr/allocation-list" replace />} />
        <Route path="/allocation/upload-allocation" element={<UploadAllocationPage />} />
        <Route path="/upload-allocation" element={<UploadAllocationPage />} />
        <Route path="/ivr/allocation-list" element={<AllocationList />} />
        <Route path="/ivr/upload-allocation" element={<UploadAllocationPage />} />

        {/* Agents */}
        <Route path="/agents" element={<AgentListPage />} />
        <Route path="/agent-list" element={<AgentListPage />} />
        <Route path="/agent/map-campaigns" element={<MapAgentsCampaignsPage />} />
        <Route path="/agents/map-campaigns" element={<MapAgentsCampaignsPage />} />
        <Route path="/map-agents-campaigns" element={<MapAgentsCampaignsPage />} />
        <Route path="/map-agents" element={<MapAgentsCampaignsPage />} />
        <Route path="/ivr/agent-list" element={<AgentListPage />} />
        <Route path="/ivr/agent-groups" element={<MapAgentsCampaignsPage />} />
        <Route path="/ivr/map-agents" element={<MapAgentsCampaignsPage />} />

        {/* Campaigns */}
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/campaigns" element={<CampaignPage />} />
        <Route path="/ivr/campaigns" element={<CampaignPage />} />

        {/* Reports Module */}
        <Route path="/reports" element={<ReportsLayout />}>
          <Route index element={<Navigate to="/reports/one-view" replace />} />
          <Route path="one-view" element={<OneViewPage />} />
          <Route path="cc-reports" element={<CCReportsPage />} />
          <Route path="field-reports" element={<FieldReportsPage />} />
          <Route path="digital-engagement" element={<DigitalEngagementPage />} />
          <Route path="call-recordings" element={<CallRecordingsPage />} />
        </Route>
        <Route path="/reports/whatsapp-messages" element={<WhatsAppMessagesPage />} />
        <Route path="/whatsapp-messages" element={<WhatsAppMessagesPage />} />

        {/* IVR Reports Route */}
        <Route path="/ivr/reports" element={<ReportsLayout />}>
          <Route index element={<Navigate to="/reports/one-view" replace />} />
          <Route path="one-view" element={<OneViewPage />} />
          <Route path="cc-reports" element={<CCReportsPage />} />
          <Route path="field-reports" element={<FieldReportsPage />} />
          <Route path="digital-engagement" element={<DigitalEngagementPage />} />
          <Route path="call-recordings" element={<CallRecordingsPage />} />
        </Route>
        <Route path="/ivr/:tab" element={<IVRPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
