import React, { useState, useEffect } from 'react';
import { useApp, calculateProfileCompletion } from '../context/AppContext';
import { ArrowLeft, Activity, ShieldAlert, User, Stethoscope, AlertTriangle, ChevronDown, Maximize2, Minimize2, Bell, CheckCircle2, X, Trash2 } from 'lucide-react';
import { NotificationSwipeItem } from './NotificationSwipeItem';

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
  'doctor-dashboard': 'Doctor Consultation Portal',
  'receptionist-dashboard': 'Reception Desk Portal'
};

export const Header = () => {
  const { currentScreen, screenHistory, goBack, user, switchRole, navigateTo } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const completionScore = calculateProfileCompletion(user);
  const isProfileIncomplete = user.role === 'Patient' && completionScore < 100;
  const isComplete = completionScore === 100;

  const [headerNotifications, setHeaderNotifications] = useState([
    {
      id: 'hn-1',
      title: 'Complete Your Health Profile',
      text: `Your profile is ${completionScore}% complete. Please update Age, Blood Group & Prescription to reach 100% EHR verification.`,
      time: 'Just now',
      urgent: false,
      important: isProfileIncomplete
    },
    {
      id: 'hn-2',
      title: 'OP Token #14 Active',
      text: 'Dr. K. Srinivas Rao at GGH Guntur Cardiology OPD is serving Token #11. Queue ahead: 3.',
      time: '15m ago',
      urgent: false,
      important: false
    },
    {
      id: 'hn-3',
      title: 'EHR Vault Synced',
      text: 'Digital prescription & lab diagnostic report archived safely to ABHA Vault.',
      time: '1h ago',
      urgent: false,
      important: false
    }
  ]);

  const handleClearAllHeaderNotifs = () => {
    setHeaderNotifications([]);
  };

  const handleDeleteHeaderNotif = (id) => {
    setHeaderNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleImportantHeaderNotif = (id) => {
    setHeaderNotifications(prev => prev.map(n => n.id === id ? { ...n, important: !n.important } : n));
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  useEffect(() => {
    if (!showNotifMenu) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setShowNotifMenu(false);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [showNotifMenu]);

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

  const defaultHome = user?.role === 'Doctor'
    ? 'doctor-dashboard'
    : user?.role === 'Receptionist'
      ? 'receptionist-dashboard'
      : user?.role === 'Responder'
        ? 'emergency'
        : 'dashboard';

  const title = TITLE_MAP[currentScreen] || 'Care Navigator';
  const showBack = (screenHistory.length > 0 || currentScreen !== defaultHome) && currentScreen !== 'landing' && currentScreen !== 'onboarding';

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
        <div 
          className="brand-logo" 
          onClick={() => {
            navigateTo(defaultHome);
          }}
        >
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
        {/* Fullscreen Toggle Button */}
        <button
          className="btn-icon"
          onClick={toggleFullScreen}
          title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullscreen ? <Minimize2 size={19} color="#0f172a" /> : <Maximize2 size={19} color="#0f172a" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div style={{ position: 'relative', zIndex: 250 }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="App Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={20} color="#0f172a" />
            {headerNotifications.length > 0 && (
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
                width: '340px',
                maxWidth: '92vw',
                padding: '16px',
                borderRadius: '16px',
                background: '#ffffff',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                border: '1px solid #e2e8f0',
                zIndex: 260
              }}
            >
              {/* Header row with Title and Clear All button with icon (no close notification button) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={16} color="#0284c7" /> Notifications
                  </strong>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                    {headerNotifications.length > 0 ? `${headerNotifications.length} Active` : 'All Clear'}
                  </span>
                </div>

                {/* Clear All Notifications Button with Icon */}
                <button
                  onClick={handleClearAllHeaderNotifs}
                  disabled={headerNotifications.length === 0}
                  style={{
                    background: headerNotifications.length === 0 ? '#f1f5f9' : '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: headerNotifications.length === 0 ? '#94a3b8' : '#dc2626',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: headerNotifications.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Clear All Notifications"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Notification List with Mobile Swipe Support */}
              {headerNotifications.length > 0 ? (
                <div>
                  <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '2px' }}>
                    {headerNotifications.map(n => (
                      <NotificationSwipeItem
                        key={n.id}
                        notification={n}
                        onDelete={handleDeleteHeaderNotif}
                        onToggleImportant={handleToggleImportantHeaderNotif}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: '0 0 2px 0', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>All Caught Up!</p>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No pending notifications.</span>
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
              {(user?.name || 'User').split(' ').map(n => n[0]).join('')}
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
          min-height: 72px;
          flex-shrink: 0;
          background: #ffffff;
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: max(8px, env(safe-area-inset-top, 0px));
          padding-bottom: 8px;
          padding-left: max(24px, env(safe-area-inset-left, 0px));
          padding-right: max(24px, env(safe-area-inset-right, 0px));
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0f172a;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          white-space: nowrap;
        }

        .header-back-btn:hover {
          background: #0284c7;
          border-color: #0284c7;
          color: #ffffff;
          transform: translateX(-3px);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }

        .header-back-btn:active {
          transform: translateX(-1px) scale(0.97);
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
            max-width: 180px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .header-subtitle {
            font-size: 0.68rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 160px;
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
