import React, { useState } from 'react';
import { useApp, AADHAAR_DATABASE } from '../context/AppContext';
import { CheckCircle2, UserCheck, Stethoscope, Ambulance, CreditCard, Building2, ShieldCheck, Upload, PhoneCall } from 'lucide-react';

export const OnboardingView = () => {
  const { navigateTo, switchRole, updateUserProfile } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'otp', 'profile'
  const [selectedRole, setSelectedRole] = useState('User');

  // Aadhaar & Doctor / Patient Form State
  const [aadharNumber, setAadharNumber] = useState('5892 4103 7621');
  const [doctorPhone, setDoctorPhone] = useState('98765 43210');
  const [otp, setOtp] = useState(['4', '8', '1', '9']);
  
  // Auto-filled from Aadhaar
  const [fullName, setFullName] = useState('Alex Johnson');
  const [aadhaarAddress, setAadhaarAddress] = useState('Door No 4-12, Main Road, Palnadu District, Narasaraopet');
  
  // Required patient inputs
  const [phoneNumber, setPhoneNumber] = useState('+91 9876543210');
  const [age, setAge] = useState('28');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [gender, setGender] = useState('MALE');
  const [cityVillage, setCityVillage] = useState('Narasaraopet');
  const [pinCode, setPinCode] = useState('522601');
  
  // File & Optional
  const [medicalReportName, setMedicalReportName] = useState('Previous_Doctor_Prescription_Report.pdf');
  const [allergiesText, setAllergiesText] = useState('Penicillin, Dust, Sulfa drugs');

  const handleAadhaarNumberChange = (val) => {
    setAadharNumber(val);
    // Real-time Aadhaar Auto-Fill
    const cleanNo = val.replace(/\s+/g, '');
    const found = AADHAAR_DATABASE[cleanNo] || AADHAAR_DATABASE[val];
    if (found) {
      setFullName(found.name);
      setAadhaarAddress(found.address);
      setCityVillage(found.city);
      setPinCode(found.pincode);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      // Step 1 -> Step 2 (OTP)
      setAuthMode('otp');
    } else if (authMode === 'otp') {
      // Step 2 -> Step 3 (Profile Completion Form)
      if (selectedRole === 'Doctor' || selectedRole === 'Receptionist' || selectedRole === 'Responder') {
        switchRole(selectedRole);
        updateUserProfile({ phone: selectedRole === 'Doctor' ? doctorPhone : phoneNumber, doctorPhone, aadharNumber });
        navigateTo('doctor-dashboard', true);
      } else {
        setAuthMode('profile');
      }
    } else {
      // Step 3 -> Launch Portal
      const allergiesList = allergiesText ? allergiesText.split(',').map(a => a.trim()).filter(Boolean) : [];
      updateUserProfile({
        name: fullName,
        aadharNumber,
        phone: phoneNumber,
        age: parseInt(age, 10) || 28,
        bloodGroup,
        gender,
        cityVillage,
        pincode: pinCode,
        address: aadhaarAddress,
        location: `${cityVillage}, AP`,
        allergies: allergiesList,
        uploadedReports: [
          { id: Date.now(), name: medicalReportName || 'Patient_Prescription.pdf', date: 'Today', size: '1.8 MB' }
        ]
      });
      switchRole(selectedRole);
      navigateTo('dashboard', true);
    }
  };

  return (
    <div className="onboarding-container fade-in">
      <div className="auth-card glass-panel fade-in">
        <h2 className="modal-title">
          {authMode === 'login' ? 'Care Navigator Universal Login' : authMode === 'otp' ? 'Mobile OTP Verification' : 'Complete Aadhaar User Health Profile'}
        </h2>
        <p className="modal-subtitle">
          {authMode === 'login'
            ? (selectedRole === 'Doctor' ? 'Select your role and enter Doctor\'s Phone Number to proceed.' : 'Select your role and enter 12-digit Aadhaar Card Number to proceed.')
            : authMode === 'otp'
            ? (selectedRole === 'Doctor' ? `Enter 4-digit OTP sent to Doctor's Phone Number (${doctorPhone})` : `Enter 4-digit OTP sent to mobile linked with Aadhaar (${aadharNumber})`)
            : 'Aadhaar identity verified! Complete medical details for universal EHR access.'}
        </p>

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'login' && (
            <>
              <label className="form-label">Select Login Role</label>
              <div className="role-selector-cards role-selector-4">
                <div
                  className={`role-card ${selectedRole === 'User' || selectedRole === 'Patient' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('User')}
                >
                  <UserCheck size={22} color="#10b981" />
                  <span>User</span>
                </div>
                <div
                  className={`role-card ${selectedRole === 'Doctor' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('Doctor')}
                >
                  <Stethoscope size={22} color="#0284c7" />
                  <span>Doctor</span>
                </div>
                <div
                  className={`role-card ${selectedRole === 'Receptionist' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('Receptionist')}
                >
                  <Building2 size={22} color="#f59e0b" />
                  <span>Receptionist</span>
                </div>
                <div
                  className={`role-card ${selectedRole === 'Responder' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('Responder')}
                >
                  <Ambulance size={22} color="#ef4444" />
                  <span>Responder</span>
                </div>
              </div>

              {selectedRole === 'Doctor' ? (
                <>
                  <label className="form-label">Doctor's Phone Number (10 Digits)</label>
                  <div className="input-group">
                    <PhoneCall size={18} color="#0284c7" />
                    <input
                      type="tel"
                      value={doctorPhone}
                      onChange={e => setDoctorPhone(e.target.value)}
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                  <span className="aadhar-help-text" style={{ color: '#0284c7' }}>
                    <ShieldCheck size={13} color="#0284c7" /> Verified Medical Practitioner • Direct Portal Authentication
                  </span>
                </>
              ) : (
                <>
                  <label className="form-label">Aadhaar Card Number (12 Digits)</label>
                  <div className="input-group">
                    <CreditCard size={18} color="#059669" />
                    <input
                      type="text"
                      value={aadharNumber}
                      onChange={e => handleAadhaarNumberChange(e.target.value)}
                      placeholder="5892 4103 7621"
                      required
                    />
                  </div>
                  <span className="aadhar-help-text">
                    <ShieldCheck size={13} color="#059669" /> UIDAI Health ID Linked • Real-time Name & Address Retrieval
                  </span>
                </>
              )}
            </>
          )}

          {authMode === 'otp' && (
            <div className="otp-container">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={e => {
                    const val = e.target.value;
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);
                  }}
                />
              ))}
            </div>
          )}

          {authMode === 'profile' && (
            <div className="profile-completion-grid fade-in">
              <div className="auto-fill-box glass-card">
                <span className="badge badge-emerald"><ShieldCheck size={12} /> Auto-Filled From UIDAI Aadhaar</span>
                <div className="auto-field">
                  <label>User Full Name (From Aadhaar)</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="form-input readonly-input" />
                </div>
                <div className="auto-field">
                  <label>Permanent Address (From Aadhaar)</label>
                  <input type="text" value={aadhaarAddress} onChange={e => setAadhaarAddress(e.target.value)} className="form-input readonly-input" />
                </div>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={gender} onChange={e => setGender(e.target.value)} required>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHERS">OTHERS</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">City / Village</label>
                  <input type="text" className="form-input" value={cityVillage} onChange={e => setCityVillage(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Pin Code</label>
                  <input type="text" className="form-input" value={pinCode} onChange={e => setPinCode(e.target.value)} required />
                </div>
              </div>

              {/* Previous Medical Report & Prescription */}
              <div className="upload-section-box">
                <label className="form-label">Previous Medical Report / Doctor Prescription</label>
                <div className="file-upload-dropzone">
                  <Upload size={20} color="#0284c7" />
                  <div>
                    <strong>{medicalReportName || 'Click or drag file to attach report'}</strong>
                    <p>PDF, JPG, PNG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="file-input-hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setMedicalReportName(e.target.files[0].name);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Optional Allergies */}
              <div>
                <label className="form-label">Known Allergies (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={allergiesText}
                  onChange={e => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Dust, Sulfa drugs"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
            <CheckCircle2 size={18} />
            <span>
              {authMode === 'login'
                ? 'Continue with Aadhaar ID'
                : authMode === 'otp'
                ? 'Verify OTP & Fill Details'
                : 'Save and Submit'}
            </span>
          </button>
        </form>
      </div>

      <style>{`
        .onboarding-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: #f8fafc;
        }

        .auth-card {
          max-width: 580px;
          width: 100%;
          padding: 36px 32px;
          background: #ffffff;
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 24px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 6px;
          color: var(--text-main, #0f172a);
        }

        .modal-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-sub, #334155);
          margin: 16px 0 8px;
          text-align: left;
        }

        .role-selector-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        @media (max-width: 520px) {
          .role-selector-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .role-card {
          background: #f8fafc;
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 12px;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-card span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main, #0f172a);
        }

        .role-card.selected {
          border-color: var(--primary, #0284c7);
          background: rgba(2, 132, 199, 0.08);
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 12px;
          padding: 12px 16px;
        }

        .aadhar-help-text {
          font-size: 0.72rem;
          color: #059669;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
        }

        .input-group input {
          background: none;
          border: none;
          color: var(--text-main, #0f172a);
          font-size: 1rem;
          outline: none;
          width: 100%;
        }

        .otp-container {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 20px 0;
        }

        .otp-input {
          width: 52px;
          height: 60px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid var(--border-light, #e2e8f0);
          color: var(--primary, #0284c7);
        }

        .btn-block {
          width: 100%;
        }

        .profile-completion-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .auto-fill-box {
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 16px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auto-field label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #047857;
          display: block;
          margin-bottom: 4px;
        }

        .readonly-input {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
          font-weight: 700;
          color: var(--text-main, #0f172a);
        }

        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 580px) {
          .form-grid-2col {
            grid-template-columns: 1fr;
          }
        }

        .upload-section-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .file-upload-dropzone {
          position: relative;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .file-upload-dropzone:hover {
          border-color: var(--primary, #0284c7);
          background: rgba(2, 132, 199, 0.05);
        }

        .file-upload-dropzone strong {
          font-size: 0.88rem;
          color: var(--text-main, #0f172a);
          display: block;
        }

        .file-upload-dropzone p {
          font-size: 0.74rem;
          color: var(--text-muted, #64748b);
        }

        .file-input-hidden {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

