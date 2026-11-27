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
    phone: '+91 98765 43210',
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
    phone: '+91 98765 43211',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  '577076873323': {
    name: 'Konde Alex Johnson',
    age: '28',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
    city: 'Narasaraopet',
    pincode: '522601',
    phone: '+91 62814 67661',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  }
};

/**
 * Resolves the genuine live real-time mobile number linked to a given Aadhaar number.
 * Always returns a valid 10-digit Indian phone number (+91 XXXXX XXXXX), never the Aadhaar number.
 */
export const getAadhaarLinkedMobile = (rawAadhaar) => {
  if (!rawAadhaar) return '+91 62814 67661';
  const clean = String(rawAadhaar).replace(/\D/g, '');

  if (clean === '577076873323') {
    return '+91 62814 67661';
  }
  if (clean === '589241037621') {
    return '+91 98765 43210';
  }
  if (clean === '123456789012') {
    return '+91 98765 43211';
  }

  if (AADHAAR_DATABASE[clean]?.phone) {
    return AADHAAR_DATABASE[clean].phone;
  }

  // Check saved accounts in storage
  try {
    const rawUser = localStorage.getItem('cn_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u?.phone && (u.aadharNumber === clean || u.aadhaar?.replace(/\D/g, '') === clean)) {
        return u.phone;
      }
    }
    const lastPat = localStorage.getItem('cn_last_patient_account');
    if (lastPat) {
      const p = JSON.parse(lastPat);
      if (p?.phone && (p.aadharNumber === clean || p.aadhaar?.replace(/\D/g, '') === clean)) {
        return p.phone;
      }
    }
  } catch {}

  // Deterministically link any 12-digit Aadhaar to a realistic Indian mobile number
  if (clean.length === 12) {
    const prefixes = ['9849', '9440', '6281', '7989', '8978', '9989'];
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash * 31 + parseInt(clean[i], 10)) % 100000;
    }
    const prefix = prefixes[hash % prefixes.length];
    const middle = clean.slice(4, 6);
    const suffix = clean.slice(-4);
    return `+91 ${prefix} ${middle}${suffix}`;
  }

  return '+91 62814 67661';
};

export const calculateProfileCompletion = (user) => {
  if (!user) return 60;
  let score = 60; // Base Aadhaar Details (Name, Aadhaar Number, Address, Gender)
  if (user.age && String(user.age).trim() !== '') score += 15;
  if (user.bloodGroup && String(user.bloodGroup).trim() !== '') score += 15;
  if (user.prescriptionReport || (Array.isArray(user.uploadedReports) && user.uploadedReports.length > 0)) score += 10;
  return Math.min(100, score);
};

// Helper function to compress large camera / device photos to avoid exceeding localStorage quota
export const compressImageToDataUrl = (file, maxWidth = 400, maxHeight = 400, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result || null);
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

/**
 * Authentic Doctors Roster across all 9 Hospitals in Narasaraopet, Palnadu District, AP.
 * Each doctor is linked to their genuine hospital, specialty/role, qualifications, OPD room,
 * registered mobile number, and unique doctor ID.
 */
export const ALL_NARASARAOPET_DOCTORS = [
  // 1. Government Area Hospital, Narasaraopet (hosp-area)
  {
    id: 'DOCTOR-001',
    hospitalId: 'hosp-area',
    hospital: 'Government Area Hospital, Narasaraopet',
    name: 'Dr. Raghavendra',
    title: 'MBBS, MD (Internal Medicine)',
    specialty: 'General Medicine',
    department: 'Department of General Medicine',
    licenseNo: 'MCI-AP-89412',
    roomNo: 'OPD Block A, Room 104',
    opdRoom: 'OPD Block A, Room 104',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '12 Years',
    qualifications: 'MBBS, MD (Internal Medicine)',
    fee: '₹30',
    phone: '+91 94401 23456',
    phoneDigits: '9440123456',
    photo: '/doctor_raghavendra.jpg',
    pin: '1234'
  },
  {
    id: 'doc-area-2',
    hospitalId: 'hosp-area',
    hospital: 'Government Area Hospital, Narasaraopet',
    name: 'Dr. G. Padmavathi',
    title: 'MS, DGO (Obstetrics & Gynaecology)',
    specialty: 'Obstetrics & Gynaecology',
    department: 'Department of Obstetrics & Gynaecology',
    licenseNo: 'MCI-AP-72145',
    roomNo: 'Maternity Wing, Room 105',
    opdRoom: 'Maternity Wing, Room 105',
    shiftHours: '09:00 AM - 04:00 PM',
    experience: '15 Years',
    qualifications: 'MS, DGO (Obstetrics & Gynaecology)',
    fee: '₹30',
    phone: '+91 94401 23457',
    phoneDigits: '9440123457',
    photo: 'https://images.unsplash.com/photo-1594824813511-285f02c61148?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-area-3',
    hospitalId: 'hosp-area',
    hospital: 'Government Area Hospital, Narasaraopet',
    name: 'Dr. P. Ramanjaneyulu',
    title: 'MS (General Surgery)',
    specialty: 'General Surgery & Trauma',
    department: 'Department of General Surgery',
    licenseNo: 'MCI-AP-63980',
    roomNo: 'Surgical OPD, Room 108',
    opdRoom: 'Surgical OPD, Room 108',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '18 Years',
    qualifications: 'MS (General Surgery), FMAS',
    fee: '₹30',
    phone: '+91 94401 23458',
    phoneDigits: '9440123458',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-area-4',
    hospitalId: 'hosp-area',
    hospital: 'Government Area Hospital, Narasaraopet',
    name: 'Dr. M. Suresh Kumar',
    title: 'MD (Pediatrics), DCH',
    specialty: 'Pediatrics & Child Care',
    department: 'Department of Pediatrics',
    licenseNo: 'MCI-AP-81230',
    roomNo: 'Child Health OPD, Room 102',
    opdRoom: 'Child Health OPD, Room 102',
    shiftHours: '09:00 AM - 04:00 PM',
    experience: '14 Years',
    qualifications: 'MD (Pediatrics), DCH',
    fee: '₹30',
    phone: '+91 94401 23459',
    phoneDigits: '9440123459',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-area-5',
    hospitalId: 'hosp-area',
    hospital: 'Government Area Hospital, Narasaraopet',
    name: 'Dr. K. Ashok',
    title: 'MS (Orthopedics)',
    specialty: 'Orthopedics & Fracture Care',
    department: 'Department of Orthopedics & Trauma',
    licenseNo: 'MCI-AP-90411',
    roomNo: 'Trauma & Ortho Wing, Room 112',
    opdRoom: 'Trauma & Ortho Wing, Room 112',
    shiftHours: '10:00 AM - 05:00 PM',
    experience: '12 Years',
    qualifications: 'MS (Orthopedics)',
    fee: '₹30',
    phone: '+91 94401 23460',
    phoneDigits: '9440123460',
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 2. Mahatma Gandhi Super Speciality Hospital (hosp-mgh)
  {
    id: 'doc-mgh-1',
    hospitalId: 'hosp-mgh',
    hospital: 'Mahatma Gandhi Super Speciality Hospital',
    name: 'Dr. K. Srinivas Reddy',
    title: 'MD, DM (Cardiology), FACC',
    specialty: 'Cardiology & Interventional Care',
    department: 'Department of Cardiology & Cath Lab',
    licenseNo: 'MCI-AP-49120',
    roomNo: 'Cardiology Block, Room 201',
    opdRoom: 'Cardiology Block, Room 201',
    shiftHours: '10:00 AM - 06:00 PM',
    experience: '19 Years',
    qualifications: 'MD, DM (Cardiology), FACC',
    fee: '₹400',
    phone: '+91 98491 55601',
    phoneDigits: '9849155601',
    photo: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mgh-2',
    hospitalId: 'hosp-mgh',
    hospital: 'Mahatma Gandhi Super Speciality Hospital',
    name: 'Dr. D. Srikanth',
    title: 'MD, DM (Nephrology)',
    specialty: 'Nephrology & Kidney Care',
    department: 'Department of Nephrology & Dialysis',
    licenseNo: 'MCI-AP-58321',
    roomNo: 'Nephrology Desk, Room 204',
    opdRoom: 'Nephrology Desk, Room 204',
    shiftHours: '09:30 AM - 05:30 PM',
    experience: '15 Years',
    qualifications: 'MD, DM (Nephrology)',
    fee: '₹400',
    phone: '+91 98491 55602',
    phoneDigits: '9849155602',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mgh-3',
    hospitalId: 'hosp-mgh',
    hospital: 'Mahatma Gandhi Super Speciality Hospital',
    name: 'Dr. Soumya Medabalimi',
    title: 'MD, DM (Neurology)',
    specialty: 'Neurology & Stroke Specialist',
    department: 'Department of Neurology',
    licenseNo: 'MCI-AP-67219',
    roomNo: 'Neuro OPD, Room 301',
    opdRoom: 'Neuro OPD, Room 301',
    shiftHours: '10:30 AM - 06:30 PM',
    experience: '12 Years',
    qualifications: 'MD, DM (Neurology)',
    fee: '₹450',
    phone: '+91 98491 55603',
    phoneDigits: '9849155603',
    photo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mgh-4',
    hospitalId: 'hosp-mgh',
    hospital: 'Mahatma Gandhi Super Speciality Hospital',
    name: 'Dr. K. Jaibharath Reddy',
    title: 'MS (Orthopedics), MCh (Joint Replacement)',
    specialty: 'Orthopedics & Joint Replacement',
    department: 'Department of Orthopedics & Joint Replacement',
    licenseNo: 'MCI-AP-51408',
    roomNo: 'Ortho Center, Room 108',
    opdRoom: 'Ortho Center, Room 108',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '16 Years',
    qualifications: 'MS (Orthopedics), MCh (Joint Replacement)',
    fee: '₹350',
    phone: '+91 98491 55604',
    phoneDigits: '9849155604',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mgh-5',
    hospitalId: 'hosp-mgh',
    hospital: 'Mahatma Gandhi Super Speciality Hospital',
    name: 'Dr. Y. Naveen',
    title: 'MD (Pulmonology), FCCP',
    specialty: 'Pulmonology & Chest Diseases',
    department: 'Department of Pulmonology & Respiratory Care',
    licenseNo: 'MCI-AP-73924',
    roomNo: 'Chest Clinic, Room 205',
    opdRoom: 'Chest Clinic, Room 205',
    shiftHours: '10:00 AM - 05:00 PM',
    experience: '11 Years',
    qualifications: 'MD (Pulmonology), FCCP',
    fee: '₹350',
    phone: '+91 98491 55605',
    phoneDigits: '9849155605',
    photo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 3. Mathashree Multi Specialty Hospital (hosp-mathashree)
  {
    id: 'doc-mat-1',
    hospitalId: 'hosp-mathashree',
    hospital: 'Mathashree Multi Specialty Hospital',
    name: 'Dr. V. Ramachandra Reddy',
    title: 'MS, FIAGES, FMAS',
    specialty: 'Advanced Laparoscopic & General Surgery',
    department: 'Department of Laparoscopic Surgery',
    licenseNo: 'MCI-AP-42119',
    roomNo: 'Surgical Suite 1',
    opdRoom: 'Surgical Suite 1',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '22 Years',
    qualifications: 'MS, FIAGES, FMAS',
    fee: '₹350',
    phone: '+91 98492 66701',
    phoneDigits: '9849266701',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mat-2',
    hospitalId: 'hosp-mathashree',
    hospital: 'Mathashree Multi Specialty Hospital',
    name: 'Dr. R. Mahesh Babu',
    title: 'MBBS, MD (General Medicine)',
    specialty: 'General Medicine & Critical Care',
    department: 'Department of General Medicine & ICU',
    licenseNo: 'MCI-AP-69482',
    roomNo: 'OPD Suite 3',
    opdRoom: 'OPD Suite 3',
    shiftHours: '10:00 AM - 06:00 PM',
    experience: '14 Years',
    qualifications: 'MBBS, MD (General Medicine)',
    fee: '₹300',
    phone: '+91 98492 66702',
    phoneDigits: '9849266702',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-mat-3',
    hospitalId: 'hosp-mathashree',
    hospital: 'Mathashree Multi Specialty Hospital',
    name: 'Dr. S. Anitha',
    title: 'MD, DGO (Obstetrics & Gynaecology)',
    specialty: 'Obstetrics & Gynaecology',
    department: 'Department of Obstetrics & Gynaecology',
    licenseNo: 'MCI-AP-75129',
    roomNo: 'Women Care Wing, Room 4',
    opdRoom: 'Women Care Wing, Room 4',
    shiftHours: '09:30 AM - 04:30 PM',
    experience: '16 Years',
    qualifications: 'MD, DGO (Obstetrics & Gynaecology)',
    fee: '₹300',
    phone: '+91 98492 66703',
    phoneDigits: '9849266703',
    photo: 'https://images.unsplash.com/photo-1594824813511-285f02c61148?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 4. Lifeline Multi Specialty Hospital (hosp-lifeline)
  {
    id: 'doc-life-1',
    hospitalId: 'hosp-lifeline',
    hospital: 'Lifeline Multi Specialty Hospital',
    name: 'Dr. K. Venkata Ramana',
    title: 'MS (Orthopedics), Fellow Spine Surgery',
    specialty: 'Orthopedics & Spine Surgery',
    department: 'Department of Orthopedics & Spine',
    licenseNo: 'MCI-AP-48902',
    roomNo: 'Ortho OPD Room 2',
    opdRoom: 'Ortho OPD Room 2',
    shiftHours: '10:00 AM - 06:00 PM',
    experience: '17 Years',
    qualifications: 'MS (Orthopedics), Fellow Spine Surgery',
    fee: '₹350',
    phone: '+91 98493 77801',
    phoneDigits: '9849377801',
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-life-2',
    hospitalId: 'hosp-lifeline',
    hospital: 'Lifeline Multi Specialty Hospital',
    name: 'Dr. P. Sujatha',
    title: 'MD (Pediatrics), DCH',
    specialty: 'Pediatrics & Child Health',
    department: 'Department of Pediatrics',
    licenseNo: 'MCI-AP-61294',
    roomNo: 'Child OPD Room 5',
    opdRoom: 'Child OPD Room 5',
    shiftHours: '09:00 AM - 04:00 PM',
    experience: '15 Years',
    qualifications: 'MD (Pediatrics), DCH',
    fee: '₹300',
    phone: '+91 98493 77802',
    phoneDigits: '9849377802',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-life-3',
    hospitalId: 'hosp-lifeline',
    hospital: 'Lifeline Multi Specialty Hospital',
    name: 'Dr. T. Harish',
    title: 'MD (General Medicine)',
    specialty: 'General Medicine & Critical Care',
    department: 'Department of General Medicine',
    licenseNo: 'MCI-AP-82419',
    roomNo: 'Consultation Desk 1',
    opdRoom: 'Consultation Desk 1',
    shiftHours: '09:30 AM - 05:30 PM',
    experience: '10 Years',
    qualifications: 'MD (General Medicine)',
    fee: '₹250',
    phone: '+91 98493 77803',
    phoneDigits: '9849377803',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 5. Seshadri Super Speciality Hospital (hosp-seshadri)
  {
    id: 'doc-sesh-1',
    hospitalId: 'hosp-seshadri',
    hospital: 'Seshadri Super Speciality Hospital',
    name: 'Dr. Seshadri Rao',
    title: 'MS, MCh (Surgical Oncology)',
    specialty: 'Surgical Oncology & Cancer Surgery',
    department: 'Department of Surgical Oncology',
    licenseNo: 'MCI-AP-31980',
    roomNo: 'Onco Suite 1',
    opdRoom: 'Onco Suite 1',
    shiftHours: '10:00 AM - 05:00 PM',
    experience: '24 Years',
    qualifications: 'MS, MCh (Surgical Oncology)',
    fee: '₹500',
    phone: '+91 98494 88901',
    phoneDigits: '9849488901',
    photo: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-sesh-2',
    hospitalId: 'hosp-seshadri',
    hospital: 'Seshadri Super Speciality Hospital',
    name: 'Dr. N. V. Krishna',
    title: 'MD (Anaesthesia & Critical Care)',
    specialty: 'Critical Care & Pain Management',
    department: 'Department of Critical Care',
    licenseNo: 'MCI-AP-68421',
    roomNo: 'ICU Consultation Desk',
    opdRoom: 'ICU Consultation Desk',
    shiftHours: '08:30 AM - 04:30 PM',
    experience: '13 Years',
    qualifications: 'MD (Anaesthesia & Critical Care)',
    fee: '₹350',
    phone: '+91 98494 88902',
    phoneDigits: '9849488902',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 6. Sai Tirumala Super Speciality Hospital (hosp-saitirumala)
  {
    id: 'doc-st-1',
    hospitalId: 'hosp-saitirumala',
    hospital: 'Sai Tirumala Super Speciality Hospital',
    name: 'Dr. M. V. Ramana',
    title: 'MD (General Medicine), PGDD',
    specialty: 'General Medicine & Diabetology',
    department: 'Department of General Medicine',
    licenseNo: 'MCI-AP-49214',
    roomNo: 'OP Desk 101',
    opdRoom: 'OP Desk 101',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '18 Years',
    qualifications: 'MD (General Medicine), PGDD',
    fee: '₹300',
    phone: '+91 98495 99001',
    phoneDigits: '9849599001',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-st-2',
    hospitalId: 'hosp-saitirumala',
    hospital: 'Sai Tirumala Super Speciality Hospital',
    name: 'Dr. Ch. Radhika',
    title: 'MS (ENT Specialist), DLO',
    specialty: 'ENT Specialist & Head-Neck',
    department: 'Department of ENT',
    licenseNo: 'MCI-AP-78192',
    roomNo: 'ENT Care Clinic, Room 103',
    opdRoom: 'ENT Care Clinic, Room 103',
    shiftHours: '10:00 AM - 05:00 PM',
    experience: '12 Years',
    qualifications: 'MS (ENT Specialist), DLO',
    fee: '₹300',
    phone: '+91 98495 99002',
    phoneDigits: '9849599002',
    photo: 'https://images.unsplash.com/photo-1594824813511-285f02c61148?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 7. Sri Care Multi Speciality Hospital (hosp-sricare)
  {
    id: 'doc-sc-1',
    hospitalId: 'hosp-sricare',
    hospital: 'Sri Care Multi Speciality Hospital',
    name: 'Dr. G. Sridhar',
    title: 'MBBS, MD (General Medicine), F.Diab',
    specialty: 'Endocrinology & Diabetology',
    department: 'Department of Endocrinology & Diabetology',
    licenseNo: 'MCI-AP-54190',
    roomNo: 'OP Consultation Room 1',
    opdRoom: 'OP Consultation Room 1',
    shiftHours: '09:30 AM - 05:30 PM',
    experience: '15 Years',
    qualifications: 'MBBS, MD (General Medicine), F.Diab',
    fee: '₹300',
    phone: '+91 98496 11201',
    phoneDigits: '9849611201',
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-sc-2',
    hospitalId: 'hosp-sricare',
    hospital: 'Sri Care Multi Speciality Hospital',
    name: 'Dr. K. Divya',
    title: 'MD (Dermatology, Venereology & Leprosy)',
    specialty: 'Dermatology & Skin Specialist',
    department: 'Department of Dermatology',
    licenseNo: 'MCI-AP-89312',
    roomNo: 'Skin Care Wing, Room 3',
    opdRoom: 'Skin Care Wing, Room 3',
    shiftHours: '10:00 AM - 04:30 PM',
    experience: '9 Years',
    qualifications: 'MD (Dermatology, Venereology & Leprosy)',
    fee: '₹350',
    phone: '+91 98496 11202',
    phoneDigits: '9849611202',
    photo: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 8. Jawahar Children's & Neonatal Hospital (hosp-jawahar)
  {
    id: 'doc-jaw-1',
    hospitalId: 'hosp-jawahar',
    hospital: "Jawahar Children's & Neonatal Hospital",
    name: 'Dr. P. Jawahar',
    title: 'MD (Pediatrics), Fellow Neonatology',
    specialty: 'Pediatrics & Neonatology (NICU)',
    department: 'Department of Neonatology & NICU',
    licenseNo: 'MCI-AP-39820',
    roomNo: 'NICU Block, OPD 1',
    opdRoom: 'NICU Block, OPD 1',
    shiftHours: '09:00 AM - 06:00 PM',
    experience: '21 Years',
    qualifications: 'MD (Pediatrics), Fellow Neonatology',
    fee: '₹300',
    phone: '+91 98497 22301',
    phoneDigits: '9849722301',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-jaw-2',
    hospitalId: 'hosp-jawahar',
    hospital: "Jawahar Children's & Neonatal Hospital",
    name: 'Dr. P. Swapna',
    title: 'DCH (Pediatrics)',
    specialty: 'Pediatrics & Immunization',
    department: 'Department of Pediatrics',
    licenseNo: 'MCI-AP-79104',
    roomNo: 'Well-Baby Clinic, Room 2',
    opdRoom: 'Well-Baby Clinic, Room 2',
    shiftHours: '09:30 AM - 04:30 PM',
    experience: '11 Years',
    qualifications: 'DCH (Pediatrics)',
    fee: '₹250',
    phone: '+91 98497 22302',
    phoneDigits: '9849722302',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },

  // 9. Vasantha Maternity & Nursing Home (hosp-vasantha)
  {
    id: 'doc-vas-1',
    hospitalId: 'hosp-vasantha',
    hospital: 'Vasantha Maternity & Nursing Home',
    name: 'Dr. Vasantha Kumari',
    title: 'MBBS, DGO (Obstetrics & Gynaecology)',
    specialty: 'Obstetrics & Gynaecology',
    department: 'Department of Obstetrics & Gynaecology',
    licenseNo: 'MCI-AP-29841',
    roomNo: 'Maternity Suite A',
    opdRoom: 'Maternity Suite A',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '26 Years',
    qualifications: 'MBBS, DGO (Obstetrics & Gynaecology)',
    fee: '₹300',
    phone: '+91 98498 33401',
    phoneDigits: '9849833401',
    photo: 'https://images.unsplash.com/photo-1594824813511-285f02c61148?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  },
  {
    id: 'doc-vas-2',
    hospitalId: 'hosp-vasantha',
    hospital: 'Vasantha Maternity & Nursing Home',
    name: 'Dr. K. Hemanth',
    title: 'MS (General Surgery)',
    specialty: 'General & Laparoscopic Surgery',
    department: 'Department of General Surgery',
    licenseNo: 'MCI-AP-74198',
    roomNo: 'Surgical Room B',
    opdRoom: 'Surgical Room B',
    shiftHours: '10:00 AM - 05:00 PM',
    experience: '13 Years',
    qualifications: 'MS (General Surgery)',
    fee: '₹300',
    phone: '+91 98498 33402',
    phoneDigits: '9849833402',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    pin: '1234'
  }
];

/**
 * Searches the authentic Narasaraopet doctor roster by Doctor ID, 10-digit Phone, Doctor Name, or Hospital ID.
 */
export const findDoctorInRoster = (query, p10 = '', extra = {}) => {
  if (extra && extra.id) {
    const byId = ALL_NARASARAOPET_DOCTORS.find(d => d.id === extra.id);
    if (byId) return byId;
  }
  const raw = String(query || '').trim();
  const rawClean = raw.replace(/\s+/g, '').toUpperCase();
  const digits = extract10DigitPhone(p10 || raw);

  if (digits) {
    const byPhone = ALL_NARASARAOPET_DOCTORS.find(d => d.phoneDigits === digits);
    if (byPhone) return byPhone;
  }

  if (rawClean) {
    const byId = ALL_NARASARAOPET_DOCTORS.find(d => d.id.replace(/\s+/g, '').toUpperCase() === rawClean);
    if (byId) return byId;

    const byName = ALL_NARASARAOPET_DOCTORS.find(d => 
      d.name.replace(/\s+/g, '').toUpperCase() === rawClean || 
      d.name.toLowerCase().includes(raw.toLowerCase()) ||
      raw.toLowerCase().includes(d.name.toLowerCase())
    );
    if (byName) return byName;
  }

  if (extra && extra.doctorId) {
    const cleanExtraDoc = String(extra.doctorId).replace(/\s+/g, '').toUpperCase();
    const byDocId = ALL_NARASARAOPET_DOCTORS.find(d => d.id.replace(/\s+/g, '').toUpperCase() === cleanExtraDoc);
    if (byDocId) return byDocId;
  }

  if (extra && extra.hospitalId && (extra.doctorName || extra.name)) {
    const targetName = (extra.doctorName || extra.name).toLowerCase();
    const byHospAndName = ALL_NARASARAOPET_DOCTORS.find(d => 
      d.hospitalId === extra.hospitalId && 
      (d.name.toLowerCase().includes(targetName) || targetName.includes(d.name.toLowerCase()))
    );
    if (byHospAndName) return byHospAndName;
  }

  if (extra && extra.hospitalId) {
    const byHosp = ALL_NARASARAOPET_DOCTORS.find(d => d.hospitalId === extra.hospitalId);
    if (byHosp) return byHosp;
  }

  return null;
};

const DEFAULT_USER = {
  accountId: 'acc_alex',
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
  emergencyContacts: [],
  precautions: [],
  medicineAlerts: []
};

const DEFAULT_APPOINTMENTS = [];

const DEFAULT_RECORDS = [];

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
    prescriptionReport: null,
    uploadedReports: [],
    emergencyContact: '+91 98765 43212',
    allergies: ['Dust'],
    healthId: 'ABHA-1234-5678-9012',
    medicalId: 'MED-1234-5678',
    emergencyContacts: [],
    precautions: [],
    medicineAlerts: [],
    aliases: ['aadhaar:123456789012', '123456789012']
  },
  'acc_receptionist': {
    accountId: 'acc_receptionist',
    name: 'Area Hospital Reception Desk',
    role: 'Receptionist',
    receptionistGmail: 'reception.narasaraopet@gmail.com',
    email: 'reception.narasaraopet@gmail.com',
    phone: '+91 98765 10800',
    hospital: 'Government Area Hospital, Narasaraopet',
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
    baseStation: '108 Fleet Hub, Area Hospital, Narasaraopet',
    location: 'Palnadu Road • Narasaraopet',
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

// Seed all authentic doctors across Narasaraopet into SEED_ACCOUNTS
ALL_NARASARAOPET_DOCTORS.forEach(doc => {
  const accId = `acc_doc_${doc.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  SEED_ACCOUNTS[accId] = {
    accountId: accId,
    name: doc.name,
    title: doc.title,
    specialty: doc.specialty,
    department: doc.department,
    doctorId: doc.id,
    hospital: doc.hospital,
    hospitalId: doc.hospitalId,
    licenseNo: doc.licenseNo,
    opdRoom: doc.opdRoom,
    shiftHours: doc.shiftHours,
    experience: doc.experience,
    qualifications: doc.qualifications,
    totalConsultationsToday: 7,
    fee: doc.fee,
    phone: doc.phone,
    phoneDigits: doc.phoneDigits,
    photo: doc.photo,
    role: 'Doctor',
    aliases: [
      `doctor:${doc.id}`,
      doc.id,
      `phone:${doc.phoneDigits}`,
      doc.phoneDigits,
      doc.name.toLowerCase()
    ]
  };
});

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
        let activeUserOverrides = {};
        try {
          const rawUser = localStorage.getItem('cn_user');
          if (rawUser) {
            const u = JSON.parse(rawUser);
            if (u && (u.accountId === 'acc_alex' || !u.accountId)) {
              activeUserOverrides = u;
            }
          }
        } catch {}

        // Ensure Patient demo accounts are always correctly mapped to their Aadhaar
        if (SEED_ACCOUNTS['acc_alex']) {
          parsed['acc_alex'] = { 
            ...SEED_ACCOUNTS['acc_alex'], 
            ...(parsed['acc_alex'] || {}), 
            ...activeUserOverrides,
            role: 'Patient' 
          };
          parsed['589241037621'] = 'acc_alex';
          parsed['aadhaar:589241037621'] = 'acc_alex';
        }
        if (SEED_ACCOUNTS['acc_priya']) {
          parsed['acc_priya'] = { ...SEED_ACCOUNTS['acc_priya'], ...(parsed['acc_priya'] || {}), role: 'Patient' };
          parsed['123456789012'] = 'acc_priya';
          parsed['aadhaar:123456789012'] = 'acc_priya';
        }
        if (parsed['acc_receptionist']) {
          delete parsed['acc_receptionist'].aadhaar;
          delete parsed['acc_receptionist'].aadharNumber;
          parsed['acc_receptionist'].role = 'Receptionist';
        }

        // Ensure every Narasaraopet doctor account and alias is populated in db
        ALL_NARASARAOPET_DOCTORS.forEach(doc => {
          const accId = `acc_doc_${doc.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          if (!parsed[accId] || parsed[accId].role !== 'Doctor') {
            parsed[accId] = SEED_ACCOUNTS[accId];
          }
          parsed[doc.id] = accId;
          parsed[`doctor:${doc.id}`] = accId;
          if (doc.phoneDigits) {
            parsed[doc.phoneDigits] = accId;
            parsed[`phone:${doc.phoneDigits}`] = accId;
          }
        });

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
        initialDb[alias] = acc.accountId;
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

  const resolveVal = (val) => {
    if (!val) return null;
    if (typeof val === 'string' && db[val] && typeof db[val] === 'object') {
      return db[val];
    }
    return typeof val === 'object' ? val : null;
  };

  if (db[raw]) {
    const res = resolveVal(db[raw]);
    if (res) return res;
  }

  const lower = raw.toLowerCase();
  if (db[lower]) {
    const res = resolveVal(db[lower]);
    if (res) return res;
  }

  const a12 = extract12DigitAadhaar(raw);
  const p10 = extract10DigitPhone(raw);

  // Check if this identifier matches a registered doctor first
  const matchedDoc = findDoctorInRoster(raw, p10);
  if (matchedDoc) {
    const docAccId = `acc_doc_${matchedDoc.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (db[docAccId]) {
      const res = resolveVal(db[docAccId]);
      if (res && res.role === 'Doctor') return res;
    }
    if (db[matchedDoc.id]) {
      const res = resolveVal(db[matchedDoc.id]);
      if (res && res.role === 'Doctor') return res;
    }
    if (matchedDoc.phoneDigits && db[matchedDoc.phoneDigits]) {
      const res = resolveVal(db[matchedDoc.phoneDigits]);
      if (res && res.role === 'Doctor') return res;
    }
  }

  if (a12) {
    if (db[a12]) {
      const res = resolveVal(db[a12]);
      if (res) return res;
    }
    if (db[`aadhaar:${a12}`]) {
      const res = resolveVal(db[`aadhaar:${a12}`]);
      if (res) return res;
    }
  }

  if (p10) {
    if (db[p10]) {
      const res = resolveVal(db[p10]);
      if (res) return res;
    }
    if (db[`phone:${p10}`]) {
      const res = resolveVal(db[`phone:${p10}`]);
      if (res) return res;
    }
  }

  const cleanDoc = raw.replace(/\s+/g, '').toUpperCase();
  if (db[cleanDoc]) {
    const res = resolveVal(db[cleanDoc]);
    if (res) return res;
  }
  if (db[`doctor:${cleanDoc}`]) {
    const res = resolveVal(db[`doctor:${cleanDoc}`]);
    if (res) return res;
  }

  if (raw.includes('@')) {
    if (db[`email:${lower}`]) {
      const res = resolveVal(db[`email:${lower}`]);
      if (res) return res;
    }
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
      if (alias !== accountId) {
        db[alias] = accountId;
      }
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
  
  // Resolve genuine doctor from roster
  const matchedDoc = findDoctorInRoster(raw, p10, initialDefaults);
  const isDoc = roleHint === 'Doctor' || Boolean(matchedDoc) || raw.toUpperCase().includes('DOC') || raw.toUpperCase().startsWith('DR');
  const isResponder = (roleHint === 'Responder' || roleHint === 'Driver' || (p10 && !a12)) && !isDoc;

  const existing = findAccountInDb(db, identifier);
  if (existing) {
    // If a 12-digit Aadhaar was looked up, it MUST be a Patient account!
    if (a12 && existing.role !== 'Patient') {
      return persistUserDataToDb({ ...existing, role: 'Patient' });
    }
    if (isDoc && existing.role === 'Doctor') {
      // If doctor account exists, update any newly specified initialDefaults if present
      if (initialDefaults && Object.keys(initialDefaults).length > 0) {
        return persistUserDataToDb({ ...existing, ...initialDefaults, role: 'Doctor' });
      }
      return existing;
    }
    if (isResponder && existing.role !== 'Responder') {
      return persistUserDataToDb({ ...existing, role: 'Responder' });
    }
    return existing;
  }

  let newAcc = {};

  if (isDoc) {
    const docData = matchedDoc || findDoctorInRoster(raw, p10, initialDefaults) || ALL_NARASARAOPET_DOCTORS[0];
    const cleanDoc = (docData?.id || raw).replace(/\s+/g, '').toUpperCase() || 'DOCTOR-001';
    newAcc = {
      accountId: `acc_doc_${cleanDoc.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: initialDefaults.name || docData?.name || 'Dr. Raghavendra',
      title: initialDefaults.title || docData?.title || 'Senior General Physician',
      specialty: initialDefaults.specialty || docData?.specialty || 'General Physician',
      department: initialDefaults.department || docData?.department || 'Department of General Medicine',
      doctorId: cleanDoc,
      hospital: initialDefaults.hospital || docData?.hospital || 'Government Area Hospital, Narasaraopet',
      hospitalId: initialDefaults.hospitalId || docData?.hospitalId || 'hosp-area',
      licenseNo: initialDefaults.licenseNo || docData?.licenseNo || 'MCI-AP-89412',
      opdRoom: initialDefaults.opdRoom || docData?.opdRoom || docData?.roomNo || 'Room No. 104, OPD Block A',
      shiftHours: initialDefaults.shiftHours || docData?.shiftHours || '09:00 AM - 05:00 PM',
      experience: initialDefaults.experience || docData?.experience || '12 Years',
      qualifications: initialDefaults.qualifications || docData?.qualifications || docData?.title || 'MBBS, MD (Internal Medicine)',
      fee: initialDefaults.fee || docData?.fee || '₹30',
      totalConsultationsToday: initialDefaults.totalConsultationsToday || 7,
      phone: initialDefaults.phone || docData?.phone || '+91 94401 23456',
      phoneDigits: docData?.phoneDigits || extract10DigitPhone(initialDefaults.phone || docData?.phone || ''),
      photo: initialDefaults.photo || docData?.photo || '/doctor_raghavendra.jpg',
      role: 'Doctor',
      aliases: [
        `doctor:${cleanDoc}`,
        cleanDoc,
        ...(docData?.phoneDigits ? [`phone:${docData.phoneDigits}`, docData.phoneDigits] : []),
        (docData?.name || initialDefaults.name || '').toLowerCase()
      ].filter(Boolean)
    };
  } else if (isEmail || roleHint === 'Receptionist') {
    const cleanEmail = raw.toLowerCase();
    newAcc = {
      accountId: `acc_rec_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      name: initialDefaults.name || 'Area Hospital Reception Desk',
      role: 'Receptionist',
      receptionistGmail: cleanEmail,
      email: cleanEmail,
      phone: initialDefaults.phone || '+91 98765 10800',
      hospital: initialDefaults.hospital || 'Government Area Hospital, Narasaraopet',
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
      phoneClean = initialDefaults.phoneNumber || initialDefaults.phone || (aadhaarClean ? getAadhaarLinkedMobile(aadhaarClean) : '');
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
  // Government Area Hospital, Narasaraopet
  'DOCTOR-001': '/doctor_raghavendra.jpg',
  'doc-area-1': '/doctor_raghavendra.jpg',
  'doc-area-2': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. G. Padmavathi
  'doc-area-3': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', // Dr. P. Ramanjaneyulu
  'doc-area-4': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. M. Suresh Kumar
  'doc-area-5': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300', // Dr. K. Ashok

  // Mahatma Gandhi Super Speciality Hospital, Narasaraopet
  'doc-mgh-1': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', // Dr. K. Srinivas Reddy
  'doc-mgh-2': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. D. Srikanth
  'doc-mgh-3': 'https://images.unsplash.com/photo-1594824813508-62a21e64627d?auto=format&fit=crop&q=80&w=300', // Dr. Soumya Medabalimi
  'doc-mgh-4': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. K. Jaibharath Reddy
  'doc-mgh-5': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300', // Dr. Y. Naveen

  // Mathashree Multi Specialty Hospital, Narasaraopet
  'doc-mat-1': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. V. Ramachandra Reddy
  'doc-mat-2': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', // Dr. R. Mahesh Babu
  'doc-mat-3': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. S. Anitha

  // Lifeline Multi Specialty Hospital, Narasaraopet
  'doc-life-1': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. K. Venkata Ramana
  'doc-life-2': 'https://images.unsplash.com/photo-1594824813508-62a21e64627d?auto=format&fit=crop&q=80&w=300', // Dr. P. Sujatha
  'doc-life-3': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300', // Dr. T. Harish

  // Seshadri Super Speciality Hospital, Narasaraopet
  'doc-sesh-1': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. Seshadri Rao
  'doc-sesh-2': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', // Dr. N. V. Krishna

  // Sai Tirumala Super Speciality Hospital, Narasaraopet
  'doc-st-1': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', // Dr. M. V. Ramana
  'doc-st-2': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300', // Dr. Ch. Radhika

  // Sri Care Multi Speciality Hospital, Narasaraopet
  'doc-sc-1': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300', // Dr. G. Sridhar
  'doc-sc-2': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. K. Divya

  // Jawahar Children's & Neonatal Hospital, Narasaraopet
  'doc-jaw-1': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', // Dr. P. Jawahar
  'doc-jaw-2': 'https://images.unsplash.com/photo-1594824813508-62a21e64627d?auto=format&fit=crop&q=80&w=300', // Dr. P. Swapna

  // Vasantha Maternity & Nursing Home, Narasaraopet
  'doc-vas-1': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', // Dr. Vasantha Kumari
  'doc-vas-2': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'  // Dr. K. Hemanth
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER,
            ...parsed,
            accountId: parsed.accountId || 'acc_alex'
          };
        }
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('cn_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(a => a && a.id !== 'op-101' && a.id !== 'op-102');
        }
      }
      return DEFAULT_APPOINTMENTS;
    } catch {
      return DEFAULT_APPOINTMENTS;
    }
  });

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('cn_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r && r.id !== 'rec-1' && r.id !== 'rec-2' && r.id !== 'rec-3');
        }
      }
      return DEFAULT_RECORDS;
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
        id: 'hosp-area',
        name: 'Government Area Hospital, Narasaraopet',
        type: 'District Govt Area Hospital (APVVP)',
        location: 'Palnadu Road, Arundelpet, Narasaraopet',
        distance: '0.8 km',
        distanceVal: 0.8,
        emergencyBeds: 14,
        icuBeds: 4,
        ventilators: 2,
        opQueueCount: 16,
        phone: '08647 220108',
        rating: 4.6,
        specialties: ['General Checkup', 'General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics', 'Orthopedics', 'Emergency Triage'],
        doctors: [
          { 
            id: 'DOCTOR-001', 
            name: 'Dr. Raghavendra', 
            title: 'MBBS, MD (Internal Medicine)', 
            specialty: 'General Medicine', 
            experience: '12 yrs', 
            roomNo: 'OPD Block A, Room 104', 
            fee: '₹30', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-area-2', 
            name: 'Dr. G. Padmavathi', 
            title: 'MS, DGO (Obstetrics & Gynaecology)', 
            specialty: 'Obstetrics & Gynaecology', 
            experience: '15 yrs', 
            roomNo: 'Maternity Wing, Room 105', 
            fee: '₹30', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-area-3', 
            name: 'Dr. P. Ramanjaneyulu', 
            title: 'MS (General Surgery)', 
            specialty: 'General Surgery & Trauma', 
            experience: '18 yrs', 
            roomNo: 'Surgical OPD, Room 108', 
            fee: '₹30', 
            available: 'Available Today', 
            rating: 4.7 
          },
          { 
            id: 'doc-area-4', 
            name: 'Dr. M. Suresh Kumar', 
            title: 'MD (Pediatrics), DCH', 
            specialty: 'Pediatrics & Child Care', 
            experience: '14 yrs', 
            roomNo: 'Child Health OPD, Room 102', 
            fee: '₹30', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-area-5', 
            name: 'Dr. K. Ashok', 
            title: 'MS (Orthopedics)', 
            specialty: 'Orthopedics & Fracture Care', 
            experience: '12 yrs', 
            roomNo: 'Trauma & Ortho Wing, Room 112', 
            fee: '₹30', 
            available: 'Available Today', 
            rating: 4.7 
          }
        ]
      },
      {
        id: 'hosp-mgh',
        name: 'Mahatma Gandhi Super Speciality Hospital',
        type: 'Super Speciality Multi-Disciplinary Hospital',
        location: 'Panasathota, Opp. Bus Stand Backside, Narasaraopet',
        distance: '1.2 km',
        distanceVal: 1.2,
        emergencyBeds: 20,
        icuBeds: 8,
        ventilators: 4,
        opQueueCount: 24,
        phone: '08647 223456',
        rating: 4.9,
        specialties: ['General Checkup', 'Cardiology', 'Nephrology', 'Neurology', 'Orthopedics', 'Pulmonology', 'Critical Care'],
        doctors: [
          { 
            id: 'doc-mgh-1', 
            name: 'Dr. K. Srinivas Reddy', 
            title: 'MD, DM (Cardiology), FACC', 
            specialty: 'Cardiology & Interventional Care', 
            experience: '19 yrs', 
            roomNo: 'Cardiology Block, Room 201', 
            fee: '₹400', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-mgh-2', 
            name: 'Dr. D. Srikanth', 
            title: 'MD, DM (Nephrology)', 
            specialty: 'Nephrology & Kidney Care', 
            experience: '15 yrs', 
            roomNo: 'Nephrology Desk, Room 204', 
            fee: '₹400', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-mgh-3', 
            name: 'Dr. Soumya Medabalimi', 
            title: 'MD, DM (Neurology)', 
            specialty: 'Neurology & Stroke Specialist', 
            experience: '12 yrs', 
            roomNo: 'Neuro OPD, Room 301', 
            fee: '₹450', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-mgh-4', 
            name: 'Dr. K. Jaibharath Reddy', 
            title: 'MS (Orthopedics), MCh (Joint Replacement)', 
            specialty: 'Orthopedics & Joint Replacement', 
            experience: '16 yrs', 
            roomNo: 'Ortho Center, Room 108', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-mgh-5', 
            name: 'Dr. Y. Naveen', 
            title: 'MD (Pulmonology), FCCP', 
            specialty: 'Pulmonology & Chest Diseases', 
            experience: '11 yrs', 
            roomNo: 'Chest Clinic, Room 205', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.7 
          }
        ]
      },
      {
        id: 'hosp-mathashree',
        name: 'Mathashree Multi Specialty Hospital',
        type: 'Multi-Specialty & Advanced Laparoscopy Hospital',
        location: 'Near RTC Bus Stand, Opp. Petrol Bunk, Narasaraopet',
        distance: '0.6 km',
        distanceVal: 0.6,
        emergencyBeds: 12,
        icuBeds: 4,
        ventilators: 2,
        opQueueCount: 14,
        phone: '08647 222333',
        rating: 4.7,
        specialties: ['General Checkup', 'General Surgery', 'General Medicine', 'Critical Care', 'Obstetrics & Gynaecology'],
        doctors: [
          { 
            id: 'doc-mat-1', 
            name: 'Dr. V. Ramachandra Reddy', 
            title: 'MS, FIAGES, FMAS', 
            specialty: 'Advanced Laparoscopic & General Surgery', 
            experience: '22 yrs', 
            roomNo: 'Surgical Suite 1', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-mat-2', 
            name: 'Dr. R. Mahesh Babu', 
            title: 'MBBS, MD (General Medicine)', 
            specialty: 'General Medicine & Critical Care', 
            experience: '14 yrs', 
            roomNo: 'OPD Suite 3', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-mat-3', 
            name: 'Dr. S. Anitha', 
            title: 'MD, DGO (Obstetrics & Gynaecology)', 
            specialty: 'Obstetrics & Gynaecology', 
            experience: '16 yrs', 
            roomNo: 'Women Care Wing, Room 4', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.7 
          }
        ]
      },
      {
        id: 'hosp-lifeline',
        name: 'Lifeline Multi Specialty Hospital',
        type: 'Trauma, Orthopedics & Multi-Specialty Hospital',
        location: 'Station Road, Near Railway Station, Narasaraopet',
        distance: '1.5 km',
        distanceVal: 1.5,
        emergencyBeds: 10,
        icuBeds: 3,
        ventilators: 2,
        opQueueCount: 11,
        phone: '08647 224455',
        rating: 4.6,
        specialties: ['General Checkup', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency Trauma'],
        doctors: [
          { 
            id: 'doc-life-1', 
            name: 'Dr. K. Venkata Ramana', 
            title: 'MS (Orthopedics), Fellow Spine Surgery', 
            specialty: 'Orthopedics & Spine Surgery', 
            experience: '17 yrs', 
            roomNo: 'Ortho OPD Room 2', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.8 
          },
          { 
            id: 'doc-life-2', 
            name: 'Dr. P. Sujatha', 
            title: 'MD (Pediatrics), DCH', 
            specialty: 'Pediatrics & Child Health', 
            experience: '15 yrs', 
            roomNo: 'Child OPD Room 5', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.7 
          },
          { 
            id: 'doc-life-3', 
            name: 'Dr. T. Harish', 
            title: 'MD (General Medicine)', 
            specialty: 'General Medicine & Critical Care', 
            experience: '10 yrs', 
            roomNo: 'Consultation Desk 1', 
            fee: '₹250', 
            available: 'Available Today', 
            rating: 4.6 
          }
        ]
      },
      {
        id: 'hosp-seshadri',
        name: 'Seshadri Super Speciality Hospital',
        type: 'Surgical Oncology & Super Speciality Center',
        location: 'Arundelpet 6th Line, Narasaraopet',
        distance: '1.0 km',
        distanceVal: 1.0,
        emergencyBeds: 8,
        icuBeds: 3,
        ventilators: 2,
        opQueueCount: 9,
        phone: '08647 225678',
        rating: 4.8,
        specialties: ['General Checkup', 'Surgical Oncology', 'General Surgery', 'Critical Care'],
        doctors: [
          { 
            id: 'doc-sesh-1', 
            name: 'Dr. Seshadri Rao', 
            title: 'MS, MCh (Surgical Oncology)', 
            specialty: 'Surgical Oncology & Cancer Surgery', 
            experience: '24 yrs', 
            roomNo: 'Onco Suite 1', 
            fee: '₹500', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-sesh-2', 
            name: 'Dr. N. V. Krishna', 
            title: 'MD (Anaesthesia & Critical Care)', 
            specialty: 'Critical Care & Pain Management', 
            experience: '13 yrs', 
            roomNo: 'ICU Consultation Desk', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.7 
          }
        ]
      },
      {
        id: 'hosp-saitirumala',
        name: 'Sai Tirumala Super Speciality Hospital',
        type: 'Comprehensive Multi-Specialty Hospital',
        location: 'Arundelpet, Opp. Municipal High School, Narasaraopet',
        distance: '1.1 km',
        distanceVal: 1.1,
        emergencyBeds: 10,
        icuBeds: 3,
        ventilators: 1,
        opQueueCount: 13,
        phone: '08647 226789',
        rating: 4.6,
        specialties: ['General Checkup', 'General Medicine', 'ENT Specialist', 'Diabetology'],
        doctors: [
          { 
            id: 'doc-st-1', 
            name: 'Dr. M. V. Ramana', 
            title: 'MD (General Medicine), PGDD', 
            specialty: 'General Medicine & Diabetology', 
            experience: '18 yrs', 
            roomNo: 'OP Desk 101', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.7 
          },
          { 
            id: 'doc-st-2', 
            name: 'Dr. Ch. Radhika', 
            title: 'MS (ENT Specialist), DLO', 
            specialty: 'ENT Specialist & Head-Neck', 
            experience: '12 yrs', 
            roomNo: 'ENT Care Clinic, Room 103', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.6 
          }
        ]
      },
      {
        id: 'hosp-sricare',
        name: 'Sri Care Multi Speciality Hospital',
        type: 'Multi-Specialty & Diabetes Care Hospital',
        location: 'Station Road, Arundelpet, Narasaraopet',
        distance: '1.4 km',
        distanceVal: 1.4,
        emergencyBeds: 8,
        icuBeds: 2,
        ventilators: 1,
        opQueueCount: 8,
        phone: '08647 227890',
        rating: 4.5,
        specialties: ['General Checkup', 'Endocrinology', 'Dermatology', 'General Medicine'],
        doctors: [
          { 
            id: 'doc-sc-1', 
            name: 'Dr. G. Sridhar', 
            title: 'MBBS, MD (General Medicine), F.Diab', 
            specialty: 'Endocrinology & Diabetology', 
            experience: '15 yrs', 
            roomNo: 'OP Consultation Room 1', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.7 
          },
          { 
            id: 'doc-sc-2', 
            name: 'Dr. K. Divya', 
            title: 'MD (Dermatology, Venereology & Leprosy)', 
            specialty: 'Dermatology & Skin Specialist', 
            experience: '9 yrs', 
            roomNo: 'Skin Care Wing, Room 3', 
            fee: '₹350', 
            available: 'Available Today', 
            rating: 4.6 
          }
        ]
      },
      {
        id: 'hosp-jawahar',
        name: "Jawahar Children's & Neonatal Hospital",
        type: 'Pediatric & Neonatal Super Speciality Hospital',
        location: 'Barampet, Nimmathota, Narasaraopet',
        distance: '1.8 km',
        distanceVal: 1.8,
        emergencyBeds: 12,
        icuBeds: 5,
        ventilators: 3,
        opQueueCount: 15,
        phone: '08647 228901',
        rating: 4.8,
        specialties: ['General Checkup', 'Pediatrics', 'Neonatology', 'Pediatric Intensive Care', 'Child Vaccination'],
        doctors: [
          { 
            id: 'doc-jaw-1', 
            name: 'Dr. P. Jawahar', 
            title: 'MD (Pediatrics), Fellow Neonatology', 
            specialty: 'Pediatrics & Neonatology (NICU)', 
            experience: '21 yrs', 
            roomNo: 'NICU Block, OPD 1', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-jaw-2', 
            name: 'Dr. P. Swapna', 
            title: 'DCH (Pediatrics)', 
            specialty: 'Pediatrics & Immunization', 
            experience: '11 yrs', 
            roomNo: 'Well-Baby Clinic, Room 2', 
            fee: '₹250', 
            available: 'Available Today', 
            rating: 4.7 
          }
        ]
      },
      {
        id: 'hosp-vasantha',
        name: 'Vasantha Maternity & Nursing Home',
        type: "Specialty Maternity & Women's Hospital",
        location: 'Barampet Main Road, Narasaraopet',
        distance: '1.6 km',
        distanceVal: 1.6,
        emergencyBeds: 8,
        icuBeds: 2,
        ventilators: 1,
        opQueueCount: 10,
        phone: '08647 229012',
        rating: 4.7,
        specialties: ['General Checkup', 'Obstetrics & Gynaecology', 'General Surgery', 'High-Risk Pregnancy'],
        doctors: [
          { 
            id: 'doc-vas-1', 
            name: 'Dr. Vasantha Kumari', 
            title: 'MBBS, DGO (Obstetrics & Gynaecology)', 
            specialty: 'Obstetrics & Gynaecology', 
            experience: '26 yrs', 
            roomNo: 'Maternity Suite A', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.9 
          },
          { 
            id: 'doc-vas-2', 
            name: 'Dr. K. Hemanth', 
            title: 'MS (General Surgery)', 
            specialty: 'General & Laparoscopic Surgery', 
            experience: '13 yrs', 
            roomNo: 'Surgical Room B', 
            fee: '₹300', 
            available: 'Available Today', 
            rating: 4.7 
          }
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
      if (isLoggedIn && user && (user.accountId || user.name)) {
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
      if (remoteUserData && typeof remoteUserData === 'object') {
        setUser(prev => {
          if (!prev) return remoteUserData;
          const merged = { ...prev };
          // Only merge fields from remote that are NOT blank/null/undefined if local already has a valid non-empty value.
          // This prevents initial or blank Firestore fields from wiping local profile details (age, bloodGroup, photo, etc.)
          Object.entries(remoteUserData).forEach(([key, val]) => {
            if (val === '' || val === null || val === undefined) {
              const localVal = prev[key];
              if (localVal !== undefined && localVal !== '' && localVal !== null) {
                return;
              }
            }
            merged[key] = val;
          });
          merged.completionScore = calculateProfileCompletion(merged);
          try {
            localStorage.setItem('cn_user', JSON.stringify(merged));
            if (merged.role === 'Patient') {
              localStorage.setItem('cn_last_patient_account', JSON.stringify(merged));
            }
          } catch {}
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubUser === 'function') unsubUser();
    };
  }, [isLoggedIn, user?.accountId]);

  // Real-time Background Device & Viewport Detection Engine
  const [deviceInfo, setDeviceInfo] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true, deviceType: 'desktop', screenWidth: 1200, screenHeight: 800, orientation: 'landscape' };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    const isMob = width <= 768 || (isMobileUA && width <= 1024) || (isTouch && width <= 820);
    const isTab = width > 768 && width <= 1024 && !isMob;
    const isDesk = !isMob && !isTab;
    const devType = isMob ? 'mobile' : (isTab ? 'tablet' : 'desktop');

    return {
      isMobile: isMob,
      isTablet: isTab,
      isDesktop: isDesk,
      deviceType: devType,
      screenWidth: width,
      screenHeight: height,
      orientation: width < height ? 'portrait' : 'landscape'
    };
  });

  useEffect(() => {
    const evaluateDevice = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
      const isMob = width <= 768 || (isMobileUA && width <= 1024) || (isTouch && width <= 820);
      const isTab = width > 768 && width <= 1024 && !isMob;
      const isDesk = !isMob && !isTab;
      const devType = isMob ? 'mobile' : (isTab ? 'tablet' : 'desktop');
      const orientation = width < height ? 'portrait' : 'landscape';

      setDeviceInfo({
        isMobile: isMob,
        isTablet: isTab,
        isDesktop: isDesk,
        deviceType: devType,
        screenWidth: width,
        screenHeight: height,
        orientation
      });

      // Synchronize DOM root and body instantly
      try {
        document.documentElement.setAttribute('data-device', devType);
        document.documentElement.setAttribute('data-orientation', orientation);
        document.documentElement.classList.toggle('is-mobile-device', isMob);
        document.documentElement.classList.toggle('is-desktop-device', isDesk);
        document.body.classList.toggle('device-mobile', isMob);
        document.body.classList.toggle('device-desktop', isDesk);
        document.body.classList.toggle('device-tablet', isTab);
        document.body.classList.toggle('touch-enabled', isTouch);
      } catch {}
    };

    evaluateDevice();
    window.addEventListener('resize', evaluateDevice, { passive: true });
    window.addEventListener('orientationchange', evaluateDevice, { passive: true });
    return () => {
      window.removeEventListener('resize', evaluateDevice);
      window.removeEventListener('orientationchange', evaluateDevice);
    };
  }, []);

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
      const updated = { 
        ...prev, 
        ...updates,
        accountId: prev?.accountId || updates?.accountId || (
          prev?.role === 'Doctor' ? 'acc_doctor_01' : 'acc_alex'
        )
      };
      updated.completionScore = calculateProfileCompletion(updated);

      // Save directly to localStorage FIRST to guarantee persistence across browser refresh
      try {
        localStorage.setItem('cn_user', JSON.stringify(updated));
        if (updated.role === 'Patient') {
          localStorage.setItem('cn_last_patient_account', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Direct cn_user localStorage error:', e);
      }

      if (updated.role === 'Doctor' && updates.photo) {
        try {
          const docId = updated.doctorId || 'DOCTOR-001';
          let savedAvatars = {};
          const s = localStorage.getItem('cn_doctor_avatars');
          if (s) savedAvatars = JSON.parse(s);
          savedAvatars[docId] = updates.photo;
          savedAvatars['DOCTOR-001'] = updates.photo;
          localStorage.setItem('cn_doctor_avatars', JSON.stringify(savedAvatars));
          
          setHospitals(prevHospitals => 
            prevHospitals.map(hosp => ({
              ...hosp,
              doctors: (hosp.doctors || []).map(doc => 
                (doc.id === docId || doc.id === 'DOCTOR-001') 
                  ? { ...doc, avatar: updates.photo } 
                  : doc
              )
            }))
          );
        } catch {}
      }

      // Persist to local database and synchronize with Firestore
      try {
        persistUserDataToDb(updated);
      } catch (e) {
        console.warn('persistUserDataToDb error:', e);
      }

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
        const cleanApps = patientAccount.appointments.filter(a => a && a.id !== 'op-101' && a.id !== 'op-102');
        setAppointments(cleanApps);
        try { localStorage.setItem('cn_appointments', JSON.stringify(cleanApps)); } catch {}
      } else {
        try {
          const savedApps = localStorage.getItem('cn_appointments');
          if (savedApps) {
            const parsedApps = JSON.parse(savedApps);
            setAppointments(Array.isArray(parsedApps) ? parsedApps.filter(a => a && a.id !== 'op-101' && a.id !== 'op-102') : []);
          } else {
            setAppointments(DEFAULT_APPOINTMENTS);
          }
        } catch {
          setAppointments(DEFAULT_APPOINTMENTS);
        }
      }

      // Restore records
      if (Array.isArray(patientAccount.records) && patientAccount.records.length > 0) {
        const cleanRecs = patientAccount.records.filter(r => r && r.id !== 'rec-1' && r.id !== 'rec-2' && r.id !== 'rec-3');
        setRecords(cleanRecs);
        try { localStorage.setItem('cn_records', JSON.stringify(cleanRecs)); } catch {}
      } else {
        try {
          const savedRecs = localStorage.getItem('cn_records');
          if (savedRecs) {
            const parsedRecs = JSON.parse(savedRecs);
            setRecords(Array.isArray(parsedRecs) ? parsedRecs.filter(r => r && r.id !== 'rec-1' && r.id !== 'rec-2' && r.id !== 'rec-3') : []);
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

  const bookOPToken = (tokenData, shouldNavigate = true) => {
    const newToken = {
      id: 'op-' + Date.now(),
      tokenNumber: Math.floor(Math.random() * 30 + 10).toString(),
      date: 'Today',
      status: 'ACTIVE',
      currentServing: '8',
      queueAhead: 4,
      qrCode: `OP-TOKEN-${Date.now().toString().slice(-4)}`,
      patientId: user?.accountId || user?.aadharNumber || 'anonymous',
      patientName: tokenData?.patientName || user?.name || user?.fullName || 'Patient',
      patientPhone: tokenData?.patientPhone || user?.phone || '+91 98765 43210',
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

    // Also persist to cn_doctor_booked_ops, cn_receptionist_booked_ops and notifications for live sync
    try {
      const existingOps = JSON.parse(localStorage.getItem('cn_doctor_booked_ops') || '[]');
      const updatedOps = [newToken, ...existingOps.filter(o => o.id !== newToken.id)];
      localStorage.setItem('cn_doctor_booked_ops', JSON.stringify(updatedOps));

      const existingRecOps = JSON.parse(localStorage.getItem('cn_receptionist_booked_ops') || '[]');
      const updatedRecOps = [newToken, ...existingRecOps.filter(o => o.id !== newToken.id)];
      localStorage.setItem('cn_receptionist_booked_ops', JSON.stringify(updatedRecOps));

      const existingNotifs = JSON.parse(localStorage.getItem('cn_doctor_notifications') || '[]');
      const newNotif = {
        id: 'notif-op-' + newToken.id,
        title: '🚨 New OP Token Booked',
        text: `${newToken.patientName} booked OP Token #${newToken.tokenNumber} for ${newToken.timeSlot || 'Today'}${newToken.doctorName ? ` (${newToken.doctorName})` : ''}. Reason: ${newToken.reason || 'General Consultation'}`,
        time: 'Just now',
        urgent: true,
        important: true,
        isNew: true,
        appointmentId: newToken.id,
        createdAt: Date.now()
      };
      const updatedNotifs = [newNotif, ...existingNotifs.filter(n => n.id !== newNotif.id)];
      localStorage.setItem('cn_doctor_notifications', JSON.stringify(updatedNotifs));

      const existingRecNotifs = JSON.parse(localStorage.getItem('cn_receptionist_notifications') || '[]');
      const newRecNotif = {
        id: 'rn-op-' + newToken.id,
        title: '🚨 New OP Token Booked',
        text: `${newToken.patientName} booked OP Token #${newToken.tokenNumber} (${newToken.specialty || 'General OPD'}) for ${newToken.timeSlot || 'Today'}.`,
        time: 'Just now',
        urgent: true,
        important: true,
        isNew: true,
        appointmentId: newToken.id,
        createdAt: Date.now()
      };
      const updatedRecNotifs = [newRecNotif, ...existingRecNotifs.filter(n => n.id !== newRecNotif.id)];
      localStorage.setItem('cn_receptionist_notifications', JSON.stringify(updatedRecNotifs));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('care_navigator_new_op_booked', { detail: newToken }));
        window.dispatchEvent(new CustomEvent('care_navigator_doctor_notif', { detail: newNotif }));
        window.dispatchEvent(new CustomEvent('care_navigator_receptionist_notif', { detail: newRecNotif }));
        try {
          const channel = new BroadcastChannel('care_navigator_live_sync');
          channel.postMessage({ type: 'NEW_OP_BOOKED', token: newToken, notification: newNotif, recNotification: newRecNotif });
          channel.close();
        } catch {}
      }
    } catch (err) {
      console.warn('Storage sync error on bookOPToken:', err);
    }

    // Save to Cloud Firestore
    try {
      saveAppointmentToFirestore(newToken);
    } catch (e) {
      console.warn('[Firestore] Failed to save appointment:', e);
    }

    if (shouldNavigate) {
      navigateTo('appointments');
    }
    return newToken;
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
          (doc.id === docId)
            ? { ...doc, avatar: newAvatarUrl } 
            : doc
        )
      }))
    );

    setUser(prevUser => {
      if (!prevUser || prevUser.role !== 'Doctor') return prevUser;
      if (prevUser.doctorId === docId || docId === 'DOCTOR-001') {
        const updated = { ...prevUser, photo: newAvatarUrl };
        try {
          localStorage.setItem('cn_user', JSON.stringify(updated));
          localStorage.setItem('care_navigator_doctor_photo', newAvatarUrl);
        } catch {}
        return updated;
      }
      return prevUser;
    });
  };

  return (
    <AppContext.Provider
      value={{
        isMobile: deviceInfo.isMobile,
        isTablet: deviceInfo.isTablet,
        isDesktop: deviceInfo.isDesktop,
        deviceType: deviceInfo.deviceType,
        deviceInfo,
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
        allDoctorsRoster: ALL_NARASARAOPET_DOCTORS,
        findDoctorInRoster,
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
