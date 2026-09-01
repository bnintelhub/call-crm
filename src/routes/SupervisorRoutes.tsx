import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SupervisorLayout from '../layouts/supervisor/SupervisorLayout';
import Dashboard from '../pages/supervisor/Dashboard';
import Agents from '../pages/supervisor/Agents';
import Allocation from '../pages/supervisor/Allocation';
import Campaign from '../pages/supervisor/Campaign';
import IVRPage from '../pages/supervisor/IVRPage';
import Reports from '../pages/supervisor/Reports';
import Settings from '../pages/supervisor/Settings';
import UploadAllocationPage from '../pages/allocation/UploadAllocationPage';
import MapAgentsCampaignsPage from '../pages/agent/MapAgentsCampaignsPage';
import { LEAD_AND_ABOVE } from '../types';

export const SupervisorRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={LEAD_AND_ABOVE} />}>
        <Route element={<SupervisorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="agent-list" element={<Agents />} />
          <Route path="agents/map-campaigns" element={<MapAgentsCampaignsPage />} />
          <Route path="allocation" element={<Allocation />} />
          <Route path="allocation/upload-allocation" element={<UploadAllocationPage />} />
          <Route path="campaign" element={<Campaign />} />
          <Route path="campaigns" element={<Campaign />} />
          <Route path="ivr" element={<IVRPage />} />
          <Route path="ivr/:tab" element={<IVRPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SupervisorRoutes;
