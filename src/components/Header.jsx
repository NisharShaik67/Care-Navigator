import React, { useState, useEffect } from 'react';
import { useApp, calculateProfileCompletion } from '../context/AppContext';
import { ArrowLeft, Activity, ShieldAlert, User, Stethoscope, AlertTriangle, ChevronDown, Maximize2, Minimize2, Bell, CheckCircle2, X } from 'lucide-react';

const TITLE_MAP = {
  'landing': 'Care Navigator Universal Platform',
  'onboarding': 'Welcome to Care Navigator',
  'dashboard': 'Care Navigator Home',
  'emergency': 'Emergency Ambulance & Hospitals',
  'symptom-checker': 'AI Health Symptom Triage',
  'hospitals': 'Nearby Hospitals & Emergency Beds',
  'op-booking': 'Book OP Token Appointment',
  'appointments': 'My OP Tokens & Live Queue',
  'records': 'Digital Health Vault & EHR',
  'profile': 'My Health Profile & Contacts',
  'doctor-dashboard': 'Doctor Consultation Portal'
};

export const Header = () => {
  const { currentScreen, screenHistory, goBack, user, switchRole, navigateTo } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

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
  const showBack = screenHistory.length > 0 && currentScreen !== 'landing';

  const completionScore = calculateProfileCompletion(user);
  const isProfileIncomplete = user.role === 'Patient' && completionScore < 100;
  const isComplete = completionScore === 100;

  return (
    <header className="app-header">
      {/* Click outside overlay to close notifications */}
      {showNotifMenu && (
        <div 
          onClick={() => setShowNotifMenu(false)} 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 240,
            background: 'transparent'
          }}
        />
      )}

      <div className="header-left">
        <div className="brand-logo" onClick={() => navigateTo('dashboard')}>
          <img src="/Logo.jpeg" alt="Care Navigator Logo" className="header-logo-img" />
        </div>
        <div className="header-title-container">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">
            {user.role} Portal • {user.location}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative', zIndex: 250 }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="App Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={20} color="#0f172a" />
            {isProfileIncomplete && (
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  right: '4px', 
                  width: '10px', 
                  height: '10px', 
                  background: '#ef4444', 
                  borderRadius: '50%',
                  border: '2px solid #ffffff' 
                }} 
              />
            )}
          </button>

          {showNotifMenu && (
            <div 
              className="glass-panel fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '320px',
                padding: '16px',
                borderRadius: '16px',
                background: '#ffffff',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 260
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Notifications</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                    {isProfileIncomplete ? '1 Unread' : 'All Clear'}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNotifMenu(false); }}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                    title="Close Notifications"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {isProfileIncomplete ? (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: '800', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <AlertTriangle size={16} />
                    <span>Complete Your Health Profile</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                    Your profile is {completionScore}% complete. Please update your <strong>Age, Blood Group, and Doctor Prescription</strong> to reach 100% EHR verification.
                  </p>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => { setShowNotifMenu(false); navigateTo('profile'); }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Complete Profile Now</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '0.84rem' }}>
                  <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: '6px' }} />
                  <p style={{ margin: 0 }}>Your profile is 100% complete and verified!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile avatar */}
        <button 
          className="user-profile-btn" 
          onClick={() => navigateTo('profile')}
          title={`Profile ${completionScore}% Complete - Click to View`}
          style={{ position: 'relative', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Circular Progress Ring */}
            <svg width="46" height="46" viewBox="0 0 46 46" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle
                cx="23"
                cy="23"
                r="20"
                stroke="#e2e8f0"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="23"
                cy="23"
                r="20"
                stroke={isComplete ? '#10b981' : '#f59e0b'}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={(2 * Math.PI * 20) * (1 - completionScore / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>

            {/* Avatar Circle */}
            <div 
              className={`avatar-circle ${isComplete ? 'complete-glow' : ''}`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                boxShadow: isComplete ? '0 0 12px rgba(16, 185, 129, 0.7), 0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
                border: isComplete ? '2px solid #10b981' : '2px solid #ffffff'
              }}
            >
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Percentage Badge */}
            <span 
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-6px',
                zIndex: 3,
                background: isComplete ? '#10b981' : '#f59e0b',
                color: '#ffffff',
                fontSize: '0.58rem',
                fontWeight: '900',
                padding: '1px 4px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                border: '1.5px solid #ffffff',
                lineHeight: 1.25
              }}
            >
              {completionScore}%
            </span>
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

        @media (max-width: 768px) {
          .app-header {
            height: 64px;
            padding: 0 16px;
            gap: 12px;
          }

          .header-left {
            gap: 10px;
            flex: 1;
            min-width: 0;
          }

          .brand-logo {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            flex-shrink: 0;
          }

          .header-title-container {
            min-width: 0;
            flex: 1;
          }

          .header-title {
            font-size: 0.95rem;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .header-subtitle {
            font-size: 0.72rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .header-right {
            gap: 10px;
            flex-shrink: 0;
          }

          .btn-icon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
          }

          .role-btn {
            padding: 6px 10px;
            font-size: 0.8rem;
            border-radius: 10px;
            gap: 4px;
          }

          .avatar-circle {
            width: 38px;
            height: 38px;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .app-header {
            height: 60px;
            padding: 0 12px;
            gap: 8px;
          }

          .header-left {
            gap: 8px;
          }

          .brand-logo {
            width: 34px;
            height: 34px;
          }

          .header-title {
            font-size: 0.88rem;
            max-width: 140px;
          }

          .header-subtitle {
            display: none;
          }

          .role-btn span {
            display: none;
          }

          .role-btn {
            padding: 6px 8px;
          }

          .btn-icon {
            width: 34px;
            height: 34px;
          }

          .avatar-circle {
            width: 34px;
            height: 34px;
            font-size: 0.8rem;
          }
        }

      `}</style>
    </header>
  );
};
