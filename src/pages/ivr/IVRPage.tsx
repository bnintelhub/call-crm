import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Layers, Headphones, MoreHorizontal, Search, Download, Plus,
  Users, UserCheck, UserMinus, Award, GraduationCap, BarChart3, Star,
  PhoneCall, Clock, CheckCircle2, AlertCircle, Play, Pause,
  TrendingUp, FileSpreadsheet, ShieldCheck, Zap, Sparkles,
  Volume2, MapPin, MessageSquare, Send, Smartphone, FileText
} from 'lucide-react';
import './IVRPage.css';

interface IVRPageProps {
  view?: string;
}

export default function IVRPage({ view: propView }: IVRPageProps) {
  const { tab, reportType: paramReportType } = useParams<{ tab?: string; reportType?: string }>();
  const currentView = propView || tab || 'allocation-list';

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

  // Render view-specific content
  const getViewConfig = () => {
    switch (currentView) {
      case 'allocation-list':
        return {
          title: 'Allocation List',
          category: 'Allocation',
          icon: <Layers size={24} className="text-indigo" />,
          subtitle: 'Manage and distribute IVR dialing batches, customer lead lists, and queue quotas.',
          stats: [
            { label: 'Total Allocated Leads', value: '45,280', sub: '+12% this week', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Pending Dials', value: '14,120', sub: 'In active queues', icon: <Clock size={22} />, color: 'amber' },
            { label: 'Connected Calls', value: '28,450', sub: '62.8% connection rate', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Avg Allocation / Agent', value: '180 Leads', sub: 'Daily cap', icon: <Zap size={22} />, color: 'cyan' },
          ],
        };
      case 'agent-list':
        return {
          title: 'Agent List',
          category: 'Agent',
          icon: <UserCheck size={24} className="text-indigo" />,
          subtitle: 'Monitor all telecallers, extension mappings, live status, and agent workload.',
          stats: [
            { label: 'Total Agents', value: '84', sub: 'Across 6 teams', icon: <Users size={22} />, color: 'indigo' },
            { label: 'Online / Available', value: '52', sub: 'Ready for calls', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Currently in Call', value: '24', sub: 'Active speaking', icon: <PhoneCall size={22} />, color: 'cyan' },
            { label: 'On Break / Inactive', value: '8', sub: 'Idle time tracking', icon: <Clock size={22} />, color: 'amber' },
          ],
        };
      case 'agent-groups':
        return {
          title: 'Agent Groups',
          category: 'Agent',
          icon: <Users size={24} className="text-indigo" />,
          subtitle: 'Configure skill-based routing clusters, supervisor teams, and priority queues.',
          stats: [
            { label: 'Total Groups', value: '8 Groups', sub: 'Dialing pools', icon: <Users size={22} />, color: 'indigo' },
            { label: 'Online Agents', value: '52 Agents', sub: 'Ready for calls', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Mapped Telecallers', value: '84 Agents', sub: '100% capacity', icon: <UserCheck size={22} />, color: 'cyan' },
            { label: 'Unallocated Agents', value: '0 Agents', sub: 'Available to assign', icon: <UserMinus size={22} />, color: 'amber' },
          ],
        };
      case 'campaigns':
        return {
          title: 'Campaigns',
          category: 'Agent',
          icon: <Headphones size={24} className="text-indigo" />,
          subtitle: 'Automated predictive and progressive IVR calling campaigns with real-time analytics.',
          stats: [
            { label: 'Active Campaigns', value: '5 Live', sub: 'Running currently', icon: <Play size={22} />, color: 'green' },
            { label: 'Calls Placed Today', value: '18,940', sub: 'Predictive dialer', icon: <PhoneCall size={22} />, color: 'indigo' },
            { label: 'Contact Rate', value: '68.4%', sub: '+4.1% vs average', icon: <TrendingUp size={22} />, color: 'cyan' },
            { label: 'Completed Campaigns', value: '142', sub: 'Total campaigns', icon: <CheckCircle2 size={22} />, color: 'purple' },
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
            { label: 'Top Performer Bonus', value: '₹18,500', sub: 'Pooja Sharma', icon: <Sparkles size={22} />, color: 'amber' },
            { label: 'Eligible Agents', value: '48 Agents', sub: '57% achieved target', icon: <UserCheck size={22} />, color: 'cyan' },
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
            { label: 'Certified Agents', value: '76 / 84', sub: '90.4% completion', icon: <ShieldCheck size={22} />, color: 'green' },
            { label: 'Avg Quiz Score', value: '92.6%', sub: '+5% improvement', icon: <Star size={22} />, color: 'amber' },
            { label: 'Training Hours Logged', value: '340 Hrs', sub: 'This month', icon: <Clock size={22} />, color: 'purple' },
          ],
        };
      case 'reports': {
        const statsMap: Record<string, { label: string; value: string; sub: string; icon: any; color: string }[]> = {
          'One View': [
            { label: 'Total Omni Outreach', value: '84,200', sub: 'Across 4 channels', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Overall Resolution', value: '76.4%', sub: '+3.2% vs target', icon: <CheckCircle2 size={22} />, color: 'green' },
            { label: 'Total Collections', value: '₹1.42 Cr', sub: 'Today across channels', icon: <TrendingUp size={22} />, color: 'amber' },
            { label: 'Active Channels', value: '4 Modules', sub: 'CC, Field, Digital, IVR', icon: <Zap size={22} />, color: 'cyan' },
          ],
          'CC Reports': [
            { label: 'Total Call Minutes', value: '48,290 Min', sub: 'Today', icon: <Clock size={22} />, color: 'indigo' },
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
            { label: 'Total Audio Files', value: '12,960 Calls', sub: 'Cloud recorded', icon: <Volume2 size={22} />, color: 'indigo' },
            { label: 'Total Duration Logged', value: '584 Hrs', sub: 'Audio archived', icon: <Clock size={22} />, color: 'cyan' },
            { label: 'AI Audited Sample', value: '1,420 Calls', sub: 'Speech evaluated', icon: <ShieldCheck size={22} />, color: 'green' },
            { label: 'Average QA Score', value: '94.8%', sub: 'Grade: Excellent', icon: <Star size={22} />, color: 'amber' },
          ],
        };

        return {
          title: 'IVR Reports & Analytics',
          category: 'More',
          icon: <BarChart3 size={24} className="text-indigo" />,
          subtitle: `Comprehensive analytics & drill-down records for ${selectedReportType}.`,
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
          subtitle: 'Centralized IVR calling platform, lead allocation, agent management, and reports.',
          stats: [
            { label: 'Total Leads', value: '45,280', sub: 'Allocated', icon: <Layers size={22} />, color: 'indigo' },
            { label: 'Active Agents', value: '84', sub: 'Online', icon: <Users size={22} />, color: 'green' },
            { label: 'Live Campaigns', value: '5', sub: 'Running', icon: <Play size={22} />, color: 'cyan' },
            { label: 'Avg Quality Score', value: '94.8%', sub: 'Audited', icon: <Star size={22} />, color: 'amber' },
          ],
        };
    }
  };

  const config = getViewConfig();

  // Mock table data for each specific view
  const renderViewContent = () => {
    switch (currentView) {
      case 'allocation-list':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Campaign / Bucket</th>
                  <th>Allocated Leads</th>
                  <th>Assigned Group / Lead</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'BAT-9081', campaign: 'Q3 Recovery - DPD 30-60', leads: '5,000', group: 'Recovery Alpha (Amit S.)', priority: 'HIGH', progress: 78, status: 'IN_PROGRESS', date: '31 Aug 2026' },
                  { id: 'BAT-9080', campaign: 'Welcome Calling - Batch A', leads: '3,200', group: 'Inbound Support (Pooja)', priority: 'MEDIUM', progress: 100, status: 'COMPLETED', date: '30 Aug 2026' },
                  { id: 'BAT-9079', campaign: 'Personal Loan Tele-Sales', leads: '12,500', group: 'Sales Cluster 1 (Rahul V.)', priority: 'HIGH', progress: 45, status: 'IN_PROGRESS', date: '29 Aug 2026' },
                  { id: 'BAT-9078', campaign: 'Credit Card Retention', leads: '4,100', group: 'Retention Team (Sneha K.)', priority: 'NORMAL', progress: 15, status: 'IN_PROGRESS', date: '28 Aug 2026' },
                  { id: 'BAT-9077', campaign: 'Overdue DPD 90+ Special', leads: '2,800', group: 'Special Escalation Desk', priority: 'CRITICAL', progress: 92, status: 'IN_PROGRESS', date: '27 Aug 2026' },
                  { id: 'BAT-9076', campaign: 'Insurance Cross-sell Blast', leads: '8,000', group: 'Outbound Telesales', priority: 'NORMAL', progress: 0, status: 'PENDING', date: '26 Aug 2026' },
                ].map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-primary-light)' }}>{row.id}</td>
                    <td>{row.campaign}</td>
                    <td style={{ fontWeight: 600 }}>{row.leads}</td>
                    <td>{row.group}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${row.priority.toLowerCase() === 'high' || row.priority.toLowerCase() === 'critical' ? 'break' : 'online'}`}>
                        {row.priority}
                      </span>
                    </td>
                    <td>
                      <div className="ivr-progress-wrapper">
                        <div className="ivr-progress-bar">
                          <div className="ivr-progress-fill" style={{ width: `${row.progress}%` }} />
                        </div>
                        <span className="ivr-progress-text">{row.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${row.status === 'COMPLETED' ? 'completed' : row.status === 'IN_PROGRESS' ? 'progress' : 'pending'}`}>
                        {row.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>
                      <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'agent-list':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Ext ID</th>
                  <th>Assigned Group</th>
                  <th>Assigned Campaign</th>
                  <th>Calls Today</th>
                  <th>Avg Handle Time</th>
                  <th>Live Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Pooja Sharma', id: 'EXT-101', group: 'Sales Cluster A', campaign: 'Personal Loan Telesales', calls: 94, aht: '2m 14s', status: 'IN_CALL' },
                  { name: 'Rohan Verma', id: 'EXT-102', group: 'Recovery Alpha', campaign: 'Q3 Overdue DPD 30', calls: 112, aht: '1m 48s', status: 'ONLINE' },
                  { name: 'Sneha Kapoor', id: 'EXT-103', group: 'Retention Team', campaign: 'Credit Card Retention', calls: 86, aht: '3m 02s', status: 'BREAK' },
                  { name: 'Vikram Singh', id: 'EXT-104', group: 'Recovery Alpha', campaign: 'Q3 Overdue DPD 30', calls: 104, aht: '2m 05s', status: 'IN_CALL' },
                  { name: 'Ananya Roy', id: 'EXT-105', group: 'Inbound Support', campaign: 'Welcome Calling', calls: 78, aht: '2m 40s', status: 'ONLINE' },
                  { name: 'Karan Patel', id: 'EXT-106', group: 'Sales Cluster A', campaign: 'Personal Loan Telesales', calls: 0, aht: '--', status: 'OFFLINE' },
                ].map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="ivr-user-cell">
                        <div className="ivr-avatar">{agent.name.charAt(0)}</div>
                        <div className="ivr-meta">
                          <span className="ivr-user-name">{agent.name}</span>
                          <span className="ivr-user-sub">{agent.id}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{agent.id}</td>
                    <td>{agent.group}</td>
                    <td>{agent.campaign}</td>
                    <td style={{ fontWeight: 700 }}>{agent.calls}</td>
                    <td>{agent.aht}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${agent.status.toLowerCase()}`}>
                        {agent.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Monitor Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'agent-groups':
        return (
          <div className="ivr-cards-grid">
            {[
              { name: 'Outbound Telesales Cluster', lead: 'Rahul Verma (TL)', agents: 24, strategy: 'Skill-Based Routing', liveCalls: 18, answeredRate: '72%' },
              { name: 'Debt Recovery Alpha', lead: 'Amit Sharma (TL)', agents: 20, strategy: 'Round Robin', liveCalls: 15, answeredRate: '65%' },
              { name: 'Retention & Loyalty Desk', lead: 'Sneha Kapoor (TL)', agents: 12, strategy: 'Longest Idle Agent', liveCalls: 8, answeredRate: '81%' },
              { name: 'Customer Onboarding & Welcome', lead: 'Pooja Sharma (TL)', agents: 14, strategy: 'Predictive Multi-Dial', liveCalls: 11, answeredRate: '79%' },
              { name: 'Critical Escalation Cell', lead: 'Zeeshan Anwar (OM)', agents: 8, strategy: 'Direct Priority Queue', liveCalls: 4, answeredRate: '94%' },
              { name: 'Inbound Verification Helpdesk', lead: 'Vikram Joshi (TL)', agents: 6, strategy: 'Linear Queue', liveCalls: 5, answeredRate: '88%' },
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Strategy: <strong>{group.strategy}</strong></span>
                  <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'campaigns':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Dialer Mode</th>
                  <th>Target Leads</th>
                  <th>Dialed</th>
                  <th>Connected Rate</th>
                  <th>Pacing Ratio</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Overdue DPD 30 Automated Blast', mode: 'Predictive', total: '15,000', dialed: '11,400', connRate: '68.5%', pacing: '1:2.4', status: 'RUNNING' },
                  { name: 'Loan Top-Up FastTrack', mode: 'Progressive', total: '8,500', dialed: '6,200', connRate: '74.2%', pacing: '1:1.5', status: 'RUNNING' },
                  { name: 'Credit Limit Enhancement Notification', mode: 'Voice Broadcast', total: '25,000', dialed: '25,000', connRate: '82.0%', pacing: '1:5.0', status: 'COMPLETED' },
                  { name: 'Settlement Offer Campaign', mode: 'Predictive', total: '6,000', dialed: '2,100', connRate: '59.8%', pacing: '1:2.0', status: 'PAUSED' },
                  { name: 'VIP Priority Customer Check-in', mode: 'Preview Dialer', total: '1,200', dialed: '940', connRate: '89.4%', pacing: '1:1.0', status: 'RUNNING' },
                ].map((camp) => (
                  <tr key={camp.name}>
                    <td style={{ fontWeight: 600 }}>{camp.name}</td>
                    <td>
                      <span className="ivr-badge ivr-badge-progress">{camp.mode}</span>
                    </td>
                    <td>{camp.total}</td>
                    <td style={{ fontWeight: 600 }}>{camp.dialed}</td>
                    <td>{camp.connRate}</td>
                    <td>{camp.pacing}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${camp.status === 'RUNNING' ? 'online' : camp.status === 'PAUSED' ? 'break' : 'completed'}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                          {camp.status === 'RUNNING' ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

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
                  { rank: 1, name: 'Pooja Sharma', team: 'Sales Alpha', ptp: '142 PTPs', target: 142, tier: 'GOLD', amount: '₹18,500', status: 'APPROVED' },
                  { rank: 2, name: 'Rohan Verma', team: 'Recovery Desk', ptp: '136 PTPs', target: 136, tier: 'GOLD', amount: '₹16,800', status: 'APPROVED' },
                  { rank: 3, name: 'Vikram Singh', team: 'Recovery Desk', ptp: '124 PTPs', target: 124, tier: 'SILVER', amount: '₹13,200', status: 'APPROVED' },
                  { rank: 4, name: 'Sneha Kapoor', team: 'Retention Hub', ptp: '118 PTPs', target: 118, tier: 'SILVER', amount: '₹11,500', status: 'PENDING_AUDIT' },
                  { rank: 5, name: 'Ananya Roy', team: 'Sales Alpha', ptp: '105 PTPs', target: 105, tier: 'BRONZE', amount: '₹8,400', status: 'APPROVED' },
                  { rank: 6, name: 'Mohit Chawla', team: 'Cross-Sell Team', ptp: '92 PTPs', target: 92, tier: 'BRONZE', amount: '₹6,000', status: 'PENDING_AUDIT' },
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
                      <span className={`ivr-badge ivr-badge-${item.tier.toLowerCase()}`}>
                        {item.tier}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{item.amount}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${item.status === 'APPROVED' ? 'online' : 'pending'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'training':
        return (
          <div className="ivr-cards-grid">
            {[
              { title: 'Standard IVR Pitch & Objection Handling', duration: '45 mins', modules: '6 Lessons', enrolled: '84 Callers', score: '95%', tag: 'MANDATORY' },
              { title: 'Debt Collection Compliance & RBI Ethics', duration: '60 mins', modules: '8 Lessons', enrolled: '84 Callers', score: '98%', tag: 'REGULATORY' },
              { title: 'Effective PTP Negotiation Tactics', duration: '30 mins', modules: '4 Lessons', enrolled: '62 Callers', score: '88%', tag: 'SKILL_UPGRADE' },
              { title: 'Customer Empathy & De-escalation Skills', duration: '40 mins', modules: '5 Lessons', enrolled: '54 Callers', score: '91%', tag: 'SOFT_SKILLS' },
              { title: 'CRM Portal & Disposition Logging Quickstart', duration: '20 mins', modules: '3 Lessons', enrolled: '84 Callers', score: '99%', tag: 'TECHNICAL' },
              { title: 'Cross-selling & Retention Pitch Mastery', duration: '50 mins', modules: '7 Lessons', enrolled: '42 Callers', score: '86%', tag: 'ADVANCED' },
            ].map((course) => (
              <div key={course.title} className="ivr-group-card">
                <div className="ivr-group-card-header">
                  <div>
                    <h3 className="ivr-group-card-title">{course.title}</h3>
                    <span className="ivr-group-card-meta">{course.modules} • {course.duration}</span>
                  </div>
                  <span className="ivr-badge ivr-badge-progress">{course.tag}</span>
                </div>

                <div className="ivr-group-stats-row">
                  <div className="ivr-group-stat-col">
                    <span className="ivr-group-stat-lbl">Enrolled</span>
                    <span className="ivr-group-stat-val">{course.enrolled}</span>
                  </div>
                  <div className="ivr-group-stat-col">
                    <span className="ivr-group-stat-lbl">Avg Score</span>
                    <span className="ivr-group-stat-val">{course.score}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Active Syllabus</span>
                  <button className="ivr-btn ivr-btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}>
                    Open Module
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'reports': {
        const query = searchTerm.toLowerCase();

        // 1. One View
        if (selectedReportType === 'One View') {
          const oneViewData = [
            { channel: 'Contact Center (CC Telecalling)', reach: '48,290 Calls', connected: '32,960 (68.2%)', resolution: '74.2%', collections: '₹64.5 Lakh', ptp: '412', compliance: '99.4%', status: 'Active' },
            { channel: 'Field Operations (FOS Visits)', reach: '1,420 Visits', connected: '1,240 (87.3%)', resolution: '82.0%', collections: '₹42.8 Lakh', ptp: '385', compliance: '98.6%', status: 'Active' },
            { channel: 'Digital Engagement (WhatsApp & SMS)', reach: '1,84,000 Pushes', connected: '1,82,344 (99.1%)', resolution: '68.5%', collections: '₹18.5 Lakh', ptp: '520', compliance: '100%', status: 'Active' },
            { channel: 'Automated Voice IVR Blaster', reach: '22,400 Blasts', connected: '15,680 (70.0%)', resolution: '61.4%', collections: '₹16.2 Lakh', ptp: '210', compliance: '99.8%', status: 'Active' },
          ].filter((row) => !query || row.channel.toLowerCase().includes(query) || row.collections.toLowerCase().includes(query));

          return (
            <div className="ivr-table-wrapper">
              <table className="ivr-table">
                <thead>
                  <tr>
                    <th>Channel / Module</th>
                    <th>Total Reach</th>
                    <th>Connected / Visited</th>
                    <th>Resolution Rate</th>
                    <th>Total Collections</th>
                    <th>PTP Generated</th>
                    <th>Compliance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {oneViewData.map((row) => (
                    <tr key={row.channel}>
                      <td style={{ fontWeight: 600 }}>{row.channel}</td>
                      <td>{row.reach}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>{row.connected}</td>
                      <td style={{ fontWeight: 600 }}>{row.resolution}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{row.collections}</td>
                      <td style={{ fontWeight: 600 }}>{row.ptp}</td>
                      <td>
                        <span className="ivr-badge ivr-badge-online">{row.compliance}</span>
                      </td>
                      <td>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Download size={13} /> Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 2. CC Reports
        if (selectedReportType === 'CC Reports') {
          const ccReportsData = [
            { date: '31 Aug 2026 (Today)', dials: '18,940', answered: '12,960 (68.4%)', drops: '340 (1.8%)', aht: '3m 42s', talk: '584 hrs', ptp: '412' },
            { date: '30 Aug 2026', dials: '19,210', answered: '13,100 (68.2%)', drops: '380 (1.9%)', aht: '3m 50s', talk: '602 hrs', ptp: '428' },
            { date: '29 Aug 2026', dials: '17,890', answered: '12,450 (69.6%)', drops: '310 (1.7%)', aht: '3m 35s', talk: '558 hrs', ptp: '394' },
            { date: '28 Aug 2026', dials: '18,450', answered: '12,780 (69.2%)', drops: '290 (1.5%)', aht: '3m 48s', talk: '579 hrs', ptp: '406' },
            { date: '27 Aug 2026', dials: '16,720', answered: '11,340 (67.8%)', drops: '420 (2.5%)', aht: '3m 55s', talk: '512 hrs', ptp: '365' },
          ].filter((row) => !query || row.date.toLowerCase().includes(query));

          return (
            <div className="ivr-table-wrapper">
              <table className="ivr-table">
                <thead>
                  <tr>
                    <th>Report Date</th>
                    <th>Total Dials</th>
                    <th>Answered Calls</th>
                    <th>Drop-off Count</th>
                    <th>Avg Handle Time (AHT)</th>
                    <th>Total Talk Time</th>
                    <th>PTP Conversions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ccReportsData.map((rep) => (
                    <tr key={rep.date}>
                      <td style={{ fontWeight: 600 }}>{rep.date}</td>
                      <td>{rep.dials}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>{rep.answered}</td>
                      <td style={{ color: '#f59e0b' }}>{rep.drops}</td>
                      <td>{rep.aht}</td>
                      <td>{rep.talk}</td>
                      <td style={{ fontWeight: 700 }}>{rep.ptp}</td>
                      <td>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Download size={13} /> Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 3. Field Reports
        if (selectedReportType === 'Field Reports') {
          const fieldReportsData = [
            { area: 'Delhi NCR - Central & South', agents: 18, accounts: '340', visits: '312 (91.8%)', geo: '99.2%', receipts: '84', collected: '₹12.4 Lakh', ptpRate: '78.5%' },
            { area: 'Mumbai Metro - Western Suburbs', agents: 22, accounts: '410', visits: '385 (93.9%)', geo: '98.7%', receipts: '112', collected: '₹16.8 Lakh', ptpRate: '82.1%' },
            { area: 'Bengaluru East & Whitefield', agents: 14, accounts: '280', visits: '260 (92.8%)', geo: '99.5%', receipts: '72', collected: '₹8.2 Lakh', ptpRate: '76.4%' },
            { area: 'Hyderabad Zone - Cyberabad', agents: 12, accounts: '210', visits: '195 (92.8%)', geo: '98.0%', receipts: '54', collected: '₹5.4 Lakh', ptpRate: '74.2%' },
          ].filter((row) => !query || row.area.toLowerCase().includes(query));

          return (
            <div className="ivr-table-wrapper">
              <table className="ivr-table">
                <thead>
                  <tr>
                    <th>Field Cluster / Area</th>
                    <th>FOS Agents</th>
                    <th>Target Accounts</th>
                    <th>Visits Completed</th>
                    <th>Geo Check-ins</th>
                    <th>Receipts Issued</th>
                    <th>Cash Collected</th>
                    <th>PTP Rate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldReportsData.map((row) => (
                    <tr key={row.area}>
                      <td style={{ fontWeight: 600 }}>{row.area}</td>
                      <td>{row.agents} FOS</td>
                      <td>{row.accounts}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>{row.visits}</td>
                      <td>{row.geo}</td>
                      <td>{row.receipts}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{row.collected}</td>
                      <td style={{ fontWeight: 600 }}>{row.ptpRate}</td>
                      <td>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Download size={13} /> Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 4. Digital Engagement Report
        if (selectedReportType === 'Digital Engagement Report') {
          const digitalData = [
            { channel: 'WhatsApp Pay & Reminder Bot', volume: '78,500', delivered: '99.4%', readRate: '86.2%', ctr: '32.4%', conversions: '1,420', collected: '₹9.4 Lakh' },
            { channel: 'Overdue SMS Link Blasts', volume: '84,000', delivered: '98.9%', readRate: '72.0%', ctr: '18.5%', conversions: '960', collected: '₹5.8 Lakh' },
            { channel: 'RCS Interactive Carousel Cards', volume: '12,500', delivered: '99.0%', readRate: '88.5%', ctr: '38.2%', conversions: '310', collected: '₹2.1 Lakh' },
            { channel: 'Automated Voice IVR Blaster', volume: '9,000', delivered: '96.5%', readRate: '68.0%', ctr: '14.2%', conversions: '180', collected: '₹1.2 Lakh' },
          ].filter((row) => !query || row.channel.toLowerCase().includes(query));

          return (
            <div className="ivr-table-wrapper">
              <table className="ivr-table">
                <thead>
                  <tr>
                    <th>Campaign Channel</th>
                    <th>Broadcast Volume</th>
                    <th>Delivered (%)</th>
                    <th>Read Rate</th>
                    <th>Payment Link CTR</th>
                    <th>Instant Conversions</th>
                    <th>Amount Collected</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {digitalData.map((row) => (
                    <tr key={row.channel}>
                      <td style={{ fontWeight: 600 }}>{row.channel}</td>
                      <td>{row.volume}</td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>{row.delivered}</td>
                      <td>{row.readRate}</td>
                      <td style={{ fontWeight: 600, color: '#2563eb' }}>{row.ctr}</td>
                      <td style={{ fontWeight: 600 }}>{row.conversions}</td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{row.collected}</td>
                      <td>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Download size={13} /> Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 5. Call Recordings
        const recordingsData = [
          { id: 'REC-90412', time: '14:32:10 Today', borrower: 'Kalyani Kumari', phone: '+91 98765 43210', telecaller: 'Pooja Sharma', duration: '4m 12s', disposition: 'PTP Promised', sentiment: 'Positive', score: '98%' },
          { id: 'REC-90408', time: '14:28:45 Today', borrower: 'Ravi Teja', phone: '+91 97654 32109', telecaller: 'Rohan Verma', duration: '2m 45s', disposition: 'Call Back Requested', sentiment: 'Neutral', score: '92%' },
          { id: 'REC-90401', time: '14:15:20 Today', borrower: 'Anil Deshmukh', phone: '+91 96543 21098', telecaller: 'Sneha Kapoor', duration: '5m 18s', disposition: 'Settlement Discussion', sentiment: 'Positive', score: '96%' },
          { id: 'REC-90395', time: '13:58:02 Today', borrower: 'Meera Nair', phone: '+91 95432 10987', telecaller: 'Vikram Singh', duration: '1m 20s', disposition: 'Dispute / Escalated', sentiment: 'Escalated', score: '88%' },
          { id: 'REC-90388', time: '13:42:15 Today', borrower: 'Suresh Raina', phone: '+91 94321 09876', telecaller: 'Ananya Roy', duration: '3m 50s', disposition: 'Paid via Link', sentiment: 'Positive', score: '99%' },
        ].filter((row) => !query || row.borrower.toLowerCase().includes(query) || row.telecaller.toLowerCase().includes(query) || row.id.toLowerCase().includes(query));

        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Call ID & Time</th>
                  <th>Borrower Details</th>
                  <th>Telecaller</th>
                  <th>Duration</th>
                  <th>Disposition</th>
                  <th>Sentiment</th>
                  <th>QA Score</th>
                  <th>Recording / Audio</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recordingsData.map((rec) => {
                  const isPlaying = playingAudioId === rec.id;
                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.time}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rec.borrower}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.phone}</div>
                      </td>
                      <td>
                        <div className="ivr-user-cell">
                          <div className="ivr-avatar">{rec.telecaller.charAt(0)}</div>
                          <span className="ivr-user-name">{rec.telecaller}</span>
                        </div>
                      </td>
                      <td>{rec.duration}</td>
                      <td>
                        <span className="ivr-badge ivr-badge-online">{rec.disposition}</span>
                      </td>
                      <td>
                        <span style={{
                          color: rec.sentiment === 'Positive' ? '#10b981' : rec.sentiment === 'Escalated' ? '#ef4444' : '#f59e0b',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {rec.sentiment}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{rec.score}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setPlayingAudioId(isPlaying ? null : rec.id)}
                          className={`ivr-btn ${isPlaying ? 'ivr-btn-primary' : 'ivr-btn-secondary'}`}
                          style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', gap: '0.35rem' }}
                        >
                          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                          <span>{isPlaying ? 'Playing...' : 'Play Audio'}</span>
                        </button>
                      </td>
                      <td>
                        <button className="ivr-btn ivr-btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} title="Download MP3">
                          <Download size={13} />
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

      case 'score':
        return (
          <div className="ivr-table-wrapper">
            <table className="ivr-table">
              <thead>
                <tr>
                  <th>Agent Name</th>
                  <th>Audited Sample Size</th>
                  <th>Script Adherence</th>
                  <th>Empathy & Tone</th>
                  <th>Compliance Pass Rate</th>
                  <th>Overall Score</th>
                  <th>Grade</th>
                  <th>Audit Feedback</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Pooja Sharma', audited: '42 Calls', script: '98%', tone: '96%', comp: '100%', score: '98.0%', grade: 'A+', note: 'Exceptional call clarity and prompt disposition' },
                  { name: 'Rohan Verma', audited: '38 Calls', script: '94%', tone: '92%', comp: '100%', score: '95.3%', grade: 'A', note: 'Strong negotiation with respectful tone' },
                  { name: 'Sneha Kapoor', audited: '35 Calls', script: '96%', tone: '94%', comp: '99%', score: '96.2%', grade: 'A+', note: 'Very patient objection resolution' },
                  { name: 'Vikram Singh', audited: '40 Calls', script: '91%', tone: '88%', comp: '98%', score: '92.4%', grade: 'A', note: 'Ensure standard greeting is completed' },
                  { name: 'Ananya Roy', audited: '30 Calls', script: '93%', tone: '95%', comp: '100%', score: '96.0%', grade: 'A+', note: 'Positive customer sentiment feedback' },
                  { name: 'Mohit Chawla', audited: '26 Calls', script: '86%', tone: '84%', comp: '96%', score: '88.6%', grade: 'B', note: 'Recommend refresher on RBI guidelines' },
                ].map((item) => (
                  <tr key={item.name}>
                    <td>
                      <div className="ivr-user-cell">
                        <div className="ivr-avatar">{item.name.charAt(0)}</div>
                        <span className="ivr-user-name">{item.name}</span>
                      </div>
                    </td>
                    <td>{item.audited}</td>
                    <td style={{ fontWeight: 600 }}>{item.script}</td>
                    <td>{item.tone}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{item.comp}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary-light)' }}>{item.score}</td>
                    <td>
                      <span className={`ivr-badge ivr-badge-${item.grade === 'A+' || item.grade === 'A' ? 'online' : 'break'}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ivr-page">
      {/* Page Header */}
      <div className="ivr-header">
        <div className="ivr-title-group">
          <h1 className="ivr-title">
            {config.icon}
            {currentView === 'reports' ? selectedReportType : config.title}
          </h1>
          <p className="ivr-subtitle">{config.subtitle}</p>
        </div>

        <div className="ivr-header-actions">
          <button className="ivr-btn ivr-btn-secondary">
            <Download size={16} />
            Export Data
          </button>
          <button className="ivr-btn ivr-btn-primary">
            <Plus size={16} />
            {currentView === 'allocation-list' ? 'New Allocation' : currentView === 'campaigns' ? 'New Campaign' : currentView === 'agent-groups' ? 'Create Group' : 'Add Record'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
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
