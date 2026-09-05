import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers, PhoneCall, MapPin, Send, Volume2, ChevronLeft, ChevronRight
} from 'lucide-react';

interface ReportsSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ReportsSidebar: React.FC<ReportsSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      to: '/reports/one-view',
      label: 'One View',
      icon: <Layers size={17} />,
    },
    {
      to: '/reports/cc-reports',
      label: 'CC Reports',
      icon: <PhoneCall size={17} />,
    },
    {
      to: '/reports/field-reports',
      label: 'Field Reports',
      icon: <MapPin size={17} />,
    },
    {
      to: '/reports/digital-engagement',
      label: 'Digital Engagement Reports',
      icon: <Send size={17} />,
    },
    {
      to: '/reports/call-recordings',
      label: 'Call Recordings',
      icon: <Volume2 size={17} />,
    },
  ];

  return (
    <aside className={`yucollect-reports-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="reports-sidebar-header">
        {!isCollapsed && <span className="reports-sidebar-title">REPORTS</span>}
        {onToggleCollapse && (
          <button
            type="button"
            className="reports-sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <nav className="reports-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `reports-sidebar-link ${isActive ? 'active' : ''}`
            }
            title={item.label}
          >
            <span className="reports-sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span className="reports-sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default ReportsSidebar;
