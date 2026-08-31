import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Search, Sun, Moon, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationBell from '../ui/NotificationBell';
import ActivityMonitorWidget from '../monitoring/ActivityMonitorWidget';
import Modal from '../ui/Modal';
import { useRef, useEffect, useState, useCallback } from 'react';
import { searchApi } from '../../services/api';

interface SearchResult {
  loans: { id: string; loanNumber: string; borrowerName: string; allocationStatus: string }[];
  users: { id: string; name: string; email: string; role: string }[];
  companies: { id: string; name: string; isActive: boolean }[];
  pages: { title: string; path: string }[];
}

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

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ loans: [], users: [], companies: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced Search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ loans: [], users: [], companies: [], pages: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const q = query.toLowerCase();
        // Local search for pages
        const matchedPages = PAGE_ROUTES.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.keywords.some(k => k.includes(q))
        ).slice(0, 3); // Max 3 page results

        // Backend search
        const data = await searchApi.globalSearch(query);
        
        setResults({
          ...data,
          pages: matchedPages
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (path: string) => {
    setShowDropdown(false);
    setQuery('');
    navigate(path);
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
          {user?.role && (
            <span className={`badge ${roleBadgeClass[user.role] || 'badge-info'}`} style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
              <Shield size={9} /> {user.role.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search" ref={searchRef}>
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search loans, users, companies..." 
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.length >= 2) setShowDropdown(true);
            }}
          />
          
          {showDropdown && query.length >= 2 && (
            <div className="search-dropdown">
              {isSearching ? (
                <div className="search-status">Searching...</div>
              ) : (
                <>
                  {results.pages.length > 0 && (
                    <div className="search-category">
                      <div className="search-category-title">Pages</div>
                      {results.pages.map(page => (
                        <div 
                          key={page.path} 
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(page.path)}
                        >
                          <span className="search-item-primary">{page.title}</span>
                          <span className="search-item-secondary">Navigation</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.loans.length > 0 && (
                    <div className="search-category">
                      <div className="search-category-title">Loans</div>

                      {results.loans.map(loan => (
                        <div 
                          key={loan.id} 
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(`/loans/${loan.id}`)}
                        >
                          <span className="search-item-primary">{loan.loanNumber}</span>
                          <span className="search-item-secondary">{loan.borrowerName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div className="search-category">
                      <div className="search-category-title">Users</div>
                      {results.users.map(u => (
                        <div 
                          key={u.id} 
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(`/users?search=${encodeURIComponent(u.name)}`)}
                        >
                          <span className="search-item-primary">{u.name}</span>
                          <span className="search-item-secondary">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.companies.length > 0 && (
                    <div className="search-category">
                      <div className="search-category-title">Companies</div>
                      {results.companies.map(c => (
                        <div 
                          key={c.id} 
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(`/companies`)}
                        >
                          <span className="search-item-primary">{c.name}</span>
                          <span className="search-item-secondary">{c.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {results.loans.length === 0 && results.users.length === 0 && results.companies.length === 0 && results.pages.length === 0 && (
                    <div className="search-status">No results found</div>
                  )}
                </>
              )}
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
