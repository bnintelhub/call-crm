import { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import NavbarActions from '../navbar/NavbarActions';
import './Layout.css';

interface HeaderProps {
  toggleSidebar: () => void;
  onHelpClick?: () => void;
}

export default function Header({ toggleSidebar, onHelpClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Track navigation history for back/forward button state
  const historyStack = useRef<string[]>([location.pathname]);
  const historyIndex = useRef<number>(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isNavClick = useRef(false);

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
      {/* Left Section: Menu Toggle, Back/Forward, Greeting & Role */}
      <div className="header-left">
        <button className="header-btn menu-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>

        {/* Back / Forward Navigation Buttons */}
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

      {/* Right Section: Toggle | Status Badge | Help | Company Identity | User Avatar */}
      <div className="header-right">
        <NavbarActions
          user={user}
          onLogout={handleLogout}
          onHelpClick={onHelpClick}
        />
      </div>
    </header>
  );
}
