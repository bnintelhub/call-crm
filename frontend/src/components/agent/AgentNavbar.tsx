import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface AgentNavbarProps {
  onOpenHelp?: () => void;
}

export const AgentNavbar: React.FC<AgentNavbarProps> = ({ onOpenHelp }) => {
  return (
    <header className="agent-map-navbar">
      {/* Left side: Logo + Brand name + Nav links */}
      <div className="agent-map-navbar-left">
        <Link to="/dashboard" className="agent-map-brand-link">
          <div className="agent-map-brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#8B1E2D" />
              <path d="M2 17L12 22L22 17" stroke="#8B1E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#8B1E2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="agent-map-brand-name">BN ASSOCIATES</span>
        </Link>

        <nav className="agent-map-nav-links">
          <Link to="/dashboard" className="agent-map-nav-item">
            Home
          </Link>

          <Link to="/ivr/allocation-list" className="agent-map-nav-item has-dropdown">
            <span>Allocation</span>
            <ChevronDown size={14} className="nav-dropdown-chevron" />
          </Link>

          <Link to="/agents" className="agent-map-nav-item active">
            <span>Agent</span>
          </Link>

          <div className="agent-map-nav-item has-dropdown">
            <span>More</span>
            <ChevronDown size={14} className="nav-dropdown-chevron" />
          </div>
        </nav>
      </div>

      {/* Right side: Status toggle, Offline badge, Help, Org & User Avatar */}
      <div className="agent-map-navbar-right">
        {/* Toggle switch */}
        <div className="agent-map-status-toggle" title="Connection Status">
          <div className="agent-map-toggle-pill">
            <span className="agent-map-toggle-thumb" />
          </div>
        </div>

        {/* Offline status badge */}
        <div className="agent-map-offline-badge">
          <span className="agent-map-offline-dot" />
          <span className="agent-map-offline-text">Offline</span>
        </div>

        {/* Help option */}
        <button type="button" className="agent-map-help-btn" onClick={onOpenHelp} title="Help & Support">
          <HelpCircle size={16} className="agent-map-help-icon" />
          <span className="agent-map-help-text">Help</span>
        </button>

        <div className="agent-map-nav-divider" />

        {/* Organization Moneyview */}
        <div className="agent-map-org-badge">
          <div className="agent-map-org-icon">
            <span className="agent-map-org-letter">M</span>
          </div>
          <span className="agent-map-org-name">Moneyview</span>
          <ChevronDown size={14} className="agent-map-org-chevron" />
        </div>

        {/* User avatar B */}
        <div className="agent-map-user-avatar-btn" title="User Profile: B">
          <div className="agent-map-user-avatar">
            <span>B</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgentNavbar;
