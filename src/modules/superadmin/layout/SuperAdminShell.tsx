import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Layers, Gauge, ScrollText, LogOut, Menu, X, Sun, Moon, Shield,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import '../../../layouts/shared/Layout.css';
import '../SuperAdmin.css';

const NAV = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin/companies', label: 'Companies', icon: Building2 },
  { to: '/superadmin/plans', label: 'Plans', icon: Layers },
  { to: '/superadmin/usage', label: 'Usage', icon: Gauge },
  { to: '/superadmin/audit', label: 'Audit logs', icon: ScrollText },
];

export default function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(window.innerWidth > 768);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">BN</div>
            <div className="brand-text">
              <span className="brand-name">BNORBIT</span>
              <span className="brand-sub sa-brand-sub">Super Admin</span>
            </div>
          </div>
          <button className="sidebar-close-mobile" type="button" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-group">
            <div className="nav-section-label">Platform</div>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 768) setOpen(false);
                    }}
                  >
                    <span className="nav-icon"><item.icon size={20} /></span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/superadmin/dashboard" className="sidebar-user-card" style={{ textDecoration: 'none' }}>
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() ?? 'S'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name ?? 'Super Admin'}</span>
              <span className="sidebar-user-role">Platform owner</span>
            </div>
          </Link>
        </div>
      </aside>

      <main className={`main-content ${open ? 'sidebar-open' : ''}`}>
        <header className="top-header">
          <div className="header-left">
            <button className="header-btn menu-toggle" type="button" onClick={() => setOpen((v) => !v)}>
              <Menu size={20} />
            </button>
            <div className="header-greeting">
              <span className="greeting-name">BNORBIT Control Plane</span>
              <span className="greeting-text">Companies · modules · seats · subscription</span>
            </div>
          </div>
          <div className="header-right sa-header-actions">
            <span className="badge badge-primary"><Shield size={12} /> Super Admin</span>
            <button className="header-btn" type="button" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="header-btn logout-btn" type="button" onClick={handleLogout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}
