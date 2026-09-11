import React, { useState } from 'react';
import { useApp, AADHAAR_DATABASE } from '../context/AppContext';
import { CheckCircle2, UserCheck, Stethoscope, Ambulance, CreditCard, Building2, ShieldCheck, Upload, PhoneCall, ArrowLeft, Mail, Award, Siren, Fingerprint, BadgeCheck, AlertTriangle } from 'lucide-react';

export const OnboardingView = () => {
  const { navigateTo, switchRole, updateUserProfile, setIsLoggedIn } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'otp', 'profile'
  const [selectedRole, setSelectedRole] = useState('User');
  const [errorMsg, setErrorMsg] = useState('');
  const [inputError, setInputError] = useState(false);

  // Role Specific Credentials State
  const [uniqueId, setUniqueId] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [doctorId, setDoctorId] = useState('DOC-9082-AP');
  const [receptionistGmail, setReceptionistGmail] = useState('reception.narasaraopet@gmail.com');
  const [responderPhone, setResponderPhone] = useState('+91 98765 10800');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(10);
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinTimer, setPinTimer] = useState(8);
  const [pinAutoFilled, setPinAutoFilled] = useState(false);

  React.useEffect(() => {
    let interval;
    if (authMode === 'otp' && !otpAutoFilled) {
      setOtpTimer(10);
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setOtp(['4', '8', '1', '9']);
            setOtpAutoFilled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, otpAutoFilled]);

  React.useEffect(() => {
    let interval;
    if (authMode === 'pin' && !pinAutoFilled) {
      setPinTimer(8);
      interval = setInterval(() => {
        setPinTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPin(['1', '2', '3', '4']);
            setPinAutoFilled(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, pinAutoFilled]);

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
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    setAadharNumber(digitsOnly);
    // Real-time Aadhaar Auto-Fill
    const cleanNo = digitsOnly;
    const found = AADHAAR_DATABASE[cleanNo] || AADHAAR_DATABASE[val];
    if (found) {
      setFullName(found.name);
      setAadhaarAddress(found.address);
      setCityVillage(found.city);
      setPinCode(found.pincode);
    }
  };

  const handleUniqueIdChange = (val) => {
    setErrorMsg('');
    setInputError(false);
    const hasLetters = /[a-zA-Z@\-]/.test(val);
    const isSpecialRole = hasLetters || val.toLowerCase().includes('doc') || val.toLowerCase().includes('care-') || val.includes('@');
    let processed = val;
    if (!isSpecialRole) {
      processed = val.replace(/\D/g, '').slice(0, 12);
    }
    setUniqueId(processed);
    const clean = processed.trim();
    const digitsOnly = clean.replace(/\D/g, '');

    if (!isSpecialRole && digitsOnly.length > 0 && digitsOnly.length !== 10 && digitsOnly.length !== 12) {
      setInputError(true);
    } else {
      setInputError(false);
    }

    if (clean.toLowerCase().includes('doc') || clean.toLowerCase().includes('care-')) {
      setSelectedRole('Doctor');
      setDoctorId(clean);
    } else if (clean.includes('@')) {
      setSelectedRole('Receptionist');
      setReceptionistGmail(clean);
    } else if (digitsOnly.length === 10) {
      setSelectedRole('Responder');
      setResponderPhone(clean);
    } else if (digitsOnly.length === 12) {
      setSelectedRole('User');
      setAadharNumber(clean);
      handleAadhaarNumberChange(clean);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      const clean = uniqueId.trim();
      const isDoc = clean.toLowerCase().includes('doc') || clean.toLowerCase().includes('care-');
      const isEmail = clean.includes('@');
      const digitsOnly = clean.replace(/\D/g, '');

      if (!isDoc && !isEmail) {
        if (!clean || digitsOnly.length === 0) {
          setErrorMsg('❌ Please enter a valid 10-digit Mobile Number or 12-digit Aadhaar Card Number.');
          return;
        }

        if (digitsOnly.length !== 10 && digitsOnly.length !== 12) {
          setInputError(true);
          return;
        }

        if (digitsOnly.length === 10) {
          setSelectedRole('Responder');
          setResponderPhone(digitsOnly);
        } else if (digitsOnly.length === 12) {
          setSelectedRole('User');
          setAadharNumber(digitsOnly);
          handleAadhaarNumberChange(digitsOnly);
        }
      } else if (isDoc) {
        setSelectedRole('Doctor');
        setDoctorId(clean);
      } else if (isEmail) {
        setSelectedRole('Receptionist');
        setReceptionistGmail(clean);
      }

      setErrorMsg('');
      if (isEmail) {
        setPin(['', '', '', '']);
        setPinAutoFilled(false);
        setPinTimer(8);
        setAuthMode('pin');
      } else {
        setOtp(['', '', '', '']);
        setOtpAutoFilled(false);
        setOtpTimer(10);
        setAuthMode('otp');
      }
    } else if (authMode === 'otp') {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 4 || otp.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit OTP code before launching the app home page.');
        return;
      }

      setErrorMsg('');
      setIsLoggedIn(true);

      if (selectedRole === 'Doctor' || selectedRole === 'Responder') {
        switchRole(selectedRole);
        updateUserProfile({ 
          phone: selectedRole === 'Responder' ? uniqueId : phoneNumber, 
          doctorId: uniqueId,
          responderPhone: uniqueId,
          aadharNumber: uniqueId || aadharNumber 
        });
        navigateTo('doctor-dashboard', true);
      } else {
        const cleanNo = (uniqueId || aadharNumber).replace(/\D/g, '');
        const found = AADHAAR_DATABASE[cleanNo] || AADHAAR_DATABASE['589241037621'];
        updateUserProfile({
          name: found ? found.name : fullName,
          aadharNumber: uniqueId || aadharNumber,
          gender: found ? found.gender : 'MALE',
          address: found ? found.address : aadhaarAddress,
          cityVillage: found ? found.city : cityVillage,
          pincode: found ? found.pincode : pinCode,
          location: found ? `${found.city}, AP` : `${cityVillage}, AP`,
          phone: phoneNumber,
          age: '', 
          bloodGroup: '', 
          prescriptionReport: null,
          uploadedReports: []
        });
        switchRole('User');
        navigateTo('dashboard', true);
      }
    } else if (authMode === 'pin') {
      const enteredPin = pin.join('');
      if (enteredPin.length < 4 || pin.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit PIN before proceeding.');
        return;
      }

      setErrorMsg('');
      setIsLoggedIn(true);
      switchRole('Receptionist');
      updateUserProfile({ 
        phone: phoneNumber, 
        receptionistGmail: uniqueId,
        aadharNumber: uniqueId || aadharNumber 
      });
      navigateTo('doctor-dashboard', true);
    }
  };

  return (
    <div className="onboarding-container fade-in">
      <div className="auth-card glass-panel fade-in">
        <h2 className="modal-title">
          {authMode === 'login' ? 'Care Navigator Aadhaar Login' : authMode === 'pin' ? 'Receptionist PIN Verification' : 'Aadhaar Phone OTP Verification'}
        </h2>
        <p className="modal-subtitle">
          {authMode === 'login'
            ? 'Enter your 12-digit Aadhaar Card Number to send verification OTP to registered mobile phone.'
            : authMode === 'pin'
              ? `Enter your 4-digit security PIN for ${receptionistGmail}`
              : `Enter 4-digit verification code sent via SMS to your Aadhaar-linked Mobile Phone (${phoneNumber || '+91 98765 43210'})`}
        </p>

        {errorMsg && (
          <div 
            className="auth-error-alert fade-in"
            style={{
              background: '#fef2f2',
              border: '1.5px solid #f87171',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '14px',
              fontSize: '0.86rem',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'login' && (
            <>
              <label className="form-label">12-Digit Aadhaar Number / Universal ID</label>
              <div className={`input-group${inputError ? ' input-error' : ''}`}>
                <CreditCard size={18} color={inputError ? '#dc2626' : '#0284c7'} />
                <input
                  type="text"
                  inputMode="numeric"
                  value={uniqueId}
                  onChange={e => handleUniqueIdChange(e.target.value)}
                  placeholder="Enter 12-Digit Aadhaar or 10-Digit Phone"
                  required
                />
              </div>
              <span className="aadhar-help-text" style={{ color: '#0284c7' }}>
                <ShieldCheck size={13} color="#0284c7" /> SMS OTP will be sent to your linked Phone Number. Accepts 10-Digit Mobile or 12-Digit Aadhaar.
              </span>
            </>
          )}

          {authMode === 'otp' && (
            <>
              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={e => {
                      setErrorMsg('');
                      const val = e.target.value;
                      const newOtp = [...otp];
                      newOtp[idx] = val;
                      setOtp(newOtp);
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.85rem', color: '#64748b' }}>
                {!otpAutoFilled ? (
                  <span>📱 Waiting for SMS OTP... Auto-displaying code in <strong>{otpTimer}s</strong></span>
                ) : (
                  <span style={{ color: '#059669', fontWeight: '700' }}>✓ SMS OTP Code Received & Auto-Filled</span>
                )}
              </div>
            </>
          )}

          {authMode === 'pin' && (
            <>
              <div className="otp-container">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    type="password"
                    maxLength="1"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={e => {
                      setErrorMsg('');
                      const val = e.target.value;
                      const newPin = [...pin];
                      newPin[idx] = val;
                      setPin(newPin);
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.85rem', color: '#64748b' }}>
                {!pinAutoFilled ? (
                  <span>🔐 Verifying credentials... Auto-filling PIN in <strong>{pinTimer}s</strong></span>
                ) : (
                  <span style={{ color: '#059669', fontWeight: '700' }}>✓ PIN Verified & Auto-Filled</span>
                )}
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
            <CheckCircle2 size={18} />
            <span>
              {authMode === 'login'
                ? 'Send OTP to Linked Phone Number'
                : authMode === 'pin'
                  ? 'Verify PIN & Launch Receptionist Panel'
                  : 'Verify OTP & Launch Home Page'}
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
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          position: relative;
        }

        .role-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .role-card-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }

        .role-card.role-user .role-card-icon-wrapper {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
        }

        .role-card.role-doctor .role-card-icon-wrapper {
          background: linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(8, 145, 178, 0.25) 100%);
          border: 1px solid rgba(2, 132, 199, 0.35);
          color: #0284c7;
        }

        .role-card.role-receptionist .role-card-icon-wrapper {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #d97706;
        }

        .role-card.role-responder .role-card-icon-wrapper {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #dc2626;
        }

        .role-card span {
          font-size: 0.78rem;
          font-weight: 700;
          color: #334155;
        }

        .role-card.role-user.selected {
          border-color: #10b981;
          background: #ecfdf5;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
        }

        .role-card.role-doctor.selected {
          border-color: #0284c7;
          background: #f0f9ff;
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.2);
        }

        .role-card.role-receptionist.selected {
          border-color: #f59e0b;
          background: #fffbeb;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2);
        }

        .role-card.role-responder.selected {
          border-color: #ef4444;
          background: #fef2f2;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.2);
        }

        .role-card.selected .role-card-icon-wrapper {
          transform: scale(1.08);
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid var(--border-light, #e2e8f0);
          border-radius: 12px;
          padding: 12px 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .input-group.input-error {
          border-color: #dc2626;
          background: #fef2f2;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .input-group.input-error input {
          color: #991b1b;
        }

        .input-group.input-error input::placeholder {
          color: #fca5a5;
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

