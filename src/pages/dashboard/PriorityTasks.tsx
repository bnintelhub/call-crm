import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Inbox, Calendar as CalendarIcon, Search, ListFilter } from 'lucide-react';

export default function PriorityTasks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PTP/Callback');

  const TABS = ['PTP/Callback', 'Call Drops', 'Missed Calls'];

  const getHeaders = () => {
    switch (activeTab) {
      case 'PTP/Callback':
        return ['Name', 'Account Number', 'Phone Number', 'Product', 'Bucket', 'Location', 'Outstanding', 'Last Disposition', 'Followup Date', 'PTP Date', 'Best Disposition', 'Last Campaign', 'Actions'];
      case 'Call Drops':
        return ['Name', 'Account Number', 'Phone Number', 'Product', 'Bucket', 'Location', 'Outstanding', 'Call Drop Time', 'Last Disposition', 'Best Disposition', 'Last Campaign', 'Dialed', 'Dialed Date', 'Actions'];
      case 'Missed Calls':
        return ['Name', 'Mobile Number', 'Account Number', 'Campaign Name', 'Campaign Type', 'Last Agent Called', 'Product', 'Bucket', 'Outstanding', 'Missed Call Date', 'Missed Call Time', 'Last Disposition', 'Best Disposition'];
      default:
        return [];
    }
  };

  const headers = getHeaders();

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', padding: 0 }}
        >
          <ChevronLeft size={24} />
          Priority Tasks
        </button>
        
        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--border-color)', gap: '0.25rem' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: activeTab === tab ? '#ff7043' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab !== 'Missed Calls' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: '220px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{activeTab === 'PTP/Callback' ? 'PTP' : 'Total Call Drop'}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Accounts</div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount</div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>₹0</div>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', minWidth: '220px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{activeTab === 'PTP/Callback' ? 'Call Back' : 'Pending Call Drop'}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Accounts</div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount</div>
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>₹0</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search accounts, names, mobiles" 
            style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', border: '1px solid #3b82f6', borderRadius: '0.375rem', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%', outline: 'none' }} 
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeTab !== 'Missed Calls' && (
            <>
              <div style={{ background: '#e5e7eb', color: '#4b5563', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Today
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '0.5rem 1rem', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <span>01-09-2026</span>
                <span style={{ color: '#9ca3af' }}>→</span>
                <span>01-09-2026</span>
                <CalendarIcon size={16} color="#9ca3af" style={{ marginLeft: '0.5rem' }} />
              </div>
            </>
          )}
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <ListFilter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        
        {/* Scrollable Table Container */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {headers.map((head) => (
                  <th key={head} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Empty state placeholder spanning all columns */}
              <tr>
                <td colSpan={headers.length} style={{ padding: '8rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
                    <div style={{ background: 'transparent', padding: '1rem', marginBottom: '0.5rem' }}>
                      <Inbox size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>No data</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
