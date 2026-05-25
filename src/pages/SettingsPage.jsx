import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Bell, Shield, Battery, Eye, Moon, Sun,
  Trash2, LogOut, ChevronRight, Save, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    memberMoved: true,
    memberArrived: true,
    emergency: true,
    messages: true,
    destination: true,
  });
  const [privacy, setPrivacy] = useState({
    invisibleMode: false,
    shareExact: true,
    batterySaver: false,
  });
  const [editName, setEditName] = useState(user?.username || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ username: editName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/auth'); };

  const Toggle = ({ value, onChange }) => (
    <button
      className={`settings-toggle ${value ? 'on' : ''}`}
      onClick={() => onChange(!value)}
    >
      <div className="toggle-knob" />
    </button>
  );

  return (
    <div className="settings-page">
      <div className="settings-bg">
        <div className="settings-blob" />
        <div className="settings-grid" />
      </div>

      <div className="settings-container">
        {/* Header */}
        <div className="settings-header animate-fadeInUp">
          <button className="btn btn-icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Settings</h1>
            <p>Manage your preferences</p>
          </div>
        </div>

        {/* Profile section */}
        <div className="settings-card glass-card animate-fadeInUp" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <div className="settings-section-title">
            <User size={16} style={{ color: 'var(--accent-cyan)' }} />
            Profile
          </div>

          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.profileImage
                ? <img src={user.profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{user?.username?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U'}</span>
              }
              <div className="settings-avatar-edit">
                <Camera size={14} />
              </div>
            </div>
            <div className="settings-profile-info">
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  className="form-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div className="settings-email">{user?.email}</div>
              {user?.phone && <div className="settings-phone">{user?.phone}</div>}
              <button
                className={`btn btn-sm ${saved ? 'btn-green' : 'btn-primary'}`}
                onClick={handleSave}
                style={{ marginTop: 8 }}
              >
                {saved ? '✓ Saved!' : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-card glass-card animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="settings-section-title">
            <Moon size={16} style={{ color: 'var(--accent-cyan)' }} />
            Appearance
          </div>
          <div className="theme-switcher">
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <Moon size={18} /> Dark
            </button>
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <Sun size={18} /> Light
            </button>
          </div>
          <p className="text-muted text-xs" style={{ marginTop: 8 }}>Light theme coming soon!</p>
        </div>

        {/* Notifications */}
        <div className="settings-card glass-card animate-fadeInUp" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div className="settings-section-title">
            <Bell size={16} style={{ color: 'var(--accent-cyan)' }} />
            Notifications
          </div>
          {[
            { key: 'memberMoved', label: 'Friend started moving', desc: 'When a friend begins their journey' },
            { key: 'memberArrived', label: 'Friend arrived', desc: 'When someone reaches the destination' },
            { key: 'emergency', label: 'Emergency alerts', desc: 'SOS and urgent messages' },
            { key: 'messages', label: 'Chat messages', desc: 'New messages in group chat' },
            { key: 'destination', label: 'Destination changed', desc: 'When admin updates the destination' },
          ].map(item => (
            <div key={item.key} className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">{item.label}</div>
                <div className="settings-row-desc">{item.desc}</div>
              </div>
              <Toggle
                value={notifications[item.key]}
                onChange={v => setNotifications(p => ({ ...p, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="settings-card glass-card animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="settings-section-title">
            <Shield size={16} style={{ color: 'var(--accent-cyan)' }} />
            Privacy & Location
          </div>
          {[
            { key: 'invisibleMode', label: '👁️ Invisible Mode', desc: 'Show only approximate area, not exact location' },
            { key: 'shareExact', label: '📍 Share Exact Location', desc: 'Share precise GPS coordinates with group' },
            { key: 'batterySaver', label: '🔋 Battery Saver', desc: 'Reduce GPS updates when battery < 20%' },
          ].map(item => (
            <div key={item.key} className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-label">{item.label}</div>
                <div className="settings-row-desc">{item.desc}</div>
              </div>
              <Toggle value={privacy[item.key]} onChange={v => setPrivacy(p => ({ ...p, [item.key]: v }))} />
            </div>
          ))}
        </div>

        {/* About */}
        <div className="settings-card glass-card animate-fadeInUp" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
          <div className="settings-section-title">
            ℹ️ About
          </div>
          <div className="about-info">
            <div className="about-logo">
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <path d="M32 4C21.5 4 13 12.5 13 23C13 36.5 32 60 32 60C32 60 51 36.5 51 23C51 12.5 42.5 4 32 4Z" fill="url(#settingsPinGrad)" />
                <circle cx="32" cy="23" r="5" fill="white" opacity="0.9" />
                <defs>
                  <linearGradient id="settingsPinGrad" x1="13" y1="4" x2="51" y2="60">
                    <stop stopColor="#00d4ff" /><stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>ComingBro</div>
              <div className="text-muted text-sm">Version 1.0.0</div>
              <div className="text-muted text-xs" style={{ marginTop: 4 }}>"No more fake I'm coming messages"</div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="settings-card glass-card danger-zone animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="settings-section-title" style={{ color: 'var(--accent-red)' }}>
            <Trash2 size={16} /> Danger Zone
          </div>
          <button className="btn btn-ghost btn-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
            <Trash2 size={16} /> Clear Trip History
          </button>
          <button className="btn btn-red btn-full" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
