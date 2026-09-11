import React from 'react';
import { useApp, calculateProfileCompletion } from '../context/AppContext';
import { 
  ShieldAlert, 
  Bot, 
  CalendarCheck, 
  Building2, 
  FolderHeart, 
  User, 
  Activity, 
  Heart, 
  Clock, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Stethoscope,
  Bell
} from 'lucide-react';

export const DashboardView = () => {
  const { user, navigateTo, appointments, hospitals, records } = useApp();

  const activeAppointments = (appointments || []).filter(a => a.status === 'ACTIVE');
  const completionScore = calculateProfileCompletion(user);
  const isProfileIncomplete = user?.role === 'Patient' && completionScore < 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Hello';
  };

  return (
    <div className="care-dashboard-container fade-in">
      {/* Welcome Hero Banner */}
      <div className="hero-banner glass-panel">
        <div className="hero-left">
          <div className="greeting-pill">
            <Sparkles size={14} color="#10b981" />
            <span>AI Care Navigator Active • 24/7 Response</span>
          </div>
          <h2>
            <span>{getGreeting()},</span><br />
            <span>{user?.name || 'User'} 👋</span>
          </h2>
          <p className="subtitle">
            ABHA Health ID: <span className="mono text-sky">{user.healthId}</span> • {user.location}
          </p>
        </div>
      </div>

      {/* Incomplete Profile Notification Alert Banner */}
      {isProfileIncomplete && (
        <div 
          className="glass-card fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={22} color="#b45309" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#92400e', margin: 0 }}>
                Profile Completion Required ({completionScore}%)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                Your Aadhaar details are verified. Please update your <strong>Age, Blood Group, and Doctor Prescription</strong> to reach 100% EHR verification.
              </p>
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigateTo('profile')}
            style={{ whiteSpace: 'nowrap', padding: '10px 18px', background: '#d97706', borderColor: '#b45309' }}
          >
            <span>Complete Profile Now</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Primary Action Grid */}
      <div className="section-title">
        <h3>Care Services & Triage</h3>
      </div>
      
      <div className="services-grid">

        <div className="service-card card-symptom" onClick={() => navigateTo('symptom-checker')}>
          <div className="card-icon icon-emerald">
            <Bot size={28} />
          </div>
          <div className="card-info">
            <h4>AI Health Symptom Triage</h4>
            <p>Describe your symptoms for instant risk assessment & department match.</p>
          </div>
          <ChevronRight size={20} className="arrow" />
        </div>

        <div className="service-card card-op" onClick={() => navigateTo('op-booking')}>
          <div className="card-icon icon-sky">
            <CalendarCheck size={28} />
          </div>
          <div className="card-info">
            <h4>Book OP Token Appointment</h4>
            <p>Skip hospital registration lines with instant digital consultation tokens.</p>
          </div>
          <ChevronRight size={20} className="arrow" />
        </div>

        <div className="service-card card-hospitals" onClick={() => navigateTo('hospitals')}>
          <div className="card-icon icon-purple">
            <Building2 size={28} />
          </div>
          <div className="card-info">
            <h4>Nearby Hospitals & Bed Tracker</h4>
            <p>Live emergency bed counts, ICU availability & specialty doctors.</p>
          </div>
          <ChevronRight size={20} className="arrow" />
        </div>

        <div className="service-card card-records" onClick={() => navigateTo('records')}>
          <div className="card-icon icon-amber">
            <FolderHeart size={28} />
          </div>
          <div className="card-info">
            <h4>Digital Health Vault & EHR</h4>
            <p>Aadhaar-linked medical records, prescriptions & lab diagnostic reports.</p>
          </div>
          <ChevronRight size={20} className="arrow" />
        </div>
      </div>

      {/* Active OP Tokens / Appointments Overview */}
      <div className="section-title margin-top">
        <h3>My Doctor Appointments ({activeAppointments.length})</h3>
        <button className="link-btn" onClick={() => navigateTo('appointments')}>View All Tokens →</button>
      </div>

      {activeAppointments.length > 0 ? (
        <div className="active-tokens-container">
          {activeAppointments.map(app => (
            <div key={app.id} className="dash-token-card glass-panel" onClick={() => navigateTo('appointments')}>
              <div className="token-left">
                <h4>{app.doctorName}</h4>
                <p className="sub">{app.hospitalName} • {app.specialty}</p>
              </div>

              <div className="token-queue-info">
                <div className="q-stat q-stat-left">
                  <span className="lbl">NOW SERVING</span>
                  <span className="val text-emerald">#{app.currentServing}</span>
                </div>
                <div className="q-stat q-stat-center">
                  <span className="lbl">AHEAD OF YOU</span>
                  <span className="val text-sky">{app.queueAhead} patients</span>
                </div>
                <div className="q-stat q-stat-right">
                  <span className="lbl">ESTIMATED WAIT</span>
                  <span className="val">{app.queueAhead * 4} mins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-card glass-panel">
          <CalendarCheck size={32} color="#94a3b8" />
          <p>No active OP tokens for today. Need a doctor consultation?</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigateTo('op-booking')}>
            + Book OP Token Now
          </button>
        </div>
      )}


      <style>{`
        .care-dashboard-container {
          padding: 24px 32px;
          max-width: 1720px;
          margin: 0 auto;
          width: 100%;
        }

        .hero-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 20px;
          padding: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }

        .hero-left h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #0f172a;
          margin: 8px 0 4px 0;
        }

        .hero-left .subtitle {
          font-size: 0.92rem;
          color: #64748b;
          margin-bottom: 16px;
        }

        .greeting-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #059669;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
        }

        .vitals-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .vital-chip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vital-chip .lbl {
          font-size: 0.68rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
        }

        .vital-chip .val {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .badge-red {
          color: #dc2626;
        }

        .btn-sos-hero-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
          transition: all 0.2s ease;
          padding: 8px;
        }

        .btn-sos-hero-circle:hover {
          transform: scale(1.06);
          box-shadow: 0 12px 30px rgba(239, 68, 68, 0.55);
        }

        .sos-circle-lbl {
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          text-align: center;
          line-height: 1.1;
        }

        .emergency-alert-bar {
          background: rgba(239, 68, 68, 0.95);
          color: #ffffff;
          padding: 14px 20px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .margin-top {
          margin-top: 32px;
        }

        .link-btn {
          background: rgba(2, 132, 199, 0.08);
          border: 1px solid rgba(2, 132, 199, 0.25);
          color: #0284c7;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .link-btn:hover {
          background: rgba(2, 132, 199, 0.16);
          border-color: #0284c7;
          transform: translateY(-1px);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .service-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .service-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }

        .service-card .arrow {
          color: #cbd5e1;
          margin-left: auto;
          transition: transform 0.2s ease;
        }

        .service-card:hover .arrow {
          transform: translateX(4px);
          color: #0f172a;
        }

        .card-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-red { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .icon-emerald { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        .icon-sky { background: rgba(2, 132, 199, 0.12); color: #0284c7; }
        .icon-purple { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
        .icon-amber { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }

        .card-info h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .card-info p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.4;
        }

        .dash-token-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          cursor: pointer;
        }

        .token-badge {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .token-left h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 6px 0 2px 0;
        }

        .token-left .sub {
          font-size: 0.85rem;
          color: #64748b;
        }

        .token-queue-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          gap: 12px;
          min-width: 340px;
        }

        .q-stat {
          display: flex;
          flex-direction: column;
        }

        .q-stat-left {
          align-items: flex-start;
          text-align: left;
        }

        .q-stat-center {
          align-items: center;
          text-align: center;
        }

        .q-stat-right {
          align-items: flex-end;
          text-align: right;
        }

        .q-stat .lbl {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .q-stat .val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .dash-token-card {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }

          .token-left {
            width: 100%;
          }

          .token-queue-info {
            width: 100%;
            min-width: unset;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;
            gap: 8px;
          }

          .q-stat-left {
            align-items: flex-start;
            text-align: left;
          }

          .q-stat-center {
            align-items: center;
            text-align: center;
          }

          .q-stat-right {
            align-items: flex-end;
            text-align: right;
          }
        }

        .text-emerald { color: #10b981; }
        .text-sky { color: #0284c7; }

        .empty-state-card {
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-state-card p {
          color: #64748b;
          font-size: 0.9rem;
        }

        .hospitals-mini-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }

        .hosp-mini-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hosp-mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .hosp-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .hosp-top h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .hosp-top .addr {
          font-size: 0.8rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        .rating-pill {
          background: transparent;
          color: #eab308;
          font-size: 0.88rem;
          font-weight: 800;
          padding: 0;
        }

        .bed-counters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bed-chip {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .chip-emerald { background: rgba(16, 185, 129, 0.1); color: #047857; }
        .chip-sky { background: rgba(2, 132, 199, 0.1); color: #0369a1; }
        .chip-amber { background: rgba(245, 158, 11, 0.1); color: #b45309; }

        .bed-chip .count {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .bed-chip .lbl {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};
