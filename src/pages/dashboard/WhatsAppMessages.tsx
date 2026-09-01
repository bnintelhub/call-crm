import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Inbox, Calendar as CalendarIcon } from 'lucide-react';

export default function WhatsAppMessages() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box', background: 'var(--bg-main)', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)', padding: 0 }}
        >
          <ChevronLeft size={24} />
          WhatsApp Messages
        </button>
        
        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: '#f3f4f6', color: '#6b7280', padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Today
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', padding: '0.375rem 0.75rem', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <span>01-09-2026</span>
            <span style={{ color: '#9ca3af' }}>→</span>
            <span>01-09-2026</span>
            <CalendarIcon size={16} color="#9ca3af" style={{ marginLeft: '0.5rem' }} />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
        
        {/* Scrollable Table Container */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Account No.', 'Phone Number', 'Product', 'Bucket', 'Allocator', 'Outstanding', 'Date', 'Time', 'Status', 'Actions'].map((head) => (
                  <th key={head} style={{ padding: '1rem', fontSize: '0.8125rem', fontWeight: '600', color: '#64748b', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Empty state placeholder spanning all columns */}
              <tr>
                <td colSpan={11} style={{ padding: '8rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
                    <div style={{ background: '#f1f5f9', borderRadius: '50%', padding: '1rem', marginBottom: '1rem' }}>
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
