import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Activity, ShieldAlert, User, Stethoscope, AlertTriangle, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

const TITLE_MAP = {
  'landing': 'Care Navigator Universal Platform',
  'onboarding': 'Welcome to Care Navigator',
  'dashboard': 'Care Navigator Home',
  'emergency': 'Emergency SOS & Ambulance Tracker',
  'symptom-checker': 'AI Health Symptom Triage',
  'hospitals': 'Nearby Hospitals & Emergency Beds',
  'op-booking': 'Book OP Token Appointment',
  'appointments': 'My OP Tokens & Live Queue',
  'records': 'Digital Health Vault & EHR',
  'profile': 'My Health Profile & Contacts',
  'doctor-dashboard': 'Doctor Consultation Portal'
};

export const Header = () => {
  const { currentScreen, screenHistory, goBack, user, switchRole, sosState, navigateTo } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const title = TITLE_MAP[currentScreen] || 'Care Navigator';
  const showBack = screenHistory.length > 0 && currentScreen !== 'dashboard' && currentScreen !== 'onboarding';

  return (
    <header className="app-header">
      <div className="header-left">
        {showBack ? (
          <button className="btn-icon" onClick={goBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="brand-logo" onClick={() => navigateTo('dashboard')}>
            <img src="/Logo.jpeg" alt="Care Navigator Logo" className="header-logo-img" />
          </div>
        )}
        <div className="header-title-container">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">
            {user.role} Portal • {user.location}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Fullscreen Toggle Button */}
        <button 
          className="btn-icon fullscreen-toggle-btn"
          onClick={toggleFullScreen}
          title={isFullscreen ? "Exit Fullscreen" : "Make App Full Screen"}
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}
        >
          {isFullscreen ? <Minimize2 size={18} color="#0284c7" /> : <Maximize2 size={18} color="#0284c7" />}
        </button>

        {/* Active Emergency SOS Pill if triggered */}
        {sosState.active && (
          <div 
            className="sos-active-badge pulse-red" 
            onClick={() => navigateTo('emergency')}
            title="Emergency SOS Active! Click to open tracker."
          >
            <ShieldAlert size={16} />
            <span>SOS ACTIVE ({sosState.ambulanceEta}m)</span>
          </div>
        )}

        {/* Role Selector Pill */}
        <div className="role-selector-dropdown">
          <button className="role-btn">
            <Stethoscope size={15} />
            <span>{user.role}</span>
            <ChevronDown size={14} />
          </button>
          <div className="role-menu glass-panel">
            <div className="role-option" onClick={() => switchRole('User')}>User View</div>
            <div className="role-option" onClick={() => switchRole('Doctor')}>Doctor Portal</div>
            <div className="role-option" onClick={() => switchRole('Receptionist')}>Receptionist Desk</div>
            <div className="role-option" onClick={() => switchRole('Responder')}>Ambulance / Responder</div>
          </div>
        </div>

        {/* User Profile avatar */}
        <button 
          className="user-profile-btn" 
          onClick={() => navigateTo('profile')}
          title="View Profile"
        >
          <div className="avatar-circle">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
        </button>
      </div>

      <style>{`
        .app-header {
          height: 72px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .brand-logo {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #ffffff;
          border: 1.5px solid #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          padding: 3px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
        }

        .header-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }

        .header-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .header-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sos-active-badge {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #dc2626;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .pulse-red {
          animation: pulseGlow 1.5s infinite;
        }

        .role-selector-dropdown {
          position: relative;
        }

        .role-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: var(--text-sub);
          padding: 7px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-btn:hover {
          background: #f1f5f9;
          color: var(--text-main);
        }

        .role-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 170px;
          padding: 6px;
          display: none;
          flex-direction: column;
          gap: 4px;
          z-index: 200;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .role-selector-dropdown:hover .role-menu {
          display: flex;
        }

        .role-option {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-sub);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .role-option:hover {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .user-profile-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </header>
  );
};
