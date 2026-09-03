import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { useNavigate, useLocation } from 'react-router-dom';

const ALLOCATORS = [
  { name: 'Moneyview', color: '#10b981', textColor: '#047857' },
  { name: 'Kissht', color: '#3b82f6', textColor: '#1d4ed8' },
  { name: 'Ring', color: '#6366f1', textColor: '#4338ca' },
  { name: 'Udaan', color: '#f59e0b', textColor: '#b45309' },
  { name: 'TVS Credit', color: '#ef4444', textColor: '#b91c1c' },
  { name: 'Mpokket', color: '#8b5cf6', textColor: '#6d28d9' }
];

export const OrganizationIdentity: React.FC = () => {
  const storeOrg = useOrgStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // URL has priority for current allocator display, fallback to store
  const currentAllocator = searchParams.get('allocator') || storeOrg.companyName;
  const currentLogoLetter = storeOrg.companyLogoLetter || (currentAllocator ? currentAllocator.charAt(0).toUpperCase() : '');

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    storeOrg.setOrg(name);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {!currentAllocator ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: '1.5px dashed #f97316',
            borderRadius: '20px',
            padding: '4px 14px',
            color: '#f97316',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Select Allocator
        </button>
      ) : (
        <div className="nav-org-identity" onClick={() => setIsOpen(!isOpen)} title={`Organization: ${currentAllocator}`} style={{ cursor: 'pointer' }}>
          <div className="nav-org-logo-circle">
            <span className="nav-org-logo-text">{currentLogoLetter}</span>
          </div>
          <span className="nav-org-name">{currentAllocator}</span>
          <ChevronDown size={14} className="nav-org-chevron" />
        </div>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', right: '0',
          width: '320px', background: 'var(--bg-card)', borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)',
          padding: '1rem', zIndex: 50
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {ALLOCATORS.map(alloc => (
              <button
                key={alloc.name}
                onClick={() => handleSelect(alloc.name)}
                style={{
                  padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '0.25rem', cursor: 'pointer',
                  transition: 'all 0.2s', width: '100%'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = alloc.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${alloc.color}`; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ color: alloc.textColor, fontWeight: '700', fontSize: '0.875rem' }}>
                  {alloc.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationIdentity;
