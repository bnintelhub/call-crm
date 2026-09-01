import React from 'react';
import NavbarStatusToggle from './NavbarStatusToggle';
import NavbarHelp from './NavbarHelp';
import OrganizationIdentity from './OrganizationIdentity';
import UserAvatar from './UserAvatar';
import { useAuthStore } from '../../store/authStore';
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
  const { isOnline, setIsOnline } = useAuthStore();

  return (
    <div className="navbar-actions-container">
      {/* 1. Online/Offline Toggle */}
      <NavbarStatusToggle
        isOnline={isOnline}
        onToggle={setIsOnline}
      />

      {/* 2. Status Badge */}
      <div className={`nav-status-badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
        <span className="nav-status-dot" />
        <span className="nav-status-text">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* 3. Help Button */}
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
