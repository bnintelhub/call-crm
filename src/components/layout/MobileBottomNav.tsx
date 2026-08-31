import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, PhoneCall, ClipboardList, User, History } from 'lucide-react';

/**
 * Mobile Bottom Navigation — Only shown for Telecallers on mobile.
 * Provides thumb-friendly quick access to the 4 core pages.
 */
export default function MobileBottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();

  // Only telecallers get bottom nav
  if (user?.role !== 'TELECALLER') return null;

  const tabs = [
    { path: '/dashboard',             label: 'Home',     icon: <LayoutDashboard size={20} /> },
    { path: '/my-data',      label: 'Call Data', icon: <PhoneCall size={20} /> },
    { path: '/call-history', label: 'History',  icon: <History size={20} /> },
    { path: '/eod-submit',   label: 'EOD',      icon: <ClipboardList size={20} /> },
    { path: '/profile',      label: 'Profile',  icon: <User size={20} /> },
  ];

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path ||
          (tab.path === '/my-data' && location.pathname.startsWith('/my-data')) ||
          (tab.path === '/call-history' && location.pathname.startsWith('/call-history'));
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`mob-nav-tab ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mob-nav-icon">{tab.icon}</span>
            <span className="mob-nav-label">{tab.label}</span>
            {isActive && <span className="mob-nav-indicator" />}
          </Link>
        );
      })}
    </nav>
  );
}
