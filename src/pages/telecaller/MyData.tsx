import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrgStore } from '../../store/orgStore';
import { MessageSquare, ListTodo, AlertCircle, Search, Inbox, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const OVERVIEW_CARDS = [
  { title: 'Total accounts', percent: '0%', accounts: 6, amount: '₹7.5 Lakh', color: '#10b981' },
  { title: 'Not Contacted', percent: '66.67%', accounts: 4, amount: '₹5.31 Lakh', color: '#10b981' },
  { title: 'Paid', percent: '16.67%', accounts: 1, amount: '₹1.02 Lakh', color: '#10b981' },
  { title: 'PTP', percent: '0%', accounts: 0, amount: '₹0', color: '#10b981' },
  { title: 'RTP', percent: '0%', accounts: 0, amount: '₹0', color: '#10b981' },
  { title: 'Call Back', percent: '0%', accounts: 0, amount: '₹0', color: '#10b981' },
  { title: 'Settlement', percent: '0%', accounts: 0, amount: '₹0', color: '#10b981' },
  { title: 'Dispute', percent: '0%', accounts: 0, amount: '₹0', color: '#10b981' },
  { title: 'Untouched', percent: '16.67%', accounts: 1, amount: '₹1.17 Lakh', color: '#10b981' },
];

const MONEYVIEW_DATA = [
  { name: 'Gitender Kumar', acc: 'xxxxxxxx7647', fullAcc: '314590007647', phone: 'xxxxxx6027', fullPhone: '+919876546027', cardNumber: '4111xxxxxx1234', altPhone: '', email: '', dob: '', state: '', product: '95000', bucket: 'bkt271-365', location: 'Nawadih', out: '₹1.17 Lakh', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Gurugun Singh', acc: 'xxxxxxxx8048', fullAcc: '314590008048', phone: 'xxxxxx3347', fullPhone: '+919876543347', cardNumber: '', altPhone: '+919988776655', email: 'gurugun@example.com', dob: '1985-11-23', state: 'Bihar', product: '90000', bucket: 'bkt91-180', location: 'Dumarsan', out: '₹1.02 Lakh', followUp: '2026-08-30 03:12:00', remarks: 'ho gya paid', ccAgent: '-', dp3: '-', best: 'Paid', last: 'Paid' },
  { name: 'Gopal Kumar Chaudhary', acc: 'xxxxxxxx2973', fullAcc: '314590002973', phone: 'xxxxxx6204', fullPhone: '+919876546204', cardNumber: '5222xxxxxx9988', altPhone: '', email: 'gopal.k@example.com', dob: '', state: '', product: '95000', bucket: 'bkt181-270', location: 'Ramnipatti', out: '₹1.2 Lakh', followUp: '2026-08-30 00:00:00', remarks: 'User Mobile Network Error', ccAgent: '-', dp3: '-', best: 'PTP', last: 'Not Contacted' },
  { name: 'Luv Raj', acc: 'xxxxxxxx8420', fullAcc: '314590008420', phone: 'xxxxxx6270', fullPhone: '+919876546270', cardNumber: '', altPhone: '', email: '', dob: '', state: '', product: '90000', bucket: 'bkt181-270', location: 'Rajgir', out: '₹1.12 Lakh', followUp: '', remarks: 'User Mobile Network Error', ccAgent: '-', dp3: '-', best: 'Not Contacted', last: 'Not Contacted' },
  { name: 'Diksha Sinha', acc: 'xxxxxxxx2944', fullAcc: '314590002944', phone: 'xxxxxx6905', fullPhone: '+919876546905', cardNumber: '', altPhone: '', email: '', dob: '', state: '', product: '75000', bucket: 'bktS45+', location: 'Raipur', out: '₹1.89 Lakh', followUp: '', remarks: 'User Mobile Network Error', ccAgent: '-', dp3: '-', best: 'Not Contacted', last: 'Not Contacted' },
  { name: 'Rahmat Ansari', acc: 'xxxxxxxx2813', fullAcc: '314590002813', phone: 'xxxxxx7383', fullPhone: '+919876547383', cardNumber: '', altPhone: '', email: '', dob: '', state: '', product: '90000', bucket: 'bkt181-270', location: 'Bagodar', out: '₹1.1 Lakh', followUp: '', remarks: 'hgf', ccAgent: '-', dp3: '-', best: 'Dispute', last: 'Not Contacted' },
  { name: 'Sanjay Kumar', acc: 'xxxxxxxx1891', fullAcc: '314590001891', phone: 'xxxxxx4454', fullPhone: '+919876544454', cardNumber: '', altPhone: '', email: '', dob: '', state: '', product: '-', bucket: 'bkt91-180', location: 'Majhiaon Kalan', out: '₹25,682', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Rahul Kumar', acc: 'xxxxxxxx4096', fullAcc: '314590004096', phone: 'xxxxxx5634', fullPhone: '+919876545634', cardNumber: '', altPhone: '', email: '', dob: '', state: '', product: '-', bucket: 'bkt91-180', location: 'Patkhaulia', out: '₹3,502', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Shekhar Chand Sahu', acc: 'xxxxxxxx3490', phone: 'xxxxxxx2129', product: '-', bucket: 'bkt545+', location: 'Raipur', out: '₹3,477', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Kundan Kumar', acc: 'xxxxxxxx0841', phone: 'xxxxxxx5025', product: '-', bucket: 'bkt545+', location: 'Gaya', out: '₹7,390', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Rajiv Raut', acc: 'xxxxxxxx5304', phone: 'xxxxxxx1590', product: '-', bucket: 'bkt545+', location: 'Launga', out: '₹20,287', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Md Azmat', acc: 'xxxxxxxx2444', phone: 'xxxxxxx0287', product: '-', bucket: 'bkt545+', location: 'Begusarai', out: '₹6,000', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Shanti Sahu', acc: 'xxxxxxxx9259', phone: 'xxxxxxx5019', product: '-', bucket: 'bkt365-545', location: 'Korba', out: '₹52,454', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Nitish Kumar', acc: 'xxxxxxxx2856', phone: 'xxxxxxx2647', product: '-', bucket: 'bkt545+', location: 'Bhojpur', out: '₹10,745', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Sawan Kumar', acc: 'xxxxxxxx2613', phone: 'xxxxxxx8772', product: '-', bucket: 'bkt545+', location: 'Giridh', out: '₹55,824', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Danish Ali', acc: 'xxxxxxxx5655', phone: 'xxxxxxx5465', product: '-', bucket: 'bkt545+', location: 'Dhanbad', out: '₹32,174', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Awadhesh Kumar Singh', acc: 'xxxxxxxx1220', phone: 'xxxxxxx6327', product: '-', bucket: 'bkt545+', location: 'Supauli', out: '₹10,856', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Abhishek Kumar', acc: 'xxxxxxxx3196', phone: 'xxxxxxx9805', product: '-', bucket: 'bkt365-545', location: 'Sajua', out: '₹3,726', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Md Hussain', acc: 'xxxxxxxx2674', phone: 'xxxxxxx6480', product: '-', bucket: 'bkt271-365', location: 'Sundarbari', out: '₹3,528', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Mohammad Sahanawaz', acc: 'xxxxxxxx8191', phone: 'xxxxxxx4584', product: '-', bucket: 'bkt365-545', location: 'Alinagar', out: '₹10,869', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' },
  { name: 'Praveen Kumar', acc: 'xxxxxxxx1122', phone: 'xxxxxxx3344', product: '-', bucket: 'bkt545+', location: 'Patna', out: '₹15,430', followUp: '', remarks: '', ccAgent: '-', dp3: '-', best: '-', last: '-' }
];

const KISSHT_DATA = [
  { name: 'Suresh Raina', acc: 'ksshtxxx4321', phone: 'xxxxxxx8822', product: '50000', bucket: 'bkt31-60', location: 'Pune', out: '₹45,000', followUp: '2026-09-01 10:00:00', remarks: 'Will pay next week', ccAgent: '-', dp3: '-', best: 'PTP', last: 'PTP' },
  { name: 'Amit Sharma', acc: 'ksshtxxx9988', phone: 'xxxxxxx1122', product: '35000', bucket: 'bkt61-90', location: 'Delhi', out: '₹30,000', followUp: '', remarks: 'Number busy', ccAgent: '-', dp3: '-', best: 'Not Contacted', last: 'Not Contacted' },
  { name: 'Priya Verma', acc: 'ksshtxxx5544', phone: 'xxxxxxx3344', product: '120000', bucket: 'bkt91-120', location: 'Mumbai', out: '₹1.1 Lakh', followUp: '', remarks: 'Wrong number', ccAgent: '-', dp3: '-', best: 'Not Contacted', last: 'Not Contacted' },
];

const UDAAN_DATA = [
  { name: 'Ravi Kumar', acc: 'udnxxx7766', phone: 'xxxxxxx5566', product: '250000', bucket: 'bkt0-30', location: 'Bangalore', out: '₹2.4 Lakh', followUp: '2026-09-05 14:30:00', remarks: 'Requested time till 5th', ccAgent: '-', dp3: '-', best: 'PTP', last: 'PTP' },
  { name: 'Neha Gupta', acc: 'udnxxx2233', phone: 'xxxxxxx9900', product: '150000', bucket: 'bkt31-60', location: 'Chennai', out: '₹1.5 Lakh', followUp: '', remarks: 'Disputed amount', ccAgent: '-', dp3: '-', best: 'Dispute', last: 'Dispute' },
];

const RING_DATA = [
  { name: 'Vikram Singh', acc: 'rngxxx1111', phone: 'xxxxxxx7777', product: '10000', bucket: 'bkt0-30', location: 'Jaipur', out: '₹8,500', followUp: '2026-08-31 18:00:00', remarks: 'Call back in evening', ccAgent: '-', dp3: '-', best: 'Call Back', last: 'Call Back' },
  { name: 'Anjali Desai', acc: 'rngxxx2222', phone: 'xxxxxxx8888', product: '15000', bucket: 'bkt61-90', location: 'Ahmedabad', out: '₹15,000', followUp: '', remarks: 'Switched off', ccAgent: '-', dp3: '-', best: 'Not Contacted', last: 'Not Contacted' },
  { name: 'Rahul Patil', acc: 'rngxxx3333', phone: 'xxxxxxx9999', product: '25000', bucket: 'bkt91-120', location: 'Surat', out: '₹25,000', followUp: '', remarks: 'Paid yesterday', ccAgent: '-', dp3: '-', best: 'Paid', last: 'Paid' },
  { name: 'Sneha Joshi', acc: 'rngxxx4444', phone: 'xxxxxxx0000', product: '20000', bucket: 'bkt121-150', location: 'Nagpur', out: '₹19,000', followUp: '', remarks: 'Refused to pay', ccAgent: '-', dp3: '-', best: 'RTP', last: 'RTP' },
];

const TVS_CREDIT_DATA = [
  { name: 'Arjun Reddy', acc: 'tvsxxx5555', phone: 'xxxxxxx6666', product: 'Two Wheeler', bucket: 'bkt31-60', location: 'Hyderabad', out: '₹42,000', followUp: '', remarks: 'Wants to settle', ccAgent: '-', dp3: '-', best: 'Settlement', last: 'PTP' },
  { name: 'Priya Sharma', acc: 'tvsxxx7777', phone: 'xxxxxxx8888', product: 'Consumer Loan', bucket: 'bkt0-30', location: 'Bangalore', out: '₹15,000', followUp: '2026-09-02', remarks: 'Paid partially', ccAgent: '-', dp3: '-', best: 'Paid', last: 'PTP' },
];

const MPOKKET_DATA = [
  { name: 'Rohan Gupta', acc: 'mpkxxx1234', phone: 'xxxxxxx5678', product: 'Personal', bucket: 'bkt61-90', location: 'Kolkata', out: '₹5,000', followUp: '', remarks: 'Student loan issue', ccAgent: '-', dp3: '-', best: 'Dispute', last: 'Dispute' },
];

export default function MyData() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const currentTabFromUrl = searchParams.get('tab');
  const { companyName: allocator } = useOrgStore();

  const [activeTab, setActiveTab] = useState('All Accounts');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [crmUpdates, setCrmUpdates] = useState<Record<string, any>>({});

  useEffect(() => {
    const saved = localStorage.getItem('crm_updates');
    if (saved) {
      try {
        setCrmUpdates(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentTabFromUrl === 'FollowUp') setActiveTab('Follow up Accounts');
    else if (currentTabFromUrl === 'Expired') setActiveTab('Expired Accounts');
    else setActiveTab('All Accounts');
    setPage(1); // Reset pagination on tab change
  }, [currentTabFromUrl, allocator]);

  const tabs = ['All Accounts', 'Follow up Accounts', 'Expired Accounts'];

  const getAllocatorData = () => {
    switch (allocator) {
      case 'Moneyview': return MONEYVIEW_DATA;
      case 'Kissht': return KISSHT_DATA;
      case 'Udaan': return UDAAN_DATA;
      case 'Ring': return RING_DATA;
      case 'TVS Credit': return TVS_CREDIT_DATA;
      case 'Mpokket': return MPOKKET_DATA;
      default: return [];
    }
  };

  const allocatorData = getAllocatorData();

  const getDisplayData = () => {
    if (activeTab !== 'All Accounts') return []; // Mocking empty for other tabs
    return allocatorData;
  };

  const displayData = getDisplayData();
  
  // Pagination Logic
  const totalRows = displayData.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = displayData.slice(startIndex, endIndex);

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Hi, {user?.name || 'Priyanka Kumari'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track tasks, make calls, and monitor progress in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-18px', left: '0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Switch campaigns</span>
            <select style={{ padding: '0.5rem 2.5rem 0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)', appearance: 'none', minWidth: '200px' }}>
              <option>{allocator ? `${allocator} - PREDICTIVE` : 'Select an option'}</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
          <button 
            onClick={() => navigate('/whatsapp-messages')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#16a34a', color: 'white', borderRadius: '0.375rem', border: 'none', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <MessageSquare size={16} /> Messages (0)
          </button>
          <button 
            onClick={() => navigate('/priority-tasks')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.375rem', border: 'none', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <ListTodo size={16} /> Priority Tasks
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {allocatorData.length === 0 && (
        <div style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)', padding: '1rem', borderRadius: '0.375rem', marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#d97706" style={{ marginTop: '0.125rem' }} />
          <div>
            <div style={{ color: '#d97706', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Please connect with your supervisor to assign campaign</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.employeeId || 'EMP-001'} : Currently he has not assigned any campaign to you</div>
          </div>
        </div>
      )}

      {/* 9 Cards Section */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem' }}>
        {OVERVIEW_CARDS.map((card, idx) => (
          <div key={idx} style={{ minWidth: '220px', flex: '0 0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{card.title}</span>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{card.percent}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Accounts</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '700' }}>{card.accounts}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Amount</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '700' }}>{card.amount}</div>
              </div>
            </div>
            {/* Bottom Progress Bar simulation */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: card.percent === '0%' ? '0%' : card.percent, background: '#10b981' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: '100%', background: 'var(--border-color)', zIndex: -1 }} />
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                let params = '';
                if (tab === 'Follow up Accounts') params = '?tab=FollowUp';
                else if (tab === 'Expired Accounts') params = '?tab=Expired';
                navigate(`/my-data${params}`);
              }}
              style={{
                padding: '0.75rem 0',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #ea580c' : '2px solid transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '-1px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search account number, name" 
            style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '250px' }} 
          />
        </div>
      </div>

      {/* Table Area */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Scrollable Table Container */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Name', 'Account Number', 'Phone Number', 'Product', 'Bucket', 'Location', 'Outstanding', 'Follow Up Date', 'Latest Remarks Of Borrower', 'CC Agent', '3p Disposition', 'Best Disposition', 'Last Disposition', 'Actions'].map((head) => (
                <th key={head} style={{ padding: '1rem', fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  {head} {head !== 'Actions' && <span style={{ marginLeft: '4px', opacity: 0.5, cursor: 'pointer' }}>=</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => {
                const update = crmUpdates[row.acc] || {};
                const currentOut = update.outstanding || row.out;
                const currentRemark = update.latestRemark || row.remarks;
                const currentBest = update.lastDisposition || row.best;
                const currentLast = update.lastDisposition || row.last;

                return (
                  <tr 
                    key={idx} 
                    onClick={() => navigate(`/borrower/${row.acc}`, { state: row })}
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)', 
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(234, 88, 12, 0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: '#ea580c', fontWeight: '600' }}>{row.name}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.acc}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.phone}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.product}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: '#3b82f6', fontWeight: '500' }}>{row.bucket}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.location}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', fontWeight: '600', color: 'var(--text-primary)' }}>{currentOut}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: '#10b981', fontWeight: '500' }}>{row.followUp}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{currentRemark}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.ccAgent}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{row.dp3}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: '#3b82f6', fontWeight: '500' }}>{currentBest}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{currentLast}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <Inbox size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.875rem' }}>No data</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination Footer */}
        {totalRows > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                style={{ border: 'none', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'var(--border-color)' : '#ea580c', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontWeight: '500' }}>
                {startIndex + 1} - {Math.min(endIndex, totalRows)} of {totalRows}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(Math.ceil(totalRows / rowsPerPage), p + 1))} 
                disabled={endIndex >= totalRows} 
                style={{ border: 'none', background: 'none', cursor: endIndex >= totalRows ? 'not-allowed' : 'pointer', color: endIndex >= totalRows ? 'var(--border-color)' : '#ea580c', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div style={{ width: '1px', height: '1.25rem', background: 'var(--border-color)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Rows per page</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} 
                style={{ border: '1px solid var(--border-color)', borderRadius: '0.25rem', padding: '0.25rem 1.5rem 0.25rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23a1a1aa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.25rem center' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
