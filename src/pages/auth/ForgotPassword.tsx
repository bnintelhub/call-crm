import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/shared/Button';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '1rem' }}>
      <div className="agent-table-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} />
          <span>Back to login</span>
        </Link>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          Reset Password
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem' }}>
          Enter your registered email address and we'll send a link to reset your account password.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>Check your email</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Password reset instructions have been sent to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="agent-form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="agent-form-input"
                placeholder="name@company.com"
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
