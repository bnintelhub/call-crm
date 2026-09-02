import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers, Headphones, MoreHorizontal, Search, Download, Plus,
  Users, UserCheck, UserMinus, Award, GraduationCap, BarChart3, Star,
  PhoneCall, Clock, CheckCircle2, AlertCircle, Play, Pause,
  TrendingUp, FileSpreadsheet, ShieldCheck, Zap, Sparkles,
  Volume2, MapPin, MessageSquare, Send, Smartphone, FileText,
  RotateCw, Radio, Check
} from 'lucide-react';
import { useAllocationStore } from '../../store/allocationStore';
import { useAgentStore } from '../../store/agentStore';
import { useCampaignStore } from '../../store/campaignStore';
import './IVRPage.css';

interface IVRPageProps {
  view?: string;
}

export default function IVRPage({ view: propView }: IVRPageProps) {
  const navigate = useNavigate();
  const { tab, reportType: paramReportType } = useParams<{ tab?: string; reportType?: string }>();
  const currentView = propView || tab || 'allocation-list';

  // Connected Zustand stores for real-time live data
  const { allocationsList } = useAllocationStore();
  const { agentsList } = useAgentStore();
  const { campaignsList, updateCampaign } = useCampaignStore();

  const reportTypeMap: Record<string, string> = {
    'one-view': 'One View',
    'cc-reports': 'CC Reports',
    'field-reports': 'Field Reports',
    'digital-engagement': 'Digital Engagement Report',
    'call-recordings': 'Call Recordings',
  };

  const selectedReportType = (paramReportType && reportTypeMap[paramReportType]) || 'One View';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Real-time live call counter simulation
  const [liveCallDelta, setLiveCallDelta] = useState(0);

  // Periodic heartbeat every 4 seconds to simulate live IVR stream updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCallDelta((prev) => prev + Math.floor(Math.random() * 3));
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 500);
  };

  // Real-time aggregate metrics
  const totalAllocatedLeads = useMemo(() => {
    return allocationsList.reduce((acc, a) => acc + (a.caseCounts || 0), 45280) + liveCallDelta * 2;
  }, [allocationsList, liveCallDelta]);

  const totalAgentsCount = agentsList.length;
  const onlineAgentsCount = agentsList.filter((a) => a.isOnline).length;
  const unallocatedAgentsCount = agentsList.filter(
    (a) => !a.isAllocated || a.campaign === '-' || !a.campaign
  ).length;
  const inCallAgentsCount = Math.min(
    onlineAgentsCount,
    Math.max(4, Math.floor(onlineAgentsCount * 0.45) + (liveCallDelta % 3))
  );

  const activeCampaignsCount = campaignsList.filter((c) => c.status === 'Running').length;
  const totalAutodialCount = campaignsList.reduce((acc, c) => acc + (c.completedAutodial || 0), 18940) + liveCallDelta;

  // Render view-specific content & stats
  const getViewConfig = () => {
    switch (currentView) {
      case 'allocation-list':
        return {
          title: 'Allocation List',
          category: 'Allocation',
          icon: <Layers size={24} className="text-indigo" />,
          subtitle: 'Manage and distribute IVR dialing batches, customer lead lists, and queue quotas in real-time.',
          stats: [
            { label: 'Total Allocated Leads', value: totalAllocatedLeads.toLocaleString('en-IN'), sub: '+12% this week', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Batches in Queue', value: `${allocationsList.length} Batches`, sub: `${allocationsList.filter(a => a.tabCategory === '100% Allocated').length} fully allocated`, icon: <Clock size={22} />, color: 'amber' },
            { label: 'Connected Calls', value: (28450 + liveCallDelta).toLocaleString('en-IN'), sub: '64.2% connection rate', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Unallocated Batches', value: `${allocationsList.filter(a => a.tabCategory === 'Unallocated').length} Available`, sub: 'Ready for campaign launch', icon: <Zap size={22} />, color: 'cyan' },
          ],
        };
      case 'agent-list':
        return {
          title: 'Agent List',
          category: 'Agent',
          icon: <UserCheck size={24} className="text-indigo" />,
          subtitle: 'Monitor all telecallers, extension mappings, live status, and agent workload live.',
          stats: [
            { label: 'Total Agents', value: `${totalAgentsCount}`, sub: `${agentsList.filter(a => a.type === 'CALL').length} Telecallers / ${agentsList.filter(a => a.type === 'FIELD').length} Field`, icon: <Users size={22} />, color: 'indigo' },
            { label: 'Online / Available', value: `${onlineAgentsCount}`, sub: `${Math.round((onlineAgentsCount / (totalAgentsCount || 1)) * 100)}% active logged in`, icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Currently in Call', value: `${inCallAgentsCount}`, sub: 'Speaking with customers', icon: <PhoneCall size={22} />, color: 'cyan' },
            { label: 'Unallocated Agents', value: `${unallocatedAgentsCount}`, sub: 'Ready to assign campaigns', icon: <Clock size={22} />, color: 'amber' },
          ],
        };
      case 'agent-groups':
        return {
          title: 'Agent Groups',
          category: 'Agent',
          icon: <Users size={24} className="text-indigo" />,
          subtitle: 'Configure skill-based routing clusters, supervisor teams, and priority queues.',
          stats: [
            { label: 'Total Groups', value: '6 Clusters', sub: 'Dialing pools', icon: <Users size={22} />, color: 'indigo' },
            { label: 'Online Agents', value: `${onlineAgentsCount} Agents`, sub: 'Ready for calls', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Mapped Telecallers', value: `${totalAgentsCount - unallocatedAgentsCount} Agents`, sub: `${Math.round(((totalAgentsCount - unallocatedAgentsCount) / (totalAgentsCount || 1)) * 100)}% capacity`, icon: <UserCheck size={22} />, color: 'cyan' },
            { label: 'Unallocated Agents', value: `${unallocatedAgentsCount} Agents`, sub: 'Available to assign', icon: <UserMinus size={22} />, color: 'amber' },
          ],
        };
      case 'campaigns':
        return {
          title: 'Campaigns',
          category: 'Agent',
          icon: <Headphones size={24} className="text-indigo" />,
          subtitle: 'Automated predictive and progressive IVR calling campaigns with real-time analytics.',
          stats: [
            { label: 'Active Campaigns', value: `${activeCampaignsCount} Live`, sub: `${campaignsList.length - activeCampaignsCount} Paused`, icon: <Play size={22} />, color: 'green' },
            { label: 'Calls Placed Today', value: totalAutodialCount.toLocaleString('en-IN'), sub: 'Predictive auto-dialer', icon: <PhoneCall size={22} />, color: 'indigo' },
            { label: 'Contact Rate', value: '68.4%', sub: '+4.1% vs benchmark', icon: <TrendingUp size={22} />, color: 'cyan' },
            { label: 'Total Campaigns', value: `${campaignsList.length}`, sub: 'Configured queues', icon: <CheckCircle2 size={22} />, color: 'purple' },
          ],
        };
      case 'incentives':
        return {
          title: 'Incentives',
          category: 'Agent',
          icon: <Award size={24} className="text-indigo" />,
          subtitle: 'Track telecaller commission tiers, daily target achievements, and bonus payouts.',
          stats: [
            { label: 'Total Disbursed', value: '₹2,48,500', sub: 'This month', icon: <Award size={22} />, color: 'green' },
            { label: 'Top Performer Bonus', value: '₹18,500', sub: 'Preeti Kumari', icon: <Sparkles size={22} />, color: 'amber' },
            { label: 'Eligible Agents', value: `${Math.round(totalAgentsCount * 0.7)} Agents`, sub: 'Achieved target tier', icon: <UserCheck size={22} />, color: 'cyan' },
            { label: 'Target Milestone Rate', value: '88.2%', sub: 'PTP conversion threshold', icon: <TrendingUp size={22} />, color: 'indigo' },
          ],
        };
      case 'training':
        return {
          title: 'Training & Knowledge Base',
          category: 'More',
          icon: <GraduationCap size={24} className="text-indigo" />,
          subtitle: 'Interactive caller scripts, compliance certifications, audio drill exercises, and scoring.',
          stats: [
            { label: 'Training Modules', value: '12 Courses', sub: '3 updated this week', icon: <GraduationCap size={22} />, color: 'indigo' },
            { label: 'Certified Agents', value: `${totalAgentsCount - 3} / ${totalAgentsCount}`, sub: '92.4% completion', icon: <ShieldCheck size={22} />, color: 'green' },
            { label: 'Avg Quiz Score', value: '92.6%', sub: '+5% improvement', icon: <Star size={22} />, color: 'amber' },
            { label: 'Training Hours Logged', value: '340 Hrs', sub: 'This month', icon: <Clock size={22} />, color: 'purple' },
          ],
        };
      case 'reports': {
        const statsMap: Record<string, { label: string; value: string; sub: string; icon: any; color: string }[]> = {
          'One View': [
            { label: 'Total Omni Outreach', value: (84200 + liveCallDelta * 3).toLocaleString('en-IN'), sub: 'Across 4 channels', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Overall Resolution', value: '76.4%', sub: '+3.2% vs target', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Total Collections', value: '₹1.42 Cr', sub: 'Today across channels', icon: <TrendingUp size={22} />, color: 'amber' },
            { label: 'Active Channels', value: '4 Modules', sub: 'CC, Field, Digital, IVR', icon: <Zap size={22} />, color: 'cyan' },
          ],
          'CC Reports': [
            { label: 'Total Call Minutes', value: `${(48290 + liveCallDelta * 4).toLocaleString('en-IN')} Min`, sub: 'Today live dialed', icon: <Clock size={22} />, color: 'indigo' },
            { label: 'First Call Resolution', value: '74.2%', sub: '+2.8% benchmark', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Abandonment Rate', value: '2.8%', sub: 'Well below 5% target', icon: <AlertCircle size={22} />, color: 'cyan' },
            { label: 'Peak Calling Hour', value: '2 PM - 4 PM', sub: '3,800 calls/hr', icon: <BarChart3 size={22} />, color: 'amber' },
          ],
          'Field Reports': [
            { label: 'Field Visits Logged', value: '1,240 Visits', sub: 'Today', icon: <MapPin size={22} />, color: 'indigo' },
            { label: 'Geo-Verified Rate', value: '98.6%', sub: 'GPS check-ins', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Field Cash Collected', value: '₹42.8 Lakh', sub: 'Verified receipts', icon: <TrendingUp size={22} />, color: 'amber' },
            { label: 'Field PTP Promises', value: '385 PTPs', sub: 'Next 48 hrs', icon: <Clock size={22} />, color: 'cyan' },
          ],
          'Digital Engagement Report': [
            { label: 'Messages Dispatched', value: '1,84,000', sub: 'WhatsApp & SMS', icon: <Send size={22} />, color: 'indigo' },
            { label: 'Delivery Success Rate', value: '99.1%', sub: 'High delivery', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Payment Link CTR', value: '24.6%', sub: 'Self-serve clicks', icon: <Smartphone size={22} />, color: 'cyan' },
            { label: 'Digital Recoveries', value: '₹18.5 Lakh', sub: 'Instant gateway', icon: <TrendingUp size={22} />, color: 'amber' },
          ],
          'Call Recordings': [
            { label: 'Total Audio Files', value: `${(12960 + liveCallDelta).toLocaleString('en-IN')} Calls`, sub: 'Cloud recorded', icon: <Volume2 size={22} />, color: 'indigo' },
            { label: 'Total Duration Logged', value: '584 Hrs', sub: 'Audio archived', icon: <Clock size={22} />, color: 'cyan' },
            { label: 'AI Audited Sample', value: '1,420 Calls', sub: 'Speech evaluated', icon: <ShieldCheck size={22} />, color: 'green' },
            { label: 'Average QA Score', value: '94.8%', sub: 'Grade: Excellent', icon: <Star size={22} />, color: 'amber' },
          ],
        };

        return {
          title: 'IVR Reports & Analytics',
          category: 'More',
          icon: <BarChart3 size={24} className="text-indigo" />,
          subtitle: `Comprehensive analytics & real-time drill-down records for ${selectedReportType}.`,
          stats: statsMap[selectedReportType] || statsMap['One View'],
        };
      }
      case 'score':
        return {
          title: 'Agent Quality & QA Scorecard',
          category: 'More',
          icon: <Star size={24} className="text-indigo" />,
          subtitle: 'AI-assisted speech evaluation, pitch compliance, sentiment analysis, and agent scorecards.',
          stats: [
            { label: 'Average QA Score', value: '94.8%', sub: 'Grade: Excellent', icon: <Star size={22} />, color: 'amber' },
            { label: 'Audited Calls', value: '1,420 Calls', sub: 'Automated AI audit', icon: <ShieldCheck size={22} />, color: 'indigo' },
            { label: 'Customer Sentiment', value: '84% Positive', sub: 'Sentiment index', icon: <TrendingUp size={22} />, color: 'green' },
            { label: 'Compliance Adherence', value: '99.2%', sub: 'Zero fatal violations', icon: <CheckCircle2 size={22} />, color: 'purple' },
          ],
        };
      default:
        return {
          title: 'IVR Call Management',
          category: 'IVR',
          icon: <Layers size={24} className="text-indigo" />,
          subtitle: 'Centralized IVR calling platform, lead allocation, agent management, and live reports.',
          stats: [
            { label: 'Total Leads', value: totalAllocatedLeads.toLocaleString('en-IN'), sub: 'Allocated across batches', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Active Agents', value: `${onlineAgentsCount} Online`, sub: `${totalAgentsCount} registered`, icon: <Users size={22} />, color: 'green' },
            { label: 'Live Campaigns', value: `${activeCampaignsCount}`, sub: `${campaignsList.length} total`, icon: <Play size={22} />, color: 'cyan' },
            { label: 'Avg Quality Score', value: '94.8%', sub: 'Audited sample', icon: <Star size={22} />, color: 'amber' },
          ],
        };
    }
  };

  const config = getViewConfig();

  // Render view-specific content with real-time data
  const renderViewContent = () => {
    switch (currentView) {
      case 'allocation-list': {
        const filtered = allocationsList.filter((a) => {
          if (!searchTerm.trim()) return true;
          const q = searchTerm.toLowerCase();
          return (
            a.allocationName.toLowerCase().includes(q) ||
            a.product.toLowerCase().includes(q) ||
            a.buckets.toLowerCase().includes(q)
          );
        });

        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Allocation Name (filename_year_date)</th>
                  <th>Product</th>
                  <th>Bucket</th>
                  <th>Case Counts</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary-light)', fontFamily: 'monospace' }}>
                      {item.allocationName}
                    </td>
                    <td>{item.product}</td>
                    <td>{item.buckets}</td>
                    <td style={{ fontWeight: 600 }}>{item.caseCounts.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>{item.sumOfOutstanding}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${item.tabCategory === '100% Allocated' ? 'completed' : item.tabCategory === 'Unallocated' ? 'break' : 'progress'}`}>
                        {item.tabCategory}
                      </span>
                    </td>
                    <td>{item.createdOn}</td>
                    <td>
                      <button
                        className="ivr-btn ivr-btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => navigate('/allocation')}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'agent-list': {
        const filteredAgents = agentsList.filter((agent) => {
          if (filterStatus === 'ACTIVE' && !agent.isOnline) return false;
          if (!searchTerm.trim()) return true;
          const q = searchTerm.toLowerCase();
          return (
            agent.agentName.toLowerCase().includes(q) ||
            agent.bnId.toLowerCase().includes(q) ||
            agent.campaign.toLowerCase().includes(q)
          );
        });

        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>BN ID</th>
                  <th>Role</th>
                  <th>Assigned Campaign</th>
                  <th>Area</th>
                  <th>Live Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent, index) => {
                  const isCallActive = agent.isOnline && index % 3 === 0;
                  return (
                    <tr key={agent.id}>
                      <td>
                        <div className="ivr-user-cell">
                          <div className="ivr-avatar">{agent.agentName.charAt(0)}</div>
                          <div className="ivr-meta">
                            <span className="ivr-user-name">{agent.agentName}</span>
                            <span className="ivr-user-sub">EXT-{100 + (index + 1)}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{agent.bnId}</td>
                      <td>
                        <span className={`ivr-badge ivr-badge-${agent.type === 'CALL' ? 'online' : 'progress'}`}>
                          {agent.type === 'CALL' ? 'Telecaller' : 'Field Agent'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {agent.campaign !== '-' && agent.campaign ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary-light)' }}>
                            {agent.campaign}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned (-)</span>
                        )}
                      </td>
                      <td>{agent.area}</td>
                      <td>
                        {isCallActive ? (
                          <span className="ivr-badge ivr-badge-progress">
                            In Call (Live)
                          </span>
                        ) : agent.isOnline ? (
                          <span className="ivr-badge ivr-badge-online">
                            Online
                          </span>
                        ) : (
                          <span className="ivr-badge ivr-badge-break">
                            Offline
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="ivr-btn ivr-btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => navigate('/agent/map-campaigns')}
                        >
                          Map / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }

      case 'agent-groups':
        return (
          <div className="ivr-cards-grid">
            {[
              { name: 'Outbound Telesales Cluster', lead: 'Priyam Kumar Singh (TL)', agents: 24, strategy: 'Skill-Based Routing', liveCalls: 18 + (liveCallDelta % 3), answeredRate: '72%', campaign: campaignsList[0]?.name || 'Moneyview_Personal Loan_Fresh' },
              { name: 'Debt Recovery Alpha', lead: 'Amit Sharma (TL)', agents: 20, strategy: 'Round Robin', liveCalls: 15, answeredRate: '65%', campaign: campaignsList[1]?.name || 'Moneyview_Personal Loan_NPA' },
              { name: 'Retention & Loyalty Desk', lead: 'Sneha Kapoor (TL)', agents: 12, strategy: 'Longest Idle Agent', liveCalls: 8, answeredRate: '81%', campaign: campaignsList[2]?.name || 'Moneyview_Credit Line' },
              { name: 'Customer Onboarding & Welcome', lead: 'Pooja Sharma (TL)', agents: 14, strategy: 'Predictive Multi-Dial', liveCalls: 11, answeredRate: '79%', campaign: campaignsList[3]?.name || 'VIP Collections' },
              { name: 'Critical Escalation Cell', lead: 'Zeeshan Anwar (OM)', agents: 8, strategy: 'Direct Priority Queue', liveCalls: 4, answeredRate: '94%', campaign: 'Special Escalation' },
              { name: 'Inbound Verification Helpdesk', lead: 'Vikram Joshi (TL)', agents: 6, strategy: 'Linear Queue', liveCalls: 5, answeredRate: '88%', campaign: 'Verification Desk' },
            ].map((group) => (
              <div key={group.name} className="ivr-group-card">
                <div className="ivr-group-card-header">
                  <div>
                    <h3 className="ivr-group-card-title">{group.name}</h3>
                    <span className="ivr-group-card-meta">Lead: {group.lead}</span>
                  </div>
                  <span className="ivr-badge ivr-badge-online">Active</span>
                </div>

                <div className="ivr-group-stats-row">
                  <div className="ivr-group-stat-col">
                    <span className="ivr-group-stat-lbl">Members</span>
                    <span className="ivr-group-stat-val">{group.agents} Agents</span>
                  </div>
                  <div className="ivr-group-stat-col">
                    <span className="ivr-group-stat-lbl">Active Dials</span>
                    <span className="ivr-group-stat-val">{group.liveCalls} Calls</span>
                  </div>
                  <div className="ivr-group-stat-col">
                    <span className="ivr-group-stat-lbl">Answer Rate</span>
                    <span className="ivr-group-stat-val">{group.answeredRate}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Campaign: <strong>{group.campaign}</strong>
                  </span>
                  <button
                    className="ivr-btn ivr-btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => navigate('/agent/map-campaigns')}
                  >
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'campaigns': {
        const filteredCampaigns = campaignsList.filter((camp) => {
          if (filterStatus === 'ACTIVE' && camp.status !== 'Running') return false;
          if (!searchTerm.trim()) return true;
          const q = searchTerm.toLowerCase();
          return camp.name.toLowerCase().includes(q) || camp.category.toLowerCase().includes(q);
        });

        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Campaign Name (company_product_bucket_year_date)</th>
                  <th>Dialer Mode</th>
                  <th>Target Leads</th>
                  <th>Left Out</th>
                  <th>Contactability</th>
                  <th>Live Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((camp) => (
                  <tr key={camp.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary-light)' }}>{camp.name}</td>
                    <td>
                      <span className="ivr-badge ivr-badge-progress">{camp.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{camp.borrowerCount.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>{camp.leftOutBorrower.toLocaleString('en-IN')}</td>
                    <td>{camp.contactability}%</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${camp.status === 'Running' ? 'online' : 'break'}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="ivr-btn ivr-btn-secondary"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title={camp.status === 'Running' ? 'Pause Campaign' : 'Resume Campaign'}
                          onClick={() => {
                            const next = camp.status === 'Running' ? 'Paused' : 'Running';
                            updateCampaign(camp.id, { status: next });
                          }}
                        >
                          {camp.status === 'Running' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          className="ivr-btn ivr-btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => navigate('/campaigns')}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'incentives':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Telecaller Name</th>
                  <th>Team / Supervisor</th>
                  <th>PTP Calls Achieved</th>
                  <th>Target %</th>
                  <th>Commission Tier</th>
                  <th>Incentive Earned</th>
                  <th>Payout Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'Preeti Kumari', team: 'Sales Alpha', ptp: '148 PTPs', target: 148, tier: 'GOLD', amount: '₹18,500', status: 'APPROVED' },
                  { rank: 2, name: 'Priyanka Kumari', team: 'Recovery Desk', ptp: '136 PTPs', target: 136, tier: 'GOLD', amount: '₹16,800', status: 'APPROVED' },
                  { rank: 3, name: 'Amisha Kumari', team: 'Recovery Desk', ptp: '124 PTPs', target: 124, tier: 'SILVER', amount: '₹13,200', status: 'APPROVED' },
                  { rank: 4, name: 'Priti Kumari', team: 'Retention Hub', ptp: '118 PTPs', target: 118, tier: 'SILVER', amount: '₹11,500', status: 'PENDING_AUDIT' },
                  { rank: 5, name: 'Aman Kumar Gope', team: 'Sales Alpha', ptp: '105 PTPs', target: 105, tier: 'BRONZE', amount: '₹8,400', status: 'APPROVED' },
                  { rank: 6, name: 'Kalyani Kumari', team: 'Cross-Sell Team', ptp: '92 PTPs', target: 92, tier: 'BRONZE', amount: '₹6,000', status: 'PENDING_AUDIT' },
                ].map((item) => (
                  <tr key={item.rank}>
                    <td style={{ fontWeight: 700, color: item.rank <= 3 ? 'var(--accent-primary-light)' : 'inherit' }}>
                      #{item.rank}
                    </td>
                    <td>
                      <div className="ivr-user-cell">
                        <div className="ivr-avatar">{item.name.charAt(0)}</div>
                        <span className="ivr-user-name">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.team}</td>
                    <td style={{ fontWeight: 600 }}>{item.ptp}</td>
                    <td>
                      <div className="ivr-progress-wrapper">
                        <div className="ivr-progress-bar">
                          <div className="ivr-progress-fill" style={{ width: `${Math.min(100, item.target)}%` }} />
                        </div>
                        <span className="ivr-progress-text">{item.target}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${item.tier === 'GOLD' ? 'online' : item.tier === 'SILVER' ? 'progress' : 'break'}`}>
                        {item.tier}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary-light)' }}>{item.amount}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${item.status === 'APPROVED' ? 'online' : 'break'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'reports':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Session / Call ID</th>
                  <th>Channel</th>
                  <th>Agent Name</th>
                  <th>Customer Contact</th>
                  <th>Duration</th>
                  <th>Disposition</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'REC-8921', channel: 'Auto IVR', agent: 'Preeti Kumari', contact: '+91 98351 23456', duration: '2m 45s', disp: 'PTP Agreed', time: 'Just now', status: 'COMPLETED' },
                  { id: 'REC-8920', channel: 'Predictive Dial', agent: 'Priyanka Kumari', contact: '+91 94311 87654', duration: '1m 20s', disp: 'Call Back', time: '2 mins ago', status: 'COMPLETED' },
                  { id: 'REC-8919', channel: 'Voice Broadcast', agent: 'IVR Bot Node 2', contact: '+91 97714 55678', duration: '0m 45s', disp: 'Payment Link Sent', time: '4 mins ago', status: 'COMPLETED' },
                  { id: 'REC-8918', channel: 'Auto IVR', agent: 'Amisha Kumari', contact: '+91 91223 44556', duration: '3m 10s', disp: 'Dispute Logged', time: '6 mins ago', status: 'IN_REVIEW' },
                  { id: 'REC-8917', channel: 'Preview Dial', agent: 'Priti Kumari', contact: '+91 99341 00987', duration: '4m 05s', disp: 'Settlement Offered', time: '8 mins ago', status: 'COMPLETED' },
                ].map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary-light)' }}>{row.id}</td>
                    <td>{row.channel}</td>
                    <td>{row.agent}</td>
                    <td>{row.contact}</td>
                    <td>{row.duration}</td>
                    <td style={{ fontWeight: 600 }}>{row.disp}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.time}</td>
                    <td>
                      <span className="ivr-badge ivr-badge-online">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Caller Type</th>
                  <th>Agent</th>
                  <th>Campaign</th>
                  <th>Call State</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agentsList.slice(0, 8).map((agent, i) => (
                  <tr key={agent.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary-light)' }}>IVR-LIVE-{1000 + i}</td>
                    <td>Predictive IVR</td>
                    <td>{agent.agentName}</td>
                    <td>{agent.campaign !== '-' ? agent.campaign : 'Moneyview_Personal Loan_Fresh'}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${agent.isOnline ? 'online' : 'break'}`}>
                        {agent.isOnline ? 'Active Stream' : 'Idle'}
                      </span>
                    </td>
                    <td>{1 + i}m {20 + i * 5}s</td>
                    <td>
                      <button
                        className="ivr-btn ivr-btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => navigate('/agent/map-campaigns')}
                      >
                        Monitor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="ivr-page">
      {/* Page Header with Real-time Live Engine Badge */}
      <div className="ivr-header">
        <div className="ivr-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 className="ivr-title">
              {config.icon}
              {currentView === 'reports' ? selectedReportType : config.title}
            </h1>
            <div className="ivr-live-engine-badge">
              <span className="ivr-live-ping" />
              <span>LIVE REAL-TIME ENGINE</span>
            </div>
          </div>
          <p className="ivr-subtitle">
            {config.subtitle} &bull; <span style={{ color: 'var(--text-muted)' }}>Synced at {lastSyncTime}</span>
          </p>
        </div>

        <div className="ivr-header-actions">
          <button
            className={`ivr-btn ivr-btn-secondary ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            title="Refresh Live Stream Data"
          >
            <RotateCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
            <span>Sync Live</span>
          </button>
          <button
            className="ivr-btn ivr-btn-secondary"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,ID,Name,Status,Updated\n1,IVR_Batch,Active," + new Date().toISOString();
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `ivr_${currentView}_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download size={16} />
            Export Data
          </button>
          <button
            className="ivr-btn ivr-btn-primary"
            onClick={() => {
              if (currentView === 'allocation-list') navigate('/allocation/upload');
              else if (currentView === 'campaigns') navigate('/campaigns');
              else if (currentView === 'agent-groups') navigate('/agent/map-campaigns');
              else navigate('/agent/map-campaigns');
            }}
          >
            <Plus size={16} />
            {currentView === 'allocation-list' ? 'New Allocation' : currentView === 'campaigns' ? 'New Campaign' : currentView === 'agent-groups' ? 'Create Group' : 'Add Record'}
          </button>
        </div>
      </div>

      {/* Dynamic Real-time Stat Cards */}
      <div className="ivr-stats-grid">
        {config.stats.map((stat, idx) => (
          <div key={idx} className="ivr-stat-card">
            <div className={`ivr-stat-icon ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="ivr-stat-info">
              <span className="ivr-stat-value">{stat.value}</span>
              <span className="ivr-stat-label">{stat.label}</span>
              <span className="ivr-stat-sub">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Panel */}
      <div className="ivr-panel">
        <div className="ivr-panel-header">
          <h2 className="ivr-panel-title">
            <Sparkles size={18} className="text-indigo" />
            {config.title} Overview
          </h2>

          <div className="ivr-panel-toolbar">
            <div className="ivr-search-box">
              <Search size={16} className="ivr-search-icon" />
              <input
                type="text"
                placeholder={`Search in ${currentView === 'reports' ? selectedReportType : config.title}...`}
                className="ivr-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="ivr-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active / Online</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {renderViewContent()}
      </div>
    </div>
  );
}
