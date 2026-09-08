import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, ShieldAlert, Bot, CalendarCheck, FolderHeart } from 'lucide-react';

export const Navigation = () => {
  const { currentScreen, navigateTo, appointments } = useApp();

  const activeAppointmentsCount = appointments.filter(a => a.status === 'ACTIVE').length;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'symptom-checker', label: 'AI Symptom', icon: Bot },
    { id: 'op-booking', label: 'Book OP', icon: CalendarCheck, badge: activeAppointmentsCount > 0 ? activeAppointmentsCount : null },
    { id: 'records', label: 'Health Vault', icon: FolderHeart }
  ];

  if (currentScreen === 'onboarding' || currentScreen === 'landing') return null;

  return (
    <nav className="app-navigation">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigateTo(item.id)}
          >
            <div className="icon-wrapper">
              <Icon size={20} />
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
            <span className="tab-label">{item.label}</span>
          </button>
        );
      })}

      <style>{`
        .app-navigation {
          height: 68px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 12px;
          position: sticky;
          bottom: 0;
          z-index: 90;
        }

        .nav-tab {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          flex: 1;
          max-width: 110px;
        }

        .nav-tab:hover {
          color: var(--text-main);
        }

        .nav-tab.active {
          color: #059669;
          background: rgba(16, 185, 129, 0.12);
        }

        .nav-tab.middle-sos-tab {
          color: #dc2626;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 16px;
          padding: 8px 10px;
          transform: translateY(-6px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .nav-tab.middle-sos-tab:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
          transform: translateY(-8px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
        }

        .nav-tab.middle-sos-tab.active,
        .nav-tab.emergency-active {
          color: #ffffff;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-color: #b91c1c;
          animation: pulseGlow 1.5s infinite;
        }

        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-label {
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .nav-badge {
          position: absolute;
          top: -6px;
          right: -10px;
          background: #0284c7;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 999px;
          line-height: 1;
        }

        .nav-badge.badge-red {
          background: #dc2626;
          border: 1px solid #ffffff;
        }
      `}</style>
    </nav>
  );
};
