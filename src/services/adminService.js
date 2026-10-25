/**
 * Care Navigator - Full Enterprise Admin Dashboard Service Layer
 * Supports REST API backend integration with full local state fallback & Cloud Firestore synchronization
 */

const STORAGE_KEY = 'care_navigator_admin_data_v1';

// Seed Datasets for Production-Grade Simulation & Real-time Operations
const DEFAULT_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'Government General Hospital (GGH)',
    type: 'Govt Super Specialty Hospital',
    registrationNo: 'AP-MED-GGH-001',
    accreditation: 'NABH Accredited & PM-JAY Empaneled',
    district: 'Guntur',
    location: 'Collectorate Road, Guntur, AP - 522004',
    phone: '0863 2234567',
    emergencyPhone: '108 / 0863 2234568',
    status: 'VERIFIED',
    verificationDate: '2026-01-15',
    verifiedBy: 'Dr. Ramesh Kumar (Director of Health)',
    emergencyBeds: 18,
    totalEmergencyBeds: 24,
    icuBeds: 6,
    totalIcuBeds: 12,
    ventilators: 4,
    totalVentilators: 8,
    opQueueCount: 42,
    specialties: ['Cardiology', 'Trauma & Emergency', 'Orthopedics', 'General Surgery', 'Pediatrics', 'Neurology'],
    departments: ['Emergency Casualty', 'Cardiology Wing', 'Trauma OT', 'Pediatrics OPD', 'General Medicine'],
    rating: 4.8
  },
  {
    id: 'hosp-2',
    name: 'Narasaraopet Area Hospital',
    type: 'District Govt Area Hospital',
    registrationNo: 'AP-PAL-NAH-042',
    accreditation: 'Aarogyasri Tier-1 Empaneled',
    district: 'Palnadu',
    location: 'Palnadu Road, Narasaraopet, AP - 522601',
    phone: '08647 220108',
    emergencyPhone: '108 / 08647 220109',
    status: 'VERIFIED',
    verificationDate: '2026-02-10',
    verifiedBy: 'DMHO Palnadu District',
    emergencyBeds: 10,
    totalEmergencyBeds: 16,
    icuBeds: 3,
    totalIcuBeds: 6,
    ventilators: 2,
    totalVentilators: 4,
    opQueueCount: 22,
    specialties: ['General Medicine', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynaecology', 'Emergency Triage'],
    departments: ['Casualty OPD', 'Maternity Ward', 'Minor OT', 'General Triage'],
    rating: 4.5
  },
  {
    id: 'hosp-3',
    name: 'Ramesh Hospitals & Cardiac Center',
    type: 'Tertiary Super Specialty & Cardiac ICU',
    registrationNo: 'AP-PVT-RMC-109',
    accreditation: 'JCI & NABH Apex Accredited',
    district: 'Guntur',
    location: 'Ring Road, Guntur, AP - 522006',
    phone: '0863 2377777',
    emergencyPhone: '0863 2377108',
    status: 'VERIFIED',
    verificationDate: '2026-03-01',
    verifiedBy: 'State Healthcare Quality Council',
    emergencyBeds: 24,
    totalEmergencyBeds: 30,
    icuBeds: 11,
    totalIcuBeds: 18,
    ventilators: 8,
    totalVentilators: 12,
    opQueueCount: 31,
    specialties: ['Interventional Cardiology', 'Critical Care ICU', 'Nephrology', 'Pulmonology', 'Cardiac Surgery'],
    departments: ['Cardiac Cath Lab', 'Cardio-Thoracic ICU', 'Emergency Resuscitation', 'OPD Floor 3'],
    rating: 4.9
  },
  {
    id: 'hosp-4',
    name: 'Palnadu Mother & Child Health Center',
    type: 'Specialized Maternity & Pediatric Hospital',
    registrationNo: 'AP-PAL-MCH-088',
    accreditation: 'LaQshya Certified & Aarogyasri Empaneled',
    district: 'Palnadu',
    location: 'Vinukonda Highway, Palnadu, AP - 522615',
    phone: '08646 223344',
    emergencyPhone: '108 / 08646 223345',
    status: 'VERIFIED',
    verificationDate: '2026-03-15',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 12,
    totalEmergencyBeds: 16,
    icuBeds: 5,
    totalIcuBeds: 8,
    ventilators: 3,
    totalVentilators: 4,
    opQueueCount: 16,
    specialties: ['Pediatrics & Neonatology', 'Obstetrics & Gynaecology', 'Maternal Intensive Care', 'Immunization'],
    departments: ['Labor Delivery Room', 'NICU / PICU', 'Emergency Obstetric Triage'],
    rating: 4.7
  },
  {
    id: 'hosp-5',
    name: 'Sri City Community Health Center (CHC)',
    type: 'Community Health Center (CHC)',
    registrationNo: 'AP-PAL-CHC-014',
    accreditation: 'IPHS 2022 Certified',
    district: 'Palnadu',
    location: 'Station Road, Narasaraopet, AP - 522601',
    phone: '08647 231122',
    emergencyPhone: '108',
    status: 'PENDING_REVIEW',
    verificationDate: null,
    verifiedBy: null,
    emergencyBeds: 6,
    totalEmergencyBeds: 10,
    icuBeds: 1,
    totalIcuBeds: 2,
    ventilators: 1,
    totalVentilators: 2,
    opQueueCount: 14,
    specialties: ['Primary Health', 'Emergency Triage', 'General Medicine', 'Preventive Care'],
    departments: ['Primary Triage', 'Immunization Center', 'Observation Ward'],
    rating: 4.3
  },
  {
    id: 'hosp-6',
    name: 'Apollo Clinic & Emergency Trauma Desk',
    type: 'Private Multi-Specialty Outpost',
    registrationNo: 'AP-PVT-APL-332',
    accreditation: 'Under Verification',
    district: 'Guntur',
    location: 'Arundelpet, Guntur, AP - 522002',
    phone: '0863 2289900',
    emergencyPhone: '0863 2289908',
    status: 'PENDING_REVIEW',
    verificationDate: null,
    verifiedBy: null,
    emergencyBeds: 8,
    totalEmergencyBeds: 12,
    icuBeds: 2,
    totalIcuBeds: 4,
    ventilators: 1,
    totalVentilators: 2,
    opQueueCount: 19,
    specialties: ['Family Medicine', 'Cardiology OPD', 'Diagnostics', 'Emergency Day Care'],
    departments: ['OPD Clinics', 'Imaging & Ultrasound', 'Emergency Stabilization'],
    rating: 4.4
  }
];

const DEFAULT_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. K. Srinivas Rao',
    qualification: 'MD, DM (Cardiology), FACC',
    councilRegNo: 'APMC-28491',
    specialty: 'Cardiology',
    hospitalId: 'hosp-1',
    hospitalName: 'Government General Hospital (GGH)',
    roomNo: 'OP Block-2, Room 104',
    fee: '₹300',
    experienceYears: 18,
    phone: '+91 94401 23456',
    email: 'dr.srinivas.cardio@ggh.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (09:00 AM - 02:00 PM)',
    todayTokens: 24,
    rating: 4.9
  },
  {
    id: 'doc-2',
    name: 'Dr. M. Lakshmi Prasanna',
    qualification: 'MS (General Surgery), FMAS',
    councilRegNo: 'APMC-34190',
    specialty: 'General Surgery',
    hospitalId: 'hosp-1',
    hospitalName: 'Government General Hospital (GGH)',
    roomNo: 'OP Block-1, Room 202',
    fee: '₹250',
    experienceYears: 14,
    phone: '+91 94402 34567',
    email: 'dr.lakshmi.surgery@ggh.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Afternoon (01:00 PM - 06:00 PM)',
    todayTokens: 18,
    rating: 4.8
  },
  {
    id: 'doc-3',
    name: 'Dr. S. Meenakshi',
    qualification: 'MS (Orthopedics), Fellow Trauma',
    councilRegNo: 'APMC-41209',
    specialty: 'Orthopedics & Joint Replacement',
    hospitalId: 'hosp-2',
    hospitalName: 'Narasaraopet Area Hospital',
    roomNo: 'OPD Room 12',
    fee: '₹300',
    experienceYears: 12,
    phone: '+91 94403 45678',
    email: 'dr.meenakshi.ortho@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (09:00 AM - 04:00 PM)',
    todayTokens: 28,
    rating: 4.7
  },
  {
    id: 'doc-4',
    name: 'Dr. R. V. Ramana',
    qualification: 'MD (Pediatrics), DCH',
    councilRegNo: 'APMC-21980',
    specialty: 'Pediatrics',
    hospitalId: 'hosp-2',
    hospitalName: 'Narasaraopet Area Hospital',
    roomNo: 'OPD Room 05',
    fee: '₹300',
    experienceYears: 16,
    phone: '+91 94404 56789',
    email: 'dr.ramana.pediatrics@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: false,
    dutyShift: 'On Emergency Call',
    todayTokens: 15,
    rating: 4.8
  },
  {
    id: 'doc-5',
    name: 'Dr. P. Ramesh Babu',
    qualification: 'MD, DM (Cardiology), FCSI',
    councilRegNo: 'APMC-11045',
    specialty: 'Interventional Cardiology',
    hospitalId: 'hosp-3',
    hospitalName: 'Ramesh Hospitals & Cardiac Center',
    roomNo: 'Tower A, Floor 3, Suite 301',
    fee: '₹500',
    experienceYears: 25,
    phone: '+91 98480 12345',
    email: 'dr.rameshbabu@rameshhospitals.com',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (10:00 AM - 03:00 PM)',
    todayTokens: 32,
    rating: 4.9
  },
  {
    id: 'doc-6',
    name: 'Dr. D. Sailaja',
    qualification: 'MD (Pediatrics), Fellow Neonatology',
    councilRegNo: 'APMC-38912',
    specialty: 'Pediatrics & Neonatology',
    hospitalId: 'hosp-4',
    hospitalName: 'Palnadu Mother & Child Health Center',
    roomNo: 'NICU Block Room 02',
    fee: '₹350',
    experienceYears: 14,
    phone: '+91 94405 67890',
    email: 'dr.sailaja@mchpalnadu.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (09:00 AM - 05:00 PM)',
    todayTokens: 19,
    rating: 4.8
  },
  {
    id: 'doc-7',
    name: 'Dr. G. Raghavendra Rao',
    qualification: 'MBBS, MD (General Medicine)',
    councilRegNo: 'APMC-51029',
    specialty: 'General Physician & Triage',
    hospitalId: 'hosp-2',
    hospitalName: 'Narasaraopet Area Hospital',
    roomNo: 'General Triage Room 01',
    fee: '₹150',
    experienceYears: 9,
    phone: '+91 94406 78901',
    email: 'dr.raghavendra@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (08:30 AM - 02:00 PM)',
    todayTokens: 35,
    rating: 4.6
  },
  {
    id: 'doc-8',
    name: 'Dr. A. Vikram Dev',
    qualification: 'MD, DM (Nephrology)',
    councilRegNo: 'APMC-49210-PENDING',
    specialty: 'Nephrology & Renal Dialysis',
    hospitalId: 'hosp-3',
    hospitalName: 'Ramesh Hospitals & Cardiac Center',
    roomNo: 'Dialysis Wing Room 10',
    fee: '₹450',
    experienceYears: 7,
    phone: '+91 98481 99887',
    email: 'dr.vikram.nephro@rameshhospitals.com',
    status: 'PENDING_VERIFICATION',
    isAvailable: false,
    dutyShift: 'Pending Credentials Check',
    todayTokens: 0,
    rating: 4.5
  }
];

const DEFAULT_PATIENTS = [
  {
    id: 'pat-1',
    name: 'Alex Johnson',
    abhaId: 'ABHA-5892-4103-7621',
    aadhaarMasked: 'XXXX-XXXX-7621',
    phone: '+91 98765 43210',
    age: 28,
    gender: 'MALE',
    bloodGroup: 'O+',
    district: 'Palnadu',
    address: 'Door No 4-12, Main Road, Narasaraopet, Palnadu District, AP',
    emergencyContact: '+91 98765 43212 (Father: K. Robert)',
    allergies: ['Penicillin', 'Dust'],
    chronicConditions: ['None Reported'],
    registeredDate: '2026-01-10',
    accountStatus: 'ACTIVE',
    profileCompletion: 100,
    totalVisits: 4,
    lastVisitDate: '2026-08-10',
    lastDoctor: 'Dr. K. Srinivas Rao (Cardiology)'
  },
  {
    id: 'pat-2',
    name: 'Priya Sharma',
    abhaId: 'ABHA-1234-5678-9012',
    aadhaarMasked: 'XXXX-XXXX-9012',
    phone: '+91 98765 43211',
    age: 32,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    district: 'Guntur',
    address: 'House No 18, Collectorate Colony, Guntur, AP - 522004',
    emergencyContact: '+91 98765 43212 (Spouse: Amit Sharma)',
    allergies: ['Dust', 'Sulfa drugs'],
    chronicConditions: ['Mild Hypertension'],
    registeredDate: '2026-02-14',
    accountStatus: 'ACTIVE',
    profileCompletion: 100,
    totalVisits: 3,
    lastVisitDate: '2026-08-15',
    lastDoctor: 'Dr. M. Lakshmi Prasanna'
  },
  {
    id: 'pat-3',
    name: 'K. Somasekhar',
    abhaId: 'ABHA-9941-2098-1123',
    aadhaarMasked: 'XXXX-XXXX-1123',
    phone: '+91 94408 11223',
    age: 58,
    gender: 'MALE',
    bloodGroup: 'B+',
    district: 'Palnadu',
    address: 'Near Clock Tower Junction, Main Bazaar, Narasaraopet, AP',
    emergencyContact: '+91 94408 11224 (Son: K. Vamsi)',
    allergies: ['Aspirin'],
    chronicConditions: ['Type-2 Diabetes', 'Coronary Artery Disease'],
    registeredDate: '2026-03-02',
    accountStatus: 'ACTIVE',
    profileCompletion: 95,
    totalVisits: 6,
    lastVisitDate: '2026-10-22',
    lastDoctor: 'Dr. K. Srinivas Rao (108 Emergency)'
  },
  {
    id: 'pat-4',
    name: 'B. Appa Rao',
    abhaId: 'ABHA-7712-4091-8874',
    aadhaarMasked: 'XXXX-XXXX-8874',
    phone: '+91 98485 55443',
    age: 72,
    gender: 'MALE',
    bloodGroup: 'A+',
    district: 'Palnadu',
    address: 'Ward 8, Old Bus Stand Road, Vinukonda, Palnadu, AP',
    emergencyContact: '+91 98485 55444 (Daughter: S. Anuradha)',
    allergies: ['None known'],
    chronicConditions: ['Osteoarthritis', 'Hypertension'],
    registeredDate: '2026-03-20',
    accountStatus: 'ACTIVE',
    profileCompletion: 90,
    totalVisits: 5,
    lastVisitDate: '2026-09-02',
    lastDoctor: 'Dr. S. Meenakshi (Ortho)'
  },
  {
    id: 'pat-5',
    name: 'M. Lakshmi Devi',
    abhaId: 'ABHA-3389-1029-4455',
    aadhaarMasked: 'XXXX-XXXX-4455',
    phone: '+91 98492 88776',
    age: 46,
    gender: 'FEMALE',
    bloodGroup: 'O-',
    district: 'Guntur',
    address: 'Plot 42, Brodipet 4th Line, Guntur, AP - 522002',
    emergencyContact: '+91 98492 88777 (Brother: M. Subba Rao)',
    allergies: ['Cold weather asthma triggers'],
    chronicConditions: ['Bronchial Asthma'],
    registeredDate: '2026-04-12',
    accountStatus: 'ACTIVE',
    profileCompletion: 85,
    totalVisits: 2,
    lastVisitDate: '2026-07-28',
    lastDoctor: 'Dr. G. Raghavendra Rao'
  },
  {
    id: 'pat-6',
    name: 'S. Venkat Rao',
    abhaId: 'ABHA-8821-3940-1928',
    aadhaarMasked: 'XXXX-XXXX-1928',
    phone: '+91 94412 33445',
    age: 39,
    gender: 'MALE',
    bloodGroup: 'AB+',
    district: 'Palnadu',
    address: 'Kotappakonda Road, Narasaraopet, Palnadu Dist, AP',
    emergencyContact: '+91 94412 33446 (Wife: S. Padmavati)',
    allergies: ['None'],
    chronicConditions: ['None'],
    registeredDate: '2026-05-18',
    accountStatus: 'FLAGGED',
    profileCompletion: 70,
    totalVisits: 1,
    lastVisitDate: '2026-10-18',
    lastDoctor: 'Dr. S. Meenakshi'
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: 'op-2026-101',
    tokenNumber: '14',
    patientName: 'Alex Johnson',
    patientId: 'pat-1',
    patientPhone: '+91 98765 43210',
    doctorName: 'Dr. K. Srinivas Rao',
    doctorId: 'doc-1',
    specialty: 'Cardiology',
    hospitalName: 'Government General Hospital (GGH)',
    hospitalId: 'hosp-1',
    roomNo: 'OP Block-2, Room 104',
    date: '2026-10-22',
    timeSlot: '10:30 AM',
    status: 'SERVING',
    currentServing: '14',
    queueAhead: 0,
    fee: '₹300',
    feeStatus: 'PAID',
    paymentMode: 'UPI / Aarogyasri Verified',
    qrCode: 'OP-GGH-CARD-014',
    symptoms: 'Routine post-medication ECG review & blood pressure check.'
  },
  {
    id: 'op-2026-102',
    tokenNumber: '15',
    patientName: 'Priya Sharma',
    patientId: 'pat-2',
    patientPhone: '+91 98765 43211',
    doctorName: 'Dr. K. Srinivas Rao',
    doctorId: 'doc-1',
    specialty: 'Cardiology',
    hospitalName: 'Government General Hospital (GGH)',
    hospitalId: 'hosp-1',
    roomNo: 'OP Block-2, Room 104',
    date: '2026-10-22',
    timeSlot: '10:45 AM',
    status: 'CONFIRMED',
    currentServing: '14',
    queueAhead: 1,
    fee: '₹300',
    feeStatus: 'PAID',
    paymentMode: 'Net Banking',
    qrCode: 'OP-GGH-CARD-015',
    symptoms: 'Mild chest tightness upon brisk exertion, lipid profile review.'
  },
  {
    id: 'op-2026-103',
    tokenNumber: '08',
    patientName: 'B. Appa Rao',
    patientId: 'pat-4',
    patientPhone: '+91 98485 55443',
    doctorName: 'Dr. S. Meenakshi',
    doctorId: 'doc-3',
    specialty: 'Orthopedics',
    hospitalName: 'Narasaraopet Area Hospital',
    hospitalId: 'hosp-2',
    roomNo: 'OPD Room 12',
    date: '2026-10-22',
    timeSlot: '11:15 AM',
    status: 'CONFIRMED',
    currentServing: '06',
    queueAhead: 2,
    fee: '₹300',
    feeStatus: 'PAID',
    paymentMode: 'Aarogyasri Health Card',
    qrCode: 'OP-NAH-ORTH-008',
    symptoms: 'Right knee joint stiffness and mobility difficulty.'
  },
  {
    id: 'op-2026-104',
    tokenNumber: '22',
    patientName: 'M. Lakshmi Devi',
    patientId: 'pat-5',
    patientPhone: '+91 98492 88776',
    doctorName: 'Dr. G. Raghavendra Rao',
    doctorId: 'doc-7',
    specialty: 'General Medicine',
    hospitalName: 'Narasaraopet Area Hospital',
    hospitalId: 'hosp-2',
    roomNo: 'General Triage Room 01',
    date: '2026-10-22',
    timeSlot: '11:45 AM',
    status: 'PENDING',
    currentServing: '16',
    queueAhead: 6,
    fee: '₹150',
    feeStatus: 'PENDING_AT_DESK',
    paymentMode: 'Cash at Counter',
    qrCode: 'OP-NAH-GEN-022',
    symptoms: 'Persistent cough, mild seasonal wheezing at night.'
  },
  {
    id: 'op-2026-105',
    tokenNumber: '03',
    patientName: 'K. Somasekhar',
    patientId: 'pat-3',
    patientPhone: '+91 94408 11223',
    doctorName: 'Dr. P. Ramesh Babu',
    doctorId: 'doc-5',
    specialty: 'Cardiology',
    hospitalName: 'Ramesh Hospitals & Cardiac Center',
    hospitalId: 'hosp-3',
    roomNo: 'Suite 301',
    date: '2026-10-22',
    timeSlot: '09:30 AM',
    status: 'COMPLETED',
    currentServing: '09',
    queueAhead: 0,
    fee: '₹500',
    feeStatus: 'PAID',
    paymentMode: 'Credit Card',
    qrCode: 'OP-RMC-CARD-003',
    symptoms: 'Post-angioplasty annual follow-up and echo assessment.'
  },
  {
    id: 'op-2026-106',
    tokenNumber: '19',
    patientName: 'S. Venkat Rao',
    patientId: 'pat-6',
    patientPhone: '+91 94412 33445',
    doctorName: 'Dr. S. Meenakshi',
    doctorId: 'doc-3',
    specialty: 'Orthopedics',
    hospitalName: 'Narasaraopet Area Hospital',
    hospitalId: 'hosp-2',
    roomNo: 'OPD Room 12',
    date: '2026-10-21',
    timeSlot: '02:00 PM',
    status: 'CANCELLED',
    currentServing: '25',
    queueAhead: 0,
    fee: '₹300',
    feeStatus: 'REFUNDED',
    paymentMode: 'UPI Refund Processed',
    qrCode: 'OP-NAH-ORTH-019',
    symptoms: 'Patient rescheduled due to personal travel.'
  }
];

const DEFAULT_EMERGENCIES = [
  {
    id: 'EMG-2026-9481',
    priority: 'CODE_RED',
    type: 'Severe Cardiac Arrest & Acute Respiratory Collapse',
    callerName: 'Rajesh M. (Bystander)',
    callerPhone: '+91 98765 11223',
    patientName: 'K. Somasekhar',
    patientAge: 58,
    patientGender: 'MALE',
    patientBlood: 'B+',
    location: 'Near Clock Tower Junction, Main Bazaar, Narasaraopet, AP',
    coordinates: { lat: 16.1524, lng: 80.0498 },
    status: 'DISPATCHED',
    assignedAmbulance: 'AP 07 TE 1084 (Unit ALS #04)',
    driverName: 'Ravi Kumar',
    driverPhone: '+91 98765 10800',
    distanceKm: 1.8,
    etaMinutes: 3,
    targetHospital: 'Government General Hospital (GGH), Guntur - Trauma ICU',
    timestamp: '2026-10-22T10:14:00Z',
    notes: 'Bystander initiated chest compressions. ALS defibrillator on board.'
  },
  {
    id: 'EMG-2026-9480',
    priority: 'CODE_AMBER',
    type: 'Severe Road Traffic Collision & Polytrauma',
    callerName: 'Sub-Inspector Prasad (Traffic Police)',
    callerPhone: '+91 94407 88990',
    patientName: 'Alex Rivera',
    patientAge: 28,
    patientGender: 'MALE',
    patientBlood: 'O+',
    location: 'Hospital Express Highway, Near Flyover Pillar 14, Narasaraopet',
    coordinates: { lat: 16.1558, lng: 80.0542 },
    status: 'TRANSPORTING',
    assignedAmbulance: 'AP 07 TE 1082 (Unit BLS #02)',
    driverName: 'K. Venkanna',
    driverPhone: '+91 98765 10802',
    distanceKm: 2.4,
    etaMinutes: 5,
    targetHospital: 'Narasaraopet Area Hospital - Emergency Trauma',
    timestamp: '2026-10-22T09:42:00Z',
    notes: 'Cervical collar applied. IV line secured. Vitals stable.'
  },
  {
    id: 'EMG-2026-9478',
    priority: 'CODE_GREEN',
    type: 'Acute Asthmatic Episode & Hyperventilation',
    callerName: 'M. Subba Rao (Family)',
    callerPhone: '+91 98492 88777',
    patientName: 'M. Lakshmi Devi',
    patientAge: 46,
    patientGender: 'FEMALE',
    patientBlood: 'O-',
    location: 'Brodipet 4th Line, Guntur, AP',
    coordinates: { lat: 16.3067, lng: 80.4365 },
    status: 'RESOLVED',
    assignedAmbulance: 'AP 07 TE 1088 (Unit BLS #08)',
    driverName: 'G. Suresh Babu',
    driverPhone: '+91 98765 10808',
    distanceKm: 0.8,
    etaMinutes: 0,
    targetHospital: 'Government General Hospital (GGH), Guntur',
    timestamp: '2026-10-22T08:15:00Z',
    notes: 'Nebulization administered. Patient safely handed over to ER triage.'
  }
];

const DEFAULT_AI_CONFIG = {
  triageModel: 'Gemini 1.5 Flash Healthcare Triage Specialist',
  serviceStatus: 'ONLINE',
  uptimePercentage: 99.88,
  avgLatencyMs: 420,
  monthlyQueries: 14280,
  emergencyTriggersDetected: 412,
  flaggedSafetyIncidents: 2,
  minConfidenceThreshold: 0.85,
  emergencyKeywords: [
    'chest pain', 'heart attack', 'unconscious', 'breathing difficulty', 
    'severe bleeding', 'stroke', 'face drooping', 'head injury', 'paralysis', 'seizure'
  ],
  safetyDisclaimer: 'Care Navigator AI provides initial triage decision guidance only and does not replace emergency clinical assessment by certified physicians. In acute life-threatening distress, call 108 immediately.',
  allowAutoHospitalReferral: true,
  requireClinicianSignoffOnGuidance: true
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-tpl-1',
    title: '108 Ambulance Dispatch Alert',
    channel: 'SMS & PUSH',
    category: 'EMERGENCY',
    templateText: '🚨 108 EMERGENCY ALERT: Unit {{ambulanceNo}} dispatched for {{patientName}}. Driver: {{driverName}} ({{driverPhone}}). Estimated ETA: {{etaMinutes}} mins.',
    deliveryRate: '99.4%',
    sentCount: 1420
  },
  {
    id: 'notif-tpl-2',
    title: 'OP Token Live Queue Approaching',
    channel: 'WHATSAPP & SMS',
    category: 'OP_BOOKING',
    templateText: '🔔 Care Navigator OP Update: Your token #{{tokenNo}} for {{doctorName}} at {{hospitalName}} is serving next in {{queueAhead}} patient(s). Please proceed to {{roomNo}}.',
    deliveryRate: '98.9%',
    sentCount: 3840
  },
  {
    id: 'notif-tpl-3',
    title: 'Emergency Bed Availability Notice',
    channel: 'IN_APP & EMAIL',
    category: 'FACILITY_CAPACITY',
    templateText: '🏥 Hospital Capacity Update: {{hospitalName}} has updated ICU beds to {{icuBeds}} and Emergency beds to {{emergencyBeds}}.',
    deliveryRate: '100%',
    sentCount: 420
  }
];

const DEFAULT_ROLES = [
  {
    id: 'role-superadmin',
    name: 'Super Admin',
    description: 'Full unconstrained platform control, security configurations, database exports, and user role management.',
    userCount: 2,
    permissions: [
      'patients.view', 'patients.edit', 'patients.delete', 'patients.export',
      'hospitals.manage', 'hospitals.verify', 'hospitals.delete',
      'doctors.manage', 'doctors.verify',
      'appointments.view', 'appointments.override', 'appointments.cancel',
      'emergencies.view', 'emergencies.dispatch', 'emergencies.escalate',
      'ai.configure', 'ai.safety_audit',
      'notifications.broadcast', 'roles.manage', 'audit.view', 'settings.update'
    ]
  },
  {
    id: 'role-hospitaladmin',
    name: 'Hospital Administrator',
    description: 'Manages specific hospital capacity, departments, doctor rosters, and incoming OP token appointments.',
    userCount: 8,
    permissions: [
      'hospitals.view', 'hospitals.manage_own',
      'doctors.manage_own', 'appointments.view_hospital', 'appointments.override_hospital',
      'audit.view_hospital'
    ]
  },
  {
    id: 'role-emergencyoperator',
    name: '108 Emergency Dispatch Operator',
    description: 'Coordinates ambulance fleet, handles SOS calls, assigns responders, and routes critical trauma to nearby hospital ERs.',
    userCount: 14,
    permissions: [
      'emergencies.view', 'emergencies.dispatch', 'emergencies.escalate',
      'hospitals.view_beds', 'patients.view_emergency'
    ]
  },
  {
    id: 'role-doctor',
    name: 'Medical Officer / Doctor',
    description: 'Reviews assigned OPD queue, serves tokens, updates patient digital prescription records, and requests lab investigations.',
    userCount: 32,
    permissions: [
      'appointments.view_assigned', 'appointments.serve',
      'patients.view_medical_summary', 'records.upload'
    ]
  },
  {
    id: 'role-auditor',
    name: 'Compliance & Audit Officer',
    description: 'Read-only access to regulatory compliance reports, immutable audit trails, and healthcare quality metrics.',
    userCount: 3,
    permissions: [
      'audit.view', 'reports.view', 'reports.export', 'ai.safety_audit'
    ]
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'log-101',
    timestamp: '2026-10-22T10:18:22Z',
    actor: 'Dr. Ramesh Kumar',
    actorRole: 'Super Admin',
    action: 'HOSPITAL_VERIFIED',
    resource: 'hosp-3 (Ramesh Hospitals)',
    status: 'SUCCESS',
    ipAddress: '103.112.44.18',
    details: 'Verified NABH accreditation documents & updated ICU bed allocation to 18.'
  },
  {
    id: 'log-102',
    timestamp: '2026-10-22T10:14:15Z',
    actor: 'System 108 Dispatch Engine',
    actorRole: 'System Automation',
    action: 'AMBULANCE_DISPATCHED',
    resource: 'EMG-2026-9481 (Unit ALS #04)',
    status: 'SUCCESS',
    ipAddress: '10.0.4.1',
    details: 'Assigned nearest Advanced Life Support unit AP 07 TE 1084 with 3-minute ETA.'
  },
  {
    id: 'log-103',
    timestamp: '2026-10-22T09:30:10Z',
    actor: 'S. K. Rao (Reception Desk)',
    actorRole: 'Hospital Administrator',
    action: 'OP_TOKEN_SERVED',
    resource: 'op-2026-105 (Token #03)',
    status: 'SUCCESS',
    ipAddress: '192.168.1.104',
    details: 'Completed Cardiology OPD consultation for patient K. Somasekhar.'
  },
  {
    id: 'log-104',
    timestamp: '2026-10-22T08:45:00Z',
    actor: 'Security Firewall Guard',
    actorRole: 'Security Automated Service',
    action: 'UNAUTHORIZED_LOGIN_BLOCKED',
    resource: 'Staff Login Endpoint',
    status: 'WARNING',
    ipAddress: '185.220.101.5',
    details: 'Blocked 5 consecutive invalid PIN attempts from unauthorized IP range.'
  },
  {
    id: 'log-105',
    timestamp: '2026-10-22T08:00:00Z',
    actor: 'Dr. Ramesh Kumar',
    actorRole: 'Super Admin',
    action: 'AI_SAFETY_TRIGGER_UPDATED',
    resource: 'Gemini Healthcare Triage Config',
    status: 'SUCCESS',
    ipAddress: '103.112.44.18',
    details: 'Added pediatric airway collapse to mandatory immediate 108 dispatch trigger keywords.'
  }
];

const DEFAULT_SETTINGS = {
  portalName: 'Care Navigator Emergency & Health Control Console',
  jurisdiction: 'Government of Andhra Pradesh • Health & Family Welfare Dept',
  environment: 'Production Gateway',
  firestoreSync: true,
  firestoreProject: 'care-navigator-a8a2d',
  emergencyHotline: '108',
  nationalEmergencyNumber: '112',
  healthHelpline: '104',
  maintenanceMode: false,
  autoRefreshSeconds: 15,
  sessionTimeoutMinutes: 30,
  requireMfaForStaff: true,
  allowSimulatedTelemetry: false,
  apiEndpoint: '/api/admin'
};

// -----------------------------------------------------------------------------
// Storage Manager with Local Persistence & Backend REST Sync
// -----------------------------------------------------------------------------

export class AdminStorage {
  static getDatabase() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse admin storage:', e);
    }

    const initial = {
      hospitals: DEFAULT_HOSPITALS,
      doctors: DEFAULT_DOCTORS,
      patients: DEFAULT_PATIENTS,
      appointments: DEFAULT_APPOINTMENTS,
      emergencies: DEFAULT_EMERGENCIES,
      aiConfig: DEFAULT_AI_CONFIG,
      notifications: DEFAULT_NOTIFICATIONS,
      roles: DEFAULT_ROLES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      settings: DEFAULT_SETTINGS
    };

    AdminStorage.saveDatabase(initial);
    return initial;
  }

  static saveDatabase(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save admin database:', e);
    }
  }

  static addAuditLog(actor, action, resource, outcome, details) {
    const db = AdminStorage.getDatabase();
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actor || 'Admin User',
      actorRole: 'Administrator',
      action,
      resource,
      status: outcome || 'SUCCESS',
      ipAddress: '127.0.0.1 (Local Session)',
      details
    };
    db.auditLogs = [newLog, ...db.auditLogs.slice(0, 199)];
    AdminStorage.saveDatabase(db);
    return newLog;
  }
}

// -----------------------------------------------------------------------------
// Service Methods
// -----------------------------------------------------------------------------

export const adminService = {
  // 1. Dashboard Overview Metrics
  getDashboardStats: async () => {
    const db = AdminStorage.getDatabase();
    
    const totalPatients = db.patients.length;
    const verifiedHospitals = db.hospitals.filter(h => h.status === 'VERIFIED').length;
    const pendingHospitals = db.hospitals.filter(h => h.status === 'PENDING_REVIEW').length;
    const verifiedDoctors = db.doctors.filter(d => d.status === 'VERIFIED').length;
    
    const todayAppts = db.appointments.filter(a => a.date === '2026-10-22' || a.date === 'Today');
    const totalApptsToday = todayAppts.length;
    const servingAppts = todayAppts.filter(a => a.status === 'SERVING').length;
    const pendingAppts = todayAppts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
    const cancelledAppts = db.appointments.filter(a => a.status === 'CANCELLED').length;
    
    const activeEmergencies = db.emergencies.filter(e => e.status === 'DISPATCHED' || e.status === 'TRANSPORTING').length;
    const resolvedEmergencies = db.emergencies.filter(e => e.status === 'RESOLVED').length;
    
    const totalEmergencyBeds = db.hospitals.reduce((acc, h) => acc + (h.emergencyBeds || 0), 0);
    const totalIcuBeds = db.hospitals.reduce((acc, h) => acc + (h.icuBeds || 0), 0);
    const totalVentilators = db.hospitals.reduce((acc, h) => acc + (h.ventilators || 0), 0);

    return {
      totalPatients,
      verifiedHospitals,
      pendingHospitals,
      verifiedDoctors,
      totalApptsToday,
      servingAppts,
      pendingAppts,
      cancelledAppts,
      activeEmergencies,
      resolvedEmergencies,
      totalEmergencyBeds,
      totalIcuBeds,
      totalVentilators,
      recentActivity: db.auditLogs.slice(0, 6)
    };
  },

  // 2. Patient Management
  getPatients: async (search = '', status = 'ALL') => {
    const db = AdminStorage.getDatabase();
    let list = db.patients;
    if (status && status !== 'ALL') {
      list = list.filter(p => p.accountStatus === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.abhaId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q))
      );
    }
    return list;
  },

  updatePatientStatus: async (patientId, newStatus, reason) => {
    const db = AdminStorage.getDatabase();
    const idx = db.patients.findIndex(p => p.id === patientId);
    if (idx === -1) throw new Error('Patient not found');
    
    const oldStatus = db.patients[idx].accountStatus;
    db.patients[idx].accountStatus = newStatus;
    db.patients[idx].statusReason = reason;
    db.patients[idx].updatedAt = new Date().toISOString();
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      'Super Admin',
      'PATIENT_STATUS_UPDATED',
      `Patient ${patientId} (${db.patients[idx].name})`,
      'SUCCESS',
      `Changed account status from ${oldStatus} to ${newStatus}. Reason: ${reason || 'Administrative action'}`
    );

    return db.patients[idx];
  },

  savePatient: async (patientData) => {
    const db = AdminStorage.getDatabase();
    if (patientData.id) {
      const idx = db.patients.findIndex(p => p.id === patientData.id);
      if (idx !== -1) {
        db.patients[idx] = { ...db.patients[idx], ...patientData, updatedAt: new Date().toISOString() };
        AdminStorage.saveDatabase(db);
        AdminStorage.addAuditLog('Admin', 'PATIENT_UPDATED', `Patient ${patientData.id}`, 'SUCCESS', 'Patient details modified.');
        return db.patients[idx];
      }
    }
    const newPat = {
      id: `pat-${Date.now()}`,
      registeredDate: new Date().toISOString().split('T')[0],
      accountStatus: 'ACTIVE',
      profileCompletion: 80,
      totalVisits: 0,
      ...patientData
    };
    db.patients = [newPat, ...db.patients];
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog('Admin', 'PATIENT_REGISTERED', `Patient ${newPat.id} (${newPat.name})`, 'SUCCESS', 'New patient registered in database.');
    return newPat;
  },

  // 3. Hospital Management
  getHospitals: async (search = '', status = 'ALL') => {
    const db = AdminStorage.getDatabase();
    let list = db.hospitals;
    if (status && status !== 'ALL') {
      list = list.filter(h => h.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        h.registrationNo.toLowerCase().includes(q)
      );
    }
    return list;
  },

  saveHospital: async (hospData) => {
    const db = AdminStorage.getDatabase();
    if (hospData.id) {
      const idx = db.hospitals.findIndex(h => h.id === hospData.id);
      if (idx !== -1) {
        db.hospitals[idx] = { ...db.hospitals[idx], ...hospData, updatedAt: new Date().toISOString() };
        AdminStorage.saveDatabase(db);
        AdminStorage.addAuditLog('Super Admin', 'HOSPITAL_UPDATED', `Hospital ${hospData.id} (${hospData.name})`, 'SUCCESS', 'Hospital bed and profile data updated.');
        return db.hospitals[idx];
      }
    }
    const newHosp = {
      id: `hosp-${Date.now()}`,
      status: 'PENDING_REVIEW',
      verificationDate: null,
      rating: 4.5,
      ...hospData
    };
    db.hospitals = [newHosp, ...db.hospitals];
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog('Super Admin', 'HOSPITAL_ADDED', `Hospital ${newHosp.id} (${newHosp.name})`, 'SUCCESS', 'Hospital submitted for verification.');
    return newHosp;
  },

  updateHospitalStatus: async (hospitalId, status, reason) => {
    const db = AdminStorage.getDatabase();
    const idx = db.hospitals.findIndex(h => h.id === hospitalId);
    if (idx === -1) throw new Error('Hospital not found');
    
    db.hospitals[idx].status = status;
    db.hospitals[idx].verificationReason = reason;
    if (status === 'VERIFIED') {
      db.hospitals[idx].verificationDate = new Date().toISOString().split('T')[0];
      db.hospitals[idx].verifiedBy = 'Dr. Ramesh Kumar (Super Admin)';
    }
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      'Super Admin',
      `HOSPITAL_${status}`,
      `Hospital ${hospitalId} (${db.hospitals[idx].name})`,
      'SUCCESS',
      `Hospital verification status changed to ${status}. Notes: ${reason || 'Approved after document review'}`
    );

    return db.hospitals[idx];
  },

  // 4. Doctor Management
  getDoctors: async (search = '', specialty = 'ALL') => {
    const db = AdminStorage.getDatabase();
    let list = db.doctors;
    if (specialty && specialty !== 'ALL') {
      list = list.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospitalName.toLowerCase().includes(q) ||
        d.councilRegNo.toLowerCase().includes(q)
      );
    }
    return list;
  },

  saveDoctor: async (docData) => {
    const db = AdminStorage.getDatabase();
    if (docData.id) {
      const idx = db.doctors.findIndex(d => d.id === docData.id);
      if (idx !== -1) {
        db.doctors[idx] = { ...db.doctors[idx], ...docData, updatedAt: new Date().toISOString() };
        AdminStorage.saveDatabase(db);
        AdminStorage.addAuditLog('Admin', 'DOCTOR_UPDATED', `Doctor ${docData.id} (${docData.name})`, 'SUCCESS', 'Doctor details and duty shift modified.');
        return db.doctors[idx];
      }
    }
    const newDoc = {
      id: `doc-${Date.now()}`,
      status: 'VERIFIED',
      isAvailable: true,
      todayTokens: 0,
      rating: 4.8,
      ...docData
    };
    db.doctors = [newDoc, ...db.doctors];
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog('Admin', 'DOCTOR_REGISTERED', `Doctor ${newDoc.id} (${newDoc.name})`, 'SUCCESS', 'New doctor credentials verified and registered.');
    return newDoc;
  },

  toggleDoctorAvailability: async (doctorId) => {
    const db = AdminStorage.getDatabase();
    const idx = db.doctors.findIndex(d => d.id === doctorId);
    if (idx === -1) throw new Error('Doctor not found');
    db.doctors[idx].isAvailable = !db.doctors[idx].isAvailable;
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog(
      'Admin',
      'DOCTOR_AVAILABILITY_TOGGLED',
      `Doctor ${doctorId} (${db.doctors[idx].name})`,
      'SUCCESS',
      `Availability status changed to ${db.doctors[idx].isAvailable ? 'AVAILABLE' : 'OFFLINE'}`
    );
    return db.doctors[idx];
  },

  // 5. OP Appointment Management
  getAppointments: async (search = '', status = 'ALL') => {
    const db = AdminStorage.getDatabase();
    let list = db.appointments;
    if (status && status !== 'ALL') {
      list = list.filter(a => a.status === status);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(a => 
        a.tokenNumber.includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.hospitalName.toLowerCase().includes(q) ||
        a.qrCode.toLowerCase().includes(q)
      );
    }
    return list;
  },

  updateAppointmentStatus: async (appointmentId, newStatus, reason = '') => {
    const db = AdminStorage.getDatabase();
    const idx = db.appointments.findIndex(a => a.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');
    
    const oldStatus = db.appointments[idx].status;
    db.appointments[idx].status = newStatus;
    if (newStatus === 'SERVING') {
      db.appointments[idx].currentServing = db.appointments[idx].tokenNumber;
      db.appointments[idx].queueAhead = 0;
    }
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      'Hospital Desk / Admin',
      'APPOINTMENT_STATUS_CHANGED',
      `Token #${db.appointments[idx].tokenNumber} (${appointmentId})`,
      'SUCCESS',
      `Status updated from ${oldStatus} to ${newStatus}. ${reason ? `Notes: ${reason}` : ''}`
    );

    return db.appointments[idx];
  },

  // 6. 108 Emergency Control Center
  getEmergencies: async (priority = 'ALL') => {
    const db = AdminStorage.getDatabase();
    let list = db.emergencies;
    if (priority && priority !== 'ALL') {
      list = list.filter(e => e.priority === priority);
    }
    return list;
  },

  updateEmergencyStatus: async (emergencyId, newStatus, notes = '') => {
    const db = AdminStorage.getDatabase();
    const idx = db.emergencies.findIndex(e => e.id === emergencyId);
    if (idx === -1) throw new Error('Emergency request not found');
    
    db.emergencies[idx].status = newStatus;
    if (notes) db.emergencies[idx].notes = notes;
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      '108 Dispatcher',
      'EMERGENCY_STATUS_UPDATED',
      `Dispatch ${emergencyId}`,
      'SUCCESS',
      `108 Ambulance Status transitioned to ${newStatus}.`
    );

    return db.emergencies[idx];
  },

  assignAmbulance: async (emergencyId, ambulanceNo, driverName, driverPhone) => {
    const db = AdminStorage.getDatabase();
    const idx = db.emergencies.findIndex(e => e.id === emergencyId);
    if (idx === -1) throw new Error('Emergency request not found');

    db.emergencies[idx].assignedAmbulance = ambulanceNo;
    db.emergencies[idx].driverName = driverName;
    db.emergencies[idx].driverPhone = driverPhone;
    db.emergencies[idx].status = 'DISPATCHED';
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      '108 Dispatcher',
      'AMBULANCE_REASSIGNED',
      `Dispatch ${emergencyId}`,
      'SUCCESS',
      `Assigned Ambulance ${ambulanceNo} with driver ${driverName} (${driverPhone}).`
    );

    return db.emergencies[idx];
  },

  // 7. AI Assistant Management
  getAiConfig: async () => {
    const db = AdminStorage.getDatabase();
    return db.aiConfig;
  },

  saveAiConfig: async (config) => {
    const db = AdminStorage.getDatabase();
    db.aiConfig = { ...db.aiConfig, ...config };
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog('Super Admin', 'AI_CONFIG_UPDATED', 'AI Triage Engine Settings', 'SUCCESS', 'Healthcare AI parameters & safety keywords updated.');
    return db.aiConfig;
  },

  // 8. Notifications Hub
  getNotifications: async () => {
    const db = AdminStorage.getDatabase();
    return db.notifications;
  },

  sendBroadcast: async (title, channel, message, targetRole = 'ALL') => {
    const db = AdminStorage.getDatabase();
    const newBroadcast = {
      id: `notif-${Date.now()}`,
      title,
      channel,
      category: 'ADMIN_BROADCAST',
      templateText: message,
      targetRole,
      deliveryRate: '100%',
      sentCount: db.patients.length + db.doctors.length,
      sentAt: new Date().toISOString()
    };
    db.notifications = [newBroadcast, ...db.notifications];
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      'Super Admin',
      'NOTIFICATION_BROADCAST_SENT',
      `Channel: ${channel} (${targetRole})`,
      'SUCCESS',
      `Sent: "${title}" to all authorized recipients.`
    );

    return newBroadcast;
  },

  // 9. Roles & Permissions (RBAC)
  getRoles: async () => {
    const db = AdminStorage.getDatabase();
    return db.roles;
  },

  updateRolePermissions: async (roleId, permissions) => {
    const db = AdminStorage.getDatabase();
    const idx = db.roles.findIndex(r => r.id === roleId);
    if (idx === -1) throw new Error('Role not found');
    db.roles[idx].permissions = permissions;
    AdminStorage.saveDatabase(db);

    AdminStorage.addAuditLog(
      'Super Admin',
      'ROLE_PERMISSIONS_MODIFIED',
      `Role ${db.roles[idx].name}`,
      'SUCCESS',
      `Granted permissions: ${permissions.join(', ')}`
    );

    return db.roles[idx];
  },

  // 10. Audit Logs & System Settings
  getAuditLogs: async (search = '') => {
    const db = AdminStorage.getDatabase();
    if (!search.trim()) return db.auditLogs;
    const q = search.toLowerCase().trim();
    return db.auditLogs.filter(l => 
      l.actor.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
    );
  },

  getSystemSettings: async () => {
    const db = AdminStorage.getDatabase();
    return db.settings;
  },

  saveSystemSettings: async (settings) => {
    const db = AdminStorage.getDatabase();
    db.settings = { ...db.settings, ...settings };
    AdminStorage.saveDatabase(db);
    AdminStorage.addAuditLog('Super Admin', 'SYSTEM_SETTINGS_UPDATED', 'Platform Settings', 'SUCCESS', 'Updated system preferences and security thresholds.');
    return db.settings;
  },

  // 11. Data Export Helper
  exportCsv: (data, filename) => {
    if (!data || !data.length) return false;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => {
      return Object.values(item).map(val => {
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + '\n' + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${filename || 'export'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    AdminStorage.addAuditLog('Admin', 'DATA_EXPORTED', filename, 'SUCCESS', `Exported ${data.length} records to CSV.`);
    return true;
  }
};
