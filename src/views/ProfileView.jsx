import React, { useState, useEffect } from 'react';
import { useApp, calculateProfileCompletion } from '../context/AppContext';
import { Phone, ShieldCheck, Heart, AlertTriangle, FileText, Edit3, CheckCircle2, UserPlus, LogOut, Upload, Camera, Trash2, X, Sparkles } from 'lucide-react';

export const ProfileView = () => {
  const { user, updateUserProfile, logout } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [reportName, setReportName] = useState(
    user?.prescriptionReport?.name || (user?.uploadedReports?.[0]?.name || '')
  );
  const [isDragOverProfile, setIsDragOverProfile] = useState(false);

  // Sync inputs whenever active user profile changes
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setPhone(user.phone || '');
    setAge(user.age || '');
    setBloodGroup(user.bloodGroup || '');
    setReportName(user.prescriptionReport?.name || (user.uploadedReports?.[0]?.name || ''));
  }, [user]);

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const photoFileInputRef = React.useRef(null);

  const PRESET_AVATARS = [
    { id: 'av-1', label: 'Male Portrait 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=240' },
    { id: 'av-2', label: 'Female Portrait 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=240' },
    { id: 'av-3', label: 'Male Portrait 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240' },
    { id: 'av-4', label: 'Female Portrait 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240' },
    { id: 'av-5', label: 'Senior Citizen', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=240' },
    { id: 'av-6', label: 'Professional Profile', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=240' }
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      updateUserProfile({ photo: dataUrl });
      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    updateUserProfile({ photo: null });
    setShowPhotoModal(false);
  };

  const handleSelectPresetAvatar = (url) => {
    updateUserProfile({ photo: url });
    setShowPhotoModal(false);
  };

  // Close modals on ESC key press
  useEffect(() => {
    if (!showAddContactModal && !showPhotoModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setShowAddContactModal(false);
        setShowPhotoModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [showAddContactModal, showPhotoModal]);
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('Family');
  const [cPhone, setCPhone] = useState('');

  const completionScore = calculateProfileCompletion(user);
  const isComplete = completionScore === 100;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const finalReportName = reportName || 'Doctor_Prescription_Report.pdf';
    updateUserProfile({
      name,
      phone,
      age,
      bloodGroup,
      prescriptionReport: { name: finalReportName, date: 'Today' },
      uploadedReports: [
        { id: Date.now(), name: finalReportName, date: 'Today', size: '1.8 MB' }
      ]
    });
    setIsEditing(false);
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!cName || !cPhone) return;
    const newContact = { id: Date.now(), name: cName, relation: cRel, phone: cPhone };
    updateUserProfile({
      emergencyContacts: [...(user?.emergencyContacts || []), newContact]
    });
    setShowAddContactModal(false);
    setCName('');
    setCPhone('');
  };

  const missingRequirements = [];
  if (!user.age || String(user.age).trim() === '') missingRequirements.push('Age');
  if (!user.bloodGroup || String(user.bloodGroup).trim() === '') missingRequirements.push('Blood Group');
  if (!user.prescriptionReport && (!user.uploadedReports || user.uploadedReports.length === 0)) {
    missingRequirements.push("Doctor's Prescription / Medical Report");
  }

  return (
    <div className="profile-view-container fade-in">
      {/* Patient Emergency ID Card */}
      <div className="profile-card glass-panel">
        <div className="profile-top">
          {/* Avatar DP Container with Circular Completion Ring & Percentage Pencil Badge */}
          <div className="avatar-wrapper" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {/* SVG Circular Progress Ring */}
            <svg width="98" height="98" viewBox="0 0 98 98" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle
                cx="49"
                cy="49"
                r="43"
                stroke="#e2e8f0"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="49"
                cy="49"
                r="43"
                stroke={isComplete ? '#10b981' : '#f59e0b'}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 43}
                strokeDashoffset={(2 * Math.PI * 43) * (1 - completionScore / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
            </svg>

            {/* DP Avatar Circle with Photo / Initials & Edit Option */}
            <div 
              className={`avatar-large ${isComplete ? 'complete-glow' : ''}`}
              onClick={() => setShowPhotoModal(true)}
              title="Click to edit, upload or change profile photo"
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '1.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 2,
                boxShadow: isComplete ? '0 0 20px rgba(16, 185, 129, 0.7), 0 0 40px rgba(16, 185, 129, 0.35)' : 'none',
                border: isComplete ? '3px solid #10b981' : '3px solid #ffffff',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              {user?.photo ? (
                <img 
                  src={user.photo} 
                  alt={user?.name || 'User'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                (user?.name || 'User').split(' ').map(n => n[0]).join('')
              )}

              {/* Hover overlay for quick photo edit */}
              <div className="avatar-hover-overlay">
                <Camera size={18} color="#ffffff" />
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Edit</span>
              </div>
            </div>

            {/* Camera Edit Photo Badge Button */}
            <button
              type="button"
              className="avatar-photo-edit-badge"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              title="Edit Profile Photo"
              aria-label="Edit Profile Photo"
            >
              <Camera size={13} color="#ffffff" />
            </button>

            {/* Percentage & Edit Pencil Badge */}
            <div 
              onClick={() => setIsEditing(!isEditing)}
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-6px',
                zIndex: 3,
                background: isComplete ? '#10b981' : '#f59e0b',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: '900',
                padding: '3px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
                cursor: 'pointer',
                border: '2px solid #ffffff'
              }}
              title={isComplete ? 'Profile 100% Verified' : `Profile ${completionScore}% Complete - Click to Edit`}
            >
              <span>{completionScore}%</span>
              <Edit3 size={11} color="#ffffff" />
            </div>
          </div>
          <div className="p-header-info">
            <h2>{user.name}</h2>
            <p>{user.gender} {user.age ? `• ${user.age} yrs` : ''} • {user.cityVillage || user.location || 'AP'} ({user.pincode || '522601'})</p>
            <p className="med-id-tag">Aadhaar No: <strong>{user.aadharNumber || (user.phone ? `Linked to Mobile (${user.phone})` : 'Registered via Mobile OTP')}</strong></p>
            <p className="med-id-tag text-muted" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
              Address: {user.address || (user.cityVillage ? `${user.cityVillage}, Andhra Pradesh` : 'Registered Online via Phone OTP')}
            </p>
          </div>

          <div className="profile-header-btns">
            <button 
              className="btn-icon-raw" 
              onClick={() => setIsEditing(!isEditing)}
              title={isEditing ? 'Cancel Edit' : 'Complete / Update Profile'}
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={22} color="#0284c7" />
            </button>
            <button 
              className="btn-icon-raw" 
              onClick={logout} 
              title="Logout Account"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={22} color="#dc2626" />
            </button>
          </div>
        </div>

        {/* Profile Details Edit / Completion Form */}
        {(!isComplete || isEditing) && (
          <form onSubmit={handleSaveProfile} className="edit-profile-form fade-in" style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#0284c7" />
              <span>Complete Health Details for 100% Profile Verification</span>
            </h4>

            {/* Readonly Aadhaar Details Box */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '8px', fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> {user.aadharNumber ? 'Auto-Filled From UIDAI Aadhaar' : 'Verified Digital Health Identity'}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.84rem', marginTop: '6px' }}>
                <div><strong>Full Name:</strong> {user.name}</div>
                <div><strong>Aadhaar Card No:</strong> {user.aadharNumber || (user.phone ? `Linked to Mobile (${user.phone})` : 'Not Linked')}</div>
                <div><strong>Gender:</strong> {user.gender}</div>
                <div><strong>Aadhaar Address:</strong> {user.address || (user.cityVillage ? `${user.cityVillage}, Andhra Pradesh` : 'Registered Online via Phone OTP')}</div>
              </div>
            </div>

            <div className="form-grid">
              {/* Profile Photo Edit Option Row */}
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, border: '2px solid #0284c7', flexShrink: 0 }}>
                    {user?.photo ? (
                      <img src={user.photo} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (user?.name || 'User').split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Profile Photo / Image</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.photo ? 'Custom picture uploaded' : 'Default initials avatar'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '7px 14px' }}
                >
                  <Camera size={14} />
                  <span>Edit Photo</span>
                </button>
              </div>
              <div>
                <label className="form-label">User Full Name</label>
                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Aadhaar-Linked Phone Number</label>
                <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">
                  Age <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                  placeholder="Enter your age (e.g. 28)"
                  required 
                />
              </div>
              <div>
                <label className="form-label">
                  Blood Group <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select className="form-input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
                  <option value="">-- Select Blood Group --</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Doctor Prescription Upload Box */}
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <label className="form-label">
                Present / Previous Doctor Prescription or Medical Report <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div 
                className="file-upload-dropzone" 
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverProfile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverProfile(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverProfile(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setReportName(e.dataTransfer.files[0].name);
                  }
                }}
                style={{ 
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '16px', 
                  border: isDragOverProfile ? '2px dashed #0284c7' : '2px dashed #0284c7', 
                  borderRadius: '14px', 
                  background: isDragOverProfile ? 'rgba(2, 132, 199, 0.14)' : 'rgba(2, 132, 199, 0.04)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <Upload size={24} color="#0284c7" />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                    {reportName ? `📎 Attached: ${reportName}` : 'Click or Drag & Drop Doctor Prescription / Medical Report (PDF/JPG)'}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Supports prescription files up to 10MB</p>
                </div>
                <input
                  type="file"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setReportName(e.target.files[0].name);
                    }
                  }}
                  style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }}
                />
              </div>
            </div>

            <div className="edit-form-action-row">
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <CheckCircle2 size={18} />
                <span>Save</span>
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
          {(user?.emergencyContacts || []).map(c => (
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
            <p className="modal-subtitle">Will receive automated SMS alerts during emergency activations.</p>

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

      {/* Hidden File Input for Custom Photo Upload */}
      <input
        type="file"
        ref={photoFileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Edit Profile Photo Modal */}
      {showPhotoModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-content glass-panel fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Update Profile Photo</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Upload custom photo or pick an avatar</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowPhotoModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b', borderRadius: '8px' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Photo Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{
                width: '92px',
                height: '92px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #10b981',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                {user?.photo ? (
                  <img src={user.photo} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user?.name || 'User').split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{user?.name}</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                {user?.photo ? 'Active Custom Profile Picture' : 'Default Initials Profile Avatar'}
              </div>
            </div>

            {/* Upload from Device Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => photoFileInputRef.current?.click()}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                <Upload size={17} />
                <span>Upload Photo from Device / Camera</span>
              </button>

              {user?.photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                >
                  <Trash2 size={16} color="#dc2626" />
                  <span>Remove Custom Photo & Use Initials</span>
                </button>
              )}
            </div>

            {/* Suggested Sample Avatars */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                <Sparkles size={14} color="#0284c7" />
                <span>Or Select from Quick Avatars</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                {PRESET_AVATARS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset.url)}
                    style={{
                      border: user?.photo === preset.url ? '3px solid #0284c7' : '2px solid transparent',
                      padding: '2px',
                      borderRadius: '50%',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: user?.photo === preset.url ? '0 0 10px rgba(2, 132, 199, 0.5)' : 'none'
                    }}
                    title="Click to select this avatar"
                  >
                    <img 
                      src={preset.url} 
                      alt="Preset Avatar" 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
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
          position: relative;
          cursor: pointer;
        }

        .avatar-photo-edit-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          z-index: 4;
          background: #0284c7;
          color: #ffffff;
          border: 2px solid #ffffff;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
        }

        .avatar-photo-edit-badge:hover {
          transform: scale(1.15);
          background: #0369a1;
        }

        .avatar-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 50%;
          z-index: 5;
        }

        .avatar-large:hover .avatar-hover-overlay {
          opacity: 1;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          padding: 24px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(226, 232, 240, 0.8);
          position: relative;
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
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 900px) {
          .medical-flags-grid {
            grid-template-columns: 1fr;
          }
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
          gap: 20px;
          margin-top: 28px;
          margin-bottom: 28px;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .title-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-left h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .contacts-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .contact-card {
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
        }

        .contact-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 6px 16px rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }

        .contact-card h4 {
          font-size: 0.98rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .contact-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .contacts-section {
            padding: 18px;
            margin-top: 20px;
            margin-bottom: 20px;
            gap: 16px;
          }

          .section-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }

          .title-left h3 {
            font-size: 1rem;
            line-height: 1.3;
          }

          .contacts-list-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .contact-card {
            padding: 16px;
            border-radius: 14px;
          }
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
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          .precautions-alerts-grid {
            grid-template-columns: 1fr;
          }
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
