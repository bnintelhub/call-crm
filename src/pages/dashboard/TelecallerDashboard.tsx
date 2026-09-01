import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface Allocator {
  id: string;
  name: string;
  allocations: number;
}

const ALLOCATORS: Allocator[] = [
  { id: '1', name: 'Moneyview', allocations: 6 },
  { id: '2', name: 'Kissht', allocations: 0 },
  { id: '3', name: 'Ring', allocations: 0 },
  { id: '4', name: 'Udaan', allocations: 0 },
  { id: '5', name: 'TVS Credit', allocations: 0 },
  { id: '6', name: 'Mpokket', allocations: 0 },
];

export default function TelecallerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedAllocator, setSelectedAllocator] = useState<string | null>(null);

  const handleSelect = (allocatorName: string) => {
    setSelectedAllocator(allocatorName);
    navigate(`/my-data?allocator=${encodeURIComponent(allocatorName)}`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome to Yucollect</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Please choose and allocator, Later you can switch to an allocator from top right of nav bar
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {ALLOCATORS.map((allocator) => (
          <div 
            key={allocator.id} 
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '0.5rem', 
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', height: '40px' }}>
               {allocator.name === 'Moneyview' ? (
                 <span style={{ color: '#0d9488', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#0d9488', color: 'white', fontSize: '14px' }}>M</span> Moneyview
                 </span>
               ) : allocator.name === 'Kissht' ? (
                 <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '2rem', letterSpacing: '-1px' }}>kissht</span>
               ) : (
                 <span style={{ border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                   {allocator.name}
                 </span>
               )}
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>{allocator.name}</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
               <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Allocation(s)</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
               <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{allocator.allocations}</span>
               <button 
                 onClick={() => handleSelect(allocator.name)}
                 style={{ 
                   padding: '0.375rem 1rem', 
                   border: '1px solid var(--border-color)', 
                   borderRadius: '0.375rem', 
                   background: 'transparent',
                   cursor: 'pointer',
                   fontSize: '0.875rem',
                   fontWeight: '500',
                   color: 'var(--text-primary)'
                 }}
               >
                 Select
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
