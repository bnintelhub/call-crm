import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, Bell, Shield, Palette } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { useThemeStore } from '../../store/themeStore';
import Button from '../../components/shared/Button';

export const Settings: React.FC = () => {
  const { companyName, setOrg } = useOrgStore();
  const { theme, toggleTheme } = useThemeStore();
  const [nameInput, setNameInput] = useState(companyName);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setOrg(nameInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 2rem 3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          System & Organization Settings
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          Configure enterprise branding, notifications, and theme settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div className="agent-table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Company Branding (Navbar)
            </h3>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="agent-form-group">
              <label>Organization Name (Appears in Top Navbar)</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="agent-form-input"
                placeholder="e.g. Moneyview"
              />
            </div>

            {saved && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                ✓ Organization settings saved successfully!
              </p>
            )}

            <Button type="submit" variant="primary" size="md">
              Save Branding
            </Button>
          </form>
        </div>

        <div className="agent-table-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Palette size={18} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Appearance & Theme
            </h3>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Current active theme: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
          </p>

          <Button type="button" variant="secondary" size="md" onClick={toggleTheme}>
            Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
