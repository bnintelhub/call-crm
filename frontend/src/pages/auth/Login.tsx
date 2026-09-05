import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from '../../components/shared/Toast';
import { authService } from '../../services/authService';
import './Login.css';

export default function Login() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('admin@bnsinghassociates.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  // If redirecting from a protected route, preserve it, else default to /dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email.trim(), password);
      
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid response from server.');
      }

      // Save real token and authenticated user in Zustand store & localStorage
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Determine landing page based on backend verified user role
      let landing = from === '/dashboard' || from === '/' ? '/dashboard' : from;
      if (data.user.role === 'SUPER_ADMIN') {
        landing = '/superadmin/dashboard';
      }

      navigate(landing, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Quick Test Verified Credentials:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => { setEmail('superadmin@bnorbit.com'); setPassword('SuperAdmin@123'); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@bnsinghassociates.com'); setPassword('Admin@123'); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              👔 Supervisor
            </button>
            <button
              type="button"
              onClick={() => { setEmail('telecaller@bnorbit.com'); setPassword('Telecaller@123'); }}
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
