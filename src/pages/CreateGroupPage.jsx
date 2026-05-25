import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Calendar, Clock, Plus, ArrowLeft, Shuffle, Copy, Check, ChevronRight, Users } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import './CreateGroupPage.css';

const SUGGESTED_DESTINATIONS = [
  { name: 'Marina Beach, Chennai', lat: 13.0499, lng: 80.2824 },
  { name: 'Ooty Lake, Tamil Nadu', lat: 11.4102, lng: 76.6950 },
  { name: 'Anna University, Chennai', lat: 13.0101, lng: 80.2350 },
  { name: 'PVR Cinemas, Anna Nagar', lat: 13.0869, lng: 80.2106 },
  { name: 'Phoenix MarketCity, Chennai', lat: 12.9975, lng: 80.2180 },
  { name: 'Express Avenue Mall', lat: 13.0675, lng: 80.2590 },
];

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { createGroup } = useGroup();
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    groupName: '',
    groupCode: generateCode(),
    destination: null,
    destSearch: '',
    date: '',
    time: '',
    customCode: false,
  });

  const [errors, setErrors] = useState({});

  const handleGenerateCode = () => {
    setForm(p => ({ ...p, groupCode: generateCode() }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(form.groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.groupName.trim()) e.groupName = 'Group name is required';
    if (!form.groupCode.trim()) e.groupCode = 'Group code is required';
    if (form.groupCode.length < 4) e.groupCode = 'Code must be at least 4 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(p => p + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      createGroup({
        groupName: form.groupName,
        code: form.groupCode,
        destination: form.destination || SUGGESTED_DESTINATIONS[0],
        date: form.date,
        time: form.time,
      });
      navigate('/admin-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const filteredDest = form.destSearch
    ? SUGGESTED_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(form.destSearch.toLowerCase())
      )
    : SUGGESTED_DESTINATIONS;

  return (
    <div className="create-page">
      {/* Background */}
      <div className="create-bg">
        <div className="create-blob-1" />
        <div className="create-blob-2" />
        <div className="create-grid" />
      </div>

      <div className="create-container">
        {/* Header */}
        <div className="create-header animate-fadeInUp">
          <button className="btn btn-icon" onClick={() => step === 1 ? navigate('/dashboard') : setStep(p => p - 1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Create Group</h1>
            <p>Set up your live tracking session</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="create-steps animate-fadeInUp" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`create-step ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
              <div className="step-circle">{step > s ? '✓' : s}</div>
              <span className="step-label">
                {s === 1 ? 'Basics' : s === 2 ? 'Destination' : 'Review'}
              </span>
              {s < 3 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="create-card glass-card animate-fadeInUp" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>

          {/* STEP 1 — Basics */}
          {step === 1 && (
            <div className="create-form">
              <h2 className="create-step-title">Group Details</h2>

              <div className="form-group">
                <label className="form-label">Group Name *</label>
                <div className="form-input-icon">
                  <Users className="input-icon" size={16} />
                  <input
                    className={`form-input ${errors.groupName ? 'input-error' : ''}`}
                    placeholder="e.g., Ooty Trip 🏔️, Movie Night 🎬"
                    value={form.groupName}
                    onChange={e => setForm(p => ({ ...p, groupName: e.target.value }))}
                    maxLength={40}
                  />
                </div>
                {errors.groupName && <span className="form-error">{errors.groupName}</span>}

                {/* Name suggestions */}
                <div className="name-suggestions">
                  {['Ooty Trip 🏔️', 'Movie Night 🎬', 'College Meetup 🎓', 'Gaming Night 🎮', 'Beach Day 🏖️'].map(s => (
                    <button
                      key={s}
                      className="name-chip"
                      onClick={() => setForm(p => ({ ...p, groupName: s }))}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Group Code *</label>
                <div className="code-input-row">
                  <div className="form-input-icon" style={{ flex: 1 }}>
                    <input
                      className={`form-input mono ${errors.groupCode ? 'input-error' : ''}`}
                      value={form.groupCode}
                      onChange={e => setForm(p => ({ ...p, groupCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''), customCode: true }))}
                      maxLength={10}
                      style={{ letterSpacing: '0.15em', fontWeight: 700, fontSize: '1.1rem' }}
                      placeholder="MYCODE1"
                    />
                  </div>
                  <button className="btn btn-secondary btn-icon tooltip" data-tip="Generate random" onClick={handleGenerateCode}>
                    <Shuffle size={16} />
                  </button>
                  <button
                    className={`btn btn-secondary btn-icon tooltip ${copied ? 'active' : ''}`}
                    data-tip={copied ? 'Copied!' : 'Copy code'}
                    onClick={handleCopyCode}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {errors.groupCode && <span className="form-error">{errors.groupCode}</span>}
                <p className="text-muted text-xs">Share this code with friends to invite them</p>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Trip Date (Optional)</label>
                  <div className="form-input-icon">
                    <Calendar className="input-icon" size={16} />
                    <input className="form-input" type="date" value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Time (Optional)</label>
                  <div className="form-input-icon">
                    <Clock className="input-icon" size={16} />
                    <input className="form-input" type="time" value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Destination */}
          {step === 2 && (
            <div className="create-form">
              <h2 className="create-step-title">Set Destination</h2>
              <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                Choose where everyone is heading. Members can see this on their map.
              </p>

              <div className="form-group">
                <label className="form-label">Search Destination</label>
                <div className="form-input-icon">
                  <Search className="input-icon" size={16} />
                  <input
                    className="form-input"
                    placeholder="Search mall, beach, college..."
                    value={form.destSearch}
                    onChange={e => setForm(p => ({ ...p, destSearch: e.target.value }))}
                  />
                </div>
              </div>

              <div className="dest-list">
                {filteredDest.map(dest => (
                  <button
                    key={dest.name}
                    className={`dest-item ${form.destination?.name === dest.name ? 'selected' : ''}`}
                    onClick={() => setForm(p => ({ ...p, destination: dest }))}
                  >
                    <div className="dest-icon">
                      <MapPin size={16} />
                    </div>
                    <div className="dest-info">
                      <div className="dest-name">{dest.name}</div>
                      <div className="dest-coords">{dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}</div>
                    </div>
                    {form.destination?.name === dest.name && (
                      <div className="dest-check">✓</div>
                    )}
                  </button>
                ))}
              </div>

              {form.destination && (
                <div className="dest-selected">
                  <MapPin size={16} style={{ color: 'var(--accent-green)' }} />
                  <span>Selected: <strong>{form.destination.name}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="create-form">
              <h2 className="create-step-title">Review & Create</h2>

              <div className="review-section">
                <div className="review-row">
                  <span className="review-label">Group Name</span>
                  <span className="review-value">{form.groupName}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Group Code</span>
                  <span className="review-value mono" style={{ color: 'var(--accent-cyan)', letterSpacing: '0.15em' }}>
                    {form.groupCode}
                  </span>
                </div>
                <div className="review-row">
                  <span className="review-label">Destination</span>
                  <span className="review-value">{form.destination?.name || 'Not set'}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Date & Time</span>
                  <span className="review-value">
                    {form.date && form.time ? `${form.date} at ${form.time}` : form.date || 'Flexible'}
                  </span>
                </div>
              </div>

              {/* Share preview */}
              <div className="share-preview">
                <div className="share-preview-title">📤 Invite Preview</div>
                <div className="share-preview-text">
                  Join our trip "<strong>{form.groupName}</strong>" on ComingBro!{'\n'}
                  Use code: <strong className="mono">{form.groupCode}</strong>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(
                    `Join "${form.groupName}" on ComingBro! Use code: ${form.groupCode}`
                  );
                }}>
                  <Copy size={14} /> Copy Invite Message
                </button>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="create-footer">
            {step > 1 && (
              <button className="btn btn-secondary" onClick={() => setStep(p => p - 1)}>
                Back
              </button>
            )}
            {step < 3 ? (
              <button className="btn btn-primary" onClick={handleNext} style={{ marginLeft: 'auto' }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
                onClick={handleCreate}
                style={{ marginLeft: 'auto' }}
              >
                {loading
                  ? <><span className="animate-spin">⟳</span> Creating...</>
                  : <><Plus size={16} /> Create Group</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
