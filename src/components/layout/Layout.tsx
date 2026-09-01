import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { socketService } from '../../services/socketService';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import FloatingAction from './FloatingAction';
import './Layout.css';

export default function Layout({ requiredRole }: { requiredRole?: string }) {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const isTelecallerMobile = user?.role === 'TELECALLER';

  // Manage socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect(user.id, user.role, user.name);
    } else {
      socketService.disconnect();
    }

    return () => {
      // Disconnect when layout unmounts (e.g. user logs out and is redirected to /login)
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requiredRole === 'ADMIN_OR_LEAD' && user?.role === 'TELECALLER') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && requiredRole !== 'ANY' && requiredRole !== 'ADMIN_OR_LEAD' && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`app-container ${isTelecallerMobile ? 'telecaller-mode' : ''}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className={`content-wrapper ${isTelecallerMobile ? 'has-bottom-nav' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav — Telecaller only */}
      <MobileBottomNav />

      {/* Global Floating Action Button */}
      <FloatingAction />
    </div>
  );
}
