import React, { useState, useEffect, useRef } from 'react';
import { useApp, calculateProfileCompletion } from '../context/AppContext';
import { 
  Bell, 
  CheckCircle2, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { NotificationSwipeItem } from './NotificationSwipeItem';

const TITLE_MAP = {
  'landing': 'Care Navigator Universal Platform',
  'onboarding': 'Welcome to Care Navigator',
  'dashboard': 'Care Navigator Home',
  'emergency': '108 Emergency Ambulance Tracker',
  'responder': '108 Responder Command Center',
  'responder-dashboard': '108 Responder Command Center',
  'admin': 'State Health Admin Console',
  'admin-dashboard': 'State Health Admin Console',
  'symptom-checker': 'AI Health Symptom Triage',
  'hospitals': 'Nearby Hospitals & Emergency Beds',
  'icu': 'ICU & Critical Care Bed Matrix',
  'op-booking': 'Book OP Token Appointment',
  'appointments': 'My OP Tokens & Live Queue',
  'records': 'Digital Health Vault & EHR',
  'profile': 'My Health Profile & Contacts',
  'doctor-dashboard': 'Doctor Consultation Portal',
  'receptionist-dashboard': 'Reception Desk Portal'
};

export const Header = () => {
  const { 
    currentScreen, 
    user, 
    navigateTo, 
    goBack
  } = useApp();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const completionScore = calculateProfileCompletion(user);
  const isProfileIncomplete = user?.role === 'Patient' && completionScore < 100;
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

  const isDriver = user?.role === 'Responder' || user?.role === 'Driver';
  const defaultHome = user?.role === 'Doctor'
    ? 'doctor-dashboard'
    : user?.role === 'Receptionist'
      ? 'receptionist-dashboard'
      : isDriver
        ? 'responder'
        : (user?.role === 'Admin' || user?.role === 'Super Admin')
          ? 'admin'
          : 'dashboard';

  const title = (currentScreen === 'emergency' && isDriver)
    ? '108 Responder Command Console'
    : (TITLE_MAP[currentScreen] || 'Care Navigator');

  const logoClicksRef = useRef({ count: 0, timer: null });

  const handleLogoClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    logoClicksRef.current.count += 1;
    if (logoClicksRef.current.timer) {
      clearTimeout(logoClicksRef.current.timer);
    }

    if (logoClicksRef.current.count >= 3) {
      logoClicksRef.current.count = 0;
      try {
        sessionStorage.removeItem('cn_admin_unlocked');
      } catch {}
      navigateTo('admin');
      return;
    }

    logoClicksRef.current.timer = setTimeout(() => {
      logoClicksRef.current.count = 0;
      navigateTo(defaultHome);
    }, 950);
  };

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
        {currentScreen !== defaultHome && (
          <button 
            type="button"
            className="header-back-btn"
            onClick={goBack}
            title="Go back to previous page"
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span className="header-back-label">Back</span>
          </button>
        )}
        <div 
          className="brand-logo" 
          onClick={handleLogoClick}
          title="Care Navigator (Click 3 times to open Admin Page)"
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <img src="/Logo.jpeg" alt="Care Navigator Logo" className="header-logo-img" />
        </div>
        <div className="header-title-container">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">
            {user?.role || 'Patient'} Portal • {user?.location || 'Narasaraopet, AP'}
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
                border: isComplete ? '2px solid #10b981' : '2px solid #ffffff',
                overflow: 'hidden'
              }}
            >
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user?.name || 'User'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                String(user?.name || 'User').trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
              )}
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

        .header-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .header-back-btn:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
          color: #0284c7;
          transform: translateX(-2px);
        }

        .header-back-btn:active {
          transform: scale(0.96);
        }

        .firestore-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1.5px solid transparent;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          white-space: nowrap;
        }

        .fs-online {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #065f46;
        }

        .fs-online:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          transform: translateY(-1px);
        }

        .fs-locked {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }

        .fs-locked:hover {
          background: #fef3c7;
          border-color: #fcd34d;
          transform: translateY(-1px);
        }

        .fs-offline {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #475569;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-green {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
        }

        .dot-amber {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.7);
          animation: pulse-amber 1.8s infinite;
        }

        .dot-red {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.7);
        }

        @keyframes pulse-amber {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
          .portal-badge-text {
            display: none;
          }

          .portal-badge-btn {
            padding: 6px 8px !important;
          }

          .app-header {
            height: 60px;
            padding: 0 12px;
            gap: 8px;
          }

          .header-back-btn {
            padding: 6px;
            width: 34px;
            height: 34px;
            border-radius: 9px;
          }

          .header-back-label {
            display: none;
          }

          .header-left {
            gap: 8px;
          }

          .brand-logo {
            width: 34px;
            height: 34px;
          }

          .header-title-container {
            min-width: 0;
            flex: 1 1 auto;
            overflow: hidden;
          }

          .header-title {
            font-size: clamp(0.78rem, 2.8vw, 0.88rem);
            max-width: 100%;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
          }

          .header-subtitle {
            font-size: clamp(0.60rem, 2.2vw, 0.68rem);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            width: 100%;
            line-height: 1.2;
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

          .fs-pill-text {
            display: none;
          }

          .firestore-pill-btn {
            padding: 6px 8px;
          }
        }

        @media (max-width: 360px) {
          .app-header {
            height: 56px;
            padding: 0 8px;
            gap: 4px;
          }
          .header-left {
            gap: 4px;
          }
          .header-right {
            gap: 4px;
          }
          .header-back-btn {
            width: 30px;
            height: 30px;
            padding: 4px;
          }
          .brand-logo {
            width: 30px;
            height: 30px;
          }
          .btn-icon {
            width: 30px;
            height: 30px;
          }
          .portal-badge-btn {
            padding: 4px 6px !important;
          }
        }

      `}</style>
    </header>
  );
};
