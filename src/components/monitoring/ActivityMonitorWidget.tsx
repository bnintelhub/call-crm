import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, AlertCircle } from 'lucide-react';
import type { MonitoringConfig } from '../../types';
import './ActivityMonitorWidget.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HEARTBEAT_INTERVAL = 30_000; // 30s
const CHECK_INTERVAL = 10_000;     // check every 10s

function isInLunchWindow(start: string, end: string): boolean {
  const now = new Date();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return nowMin >= startMin && nowMin <= endMin;
}

export default function ActivityMonitorWidget() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'LUNCH'>('ACTIVE');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(30);

  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentStatusRef = useRef<'ACTIVE' | 'INACTIVE' | 'LUNCH'>('ACTIVE');

  // Fetch monitoring config + today's already-logged active time
  useEffect(() => {
    if (!token || !user) return;

    // Load monitoring config
    fetch(`${API_BASE}/monitoring/config`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.config) setConfig(d.config); })
      .catch(() => {});

    // Load today's already-accumulated active minutes from backend
    // so the timer continues from where it left off after a page refresh
    fetch(`${API_BASE}/reports/today-preview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.preview?.totalActiveMin) {
          setElapsedSec(d.preview.totalActiveMin * 60);
        }
      })
      .catch(() => {});
  }, [token, user]);

  const sendHeartbeat = useCallback(async (s: 'ACTIVE' | 'INACTIVE') => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/activity/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: s })
      });
    } catch (_) {}
  }, [token]);

  const handleForcedLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (currentStatusRef.current === 'INACTIVE') {
      currentStatusRef.current = 'ACTIVE';
      setStatus('ACTIVE');
      setShowLogoutWarning(false);
      setLogoutCountdown(30);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      sendHeartbeat('ACTIVE');
    }
  }, [sendHeartbeat]);

  // Bind activity events
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, [resetActivity]);

  // Main inactivity check loop
  useEffect(() => {
    if (!config || !user) return;

    const thresholdMin = (config.inactivityThresholds as any)[user.role] ?? 5;
    const thresholdMs = thresholdMin * 60 * 1000;

    checkTimerRef.current = setInterval(() => {
      const inLunch = isInLunchWindow(config.lunchStartTime, config.lunchEndTime);
      if (inLunch) {
        if (currentStatusRef.current !== 'LUNCH') {
          currentStatusRef.current = 'LUNCH';
          setStatus('LUNCH');
        }
        return;
      }

      const idle = Date.now() - lastActivityRef.current;
      if (idle >= thresholdMs && currentStatusRef.current !== 'INACTIVE') {
        currentStatusRef.current = 'INACTIVE';
        setStatus('INACTIVE');
        sendHeartbeat('INACTIVE');

        // Auto-logout warning
        if (config.autoLogoutEnabled) {
          setShowLogoutWarning(true);
          setLogoutCountdown(30);
          let cd = 30;
          countdownRef.current = setInterval(() => {
            cd--;
            setLogoutCountdown(cd);
            if (cd <= 0 && countdownRef.current) clearInterval(countdownRef.current);
          }, 1000);
          logoutTimerRef.current = setTimeout(() => {
            handleForcedLogout();
          }, 30_000);
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current);
    };
  }, [config, user, sendHeartbeat, handleForcedLogout]);

  // Periodic heartbeat
  useEffect(() => {
    heartbeatTimerRef.current = setInterval(() => {
      sendHeartbeat(currentStatusRef.current === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
    }, HEARTBEAT_INTERVAL);
    return () => { if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current); };
  }, [sendHeartbeat]);

  // Elapsed active time clock
  useEffect(() => {
    elapsedTimerRef.current = setInterval(() => {
      if (currentStatusRef.current === 'ACTIVE') setElapsedSec(s => s + 1);
    }, 1000);
    return () => { if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current); };
  }, []);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const statusClass = status === 'ACTIVE' ? 'am-active' : status === 'LUNCH' ? 'am-lunch' : 'am-inactive';
  const icon = status === 'INACTIVE' ? <AlertCircle size={14} /> : status === 'LUNCH' ? <Clock size={14} /> : null;

  return (
    <>
      <div className={`activity-monitor ${statusClass}`} title={status === 'INACTIVE' ? 'You are inactive' : status === 'LUNCH' ? 'Lunch break' : 'Recording Active'}>
        <span className="am-dot" />
        {icon}
        <span className="am-time">{formatTime(elapsedSec)}</span>
        {status === 'ACTIVE' && <span className="am-label">Recording</span>}
        {status === 'INACTIVE' && <span className="am-label">Inactive</span>}
        {status === 'LUNCH' && <span className="am-label">Lunch</span>}
      </div>

      {showLogoutWarning && (
        <div className="am-logout-overlay">
          <div className="am-logout-card">
            <AlertCircle size={40} className="am-logout-icon" />
            <h3>Inactivity Detected</h3>
            <p>You will be logged out automatically in</p>
            <div className="am-countdown">{logoutCountdown}s</div>
            <button className="btn btn-primary am-stay-btn" onClick={resetActivity}>
              I'm still here — Stay Logged In
            </button>
          </div>
        </div>
      )}
    </>
  );
}
