import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Mock browser globals for SSR test
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    location: { hash: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {}
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => {}
  };
}

import { AppProvider } from '../src/context/AppContext.jsx';
import { LandingView } from '../src/views/LandingView.jsx';
import { OnboardingView } from '../src/views/OnboardingView.jsx';
import { DashboardView } from '../src/views/DashboardView.jsx';
import { EmergencyView } from '../src/views/EmergencyView.jsx';
import { SymptomCheckerView } from '../src/views/SymptomCheckerView.jsx';
import { HospitalsView } from '../src/views/HospitalsView.jsx';
import { OPBookingView } from '../src/views/OPBookingView.jsx';
import { AppointmentsView } from '../src/views/AppointmentsView.jsx';
import { MedicalHistoryView } from '../src/views/MedicalHistoryView.jsx';
import { ProfileView } from '../src/views/ProfileView.jsx';
import { DoctorDashboardView } from '../src/views/DoctorDashboardView.jsx';
import { ReceptionistView } from '../src/views/ReceptionistView.jsx';
import { ResponderHomeView } from '../src/views/ResponderHomeView.jsx';
import { AdminDashboardView } from '../src/views/AdminDashboardView.jsx';
import App from '../src/App.jsx';

const views = [
  ['LandingView', LandingView],
  ['OnboardingView', OnboardingView],
  ['DashboardView', DashboardView],
  ['EmergencyView', EmergencyView],
  ['SymptomCheckerView', SymptomCheckerView],
  ['HospitalsView', HospitalsView],
  ['OPBookingView', OPBookingView],
  ['AppointmentsView', AppointmentsView],
  ['MedicalHistoryView', MedicalHistoryView],
  ['ProfileView', ProfileView],
  ['DoctorDashboardView', DoctorDashboardView],
  ['ReceptionistView', ReceptionistView],
  ['ResponderHomeView', ResponderHomeView],
  ['AdminDashboardView', AdminDashboardView],
  ['App', App]
];

console.log('Testing rendering of all views...');

for (const [name, Component] of views) {
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(AppProvider, null, React.createElement(Component, null))
    );
    console.log(`PASS: ${name} (HTML length: ${html.length})`);
  } catch (err) {
    console.error(`FAIL: ${name} ->`, err.message);
  }
}
