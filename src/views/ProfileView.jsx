import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Phone, ShieldCheck, Heart, AlertTriangle, FileText, QrCode, Edit3, Plus, CheckCircle2, UserPlus, LogOut } from 'lucide-react';

export const ProfileView = () => {
  const { user, updateUserProfile, logout } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [age, setAge] = useState(user.age);
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup);
  const [location, setLocation] = useState(user.location);

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('Family');
  const [cPhone, setCPhone] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({ name, phone, age, bloodGroup, location });
    setIsEditing(false);
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!cName || !cPhone) return;
    const newContact = { id: Date.now(), name: cName, relation: cRel, phone: cPhone };
    updateUserProfile({
      emergencyContacts: [...user.emergencyContacts, newContact]
    });
    setShowAddContactModal(false);
    setCName('');
    setCPhone('');
  };

  return (
    <div className="profile-view-container fade-in">
      {/* Patient Emergency ID Card */}
      <div className="profile-card glass-panel">
        <div className="profile-top">
          <div className="avatar-large">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="p-header-info">
            <span className="badge badge-emerald">DIGITAL MEDICAL ID</span>
            <h2>{user.name}</h2>
            <p>{user.gender}, {user.age} yrs • {user.cityVillage || user.location} ({user.pincode || '522601'})</p>
            <p className="med-id-tag">Aadhaar No: <strong>{user.aadharNumber || '5892 4103 7621'}</strong> • ID: <strong>{user.medicalId}</strong></p>
            <p className="med-id-tag text-muted" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
              Aadhaar Address: {user.address || 'Door No 4-12, Main Road, Palnadu District, Narasaraopet'}
            </p>
          </div>

          <div className="profile-header-btns">
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit3 size={16} />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <button className="btn btn-danger-soft btn-sm" onClick={logout} title="Logout Account">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {isEditing && (
          <form onSubmit={handleSaveProfile} className="edit-profile-form fade-in">
            <div className="form-grid">
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Aadhaar Card Number</label>
                <input type="text" className="form-input" value={user.aadharNumber || '5892 4103 7621'} disabled readOnly />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
            </div>
            <div className="edit-form-action-row">
              <button type="submit" className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Profile Changes</span>
              </button>
              <button type="button" className="btn btn-danger-soft" onClick={logout}>
                <LogOut size={16} />
                <span>Logout Account</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Emergency Medical Badges */}
      <div className="medical-flags-grid">
        <div className="flag-card glass-card">
          <div className="flag-icon bg-red">
            <Heart size={22} color="#ef4444" />
          </div>
          <div>
            <span className="lbl">Blood Group</span>
            <span className="val">{user.bloodGroup}</span>
          </div>
        </div>

        <div className="flag-card glass-card">
          <div className="flag-icon bg-amber">
            <AlertTriangle size={22} color="#f59e0b" />
          </div>
          <div>
            <span className="lbl">Known Allergies</span>
            <span className="val">{Array.isArray(user.allergies) ? user.allergies.join(', ') : (user.allergies || 'None')}</span>
          </div>
        </div>

        <div className="flag-card glass-card">
          <div className="flag-icon bg-sky">
            <ShieldCheck size={22} color="#0284c7" />
          </div>
          <div>
            <span className="lbl">Aadhaar Health ID</span>
            <span className="val-sm">{user.aadharNumber || '5892 4103 7621'}</span>
          </div>
        </div>
      </div>

      {/* Patient Precautions & Active Medicine Alerts Section */}
      <div className="precautions-alerts-grid">
        <div className="precautions-card glass-panel">
          <div className="title-row">
            <AlertTriangle size={20} color="#f59e0b" />
            <h3>Medical Precautions for Patient</h3>
          </div>
          <ul className="precautions-list">
            {(user.precautions || [
              'Avoid NSAID pain relievers due to mild gastritis history.',
              'Maintain daily hydration (>3L/day) for high uric acid prevention.',
              'Monitor blood pressure weekly.'
            ]).map((p, idx) => (
              <li key={idx}>
                <ShieldCheck size={16} color="#059669" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="alerts-card glass-panel">
          <div className="title-row">
            <FileText size={20} color="#0284c7" />
            <h3>Active Medicine Schedule Alerts</h3>
          </div>
          <div className="alerts-list">
            {(user.medicineAlerts || [
              { id: 1, name: 'Cetirizine 10mg', timing: '09:00 PM (Bedtime)', dose: '1 Tablet after dinner' },
              { id: 2, name: 'Multivitamin Complex', timing: '09:30 AM (Morning)', dose: '1 Capsule after breakfast' }
            ]).map((med) => (
              <div key={med.id} className="med-alert-item glass-card">
                <div>
                  <h4>{med.name}</h4>
                  <p>{med.dose} • <strong>{med.timing}</strong></p>
                </div>
                <span className="badge badge-emerald">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="contacts-section glass-panel">
        <div className="section-title-row">
          <div className="title-left">
            <Phone size={20} color="#ef4444" />
            <h3>Emergency Contacts (SMS Broadcasters)</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddContactModal(true)}>
            <UserPlus size={16} />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="contacts-list-grid">
          {user.emergencyContacts.map(c => (
            <div key={c.id} className="contact-card glass-card">
              <div>
                <h4>{c.name}</h4>
                <p>{c.relation} • {c.phone}</p>
              </div>
              <a href={`tel:${c.phone}`} className="btn btn-secondary btn-sm">Call</a>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <h3>Add Emergency Contact</h3>
            <p className="modal-subtitle">Will receive automated SMS alerts during Emergency SOS activations.</p>

            <form onSubmit={handleAddContactSubmit} className="add-contact-form">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={cName}
                onChange={e => setCName(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                required
              />

              <label className="form-label">Relationship</label>
              <select className="form-input" value={cRel} onChange={e => setCRel(e.target.value)}>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Primary Care Physician">Primary Care Physician</option>
                <option value="Friend">Friend</option>
              </select>

              <label className="form-label">Mobile Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={cPhone}
                onChange={e => setCPhone(e.target.value)}
                placeholder="+91 9812345678"
                required
              />

              <div className="modal-footer-btns">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddContactModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Save Contact</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .profile-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .profile-card {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .profile-top {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #fff;
          font-weight: 800;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.2);
        }

        .p-header-info {
          flex: 1;
        }

        .p-header-info h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 6px 0 2px;
        }

        .p-header-info p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .med-id-tag {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-sub) !important;
          margin-top: 4px;
        }

        .edit-profile-form {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .form-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-sub);
          display: block;
          margin-bottom: 6px;
        }

        .form-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          color: var(--text-main);
          font-size: 0.92rem;
          outline: none;
          width: 100%;
        }

        .medical-flags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .flag-card {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .flag-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-red { background: rgba(239, 68, 68, 0.12); }
        .bg-amber { background: rgba(245, 158, 11, 0.12); }
        .bg-sky { background: rgba(2, 132, 199, 0.12); }

        .flag-card .lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: block;
        }

        .flag-card .val {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .flag-card .val-sm {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .contacts-section {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-left h3 {
          font-size: 1.1rem;
          font-weight: 800;
        }

        .contacts-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px;
        }

        .contact-card {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .contact-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .contact-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .add-contact-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }

        .profile-header-btns {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .edit-form-action-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }

        .btn-danger-soft {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-danger-soft:hover {
          background: rgba(239, 68, 68, 0.18);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .precautions-alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .precautions-card, .alerts-card {
          padding: 24px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .title-row h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .precautions-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .precautions-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
          color: var(--text-sub);
          background: #f8fafc;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .med-alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
        }

        .med-alert-item h4 {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .med-alert-item p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
