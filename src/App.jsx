import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';

import { LandingView } from './views/LandingView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { EmergencyView } from './views/EmergencyView';
import { SymptomCheckerView } from './views/SymptomCheckerView';
import { HospitalsView } from './views/HospitalsView';
import { OPBookingView } from './views/OPBookingView';
import { AppointmentsView } from './views/AppointmentsView';
import { MedicalHistoryView } from './views/MedicalHistoryView';
import { ProfileView } from './views/ProfileView';
import { DoctorDashboardView } from './views/DoctorDashboardView';
import { ReceptionistView } from './views/ReceptionistView';
import { ResponderHomeView } from './views/ResponderHomeView';
import { AdminDashboardView } from './views/AdminDashboardView';

const MainContent = () => {
  const { currentScreen, user } = useApp();

  const renderView = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingView />;
      case 'onboarding':
        return <OnboardingView />;
      case 'admin':
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'dashboard':
        return <DashboardView />;
      case 'emergency':
        return <EmergencyView />;
      case 'responder':
        return <EmergencyView />;
      case 'symptom-checker':
        return <SymptomCheckerView />;
      case 'hospitals':
        return <HospitalsView />;
      case 'icu':
      case 'icu-tracker':
      case 'icu-bed-tracker':
      case 'icu-matrix':
        return <HospitalsView initialFilter="ICU" />;
      case 'op-booking':
        return <OPBookingView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'records':
        return <MedicalHistoryView />;
      case 'profile':
        return <ProfileView />;
      case 'doctor-dashboard':
        return <DoctorDashboardView />;
      case 'receptionist':
      case 'receptionist-dashboard':
        return <ReceptionistView />;
      default:
        if (typeof currentScreen === 'string' && currentScreen.startsWith('admin')) {
          return <AdminDashboardView />;
        }
        if (user?.role === 'Doctor' && (currentScreen === 'dashboard' || !currentScreen)) {
          return <DoctorDashboardView />;
        }
        if (user?.role === 'Receptionist' && (currentScreen === 'dashboard' || !currentScreen)) {
          return <ReceptionistView />;
        }
        if ((user?.role === 'Responder' || user?.role === 'Driver') && (currentScreen === 'dashboard' || !currentScreen)) {
          return <ResponderHomeView />;
        }
        return <DashboardView />;
    }
  };

  if (currentScreen === 'landing') {
    return <LandingView />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingView />;
  }

  const isAdminScreen = 
    currentScreen === 'admin' || 
    currentScreen === 'admin-dashboard' || 
    (typeof currentScreen === 'string' && currentScreen.startsWith('admin'));

  if (isAdminScreen) {
    return (
      <ErrorBoundary>
        <AdminDashboardView />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'receptionist' || currentScreen === 'receptionist-dashboard') {
    return (
      <ErrorBoundary>
        <ReceptionistView />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'doctor-dashboard') {
    return (
      <ErrorBoundary>
        <DoctorDashboardView />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'responder') {
    return (
      <ErrorBoundary>
        <ResponderHomeView />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="care-navigator-app">
        <Header />
        <main className="care-main-viewport">
          <ErrorBoundary>
            {renderView()}
          </ErrorBoundary>
        </main>
        <Navigation />

      <style>{`
        .care-navigator-app {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
          color: #0f172a;
          font-family: var(--font-main, 'Inter', sans-serif);
        }

        .care-main-viewport {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          -webkit-overflow-scrolling: touch;
        }

        .fade-in {
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
