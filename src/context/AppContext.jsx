import React, { createContext, useContext, useState } from 'react';

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
    ambulanceEta: 6,
    ambulanceVehicle: 'AP 07 AP 1082',
    ambulanceDriver: 'Ramesh Kumar (+91 98765 10810)',
    location: 'Narasaraopet Main Rd',
    ambulancePhone: '108'
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
      id: 'hosp-1',
      name: 'Government General Hospital (GGH)',
      location: 'Collectorate Road, Guntur',
      distance: '2.4 km',
      emergencyBeds: 14,
      icuBeds: 5,
      ventilators: 3,
      opQueueCount: 42,
      phone: '0863 2234567',
      rating: 4.6,
      specialties: ['General Triage & Referral', 'Cardiology', 'Trauma & Emergency', 'Orthopedics', 'Pediatrics'],
      doctors: [
        { 
          id: 'doc-common-1', 
          name: 'Dr. Common Duty Medical Officer (General Triage & Referral)', 
          title: 'MBBS, General Triage & OPD Officer', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '15 yrs', 
          roomNo: 'General Triage Block-1, Room 01', 
          isCommonDoctor: true,
          fee: '₹50',
          available: 'Available 24/7',
          rating: 4.9,
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
        },
        { id: 'doc-1', name: 'Dr. K. Srinivas Rao', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '18 yrs', roomNo: 'OP Block-2, Room 104', fee: '₹300', available: 'Available Today', rating: 4.8 },
        { id: 'doc-2', name: 'Dr. M. Lakshmi Prasanna', title: 'MS (General Surgery)', specialty: 'General Surgery', experience: '14 yrs', roomNo: 'OP Block-1, Room 202', fee: '₹250', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-2',
      name: 'Narasaraopet Area Hospital',
      location: 'Palnadu Road, Narasaraopet',
      distance: '1.1 km',
      emergencyBeds: 8,
      icuBeds: 2,
      ventilators: 1,
      opQueueCount: 18,
      phone: '08647 220108',
      rating: 4.4,
      specialties: ['General Triage & Referral', 'General Medicine', 'Pediatrics', 'Obstetrics & Gynaecology'],
      doctors: [
        { 
          id: 'doc-common-2', 
          name: 'Dr. Common Duty Physician (General Triage & Referral)', 
          title: 'MBBS, Civil Assistant Surgeon', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '12 yrs', 
          roomNo: 'General Triage Room 02', 
          isCommonDoctor: true,
          fee: '₹30',
          available: 'Available Today',
          rating: 4.8,
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300'
        },
        { id: 'doc-3', name: 'Dr. S. Meenakshi', title: 'MS (Orthopedics)', specialty: 'Orthopedics', experience: '12 yrs', roomNo: 'Room 12', fee: '₹300', available: 'Available Today', rating: 4.6 },
        { id: 'doc-4', name: 'Dr. R. V. Ramana', title: 'MD (Pediatrics)', specialty: 'Pediatrics', experience: '16 yrs', roomNo: 'Room 05', fee: '₹300', available: 'Available Today', rating: 4.7 }
      ]
    },
    {
      id: 'hosp-3',
      name: 'Ramesh Hospitals & Cardiac Center',
      location: 'Ring Road, Guntur',
      distance: '4.8 km',
      emergencyBeds: 22,
      icuBeds: 9,
      ventilators: 6,
      opQueueCount: 29,
      phone: '0863 2377777',
      rating: 4.8,
      specialties: ['General Triage & Referral', 'Cardiac Care', 'Critical Care', 'Nephrology'],
      doctors: [
        { 
          id: 'doc-common-3', 
          name: 'Dr. Senior Common Triage Officer', 
          title: 'MBBS, MEM (Emergency & General Triage)', 
          specialty: 'Common General Checkup & Specialist Referral', 
          experience: '14 yrs', 
          roomNo: 'OP Desk 1', 
          isCommonDoctor: true,
          fee: '₹100',
          available: 'Available Today',
          rating: 4.9,
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
        },
        { id: 'doc-5', name: 'Dr. P. Ramesh Babu', title: 'MD, DM (Cardiology)', specialty: 'Cardiology', experience: '25 yrs', roomNo: 'Tower A, Floor 3', fee: '₹500', available: 'Available Today', rating: 4.9 }
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

  const navigateTo = (screen) => {
    if (screen !== currentScreen) {
      setScreenHistory(prev => [...prev, currentScreen]);
      setCurrentScreenState(screen);
    }
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreenState(prevScreen);
    } else {
      setCurrentScreenState('dashboard');
    }
  };

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

  const triggerSOS = (details = {}) => {
    setSosState({
      active: true,
      ambulanceEta: 5,
      ambulanceVehicle: 'AP 07 AP 1082',
      ambulanceDriver: 'Ramesh Kumar (+91 98765 10810)',
      location: user.location || 'Narasaraopet Main Rd, AP',
      ambulancePhone: '108',
      notifiedHospitals: [
        'Government General Hospital (GGH)',
        'Narasaraopet Area Hospital',
        'Ramesh Hospitals & Cardiac Center'
      ],
      ...details
    });

    // Send HTTP telemetry payload to backend API
    try {
      fetch('http://localhost:5000/api/emergency-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: user.name,
          aadhaar: user.aadhaar || user.aadharNumber,
          bloodGroup: user.bloodGroup,
          location: user.location,
          allergies: user.allergies,
          phone: user.phone
        })
      }).catch(err => console.log('Telemetry sent local', err));
    } catch (e) {
      // ignore offline fetch error
    }

    // Connect directly to 108 Helpline
    window.location.href = 'tel:108';

    // Navigate to live tracking screen
    navigateTo('emergency');
  };

  const cancelSOS = () => {
    setSosState(prev => ({
      ...prev,
      active: false
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
