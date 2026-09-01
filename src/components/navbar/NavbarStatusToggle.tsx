import React from 'react';

interface NavbarStatusToggleProps {
  isOnline: boolean;
  onToggle: (newState: boolean) => void;
}

export const NavbarStatusToggle: React.FC<NavbarStatusToggleProps> = ({
  isOnline,
  onToggle,
}) => {
  return (
    <div className="nav-toggle-wrapper" onClick={() => onToggle(!isOnline)} title={`Switch to ${isOnline ? 'Offline' : 'Online'}`}>
      <div className={`nav-toggle-track ${isOnline ? 'online' : 'offline'}`}>
        <span className="nav-toggle-thumb" />
      </div>
    </div>
  );
};

export default NavbarStatusToggle;
