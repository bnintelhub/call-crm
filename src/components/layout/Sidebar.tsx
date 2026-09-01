import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Upload, Target, Wallet, Building2, Users, BarChart3,
  PhoneCall, AlertTriangle, FileSpreadsheet, X, MessageSquare,
  Activity, ClipboardList, TrendingUp, UserCircle, FilePlus, Send, History,
  ChevronDown, Layers, UserCheck, Award, GraduationCap, Star, MoreHorizontal, Headphones,
  MapPin, Volume2
} from 'lucide-react';
import './Layout.css';

export interface NavSubItem {
  path?: string;
  label: string;
  icon?: React.ReactNode;
  children?: { path: string; label: string; icon?: React.ReactNode }[];
}

export interface NavItem {
  path?: string;
  label: string;
  icon: React.ReactNode;
  children?: NavSubItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const getNavSections = (): NavSection[] => {
    const role = user?.role;

    const ivrSection: NavSection = {
      title: 'IVR CALL',
      items: [
        {
          label: 'Allocation',
          icon: <Layers size={20} />,
          children: [
            { path: '/ivr/allocation-list', label: 'Allocation List', icon: <ClipboardList size={16} /> },
          ],
        },
        {
          label: 'Agent',
          icon: <Headphones size={20} />,
          children: [
            { path: '/ivr/agent-list', label: 'Agent List', icon: <UserCheck size={16} /> },
            { path: '/ivr/agent-groups', label: 'Agent Groups', icon: <Users size={16} /> },
            { path: '/ivr/campaigns', label: 'Campaigns', icon: <MessageSquare size={16} /> },
            { path: '/ivr/incentives', label: 'Incentives', icon: <Award size={16} /> },
          ],
        },
        {
          label: 'More',
          icon: <MoreHorizontal size={20} />,
          children: [
            { path: '/ivr/training', label: 'Training', icon: <GraduationCap size={16} /> },
            {
              label: 'Reports',
              icon: <BarChart3 size={16} />,
              children: [
                { path: '/ivr/reports/one-view', label: 'One View', icon: <Layers size={16} /> },
                { path: '/ivr/reports/cc-reports', label: 'CC Reports', icon: <PhoneCall size={16} /> },
                { path: '/ivr/reports/field-reports', label: 'Field Reports', icon: <MapPin size={16} /> },
                { path: '/ivr/reports/digital-engagement', label: 'Digital Engagement Report', icon: <Send size={16} /> },
                { path: '/ivr/reports/call-recordings', label: 'Call Recordings', icon: <Volume2 size={16} /> },
              ],
            },
            { path: '/ivr/score', label: 'Score', icon: <Star size={16} /> },
          ],
        },
      ],
    };

    const sections: NavSection[] = [];

    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
            { path: '/performance', label: 'Performance', icon: <TrendingUp size={20} /> },
          ],
        },
        ivrSection,
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-admin', label: 'All EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ],
        },
        {
          title: 'DATA OPERATIONS',
          items: [
            { path: '/companies', label: 'Companies', icon: <Building2 size={20} /> },
            { path: '/bulk-upload', label: 'Bulk Upload', icon: <Upload size={20} /> },
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/payments', label: 'Daily Payments', icon: <Wallet size={20} /> },
          ],
        },
        {
          title: 'COMMUNICATION & EXPORT',
          items: [
            { path: '/campaigns', label: 'Campaigns', icon: <MessageSquare size={20} /> },
            { path: '/export', label: 'Export Data', icon: <FileSpreadsheet size={20} /> },
          ],
        },
        {
          title: 'SYSTEM',
          items: [
            { path: '/users', label: 'User Management', icon: <Users size={20} /> },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ],
        }
      );
    } else if (role === 'OPERATIONS_MANAGER') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
            { path: '/performance', label: 'Performance', icon: <TrendingUp size={20} /> },
          ],
        },
        ivrSection,
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-admin', label: 'All EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/eod-om-generate', label: 'Generate My EOD', icon: <FilePlus size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ],
        },
        {
          title: 'OPERATIONS',
          items: [
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/users', label: 'Team Management', icon: <Users size={20} /> },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ],
        }
      );
    } else if (role === 'TEAM_LEAD') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/my-data', label: 'My Calling Data', icon: <PhoneCall size={20} /> },
            { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
            { path: '/team-performance', label: 'Team Performance', icon: <Users size={20} /> },
            { path: '/performance', label: 'Performance Analytics', icon: <TrendingUp size={20} /> },
          ],
        },
        ivrSection,
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-team', label: 'Team EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/eod-tl-submit', label: 'Submit Team EOD', icon: <Send size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ],
        },
        {
          title: 'OPERATIONS',
          items: [
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/escalations', label: 'Escalations', icon: <AlertTriangle size={20} /> },
          ],
        },
        {
          title: 'COMMUNICATION',
          items: [
            { path: '/campaigns', label: 'Campaigns', icon: <MessageSquare size={20} /> },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ],
        }
      );
    } else if (role === 'TELECALLER') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/my-data', label: 'My Calling Data', icon: <PhoneCall size={20} /> },
          ],
        },
        {
          title: 'REPORTS',
          items: [
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
            { path: '/eod-submit', label: 'Submit EOD', icon: <ClipboardList size={20} /> },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ],
        }
      );
    }

    return sections;
  };

  // Auto-expand dropdown when current route matches child path
  useEffect(() => {
    const currentPath = location.pathname;
    const sections = getNavSections();
    const toOpen: Record<string, boolean> = {};

    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.children?.some((child) => child.path === currentPath)) {
          toOpen[item.label] = true;
        }
        item.children?.forEach((child) => {
          if (child.children?.some((sub) => sub.path === currentPath)) {
            toOpen[item.label] = true;
            toOpen[child.label] = true;
          }
        });
      });
    });

    if (Object.keys(toOpen).length > 0) {
      setOpenDropdowns((prev) => ({ ...prev, ...toOpen }));
    }
  }, [location.pathname]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">BN</div>
            <div className="brand-text">
              <span className="brand-name">BN Associates</span>
              <span className="brand-sub">Telecaller Portal</span>
            </div>
          </div>
          <button className="sidebar-close-mobile" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {getNavSections().map((section) => (
            <div key={section.title} className="nav-section-group">
              <div className="nav-section-label">{section.title}</div>
              <ul>
                {section.items.map((item) => {
                  if (item.children && item.children.length > 0) {
                    const isDropdownOpen = !!openDropdowns[item.label];
                    const isChildActive = item.children.some(
                      (child) =>
                        location.pathname === child.path ||
                        child.children?.some((sub) => location.pathname === sub.path)
                    );

                    return (
                      <li key={item.label} className="nav-dropdown-item">
                        <button
                          type="button"
                          className={`nav-link nav-dropdown-trigger ${isChildActive ? 'child-active' : ''} ${isDropdownOpen ? 'dropdown-open' : ''}`}
                          onClick={() => toggleDropdown(item.label)}
                        >
                          <span className="nav-icon">{item.icon}</span>
                          <span className="nav-label">{item.label}</span>
                          <span className={`nav-chevron ${isDropdownOpen ? 'rotated' : ''}`}>
                            <ChevronDown size={16} />
                          </span>
                        </button>

                        <div className={`nav-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                          <ul className="nav-sub-list">
                            {item.children.map((child) => {
                              // If child has nested children (e.g. Reports -> One View, CC Reports, Field Reports...)
                              if (child.children && child.children.length > 0) {
                                const isSubOpen = !!openDropdowns[child.label];
                                const isSubActive = child.children.some((sc) => location.pathname === sc.path);

                                return (
                                  <li key={child.label} className="nav-sub-item">
                                    <button
                                      type="button"
                                      className={`nav-sub-link nav-sub-dropdown-trigger ${isSubActive ? 'active' : ''} ${isSubOpen ? 'sub-open' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown(child.label);
                                      }}
                                    >
                                      {child.icon && <span className="nav-sub-icon">{child.icon}</span>}
                                      <span className="nav-sub-label">{child.label}</span>
                                      <span className={`nav-chevron ${isSubOpen ? 'rotated' : ''}`} style={{ marginLeft: 'auto' }}>
                                        <ChevronDown size={13} />
                                      </span>
                                    </button>

                                    <div className={`nav-nested-menu ${isSubOpen ? 'show' : ''}`}>
                                      <ul className="nav-nested-list">
                                        {child.children.map((sub) => {
                                          const isSubCurrent = location.pathname === sub.path;
                                          return (
                                            <li key={sub.path} className="nav-nested-item">
                                              <Link
                                                to={sub.path}
                                                className={`nav-nested-link ${isSubCurrent ? 'active' : ''}`}
                                                onClick={() => {
                                                  if (window.innerWidth <= 768) toggleSidebar();
                                                }}
                                              >
                                                {sub.icon && <span className="nav-nested-icon">{sub.icon}</span>}
                                                <span className="nav-nested-label">{sub.label}</span>
                                                {isSubCurrent && <span className="nav-active-dot" />}
                                              </Link>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </li>
                                );
                              }

                              const isCurrent = location.pathname === child.path;
                              return (
                                <li key={child.path || child.label} className="nav-sub-item">
                                  <Link
                                    to={child.path || '#'}
                                    className={`nav-sub-link ${isCurrent ? 'active' : ''}`}
                                    onClick={() => {
                                      if (window.innerWidth <= 768) toggleSidebar();
                                    }}
                                  >
                                    {child.icon && <span className="nav-sub-icon">{child.icon}</span>}
                                    <span className="nav-sub-label">{child.label}</span>
                                    {isCurrent && <span className="nav-active-dot" />}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </li>
                    );
                  }

                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path || item.label}>
                      <Link
                        to={item.path || '#'}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          if (window.innerWidth <= 768) toggleSidebar();
                        }}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        {isActive && <span className="nav-active-dot" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Link to="/profile" className="sidebar-user-card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div className="sidebar-user-avatar" style={{ overflow: 'hidden' }}>
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name || 'User'}</span>
              <span className="sidebar-user-role">
                {user?.role?.replace(/_/g, ' ')}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
