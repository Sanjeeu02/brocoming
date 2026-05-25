import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MapPin, Users, Clock, Award, BarChart2 } from 'lucide-react';
import LiveMap from '../components/Map/LiveMap';
import { useGroup } from '../context/GroupContext';
import { STATUS_CONFIG } from '../data/mockData';
import './ViewGroupPage.css';

export default function ViewGroupPage() {
  const navigate = useNavigate();
  const { activeGroup, members, destination, arrivedCount, joinGroup } = useGroup();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleView = async () => {
    if (!code.trim() || code.length < 4) { setError('Enter a valid code'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const group = joinGroup(code.toUpperCase(), 'viewer');
    if (!group) { setError('Group not found.'); }
    setLoading(false);
  };

  if (!activeGroup) {
    return (
      <div className="view-page">
        <div className="view-bg">
          <div className="view-blob-1" /><div className="view-blob-2" />
          <div className="view-grid" />
        </div>
        <div className="view-enter-container animate-fadeInUp">
          <button className="btn btn-icon" onClick={() => navigate('/dashboard')} style={{ alignSelf: 'flex-start' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="view-hero">
            <div className="view-hero-icon">
              <Eye size={36} style={{ color: 'var(--accent-green)' }} />
            </div>
            <h1>View a Group</h1>
            <p>Watch the live map without joining. Perfect for parents, organizers, or curious friends.</p>
          </div>

          <div className="glass-card view-enter-card">
            <h2>Enter Group Code</h2>
            <input
              className={`join-code-input mono ${error ? 'error' : ''}`}
              placeholder="XXXXX00"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }}
              maxLength={10}
            />
            {error && <div className="join-error">⚠️ {error}</div>}
            <button className={`btn btn-green btn-full btn-lg ${loading ? 'btn-disabled' : ''}`} onClick={handleView}>
              {loading ? <><span className="animate-spin">⟳</span> Loading...</> : <><Eye size={18} /> View Group (Read-only)</>}
            </button>
            <button className="btn btn-secondary btn-full" onClick={() => { setCode('OOTY2026'); setTimeout(handleView, 0); }}>
              👁️ Try Demo: Ooty Trip
            </button>
          </div>

          <div className="view-features glass-card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              What you can see
            </h3>
            {[
              { icon: '📍', text: 'Live member locations on map' },
              { icon: '🏁', text: 'Destination and route lines' },
              { icon: '✅', text: 'Who has arrived and who is delayed' },
              { icon: '📊', text: 'Attendance and arrival ranking' },
            ].map((f, i) => (
              <div key={i} className="view-feature-item">
                <span>{f.icon}</span> <span>{f.text}</span>
              </div>
            ))}
            <div className="view-cant-do">
              <div className="view-cant-title">🚫 Cannot do</div>
              <div className="view-cant-list">
                <span>❌ Send messages</span>
                <span>❌ Change settings</span>
                <span>❌ Remove members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active view
  const arrivalRanking = [...members]
    .filter(m => m.status === 'arrived')
    .map(m => m.username);

  return (
    <div className="view-active-page">
      {/* Navbar */}
      <nav className="member-navbar" style={{ flexShrink: 0 }}>
        <button className="btn btn-icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
        </button>
        <div className="member-nav-info">
          <div className="member-nav-name">👁️ Viewing: {activeGroup.groupName}</div>
          <div className="member-nav-dest"><MapPin size={10} /> {destination?.name}</div>
        </div>
        <div className="badge badge-viewer" style={{ display: 'inline-flex' }}>Read-Only</div>
      </nav>

      <div className="view-active-body">
        {/* Map */}
        <div className="view-map-area">
          <LiveMap members={members} destination={destination} userRole="viewer" />
        </div>

        {/* Sidebar */}
        <aside className={`view-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="view-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <BarChart2 size={16} /> {sidebarOpen ? 'Hide' : 'Show Stats'}
          </button>

          {sidebarOpen && (
            <>
              {/* Attendance */}
              <div className="view-section">
                <h4 className="view-section-title"><Users size={14} /> Attendance</h4>
                <div className="view-attendance">
                  <div className="view-attend-num">
                    <span style={{ color: 'var(--accent-green)' }}>{arrivedCount}</span>
                    <span style={{ color: 'var(--text-muted)' }}>/{members.length}</span>
                  </div>
                  <div className="progress-bar-container" style={{ marginTop: 8 }}>
                    <div className="progress-bar-fill" style={{ width: `${(arrivedCount/members.length)*100}%` }} />
                  </div>
                  <div className="view-attend-labels">
                    <span style={{ color: 'var(--accent-green)' }}>✅ {arrivedCount} arrived</span>
                    <span style={{ color: 'var(--accent-orange)' }}>⏳ {members.filter(m => m.status === 'delayed').length} delayed</span>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="view-section">
                <h4 className="view-section-title"><MapPin size={14} /> Members</h4>
                {members.map(m => {
                  const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.moving;
                  return (
                    <div key={m.uid} className="view-member-row">
                      <div className="mini-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', background: `${sc.color}20`, border: `1.5px solid ${sc.color}`, color: sc.color }}>
                        {m.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{m.username}</div>
                        <div style={{ fontSize: '0.75rem', color: sc.color }}>{sc.icon} {sc.label}</div>
                      </div>
                      {m.status !== 'arrived' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{m.eta}m</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Arrival ranking */}
              {arrivalRanking.length > 0 && (
                <div className="view-section">
                  <h4 className="view-section-title"><Award size={14} /> Arrival Ranking</h4>
                  {arrivalRanking.map((name, i) => (
                    <div key={name} className="ranking-item" style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 4 }}>
                      <span>{['🥇','🥈','🥉'][i] || `#${i+1}`}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', flex: 1, paddingLeft: 8 }}>{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
