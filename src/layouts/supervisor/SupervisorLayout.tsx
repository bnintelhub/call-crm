import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar';
import SupervisorHeader from './SupervisorHeader';
import '../shared/Layout.css';

export const SupervisorLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout">
      <SupervisorSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="layout-main">
        <SupervisorHeader toggleSidebar={toggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;
