import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Camera, Mail, Phone, Hash, Shield, KeyRound, Check, Trash2 } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPassword, setIsRequestingPassword] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        updateUser({ ...user, phone, profilePic });
      }
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 600);
  };

  const handlePasswordRequest = () => {
    setIsRequestingPassword(true);
    setTimeout(() => {
      setIsRequestingPassword(false);
      toast.success('Password change request sent to Admin');
    }, 800);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Update your personal details and security settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Header / Avatar Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))', position: 'relative' }}></div>
          <div style={{ padding: '0 2rem 2rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-50px' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', 
                border: '4px solid var(--bg-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                style={{
                  position: 'absolute', bottom: '0', right: '-8px', width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent-primary)', color: 'white', border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px var(--accent-primary-glow)', zIndex: 2
                }}
              >
                <Camera size={14} />
              </button>
              {profilePic && (
                <button 
                  onClick={handleRemovePhoto}
                  title="Remove photo"
                  style={{
                    position: 'absolute', bottom: '0', left: '-8px', width: '32px', height: '32px', borderRadius: '50%',
                    background: '#ef4444', color: 'white', border: '2px solid var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', zIndex: 2
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Shield size={14} />
              <span style={{ textTransform: 'capitalize' }}>{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Personal Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Employee ID</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={user?.employeeId || 'EMP-123'} disabled style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'not-allowed', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={user?.email} disabled style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'not-allowed', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: '600', fontSize: '0.875rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.8 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px var(--accent-primary-glow)' }}
            >
              {isSaving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Security
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Manage your account security and password settings.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Password</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Request a password change from your administrator.</p>
              </div>
            </div>
            <button 
              onClick={handlePasswordRequest}
              disabled={isRequestingPassword}
              style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.75rem', cursor: isRequestingPassword ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => !isRequestingPassword && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {isRequestingPassword ? 'Requesting...' : 'Request Change'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
