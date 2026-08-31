import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import type { User as UserType } from '../../types';

interface UserAvatarProps {
  user: UserType | null;
  onLogout: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'B';

  return (
    <div className="nav-user-avatar-wrap" ref={dropdownRef}>
      <button
        type="button"
        className={`nav-user-avatar-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div className="nav-user-avatar-circle">
          <span>{initial}</span>
        </div>
      </button>

      {isOpen && (
        <div className="nav-user-dropdown-menu">
          <div className="nav-user-dropdown-header">
            <div className="nav-user-dropdown-avatar">
              <span>{initial}</span>
            </div>
            <div className="nav-user-dropdown-meta">
              <span className="nav-user-dropdown-name">{user?.name || 'User'}</span>
              <span className="nav-user-dropdown-email">{user?.email || 'admin@demo.com'}</span>
              {user?.role && (
                <span className="nav-user-role-badge">
                  <Shield size={10} />
                  {user.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          <div className="nav-user-dropdown-divider" />

          <div className="nav-user-dropdown-items">
            <Link
              to="/profile"
              className="nav-user-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <User size={15} />
              <span>My Profile</span>
            </Link>

            <Link
              to="/profile"
              className="nav-user-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={15} />
              <span>Settings</span>
            </Link>

            <div className="nav-user-dropdown-divider" />

            <button
              type="button"
              className="nav-user-dropdown-item nav-logout-item"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
