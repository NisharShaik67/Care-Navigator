import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AmbulanceRouteMap } from '../components/AmbulanceRouteMap';
import { 
  PhoneCall, 
  Truck,
  UserCheck,
  Star,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  ArrowLeft
} from 'lucide-react';

export const EmergencyView = () => {
  const { user, goBack } = useApp();

  // Responder & Driver Profile Details (dynamic or standard assigned unit)
  const driverName = (user?.role === 'Responder' || user?.role === 'Driver') ? (user?.name || 'K. Rambabu') : 'K. Rambabu';
  const vehicleNumber = user?.vehicleNo || 'AP 07 TE 1084';
  const driverContact = (user?.role === 'Responder' || user?.role === 'Driver') ? (user?.phone || '+91 98765 10800') : '+91 98765 10800';

  // Live Simulated Telemetry State
  const [sosState, setSosState] = useState({
    ambulanceProgress: 48,
    distanceKm: 2.8,
    ambulanceEta: 4,
    currentStreet: 'Hospital Express Highway • Sector 4',
    location: 'Narasaraopet Main Rd, AP'
  });

  return (
    <div className="emergency-view-container fade-in">
      {/* Top Back Navigation Bar */}
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <button
          onClick={goBack}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.88rem',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>← Back to Dashboard</span>
        </button>
      </div>

      {/* 24/7 Helpline Header Card */}
      <div className="sos-status-card glass-panel" style={{
        background: '#ffffff',
        color: '#0f172a',
        border: '1px solid #e2e8f0'
      }}>
        <div className="sos-status-top">
          <div className="status-indicator" style={{ color: '#dc2626' }}>
            <div className="status-dot dot-green"></div>
            <span>EMERGENCY AMBULANCE DISPATCH • DIAL 108</span>
          </div>
          <span className="badge badge-bullish" style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>
            ALS Unit #04 • En Route
          </span>
        </div>

        <div className="sos-trigger-box">
          <a 
            href="tel:108" 
            className="btn btn-emergency btn-block" 
            style={{ 
              textDecoration: 'none', 
              padding: '16px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px' 
            }}
          >
            <PhoneCall size={24} />
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>CALL 108 AMBULANCE HELPLINE</span>
          </a>
          <p className="sos-disclaimer">
            24/7 National Emergency Medical Response Service • Direct helpline for immediate emergency dispatch
          </p>
        </div>
      </div>

      {/* Live Route Telemetry Map (Location Only) */}
      <AmbulanceRouteMap 
        sosState={sosState} 
        onSpeedChange={(spd) => {
          setSosState(prev => ({
            ...prev,
            ambulanceProgress: Math.min(100, prev.ambulanceProgress + spd * 5)
          }));
        }} 
      />

      {/* Live Quick Location & Street Summary HUD */}
      <div className="glass-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color="#0284c7" />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Current Ambulance Location & Street
            </span>
            <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
              {sosState.currentStreet}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={16} color="#0284c7" />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Distance:</span>
            <strong style={{ fontSize: '0.92rem', color: '#0284c7' }}>{sosState.distanceKm} km</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#dc2626" />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>ETA:</span>
            <strong style={{ fontSize: '0.92rem', color: '#dc2626' }}>{sosState.ambulanceEta} mins</strong>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Driver Details & Ambulance Details */}
      <div className="driver-vehicle-section-grid">
        {/* Card 1: Assigned Driver Details (Driver Name & Contact Number) */}
        <div className="glass-card driver-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#0f172a' }}>Assigned EMT Driver</h3>
            </div>
            <span className="badge badge-bullish" style={{ fontSize: '0.72rem' }}>
              On Duty • En Route
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #0284c7',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.25)',
              flexShrink: 0
            }}>
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300" 
                alt={`Driver ${driverName}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '1.18rem', fontWeight: '800', color: '#0f172a' }}>{driverName}</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.84rem', color: '#0284c7', fontWeight: '700' }}>
                Senior EMT & Emergency Response Pilot
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d97706', fontWeight: '700' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> 4.9 (1,240+ Dispatches)
                </span>
                <span>• 8+ Yrs Exp</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>EMT License No:</span>
              <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>AP-07-2018-0049281</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Driver Contact Number:</span>
              <strong style={{ color: '#0284c7', fontSize: '1.02rem', fontWeight: '800' }}>{driverContact}</strong>
            </div>
          </div>

          <a 
            href={`tel:${driverContact.replace(/\D/g, '')}`} 
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '14px', 
              borderRadius: '14px', 
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <PhoneCall size={20} />
            <span>Call Driver {driverName} ({driverContact})</span>
          </a>
        </div>

        {/* Card 2: Ambulance Vehicle & Equipment Details */}
        <div className="glass-card vehicle-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#0f172a' }}>Ambulance Vehicle & Life Support</h3>
            </div>
            <span className="badge badge-bearish" style={{ fontSize: '0.72rem' }}>
              Reg: {vehicleNumber}
            </span>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(3, 105, 161, 0.04) 100%)', border: '1px solid rgba(2, 132, 199, 0.2)', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>VEHICLE CATEGORY</span>
              <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '800' }}>ALS ICU FLEET</span>
            </div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0369a1' }}>
              Advanced Life Support (ALS) Cardiac ICU Unit
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Base Station: Government General Hospital (GGH) Guntur Emergency Station
            </p>
          </div>

          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Onboard Medical Equipment & Tech
          </h4>

          <div className="onboard-equipment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#059669" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Oxygen & Ventilator</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>High Flow Cylinder</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={16} color="#dc2626" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Cardiac Defibrillator</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Automated AED</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={16} color="#0284c7" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Trauma Kit & IV Fluids</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Full Emergency Meds</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#d97706" />
              <div>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>GPS & Vital Telemetry</strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Live ER Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .emergency-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        .driver-vehicle-section-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .driver-vehicle-section-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .emergency-view-container {
            padding: 16px 12px 80px;
            gap: 16px;
          }

          .sos-status-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .onboard-equipment-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .sos-status-card {
          padding: 24px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid var(--border-light);
        }

        .sos-status-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-green {
          background: var(--color-positive);
          box-shadow: 0 0 10px var(--color-positive);
        }

        .btn-emergency {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          font-size: 1.1rem;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
        }

        .btn-emergency:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.4);
        }

        .sos-disclaimer {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 12px;
        }
      `}</style>
    </div>
  );
};
