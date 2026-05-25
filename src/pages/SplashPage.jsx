import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      navigate('/auth');
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, [navigate]);

  return (
    <div className="splash-page">
      {/* Animated background grid */}
      <div className="splash-grid" />

      {/* Background particles */}
      <div className="splash-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }} />
        ))}
      </div>

      {/* Glow blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Main content */}
      <div className="splash-content">
        {/* Logo section */}
        <div className="splash-logo-container">
          {/* Pulse rings */}
          <div className="pulse-ring pulse-ring-1" />
          <div className="pulse-ring pulse-ring-2" />
          <div className="pulse-ring pulse-ring-3" />

          {/* Logo icon */}
          <div className="splash-logo-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              {/* GPS Pin */}
              <path
                d="M32 4C21.5 4 13 12.5 13 23C13 36.5 32 60 32 60C32 60 51 36.5 51 23C51 12.5 42.5 4 32 4Z"
                fill="url(#pinGrad)"
                opacity="0.9"
              />
              {/* Route lines */}
              <path d="M20 23 Q32 8 44 23" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
              {/* Inner circle */}
              <circle cx="32" cy="23" r="8" fill="rgba(0,0,0,0.5)" />
              <circle cx="32" cy="23" r="5" fill="white" opacity="0.9" />
              {/* Speed lines */}
              <path d="M8 30 L18 30" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 36 L20 36" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <path d="M6 24 L14 24" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <defs>
                <linearGradient id="pinGrad" x1="13" y1="4" x2="51" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4ff" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* App name */}
        <div className="splash-title-group">
          <h1 className="splash-title">
            Coming<span className="splash-title-bro">Bro</span>
          </h1>
          <div className="splash-title-bar" />
          <p className="splash-tagline">
            No more fake <span className="tagline-quote">"I'm coming"</span> messages
          </p>
        </div>

        {/* Loading indicator */}
        <div className="splash-loader">
          <div className="loader-track">
            <div className="loader-fill" />
          </div>
          <p className="loader-text">Locating your friends...</p>
        </div>

        {/* Bottom status bar */}
        <div className="splash-status-bar">
          <div className="status-dot" />
          <span>GPS • Real-time • Secure</span>
          <div className="status-dot" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="corner corner-tl">
        <div className="corner-line-h" />
        <div className="corner-line-v" />
      </div>
      <div className="corner corner-tr">
        <div className="corner-line-h" />
        <div className="corner-line-v" />
      </div>
      <div className="corner corner-bl">
        <div className="corner-line-h" />
        <div className="corner-line-v" />
      </div>
      <div className="corner corner-br">
        <div className="corner-line-h" />
        <div className="corner-line-v" />
      </div>
    </div>
  );
}
