import { useState, useEffect } from 'react';
import {
  Users, PhoneCall, TrendingUp, Calendar, AlertTriangle, Target,
  CheckCircle, Zap, ArrowRight, Activity, ChevronRight
} from 'lucide-react';
import { callApi, reportApi, allocationApi, projectionApi } from '../../services/api';
import { socketService } from '../../services/socketService';
import { useAuthStore } from '../../store/authStore';
import { SkeletonStatCards } from '../../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function TeamLeadDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // My Stats
  const [myStats, setMyStats] = useState<any>(null);
  
  // Team Stats
  const [teamStats, setTeamStats] = useState<any>(null);
  
  // Team Detailed Stats
  const [detailedStats, setDetailedStats] = useState<any[]>([]);

  // Team Projections
  const [teamProjections, setTeamProjections] = useState<any[]>([]);

  useEffect(() => {
    loadData();

    const unsubCall = socketService.on('call:logged', () => loadData());
    const unsubAlloc = socketService.on('allocation:new', () => loadData());

    return () => { unsubCall(); unsubAlloc(); };
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [callStats, myData, teamData, detailedData, projData] = await Promise.all([
        callApi.myStats().catch(() => null),
        allocationApi.myData().catch(() => null),
        reportApi.dashboard().catch(() => null),
        reportApi.teamDetailedStats().catch(() => null),
        projectionApi.getTeam().catch(() => null)
      ]);

      const allocated = myData?.records?.length || myData?.total || 0;

      setMyStats({
        totalAllocated: allocated,
        todayCalls: callStats?.todayCalls || 0,
        connectedCalls: callStats?.connectedCalls || 0,
        ptpCount: callStats?.ptpCount || 0,
        ptpAmount: callStats?.ptpAmount || 0,
        totalDueAmount: callStats?.totalDueAmount || 0,
        totalPaidAmount: callStats?.totalPaidAmount || 0,
      });
      
      setTeamStats(teamData);
      setDetailedStats(detailedData?.stats || []);
      setTeamProjections(projData?.projections || []);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    if (!val) return '₹0';
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
      <div className="dashboard animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Team Lead Dashboard</h1>
            <p className="page-subtitle">Loading data...</p>
          </div>
        </div>
        <SkeletonStatCards count={4} />
      </div>
    );
  }

  const s = myStats || {};
  const ts = teamStats || {};
  const myConnectRate = s.todayCalls > 0 ? ((s.connectedCalls / s.todayCalls) * 100).toFixed(0) : '0';

  return (
    <div className="dashboard animate-fade-in">

      {/* ─── Hero Greeting ─── */}
      <div className="tc-greeting-card" style={{ marginBottom: '1.5rem' }}>
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
        <div className="flex items-center gap-4">
          <Link to="/my-data" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={16} /> My Calling Data
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* ─── My Personal Stats ─── */}
        <div>
          <h3 className="section-title mb-3 flex items-center gap-2"><PhoneCall size={18} /> My Calling Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="stat-icon indigo"><Target size={22} /></div>
              <div className="stat-content">
                <h3>{s.totalAllocated || 0}</h3>
                <p>My Assigned Data</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan"><PhoneCall size={22} /></div>
              <div className="stat-content">
                <h3>{s.todayCalls || 0}</h3>
                <p>My Calls Today</p>
                <span className="stat-change">{myConnectRate}% connected</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div className="stat-content">
                <h3>{formatCurrency(s.totalPaidAmount)}</h3>
                <p>My Collections</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><TrendingUp size={22} /></div>
              <div className="stat-content">
                <h3>{s.ptpCount || 0}</h3>
                <p>My PTPs</p>
                <span className="stat-change">{formatCurrency(s.ptpAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Team Overview ─── */}
        <div>
          <h3 className="section-title mb-3 flex items-center gap-2"><Users size={18} /> Team Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="stat-icon cyan"><Activity size={22} /></div>
              <div className="stat-content">
                <h3>{ts.todayCallCount || 0}</h3>
                <p>Total Team Calls</p>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div className="stat-content">
                <h3>{formatCurrency(ts.totalPaidAmount)}</h3>
                <p>Total Team Collection</p>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="stat-icon amber"><Target size={22} /></div>
              <div className="stat-content">
                <h3>{ts.ptpCount || 0}</h3>
                <p>Team PTPs</p>
                <span className="stat-change">{formatCurrency(ts.ptpAmount)}</span>
              </div>
            </div>
            <Link to="/team-performance" className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', textDecoration: 'none', cursor: 'pointer' }}>
              <Users size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>View Full Team Report</span>
              <span className="text-xs text-muted mt-1">Drill down by agent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Quick Links Row ─── */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Link to="/allocation" className="card admin-quick-card" style={{ textDecoration: 'none' }}>
          <div className="card-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} className="text-primary" /> Data Allocation
            </h3>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <p className="text-sm text-muted mt-2">Distribute unallocated data to your team members.</p>
        </Link>
        <Link to="/monitoring" className="card admin-quick-card" style={{ textDecoration: 'none' }}>
          <div className="card-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} className="text-success" /> Live Monitoring
            </h3>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <p className="text-sm text-muted mt-2">Watch your team's live status and ongoing calls.</p>
        </Link>
        <Link to="/eod-team" className="card admin-quick-card" style={{ textDecoration: 'none' }}>
          <div className="card-header-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} className="text-warning" /> Team EOD
            </h3>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <p className="text-sm text-muted mt-2">Review EOD reports submitted by your agents.</p>
        </Link>
      </div>

      {/* ─── Team Member Performance Details ─── */}
      <div className="card mt-6">
        <div className="card-header-row">
          <h3 className="card-title"><Users size={18} /> Team Member Data & Collection</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Assigned Data</th>
                <th>Data Completion</th>
                <th>Paid Today</th>
                <th>Paid This Week</th>
                <th>Paid This Month</th>
                <th>Unpaid Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {detailedStats.length > 0 ? detailedStats.map((st, i) => {
                const percent = st.totalAllocated > 0 ? Math.round((st.completedAllocated / st.totalAllocated) * 100) : 0;
                return (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                          {st.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{st.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(st.totalAssignedAmount)}</span>
                        <span className="text-xs text-muted">{st.totalAllocated} records</span>
                      </div>
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>{st.completedAllocated} / {st.totalAllocated} Done</span>
                        <span style={{ fontWeight: 600 }}>{percent}%</span>
                      </div>
                      <div className="progress-bg" style={{ height: 6, borderRadius: 3, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                        <div className="progress-fill" style={{ height: '100%', width: `${percent}%`, background: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                      </div>
                    </td>
                    <td><span className="badge badge-success bg-opacity-10 text-success border-success">{formatCurrency(st.paidToday)}</span></td>
                    <td>{formatCurrency(st.paidWeekly)}</td>
                    <td>{formatCurrency(st.paidMonthly)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="text-danger" style={{ fontWeight: 500 }}>{formatCurrency(st.unpaidAmount)}</span>
                        <span className="text-xs text-muted">{st.unpaidDataCount} records</span>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No team members found or no data allocated.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Team Daily Projections ─── */}
      <div className="card mt-6">
        <div className="card-header-row">
          <h3 className="card-title"><Target size={18} /> Team Daily Projections</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Agent Name</th>
                <th>Target Calls</th>
                <th>Target Collection</th>
                <th>Actual Calls</th>
                <th>Achieved Amount</th>
                <th>Strategy / EOD Notes</th>
              </tr>
            </thead>
            <tbody>
              {teamProjections.length > 0 ? teamProjections.map((p, i) => (
                <tr key={i} onClick={() => { window.location.href = `/reports?tab=daily&telecallerId=${p.user.id}`; }} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {p.user.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.user.name}</span>
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </td>
                  <td>{p.plannedCalls}</td>
                  <td>{formatCurrency(p.targetAmount)}</td>
                  <td>{p.actualCalls}</td>
                  <td><span className={p.achievedAmount >= p.targetAmount && p.targetAmount > 0 ? 'text-success' : ''} style={{ fontWeight: 500 }}>{formatCurrency(p.achievedAmount)}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                      {p.notes && <span style={{ color: 'var(--text-muted)' }}><strong>Plan:</strong> {p.notes}</span>}
                      {p.eodNotes && <span><strong>EOD:</strong> {p.eodNotes}</span>}
                      {!p.notes && !p.eodNotes && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No projections set by your team today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
