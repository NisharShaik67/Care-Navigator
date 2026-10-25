import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9NWxoN_Q0J90tpU4IE_0ChMFATc2cBSA",
  authDomain: "care-navigator-a8a2d.firebaseapp.com",
  projectId: "care-navigator-a8a2d",
  storageBucket: "care-navigator-a8a2d.firebasestorage.app",
  messagingSenderId: "492582868195",
  appId: "1:492582868195:web:18de8b925e515b3cf7a1d6"
};

async function testConnection() {
  console.log('Testing Firestore connection to project:', firebaseConfig.projectId);
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Try a test write
    const testRef = doc(db, 'care_navigator_system', 'connection_test');
    await setDoc(testRef, {
      status: 'ONLINE',
      system: 'Care Navigator Web Portal',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Write success! Connected to Cloud Firestore.');

    const snap = await getDoc(testRef);
    if (snap.exists()) {
      console.log('✅ Read success! Data retrieved from Firestore:', snap.data());
    } else {
      console.log('⚠️ Document does not exist');
    }
  } catch (error) {
    console.error('❌ Firestore connection error:', error.code || error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.log('ℹ️ Hint: Security rules in Firebase Console might be preventing read/write. Set rules to test mode or allow read/write.');
    } else if (error.code === 'not-found' || error.message?.includes('database') || error.message?.includes('404')) {
      console.log('ℹ️ Hint: Cloud Firestore Database may not be created yet in the Firebase Console at https://console.firebase.google.com/project/care-navigator-a8a2d/firestore');
    }
  }
}

testConnection();
