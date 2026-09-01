import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import type { User, Role } from '../../types';
import './Login.css';

export default function Login() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('admin@bnsinghassociates.com');
  const [password, setPassword] = useState('password123');

  // If redirecting from a protected route, preserve it, else default to /dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const emailLower = email.toLowerCase();
    let role: Role = 'TELECALLER';
    let name = 'Demo Telecaller';
    let landing = from === '/dashboard' || from === '/' ? '/dashboard' : from;

    if (emailLower.includes('superadmin') || emailLower.includes('super@') || emailLower.startsWith('admin@')) {
      role = 'SUPER_ADMIN';
      name = 'BN Orbit Super Admin';
      landing = '/superadmin/dashboard';
    } else if (
      emailLower.includes('supervisor') ||
      emailLower.includes('teamlead') ||
      emailLower.includes('manager')
    ) {
      role = 'TEAM_LEAD';
      name = 'Demo Supervisor';
      landing = '/dashboard';
    } else {
      role = 'TELECALLER';
      name = 'Demo Telecaller';
      landing = '/dashboard';
    }

    // Generate a mock user based on selected role
    const mockUser: User = {
      id: `mock-user-${Date.now()}`,
      name: name,
      email: email,
      role: role,
      isActive: true,
      profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    const mockToken = `mock-token-${Date.now()}`;
    
    // Set authentication state
    setAuth(mockToken, mockUser);
    
    // Navigate to appropriate landing page
    navigate(landing, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-wrapper">
          <div className="login-logo">
            BN
          </div>
        </div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to BN Associates Portal</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
              />
            </div>
          </div>
          <button type="submit" className="login-submit-btn">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Quick Test Roles:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => { setEmail('superadmin@bnorbit.com'); setPassword('password123'); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('supervisor@bnorbit.com'); setPassword('password123'); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              👔 Supervisor
            </button>
            <button
              type="button"
              onClick={() => { setEmail('telecaller@bnorbit.com'); setPassword('password123'); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              📞 Telecaller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
