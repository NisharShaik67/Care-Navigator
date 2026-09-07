import React, { useState } from 'react';
import { 
  Navigation, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  Zap
} from 'lucide-react';

export const AmbulanceRouteMap = ({ sosState, onSpeedChange }) => {
  const [zoom, setZoom] = useState(1);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x, 2x, 5x

  const progress = sosState.ambulanceProgress || 0; // 0 to 100
  const distanceKm = (sosState.distanceKm !== undefined) ? sosState.distanceKm : 3.5;
  const eta = (sosState.ambulanceEta !== undefined) ? sosState.ambulanceEta : 5;
  const currentStreet = sosState.currentStreet || 'Hospital Express Highway';
  const isArrived = progress >= 100 || distanceKm <= 0;

  // Polyline coordinates for curved multi-segment road route on SVG map (width: 800, height: 400)
  // Origin (Hospital Hub): (80, 320)
  // Waypoint 1: (240, 280) - Hospital Express Highway
  // Waypoint 2: (420, 140) - Prakasham Main Corridor
  // Waypoint 3: (580, 220) - Bypass Ring Road
  // Destination (Patient Home): (720, 100) - Narasaraopet Main Rd

  const waypoints = [
    { x: 80, y: 320, name: 'Government General Hospital Hub' },
    { x: 240, y: 280, name: 'Hospital Express Highway' },
    { x: 420, y: 140, name: 'Prakasham Main Corridor' },
    { x: 580, y: 220, name: 'Bypass Junction' },
    { x: 720, y: 100, name: userLocationLabel(sosState.location) }
  ];

  function userLocationLabel(locStr) {
    if (!locStr) return 'Patient Home Location';
    return locStr.length > 28 ? locStr.substring(0, 25) + '...' : locStr;
  }

  // Calculate ambulance (x, y) coordinates along piecewise linear path based on progress %
  const calculatePositionAlongPath = (pct) => {
    const totalSegments = waypoints.length - 1;
    const scaledPct = Math.min(Math.max(pct, 0), 100);
    const segLength = 100 / totalSegments;
    const segIndex = Math.min(Math.floor(scaledPct / segLength), totalSegments - 1);
    const segPct = (scaledPct - (segIndex * segLength)) / segLength;

    const p1 = waypoints[segIndex];
    const p2 = waypoints[segIndex + 1];

    const currentX = p1.x + (p2.x - p1.x) * segPct;
    const currentY = p1.y + (p2.y - p1.y) * segPct;

    // Angle of motion for ambulance icon rotation
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { x: currentX, y: currentY, angle: angleDeg };
  };

  const ambPos = calculatePositionAlongPath(progress);

  const pathD = waypoints.reduce((acc, point, idx) => {
    return idx === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const handleSpeedToggle = () => {
    const nextSpeed = simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1;
    setSimulationSpeed(nextSpeed);
    if (onSpeedChange) onSpeedChange(nextSpeed);
  };

  return (
    <div className="ambulance-map-wrapper glass-panel">
      {/* Top Map HUD Header */}
      <div className="map-hud-header">
        <div className="hud-left">
          <div className="hud-status-badge">
            <span className={`live-dot ${isArrived ? 'green' : 'pulse-red'}`}></span>
            <span className="hud-status-text">
              {isArrived ? 'AMBULANCE ARRIVED AT YOUR LOCATION' : 'LIVE DISPATCH TELEMETRY'}
            </span>
          </div>
          <h4 className="hud-street-name">
            <Navigation size={14} className="icon-blue" />
            <span>Current Street: <strong>{currentStreet}</strong></span>
          </h4>
        </div>

        <div className="hud-metrics">
          <div className="metric-box">
            <span className="m-label">DISTANCE</span>
            <span className="m-val text-sky">
              {isArrived ? '0.0' : distanceKm.toFixed(1)} <small>km</small>
            </span>
          </div>

          <div className="metric-box highlighted">
            <span className="m-label">ESTIMATED ETA</span>
            <span className="m-val text-red">
              {isArrived ? '0' : eta} <small>MINS</small>
            </span>
          </div>

          <div className="metric-box hide-mobile">
            <span className="m-label">SPEED</span>
            <span className="m-val text-emerald">
              {isArrived ? '0' : '48'} <small>km/h</small>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="map-canvas-container" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <svg 
          viewBox="0 0 800 400" 
          className="map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Map Gradients */}
            <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            {/* Pulsing Siren Glow Filter */}
            <filter id="glowSiren" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Map Base Background */}
          <rect x="0" y="0" width="800" height="400" fill="url(#mapBgGrad)" rx="12" />

          {/* Grid lines simulating map streets */}
          <g opacity="0.08" stroke="#cbd5e1" strokeWidth="1">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 25} x2="800" y2={i * 25} />
            ))}
            {Array.from({ length: 32 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 25} y1="0" x2={i * 25} y2="400" />
            ))}
          </g>

          {/* Decorative River / Geography */}
          <path 
            d="M -10 180 Q 200 240 400 190 T 810 260" 
            fill="none" 
            stroke="#1e3a8a" 
            strokeWidth="24" 
            opacity="0.35" 
          />

          {/* Surrounding secondary road network lines */}
          <g fill="none" stroke="#334155" strokeWidth="3" opacity="0.5">
            <line x1="80" y1="50" x2="80" y2="350" />
            <line x1="300" y1="20" x2="300" y2="380" />
            <line x1="580" y1="20" x2="580" y2="380" />
            <line x1="50" y1="140" x2="750" y2="140" />
            <line x1="50" y1="280" x2="750" y2="280" />
          </g>

          {/* Main Ambulance Route (Shadow & Active Glow Polyline) */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#0f172a" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#routeGlow)" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            opacity="0.6" 
          />

          {/* Dynamic Traveled Route Path (Green solid) */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="6" 
            strokeDasharray="8 6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Waypoint Nodes (Intersections) */}
          {waypoints.map((wp, idx) => (
            <g key={idx} transform={`translate(${wp.x}, ${wp.y})`}>
              <circle r="4" fill="#94a3b8" />
              <circle r="8" fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.4" />
            </g>
          ))}

          {/* Start Point Node (Hospital Dispatch Hub) */}
          <g transform={`translate(${waypoints[0].x}, ${waypoints[0].y})`}>
            <circle r="18" fill="rgba(2, 132, 199, 0.2)" />
            <circle r="12" fill="#0284c7" />
            <circle r="6" fill="#ffffff" />
            <text x="16" y="5" fill="#e2e8f0" fontSize="11" fontWeight="700">Dispatch ER Hub</text>
          </g>

          {/* Destination Node (Patient Home) */}
          <g transform={`translate(${waypoints[waypoints.length - 1].x}, ${waypoints[waypoints.length - 1].y})`}>
            <circle r="26" fill="rgba(239, 68, 68, 0.15)" className="pulse-circle" />
            <circle r="16" fill="rgba(239, 68, 68, 0.3)" />
            <circle r="10" fill="#ef4444" />
            <circle r="4" fill="#ffffff" />
            {/* Target Marker Pin */}
            <g transform="translate(-12, -32)">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#ef4444" />
            </g>
            <text x="-40" y="32" fill="#f87171" fontSize="12" fontWeight="800">
              PATIENT LOCATION
            </text>
          </g>

          {/* Live Moving Ambulance Marker */}
          <g transform={`translate(${ambPos.x}, ${ambPos.y})`}>
            {/* Siren Pulse Rings */}
            {!isArrived && (
              <>
                <circle r="28" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" filter="url(#glowSiren)">
                  <animate attributeName="r" values="14;34;14" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle r="20" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" values="10;26;10" dur="0.9s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Ambulance Vehicle Body Icon */}
            <g transform={`rotate(${ambPos.angle})`}>
              <rect x="-18" y="-12" width="36" height="24" rx="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              {/* Red Cross Sign on roof */}
              <rect x="-4" y="-7" width="8" height="14" fill="#ef4444" rx="1" />
              <rect x="-7" y="-4" width="14" height="8" fill="#ef4444" rx="1" />
              {/* Windshield */}
              <rect x="8" y="-9" width="6" height="18" fill="#38bdf8" rx="2" opacity="0.9" />
              {/* Headlights */}
              <circle cx="16" cy="-8" r="2.5" fill="#fef08a" />
              <circle cx="16" cy="8" r="2.5" fill="#fef08a" />
            </g>

            {/* Live Distance Callout Tooltip attached to vehicle */}
            <g transform="translate(0, -32)">
              <rect x="-46" y="-14" width="92" height="22" rx="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="0" y="1" fill="#ffffff" fontSize="10" fontWeight="800" textAnchor="middle">
                {isArrived ? 'ARRIVED!' : `📍 ${distanceKm.toFixed(1)} km left`}
              </text>
            </g>
          </g>
        </svg>

        {/* Map Control Toolbar */}
        <div className="map-controls-bar">
          <button 
            className="map-ctrl-btn" 
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 1.75))} 
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="map-ctrl-btn" 
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))} 
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            className="map-ctrl-btn" 
            onClick={() => setZoom(1)} 
            title="Reset View"
          >
            <Crosshair size={16} />
          </button>
          <button 
            className={`map-ctrl-btn speed-btn ${simulationSpeed > 1 ? 'active' : ''}`} 
            onClick={handleSpeedToggle}
            title="Speed Simulation Toggle"
          >
            <Zap size={14} color={simulationSpeed > 1 ? '#f59e0b' : '#94a3b8'} />
            <span>{simulationSpeed}x Speed</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Route Step Indicator */}
      <div className="map-route-progress">
        <div className="progress-label-row">
          <span>Route Progression: <strong>{Math.round(progress)}%</strong></span>
          <span className="mono">{distanceKm.toFixed(1)} km remaining</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
