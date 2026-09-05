import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar';
import SupervisorHeader from './SupervisorHeader';
import '../shared/Layout.css';

export const SupervisorLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      <SupervisorSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <SupervisorHeader toggleSidebar={toggleSidebar} />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SupervisorLayout;
