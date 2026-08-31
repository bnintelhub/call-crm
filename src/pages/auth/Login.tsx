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

    const role: Role = email.toLowerCase().includes('supervisor') ? 'TEAM_LEAD' : 'TELECALLER';

    // Generate a mock user based on selected role
    const mockUser: User = {
      id: `mock-user-${Date.now()}`,
      name: role === 'TELECALLER' ? 'Demo Telecaller' : 'Demo Supervisor',
      email: email,
      role: role,
      isActive: true,
      profilePic: `https://ui-avatars.com/api/?name=Demo+${role === 'TELECALLER' ? 'Telecaller' : 'Supervisor'}&background=random`
    };

    const mockToken = `mock-token-${Date.now()}`;
    
    // Set authentication state
    setAuth(mockToken, mockUser);
    
    // Navigate to dashboard
    navigate(from, { replace: true });
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

        <div className="login-footer">
          Forgot your password? Contact your administrator
        </div>
      </div>
    </div>
  );
}
