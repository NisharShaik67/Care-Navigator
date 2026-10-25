import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Active Firebase Configuration for Care Navigator
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyA9NWxoN_Q0J90tpU4IE_0ChMFATc2cBSA",
  authDomain: "care-navigator-a8a2d.firebaseapp.com",
  projectId: "care-navigator-a8a2d",
  storageBucket: "care-navigator-a8a2d.firebasestorage.app",
  messagingSenderId: "492582868195",
  appId: "1:492582868195:web:18de8b925e515b3cf7a1d6",
  measurementId: "G-YZPWFVV5WR"
};

// Get config from Vite environment variables or localStorage override or defaults
const getFirebaseConfig = () => {
  let localOverride = null;
  try {
    const raw = localStorage.getItem('care_navigator_firebase_config');
    if (raw) localOverride = JSON.parse(raw);
  } catch {
    // ignore parse error
  }

  return {
    apiKey: localOverride?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain: localOverride?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: localOverride?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket: localOverride?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId: localOverride?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
    appId: localOverride?.appId || import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
    measurementId: localOverride?.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId
  };
};

export const firebaseConfig = getFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey.trim() !== '' &&
  firebaseConfig.projectId.trim() !== '' &&
  !firebaseConfig.apiKey.includes('your-api-key')
);

let app = null;
let db = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log(`🔥 [Care Navigator] Cloud Firestore connected to project: ${firebaseConfig.projectId}`);

    // Initialize Analytics if supported in current client environment
    if (typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported && app) {
          analytics = getAnalytics(app);
          console.log('📊 [Care Navigator] Firebase Analytics initialized');
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('⚠️ [Care Navigator] Firebase initialization failed:', err);
  }
} else {
  console.info('ℹ️ [Care Navigator] Running with local state persistence.');
}

export { app, db, analytics };
