import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, PhoneCall, IndianRupee, TrendingUp,
  Target, CheckCircle, Clock, BarChart3, Activity,
  Radio, AlertTriangle, ExternalLink, Building2,
  ChevronRight, UserCheck, Wifi, WifiOff, Monitor, Shuffle,
  ChevronLeft, MousePointerClick
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { reportApi, API_BASE } from '../../services/api';
import { socketService } from '../../services/socketService';
import { useAuthStore } from '../../store/authStore';
import { SkeletonStatCards, SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

import './Dashboard.css';

interface DashboardData {
  totalLoans: number;
  allocatedLoans: number;
  completedLoans: number;
  unallocatedLoans: number;
  totalDueAmount: number;
  totalPaidAmount: number;
  totalTelecallers: number;
  activeTelecallers: number;
  todayCallCount: number;
  ptpCount: number;
  ptpAmount: number;
  dispositionBreakdown: { disposition: string; count: number }[];
  telecallerPerformance: { name: string; calls: number; ptps: number; connected: number }[];
  dailyCallTrend: { date: string; calls: number }[];
  collectionRate: number;
}

interface LiveStatusCounts {
  online: number;
  inactive: number;
  offline: number;
  total: number;
}

interface MemberStat {
  id: string;
  name: string;
  isTL: boolean;
  totalPaid: number;
  paidToday: number;
  paidThisWeek: number;
  paidThisMonth: number;
  totalAllocated: number;
  recentPayments: { amount: number; date: string }[];
}

interface TeamCollection {
  teamLeadId: string;
  teamLeadName: string;
  teamTotal: number;
  teamToday: number;
  teamThisWeek: number;
  teamThisMonth: number;
  members: MemberStat[];
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#a855f7'];

export default function OperationsManagerDashboard() {
  const { token } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState<LiveStatusCounts>({ online: 0, inactive: 0, offline: 0, total: 0 });

  // Collection chart state
  const [teams, setTeams] = useState<TeamCollection[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [selectedTL, setSelectedTL] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
    loadTeamCollections();

    const unsubCall = socketService.on('call:logged', () => { loadDashboard(); loadTeamCollections(); });
    const unsubAlloc = socketService.on('allocation:new', () => { loadDashboard(); loadTeamCollections(); });
    const unsubOnline = socketService.on('monitoring:online_list', (data: any) => {
      if (data?.counts) setLiveStatus(data.counts);
    });
    const unsubStatus = socketService.on('activity:status_change', () => loadLiveStatus());

    loadLiveStatus();

    return () => { unsubCall(); unsubAlloc(); unsubOnline(); unsubStatus(); };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportApi.dashboard();
      setData(res);
    } catch {
      setData({
        totalLoans: 0, allocatedLoans: 0, completedLoans: 0, unallocatedLoans: 0,
        totalDueAmount: 0, totalPaidAmount: 0, totalTelecallers: 0, activeTelecallers: 0,
        todayCallCount: 0, ptpCount: 0, ptpAmount: 0,
        dispositionBreakdown: [], telecallerPerformance: [], dailyCallTrend: [],
        collectionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamCollections = async () => {
    try {
      setTeamsLoading(true);
      const res = await reportApi.omTeamCollections();
      setTeams(res.teams || []);
    } catch { setTeams([]); }
    finally { setTeamsLoading(false); }
  };

  const loadLiveStatus = async () => {
    try {
      const r = await fetch(`${API_BASE}/monitoring/live`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.users) {
        const online  = d.users.filter((u: any) => u.status === 'ONLINE').length;
        const inactive = d.users.filter((u: any) => u.status === 'INACTIVE').length;
        const offline = d.users.filter((u: any) => u.status === 'OFFLINE').length;
        setLiveStatus({ online, inactive, offline, total: d.users.length });
      }
    } catch { /* silent */ }
  };

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)} K`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="dashboard animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title"><LayoutDashboard size={24} /> Operations Dashboard</h1>
            <p className="page-subtitle">Loading real-time data...</p>
          </div>
        </div>
        <SkeletonStatCards count={4} />
      </div>
    );
  }

  const d = data!;
  const selectedTeam = teams.find(t => t.teamLeadId === selectedTL);
  const grandTotal = teams.reduce((s, t) => s + t.teamTotal, 0);

  const pieData = teams
    .filter(t => t.teamTotal > 0)
    .map(t => ({ name: t.teamLeadName, value: t.teamTotal }));

  const kpiCards = [
    { label: 'Total Loans', value: d.totalLoans.toLocaleString(), icon: <Target size={22} />, color: 'indigo', change: `${d.allocatedLoans} allocated` },
    { label: 'Total Due Amount', value: fmt(d.totalDueAmount), icon: <IndianRupee size={22} />, color: 'amber', change: `${fmt(d.totalPaidAmount)} collected` },
    { label: 'Active Agents', value: `${d.activeTelecallers}/${d.totalTelecallers}`, icon: <Users size={22} />, color: 'green', change: 'Online now' },
    { label: "Today's Calls", value: d.todayCallCount.toLocaleString(), icon: <PhoneCall size={22} />, color: 'cyan', change: `${d.ptpCount} PTPs (${fmt(d.ptpAmount)})` },
  ];

  return (
    <div className="dashboard animate-fade-in">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={24} /> Operations Dashboard</h1>
          <p className="page-subtitle">Monitor teams and manage data allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success"><Activity size={12} /> Live</span>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${kpi.color}`}>{kpi.icon}</div>
            <div className="stat-content">
              <h3>{kpi.value}</h3>
              <p>{kpi.label}</p>
              <span className="stat-change">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ TEAM LEAD COLLECTION CHARTS ═══ */}
      <div className="om-collection-section mt-6">
        {/* LEFT: Pie Chart — Team Lead wise */}
        <div className="card om-pie-card">
          <div className="card-header-row">
            <h3 className="card-title"><IndianRupee size={18} /> Team Lead Collections</h3>
            <span className="text-xs text-muted">Total: {fmt(grandTotal)}</span>
          </div>

          {teamsLoading ? (
            <div className="empty-state"><p>Loading collection data...</p></div>
          ) : pieData.length > 0 ? (
            <>
              <div className="chart-container" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      onClick={(_, idx) => setSelectedTL(teams.filter(t => t.teamTotal > 0)[idx]?.teamLeadId || null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          stroke={selectedTL === teams.filter(t => t.teamTotal > 0)[i]?.teamLeadId ? '#fff' : 'transparent'}
                          strokeWidth={selectedTL === teams.filter(t => t.teamTotal > 0)[i]?.teamLeadId ? 3 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => fmt(Number(val))}
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend — clickable */}
              <div className="om-tl-legend">
                {teams.filter(t => t.teamTotal > 0).map((t, i) => (
                  <div
                    key={t.teamLeadId}
                    className={`om-tl-legend-item ${selectedTL === t.teamLeadId ? 'active' : ''}`}
                    onClick={() => setSelectedTL(selectedTL === t.teamLeadId ? null : t.teamLeadId)}
                  >
                    <div className="om-legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="om-legend-name">{t.teamLeadName}</span>
                    <span className="om-legend-amt">{fmt(t.teamTotal)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No collection data available</p></div>
          )}
        </div>

        {/* RIGHT: Drill-down — Telecaller breakdown */}
        <div className="card om-drill-card">
          {selectedTeam ? (
            <>
              <div className="om-drill-header">
                <h4>{selectedTeam.teamLeadName}'s Team</h4>
                <button className="om-drill-back" onClick={() => setSelectedTL(null)}>
                  <ChevronLeft size={14} /> Back
                </button>
              </div>

              {/* Team summary stats */}
              <div className="om-drill-stats">
                <div className="om-drill-stat">
                  <span>Total Collected</span>
                  <strong style={{ color: 'var(--accent-success)' }}>{fmt(selectedTeam.teamTotal)}</strong>
                </div>
                <div className="om-drill-stat">
                  <span>Today</span>
                  <strong>{fmt(selectedTeam.teamToday)}</strong>
                </div>
                <div className="om-drill-stat">
                  <span>This Week</span>
                  <strong>{fmt(selectedTeam.teamThisWeek)}</strong>
                </div>
                <div className="om-drill-stat">
                  <span>This Month</span>
                  <strong>{fmt(selectedTeam.teamThisMonth)}</strong>
                </div>
              </div>

              {/* Bar chart for member contributions */}
              {selectedTeam.members.filter(m => m.totalPaid > 0).length > 0 && (
                <div className="chart-container" style={{ height: 160, marginBottom: '0.75rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedTeam.members.filter(m => m.totalPaid > 0)} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} angle={-15} textAnchor="end" height={40} tickFormatter={(v: string) => v.split(' ')[0]} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} tickFormatter={(v: number) => fmt(v)} width={60} />
                      <Tooltip formatter={(val: any) => fmt(Number(val))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.78rem' }} />
                      <Bar dataKey="totalPaid" fill="#10b981" radius={[4, 4, 0, 0]} name="Total Paid" />
                      <Bar dataKey="paidThisMonth" fill="#6366f1" radius={[4, 4, 0, 0]} name="This Month" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Member list */}
              <div className="om-caller-list">
                {selectedTeam.members
                  .sort((a, b) => b.totalPaid - a.totalPaid)
                  .map((m, idx) => (
                  <div className="om-caller-row" key={m.id}>
                    <div className="om-caller-avatar" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}>
                      {m.name[0]}
                    </div>
                    <div className="om-caller-info">
                      <div className="om-caller-name">
                        {m.name} {m.isTL && <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>TL</span>}
                      </div>
                      <div className="om-caller-meta">
                        {m.totalAllocated} records · Today: {fmt(m.paidToday)}
                      </div>
                    </div>
                    <div className="om-caller-amt">
                      <strong>{fmt(m.totalPaid)}</strong>
                      <span>till date</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="om-empty-drill">
              <MousePointerClick size={40} strokeWidth={1.5} />
              <p>Click on a Team Lead in the pie chart<br />to see their telecaller breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Actions & Tracking Row ─── */}
      <div className="grid grid-cols-3 gap-4 mt-6">

        {/* Live Status Card */}
        <div className="card admin-live-card">
          <div className="card-header-row">
            <h3 className="card-title"><Radio size={16} /> Team Live Status</h3>
            <Link to="/monitoring" className="admin-quick-link">
              Track Agents <ExternalLink size={12} />
            </Link>
          </div>
          <div className="live-status-grid">
            <div className="live-status-item online">
              <Wifi size={18} />
              <span className="live-count">{liveStatus.online}</span>
              <span className="live-label">Online</span>
            </div>
            <div className="live-status-item inactive">
              <AlertTriangle size={18} />
              <span className="live-count">{liveStatus.inactive}</span>
              <span className="live-label">Inactive</span>
            </div>
            <div className="live-status-item offline">
              <WifiOff size={18} />
              <span className="live-count">{liveStatus.offline}</span>
              <span className="live-label">Offline</span>
            </div>
          </div>
          <div className="live-total">
            <UserCheck size={14} />
            {liveStatus.total} users tracked today
          </div>
        </div>

        {/* Data Allocation / Reallocation Action Card */}
        <div className="card admin-eod-trigger" style={{ background: 'var(--accent-primary-glow)', borderColor: 'var(--border-color)' }}>
          <div className="card-header-row">
            <h3 className="card-title text-primary"><Shuffle size={16} /> Data Operations</h3>
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
            Allocate new data batches or reallocate existing records from one agent to another to optimize recovery.
          </p>
          <div className="flex gap-2 flex-col">
            <Link to="/allocation" className="btn btn-primary w-full text-center" style={{ justifyContent: 'center' }}>
              <Target size={16} className="mr-2" /> Allocate Unassigned Data
            </Link>
            <Link to="/allocation" state={{ defaultTab: 'allocated' }} className="btn btn-secondary w-full text-center" style={{ justifyContent: 'center' }}>
              <Shuffle size={16} className="mr-2" /> Reallocate Existing Data
            </Link>
          </div>
        </div>

        {/* Quick Reports Card */}
        <div className="card admin-quick-card">
          <div className="card-header-row">
            <h3 className="card-title"><BarChart3 size={16} /> Quick Reports</h3>
          </div>
          <div className="admin-action-list">
            <Link to="/performance" className="admin-action-btn">
              <TrendingUp size={15} /> Agent Performance
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/reports" className="admin-action-btn">
              <BarChart3 size={15} /> Collection Reports
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/eod-admin" className="admin-action-btn">
              <Clock size={15} /> EOD Submissions
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/users" className="admin-action-btn">
              <Users size={15} /> Manage Teams
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        {/* Telecaller Performance */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title"><Users size={18} /> Top Agents (Today)</h3>
            <Link to="/performance" className="admin-quick-link">Full Report <ExternalLink size={12} /></Link>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            {d.telecallerPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.telecallerPerformance} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8125rem' }} />
                  <Legend iconType="circle" formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{value}</span>} />
                  <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Calls" />
                  <Bar dataKey="connected" fill="#10b981" radius={[4, 4, 0, 0]} name="Connected" />
                  <Bar dataKey="ptps" fill="#f59e0b" radius={[4, 4, 0, 0]} name="PTPs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No calling data yet</p></div>
            )}
          </div>
        </div>

        {/* Daily Call Trend */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title"><TrendingUp size={18} /> Daily Call Volume</h3>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            {d.dailyCallTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.dailyCallTrend}>
                  <defs>
                    <linearGradient id="callGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8125rem' }} />
                  <Area type="monotone" dataKey="calls" stroke="#10b981" fill="url(#callGradient2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No call trend data yet</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
