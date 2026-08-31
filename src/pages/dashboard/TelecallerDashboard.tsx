import { useState, useEffect } from 'react';
import {
  PhoneCall, Target, Clock, CheckCircle, ArrowRight, Phone,
  TrendingUp, Calendar, AlertTriangle, Zap, ChevronRight
} from 'lucide-react';
import { callApi, allocationApi, projectionApi } from '../../services/api';
import { socketService } from '../../services/socketService';
import { toast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { SkeletonStatCards } from '../../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface TelecallerStats {
  totalAllocated: number;
  todayCalls: number;
  connectedCalls: number;
  ptpCount: number;
  ptpAmount: number;
  totalDueAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  todayPaymentBrought: number;
  recoveryPercent: number;
  pendingFollowups: number;
  recentCalls: {
    borrowerName: string;
    loanNumber: string;
    disposition: string;
    time: string;
  }[];
  todayPtps: {
    borrowerName: string;
    loanNumber: string;
    ptpDate: string;
    ptpAmount: number;
    phoneNumber: string;
  }[];
}

export default function TelecallerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TelecallerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [projection, setProjection] = useState<any>(null);
  const [projectionForm, setProjectionForm] = useState({
    plannedCalls: '',
    targetAmount: '',
    notes: '',
    actualCalls: '',
    achievedAmount: '',
    eodNotes: ''
  });
  const [savingProj, setSavingProj] = useState(false);
  const [completedPtps, setCompletedPtps] = useState<Set<string>>(new Set());

  const togglePtpCompletion = (e: React.MouseEvent, loanNumber: string) => {
    e.preventDefault();
    setCompletedPtps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(loanNumber)) newSet.delete(loanNumber);
      else newSet.add(loanNumber);
      return newSet;
    });
  };

  useEffect(() => {
    loadStats();

    const unsubCall = socketService.on('call:logged', (data) => {
      if (data.telecallerId === user?.id) loadStats(true);
    });

    const unsubRecovery = socketService.on('recovery:updated', (data) => {
      if (!data?.telecallerId || data.telecallerId === user?.id) loadStats(true);
    });

    const unsubAlloc = socketService.on('allocation:new', () => loadStats(true));

    return () => { unsubCall(); unsubRecovery(); unsubAlloc(); };
  }, [user]);

  const loadStats = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [callStats, myData] = await Promise.all([
        callApi.myStats().catch(() => null),
        allocationApi.myData().catch(() => null),
      ]);

      const allocated =
        callStats?.activeAllocations ??
        myData?.pagination?.total ??
        myData?.total ??
        myData?.allocations?.length ??
        myData?.records?.length ??
        0;

      setStats({
        totalAllocated: allocated,
        todayCalls: callStats?.todayCalls || 0,
        connectedCalls: callStats?.connectedCalls || 0,
        ptpCount: callStats?.ptpCount || 0,
        ptpAmount: callStats?.ptpAmount || 0,
        totalDueAmount: callStats?.totalDueAmount || 0,
        totalPaidAmount: callStats?.totalPaidAmount || 0,
        totalRemainingAmount: callStats?.totalRemainingAmount || 0,
        todayPaymentBrought: callStats?.todayPaymentBrought || 0,
        recoveryPercent: callStats?.recoveryPercent || 0,
        pendingFollowups: callStats?.pendingFollowups || 0,
        recentCalls: callStats?.recentCalls || [],
        todayPtps: callStats?.todayPtps || [],
      });
    } catch {
      setStats({
        totalAllocated: 0, todayCalls: 0, connectedCalls: 0,
        ptpCount: 0, ptpAmount: 0, pendingFollowups: 0,
        totalDueAmount: 0, totalPaidAmount: 0, totalRemainingAmount: 0,
        todayPaymentBrought: 0, recoveryPercent: 0,
        recentCalls: [], todayPtps: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProjection = async (type: 'start' | 'eod') => {
    try {
      setSavingProj(true);
      const res = await projectionApi.save({
        plannedCalls: Number(projectionForm.plannedCalls) || 0,
        targetAmount: Number(projectionForm.targetAmount) || 0,
        notes: projectionForm.notes,
        actualCalls: Number(projectionForm.actualCalls) || 0,
        achievedAmount: Number(projectionForm.achievedAmount) || 0,
        eodNotes: projectionForm.eodNotes
      });
      setProjection(res.projection);
      toast.success(type === 'start' ? 'Morning Projection Saved' : 'EOD Report Saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save projection');
    } finally {
      setSavingProj(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="tc-dash animate-fade-in">
        <div className="tc-greeting-card">
          <div className="tc-greeting-text">
            <span className="tc-greeting-label">Loading...</span>
          </div>
        </div>
        <SkeletonStatCards count={4} />
      </div>
    );
  }

  const s = stats!;
  const connectRate = s.todayCalls > 0 ? ((s.connectedCalls / s.todayCalls) * 100).toFixed(0) : '0';

  const collectionRate = s.totalDueAmount > 0 ? ((s.totalPaidAmount / s.totalDueAmount) * 100).toFixed(1) : 0;

  return (
    <div className="tc-dash animate-fade-in">

      {/* ─── Hero Greeting ─── */}
      <div className="tc-greeting-card">
        <div className="tc-greeting-left">
          <div className="tc-avatar-lg" style={{ overflow: 'hidden' }}>
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="tc-greeting-text">
            <span className="tc-greeting-label">{getGreeting()}</span>
            <span className="tc-greeting-name">{user?.name?.split(' ')[0]} 👋</span>
          </div>
        </div>
        <div className="tc-greeting-date">
          <Calendar size={14} />
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* ─── Quick Action CTA ─── */}
      <Link to="/my-data" className="tc-cta-card">
        <div className="tc-cta-left">
          <div className="tc-cta-icon"><Zap size={20} /></div>
          <div>
            <span className="tc-cta-title">Start Calling</span>
            <span className="tc-cta-sub">{s.totalAllocated} records assigned</span>
          </div>
        </div>
        <ArrowRight size={20} />
      </Link>

      {/* ─── Today's Stats Grid ─── */}
      <div className="tc-stats-grid">
        <div className="tc-stat-card tc-stat-calls">
          <div className="tc-stat-icon"><PhoneCall size={18} /></div>
          <div className="tc-stat-val">{s.todayCalls}</div>
          <div className="tc-stat-label">Calls Today</div>
          <div className="tc-stat-sub">{connectRate}% connected</div>
        </div>
        <div className="tc-stat-card tc-stat-connected">
          <div className="tc-stat-icon"><CheckCircle size={18} /></div>
          <div className="tc-stat-val">{s.connectedCalls}</div>
          <div className="tc-stat-label">Connected</div>
        </div>
        <div className="tc-stat-card tc-stat-ptp">
          <div className="tc-stat-icon"><TrendingUp size={18} /></div>
          <div className="tc-stat-val">{s.ptpCount}</div>
          <div className="tc-stat-label">PTP</div>
          <div className="tc-stat-sub">{formatCurrency(s.ptpAmount)}</div>
        </div>
        <div className="tc-stat-card tc-stat-allocated">
          <div className="tc-stat-icon"><Target size={18} /></div>
          <div className="tc-stat-val">{s.totalAllocated}</div>
          <div className="tc-stat-label">Allocated</div>
        </div>
      </div>

      {/* ─── Financial Overview (New Graphs) ─── */}
      <div className="tc-section">
        <div className="tc-section-header">
          <h3><TrendingUp size={16} /> My Collection Performance</h3>
        </div>
        <div className="tc-stats-grid">
          <div className="tc-stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="tc-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><AlertTriangle size={18} /></div>
            <div className="tc-stat-val" style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: '#f59e0b' }}>{formatCurrency(s.totalDueAmount)}</div>
            <div className="tc-stat-label">Total Assigned Due</div>
          </div>
          <div className="tc-stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="tc-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><CheckCircle size={18} /></div>
            <div className="tc-stat-val" style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: '#10b981' }}>{formatCurrency(s.todayPaymentBrought)}</div>
            <div className="tc-stat-label">Payment Brought Today</div>
          </div>
          <div className="tc-stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="tc-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><AlertTriangle size={18} /></div>
            <div className="tc-stat-val" style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: '#ef4444' }}>{formatCurrency(s.totalDueAmount - s.todayPaymentBrought)}</div>
            <div className="tc-stat-label">Remaining Balance</div>
          </div>
          <div className="tc-stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="tc-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Target size={18} /></div>
            <div className="tc-stat-val" style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: '#3b82f6' }}>{s.recoveryPercent}%</div>
            <div className="tc-stat-label">Recovery %</div>
          </div>
        </div>
      </div>

      {/* ─── PTP Reminders ─── */}
      <div className="tc-section">
        <div className="tc-section-header">
          <h3><AlertTriangle size={16} /> PTP Reminders</h3>
          {s.todayPtps.length > 0 && (
            <span className="badge badge-warning">{s.todayPtps.length} Due</span>
          )}
        </div>

        {s.todayPtps.length > 0 ? (
          <div className="tc-ptp-list">
            {s.todayPtps.map((ptp, i) => {
              const isCompleted = completedPtps.has(ptp.loanNumber);
              return (
                <div className={`tc-ptp-card ${isCompleted ? 'completed' : ''}`} key={i}>
                  <div className="tc-ptp-avatar">{ptp.borrowerName.charAt(0)}</div>
                  <div className="tc-ptp-info">
                    <span className="tc-ptp-name">{ptp.borrowerName}</span>
                    <span className="tc-ptp-meta">
                      {ptp.loanNumber} · {ptp.phoneNumber}
                    </span>
                  </div>
                  <div className="tc-ptp-amount-col">
                    <span className="tc-ptp-amount">{formatCurrency(ptp.ptpAmount)}</span>
                    <span className="tc-ptp-due">
                      Due {new Date(ptp.ptpDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
                    </span>
                  </div>
                  <div className="tc-ptp-actions">
                    <button 
                      className={`tc-ptp-action-btn ${isCompleted ? 'completed' : ''}`} 
                      onClick={(e) => togglePtpCompletion(e, ptp.loanNumber)}
                      title={isCompleted ? "Mark as pending" : "Mark as completed"}
                    >
                      <CheckCircle size={16} />
                    </button>
                    {!isCompleted && (
                      <a href={`tel:${ptp.phoneNumber}`} className="tc-ptp-call-icon">
                        <Phone size={16} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tc-empty-mini">
            <CheckCircle size={28} />
            <span>No PTP reminders today — all clear!</span>
          </div>
        )}
      </div>

      {/* ─── Recent Calls ─── */}
      <div className="tc-section">
        <div className="tc-section-header">
          <h3><Clock size={16} /> Recent Calls</h3>
          <Link to="/my-data" className="tc-see-all">View all <ChevronRight size={14} /></Link>
        </div>

        {s.recentCalls.length > 0 ? (
          <div className="tc-calls-list">
            {s.recentCalls.slice(0, 6).map((call, i) => (
              <div className="tc-call-item" key={i}>
                <div className={`tc-call-dot ${call.disposition === 'CONNECTED' ? 'green' : call.disposition === 'NOT_REACHABLE' ? 'amber' : 'red'}`} />
                <div className="tc-call-info">
                  <span className="tc-call-name">{call.borrowerName}</span>
                  <span className="tc-call-loan">{call.loanNumber}</span>
                </div>
                <div className="tc-call-right">
                  <span className={`tc-call-disp badge badge-${call.disposition === 'CONNECTED' ? 'success' : call.disposition === 'NOT_REACHABLE' ? 'warning' : 'danger'}`}>
                    {call.disposition.replace(/_/g, ' ')}
                  </span>
                  <span className="tc-call-time">{call.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tc-empty-mini">
            <PhoneCall size={28} />
            <span>No calls yet today. Tap "Start Calling" above!</span>
          </div>
        )}
      </div>

      {/* ─── EOD Submit Quick Link ─── */}
      <Link to="/eod-submit" className="tc-eod-cta">
        <div className="tc-eod-left">
          <span className="tc-eod-emoji">📋</span>
          <div>
            <span className="tc-eod-title">Submit EOD Report</span>
            <span className="tc-eod-sub">End of day summary auto-calculated</span>
          </div>
        </div>
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
