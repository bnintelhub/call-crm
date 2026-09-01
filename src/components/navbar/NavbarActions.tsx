import React from 'react';
import { Sun, Moon } from 'lucide-react';
import NavbarStatusToggle from './NavbarStatusToggle';
import NavbarHelp from './NavbarHelp';
import OrganizationIdentity from './OrganizationIdentity';
import UserAvatar from './UserAvatar';
import { useLiveStatusStore } from '../../store/liveStatusStore';
import { useThemeStore } from '../../store/themeStore';
import type { User } from '../../types';

interface NavbarActionsProps {
  user: User | null;
  onLogout: () => void;
  onHelpClick?: () => void;
}

export const NavbarActions: React.FC<NavbarActionsProps> = ({
  user,
  onLogout,
  onHelpClick,
}) => {
  const { isLive, setLive } = useLiveStatusStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="navbar-actions-container">
      {/* 1. Online/Offline Toggle */}
      <NavbarStatusToggle
        isOnline={isLive}
        onToggle={setLive}
      />

      {/* 2. Status Badge */}
      <div className={`nav-status-badge ${isLive ? 'badge-online' : 'badge-offline'}`}>
        <span className="nav-status-dot" />
        <span className="nav-status-text">{isLive ? 'Online' : 'Offline'}</span>
      </div>

      {/* 3. Theme Toggle */}
      <button
        type="button"
        className="nav-theme-btn"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={17} className="nav-theme-icon" /> : <Moon size={17} className="nav-theme-icon" />}
      </button>

      {/* 4. Help Button */}
      <NavbarHelp onClick={onHelpClick} />

      <div className="nav-actions-separator" />

      {/* 4. Company/Organization Branding Section */}
      <OrganizationIdentity />

      {/* 5. User Profile Avatar */}
      <UserAvatar
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
};

export default NavbarActions;
