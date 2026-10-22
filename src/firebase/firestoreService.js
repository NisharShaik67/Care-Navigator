import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// Collection Names
const COLLECTIONS = {
  USERS: 'care_navigator_users',
  ACCOUNTS: 'care_navigator_accounts',
  APPOINTMENTS: 'care_navigator_appointments',
  EMERGENCIES: 'care_navigator_emergencies',
  REPORTS: 'care_navigator_reports'
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
