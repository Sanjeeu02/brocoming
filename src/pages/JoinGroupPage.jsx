import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Wifi, ChevronRight } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import './JoinGroupPage.css';

export default function JoinGroupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinGroup } = useGroup();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || code.length < 4) {
      setError('Enter a valid group code (min 4 characters)');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    const group = joinGroup(code.trim().toUpperCase(), 'member');
    if (group) {
      navigate('/member-dashboard');
    } else {
      setError('Group not found. Check the code and try again.');
    }
    setLoading(false);
  };

  const handleDemoJoin = () => {
    setCode('OOTY2026');
  };

  return (
    <div className="join-page">
      {/* Background */}
      <div className="join-bg">
        <div className="join-blob-1" />
        <div className="join-blob-2" />
        <div className="join-grid" />
      </div>

      <div className="join-container">
        <button className="btn btn-icon join-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} />
        </button>

        {/* Hero */}
        <div className="join-hero animate-fadeInUp">
          <div className="join-hero-icon">
            <div className="join-pulse-ring-1" />
            <div className="join-pulse-ring-2" />
            <Users size={36} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h1 className="join-title">
            Join a <span className="text-accent">Group</span>
          </h1>
          <p className="join-subtitle">
            Enter the group code shared by your friend to start live tracking together.
          </p>
        </div>

        {/* Code input card */}
        <div className="join-card glass-card animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="join-card-icon">
            <MapPin size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h2 className="join-card-title">Enter Group Code</h2>

          <div className="join-code-input-wrapper">
            <input
              className={`join-code-input mono ${error ? 'error' : ''}`}
              placeholder="XXXXX00"
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                setError('');
              }}
              maxLength={10}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>

          {error && (
            <div className="join-error">
              ⚠️ {error}
            </div>
          )}

          <button
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-disabled' : ''}`}
            onClick={handleJoin}
          >
            {loading
              ? <><span className="animate-spin">⟳</span> Joining group...</>
              : <><Wifi size={18} /> Join Group</>
            }
          </button>

          <div className="divider">or try a demo</div>

          <button className="btn btn-secondary btn-full" onClick={handleDemoJoin}>
            🏔️ Try Demo: Ooty Trip (OOTY2026)
          </button>
        </div>

        {/* What to expect */}
        <div className="join-info animate-fadeInUp" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <h3 className="join-info-title">What happens after joining?</h3>
          <div className="join-steps-list">
            {[
              { icon: '📍', text: 'Your location will be shared with the group in real-time' },
              { icon: '🗺️', text: 'You can see all friends on the live map' },
              { icon: '⏱️', text: 'Everyone sees each other\'s ETA to the destination' },
              { icon: '💬', text: 'Chat and send quick messages to the group' },
            ].map((item, i) => (
              <div key={i} className="join-step-item">
                <span className="join-step-icon">{item.icon}</span>
                <span className="join-step-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <p className="join-privacy animate-fadeInUp" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          🔒 Your location is only shared within this group. Leave anytime.
        </p>
      </div>
    </div>
  );
}
