import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AADHAAR_DATABASE = {
  '589241037621': {
    name: 'Alex Johnson',
    age: '28',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
    city: 'Narasaraopet',
    pincode: '522601'
  },
  '123456789012': {
    name: 'Priya Sharma',
    age: '32',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: 'House No 18, Collectorate Colony, Guntur',
    city: 'Guntur',
    pincode: '522004'
  }
};

export const AppProvider = ({ children }) => {
  const [currentScreen, setCurrentScreenState] = useState('landing'); // 'landing' | 'onboarding' | 'dashboard' | 'emergency' | 'symptom-checker' | 'hospitals' | 'op-booking' | 'appointments' | 'records' | 'profile' | 'doctor-dashboard'
  const [screenHistory, setScreenHistory] = useState([]);

  const [user, setUser] = useState({
    name: 'Alex Johnson',
    age: '28',
    gender: 'MALE',
    bloodGroup: 'O+',
    role: 'Patient', // 'Patient' | 'Doctor' | 'Receptionist' | 'Responder'
    location: 'Narasaraopet, Palnadu Dist, AP',
    cityVillage: 'Narasaraopet',
    pincode: '522601',
    address: 'Door No 4-12, Main Road, Palnadu District, Narasaraopet',
    aadhaar: '5892 4103 7621',
    aadharNumber: '5892 4103 7621',
    phone: '+91 9876543210',
    emergencyContact: '+91 9123456789',
    allergies: ['Penicillin', 'Dust', 'Sulfa drugs'],
    healthId: 'ABHA-9102-4821-9012',
    medicalId: 'MED-9102-4821',
    emergencyContacts: [
      { id: 1, name: 'Robert Johnson', relation: 'Father', phone: '+91 98765 43211' },
      { id: 2, name: 'Sarah Johnson', relation: 'Spouse', phone: '+91 98765 43212' }
    ],
    precautions: [
      'Avoid NSAID pain relievers due to mild gastritis history.',
      'Maintain daily hydration (>3L/day) for high uric acid prevention.',
      'Monitor blood pressure weekly.'
    ],
    medicineAlerts: [
      { id: 1, name: 'Cetirizine 10mg', timing: '09:00 PM (Bedtime)', dose: '1 Tablet after dinner' },
      { id: 2, name: 'Multivitamin Complex', timing: '09:30 AM (Morning)', dose: '1 Capsule after breakfast' }
    ]
  });

  const [sosState, setSosState] = useState({
    active: false,
    ambulanceEta: 5,
    distanceKm: 3.5,
    ambulanceProgress: 0,
    currentStreet: 'Hospital Express Highway',
    simulationMultiplier: 1,
    ambulanceVehicle: 'AP 07 AP 1082',
    ambulanceDriver: 'Ramesh Kumar (+91 98765 10810)',
    location: 'Narasaraopet Main Rd, AP',
    ambulancePhone: '108',
    phone: '+91 9876543210',
    locationPermissionGranted: true,
    notifiedNearbyUsersCount: 14
  });

  const [appointments, setAppointments] = useState([
    {
      id: 'op-101',
      tokenNumber: '14',
      doctorName: 'Dr. K. Srinivas Rao, MD',
      hospitalName: 'Government General Hospital, Guntur',
      specialty: 'Cardiology',
      date: 'Today',
      timeSlot: '10:30 AM',
      status: 'ACTIVE',
      currentServing: '11',
      queueAhead: 3,
      qrCode: 'OP-GGH-CARD-014'
    },
    {
      id: 'op-102',
      tokenNumber: '28',
      doctorName: 'Dr. S. Meenakshi, MS',
      hospitalName: 'Narasaraopet Area Hospital',
      specialty: 'Orthopedics',
      date: '2026-08-20',
      timeSlot: '02:15 PM',
      status: 'COMPLETED',
      currentServing: '28',
      queueAhead: 0,
      qrCode: 'OP-NAH-ORTH-028'
    }
  ]);
  const [hospitals] = useState([
    {
      id: 'hosp-4',
      name: 'Apollo Primary Clinic & OPD Center',
      type: 'Primary Care & OPD Clinic',
      location: 'Main Road, Narasaraopet',
      distance: '0.8 km',
      distanceVal: 0.8,
      emergencyBeds: 4,
      icuBeds: 1,
      ventilators: 0,
      opQueueCount: 8,
      phone: '08647 225588',
      rating: 4.7,
      specialties: ['General Checkup', 'General Medicine', 'Dermatology', 'Pediatrics'],
      doctors: [
        { 
          id: 'doc-gen-4', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MBBS, General OPD Officer', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '10 yrs', 
          roomNo: 'General Triage Block-1, Room 01', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-402', name: 'Dr. P. Anitha', title: 'MD (Dermatology)', specialty: 'Dermatology', experience: '8 yrs', roomNo: 'OP Desk 2', fee: '₹350', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-2',
      name: 'Narasaraopet Area Hospital',
      type: 'District Govt Area Hospital',
      location: 'Palnadu Road, Narasaraopet',
      distance: '1.1 km',
      distanceVal: 1.1,
      emergencyBeds: 8,
      icuBeds: 2,
      ventilators: 1,
      opQueueCount: 18,
      phone: '08647 220108',
      rating: 4.4,
      specialties: ['General Checkup', 'General Medicine', 'Orthopedics', 'Pediatrics', 'Obstetrics & Gynaecology'],
      doctors: [
        { 
          id: 'doc-gen-2', 
          name: 'Dr. Common Duty Physician (General Triage & Referral)', 
          title: 'MBBS, Civil Assistant Surgeon', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '11 yrs', 
          roomNo: 'General Triage Room 02', 
          fee: '₹30', 
          available: 'Available Today', 
          rating: 4.8,
          isCommonDoctor: true
        },
        { id: 'doc-3', name: 'Dr. S. Meenakshi', title: 'MS (Orthopedics)', specialty: 'Orthopedics', experience: '12 yrs', roomNo: 'Room 12', fee: '₹300', available: 'Available Today', rating: 4.6 },
        { id: 'doc-4', name: 'Dr. R. V. Ramana', title: 'MD (Pediatrics)', specialty: 'Pediatrics', experience: '16 yrs', roomNo: 'Room 05', fee: '₹300', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-5',
      name: 'Sri City Community Health Center (CHC)',
      type: 'Community Health Center (CHC)',
      location: 'Station Road, Narasaraopet',
      distance: '1.8 km',
      distanceVal: 1.8,
      emergencyBeds: 6,
      icuBeds: 1,
      ventilators: 1,
      opQueueCount: 12,
      phone: '08647 231122',
      rating: 4.3,
      specialties: ['General Checkup', 'General Medicine', 'Obstetrics & Gynaecology', 'Emergency Triage'],
      doctors: [
        { 
          id: 'doc-501', 
          name: 'Dr. Common Triage Medical Officer', 
          title: 'MBBS (General Physician & Triage)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '7 yrs', 
          roomNo: 'Triage OPD Desk 1', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-502', name: 'Dr. K. Sunitha', title: 'DGO, MS (Gynecology)', specialty: 'Obstetrics & Gynaecology', experience: '11 yrs', roomNo: 'Maternity Wing 3', fee: '₹250', available: 'Available Today', rating: 4.6 }
      ]
    },
    {
      id: 'hosp-1',
      name: 'Government General Hospital (GGH)',
      type: 'Govt Super Specialty Hospital',
      location: 'Collectorate Road, Guntur',
      distance: '2.4 km',
      distanceVal: 2.4,
      emergencyBeds: 14,
      icuBeds: 5,
      ventilators: 3,
      opQueueCount: 42,
      phone: '0863 2234567',
      rating: 4.6,
      specialties: ['General Checkup', 'Cardiology', 'Trauma & Emergency', 'Orthopedics', 'General Surgery', 'Pediatrics'],
      doctors: [
        { 
          id: 'doc-gen-1', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MD (General Medicine & Primary Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '16 yrs', 
          roomNo: 'General Triage Block-1, Room 01', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-1', name: 'Dr. K. Srinivas Rao', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '18 yrs', roomNo: 'OP Block-2, Room 104', fee: '₹300', available: 'Available Today', rating: 4.8 },
        { id: 'doc-2', name: 'Dr. M. Lakshmi Prasanna', title: 'MS (General Surgery)', specialty: 'General Surgery', experience: '14 yrs', roomNo: 'OP Block-1, Room 202', fee: '₹250', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-6',
      name: 'KIMS Saveera Multi-Specialty Hospital',
      type: 'Private Super Specialty Hospital',
      location: 'NH-16 Express Highway, Guntur',
      distance: '3.2 km',
      distanceVal: 3.2,
      emergencyBeds: 18,
      icuBeds: 8,
      ventilators: 5,
      opQueueCount: 22,
      phone: '0863 2288999',
      rating: 4.8,
      specialties: ['General Checkup', 'Neurology', 'Endocrinology', 'Gastroenterology', 'Cardiology'],
      doctors: [
        { 
          id: 'doc-gen-6', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MD (General Medicine & Preventive Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '13 yrs', 
          roomNo: 'Triage Desk 102', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.8,
          isCommonDoctor: true
        },
        { id: 'doc-601', name: 'Dr. N. Chandra Sekhar', title: 'DM (Neurology), MCh', specialty: 'Neurology', experience: '20 yrs', roomNo: 'Neuro Block 301', fee: '₹600', available: 'Available Today', rating: 4.9 },
        { id: 'doc-602', name: 'Dr. B. Swapna', title: 'MD, DM (Endocrinology)', specialty: 'Endocrinology', experience: '15 yrs', roomNo: 'Diabetes Care Desk', fee: '₹450', available: 'Available Today', rating: 4.8 }
      ]
    },
    {
      id: 'hosp-7',
      name: 'Guntur City Care Clinic & OPD Center',
      type: 'Neighborhood Daycare Clinic',
      location: 'Brodipet 4th Line, Guntur',
      distance: '3.9 km',
      distanceVal: 3.9,
      emergencyBeds: 3,
      icuBeds: 0,
      ventilators: 0,
      opQueueCount: 6,
      phone: '0863 2244111',
      rating: 4.5,
      specialties: ['General Checkup', 'ENT Specialist', 'General Medicine', 'Dental Care'],
      doctors: [
        { 
          id: 'doc-gen-7', 
          name: 'Dr. Common Duty Physician (General Triage)', 
          title: 'MBBS, Family Physician', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '9 yrs', 
          roomNo: 'General Triage Room 101', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-701', name: 'Dr. G. Ravi Teja', title: 'MS (ENT Specialist)', specialty: 'ENT Specialist', experience: '9 yrs', roomNo: 'Room 102', fee: '₹300', available: 'Available Today', rating: 4.6 }
      ]
    },
    {
      id: 'hosp-3',
      name: 'Ramesh Hospitals & Cardiac Center',
      type: 'Tertiary Cardiac & Emergency Hospital',
      location: 'Ring Road, Guntur',
      distance: '4.8 km',
      distanceVal: 4.8,
      emergencyBeds: 22,
      icuBeds: 9,
      ventilators: 6,
      opQueueCount: 29,
      phone: '0863 2377777',
      rating: 4.8,
      specialties: ['General Checkup', 'Cardiac Care', 'Critical Care', 'Nephrology', 'Pulmonology'],
      doctors: [
        { 
          id: 'doc-gen-3', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MBBS, MEM (Emergency & General Triage)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '15 yrs', 
          roomNo: 'OP Desk 1', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-5', name: 'Dr. P. Ramesh Babu', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '25 yrs', roomNo: 'Tower A, Floor 3', fee: '₹500', available: 'Available Today', rating: 4.9 }
      ]
    },
    {
      id: 'hosp-8',
      name: 'Palnadu Mother & Child Health Center',
      type: 'Maternity & Children Hospital',
      location: 'Vinukonda Highway, Palnadu',
      distance: '6.5 km',
      distanceVal: 6.5,
      emergencyBeds: 10,
      icuBeds: 4,
      ventilators: 2,
      opQueueCount: 15,
      phone: '08646 223344',
      rating: 4.6,
      specialties: ['General Checkup', 'Pediatrics & Neonatology', 'Obstetrics & Gynaecology'],
      doctors: [
        { 
          id: 'doc-gen-8', 
          name: 'Dr. Common Duty Medical Officer', 
          title: 'MBBS, General & Family Physician', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '8 yrs', 
          roomNo: 'OP Triage Desk 1', 
          fee: '₹50', 
          available: 'Available Today', 
          rating: 4.7,
          isCommonDoctor: true
        },
        { id: 'doc-801', name: 'Dr. D. Sailaja', title: 'MD (Pediatrics), Fellow Neonatology', specialty: 'Pediatrics & Neonatology', experience: '14 yrs', roomNo: 'NICU Block Room 02', fee: '₹350', available: 'Available Today', rating: 4.8 }
      ]
    },
    {
      id: 'hosp-9',
      name: 'Manipal Super Specialty Hospital',
      type: 'Regional Super Specialty',
      location: 'Tadepalle Bypass, Vijayawada',
      distance: '8.2 km',
      distanceVal: 8.2,
      emergencyBeds: 30,
      icuBeds: 12,
      ventilators: 8,
      opQueueCount: 35,
      phone: '0866 2299000',
      rating: 4.9,
      specialties: ['General Checkup', 'Nephrology', 'Urology', 'Oncology', 'Organ Transplant'],
      doctors: [
        { 
          id: 'doc-gen-9', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MD (Internal Medicine & General Care)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '18 yrs', 
          roomNo: 'Triage Desk 205', 
          fee: '₹100', 
          available: 'Available Today', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-901', name: 'Dr. A. Vikram Dev', title: 'DM (Nephrology), Transplant Fellow', specialty: 'Nephrology', experience: '22 yrs', roomNo: 'Transplant OPD Wing', fee: '₹700', available: 'Available Today', rating: 4.9 }
      ]
    },
    {
      id: 'hosp-10',
      name: 'AIIMS Apex Medical Institute & Hospital',
      type: 'National Apex Referral Institute',
      location: 'Mangalagiri, Guntur District',
      distance: '12.0 km',
      distanceVal: 12.0,
      emergencyBeds: 50,
      icuBeds: 25,
      ventilators: 15,
      opQueueCount: 60,
      phone: '0863 2277000',
      rating: 4.9,
      specialties: ['General Checkup', 'Pulmonology', 'Cardiothoracic Surgery', 'Neurosurgery', 'Multi-Specialty'],
      doctors: [
        { 
          id: 'doc-gen-10', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MD (General Medicine & Primary OPD)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '22 yrs', 
          roomNo: 'General Triage Block-G', 
          fee: '₹50', 
          available: 'Available 24/7', 
          rating: 4.9,
          isCommonDoctor: true
        },
        { id: 'doc-1001', name: 'Dr. S. K. Mukherjee', title: 'MD, DM (Pulmonology)', specialty: 'Pulmonology', experience: '28 yrs', roomNo: 'Apex OPD Block-A', fee: '₹100', available: 'Available Today', rating: 5.0 }
      ]
    }
  ]);

  const [records, setRecords] = useState([
    {
      id: 'rec-1',
      title: 'General Blood Profile & Lipid Panel',
      date: '2026-08-10',
      doctor: 'Dr. P. V. Ramana',
      facility: 'Guntur City Care Hospital',
      category: 'Diagnostics',
      fileType: 'PDF',
      size: '1.4 MB',
      summary: 'Hb: 14.2 g/dL, Fasting Blood Sugar: 94 mg/dL. All vital parameters within normal reference ranges.'
    },
    {
      id: 'rec-2',
      title: 'Chest X-Ray (PA View) & Radiology Report',
      date: '2026-07-28',
      doctor: 'Dr. K. Srinivas Rao',
      facility: 'Government General Hospital',
      category: 'Radiology',
      fileType: 'DICOM / PDF',
      size: '4.2 MB',
      summary: 'Clear lung fields, normal cardiothoracic ratio. No evidence of active pulmonary disease.'
    }
  ]);

  const navigateTo = (screen, resetHistory = false) => {
    if (screen !== currentScreen) {
      if (resetHistory) {
        setScreenHistory([currentScreen]);
      } else {
        setScreenHistory(prev => [...prev, currentScreen]);
      }
      setCurrentScreenState(screen);
      try {
        window.history.pushState({ screen }, '', `#${screen}`);
      } catch (e) {
        // ignore
      }
    }
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreenState(prevScreen);
    } else if (currentScreen !== 'landing') {
      setCurrentScreenState('landing');
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.screen) {
        setCurrentScreenState(event.state.screen);
        setScreenHistory(prev => (prev.length > 0 ? prev.slice(0, -1) : []));
      } else if (screenHistory.length > 0) {
        goBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screenHistory, currentScreen]);

  const updateUserProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const switchRole = (role) => {
    setUser(prev => ({ ...prev, role }));
    if (role === 'Doctor') {
      setCurrentScreenState('doctor-dashboard');
    } else {
      setCurrentScreenState('dashboard');
    }
  };

  const logout = () => {
    setCurrentScreenState('landing');
  };

  // Live Ambulance Telemetry & Route Progress Simulation
  useEffect(() => {
    let interval;
    if (sosState.active) {
      interval = setInterval(() => {
        setSosState(prev => {
          if (!prev.active) return prev;
          if (prev.ambulanceProgress >= 100) {
            return {
              ...prev,
              ambulanceProgress: 100,
              distanceKm: 0,
              ambulanceEta: 0,
              currentStreet: 'Arrived at Patient Home'
            };
          }

          const increment = 1.2 * (prev.simulationMultiplier || 1);
          const newProgress = Math.min(100, prev.ambulanceProgress + increment);
          const totalDistance = 3.5;
          const newDistance = Math.max(0, totalDistance * (1 - newProgress / 100));
          const newEta = Math.max(0, Math.ceil((newDistance / totalDistance) * 5));

          let street = 'Hospital Express Highway';
          if (newProgress >= 25 && newProgress < 50) street = 'Prakasham Main Corridor';
          else if (newProgress >= 50 && newProgress < 75) street = 'Bypass Junction';
          else if (newProgress >= 75 && newProgress < 100) street = 'Narasaraopet Main Rd';
          else if (newProgress >= 100) street = 'Arrived at Patient Home';

          return {
            ...prev,
            ambulanceProgress: newProgress,
            distanceKm: newDistance,
            ambulanceEta: newEta,
            currentStreet: street
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sosState.active]);

  const triggerSOS = (details = {}) => {
    const userPhone = details.phone || user.phone || '+91 9876543210';
    setSosState(prev => ({
      ...prev,
      active: true,
      ambulanceEta: 5,
      distanceKm: 3.5,
      ambulanceProgress: 0,
      currentStreet: 'Hospital Express Highway',
      simulationMultiplier: 1,
      ambulanceVehicle: 'AP 07 AP 1082',
      ambulanceDriver: 'Ramesh Kumar (+91 98765 10810)',
      location: details.location || user.location || 'Narasaraopet Main Rd, AP',
      ambulancePhone: '108',
      phone: userPhone,
      locationPermissionGranted: details.locationPermission !== undefined ? details.locationPermission : true,
      notifiedNearbyUsersCount: details.notifiedNearbyUsersCount || 14,
      notifiedHospitals: [
        'Government General Hospital (GGH)',
        'Narasaraopet Area Hospital',
        'Ramesh Hospitals & Cardiac Center'
      ],
      ...details
    }));

    // Send HTTP telemetry payload to backend API
    try {
      fetch('http://localhost:5000/api/emergency-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: user.name,
          aadhaar: user.aadhaar || user.aadharNumber,
          bloodGroup: user.bloodGroup,
          location: details.location || user.location,
          allergies: user.allergies,
          phone: userPhone
        })
      }).catch(err => console.log('Telemetry sent local', err));
    } catch (e) {
      // ignore offline fetch error
    }

    if (details.autoDial) {
      window.location.href = 'tel:108';
    }

    if (details.navigate !== false) {
      navigateTo('emergency');
    }
  };

  const cancelSOS = () => {
    setSosState(prev => ({
      ...prev,
      active: false,
      ambulanceProgress: 0,
      distanceKm: 3.5
    }));
  };

  const setSosSimulationSpeed = (multiplier) => {
    setSosState(prev => ({
      ...prev,
      simulationMultiplier: multiplier
    }));
  };

  const bookOPToken = (tokenData) => {
    const newToken = {
      id: 'op-' + Date.now(),
      tokenNumber: Math.floor(Math.random() * 30 + 10).toString(),
      date: 'Today',
      status: 'ACTIVE',
      currentServing: '8',
      queueAhead: 4,
      qrCode: `OP-TOKEN-${Date.now().toString().slice(-4)}`,
      ...tokenData
    };
    setAppointments(prev => [newToken, ...prev]);
    navigateTo('appointments');
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'CANCELLED' } : app));
  };

  const addMedicalRecord = (newRec) => {
    setRecords(prev => [{ id: 'rec-' + Date.now(), ...newRec }, ...prev]);
  };

  const updateDoctorAvatar = (id, newAvatarUrl) => {
    // optional helper
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen: setCurrentScreenState,
        screenHistory,
        navigateTo,
        goBack,
        user,
        updateUserProfile,
        switchRole,
        logout,
        sosState,
        triggerSOS,
        cancelSOS,
        setSosSimulationSpeed,
        appointments,
        bookOPToken,
        cancelAppointment,
        hospitals,
        records,
        addMedicalRecord,
        updateDoctorAvatar
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
