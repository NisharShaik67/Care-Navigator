import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Clock,
  AlertTriangle,
  Bed,
  UserPlus,
  CalendarCheck,
  FileText,
  Search,
  Edit,
  Siren,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  Building2,
  Stethoscope,
  Activity,
  X,
  Printer,
  ArrowRight,
  RefreshCw,
  MoreHorizontal,
  Home,
  Bell,
  Menu,
  Check,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';

export const ReceptionistView = () => {
  const { user, switchRole, navigateTo } = useApp();

  // Real-time Date and Time Ticker
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Modal Control States
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'book' | 'walkin' | 'check' | 'update' | 'emergency_desk' | 'emergency_details' | 'patient_call' | 'more'
  const [selectedPatientForAction, setSelectedPatientForAction] = useState(null);

  // Notification Toast State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Live Today's Queue Data
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('ALL');

  const [queueList, setQueueList] = useState([
    {
      id: 'op-101',
      token: 'OP-01',
      name: 'Ramesh Kumar',
      age: 45,
      gender: 'Male',
      uhid: 'UHID-882109',
      doctor: 'Dr. K. Srinivas Rao (Cardiology)',
      dept: 'Cardiology',
      timeSlot: '09:30 AM',
      status: 'Consultation',
      phone: '+91 98480 12345',
      arrivedAt: '09:15 AM'
    },
    {
      id: 'op-102',
      token: 'OP-02',
      name: 'Priya Sharma',
      age: 32,
      gender: 'Female',
      uhid: 'UHID-774012',
      doctor: 'Dr. S. Meenakshi (Orthopedics)',
      dept: 'Orthopedics',
      timeSlot: '09:45 AM',
      status: 'Arrived',
      phone: '+91 98765 43210',
      arrivedAt: '09:35 AM'
    },
    {
      id: 'op-103',
      token: 'WK-01',
      name: 'Venkatesh Rao',
      age: 58,
      gender: 'Male',
      uhid: 'UHID-993041',
      doctor: 'Dr. Common Duty Physician',
      dept: 'General Medicine',
      timeSlot: 'Walk-in',
      status: 'Waiting',
      phone: '+91 94401 98765',
      arrivedAt: '09:40 AM'
    },
    {
      id: 'op-104',
      token: 'OP-03',
      name: 'Ananya Das',
      age: 26,
      gender: 'Female',
      uhid: 'UHID-662198',
      doctor: 'Dr. R. V. Ramana (Pediatrics)',
      dept: 'Pediatrics',
      timeSlot: '10:00 AM',
      status: 'Waiting',
      phone: '+91 91234 56789',
      arrivedAt: '09:42 AM'
    },
    {
      id: 'op-105',
      token: 'WK-02',
      name: 'Mohd. Ibrahim',
      age: 50,
      gender: 'Male',
      uhid: 'UHID-551029',
      doctor: 'Dr. M. Lakshmi Prasanna (Surgery)',
      dept: 'General Surgery',
      timeSlot: 'Walk-in',
      status: 'Arrived',
      phone: '+91 99887 76655',
      arrivedAt: '09:45 AM'
    },
    {
      id: 'op-106',
      token: 'OP-04',
      name: 'K. Lakshmi',
      age: 61,
      gender: 'Female',
      uhid: 'UHID-440192',
      doctor: 'Dr. K. Srinivas Rao (Cardiology)',
      dept: 'Cardiology',
      timeSlot: '10:15 AM',
      status: 'Completed',
      phone: '+91 97001 11223',
      arrivedAt: '09:00 AM'
    }
  ]);

  // Live New Registrations Data
  const [regSearch, setRegSearch] = useState('');
  const [registrationsList, setRegistrationsList] = useState([
    {
      id: 'reg-01',
      uhid: 'UHID-993041',
      aadhaar: '5892 4103 7621',
      name: 'Venkatesh Rao',
      ageGender: '58 / M',
      type: 'Walk-in OP',
      dept: 'General Medicine',
      registeredAt: '09:40 AM Today',
      status: 'Token Issued'
    },
    {
      id: 'reg-02',
      uhid: 'UHID-882109',
      aadhaar: '9012 3456 7890',
      name: 'Ramesh Kumar',
      ageGender: '45 / M',
      type: 'Online Portal',
      dept: 'Cardiology',
      registeredAt: '09:15 AM Today',
      status: 'In Consultation'
    },
    {
      id: 'reg-03',
      uhid: 'UHID-774012',
      aadhaar: '1234 5678 9012',
      name: 'Priya Sharma',
      ageGender: '32 / F',
      type: 'Online Portal',
      dept: 'Orthopedics',
      registeredAt: '08:50 AM Today',
      status: 'Checked In'
    },
    {
      id: 'reg-04',
      uhid: 'UHID-662198',
      aadhaar: '4455 6677 8899',
      name: 'Ananya Das',
      ageGender: '26 / F',
      type: 'ABHA App',
      dept: 'Pediatrics',
      registeredAt: '08:30 AM Today',
      status: 'Waiting in Queue'
    },
    {
      id: 'reg-05',
      uhid: 'UHID-551029',
      aadhaar: '7788 9900 1122',
      name: 'Mohd. Ibrahim',
      ageGender: '50 / M',
      type: 'Walk-in OP',
      dept: 'General Surgery',
      registeredAt: '08:15 AM Today',
      status: 'Checked In'
    }
  ]);

  // Form States for Modals
  const [registerForm, setRegisterForm] = useState({
    name: '',
    aadhaar: '',
    phone: '',
    age: '',
    gender: 'Male',
    dept: 'General Medicine',
    doctor: 'Dr. Common Duty Physician',
    address: 'Narasaraopet, Palnadu Dist',
    bloodGroup: 'O+'
  });

  const [bookForm, setBookForm] = useState({
    patientUhid: '',
    patientName: '',
    dept: 'Cardiology',
    doctor: 'Dr. K. Srinivas Rao, MD',
    timeSlot: '11:00 AM',
    notes: 'Routine Cardiology Follow-up'
  });

  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    dept: 'General Medicine',
    fee: '₹50 (Govt Subsidized)'
  });

  const [checkSearchTerm, setCheckSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Queue Status Advance Function
  const handleUpdateStatus = (patientId, newStatus) => {
    setQueueList(prev =>
      prev.map(p => (p.id === patientId ? { ...p, status: newStatus } : p))
    );
    showToast(`Status updated to "${newStatus}" for patient!`, 'success');
  };

  // Call Patient Action
  const handleCallPatient = (patient) => {
    setSelectedPatientForAction(patient);
    setActiveModal('patient_call');
  };

  // Submit Patient Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.phone) {
      showToast('Please enter required patient details (Name & Phone)', 'error');
      return;
    }

    const newUhid = `UHID-${Math.floor(100000 + Math.random() * 900000)}`;
    const newToken = `OP-${Math.floor(10 + Math.random() * 89)}`;

    const newPatientObj = {
      id: `op-${Date.now()}`,
      token: newToken,
      name: registerForm.name,
      age: parseInt(registerForm.age) || 30,
      gender: registerForm.gender,
      uhid: newUhid,
      doctor: registerForm.doctor,
      dept: registerForm.dept,
      timeSlot: 'Just Registered',
      status: 'Arrived',
      phone: registerForm.phone,
      arrivedAt: formattedTime
    };

    setQueueList(prev => [newPatientObj, ...prev]);

    setRegistrationsList(prev => [
      {
        id: `reg-${Date.now()}`,
        uhid: newUhid,
        aadhaar: registerForm.aadhaar || '5892 4103 7621',
        name: registerForm.name,
        ageGender: `${registerForm.age || 30} / ${registerForm.gender.slice(0, 1)}`,
        type: 'Desk Walk-in',
        dept: registerForm.dept,
        registeredAt: `${formattedTime} Today`,
        status: 'Checked In'
      },
      ...prev
    ]);

    setActiveModal(null);
    showToast(`Patient ${registerForm.name} registered successfully! Token ${newToken} generated.`, 'success');
    setRegisterForm({
      name: '',
      aadhaar: '',
      phone: '',
      age: '',
      gender: 'Male',
      dept: 'General Medicine',
      doctor: 'Dr. Common Duty Physician',
      address: 'Narasaraopet, Palnadu Dist',
      bloodGroup: 'O+'
    });
  };

  // Submit Walk-in OP Slip
  const handleWalkinSubmit = (e) => {
    e.preventDefault();
    if (!walkinForm.name) {
      showToast('Please enter Patient Name for Walk-in Registration', 'error');
      return;
    }

    const newUhid = `UHID-${Math.floor(100000 + Math.random() * 900000)}`;
    const newToken = `WK-${Math.floor(10 + Math.random() * 89)}`;

    const newPatientObj = {
      id: `wk-${Date.now()}`,
      token: newToken,
      name: walkinForm.name,
      age: parseInt(walkinForm.age) || 35,
      gender: walkinForm.gender,
      uhid: newUhid,
      doctor: 'Dr. Common Duty Physician',
      dept: walkinForm.dept,
      timeSlot: 'Walk-in Instant',
      status: 'Waiting',
      phone: walkinForm.phone || '+91 98765 00000',
      arrivedAt: formattedTime
    };

    setQueueList(prev => [newPatientObj, ...prev]);
    setActiveModal(null);
    showToast(`Instant Walk-in Token ${newToken} issued to ${walkinForm.name}!`, 'success');
    setWalkinForm({
      name: '',
      phone: '',
      age: '',
      gender: 'Male',
      dept: 'General Medicine',
      fee: '₹50 (Govt Subsidized)'
    });
  };

  // Submit Book Appointment
  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!bookForm.patientName) {
      showToast('Please provide Patient Name to book appointment', 'error');
      return;
    }

    const newToken = `OP-${Math.floor(20 + Math.random() * 70)}`;
    const newPatientObj = {
      id: `op-${Date.now()}`,
      token: newToken,
      name: bookForm.patientName,
      age: 40,
      gender: 'Male',
      uhid: bookForm.patientUhid || `UHID-${Math.floor(100000 + Math.random() * 900000)}`,
      doctor: bookForm.doctor,
      dept: bookForm.dept,
      timeSlot: bookForm.timeSlot,
      status: 'Waiting',
      phone: '+91 98765 12345',
      arrivedAt: 'Scheduled'
    };

    setQueueList(prev => [newPatientObj, ...prev]);
    setActiveModal(null);
    showToast(`Appointment booked for ${bookForm.patientName} with ${bookForm.doctor} at ${bookForm.timeSlot}`, 'success');
  };

  // Filtered Queue List
  const filteredQueueList = (queueList || []).filter(item => {
    const q = (queueSearch || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.token || '').toLowerCase().includes(q) ||
      (item.uhid || '').toLowerCase().includes(q) ||
      (item.dept || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q);

    if (queueFilter === 'ALL') return matchesSearch;
    return matchesSearch && (item.status || '').toUpperCase() === queueFilter;
  });

  // Filtered Registrations List
  const filteredRegistrations = (registrationsList || []).filter(item => {
    const q = (regSearch || '').toLowerCase().trim();
    return !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.uhid || '').toLowerCase().includes(q) ||
      (item.dept || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q);
  });

  const displayHospitalName = user?.hospitalName || 'Government General Hospital (GGH), Guntur';
  const displayEmail = user?.receptionistGmail || user?.email || 'sneha.reddy@carenavigator.com';
  const displayName = user?.name || 'Sneha Reddy';

  return (
    <div className="receptionist-page-root fade-in">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`reception-toast toast-${toast.type} slide-in-right`}>
          {toast.type === 'success' && <CheckCircle2 size={18} color="#ffffff" />}
          {toast.type === 'error' && <AlertTriangle size={18} color="#ffffff" />}
          {toast.type === 'info' && <Bell size={18} color="#ffffff" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER: Dark Navy Bar */}
      <header className="reception-top-navy-bar">
        <div className="navy-bar-left">
          <button className="navy-icon-btn" title="Main Menu" onClick={() => setActiveModal('more')}>
            <Menu size={20} color="#ffffff" />
          </button>
          <div className="navy-brand-group">
            <div className="navy-logo-icon">
              <Building2 size={22} color="#0284c7" />
            </div>
            <div>
              <h1 className="navy-app-title">Care Navigator</h1>
              <p className="navy-app-subtitle">{displayHospitalName} • Reception Desk</p>
            </div>
          </div>
        </div>

        <div className="navy-bar-right">
          {/* Notifications Dropdown trigger */}
          <button
            className="navy-icon-btn relative-btn"
            title="Reception Alerts"
            onClick={() => showToast('2 Emergency Triage Alerts active in ER Bay', 'info')}
          >
            <Bell size={20} color="#ffffff" />
            <span className="navy-notif-dot" />
          </button>

          {/* Receptionist Profile Badge */}
          <div className="receptionist-user-badge">
            <div className="rec-avatar-circle">
              {displayName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="rec-user-details desktop-only">
              <span className="rec-user-name">{displayName}</span>
              <span className="rec-user-role">{displayEmail}</span>
            </div>
          </div>

          {/* Role Switcher */}
          <button
            className="navy-role-switch-btn"
            onClick={() => switchRole('Doctor')}
            title="Switch to Doctor View"
          >
            <Stethoscope size={15} />
            <span>Doctor View</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="reception-main-content app-container">
        {/* TOP GREETING & CLOCK ROW */}
        <section className="reception-greeting-section">
          <div className="greeting-text-box">
            <h2 className="greeting-heading">
              Good Morning, <span className="highlight-navy-name">{displayName}</span>
            </h2>
            <p className="greeting-subtext">
              <span className="desk-pill">Reception Desk</span> <strong>{displayHospitalName}</strong> • Central OPD Entrance & Emergency Triage Command
            </p>
          </div>

          <div className="live-clock-card">
            <div className="clock-time-display">{formattedTime}</div>
            <div className="clock-date-display">
              <Clock size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {formattedDate}
            </div>
          </div>
        </section>

        {/* QUICK STATS CARDS (4 Stats) */}
        <section className="reception-quick-stats-grid">
          {/* Stat 1: Today's Appointments */}
          <div className="stat-card card-appointments">
            <div className="stat-card-header">
              <span className="stat-title">Today's Appointments</span>
              <div className="stat-icon-wrapper bg-blue-subtle">
                <CalendarCheck size={22} color="#0284c7" />
              </div>
            </div>
            <div className="stat-number-row">
              <span className="stat-number text-navy">18</span>
              <span className="stat-badge badge-blue">Scheduled</span>
            </div>
            <p className="stat-sub-info">12 Verified Online • 6 Desk Booked</p>
          </div>

          {/* Stat 2: Walk-ins */}
          <div className="stat-card card-walkins">
            <div className="stat-card-header">
              <span className="stat-title">Walk-ins Today</span>
              <div className="stat-icon-wrapper bg-teal-subtle">
                <Users size={22} color="#0d9488" />
              </div>
            </div>
            <div className="stat-number-row">
              <span className="stat-number text-teal">6</span>
              <span className="stat-badge badge-teal">Direct OPD</span>
            </div>
            <p className="stat-sub-info">4 Tokens Processed • 2 In Waiting</p>
          </div>

          {/* Stat 3: Emergency Alerts (RED HIGHLIGHT) */}
          <div className="stat-card card-emergency-alert pulse-red-border">
            <div className="stat-card-header">
              <span className="stat-title text-red-bold">Emergency Alerts</span>
              <div className="stat-icon-wrapper bg-red-strong">
                <Siren size={22} color="#ffffff" className="pulse-icon" />
              </div>
            </div>
            <div className="stat-number-row">
              <span className="stat-number text-red">2</span>
              <span className="stat-badge badge-red-bold">CRITICAL ACTIVE</span>
            </div>
            <p className="stat-sub-info text-red-sub">1 Ambulance In-bound • 1 ER Triage</p>
          </div>

          {/* Stat 4: Available Beds */}
          <div className="stat-card card-beds">
            <div className="stat-card-header">
              <span className="stat-title">Available Beds</span>
              <div className="stat-icon-wrapper bg-green-subtle">
                <Bed size={22} color="#16a34a" />
              </div>
            </div>
            <div className="stat-number-row">
              <span className="stat-number text-green">12</span>
              <span className="stat-badge badge-green">120 Total</span>
            </div>
            <p className="stat-sub-info">8 General • 2 ICU • 2 Emergency Bay</p>
          </div>
        </section>

        {/* RED "ACTIVE EMERGENCY" BANNER */}
        <section className="reception-active-emergency-banner">
          <div className="emergency-banner-left">
            <div className="emergency-alert-tag">
              <span className="red-pulse-beacon" />
              <Siren size={20} color="#ffffff" />
              <strong className="emergency-tag-text">ACTIVE EMERGENCY ALERT</strong>
            </div>

            <div className="emergency-details-inline">
              <div className="emergency-avg-time-box">
                <span className="time-val">2.3 min avg</span>
                <span className="time-lbl">Response Time</span>
              </div>
              <div className="emergency-text-desc">
                <p className="emergency-main-line">
                  <strong>Trauma Case #EM-4091:</strong> Severe Road Accident Patient • Ambulance AP-07-TY-4912 en route
                </p>
                <p className="emergency-sub-line">
                  ETA 2.3 Mins • ER Bay 02 Pre-reserved • Vitals Monitor Team Alerted
                </p>
              </div>
            </div>
          </div>

          <div className="emergency-banner-right">
            <button
              className="btn-emergency-action"
              onClick={() => setActiveModal('emergency_details')}
            >
              <span>View Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* MAIN TWO COLUMN GRID: LEFT QUEUE, RIGHT QUICK ACTIONS */}
        <div className="reception-grid-2col">
          {/* LEFT COLUMN: TODAY'S QUEUE */}
          <div className="queue-column-panel glass-card-static">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <Clock size={20} color="#0284c7" />
                <h3 className="panel-heading">Today's Queue List</h3>
                <span className="panel-count-pill">{filteredQueueList.length} Patients</span>
              </div>

              {/* Status Filter Tabs */}
              <div className="queue-filter-tabs">
                {['ALL', 'WAITING', 'ARRIVED', 'CONSULTATION', 'COMPLETED'].map(f => (
                  <button
                    key={f}
                    className={`q-tab-btn ${queueFilter === f ? 'active' : ''}`}
                    onClick={() => setQueueFilter(f)}
                  >
                    {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Search & Quick Stats */}
            <div className="queue-search-bar-row">
              <div className="search-input-wrapper">
                <Search size={16} color="#64748b" className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Patient Name, Token (OP-01), or UHID..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="search-input-field"
                />
                {queueSearch && (
                  <button className="clear-search-btn" onClick={() => setQueueSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Queue Patient Cards List */}
            <div className="queue-patients-scroll-container">
              {filteredQueueList.length > 0 ? (
                filteredQueueList.map(patient => (
                  <div key={patient.id} className="queue-patient-card">
                    <div className="patient-card-left">
                      <div className="token-number-badge">
                        <span className="token-label">TOKEN</span>
                        <strong className="token-val">{patient.token}</strong>
                      </div>

                      <div className="patient-info-block">
                        <div className="patient-name-row">
                          <h4 className="patient-name">{patient.name}</h4>
                          <span className="patient-meta">({patient.age} yrs • {patient.gender})</span>
                        </div>

                        <p className="patient-sub-details">
                          <span className="uhid-pill">{patient.uhid}</span> • <strong>{patient.dept}</strong>
                        </p>
                        <p className="doctor-assigned-line">
                          <Stethoscope size={13} color="#0284c7" inline="true" /> {patient.doctor}
                        </p>
                      </div>
                    </div>

                    <div className="patient-card-right">
                      {/* Status Badge */}
                      <div className="status-badge-container">
                        {patient.status === 'Waiting' && (
                          <span className="status-pill status-amber">
                            <span className="dot dot-amber" /> Waiting
                          </span>
                        )}
                        {patient.status === 'Arrived' && (
                          <span className="status-pill status-green">
                            <span className="dot dot-green" /> Arrived
                          </span>
                        )}
                        {patient.status === 'Consultation' && (
                          <span className="status-pill status-blue">
                            <span className="dot dot-blue" /> In Consultation
                          </span>
                        )}
                        {patient.status === 'Completed' && (
                          <span className="status-pill status-gray">
                            <span className="dot dot-gray" /> Completed
                          </span>
                        )}
                        <span className="time-slot-tag">{patient.timeSlot}</span>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="patient-action-btns-row">
                        <button
                          className="btn-action-sm btn-call"
                          title="Call Patient"
                          onClick={() => handleCallPatient(patient)}
                        >
                          <PhoneCall size={14} />
                          <span>Call</span>
                        </button>

                        {patient.status === 'Waiting' && (
                          <button
                            className="btn-action-sm btn-checkin"
                            onClick={() => handleUpdateStatus(patient.id, 'Arrived')}
                          >
                            <UserCheck size={14} />
                            <span>Check In</span>
                          </button>
                        )}

                        {patient.status === 'Arrived' && (
                          <button
                            className="btn-action-sm btn-consult"
                            onClick={() => handleUpdateStatus(patient.id, 'Consultation')}
                          >
                            <Stethoscope size={14} />
                            <span>Start Consult</span>
                          </button>
                        )}

                        {patient.status === 'Consultation' && (
                          <button
                            className="btn-action-sm btn-complete"
                            onClick={() => handleUpdateStatus(patient.id, 'Completed')}
                          >
                            <CheckCircle2 size={14} />
                            <span>Finish</span>
                          </button>
                        )}

                        <button
                          className="btn-action-sm btn-more"
                          title="More Actions"
                          onClick={() => {
                            setSelectedPatientForAction(patient);
                            setActiveModal('update');
                          }}
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-queue-state">
                  <Search size={36} color="#94a3b8" />
                  <p className="empty-title">No patients found in queue</p>
                  <span className="empty-sub">Try changing your search terms or filter selection.</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: QUICK ACTION GRID (6 Actions) */}
          <div className="quick-actions-column-panel glass-card-static">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <SlidersHorizontal size={20} color="#0f172a" />
                <h3 className="panel-heading">Quick Action Grid</h3>
              </div>
              <span className="action-help-tag">Reception Shortcuts</span>
            </div>

            <div className="quick-action-grid-6">
              {/* Action 1: Register Patient */}
              <button
                className="quick-action-card action-navy"
                onClick={() => setActiveModal('register')}
              >
                <div className="action-icon-circle icon-bg-navy">
                  <UserPlus size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Register Patient</strong>
                  <span className="action-card-desc">New Aadhaar / UHID entry</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>

              {/* Action 2: Book Appointment */}
              <button
                className="quick-action-card action-blue"
                onClick={() => setActiveModal('book')}
              >
                <div className="action-icon-circle icon-bg-blue">
                  <CalendarCheck size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Book Appointment</strong>
                  <span className="action-card-desc">Schedule OPD slot with doctor</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>

              {/* Action 3: Walk-in Registration */}
              <button
                className="quick-action-card action-teal"
                onClick={() => setActiveModal('walkin')}
              >
                <div className="action-icon-circle icon-bg-teal">
                  <FileText size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Walk-in Registration</strong>
                  <span className="action-card-desc">Instant 1-click OP slip token</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>

              {/* Action 4: Check Appointments */}
              <button
                className="quick-action-card action-sky"
                onClick={() => setActiveModal('check')}
              >
                <div className="action-icon-circle icon-bg-sky">
                  <Search size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Check Appointments</strong>
                  <span className="action-card-desc">Verify existing bookings & slips</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>

              {/* Action 5: Update Appointment */}
              <button
                className="quick-action-card action-amber"
                onClick={() => setActiveModal('update')}
              >
                <div className="action-icon-circle icon-bg-amber">
                  <Clock size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Update Appointment</strong>
                  <span className="action-card-desc">Reschedule, shift, or cancel slot</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>

              {/* Action 6: Emergency Desk */}
              <button
                className="quick-action-card action-red"
                onClick={() => setActiveModal('emergency_desk')}
              >
                <div className="action-icon-circle icon-bg-red">
                  <ShieldAlert size={22} color="#ffffff" />
                </div>
                <div className="action-text-content">
                  <strong className="action-card-title">Emergency Desk</strong>
                  <span className="action-card-desc">Triage, ER Bay & Ambulance Alert</span>
                </div>
                <ChevronRight size={18} className="action-arrow-icon" />
              </button>
            </div>

            {/* Operational Summary Widget */}
            <div className="ops-summary-widget-box">
              <h4 className="ops-widget-title">
                <Activity size={16} color="#0284c7" /> OPD Desk Status Overview
              </h4>
              <div className="ops-widget-metrics">
                <div className="metric-item">
                  <span className="m-val">14 Min</span>
                  <span className="m-lbl">Avg Wait Time</span>
                </div>
                <div className="metric-divider" />
                <div className="metric-item">
                  <span className="m-val">14 Active</span>
                  <span className="m-lbl">Doctors on Duty</span>
                </div>
                <div className="metric-divider" />
                <div className="metric-item">
                  <span className="m-val">96.4%</span>
                  <span className="m-lbl">Triage Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BELOW SECTION: HOSPITAL OVERVIEW STATS & NEW REGISTRATIONS TABLE */}
        <section className="reception-below-section">
          {/* Hospital Overview Stats */}
          <div className="hospital-overview-card glass-card-static">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <Building2 size={20} color="#0f172a" />
                <h3 className="panel-heading">Hospital Overview Stats</h3>
              </div>
              <button
                className="btn-refresh-sm"
                onClick={() => showToast('Hospital statistics synced with Live Bed Manager', 'info')}
              >
                <RefreshCw size={14} />
                <span>Sync Real-Time</span>
              </button>
            </div>

            <div className="overview-stats-columns">
              <div className="ov-stat-box">
                <div className="ov-stat-top">
                  <span className="ov-label">Bed Occupancy Rate</span>
                  <span className="ov-value-text text-blue font-bold">90%</span>
                </div>
                <div className="ov-progress-bar">
                  <div className="ov-progress-fill bg-blue" style={{ width: '90%' }} />
                </div>
                <span className="ov-sub-text">108 Occupied / 120 Total Beds</span>
              </div>

              <div className="ov-stat-box">
                <div className="ov-stat-top">
                  <span className="ov-label">ICU Capacity</span>
                  <span className="ov-value-text text-amber font-bold">86.6%</span>
                </div>
                <div className="ov-progress-bar">
                  <div className="ov-progress-fill bg-amber" style={{ width: '86.6%' }} />
                </div>
                <span className="ov-sub-text">13 Occupied / 15 ICU Beds</span>
              </div>

              <div className="ov-stat-box">
                <div className="ov-stat-top">
                  <span className="ov-label">ER Triage Load</span>
                  <span className="ov-value-text text-red font-bold">18 / 20 Beds</span>
                </div>
                <div className="ov-progress-bar">
                  <div className="ov-progress-fill bg-red" style={{ width: '90%' }} />
                </div>
                <span className="ov-sub-text">2 Emergency Bays Available</span>
              </div>

              <div className="ov-stat-box">
                <div className="ov-stat-top">
                  <span className="ov-label">Daily OPD Clearances</span>
                  <span className="ov-value-text text-green font-bold">142 Clearance</span>
                </div>
                <div className="ov-progress-bar">
                  <div className="ov-progress-fill bg-green" style={{ width: '78%' }} />
                </div>
                <span className="ov-sub-text">78% OPD Patients Completed</span>
              </div>
            </div>
          </div>

          {/* New Registrations Table */}
          <div className="registrations-table-card glass-card-static">
            <div className="panel-header-row">
              <div className="panel-title-group">
                <FileText size={20} color="#0284c7" />
                <h3 className="panel-heading">New Registrations Table</h3>
                <span className="panel-count-pill">{filteredRegistrations.length} Recent</span>
              </div>

              <div className="reg-table-search">
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Filter by Name or UHID..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="table-search-input"
                />
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="reception-data-table">
                <thead>
                  <tr>
                    <th>UHID / Aadhaar</th>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Type</th>
                    <th>Assigned Dept</th>
                    <th>Registered Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map(reg => (
                      <tr key={reg.id}>
                        <td>
                          <span className="uhid-code">{reg.uhid}</span>
                          <div className="aadhaar-sub-code">{reg.aadhaar}</div>
                        </td>
                        <td>
                          <strong className="patient-tbl-name">{reg.name}</strong>
                        </td>
                        <td>{reg.ageGender}</td>
                        <td>
                          <span className="reg-type-pill">{reg.type}</span>
                        </td>
                        <td>
                          <span className="dept-tag">{reg.dept}</span>
                        </td>
                        <td>{reg.registeredAt}</td>
                        <td>
                          <span className="table-status-badge">{reg.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-tbl-action"
                            onClick={() => showToast(`Printed OP Slip for ${reg.name} (${reg.uhid})`, 'success')}
                            title="Print OP Slip"
                          >
                            <Printer size={14} />
                            <span>Print Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No registrations matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="reception-bottom-nav">
        <button className="bottom-nav-item active">
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => {
            setQueueFilter('ALL');
            showToast('Showing active patients queue list', 'info');
          }}
        >
          <Users size={20} />
          <span>Active Patients</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => setActiveModal('check')}
        >
          <CalendarCheck size={20} />
          <span>Appointments</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => setActiveModal('more')}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* MODALS IMPLEMENTATION FOR QUICK ACTIONS & EMERGENCY VIEW DETAILS */}

      {/* MODAL 1: REGISTER PATIENT MODAL */}
      {activeModal === 'register' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <UserPlus size={22} color="#0284c7" />
                <h3>Register Patient</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="modal-dialog-body">
              <div className="modal-form-grid">
                <div className="form-group-item">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Reddy"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Aadhaar Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="5892 4103 7621"
                    value={registerForm.aadhaar}
                    onChange={(e) => setRegisterForm({ ...registerForm, aadhaar: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Age & Gender</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="Age"
                      style={{ width: '90px' }}
                      value={registerForm.age}
                      onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    />
                    <select
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Assign Department</label>
                  <select
                    value={registerForm.dept}
                    onChange={(e) => setRegisterForm({ ...registerForm, dept: e.target.value })}
                  >
                    <option>General Medicine</option>
                    <option>Cardiology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>General Surgery</option>
                    <option>Dermatology</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Blood Group</label>
                  <select
                    value={registerForm.bloodGroup}
                    onChange={(e) => setRegisterForm({ ...registerForm, bloodGroup: e.target.value })}
                  >
                    <option>O+</option>
                    <option>A+</option>
                    <option>B+</option>
                    <option>AB+</option>
                    <option>O-</option>
                    <option>B-</option>
                  </select>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button type="button" className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-pri">
                  <Check size={16} /> Complete Registration & Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOK APPOINTMENT MODAL */}
      {activeModal === 'book' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <CalendarCheck size={22} color="#0284c7" />
                <h3>Book Appointment</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="modal-dialog-body">
              <div className="modal-form-grid">
                <div className="form-group-item">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Patient Full Name"
                    value={bookForm.patientName}
                    onChange={(e) => setBookForm({ ...bookForm, patientName: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Patient UHID / Aadhaar</label>
                  <input
                    type="text"
                    placeholder="UHID-882109"
                    value={bookForm.patientUhid}
                    onChange={(e) => setBookForm({ ...bookForm, patientUhid: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Specialty Department</label>
                  <select
                    value={bookForm.dept}
                    onChange={(e) => setBookForm({ ...bookForm, dept: e.target.value })}
                  >
                    <option>Cardiology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>General Medicine</option>
                    <option>Surgery</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Doctor On Duty</label>
                  <select
                    value={bookForm.doctor}
                    onChange={(e) => setBookForm({ ...bookForm, doctor: e.target.value })}
                  >
                    <option>Dr. K. Srinivas Rao, MD (Cardiology)</option>
                    <option>Dr. S. Meenakshi, MS (Orthopedics)</option>
                    <option>Dr. R. V. Ramana, MD (Pediatrics)</option>
                    <option>Dr. Common Duty Physician</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Time Slot</label>
                  <select
                    value={bookForm.timeSlot}
                    onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                  >
                    <option>10:30 AM</option>
                    <option>11:00 AM</option>
                    <option>11:30 AM</option>
                    <option>02:00 PM</option>
                    <option>03:30 PM</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Chief Complaint / Note</label>
                  <input
                    type="text"
                    value={bookForm.notes}
                    onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button type="button" className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-pri">
                  <CalendarCheck size={16} /> Confirm Appointment Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: WALK-IN REGISTRATION MODAL */}
      {activeModal === 'walkin' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <FileText size={22} color="#0d9488" />
                <h3>Walk-in Registration</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} className="modal-dialog-body">
              <p className="modal-intro-text">
                Generate instant OPD Registration Slip & Token for Walk-in Patient at Front Desk.
              </p>

              <div className="modal-form-grid">
                <div className="form-group-item">
                  <label>Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Walk-in Patient Name"
                    value={walkinForm.name}
                    onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 Mobile number"
                    value={walkinForm.phone}
                    onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Department</label>
                  <select
                    value={walkinForm.dept}
                    onChange={(e) => setWalkinForm({ ...walkinForm, dept: e.target.value })}
                  >
                    <option>General Medicine</option>
                    <option>Cardiology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>OP Fee Status</label>
                  <input type="text" readOnly value={walkinForm.fee} />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button type="button" className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-pri bg-teal">
                  <Printer size={16} /> Generate & Print Walk-in Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CHECK APPOINTMENTS MODAL */}
      {activeModal === 'check' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <Search size={22} color="#0284c7" />
                <h3>Check Appointments</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <div className="search-box-large">
                <Search size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Enter Patient Name, Token (e.g. OP-01) or UHID..."
                  value={checkSearchTerm}
                  onChange={(e) => setCheckSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const term = (checkSearchTerm || '').toLowerCase().trim();
                      if (!term) {
                        setSearchResult(null);
                        return;
                      }
                      const match = (queueList || []).find(q =>
                        (q.name || '').toLowerCase().includes(term) ||
                        (q.token || '').toLowerCase().includes(term) ||
                        (q.uhid || '').toLowerCase().includes(term) ||
                        (q.phone || '').toLowerCase().includes(term)
                      );
                      setSearchResult(match || 'NOT_FOUND');
                    }
                  }}
                />
                <button
                  className="btn-search-exec"
                  onClick={() => {
                    const term = (checkSearchTerm || '').toLowerCase().trim();
                    if (!term) {
                      setSearchResult(null);
                      return;
                    }
                    const match = (queueList || []).find(q =>
                      (q.name || '').toLowerCase().includes(term) ||
                      (q.token || '').toLowerCase().includes(term) ||
                      (q.uhid || '').toLowerCase().includes(term) ||
                      (q.phone || '').toLowerCase().includes(term)
                    );
                    setSearchResult(match || 'NOT_FOUND');
                  }}
                >
                  Verify
                </button>
              </div>

              {searchResult && searchResult !== 'NOT_FOUND' && (
                <div className="appointment-verified-card fade-in">
                  <div className="verified-head">
                    <CheckCircle2 size={24} color="#16a34a" />
                    <div>
                      <strong className="ver-name">{searchResult.name}</strong>
                      <div className="ver-uhid">{searchResult.uhid} • Token: {searchResult.token}</div>
                    </div>
                  </div>
                  <div className="ver-body">
                    <p><strong>Doctor:</strong> {searchResult.doctor}</p>
                    <p><strong>Department:</strong> {searchResult.dept}</p>
                    <p><strong>Slot:</strong> {searchResult.timeSlot}</p>
                    <p><strong>Status:</strong> <span className="badge badge-blue">{searchResult.status}</span></p>
                  </div>
                </div>
              )}

              {searchResult === 'NOT_FOUND' && (
                <div className="not-found-banner fade-in">
                  <AlertTriangle size={20} color="#dc2626" />
                  <span>No matching appointment found for "{checkSearchTerm}"</span>
                </div>
              )}
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: UPDATE APPOINTMENT MODAL */}
      {activeModal === 'update' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <Edit size={22} color="#d97706" />
                <h3>Update Appointment</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <p className="modal-intro-text">
                Patient: <strong>{selectedPatientForAction ? selectedPatientForAction.name : 'Ramesh Kumar'}</strong> ({selectedPatientForAction ? selectedPatientForAction.token : 'OP-01'})
              </p>

              <div className="status-selection-options">
                <button
                  className="status-opt-btn btn-opt-waiting"
                  onClick={() => {
                    if (selectedPatientForAction) handleUpdateStatus(selectedPatientForAction.id, 'Waiting');
                    setActiveModal(null);
                  }}
                >
                  <Clock size={18} /> Move to Waiting Queue
                </button>

                <button
                  className="status-opt-btn btn-opt-arrived"
                  onClick={() => {
                    if (selectedPatientForAction) handleUpdateStatus(selectedPatientForAction.id, 'Arrived');
                    setActiveModal(null);
                  }}
                >
                  <UserCheck size={18} /> Mark as Checked In / Arrived
                </button>

                <button
                  className="status-opt-btn btn-opt-consult"
                  onClick={() => {
                    if (selectedPatientForAction) handleUpdateStatus(selectedPatientForAction.id, 'Consultation');
                    setActiveModal(null);
                  }}
                >
                  <Stethoscope size={18} /> Send to Consultation Room
                </button>

                <button
                  className="status-opt-btn btn-opt-completed"
                  onClick={() => {
                    if (selectedPatientForAction) handleUpdateStatus(selectedPatientForAction.id, 'Completed');
                    setActiveModal(null);
                  }}
                >
                  <CheckCircle2 size={18} /> Mark Consultation Completed
                </button>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: EMERGENCY DESK MODAL */}
      {activeModal === 'emergency_desk' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog border-red" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header bg-red-header">
              <div className="modal-header-title text-white">
                <ShieldAlert size={22} color="#ffffff" />
                <h3>Emergency Desk Command</h3>
              </div>
              <button className="btn-modal-close white-text" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <div className="emergency-alert-card-inner">
                <Siren size={28} color="#dc2626" className="pulse-icon" />
                <div>
                  <h4 className="er-head">Emergency Bay Reserve & Dispatch</h4>
                  <p className="er-text">Allocate ER beds, trigger trauma team call, or dispatch ambulance.</p>
                </div>
              </div>

              <div className="modal-form-grid" style={{ marginTop: '16px' }}>
                <div className="form-group-item">
                  <label>Emergency Type</label>
                  <select>
                    <option>Trauma / Road Accident</option>
                    <option>Cardiac Arrest / Chest Pain</option>
                    <option>Severe Respiratory Distress</option>
                    <option>Stroke / Neurological</option>
                  </select>
                </div>

                <div className="form-group-item">
                  <label>Assign ER Bay</label>
                  <select>
                    <option>ER Bay 01 (ICU Prepped)</option>
                    <option>ER Bay 02 (Reserved)</option>
                    <option>ER Bay 03 (Available)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Close
              </button>
              <button
                className="btn-modal-pri bg-red"
                onClick={() => {
                  showToast('Emergency Bay Reserved & Trauma Team Alerted!', 'success');
                  setActiveModal(null);
                }}
              >
                <Siren size={16} /> Dispatch Emergency Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: VIEW EMERGENCY DETAILS MODAL */}
      {activeModal === 'emergency_details' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog border-red" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header bg-red-header">
              <div className="modal-header-title text-white">
                <Siren size={24} color="#ffffff" className="pulse-icon" />
                <h3>Active Emergency Case #EM-4091 Details</h3>
              </div>
              <button className="btn-modal-close white-text" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <div className="em-modal-metrics">
                <div className="em-m-box">
                  <span className="em-lbl">AVG RESPONSE TIME</span>
                  <strong className="em-val text-red">2.3 min avg</strong>
                </div>
                <div className="em-m-box">
                  <span className="em-lbl">ESTIMATED ETA</span>
                  <strong className="em-val text-green">2.0 Mins</strong>
                </div>
                <div className="em-m-box">
                  <span className="em-lbl">DISPATCH UNIT</span>
                  <strong className="em-val">Ambulance #4912</strong>
                </div>
              </div>

              <div className="em-case-info-panel">
                <h4>Incident & Patient Summary</h4>
                <p><strong>Condition:</strong> Severe Road Collision • Multi-trauma & Fractures</p>
                <p><strong>Vitals Transmitted:</strong> Pulse 110 bpm • BP 100/65 • SpO2 94%</p>
                <p><strong>Assigned Destination:</strong> {displayHospitalName} ER Bay 02</p>
                <p><strong>Trauma Surgeon On Call:</strong> Dr. M. Lakshmi Prasanna (Notified & Standby)</p>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Dismiss
              </button>
              <button
                className="btn-modal-pri bg-red"
                onClick={() => {
                  showToast('ER Bay 02 Ready & Duty Officer Confirmed Arrival', 'success');
                  setActiveModal(null);
                }}
              >
                <CheckCircle2 size={16} /> Confirm ER Bay Preparedness
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: CALL PATIENT ANNOUNCEMENT TOAST */}
      {activeModal === 'patient_call' && selectedPatientForAction && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <PhoneCall size={22} color="#0284c7" />
                <h3>Call Patient to Desk</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body" style={{ textAlign: 'center', padding: '24px' }}>
              <div className="call-announcement-box">
                <h4 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 6px 0' }}>
                  Calling Token <strong>{selectedPatientForAction.token}</strong>
                </h4>
                <p style={{ fontSize: '1.05rem', color: '#0284c7', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {selectedPatientForAction.name} ({selectedPatientForAction.uhid})
                </p>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Please proceed to <strong>{selectedPatientForAction.dept}</strong> Desk / {selectedPatientForAction.doctor}.
                </p>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button
                className="btn-modal-pri"
                onClick={() => {
                  showToast(`Audio Announcement Broadcasted for ${selectedPatientForAction.token} (${selectedPatientForAction.name})`, 'success');
                  setActiveModal(null);
                }}
              >
                <PhoneCall size={16} /> Broadcast Audio Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: MORE MENU OPTIONS */}
      {activeModal === 'more' && (
        <div className="modal-backdrop-overlay fade-in" onClick={() => setActiveModal(null)}>
          <div className="modal-card-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div className="modal-header-title">
                <MoreHorizontal size={22} color="#0f172a" />
                <h3>Reception Utilities & Desk Settings</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-dialog-body">
              <div className="more-menu-options-list">
                <button
                  className="more-opt-item"
                  onClick={() => {
                    switchRole('Doctor');
                    setActiveModal(null);
                  }}
                >
                  <Stethoscope size={18} color="#0284c7" />
                  <div>
                    <strong>Switch to Doctor Portal</strong>
                    <span>Access Doctor Consultation Desk & Digital Rx</span>
                  </div>
                </button>

                <button
                  className="more-opt-item"
                  onClick={() => {
                    switchRole('Patient');
                    setActiveModal(null);
                  }}
                >
                  <Users size={18} color="#10b981" />
                  <div>
                    <strong>Switch to Patient Portal</strong>
                    <span>View Patient Mobile App Experience</span>
                  </div>
                </button>

                <button
                  className="more-opt-item"
                  onClick={() => {
                    navigateTo('onboarding');
                    setActiveModal(null);
                  }}
                >
                  <LogOut size={18} color="#dc2626" />
                  <div>
                    <strong>Lock Reception Desk & Re-login</strong>
                    <span>Return to Login Screen</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="modal-dialog-footer">
              <button className="btn-modal-sec" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .receptionist-page-root {
          min-height: 100vh;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: var(--font-main, 'Inter', sans-serif);
          padding-bottom: 80px;
        }

        .reception-toast {
          position: fixed;
          top: 80px;
          right: 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .toast-success { background: #16a34a; }
        .toast-error { background: #dc2626; }
        .toast-info { background: #0284c7; }

        .reception-top-navy-bar {
          height: 64px;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid #1e293b;
          position: sticky;
          top: 0;
          z-index: 150;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
        }

        .navy-bar-left { display: flex; align-items: center; gap: 16px; }

        .navy-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .navy-icon-btn:hover { background: rgba(255, 255, 255, 0.2); }

        .navy-brand-group { display: flex; align-items: center; gap: 12px; }

        .navy-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .navy-app-title { font-size: 1.15rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; margin: 0; line-height: 1.1; }
        .navy-app-subtitle { font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0 0; }

        .navy-bar-right { display: flex; align-items: center; gap: 14px; }

        .relative-btn { position: relative; }
        .navy-notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; border: 2px solid #0f172a; }

        .receptionist-user-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.08);
          padding: 4px 12px 4px 6px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .rec-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0284c7;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rec-user-details { display: flex; flex-direction: column; }
        .rec-user-name { font-size: 0.85rem; font-weight: 700; color: #ffffff; }
        .rec-user-role { font-size: 0.68rem; color: #cbd5e1; }

        .navy-role-switch-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .navy-role-switch-btn:hover { background: #0369a1; }

        .reception-main-content { padding-top: 24px; display: flex; flex-direction: column; gap: 24px; }

        .reception-greeting-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        .greeting-heading { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
        .highlight-navy-name { color: #0284c7; }
        .greeting-subtext { font-size: 0.88rem; color: #64748b; margin: 0; display: flex; align-items: center; gap: 8px; }

        .desk-pill { background: #f1f5f9; color: #0f172a; font-weight: 700; font-size: 0.75rem; padding: 2px 8px; border-radius: 6px; border: 1px solid #cbd5e1; }

        .live-clock-card { text-align: right; background: #f8fafc; padding: 10px 18px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .clock-time-display { font-size: 1.3rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #0f172a; line-height: 1.1; }
        .clock-date-display { font-size: 0.78rem; color: #64748b; font-weight: 600; margin-top: 4px; }

        .reception-quick-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

        .stat-card {
          background: #ffffff;
          padding: 18px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }

        .stat-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .stat-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .stat-icon-wrapper { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .bg-blue-subtle { background: rgba(2, 132, 199, 0.1); }
        .bg-teal-subtle { background: rgba(13, 148, 136, 0.1); }
        .bg-red-strong { background: #dc2626; }
        .bg-green-subtle { background: rgba(22, 163, 74, 0.1); }

        .stat-number-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; }
        .stat-number { font-size: 2rem; font-weight: 900; line-height: 1; }

        .text-navy { color: #0f172a; }
        .text-teal { color: #0d9488; }
        .text-red { color: #dc2626; }
        .text-green { color: #16a34a; }
        .text-red-bold { color: #b91c1c; font-weight: 800; }

        .stat-badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
        .badge-blue { background: #e0f2fe; color: #0369a1; }
        .badge-teal { background: #ccfbf1; color: #0f766e; }
        .badge-red-bold { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
        .badge-green { background: #dcfce7; color: #15803d; }

        .stat-sub-info { font-size: 0.78rem; color: #64748b; margin: 0; }
        .text-red-sub { color: #991b1b; font-weight: 600; }

        .pulse-red-border { border: 1.5px solid #fca5a5; background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%); }
        .pulse-icon { animation: pulseGlow 1.5s infinite ease-in-out; }

        .reception-active-emergency-banner {
          background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
          color: #ffffff;
          padding: 18px 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 8px 24px rgba(220, 38, 38, 0.25);
          border: 1px solid #b91c1c;
        }

        .emergency-banner-left { display: flex; align-items: center; gap: 24px; flex: 1; }

        .emergency-alert-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          white-space: nowrap;
        }

        .red-pulse-beacon { width: 10px; height: 10px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4); }
        .emergency-tag-text { font-size: 0.8rem; letter-spacing: 0.04em; }

        .emergency-details-inline { display: flex; align-items: center; gap: 16px; }

        .emergency-avg-time-box {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.15);
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          white-space: nowrap;
        }

        .time-val { font-size: 1.1rem; font-weight: 900; line-height: 1.1; }
        .time-lbl { font-size: 0.65rem; text-transform: uppercase; opacity: 0.9; }

        .emergency-text-desc { display: flex; flex-direction: column; gap: 2px; }
        .emergency-main-line { font-size: 0.95rem; margin: 0; font-weight: 500; }
        .emergency-sub-line { font-size: 0.78rem; opacity: 0.9; margin: 0; }

        .btn-emergency-action {
          background: #ffffff;
          color: #dc2626;
          border: none;
          font-weight: 800;
          font-size: 0.9rem;
          padding: 10px 20px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-emergency-action:hover { background: #fecdd3; transform: translateY(-1px); }

        .reception-grid-2col { display: grid; grid-template-columns: 1.35fr 1fr; gap: 24px; }
        .panel-header-row { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 12px; }
        .panel-title-group { display: flex; align-items: center; gap: 10px; }
        .panel-heading { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0; }
        .panel-count-pill { background: #f1f5f9; color: #0284c7; font-size: 0.75rem; font-weight: 700; padding: 2px 10px; border-radius: 12px; border: 1px solid #cbd5e1; }
        .action-help-tag { font-size: 0.75rem; color: #64748b; font-weight: 600; }

        .queue-filter-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .q-tab-btn { background: none; border: none; padding: 5px 10px; border-radius: 7px; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; }
        .q-tab-btn.active { background: #ffffff; color: #0284c7; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); }

        .queue-search-bar-row { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; }
        .search-input-wrapper { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 12px; }
        .search-input-field { width: 100%; padding: 9px 36px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.88rem; outline: none; }
        .search-input-field:focus { border-color: #0284c7; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1); }
        .clear-search-btn { position: absolute; right: 10px; background: none; border: none; color: #94a3b8; cursor: pointer; }

        .queue-patients-scroll-container { max-height: 480px; overflow-y: auto; padding: 12px 20px; display: flex; flex-direction: column; gap: 12px; }

        .queue-patient-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.2s ease;
        }
        .queue-patient-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04); }

        .patient-card-left { display: flex; align-items: center; gap: 14px; }
        .token-number-badge { width: 54px; height: 54px; border-radius: 12px; background: #0f172a; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
        .token-label { font-size: 0.55rem; font-weight: 800; color: #94a3b8; }
        .token-val { font-size: 1.05rem; font-weight: 900; color: #38bdf8; line-height: 1; }

        .patient-info-block { display: flex; flex-direction: column; gap: 2px; }
        .patient-name-row { display: flex; align-items: baseline; gap: 6px; }
        .patient-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0; }
        .patient-meta { font-size: 0.78rem; color: #64748b; }
        .patient-sub-details { font-size: 0.78rem; color: #475569; margin: 0; }
        .uhid-pill { font-family: var(--font-mono, monospace); font-size: 0.72rem; font-weight: 700; color: #0284c7; background: #f0f9ff; padding: 1px 6px; border-radius: 4px; }
        .doctor-assigned-line { font-size: 0.76rem; color: #64748b; margin: 0; display: flex; align-items: center; gap: 4px; }

        .patient-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .status-badge-container { display: flex; align-items: center; gap: 8px; }

        .status-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .dot-amber { background: #d97706; }
        .dot-green { background: #16a34a; }
        .dot-blue { background: #0284c7; }
        .dot-gray { background: #64748b; }

        .status-amber { background: #fef3c7; color: #b45309; }
        .status-green { background: #dcfce7; color: #15803d; }
        .status-blue { background: #e0f2fe; color: #0369a1; }
        .status-gray { background: #f1f5f9; color: #475569; }

        .time-slot-tag { font-size: 0.72rem; color: #64748b; font-weight: 600; }
        .patient-action-btns-row { display: flex; align-items: center; gap: 6px; }

        .btn-action-sm {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .btn-action-sm:hover { background: #f8fafc; border-color: #94a3b8; }
        .btn-call { color: #0284c7; border-color: #bae6fd; background: #f0f9ff; }
        .btn-checkin { color: #16a34a; border-color: #bbf7d0; background: #f0fdf4; }
        .btn-consult { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
        .btn-complete { color: #475569; background: #f8fafc; }

        .empty-queue-state { text-align: center; padding: 40px 20px; color: #64748b; }
        .empty-title { font-weight: 700; color: #0f172a; margin: 8px 0 2px 0; }
        .empty-sub { font-size: 0.8rem; }

        .quick-action-grid-6 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 20px; }
        .quick-action-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quick-action-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }

        .action-navy:hover { border-color: #0f172a; }
        .action-blue:hover { border-color: #0284c7; }
        .action-teal:hover { border-color: #0d9488; }
        .action-sky:hover { border-color: #0284c7; }
        .action-amber:hover { border-color: #d97706; }
        .action-red:hover { border-color: #dc2626; background: #fef2f2; }

        .action-icon-circle { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-bg-navy { background: #0f172a; }
        .icon-bg-blue { background: #0284c7; }
        .icon-bg-teal { background: #0d9488; }
        .icon-bg-sky { background: #0284c7; }
        .icon-bg-amber { background: #d97706; }
        .icon-bg-red { background: #dc2626; }

        .action-text-content { display: flex; flex-direction: column; flex: 1; }
        .action-card-title { font-size: 0.92rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
        .action-card-desc { font-size: 0.74rem; color: #64748b; margin-top: 2px; }

        .action-arrow-icon { color: #94a3b8; transition: transform 0.2s ease; }
        .quick-action-card:hover .action-arrow-icon { transform: translateX(3px); color: #0f172a; }

        .ops-summary-widget-box { margin: 0 20px 20px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
        .ops-widget-title { font-size: 0.82rem; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px; }
        .ops-widget-metrics { display: flex; align-items: center; justify-content: space-around; }
        .metric-item { display: flex; flex-direction: column; align-items: center; }
        .m-val { font-size: 0.95rem; font-weight: 900; color: #0f172a; }
        .m-lbl { font-size: 0.68rem; color: #64748b; margin-top: 2px; }
        .metric-divider { width: 1px; height: 24px; background: #cbd5e1; }

        .reception-below-section { display: flex; flex-direction: column; gap: 24px; }
        .overview-stats-columns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 20px; }
        .ov-stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 6px; }
        .ov-stat-top { display: flex; align-items: center; justify-content: space-between; }
        .ov-label { font-size: 0.78rem; font-weight: 700; color: #64748b; }
        .ov-value-text { font-size: 0.88rem; }
        .ov-progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .ov-progress-fill { height: 100%; border-radius: 3px; }
        .bg-blue { background: #0284c7; }
        .bg-amber { background: #d97706; }
        .bg-red { background: #dc2626; }
        .bg-green { background: #16a34a; }
        .ov-sub-text { font-size: 0.72rem; color: #64748b; }

        .btn-refresh-sm { background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
        .btn-refresh-sm:hover { background: #f8fafc; }

        .table-responsive-wrapper { overflow-x: auto; }
        .reception-data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; }
        .reception-data-table th { background: #f8fafc; padding: 12px 20px; font-weight: 700; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 0.78rem; text-transform: uppercase; }
        .reception-data-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; }

        .uhid-code { font-family: var(--font-mono, monospace); font-weight: 700; color: #0284c7; }
        .aadhaar-sub-code { font-size: 0.7rem; color: #94a3b8; }
        .patient-tbl-name { color: #0f172a; }
        .reg-type-pill { background: #f1f5f9; color: #334155; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
        .dept-tag { font-weight: 600; color: #0f172a; }
        .table-status-badge { background: #e0f2fe; color: #0369a1; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }

        .btn-tbl-action { background: #ffffff; border: 1px solid #cbd5e1; color: #0284c7; font-size: 0.75rem; font-weight: 700; padding: 5px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
        .btn-tbl-action:hover { background: #f0f9ff; border-color: #0284c7; }

        .reg-table-search { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .table-search-input { background: none; border: none; outline: none; font-size: 0.8rem; width: 180px; }

        .reception-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 200;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
        }

        .bottom-nav-item { background: none; border: none; color: #94a3b8; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 0.72rem; font-weight: 700; cursor: pointer; flex: 1; padding: 6px 0; }
        .bottom-nav-item:hover { color: #ffffff; }
        .bottom-nav-item.active { color: #38bdf8; }

        .modal-backdrop-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-card-dialog { background: #ffffff; width: 100%; max-width: 580px; border-radius: 18px; border: 1px solid #cbd5e1; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }

        .border-red { border: 2px solid #dc2626; }
        .bg-red-header { background: #dc2626 !important; }
        .modal-dialog-header { padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
        .modal-header-title { display: flex; align-items: center; gap: 10px; }
        .modal-header-title h3 { font-size: 1.05rem; font-weight: 800; margin: 0; color: #0f172a; }
        .text-white h3 { color: #ffffff !important; }
        .btn-modal-close { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }
        .white-text { color: #ffffff !important; }
        .modal-dialog-body { padding: 20px; overflow-y: auto; }
        .modal-intro-text { font-size: 0.88rem; color: #475569; margin: 0 0 16px 0; }
        .modal-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .form-group-item { display: flex; flex-direction: column; gap: 6px; }
        .form-group-item label { font-size: 0.78rem; font-weight: 700; color: #0f172a; }
        .form-group-item input, .form-group-item select { padding: 9px 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.88rem; outline: none; }
        .form-group-item input:focus, .form-group-item select:focus { border-color: #0284c7; }

        .modal-dialog-footer { padding: 16px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .btn-modal-sec { background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; padding: 9px 16px; border-radius: 8px; cursor: pointer; }
        .btn-modal-pri { background: #0284c7; color: #ffffff; border: none; font-weight: 700; padding: 9px 18px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
        .bg-teal { background: #0d9488 !important; }
        .bg-red { background: #dc2626 !important; }

        .search-box-large { display: flex; gap: 8px; background: #f1f5f9; padding: 8px 12px; border-radius: 10px; align-items: center; margin-bottom: 16px; }
        .search-box-large input { flex: 1; background: none; border: none; outline: none; font-size: 0.9rem; }
        .btn-search-exec { background: #0284c7; color: #ffffff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; }

        .appointment-verified-card { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 16px; }
        .verified-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .ver-name { font-size: 1.05rem; color: #0f172a; }
        .ver-uhid { font-size: 0.8rem; color: #64748b; }
        .ver-body p { margin: 4px 0; font-size: 0.85rem; color: #334155; }

        .not-found-banner { display: flex; align-items: center; gap: 10px; background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 8px; font-size: 0.88rem; font-weight: 600; }

        .status-selection-options { display: flex; flex-direction: column; gap: 10px; }
        .status-opt-btn { padding: 12px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: #ffffff; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; cursor: pointer; text-align: left; transition: all 0.15s ease; }
        .status-opt-btn:hover { transform: translateX(3px); }
        .btn-opt-waiting:hover { border-color: #d97706; background: #fef3c7; color: #b45309; }
        .btn-opt-arrived:hover { border-color: #16a34a; background: #dcfce7; color: #15803d; }
        .btn-opt-consult:hover { border-color: #0284c7; background: #e0f2fe; color: #0369a1; }
        .btn-opt-completed:hover { border-color: #64748b; background: #f1f5f9; color: #475569; }

        .emergency-alert-card-inner { display: flex; align-items: center; gap: 14px; background: #fef2f2; border: 1px solid #fca5a5; padding: 14px; border-radius: 12px; }
        .er-head { font-size: 0.95rem; font-weight: 800; color: #991b1b; margin: 0 0 2px 0; }
        .er-text { font-size: 0.8rem; color: #7f1d1d; margin: 0; }

        .em-modal-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .em-m-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; text-align: center; }
        .em-lbl { font-size: 0.65rem; color: #64748b; font-weight: 700; }
        .em-val { font-size: 1rem; font-weight: 900; display: block; margin-top: 2px; }

        .em-case-info-panel { background: #f1f5f9; padding: 14px; border-radius: 10px; }
        .em-case-info-panel h4 { margin: 0 0 8px 0; font-size: 0.9rem; color: #0f172a; }
        .em-case-info-panel p { margin: 4px 0; font-size: 0.82rem; color: #334155; }

        .more-menu-options-list { display: flex; flex-direction: column; gap: 10px; }
        .more-opt-item { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff; cursor: pointer; text-align: left; }
        .more-opt-item:hover { background: #f8fafc; border-color: #cbd5e1; }
        .more-opt-item div { display: flex; flex-direction: column; }
        .more-opt-item strong { font-size: 0.88rem; color: #0f172a; }
        .more-opt-item span { font-size: 0.75rem; color: #64748b; }

        @media (max-width: 1024px) {
          .reception-quick-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .reception-grid-2col { grid-template-columns: 1fr; }
          .overview-stats-columns { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .reception-quick-stats-grid { grid-template-columns: 1fr; }
          .quick-action-grid-6 { grid-template-columns: 1fr; }
          .overview-stats-columns { grid-template-columns: 1fr; }
          .reception-greeting-section { flex-direction: column; align-items: flex-start; gap: 12px; }
          .live-clock-card { text-align: left; width: 100%; }
          .reception-active-emergency-banner { flex-direction: column; align-items: flex-start; }
          .emergency-banner-left { flex-direction: column; align-items: flex-start; }
          .modal-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
