import { useState, useRef, useEffect } from 'react';
import { Send, X, AlertTriangle, MessageCircle, ChevronDown, Smile } from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import './ChatPanel.css';

const EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '😭', '🙏', '😅', '😎', '🤣', '💯', '🚀', '⏰', '📍', '✅', '⚠️'];

const EMERGENCY_PRESETS = [
  '🚨 Bike puncture! Will be late.',
  '🚦 Stuck in heavy traffic.',
  '👨‍👩‍👧 Family emergency, heading back.',
  '🤒 Not feeling well, might not come.',
  '🛣️ Wrong route, re-navigating.',
  '⛽ Stopped for fuel.',
];

export default function ChatPanel({ isOpen, onClose }) {
  const { messages, sendMessage, userRole } = useGroup();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmergency = (text) => {
    sendMessage(text, 'emergency');
    setShowEmergency(false);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getMessageStyle = (msg, isMine) => {
    if (msg.type === 'emergency') return 'chat-msg emergency';
    if (msg.type === 'quick') return isMine ? 'chat-msg mine quick' : 'chat-msg theirs quick';
    return isMine ? 'chat-msg mine' : 'chat-msg theirs';
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <MessageCircle size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span className="chat-title">Group Chat</span>
          <span className="chat-count">{messages.length}</span>
        </div>
        <div className="chat-header-actions">
          <button
            className={`chat-emergency-btn ${showEmergency ? 'active' : ''}`}
            onClick={() => setShowEmergency(!showEmergency)}
            title="Emergency Alert"
          >
            <AlertTriangle size={16} />
            SOS
          </button>
          <button className="btn btn-icon" onClick={onClose}>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Emergency presets */}
      {showEmergency && (
        <div className="chat-emergency-panel">
          <div className="chat-emergency-title">🚨 Emergency Alert</div>
          <div className="chat-emergency-grid">
            {EMERGENCY_PRESETS.map((preset, i) => (
              <button
                key={i}
                className="chat-emergency-preset"
                onClick={() => handleEmergency(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <MessageCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === 'user-001';
          return (
            <div key={msg.id} className={`chat-msg-wrapper ${isMine ? 'mine' : 'theirs'}`}>
              {!isMine && (
                <div className="chat-avatar-sm" title={msg.senderName}>
                  {msg.senderName?.[0]}
                </div>
              )}
              <div className="chat-msg-group">
                {!isMine && <div className="chat-sender-name">{msg.senderName}</div>}
                <div className={getMessageStyle(msg, isMine)}>
                  {msg.type === 'emergency' && (
                    <div className="emergency-label">
                      <AlertTriangle size={12} /> EMERGENCY
                    </div>
                  )}
                  {msg.text}
                </div>
                <div className={`chat-time ${isMine ? 'mine' : ''}`}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="emoji-picker">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              className="emoji-btn"
              onClick={() => setInput(prev => prev + emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <button
          className={`chat-emoji-toggle ${showEmoji ? 'active' : ''}`}
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <Smile size={18} />
        </button>
        <input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
