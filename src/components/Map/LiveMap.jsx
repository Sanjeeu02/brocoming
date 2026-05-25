import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { STATUS_CONFIG } from '../../data/mockData';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createMemberIcon(member) {
  const statusConf = STATUS_CONFIG[member.status] || STATUS_CONFIG.moving;
  const color = statusConf.color;
  const isOnline = member.isOnline;

  const svgHtml = `
    <div class="map-marker-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      <div class="map-member-bubble" style="
        width: 44px; height: 44px;
        border-radius: 50%;
        background: ${member.status === 'arrived'
          ? 'linear-gradient(135deg, #00ff88, #00b894)'
          : `linear-gradient(135deg, ${color}30, ${color}15)`};
        border: 2.5px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        color: ${member.status === 'arrived' ? '#000' : color};
        box-shadow: 0 4px 15px ${color}50, 0 0 0 4px ${color}20;
        font-family: 'Outfit', sans-serif;
        position: relative;
        animation: ${member.status === 'moving' ? 'markerPulse 2s ease-in-out infinite' : 'none'};
      ">
        ${member.initials}
        ${isOnline ? `<div style="
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px;
          background: #00ff88;
          border: 2px solid #050810;
          border-radius: 50%;
        "></div>` : ''}
      </div>
      <div style="
        width: 0; height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${color};
        margin-top: -2px;
      "></div>
      <div style="
        background: rgba(5,8,16,0.9);
        border: 1px solid ${color}50;
        border-radius: 6px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 600;
        color: ${color};
        font-family: 'Outfit', sans-serif;
        white-space: nowrap;
        margin-top: 2px;
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
      ">${member.username.split(' ')[0]}</div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: '',
    iconSize: [60, 80],
    iconAnchor: [30, 44],
    popupAnchor: [0, -50],
  });
}

function createDestinationIcon() {
  const svgHtml = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="
        width: 52px; height: 52px;
        background: linear-gradient(135deg, #ffd700, #ff8800);
        border-radius: 50%;
        border: 3px solid rgba(255,215,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 0 20px rgba(255,215,0,0.5), 0 0 0 8px rgba(255,215,0,0.1);
        animation: destPulse 2s ease-in-out infinite;
      ">🏁</div>
      <div style="
        width: 0; height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 10px solid #ffd700;
        margin-top: -2px;
      "></div>
      <div style="
        background: rgba(5,8,16,0.95);
        border: 1px solid rgba(255,215,0,0.5);
        border-radius: 8px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        color: #ffd700;
        font-family: 'Outfit', sans-serif;
        white-space: nowrap;
        margin-top: 2px;
      ">DESTINATION</div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: '',
    iconSize: [80, 100],
    iconAnchor: [40, 52],
    popupAnchor: [0, -60],
  });
}

export default function LiveMap({ members = [], destination, onMemberClick, userRole }) {
  const mapRef = useRef(null);
  const center = destination
    ? [destination.lat, destination.lng]
    : members.length > 0
    ? [members[0].location.lat, members[0].location.lng]
    : [11.4102, 76.6950];

  // Add global styles for marker animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes markerPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,212,255,0.5), 0 0 0 4px rgba(0,212,255,0.2); }
        50% { transform: scale(1.05); box-shadow: 0 4px 25px rgba(0,212,255,0.7), 0 0 0 8px rgba(0,212,255,0.1); }
      }
      @keyframes destPulse {
        0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.5), 0 0 0 8px rgba(255,215,0,0.1); }
        50% { box-shadow: 0 0 35px rgba(255,215,0,0.7), 0 0 0 16px rgba(255,215,0,0.05); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="live-map-wrapper">
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />
        <ZoomControl position="bottomright" />

        {/* Destination marker */}
        {destination && (
          <>
            <Marker
              position={[destination.lat, destination.lng]}
              icon={createDestinationIcon()}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-title">🏁 Destination</div>
                  <div className="map-popup-dest">{destination.name}</div>
                </div>
              </Popup>
            </Marker>
            {/* Destination circle */}
            <Circle
              center={[destination.lat, destination.lng]}
              radius={200}
              pathOptions={{ color: '#ffd700', fillColor: '#ffd700', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }}
            />
          </>
        )}

        {/* Member markers + routes */}
        {members.map((member) => {
          const statusConf = STATUS_CONFIG[member.status] || STATUS_CONFIG.moving;

          return (
            <div key={member.uid}>
              {/* Route line */}
              {destination && member.status !== 'arrived' && (
                <Polyline
                  positions={[
                    [member.location.lat, member.location.lng],
                    [destination.lat, destination.lng],
                  ]}
                  pathOptions={{
                    color: statusConf.color,
                    weight: 2,
                    opacity: 0.4,
                    dashArray: '6,6',
                  }}
                />
              )}

              {/* Member marker */}
              <Marker
                key={member.uid + '-' + member.status}
                position={[member.location.lat, member.location.lng]}
                icon={createMemberIcon(member)}
                eventHandlers={{
                  click: () => onMemberClick && onMemberClick(member),
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="map-popup-header">
                      <span className="map-popup-name">{member.username}</span>
                      {member.role === 'admin' && <span className="map-popup-badge">Admin</span>}
                    </div>
                    <div className="map-popup-status" style={{ color: statusConf.color }}>
                      {statusConf.icon} {statusConf.label}
                    </div>
                    {member.status !== 'arrived' && (
                      <div className="map-popup-eta">
                        ⏱️ {member.eta} min away • 📏 {member.distance?.toFixed(1)} km
                      </div>
                    )}
                    {member.speed > 0 && (
                      <div className="map-popup-speed">
                        🚗 {member.speed} km/h
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      {/* Map overlay — legend */}
      <div className="map-legend glass-card">
        <div className="map-legend-title">Status</div>
        {[
          { color: '#00d4ff', label: 'Moving' },
          { color: '#ffd700', label: 'Slow' },
          { color: '#ff4444', label: 'Stopped' },
          { color: '#00ff88', label: 'Arrived' },
          { color: '#ff8800', label: 'Delayed' },
        ].map(item => (
          <div key={item.label} className="map-legend-item">
            <div className="map-legend-dot" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
