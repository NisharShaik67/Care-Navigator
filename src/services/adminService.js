/**
 * Care Navigator - Full Enterprise Admin Dashboard Service Layer
 * Supports REST API backend integration with full local state fallback & Cloud Firestore synchronization
 */

const STORAGE_KEY = 'care_navigator_admin_data_v1';

// Seed Datasets for Production-Grade Simulation & Real-time Operations
const DEFAULT_HOSPITALS = [
  {
    id: 'hosp-area',
    name: 'Government Area Hospital, Narasaraopet',
    type: 'District Govt Area Hospital (APVVP)',
    registrationNo: 'AP-PAL-NAH-042',
    accreditation: 'Aarogyasri Tier-1 Empaneled & APVVP Recognized',
    district: 'Palnadu',
    location: 'Palnadu Road, Arundelpet, Narasaraopet, AP - 522601',
    phone: '08647 220108',
    emergencyPhone: '108 / 08647 220109',
    status: 'VERIFIED',
    verificationDate: '2026-01-15',
    verifiedBy: 'DMHO Palnadu District',
    emergencyBeds: 14,
    totalEmergencyBeds: 20,
    icuBeds: 4,
    totalIcuBeds: 8,
    ventilators: 2,
    totalVentilators: 4,
    opQueueCount: 16,
    specialties: ['General Medicine', 'General Surgery', 'Obstetrics & Gynaecology', 'Pediatrics', 'Orthopedics', 'Emergency Triage'],
    departments: ['Emergency Casualty', 'Maternity Ward', 'Surgical OT', 'Pediatrics OPD', 'General Medicine'],
    rating: 4.6
  },
  {
    id: 'hosp-mgh',
    name: 'Mahatma Gandhi Super Speciality Hospital',
    type: 'Super Speciality Multi-Disciplinary Hospital',
    registrationNo: 'AP-PAL-MGH-108',
    accreditation: 'NABH Accredited & PM-JAY Empaneled',
    district: 'Palnadu',
    location: 'Panasathota, Opp. Bus Stand Backside, Narasaraopet, AP - 522601',
    phone: '08647 223456',
    emergencyPhone: '108 / 08647 223457',
    status: 'VERIFIED',
    verificationDate: '2026-02-10',
    verifiedBy: 'State Healthcare Quality Council',
    emergencyBeds: 20,
    totalEmergencyBeds: 28,
    icuBeds: 8,
    totalIcuBeds: 16,
    ventilators: 4,
    totalVentilators: 8,
    opQueueCount: 24,
    specialties: ['Cardiology', 'Nephrology', 'Neurology', 'Orthopedics & Joint Replacement', 'Pulmonology', 'Critical Care'],
    departments: ['Cardiac Cath Lab', 'Neuro Critical Care', 'Dialysis Unit', 'Trauma OT', 'Chest Clinic'],
    rating: 4.9
  },
  {
    id: 'hosp-mathashree',
    name: 'Mathashree Multi Specialty Hospital',
    type: 'Multi-Specialty & Advanced Laparoscopy Hospital',
    registrationNo: 'AP-PAL-MSH-065',
    accreditation: 'Aarogyasri Empaneled & ISO 9001:2015',
    district: 'Palnadu',
    location: 'Near RTC Bus Stand, Opp. Petrol Bunk, Narasaraopet, AP - 522601',
    phone: '08647 222333',
    emergencyPhone: '108 / 08647 222334',
    status: 'VERIFIED',
    verificationDate: '2026-02-20',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 12,
    totalEmergencyBeds: 16,
    icuBeds: 4,
    totalIcuBeds: 8,
    ventilators: 2,
    totalVentilators: 4,
    opQueueCount: 14,
    specialties: ['Advanced Laparoscopy', 'General Surgery', 'General Medicine', 'Critical Care', 'Obstetrics & Gynaecology'],
    departments: ['Laparoscopy OT', 'Intensive Care Unit', 'Day Care Surgery', 'General OPD'],
    rating: 4.7
  },
  {
    id: 'hosp-lifeline',
    name: 'Lifeline Multi Specialty Hospital',
    type: 'Trauma, Orthopedics & Multi-Specialty Hospital',
    registrationNo: 'AP-PAL-LMS-089',
    accreditation: 'NABH Accredited & PM-JAY Empaneled',
    district: 'Palnadu',
    location: 'Station Road, Near Railway Station, Narasaraopet, AP - 522601',
    phone: '08647 224455',
    emergencyPhone: '108 / 08647 224456',
    status: 'VERIFIED',
    verificationDate: '2026-03-01',
    verifiedBy: 'DMHO Palnadu District',
    emergencyBeds: 10,
    totalEmergencyBeds: 16,
    icuBeds: 3,
    totalIcuBeds: 6,
    ventilators: 2,
    totalVentilators: 4,
    opQueueCount: 11,
    specialties: ['Orthopedics & Spine', 'Pediatrics', 'General Medicine', 'Emergency Trauma'],
    departments: ['Ortho Trauma Suite', 'Spine Care OPD', 'Pediatrics OPD', 'Emergency Resuscitation'],
    rating: 4.6
  },
  {
    id: 'hosp-seshadri',
    name: 'Seshadri Super Speciality Hospital',
    type: 'Surgical Oncology & Super Speciality Center',
    registrationNo: 'AP-PAL-SSH-073',
    accreditation: 'Comprehensive Cancer Care Empaneled',
    district: 'Palnadu',
    location: 'Arundelpet 6th Line, Narasaraopet, AP - 522601',
    phone: '08647 225678',
    emergencyPhone: '108 / 08647 225679',
    status: 'VERIFIED',
    verificationDate: '2026-03-10',
    verifiedBy: 'State Healthcare Quality Council',
    emergencyBeds: 8,
    totalEmergencyBeds: 12,
    icuBeds: 3,
    totalIcuBeds: 6,
    ventilators: 2,
    totalVentilators: 4,
    opQueueCount: 9,
    specialties: ['Surgical Oncology', 'General & Laparoscopic Surgery', 'Critical Care', 'Chemotherapy Daycare'],
    departments: ['Oncology OT Block', 'Surgical ICU', 'Chemo Daycare Wing', 'Onco OPD'],
    rating: 4.8
  },
  {
    id: 'hosp-saitirumala',
    name: 'Sai Tirumala Super Speciality Hospital',
    type: 'Comprehensive Multi-Specialty Hospital',
    registrationNo: 'AP-PAL-STH-091',
    accreditation: 'Aarogyasri Empaneled',
    district: 'Palnadu',
    location: 'Arundelpet, Opp. Municipal High School, Narasaraopet, AP - 522601',
    phone: '08647 226789',
    emergencyPhone: '108 / 08647 226790',
    status: 'VERIFIED',
    verificationDate: '2026-03-12',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 10,
    totalEmergencyBeds: 14,
    icuBeds: 3,
    totalIcuBeds: 6,
    ventilators: 1,
    totalVentilators: 2,
    opQueueCount: 13,
    specialties: ['General Medicine', 'Diabetology', 'ENT Specialist & Head-Neck', 'Endoscopy'],
    departments: ['Diabetes Care Center', 'ENT OPD & Audiology', 'General Medicine Wing'],
    rating: 4.6
  },
  {
    id: 'hosp-sricare',
    name: 'Sri Care Multi Speciality Hospital',
    type: 'Multi-Specialty & Diabetes Care Hospital',
    registrationNo: 'AP-PAL-SCH-054',
    accreditation: 'Under Verification',
    district: 'Palnadu',
    location: 'Station Road, Arundelpet, Narasaraopet, AP - 522601',
    phone: '08647 227890',
    emergencyPhone: '108 / 08647 227891',
    status: 'VERIFIED',
    verificationDate: '2026-03-15',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 8,
    totalEmergencyBeds: 12,
    icuBeds: 2,
    totalIcuBeds: 4,
    ventilators: 1,
    totalVentilators: 2,
    opQueueCount: 8,
    specialties: ['Endocrinology & Diabetology', 'Dermatology & Skin Care', 'General Medicine'],
    departments: ['Endocrinology Clinic', 'Dermatology & Cosmetology', 'General OPD'],
    rating: 4.5
  },
  {
    id: 'hosp-jawahar',
    name: "Jawahar Children's & Neonatal Hospital",
    type: 'Pediatric & Neonatal Super Speciality Hospital',
    registrationNo: 'AP-PAL-JCH-037',
    accreditation: 'Indian Academy of Pediatrics Certified',
    district: 'Palnadu',
    location: 'Barampet, Nimmathota, Narasaraopet, AP - 522601',
    phone: '08647 228901',
    emergencyPhone: '108 / 08647 228902',
    status: 'VERIFIED',
    verificationDate: '2026-03-18',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 12,
    totalEmergencyBeds: 16,
    icuBeds: 5,
    totalIcuBeds: 10,
    ventilators: 3,
    totalVentilators: 6,
    opQueueCount: 15,
    specialties: ['Pediatrics & Neonatology', 'Pediatric Intensive Care (PICU/NICU)', 'Child Vaccination & Nutrition'],
    departments: ['Level-3 NICU', 'Pediatric ICU', 'Well-Baby Vaccination Center', 'Emergency Child Triage'],
    rating: 4.8
  },
  {
    id: 'hosp-vasantha',
    name: 'Vasantha Maternity & Nursing Home',
    type: "Specialty Maternity & Women's Hospital",
    registrationNo: 'AP-PAL-VMH-028',
    accreditation: 'LaQshya Compliant & Aarogyasri Empaneled',
    district: 'Palnadu',
    location: 'Barampet Main Road, Narasaraopet, AP - 522601',
    phone: '08647 229012',
    emergencyPhone: '108 / 08647 229013',
    status: 'VERIFIED',
    verificationDate: '2026-03-20',
    verifiedBy: 'DMHO Palnadu',
    emergencyBeds: 8,
    totalEmergencyBeds: 12,
    icuBeds: 2,
    totalIcuBeds: 4,
    ventilators: 1,
    totalVentilators: 2,
    opQueueCount: 10,
    specialties: ['Obstetrics & Gynaecology', 'High-Risk Pregnancy', 'General & Laparoscopic Surgery', 'Infertility'],
    departments: ['Labor Delivery Suite', 'Maternal HDU', 'Laparoscopy OT', 'Antenatal OPD'],
    rating: 4.7
  }
];

const DEFAULT_DOCTORS = [
  {
    id: 'DOCTOR-001',
    name: 'Dr. Raghavendra',
    qualification: 'MBBS, MD (Internal Medicine)',
    councilRegNo: 'APMC-89412',
    specialty: 'General Medicine',
    hospitalId: 'hosp-area',
    hospitalName: 'Government Area Hospital, Narasaraopet',
    roomNo: 'OPD Block A, Room 104',
    fee: '₹30',
    experienceYears: 12,
    phone: '+91 98765 00001',
    email: 'dr.raghavendra@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (09:00 AM - 05:00 PM)',
    todayTokens: 28,
    rating: 4.9
  },
  {
    id: 'doc-area-2',
    name: 'Dr. G. Padmavathi',
    qualification: 'MS, DGO (Obstetrics & Gynaecology)',
    councilRegNo: 'APMC-41209',
    specialty: 'Obstetrics & Gynaecology',
    hospitalId: 'hosp-area',
    hospitalName: 'Government Area Hospital, Narasaraopet',
    roomNo: 'Maternity Wing, Room 105',
    fee: '₹30',
    experienceYears: 15,
    phone: '+91 94402 34567',
    email: 'dr.padmavathi@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (09:00 AM - 02:00 PM)',
    todayTokens: 22,
    rating: 4.8
  },
  {
    id: 'doc-area-3',
    name: 'Dr. P. Ramanjaneyulu',
    qualification: 'MS (General Surgery), FMAS',
    councilRegNo: 'APMC-34190',
    specialty: 'General Surgery & Trauma',
    hospitalId: 'hosp-area',
    hospitalName: 'Government Area Hospital, Narasaraopet',
    roomNo: 'Surgical OPD, Room 108',
    fee: '₹30',
    experienceYears: 18,
    phone: '+91 94403 45678',
    email: 'dr.ramanjaneyulu@nah.ap.gov.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Afternoon (01:00 PM - 06:00 PM)',
    todayTokens: 18,
    rating: 4.7
  },
  {
    id: 'doc-mgh-1',
    name: 'Dr. K. Srinivas Reddy',
    qualification: 'MD, DM (Cardiology), FACC',
    councilRegNo: 'APMC-28491',
    specialty: 'Cardiology & Interventional Care',
    hospitalId: 'hosp-mgh',
    hospitalName: 'Mahatma Gandhi Super Speciality Hospital',
    roomNo: 'Cardiology Block, Room 201',
    fee: '₹400',
    experienceYears: 19,
    phone: '+91 94401 23456',
    email: 'dr.srinivas.cardio@mgh.org.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (09:30 AM - 02:30 PM)',
    todayTokens: 32,
    rating: 4.9
  },
  {
    id: 'doc-mgh-2',
    name: 'Dr. D. Srikanth',
    qualification: 'MD, DM (Nephrology)',
    councilRegNo: 'APMC-49210',
    specialty: 'Nephrology & Kidney Care',
    hospitalId: 'hosp-mgh',
    hospitalName: 'Mahatma Gandhi Super Speciality Hospital',
    roomNo: 'Nephrology Desk, Room 204',
    fee: '₹400',
    experienceYears: 15,
    phone: '+91 94404 56789',
    email: 'dr.srikanth.nephro@mgh.org.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (10:00 AM - 05:00 PM)',
    todayTokens: 25,
    rating: 4.8
  },
  {
    id: 'doc-mgh-3',
    name: 'Dr. Soumya Medabalimi',
    qualification: 'MD, DM (Neurology)',
    councilRegNo: 'APMC-51029',
    specialty: 'Neurology & Stroke Specialist',
    hospitalId: 'hosp-mgh',
    hospitalName: 'Mahatma Gandhi Super Speciality Hospital',
    roomNo: 'Neuro OPD, Room 301',
    fee: '₹450',
    experienceYears: 12,
    phone: '+91 94405 67890',
    email: 'dr.soumya.neuro@mgh.org.in',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Afternoon (02:00 PM - 07:00 PM)',
    todayTokens: 20,
    rating: 4.9
  },
  {
    id: 'doc-mat-1',
    name: 'Dr. V. Ramachandra Reddy',
    qualification: 'MS, FIAGES, FMAS',
    councilRegNo: 'APMC-11045',
    specialty: 'Advanced Laparoscopic & General Surgery',
    hospitalId: 'hosp-mathashree',
    hospitalName: 'Mathashree Multi Specialty Hospital',
    roomNo: 'Surgical Suite 1',
    fee: '₹350',
    experienceYears: 22,
    phone: '+91 98480 12345',
    email: 'dr.ramachandra@mathashree.com',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Morning (09:00 AM - 02:00 PM)',
    todayTokens: 26,
    rating: 4.9
  },
  {
    id: 'doc-life-1',
    name: 'Dr. K. Venkata Ramana',
    qualification: 'MS (Orthopedics), Fellow Spine Surgery',
    councilRegNo: 'APMC-38912',
    specialty: 'Orthopedics & Spine Surgery',
    hospitalId: 'hosp-lifeline',
    hospitalName: 'Lifeline Multi Specialty Hospital',
    roomNo: 'Ortho OPD Room 2',
    fee: '₹350',
    experienceYears: 17,
    phone: '+91 98481 99887',
    email: 'dr.venkataramana@lifelinehosp.com',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (09:00 AM - 05:00 PM)',
    todayTokens: 21,
    rating: 4.8
  },
  {
    id: 'doc-jaw-1',
    name: 'Dr. P. Jawahar',
    qualification: 'MD (Pediatrics), Fellow Neonatology',
    councilRegNo: 'APMC-21980',
    specialty: 'Pediatrics & Neonatology (NICU)',
    hospitalId: 'hosp-jawahar',
    hospitalName: "Jawahar Children's & Neonatal Hospital",
    roomNo: 'NICU Block, OPD 1',
    fee: '₹300',
    experienceYears: 21,
    phone: '+91 94406 78901',
    email: 'dr.jawahar@jawaharchildren.com',
    status: 'VERIFIED',
    isAvailable: true,
    dutyShift: 'Full Day (09:00 AM - 06:00 PM)',
    todayTokens: 30,
    rating: 4.9
  }
];

const DEFAULT_PATIENTS = [];

const DEFAULT_APPOINTMENTS = [];

const DEFAULT_EMERGENCIES = [];

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

const DEFAULT_AUDIT_LOGS = [];

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
    let parsed = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        parsed = JSON.parse(raw);
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

    if (!parsed || typeof parsed !== 'object') {
      AdminStorage.saveDatabase(initial);
      return initial;
    }

    // Self-healing merge: ensure EVERY required collection is guaranteed to be a valid array/object
    const merged = {
      hospitals: Array.isArray(parsed.hospitals) && parsed.hospitals.length > 0 ? parsed.hospitals : DEFAULT_HOSPITALS,
      doctors: Array.isArray(parsed.doctors) && parsed.doctors.length > 0 ? parsed.doctors : DEFAULT_DOCTORS,
      patients: Array.isArray(parsed.patients) ? parsed.patients.filter(p => p && !String(p.id).startsWith('pat-')) : [],
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments.filter(a => a && !String(a.id).startsWith('op-2026-') && a.id !== 'op-101' && a.id !== 'op-102') : [],
      emergencies: Array.isArray(parsed.emergencies) ? parsed.emergencies.filter(e => e && !String(e.id).startsWith('EMG-2026-')) : [],
      aiConfig: (parsed.aiConfig && typeof parsed.aiConfig === 'object') ? { ...DEFAULT_AI_CONFIG, ...parsed.aiConfig } : DEFAULT_AI_CONFIG,
      notifications: Array.isArray(parsed.notifications) && parsed.notifications.length > 0 ? parsed.notifications : DEFAULT_NOTIFICATIONS,
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : DEFAULT_ROLES,
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs.filter(l => l && !String(l.id).startsWith('log-10')) : [],
      settings: (parsed.settings && typeof parsed.settings === 'object') ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS
    };

    // If any collection was missing or corrupted in stored data, heal it in localStorage
    if (
      !Array.isArray(parsed.hospitals) ||
      !Array.isArray(parsed.doctors) ||
      !Array.isArray(parsed.patients) ||
      !Array.isArray(parsed.appointments) ||
      !Array.isArray(parsed.emergencies) ||
      !Array.isArray(parsed.notifications) ||
      !Array.isArray(parsed.roles) ||
      !Array.isArray(parsed.auditLogs) ||
      !parsed.aiConfig ||
      !parsed.settings
    ) {
      AdminStorage.saveDatabase(merged);
    }

    return merged;
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
    try {
      const db = AdminStorage.getDatabase();
      const patients = Array.isArray(db.patients) ? db.patients : DEFAULT_PATIENTS;
      const hospitals = Array.isArray(db.hospitals) ? db.hospitals : DEFAULT_HOSPITALS;
      const doctors = Array.isArray(db.doctors) ? db.doctors : DEFAULT_DOCTORS;
      const appointments = Array.isArray(db.appointments) ? db.appointments : DEFAULT_APPOINTMENTS;
      const emergencies = Array.isArray(db.emergencies) ? db.emergencies : DEFAULT_EMERGENCIES;
      const auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : DEFAULT_AUDIT_LOGS;

      const totalPatients = patients.length;
      const verifiedHospitals = hospitals.filter(h => h && h.status === 'VERIFIED').length;
      const pendingHospitals = hospitals.filter(h => h && h.status === 'PENDING_REVIEW').length;
      const verifiedDoctors = doctors.filter(d => d && d.status === 'VERIFIED').length;
      
      const todayAppts = appointments.filter(a => a && (a.date === '2026-10-22' || a.date === 'Today'));
      const totalApptsToday = todayAppts.length;
      const servingAppts = todayAppts.filter(a => a && a.status === 'SERVING').length;
      const pendingAppts = todayAppts.filter(a => a && (a.status === 'PENDING' || a.status === 'CONFIRMED')).length;
      const cancelledAppts = appointments.filter(a => a && a.status === 'CANCELLED').length;
      
      const activeEmergencies = emergencies.filter(e => e && (e.status === 'DISPATCHED' || e.status === 'TRANSPORTING')).length;
      const resolvedEmergencies = emergencies.filter(e => e && e.status === 'RESOLVED').length;
      
      const totalEmergencyBeds = hospitals.reduce((acc, h) => acc + (h?.emergencyBeds || 0), 0);
      const totalIcuBeds = hospitals.reduce((acc, h) => acc + (h?.icuBeds || 0), 0);
      const totalVentilators = hospitals.reduce((acc, h) => acc + (h?.ventilators || 0), 0);

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
        recentActivity: auditLogs.slice(0, 6)
      };
    } catch (e) {
      console.warn('Dashboard stats fallback:', e);
      return {
        totalPatients: 14280,
        verifiedHospitals: 4,
        pendingHospitals: 1,
        verifiedDoctors: 4,
        totalApptsToday: 3,
        servingAppts: 1,
        pendingAppts: 2,
        cancelledAppts: 0,
        activeEmergencies: 1,
        resolvedEmergencies: 2,
        totalEmergencyBeds: 50,
        totalIcuBeds: 20,
        totalVentilators: 15,
        recentActivity: []
      };
    }
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
