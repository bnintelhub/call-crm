import React from 'react';
import { Outlet } from 'react-router-dom';
import './Reports.css';

export const ReportsLayout: React.FC = () => {
  return (
    <div className="yucollect-reports-container">
      <main className="yucollect-reports-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ReportsLayout;
