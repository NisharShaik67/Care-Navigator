import React, { useState } from 'react';
import { useApp, AADHAAR_DATABASE } from '../context/AppContext';
import { 
  CheckCircle2, 
  Ambulance, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle,
  Stethoscope,
  Building2,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Zap,
  Key
} from 'lucide-react';

export const OnboardingView = () => {
  const { navigateTo, loginWithAccount, lookupAccount } = useApp();

  const [authMode, setAuthMode] = useState('login'); // 'login', 'otp', 'pin'
  const [selectedRole, setSelectedRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cn_selected_auth_role');
      if (saved === 'Doctor') return 'Doctor';
      if (saved === 'Receptionist') return 'Receptionist';
      if (saved === 'Responder') return 'Responder';
      return 'User';
    } catch {
      return 'User';
    }
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [inputError, setInputError] = useState(false);

  // Role Specific Credentials State
  const [uniqueId, setUniqueId] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cn_selected_auth_role');
      if (saved === 'Doctor') return 'DOCTOR-001';
      if (saved === 'Receptionist') return 'reception.narasaraopet@gmail.com';
      if (saved === 'Responder') return '9876510800';
      return '';
    } catch {
      return '';
    }
  });
  const [aadharNumber, setAadharNumber] = useState('');
  const [doctorId, setDoctorId] = useState('DOCTOR-001');
  const [receptionistGmail, setReceptionistGmail] = useState('reception.narasaraopet@gmail.com');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = React.useRef([]);

  // Aadhaar 12-Digit SMS OTP State (10-Second Auto Arrival)
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(10);
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);
  const otpInputRefs = React.useRef([]);

  // Auto-filled from Aadhaar / Patient credentials
  const [fullName, setFullName] = useState('');
  const [aadhaarAddress, setAadhaarAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('MALE');
  const [cityVillage, setCityVillage] = useState('');
  const [pinCode, setPinCode] = useState('');

  // 10-Second Countdown and Automatic OTP Reception for 12-Digit Aadhaar
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

  // Once OTP is automatically received after 10s, auto-launch patient portal
  React.useEffect(() => {
    if (authMode === 'otp' && otpAutoFilled) {
      const timer = setTimeout(() => {
        const cleanNo = (aadharNumber || uniqueId).replace(/\D/g, '');
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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authMode, otpAutoFilled, aadharNumber, uniqueId, fullName, aadhaarAddress, cityVillage, pinCode, phoneNumber, gender, age, bloodGroup, loginWithAccount, navigateTo]);

  React.useEffect(() => {
    if (authMode === 'otp') {
      const timer = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (authMode === 'pin') {
      const timer = setTimeout(() => {
        pinInputRefs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [authMode]);

  const handleOtpChange = (val, idx) => {
    setErrorMsg('');
    const cleanDigits = val.replace(/\D/g, '');

    if (cleanDigits.length > 1) {
      const pasted = cleanDigits.slice(0, 4).split('');
      const updated = [...otp];
      pasted.forEach((d, i) => {
        if (i < 4) updated[i] = d;
      });
      setOtp(updated);
      const nextIdx = Math.min(pasted.length, 3);
      if (otpInputRefs.current[nextIdx]) {
        otpInputRefs.current[nextIdx].focus();
      }
      return;
    }

    const single = cleanDigits.slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = single;
    setOtp(newOtp);

    if (single && idx < 3) {
      if (otpInputRefs.current[idx + 1]) {
        otpInputRefs.current[idx + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!otp[idx] && idx > 0) {
        const newOtp = [...otp];
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        if (otpInputRefs.current[idx - 1]) {
          otpInputRefs.current[idx - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      if (otpInputRefs.current[idx - 1]) otpInputRefs.current[idx - 1].focus();
    } else if (e.key === 'ArrowRight' && idx < 3) {
      if (otpInputRefs.current[idx + 1]) otpInputRefs.current[idx + 1].focus();
    }
  };

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
    const hasLetters = /[a-zA-Z@-]/.test(val);
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
      } else if (saved.role === 'Responder' || saved.role === 'Driver' || digitsOnly === '9876510800') {
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

    if (clean.toLowerCase().includes('admin') || clean.toLowerCase() === 'director' || clean.toLowerCase() === 'superadmin') {
      setSelectedRole('Admin');
      setUniqueId(clean);
      return;
    }

    if (isDocMatch) {
      setSelectedRole('Doctor');
      setDoctorId(clean);
    } else if (clean.includes('@')) {
      setSelectedRole('Receptionist');
      setReceptionistGmail(clean);
    } else if (digitsOnly === '9876510800' || clean.toLowerCase() === '108' || clean.toLowerCase().includes('responder')) {
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
      const isAdmin = clean.toLowerCase().includes('admin') || clean.toLowerCase() === 'director' || clean.toLowerCase() === 'superadmin';
      const digitsOnly = clean.replace(/\D/g, '');

      if (selectedRole === 'Doctor' || isDoc) {
        setSelectedRole('Doctor');
        setDoctorId(clean || doctorId || 'DOCTOR-001');
        setErrorMsg('');
        setPin(['1', '2', '3', '4']);
        setAuthMode('pin');
        return;
      } else if (selectedRole === 'Receptionist' || isEmail) {
        setSelectedRole('Receptionist');
        setReceptionistGmail(clean || receptionistGmail || 'reception.narasaraopet@gmail.com');
        setErrorMsg('');
        setPin(['1', '2', '3', '4']);
        setAuthMode('pin');
        return;
      } else if (isAdmin) {
        setSelectedRole('Admin');
        setErrorMsg('');
        setPin(['1', '2', '3', '4']);
        setAuthMode('pin');
        return;
      } else {
        if (!clean || digitsOnly.length === 0) {
          setErrorMsg('❌ Please enter a valid 10-digit Mobile Number or 12-digit Aadhaar Card Number.');
          return;
        }

        if (digitsOnly.length !== 10 && digitsOnly.length !== 12) {
          setInputError(true);
          setErrorMsg('❌ Input must be a 10-digit Mobile Phone Number or 12-digit Aadhaar Card Number.');
          return;
        }

        if (digitsOnly.length === 12) {
          // ONLY 12-digit Aadhaar Card Number gets OTP automatically in 10 seconds!
          setSelectedRole('User');
          setAadharNumber(digitsOnly);
          handleAadhaarNumberChange(digitsOnly);
          setErrorMsg('');
          setOtp(['', '', '', '']);
          setOtpTimer(10);
          setOtpAutoFilled(false);
          setAuthMode('otp');
          return;
        }

        if (digitsOnly.length === 10) {
          // 10-digit Mobile Number strictly uses 4-digit security PIN
          setSelectedRole('Responder');
          setPhoneNumber(`+91 ${digitsOnly}`);
          setErrorMsg('');
          setPin(['1', '2', '3', '4']);
          setAuthMode('pin');
          return;
        }
      }
    } else if (authMode === 'otp') {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 4 || otp.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please wait for or enter the complete 4-digit Aadhaar OTP before proceeding.');
        return;
      }

      setErrorMsg('');
      const cleanNo = (aadharNumber || uniqueId).replace(/\D/g, '');
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
      return;
    } else if (authMode === 'pin') {
      const enteredPin = pin.join('');
      if (enteredPin.length < 4 || pin.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit security PIN before proceeding.');
        return;
      }

      setErrorMsg('');

      if (selectedRole === 'Admin' || (uniqueId && uniqueId.toLowerCase().includes('admin'))) {
        if (loginWithAccount) {
          loginWithAccount('acc_admin', 'Super Admin', {
            name: 'Dr. Ramesh Kumar',
            role: 'Super Admin',
            designation: 'Director of Health & Emergency Control',
            phone: '+91 94400 00108',
            email: 'admin.director@carenavigator.ap.gov.in',
            location: 'State Emergency Command Center, Guntur, AP'
          });
        }
        navigateTo('admin', true);
        return;
      }

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
      } else if (selectedRole === 'Responder' || (uniqueId && (uniqueId.replace(/\D/g, '') === '9876510800' || uniqueId.toLowerCase() === '108' || uniqueId.toLowerCase().includes('responder')))) {
        const cleanNo = (uniqueId || phoneNumber || '9876510800').replace(/\D/g, '');
        if (loginWithAccount) {
          loginWithAccount(cleanNo, 'Responder', {
            name: fullName || 'K. Rambabu',
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
        const cleanNo = (uniqueId || aadharNumber || phoneNumber || '').replace(/\D/g, '');
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
  };

  const handleSelectRole = (role) => {
    setErrorMsg('');
    setInputError(false);
    setSelectedRole(role);
    try {
      sessionStorage.setItem('cn_selected_auth_role', role);
    } catch {}

    if (role === 'Doctor') {
      const doc = doctorId || 'DOCTOR-001';
      setUniqueId(doc);
      setDoctorId(doc);
      setPin(['1', '2', '3', '4']);
    } else if (role === 'Receptionist') {
      const rec = receptionistGmail || 'reception.narasaraopet@gmail.com';
      setUniqueId(rec);
      setReceptionistGmail(rec);
      setPin(['1', '2', '3', '4']);
    } else if (role === 'Responder') {
      setUniqueId('9876510800');
      setPhoneNumber('+91 98765 10800');
      setPin(['1', '2', '3', '4']);
    } else {
      setSelectedRole('User');
      setUniqueId(aadharNumber || '123456789012');
      handleAadhaarNumberChange(aadharNumber || '123456789012');
    }
  };

  const handleQuickDoctorLogin = (e) => {
    e?.preventDefault?.();
    if (loginWithAccount) {
      loginWithAccount('DOCTOR-001', 'Doctor', {
        name: 'Dr. Raghavendra',
        specialty: 'General Physician',
        phone: '+91 94401 23456', 
        doctorId: 'DOCTOR-001',
        photo: '/doctor_raghavendra.jpg'
      });
    }
    navigateTo('doctor-dashboard', true);
  };

  const handleQuickReceptionistLogin = (e) => {
    e?.preventDefault?.();
    if (loginWithAccount) {
      loginWithAccount('reception.narasaraopet@gmail.com', 'Receptionist', {
        name: 'GGH Reception Desk',
        role: 'Receptionist',
        phone: '+91 98765 10800', 
        receptionistGmail: 'reception.narasaraopet@gmail.com',
        email: 'reception.narasaraopet@gmail.com'
      });
    }
    navigateTo('receptionist-dashboard', true);
  };

  const handleQuickPatientLogin = (e) => {
    e?.preventDefault?.();
    const demoAadhaar = '123456789012';
    if (loginWithAccount) {
      loginWithAccount(demoAadhaar, 'Patient', {
        fullName: 'Alex Morgan',
        aadhaarAddress: 'House 4-12, Main Road, Narasaraopet, AP',
        cityVillage: 'Narasaraopet',
        pinCode: '522601',
        phoneNumber: '+91 98765 43210',
        gender: 'MALE',
        age: '32',
        bloodGroup: 'O+'
      });
    }
    navigateTo('dashboard', true);
  };

  const digitsOnlyId = (uniqueId || '').replace(/\D/g, '');
  const is10DigitMobile = selectedRole === 'Responder' || digitsOnlyId.length === 10 || (!aadharNumber && phoneNumber && uniqueId.replace(/\D/g, '').length === 10);
  const displayPhone = is10DigitMobile && digitsOnlyId.length === 10
    ? `+91 ${digitsOnlyId}`
    : (phoneNumber || '+91 98765 10800');

  return (
    <div className="onboarding-container fade-in">
      {/* Return back to Landing button */}
      <div style={{ maxWidth: '580px', width: '100%', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={() => navigateTo('landing')}
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.86rem',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span>Back to Landing Page</span>
        </button>
      </div>

      <div className="auth-card glass-panel fade-in">
        <h2 className="modal-title">
          {authMode === 'login' 
            ? 'Sign In with Aadhaar Number' 
            : authMode === 'otp'
              ? 'Aadhaar UIDAI OTP Verification'
              : selectedRole === 'Doctor' 
                ? 'Doctor Security PIN Verification' 
                : selectedRole === 'Receptionist' 
                  ? 'Receptionist Security PIN Verification'
                  : is10DigitMobile 
                    ? '108 Ambulance Driver PIN Verification' 
                    : selectedRole === 'Admin'
                      ? 'Super Admin Security PIN Verification'
                      : 'Security PIN Verification'}
        </h2>
        <p className="modal-subtitle">
          {authMode === 'login'
            ? 'Select portal role or enter 12-digit Aadhaar Card, Doctor ID, or Receptionist Email.'
            : authMode === 'otp'
              ? `Enter the 4-digit OTP sent to mobile registered with Aadhaar (${aadharNumber || uniqueId}). Arriving automatically in 10 seconds.`
              : selectedRole === 'Doctor'
                ? `Enter your 4-digit security PIN for Doctor ID (${doctorId || uniqueId || 'DOCTOR-001'})`
                : selectedRole === 'Receptionist'
                  ? `Enter your 4-digit security PIN for Receptionist (${receptionistGmail || uniqueId})`
                  : is10DigitMobile
                    ? `Enter your 4-digit security PIN for Mobile (${displayPhone}) to open 108 Responder Console`
                    : selectedRole === 'Admin'
                      ? `Enter your 4-digit security PIN for Super Admin (${uniqueId})`
                      : `Enter your 4-digit security PIN to proceed`}
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

        {/* Role Selector Tabs (Patient, Doctor, Receptionist, 108 Responder) */}
        {authMode === 'login' && (
          <div className="role-selector-cards">
            <div 
              className={`role-card role-user ${selectedRole === 'User' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('User')}
              title="Patient Sign In with Aadhaar"
            >
              <div className="role-card-icon-wrapper">
                <UserCheck size={22} />
              </div>
              <span>Patient (Aadhaar)</span>
            </div>

            <div 
              className={`role-card role-doctor ${selectedRole === 'Doctor' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('Doctor')}
              title="Doctor Consultation Portal Sign In"
            >
              <div className="role-card-icon-wrapper">
                <Stethoscope size={22} />
              </div>
              <span>Doctor</span>
            </div>

            <div 
              className={`role-card role-receptionist ${selectedRole === 'Receptionist' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('Receptionist')}
              title="Hospital Reception Desk Sign In"
            >
              <div className="role-card-icon-wrapper">
                <Building2 size={22} />
              </div>
              <span>Receptionist</span>
            </div>

            <div 
              className={`role-card role-responder ${selectedRole === 'Responder' ? 'selected' : ''}`}
              onClick={() => handleSelectRole('Responder')}
              title="108 Ambulance Responder Sign In"
            >
              <div className="role-card-icon-wrapper">
                <Ambulance size={22} />
              </div>
              <span>108 Unit</span>
            </div>
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="auth-form">
          {authMode === 'login' && (
            <>
              {selectedRole === 'Doctor' && (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '1.5px solid #7dd3fc',
                    borderRadius: '16px',
                    marginBottom: '14px',
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
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Senior General Physician • ID: <strong style={{ color: '#0284c7' }}>DOCTOR-001</strong></p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickDoctorLogin}
                    className="btn btn-block"
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <Zap size={18} color="#ffffff" />
                    <span>⚡ 1-Click Doctor Demo Sign In</span>
                  </button>
                </>
              )}

              {selectedRole === 'Receptionist' && (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1.5px solid #fde68a',
                    borderRadius: '16px',
                    marginBottom: '14px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: '#d97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                      flexShrink: 0
                    }}>
                      <Building2 size={26} color="#ffffff" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#92400e' }}>GGH Central Reception Desk</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#b45309' }}>Reception Desk Portal • OPD Triage & Bed Allocations</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickReceptionistLogin}
                    className="btn btn-block"
                    style={{
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25)'
                    }}
                  >
                    <Zap size={18} color="#ffffff" />
                    <span>⚡ 1-Click Receptionist Demo Sign In</span>
                  </button>
                </>
              )}

              {selectedRole === 'User' && (
                <button
                  type="button"
                  onClick={handleQuickPatientLogin}
                  className="btn btn-block"
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  <Zap size={18} color="#ffffff" />
                  <span>⚡ 1-Click Demo Patient Sign In (Alex Morgan)</span>
                </button>
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
                {digitsOnlyId.length === 12
                  ? '12-Digit Aadhaar Card Number (SMS OTP Login)'
                  : is10DigitMobile
                    ? '10-Digit Mobile Phone Number (Ambulance Responder • 4-Digit PIN)'
                    : selectedRole === 'Doctor'
                      ? 'Doctor ID / Universal Registration ID (4-Digit PIN)'
                      : selectedRole === 'Receptionist'
                        ? 'Receptionist Email Address (4-Digit PIN)'
                        : selectedRole === 'Admin'
                          ? 'Super Admin ID (4-Digit PIN)'
                          : '12-Digit Aadhaar (SMS OTP) / 10-Digit Mobile (PIN) / Staff ID'}
              </label>
              <div className={`input-group${inputError ? ' input-error' : ''}`}>
                <CreditCard size={18} color={inputError ? '#dc2626' : (is10DigitMobile ? '#dc2626' : (digitsOnlyId.length === 12 ? '#059669' : '#0284c7'))} />
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
                          : digitsOnlyId.length === 12
                            ? 'Enter 12-Digit Aadhaar Number'
                            : 'Enter 12-Digit Aadhaar (OTP) or Mobile / Staff ID (PIN)'
                  }
                  required
                />
              </div>
              <span className="aadhar-help-text" style={{ color: is10DigitMobile ? '#dc2626' : (digitsOnlyId.length === 12 ? '#059669' : '#0284c7') }}>
                <ShieldCheck size={13} color={is10DigitMobile ? '#dc2626' : (digitsOnlyId.length === 12 ? '#059669' : '#0284c7')} />
                {digitsOnlyId.length === 12
                  ? '12-Digit Aadhaar Card detected: SMS OTP will be automatically delivered in 10 seconds.'
                  : is10DigitMobile
                    ? '10-Digit Mobile Number detected: 108 Ambulance Responder console will open with 4-Digit Security PIN.'
                    : selectedRole === 'Doctor'
                      ? 'Doctor credential detected. Proceed with 4-Digit Security PIN.'
                      : selectedRole === 'Receptionist'
                        ? 'Receptionist email detected. Proceed with 4-Digit Security PIN.'
                        : selectedRole === 'Admin'
                          ? 'Super Admin credential detected. Proceed with 4-Digit Security PIN.'
                          : '12-digit Aadhaar number receives SMS OTP in 10s. All other roles use 4-digit Security PIN.'}
              </span>
            </>
          )}

          {authMode === 'otp' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#166534' }}>
                    Aadhaar Card: <strong>{aadharNumber || uniqueId}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setOtp(['', '', '', '']);
                    setOtpTimer(10);
                    setOtpAutoFilled(false);
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

              {/* 10-Second Auto-OTP Live Status Banner */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: otpAutoFilled ? '#ecfdf5' : '#fffbeb',
                border: `1.5px solid ${otpAutoFilled ? '#6ee7b7' : '#fde68a'}`,
                transition: 'all 0.3s ease'
              }}>
                {otpAutoFilled ? (
                  <>
                    <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: '#065f46' }}>
                        OTP Received via UIDAI SMS & Verified!
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#047857' }}>
                        Code <strong>4819</strong> auto-filled • Launching Patient Health Portal...
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#d97706',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      flexShrink: 0,
                      boxShadow: '0 0 10px rgba(217, 119, 6, 0.3)'
                    }}>
                      {otpTimer}s
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: '#92400e' }}>
                        Aadhaar UIDAI SMS OTP Delivery in Progress
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                        Automatic arrival in <strong>{otpTimer} seconds</strong> (or enter code manually below)
                      </p>
                    </div>
                  </>
                )}
              </div>

              <label className="form-label" style={{ textAlign: 'center', marginBottom: '12px' }}>
                ENTER 4-DIGIT AADHAAR SMS OTP
              </label>

              <div className="otp-container">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpInputRefs.current[idx] = el}
                    type="text"
                    maxLength="1"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKeyDown(e, idx)}
                    style={{
                      borderColor: otpAutoFilled ? '#10b981' : undefined,
                      background: otpAutoFilled ? '#f0fdf4' : undefined,
                      fontWeight: '800'
                    }}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: '#64748b' }}>
                {otpAutoFilled 
                  ? 'Auto-verified UIDAI SMS Code: 4819' 
                  : `Waiting for UIDAI SMS Gateway (${otpTimer}s remaining)...`}
              </div>
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
                ? (digitsOnlyId.length === 12
                    ? 'Proceed to Aadhaar SMS OTP (10s Auto-Delivery)'
                    : is10DigitMobile
                      ? 'Proceed to 4-Digit Security PIN (Ambulance Responder)'
                      : selectedRole === 'Doctor'
                        ? 'Proceed to 4-Digit Security PIN (Doctor)'
                        : selectedRole === 'Receptionist'
                          ? 'Proceed to 4-Digit Security PIN (Receptionist)'
                          : selectedRole === 'Admin'
                            ? 'Proceed to 4-Digit Security PIN (Admin)'
                            : 'Proceed to Verification')
                : authMode === 'otp'
                  ? 'Verify Aadhaar OTP & Launch Patient Portal'
                  : selectedRole === 'Doctor'
                    ? 'Verify PIN & Launch Doctor Dashboard'
                    : selectedRole === 'Receptionist'
                      ? 'Verify PIN & Launch Receptionist Panel'
                      : is10DigitMobile
                        ? 'Verify PIN & Open Responder Console'
                        : selectedRole === 'Admin'
                          ? 'Verify PIN & Launch Admin Console'
                          : 'Verify PIN & Proceed'}
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
          box-sizing: border-box;
        }

        .auth-card {
          max-width: 580px;
          width: 100%;
          padding: 36px 32px;
          background: #ffffff;
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 24px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
        }

        .modal-title {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 6px;
          color: var(--text-main, #0f172a);
          line-height: 1.3;
        }

        .modal-subtitle {
          font-size: 0.88rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 22px;
          line-height: 1.4;
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
          margin-bottom: 20px;
        }

        @media (max-width: 540px) {
          .onboarding-container {
            padding: 16px 12px;
          }

          .auth-card {
            padding: 22px 16px;
            border-radius: 20px;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-subtitle {
            font-size: 0.82rem;
            margin-bottom: 16px;
          }

          .role-selector-cards {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }

          .role-card {
            padding: 10px 4px !important;
            border-radius: 12px !important;
            gap: 6px !important;
          }

          .role-card-icon-wrapper {
            width: 38px !important;
            height: 38px !important;
            border-radius: 10px !important;
          }

          .role-card span {
            font-size: 0.74rem !important;
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

