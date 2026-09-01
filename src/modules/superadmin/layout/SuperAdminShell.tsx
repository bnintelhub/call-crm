import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Layers,
  Sliders,
  CreditCard,
  Gauge,
  PhoneForwarded,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useSuperAdminStore } from '../store';
import { toast } from '../../../components/shared/Toast';
import '../SuperAdmin.css';

const NAV = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin/companies', label: 'Companies', icon: Building2 },
  { to: '/superadmin/plans', label: 'Plans', icon: Layers },
  { to: '/superadmin/features', label: 'Features', icon: Sliders },
  { to: '/superadmin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/superadmin/usage', label: 'Usage', icon: Gauge },
  { to: '/superadmin/telephony', label: 'Telephony', icon: PhoneForwarded },
  { to: '/superadmin/audit', label: 'Audit Logs', icon: ScrollText },
  { to: '/superadmin/settings', label: 'Settings', icon: Settings },
];

export default function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const companies = useSuperAdminStore((s) => s.companies);
  const impersonatedCompanyId = useSuperAdminStore((s) => s.impersonatedCompanyId);
  const clearImpersonation = useSuperAdminStore((s) => s.clearImpersonation);
  const navigate = useNavigate();

  const [open, setOpen] = useState(window.innerWidth > 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const impersonatedCompany = companies.find((c) => c.id === impersonatedCompanyId);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const expiringCount = companies.filter((c) => {
    const end = new Date(c.endDate);
    const today = new Date();
    const diff = Math.round((end.getTime() - today.getTime()) / 86400000);
    return diff <= 7 && diff >= 0 && (c.status === 'active' || c.status === 'trial');
  }).length;

  const quotaAlertCount = companies.filter((c) => {
    const seatPct = (c.usage.seatsUsed / c.quotas.seats) * 100;
    const minPct = (c.usage.minutesUsed / c.quotas.monthlyMinutes) * 100;
    return seatPct >= 80 || minPct >= 80;
  }).length;

  const filteredCompanies = searchQuery.trim()
    ? companies.filter((c) =>
        `${c.name} ${c.code} ${c.city} ${c.contactEmail}`.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="sa-shell-root">
      {/* Impersonation Floating Top Banner */}
      {impersonatedCompany && (
        <div className="sa-impersonation-bar animate-fade-in">
          <div className="sa-impersonation-content">
            <div className="sa-impersonation-info">
              <UserCheck size={16} />
              <span>
                Currently Impersonating: <strong>{impersonatedCompany.name}</strong> ({impersonatedCompany.code}) · Admin Context Active
              </span>
            </div>
            <div className="sa-impersonation-actions">
              <Link to={`/superadmin/companies/${impersonatedCompany.id}`} className="sa-impersonation-link">
                View Tenant Details
              </Link>
              <button
                type="button"
                className="sa-impersonation-exit-btn"
                onClick={() => {
                  clearImpersonation();
                  toast.info('Exited tenant impersonation session');
                }}
              >
                Exit Impersonation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`sa-sidebar-overlay ${open ? 'active' : ''}`} onClick={() => setOpen(false)} />
      
      {/* Sidebar Navigation */}
      <aside className={`sa-sidebar ${open ? 'open' : ''}`}>
        <div className="sa-sidebar-header">
          <div className="sa-sidebar-brand">
            <div className="sa-brand-logo">BN</div>
            <div className="sa-brand-text">
              <span className="sa-brand-name">BNORBIT</span>
              <span className="sa-brand-sub">SaaS Super Admin</span>
            </div>
          </div>
          <button className="sa-sidebar-close-mobile" type="button" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sa-sidebar-nav">
          <div className="sa-nav-section-group">
            <div className="sa-nav-section-label">Control Plane</div>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `sa-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 768) setOpen(false);
                    }}
                  >
                    <span className="sa-nav-icon"><item.icon size={18} /></span>
                    <span className="sa-nav-label">{item.label}</span>
                    {item.label === 'Companies' && (
                      <span className="sa-nav-badge">{companies.length}</span>
                    )}
                    {item.label === 'Usage' && quotaAlertCount > 0 && (
                      <span className="sa-nav-badge warning">{quotaAlertCount}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-sidebar-user-card">
            <div className="sa-sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() ?? 'S'}
            </div>
            <div className="sa-sidebar-user-info">
              <span className="sa-sidebar-user-name">{user?.name ?? 'Super Admin'}</span>
              <span className="sa-sidebar-user-role">Platform Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`sa-main-content ${open ? 'sidebar-open' : ''} ${impersonatedCompany ? 'with-impersonation-bar' : ''}`}>
        <header className="sa-top-header">
          <div className="sa-header-left">
            <button className="sa-header-btn menu-toggle" type="button" onClick={() => setOpen((v) => !v)}>
              <Menu size={20} />
            </button>
            <div className="sa-header-greeting">
              <span className="sa-greeting-name">BNORBIT Platform Control</span>
              <span className="sa-greeting-text">Multi-Tenant CRM & Telephony Governance</span>
            </div>
          </div>

          {/* Quick Search Tenant Dropdown */}
          <div className="sa-header-search-wrap">
            <div className="sa-quick-search">
              <Search size={15} className="sa-search-icon" />
              <input
                type="text"
                placeholder="Jump to company, code, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />
            </div>
            {showSearchDropdown && searchQuery.trim() && (
              <div className="sa-search-results-dropdown animate-scale-up">
                <div className="sa-search-results-header">Matching Tenants</div>
                {filteredCompanies.length === 0 ? (
                  <div className="sa-search-no-results">No companies matching "{searchQuery}"</div>
                ) : (
                  filteredCompanies.map((c) => (
                    <Link
                      key={c.id}
                      to={`/superadmin/companies/${c.id}`}
                      className="sa-search-result-item"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                    >
                      <div>
                        <strong>{c.name}</strong>
                        <small>{c.code} · {c.city}</small>
                      </div>
                      <span className={`badge badge-sm badge-${c.status === 'active' ? 'success' : 'warning'}`}>
                        {c.status}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions */}
          <div className="sa-header-right">
            <Link to="/superadmin/companies/new" className="btn btn-primary btn-sm sa-quick-create-btn">
              <Plus size={15} /> New Company
            </Link>

            {/* Notification Center */}
            <div className="sa-notification-wrapper">
              <button
                type="button"
                className="sa-header-btn"
                onClick={() => setShowNotifications((v) => !v)}
                title="Platform Alerts"
              >
                <Bell size={18} />
                {(expiringCount > 0 || quotaAlertCount > 0) && (
                  <span className="sa-notification-dot" />
                )}
              </button>

              {showNotifications && (
                <div className="sa-notification-menu animate-scale-up">
                  <div className="sa-notification-menu-header">
                    <h4>Platform Alerts</h4>
                    <span className="sa-badge-count">{expiringCount + quotaAlertCount} Alerts</span>
                  </div>
                  <div className="sa-notification-list">
                    {expiringCount > 0 && (
                      <Link
                        to="/superadmin/dashboard"
                        className="sa-notification-item warning"
                        onClick={() => setShowNotifications(false)}
                      >
                        <AlertTriangle size={16} />
                        <div>
                          <strong>{expiringCount} Tenants Expiring Soon</strong>
                          <p>Subscriptions expiring within 7 days require renewal.</p>
                        </div>
                      </Link>
                    )}
                    {quotaAlertCount > 0 && (
                      <Link
                        to="/superadmin/usage"
                        className="sa-notification-item danger"
                        onClick={() => setShowNotifications(false)}
                      >
                        <Gauge size={16} />
                        <div>
                          <strong>{quotaAlertCount} Quota Alerts (80%+)</strong>
                          <p>Tenants near seat or call minutes quota limit.</p>
                        </div>
                      </Link>
                    )}
                    <div className="sa-notification-item success">
                      <CheckCircle2 size={16} />
                      <div>
                        <strong>All SIP Trunks Operational</strong>
                        <p>Tata Tele & Airtel gateways operating at 18ms latency.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="sa-header-btn" type="button" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="sa-header-btn logout-btn" type="button" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="sa-content-wrapper">{children}</div>
      </main>
    </div>
  );
}
