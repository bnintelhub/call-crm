import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Upload, Target, Wallet, Building2, Users, BarChart3,
  PhoneCall, AlertTriangle, FileSpreadsheet, X, MessageSquare,
  Activity, ClipboardList, TrendingUp, Shield, UserCircle, FilePlus, Send, History
} from 'lucide-react';
import './Layout.css';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const { user } = useAuthStore();
  const location = useLocation();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-expand if on that route
    if (location.pathname.startsWith('/my-data')) {
      setExpanded(prev => ({ ...prev, '/my-data': true }));
    }
  }, [location.pathname]);

  const getNavSections = () => {
    const role = user?.role;



    const sections: { title: string; items: { path: string; label: string; icon: React.ReactNode; subItems?: any[] }[] }[] = [];

    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
            { path: '/performance', label: 'Performance', icon: <TrendingUp size={20} /> },
          ]
        },
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-admin', label: 'All EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ]
        },
        {
          title: 'DATA OPERATIONS',
          items: [
            { path: '/companies', label: 'Companies', icon: <Building2 size={20} /> },
            { path: '/bulk-upload', label: 'Bulk Upload', icon: <Upload size={20} /> },
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/payments', label: 'Daily Payments', icon: <Wallet size={20} /> },
          ]
        },
        {
          title: 'COMMUNICATION & EXPORT',
          items: [
            { path: '/campaigns', label: 'Campaigns', icon: <MessageSquare size={20} /> },
            { path: '/export', label: 'Export Data', icon: <FileSpreadsheet size={20} /> },
          ]
        },
        {
          title: 'SYSTEM',
          items: [
            { path: '/users', label: 'User Management', icon: <Users size={20} /> },
          ]
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ]
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
          ]
        },
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-admin', label: 'All EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/eod-om-generate', label: 'Generate My EOD', icon: <FilePlus size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ]
        },
        {
          title: 'OPERATIONS',
          items: [
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/users', label: 'Team Management', icon: <Users size={20} /> },
          ]
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ]
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
          ]
        },
        {
          title: 'MONITORING',
          items: [
            { path: '/monitoring', label: 'Live Monitoring', icon: <Activity size={20} /> },
            { path: '/eod-team', label: 'Team EOD Records', icon: <ClipboardList size={20} /> },
            { path: '/eod-tl-submit', label: 'Submit Team EOD', icon: <Send size={20} /> },
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
          ]
        },
        {
          title: 'OPERATIONS',
          items: [
            { path: '/allocation', label: 'Data Allocation', icon: <Target size={20} /> },
            { path: '/escalations', label: 'Escalations', icon: <AlertTriangle size={20} /> },
          ]
        },
        {
          title: 'COMMUNICATION',
          items: [
            { path: '/campaigns', label: 'Campaigns', icon: <MessageSquare size={20} /> },
          ]
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ]
        }
      );
    } else if (role === 'TELECALLER') {
      sections.push(
        {
          title: 'MAIN',
          items: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { 
              path: '/my-data', 
              label: 'My Calling Data', 
              icon: <PhoneCall size={20} />,
              subItems: [
                { path: '/my-data', label: 'All Accounts', query: 'tab=All', default: true },
                { path: '/my-data?tab=FollowUp', label: 'Follow up Accounts', query: 'tab=FollowUp', default: false },
                { path: '/my-data?tab=Expired', label: 'Expired Accounts', query: 'tab=Expired', default: false },
              ]
            },
          ]
        },
        {
          title: 'REPORTS',
          items: [
            { path: '/call-history', label: 'Call History', icon: <History size={20} /> },
            { path: '/submit-eod', label: 'Submit EOD', icon: <ClipboardList size={20} /> },
          ]
        },
        {
          title: 'ACCOUNT',
          items: [
            { path: '/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
          ]
        }
      );
    }

    return sections;
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
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

        <nav className="sidebar-nav">
          {getNavSections().map((section) => (
            <div key={section.title} className="nav-section-group">
              <div className="nav-section-label">{section.title}</div>
              <ul>
                {section.items.map((item: any) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'active' : ''}`}
                      onClick={(e) => {
                        if (item.subItems) {
                          setExpanded(prev => ({ ...prev, [item.path]: !prev[item.path] }));
                        }
                        if (window.innerWidth <= 768 && !item.subItems) toggleSidebar();
                      }}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>
                      {item.subItems && (
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded[item.path] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      )}
                      {!item.subItems && (location.pathname === item.path || location.pathname.startsWith(item.path + '/')) && <span className="nav-active-dot" />}
                    </Link>
                    {item.subItems && expanded[item.path] && (
                      <ul style={{ listStyle: 'none', paddingLeft: '3.25rem', marginTop: '0.25rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {item.subItems.map((sub: any) => (
                          <li key={sub.path}>
                            <Link 
                              to={sub.path}
                              style={{ 
                                textDecoration: 'none', 
                                color: location.search.includes(sub.query) || (!location.search && sub.default) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                fontWeight: location.search.includes(sub.query) || (!location.search && sub.default) ? '600' : '400',
                                display: 'block',
                                transition: 'color 0.2s'
                              }}
                              onClick={() => {
                                if (window.innerWidth <= 768) toggleSidebar();
                              }}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
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
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
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
