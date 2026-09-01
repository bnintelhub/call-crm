import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Search, Sun, Moon, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationBell from '../../components/shared/NotificationBell';
import ActivityMonitorWidget from '../../components/monitoring/ActivityMonitorWidget';
import Modal from '../../components/shared/Modal';
import { useRef, useEffect, useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const PAGE_ROUTES = [
  { title: 'Dashboard', path: '/', keywords: ['home', 'main', 'dashboard'] },
  { title: 'Reports', path: '/reports', keywords: ['performance', 'stats', 'reports'] },
  { title: 'Live Monitoring', path: '/monitoring', keywords: ['live', 'status', 'monitoring'] },
  { title: 'EOD Reports', path: '/reports/eod', keywords: ['end of day', 'eod', 'daily'] },
  { title: 'Companies', path: '/companies', keywords: ['clients', 'portfolios', 'companies'] },
  { title: 'Bulk Upload', path: '/upload', keywords: ['upload', 'csv', 'import', 'bulk'] },
  { title: 'Data Allocation', path: '/allocation', keywords: ['unallocated', 'allocate', 'data allocation', 'assign', 'unallo'] },
  { title: 'Escalations', path: '/escalations', keywords: ['escalation', 'special case', 'team lead'] },
  { title: 'Daily Payments', path: '/payments', keywords: ['payment', 'upload payment'] },
  { title: 'Campaigns', path: '/campaigns', keywords: ['sms', 'whatsapp', 'campaign'] },
  { title: 'Export Data', path: '/export', keywords: ['download', 'export'] },
  { title: 'User Management', path: '/users', keywords: ['users', 'team', 'staff', 'telecallers'] },
];


export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Track navigation history for back/forward button state
  const historyStack = useRef<string[]>([location.pathname]);
  const historyIndex = useRef<number>(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isNavClick = useRef(false);

  // Profile Image Modal
  const [showImageModal, setShowImageModal] = useState(false);

  // Close modal when navigating
  useEffect(() => {
    setShowImageModal(false);
  }, [location.pathname]);

  // Allocator Dropdown
  const [showAllocatorDropdown, setShowAllocatorDropdown] = useState(false);
  const allocatorRef = useRef<HTMLDivElement>(null);
  const searchParams = new URLSearchParams(location.search);
  const currentAllocator = searchParams.get('allocator');
  
  const allocators = [
    { name: 'Moneyview', color: '#10b981', textColor: '#047857' },
    { name: 'Kissht', color: '#3b82f6', textColor: '#1d4ed8' },
    { name: 'Ring', color: '#6366f1', textColor: '#4338ca' },
    { name: 'Udaan', color: '#f59e0b', textColor: '#b45309' },
    { name: 'TVS Credit', color: '#ef4444', textColor: '#b91c1c' },
    { name: 'Mpokket', color: '#8b5cf6', textColor: '#6d28d9' }
  ];

  // Online Status (now from global store)
  const { isOnline, setIsOnline, activeBreak } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (allocatorRef.current && !allocatorRef.current.contains(event.target as Node)) {
        setShowAllocatorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAllocator = (name: string) => {
    setShowAllocatorDropdown(false);
    navigate(`/my-data?allocator=${name}&tab=All`);
  };

  useEffect(() => {
    if (isNavClick.current) {
      isNavClick.current = false;
      return;
    }
    // New page navigation — trim forward history, push new path
    const stack = historyStack.current.slice(0, historyIndex.current + 1);
    if (stack[stack.length - 1] !== location.pathname) {
      stack.push(location.pathname);
      historyIndex.current = stack.length - 1;
      historyStack.current = stack;
    }
    setCanGoBack(historyIndex.current > 0);
    setCanGoForward(historyIndex.current < historyStack.current.length - 1);
  }, [location.pathname]);

  const handleBack = () => {
    if (historyIndex.current > 0) {
      isNavClick.current = true;
      historyIndex.current--;
      setCanGoBack(historyIndex.current > 0);
      setCanGoForward(true);
      navigate(historyStack.current[historyIndex.current]);
    }
  };

  const handleForward = () => {
    if (historyIndex.current < historyStack.current.length - 1) {
      isNavClick.current = true;
      historyIndex.current++;
      setCanGoBack(true);
      setCanGoForward(historyIndex.current < historyStack.current.length - 1);
      navigate(historyStack.current[historyIndex.current]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };






  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const roleBadgeClass: Record<string, string> = {
    SUPER_ADMIN: 'badge-primary',
    ADMIN: 'badge-primary',
    OPERATIONS_MANAGER: 'badge-warning',
    TEAM_LEAD: 'badge-info',
    TELECALLER: 'badge-success',
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="header-btn menu-toggle" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>

        {/* ✅ Back / Forward Navigation Buttons */}
        <div className="nav-buttons">
          <button
            className={`nav-btn ${canGoBack ? '' : 'nav-btn-disabled'}`}
            onClick={handleBack}
            disabled={!canGoBack}
            title="Go Back"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className={`nav-btn ${canGoForward ? '' : 'nav-btn-disabled'}`}
            onClick={handleForward}
            disabled={!canGoForward}
            title="Go Forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="header-greeting">
          <span className="greeting-text">{getGreeting()},</span>
          <span className="greeting-name">{user?.name}</span>
        </div>
      </div>

      <div className="header-right" style={{ gap: '1rem' }}>
        
        {/* Online/Offline Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div 
            onClick={() => {
              if (activeBreak) {
                // Clicking the toggle when on break cancels the break and goes online
                setIsOnline(true);
              } else {
                setIsOnline(!isOnline);
              }
            }}
            style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: isOnline ? '#10b981' : '#d1d5db',
              position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%', background: 'white',
              position: 'absolute', top: '2px', left: isOnline ? '18px' : '2px',
              transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>
          {activeBreak ? (
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2563eb', background: '#dbeafe', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
              {activeBreak}
            </span>
          ) : (
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: isOnline ? '#10b981' : '#ef4444' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>

        {/* Help */}
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <HelpCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Help</span>
        </button>

        {/* Allocator Switcher */}
        <div style={{ position: 'relative' }} ref={allocatorRef}>
          <button 
            onClick={() => setShowAllocatorDropdown(!showAllocatorDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
              border: currentAllocator ? '1px solid var(--border-color)' : '1px dashed #f97316',
              background: 'var(--bg-card)', color: currentAllocator ? 'var(--text-primary)' : '#f97316',
              fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer'
            }}
          >
            {currentAllocator ? (
              <>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: allocators.find(a => a.name === currentAllocator)?.color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>
                  {currentAllocator.charAt(0)}
                </div>
                {currentAllocator}
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </>
            ) : (
              'Select Allocator'
            )}
          </button>
          
          {showAllocatorDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 0.5rem)', right: '0',
              width: '320px', background: 'var(--bg-card)', borderRadius: '0.75rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)',
              padding: '1rem', zIndex: 50
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                {allocators.map(alloc => (
                  <button
                    key={alloc.name}
                    onClick={() => handleSelectAllocator(alloc.name)}
                    style={{
                      padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer',
                      transition: 'all 0.2s', width: '100%'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = alloc.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${alloc.color}`; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span style={{ color: alloc.textColor, fontWeight: '700', fontSize: '0.875rem' }}>
                      {alloc.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>




        {/* Activity Monitor Widget */}
       

        {/* Theme Toggle */}
        <button
          className="header-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        <div className="header-user">
          <div 
            className="header-avatar" 
            style={{ overflow: 'hidden', cursor: user?.profilePic ? 'pointer' : 'default' }}
            onClick={() => {
              if (user?.profilePic) setShowImageModal(true);
            }}
          >
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="header-btn logout-btn" title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      <Modal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        title="Profile Picture" 
        size="sm"
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          {user?.profilePic && (
            <img 
              src={user.profilePic} 
              alt="Profile Enlarged" 
              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain' }} 
            />
          )}
        </div>
      </Modal>
    </header>
  );
}
