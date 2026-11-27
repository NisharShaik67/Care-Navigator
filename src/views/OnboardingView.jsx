import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  useApp, 
  AADHAAR_DATABASE, 
  extract10DigitPhone, 
  getAadhaarLinkedMobile,
  ALL_NARASARAOPET_DOCTORS,
  findDoctorInRoster 
} from '../context/AppContext';
import { 
  CheckCircle2, 
  Ambulance, 
  CreditCard, 
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  Stethoscope,
  Building2,
  ShieldCheck
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

  // Universal Input Credential
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
  const [phoneNumber, setPhoneNumber] = useState('');

  // Multi-Hospital Doctor Selection State
  const [docHospitalId, setDocHospitalId] = useState('hosp-area');
  const [docSelectedDoctorId, setDocSelectedDoctorId] = useState('DOCTOR-001');
  const [docPhoneOrId, setDocPhoneOrId] = useState('');

  // List of unique authentic hospitals in Narasaraopet
  const doctorHospitalsList = useMemo(() => {
    const seen = new Set();
    const list = [];
    ALL_NARASARAOPET_DOCTORS.forEach(d => {
      if (!seen.has(d.hospitalId)) {
        seen.add(d.hospitalId);
        list.push({ id: d.hospitalId, name: d.hospital });
      }
    });
    return list;
  }, []);

  // Doctors practicing in the currently selected hospital
  const hospitalDoctorsList = useMemo(() => {
    return ALL_NARASARAOPET_DOCTORS.filter(d => d.hospitalId === docHospitalId);
  }, [docHospitalId]);

  // Currently resolved active doctor
  const activeDoctor = useMemo(() => {
    if (docPhoneOrId && docPhoneOrId.trim()) {
      const matched = findDoctorInRoster(docPhoneOrId.trim());
      if (matched) return matched;
    }
    return ALL_NARASARAOPET_DOCTORS.find(d => d.id === docSelectedDoctorId) || hospitalDoctorsList[0] || ALL_NARASARAOPET_DOCTORS[0];
  }, [docPhoneOrId, docSelectedDoctorId, hospitalDoctorsList]);

  const handleHospitalChange = (hId) => {
    setDocHospitalId(hId);
    setErrorMsg('');
    const docsInHosp = ALL_NARASARAOPET_DOCTORS.filter(d => d.hospitalId === hId);
    if (docsInHosp.length > 0) {
      setDocSelectedDoctorId(docsInHosp[0].id);
      setDoctorId(docsInHosp[0].id);
      setPhoneNumber(docsInHosp[0].phone);
    }
    setDocPhoneOrId('');
  };

  const handleDoctorSelectChange = (docId) => {
    setDocSelectedDoctorId(docId);
    setDoctorId(docId);
    setErrorMsg('');
    const d = ALL_NARASARAOPET_DOCTORS.find(item => item.id === docId);
    if (d) {
      setDocHospitalId(d.hospitalId);
      setPhoneNumber(d.phone);
    }
    setDocPhoneOrId('');
  };

  const handleDoctorInputSearch = (val) => {
    setDocPhoneOrId(val);
    setErrorMsg('');
    setInputError(false);
    const matched = findDoctorInRoster(val);
    if (matched) {
      setDocHospitalId(matched.hospitalId);
      setDocSelectedDoctorId(matched.id);
      setDoctorId(matched.id);
      setPhoneNumber(matched.phone);
    }
  };

  // Security PIN state (for Doctor & Admin)
  const [pin, setPin] = useState(['', '', '', '']);
  const pinInputRefs = useRef([]);

  // OTP state (for Patient, Ambulance Driver, Receptionist)
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(10);
  const [otpAutoFilled, setOtpAutoFilled] = useState(false);
  const otpInputRefs = useRef([]);

  // Auto-filled from Aadhaar / Patient credentials
  const [fullName, setFullName] = useState('');
  const [aadhaarAddress, setAadhaarAddress] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('MALE');
  const [cityVillage, setCityVillage] = useState('');
  const [pinCode, setPinCode] = useState('');

  // 10-Second Countdown and Automatic OTP Reception for OTP roles
  useEffect(() => {
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

  // Execute OTP login verification
  const executeOtpLogin = () => {
    const clean = uniqueId.trim();
    const digits = clean.replace(/\D/g, '');
    const phonePrefix = clean.startsWith('+') || (clean.startsWith('0') && digits.length === 11);
    const phone10 = phonePrefix ? extract10DigitPhone(clean) : (digits.length === 10 ? digits : '');
    const aadhaar12 = !phonePrefix && digits.length === 12 ? digits : '';
    const email = clean.includes('@');

    // 1. Patient
    if (selectedRole === 'User' || aadhaar12) {
      const cleanNo = aadhaar12 || aadharNumber || digits;
      const saved = lookupAccount ? lookupAccount(cleanNo) : null;
      const aadhaarBase = AADHAAR_DATABASE[cleanNo] || null;
      const resolvedPhone = saved?.phone || saved?.phoneNumber || aadhaarBase?.phone || phoneNumber || getAadhaarLinkedMobile(cleanNo);

      loginWithAccount(cleanNo, 'Patient', {
        fullName: saved?.name || aadhaarBase?.name || fullName || 'Alex Johnson',
        aadhaarAddress: saved?.address || aadhaarBase?.address || aadhaarAddress || 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
        cityVillage: saved?.cityVillage || aadhaarBase?.city || cityVillage || 'Narasaraopet',
        pinCode: saved?.pincode || aadhaarBase?.pincode || pinCode || '522601',
        phoneNumber: resolvedPhone,
        phone: resolvedPhone,
        gender: saved?.gender || aadhaarBase?.gender || gender || 'MALE',
        age: saved?.age || aadhaarBase?.age || age || '28',
        bloodGroup: saved?.bloodGroup || aadhaarBase?.bloodGroup || bloodGroup || 'O+'
      });
      navigateTo('dashboard', true);
      return;
    }

    // 2. Ambulance Driver
    if (selectedRole === 'Responder' || phone10) {
      const cleanNo = phone10 || phoneNumber || '9876510800';
      loginWithAccount(cleanNo, 'Responder', {
        name: 'Ravi Kumar',
        role: 'Responder',
        driverRole: 'Ambulance Driver / Responder',
        phone: `+91 ${cleanNo}`,
        vehicleNo: 'AP 07 TE 1084',
        vehicleType: 'ALS Advanced Cardiac ICU Fleet #04',
        baseStation: 'Government General Hospital (GGH) Guntur Fleet Hub',
        location: 'Hospital Express Highway • Sector 4',
        isOnline: true
      });
      navigateTo('responder', true);
      return;
    }

    // 3. Receptionist
    if (selectedRole === 'Receptionist' || email) {
      const cleanEmail = (receptionistGmail || clean).toLowerCase();
      loginWithAccount(cleanEmail, 'Receptionist', {
        name: 'GGH Central Reception Desk',
        role: 'Receptionist',
        phone: '+91 98765 10800', 
        receptionistGmail: cleanEmail,
        email: cleanEmail
      });
      navigateTo('receptionist-dashboard', true);
      return;
    }

    // Fallback Patient
    const cleanNo = (aadharNumber || uniqueId).replace(/\D/g, '');
    loginWithAccount(cleanNo, 'Patient', { fullName: 'Alex Johnson' });
    navigateTo('dashboard', true);
  };

  const executeOtpLoginRef = useRef();
  executeOtpLoginRef.current = executeOtpLogin;

  // Once OTP is automatically received after 10s, auto-launch the respective portal
  useEffect(() => {
    if (authMode === 'otp' && otpAutoFilled) {
      const timer = setTimeout(() => {
        executeOtpLoginRef.current?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authMode, otpAutoFilled]);

  useEffect(() => {
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
      if (saved.phone || saved.phoneNumber) setPhoneNumber(saved.phone || saved.phoneNumber);
      else setPhoneNumber(getAadhaarLinkedMobile(digitsOnly));
      if (saved.age) setAge(saved.age);
      if (saved.bloodGroup) setBloodGroup(saved.bloodGroup);
      if (saved.gender) setGender(saved.gender);
    } else {
      const found = AADHAAR_DATABASE[digitsOnly] || AADHAAR_DATABASE[val];
      if (found) {
        setFullName(found.name);
        setAadhaarAddress(found.address);
        setCityVillage(found.city);
        setPinCode(found.pincode);
        setPhoneNumber(found.phone || getAadhaarLinkedMobile(digitsOnly));
        if (found.gender) setGender(found.gender);
        if (found.age) setAge(found.age);
        if (found.bloodGroup) setBloodGroup(found.bloodGroup);
      } else {
        setPhoneNumber(getAadhaarLinkedMobile(digitsOnly));
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

  // Real-time dynamic credential analysis
  const cleanInput = (uniqueId || '').trim();
  const digitsOnly = cleanInput.replace(/\D/g, '');
  const hasPhonePrefix = cleanInput.startsWith('+') || (cleanInput.startsWith('0') && digitsOnly.length === 11);
  const p10 = hasPhonePrefix ? (extract10DigitPhone(cleanInput) || '') : (digitsOnly.length === 10 ? digitsOnly : '');
  const a12 = !hasPhonePrefix && digitsOnly.length === 12 ? digitsOnly : '';
  const isEmail = cleanInput.includes('@');
  const isAdmin = cleanInput.toLowerCase().startsWith('admin') || cleanInput.toLowerCase() === 'director' || cleanInput.toLowerCase() === 'superadmin';

  // Check if input matches any authentic Narasaraopet doctor
  const matchedDoctorFromInput = (!isEmail && !isAdmin && !a12) ? findDoctorInRoster(cleanInput, p10) : null;
  const isDoc = Boolean(matchedDoctorFromInput) || (!isEmail && !isAdmin && !a12 && !p10 && (
    cleanInput.toLowerCase().includes('doc') || 
    cleanInput.toLowerCase().startsWith('dr') || 
    cleanInput.toLowerCase().includes('doctor') || 
    (/[a-zA-Z]/.test(cleanInput))
  ));

  const is12DigitAadhaar = Boolean(a12);
  const is10DigitPhone = Boolean(p10) && !isDoc;

  const displayPhone = is10DigitPhone
    ? (cleanInput.startsWith('+91') ? cleanInput : `+91 ${p10}`)
    : '+91 98765 10800';

  const linkedPatientPhone = (is12DigitAadhaar || a12)
    ? getAadhaarLinkedMobile(a12)
    : (aadharNumber ? getAadhaarLinkedMobile(aadharNumber) : (phoneNumber || '+91 62814 67661'));

  const handleInputChange = (val) => {
    setErrorMsg('');
    setInputError(false);
    setUniqueId(val);
    const matched = findDoctorInRoster(val);
    if (matched) {
      setDocHospitalId(matched.hospitalId);
      setDocSelectedDoctorId(matched.id);
      setDoctorId(matched.id);
      setPhoneNumber(matched.phone);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'login') {
      // 1. DOCTOR LOGIN (When Doctor role is selected OR detected as doctor)
      if (selectedRole === 'Doctor' || isDoc) {
        const docToUse = (selectedRole === 'Doctor' ? activeDoctor : null) || matchedDoctorFromInput || findDoctorInRoster(uniqueId, p10) || activeDoctor || ALL_NARASARAOPET_DOCTORS[0];
        setSelectedRole('Doctor');
        setDoctorId(docToUse.id);
        setDocHospitalId(docToUse.hospitalId);
        setDocSelectedDoctorId(docToUse.id);
        setPhoneNumber(docToUse.phone);
        setErrorMsg('');
        setPin(['', '', '', '']); // Pin starts completely blank!
        setAuthMode('pin');
        return;
      }

      const clean = uniqueId.trim();
      const digits = clean.replace(/\D/g, '');
      const phonePrefix = clean.startsWith('+') || (clean.startsWith('0') && digits.length === 11);
      const phone10 = phonePrefix ? extract10DigitPhone(clean) : (digits.length === 10 ? digits : '');
      const aadhaar12 = !phonePrefix && digits.length === 12 ? digits : '';
      const email = clean.includes('@');
      const admin = clean.toLowerCase().startsWith('admin') || clean.toLowerCase() === 'director' || clean.toLowerCase() === 'superadmin';

      // 2. ADMIN -> USES SECURITY PIN!
      if (admin) {
        setSelectedRole('Admin');
        setErrorMsg('');
        setPin(['', '', '', '']);
        setAuthMode('pin');
        return;
      }

      // 3. PATIENT (12-Digit Aadhaar) -> USES OTP!
      if (aadhaar12) {
        setSelectedRole('User');
        setAadharNumber(aadhaar12);
        const resolvedPhone = getAadhaarLinkedMobile(aadhaar12);
        setPhoneNumber(resolvedPhone);
        handleAadhaarNumberChange(aadhaar12);
        setErrorMsg('');
        setOtp(['', '', '', '']);
        setOtpTimer(10);
        setOtpAutoFilled(false);
        setAuthMode('otp');
        return;
      }

      // 4. AMBULANCE DRIVER (10-Digit Phone) -> USES OTP!
      if (phone10) {
        setSelectedRole('Responder');
        setPhoneNumber(`+91 ${phone10}`);
        setErrorMsg('');
        setOtp(['', '', '', '']);
        setOtpTimer(10);
        setOtpAutoFilled(false);
        setAuthMode('otp');
        return;
      }

      // 5. RECEPTIONIST (Email with @) -> USES OTP!
      if (email) {
        setSelectedRole('Receptionist');
        setReceptionistGmail(clean);
        setErrorMsg('');
        setOtp(['', '', '', '']);
        setOtpTimer(10);
        setOtpAutoFilled(false);
        setAuthMode('otp');
        return;
      }

      if (!clean) {
        setErrorMsg('❌ Please enter Aadhaar Number, Phone Number, Doctor ID, or Email.');
        return;
      }

      if (digits.length > 0 && digits.length !== 10 && digits.length !== 12) {
        setInputError(true);
        setErrorMsg('❌ Numeric input must be a 12-digit Aadhaar (Patient) or 10-digit Phone (Ambulance Driver).');
        return;
      }

      setErrorMsg('❌ Please enter a valid 12-digit Aadhaar, 10-digit Phone, Doctor ID, or Email.');
      return;
    }

    if (authMode === 'otp') {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 4 || otp.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit OTP before proceeding.');
        return;
      }
      executeOtpLogin();
      return;
    }

    if (authMode === 'pin') {
      const enteredPin = pin.join('');
      if (enteredPin.length < 4 || pin.some(d => !d || d.trim() === '')) {
        setErrorMsg('❌ Please enter the complete 4-digit security PIN before proceeding.');
        return;
      }

      setErrorMsg('');

      // Doctor PIN Login
      if (selectedRole === 'Doctor') {
        const docToUse = activeDoctor || findDoctorInRoster(doctorId || uniqueId) || ALL_NARASARAOPET_DOCTORS[0];
        loginWithAccount(docToUse.id, 'Doctor', {
          name: docToUse.name,
          title: docToUse.title,
          specialty: docToUse.specialty,
          hospital: docToUse.hospital,
          hospitalId: docToUse.hospitalId,
          department: docToUse.department,
          doctorId: docToUse.id,
          licenseNo: docToUse.licenseNo,
          opdRoom: docToUse.opdRoom,
          shiftHours: docToUse.shiftHours,
          experience: docToUse.experience,
          qualifications: docToUse.qualifications,
          fee: docToUse.fee,
          phone: docToUse.phone,
          photo: docToUse.photo,
          role: 'Doctor'
        });
        navigateTo('doctor-dashboard', true);
        return;
      }

      // Admin PIN Login
      if (selectedRole === 'Admin') {
        loginWithAccount('acc_admin', 'Super Admin', {
          name: 'Dr. Ramesh Kumar',
          role: 'Super Admin',
          designation: 'Director of Health & Emergency Control',
          phone: '+91 94400 00108',
          email: 'admin.director@carenavigator.ap.gov.in',
          location: 'State Emergency Command Center, Guntur, AP'
        });
        navigateTo('admin', true);
        return;
      }
    }
  };

  const getSubmitButtonLabel = () => {
    if (authMode === 'otp') {
      if (selectedRole === 'Responder' || is10DigitPhone) return 'Verify OTP & Open Ambulance Driver Console';
      if (selectedRole === 'Receptionist' || isEmail) return 'Verify OTP & Launch Receptionist Panel';
      return 'Verify Aadhaar OTP & Launch Patient Portal';
    }
    if (authMode === 'pin') {
      if (selectedRole === 'Doctor') return `Verify PIN & Launch ${activeDoctor?.name || 'Doctor'} Dashboard`;
      if (selectedRole === 'Admin') return 'Verify PIN & Launch Admin Console';
      return 'Verify PIN & Proceed';
    }
    if (selectedRole === 'Doctor' || isDoc) return `Proceed with ${activeDoctor?.name || 'Doctor'} Security PIN`;
    if (isAdmin) return 'Continue with Admin Security PIN';
    if (is12DigitAadhaar) return 'Continue with Aadhaar SMS OTP';
    if (is10DigitPhone) return 'Continue with Driver SMS OTP';
    if (isEmail) return 'Continue with Receptionist Email OTP';
    return 'Sign In';
  };

  return (
    <div className="onboarding-container fade-in">
      <div className="onboarding-card-wrapper">
        <div className="auth-card glass-panel fade-in">
          {/* Top header navigation with sleek back button */}
          <div className="auth-header-bar">
            <button
              type="button"
              onClick={() => navigateTo('landing')}
              className="auth-back-nav-btn"
              title="Back to Landing Page"
              aria-label="Back to Landing Page"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="auth-header-pill">
              <ShieldCheck size={14} color="#059669" />
              <span>Care Navigator Portal</span>
            </div>
          </div>

          <h2 className="modal-title">
            {authMode === 'otp'
              ? (selectedRole === 'Responder'
                  ? '108 Ambulance Driver SMS OTP Verification'
                  : selectedRole === 'Receptionist'
                    ? 'Hospital Receptionist Email OTP Verification'
                    : 'Aadhaar UIDAI SMS OTP Verification')
              : authMode === 'pin'
                ? (selectedRole === 'Doctor'
                    ? 'Doctor Security PIN Verification'
                    : 'Super Admin Security PIN Verification')
                : selectedRole === 'Doctor'
                  ? 'Doctor Official Portal Sign In'
                  : 'Sign In'}
          </h2>
          <p className="modal-subtitle">
            {authMode === 'otp'
              ? (selectedRole === 'Responder'
                  ? `Enter the 4-digit OTP sent to driver mobile (${displayPhone}).`
                  : selectedRole === 'Receptionist'
                    ? `Enter the 4-digit OTP sent to hospital email (${receptionistGmail || uniqueId}).`
                    : `Enter the 4-digit OTP sent to Aadhaar-registered mobile (${linkedPatientPhone}).`)
              : authMode === 'pin'
                ? (selectedRole === 'Doctor'
                    ? `Enter your 4-digit security PIN for ${activeDoctor?.name || 'Doctor'} (${activeDoctor?.hospital || 'Hospital'})`
                    : `Enter your 4-digit security PIN for Super Admin (${uniqueId})`)
                : selectedRole === 'Doctor'
                  ? 'Choose your hospital and doctor name, or enter your registered mobile number to sign in.'
                  : 'Enter your Aadhaar Number, Phone, Doctor ID, or Email to sign in.'}
          </p>

          {/* Quick Role Switcher Tabs (in Login Mode) */}
          {authMode === 'login' && (
            <div className="auth-role-tabs" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginBottom: '20px',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '14px'
            }}>
              <button
                type="button"
                onClick={() => { setSelectedRole('User'); setErrorMsg(''); setInputError(false); }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: selectedRole === 'User' ? '#ffffff' : 'transparent',
                  color: selectedRole === 'User' ? '#059669' : '#64748b',
                  boxShadow: selectedRole === 'User' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <UserCheck size={16} />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('Doctor'); setErrorMsg(''); setInputError(false); }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: selectedRole === 'Doctor' ? '#ffffff' : 'transparent',
                  color: selectedRole === 'Doctor' ? '#0284c7' : '#64748b',
                  boxShadow: selectedRole === 'Doctor' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <Stethoscope size={16} />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('Responder'); setErrorMsg(''); setInputError(false); }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: selectedRole === 'Responder' ? '#ffffff' : 'transparent',
                  color: selectedRole === 'Responder' ? '#dc2626' : '#64748b',
                  boxShadow: selectedRole === 'Responder' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <Ambulance size={16} />
                <span>108 Driver</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('Receptionist'); setErrorMsg(''); setInputError(false); }}
                style={{
                  padding: '8px 4px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: selectedRole === 'Receptionist' ? '#ffffff' : 'transparent',
                  color: selectedRole === 'Receptionist' ? '#d97706' : '#64748b',
                  boxShadow: selectedRole === 'Receptionist' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <Building2 size={16} />
                <span>Reception</span>
              </button>
            </div>
          )}

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

          {/* Active Detected Role Banner in universal login mode */}
          {authMode === 'login' && selectedRole !== 'Doctor' && cleanInput && (
            <div className="login-detection-indicator" style={{ marginBottom: '16px' }}>
              {is12DigitAadhaar ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px'
                }}>
                  <UserCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#065f46', wordBreak: 'break-word', display: 'block', lineHeight: 1.35 }}>
                      👤 Patient Portal Detected (Aadhaar: {a12}) • SMS OTP
                    </span>
                  </div>
                </div>
              ) : is10DigitPhone ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1.5px solid #ef4444',
                  borderRadius: '12px'
                }}>
                  <Ambulance size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#991b1b', wordBreak: 'break-word', display: 'block', lineHeight: 1.35 }}>
                      🚑 108 Ambulance Driver Detected ({displayPhone}) • SMS OTP
                    </span>
                  </div>
                </div>
              ) : isEmail ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#fffbeb',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '12px'
                }}>
                  <Building2 size={20} color="#d97706" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#92400e', wordBreak: 'break-word', display: 'block', lineHeight: 1.35 }}>
                      🏥 Hospital Receptionist Detected ({cleanInput}) • Email OTP
                    </span>
                  </div>
                </div>
              ) : isDoc ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#f0f9ff',
                  border: '1.5px solid #0284c7',
                  borderRadius: '12px'
                }}>
                  <Stethoscope size={20} color="#0284c7" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0369a1', wordBreak: 'break-word', display: 'block', lineHeight: 1.35 }}>
                      🩺 Doctor Portal Detected: {matchedDoctorFromInput?.name || cleanInput} ({matchedDoctorFromInput?.hospital || 'Hospital'}) • Security PIN
                    </span>
                  </div>
                </div>
              ) : isAdmin ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#faf5ff',
                  border: '1.5px solid #9333ea',
                  borderRadius: '12px'
                }}>
                  <ShieldCheck size={20} color="#9333ea" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#581c87', wordBreak: 'break-word', display: 'block', lineHeight: 1.35 }}>
                      🛡️ Super Admin Console Detected ({cleanInput}) • Security PIN
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'login' && selectedRole === 'Doctor' && (
              <>
                {/* Hospital Selection Dropdown */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.84rem' }}>
                    <Building2 size={16} color="#0284c7" />
                    <span>Select Hospital / Clinic Facility:</span>
                  </label>
                  <select
                    value={docHospitalId}
                    onChange={e => handleHospitalChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#0f172a',
                      background: '#f8fafc',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {doctorHospitalsList.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection Dropdown */}
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.84rem' }}>
                    <Stethoscope size={16} color="#0284c7" />
                    <span>Select Doctor from this Hospital:</span>
                  </label>
                  <select
                    value={docSelectedDoctorId}
                    onChange={e => handleDoctorSelectChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      color: '#0369a1',
                      background: '#f0f9ff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {hospitalDoctorsList.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Or Search by Mobile / Doctor ID */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <CreditCard size={15} color="#64748b" />
                    <span>Or Enter Doctor Registered Mobile / ID:</span>
                  </label>
                  <div className="input-group">
                    <Stethoscope size={18} color="#0284c7" />
                    <input
                      type="text"
                      value={docPhoneOrId}
                      onChange={e => handleDoctorInputSearch(e.target.value)}
                      placeholder="e.g. 9849155601 or DOCTOR-001"
                      style={{ fontWeight: '600', color: '#0369a1' }}
                    />
                  </div>
                </div>

                {/* Live Recognized Doctor Profile Card */}
                {activeDoctor && (
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '1.5px solid #7dd3fc',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
                    marginBottom: '18px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center'
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {activeDoctor.photo ? (
                        <img
                          src={activeDoctor.photo}
                          alt={activeDoctor.name}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #0284c7',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}>
                          <Stethoscope size={24} />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #ffffff'
                      }} title="Active Doctor" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: '800', color: '#0c4a6e' }}>
                          {activeDoctor.name}
                        </h4>
                        <span style={{
                          fontSize: '0.70rem',
                          fontWeight: '700',
                          padding: '2px 7px',
                          borderRadius: '8px',
                          background: '#0284c7',
                          color: '#ffffff'
                        }}>
                          {activeDoctor.id}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0369a1', marginBottom: '3px' }}>
                        {activeDoctor.specialty}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Building2 size={13} color="#0284c7" />
                        <span style={{ fontWeight: '600', color: '#334155' }}>{activeDoctor.hospital}</span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {activeDoctor.roomNo} • Mobile: <strong style={{ color: '#0284c7' }}>{activeDoctor.phone}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {authMode === 'login' && selectedRole !== 'Doctor' && (
              <>
                <label className="form-label">
                  {is12DigitAadhaar
                    ? '12-Digit Aadhaar Card Number (Patient)'
                    : is10DigitPhone
                      ? '10-Digit Mobile Phone (Ambulance Driver)'
                      : isEmail
                        ? 'Receptionist Email Address'
                        : isDoc
                          ? 'Doctor Universal Registration ID'
                          : isAdmin
                            ? 'Super Admin ID'
                            : 'Aadhaar / Phone / Doctor ID / Email'}
                </label>

                <div className={`input-group${inputError ? ' input-error' : ''}`}>
                  {is12DigitAadhaar ? (
                    <UserCheck size={18} color="#059669" />
                  ) : is10DigitPhone ? (
                    <Ambulance size={18} color="#dc2626" />
                  ) : isEmail ? (
                    <Building2 size={18} color="#d97706" />
                  ) : isDoc ? (
                    <Stethoscope size={18} color="#0284c7" />
                  ) : (
                    <CreditCard size={18} color="#64748b" />
                  )}
                  <input
                    type="text"
                    value={uniqueId}
                    onChange={e => handleInputChange(e.target.value)}
                    placeholder="Enter Aadhaar (12 digits), Phone (10 digits), Doctor ID, or Email"
                    autoFocus
                    required
                    style={{
                      color: is12DigitAadhaar ? '#047857' : is10DigitPhone ? '#991b1b' : isEmail ? '#92400e' : isDoc ? '#0369a1' : undefined,
                      fontWeight: uniqueId ? '700' : '400'
                    }}
                  />
                </div>
              </>
            )}

            {/* OTP Verification (for Patient, Ambulance Driver, Receptionist) */}
            {authMode === 'otp' && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: is10DigitPhone ? '#fef2f2' : (selectedRole === 'Receptionist' ? '#fffbeb' : '#f0fdf4'),
                  border: `1.5px solid ${is10DigitPhone ? '#fca5a5' : (selectedRole === 'Receptionist' ? '#fde68a' : '#bbf7d0')}`,
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    {is10DigitPhone ? (
                      <Ambulance size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                    ) : selectedRole === 'Receptionist' ? (
                      <Building2 size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    ) : (
                      <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: is10DigitPhone ? '#991b1b' : (selectedRole === 'Receptionist' ? '#92400e' : '#166534'), wordBreak: 'break-word', lineHeight: 1.3 }}>
                      {is10DigitPhone
                        ? `Mobile: ${displayPhone} (108 Ambulance Driver)`
                        : selectedRole === 'Receptionist'
                          ? `Email: ${receptionistGmail || uniqueId} (Receptionist)`
                          : `Aadhaar: ${aadharNumber || uniqueId} • Linked Mobile: ${linkedPatientPhone}`}
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
                      textDecoration: 'underline',
                      flexShrink: 0,
                      padding: '4px 6px'
                    }}
                  >
                    Change
                  </button>
                </div>

                {/* Real-time SMS Gateway Live Delivery Banner */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: otpAutoFilled ? '#ecfdf5' : '#f0fdf4',
                  border: `1.5px solid ${otpAutoFilled ? '#6ee7b7' : '#86efac'}`,
                  transition: 'all 0.3s ease'
                }}>
                  {otpAutoFilled ? (
                    <>
                      <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: '#065f46' }}>
                          OTP Verified Successfully!
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#047857' }}>
                          Code <strong>4819</strong> verified • Launching Patient Portal...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#059669',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.95rem',
                        flexShrink: 0,
                        boxShadow: '0 0 10px rgba(5, 150, 105, 0.25)'
                      }}>
                        <ShieldCheck size={20} color="#ffffff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: '700', color: '#065f46' }}>
                          SMS OTP Dispatched via UIDAI Gateway
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#047857' }}>
                          Sent to linked mobile <strong>{is10DigitPhone ? displayPhone : (selectedRole === 'Receptionist' ? (receptionistGmail || uniqueId) : linkedPatientPhone)}</strong>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Simulated Live Incoming SMS Notification */}
                {!otpAutoFilled && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>📩</span>
                      <div style={{ fontSize: '0.79rem', color: '#334155', lineHeight: 1.35 }}>
                        <strong>SMS (UIDAI):</strong> Your OTP is <strong>4819</strong> for mobile {is10DigitPhone ? displayPhone : linkedPatientPhone}.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(['4', '8', '1', '9']);
                        setOtpAutoFilled(true);
                      }}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                    >
                      Fill 4819
                    </button>
                  </div>
                )}

                <label className="form-label" style={{ textAlign: 'center', marginBottom: '12px' }}>
                  ENTER 4-DIGIT OTP
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
                  {otpAutoFilled ? (
                    'Verified Code: 4819'
                  ) : (
                    <span>
                      Didn't receive SMS code?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(10);
                          setOtp(['4', '8', '1', '9']);
                          setOtpAutoFilled(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Resend OTP
                      </button>
                    </span>
                  )}
                </div>
              </>
            )}

            {/* PIN Verification (for Doctor & Admin) */}
            {authMode === 'pin' && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: selectedRole === 'Doctor' ? '#f0f9ff' : '#faf5ff',
                  border: `1.5px solid ${selectedRole === 'Doctor' ? '#bae6fd' : '#e9d5ff'}`,
                  borderRadius: '14px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {selectedRole === 'Doctor' && activeDoctor?.photo ? (
                      <img
                        src={activeDoctor.photo}
                        alt="Doctor"
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0284c7', flexShrink: 0 }}
                      />
                    ) : selectedRole === 'Doctor' ? (
                      <Stethoscope size={22} color="#0284c7" style={{ flexShrink: 0 }} />
                    ) : (
                      <ShieldCheck size={22} color="#9333ea" style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: '800', color: selectedRole === 'Doctor' ? '#0369a1' : '#581c87', wordBreak: 'break-word', display: 'block', lineHeight: 1.3 }}>
                        {selectedRole === 'Doctor' ? (activeDoctor?.name || 'Doctor') : uniqueId}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                        {selectedRole === 'Doctor' ? `${activeDoctor?.specialty} • ${activeDoctor?.hospital}` : 'Super Admin Console'}
                      </span>
                    </div>
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
                      textDecoration: 'underline',
                      flexShrink: 0,
                      padding: '4px 6px'
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
                  Enter your 4-digit security PIN to authorize and sign in
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
              <CheckCircle2 size={18} />
              <span>
                {getSubmitButtonLabel()}
              </span>
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .onboarding-container {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background: radial-gradient(circle at 50% 8%, #ecfdf5 0%, #f8fafc 45%, #f1f5f9 100%);
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .onboarding-card-wrapper {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .auth-card {
          width: 100%;
          max-width: 100%;
          padding: 32px 28px;
          background: #ffffff;
          border: 1px solid var(--border-light, #e2e8f0);
          border-radius: 24px;
          box-shadow: 0 16px 40px -8px rgba(15, 23, 42, 0.08), 0 0 1px 1px rgba(15, 23, 42, 0.04);
          box-sizing: border-box;
          position: relative;
        }

        .auth-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: none;
        }

        .auth-back-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-back-nav-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: translateX(-2px);
        }

        .auth-header-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          font-size: 0.76rem;
          font-weight: 700;
          color: #065f46;
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
          line-height: 1.45;
        }

        .form-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-sub, #334155);
          margin: 16px 0 8px;
          text-align: left;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid var(--border-light, #e2e8f0);
          border-radius: 12px;
          padding: 12px 16px;
          min-height: 50px;
          box-sizing: border-box;
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

        @media (max-width: 640px) {
          .onboarding-container {
            padding: max(16px, env(safe-area-inset-top, 16px)) max(12px, env(safe-area-inset-right, 12px)) max(24px, env(safe-area-inset-bottom, 20px)) max(12px, env(safe-area-inset-left, 12px)) !important;
            justify-content: center !important;
            background: linear-gradient(180deg, #ecfdf5 0%, #f8fafc 35%, #ffffff 100%) !important;
          }

          .onboarding-card-wrapper {
            max-width: 100% !important;
          }

          .auth-card {
            padding: 22px 16px !important;
            border-radius: 20px !important;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06) !important;
          }

          .auth-header-bar {
            margin-bottom: 16px !important;
            padding-bottom: 10px !important;
          }

          .auth-back-nav-btn {
            width: 36px !important;
            height: 36px !important;
          }

          .modal-title {
            font-size: clamp(1.15rem, 4.8vw, 1.35rem) !important;
            line-height: 1.3 !important;
          }

          .modal-subtitle {
            font-size: 0.82rem !important;
            margin-bottom: 16px !important;
            line-height: 1.4 !important;
          }

          .input-group {
            min-height: 48px !important;
            padding: 10px 14px !important;
          }

          .input-group input {
            font-size: 0.95rem !important;
          }

          .otp-container {
            gap: clamp(8px, 2.5vw, 12px) !important;
            margin: 16px 0 !important;
          }

          .otp-input {
            width: clamp(46px, 14vw, 54px) !important;
            height: clamp(50px, 15vw, 58px) !important;
            font-size: 1.35rem !important;
            border-radius: 12px !important;
          }

          .btn-primary {
            min-height: 48px !important;
            font-size: 0.94rem !important;
          }
        }

        @media (max-width: 420px) {
          .onboarding-container {
            padding: max(10px, env(safe-area-inset-top, 10px)) 8px max(20px, env(safe-area-inset-bottom, 16px)) 8px !important;
          }

          .auth-card {
            padding: 18px 12px !important;
            border-radius: 18px !important;
          }

          .modal-title {
            font-size: 1.12rem !important;
          }

          .modal-subtitle {
            font-size: 0.80rem !important;
            margin-bottom: 12px !important;
          }

          .otp-container {
            gap: 6px !important;
          }

          .otp-input {
            width: clamp(40px, 13vw, 46px) !important;
            height: clamp(46px, 14vw, 52px) !important;
            font-size: 1.25rem !important;
            border-radius: 10px !important;
          }

          .input-group {
            padding: 8px 12px !important;
          }
        }

        @media (max-width: 350px) {
          .onboarding-container {
            padding: 6px 4px 14px 4px !important;
          }

          .auth-card {
            padding: 14px 8px !important;
            border-radius: 14px !important;
          }

          .modal-title {
            font-size: 1rem !important;
          }

          .otp-container {
            gap: 5px !important;
          }

          .otp-input {
            width: 36px !important;
            height: 42px !important;
            font-size: 1.1rem !important;
            border-radius: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};
