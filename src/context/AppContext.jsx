import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  saveUserToFirestore, 
  subscribeUserFromFirestore, 
  syncAccountToFirestore, 
  subscribeAccountsFromFirestore, 
  saveAppointmentToFirestore, 
  updateAppointmentInFirestore, 
  subscribeAppointmentsFromFirestore, 
  saveMedicalRecordToFirestore,
  checkFirestoreConnection,
  initFirebaseDatabase,
  isDatabaseInitialized,
  checkAndAutoInitDatabase
} from '../firebase/firestoreService';
import { isFirebaseConfigured, firebaseConfig } from '../firebase/config';

const AppContext = createContext();

export const AADHAAR_DATABASE = {
  '589241037621': {
    name: 'Alex Johnson',
    age: '28',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
    city: 'Narasaraopet',
    pincode: '522601',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  '123456789012': {
    name: 'Priya Sharma',
    age: '32',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: 'House No 18, Collectorate Colony, Guntur',
    city: 'Guntur',
    pincode: '522004',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  }
};

export const calculateProfileCompletion = (user) => {
  if (!user) return 60;
  let score = 60; // Base Aadhaar Details (Name, Aadhaar Number, Address, Gender)
  if (user.age && String(user.age).trim() !== '') score += 15;
  if (user.bloodGroup && String(user.bloodGroup).trim() !== '') score += 15;
  if (user.prescriptionReport || (Array.isArray(user.uploadedReports) && user.uploadedReports.length > 0)) score += 10;
  return Math.min(100, score);
};

const DEFAULT_USER = {
  name: 'Alex Johnson',
  age: '',
  gender: 'MALE', // Auto-filled from Aadhaar Base
  bloodGroup: '',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  role: 'Patient', // 'Patient' | 'Doctor' | 'Receptionist' | 'Responder'
  location: 'Narasaraopet, Palnadu Dist, AP',
  cityVillage: 'Narasaraopet',
  pincode: '522601',
  address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
  aadhaar: '5892 4103 7621',
  aadharNumber: '5892 4103 7621',
  phone: '+91 9876543210',
  prescriptionReport: null,
  uploadedReports: [],
  emergencyContact: '+91 9123456789',
  allergies: ['Penicillin', 'Dust', 'Sulfa drugs'],
  healthId: 'ABHA-9102-4821-9012',
  medicalId: 'MED-9102-4821',
  emergencyContacts: [
    { id: 1, name: 'Robert Johnson', relation: 'Father', phone: '+91 98765 43211' },
    { id: 2, name: 'Sarah Johnson', relation: 'Spouse', phone: '+91 98765 43212' }
  ],
  precautions: [
    'Avoid NSAID pain relievers due to mild gastritis history.',
    'Maintain daily hydration (>3L/day) for high uric acid prevention.',
    'Monitor blood pressure weekly.'
  ],
  medicineAlerts: [
    { id: 1, name: 'Cetirizine 10mg', timing: '09:00 PM (Bedtime)', dose: '1 Tablet after dinner' },
    { id: 2, name: 'Multivitamin Complex', timing: '09:30 AM (Morning)', dose: '1 Capsule after breakfast' }
  ]
};

const DEFAULT_APPOINTMENTS = [
  {
    id: 'op-101',
    tokenNumber: '14',
    doctorName: 'Dr. K. Srinivas Rao, MD',
    hospitalName: 'Government General Hospital, Guntur',
    specialty: 'Cardiology',
    date: 'Today',
    timeSlot: '10:30 AM',
    status: 'ACTIVE',
    currentServing: '11',
    queueAhead: 3,
    qrCode: 'OP-GGH-CARD-014'
  },
  {
    id: 'op-102',
    tokenNumber: '28',
    doctorName: 'Dr. S. Meenakshi, MS',
    hospitalName: 'Narasaraopet Area Hospital',
    specialty: 'Orthopedics',
    date: '2026-08-20',
    timeSlot: '02:15 PM',
    status: 'COMPLETED',
    currentServing: '28',
    queueAhead: 0,
    qrCode: 'OP-NAH-ORTH-028'
  }
];

const DEFAULT_RECORDS = [
  {
    id: 'rec-1',
    title: 'Complete Blood Count (CBC) & Lipid Profile',
    type: 'Lab Report',
    date: '2026-08-10',
    doctor: 'Dr. K. Srinivas Rao, MD',
    facility: 'Government General Hospital, Guntur',
    summary: 'Hemoglobin levels normal (14.2 g/dL). Total Cholesterol 185 mg/dL.'
  },
  {
    id: 'rec-2',
    title: 'OPD Digital Prescription - Cardiology',
    type: 'Prescription',
    date: '2026-07-22',
    doctor: 'Dr. S. Meenakshi, MS',
    facility: 'Narasaraopet Area Hospital',
    summary: 'Prescribed Cetirizine 10mg daily after dinner and Multivitamin Complex.'
  },
  {
    id: 'rec-3',
    title: 'COVID-19 Booster Vaccination Certificate',
    type: 'Vaccination',
    date: '2025-11-05',
    doctor: 'Public Health Officer',
    facility: 'Primary Health Centre, Narasaraopet',
    summary: 'Universal Immunization Record verified via CoWIN & ABHA.'
  }
];

export const SEED_ACCOUNTS = {
  'acc_alex': {
    ...DEFAULT_USER,
    accountId: 'acc_alex',
    role: 'Patient',
    aliases: ['aadhaar:589241037621', '589241037621']
  },
  'acc_priya': {
    ...DEFAULT_USER,
    accountId: 'acc_priya',
    name: 'Priya Sharma',
    age: '32',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: 'House No 18, Collectorate Colony, Guntur',
    cityVillage: 'Guntur',
    pincode: '522004',
    location: 'Guntur, Palnadu Dist, AP',
    aadhaar: '1234 5678 9012',
    aadharNumber: '1234 5678 9012',
    phone: '+91 9876543211',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    role: 'Patient',
    prescriptionReport: { name: 'Priya_Cardio_Prescription.pdf', date: '2026-08-15' },
    uploadedReports: [
      { id: 1, name: 'Priya_Cardio_Prescription.pdf', date: '2026-08-15', size: '1.2 MB' }
    ],
    emergencyContact: '+91 98765 43212',
    allergies: ['Dust'],
    healthId: 'ABHA-1234-5678-9012',
    medicalId: 'MED-1234-5678',
    emergencyContacts: [
      { id: 1, name: 'Amit Sharma', relation: 'Spouse', phone: '+91 98765 43212' }
    ],
    precautions: ['Routine blood pressure checkup bi-weekly.'],
    medicineAlerts: [
      { id: 1, name: 'Iron & Folic Acid', timing: '08:00 AM (Morning)', dose: '1 Tablet after breakfast' }
    ],
    aliases: ['aadhaar:123456789012', '123456789012']
  },
  'acc_doctor_001': {
    accountId: 'acc_doctor_001',
    name: 'Dr. Raghavendra',
    title: 'Senior General Physician',
    specialty: 'General Physician',
    doctorId: 'DOCTOR-001',
    hospital: 'ABC Hospital',
    department: 'Department of General Medicine',
    licenseNo: 'MCI-AP-89412',
    opdRoom: 'Room No. 104, OPD Block A',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '12 Years',
    qualifications: 'MBBS, MD (Internal Medicine)',
    totalConsultationsToday: 7,
    phone: '+91 98765 00001',
    photo: '/doctor_raghavendra.jpg',
    role: 'Doctor',
    aliases: ['doctor:DOCTOR-001', 'DOCTOR-001', 'doctor:DOC-001', 'DOC-001']
  },
  'acc_receptionist': {
    accountId: 'acc_receptionist',
    name: 'GGH Reception Desk',
    role: 'Receptionist',
    receptionistGmail: 'reception.narasaraopet@gmail.com',
    email: 'reception.narasaraopet@gmail.com',
    phone: '+91 98765 10800',
    hospital: 'Government General Hospital, Guntur',
    aliases: ['email:reception.narasaraopet@gmail.com', 'reception.narasaraopet@gmail.com', 'email:reception@hospital.com', 'reception@hospital.com']
  },
  'acc_responder': {
    accountId: 'acc_responder',
    name: 'Ravi Kumar',
    role: 'Responder',
    driverRole: 'Ambulance Driver / Responder',
    phone: '+91 98765 10800',
    vehicleNo: 'AP 07 TE 1084',
    vehicleType: 'ALS Advanced Cardiac ICU Fleet #04',
    baseStation: 'Government General Hospital (GGH) Guntur Fleet Hub',
    location: 'Hospital Express Highway • Sector 4',
    isOnline: true,
    aliases: ['responder:9876510800', '9876510800', 'phone:9876510800', '108', 'responder', 'ravi', 'ravikumar']
  },
  'acc_admin': {
    accountId: 'acc_admin',
    name: 'Dr. Ramesh Kumar',
    role: 'Super Admin',
    designation: 'Director of Health & Emergency Control',
    phone: '+91 94400 00108',
    email: 'admin.director@carenavigator.ap.gov.in',
    location: 'State Emergency Command Center, Guntur, AP',
    aliases: ['admin', 'admin-001', 'superadmin', 'administrator', 'director']
  }
};

export const extract10DigitPhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length >= 12 && digits.startsWith('91')) return digits.slice(-10);
  if (digits.length > 10) return digits.slice(-10);
  return '';
};

export const extract12DigitAadhaar = (rawAadhaar) => {
  if (!rawAadhaar) return '';
  const digits = String(rawAadhaar).replace(/\D/g, '');
  if (digits.length === 12) return digits;
  return '';
};

export const getAccountDb = () => {
  try {
    const raw = localStorage.getItem('cn_accounts_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Ensure Patient demo accounts are always correctly mapped to their Aadhaar
        if (SEED_ACCOUNTS['acc_alex']) {
          parsed['acc_alex'] = { ...SEED_ACCOUNTS['acc_alex'], ...(parsed['acc_alex'] || {}), role: 'Patient' };
          parsed['589241037621'] = parsed['acc_alex'];
          parsed['aadhaar:589241037621'] = parsed['acc_alex'];
        }
        if (SEED_ACCOUNTS['acc_priya']) {
          parsed['acc_priya'] = { ...SEED_ACCOUNTS['acc_priya'], ...(parsed['acc_priya'] || {}), role: 'Patient' };
          parsed['123456789012'] = parsed['acc_priya'];
          parsed['aadhaar:123456789012'] = parsed['acc_priya'];
        }
        if (parsed['acc_receptionist']) {
          delete parsed['acc_receptionist'].aadhaar;
          delete parsed['acc_receptionist'].aadharNumber;
          parsed['acc_receptionist'].role = 'Receptionist';
        }
        saveAccountDb(parsed);
        return parsed;
      }
    }
  } catch {}

  const initialDb = {};
  Object.values(SEED_ACCOUNTS).forEach(acc => {
    initialDb[acc.accountId] = acc;
    if (Array.isArray(acc.aliases)) {
      acc.aliases.forEach(alias => {
        initialDb[alias] = acc;
      });
    }
  });

  try {
    localStorage.setItem('cn_accounts_db', JSON.stringify(initialDb));
  } catch {}

  return initialDb;
};

export const saveAccountDb = (db) => {
  try {
    localStorage.setItem('cn_accounts_db', JSON.stringify(db));
  } catch {}
};

export const findAccountInDb = (db, identifier) => {
  if (!db || !identifier) return null;
  const raw = String(identifier).trim();
  if (!raw) return null;

  if (db[raw]) return db[raw];

  const lower = raw.toLowerCase();
  if (db[lower]) return db[lower];

  const a12 = extract12DigitAadhaar(raw);
  if (a12) {
    if (db[a12]) return db[a12];
    if (db[`aadhaar:${a12}`]) return db[`aadhaar:${a12}`];
  }

  const p10 = extract10DigitPhone(raw);
  if (p10) {
    if (db[p10]) return db[p10];
    if (db[`phone:${p10}`]) return db[`phone:${p10}`];
  }

  const cleanDoc = raw.replace(/\s+/g, '').toUpperCase();
  if (db[cleanDoc]) return db[cleanDoc];
  if (db[`doctor:${cleanDoc}`]) return db[`doctor:${cleanDoc}`];

  if (raw.includes('@')) {
    if (db[`email:${lower}`]) return db[`email:${lower}`];
  }

  const checkedAccountIds = new Set();
  for (const item of Object.values(db)) {
    if (!item || typeof item !== 'object') continue;
    const accId = item.accountId || JSON.stringify(item);
    if (checkedAccountIds.has(accId)) continue;
    checkedAccountIds.add(accId);

    if (Array.isArray(item.aliases)) {
      for (const al of item.aliases) {
        if (!al) continue;
        const alStr = String(al).trim().toLowerCase();
        if (alStr === lower || (p10 && alStr === p10) || (a12 && alStr === a12) || alStr === cleanDoc.toLowerCase()) {
          return item;
        }
      }
    }

    const itemAadhaar = extract12DigitAadhaar(item.aadharNumber || item.aadhaar || '');
    const itemPhone = extract10DigitPhone(item.phone || '');
    const itemDoc = (item.doctorId || '').replace(/\s+/g, '').toUpperCase();
    const itemEmail = (item.receptionistGmail || item.email || '').toLowerCase().trim();

    if (a12 && itemAadhaar === a12) return item;
    if (p10 && itemPhone === p10) return item;
    if (cleanDoc && itemDoc && (itemDoc === cleanDoc || cleanDoc.includes(itemDoc) || itemDoc.includes(cleanDoc))) return item;
    if (lower.includes('@') && itemEmail === lower) return item;
  }

  return null;
};

export const persistUserDataToDb = (userToSave, extraData = {}) => {
  if (!userToSave) return null;
  try {
    const db = getAccountDb();
    let existing = null;
    if (userToSave.accountId && db[userToSave.accountId]) {
      existing = db[userToSave.accountId];
    } else {
      const lookupKey = userToSave.accountId || userToSave.aadharNumber || userToSave.aadhaar || userToSave.phone || userToSave.doctorId || userToSave.receptionistGmail || userToSave.email;
      existing = findAccountInDb(db, lookupKey);
    }

    const accountId = existing?.accountId || userToSave.accountId || (
      userToSave.role === 'Doctor' ? `acc_doctor_${Date.now()}` :
      userToSave.role === 'Receptionist' ? `acc_reception_${Date.now()}` :
      (userToSave.role === 'Responder' || userToSave.role === 'Driver') ? `acc_resp_${Date.now()}` :
      (userToSave.role === 'Admin' || userToSave.role === 'Super Admin') ? `acc_admin_${Date.now()}` :
      `acc_patient_${Date.now()}`
    );

    const merged = {
      ...(existing || {}),
      ...userToSave,
      ...extraData,
      accountId
    };

    merged.completionScore = calculateProfileCompletion(merged);

    const aliasSet = new Set();
    aliasSet.add(accountId);

    const a12 = extract12DigitAadhaar(merged.aadharNumber || merged.aadhaar || '');
    // Only Patient accounts may be mapped to 12-digit Aadhaar aliases
    if (a12 && (merged.role === 'Patient' || merged.role === 'User' || !merged.role)) {
      aliasSet.add(`aadhaar:${a12}`);
      aliasSet.add(a12);
    }

    const p10 = extract10DigitPhone(merged.phone || '');
    if (p10) {
      aliasSet.add(`phone:${p10}`);
      aliasSet.add(p10);
    }

    if (merged.doctorId && merged.doctorId.trim()) {
      const cDoc = merged.doctorId.replace(/\s+/g, '').toUpperCase();
      aliasSet.add(`doctor:${cDoc}`);
      aliasSet.add(cDoc);
    }
    if (merged.receptionistGmail || merged.email) {
      const cEmail = (merged.receptionistGmail || merged.email).toLowerCase().trim();
      if (cEmail.includes('@')) {
        aliasSet.add(`email:${cEmail}`);
        aliasSet.add(cEmail);
      }
    }

    merged.aliases = Array.from(aliasSet);

    db[accountId] = merged;
    merged.aliases.forEach(alias => {
      db[alias] = merged;
    });

    saveAccountDb(db);

    // Asynchronously synchronize account profile to Cloud Firestore
    try {
      saveUserToFirestore(accountId, merged);
      syncAccountToFirestore(accountId, merged);
    } catch (fsErr) {
      console.warn('[Firestore] Sync warning:', fsErr);
    }

    return merged;
  } catch (err) {
    console.error('Failed to persist user data to db:', err);
    return userToSave;
  }
};

export const findOrCreateAccount = (identifier, roleHint, initialDefaults = {}) => {
  const db = getAccountDb();
  const raw = String(identifier || '').trim();
  const a12 = extract12DigitAadhaar(raw);
  const p10 = extract10DigitPhone(raw);
  const isEmail = raw.includes('@');
  const isDoc = roleHint === 'Doctor' || raw.toUpperCase().includes('DOC') || raw.toUpperCase().startsWith('DR');
  const isResponder = roleHint === 'Responder' || roleHint === 'Driver' || (p10 && !a12);

  const existing = findAccountInDb(db, identifier);
  if (existing) {
    // If a 12-digit Aadhaar was looked up, it MUST be a Patient account!
    if (a12 && existing.role !== 'Patient') {
      return persistUserDataToDb({ ...existing, role: 'Patient' });
    }
    if (isResponder && existing.role !== 'Responder') {
      return persistUserDataToDb({ ...existing, role: 'Responder' });
    }
    return existing;
  }

  let newAcc = {};

  if (isDoc) {
    const cleanDoc = raw.replace(/\s+/g, '').toUpperCase() || 'DOCTOR-001';
    newAcc = {
      accountId: `acc_doc_${cleanDoc.toLowerCase()}`,
      name: initialDefaults.name || 'Dr. Raghavendra',
      title: 'Senior General Physician',
      specialty: initialDefaults.specialty || 'General Physician',
      doctorId: cleanDoc,
      hospital: 'ABC Hospital',
      department: 'Department of General Medicine',
      licenseNo: 'MCI-AP-89412',
      opdRoom: 'Room No. 104, OPD Block A',
      shiftHours: '09:00 AM - 05:00 PM',
      experience: '12 Years',
      qualifications: 'MBBS, MD (Internal Medicine)',
      totalConsultationsToday: 7,
      phone: initialDefaults.phone || '+91 98765 00001',
      photo: initialDefaults.photo || '/doctor_raghavendra.jpg',
      role: 'Doctor',
      aliases: [`doctor:${cleanDoc}`, cleanDoc]
    };
  } else if (isEmail || roleHint === 'Receptionist') {
    const cleanEmail = raw.toLowerCase();
    newAcc = {
      accountId: `acc_rec_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: initialDefaults.name || 'GGH Reception Desk',
      role: 'Receptionist',
      receptionistGmail: cleanEmail,
      email: cleanEmail,
      phone: initialDefaults.phone || '+91 98765 10800',
      hospital: 'Government General Hospital, Guntur',
      aliases: [`email:${cleanEmail}`, cleanEmail]
    };
  } else if (isResponder) {
    const phoneClean = p10 ? `+91 ${p10}` : (initialDefaults.phone || '+91 98765 10800');
    newAcc = {
      accountId: `acc_resp_${p10 || Date.now()}`,
      name: initialDefaults.name || 'Ravi Kumar',
      role: 'Responder',
      driverRole: 'Ambulance Driver / Responder',
      phone: phoneClean,
      vehicleNo: initialDefaults.vehicleNo || 'AP 07 TE 1084',
      vehicleType: initialDefaults.vehicleType || 'ALS Advanced Cardiac ICU Fleet #04',
      baseStation: initialDefaults.baseStation || 'Government General Hospital (GGH) Guntur Fleet Hub',
      location: initialDefaults.location || 'Hospital Express Highway • Sector 4',
      isOnline: true,
      aliases: p10 ? [`responder:${p10}`, p10, `phone:${p10}`] : ['responder:108', '108']
    };
  } else {
    let aadhaarClean = a12 || '';
    let phoneClean = '';
    if (p10) {
      phoneClean = `+91 ${p10}`;
    } else {
      phoneClean = initialDefaults.phoneNumber || initialDefaults.phone || '';
    }

    const aadhaarBase = AADHAAR_DATABASE[aadhaarClean] || null;

    const cityToUse = aadhaarBase ? aadhaarBase.city : (initialDefaults.cityVillage || 'Narasaraopet');
    const pinToUse = aadhaarBase ? aadhaarBase.pincode : (initialDefaults.pinCode || initialDefaults.pincode || '522601');
    const addressToUse = aadhaarBase ? aadhaarBase.address : (initialDefaults.aadhaarAddress || initialDefaults.address || `${cityToUse}, Andhra Pradesh`);
    const nameToUse = aadhaarBase ? aadhaarBase.name : (initialDefaults.fullName || initialDefaults.name || (p10 ? `User ${p10.slice(-4)}` : (aadhaarClean ? `User ${aadhaarClean.slice(-4)}` : 'Patient')));
    const healthIdToUse = aadhaarClean ? `ABHA-${aadhaarClean.slice(0, 4)}-${aadhaarClean.slice(4, 8)}-${aadhaarClean.slice(8, 12)}` : (p10 ? `ABHA-PHONE-${p10.slice(-6)}` : `ABHA-${Date.now().toString().slice(-8)}`);

    newAcc = {
      accountId: `acc_pat_${aadhaarClean || p10 || Date.now()}`,
      name: nameToUse,
      age: initialDefaults.age || (aadhaarBase ? aadhaarBase.age : ''),
      gender: aadhaarBase ? aadhaarBase.gender : (initialDefaults.gender || 'MALE'),
      bloodGroup: initialDefaults.bloodGroup || (aadhaarBase ? aadhaarBase.bloodGroup : ''),
      address: addressToUse,
      cityVillage: cityToUse,
      pincode: pinToUse,
      location: `${cityToUse}, AP`,
      aadhaar: aadhaarClean ? `${aadhaarClean.slice(0, 4)} ${aadhaarClean.slice(4, 8)} ${aadhaarClean.slice(8, 12)}` : '',
      aadharNumber: aadhaarClean || '',
      phone: phoneClean,
      photo: aadhaarBase?.photo || (aadhaarBase?.gender === 'FEMALE' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' 
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'),
      prescriptionReport: null,
      uploadedReports: [],
      emergencyContact: '',
      allergies: [],
      healthId: healthIdToUse,
      medicalId: `MED-${Date.now().toString().slice(-6)}`,
      emergencyContacts: [],
      precautions: [],
      medicineAlerts: [],
      role: 'Patient',
      aliases: []
    };
  }

  return persistUserDataToDb(newAcc);
};

export const DEFAULT_DOCTOR_AVATARS = {
  'doc-gen-4': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  'doc-402': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. P. Anitha
  'doc-gen-2': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-3': 'https://images.unsplash.com/photo-1594824813508-62a21e64627d?auto=format&fit=crop&q=80&w=300', // Dr. S. Meenakshi
  'doc-4': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. R. V. Ramana
  'doc-501': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  'doc-502': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300', // Dr. K. Sunitha
  'doc-gen-1': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-1': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. K. Srinivas Rao
  'doc-2': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300', // Dr. M. Lakshmi Prasanna
  'doc-gen-6': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-601': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. N. Chandra Sekhar
  'doc-602': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. B. Swapna
  'doc-gen-7': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  'doc-701': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', // Dr. G. Ravi Teja
  'doc-gen-3': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-5': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. P. Ramesh Babu
  'doc-gen-8': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  'doc-801': 'https://images.unsplash.com/photo-1594824813508-62a21e64627d?auto=format&fit=crop&q=80&w=300', // Dr. D. Sailaja
  'doc-gen-9': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-901': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. A. Vikram Dev
  'doc-gen-10': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  'doc-1001': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300' // Dr. S. K. Mukherjee
};

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    try {
      return localStorage.getItem('cn_isLoggedIn') === 'true';
    } catch {
      return false;
    }
  });

  const setIsLoggedIn = (status) => {
    setIsLoggedInState(status);
    try {
      if (status) {
        localStorage.setItem('cn_isLoggedIn', 'true');
      } else {
        localStorage.removeItem('cn_isLoggedIn');
      }
    } catch {}
  };

  const [currentScreen, setCurrentScreenState] = useState(() => {
    try {
      const isAuth = localStorage.getItem('cn_isLoggedIn') === 'true';
      const hash = window.location.hash ? window.location.hash.replace('#', '') : null;
      if (isAuth) {
        if (hash && hash !== 'landing' && hash !== 'onboarding') {
          if (hash === 'admin' || hash.startsWith('admin/') || hash.startsWith('admin-')) {
            return 'admin';
          }
          return hash;
        }
        const savedScreen = localStorage.getItem('cn_currentScreen');
        if (savedScreen && savedScreen !== 'landing' && savedScreen !== 'onboarding') {
          return savedScreen;
        }
        const uRaw = localStorage.getItem('cn_user');
        const role = uRaw ? JSON.parse(uRaw)?.role : 'Patient';
        return role === 'Doctor' ? 'doctor-dashboard' : role === 'Receptionist' ? 'receptionist-dashboard' : (role === 'Responder' || role === 'Driver') ? 'responder' : (role === 'Admin' || role === 'Super Admin') ? 'admin' : 'dashboard';
      }
      if (hash && hash !== 'landing') {
        if (hash === 'onboarding' || hash === 'admin' || hash.startsWith('admin')) {
          if (hash === 'admin' || hash.startsWith('admin/') || hash.startsWith('admin-')) {
            return 'admin';
          }
          return hash;
        }
      }
      // On app start for unauthenticated users, present the App Overview ('landing') screen
      return 'landing';
    } catch {
      return 'landing';
    }
  });

  const [screenHistory, setScreenHistory] = useState(() => {
    try {
      const isAuth = localStorage.getItem('cn_isLoggedIn') === 'true';
      const saved = localStorage.getItem('cn_screenHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (isAuth) {
            return parsed.filter(s => s && s !== 'landing' && s !== 'onboarding');
          }
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cn_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('cn_appointments');
      return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
    } catch {
      return DEFAULT_APPOINTMENTS;
    }
  });

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('cn_records');
      return saved ? JSON.parse(saved) : DEFAULT_RECORDS;
    } catch {
      return DEFAULT_RECORDS;
    }
  });

  const [hospitals, setHospitals] = useState(() => {
    let savedAvatars = {};
    try {
      const s = localStorage.getItem('cn_doctor_avatars');
      if (s) savedAvatars = JSON.parse(s);
    } catch {}

    const baseList = [
    {
      id: 'hosp-4',
      name: 'Apollo Primary Clinic & OPD Center',
      type: 'Primary Care & OPD Clinic',
      location: 'Main Road, Narasaraopet',
      distance: '0.8 km',
      distanceVal: 0.8,
      emergencyBeds: 4,
      icuBeds: 1,
      ventilators: 0,
      opQueueCount: 8,
      phone: '08647 225588',
      rating: 4.7,
      specialties: ['General Checkup', 'General Medicine', 'Dermatology', 'Pediatrics'],
      doctors: [
        { 
          id: 'doc-gen-4', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MBBS, General OPD Officer', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '10 yrs', 
          roomNo: 'General Triage Block-1, Room 01', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-402', name: 'Dr. P. Anitha', title: 'MD (Dermatology)', specialty: 'Dermatology', experience: '8 yrs', roomNo: 'OP Desk 2', fee: '₹350', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-2',
      name: 'Narasaraopet Area Hospital',
      type: 'District Govt Area Hospital',
      location: 'Palnadu Road, Narasaraopet',
      distance: '1.1 km',
      distanceVal: 1.1,
      emergencyBeds: 8,
      icuBeds: 2,
      ventilators: 1,
      opQueueCount: 18,
      phone: '08647 220108',
      rating: 4.4,
      specialties: ['General Checkup', 'General Medicine', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynaecology'],
      doctors: [
        { 
          id: 'doc-gen-2', 
          name: 'Dr. Common Duty Physician (General Triage & Referral)', 
          title: 'MBBS, Civil Assistant Surgeon', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '11 yrs', 
          roomNo: 'General Triage Room 02', 
          fee: '₹30', 
          available: 'Available Today', 
          rating: 4.8,
          isCommonDoctor: true
        },
        { id: 'doc-3', name: 'Dr. S. Meenakshi', title: 'MS (Orthopedics)', specialty: 'Orthopedics', experience: '12 yrs', roomNo: 'Room 12', fee: '₹300', available: 'Available Today', rating: 4.6 },
        { id: 'doc-4', name: 'Dr. R. V. Ramana', title: 'MD (Pediatrics)', specialty: 'Pediatrics', experience: '16 yrs', roomNo: 'Room 05', fee: '₹300', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-5',
      name: 'Sri City Community Health Center (CHC)',
      type: 'Community Health Center (CHC)',
      location: 'Station Road, Narasaraopet',
      distance: '1.8 km',
      distanceVal: 1.8,
      emergencyBeds: 6,
      icuBeds: 1,
      ventilators: 1,
      opQueueCount: 12,
      phone: '08647 231122',
      rating: 4.3,
      specialties: ['General Checkup', 'General Medicine', 'Obstetrics & Gynaecology', 'Emergency Triage'],
      doctors: [
        { 
          id: 'doc-501', 
          name: 'Dr. Common Triage Medical Officer', 
          title: 'MBBS (General Physician & Triage)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '7 yrs', 
          roomNo: 'Triage OPD Desk 1', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-502', name: 'Dr. K. Sunitha', title: 'DGO, MS (Gynecology)', specialty: 'Obstetrics & Gynaecology', experience: '11 yrs', roomNo: 'Maternity Wing 3', fee: '₹250', available: 'Available Today', rating: 4.6 }
      ]
    },
    {
      id: 'hosp-1',
      name: 'Government General Hospital (GGH)',
      type: 'Govt Super Specialty Hospital',
      location: 'Collectorate Road, Guntur',
      distance: '2.4 km',
      distanceVal: 2.4,
      emergencyBeds: 14,
      icuBeds: 5,
      ventilators: 3,
      opQueueCount: 42,
      phone: '0863 2234567',
      rating: 4.6,
      specialties: ['General Checkup', 'Cardiology', 'Trauma & Emergency', 'Orthopedics', 'General Surgery', 'Pediatrics'],
      doctors: [
        { 
          id: 'doc-gen-1', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MD (General Medicine & Primary Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '16 yrs', 
          roomNo: 'General Triage Block-1, Room 01', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-1', name: 'Dr. K. Srinivas Rao', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '18 yrs', roomNo: 'OP Block-2, Room 104', fee: '₹300', available: 'Available Today', rating: 4.8 },
        { id: 'doc-2', name: 'Dr. M. Lakshmi Prasanna', title: 'MS (General Surgery)', specialty: 'General Surgery', experience: '14 yrs', roomNo: 'OP Block-1, Room 202', fee: '₹250', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-6',
      name: 'KIMS Saveera Multi-Specialty Hospital',
      type: 'Private Super Specialty Hospital',
      location: 'NH-16 Express Highway, Guntur',
      distance: '3.2 km',
      distanceVal: 3.2,
      emergencyBeds: 18,
      icuBeds: 8,
      ventilators: 5,
      opQueueCount: 22,
      phone: '0863 2288999',
      rating: 4.8,
      specialties: ['General Checkup', 'Neurology', 'Endocrinology', 'Gastroenterology', 'Cardiology'],
      doctors: [
        { 
          id: 'doc-gen-6', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MD (General Medicine & Preventive Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '13 yrs', 
          roomNo: 'Triage Desk 102', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.8,
          isCommonDoctor: true
        },
        { id: 'doc-601', name: 'Dr. N. Chandra Sekhar', title: 'DM (Neurology), MCh', specialty: 'Neurology', experience: '20 yrs', roomNo: 'Neuro Block 301', fee: '₹600', available: 'Available Today', rating: 4.9 },
        { id: 'doc-602', name: 'Dr. B. Swapna', title: 'MD, DM (Endocrinology)', specialty: 'Endocrinology', experience: '15 yrs', roomNo: 'Diabetes Care Desk', fee: '₹450', available: 'Available Today', rating: 4.8 }
      ]
    },
    {
      id: 'hosp-7',
      name: 'Guntur City Care Clinic & OPD Center',
      type: 'Neighborhood Daycare Clinic',
      location: 'Brodipet 4th Line, Guntur',
      distance: '3.9 km',
      distanceVal: 3.9,
      emergencyBeds: 3,
      icuBeds: 0,
      ventilators: 0,
      opQueueCount: 6,
      phone: '0863 2244111',
      rating: 4.5,
      specialties: ['General Checkup', 'ENT Specialist', 'General Medicine', 'Dental Care'],
      doctors: [
        { 
          id: 'doc-gen-7', 
          name: 'Dr. Common Duty Physician (General Triage)', 
          title: 'MBBS, Family Physician', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '9 yrs', 
          roomNo: 'General Triage Room 101', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-701', name: 'Dr. G. Ravi Teja', title: 'MS (ENT Specialist)', specialty: 'ENT Specialist', experience: '9 yrs', roomNo: 'Room 102', fee: '₹300', available: 'Available Today', rating: 4.6 }
      ]
    },
    {
      id: 'hosp-3',
      name: 'Ramesh Hospitals & Cardiac Center',
      type: 'Tertiary Cardiac & Emergency Hospital',
      location: 'Ring Road, Guntur',
      distance: '4.8 km',
      distanceVal: 4.8,
      emergencyBeds: 22,
      icuBeds: 9,
      ventilators: 6,
      opQueueCount: 29,
      phone: '0863 2377777',
      rating: 4.8,
      specialties: ['General Checkup', 'Cardiac Care', 'Critical Care', 'Nephrology', 'Pulmonology'],
      doctors: [
        { 
          id: 'doc-gen-3', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MBBS, MEM (Emergency & General Triage)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '15 yrs', 
          roomNo: 'OP Desk 1', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-5', name: 'Dr. P. Ramesh Babu', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '25 yrs', roomNo: 'Tower A, Floor 3', fee: '₹500', available: 'Available Today', rating: 4.9 }
      ]
    },
    {
      id: 'hosp-8',
      name: 'Palnadu Mother & Child Health Center',
      type: 'Maternity & Children Hospital',
      location: 'Vinukonda Highway, Palnadu',
      distance: '6.5 km',
      distanceVal: 6.5,
      emergencyBeds: 10,
      icuBeds: 4,
      ventilators: 2,
      opQueueCount: 15,
      phone: '08646 223344',
      rating: 4.6,
      specialties: ['General Checkup', 'Pediatrics & Neonatology', 'Obstetrics & Gynaecology'],
      doctors: [
        { 
          id: 'doc-gen-8', 
          name: 'Dr. Common Duty Medical Officer', 
          title: 'MBBS, General & Family Physician', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '8 yrs', 
          roomNo: 'OP Triage Desk 1', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-801', name: 'Dr. D. Sailaja', title: 'MD (Pediatrics), Fellow Neonatology', specialty: 'Pediatrics & Neonatology', experience: '14 yrs', roomNo: 'NICU Block Room 02', fee: '₹350', available: 'Available Today', rating: 4.8 }
      ]
    },
    {
      id: 'hosp-9',
      name: 'Manipal Super Specialty Hospital',
      type: 'Regional Super Specialty',
      location: 'Tadepalle Bypass, Vijayawada',
      distance: '8.2 km',
      distanceVal: 8.2,
      emergencyBeds: 30,
      icuBeds: 12,
      ventilators: 8,
      opQueueCount: 35,
      phone: '0866 2299000',
      rating: 4.9,
      specialties: ['General Checkup', 'Nephrology', 'Urology', 'Oncology', 'Organ Transplant'],
      doctors: [
        { 
          id: 'doc-gen-9', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MD (Internal Medicine & General Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '18 yrs', 
          roomNo: 'Triage Desk 205', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-901', name: 'Dr. A. Vikram Dev', title: 'DM (Nephrology), Transplant Fellow', specialty: 'Nephrology', experience: '22 yrs', roomNo: 'Transplant OPD Wing', fee: '₹700', available: 'Available Today', rating: 4.9 }
      ]
    },
    {
      id: 'hosp-10',
      name: 'AIIMS Apex Medical Institute & Hospital',
      type: 'National Apex Referral Institute',
      location: 'Mangalagiri, Guntur District',
      distance: '12.0 km',
      distanceVal: 12.0,
      emergencyBeds: 50,
      icuBeds: 25,
      ventilators: 15,
      opQueueCount: 60,
      phone: '0863 2277000',
      rating: 4.9,
      specialties: ['General Checkup', 'Pulmonology', 'Cardiothoracic Surgery', 'Neurosurgery', 'Multi-Specialty'],
      doctors: [
        { 
          id: 'doc-gen-10', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MD (General Medicine & Primary OPD)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '22 yrs', 
          roomNo: 'General Triage Block-G', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-1001', name: 'Dr. S. K. Mukherjee', title: 'MD, DM (Pulmonology)', specialty: 'Pulmonology', experience: '28 yrs', roomNo: 'Apex OPD Block-A', fee: '₹100', available: 'Available Today', rating: 5.0 }
      ]
    }
    ];

    return baseList.map(hosp => {
      const icuUnits = hosp.icuBeds !== undefined ? hosp.icuBeds : (hosp.icuAvailable || 0);
      const specs = Array.isArray(hosp.specialties) ? [...hosp.specialties] : [];
      if (icuUnits > 0 && !specs.some(s => s.toLowerCase().includes('icu'))) {
        specs.push('ICU & Critical Care');
      }
      return {
        ...hosp,
        address: hosp.address || hosp.location || 'Narasaraopet, AP',
        bedsAvailable: hosp.bedsAvailable !== undefined ? hosp.bedsAvailable : (hosp.emergencyBeds || 6),
        icuAvailable: icuUnits,
        emergencyQueue: hosp.emergencyQueue || (hosp.opQueueCount ? `${hosp.opQueueCount} Waiting in Queue` : '4-6 min triage'),
        reviews: hosp.reviews || Math.floor((hosp.rating || 4.5) * 46),
        specialties: specs,
        doctors: (hosp.doctors || []).map(doc => ({
          ...doc,
          avatar: savedAvatars[doc.id] || DEFAULT_DOCTOR_AVATARS[doc.id] || doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
        }))
      };
    });
  });

  // LocalStorage Persistence Synchronization
  useEffect(() => {
    try {
      localStorage.setItem('cn_currentScreen', currentScreen);
    } catch {}
  }, [currentScreen]);

  useEffect(() => {
    try {
      localStorage.setItem('cn_screenHistory', JSON.stringify(screenHistory));
    } catch {}
  }, [screenHistory]);

  useEffect(() => {
    try {
      if (isLoggedIn && user && user.accountId) {
        localStorage.setItem('cn_user', JSON.stringify(user));
        if (user.role === 'Patient') {
          localStorage.setItem('cn_last_patient_account', JSON.stringify({
            ...user,
            appointments: appointments || [],
            records: records || []
          }));
        }
      }
    } catch {}
  }, [user, isLoggedIn, appointments, records]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('cn_last_patient_account')) {
        localStorage.setItem('cn_last_patient_account', JSON.stringify(SEED_ACCOUNTS['acc_alex']));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cn_appointments', JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('cn_records', JSON.stringify(records));
    } catch {}
  }, [records]);

  // Cloud Firestore Status & Live Diagnostics
  const [firestoreStatus, setFirestoreStatus] = useState({
    connected: false,
    status: isFirebaseConfigured ? 'CONNECTING' : 'UNCONFIGURED',
    projectId: 'care-navigator-a8a2d',
    message: isFirebaseConfigured ? 'Connecting to Cloud Firestore...' : 'Firebase is not configured.'
  });

  const [isDbInitializing, setIsDbInitializing] = useState(false);
  const [dbInitProgress, setDbInitProgress] = useState(null);
  const [dbInitResult, setDbInitResult] = useState(null);

  const refreshFirestoreStatus = async () => {
    try {
      const res = await checkFirestoreConnection();
      setFirestoreStatus(res);
      return res;
    } catch (e) {
      const errRes = {
        connected: false,
        status: 'OFFLINE',
        projectId: 'care-navigator-a8a2d',
        message: e?.message || 'Error checking Cloud Firestore'
      };
      setFirestoreStatus(errRes);
      return errRes;
    }
  };

  const initializeDatabase = async (force = false) => {
    setIsDbInitializing(true);
    setDbInitProgress({ percent: 5, message: 'Starting database initialization...' });
    try {
      const result = await initFirebaseDatabase({
        force,
        onProgress: (prog) => setDbInitProgress(prog)
      });
      setDbInitResult(result);
      await refreshFirestoreStatus();
      return result;
    } catch (err) {
      const res = { success: false, message: err?.message || 'Database initialization error' };
      setDbInitResult(res);
      return res;
    } finally {
      setIsDbInitializing(false);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured) {
      refreshFirestoreStatus().then((statusRes) => {
        if (statusRes?.connected) {
          checkAndAutoInitDatabase();
        }
      });
    }
  }, []);

  // Real-time Cloud Firestore synchronization
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    // 1. Listen to all registered accounts in Firestore
    const unsubAccounts = subscribeAccountsFromFirestore((firestoreAccounts) => {
      if (firestoreAccounts && Object.keys(firestoreAccounts).length > 0) {
        const localDb = getAccountDb();
        let changed = false;
        Object.entries(firestoreAccounts).forEach(([accId, accData]) => {
          if (!localDb[accId] || JSON.stringify(localDb[accId]) !== JSON.stringify(accData)) {
            localDb[accId] = accData;
            if (Array.isArray(accData.aliases)) {
              accData.aliases.forEach(al => { localDb[al] = accData; });
            }
            changed = true;
          }
        });
        if (changed) {
          saveAccountDb(localDb);
        }
      }
    });

    // 2. Listen to OP Token Appointments in Firestore
    const unsubAppointments = subscribeAppointmentsFromFirestore((firestoreAppts) => {
      if (Array.isArray(firestoreAppts) && firestoreAppts.length > 0) {
        setAppointments(prev => {
          const apptMap = {};
          firestoreAppts.forEach(a => {
            if (a && a.id) apptMap[a.id] = a;
          });
          const prevList = Array.isArray(prev) ? prev : [];
          prevList.forEach(a => {
            if (a && a.id && !apptMap[a.id]) apptMap[a.id] = a;
          });
          return Object.values(apptMap);
        });
      }
    });

    return () => {
      if (typeof unsubAccounts === 'function') unsubAccounts();
      if (typeof unsubAppointments === 'function') unsubAppointments();
    };
  }, []);

  // 3. Listen to current user profile updates in Firestore in real-time
  useEffect(() => {
    if (!isFirebaseConfigured || !isLoggedIn || !user?.accountId) return;

    const unsubUser = subscribeUserFromFirestore(user.accountId, (remoteUserData) => {
      if (remoteUserData) {
        setUser(prev => ({
          ...prev,
          ...remoteUserData
        }));
      }
    });

    return () => {
      if (typeof unsubUser === 'function') unsubUser();
    };
  }, [isLoggedIn, user?.accountId]);

  const navigateTo = (screen, resetHistory = false) => {
    // Check authentication reliably from React state OR localStorage
    const isAuth = isLoggedIn || (() => {
      try {
        return localStorage.getItem('cn_isLoggedIn') === 'true';
      } catch {
        return false;
      }
    })();

    const userRole = user?.role || (() => {
      try {
        const u = JSON.parse(localStorage.getItem('cn_user') || '{}');
        return u?.role || 'Patient';
      } catch {
        return 'Patient';
      }
    })();

    const defaultHome = userRole === 'Doctor'
      ? 'doctor-dashboard'
      : userRole === 'Receptionist'
        ? 'receptionist-dashboard'
        : (userRole === 'Responder' || userRole === 'Driver')
          ? 'responder'
          : (userRole === 'Admin' || userRole === 'Super Admin')
            ? 'admin'
            : 'dashboard';

    // If not authenticated and trying to access protected screens, redirect to onboarding
    if (!isAuth && screen !== 'landing' && screen !== 'onboarding' && screen !== 'admin' && !screen?.startsWith('admin')) {
      setCurrentScreenState('onboarding');
      return;
    }

    // If already authenticated and trying to navigate to landing or onboarding without logout, keep on defaultHome
    if (isAuth && (screen === 'landing' || screen === 'onboarding')) {
      setCurrentScreenState(defaultHome);
      try {
        window.history.replaceState({ screen: defaultHome }, '', `#${defaultHome}`);
      } catch {}
      return;
    }

    const targetScreen = (screen === 'admin' || (typeof screen === 'string' && screen.startsWith('admin'))) ? 'admin' : screen;

    if (targetScreen !== currentScreen) {
      if (resetHistory) {
        setScreenHistory([]);
      } else {
        setScreenHistory(prev => {
          if (isAuth) {
            const clean = prev.filter(s => s && s !== 'landing' && s !== 'onboarding');
            if (currentScreen && currentScreen !== 'landing' && currentScreen !== 'onboarding') {
              return [...clean, currentScreen];
            }
            return clean;
          }
          return [...prev, currentScreen];
        });
      }
      setCurrentScreenState(targetScreen);
      try {
        window.history.pushState({ screen: targetScreen }, '', `#${targetScreen}`);
      } catch {
        // ignore
      }
    }
  };

  const goBack = React.useCallback(() => {
    const isAuth = isLoggedIn || (() => {
      try {
        return localStorage.getItem('cn_isLoggedIn') === 'true';
      } catch {
        return false;
      }
    })();

    const userRole = user?.role || (() => {
      try {
        const u = JSON.parse(localStorage.getItem('cn_user') || '{}');
        return u?.role || 'Patient';
      } catch {
        return 'Patient';
      }
    })();

    const defaultHome = userRole === 'Doctor'
      ? 'doctor-dashboard'
      : userRole === 'Receptionist'
        ? 'receptionist-dashboard'
        : (userRole === 'Responder' || userRole === 'Driver')
          ? 'responder'
          : (userRole === 'Admin' || userRole === 'Super Admin')
            ? 'admin'
            : 'dashboard';

    setScreenHistory(prev => {
      if (isAuth) {
        // Filter out any invalid screens, landing, onboarding, or current screen duplicates
        const cleanHistory = prev.filter(s => s && s !== 'landing' && s !== 'onboarding' && s !== currentScreen);
        if (cleanHistory.length > 0) {
          const prevScreen = cleanHistory[cleanHistory.length - 1];
          setCurrentScreenState(prevScreen);
          try {
            window.history.replaceState({ screen: prevScreen }, '', `#${prevScreen}`);
          } catch {}
          return cleanHistory.slice(0, -1);
        } else {
          // If no history remains, stay on or return to default home (e.g. 'dashboard')
          // NEVER log out or go to landing!
          setCurrentScreenState(defaultHome);
          try {
            window.history.replaceState({ screen: defaultHome }, '', `#${defaultHome}`);
          } catch {}
          return [];
        }
      } else {
        if (prev.length > 0) {
          const prevScreen = prev[prev.length - 1];
          setCurrentScreenState(prevScreen);
          try {
            window.history.replaceState({ screen: prevScreen }, '', `#${prevScreen}`);
          } catch {}
          return prev.slice(0, -1);
        } else {
          setCurrentScreenState('landing');
          try {
            window.history.replaceState({ screen: 'landing' }, '', `#landing`);
          } catch {}
          return [];
        }
      }
    });
  }, [isLoggedIn, user?.role, currentScreen]);

  useEffect(() => {
    const userRole = user?.role || (() => {
      try { return JSON.parse(localStorage.getItem('cn_user') || '{}')?.role || 'Patient'; } catch { return 'Patient'; }
    })();
    const defaultHome = userRole === 'Doctor'
      ? 'doctor-dashboard'
      : userRole === 'Receptionist'
        ? 'receptionist-dashboard'
        : (userRole === 'Responder' || userRole === 'Driver')
          ? 'responder'
          : (userRole === 'Admin' || userRole === 'Super Admin')
            ? 'admin'
            : 'dashboard';

    const handlePopState = (event) => {
      const auth = isLoggedIn || (localStorage.getItem('cn_isLoggedIn') === 'true');
      let targetScreen = (event.state && event.state.screen) ? event.state.screen : null;
      if (!targetScreen) {
        const hash = window.location.hash ? window.location.hash.replace('#', '') : null;
        targetScreen = hash;
      }

      if (auth) {
        // If logged in and popping back to landing, onboarding, or empty/root:
        // Do NOT log out! Navigate to defaultHome and protect the user session!
        if (!targetScreen || targetScreen === 'landing' || targetScreen === 'onboarding') {
          setCurrentScreenState(defaultHome);
          setScreenHistory([]);
          try {
            window.history.replaceState({ screen: defaultHome }, '', `#${defaultHome}`);
          } catch {}
          return;
        }

        const normalized = (targetScreen === 'admin' || (typeof targetScreen === 'string' && targetScreen.startsWith('admin'))) ? 'admin' : targetScreen;
        setCurrentScreenState(normalized);
        setScreenHistory(prev => {
          const clean = prev.filter(s => s && s !== 'landing' && s !== 'onboarding');
          return clean.length > 0 ? clean.slice(0, -1) : [];
        });
      } else {
        if (targetScreen) {
          const normalized = (targetScreen === 'admin' || (typeof targetScreen === 'string' && targetScreen.startsWith('admin'))) ? 'admin' : targetScreen;
          setCurrentScreenState(normalized);
          setScreenHistory(prev => (prev.length > 0 ? prev.slice(0, -1) : []));
        } else {
          goBack();
        }
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : null;
      const auth = isLoggedIn || (localStorage.getItem('cn_isLoggedIn') === 'true');
      if (auth) {
        if (!hash || hash === 'landing' || hash === 'onboarding') {
          // Keep user safely on home screen if hash is landing/onboarding or empty
          setCurrentScreenState(defaultHome);
          try {
            window.history.replaceState({ screen: defaultHome }, '', `#${defaultHome}`);
          } catch {}
          return;
        }
        const normalized = (hash === 'admin' || (typeof hash === 'string' && hash.startsWith('admin'))) ? 'admin' : hash;
        setCurrentScreenState(normalized);
      } else {
        if (hash) {
          const normalized = (hash === 'admin' || (typeof hash === 'string' && hash.startsWith('admin'))) ? 'admin' : hash;
          setCurrentScreenState(normalized);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [goBack, isLoggedIn, user?.role]);

  const updateUserProfile = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      persistUserDataToDb(updated);
      try {
        localStorage.setItem('cn_user', JSON.stringify(updated));
        if (updated.role === 'Patient') {
          localStorage.setItem('cn_last_patient_account', JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
  };

  const lookupAccount = (identifier) => {
    const db = getAccountDb();
    return findAccountInDb(db, identifier);
  };

  const loginWithAccount = (identifier, roleHint = 'Patient', initialDefaults = {}) => {
    const account = findOrCreateAccount(identifier, roleHint, initialDefaults);
    setUser(account);
    if (account.appointments && Array.isArray(account.appointments)) {
      setAppointments(account.appointments);
    } else {
      setAppointments(prev => Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_APPOINTMENTS);
    }
    if (account.records && Array.isArray(account.records)) {
      setRecords(account.records);
    } else {
      setRecords(prev => Array.isArray(prev) && prev.length > 0 ? prev : DEFAULT_RECORDS);
    }
    setIsLoggedIn(true);
    try {
      localStorage.setItem('cn_isLoggedIn', 'true');
      localStorage.setItem('cn_user', JSON.stringify(account));
      if (account.role === 'Patient' || roleHint === 'Patient') {
        localStorage.setItem('cn_last_patient_account', JSON.stringify({
          ...account,
          appointments: account.appointments || DEFAULT_APPOINTMENTS,
          records: account.records || DEFAULT_RECORDS
        }));
      }
    } catch {}
    return account;
  };

  const returnToPatientPortal = () => {
    try {
      let patientAccount = null;
      try {
        const raw = localStorage.getItem('cn_last_patient_account');
        if (raw) patientAccount = JSON.parse(raw);
      } catch {}

      if (!patientAccount) {
        const db = getAccountDb();
        const found = Object.values(db).find(acc => acc && acc.role === 'Patient');
        if (found) patientAccount = found;
      }

      if (!patientAccount) {
        patientAccount = SEED_ACCOUNTS['acc_alex'] || DEFAULT_USER;
      }

      patientAccount = { ...patientAccount, role: 'Patient' };

      // Set user & auth state
      setUser(patientAccount);
      setIsLoggedIn(true);

      // Restore appointments
      if (Array.isArray(patientAccount.appointments) && patientAccount.appointments.length > 0) {
        setAppointments(patientAccount.appointments);
        try { localStorage.setItem('cn_appointments', JSON.stringify(patientAccount.appointments)); } catch {}
      } else {
        try {
          const savedApps = localStorage.getItem('cn_appointments');
          if (savedApps) {
            setAppointments(JSON.parse(savedApps));
          } else {
            setAppointments(DEFAULT_APPOINTMENTS);
          }
        } catch {
          setAppointments(DEFAULT_APPOINTMENTS);
        }
      }

      // Restore records
      if (Array.isArray(patientAccount.records) && patientAccount.records.length > 0) {
        setRecords(patientAccount.records);
        try { localStorage.setItem('cn_records', JSON.stringify(patientAccount.records)); } catch {}
      } else {
        try {
          const savedRecs = localStorage.getItem('cn_records');
          if (savedRecs) {
            setRecords(JSON.parse(savedRecs));
          } else {
            setRecords(DEFAULT_RECORDS);
          }
        } catch {
          setRecords(DEFAULT_RECORDS);
        }
      }

      try {
        localStorage.setItem('cn_user', JSON.stringify(patientAccount));
        localStorage.setItem('cn_isLoggedIn', 'true');
        localStorage.setItem('cn_last_patient_account', JSON.stringify(patientAccount));
        sessionStorage.removeItem('cn_admin_unlocked');
      } catch {}

      setCurrentScreenState('dashboard');
      try {
        window.history.pushState({ screen: 'dashboard' }, '', '#dashboard');
      } catch {}
      return patientAccount;
    } catch (err) {
      console.error('Failed to return to patient portal:', err);
      setCurrentScreenState('dashboard');
    }
  };

  const switchRole = (role) => {
    if (role === 'Patient' || role === 'User') {
      return returnToPatientPortal();
    }
    if (role === 'Doctor') {
      loginWithAccount('DOCTOR-001', 'Doctor');
      setCurrentScreenState('doctor-dashboard');
      try {
        window.history.pushState({ screen: 'doctor-dashboard' }, '', '#doctor-dashboard');
      } catch {}
      return;
    }
    if (role === 'Receptionist') {
      loginWithAccount('reception.narasaraopet@gmail.com', 'Receptionist');
      setCurrentScreenState('receptionist-dashboard');
      try {
        window.history.pushState({ screen: 'receptionist-dashboard' }, '', '#receptionist-dashboard');
      } catch {}
      return;
    }
    if (role === 'Responder' || role === 'Driver') {
      loginWithAccount('9876510800', 'Responder');
      setCurrentScreenState('responder');
      try {
        window.history.pushState({ screen: 'responder' }, '', '#responder');
      } catch {}
      return;
    }
    if (role === 'Admin' || role === 'Super Admin') {
      loginWithAccount('acc_admin', 'Super Admin');
      setCurrentScreenState('admin');
      try {
        window.history.pushState({ screen: 'admin' }, '', '#admin');
      } catch {}
      return;
    }
    returnToPatientPortal();
  };

  const logout = () => {
    // Preserve the active user's latest saved data, appointments, and records in cn_accounts_db and cn_last_patient_account
    try {
      if (isLoggedIn && user && user.accountId) {
        persistUserDataToDb(user, { appointments, records });
        if (user.role === 'Patient') {
          localStorage.setItem('cn_last_patient_account', JSON.stringify({ ...user, appointments, records }));
        }
      }
    } catch {}

    try {
      localStorage.removeItem('cn_currentScreen');
      localStorage.removeItem('cn_screenHistory');
      localStorage.removeItem('cn_user');
      localStorage.removeItem('cn_appointments');
      localStorage.removeItem('cn_records');
      localStorage.removeItem('cn_isLoggedIn');
    } catch {}

    setIsLoggedIn(false);
    setUser(DEFAULT_USER);
    setAppointments(DEFAULT_APPOINTMENTS);
    setRecords(DEFAULT_RECORDS);
    setScreenHistory([]);
    setCurrentScreenState('landing');
    try {
      window.history.replaceState({ screen: 'landing' }, '', '#landing');
    } catch {}
  };

  const bookOPToken = (tokenData) => {
    const newToken = {
      id: 'op-' + Date.now(),
      tokenNumber: Math.floor(Math.random() * 30 + 10).toString(),
      date: 'Today',
      status: 'ACTIVE',
      currentServing: '8',
      queueAhead: 4,
      qrCode: `OP-TOKEN-${Date.now().toString().slice(-4)}`,
      patientId: user?.accountId || user?.aadharNumber || 'anonymous',
      patientName: user?.name || user?.fullName || 'Patient',
      createdAt: new Date().toISOString(),
      ...tokenData
    };
    setAppointments(prev => {
      const updated = [newToken, ...prev];
      if (user) {
        persistUserDataToDb(user, { appointments: updated });
        if (user.role === 'Patient') {
          try {
            localStorage.setItem('cn_last_patient_account', JSON.stringify({ ...user, appointments: updated }));
          } catch {}
        }
      }
      return updated;
    });

    // Save to Cloud Firestore
    try {
      saveAppointmentToFirestore(newToken);
    } catch (e) {
      console.warn('[Firestore] Failed to save appointment:', e);
    }

    navigateTo('appointments');
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => {
      const updated = prev.map(app => app.id === id ? { ...app, status: 'CANCELLED' } : app);
      if (user) {
        persistUserDataToDb(user, { appointments: updated });
        if (user.role === 'Patient') {
          try {
            localStorage.setItem('cn_last_patient_account', JSON.stringify({ ...user, appointments: updated }));
          } catch {}
        }
      }
      return updated;
    });

    try {
      updateAppointmentInFirestore(id, { status: 'CANCELLED' });
    } catch (e) {
      console.warn('[Firestore] Failed to cancel appointment in Firestore:', e);
    }
  };

  const addMedicalRecord = (newRec) => {
    const record = { id: 'rec-' + Date.now(), ...newRec };
    setRecords(prev => {
      const updated = [record, ...prev];
      if (user) {
        persistUserDataToDb(user, { records: updated });
        if (user.role === 'Patient') {
          try {
            localStorage.setItem('cn_last_patient_account', JSON.stringify({ ...user, records: updated }));
          } catch {}
        }
      }
      return updated;
    });

    try {
      saveMedicalRecordToFirestore({
        ...record,
        userId: user?.accountId || user?.aadharNumber || 'patient'
      });
    } catch (e) {
      console.warn('[Firestore] Failed to save medical record in Firestore:', e);
    }
  };

  const updateDoctorAvatar = (docId, newAvatarUrl) => {
    try {
      let savedAvatars = {};
      const s = localStorage.getItem('cn_doctor_avatars');
      if (s) savedAvatars = JSON.parse(s);
      savedAvatars[docId] = newAvatarUrl;
      localStorage.setItem('cn_doctor_avatars', JSON.stringify(savedAvatars));
    } catch (err) {
      console.warn('Failed to save doctor avatar to localStorage:', err);
    }

    setHospitals(prevHospitals => 
      prevHospitals.map(hosp => ({
        ...hosp,
        doctors: (hosp.doctors || []).map(doc => 
          doc.id === docId ? { ...doc, avatar: newAvatarUrl } : doc
        )
      }))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen: setCurrentScreenState,
        screenHistory,
        navigateTo,
        goBack,
        isLoggedIn,
        setIsLoggedIn,
        user,
        updateUserProfile,
        switchRole,
        logout,
        returnToPatientPortal,
        appointments,
        bookOPToken,
        cancelAppointment,
        hospitals,
        records,
        addMedicalRecord,
        updateDoctorAvatar,
        loginWithAccount,
        lookupAccount,
        getStoredAccounts: getAccountDb,
        isFirebaseConfigured,
        firebaseConfig,
        firestoreStatus,
        refreshFirestoreStatus,
        initializeDatabase,
        isDbInitializing,
        dbInitProgress,
        dbInitResult,
        isDatabaseInitialized
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
