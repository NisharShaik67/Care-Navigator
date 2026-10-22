import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Get config from Vite environment variables or localStorage override
const getFirebaseConfig = () => {
  let localOverride = null;
  try {
    const raw = localStorage.getItem('care_navigator_firebase_config');
    if (raw) localOverride = JSON.parse(raw);
  } catch (e) {
    // ignore parse error
  }

  return {
    apiKey: localOverride?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: localOverride?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: localOverride?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: localOverride?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: localOverride?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: localOverride?.appId || import.meta.env.VITE_FIREBASE_APP_ID || ''
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

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log(`🔥 [Care Navigator] Cloud Firestore connected to project: ${firebaseConfig.projectId}`);
  } catch (err) {
    console.warn('⚠️ [Care Navigator] Firebase initialization failed:', err);
  }
} else {
  console.info('ℹ️ [Care Navigator] Running with local state persistence. Enter Firebase credentials in .env to activate Cloud Firestore.');
}

export { app, db };
