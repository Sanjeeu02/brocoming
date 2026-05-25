import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, MapPin, MessageCircle, Share2, Lock, Unlock, UserMinus,
  Navigation, Settings, ChevronRight, Clock, Zap, AlertTriangle,
  X, Copy, Check, Phone, ArrowLeft, LogOut
} from 'lucide-react';
import LiveMap from '../components/Map/LiveMap';
import ChatPanel from '../components/Chat/ChatPanel';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { STATUS_CONFIG, QUICK_MESSAGES } from '../data/mockData';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeGroup, members, destination, groupLocked,
    arrivedCount, delayedCount, movingCount,
    removeMember, lockGroup, unlockGroup, endGroup,
    sendMessage, changeDestination, startLocationTracking, stopLocationTracking
  } = useGroup();

  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showQuickMsg, setShowQuickMsg] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('members'); // 'members' | 'stats'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [fakeAlertMember, setFakeAlertMember] = useState(null);

  useEffect(() => {
    startLocationTracking();
    return () => stopLocationTracking();
  }, [startLocationTracking, stopLocationTracking]);

  // Simulate fake detection for stopped member claiming "on the way"
  const stoppedButClaiming = members.find(m => m.status === 'stopped' && m.eta > 15);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeGroup?.groupCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickMessage = (msg) => {
    if (selectedMember) {
      sendMessage(`@${selectedMember.username}: ${msg.text}`, 'quick');
    } else {
      sendMessage(msg.text, 'quick');
    }
    setShowQuickMsg(false);
  };

  const handleEndTrip = () => {
    endGroup();
    navigate('/dashboard');
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowQuickMsg(true);
  };

  const arrivalRanking = [...members]
    .filter(m => m.status === 'arrived')
    .slice(0, 3);

  const medals = ['🥇', '🥈', '🥉'];

  if (!activeGroup) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="admin-page">
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="admin-nav-left">
          <button className="btn btn-icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div className="admin-nav-group">
            <div className="admin-nav-dot animate-blink" />
            <div>
              <div className="admin-nav-name">{activeGroup.groupName}</div>
              <div className="admin-nav-dest">
                <MapPin size={10} />
                {destination?.name || 'No destination set'}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-nav-stats">
          <div className="admin-stat-pill moving">
            <span className="admin-stat-dot" style={{ background: '#00d4ff' }} />
            {movingCount} Moving
          </div>
          <div className="admin-stat-pill arrived">
            <span className="admin-stat-dot" style={{ background: '#00ff88' }} />
            {arrivedCount} Arrived
          </div>
          <div className="admin-stat-pill delayed">
            <span className="admin-stat-dot" style={{ background: '#ff4444' }} />
            {delayedCount} Delayed
          </div>
        </div>

        <div className="admin-nav-right">
          <button className="btn btn-icon tooltip" data-tip="Share invite" onClick={() => setShowInvite(true)}>
            <Share2 size={18} />
          </button>
          <button
            className={`btn btn-icon tooltip ${groupLocked ? 'locked' : ''}`}
            data-tip={groupLocked ? 'Unlock group' : 'Lock group'}
            onClick={() => groupLocked ? unlockGroup() : lockGroup()}
            style={{ color: groupLocked ? 'var(--accent-red)' : undefined }}
          >
            {groupLocked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>
          <button className="btn btn-icon tooltip" data-tip="Chat" onClick={() => setChatOpen(!chatOpen)}>
            <MessageCircle size={18} />
          </button>
          <button
            className="btn btn-sm btn-red"
            onClick={() => setShowEndConfirm(true)}
          >
            <LogOut size={15} /> End Trip
          </button>
          {/* Mobile sidebar toggle */}
          <button className="btn btn-icon mobile-sidebar-toggle" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
            <Users size={18} />
          </button>
        </div>
      </nav>

      {/* Fake detection alert */}
      {stoppedButClaiming && (
        <div className="fake-alert">
          <AlertTriangle size={14} />
          <span>
            <strong>{stoppedButClaiming.username}</strong> hasn't moved for 10+ minutes — possibly not started yet!
          </span>
          <button className="fake-alert-send" onClick={() => {
            sendMessage(`Hey ${stoppedButClaiming.username}, have you started? 📍`, 'quick');
          }}>
            Ping them
          </button>
          <button className="fake-alert-close" onClick={() => {}}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="admin-body">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
          {/* Sidebar Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${sidebarTab === 'members' ? 'active' : ''}`}
              onClick={() => setSidebarTab('members')}
            >
              <Users size={14} /> Members ({members.length})
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'stats' ? 'active' : ''}`}
              onClick={() => setSidebarTab('stats')}
            >
              <Zap size={14} /> Stats
            </button>
          </div>

          {sidebarTab === 'members' ? (
            <div className="sidebar-members">
              {/* Attendance meter */}
              <div className="attendance-meter">
                <div className="attendance-header">
                  <span className="attendance-title">Attendance</span>
                  <span className="attendance-count">
                    <span style={{ color: 'var(--accent-green)' }}>{arrivedCount}</span>
                    <span style={{ color: 'var(--text-muted)' }}>/{members.length}</span>
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(arrivedCount / members.length) * 100}%` }}
                  />
                </div>
                <div className="attendance-labels">
                  <span style={{ color: 'var(--accent-green)' }}>{arrivedCount} arrived</span>
                  <span style={{ color: 'var(--accent-orange)' }}>{delayedCount} delayed</span>
                </div>
              </div>

              {/* Member list */}
              <div className="member-list">
                {members.map((member, idx) => {
                  const statusConf = STATUS_CONFIG[member.status] || STATUS_CONFIG.moving;
                  const rankIdx = arrivalRanking.findIndex(m => m.uid === member.uid);
                  return (
                    <div
                      key={member.uid}
                      className={`member-card ${selectedMember?.uid === member.uid ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedMember(member);
                        setShowQuickMsg(true);
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="member-avatar"
                        style={{
                          background: `linear-gradient(135deg, ${statusConf.color}30, ${statusConf.color}15)`,
                          border: `2px solid ${statusConf.color}`,
                          color: member.status === 'arrived' ? '#000' : statusConf.color,
                        }}
                      >
                        {rankIdx >= 0 && <div className="member-rank">{medals[rankIdx]}</div>}
                        {member.initials}
                        {member.isOnline && <div className="member-online-dot" />}
                      </div>

                      {/* Info */}
                      <div className="member-info">
                        <div className="member-header">
                          <span className="member-name">{member.username}</span>
                          {member.role === 'admin' && (
                            <span className="badge badge-admin text-xs">Admin</span>
                          )}
                        </div>
                        <div className="member-status">
                          <span
                            className="member-status-dot"
                            style={{ background: statusConf.color, boxShadow: `0 0 6px ${statusConf.color}` }}
                          />
                          <span style={{ color: statusConf.color, fontSize: '0.8rem', fontWeight: 600 }}>
                            {statusConf.icon} {statusConf.label}
                          </span>
                        </div>
                        <div className="member-meta">
                          {member.status !== 'arrived' ? (
                            <>
                              <span className="member-eta">⏱️ {member.eta} min</span>
                              <span className="member-dist">📏 {member.distance?.toFixed(1)} km</span>
                              {member.speed > 0 && <span className="member-speed">🚗 {member.speed} km/h</span>}
                            </>
                          ) : (
                            <span style={{ color: 'var(--accent-green)', fontSize: '0.8rem' }}>✅ Reached destination</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="member-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-icon btn-sm tooltip"
                          data-tip="Quick message"
                          onClick={() => { setSelectedMember(member); setShowQuickMsg(true); }}
                          style={{ width: 30, height: 30 }}
                        >
                          <MessageCircle size={13} />
                        </button>
                        {member.role !== 'admin' && (
                          <button
                            className="btn btn-icon btn-sm tooltip"
                            data-tip="Remove member"
                            onClick={() => removeMember(member.uid)}
                            style={{ width: 30, height: 30, color: 'var(--accent-red)' }}
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="sidebar-stats">
              {/* Arrival ranking */}
              <div className="stats-section">
                <h4 className="stats-section-title">🏆 Arrival Ranking</h4>
                {arrivalRanking.length === 0 ? (
                  <p className="text-muted text-sm" style={{ padding: '12px 0' }}>No one arrived yet</p>
                ) : arrivalRanking.map((m, i) => (
                  <div key={m.uid} className="ranking-item">
                    <span className="ranking-medal">{medals[i]}</span>
                    <span className="ranking-name">{m.username}</span>
                    <span className="badge badge-arrived">First!</span>
                  </div>
                ))}
              </div>

              {/* Movement breakdown */}
              <div className="stats-section">
                <h4 className="stats-section-title">📊 Group Status</h4>
                {[
                  { label: 'Moving', count: movingCount, color: '#00d4ff' },
                  { label: 'Arrived', count: arrivedCount, color: '#00ff88' },
                  { label: 'Stopped', count: delayedCount, color: '#ff4444' },
                  { label: 'Online', count: members.filter(m => m.isOnline).length, color: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} className="stat-row">
                    <span className="stat-row-label">{s.label}</span>
                    <div className="stat-row-bar">
                      <div
                        className="stat-row-fill"
                        style={{
                          width: `${(s.count / members.length) * 100}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                    <span className="stat-row-value" style={{ color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>

              {/* ETA breakdown */}
              <div className="stats-section">
                <h4 className="stats-section-title">⏱️ Fastest ETA</h4>
                {[...members]
                  .filter(m => m.status !== 'arrived')
                  .sort((a, b) => a.eta - b.eta)
                  .slice(0, 3)
                  .map(m => (
                    <div key={m.uid} className="eta-row">
                      <div className="member-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--accent-cyan)' }}>
                        {m.initials}
                      </div>
                      <span className="eta-name">{m.username.split(' ')[0]}</span>
                      <span className="eta-value" style={{ color: 'var(--accent-cyan)' }}>
                        {m.eta} min
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Admin controls */}
          <div className="admin-controls">
            <h4 className="admin-controls-title">
              <Settings size={14} /> Admin Controls
            </h4>
            <div className="admin-controls-grid">
              <button className="ctrl-btn" onClick={() => setShowInvite(true)}>
                <Share2 size={16} />
                Add Members
              </button>
              <button
                className={`ctrl-btn ${groupLocked ? 'danger' : ''}`}
                onClick={() => groupLocked ? unlockGroup() : lockGroup()}
              >
                {groupLocked ? <Unlock size={16} /> : <Lock size={16} />}
                {groupLocked ? 'Unlock' : 'Lock Group'}
              </button>
              <button className="ctrl-btn" onClick={() => setChatOpen(true)}>
                <MessageCircle size={16} />
                Open Chat
              </button>
              <button className="ctrl-btn danger" onClick={() => setShowEndConfirm(true)}>
                <LogOut size={16} />
                End Trip
              </button>
            </div>
          </div>
        </aside>

        {/* Map area */}
        <div className="admin-map-area">
          <LiveMap
            members={members}
            destination={destination}
            onMemberClick={handleMemberClick}
            userRole="admin"
          />

          {/* Quick message panel */}
          {showQuickMsg && (
            <div className="quick-msg-panel glass-card">
              <div className="quick-msg-header">
                <span>
                  {selectedMember
                    ? `Quick message → ${selectedMember.username.split(' ')[0]}`
                    : 'Quick message → All'}
                </span>
                <button onClick={() => { setShowQuickMsg(false); setSelectedMember(null); }}>
                  <X size={16} />
                </button>
              </div>
              <div className="quick-msg-grid">
                {QUICK_MESSAGES.map(msg => (
                  <button
                    key={msg.id}
                    className="quick-msg-btn"
                    onClick={() => handleQuickMessage(msg)}
                  >
                    <span className="quick-msg-icon">{msg.icon}</span>
                    {msg.text}
                  </button>
                ))}
              </div>
              {selectedMember && (
                <div className="quick-msg-direct">
                  <input
                    className="form-input"
                    placeholder={`Direct message to ${selectedMember.username.split(' ')[0]}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        sendMessage(`@${selectedMember.username}: ${e.target.value.trim()}`, 'text');
                        e.target.value = '';
                        setShowQuickMsg(false);
                      }
                    }}
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Chat panel */}
          <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

          {/* Chat toggle button */}
          {!chatOpen && (
            <button className="chat-fab" onClick={() => setChatOpen(true)}>
              <MessageCircle size={22} />
              {/* Unread badge */}
              <div className="chat-fab-badge">3</div>
            </button>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Friends</h3>
              <button className="btn btn-icon" onClick={() => setShowInvite(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
                  Share this code with your friends to let them join the group:
                </p>
                <div className="invite-code-display">
                  <span className="invite-code mono">{activeGroup?.groupCode}</span>
                  <button
                    className={`btn btn-sm ${copied ? 'btn-green' : 'btn-secondary'}`}
                    onClick={handleCopyCode}
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>
              <div className="divider">or share link</div>
              <button className="btn btn-primary btn-full" onClick={() => {
                navigator.share?.({
                  title: `Join ${activeGroup?.groupName} on ComingBro`,
                  text: `Use code ${activeGroup?.groupCode} to join our trip!`,
                  url: window.location.origin + `/join-group?code=${activeGroup?.groupCode}`,
                }).catch(() => {});
              }}>
                <Share2 size={16} /> Share Invite Link
              </button>
              <p className="text-muted text-xs text-center">
                {groupLocked ? '🔒 Group is locked — new members cannot join' : '🔓 Group is open for new members'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* End trip confirm */}
      {showEndConfirm && (
        <div className="modal-overlay" onClick={() => setShowEndConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>End Trip?</h3>
              <button className="btn btn-icon" onClick={() => setShowEndConfirm(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>This will end the live session for all {members.length} members. This action cannot be undone.</p>
              <div style={{ marginTop: 8 }}>
                <div className="badge badge-arrived">✅ {arrivedCount} arrived</div>
                {' '}
                <div className="badge badge-stopped" style={{ display: 'inline-flex' }}>⏳ {members.length - arrivedCount} still on the way</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEndConfirm(false)}>Cancel</button>
              <button className="btn btn-red" onClick={handleEndTrip}>End Trip Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
