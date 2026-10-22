import React, { useState } from 'react';
import { useApp, AADHAAR_DATABASE } from '../context/AppContext';
import { CheckCircle2, UserCheck, Stethoscope, Ambulance, CreditCard, Building2, ShieldCheck, Upload, PhoneCall, Mail, Award, Siren, Fingerprint, BadgeCheck, AlertTriangle } from 'lucide-react';

export const OnboardingView = () => {
  const { navigateTo, switchRole, updateUserProfile, setIsLoggedIn, loginWithAccount, lookupAccount } = useApp();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'otp', 'profile'
  const [selectedRole, setSelectedRole] = useState('User');
  const [errorMsg, setErrorMsg] = useState('');
  const [inputError, setInputError] = useState(false);

  // Role Specific Credentials State
  const [uniqueId, setUniqueId] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [doctorId, setDoctorId] = useState('DOCTOR-001');
  const [receptionistGmail, setReceptionistGmail] = useState('reception.narasaraopet@gmail.com');
  const [responderPhone, setResponderPhone] = useState('+91 98765 10800');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = React.useRef([]);

  React.useEffect(() => {
    if (authMode === 'pin') {
      const timer = setTimeout(() => {
        pinInputRefs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [authMode]);

  const handlePinChange = (val, idx) => {
    setErrorMsg('');
    const cleanDigits = val.replace(/\D/g, '');

    if (cleanDigits.length > 1) {
      const pasted = cleanDigits.slice(0, 4).split('');
      const updated = [...pin];
      pasted.forEach((d, i) => {
        if (i < 4) updated[i] = d;
      });
      setPin(updated);
      const nextIdx = Math.min(pasted.length, 3);
      if (pinInputRefs.current[nextIdx]) {
        pinInputRefs.current[nextIdx].focus();
      }
      return;
    }

    const single = cleanDigits.slice(-1);
    const newPin = [...pin];
    newPin[idx] = single;
    setPin(newPin);

    if (single && idx < 3) {
      if (pinInputRefs.current[idx + 1]) {
        pinInputRefs.current[idx + 1].focus();
      }
    }
  };

  const handlePinKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!pin[idx] && idx > 0) {
        const newPin = [...pin];
        newPin[idx - 1] = '';
        setPin(newPin);
        if (pinInputRefs.current[idx - 1]) {
          pinInputRefs.current[idx - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      if (pinInputRefs.current[idx - 1]) pinInputRefs.current[idx - 1].focus();
    } else if (e.key === 'ArrowRight' && idx < 3) {
      if (pinInputRefs.current[idx + 1]) pinInputRefs.current[idx + 1].focus();
    }
  };


  // Auto-filled from Aadhaar
  const [fullName, setFullName] = useState('');
  const [aadhaarAddress, setAadhaarAddress] = useState('');
  
  // Required patient inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('MALE');
  const [cityVillage, setCityVillage] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // File & Optional
  const [medicalReportName, setMedicalReportName] = useState('Previous_Doctor_Prescription_Report.pdf');
  const [allergiesText, setAllergiesText] = useState('Penicillin, Dust, Sulfa drugs');

  const handleAadhaarNumberChange = (val) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    setAadharNumber(digitsOnly);
    
    // Check if account already exists in DB
    const saved = lookupAccount ? lookupAccount(digitsOnly) : null;
    if (saved) {
      if (saved.name) setFullName(saved.name);
      if (saved.address) setAadhaarAddress(saved.address);
      if (saved.cityVillage || saved.city) setCityVillage(saved.cityVillage || saved.city);
      if (saved.pincode) setPinCode(saved.pincode);
      if (saved.phone) setPhoneNumber(saved.phone);
      if (saved.age) setAge(saved.age);
      if (saved.bloodGroup) setBloodGroup(saved.bloodGroup);
      if (saved.gender) setGender(saved.gender);
    } else {
      // Real-time Aadhaar Auto-Fill from base database
      const cleanNo = digitsOnly;
      const found = AADHAAR_DATABASE[cleanNo] || AADHAAR_DATABASE[val];
      if (found) {
        setFullName(found.name);
        setAadhaarAddress(found.address);
        setCityVillage(found.city);
        setPinCode(found.pincode);
        if (found.gender) setGender(found.gender);
        if (found.age) setAge(found.age);
        if (found.bloodGroup) setBloodGroup(found.bloodGroup);
      } else {
        setFullName('');
        setAadhaarAddress('');
        setCityVillage('');
        setPinCode('');
        setAge('');
        setBloodGroup('');
        setGender('MALE');
      }
    }
  };

  const handleUniqueIdChange = (val) => {
    setErrorMsg('');
    setInputError(false);
    const hasLetters = /[a-zA-Z@\-]/.test(val);
    const isDocMatch = val.toLowerCase().includes('doc') || val.toLowerCase().includes('care-') || val.toLowerCase().startsWith('dr') || val.toLowerCase().includes('doctor');
    const isSpecialRole = hasLetters || isDocMatch || val.includes('@');
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

    // Check if account already exists in DB for this credential
    const saved = lookupAccount ? lookupAccount(clean) : null;
    if (saved) {
      if (saved.role === 'Doctor') {
        setSelectedRole('Doctor');
        setDoctorId(saved.doctorId || clean);
        return;
      } else if (saved.role === 'Receptionist') {
        setSelectedRole('Receptionist');
        setReceptionistGmail(saved.receptionistGmail || clean);
        return;
      } else if (saved.role === 'Responder' || saved.role === 'Driver' || digitsOnly.length === 10) {
        setSelectedRole('Responder');
        setPhoneNumber(saved.phone || `+91 ${digitsOnly}`);
        return;
      } else {
        setSelectedRole('User');
        if (saved.name) setFullName(saved.name);
        if (saved.address) setAadhaarAddress(saved.address);
        if (saved.cityVillage || saved.city) setCityVillage(saved.cityVillage || saved.city);
        if (saved.pincode) setPinCode(saved.pincode);
        if (saved.phone) setPhoneNumber(saved.phone);
        if (saved.age) setAge(saved.age);
        if (saved.bloodGroup) setBloodGroup(saved.bloodGroup);
        if (saved.gender) setGender(saved.gender);
        if (saved.aadharNumber) setAadharNumber(saved.aadharNumber);
        return;
      }
    }

    if (isDocMatch) {
      setSelectedRole('Doctor');
      setDoctorId(clean);
    } else if (clean.includes('@')) {
      setSelectedRole('Receptionist');
      setReceptionistGmail(clean);
    } else if (digitsOnly.length === 10) {
      setSelectedRole('Responder');
      setPhoneNumber(`+91 ${digitsOnly}`);
      setFullName('');
      setAadhaarAddress('');
      setCityVillage('');
      setPinCode('');
      setAge('');
      setBloodGroup('');
      setGender('MALE');
      setAadharNumber('');
    } else if (digitsOnly.length === 12) {
      setSelectedRole('User');
      setAadharNumber(clean);
      handleAadhaarNumberChange(clean);
    } else {
      setSelectedRole('User');
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      const clean = uniqueId.trim();
      const isDoc = clean.toLowerCase().includes('doc') || clean.toLowerCase().includes('care-') || clean.toLowerCase().startsWith('dr') || clean.toLowerCase().includes('doctor');
      const isEmail = clean.includes('@');
      const digitsOnly = clean.replace(/\D/g, '');

      if (!isDoc && !isEmail) {
        if (!clean || digitsOnly.length === 0) {
          setErrorMsg('❌ Please enter a valid 10-digit Mobile Number or 12-digit Aadhaar Card Number.');
          return;
        }

        if (digitsOnly.length !== 10 && digitsOnly.length !== 12) {
          setInputError(true);
          setErrorMsg('❌ Input must be a 10-digit Mobile Phone Number or 12-digit Aadhaar Card Number.');
          return;
        }

        if (digitsOnly.length === 10) {
          setSelectedRole('Responder');
          setPhoneNumber(`+91 ${digitsOnly}`);
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
      setPin(['', '', '', '']);
      setAuthMode('pin');
    } else if (authMode === 'pin') {
      const enteredPin = pin.join('');
      if (enteredPin.length < 4 || pin.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit security PIN before proceeding.');
        return;
      }

      setErrorMsg('');

      if (selectedRole === 'Doctor') {
        const docId = uniqueId || doctorId || 'DOCTOR-001';
        if (loginWithAccount) {
          loginWithAccount(docId, 'Doctor', {
            name: 'Dr. Raghavendra',
            specialty: 'General Physician',
            phone: phoneNumber || '+91 94401 23456', 
            doctorId: docId,
            photo: '/doctor_raghavendra.jpg'
          });
        }
        navigateTo('doctor-dashboard', true);
      } else if (selectedRole === 'Receptionist') {
        const recEmail = uniqueId || receptionistGmail || 'reception.narasaraopet@gmail.com';
        if (loginWithAccount) {
          loginWithAccount(recEmail, 'Receptionist', {
            phone: phoneNumber, 
            receptionistGmail: recEmail,
            email: recEmail,
            aadharNumber: uniqueId || aadharNumber 
          });
        }
        navigateTo('receptionist-dashboard', true);
      } else if (selectedRole === 'Responder' || (uniqueId && uniqueId.replace(/\D/g, '').length === 10)) {
        const cleanNo = (uniqueId || phoneNumber || '9876510800').replace(/\D/g, '');
        if (loginWithAccount) {
          loginWithAccount(cleanNo, 'Responder', {
            name: fullName || 'Ravi Kumar',
            role: 'Responder',
            driverRole: 'Ambulance Driver / Responder',
            phone: `+91 ${cleanNo}`,
            vehicleNo: 'AP 07 TE 1084',
            vehicleType: 'ALS Advanced Cardiac ICU Fleet #04',
            baseStation: 'Government General Hospital (GGH) Guntur Fleet Hub',
            location: 'Hospital Express Highway • Sector 4',
            isOnline: true
          });
        }
        navigateTo('emergency', true);
      } else {
        const cleanNo = (uniqueId || aadharNumber).replace(/\D/g, '');
        if (cleanNo.length === 10) {
          if (loginWithAccount) {
            loginWithAccount(cleanNo, 'Responder', {
              name: fullName || 'Ravi Kumar',
              role: 'Responder',
              driverRole: 'Ambulance Driver / Responder',
              phone: `+91 ${cleanNo}`,
              vehicleNo: 'AP 07 TE 1084',
              vehicleType: 'ALS Advanced Cardiac ICU Fleet #04',
              baseStation: 'Government General Hospital (GGH) Guntur Fleet Hub',
              location: 'Hospital Express Highway • Sector 4',
              isOnline: true
            });
          }
          navigateTo('emergency', true);
        } else {
          if (loginWithAccount) {
            loginWithAccount(cleanNo, 'Patient', {
              fullName: fullName || '',
              aadhaarAddress: aadhaarAddress || '',
              cityVillage: cityVillage || '',
              pinCode: pinCode || '',
              phoneNumber: phoneNumber || '',
              gender: gender || 'MALE',
              age: age || '',
              bloodGroup: bloodGroup || ''
            });
          }
          navigateTo('dashboard', true);
        }
      }
    }
  };

  const digitsOnlyId = (uniqueId || '').replace(/\D/g, '');
  const is10DigitMobile = selectedRole === 'Responder' || digitsOnlyId.length === 10 || (!aadharNumber && phoneNumber && uniqueId.replace(/\D/g, '').length === 10);
  const displayPhone = is10DigitMobile && digitsOnlyId.length === 10
    ? `+91 ${digitsOnlyId}`
    : (phoneNumber || '+91 98765 10800');

  return (
    <div className="onboarding-container fade-in">
      <div className="auth-card glass-panel fade-in">
        <h2 className="modal-title">
          {authMode === 'login' 
            ? 'Care Navigator Portal Login' 
            : selectedRole === 'Doctor' 
              ? 'Doctor Security PIN Verification' 
              : selectedRole === 'Receptionist' 
                ? 'Receptionist Security PIN Verification'
                : is10DigitMobile 
                  ? '108 Ambulance Driver PIN Verification' 
                  : 'Patient Security PIN Verification'}
        </h2>
        <p className="modal-subtitle">
          {authMode === 'login'
            ? 'Enter your 10-digit Mobile Phone Number, 12-digit Aadhaar Card Number, Doctor ID, or Receptionist Email.'
            : selectedRole === 'Doctor'
              ? `Enter your 4-digit security PIN for Doctor ID (${doctorId || uniqueId || 'DOCTOR-001'})`
              : selectedRole === 'Receptionist'
                ? `Enter your 4-digit security PIN for Receptionist (${receptionistGmail || uniqueId})`
                : is10DigitMobile
                  ? `Enter your 4-digit security PIN for Mobile (${displayPhone}) to open 108 Responder Console`
                  : `Enter your 4-digit security PIN for Aadhaar Card (${uniqueId || aadharNumber})`}
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
              {selectedRole === 'Doctor' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1.5px solid #7dd3fc',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #0284c7',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)',
                    flexShrink: 0
                  }}>
                    <img src="/doctor_raghavendra.jpg" alt="Dr. Raghavendra" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0369a1' }}>Dr. Raghavendra</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>General Physician • Universal ID: <strong style={{ color: '#0284c7' }}>DOCTOR-001</strong></p>
                  </div>
                </div>
              )}

              {is10DigitMobile && selectedRole !== 'Doctor' && selectedRole !== 'Receptionist' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '1.5px solid #f87171',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                    flexShrink: 0
                  }}>
                    <Ambulance size={26} color="#ffffff" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#991b1b' }}>108 Ambulance Responder Detected</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#7f1d1d' }}>Mobile Login • Driver Telemetry & Emergency Command Console</p>
                  </div>
                </div>
              )}

              <label className="form-label">
                {selectedRole === 'Doctor'
                  ? 'Doctor ID / Universal Registration ID'
                  : selectedRole === 'Receptionist'
                    ? 'Receptionist Email Address'
                    : is10DigitMobile
                      ? '10-Digit Mobile Phone Number (Ambulance Responder)'
                      : '10-Digit Mobile Number / 12-Digit Aadhaar Number'}
              </label>
              <div className={`input-group${inputError ? ' input-error' : ''}`}>
                <CreditCard size={18} color={inputError ? '#dc2626' : (is10DigitMobile ? '#dc2626' : '#0284c7')} />
                <input
                  type="text"
                  inputMode={selectedRole === 'Doctor' || selectedRole === 'Receptionist' ? 'text' : 'numeric'}
                  value={uniqueId}
                  onChange={e => handleUniqueIdChange(e.target.value)}
                  placeholder={
                    selectedRole === 'Doctor'
                      ? 'Enter Doctor ID (e.g. DOCTOR-001)'
                      : selectedRole === 'Receptionist'
                        ? 'Enter Receptionist Email'
                        : is10DigitMobile
                          ? 'Enter 10-Digit Mobile Number'
                          : 'Enter 10-Digit Mobile or 12-Digit Aadhaar'
                  }
                  required
                />
              </div>
              <span className="aadhar-help-text" style={{ color: is10DigitMobile ? '#dc2626' : '#0284c7' }}>
                <ShieldCheck size={13} color={is10DigitMobile ? '#dc2626' : '#0284c7'} />
                {selectedRole === 'Doctor'
                  ? 'Doctor credential detected. Proceed with 4-Digit Security PIN.'
                  : selectedRole === 'Receptionist'
                    ? 'Receptionist email detected. Proceed with 4-Digit Security PIN.'
                    : is10DigitMobile
                      ? '10-Digit Mobile Number detected: 108 Ambulance Responder console will open upon PIN verification.'
                      : 'Enter your 10-Digit Mobile (Responder) or 12-Digit Aadhaar (Patient) to proceed with 4-Digit PIN.'}
              </span>
            </>
          )}

          {authMode === 'pin' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: is10DigitMobile ? '#fef2f2' : '#f0f9ff',
                border: `1.5px solid ${is10DigitMobile ? '#fca5a5' : '#bae6fd'}`,
                borderRadius: '12px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color={is10DigitMobile ? '#dc2626' : '#0284c7'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: is10DigitMobile ? '#991b1b' : '#0369a1' }}>
                    Logging in as: <strong>{uniqueId || displayPhone}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setPin(['', '', '', '']);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Change
                </button>
              </div>

              <label className="form-label" style={{ textAlign: 'center', marginBottom: '12px' }}>
                ENTER 4-DIGIT SECURITY PIN
              </label>

              <div className="otp-container">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => pinInputRefs.current[idx] = el}
                    type="password"
                    maxLength="1"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={e => handlePinChange(e.target.value, idx)}
                    onKeyDown={e => handlePinKeyDown(e, idx)}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: '#64748b' }}>
                Default Demo PIN: <strong>1234</strong> (or any 4 digits)
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
            <CheckCircle2 size={18} />
            <span>
              {authMode === 'login'
                ? 'Proceed to 4-Digit Security PIN'
                : selectedRole === 'Doctor'
                  ? 'Verify PIN & Launch Doctor Dashboard'
                  : selectedRole === 'Receptionist'
                    ? 'Verify PIN & Launch Receptionist Panel'
                    : is10DigitMobile
                      ? 'Verify PIN & Open Responder Console'
                      : 'Verify PIN & Launch Patient Portal'}
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
          border: 1.5px solid #cbd5e1;
          color: var(--primary, #0284c7);
          transition: all 0.2s ease;
        }

        .otp-input:focus {
          border-color: #0284c7;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(2, 132, 199, 0.2);
          outline: 2px solid #0284c7;
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

