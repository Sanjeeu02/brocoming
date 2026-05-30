import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Camera, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const fileRef = useRef(null);

  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  // Register state
  const [regData, setRegData] = useState({ username: '', email: '', password: '', confirmPassword: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('User does not exist or invalid credentials, please register.');
      } else {
        setError(err.message || 'Invalid credentials. Try again.');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.username || !regData.email || !regData.password) { setError('Please fill required fields'); return; }
    if (regData.password !== regData.confirmPassword) { setError('Passwords do not match'); return; }
    if (regData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await register(regData.username, regData.email, regData.password, profilePreview);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('User already exists, please login.');
      } else {
        setError(err.message || 'Registration failed. Try again.');
      }
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed.');
    } finally { setLoading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-grid" />
      </div>

      {/* Left panel — branding */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <path d="M32 4C21.5 4 13 12.5 13 23C13 36.5 32 60 32 60C32 60 51 36.5 51 23C51 12.5 42.5 4 32 4Z" fill="url(#authPinGrad)" />
              <circle cx="32" cy="23" r="8" fill="rgba(0,0,0,0.5)" />
              <circle cx="32" cy="23" r="5" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="authPinGrad" x1="13" y1="4" x2="51" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00d4ff" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="auth-brand-name">ComingBro</h1>
        </div>

        <div className="auth-hero">
          <h2 className="auth-hero-title">Track your friends in <span className="text-accent">real-time</span></h2>
          <p className="auth-hero-sub">
            No more "5 min away" excuses. See exactly where your friends are, their ETA, and whether they've actually started.
          </p>
        </div>

        <div className="auth-features">
          {[
            { icon: '📍', title: 'Live GPS Tracking', desc: 'Real-time location updates' },
            { icon: '⏱️', title: 'Smart ETA', desc: 'Accurate arrival predictions' },
            { icon: '🚨', title: 'Emergency Alerts', desc: 'Instant SOS notifications' },
            { icon: '💬', title: 'Group Chat', desc: 'Coordinate with everyone' },
          ].map((f, i) => (
            <div key={i} className="auth-feature-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="auth-feature-icon">{f.icon}</span>
              <div>
                <div className="auth-feature-title">{f.title}</div>
                <div className="auth-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card glass-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >Login</button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}
            >Register</button>
            <div className={`auth-tab-indicator ${tab === 'register' ? 'right' : ''}`} />
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-icon">
                  <Mail className="input-icon" size={16} />
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-icon">
                  <Lock className="input-icon" size={16} />
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                    style={{ paddingRight: '44px' }}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-forgot">
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-disabled' : ''}`}>
                {loading ? <span className="animate-spin">⟳</span> : <><ArrowRight size={18} /> Login</>}
              </button>

              <div className="divider">or continue with</div>

              <button type="button" className="btn btn-secondary btn-full" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')}>Register here</button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister}>
              {/* Profile picture */}
              <div className="auth-avatar-upload">
                <div
                  className="auth-avatar-preview"
                  onClick={() => fileRef.current?.click()}
                  style={{ backgroundImage: profilePreview ? `url(${profilePreview})` : 'none' }}
                >
                  {!profilePreview && <Camera size={24} style={{ color: '#8b949e' }} />}
                  <div className="auth-avatar-overlay">
                    <Camera size={16} />
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                <div>
                  <p className="font-medium" style={{ fontSize: '0.9rem' }}>Profile Photo</p>
                  <p className="text-muted text-xs">Optional — click to upload</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username *</label>
                <div className="form-input-icon">
                  <User className="input-icon" size={16} />
                  <input className="form-input" type="text" placeholder="Your display name"
                    value={regData.username} onChange={e => setRegData(p => ({ ...p, username: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="form-input-icon">
                  <Mail className="input-icon" size={16} />
                  <input className="form-input" type="email" placeholder="you@example.com"
                    value={regData.email} onChange={e => setRegData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="form-input-icon">
                    <Lock className="input-icon" size={16} />
                    <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min 6 chars"
                      value={regData.password} onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                      style={{ paddingRight: '44px' }} />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm *</label>
                  <div className="form-input-icon">
                    <Lock className="input-icon" size={16} />
                    <input className="form-input" type={showConfPass ? 'text' : 'password'} placeholder="Repeat"
                      value={regData.confirmPassword} onChange={e => setRegData(p => ({ ...p, confirmPassword: e.target.value }))}
                      style={{ paddingRight: '44px' }} />
                    <button type="button" className="pass-toggle" onClick={() => setShowConfPass(!showConfPass)}>
                      {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <div className="form-input-icon">
                  <Phone className="input-icon" size={16} />
                  <input className="form-input" type="tel" placeholder="+91 98765 43210"
                    value={regData.phone} onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-disabled' : ''}`}>
                {loading ? <span className="animate-spin">⟳</span> : <><MapPin size={18} /> Create Account</>}
              </button>

              <div className="divider">or</div>
              <button type="button" className="btn btn-secondary btn-full" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')}>Login here</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
