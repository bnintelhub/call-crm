import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, PhoneCall, IndianRupee, TrendingUp,
  Target, CheckCircle, Clock, BarChart3, Activity,
  Radio, AlertTriangle, ExternalLink, Building2,
  ChevronRight, UserCheck, Wifi, WifiOff, Monitor
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

interface OrgNode {
  id: string;
  name: string;
  role: string;
  teamCount?: number;
  callerCount?: number;
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { user, token } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState<LiveStatusCounts>({ online: 0, inactive: 0, offline: 0, total: 0 });
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [eodTriggering, setEodTriggering] = useState(false);
  const [eodMsg, setEodMsg] = useState('');

  useEffect(() => {
    loadDashboard();
    loadOrgTree();

    const unsubCall = socketService.on('call:logged', () => loadDashboard());
    const unsubAlloc = socketService.on('allocation:new', () => loadDashboard());
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

  const loadOrgTree = async () => {
    try {
      setOrgLoading(true);
      const r = await fetch(`${API_BASE}/users/org-tree`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.tree) setOrgTree(d.tree.slice(0, 6));
    } catch { /* silent */ } finally {
      setOrgLoading(false);
    }
  };

  const triggerEod = async () => {
    setEodTriggering(true);
    setEodMsg('');
    try {
      const r = await fetch(`${API_BASE}/reports/trigger-eod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const d = await r.json();
      setEodMsg(`✅ ${d.message} — ${d.generated} reports generated`);
    } catch {
      setEodMsg('❌ Failed to trigger EOD generation');
    } finally {
      setEodTriggering(false);
    }
  };

  const formatCurrency = (val: number) => {
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
            <h1 className="page-title"><LayoutDashboard size={24} /> Admin Dashboard</h1>
            <p className="page-subtitle">Loading real-time data...</p>
          </div>
        </div>
        <SkeletonStatCards count={4} />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  const d = data!;

  const kpiCards = [
    { label: 'Total Loans', value: d.totalLoans.toLocaleString(), icon: <Target size={22} />, color: 'indigo', change: `${d.allocatedLoans} allocated` },
    { label: 'Total Due Amount', value: formatCurrency(d.totalDueAmount), icon: <IndianRupee size={22} />, color: 'amber', change: `${formatCurrency(d.totalPaidAmount)} collected` },
    { label: 'Active Telecallers', value: `${d.activeTelecallers}/${d.totalTelecallers}`, icon: <Users size={22} />, color: 'green', change: 'Online now' },
    { label: "Today's Calls", value: d.todayCallCount.toLocaleString(), icon: <PhoneCall size={22} />, color: 'cyan', change: `${d.ptpCount} PTPs (${formatCurrency(d.ptpAmount)})` },
  ];

  const allocationPieData = [
    { name: 'Allocated', value: d.allocatedLoans, color: '#6366f1' },
    { name: 'Completed', value: d.completedLoans, color: '#10b981' },
    { name: 'Unallocated', value: d.unallocatedLoans, color: '#64748b' },
  ].filter(item => item.value > 0);

  return (
    <div className="dashboard animate-fade-in">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={24} /> Admin Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your collection operations</p>
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

      {/* ─── Live Status + Quick Actions Row ─── */}
      <div className="grid grid-cols-3 gap-4 mt-6">

        {/* Live Status Card */}
        <div className="card admin-live-card">
          <div className="card-header-row">
            <h3 className="card-title"><Radio size={16} /> Live User Status</h3>
            <Link to="/monitoring" className="admin-quick-link">
              View All <ExternalLink size={12} />
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

        {/* Quick Actions Card */}
        <div className="card admin-quick-card">
          <div className="card-header-row">
            <h3 className="card-title"><Monitor size={16} /> Quick Actions</h3>
          </div>
          <div className="admin-action-list">
            <Link to="/monitoring" className="admin-action-btn">
              <Radio size={15} /> Live Monitoring
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/performance" className="admin-action-btn">
              <TrendingUp size={15} /> Performance Report
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/eod-reports" className="admin-action-btn">
              <BarChart3 size={15} /> EOD Reports
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            <Link to="/users" className="admin-action-btn">
              <Users size={15} /> Manage Users
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        </div>

        {/* EOD Trigger Card */}
        <div className="card admin-eod-trigger">
          <div className="card-header-row">
            <h3 className="card-title"><CheckCircle size={16} /> EOD Reports</h3>
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: '0.75rem' }}>
            EOD auto-generates daily at <strong>7:00 PM IST</strong>. Trigger manually anytime.
          </p>
          <button
            className={`btn ${eodTriggering ? 'btn-secondary' : 'btn-primary'}`}
            onClick={triggerEod}
            disabled={eodTriggering}
            style={{ width: '100%' }}
          >
            {eodTriggering
              ? <><div className="spinner-sm" /> Generating...</>
              : <><Clock size={15} /> Generate EOD Now</>
            }
          </button>
          {eodMsg && (
            <p className="text-sm mt-2" style={{ color: eodMsg.startsWith('✅') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {eodMsg}
            </p>
          )}
        </div>
      </div>

      {/* ─── Org Tree + Charts Row ─── */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        {/* Disposition Breakdown Pie */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title"><BarChart3 size={18} /> Call Disposition Breakdown</h3>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            {d.dispositionBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d.dispositionBreakdown}
                    dataKey="count"
                    nameKey="disposition"
                    cx="50%" cy="50%"
                    outerRadius={100} innerRadius={60}
                    paddingAngle={3}
                    label={({ disposition, count }: any) => `${disposition}: ${count}`}
                    labelLine={false}
                  >
                    {d.dispositionBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8125rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No call data yet</p></div>
            )}
          </div>
        </div>

        {/* Org Tree Widget */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title"><Building2 size={18} /> Organisation Tree</h3>
            <Link to="/users" className="admin-quick-link">Manage <ExternalLink size={12} /></Link>
          </div>
          {orgLoading ? (
            <div className="empty-state"><div className="spinner-sm" /></div>
          ) : orgTree.length > 0 ? (
            <div className="org-tree-list">
              {orgTree.map((node, i) => (
                <div key={node.id} className={`org-node org-node-${node.role.toLowerCase().replace('_', '-')}`}>
                  <div className="org-node-badge">{node.role.replace('_', ' ')}</div>
                  <div className="org-node-name">{node.name}</div>
                  {(node.teamCount !== undefined || node.callerCount !== undefined) && (
                    <div className="org-node-meta">
                      {node.teamCount !== undefined && <span>{node.teamCount} TLs</span>}
                      {node.callerCount !== undefined && <span>{node.callerCount} callers</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={32} />
              <p>No org data yet. Add users to see hierarchy.</p>
              <Link to="/users" className="btn btn-sm btn-outline mt-2">Manage Users</Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── Charts Row 2 - Daily Call Trend ─── */}
      <div className="card mt-6">
        <div className="card-header-row">
          <h3 className="card-title"><TrendingUp size={18} /> Daily Call Trend (Last 7 Days)</h3>
        </div>
        <div className="chart-container" style={{ height: 300 }}>
          {d.dailyCallTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.dailyCallTrend}>
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.8125rem' }} />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" fill="url(#callGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No call trend data yet</p></div>
          )}
        </div>
      </div>

      {/* ─── Telecaller Performance ─── */}
      <div className="card mt-6">
        <div className="card-header-row">
          <h3 className="card-title"><Users size={18} /> Telecaller Performance</h3>
          <Link to="/performance" className="admin-quick-link">Full Report <ExternalLink size={12} /></Link>
        </div>
        <div className="chart-container" style={{ height: 320 }}>
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
            <div className="empty-state"><p>No telecaller data yet</p></div>
          )}
        </div>
      </div>

      {/* ─── Collection Summary ─── */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="stat-icon green"><CheckCircle size={22} /></div>
            <div>
              <p className="text-muted text-sm">Collection Rate</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                {d.totalDueAmount > 0 ? ((d.totalPaidAmount / d.totalDueAmount) * 100).toFixed(1) : 0}%
              </h3>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="stat-icon amber"><Clock size={22} /></div>
            <div>
              <p className="text-muted text-sm">PTP Promises</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-warning)' }}>{d.ptpCount}</h3>
              <span className="text-xs text-muted">{formatCurrency(d.ptpAmount)} total</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="stat-icon indigo"><TrendingUp size={22} /></div>
            <div>
              <p className="text-muted text-sm">Remaining Due</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{formatCurrency(d.totalDueAmount - d.totalPaidAmount)}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
