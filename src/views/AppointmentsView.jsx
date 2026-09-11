import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarCheck, QrCode, Clock, Stethoscope, Building2, AlertCircle, XCircle, CheckCircle2, ChevronRight, Plus } from 'lucide-react';

export const AppointmentsView = () => {
  const { appointments, cancelAppointment, navigateTo } = useApp();
  const [selectedQRModal, setSelectedQRModal] = useState(null);

  const activeApps = (appointments || []).filter(a => a.status === 'ACTIVE');
  const pastApps = (appointments || []).filter(a => a.status !== 'ACTIVE');

  return (
    <div className="appointments-view-container fade-in">
      {/* Active OP Tokens Section */}
      <div className="section-header">
        <div className="title-with-badge">
          <h3>My Doctor Appointments</h3>
          <span className="badge badge-emerald">{activeApps.length} Active</span>
        </div>
        <button className="btn-icon-blue" onClick={() => navigateTo('op-booking')} title="Book New OP Token" aria-label="Book New OP Token">
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {activeApps.length > 0 ? (
        <div className="active-tokens-list">
          {activeApps.map(app => (
            <div key={app.id} className="token-card glass-panel fade-in">
              <div className="token-card-top">
                <div className="token-info-left">
                  <div className="token-top-title">TOKEN #{app.tokenNumber}</div>
                  <h4 className="doctor-name">{app.doctorName}</h4>
                  <p className="hosp-name">{app.hospitalName}</p>
                  <p className="slot-info">Patient: <strong>{app.patientName || 'Alex Johnson'}</strong> • {app.specialty} • {app.date} at {app.timeSlot}</p>
                </div>
                <div className="token-info-right-bottom">
                  <span className="confirmed-badge-green">CONFIRMED</span>
                </div>
              </div>

              {/* Live Queue Tracker */}
              <div className="queue-tracker-box">
                <div className="queue-metric-row">
                  <div className="metric metric-left">
                    <span className="m-lbl">NOW SERVING</span>
                    <span className="m-val text-emerald">#{app.currentServing}</span>
                  </div>
                  <div className="metric metric-center">
                    <span className="m-lbl">PATIENTS AHEAD</span>
                    <span className="m-val text-sky">{app.queueAhead}</span>
                  </div>
                  <div className="metric metric-right">
                    <span className="m-lbl">EST. CONSULT</span>
                    <span className="m-val">{app.queueAhead * 4} mins</span>
                  </div>
                </div>

                <div className="progress-bar-wrapper">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.max(15, 100 - (app.queueAhead * 20))}%` }}
                  ></div>
                </div>
              </div>

              <div className="token-card-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => cancelAppointment(app.id)}>
                  <XCircle size={15} color="#f87171" />
                  <span>Cancel Appointment</span>
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedQRModal(app)}>
                  <QrCode size={15} />
                  <span>View Digital Pass</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel">
          <AlertCircle size={36} color="#94a3b8" />
          <h4>No Active Consultation Tokens</h4>
          <p>You have no pending hospital queue passes. Book an OP token to skip wait times.</p>
          <button className="btn btn-primary" onClick={() => navigateTo('op-booking')}>
            Book OP Token Now
          </button>
        </div>
      )}

      {/* Past Appointments History */}
      {pastApps.length > 0 && (
        <div className="past-history-section">
          <h3 className="sub-title">Token History</h3>
          <div className="history-list">
            {pastApps.map(app => (
              <div key={app.id} className="history-item glass-card">
                <div className="h-left">
                  <span className="h-id">{app.id}</span>
                  <h4>{app.doctorName}</h4>
                  <p>{app.hospitalName} • {app.date}</p>
                </div>
                <span className={`badge ${app.status === 'CANCELLED' ? 'badge-danger' : 'badge-emerald'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital QR Token Pass Modal */}
      {selectedQRModal && (
        <div className="modal-overlay" onClick={() => setSelectedQRModal(null)}>
          <div className="modal-content glass-panel qr-pass-modal fade-in" onClick={e => e.stopPropagation()}>
            <div className="pass-header">
              <span className="badge badge-emerald">DIGITAL HOSPITAL ENTRY PASS</span>
              <h2>{selectedQRModal.hospitalName}</h2>
              <p>{selectedQRModal.doctorName} • {selectedQRModal.specialty}</p>
            </div>

            <div className="qr-big-box">
              <div className="qr-simulated-graphic">
                <QrCode size={160} color="#0f172a" />
              </div>
              <span className="qr-code-str">{selectedQRModal.qrData}</span>
            </div>

            <div className="pass-details-grid">
              <div className="p-box">
                <span className="lbl">TOKEN NUMBER</span>
                <span className="val">#{selectedQRModal.tokenNumber}</span>
              </div>
              <div className="p-box">
                <span className="lbl">SLOT TIME</span>
                <span className="val">{selectedQRModal.timeSlot}</span>
              </div>
            </div>

            <button className="btn btn-secondary btn-block" onClick={() => setSelectedQRModal(null)}>
              Close Pass
            </button>
          </div>
        </div>
      )}

      <style>{`
        .appointments-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-with-badge h3 {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .btn-icon-blue {
          background: #0284c7;
          color: #ffffff;
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .btn-icon-blue:hover {
          background: #0369a1;
          transform: translateY(-1px) scale(1.06);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.4);
        }

        .active-tokens-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .token-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .token-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
        }

        .token-info-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .token-top-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #000000;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .token-info-left .doctor-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .token-info-left .hosp-name {
          font-size: 0.88rem;
          color: var(--text-sub);
          margin-bottom: 2px;
        }

        .token-info-left .slot-info {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .token-info-right-bottom {
          align-self: flex-end;
          margin-left: auto;
          flex-shrink: 0;
        }

        .confirmed-badge-green {
          background: #10b981;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
        }

        .qr-btn {
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-sub);
          cursor: pointer;
        }

        .queue-tracker-box {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 14px;
          padding: 16px;
        }

        .queue-metric-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          align-items: center;
          margin-bottom: 12px;
          gap: 8px;
        }

        .metric {
          display: flex;
          flex-direction: column;
        }

        .metric-left {
          align-items: flex-start;
          text-align: left;
        }

        .metric-center {
          align-items: center;
          text-align: center;
        }

        .metric-right {
          align-items: flex-end;
          text-align: right;
        }

        .m-lbl {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-muted);
          display: block;
        }

        .m-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .text-emerald { color: #059669; }
        .text-sky { color: #0284c7; }

        .progress-bar-wrapper {
          height: 6px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .token-card-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-state h4 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .empty-state p {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        .sub-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-item {
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .h-id {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: monospace;
        }

        .h-left h4 {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .h-left p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .qr-pass-modal {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .pass-header h2 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 8px 0 4px;
          color: var(--text-main);
        }

        .pass-header p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .qr-big-box {
          background: #fff;
          padding: 24px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .qr-code-str {
          font-family: monospace;
          font-size: 0.75rem;
          color: #0f172a;
          font-weight: 700;
        }

        .pass-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }

        .p-box {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .p-box .lbl {
          font-size: 0.68rem;
          color: var(--text-muted);
          display: block;
        }

        .p-box .val {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};
