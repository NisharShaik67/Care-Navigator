import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  SEED_SYSTEM_META,
  SEED_ACCOUNTS,
  SEED_HOSPITALS,
  SEED_DOCTORS,
  SEED_APPOINTMENTS,
  SEED_EMERGENCIES,
  SEED_REPORTS,
  SEED_AI_CONFIG
} from './seedData';

// Collection Names
export const COLLECTIONS = {
  USERS: 'care_navigator_users',
  ACCOUNTS: 'care_navigator_accounts',
  APPOINTMENTS: 'care_navigator_appointments',
  EMERGENCIES: 'care_navigator_emergencies',
  REPORTS: 'care_navigator_reports',
  HOSPITALS: 'care_navigator_hospitals',
  DOCTORS: 'care_navigator_doctors',
  AI_CONFIG: 'care_navigator_ai_config',
  SYSTEM: 'care_navigator_system'
};

// ---------------------------------------------------------------------------
// 1. User Profiles & Unified Account Sync
// ---------------------------------------------------------------------------

/**
 * Saves or updates a user profile in Firestore
 */
export const saveUserToFirestore = async (userId, userData) => {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const cleanId = String(userId).trim().replace(/\s+/g, '_');
    const userRef = doc(db, COLLECTIONS.USERS, cleanId);
    await setDoc(userRef, {
      ...userData,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to save user ${userId}:`, error);
    return false;
  }
};

/**
 * Loads a user profile by ID from Firestore
 */
export const getUserFromFirestore = async (userId) => {
  if (!isFirebaseConfigured || !db || !userId) return null;
  try {
    const cleanId = String(userId).trim().replace(/\s+/g, '_');
    const userRef = doc(db, COLLECTIONS.USERS, cleanId);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn(`[Firestore] Failed to get user ${userId}:`, error);
    return null;
  }
};

/**
 * Subscribes to real-time changes on a specific user profile
 */
export const subscribeUserFromFirestore = (userId, onUpdate) => {
  if (!isFirebaseConfigured || !db || !userId) return () => {};
  try {
    const cleanId = String(userId).trim().replace(/\s+/g, '_');
    const userRef = doc(db, COLLECTIONS.USERS, cleanId);
    return onSnapshot(userRef, (snap) => {
      if (snap.exists() && onUpdate) {
        onUpdate(snap.data());
      }
    }, (error) => {
      console.warn(`[Firestore] Error subscribing to user ${userId}:`, error);
    });
  } catch {
    return () => {};
  }
};

/**
 * Syncs an account map into Firestore accounts collection
 */
export const syncAccountToFirestore = async (accountId, accountData) => {
  if (!isFirebaseConfigured || !db || !accountId) return false;
  try {
    const accRef = doc(db, COLLECTIONS.ACCOUNTS, String(accountId));
    await setDoc(accRef, {
      ...accountData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to sync account ${accountId}:`, error);
    return false;
  }
};

/**
 * Subscribes to all saved accounts in Firestore
 */
export const subscribeAccountsFromFirestore = (onUpdate) => {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const accsRef = collection(db, COLLECTIONS.ACCOUNTS);
    return onSnapshot(accsRef, (snapshot) => {
      const accounts = {};
      snapshot.forEach(docSnap => {
        accounts[docSnap.id] = docSnap.data();
      });
      if (onUpdate) onUpdate(accounts);
    }, (error) => {
      console.warn('[Firestore] Error subscribing to accounts:', error);
    });
  } catch {
    return () => {};
  }
};

// ---------------------------------------------------------------------------
// 2. OPD Appointments & Live Queue Tokens
// ---------------------------------------------------------------------------

/**
 * Saves a new or existing OP Token Appointment to Firestore
 */
export const saveAppointmentToFirestore = async (appointment) => {
  if (!isFirebaseConfigured || !db || !appointment?.id) return false;
  try {
    const apptRef = doc(db, COLLECTIONS.APPOINTMENTS, String(appointment.id));
    await setDoc(apptRef, {
      ...appointment,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to save appointment ${appointment.id}:`, error);
    return false;
  }
};

/**
 * Updates status or queue number of an appointment
 */
export const updateAppointmentInFirestore = async (appointmentId, updates) => {
  if (!isFirebaseConfigured || !db || !appointmentId) return false;
  try {
    const apptRef = doc(db, COLLECTIONS.APPOINTMENTS, String(appointmentId));
    await updateDoc(apptRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to update appointment ${appointmentId}:`, error);
    return false;
  }
};

/**
 * Subscribes to all live OP token appointments
 */
export const subscribeAppointmentsFromFirestore = (onUpdate) => {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const apptsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    return onSnapshot(apptsRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (onUpdate) onUpdate(list);
    }, (error) => {
      console.warn('[Firestore] Error subscribing to appointments:', error);
    });
  } catch {
    return () => {};
  }
};

// ---------------------------------------------------------------------------
// 3. 108 Emergency Ambulance Dispatches
// ---------------------------------------------------------------------------

/**
 * Saves an emergency dispatch call in Firestore
 */
export const saveEmergencyDispatchToFirestore = async (dispatchData) => {
  if (!isFirebaseConfigured || !db || !dispatchData?.id) return false;
  try {
    const emgRef = doc(db, COLLECTIONS.EMERGENCIES, String(dispatchData.id));
    await setDoc(emgRef, {
      ...dispatchData,
      createdAt: dispatchData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to save emergency dispatch ${dispatchData.id}:`, error);
    return false;
  }
};

/**
 * Updates emergency status (e.g., 'ACTIVE', 'ARRIVED', 'TRANSPORTING', 'COMPLETED')
 */
export const updateEmergencyDispatchInFirestore = async (dispatchId, updates) => {
  if (!isFirebaseConfigured || !db || !dispatchId) return false;
  try {
    const emgRef = doc(db, COLLECTIONS.EMERGENCIES, String(dispatchId));
    await updateDoc(emgRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to update emergency dispatch ${dispatchId}:`, error);
    return false;
  }
};

/**
 * Subscribes to live 108 emergency ambulance dispatches
 */
export const subscribeEmergenciesFromFirestore = (onUpdate) => {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const emgsRef = collection(db, COLLECTIONS.EMERGENCIES);
    return onSnapshot(emgsRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (onUpdate) onUpdate(list);
    }, (error) => {
      console.warn('[Firestore] Error subscribing to emergencies:', error);
    });
  } catch {
    return () => {};
  }
};

// ---------------------------------------------------------------------------
// 4. Digital Health Records & Reports
// ---------------------------------------------------------------------------

/**
 * Saves a medical record or prescription to Firestore
 */
export const saveMedicalRecordToFirestore = async (recordData) => {
  if (!isFirebaseConfigured || !db || !recordData?.id) return false;
  try {
    const recRef = doc(db, COLLECTIONS.REPORTS, String(recordData.id));
    await setDoc(recRef, {
      ...recordData,
      uploadedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Failed to save medical record:`, error);
    return false;
  }
};

/**
 * Checks active Firestore connection and diagnoses rule / permissions status
 */
export const checkFirestoreConnection = async () => {
  if (!isFirebaseConfigured || !db) {
    return {
      connected: false,
      status: 'UNCONFIGURED',
      projectId: 'care-navigator-a8a2d',
      message: 'Firebase is not yet configured.'
    };
  }

  try {
    const testDoc = doc(db, 'care_navigator_system', 'ping');
    await setDoc(testDoc, {
      ping: true,
      lastPingAt: serverTimestamp(),
      portal: 'Care Navigator Health Portal'
    }, { merge: true });

    return {
      connected: true,
      status: 'ONLINE',
      projectId: db.app?.options?.projectId || 'care-navigator-a8a2d',
      message: 'Cloud Firestore connected and synchronized successfully!'
    };
  } catch (error) {
    const errCode = error?.code || '';
    const errMsg = error?.message || '';

    if (errCode === 'permission-denied' || errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      return {
        connected: false,
        status: 'PERMISSION_DENIED',
        projectId: 'care-navigator-a8a2d',
        message: 'Cloud Firestore is connected to care-navigator-a8a2d, but Firestore Security Rules are currently set to locked/read-only mode in Firebase Console.'
      };
    }

    if (errCode === 'not-found' || errMsg.includes('not found') || errMsg.includes('404')) {
      return {
        connected: false,
        status: 'DATABASE_NOT_FOUND',
        projectId: 'care-navigator-a8a2d',
        message: 'Cloud Firestore database has not been initialized in Firebase Console.'
      };
    }

    return {
      connected: false,
      status: 'OFFLINE',
      projectId: 'care-navigator-a8a2d',
      message: errMsg || 'Unable to connect to Cloud Firestore.'
    };
  }
};

// ---------------------------------------------------------------------------
// 5. Cloud Firestore Database Initialization & Seeding
// ---------------------------------------------------------------------------

/**
 * Checks whether the Firestore database has already been initialized with meta
 */
export const isDatabaseInitialized = async () => {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const metaRef = doc(db, COLLECTIONS.SYSTEM, 'meta');
    const snap = await getDoc(metaRef);
    return snap.exists();
  } catch (err) {
    console.warn('[Firestore] Error checking database initialization state:', err);
    return false;
  }
};

/**
 * Initializes and seeds Cloud Firestore with full production-ready Care Navigator
 * baseline records: Accounts, Profiles, Hospitals, Doctors, OPD Appointments,
 * 108 Emergency Telemetry, Health Reports, and AI Triage Configurations.
 *
 * @param {Object} options
 * @param {boolean} options.force - If true, overwrites/merges seed data even if initialized
 * @param {Function} options.onProgress - Optional callback for tracking progress (0-100%)
 */
export const initFirebaseDatabase = async (options = {}) => {
  const { force = false, onProgress = null } = options;

  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      status: 'UNCONFIGURED',
      message: 'Firebase is not configured. Check VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.'
    };
  }

  const reportProgress = (pct, msg) => {
    if (typeof onProgress === 'function') {
      try { onProgress({ percent: pct, message: msg }); } catch {}
    }
  };

  try {
    reportProgress(5, 'Connecting to Cloud Firestore...');

    // If not forcing, check if already initialized
    if (!force) {
      const alreadyInit = await isDatabaseInitialized();
      if (alreadyInit) {
        reportProgress(100, 'Database is already initialized.');
        return {
          success: true,
          status: 'ALREADY_INITIALIZED',
          alreadyInitialized: true,
          message: 'Cloud Firestore is already initialized with baseline data.',
          projectId: db.app?.options?.projectId || 'care-navigator-a8a2d'
        };
      }
    }

    reportProgress(15, 'Seeding System Metadata & Health Ping...');
    // 1. System Metadata & Ping
    await setDoc(doc(db, COLLECTIONS.SYSTEM, 'meta'), {
      ...SEED_SYSTEM_META,
      initializedAt: serverTimestamp(),
      lastVerifiedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, COLLECTIONS.SYSTEM, 'ping'), {
      ping: true,
      lastPingAt: serverTimestamp(),
      portal: 'Care Navigator Health Portal'
    }, { merge: true });

    reportProgress(30, 'Seeding Unified Accounts & Profiles...');
    // 2. Accounts & User Profiles
    let accountsCount = 0;
    for (const [accId, accData] of Object.entries(SEED_ACCOUNTS)) {
      await setDoc(doc(db, COLLECTIONS.ACCOUNTS, accId), {
        ...accData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await setDoc(doc(db, COLLECTIONS.USERS, accId), {
        ...accData,
        lastActive: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      accountsCount++;
    }

    reportProgress(50, 'Seeding Registered Hospitals & Emergency Capacity...');
    // 3. Hospitals
    let hospitalsCount = 0;
    for (const hosp of SEED_HOSPITALS) {
      await setDoc(doc(db, COLLECTIONS.HOSPITALS, hosp.id), {
        ...hosp,
        updatedAt: serverTimestamp()
      }, { merge: true });
      hospitalsCount++;
    }

    reportProgress(65, 'Seeding Verified Duty Doctors & OPD Specialists...');
    // 4. Doctors
    let doctorsCount = 0;
    for (const docItem of SEED_DOCTORS) {
      await setDoc(doc(db, COLLECTIONS.DOCTORS, docItem.id), {
        ...docItem,
        updatedAt: serverTimestamp()
      }, { merge: true });
      doctorsCount++;
    }

    reportProgress(75, 'Seeding Initial OPD Token Appointments...');
    // 5. Appointments
    let appointmentsCount = 0;
    for (const appt of SEED_APPOINTMENTS) {
      await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appt.id), {
        ...appt,
        updatedAt: serverTimestamp()
      }, { merge: true });
      appointmentsCount++;
    }

    reportProgress(85, 'Seeding 108 Emergency Ambulance Dispatches...');
    // 6. Emergencies
    let emergenciesCount = 0;
    for (const emg of SEED_EMERGENCIES) {
      await setDoc(doc(db, COLLECTIONS.EMERGENCIES, emg.id), {
        ...emg,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      emergenciesCount++;
    }

    reportProgress(92, 'Seeding Digital Health Records & Reports...');
    // 7. Medical Reports
    let reportsCount = 0;
    for (const rep of SEED_REPORTS) {
      await setDoc(doc(db, COLLECTIONS.REPORTS, rep.id), {
        ...rep,
        uploadedAt: serverTimestamp()
      }, { merge: true });
      reportsCount++;
    }

    reportProgress(97, 'Configuring AI Triage & Safety Guidelines...');
    // 8. AI Config
    await setDoc(doc(db, COLLECTIONS.AI_CONFIG, 'triage_config'), {
      ...SEED_AI_CONFIG,
      updatedAt: serverTimestamp()
    }, { merge: true });

    reportProgress(100, 'Database Initialization Complete!');
    console.log('✅ [Firestore] Database initialization complete across all collections.');

    return {
      success: true,
      status: 'INITIALIZED',
      projectId: db.app?.options?.projectId || 'care-navigator-a8a2d',
      message: 'Cloud Firestore successfully initialized with all baseline collections and sample records!',
      counts: {
        accounts: accountsCount,
        hospitals: hospitalsCount,
        doctors: doctorsCount,
        appointments: appointmentsCount,
        emergencies: emergenciesCount,
        reports: reportsCount
      },
      collections: Object.values(COLLECTIONS)
    };
  } catch (error) {
    console.error('❌ [Firestore] Database initialization failed:', error);
    const errCode = error?.code || '';
    const errMsg = error?.message || '';

    let userFriendlyMsg = errMsg || 'Database initialization encountered an error.';
    if (errCode === 'permission-denied' || errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
      userFriendlyMsg = 'Permission denied. Please verify that your Firestore security rules allow read/write access in Firebase Console.';
    }

    reportProgress(100, `Failed: ${userFriendlyMsg}`);

    return {
      success: false,
      status: errCode === 'permission-denied' ? 'PERMISSION_DENIED' : 'ERROR',
      error: errMsg,
      message: userFriendlyMsg
    };
  }
};

/**
 * Automatically checks and initializes the database on startup if connected and empty
 */
export const checkAndAutoInitDatabase = async () => {
  if (!isFirebaseConfigured || !db) return;
  try {
    const isInit = await isDatabaseInitialized();
    if (!isInit) {
      console.log('🌱 [Firestore] Empty database detected. Running automatic baseline initialization...');
      await initFirebaseDatabase({ force: false });
    }
  } catch {
    // Non-fatal, fallback to local state
  }
};

