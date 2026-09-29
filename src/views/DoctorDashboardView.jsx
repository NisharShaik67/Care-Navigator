import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationSwipeItem } from '../components/NotificationSwipeItem';
import {
  Menu,
  Bell,
  User,
  Calendar,
  Users,
  FileText,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Search,
  Building2,
  Stethoscope,
  X,
  Phone,
  Trash2,
  FileSpreadsheet,
  Check,
  Zap,
  MapPin,
  Edit2,
  LogOut,
  Save,
  ArrowLeft
} from 'lucide-react';

export const DoctorDashboardView = () => {
  const { user, updateUserProfile, logout, goBack, screenHistory } = useApp();

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState('home');

  // Doctor Status
  const [isAvailable, setIsAvailable] = useState(true);

  // Active Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const hasAnyModalOpen = showProfileModal || showEmergencyModal || showMenuDrawer || showNotifModal || !!selectedAppointment || !!selectedPatient;

  // Close modals on ESC key press without navigating away from page
  useEffect(() => {
    if (!hasAnyModalOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setShowProfileModal(false);
        setShowEmergencyModal(false);
        setShowMenuDrawer(false);
        setShowNotifModal(false);
        setSelectedAppointment(null);
        setSelectedPatient(null);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [hasAnyModalOpen]);

  // Doctor Name & Profile Edit State
  const [isEditingDoctor, setIsEditingDoctor] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: user?.name || 'Dr. Anjali Kumar',
    title: 'Senior General Physician',
    specialty: 'General Physician',
    hospital: 'ABC Hospital',
    department: 'Department of General Medicine',
    licenseNo: 'MCI-AP-89412',
    opdRoom: 'Room No. 104, OPD Block A',
    shiftHours: '09:00 AM - 05:00 PM',
    experience: '12 Years',
    qualifications: 'MBBS, MD (Internal Medicine)',
    totalConsultationsToday: 7
  });

  const [tempDoctorName, setTempDoctorName] = useState(doctorInfo.name);
  const [tempSpecialty, setTempSpecialty] = useState(doctorInfo.specialty);
  const [tempHospital, setTempHospital] = useState(doctorInfo.hospital);

  const handleSaveDoctorName = (e) => {
    e.preventDefault();
    if (!tempDoctorName.trim()) return;
    const updatedName = tempDoctorName.trim();
    setDoctorInfo(prev => ({
      ...prev,
      name: updatedName,
      specialty: tempSpecialty.trim(),
      hospital: tempHospital.trim()
    }));
    if (updateUserProfile) {
      updateUserProfile({ name: updatedName });
    }
    setIsEditingDoctor(false);
  };

  // Search & Filter state for appointments
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Prescription Form state inside patient modal
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxMedicines, setRxMedicines] = useState('');
  const [consultCompletedAlert, setConsultCompletedAlert] = useState(null);

  // Emergency Alert Data
  const [emergencyAlert, setEmergencyAlert] = useState({
    id: 'EMG-9021',
    count: 1,
    patientName: 'Ramesh Gupta',
    age: 58,
    gender: 'Male',
    condition: 'Acute Chest Tightness & Low SpO2 (88%)',
    location: 'Emergency ER Desk / Bay 02',
    vitals: { bp: '160/105 mmHg', hr: '118 bpm', spo2: '88%', temp: '98.6°F' },
    ambulanceEta: '4 Mins',
    status: 'CRITICAL',
    time: '2 Mins ago'
  });

  // Stats Data
  const [stats] = useState({
    todayAppointments: 12,
    totalPatients: 8
  });

  // Appointments List (12 Appointments)
  const [appointmentsList, setAppointmentsList] = useState([
    {
      id: 'APT-101',
      time: '09:30 AM',
      patientName: 'Rajesh Sharma',
      age: 45,
      gender: 'Male',
      type: 'OP Consultation',
      status: 'In Queue',
      phone: '+91 98765 43210',
      reason: 'Fever & Headaches for 3 days',
      vitals: { bp: '120/80', hr: '74 bpm', temp: '100.2°F' }
    },
    {
      id: 'APT-102',
      time: '10:15 AM',
      patientName: 'Sunita Devi',
      age: 52,
      gender: 'Female',
      type: 'General Checkup',
      status: 'In Queue',
      phone: '+91 98123 45678',
      reason: 'Routine BP & Diabetes Check',
      vitals: { bp: '135/88', hr: '80 bpm', temp: '98.4°F' }
    },
    {
      id: 'APT-103',
      time: '11:00 AM',
      patientName: 'Amit Patel',
      age: 34,
      gender: 'Male',
      type: 'Lab Report Review',
      status: 'Scheduled',
      phone: '+91 97654 32109',
      reason: 'Lipid Profile & CBC Follow-up',
      vitals: { bp: '118/76', hr: '72 bpm', temp: '98.6°F' }
    },
    {
      id: 'APT-104',
      time: '11:45 AM',
      patientName: 'Priya Verma',
      age: 29,
      gender: 'Female',
      type: 'Follow-up Visit',
      status: 'Scheduled',
      phone: '+91 99887 76655',
      reason: 'Post-viral recovery evaluation',
      vitals: { bp: '110/70', hr: '68 bpm', temp: '98.2°F' }
    },
    {
      id: 'APT-105',
      time: '12:30 PM',
      patientName: 'Srinivas Rao',
      age: 61,
      gender: 'Male',
      type: 'General Checkup',
      status: 'Scheduled',
      phone: '+91 94401 23456',
      reason: 'Joint pain & hypertension follow-up',
      vitals: { bp: '142/90', hr: '82 bpm', temp: '98.6°F' }
    },
    {
      id: 'APT-106',
      time: '02:00 PM',
      patientName: 'Kavita Reddy',
      age: 38,
      gender: 'Female',
      type: 'OP Consultation',
      status: 'Scheduled',
      phone: '+91 93902 34567',
      reason: 'Mild abdominal discomfort',
      vitals: { bp: '122/78', hr: '76 bpm', temp: '98.5°F' }
    },
    {
      id: 'APT-107',
      time: '02:45 PM',
      patientName: 'Anand Verma',
      age: 49,
      gender: 'Male',
      type: 'General Checkup',
      status: 'Scheduled',
      phone: '+91 91003 45678',
      reason: 'Annual executive health checkup',
      vitals: { bp: '126/82', hr: '70 bpm', temp: '98.6°F' }
    },
    {
      id: 'APT-108',
      time: '03:30 PM',
      patientName: 'Deepak Joshi',
      age: 56,
      gender: 'Male',
      type: 'Emergency Assessment',
      status: 'Scheduled',
      phone: '+91 98490 12345',
      reason: 'Chest tightness history follow-up',
      vitals: { bp: '138/86', hr: '84 bpm', temp: '98.7°F' }
    },
    {
      id: 'APT-109',
      time: '04:15 PM',
      patientName: 'Meena Kumari',
      age: 41,
      gender: 'Female',
      type: 'Lab Report Review',
      status: 'Scheduled',
      phone: '+91 97001 98765',
      reason: 'Thyroid T3/T4/TSH lab report review',
      vitals: { bp: '116/74', hr: '72 bpm', temp: '98.4°F' }
    },
    {
      id: 'APT-110',
      time: '05:00 PM',
      patientName: 'Rohan Gupta',
      age: 22,
      gender: 'Male',
      type: 'OP Consultation',
      status: 'Scheduled',
      phone: '+91 96543 21098',
      reason: 'Acute seasonal allergic rhinitis',
      vitals: { bp: '114/72', hr: '78 bpm', temp: '99.1°F' }
    },
    {
      id: 'APT-111',
      time: '05:30 PM',
      patientName: 'Pooja Malhotra',
      age: 33,
      gender: 'Female',
      type: 'General Checkup',
      status: 'Scheduled',
      phone: '+91 95432 10987',
      reason: 'Preventive health screening',
      vitals: { bp: '120/78', hr: '74 bpm', temp: '98.6°F' }
    },
    {
      id: 'APT-112',
      time: '06:15 PM',
      patientName: 'Vikram Singh',
      age: 47,
      gender: 'Male',
      type: 'Follow-up Visit',
      status: 'Scheduled',
      phone: '+91 94321 09876',
      reason: 'Post-medication response evaluation',
      vitals: { bp: '128/84', hr: '76 bpm', temp: '98.5°F' }
    }
  ]);

  // Total Patients List (8 Registered Assigned Patients)
  const totalPatientsList = [
    { id: 'P-01', name: 'Rajesh Sharma', age: 45, gender: 'Male', bloodGroup: 'O+', visits: 4, lastVisit: 'Today', condition: 'Hypertension' },
    { id: 'P-02', name: 'Sunita Devi', age: 52, gender: 'Female', bloodGroup: 'B+', visits: 8, lastVisit: 'Today', condition: 'Type 2 Diabetes' },
    { id: 'P-03', name: 'Ramesh Gupta', age: 58, gender: 'Male', bloodGroup: 'A+', visits: 12, lastVisit: 'Today (Emergency)', condition: 'Coronary Care' },
    { id: 'P-04', name: 'Amit Patel', age: 34, gender: 'Male', bloodGroup: 'AB+', visits: 3, lastVisit: 'Today', condition: 'Hyperlipidemia' },
    { id: 'P-05', name: 'Priya Verma', age: 29, gender: 'Female', bloodGroup: 'O-', visits: 2, lastVisit: 'Today', condition: 'Seasonal Asthmatic' },
    { id: 'P-06', name: 'Srinivas Rao', age: 61, gender: 'Male', bloodGroup: 'B+', visits: 6, lastVisit: 'Today', condition: 'Osteoarthritis' },
    { id: 'P-07', name: 'Kavita Reddy', age: 38, gender: 'Female', bloodGroup: 'A-', visits: 5, lastVisit: 'Today', condition: 'Mild Gastritis' },
    { id: 'P-08', name: 'Deepak Joshi', age: 56, gender: 'Male', bloodGroup: 'O+', visits: 9, lastVisit: 'Today', condition: 'Hypertension & Angina' }
  ];

  // Notifications List state
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Critical Alert', text: '1 Emergency patient (Ramesh Gupta) requires immediate attention in Bay 02.', time: '2m ago', urgent: true, important: true },
    { id: 2, title: 'Lab Results Ready', text: 'CBC & Lipid profile for Patient Amit Patel has been uploaded to EHR.', time: '15m ago', urgent: false, important: false },
    { id: 3, title: 'Shift Handover Sync', text: 'Dr. Anjali Kumar shift logged for ABC Hospital General Medicine OPD.', time: '1h ago', urgent: false, important: false }
  ]);

  const handleClearAllDoctorNotifs = () => {
    setNotificationsList([]);
  };

  const handleDeleteDoctorNotif = (id) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id));
  };

  const handleToggleImportantDoctorNotif = (id) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, important: !n.important } : n));
  };

  // Filtered Appointments logic
  const filteredAppointments = appointmentsList.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.time.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' ? true : apt.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Handle consultation completion
  const handleMarkConsulted = (apt) => {
    setAppointmentsList(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'Completed' } : a));
    setSelectedAppointment(null);
    setConsultCompletedAlert(`Consultation completed for ${apt.patientName}. Digital prescription synced to EHR.`);
    setTimeout(() => setConsultCompletedAlert(null), 4000);
  };

  // Handle Emergency Response
  const handleAcceptEmergency = () => {
    alert(`Emergency Accepted! Dr. Anjali Kumar assigned to Patient ${emergencyAlert.patientName} at ${emergencyAlert.location}.`);
    setShowEmergencyModal(false);
  };

  return (
    <div className="doctor-portal-wrapper">
      {/* Auto-Responsive Portal Container */}
      <div className="portal-container">
        <div className="responsive-app-ui">
          
          {/* HEADER: Dark Navy Bar */}
          <header className="dark-navy-header">
            <div className="header-left">
              <button className="nav-icon-btn" onClick={() => setShowMenuDrawer(true)} title="Open Menu">
                <Menu size={22} color="#ffffff" />
              </button>
              <div className="app-brand">
                <h1 className="app-name">Care Navigator</h1>
                <span className="gov-tag">HEALTH EMERGENCY SYSTEM</span>
              </div>
            </div>

            {/* TOP HEADER DASHBOARD NAVIGATION OPTIONS */}
            <nav className="header-nav-tabs">
              <button
                className={`header-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
                title="Home Dashboard"
              >
                <Stethoscope size={18} />
                <span>Home</span>
              </button>

              <button
                className={`header-nav-tab ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
                title="Patient Register"
              >
                <Users size={18} />
                <span>Patients</span>
              </button>

              <button
                className={`header-nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
                title="Shift Schedule"
              >
                <div className="header-tab-icon-wrap">
                  <Calendar size={18} />
                  <span className="header-tab-badge">{stats.todayAppointments}</span>
                </div>
                <span>Schedule</span>
              </button>

              <button
                className={`header-nav-tab ${activeTab === 'records' ? 'active' : ''}`}
                onClick={() => setActiveTab('records')}
                title="EHR Records"
              >
                <FileText size={18} />
                <span>Records</span>
              </button>

              <button
                className={`header-nav-tab ${activeTab === 'more' ? 'active' : ''}`}
                onClick={() => setActiveTab('more')}
                title="More Options"
              >
                <MoreHorizontal size={18} />
                <span>More</span>
              </button>
            </nav>

            <div className="header-right">
              <button className="nav-icon-btn notif-btn" onClick={() => setShowNotifModal(true)} title="Notifications">
                <Bell size={20} color="#ffffff" />
                <span className="notif-badge-dot" />
              </button>
            </div>
          </header>

          {/* Toast Notification Alert */}
          {consultCompletedAlert && (
            <div className="toast-alert fade-in">
              <CheckCircle2 size={18} color="#16a34a" />
              <span>{consultCompletedAlert}</span>
            </div>
          )}

          {/* SCROLLABLE BODY CONTENT */}
          <div className="app-scroll-body">
            
            {/* HOME TAB CONTENT */}
            {activeTab === 'home' && (
              <div className="tab-pane fade-in">

                {/* PROFILE SECTION CARD */}
                <div className="profile-section-card fade-in hover-lift">
                  <div className="doctor-photo-wrap">
                    <img
                      src="/doctor_anjali_kumar.jpg"
                      alt="Dr. Anjali Kumar"
                      className="doctor-photo"
                      onError={(e) => {
                        // Fallback avatar if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="doctor-photo-fallback" style={{ display: 'none' }}>
                      <User size={32} color="#1e3a8a" />
                    </div>
                  </div>

                  <div className="doctor-details">
                    <h2 className="doctor-name">{doctorInfo.name}</h2>
                    <p className="doctor-specialty">{doctorInfo.specialty}</p>
                    <p className="doctor-hospital">{doctorInfo.hospital}</p>

                    <div className="status-and-action-row">
                      {/* Green Available Status Badge */}
                      <button
                        className={`status-pill ${isAvailable ? 'available' : 'busy'}`}
                        onClick={() => setIsAvailable(!isAvailable)}
                        title="Click to toggle availability status"
                      >
                        <span className="status-dot" />
                        <span className="status-text">{isAvailable ? 'Available' : 'Busy / On Break'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* STATS SECTION */}
                <div className="stats-section">
                  <div className="stat-card fade-in stagger-1 hover-lift" onClick={() => setActiveTab('schedule')}>
                    <div className="stat-icon-box navy-box float-animation">
                      <Calendar size={22} color="#1e3a8a" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Today’s Appointments</span>
                      <span className="stat-value">{stats.todayAppointments}</span>
                    </div>
                  </div>

                  <div className="stat-card fade-in stagger-2 hover-lift" onClick={() => setActiveTab('patients')}>
                    <div className="stat-icon-box green-box float-animation">
                      <Users size={22} color="#16a34a" />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Patients</span>
                      <span className="stat-value">0{stats.totalPatients}</span>
                    </div>
                  </div>
                </div>

                {/* EMERGENCY ALERT CARD */}
                {emergencyAlert && (
                  <div className="emergency-alert-card fade-in stagger-3 hover-lift">
                    <div className="emergency-alert-header">
                      <div className="alert-badge-group">
                        <span className="alert-pulse-icon">
                          <AlertTriangle size={18} color="#dc2626" />
                        </span>
                        <span className="alert-title-text">EMERGENCY ALERT</span>
                      </div>
                      <span className="alert-time">{emergencyAlert.time}</span>
                    </div>

                    <div className="emergency-alert-body">
                      <h3 className="emergency-text">{emergencyAlert.count} patient requires attention</h3>
                      <p className="emergency-subtext">
                        Patient: <strong>{emergencyAlert.patientName}</strong> ({emergencyAlert.gender}, {emergencyAlert.age} yrs) • {emergencyAlert.condition}
                      </p>
                    </div>

                    <div className="emergency-alert-footer">
                      <button className="view-details-btn" onClick={() => setShowEmergencyModal(true)}>
                        <span>View Details</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* TODAY'S APPOINTMENTS SECTION */}
                <div className="appointments-section">
                  <div className="section-header-row">
                    <h3 className="section-title">Today’s Appointments</h3>
                    <span className="count-pill">{filteredAppointments.length} Total</span>
                  </div>

                  {/* Appointments Filter Bar */}
                  <div className="filter-search-row">
                    <div className="search-box">
                      <Search size={15} color="#64748b" />
                      <input
                        type="text"
                        placeholder="Search patient name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                      {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <select
                      className="filter-dropdown"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="All">All Types</option>
                      <option value="OP Consultation">OP Consultation</option>
                      <option value="General Checkup">General Checkup</option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>

                  {/* Appointments List */}
                  <div className="appointments-list">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <div key={apt.id} className={`appointment-card hover-lift fade-in ${apt.status === 'Completed' ? 'completed-card' : ''}`}>
                          <div className="apt-time-badge">
                            <Clock size={14} color="#1e3a8a" />
                            <span>{apt.time}</span>
                          </div>

                          <div className="apt-patient-info">
                            <h4 className="patient-name">{apt.patientName}</h4>
                            <div className="consultation-type-row">
                              <span className="type-tag">{apt.type}</span>
                              <span className="apt-demographics">{apt.gender}, {apt.age} yrs</span>
                            </div>
                          </div>

                          <div className="apt-action-col">
                            {apt.status === 'Completed' ? (
                              <span className="done-badge">
                                <Check size={14} /> Done
                              </span>
                            ) : (
                              <button className="view-btn" onClick={() => setSelectedAppointment(apt)}>
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <Calendar size={32} color="#94a3b8" />
                        <p>No appointments match your filter.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* PATIENTS TAB CONTENT */}
            {activeTab === 'patients' && (
              <div className="tab-pane fade-in">
                <div className="pane-header">
                  <h2>Total Assigned Patients ({totalPatientsList.length})</h2>
                  <p>Registered Patients under General Physician Desk</p>
                </div>

                <div className="patients-grid">
                  {totalPatientsList.map((p) => (
                    <div key={p.id} className="patient-tile-card hover-lift fade-in" onClick={() => setSelectedPatient(p)}>
                      <div className="tile-top">
                        <div className="p-avatar">
                          <User size={20} color="#1e3a8a" />
                        </div>
                        <div>
                          <h4 className="p-tile-name">{p.name}</h4>
                          <span className="p-tile-sub">{p.gender}, {p.age} yrs • Blood: <strong>{p.bloodGroup}</strong></span>
                        </div>
                        <span className="id-badge">{p.id}</span>
                      </div>

                      <div className="tile-body">
                        <div className="tile-metric">
                          <span className="lbl">Active Condition</span>
                          <span className="val">{p.condition}</span>
                        </div>
                        <div className="tile-metric">
                          <span className="lbl">Total Visits</span>
                          <span className="val">{p.visits} Visits</span>
                        </div>
                      </div>

                      <div className="tile-footer">
                        <button className="btn-tile-view">View EHR Records</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCHEDULE TAB CONTENT */}
            {activeTab === 'schedule' && (
              <div className="tab-pane fade-in">
                <div className="pane-header">
                  <h2>Today's OPD Doctor Schedule</h2>
                  <p>ABC Hospital • General Medicine OPD Block A (09:00 AM - 05:00 PM)</p>
                </div>

                <div className="schedule-timeline">
                  {appointmentsList.map((apt, idx) => (
                    <div key={apt.id} className="timeline-item fade-in">
                      <div className="time-col">
                        <span className="time-text">{apt.time}</span>
                        <div className="timeline-line" />
                      </div>

                      <div className="timeline-card hover-lift">
                        <div className="t-card-header">
                          <span className="t-token">Slot #{idx + 1}</span>
                          <span className={`t-status ${apt.status === 'Completed' ? 'status-done' : 'status-pending'}`}>
                            {apt.status}
                          </span>
                        </div>
                        <h4 className="t-patient">{apt.patientName}</h4>
                        <p className="t-reason">Reason: {apt.reason}</p>
                        <p className="t-vitals">Vitals: BP {apt.vitals.bp} | Temp {apt.vitals.temp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECORDS TAB CONTENT */}
            {activeTab === 'records' && (
              <div className="tab-pane fade-in">
                <div className="pane-header">
                  <h2>EHR Health Vault & Prescriptions</h2>
                  <p>Ayushman Bharat Digital Health Records Log</p>
                </div>

                <div className="records-list">
                  <div className="record-card hover-lift fade-in">
                    <div className="rec-icon">
                      <FileText size={24} color="#1e3a8a" />
                    </div>
                    <div className="rec-details">
                      <h4>Digital Prescription #RX-8842</h4>
                      <p>Issued to: <strong>Rajesh Sharma</strong> • Diagnosis: Acute Upper Respiratory Infection</p>
                      <span className="rec-date">Today, 09:45 AM</span>
                    </div>
                  </div>

                  <div className="record-card hover-lift fade-in stagger-1">
                    <div className="rec-icon">
                      <FileSpreadsheet size={24} color="#16a34a" />
                    </div>
                    <div className="rec-details">
                      <h4>Lab Diagnostic Report #LAB-1029</h4>
                      <p>Patient: <strong>Amit Patel</strong> • Complete Blood Count & Lipid Profile</p>
                      <span className="rec-date">Today, 08:30 AM</span>
                    </div>
                  </div>

                  <div className="record-card hover-lift fade-in stagger-2">
                    <div className="rec-icon">
                      <ShieldAlert size={24} color="#dc2626" />
                    </div>
                    <div className="rec-details">
                      <h4>Emergency Triage Assessment Log</h4>
                      <p>Patient: <strong>Ramesh Gupta</strong> • Suspected Acute Coronary Syndrome</p>
                      <span className="rec-date">Today, 10:20 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MORE TAB CONTENT */}
            {activeTab === 'more' && (
              <div className="tab-pane fade-in">
                <div className="pane-header">
                  <h2>Portal Settings & Emergency Desk</h2>
                  <p>Government Healthcare Administration & Support</p>
                </div>

                <div className="more-menu-list">
                  <div className="more-item hover-lift fade-in" onClick={() => setShowProfileModal(true)}>
                    <User size={20} color="#1e3a8a" />
                    <div className="more-text">
                      <h4>Doctor Official Profile</h4>
                      <p>View Registration, Hospital Designation & Shift Log</p>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>

                  <div className="more-item hover-lift fade-in stagger-1" onClick={() => setShowEmergencyModal(true)}>
                    <AlertTriangle size={20} color="#dc2626" />
                    <div className="more-text">
                      <h4>Emergency Triage Center</h4>
                      <p>View Active Ambulance Alerts & Red Priority Requests</p>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>

                  <div className="more-item hover-lift fade-in stagger-2" onClick={() => alert('Emergency National Helpline Dialing: 108 / 104')}>
                    <Phone size={20} color="#16a34a" />
                    <div className="more-text">
                      <h4>National Health Emergency Helpline</h4>
                      <p>Direct Dial 108 Ambulance Dispatch & 104 Health Helpline</p>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}

      {/* 1. VIEW PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content glass-modal profile-modal-responsive fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="modal-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} color="#1e3a8a" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Government Doctor Profile Details</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Official Medical Council License & Department Information</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="close-btn logout-header-btn"
                  onClick={() => {
                    setShowProfileModal(false);
                    logout();
                  }}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Logout Doctor Session"
                >
                  <LogOut size={16} />
                </button>
                <button 
                  className="close-btn" 
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    transition: 'all 0.2s ease'
                  }}
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '24px 28px' }}>
              <div className="profile-modal-head">
                <img src="/doctor_anjali_kumar.jpg" alt={doctorInfo.name} className="modal-doc-photo" />
                <div>
                  <div className="doc-name-edit-row">
                    <h3 className="doc-h3">{doctorInfo.name}</h3>
                    <button
                      className="edit-icon-btn-sm"
                      onClick={() => {
                        setTempDoctorName(doctorInfo.name);
                        setTempSpecialty(doctorInfo.specialty);
                        setTempHospital(doctorInfo.hospital);
                        setIsEditingDoctor(true);
                      }}
                      title="Edit Doctor's Name"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <span className="specialty-badge">{doctorInfo.specialty}</span>
                  <p className="modal-hosp-name">{doctorInfo.hospital}</p>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="lbl">Medical Council Registration</span>
                  <span className="val mono">{doctorInfo.licenseNo}</span>
                </div>
                <div className="info-item">
                  <span className="lbl">Hospital Department</span>
                  <span className="val">{doctorInfo.department}</span>
                </div>
                <div className="info-item">
                  <span className="lbl">OPD Room Location</span>
                  <span className="val">{doctorInfo.opdRoom}</span>
                </div>
                <div className="info-item">
                  <span className="lbl">Duty Shift Hours</span>
                  <span className="val">{doctorInfo.shiftHours}</span>
                </div>
                <div className="info-item">
                  <span className="lbl">Clinical Qualifications</span>
                  <span className="val">{doctorInfo.qualifications}</span>
                </div>
                <div className="info-item">
                  <span className="lbl">Clinical Experience</span>
                  <span className="val">{doctorInfo.experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1B. EDIT DOCTOR NAME & PROFILE MODAL */}
      {isEditingDoctor && (
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={() => setIsEditingDoctor(false)}>
          <div className="modal-content glass-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Edit2 size={20} color="#1e3a8a" />
                <h3>Edit Doctor Name & Profile Details</h3>
              </div>
              <button className="close-btn" onClick={() => setIsEditingDoctor(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDoctorName} className="modal-body">
              <label className="form-lbl">Doctor's Full Name</label>
              <input
                type="text"
                className="form-txt-input"
                value={tempDoctorName}
                onChange={(e) => setTempDoctorName(e.target.value)}
                placeholder="e.g. Dr. Anjali Kumar"
                required
              />

              <label className="form-lbl">Specialty</label>
              <input
                type="text"
                className="form-txt-input"
                value={tempSpecialty}
                onChange={(e) => setTempSpecialty(e.target.value)}
                placeholder="e.g. General Physician"
                required
              />

              <label className="form-lbl">Hospital Name</label>
              <input
                type="text"
                className="form-txt-input"
                value={tempHospital}
                onChange={(e) => setTempHospital(e.target.value)}
                placeholder="e.g. ABC Hospital"
                required
              />

              <div className="modal-footer" style={{ padding: '12px 0 0 0', marginTop: '8px' }}>
                <button type="button" className="btn-close-modal" onClick={() => setIsEditingDoctor(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  <Save size={16} />
                  <span>Save Name & Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EMERGENCY ALERT DETAILS MODAL */}
      {showEmergencyModal && (
        <div className="modal-overlay alert-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content alert-modal-content fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="alert-modal-header">
              <div className="alert-header-left">
                <ShieldAlert size={24} color="#ffffff" />
                <div>
                  <h3>CRITICAL EMERGENCY TRIAGE DETAILS</h3>
                  <p>Bay 02 Ambulance Triage Alert</p>
                </div>
              </div>
              <button className="close-alert-btn" onClick={() => setShowEmergencyModal(false)}>
                <X size={20} color="#ffffff" />
              </button>
            </div>

            <div className="modal-body">
              <div className="patient-crit-card">
                <div className="crit-top">
                  <span className="crit-badge">LEVEL 1 RED EMERGENCY</span>
                  <span className="eta-badge">AMBULANCE ETA: {emergencyAlert.ambulanceEta}</span>
                </div>
                <h2>{emergencyAlert.patientName} ({emergencyAlert.gender}, {emergencyAlert.age} yrs)</h2>
                <p className="crit-condition"><strong>Chief Complaint:</strong> {emergencyAlert.condition}</p>
                <p className="crit-loc"><MapPin size={14} /> Location: {emergencyAlert.location}</p>
              </div>

              <div className="vitals-matrix">
                <h4>LIVE TELEMETRY VITALS</h4>
                <div className="vitals-row">
                  <div className="vital-box red-vital">
                    <span className="lbl">OXYGEN SpO2</span>
                    <span className="val">{emergencyAlert.vitals.spo2}</span>
                    <span className="sub">CRITICAL LOW</span>
                  </div>
                  <div className="vital-box red-vital">
                    <span className="lbl">BLOOD PRESSURE</span>
                    <span className="val">{emergencyAlert.vitals.bp}</span>
                    <span className="sub">HYPERTENSIVE</span>
                  </div>
                  <div className="vital-box">
                    <span className="lbl">HEART RATE</span>
                    <span className="val">{emergencyAlert.vitals.hr}</span>
                    <span className="sub">TACHYCARDIA</span>
                  </div>
                  <div className="vital-box">
                    <span className="lbl">TEMP</span>
                    <span className="val">{emergencyAlert.vitals.temp}</span>
                    <span className="sub">NORMAL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert-modal-footer">
              <button className="btn-cancel-alert" onClick={() => setShowEmergencyModal(false)}>
                Dismiss
              </button>
              <button className="btn-accept-emergency" onClick={handleAcceptEmergency}>
                <Zap size={18} />
                <span>Accept & Assign Doctor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PATIENT APPOINTMENT DETAIL MODAL */}
      {selectedAppointment && (
        <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="modal-content glass-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <User size={20} color="#1e3a8a" />
                <h3>Appointment Details</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedAppointment(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="apt-modal-summary">
                <div className="summary-left">
                  <h2>{selectedAppointment.patientName}</h2>
                  <p>{selectedAppointment.gender}, {selectedAppointment.age} yrs • Phone: <strong>{selectedAppointment.phone}</strong></p>
                </div>
                <span className="time-highlight">{selectedAppointment.time}</span>
              </div>

              <div className="vitals-mini-card">
                <h4>Check-in Vitals</h4>
                <p>BP: <strong>{selectedAppointment.vitals.bp} mmHg</strong> • Pulse: <strong>{selectedAppointment.vitals.hr}</strong> • Temp: <strong>{selectedAppointment.vitals.temp}</strong></p>
                <p style={{ marginTop: '6px' }}><strong>Reason for Visit:</strong> {selectedAppointment.reason}</p>
              </div>

              <div className="rx-issue-section">
                <h4>Issue Digital Prescription</h4>
                <label className="form-lbl">Diagnosis / Clinical Findings</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Gastritis / Viral Fever"
                  className="form-txt-input"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                />

                <label className="form-lbl">Prescribed Medicines & Dosage</label>
                <textarea
                  placeholder="e.g. Paracetamol 650mg TDS x 3 days&#10;Cetirizine 10mg HS x 5 days"
                  className="form-textarea"
                  rows={3}
                  value={rxMedicines}
                  onChange={(e) => setRxMedicines(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setSelectedAppointment(null)}>
                Cancel
              </button>
              <button className="btn-primary-action" onClick={() => handleMarkConsulted(selectedAppointment)}>
                <CheckCircle2 size={16} />
                <span>Complete Visit & Issue Rx</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PATIENT TILE RECORD MODAL */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content glass-modal fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <User size={20} color="#16a34a" />
                <h3>Patient EHR File</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedPatient(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h2>{selectedPatient.name}</h2>
              <p>ID: <strong>{selectedPatient.id}</strong> • Blood Group: <strong>{selectedPatient.bloodGroup}</strong></p>
              <p>Demographics: {selectedPatient.gender}, {selectedPatient.age} yrs</p>
              <p>Primary Diagnosis: <strong>{selectedPatient.condition}</strong></p>
              <p>Total OPD Visits: <strong>{selectedPatient.visits}</strong></p>
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setSelectedPatient(null)}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MENU DRAWER MODAL */}
      {showMenuDrawer && (
        <div className="drawer-overlay" onClick={() => setShowMenuDrawer(false)}>
          <div className="drawer-panel fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Portal Options</h3>
              <button className="close-btn" onClick={() => setShowMenuDrawer(false)}>
                <X size={20} color="#0f172a" />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-doc-box">
                <img src="/doctor_anjali_kumar.jpg" alt="Doctor" className="drawer-doc-img" />
                <div>
                  <h4>Dr. Anjali Kumar</h4>
                  <p>General Physician • ABC Hospital</p>
                </div>
              </div>

              <div className="drawer-menu-links">
                <button className="drawer-link" onClick={() => { setShowProfileModal(true); setShowMenuDrawer(false); }}>
                  <User size={18} /> View Official Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. NOTIFICATIONS MODAL */}
      {showNotifModal && (
        <div className="modal-overlay" onClick={() => setShowNotifModal(false)}>
          <div className="modal-content glass-modal notif-modal-responsive fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div className="modal-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={22} color="#1e3a8a" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Doctor Notifications</h3>
                    {notificationsList.length > 0 && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                        {notificationsList.length} Active
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Real-time triage alerts & clinical updates</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Clear All Button with Icon */}
                <button
                  onClick={handleClearAllDoctorNotifs}
                  disabled={notificationsList.length === 0}
                  style={{
                    background: notificationsList.length === 0 ? '#f1f5f9' : '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: notificationsList.length === 0 ? '#94a3b8' : '#dc2626',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: notificationsList.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Clear All Notifications"
                >
                  <Trash2 size={16} />
                  <span>Clear All</span>
                </button>

                {/* Explicit Close (X) button for Desktop & Laptops */}
                <button 
                  className="close-btn" 
                  onClick={() => setShowNotifModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    transition: 'all 0.2s ease'
                  }}
                  title="Close Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '24px' }}>
              {notificationsList.length > 0 ? (
                <div className="notif-list" style={{ gap: '14px' }}>
                  {notificationsList.map(n => (
                    <NotificationSwipeItem
                      key={n.id}
                      notification={n}
                      onDelete={handleDeleteDoctorNotif}
                      onToggleImportant={handleToggleImportantDoctorNotif}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                  <CheckCircle2 size={52} color="#10b981" style={{ marginBottom: '12px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>All Clear!</h4>
                  <p style={{ margin: 0, fontSize: '0.92rem' }}>No active notifications found. You are all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLESHEET */}
      <style>{`
        /* Master Layout Container */
        .doctor-portal-wrapper {
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
        }

        /* 100% Full Screen Edge-to-Edge Container */
        .portal-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
          width: 100%;
          max-width: 100%;
          margin: 0;
          min-height: 100vh;
        }

        /* Full Screen Responsive App UI */
        .responsive-app-ui {
          width: 100%;
          background: #ffffff;
          border-radius: 0;
          box-shadow: none;
          border: none;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          flex: 1;
          position: relative;
        }

        /* Primary Blue Medical Header Bar */
        .dark-navy-header {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          height: 68px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          width: 100%;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.2);
        }

        /* Header Dashboard Navigation Options Tabs */
        .header-nav-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.14);
          padding: 4px 8px;
          border-radius: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
        }

        .header-nav-tab {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          padding: 7px 15px;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .header-nav-tab:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
        }

        .header-nav-tab.active {
          background: #ffffff;
          color: #0284c7;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
        }

        .header-tab-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .header-tab-badge {
          position: absolute;
          top: -8px;
          right: -10px;
          background: #1e3a8a;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          border-radius: 10px;
          padding: 1px 5px;
          min-width: 16px;
          text-align: center;
          border: 1.5px solid #ffffff;
          line-height: 1.2;
        }

        .header-nav-tab.active .header-tab-badge {
          background: #ef4444;
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .header-nav-tab span {
            display: none;
          }
          .header-nav-tab {
            padding: 8px 10px;
          }
        }

        @media (max-width: 640px) {
          .header-nav-tabs {
            gap: 4px;
            padding: 3px 6px;
          }
          .header-nav-tab {
            padding: 6px 8px;
          }
          .header-nav-tab span {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .dark-navy-header {
            height: 60px;
            padding: 0 16px;
          }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-icon-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .nav-icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .app-brand {
          display: flex;
          flex-direction: column;
        }

        .app-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .gov-tag {
          font-size: 0.62rem;
          color: #93c5fd;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .notif-btn {
          position: relative;
        }

        .notif-badge-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #dc2626;
          border-radius: 50%;
          border: 1.5px solid #0284c7;
        }

        /* Toast Alert */
        .toast-alert {
          background: #dcfce7;
          border: 1px solid #86efac;
          color: #15803d;
          padding: 10px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* App Scroll Body */
        .app-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px 36px;
          background: #f8fafc;
          width: 100%;
        }

        @media (max-width: 768px) {
          .app-scroll-body {
            padding: 16px 12px;
          }
        }

        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Doctor Profile Card */
        .profile-section-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
        }

        .doctor-photo-wrap {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #1e3a8a;
          flex-shrink: 0;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doctor-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doctor-photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dbeafe;
        }

        .doctor-details {
          flex: 1;
        }

        .doctor-name {
          font-size: 1.12rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0 0 2px 0;
        }

        .doctor-specialty {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0 0 2px 0;
        }

        .doctor-hospital {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0 0 10px 0;
        }

        .status-and-action-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .status-pill.available {
          background: #dcfce7;
          color: #16a34a;
          border: 1px solid #86efac;
        }

        .status-pill.busy {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fcd34d;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .view-profile-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #0b192c;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-profile-btn:hover {
          background: #e2e8f0;
        }

        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
        }

        .stat-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .navy-box { background: #dbeafe; }
        .green-box { background: #dcfce7; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          line-height: 1.2;
        }

        .stat-value {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0b192c;
        }

        /* Light Emergency Alert Card */
        .emergency-alert-card {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.12);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .emergency-alert-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .alert-badge-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .alert-title-text {
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #dc2626;
        }

        .alert-time {
          font-size: 0.7rem;
          color: #991b1b;
          font-weight: 600;
          opacity: 0.8;
        }

        .emergency-text {
          font-size: 1.05rem;
          font-weight: 800;
          color: #7f1d1d;
          margin: 0 0 2px 0;
        }

        .emergency-subtext {
          font-size: 0.78rem;
          color: #991b1b;
          line-height: 1.3;
        }

        .emergency-alert-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .view-details-btn {
          background: #ffffff;
          color: #dc2626;
          border: 1px solid #fca5a5;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.1);
          transition: all 0.2s ease;
        }

        .view-details-btn:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
        }

        /* Appointments Section */
        .appointments-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0;
        }

        .count-pill {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }

        /* Filter Search Row */
        .filter-search-row {
          display: flex;
          gap: 8px;
        }

        .search-box {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .search-input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 0.8rem;
          color: #0f172a;
          height: 34px;
        }

        .clear-search {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .filter-dropdown {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f172a;
          padding: 0 8px;
          outline: none;
        }

        /* Appointments List */
        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .appointment-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: background 0.15s ease;
        }

        .appointment-card:hover {
          background: #f8fafc;
        }

        .appointment-card.completed-card {
          opacity: 0.7;
          background: #f8fafc;
        }

        .apt-time-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #dbeafe;
          color: #1e3a8a;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .apt-patient-info {
          flex: 1;
        }

        .patient-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0 0 2px 0;
        }

        .consultation-type-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .type-tag {
          font-size: 0.7rem;
          font-weight: 700;
          color: #1e3a8a;
        }

        .apt-demographics {
          font-size: 0.7rem;
          color: #64748b;
        }

        .view-btn {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .view-btn:hover {
          background: #1e40af;
        }

        .done-badge {
          color: #16a34a;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        /* Bottom Navigation Bar */
        .bottom-navigation-bar {
          height: 62px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 4px;
        }

        .nav-tab-item {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          flex: 1;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .nav-tab-item:hover {
          color: #0284c7;
        }

        .nav-tab-item.active {
          color: #0284c7;
          font-weight: 800;
          transform: translateY(-2px);
        }

        .nav-tab-item.active .tab-icon-wrap {
          transform: scale(1.15);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-tab-item.active::after {
          content: '';
          position: absolute;
          bottom: 2px;
          width: 16px;
          height: 3px;
          background: #0284c7;
          border-radius: 99px;
          animation: fadeInScale 0.25s ease-out;
        }

        .tab-icon-wrap {
          position: relative;
        }

        .tab-badge-num {
          position: absolute;
          top: -4px;
          right: -8px;
          background: #1e3a8a;
          color: #ffffff;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 1px 4px;
          border-radius: 999px;
        }

        .tab-text {
          font-size: 0.68rem;
          font-weight: 700;
        }

        /* Modals & Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 132, 199, 0.15);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .glass-modal {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .modal-header {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-title-wrap h3 {
          font-size: 1rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0;
        }

        .close-btn {
          background: #f1f5f9;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .profile-modal-head {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .modal-doc-photo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #1e3a8a;
        }

        .doc-h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }

        .specialty-badge {
          background: #dbeafe;
          color: #1e3a8a;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .modal-hosp-name {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 4px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .info-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
        }

        .info-item .lbl {
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 700;
        }

        .info-item .val {
          font-size: 0.82rem;
          font-weight: 800;
          color: #0b192c;
          margin-top: 2px;
        }

        .doc-name-edit-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-icon-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #1e3a8a;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-icon-btn:hover {
          background: #dbeafe;
          border-color: #1e3a8a;
        }

        .edit-icon-btn-sm {
          background: rgba(2, 132, 199, 0.1);
          border: 1px solid rgba(2, 132, 199, 0.3);
          color: #0284c7;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-footer {
          padding: 14px 18px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          background: #ffffff;
        }

        .modal-footer-between {
          justify-content: space-between;
          width: 100%;
        }

        .footer-right-btns {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-logout-modal {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-logout-modal:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #b91c1c;
        }

        .btn-edit-modal {
          background: #dbeafe;
          border: 1px solid #93c5fd;
          color: #1e3a8a;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-edit-modal:hover {
          background: #bfdbfe;
        }

        .btn-close-modal {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-primary-action {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Emergency Alert Modal specific */
        .alert-modal-content {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          box-shadow: 0 24px 48px rgba(220, 38, 38, 0.3);
        }

        .alert-modal-header {
          background: #dc2626;
          color: #ffffff;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .alert-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .alert-header-left h3 {
          font-size: 0.95rem;
          font-weight: 900;
          margin: 0;
        }

        .alert-header-left p {
          font-size: 0.72rem;
          color: #fee2e2;
          margin: 0;
        }

        .close-alert-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .patient-crit-card {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          padding: 14px;
        }

        .crit-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .crit-badge {
          background: #dc2626;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .eta-badge {
          background: #991b1b;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .crit-condition {
          font-size: 0.85rem;
          color: #7f1d1d;
          margin: 6px 0;
        }

        .crit-loc {
          font-size: 0.78rem;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0;
        }

        .vitals-matrix {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vitals-matrix h4 {
          font-size: 0.78rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0;
        }

        .vitals-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .vital-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .vital-box.red-vital {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .vital-box .lbl {
          font-size: 0.6rem;
          font-weight: 800;
          color: #64748b;
        }

        .vital-box .val {
          font-size: 0.9rem;
          font-weight: 900;
          color: #0b192c;
          margin: 2px 0;
        }

        .vital-box .sub {
          font-size: 0.58rem;
          font-weight: 800;
          color: #dc2626;
        }

        .alert-modal-footer {
          padding: 12px 16px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-cancel-alert {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-accept-emergency {
          background: #dc2626;
          color: #ffffff;
          border: none;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Drawer Overlay */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 132, 199, 0.15);
          backdrop-filter: blur(4px);
          z-index: 1100;
          display: flex;
        }

        .drawer-panel {
          width: 300px;
          background: #ffffff;
          color: #0f172a;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0,0,0,0.08);
          border-right: 1px solid #e2e8f0;
        }

        .drawer-header {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #0f172a;
        }

        .drawer-header h3 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
        }

        .drawer-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .drawer-doc-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 12px;
        }

        .drawer-doc-img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }

        .drawer-doc-box h4 {
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
        }

        .drawer-doc-box p {
          font-size: 0.72rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .drawer-menu-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .drawer-link {
          background: none;
          border: none;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .drawer-link:hover {
          background: #e0f2fe;
          color: #0284c7;
        }

        /* Patients Grid Layout */
        .patients-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .patient-tile-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .patient-tile-card:hover {
          border-color: #1e3a8a;
        }

        .tile-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .p-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .p-tile-name {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0;
        }

        .p-tile-sub {
          font-size: 0.72rem;
          color: #64748b;
        }

        .id-badge {
          margin-left: auto;
          background: #f1f5f9;
          font-size: 0.68rem;
          font-weight: 800;
          color: #475569;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tile-body {
          display: flex;
          gap: 16px;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .tile-metric {
          display: flex;
          flex-direction: column;
        }

        .tile-metric .lbl {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 700;
        }

        .tile-metric .val {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0b192c;
        }

        .btn-tile-view {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #1e3a8a;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          width: 100%;
          cursor: pointer;
        }

        /* Timeline */
        .schedule-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
        }

        .time-col {
          width: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .time-text {
          font-size: 0.75rem;
          font-weight: 800;
          color: #1e3a8a;
        }

        .timeline-line {
          flex: 1;
          width: 2px;
          background: #cbd5e1;
          margin-top: 4px;
        }

        .timeline-card {
          flex: 1;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
        }

        .t-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .t-token {
          font-size: 0.68rem;
          font-weight: 800;
          color: #64748b;
        }

        .t-status {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .status-done { background: #dcfce7; color: #16a34a; }
        .status-pending { background: #dbeafe; color: #1e3a8a; }

        .t-patient {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0b192c;
          margin: 0 0 2px 0;
        }

        .t-reason, .t-vitals {
          font-size: 0.75rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        /* Records Tab */
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .record-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .rec-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rec-details h4 {
          font-size: 0.88rem;
          font-weight: 800;
          margin: 0 0 2px 0;
        }

        .rec-details p {
          font-size: 0.78rem;
          color: #475569;
          margin: 0 0 4px 0;
        }

        .rec-date {
          font-size: 0.68rem;
          color: #94a3b8;
        }

        /* More Menu */
        .more-menu-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .more-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .more-text {
          flex: 1;
        }

        .more-text h4 {
          font-size: 0.88rem;
          font-weight: 800;
          margin: 0 0 2px 0;
        }

        .more-text p {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
        }

        /* Form Inputs inside Modal */
        .form-lbl {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
        }

        .form-txt-input, .form-textarea {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.82rem;
          outline: none;
          color: #0f172a;
        }

        .rx-issue-section {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .apt-modal-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #dbeafe;
          padding: 12px;
          border-radius: 12px;
        }

        .summary-left h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0;
        }

        .summary-left p {
          font-size: 0.75rem;
          color: #475569;
          margin: 2px 0 0 0;
        }

        .time-highlight {
          background: #1e3a8a;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .vitals-mini-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
          font-size: 0.78rem;
        }

        .vitals-mini-card h4 {
          font-size: 0.8rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }

        /* Responsive Profile Modal Styles */
        .profile-modal-responsive {
          width: 92% !important;
          max-width: 820px !important;
          border-radius: 20px !important;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
          background: #ffffff !important;
          max-height: 88vh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .profile-modal-responsive .modal-body {
          padding: 24px 28px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          max-height: calc(88vh - 120px) !important;
          overflow-y: auto !important;
        }

        .profile-modal-responsive .profile-modal-head {
          padding: 16px 20px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 16px;
          gap: 20px;
        }

        .profile-modal-responsive .modal-doc-photo {
          width: 80px;
          height: 80px;
          border: 3px solid #0284c7;
        }

        .profile-modal-responsive .doc-h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
        }

        .profile-modal-responsive .specialty-badge {
          font-size: 0.82rem;
          padding: 4px 12px;
        }

        .profile-modal-responsive .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .profile-modal-responsive .info-item {
          padding: 14px 16px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .profile-modal-responsive .info-item:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .profile-modal-responsive .info-item .lbl {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .profile-modal-responsive .info-item .val {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .profile-modal-responsive {
            width: 95vw !important;
            max-width: 100% !important;
            margin: 8px !important;
            border-radius: 16px !important;
            max-height: 92vh !important;
          }

          .profile-modal-responsive .modal-header {
            padding: 14px 16px !important;
          }

          .profile-modal-responsive .modal-body {
            padding: 16px 14px !important;
            gap: 14px !important;
          }

          .profile-modal-responsive .info-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .profile-modal-responsive .profile-modal-head {
            padding: 12px;
            gap: 12px;
          }

          .profile-modal-responsive .modal-doc-photo {
            width: 60px;
            height: 60px;
          }

          .profile-modal-responsive .doc-h3 {
            font-size: 1.1rem;
          }
        }

        /* Notifications Modal Responsive Styles */
        .notif-modal-responsive {
          width: 92% !important;
          max-width: 820px !important;
          border-radius: 20px !important;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
          background: #ffffff !important;
          max-height: 88vh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .notif-modal-responsive .modal-body {
          max-height: calc(88vh - 150px) !important;
          overflow-y: auto !important;
        }

        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .notif-modal-responsive {
            width: 95vw !important;
            max-width: 100% !important;
            margin: 8px !important;
            border-radius: 16px !important;
            max-height: 92vh !important;
          }

          .notif-modal-responsive .modal-header {
            padding: 14px 16px !important;
          }

          .notif-modal-responsive .modal-body {
            padding: 14px 12px !important;
            max-height: calc(92vh - 130px) !important;
          }

          .notif-modal-responsive .modal-footer {
            padding: 12px 14px !important;
          }
        }

        .notif-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
        }

        .notif-item.urgent-notif {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .notif-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 2px;
        }

        .notif-time {
          font-size: 0.68rem;
          color: #64748b;
        }

        .notif-txt {
          font-size: 0.75rem;
          color: #334155;
          margin: 0;
        }

        .empty-state {
          text-align: center;
          padding: 24px;
          color: #64748b;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};
