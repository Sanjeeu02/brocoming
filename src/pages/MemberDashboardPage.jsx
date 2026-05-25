import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, MessageCircle, AlertTriangle, Navigation,
  MoreVertical, X, ChevronUp
} from 'lucide-react';
import LiveMap from '../components/Map/LiveMap';
import ChatPanel from '../components/Chat/ChatPanel';
import { useGroup } from '../context/GroupContext';
import { STATUS_CONFIG } from '../data/mockData';
import './MemberDashboardPage.css';

const MY_STATUSES = [
  { key: 'started', label: '🚀 Started', color: '#7c3aed' },
  { key: 'moving', label: '🚗 On the way', color: '#00d4ff' },
  { key: 'slow', label: '🐢 Slow traffic', color: '#ffd700' },
  { key: 'traffic', label: '🚦 Heavy traffic', color: '#ff6b35' },
  { key: 'delayed', label: '⚠️ Delayed', color: '#ff8800' },
  { key: 'arrived', label: '✅ Reached!', color: '#00ff88' },
  { key: 'notcoming', label: '❌ Not coming', color: '#888' },
];

const SOS_MESSAGES = [
  '🚨 Bike puncture! Stopped.',
  '🤒 Not feeling well.',
  '👨‍👩‍👧 Family issue.',
  '🛣️ Took wrong route.',
  '⛽ Stopped for fuel.',
  '🆘 Need help!',
];

export default function MemberDashboardPage() {
  const navigate = useNavigate();
  const { activeGroup, members, destination, updateMemberStatus, sendMessage, fakeAlert, startLocationTracking, stopLocationTracking } = useGroup();
  const [chatOpen, setChatOpen] = useState(false);
  const [myStatus, setMyStatus] = useState('moving');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const myMember = members.find(m => m.uid === 'user-001');
  const statusConf = STATUS_CONFIG[myStatus] || STATUS_CONFIG.moving;

  useEffect(() => {
    startLocationTracking();
    return () => stopLocationTracking();
  }, [startLocationTracking, stopLocationTracking]);


  const handleStatusChange = (key) => {
    setMyStatus(key);
    updateMemberStatus('user-001', key);
    setShowStatusPicker(false);
  };

  const handleSOS = (msg) => {
    sendMessage(msg, 'emergency');
    setShowSOS(false);
  };

  if (!activeGroup) { navigate('/dashboard'); return null; }

  return (
    <div className="member-page">
      {/* Top bar */}
      <nav className="member-navbar">
        <button className="btn btn-icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
        </button>
        <div className="member-nav-info">
          <div className="member-nav-name">{activeGroup.groupName}</div>
          <div className="member-nav-dest">
            <MapPin size={10} /> {destination?.name}
          </div>
        </div>
        <div className="member-nav-right">
          <button className="btn btn-icon" onClick={() => setChatOpen(!chatOpen)}>
            <MessageCircle size={18} />
          </button>
        </div>
      </nav>

      {/* Fake detection banner */}
      {fakeAlert && (
        <div className="member-fake-banner">
          <AlertTriangle size={14} />
          <span>{fakeAlert}</span>
          <button
            className="fake-banner-action"
            onClick={() => handleStatusChange('moving')}
          >
            Update Status
          </button>
        </div>
      )}

      {/* Map */}
      <div className="member-map-wrapper">
        <LiveMap members={members} destination={destination} userRole="member" />
        <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </div>

      {/* Bottom bar */}
      <div className="member-bottom-bar">
        {/* My status */}
        <div className="member-my-status">
          <div className="member-status-label">My Status</div>
          <button
            className="member-status-btn"
            style={{ borderColor: statusConf.color, color: statusConf.color, background: `${statusConf.bg}` }}
            onClick={() => setShowStatusPicker(!showStatusPicker)}
          >
            {statusConf.icon} {statusConf.label}
            <ChevronUp
              size={14}
              style={{ transform: showStatusPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {/* Status picker */}
          {showStatusPicker && (
            <div className="status-picker">
              {MY_STATUSES.map(s => (
                <button
                  key={s.key}
                  className={`status-option ${myStatus === s.key ? 'active' : ''}`}
                  style={myStatus === s.key ? { borderColor: s.color, background: `${s.color}20` } : {}}
                  onClick={() => handleStatusChange(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ETA info */}
        {myMember && myStatus !== 'arrived' && (
          <div className="member-eta-display">
            <div className="member-eta-value" style={{ color: 'var(--accent-cyan)' }}>
              {myMember.eta} min
            </div>
            <div className="member-eta-label">ETA</div>
          </div>
        )}
        {myStatus === 'arrived' && (
          <div className="member-arrived-badge">
            ✅ Reached!
          </div>
        )}

        {/* SOS button */}
        <button
          className="member-sos-btn"
          onClick={() => setShowSOS(!showSOS)}
        >
          <AlertTriangle size={18} />
          SOS
        </button>

        {/* Chat button */}
        {!chatOpen && (
          <button className="member-chat-btn" onClick={() => setChatOpen(true)}>
            <MessageCircle size={18} />
            Chat
          </button>
        )}
      </div>

      {/* SOS modal */}
      {showSOS && (
        <div className="modal-overlay" onClick={() => setShowSOS(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-red)' }}>
                <AlertTriangle size={20} />
                <h3 style={{ color: 'inherit' }}>Emergency Alert</h3>
              </div>
              <button className="btn btn-icon" onClick={() => setShowSOS(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>Send an emergency alert to the group:</p>
              <div className="sos-grid">
                {SOS_MESSAGES.map((msg, i) => (
                  <button
                    key={i}
                    className="sos-option"
                    onClick={() => handleSOS(msg)}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members mini-list */}
      <div className="member-mini-list glass-card">
        <div className="mini-list-header">
          <span>Friends ({members.length})</span>
          <span className="text-accent text-sm">{members.filter(m => m.status === 'arrived').length} arrived</span>
        </div>
        <div className="mini-list-items">
          {members.map(m => {
            const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.moving;
            return (
              <div key={m.uid} className="mini-member">
                <div className="mini-avatar" style={{ background: `${sc.color}20`, border: `1.5px solid ${sc.color}`, color: sc.color }}>
                  {m.initials}
                </div>
                <div className="mini-info">
                  <div className="mini-name">{m.username.split(' ')[0]}</div>
                  <div className="mini-eta" style={{ color: sc.color }}>{sc.icon} {m.status === 'arrived' ? 'Arrived' : `${m.eta}m`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
