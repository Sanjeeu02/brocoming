import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Award, ChevronRight } from 'lucide-react';
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
            <div className="trips-summary-num">0</div>
            <div className="trips-summary-label">Total Trips</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num">0</div>
            <div className="trips-summary-label">Friends Tracked</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num">0</div>
            <div className="trips-summary-label">Total Arrivals</div>
          </div>
          <div className="trips-summary-divider" />
          <div className="trips-summary-stat">
            <div className="trips-summary-num" style={{ color: 'var(--text-muted)' }}>N/A</div>
            <div className="trips-summary-label">Success Rate</div>
          </div>
        </div>

        {/* Trip list */}
        <div className="trips-list">
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <MapPin size={48} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
            <p>No previous trips found.</p>
          </div>

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
