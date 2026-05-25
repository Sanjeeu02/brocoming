import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Award, ChevronRight } from 'lucide-react';
import { mockPreviousTrips } from '../data/mockData';
import './PreviousTripsPage.css';

export default function PreviousTripsPage() {
  const navigate = useNavigate();

  return (
    <div className="trips-page">
      <div className="trips-bg">
        <div className="trips-blob" />
        <div className="trips-grid" />
      </div>

      <div className="trips-container">
        {/* Header */}
        <div className="trips-header animate-fadeInUp">
          <button className="btn btn-icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Previous Trips</h1>
            <p>Your travel history with friends</p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="trips-summary glass-card animate-fadeInUp" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          <div className="trips-summary-stat">
            <div className="trips-summary-num">{mockPreviousTrips.length}</div>
            <div className="trips-summary-label">Total Trips</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num">{mockPreviousTrips.reduce((a, t) => a + t.memberCount, 0)}</div>
            <div className="trips-summary-label">Friends Tracked</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num">{mockPreviousTrips.reduce((a, t) => a + t.arrived, 0)}</div>
            <div className="trips-summary-label">Total Arrivals</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num" style={{ color: 'var(--accent-green)' }}>97%</div>
            <div className="trips-summary-label">Success Rate</div>
          </div>
        </div>

        {/* Trip list */}
        <div className="trips-list">
          {mockPreviousTrips.map((trip, i) => (
            <div
              key={trip.id}
              className="trip-card glass-card animate-fadeInUp"
              style={{ animationDelay: `${0.1 + i * 0.08}s`, animationFillMode: 'both' }}
            >
              <div className="trip-card-top">
                <div className="trip-icon">
                  {trip.groupName.includes('🏔️') ? '🏔️' :
                   trip.groupName.includes('🎬') ? '🎬' :
                   trip.groupName.includes('🎓') ? '🎓' : '📍'}
                </div>
                <div className="trip-info">
                  <h3 className="trip-name">{trip.groupName}</h3>
                  <div className="trip-dest">
                    <MapPin size={12} /> {trip.destination}
                  </div>
                  <div className="trip-route text-muted text-xs" style={{ marginTop: 2 }}>
                    🛣️ {trip.route}
                  </div>
                </div>
                <div className="trip-stats">
                  <div className="trip-date">{new Date(trip.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  <div className="trip-duration">
                    <Clock size={12} /> {trip.duration}
                  </div>
                </div>
              </div>

              <div className="trip-card-bottom">
                <div className="trip-attendance">
                  <div className="progress-bar-container" style={{ height: 5 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(trip.arrived / trip.memberCount) * 100}%`,
                        background: trip.arrived === trip.memberCount ? 'var(--accent-green)' : 'var(--grad-cyan)',
                      }}
                    />
                  </div>
                  <div className="trip-attendance-text">
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{trip.arrived}/{trip.memberCount}</span>
                    <span className="text-muted"> arrived</span>
                  </div>
                </div>

                <div className="trip-meta">
                  <div className="trip-first-arrival">
                    <Award size={12} style={{ color: 'var(--accent-gold)' }} />
                    <span className="text-muted text-xs">First: </span>
                    <span className="text-sm" style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{trip.firstArrival}</span>
                  </div>
                  <div className="trip-members">
                    <Users size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-muted text-sm">{trip.memberCount} friends</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state encouragement */}
          <div className="trips-cta glass-card animate-fadeInUp" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
            <div className="trips-cta-icon">🚀</div>
            <h3>Plan your next trip!</h3>
            <p className="text-muted">Create a new group and track your crew in real-time.</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-group')}>
              Create New Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
