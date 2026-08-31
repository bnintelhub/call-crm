import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, AlertTriangle, Clock, X, UserX, FileText } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { InactivityAlert } from '../../types';
import './ui.css';

interface NotificationItem {
  id: string;
  type: 'INACTIVITY' | 'EOD_SUBMITTED' | 'SYSTEM' | 'FORCED_LOGOUT';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Global shared socket (singleton)
let globalSocket: Socket | null = null;
export const getSocket = () => globalSocket;

export default function NotificationBell() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadFromServer, setUnreadFromServer] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const unreadLocal = notifications.filter(n => !n.isRead).length;
  const unreadCount = unreadLocal + unreadFromServer;

  // Fetch initial unread count from server
  useEffect(() => {
    if (!token) return;
    fetch('/api/monitoring/unread-count', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setUnreadFromServer(d.count || 0)).catch(() => {});
  }, [token]);

  // Socket connection
  useEffect(() => {
    if (!token || !user) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true });
    socketRef.current = socket;
    globalSocket = socket;

    socket.on('connect', () => {
      socket.emit('user:join', {
        userId: user.id,
        role: user.role,
        name: user.name,
        teamLeadId: user.teamLeadId,
        operationsManagerId: user.operationsManagerId
      });
    });

    // Inactivity alert from server
    socket.on('activity:inactive_alert', (data: { alert: InactivityAlert; message: string }) => {
      setNotifications(prev => [{
        id: data.alert.id,
        type: 'INACTIVITY',
        title: `⚠️ Inactivity Alert`,
        message: `${data.alert.user.name} inactive for ${data.alert.durationMin} min`,
        isRead: false,
        createdAt: data.alert.createdAt
      }, ...prev]);
      setUnreadFromServer(0); // Clear server count, now tracking locally
    });

    // EOD report submitted
    socket.on('eod:report_submitted', (data: any) => {
      setNotifications(prev => [{
        id: `eod_${Date.now()}`,
        type: 'EOD_SUBMITTED',
        title: 'EOD Report Submitted',
        message: `${data.telecaller.name} — ${data.totalCalls} calls, ${data.ptpCount} PTP`,
        isRead: false,
        createdAt: new Date().toISOString()
      }, ...prev]);
    });

    // Config updated
    socket.on('monitoring:config_updated', () => {
      setNotifications(prev => [{
        id: `cfg_${Date.now()}`,
        type: 'SYSTEM',
        title: 'Monitoring Config Updated',
        message: 'Admin updated inactivity settings',
        isRead: false,
        createdAt: new Date().toISOString()
      }, ...prev]);
    });

    // Forced logout
    socket.on('user:logout_forced', () => {
      logout();
      navigate('/login');
    });

    return () => {
      socket.disconnect();
      globalSocket = null;
    };
  }, [token, user, logout, navigate]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // Call server for inactivity alerts
    fetch(`/api/monitoring/alerts/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadFromServer(0);
    fetch('/api/monitoring/alerts/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    INACTIVITY:     { icon: <UserX size={14} />,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    EOD_SUBMITTED:  { icon: <FileText size={14} />,    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    SYSTEM:         { icon: <Bell size={14} />,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    FORCED_LOGOUT:  { icon: <AlertTriangle size={14} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications {unreadCount > 0 && <span className="badge badge-danger" style={{fontSize:'0.6rem',marginLeft:'4px'}}>{unreadCount} new</span>}</h4>
            <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
              {unreadCount > 0 && (
                <button className="btn btn-sm btn-outline" onClick={markAllAsRead} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button className="modal-close-btn" onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
          </div>

          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 160, padding: '2rem' }}>
                <Bell size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '0.9375rem' }}>No notifications</h3>
                <p style={{ fontSize: '0.8125rem' }}>You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 30).map((n) => {
                const tc = typeConfig[n.type] || typeConfig.SYSTEM;
                return (
                  <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n.id)}>
                    <div className="notification-item-icon" style={{ background: tc.bg, color: tc.color }}>{tc.icon}</div>
                    <div className="notification-item-content">
                      <p><strong>{n.title}</strong></p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{n.message}</p>
                      <span className="notification-item-time"><Clock size={10} /> {timeAgo(n.createdAt)}</span>
                    </div>
                    {!n.isRead && <span className="dot" style={{ background: '#ef4444', width: 7, height: 7, flexShrink: 0 }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
