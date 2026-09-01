import React, { useState, useRef, useEffect } from 'react';
import { Headset, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function FloatingAction() {
  const { user, isOnline, setIsOnline, activeBreak, setActiveBreak, breakStartTime } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState<'profile' | 'breaks'>('profile');
  const [elapsed, setElapsed] = useState(0);
  
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeBreak && breakStartTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - breakStartTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeBreak, breakStartTime]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMenu(false);
        setActiveView('profile');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    setIsOpen(false);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const breaks = ['Lunch Break', 'Tea Break', 'Meeting', 'Mobile Break', 'Bio Break'];

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      {isOpen && (
        <div ref={popupRef} style={{
          position: 'absolute', bottom: 'calc(100% + 1.25rem)', right: '0',
          width: '380px', minHeight: '480px', background: 'white', borderRadius: '1rem',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2), 0 8px 16px -8px rgba(0,0,0,0.1)',
          border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column'
        }}>
          {activeBreak ? (
            <>
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user?.name || 'Priyanka Kumari'}</span>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <MoreVertical size={24} />
                </button>
                {showMenu && (
                  <div style={{ position: 'absolute', top: '3.5rem', right: '1.25rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                    <button 
                      onClick={() => { setActiveBreak(null); setIsOnline(true); setShowMenu(false); setActiveView('profile'); }}
                      style={{ display: 'block', width: '120px', padding: '0.75rem 1.5rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} 
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Online
                    </button>
                    <button 
                      onClick={() => { setActiveBreak(null); setIsOnline(false); setShowMenu(false); setActiveView('profile'); }}
                      style={{ display: 'block', width: '120px', padding: '0.75rem 1.5rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} 
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Offline
                    </button>
                    <button 
                      onClick={() => { setActiveBreak(null); setShowMenu(false); setActiveView('profile'); }}
                      style={{ display: 'block', width: '120px', padding: '0.75rem 1.5rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} 
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Profile
                    </button>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2.5rem 3rem 2.5rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e0f2fe', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb', marginBottom: '1.5rem' }}>
                  {activeBreak}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Break time taken
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb', marginBottom: '2.5rem' }}>
                  {formatTime(elapsed)}
                </div>
                
                <button 
                  onClick={() => { setActiveBreak(null); setIsOnline(true); setIsOpen(false); }}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '2rem', fontWeight: '600', fontSize: '1.125rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: '#dcfce7', color: '#16a34a'
                  }}
                >
                  GO ONLINE
                </button>
              </div>
            </>
          ) : activeView === 'profile' ? (
            <>
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <MoreVertical size={24} />
                </button>
                
                {showMenu && (
                  <div style={{ position: 'absolute', top: '3.5rem', right: '1.25rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '0.5rem', boxShadow: '0 6px 12px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                    <button 
                      onClick={() => { setActiveView('breaks'); setShowMenu(false); }}
                      style={{ display: 'block', width: '140px', padding: '0.875rem 1.5rem', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-primary)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} 
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      Break
                    </button>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 2.5rem 3rem 2.5rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#9ca3af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
                  {user?.name || 'Priyanka Kumari'}
                </div>
                
                <button 
                  onClick={handleToggleOnline}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '2rem', fontWeight: '600', fontSize: '1.125rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: isOnline ? '#fee2e2' : '#dcfce7',
                    color: isOnline ? '#ef4444' : '#16a34a'
                  }}
                >
                  {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>Break</span>
                <button 
                  onClick={() => setActiveView('profile')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <MoreVertical size={24} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {breaks.map(b => (
                  <button 
                    key={b} 
                    onClick={() => setActiveBreak(b)}
                    style={{ display: 'block', width: '100%', padding: '1.25rem 1.5rem', textAlign: 'left', background: 'transparent', border: 'none', borderTop: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }} 
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} 
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) { setActiveView('profile'); setShowMenu(false); } }}
        style={{
          width: '56px', height: '56px', borderRadius: '50%', background: '#6366f1', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Headset size={28} />
      </button>
    </div>
  );
}
