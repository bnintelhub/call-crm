import React from 'react';
import { HelpCircle } from 'lucide-react';

interface NavbarHelpProps {
  onClick?: () => void;
}

export const NavbarHelp: React.FC<NavbarHelpProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      className="nav-help-btn"
      onClick={onClick}
      title="Help & Documentation"
    >
      <HelpCircle size={17} className="nav-help-icon" />
      <span className="nav-help-text">Help</span>
    </button>
  );
};

export default NavbarHelp;
