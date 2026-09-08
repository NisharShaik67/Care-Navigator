import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Stethoscope, Users, CheckCircle2, UserCheck, FileText, Send, Clock, Search, CreditCard, ShieldCheck, AlertTriangle, Building2, Heart } from 'lucide-react';

export const DoctorDashboardView = () => {
  const { user, records } = useApp();
  const [activeQueue, setActiveQueue] = useState([
    { id: 101, token: 14, name: 'Alex Johnson', aadhar: '5892 4103 7621', age: 28, gender: 'Male', reason: 'General Consultation & Fever', status: 'WAITING' },
    { id: 102, token: 15, name: 'Lakshmi Narayana', aadhar: '7721 9083 1140', age: 45, gender: 'Female', reason: 'BP Followup', status: 'WAITING' },
    { id: 103, token: 16, name: 'Srinivas Rao', aadhar: '8812 3456 9901', age: 52, gender: 'Male', reason: 'Chest Tightness', status: 'WAITING' }
  ]);

  const [searchAadhar, setSearchAadhar] = useState('5892 4103 7621');
  const [searchedPatient, setSearchedPatient] = useState({
    name: 'Alex Johnson',
    aadharNumber: '5892 4103 7621',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Dust', 'Sulfa drugs'],
    precautions: [
      'Avoid NSAID pain relievers due to mild gastritis history.',
      'Maintain daily hydration (>3L/day) for high uric acid prevention.',
      'Monitor blood pressure weekly.'
    ],
    medicineAlerts: [
      { id: 1, name: 'Cetirizine 10mg', timing: '09:00 PM (Bedtime)', dose: '1 Tablet after dinner' },
      { id: 2, name: 'Multivitamin Complex', timing: '09:30 AM (Morning)', dose: '1 Capsule after breakfast' }
    ]
  });

  const [currentConsulting, setCurrentConsulting] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('Paracetamol 650mg TDS x 3 days\nCetirizine 10mg HS x 5 days');

  const handleAadharSearch = (e) => {
    e.preventDefault();
    if (!searchAadhar) return;
    setSearchedPatient({
      name: searchAadhar.includes('7721') ? 'Lakshmi Narayana' : searchAadhar.includes('8812') ? 'Srinivas Rao' : 'Alex Johnson',
      aadharNumber: searchAadhar,
      age: searchAadhar.includes('7721') ? 45 : searchAadhar.includes('8812') ? 52 : 28,
      gender: searchAadhar.includes('7721') ? 'Female' : 'Male',
      bloodGroup: searchAadhar.includes('7721') ? 'B+' : searchAadhar.includes('8812') ? 'A+' : 'O+',
      allergies: searchAadhar.includes('7721') ? ['Lactose'] : ['Penicillin', 'Dust'],
      precautions: [
        'Avoid NSAID pain relievers due to mild gastritis history.',
        'Maintain daily hydration (>3L/day) for high uric acid prevention.',
        'Monitor blood pressure weekly.'
      ],
      medicineAlerts: [
        { id: 1, name: 'Cetirizine 10mg', timing: '09:00 PM (Bedtime)', dose: '1 Tablet after dinner' },
        { id: 2, name: 'Multivitamin Complex', timing: '09:30 AM (Morning)', dose: '1 Capsule after breakfast' }
      ]
    });
  };

  const handleCallPatient = (patient) => {
    setActiveQueue(prev => prev.map(p => p.id === patient.id ? { ...p, status: 'IN_ROOM' } : p));
    setCurrentConsulting(patient);
  };

  const handleCompleteConsultation = (e) => {
    e.preventDefault();
    if (!currentConsulting) return;
    setActiveQueue(prev => prev.filter(p => p.id !== currentConsulting.id));
    setShowPrescriptionModal(false);
    alert(`Digital Prescription issued for ${currentConsulting.name}! Record synced to patient's EHR Vault.`);
    setCurrentConsulting(null);
    setDiagnosis('');
  };

  return (
    <div className="doctor-dashboard-container fade-in">
      {/* Doctor & Receptionist Header Card */}
      <div className="doc-header-card glass-panel">
        <div className="doc-profile-row">
          <div className="doc-icon-box">
            {user.role === 'Receptionist' ? <Building2 size={28} color="#f59e0b" /> : <Stethoscope size={28} color="#0284c7" />}
          </div>
          <div>
            <h3>{user.role === 'Receptionist' ? 'Receptionist & Outpatient Registration Desk' : 'Dr. Rajesh Sharma (Emergency & General Specialist)'}</h3>
            <p>City Care Emergency Hospital • OP Desk #4 • Permanent Aadhaar Health Record Access</p>
          </div>
        </div>
        <span className={`badge ${user.role === 'Receptionist' ? 'badge-amber' : 'badge-emerald'}`}>
          {user.role === 'Receptionist' ? 'RECEPTION DESK ACTIVE' : 'ON DUTY'}
        </span>
      </div>

      {/* Receptionist / Doctor Aadhaar Patient Record Finder */}
      <div className="aadhar-search-panel glass-panel">
        <div className="panel-title-row">
          <CreditCard size={20} color="#059669" />
          <h3>Instant Patient Lookup by 12-Digit Aadhaar Card Number</h3>
        </div>
        <form onSubmit={handleAadharSearch} className="aadhar-search-form">
          <div className="search-input-wrap">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              pattern="[0-9]*"
              value={searchAadhar}
              onChange={e => setSearchAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="Enter Patient 12-Digit Aadhaar No"
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            <span>Search Patient EHR</span>
          </button>
        </form>

        {searchedPatient && (
          <div className="patient-found-box glass-card fade-in">
            <div className="patient-basic-header">
              <div>
                <span className="badge badge-emerald"><ShieldCheck size={12} /> VERIFIED AADHAAR HEALTH ID</span>
                <h2>{searchedPatient.name}</h2>
                <p>Aadhaar: <strong>{searchedPatient.aadharNumber}</strong> • {searchedPatient.gender}, {searchedPatient.age} yrs • Blood Group: <strong>{searchedPatient.bloodGroup}</strong></p>
              </div>
            </div>

            <div className="patient-precautions-row">
              <div className="precaution-box bg-amber-soft">
                <h4><AlertTriangle size={15} color="#d97706" /> Patient Medical Precautions</h4>
                <ul>
                  {searchedPatient.precautions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="precaution-box bg-sky-soft">
                <h4><FileText size={15} color="#0284c7" /> Active Medicine Schedule Alerts</h4>
                <ul>
                  {searchedPatient.medicineAlerts.map(m => (
                    <li key={m.id}><strong>{m.name}</strong> - {m.dose} ({m.timing})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Live Queue & Active Consultation */}
      <div className="doc-main-grid">
        {/* Waiting Queue List */}
        <div className="queue-panel glass-panel">
          <div className="panel-title-row">
            <Users size={20} color="#38bdf8" />
            <h3>Outpatient Waiting Queue ({activeQueue.length})</h3>
          </div>

          <div className="queue-list">
            {activeQueue.map(p => (
              <div key={p.id} className={`queue-patient-card glass-card ${p.status === 'IN_ROOM' ? 'in-room' : ''}`}>
                <div className="p-token-box">
                  <span className="lbl">TOKEN</span>
                  <span className="num">#{p.token}</span>
                </div>

                <div className="p-details">
                  <h4>{p.name}</h4>
                  <p>Aadhaar: <strong>{p.aadhar}</strong></p>
                  <p>{p.gender}, {p.age} yrs • Reason: <strong>{p.reason}</strong></p>
                  <span className={`badge ${p.status === 'IN_ROOM' ? 'badge-emerald' : 'badge-sky'}`}>
                    {p.status === 'IN_ROOM' ? 'Currently Consulting' : 'In Waiting Line'}
                  </span>
                </div>

                {p.status === 'WAITING' ? (
                  <button className="btn btn-primary btn-sm" onClick={() => handleCallPatient(p)}>
                    Call Patient
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowPrescriptionModal(true)}>
                    Issue Rx
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Consultation Workstation */}
        <div className="workstation-panel glass-panel">
          <div className="panel-title-row">
            <UserCheck size={20} color="#10b981" />
            <h3>Active Consultation Workstation</h3>
          </div>

          {currentConsulting ? (
            <div className="consult-active-box fade-in">
              <div className="patient-summary-banner glass-card">
                <span className="badge badge-emerald">IN CONSULTATION ROOM</span>
                <h2>{currentConsulting.name} (Token #{currentConsulting.token})</h2>
                <p>Aadhaar No: <strong>{currentConsulting.aadhar}</strong></p>
                <p>{currentConsulting.gender}, {currentConsulting.age} yrs • Chief Complaint: {currentConsulting.reason}</p>
              </div>

              <button className="btn btn-primary btn-block btn-lg" onClick={() => setShowPrescriptionModal(true)}>
                <FileText size={20} />
                <span>Create Digital Prescription & Complete Visit</span>
              </button>
            </div>
          ) : (
            <div className="no-consult-box">
              <Clock size={36} color="#94a3b8" />
              <h4>No Patient Currently in Room</h4>
              <p>Click "Call Patient" from the waiting queue list to begin a consultation session.</p>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Issue Modal */}
      {showPrescriptionModal && currentConsulting && (
        <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-content glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Digital Prescription Issuer</h3>
            <p className="modal-subtitle">Patient: {currentConsulting.name} (Token #{currentConsulting.token})</p>

            <form onSubmit={handleCompleteConsultation} className="rx-form">
              <label className="form-label">Clinical Diagnosis</label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Upper Respiratory Tract Infection"
                required
              />

              <label className="form-label">Prescribed Medications & Dosage</label>
              <textarea
                className="form-input textarea"
                value={medicines}
                onChange={e => setMedicines(e.target.value)}
                rows={5}
                required
              />

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPrescriptionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} />
                  <span>Issue Prescription & Sync EHR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .doctor-dashboard-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .doc-header-card {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .doc-profile-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(2, 132, 199, 0.15);
          border: 1px solid rgba(2, 132, 199, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doc-profile-row h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .doc-profile-row p {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .doc-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 840px) {
          .doc-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .queue-panel, .workstation-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .panel-title-row h3 {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .queue-patient-card {
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .queue-patient-card.in-room {
          border-color: var(--primary);
          background: rgba(16, 185, 129, 0.1);
        }

        .p-token-box {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 8px 12px;
          text-align: center;
        }

        .p-token-box .lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          display: block;
        }

        .p-token-box .num {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .p-details {
          flex: 1;
        }

        .p-details h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .p-details p {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .consult-active-box {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .patient-summary-banner {
          padding: 24px;
          text-align: center;
        }

        .patient-summary-banner h2 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 10px 0 4px;
        }

        .patient-summary-banner p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .no-consult-box {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-muted);
        }

        .rx-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }

        .rx-form .textarea {
          min-height: 100px;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .aadhar-search-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .aadhar-search-form {
          display: flex;
          gap: 12px;
        }

        .search-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 12px;
          padding: 0 16px;
        }

        .search-input-wrap input {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .patient-found-box {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .patient-basic-header h2 {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 6px 0 2px;
        }

        .patient-basic-header p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .patient-precautions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 768px) {
          .patient-precautions-row {
            grid-template-columns: 1fr;
          }
        }

        .precaution-box {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid var(--border-dark);
        }

        .bg-amber-soft {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .bg-sky-soft {
          background: rgba(2, 132, 199, 0.08);
          border-color: rgba(2, 132, 199, 0.3);
        }

        .precaution-box h4 {
          font-size: 0.88rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .precaution-box ul {
          list-style: disc inside;
          font-size: 0.82rem;
          color: var(--text-sub);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
