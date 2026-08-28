import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

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

const MainContent = () => {
  const { currentScreen } = useApp();

  const renderView = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingView />;
      case 'onboarding':
        return <OnboardingView />;
      case 'dashboard':
        return <DashboardView />;
      case 'emergency':
        return <EmergencyView />;
      case 'symptom-checker':
        return <SymptomCheckerView />;
      case 'hospitals':
        return <HospitalsView />;
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
      default:
        return <DashboardView />;
    }
  };

  if (currentScreen === 'landing') {
    return <LandingView />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingView />;
  }

  return (
    <div className="care-navigator-app">
      <Header />
      <main className="care-main-viewport">
        {renderView()}
      </main>
      <Navigation />

      <style>{`
        .care-navigator-app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          color: #0f172a;
          font-family: var(--font-main, 'Inter', sans-serif);
        }

        .care-main-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .fade-in {
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
