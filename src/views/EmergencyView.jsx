import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, PhoneCall, MapPin, Navigation as NavIcon, Users, CheckCircle2, AlertOctagon, HeartPulse, Stethoscope, ChevronDown, HelpCircle, XCircle } from 'lucide-react';

const FIRST_AID_GUIDES = [
  {
    title: "Cardiopulmonary Resuscitation (CPR)",
    category: "Cardiac Emergency",
    steps: [
      "Check if person is conscious and breathing.",
      "Call Emergency 108 / 112 immediately.",
      "Push hard and fast in center of chest (100-120 compressions per minute).",
      "Allow chest to recoil completely between compressions."
    ]
  },
  {
    title: "Severe Bleeding & Hemorrhage Control",
    category: "Trauma Emergency",
    steps: [
      "Apply firm, direct pressure on the wound using a clean cloth or bandage.",
      "Maintain pressure without lifting cloth to check wound.",
      "Elevate the injured limb above heart level if possible.",
      "Keep patient warm and calm until medical help arrives."
    ]
  },
  {
    title: "Choking Relief (Heimlich Maneuver)",
    category: "Airway Emergency",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place it just above the navel.",
      "Grasp your fist with your other hand and give quick upward thrusts.",
      "Repeat until airway object is dislodged or help arrives."
    ]
  }
];

export const EmergencyView = () => {
  const { user } = useApp();
  const [openGuide, setOpenGuide] = useState(0);

  return (
    <div className="emergency-view-container fade-in">
      {/* Emergency Helpline Header */}
      <div className="sos-status-card glass-panel">
        <div className="sos-status-top">
          <div className="status-indicator">
            <div className="status-dot dot-green"></div>
            <span>EMERGENCY AMBULANCE DISPATCH • DIAL 108</span>
          </div>
        </div>

        <div className="sos-trigger-box">
          <a href="tel:108" className="btn btn-emergency btn-block" style={{ textDecoration: 'none', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <PhoneCall size={24} />
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>CALL 108 AMBULANCE HELPLINE</span>
          </a>
          <p className="sos-disclaimer">
            24/7 National Emergency Medical Response Service. Direct helpline for immediate medical assistance and hospital ambulance dispatch.
          </p>
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="contacts-notif-card glass-panel">
        <div className="card-title-row">
          <Users size={20} color="#0284c7" />
          <h3>Emergency Contacts Directory</h3>
        </div>

        <div className="contacts-list">
          {(user?.emergencyContacts || []).map(contact => (
            <div key={contact.id} className="contact-item">
              <div className="contact-info">
                <span className="c-name">{contact.name}</span>
                <span className="c-rel">{contact.relation} • {contact.phone}</span>
              </div>
              <div className="c-status">
                <span className="status-tag tag-ready">Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive First Aid Guide Accordion */}
      <div className="first-aid-card glass-panel">
        <div className="card-title-row">
          <AlertOctagon size={20} color="#f59e0b" />
          <h3>Emergency First-Aid Quick Guides</h3>
        </div>

        <div className="guides-accordion">
          {FIRST_AID_GUIDES.map((guide, idx) => (
            <div key={idx} className="accordion-item glass-card">
              <div className="accordion-header" onClick={() => setOpenGuide(openGuide === idx ? null : idx)}>
                <div>
                  <h4>{guide.title}</h4>
                  <span className="guide-cat">{guide.category}</span>
                </div>
                <ChevronDown size={18} className={`arrow ${openGuide === idx ? 'rotated' : ''}`} />
              </div>

              {openGuide === idx && (
                <div className="accordion-body fade-in">
                  <ol className="steps-list">
                    {guide.steps.map((step, sIdx) => (
                      <li key={sIdx}>
                        <span className="step-num">{sIdx + 1}</span>
                        <span className="step-txt">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .emergency-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sos-status-card {
          padding: 32px;
          text-align: center;
          position: relative;
        }

        .sos-status-card.active-sos {
          border-color: rgba(239, 68, 68, 0.4);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, #ffffff 100%);
        }

        .sos-status-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .dot-green { background: #059669; }
        .dot-red { background: #dc2626; }

        .btn-sm {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        .sos-trigger-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .sos-pulse-button {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: 6px solid rgba(255, 255, 255, 0.4);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          animation: pulseGlow 1.8s infinite;
          transition: transform 0.2s ease;
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
        }

        .sos-pulse-button:hover {
          transform: scale(1.06);
        }

        .sos-btn-text {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .sos-btn-sub {
          font-size: 0.7rem;
          opacity: 0.9;
        }

        .sos-disclaimer {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 480px;
          line-height: 1.5;
        }

        .active-dispatch-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .eta-badge-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          padding: 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .eta-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 0.08em;
        }

        .eta-countdown {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin: 6px 0;
        }

        .eta-num {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1;
        }

        .eta-unit {
          font-size: 1.2rem;
          font-weight: 700;
          color: #dc2626;
        }

        .eta-status {
          font-size: 0.85rem;
          color: var(--text-sub);
        }

        .dispatch-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          width: 100%;
        }

        .info-block {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .info-block .lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: block;
        }

        .info-block .val {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .call-driver-btn {
          margin-top: 8px;
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .card-title-row h3 {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .contacts-notif-card, .first-aid-card {
          padding: 24px;
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid var(--border-dark);
        }

        .c-name {
          font-size: 0.92rem;
          font-weight: 700;
          display: block;
          color: var(--text-main);
        }

        .c-rel {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .status-tag {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tag-ready {
          background: rgba(148, 163, 184, 0.15);
          color: var(--text-muted);
        }

        .tag-sent {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        .guides-accordion {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .accordion-item {
          padding: 16px 20px;
          cursor: pointer;
        }

        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .accordion-header h4 {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .guide-cat {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .arrow {
          transition: transform 0.25s ease;
          color: var(--text-muted);
        }

        .arrow.rotated {
          transform: rotate(180deg);
        }

        .accordion-body {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .steps-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.88rem;
          color: var(--text-sub);
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(2, 132, 199, 0.2);
          color: #38bdf8;
          font-size: 0.78rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Ambulance Route Map Styles */
        .ambulance-map-wrapper {
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #090d16;
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
          margin: 16px 0;
          display: flex;
          flex-direction: column;
        }

        .map-hud-header {
          padding: 16px 20px;
          background: rgba(15, 23, 42, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hud-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hud-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hud-status-badge .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
        }

        .hud-status-badge .live-dot.green {
          background: #10b981;
        }

        .hud-status-text {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }

        .hud-street-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .hud-metrics {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .metric-box {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-box.highlighted {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .metric-box .m-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .metric-box .m-val {
          font-size: 1.25rem;
          font-weight: 900;
        }

        .map-canvas-container {
          position: relative;
          width: 100%;
          background: #020617;
          overflow: hidden;
          transition: transform 0.2s ease-out;
        }

        .map-svg {
          width: 100%;
          height: auto;
          min-height: 280px;
          display: block;
        }

        .map-controls-bar {
          position: absolute;
          bottom: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          padding: 6px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
        }

        .map-ctrl-btn {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .map-ctrl-btn:hover {
          background: #0284c7;
          color: #ffffff;
        }

        .map-ctrl-btn.speed-btn {
          width: auto;
          padding: 0 10px;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .map-ctrl-btn.speed-btn.active {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.5);
          color: #fbbf24;
        }

        .map-route-progress {
          padding: 14px 20px;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .progress-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .progress-track {
          width: 100%;
          height: 8px;
          background: rgba(51, 65, 85, 0.8);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0284c7, #10b981, #ef4444);
          border-radius: 999px;
          transition: width 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};
