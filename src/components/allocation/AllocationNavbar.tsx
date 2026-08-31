import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface AllocationNavbarProps {
  onOpenHelp?: () => void;
}

export const AllocationNavbar: React.FC<AllocationNavbarProps> = ({ onOpenHelp }) => {
  return (
    <header className="alloc-navbar">
      {/* Left side: Logo + Brand name */}
      <div className="alloc-navbar-left">
        <div className="alloc-brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#8B1E2D" />
            <path d="M2 17L12 22L22 17" stroke="#8B1E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#8B1E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="alloc-brand-name">BN ASSOCIATES</span>
      </div>

      {/* Right side: Status toggle, Offline badge, Help, Org & User Avatar */}
      <div className="alloc-navbar-right">
        {/* Toggle switch */}
        <div className="alloc-status-toggle">
          <div className="alloc-toggle-pill">
            <span className="alloc-toggle-thumb" />
          </div>
        </div>

        {/* Offline status badge */}
        <div className="alloc-offline-badge">
          <span className="alloc-offline-dot" />
          <span className="alloc-offline-text">Offline</span>
        </div>

        {/* Help option */}
        <button type="button" className="alloc-help-btn" onClick={onOpenHelp} title="Help & Support">
          <HelpCircle size={17} className="alloc-help-icon" />
          <span className="alloc-help-text">Help</span>
        </button>

        <div className="alloc-nav-divider" />

        {/* Organization Moneyview */}
        <div className="alloc-org-badge">
          <div className="alloc-org-icon">
            <span className="alloc-org-letter">M</span>
          </div>
          <span className="alloc-org-name">Moneyview</span>
          <ChevronDown size={14} className="alloc-org-chevron" />
        </div>

        {/* User avatar B */}
        <div className="alloc-user-avatar-btn" title="User Profile: B">
          <div className="alloc-user-avatar">
            <span>B</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AllocationNavbar;
