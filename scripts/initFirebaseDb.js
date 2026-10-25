/**
 * Care Navigator - Standalone Cloud Firestore Database Initializer Script
 * Run with: npm run db:init  or  node scripts/initFirebaseDb.js
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

import {
  SEED_SYSTEM_META,
  SEED_ACCOUNTS,
  SEED_HOSPITALS,
  SEED_DOCTORS,
  SEED_APPOINTMENTS,
  SEED_EMERGENCIES,
  SEED_REPORTS,
  SEED_AI_CONFIG
} from '../src/firebase/seedData.js';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyA9NWxoN_Q0J90tpU4IE_0ChMFATc2cBSA",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "care-navigator-a8a2d.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "care-navigator-a8a2d",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "care-navigator-a8a2d.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "492582868195",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:492582868195:web:18de8b925e515b3cf7a1d6",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YZPWFVV5WR"
};

const COLLECTIONS = {
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

async function runInit() {
  console.log('========================================================');
  console.log('🏥 CARE NAVIGATOR - CLOUD FIRESTORE DATABASE INITIALIZER');
  console.log('========================================================');
  console.log(`Connecting to Firebase Project: ${firebaseConfig.projectId}...`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. System Metadata & Ping
    console.log('▶ [1/8] Seeding System Metadata & Ping Document...');
    await setDoc(doc(db, COLLECTIONS.SYSTEM, 'meta'), {
      ...SEED_SYSTEM_META,
      initializedAt: serverTimestamp(),
      lastVerifiedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, COLLECTIONS.SYSTEM, 'ping'), {
      ping: true,
      lastPingAt: serverTimestamp(),
      portal: 'Care Navigator Health Portal (CLI Init)'
    }, { merge: true });
    console.log('   ✓ System metadata initialized');

    // 2. Accounts & User Profiles
    console.log(`▶ [2/8] Seeding Unified Accounts & Profiles (${Object.keys(SEED_ACCOUNTS).length} accounts)...`);
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
      console.log(`   ✓ Account & User: ${accId} (${accData.name} - ${accData.role})`);
    }

    // 3. Hospitals
    console.log(`▶ [3/8] Seeding Hospital Facilities & Emergency Capacity (${SEED_HOSPITALS.length} hospitals)...`);
    for (const hosp of SEED_HOSPITALS) {
      await setDoc(doc(db, COLLECTIONS.HOSPITALS, hosp.id), {
        ...hosp,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✓ Hospital: ${hosp.name} (${hosp.emergencyBeds} Emergency beds, ${hosp.icuBeds} ICU beds)`);
    }

    // 4. Doctors
    console.log(`▶ [4/8] Seeding Verified Duty Doctors & OPD Specialists (${SEED_DOCTORS.length} doctors)...`);
    for (const docItem of SEED_DOCTORS) {
      await setDoc(doc(db, COLLECTIONS.DOCTORS, docItem.id), {
        ...docItem,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✓ Doctor: ${docItem.name} (${docItem.specialty} • ${docItem.hospitalName})`);
    }

    // 5. Appointments
    console.log(`▶ [5/8] Seeding OPD Token Appointments (${SEED_APPOINTMENTS.length} tokens)...`);
    for (const appt of SEED_APPOINTMENTS) {
      await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, appt.id), {
        ...appt,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✓ Appointment: Token #${appt.tokenNumber} for ${appt.patientName} (${appt.specialty})`);
    }

    // 6. Emergencies
    console.log(`▶ [6/8] Seeding 108 Emergency Ambulance Dispatches (${SEED_EMERGENCIES.length} incidents)...`);
    for (const emg of SEED_EMERGENCIES) {
      await setDoc(doc(db, COLLECTIONS.EMERGENCIES, emg.id), {
        ...emg,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✓ Emergency: ${emg.id} [${emg.priority}] - ${emg.type}`);
    }

    // 7. Medical Reports
    console.log(`▶ [7/8] Seeding Digital Health Records & Reports (${SEED_REPORTS.length} records)...`);
    for (const rep of SEED_REPORTS) {
      await setDoc(doc(db, COLLECTIONS.REPORTS, rep.id), {
        ...rep,
        uploadedAt: serverTimestamp()
      }, { merge: true });
      console.log(`   ✓ Report: ${rep.title} (${rep.type})`);
    }

    // 8. AI Configuration
    console.log('▶ [8/8] Seeding Healthcare AI Triage Engine & Safety Guardrails...');
    await setDoc(doc(db, COLLECTIONS.AI_CONFIG, 'triage_config'), {
      ...SEED_AI_CONFIG,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('   ✓ AI configuration initialized');

    console.log('========================================================');
    console.log('🎉 SUCCESS: Cloud Firestore database initialization complete!');
    console.log(`Project: ${firebaseConfig.projectId}`);
    console.log('All collections have been seeded with production-ready baseline records.');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize Cloud Firestore database:');
    console.error(err);
    if (err?.code === 'permission-denied' || String(err?.message).includes('permission')) {
      console.error('\n⚠️ NOTICE: Firestore Security Rules are currently in locked mode.');
      console.error('Please visit Firebase Console -> Cloud Firestore -> Rules and allow read/write.');
    }
    process.exit(1);
  }
}

runInit();
