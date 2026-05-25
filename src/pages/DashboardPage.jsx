import { useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, Clock, Settings, LogOut, MapPin, Bell, ChevronRight, Zap, Shield, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockPreviousTrips } from '../data/mockData';
import './DashboardPage.css';

const DASHBOARD_CARDS = [
  {
    id: 'create',
    icon: Plus,
    emoji: '🚀',
    title: 'Create Group',
    desc: 'Start a new live tracking session',
    route: '/create-group',
    color: 'cyan',
    gradient: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.15))',
    border: 'rgba(0,212,255,0.3)',
    tag: 'Admin',
  },
  {
    id: 'join',
    icon: Users,
    emoji: '🤝',
    title: 'Join Group',
    desc: 'Enter a code to join friends',
    route: '/join-group',
    color: 'violet',
    gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.15))',
    border: 'rgba(124,58,237,0.3)',
    tag: 'Member',
  },
  {
    id: 'view',
    icon: Eye,
    emoji: '👁️',
    title: 'View Group',
    desc: 'Watch without joining',
    route: '/view-group',
    color: 'green',
    gradient: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,184,148,0.15))',
    border: 'rgba(0,255,136,0.3)',
    tag: 'Viewer',
  },
  {
    id: 'history',
    icon: Clock,
    emoji: '📋',
    title: 'Previous Trips',
    desc: 'View your trip history',
    route: '/trips',
    color: 'gold',
    gradient: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,136,0,0.15))',
    border: 'rgba(255,215,0,0.3)',
    tag: 'History',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initials = user?.username
    ? user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="dashboard-page">
      {/* Background */}
      <div className="dash-bg">
        <div className="dash-blob-1" />
        <div className="dash-blob-2" />
        <div className="dash-grid" />
      </div>

      {/* Navbar */}
      <nav className="dash-navbar glass-card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="dash-nav-brand">
          <div className="dash-nav-logo">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <path d="M32 4C21.5 4 13 12.5 13 23C13 36.5 32 60 32 60C32 60 51 36.5 51 23C51 12.5 42.5 4 32 4Z" fill="url(#navPinGrad)" />
              <circle cx="32" cy="23" r="5" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="navPinGrad" x1="13" y1="4" x2="51" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4ff" /><stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="dash-nav-title">ComingBro</span>
        </div>

        <div className="dash-nav-actions">
          <button className="btn btn-icon tooltip" data-tip="Notifications">
            <Bell size={18} />
          </button>
          <button className="btn btn-icon tooltip" data-tip="Settings" onClick={() => navigate('/settings')}>
            <Settings size={18} />
          </button>
          <div className="dash-user-avatar tooltip" data-tip={user?.username || 'User'}>
            {user?.profileImage
              ? <img src={user.profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{initials}</span>
            }
            <div className="avatar-online-ring" />
          </div>
          <button className="btn btn-icon tooltip" data-tip="Logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="dash-main">
        {/* Welcome section */}
        <section className="dash-welcome animate-fadeInUp">
          <div className="dash-welcome-text">
            <h1>
              Welcome back,{' '}
              <span className="text-accent">{user?.username?.split(' ')[0] || 'Friend'}</span> 👋
            </h1>
            <p>Ready to track your crew? Create or join a group below.</p>
          </div>

          {/* Stats row */}
          <div className="dash-stats">
            {[
              { icon: '🗺️', value: '3', label: 'Total Trips' },
              { icon: '👥', value: '12', label: 'Friends Tracked' },
              { icon: '✅', value: '97%', label: 'Arrival Rate' },
              { icon: '⏱️', value: '8 min', label: 'Avg ETA Accuracy' },
            ].map((s, i) => (
              <div key={i} className="dash-stat-card glass-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="dash-stat-icon">{s.icon}</span>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main action cards */}
        <section className="dash-cards-section">
          <h2 className="dash-section-title">
            <Zap size={20} style={{ color: 'var(--accent-cyan)' }} />
            Quick Actions
          </h2>
          <div className="dash-cards-grid">
            {DASHBOARD_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  className="dash-card animate-fadeInUp"
                  style={{
                    background: card.gradient,
                    border: `1px solid ${card.border}`,
                    animationDelay: `${i * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                  onClick={() => navigate(card.route)}
                >
                  <div className="dash-card-tag" style={{ background: card.border, color: '#fff' }}>
                    {card.tag}
                  </div>
                  <div className="dash-card-emoji">{card.emoji}</div>
                  <h3 className="dash-card-title">{card.title}</h3>
                  <p className="dash-card-desc">{card.desc}</p>
                  <div className="dash-card-arrow">
                    <ChevronRight size={20} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Previous trips preview */}
        <section className="dash-recent-section animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="dash-section-header">
            <h2 className="dash-section-title">
              <Clock size={20} style={{ color: 'var(--accent-cyan)' }} />
              Recent Trips
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/trips')}>View All</button>
          </div>

          <div className="dash-recent-list">
            {mockPreviousTrips.slice(0, 3).map((trip, i) => (
              <div key={trip.id} className="dash-recent-card glass-card" style={{ animationDelay: `${0.35 + i * 0.07}s`, animationFillMode: 'both' }}>
                <div className="dash-recent-icon">
                  <MapPin size={18} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div className="dash-recent-info">
                  <div className="dash-recent-name">{trip.groupName}</div>
                  <div className="dash-recent-dest text-muted text-sm">{trip.destination}</div>
                  <div className="dash-recent-meta">
                    <span className="badge badge-arrived">
                      {trip.arrived}/{trip.memberCount} arrived
                    </span>
                    <span className="text-muted text-xs">{trip.date}</span>
                  </div>
                </div>
                <div className="dash-recent-duration">
                  <div className="dash-recent-time">{trip.duration}</div>
                  <Star size={14} style={{ color: 'var(--accent-gold)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="dash-features animate-fadeInUp" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          <h2 className="dash-section-title">
            <Shield size={20} style={{ color: 'var(--accent-cyan)' }} />
            Smart Features
          </h2>
          <div className="dash-features-grid">
            {[
              { emoji: '🎭', title: 'Fake Detection', desc: "Catches 'I'm coming' lies using GPS movement analysis" },
              { emoji: '🧠', title: 'AI ETA', desc: 'Traffic-aware predictions that actually work' },
              { emoji: '🚨', title: 'SOS System', desc: 'Emergency alerts with one tap' },
              { emoji: '🔒', title: 'Private & Secure', desc: 'Location shared only within your group' },
              { emoji: '🔋', title: 'Battery Saver', desc: 'Smart GPS updates when battery is low' },
              { emoji: '👁️', title: 'Invisible Mode', desc: 'Show only approximate area, not exact location' },
            ].map((f, i) => (
              <div key={i} className="dash-feature-chip glass-card">
                <span style={{ fontSize: '1.3rem' }}>{f.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
                  <div className="text-muted text-xs">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
