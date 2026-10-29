import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { adminService } from '../services/adminService';
import {
  LayoutDashboard,
  Users,
  Building2,
  Stethoscope,
  CalendarCheck,
  Siren,
  Bot,
  Bell,
  FileBarChart2,
  History,
  Settings,
  Search,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  MapPin,
  RefreshCw,
  LogOut,
  Database,
  Save,
  Check,
  ShieldCheck,
  Activity,
  Bed,
  Ambulance,
  Radio,
  UserX,
  Sliders,
  Send,
  Lock,
  Menu,
  RotateCcw
} from 'lucide-react';
import { AdminLockGate } from '../components/AdminLockGate';

export const AdminDashboardView = () => {
  const { 
    user, 
    logout, 
    navigateTo, 
    returnToPatientPortal,
    firestoreStatus,
    initializeDatabase,
    isDbInitializing,
    dbInitProgress,
    dbInitResult
  } = useApp();

  // Active Navigation Module
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Role Switcher State for Testing RBAC
  const [activeRole, setActiveRole] = useState(user?.role || 'Super Admin');
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Admin PIN Lock State (requires 6-digit PIN: 000111)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('cn_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlock = () => {
    try {
      sessionStorage.setItem('cn_admin_unlocked', 'true');
    } catch {}
    setIsUnlocked(true);
  };

  const handleLock = () => {
    try {
      sessionStorage.removeItem('cn_admin_unlocked');
    } catch {}
    setIsUnlocked(false);
  };

  // Global Omni Search
  const [globalSearch, setGlobalSearch] = useState('');

  // Toast Banner State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // ---------------------------------------------------------------------------
  // Data States
  // ---------------------------------------------------------------------------
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [aiConfig, setAiConfig] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [patientFilter, setPatientFilter] = useState('ALL');
  const [patientSearch, setPatientSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('ALL');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('ALL');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [reportDateRange, setReportDateRange] = useState('7d');

  // Modals and Drawers
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', channel: 'SMS & PUSH', message: '', targetRole: 'ALL' });
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    aadhaar: '',
    phone: '',
    age: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: 'Guntur, Andhra Pradesh'
  });
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [newHospitalForm, setNewHospitalForm] = useState({
    name: '',
    type: 'Govt Area Hospital',
    district: 'Guntur',
    emergencyBeds: 12,
    icuBeds: 4,
    ventilators: 2,
    phone: ''
  });
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctorForm, setNewDoctorForm] = useState({
    name: '',
    specialty: 'General Physician',
    hospital: 'Government General Hospital (GGH)',
    fee: '₹300',
    phone: ''
  });

  // Load All Core Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        sStats,
        sPatients,
        sHospitals,
        sDoctors,
        sAppts,
        sEmgs,
        sAi,
        sNotifs,
        sRoles,
        sLogs,
        sSettings
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPatients(),
        adminService.getHospitals(),
        adminService.getDoctors(),
        adminService.getAppointments(),
        adminService.getEmergencies(),
        adminService.getAiConfig(),
        adminService.getNotifications(),
        adminService.getRoles(),
        adminService.getAuditLogs(),
        adminService.getSystemSettings()
      ]);

      setStats(sStats);
      setPatients(sPatients);
      setHospitals(sHospitals);
      setDoctors(sDoctors);
      setAppointments(sAppts);
      setEmergencies(sEmgs);
      setAiConfig(sAi);
      setNotifications(sNotifs);
      setRoles(sRoles);
      setAuditLogs(sLogs);
      setSettings(sSettings);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      showToast('Error loading administrative data. Using cached state.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync hash routing if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').replace('admin/', '').replace('admin-', '');
      if (['overview', 'patients', 'hospitals', 'doctors', 'appointments', 'emergencies', 'ai-management', 'notifications', 'reports', 'roles', 'audit-logs', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const handlePatientStatusChange = async (patientId, newStatus) => {
    try {
      await adminService.updatePatientStatus(patientId, newStatus, 'Updated via Admin Console');
      showToast(`Patient status updated to ${newStatus}`);
      loadData();
      if (selectedPatient && selectedPatient.id === patientId) {
        setSelectedPatient(prev => ({ ...prev, accountStatus: newStatus }));
      }
    } catch {
      showToast('Failed to update patient status', 'error');
    }
  };

  const handleHospitalStatusChange = async (hospitalId, newStatus) => {
    try {
      await adminService.updateHospitalStatus(hospitalId, newStatus, 'Status modified by Administrator');
      showToast(`Hospital status updated to ${newStatus}`);
      loadData();
      if (selectedHospital && selectedHospital.id === hospitalId) {
        setSelectedHospital(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      showToast('Failed to update hospital status', 'error');
    }
  };

  const handleDoctorAvailabilityToggle = async (doctorId) => {
    try {
      const doc = await adminService.toggleDoctorAvailability(doctorId);
      showToast(`Doctor ${doc.name} marked ${doc.isAvailable ? 'AVAILABLE' : 'OFFLINE'}`);
      loadData();
    } catch {
      showToast('Failed to toggle doctor availability', 'error');
    }
  };

  const handleAppointmentStatusChange = async (apptId, newStatus) => {
    try {
      await adminService.updateAppointmentStatus(apptId, newStatus);
      showToast(`Token appointment updated to ${newStatus}`);
      loadData();
    } catch {
      showToast('Failed to update appointment status', 'error');
    }
  };

  const handleEmergencyStatusChange = async (emergencyId, newStatus) => {
    try {
      await adminService.updateEmergencyStatus(emergencyId, newStatus);
      showToast(`Emergency dispatch transitioned to ${newStatus}`);
      loadData();
      if (selectedEmergency && selectedEmergency.id === emergencyId) {
        setSelectedEmergency(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      showToast('Failed to update emergency status', 'error');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      showToast('Please fill all notification fields', 'error');
      return;
    }
    try {
      await adminService.sendBroadcast(
        broadcastForm.title,
        broadcastForm.channel,
        broadcastForm.message,
        broadcastForm.targetRole
      );
      showToast('Broadcast notification sent successfully!');
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', channel: 'SMS & PUSH', message: '', targetRole: 'ALL' });
      loadData();
    } catch {
      showToast('Failed to dispatch notification', 'error');
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.phone) {
      showToast('Patient name and phone number are required', 'error');
      return;
    }
    try {
      await adminService.savePatient({
        id: `pat-${Date.now()}`,
        name: newPatientForm.name,
        abhaId: `ABHA-${Date.now().toString().slice(-8)}`,
        aadhaar: newPatientForm.aadhaar || 'XXXX-XXXX-XXXX',
        phone: newPatientForm.phone,
        age: Number(newPatientForm.age) || 30,
        gender: newPatientForm.gender,
        bloodGroup: newPatientForm.bloodGroup,
        address: newPatientForm.address,
        accountStatus: 'ACTIVE',
        registrationDate: new Date().toISOString().split('T')[0]
      });
      showToast(`Patient ${newPatientForm.name} registered successfully!`);
      setShowAddPatientModal(false);
      setNewPatientForm({ name: '', aadhaar: '', phone: '', age: '', gender: 'MALE', bloodGroup: 'O+', address: 'Guntur, Andhra Pradesh' });
      loadData();
    } catch {
      showToast('Failed to register patient', 'error');
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospitalForm.name) {
      showToast('Hospital facility name is required', 'error');
      return;
    }
    try {
      await adminService.saveHospital({
        id: `hosp-${Date.now()}`,
        name: newHospitalForm.name,
        type: newHospitalForm.type,
        district: newHospitalForm.district,
        location: `${newHospitalForm.district}, AP`,
        phone: newHospitalForm.phone || '0863 2221100',
        emergencyPhone: '108',
        status: 'VERIFIED',
        emergencyBeds: Number(newHospitalForm.emergencyBeds) || 10,
        totalEmergencyBeds: (Number(newHospitalForm.emergencyBeds) || 10) + 4,
        icuBeds: Number(newHospitalForm.icuBeds) || 4,
        totalIcuBeds: (Number(newHospitalForm.icuBeds) || 4) + 2,
        ventilators: Number(newHospitalForm.ventilators) || 2,
        totalVentilators: Number(newHospitalForm.ventilators) || 2,
        opQueueCount: 0,
        specialties: ['General Medicine', 'Emergency Triage', 'Pediatrics'],
        accreditation: 'State Quality Council Verified'
      });
      showToast(`Hospital ${newHospitalForm.name} registered successfully!`);
      setShowAddHospitalModal(false);
      setNewHospitalForm({ name: '', type: 'Govt Area Hospital', district: 'Guntur', emergencyBeds: 12, icuBeds: 4, ventilators: 2, phone: '' });
      loadData();
    } catch {
      showToast('Failed to register hospital', 'error');
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctorForm.name) {
      showToast('Doctor name is required', 'error');
      return;
    }
    try {
      await adminService.saveDoctor({
        id: `doc-${Date.now()}`,
        name: newDoctorForm.name.startsWith('Dr.') ? newDoctorForm.name : `Dr. ${newDoctorForm.name}`,
        specialty: newDoctorForm.specialty,
        hospital: newDoctorForm.hospital,
        fee: newDoctorForm.fee || '₹300',
        phone: newDoctorForm.phone || '+91 98765 00000',
        isAvailable: true,
        dutyShift: '09:00 AM - 05:00 PM',
        qualifications: 'MBBS, MD',
        regCouncilId: `APMC-${Math.floor(10000 + Math.random() * 90000)}`
      });
      showToast(`Doctor ${newDoctorForm.name} registered successfully!`);
      setShowAddDoctorModal(false);
      setNewDoctorForm({ name: '', specialty: 'General Physician', hospital: 'Government General Hospital (GGH)', fee: '₹300', phone: '' });
      loadData();
    } catch {
      showToast('Failed to register doctor', 'error');
    }
  };

  const handleExport = (type) => {
    if (type === 'patients') adminService.exportCsv(patients, 'patients_registry');
    else if (type === 'hospitals') adminService.exportCsv(hospitals, 'hospitals_capacity');
    else if (type === 'doctors') adminService.exportCsv(doctors, 'doctors_directory');
    else if (type === 'appointments') adminService.exportCsv(appointments, 'op_appointments');
    else if (type === 'emergencies') adminService.exportCsv(emergencies, '108_emergencies_log');
    else if (type === 'audit') adminService.exportCsv(auditLogs, 'admin_audit_trail');
    showToast(`Exported ${type} records to CSV successfully.`);
  };

  // Nav Items Configuration
  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Accounts', icon: Users, badge: patients.length },
    { id: 'hospitals', label: 'Hospital Network', icon: Building2, badge: hospitals.filter(h => h.status === 'PENDING_REVIEW').length || null, badgeColor: '#f59e0b' },
    { id: 'doctors', label: 'Doctor Directory', icon: Stethoscope, badge: doctors.length },
    { id: 'appointments', label: 'OP Appointments', icon: CalendarCheck, badge: appointments.filter(a => a.status === 'SERVING').length ? `${appointments.filter(a => a.status === 'SERVING').length} live` : null, badgeColor: '#10b981' },
    { id: 'emergencies', label: '108 Emergency Center', icon: Siren, badge: emergencies.filter(e => e.status === 'DISPATCHED' || e.status === 'TRANSPORTING').length || null, badgeColor: '#ef4444' },
    { id: 'ai-management', label: 'AI Assistant & Triage', icon: Bot },
    { id: 'notifications', label: 'Notifications Hub', icon: Bell },
    { id: 'reports', label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
    { id: 'audit-logs', label: 'Audit Trail & Logs', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  if (!isUnlocked) {
    return (
      <AdminLockGate 
        onUnlock={handleUnlock} 
        onCancel={returnToPatientPortal || (() => navigateTo('dashboard'))} 
      />
    );
  }

  return (
    <div className="admin-root-container">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`admin-toast-banner fade-in ${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: 'success' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="admin-top-header">
        <div className="header-brand-section">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Menu"
          >
            <Menu size={22} />
          </button>
          <div className="admin-brand" onClick={() => setActiveTab('overview')}>
            <div className="brand-emblem">
              <Siren size={20} color="#ffffff" />
            </div>
            <div>
              <div className="brand-title-line">
                <span className="brand-main">Care Navigator</span>
                <span className="brand-sub-badge">ADMIN CONSOLE</span>
              </div>
              <p className="brand-motto">Department of Health & Emergency Medical Services</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="header-search-bar">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search patients, doctors, hospitals, OP tokens or 108 SOS calls..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button className="search-clear-btn" onClick={() => setGlobalSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Header Right Tools */}
        <div className="header-right-tools">
          {/* Firestore Connection Indicator */}
          <div 
            className={`admin-system-indicator ${firestoreStatus?.connected ? 'connected' : 'syncing'}`}
            title={`Database: ${firestoreStatus?.connected ? 'Cloud Firestore Synchronized' : 'Local Fallback Storage Active'}`}
          >
            <Database size={14} />
            <span className="hide-on-mobile">
              {firestoreStatus?.connected ? 'Firestore Live' : 'Local Engine'}
            </span>
            <span className="dot-pulse" />
          </div>

          {/* Active Role Switcher Pill */}
          <button 
            className="role-selector-pill"
            onClick={() => setShowRoleModal(true)}
            title="Switch Simulated Admin Role"
          >
            <ShieldCheck size={14} color="#0284c7" />
            <span className="role-name">{activeRole}</span>
            <ChevronDown size={14} />
          </button>

          {/* Emergency Alert Indicator */}
          <button 
            className="header-tool-btn red-alert"
            onClick={() => setActiveTab('emergencies')}
            title="108 Active Emergency Calls"
          >
            <Siren size={18} />
            {emergencies.filter(e => e.status === 'DISPATCHED' || e.status === 'TRANSPORTING').length > 0 && (
              <span className="badge-count">
                {emergencies.filter(e => e.status === 'DISPATCHED' || e.status === 'TRANSPORTING').length}
              </span>
            )}
          </button>

          {/* Return to App / Logout */}
          <div className="admin-profile-menu">
            <button 
              className="exit-admin-btn"
              onClick={() => { if (typeof returnToPatientPortal === 'function') returnToPatientPortal(); else navigateTo('dashboard'); }}
              title="Return to Main Patient Portal"
              style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)' }}
            >
              <RotateCcw size={14} />
              <span className="hide-on-mobile">Exit Portal</span>
            </button>
            <button 
              className="exit-admin-btn"
              onClick={handleLock}
              title="Lock Admin Console with 6-Digit PIN"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <Lock size={14} />
              <span className="hide-on-mobile">Lock Console</span>
            </button>
            <button 
              className="logout-admin-btn"
              onClick={logout}
              title="Secure Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout: Sidebar + Viewport */}
      <div className="admin-layout-body">
        {/* Collapsible Left Sidebar */}
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">COMMAND MODULES</span>
            <button 
              className="sidebar-collapse-toggle hide-on-mobile"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Sliders size={16} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    try {
                      window.history.replaceState({ screen: 'admin', tab: item.id }, '', `#admin/${item.id}`);
                    } catch {
                      // fallback
                    }
                  }}
                  title={item.label}
                >
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span 
                      className="nav-badge" 
                      style={{ background: item.badgeColor || '#0284c7' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="sidebar-footer">
            <div className="footer-system-card">
              <div className="card-top">
                <span className="status-dot-green" />
                <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>AP Health Grid v2.4</strong>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#64748b' }}>
                Palnadu & Guntur Regional Command
              </p>
            </div>
          </div>
        </aside>

        {/* Viewport Area */}
        <main className="admin-viewport">
          {/* Module 1: Overview & Analytics */}
          {activeTab === 'overview' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Administrative Operations Overview</h2>
                  <p className="pane-subtitle">
                    Real-time operational metrics across registered patients, hospitals, doctors, OP tokens and 108 emergency fleet.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={loadData}>
                    <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
                    <span>Refresh Data</span>
                  </button>
                  <button className="btn-primary" onClick={() => handleExport('audit')}>
                    <Download size={14} />
                    <span>Export Audit Report</span>
                  </button>
                </div>
              </div>

              {/* 6 Top Metric Cards */}
              <div className="metrics-grid">
                <div className="stat-card" onClick={() => setActiveTab('patients')}>
                  <div className="stat-top">
                    <span className="stat-label">TOTAL REGISTERED PATIENTS</span>
                    <div className="stat-icon-box blue"><Users size={20} /></div>
                  </div>
                  <strong className="stat-value">{stats?.totalPatients || patients.length}</strong>
                  <div className="stat-footer">
                    <span className="stat-trend positive">↑ 100% ABHA Verified</span>
                    <span className="stat-note">in Palnadu & Guntur</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('hospitals')}>
                  <div className="stat-top">
                    <span className="stat-label">VERIFIED HOSPITALS & CLINICS</span>
                    <div className="stat-icon-box teal"><Building2 size={20} /></div>
                  </div>
                  <strong className="stat-value">{stats?.verifiedHospitals || hospitals.filter(h => h.status === 'VERIFIED').length}</strong>
                  <div className="stat-footer">
                    <span className="stat-trend warning">
                      {hospitals.filter(h => h.status === 'PENDING_REVIEW').length} Pending Verification
                    </span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('doctors')}>
                  <div className="stat-top">
                    <span className="stat-label">REGISTERED MEDICAL OFFICERS</span>
                    <div className="stat-icon-box purple"><Stethoscope size={20} /></div>
                  </div>
                  <strong className="stat-value">{stats?.verifiedDoctors || doctors.length}</strong>
                  <div className="stat-footer">
                    <span className="stat-trend positive">
                      {doctors.filter(d => d.isAvailable).length} Active On Duty
                    </span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('appointments')}>
                  <div className="stat-top">
                    <span className="stat-label">TODAY'S OP TOKEN QUEUE</span>
                    <div className="stat-icon-box emerald"><CalendarCheck size={20} /></div>
                  </div>
                  <strong className="stat-value">{stats?.totalApptsToday || appointments.length}</strong>
                  <div className="stat-footer">
                    <span className="stat-trend positive">{stats?.servingAppts || 1} Serving Now</span>
                    <span className="stat-note">• {stats?.pendingAppts || 4} in Queue</span>
                  </div>
                </div>

                <div className="stat-card red-glow" onClick={() => setActiveTab('emergencies')}>
                  <div className="stat-top">
                    <span className="stat-label">108 ACTIVE EMERGENCY SOS</span>
                    <div className="stat-icon-box red"><Siren size={20} /></div>
                  </div>
                  <strong className="stat-value text-red">
                    {emergencies.filter(e => e.status === 'DISPATCHED' || e.status === 'TRANSPORTING').length}
                  </strong>
                  <div className="stat-footer">
                    <span className="stat-trend negative">Avg Response: 3.8 mins</span>
                    <span className="stat-note">ALS Units Dispatched</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setActiveTab('hospitals')}>
                  <div className="stat-top">
                    <span className="stat-label">AVAILABLE EMERGENCY & ICU BEDS</span>
                    <div className="stat-icon-box amber"><Bed size={20} /></div>
                  </div>
                  <strong className="stat-value">
                    {(stats?.totalEmergencyBeds || 78)} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {stats?.totalIcuBeds || 28} ICU</span>
                  </strong>
                  <div className="stat-footer">
                    <span className="stat-trend positive">{stats?.totalVentilators || 19} Ventilators Free</span>
                  </div>
                </div>
              </div>

              {/* Operational Visual Analytics & Recent Activity */}
              <div className="overview-split-grid">
                {/* Visual Trend Chart */}
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Weekly OP Booking Influx & 108 Emergency Load</h3>
                      <p className="panel-subtitle">Regional hospital triage load over the past 7 days</p>
                    </div>
                    <span className="badge-pill teal">Realtime Telemetry</span>
                  </div>

                  <div className="chart-visual-wrapper">
                    <div className="chart-bars-container">
                      {[
                        { day: 'Mon', op: 42, emg: 12 },
                        { day: 'Tue', op: 48, emg: 14 },
                        { day: 'Wed', op: 56, emg: 18 },
                        { day: 'Thu', op: 62, emg: 15 },
                        { day: 'Fri', op: 58, emg: 11 },
                        { day: 'Sat', op: 71, emg: 22 },
                        { day: 'Today', op: 54, emg: 16 }
                      ].map(bar => (
                        <div key={bar.day} className="chart-col">
                          <div className="bars-group">
                            <div className="bar bar-op" style={{ height: `${bar.op * 2.2}px` }} title={`OP Tokens: ${bar.op}`} />
                            <div className="bar bar-emg" style={{ height: `${bar.emg * 4.5}px` }} title={`108 Emergencies: ${bar.emg}`} />
                          </div>
                          <span className="col-label">{bar.day}</span>
                        </div>
                      ))}
                    </div>

                    <div className="chart-legend">
                      <div className="legend-item"><span className="legend-dot blue" /><span>OP Tokens Booked</span></div>
                      <div className="legend-item"><span className="legend-dot red" /><span>108 Emergency Dispatches</span></div>
                    </div>
                  </div>
                </div>

                {/* Live Activity & Audit Feed */}
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <div>
                      <h3 className="panel-title">Recent Administrative Audit Feed</h3>
                      <p className="panel-subtitle">Immutable compliance and clinical dispatch logs</p>
                    </div>
                    <button className="link-btn" onClick={() => setActiveTab('audit-logs')}>
                      <span>View All</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="audit-feed-list">
                    {(auditLogs.slice(0, 5)).map(log => (
                      <div key={log.id} className="audit-feed-item">
                        <div className={`audit-badge-icon ${log.status.toLowerCase()}`}>
                          {log.action.includes('EMERGENCY') ? <Siren size={14} /> :
                           log.action.includes('HOSPITAL') ? <Building2 size={14} /> :
                           log.action.includes('DOCTOR') ? <Stethoscope size={14} /> :
                           <Activity size={14} />}
                        </div>
                        <div className="audit-content">
                          <div className="audit-row">
                            <strong className="audit-action">{log.action.replace(/_/g, ' ')}</strong>
                            <span className="audit-time">
                              <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="audit-desc">{log.details}</p>
                          <span className="audit-actor">Actor: <strong>{log.actor}</strong> ({log.actorRole})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Patient Accounts */}
          {activeTab === 'patients' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Patient Records & ABHA Health Identity Registry</h2>
                  <p className="pane-subtitle">
                    Manage authorized citizen patient profiles, verify ABHA credentials, and monitor visit histories.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => handleExport('patients')}>
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button className="btn-primary" onClick={() => setShowAddPatientModal(true)}>
                    <Plus size={14} />
                    <span>Register Patient</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="filter-bar">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by patient name, ABHA ID, phone, district or blood group..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                <div className="filter-chips">
                  {['ALL', 'ACTIVE', 'FLAGGED', 'SUSPENDED'].map(st => (
                    <button
                      key={st}
                      className={`filter-chip ${patientFilter === st ? 'active' : ''}`}
                      onClick={() => setPatientFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patients Table */}
              <div className="table-responsive-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Patient Name & ABHA</th>
                      <th>Phone & Contact</th>
                      <th>Age / Gender</th>
                      <th>Blood Group</th>
                      <th>District</th>
                      <th>Visits</th>
                      <th>Account Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients
                      .filter(p => patientFilter === 'ALL' || p.accountStatus === patientFilter)
                      .filter(p => {
                        if (!patientSearch.trim()) return true;
                        const q = patientSearch.toLowerCase();
                        return p.name.toLowerCase().includes(q) || p.abhaId.toLowerCase().includes(q) || p.phone.includes(q);
                      })
                      .map(patient => (
                        <tr key={patient.id}>
                          <td>
                            <div className="patient-cell">
                              <div className="patient-avatar-mini">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <strong className="patient-name-text">{patient.name}</strong>
                                <span className="patient-abha-text">{patient.abhaId}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="mono-text">{patient.phone}</span>
                          </td>
                          <td>{patient.age} yrs • {patient.gender}</td>
                          <td>
                            <span className="badge-blood">{patient.bloodGroup}</span>
                          </td>
                          <td>{patient.district || 'Palnadu'}</td>
                          <td>
                            <span className="badge-pill blue">{patient.totalVisits || 1} Visits</span>
                          </td>
                          <td>
                            <span className={`status-badge ${patient.accountStatus.toLowerCase()}`}>
                              {patient.accountStatus}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button 
                                className="action-btn-sm" 
                                onClick={() => setSelectedPatient(patient)}
                                title="View Patient Clinical Dossier"
                              >
                                <Eye size={15} />
                              </button>
                              {patient.accountStatus === 'ACTIVE' ? (
                                <button 
                                  className="action-btn-sm danger" 
                                  onClick={() => handlePatientStatusChange(patient.id, 'SUSPENDED')}
                                  title="Suspend Patient Account"
                                >
                                  <UserX size={15} />
                                </button>
                              ) : (
                                <button 
                                  className="action-btn-sm success" 
                                  onClick={() => handlePatientStatusChange(patient.id, 'ACTIVE')}
                                  title="Reactivate Patient Account"
                                >
                                  <Check size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3: Hospital Network */}
          {activeTab === 'hospitals' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Regional Hospital Network & Capacity Management</h2>
                  <p className="pane-subtitle">
                    Verify healthcare facility profiles, manage emergency bed allocations, ICU ventilators, and accreditation status.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => handleExport('hospitals')}>
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button className="btn-primary" onClick={() => setShowAddHospitalModal(true)}>
                    <Plus size={14} />
                    <span>Register Hospital</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search */}
              <div className="filter-bar">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by hospital name, district, type, or registration code..."
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                  />
                </div>
                <div className="filter-chips">
                  {['ALL', 'VERIFIED', 'PENDING_REVIEW', 'SUSPENDED'].map(st => (
                    <button
                      key={st}
                      className={`filter-chip ${hospitalFilter === st ? 'active' : ''}`}
                      onClick={() => setHospitalFilter(st)}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hospital Cards Grid */}
              <div className="hospitals-grid">
                {hospitals
                  .filter(h => hospitalFilter === 'ALL' || h.status === hospitalFilter)
                  .filter(h => {
                    if (!hospitalSearch.trim()) return true;
                    const q = hospitalSearch.toLowerCase();
                    return h.name.toLowerCase().includes(q) || h.district.toLowerCase().includes(q) || h.type.toLowerCase().includes(q);
                  })
                  .map(hosp => (
                    <div key={hosp.id} className="hospital-card-admin">
                      <div className="hosp-card-top">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 className="hosp-name-text">{hosp.name}</h3>
                            <span className={`status-badge ${hosp.status.toLowerCase()}`}>
                              {hosp.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="hosp-type-text">{hosp.type} • Reg: {hosp.registrationNo}</p>
                          <p className="hosp-address-text">
                            <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            {hosp.location}
                          </p>
                        </div>
                      </div>

                      {/* Bed & Capacity Metrics */}
                      <div className="hosp-capacity-grid">
                        <div className="cap-box">
                          <span className="cap-val">{hosp.emergencyBeds} / {hosp.totalEmergencyBeds || 20}</span>
                          <span className="cap-lbl">Emergency Beds</span>
                        </div>
                        <div className="cap-box">
                          <span className="cap-val">{hosp.icuBeds} / {hosp.totalIcuBeds || 8}</span>
                          <span className="cap-lbl">ICU Beds</span>
                        </div>
                        <div className="cap-box">
                          <span className="cap-val">{hosp.ventilators} / {hosp.totalVentilators || 4}</span>
                          <span className="cap-lbl">Ventilators</span>
                        </div>
                        <div className="cap-box">
                          <span className="cap-val">{hosp.opQueueCount}</span>
                          <span className="cap-lbl">Active OP Tokens</span>
                        </div>
                      </div>

                      {/* Specialties tags */}
                      <div className="specialties-tag-row">
                        {(hosp.specialties || []).slice(0, 4).map(s => (
                          <span key={s} className="spec-tag">{s}</span>
                        ))}
                      </div>

                      {/* Card Actions */}
                      <div className="hosp-card-footer">
                        <span className="accreditation-pill">
                          <ShieldCheck size={13} color="#0284c7" />
                          {hosp.accreditation}
                        </span>

                        <div className="btn-group-row">
                          <button 
                            className="btn-outline-sm"
                            onClick={() => setSelectedHospital(hosp)}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {hosp.status === 'PENDING_REVIEW' && (
                            <button 
                              className="btn-success-sm"
                              onClick={() => handleHospitalStatusChange(hosp.id, 'VERIFIED')}
                            >
                              <Check size={14} />
                              <span>Verify & Approve</span>
                            </button>
                          )}

                          {hosp.status === 'VERIFIED' && (
                            <button 
                              className="btn-danger-sm"
                              onClick={() => handleHospitalStatusChange(hosp.id, 'SUSPENDED')}
                            >
                              <UserX size={14} />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Module 4: Doctor Directory */}
          {activeTab === 'doctors' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Medical Officer & Specialist Directory</h2>
                  <p className="pane-subtitle">
                    Verify AP Medical Council (APMC/NMC) registration numbers, assign hospital duty rooms, and manage OPD schedules.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => handleExport('doctors')}>
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button className="btn-primary" onClick={() => setShowAddDoctorModal(true)}>
                    <Plus size={14} />
                    <span>Register Doctor</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="filter-bar">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by doctor name, specialty, hospital or registration council ID..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                  />
                </div>
                <div className="filter-chips">
                  {['ALL', 'Cardiology', 'Surgery', 'Orthopedics', 'Pediatrics', 'General'].map(sp => (
                    <button
                      key={sp}
                      className={`filter-chip ${doctorSpecialtyFilter === sp ? 'active' : ''}`}
                      onClick={() => setDoctorSpecialtyFilter(sp)}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctors Table */}
              <div className="table-responsive-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Doctor Name & Qualifications</th>
                      <th>Council Reg No</th>
                      <th>Specialty</th>
                      <th>Hospital & Room</th>
                      <th>Fee</th>
                      <th>Duty Shift</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors
                      .filter(d => doctorSpecialtyFilter === 'ALL' || d.specialty.toLowerCase().includes(doctorSpecialtyFilter.toLowerCase()))
                      .filter(d => {
                        if (!doctorSearch.trim()) return true;
                        const q = doctorSearch.toLowerCase();
                        return d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.councilRegNo.toLowerCase().includes(q);
                      })
                      .map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="patient-cell">
                              <div className="doctor-avatar-circle">
                                <Stethoscope size={16} color="#0284c7" />
                              </div>
                              <div>
                                <strong className="patient-name-text">{doc.name}</strong>
                                <span className="patient-abha-text">{doc.qualification}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="mono-text bold">{doc.councilRegNo}</span></td>
                          <td><span className="spec-tag">{doc.specialty}</span></td>
                          <td>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{doc.hospitalName}</span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{doc.roomNo}</span>
                          </td>
                          <td><strong>{doc.fee}</strong></td>
                          <td><span style={{ fontSize: '0.75rem', color: '#475569' }}>{doc.dutyShift}</span></td>
                          <td>
                            <button
                              onClick={() => handleDoctorAvailabilityToggle(doc.id)}
                              className={`status-toggle-btn ${doc.isAvailable ? 'online' : 'offline'}`}
                              title="Click to toggle availability"
                            >
                              <span className="dot" />
                              <span>{doc.isAvailable ? 'ON DUTY' : 'OFFLINE'}</span>
                            </button>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button 
                                className="action-btn-sm" 
                                onClick={() => setSelectedDoctor(doc)}
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                className="action-btn-sm" 
                                onClick={() => showToast(`Credentials verified for ${doc.name}`)}
                                title="Verify Credentials"
                              >
                                <ShieldCheck size={15} color="#10b981" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 5: OP Appointments & Queue */}
          {activeTab === 'appointments' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Outpatient (OP) Token Queue Management</h2>
                  <p className="pane-subtitle">
                    Real-time OP queue monitoring across outpatient clinics, advance queue tokens, and verify payments.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => handleExport('appointments')}>
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button className="btn-primary" onClick={loadData}>
                    <RefreshCw size={14} />
                    <span>Refresh Queue</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="filter-bar">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by token number, patient name, doctor, or QR code..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                  />
                </div>
                <div className="filter-chips">
                  {['ALL', 'SERVING', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      className={`filter-chip ${appointmentFilter === st ? 'active' : ''}`}
                      onClick={() => setAppointmentFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments Table */}
              <div className="table-responsive-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Token #</th>
                      <th>Patient Name</th>
                      <th>Doctor & Specialty</th>
                      <th>Hospital & Room</th>
                      <th>Slot & Date</th>
                      <th>Queue Status</th>
                      <th>Fee Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(a => appointmentFilter === 'ALL' || a.status === appointmentFilter)
                      .filter(a => {
                        if (!appointmentSearch.trim()) return true;
                        const q = appointmentSearch.toLowerCase();
                        return a.tokenNumber.includes(q) || a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q);
                      })
                      .map(appt => (
                        <tr key={appt.id}>
                          <td>
                            <div className="token-badge-admin">
                              <span className="token-num">#{appt.tokenNumber}</span>
                              <span className="token-code">{appt.qrCode}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{appt.patientName}</strong>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{appt.patientPhone}</span>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{appt.doctorName}</strong>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#0284c7' }}>{appt.specialty}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: '#0f172a' }}>{appt.hospitalName}</span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{appt.roomNo}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: '600' }}>{appt.timeSlot}</span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{appt.date}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${appt.status.toLowerCase()}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-pill ${appt.feeStatus === 'PAID' ? 'emerald' : 'amber'}`}>
                              {appt.feeStatus}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              {appt.status === 'CONFIRMED' && (
                                <button 
                                  className="btn-success-sm"
                                  onClick={() => handleAppointmentStatusChange(appt.id, 'SERVING')}
                                  title="Call Next Token to Doctor Room"
                                >
                                  <Radio size={13} />
                                  <span>Serve Now</span>
                                </button>
                              )}
                              {appt.status === 'SERVING' && (
                                <button 
                                  className="btn-primary-sm"
                                  onClick={() => handleAppointmentStatusChange(appt.id, 'COMPLETED')}
                                  title="Mark Consultation Completed"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Complete</span>
                                </button>
                              )}
                              {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                <button 
                                  className="action-btn-sm danger"
                                  onClick={() => handleAppointmentStatusChange(appt.id, 'CANCELLED')}
                                  title="Cancel Appointment"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 6: 108 Emergency Control Center */}
          {activeTab === 'emergencies' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">108 Emergency Ambulance Command Grid</h2>
                  <p className="pane-subtitle">
                    Live emergency dispatch console: triage urgent SOS calls, assign nearest ALS/BLS responders, and monitor transport to ERs.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => handleExport('emergencies')}>
                    <Download size={14} />
                    <span>Export Dispatches</span>
                  </button>
                  <button className="btn-primary red" onClick={loadData}>
                    <Radio size={14} className="spin-pulse" />
                    <span>Live GPS Poll</span>
                  </button>
                </div>
              </div>

              {/* Priority Filter */}
              <div className="filter-bar">
                <div className="filter-chips">
                  {['ALL', 'CODE_RED', 'CODE_AMBER', 'CODE_GREEN'].map(pr => (
                    <button
                      key={pr}
                      className={`filter-chip ${emergencyFilter === pr ? 'active' : ''}`}
                      onClick={() => setEmergencyFilter(pr)}
                    >
                      {pr.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Dispatches List */}
              <div className="emergencies-card-list">
                {emergencies
                  .filter(e => emergencyFilter === 'ALL' || e.priority === emergencyFilter)
                  .map(emg => (
                    <div key={emg.id} className={`emergency-dispatch-card ${emg.priority.toLowerCase()}`}>
                      <div className="emg-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`priority-tag ${emg.priority.toLowerCase()}`}>
                            {emg.priority.replace(/_/g, ' ')}
                          </span>
                          <strong className="emg-id-text">{emg.id}</strong>
                          <span className="emg-time-text">
                            <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            {new Date(emg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className={`status-badge ${emg.status.toLowerCase()}`}>
                          {emg.status}
                        </span>
                      </div>

                      <h3 className="emg-type-text">{emg.type}</h3>
                      <p className="emg-location-text">
                        <MapPin size={15} color="#dc2626" style={{ display: 'inline', marginRight: '5px' }} />
                        {emg.location}
                      </p>

                      <div className="emg-details-grid">
                        <div className="emg-meta-box">
                          <span className="lbl">PATIENT</span>
                          <strong className="val">{emg.patientName} ({emg.patientAge} yrs • {emg.patientBlood})</strong>
                        </div>
                        <div className="emg-meta-box">
                          <span className="lbl">CALLER / BYSTANDER</span>
                          <strong className="val">{emg.callerName} ({emg.callerPhone})</strong>
                        </div>
                        <div className="emg-meta-box">
                          <span className="lbl">ASSIGNED 108 AMBULANCE</span>
                          <strong className="val text-blue">{emg.assignedAmbulance}</strong>
                        </div>
                        <div className="emg-meta-box">
                          <span className="lbl">TARGET HOSPITAL & ER</span>
                          <strong className="val">{emg.targetHospital}</strong>
                        </div>
                      </div>

                      <div className="emg-notes-alert">
                        <strong>Clinical Triage Note:</strong> {emg.notes}
                      </div>

                      {/* Control Actions */}
                      <div className="emg-actions-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="eta-badge">
                            ETA: <strong>{emg.etaMinutes} mins</strong> ({emg.distanceKm} km away)
                          </span>
                        </div>

                        <div className="btn-group-row">
                          <button 
                            className="btn-outline-sm"
                            onClick={() => window.open(`tel:${emg.callerPhone.replace(/\D/g, '')}`)}
                          >
                            <Phone size={14} />
                            <span>Call Bystander</span>
                          </button>

                          {emg.status === 'DISPATCHED' && (
                            <button 
                              className="btn-primary-sm"
                              onClick={() => handleEmergencyStatusChange(emg.id, 'TRANSPORTING')}
                            >
                              <Ambulance size={14} />
                              <span>Mark Transporting</span>
                            </button>
                          )}

                          {emg.status === 'TRANSPORTING' && (
                            <button 
                              className="btn-success-sm"
                              onClick={() => handleEmergencyStatusChange(emg.id, 'RESOLVED')}
                            >
                              <CheckCircle2 size={14} />
                              <span>Handover to Hospital (Resolved)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Module 7: AI Assistant Management */}
          {activeTab === 'ai-management' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">AI Health Assistant & Symptom Triage Configuration</h2>
                  <p className="pane-subtitle">
                    Manage clinical symptom assessment thresholds, trigger keywords, and safety audit incident reports.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-primary" onClick={() => showToast('AI settings saved successfully!')}>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Service Health Grid */}
              <div className="ai-metrics-grid">
                <div className="ai-stat-card">
                  <span className="lbl">AI SERVICE STATUS</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span className="status-dot-green" />
                    <strong style={{ fontSize: '1.25rem', color: '#065f46' }}>ONLINE (99.88%)</strong>
                  </div>
                  <span className="sub">Gemini 1.5 Flash Medical Gateway</span>
                </div>

                <div className="ai-stat-card">
                  <span className="lbl">AVERAGE TRIAGE LATENCY</span>
                  <strong style={{ fontSize: '1.25rem', color: '#0284c7', display: 'block', marginTop: '6px' }}>
                    420 ms
                  </strong>
                  <span className="sub">Optimal real-time responsiveness</span>
                </div>

                <div className="ai-stat-card">
                  <span className="lbl">MONTHLY CITIZEN QUERIES</span>
                  <strong style={{ fontSize: '1.25rem', color: '#0f172a', display: 'block', marginTop: '6px' }}>
                    14,280 Assessments
                  </strong>
                  <span className="sub">98.4% clinical triage accuracy</span>
                </div>

                <div className="ai-stat-card red">
                  <span className="lbl">EMERGENCY SOS TRIGGERS</span>
                  <strong style={{ fontSize: '1.25rem', color: '#dc2626', display: 'block', marginTop: '6px' }}>
                    412 Immediate 108 Calls
                  </strong>
                  <span className="sub">Automatically escalated to ER</span>
                </div>
              </div>

              {/* Keyword Trigger Editor */}
              <div className="dashboard-panel" style={{ marginTop: '20px' }}>
                <h3 className="panel-title">Mandatory Immediate 108 Emergency Trigger Keywords</h3>
                <p className="panel-subtitle">
                  When a patient query includes any of these terms, AI immediately forces 108 SOS dispatch with zero delay.
                </p>

                <div className="keyword-chip-container">
                  {(aiConfig?.emergencyKeywords || []).map((kw, i) => (
                    <span key={i} className="keyword-chip">
                      <Siren size={13} color="#dc2626" />
                      <span>{kw}</span>
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label className="input-label">Mandatory Legal Clinical Disclaimer</label>
                  <textarea
                    className="admin-textarea"
                    rows={3}
                    defaultValue={aiConfig?.safetyDisclaimer}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Module 8: Notifications Hub */}
          {activeTab === 'notifications' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Notifications & Multi-Channel Broadcast Center</h2>
                  <p className="pane-subtitle">
                    Dispatch SMS, WhatsApp, and push alerts to citizens, ambulance responders, and hospital staff.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-primary" onClick={() => setShowBroadcastModal(true)}>
                    <Send size={14} />
                    <span>New Broadcast Alert</span>
                  </button>
                </div>
              </div>

              {/* Notification Templates Grid */}
              <div className="hospitals-grid">
                {notifications.map(tpl => (
                  <div key={tpl.id} className="notification-tpl-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="badge-pill blue">{tpl.channel}</span>
                      <span className="badge-pill emerald">Delivery: {tpl.deliveryRate}</span>
                    </div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' }}>
                      {tpl.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                      {tpl.templateText}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dispatches: <strong>{tpl.sentCount}</strong></span>
                      <button 
                        className="btn-outline-sm"
                        onClick={() => {
                          setBroadcastForm({ title: tpl.title, channel: tpl.channel, message: tpl.templateText, targetRole: 'ALL' });
                          setShowBroadcastModal(true);
                        }}
                      >
                        <Send size={13} />
                        <span>Send Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 9: Reports & Analytics */}
          {activeTab === 'reports' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Healthcare Reports & Operational Analytics</h2>
                  <p className="pane-subtitle">
                    Aggregate patient demographics, hospital bed utilization, and emergency response performance.
                  </p>
                </div>
                <div className="pane-actions">
                  <div className="filter-chips">
                    {['Today', '7d', '30d', 'Quarterly'].map(d => (
                      <button 
                        key={d} 
                        className={`filter-chip ${reportDateRange === d ? 'active' : ''}`}
                        onClick={() => setReportDateRange(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={() => handleExport('appointments')}>
                    <Download size={14} />
                    <span>Download Master CSV</span>
                  </button>
                </div>
              </div>

              {/* Report Summary Cards */}
              <div className="metrics-grid">
                <div className="stat-card">
                  <span className="stat-label">AVERAGE OP CONSULTATION TIME</span>
                  <strong className="stat-value">12.4 mins</strong>
                  <span className="stat-note">Across 8 verified facilities</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">AVERAGE 108 RESPONSE TIME</span>
                  <strong className="stat-value text-emerald">3.8 mins</strong>
                  <span className="stat-note">Exceeds national benchmark (8m)</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">OP TOKEN FULFILLMENT RATE</span>
                  <strong className="stat-value text-blue">96.2%</strong>
                  <span className="stat-note">Only 3.8% cancellations</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">EMERGENCY BED TURNOVER</span>
                  <strong className="stat-value">84.5%</strong>
                  <span className="stat-note">Optimal ICU triage safety margin</span>
                </div>
              </div>
            </div>
          )}

          {/* Module 10: Roles & Permissions (RBAC) */}
          {activeTab === 'roles' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Role-Based Access Control (RBAC) & Security Roles</h2>
                  <p className="pane-subtitle">
                    Configure staff permissions according to least privilege: Super Admin, Hospital Admin, Emergency Operator, and Auditor.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-secondary" onClick={() => setShowRoleModal(true)}>
                    <Sliders size={14} />
                    <span>Simulate Active Role</span>
                  </button>
                </div>
              </div>

              <div className="roles-grid">
                {roles.map(role => (
                  <div key={role.id} className="role-card-admin">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{role.name}</strong>
                      <span className="badge-pill blue">{role.userCount} Assigned</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.45 }}>
                      {role.description}
                    </p>

                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Granted Permissions ({role.permissions.length})
                    </span>

                    <div className="permissions-chip-wrap">
                      {role.permissions.map(perm => (
                        <span key={perm} className="perm-chip">
                          <Check size={11} color="#10b981" />
                          <span>{perm}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module 11: Audit Logs & Security */}
          {activeTab === 'audit-logs' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Immutable Administrative & Clinical Audit Trail</h2>
                  <p className="pane-subtitle">
                    All administrative status changes, hospital approvals, ambulance dispatches, and logins are cryptographically logged.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-primary" onClick={() => handleExport('audit')}>
                    <Download size={14} />
                    <span>Export Audit Trail (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Audit Search */}
              <div className="filter-bar">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search logs by actor, action, resource, or IP address..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Logs Table */}
              <div className="table-responsive-wrapper">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Actor & Role</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>Outcome</th>
                      <th>IP Address</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .filter(l => {
                        if (!auditSearch.trim()) return true;
                        const q = auditSearch.toLowerCase();
                        return l.actor.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q);
                      })
                      .map(log => (
                        <tr key={log.id}>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{log.actor}</strong>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>{log.actorRole}</span>
                          </td>
                          <td><span className="mono-text bold">{log.action}</span></td>
                          <td><span style={{ fontSize: '0.78rem', color: '#0284c7' }}>{log.resource}</span></td>
                          <td>
                            <span className={`badge-pill ${log.status === 'SUCCESS' ? 'emerald' : log.status === 'WARNING' ? 'amber' : 'red'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td><code style={{ fontSize: '0.72rem' }}>{log.ipAddress}</code></td>
                          <td><span style={{ fontSize: '0.78rem', color: '#475569' }}>{log.details}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 12: System Settings */}
          {activeTab === 'settings' && (
            <div className="tab-pane fade-in">
              <div className="pane-header">
                <div>
                  <h2 className="pane-title">Platform Preferences & System Configuration</h2>
                  <p className="pane-subtitle">
                    Configure Cloud Firestore synchronization, 108 emergency dispatch numbers, session timeouts, and maintenance mode.
                  </p>
                </div>
                <div className="pane-actions">
                  <button className="btn-primary" onClick={() => showToast('System preferences saved successfully!')}>
                    <Save size={14} />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>

              <div className="settings-cards-grid">
                <div className="dashboard-panel">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 className="panel-title" style={{ margin: 0 }}>Cloud Database & Regional Connectivity</h3>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: firestoreStatus?.connected ? '#d1fae5' : (firestoreStatus?.status === 'PERMISSION_DENIED' ? '#fef3c7' : '#fee2e2'),
                      color: firestoreStatus?.connected ? '#047857' : (firestoreStatus?.status === 'PERMISSION_DENIED' ? '#b45309' : '#b91c1c')
                    }}>
                      {firestoreStatus?.status || 'OFFLINE'}
                    </span>
                  </div>

                  {/* Database Init Progress Banner if running */}
                  {(isDbInitializing || dbInitResult) && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: isDbInitializing ? '#f0f9ff' : (dbInitResult?.success ? '#ecfdf5' : '#fef2f2'),
                      border: `1px solid ${isDbInitializing ? '#38bdf8' : (dbInitResult?.success ? '#10b981' : '#f87171')}`,
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isDbInitializing ? '6px' : '2px' }}>
                        <strong style={{ fontSize: '0.8rem', color: isDbInitializing ? '#0369a1' : (dbInitResult?.success ? '#065f46' : '#991b1b') }}>
                          {isDbInitializing ? 'Initializing Database...' : (dbInitResult?.success ? 'Database Initialized' : 'Initialization Status')}
                        </strong>
                        {dbInitProgress && isDbInitializing && (
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7' }}>{dbInitProgress.percent}%</span>
                        )}
                      </div>
                      {isDbInitializing && dbInitProgress && (
                        <div style={{ width: '100%', height: '5px', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                          <div style={{ width: `${dbInitProgress.percent}%`, height: '100%', background: '#0284c7', transition: 'width 0.3s ease' }} />
                        </div>
                      )}
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>
                        {isDbInitializing ? dbInitProgress?.message : dbInitResult?.message}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="input-label">Cloud Firestore Project</label>
                      <input className="admin-input" defaultValue="care-navigator-a8a2d" readOnly />
                    </div>
                    <div>
                      <label className="input-label">Database Initialization & Seeding</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={isDbInitializing || !firestoreStatus?.connected}
                          onClick={async () => {
                            if (typeof initializeDatabase === 'function') {
                              showToast('Initializing Cloud Firestore with baseline collections...');
                              const res = await initializeDatabase(true);
                              if (res?.success) {
                                showToast('Cloud Firestore initialized successfully!');
                              } else {
                                showToast(res?.message || 'Database initialization error', 'error');
                              }
                            }
                          }}
                          style={{
                            background: isDbInitializing ? '#94a3b8' : (firestoreStatus?.connected ? '#0284c7' : '#94a3b8'),
                            cursor: (isDbInitializing || !firestoreStatus?.connected) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Database size={14} className={isDbInitializing ? 'spin-icon' : ''} />
                          <span>{isDbInitializing ? 'Initializing DB...' : 'Initialize / Seed Database Now'}</span>
                        </button>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Seeds all 8 baseline collections (Accounts, Hospitals, Doctors, etc.)
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Jurisdiction & Authority</label>
                      <input className="admin-input" defaultValue="Government of Andhra Pradesh • Department of Health" />
                    </div>
                    <div>
                      <label className="input-label">108 Emergency Dispatch Hotline</label>
                      <input className="admin-input" defaultValue="108" />
                    </div>
                    <div>
                      <label className="input-label">National Universal Emergency Helpline</label>
                      <input className="admin-input" defaultValue="112" />
                    </div>
                  </div>
                </div>

                <div className="dashboard-panel">
                  <h3 className="panel-title">Security & Session Policy</h3>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="input-label">Session Inactivity Timeout (Minutes)</label>
                      <input className="admin-input" type="number" defaultValue={30} />
                    </div>
                    <div>
                      <label className="input-label">Auto-Refresh Interval (Seconds)</label>
                      <input className="admin-input" type="number" defaultValue={15} />
                    </div>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Mandatory 4-Digit Security PIN for Staff</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        Enforce PIN credential challenge on all doctor, receptionist, and responder logins.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Role Switcher Modal for Testing Permissions */}
      {showRoleModal && (
        <div className="admin-modal-overlay fade-in" onClick={() => setShowRoleModal(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Switch Active Simulated Role</h3>
              <button onClick={() => setShowRoleModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#475569' }}>
                Select an operational role to verify how the dashboard responds to different administrative access tiers:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Super Admin', 'Hospital Administrator', '108 Emergency Dispatcher', 'Doctor', 'Auditor'].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRole(r);
                      setShowRoleModal(false);
                      showToast(`Role switched to ${r}`);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: activeRole === r ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: activeRole === r ? '#f0f9ff' : '#ffffff',
                      color: activeRole === r ? '#0284c7' : '#0f172a',
                      fontWeight: '700',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{r}</span>
                    {activeRole === r && <Check size={16} color="#0284c7" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Clinical Dossier Drawer / Modal */}
      {selectedPatient && (
        <div className="admin-modal-overlay fade-in" onClick={() => setSelectedPatient(null)}>
          <div className="admin-modal-box large" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Patient Clinical Dossier</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ABHA ID: {selectedPatient.abhaId}</span>
              </div>
              <button onClick={() => setSelectedPatient(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div className="dossier-grid">
                <div>
                  <span className="lbl">FULL NAME</span>
                  <strong className="val">{selectedPatient.name}</strong>
                </div>
                <div>
                  <span className="lbl">AGE & GENDER</span>
                  <strong className="val">{selectedPatient.age} yrs • {selectedPatient.gender}</strong>
                </div>
                <div>
                  <span className="lbl">BLOOD GROUP</span>
                  <strong className="val text-red">{selectedPatient.bloodGroup}</strong>
                </div>
                <div>
                  <span className="lbl">PHONE NUMBER</span>
                  <strong className="val">{selectedPatient.phone}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">REGISTERED ADDRESS</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedPatient.address}</p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">KNOWN DRUG & CONTACT ALLERGIES</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {(selectedPatient.allergies || []).map(a => (
                    <span key={a} className="badge-pill red">{a}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">CHRONIC CONDITIONS & EHR SUMMARY</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  {(selectedPatient.chronicConditions || []).map(c => (
                    <span key={c} className="badge-pill amber">{c}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  className="btn-danger-sm"
                  onClick={() => {
                    handlePatientStatusChange(selectedPatient.id, selectedPatient.accountStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
                  }}
                >
                  {selectedPatient.accountStatus === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                </button>
                <button className="btn-primary" onClick={() => setSelectedPatient(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showBroadcastModal && (
        <div className="admin-modal-overlay fade-in" onClick={() => setShowBroadcastModal(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Dispatch Multi-Channel Broadcast</h3>
              <button onClick={() => setShowBroadcastModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSendBroadcast} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Broadcast Title</label>
                <input
                  className="admin-input"
                  required
                  placeholder="e.g. Critical Bed Availability Notice"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Target Audience Role</label>
                <select
                  className="admin-input"
                  value={broadcastForm.targetRole}
                  onChange={e => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                >
                  <option value="ALL">All Citizens & Staff</option>
                  <option value="PATIENTS">Registered Patients Only</option>
                  <option value="RESPONDERS">108 Ambulance Responders</option>
                  <option value="DOCTORS">Medical Officers / Doctors</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="input-label">Delivery Channel</label>
                <select
                  className="admin-input"
                  value={broadcastForm.channel}
                  onChange={e => setBroadcastForm({ ...broadcastForm, channel: e.target.value })}
                >
                  <option value="SMS & PUSH">SMS & Push Notification</option>
                  <option value="WHATSAPP & SMS">WhatsApp Verified & SMS</option>
                  <option value="IN_APP & EMAIL">In-App Banner & Email</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Message Content</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  required
                  placeholder="Enter broadcast communication text..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowBroadcastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={14} />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <div className="admin-modal-overlay fade-in" onClick={() => setSelectedHospital(null)}>
          <div className="admin-modal-box large" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedHospital.name}</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Registration: {selectedHospital.registrationNo || selectedHospital.id}</span>
              </div>
              <button onClick={() => setSelectedHospital(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div className="dossier-grid">
                <div>
                  <span className="lbl">FACILITY TYPE</span>
                  <strong className="val">{selectedHospital.type}</strong>
                </div>
                <div>
                  <span className="lbl">DISTRICT</span>
                  <strong className="val">{selectedHospital.district}</strong>
                </div>
                <div>
                  <span className="lbl">CONTACT PHONE</span>
                  <strong className="val">{selectedHospital.phone}</strong>
                </div>
                <div>
                  <span className="lbl">ACCREDITATION</span>
                  <strong className="val text-blue">{selectedHospital.accreditation}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">FACILITY LOCATION</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedHospital.location}</p>
              </div>

              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span className="lbl">EMERGENCY BEDS</span>
                  <strong style={{ fontSize: '1.2rem', color: '#0284c7', display: 'block', marginTop: '4px' }}>
                    {selectedHospital.emergencyBeds} / {selectedHospital.totalEmergencyBeds || selectedHospital.emergencyBeds}
                  </strong>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span className="lbl">ICU BEDS</span>
                  <strong style={{ fontSize: '1.2rem', color: '#8b5cf6', display: 'block', marginTop: '4px' }}>
                    {selectedHospital.icuBeds} / {selectedHospital.totalIcuBeds || selectedHospital.icuBeds}
                  </strong>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span className="lbl">VENTILATORS</span>
                  <strong style={{ fontSize: '1.2rem', color: '#10b981', display: 'block', marginTop: '4px' }}>
                    {selectedHospital.ventilators} / {selectedHospital.totalVentilators || selectedHospital.ventilators}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">SPECIALTIES OFFERED</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {(selectedHospital.specialties || []).map(s => (
                    <span key={s} className="badge-pill blue">{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {selectedHospital.status === 'PENDING_REVIEW' && (
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      handleHospitalStatusChange(selectedHospital.id, 'VERIFIED');
                      setSelectedHospital(null);
                    }}
                  >
                    Approve & Verify Hospital
                  </button>
                )}
                {selectedHospital.status === 'VERIFIED' && (
                  <button 
                    className="btn-danger-sm"
                    onClick={() => {
                      handleHospitalStatusChange(selectedHospital.id, 'SUSPENDED');
                      setSelectedHospital(null);
                    }}
                  >
                    Suspend Facility
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setSelectedHospital(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="admin-modal-overlay fade-in" onClick={() => setSelectedDoctor(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedDoctor.name}</h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Council ID: {selectedDoctor.regCouncilId || selectedDoctor.id}</span>
              </div>
              <button onClick={() => setSelectedDoctor(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="dossier-grid">
                <div>
                  <span className="lbl">SPECIALTY</span>
                  <strong className="val">{selectedDoctor.specialty}</strong>
                </div>
                <div>
                  <span className="lbl">HOSPITAL</span>
                  <strong className="val">{selectedDoctor.hospital}</strong>
                </div>
                <div>
                  <span className="lbl">CONSULTATION FEE</span>
                  <strong className="val text-blue">{selectedDoctor.fee}</strong>
                </div>
                <div>
                  <span className="lbl">DUTY SHIFT</span>
                  <strong className="val">{selectedDoctor.dutyShift || '09:00 AM - 05:00 PM'}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span className="lbl">QUALIFICATIONS</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedDoctor.qualifications || 'MBBS, MD'}</p>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className={`status-toggle-btn ${selectedDoctor.isAvailable ? 'online' : 'offline'}`}
                  onClick={() => {
                    handleDoctorAvailabilityToggle(selectedDoctor.id);
                    setSelectedDoctor(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
                  }}
                >
                  <span className="dot" />
                  <span>{selectedDoctor.isAvailable ? 'ON DUTY (AVAILABLE)' : 'OFFLINE (OFF DUTY)'}</span>
                </button>
                <button className="btn-primary" onClick={() => setSelectedDoctor(null)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showAddPatientModal && (
        <div className="admin-modal-overlay fade-in" onClick={() => setShowAddPatientModal(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Register New Patient Account</h3>
              <button onClick={() => setShowAddPatientModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreatePatient} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label className="input-label">Full Legal Name *</label>
                <input
                  className="admin-input"
                  required
                  placeholder="e.g. Kondaveeti Lakshmi"
                  value={newPatientForm.name}
                  onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label">Phone Number *</label>
                  <input
                    className="admin-input"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newPatientForm.phone}
                    onChange={e => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Aadhaar (12 digits)</label>
                  <input
                    className="admin-input"
                    placeholder="e.g. 5432 1098 7654"
                    value={newPatientForm.aadhaar}
                    onChange={e => setNewPatientForm({ ...newPatientForm, aadhaar: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label">Age</label>
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="e.g. 35"
                    value={newPatientForm.age}
                    onChange={e => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select
                    className="admin-input"
                    value={newPatientForm.gender}
                    onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Blood Group</label>
                  <select
                    className="admin-input"
                    value={newPatientForm.bloodGroup}
                    onChange={e => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Residential Address</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Market Yard Road, Narasaraopet, AP"
                  value={newPatientForm.address}
                  onChange={e => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddPatientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Register Patient</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Hospital Modal */}
      {showAddHospitalModal && (
        <div className="admin-modal-overlay fade-in" onClick={() => setShowAddHospitalModal(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Register Healthcare Facility</h3>
              <button onClick={() => setShowAddHospitalModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateHospital} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label className="input-label">Hospital / Clinic Name *</label>
                <input
                  className="admin-input"
                  required
                  placeholder="e.g. Narasaraopet Community Health Center"
                  value={newHospitalForm.name}
                  onChange={e => setNewHospitalForm({ ...newHospitalForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label">Facility Type</label>
                  <select
                    className="admin-input"
                    value={newHospitalForm.type}
                    onChange={e => setNewHospitalForm({ ...newHospitalForm, type: e.target.value })}
                  >
                    <option value="Govt Super Specialty Hospital">Govt Super Specialty</option>
                    <option value="District Govt Area Hospital">District Govt Area Hospital</option>
                    <option value="Tertiary Super Specialty & Cardiac ICU">Tertiary Specialty ICU</option>
                    <option value="Specialized Maternity & Pediatric Hospital">Maternity & Pediatric</option>
                    <option value="Primary Care & OPD Clinic">Primary Care & OPD Clinic</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">District</label>
                  <input
                    className="admin-input"
                    placeholder="e.g. Palnadu / Guntur"
                    value={newHospitalForm.district}
                    onChange={e => setNewHospitalForm({ ...newHospitalForm, district: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label">Emergency Beds</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={newHospitalForm.emergencyBeds}
                    onChange={e => setNewHospitalForm({ ...newHospitalForm, emergencyBeds: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">ICU Beds</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={newHospitalForm.icuBeds}
                    onChange={e => setNewHospitalForm({ ...newHospitalForm, icuBeds: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Ventilators</label>
                  <input
                    className="admin-input"
                    type="number"
                    value={newHospitalForm.ventilators}
                    onChange={e => setNewHospitalForm({ ...newHospitalForm, ventilators: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Emergency Desk Phone</label>
                <input
                  className="admin-input"
                  placeholder="e.g. 08647 220108"
                  value={newHospitalForm.phone}
                  onChange={e => setNewHospitalForm({ ...newHospitalForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddHospitalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Register Facility</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Doctor Modal */}
      {showAddDoctorModal && (
        <div className="admin-modal-overlay fade-in" onClick={() => setShowAddDoctorModal(false)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Register Medical Officer</h3>
              <button onClick={() => setShowAddDoctorModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateDoctor} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label className="input-label">Doctor Full Name *</label>
                <input
                  className="admin-input"
                  required
                  placeholder="e.g. Dr. Raghavendra Rao"
                  value={newDoctorForm.name}
                  onChange={e => setNewDoctorForm({ ...newDoctorForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label">Clinical Specialty</label>
                  <select
                    className="admin-input"
                    value={newDoctorForm.specialty}
                    onChange={e => setNewDoctorForm({ ...newDoctorForm, specialty: e.target.value })}
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Trauma & Emergency">Trauma & Emergency</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Consultation Fee</label>
                  <input
                    className="admin-input"
                    placeholder="e.g. ₹300 or Free"
                    value={newDoctorForm.fee}
                    onChange={e => setNewDoctorForm({ ...newDoctorForm, fee: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="input-label">Associated Hospital</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Government General Hospital (GGH)"
                  value={newDoctorForm.hospital}
                  onChange={e => setNewDoctorForm({ ...newDoctorForm, hospital: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="input-label">Direct Contact Phone</label>
                <input
                  className="admin-input"
                  placeholder="e.g. +91 98765 00001"
                  value={newDoctorForm.phone}
                  onChange={e => setNewDoctorForm({ ...newDoctorForm, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddDoctorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={14} />
                  <span>Register Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Styles for Enterprise Healthcare SaaS Dashboard */}
      <style>{`
        .admin-root-container {
          width: 100%;
          min-height: 100vh;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-main, 'Inter', -apple-system, sans-serif);
          overflow: hidden;
        }

        /* Top Header */
        .admin-top-header {
          height: 64px;
          flex-shrink: 0;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 100;
        }

        .header-brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .brand-emblem {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.4);
        }

        .brand-title-line {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-main {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .brand-sub-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .brand-motto {
          margin: 0;
          font-size: 0.68rem;
          color: #94a3b8;
        }

        .header-search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 6px 14px;
          width: 380px;
          transition: all 0.2s ease;
        }

        .header-search-bar:focus-within {
          background: rgba(255,255,255,0.14);
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
        }

        .header-search-bar input {
          background: none;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.8rem;
          width: 100%;
        }

        .header-search-bar input::placeholder {
          color: #94a3b8;
        }

        .search-clear-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .header-right-tools {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-system-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #94a3b8;
        }

        .admin-system-indicator.connected {
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.3);
        }

        .dot-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .role-selector-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-selector-pill:hover {
          background: rgba(255,255,255,0.16);
          border-color: #38bdf8;
        }

        .header-tool-btn {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .header-tool-btn.red-alert {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: #f87171;
        }

        .badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 999px;
          border: 1.5px solid #0f172a;
        }

        .admin-profile-menu {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 6px;
        }

        .exit-admin-btn, .logout-admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .logout-admin-btn:hover {
          background: #ef4444;
          border-color: #ef4444;
        }

        /* Layout Body */
        .admin-layout-body {
          display: flex;
          flex: 1;
          height: calc(100vh - 64px);
          overflow: hidden;
        }

        /* Left Sidebar */
        .admin-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
        }

        .admin-sidebar.collapsed {
          width: 72px;
        }

        .admin-sidebar.collapsed .nav-label,
        .admin-sidebar.collapsed .sidebar-title,
        .admin-sidebar.collapsed .nav-badge,
        .admin-sidebar.collapsed .sidebar-footer {
          display: none;
        }

        .sidebar-header {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }

        .sidebar-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .sidebar-collapse-toggle {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .sidebar-nav {
          padding: 10px 8px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .nav-item.active {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 800;
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .nav-badge {
          margin-left: auto;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 999px;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .footer-system-card {
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot-green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        /* Viewport Area */
        .admin-viewport {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f8fafc;
        }

        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .pane-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .pane-title {
          margin: 0 0 4px;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .pane-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .pane-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          background: #0284c7;
          border: none;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #0369a1;
          transform: translateY(-1px);
        }

        .btn-primary.red {
          background: #dc2626;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
        }

        .btn-outline-sm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-success-sm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          background: #10b981;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-danger-sm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary-sm {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          background: #0284c7;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* Metric Stat Cards Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }

        .stat-card.red-glow {
          border-color: #fca5a5;
          background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.04em;
        }

        .stat-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-box.blue { background: #e0f2fe; color: #0284c7; }
        .stat-icon-box.teal { background: #ccfbf1; color: #0d9488; }
        .stat-icon-box.purple { background: #f3e8ff; color: #9333ea; }
        .stat-icon-box.emerald { background: #d1fae5; color: #059669; }
        .stat-icon-box.red { background: #fee2e2; color: #dc2626; }
        .stat-icon-box.amber { background: #fef3c7; color: #d97706; }

        .stat-value {
          font-size: 1.7rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          display: block;
        }

        .stat-footer {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
        }

        .stat-trend.positive { color: #059669; font-weight: 700; }
        .stat-trend.warning { color: #d97706; font-weight: 700; }
        .stat-trend.negative { color: #dc2626; font-weight: 700; }
        .stat-note { color: #94a3b8; }

        /* Panels */
        .overview-split-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 20px;
        }

        .dashboard-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .panel-title {
          margin: 0 0 2px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .panel-subtitle {
          margin: 0;
          font-size: 0.78rem;
          color: #64748b;
        }

        /* Visual Bar Chart */
        .chart-visual-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-bars-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 190px;
          padding-top: 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .chart-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .bars-group {
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }

        .bar {
          width: 14px;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }

        .bar-op { background: #0284c7; }
        .bar-emg { background: #ef4444; }

        .col-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.blue { background: #0284c7; }
        .legend-dot.red { background: #ef4444; }

        /* Audit Feed */
        .audit-feed-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .audit-feed-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .audit-badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .audit-badge-icon.success { background: #d1fae5; color: #047857; }
        .audit-badge-icon.warning { background: #fef3c7; color: #b45309; }

        .audit-content {
          flex: 1;
        }

        .audit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .audit-action {
          font-size: 0.8rem;
          color: #0f172a;
        }

        .audit-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .audit-desc {
          margin: 0 0 3px;
          font-size: 0.74rem;
          color: #475569;
        }

        .audit-actor {
          font-size: 0.68rem;
          color: #64748b;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          background: #ffffff;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 6px 12px;
          width: 320px;
        }

        .search-input-wrap input {
          border: none;
          background: none;
          outline: none;
          font-size: 0.8rem;
          color: #0f172a;
          width: 100%;
        }

        .filter-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 5px 12px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .filter-chip:hover {
          background: #f1f5f9;
        }

        .filter-chip.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* Tables */
        .table-responsive-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-data-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-data-table td {
          padding: 12px 16px;
          font-size: 0.82rem;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .admin-data-table tr:hover td {
          background: #f8fafc;
        }

        .patient-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .patient-avatar-mini {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0284c7;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doctor-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #e0f2fe;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .patient-name-text {
          font-size: 0.85rem;
          color: #0f172a;
          display: block;
        }

        .patient-abha-text {
          font-size: 0.7rem;
          color: #64748b;
          font-family: monospace;
        }

        .mono-text {
          font-family: monospace;
          font-size: 0.78rem;
        }

        .mono-text.bold {
          font-weight: 700;
          color: #0f172a;
        }

        .badge-blood {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 6px;
          background: #fee2e2;
          color: #dc2626;
        }

        .badge-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .badge-pill.blue { background: #e0f2fe; color: #0369a1; }
        .badge-pill.emerald { background: #d1fae5; color: #047857; }
        .badge-pill.amber { background: #fef3c7; color: #b45309; }
        .badge-pill.red { background: #fee2e2; color: #b91c1c; }
        .badge-pill.teal { background: #ccfbf1; color: #0f766e; }

        .status-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .status-badge.active, .status-badge.verified {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-badge.pending, .status-badge.pending_review {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .status-badge.flagged {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .status-badge.suspended, .status-badge.cancelled {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .status-badge.serving, .status-badge.dispatched {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .status-badge.transporting {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #ffedd5;
        }

        .status-badge.resolved {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-btn-sm {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .action-btn-sm:hover { background: #e2e8f0; color: #0f172a; }
        .action-btn-sm.danger:hover { background: #fee2e2; color: #dc2626; }
        .action-btn-sm.success:hover { background: #d1fae5; color: #059669; }

        .status-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .status-toggle-btn.online { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
        .status-toggle-btn.offline { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
        .status-toggle-btn .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-toggle-btn.online .dot { background: #10b981; }
        .status-toggle-btn.offline .dot { background: #94a3b8; }

        /* Hospital Cards Grid */
        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 16px;
        }

        .hospital-card-admin {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .hosp-name-text {
          margin: 0 0 2px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .hosp-type-text {
          margin: 0;
          font-size: 0.78rem;
          color: #0284c7;
          font-weight: 600;
        }

        .hosp-address-text {
          margin: 4px 0 0;
          font-size: 0.74rem;
          color: #64748b;
        }

        .hosp-capacity-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          background: #f8fafc;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
        }

        .cap-box {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .cap-val {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
        }

        .cap-lbl {
          font-size: 0.65rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .specialties-tag-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .spec-tag {
          font-size: 0.68rem;
          padding: 2px 7px;
          border-radius: 4px;
          background: #f1f5f9;
          color: #475569;
          font-weight: 600;
        }

        .hosp-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .accreditation-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #0284c7;
        }

        .btn-group-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* 108 Emergency Cards */
        .emergencies-card-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .emergency-dispatch-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .emergency-dispatch-card.code_red {
          border-color: #fca5a5;
          background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
        }

        .emergency-dispatch-card.code_amber {
          border-color: #fde68a;
          background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
        }

        .emg-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .priority-tag {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .priority-tag.code_red { background: #fee2e2; color: #dc2626; border: 1px solid #f87171; }
        .priority-tag.code_amber { background: #fef3c7; color: #b45309; border: 1px solid #fbbf24; }
        .priority-tag.code_green { background: #d1fae5; color: #047857; border: 1px solid #6ee7b7; }

        .emg-id-text { font-family: monospace; font-size: 0.88rem; color: #0f172a; }
        .emg-time-text { font-size: 0.75rem; color: #64748b; }
        .emg-type-text { margin: 0 0 4px; font-size: 1.05rem; font-weight: 800; color: #0f172a; }
        .emg-location-text { margin: 0 0 12px; font-size: 0.82rem; color: #475569; }

        .emg-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          background: rgba(255,255,255,0.7);
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.06);
          margin-bottom: 12px;
        }

        .emg-meta-box .lbl { display: block; font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .emg-meta-box .val { font-size: 0.8rem; color: #0f172a; }
        .emg-meta-box .val.text-blue { color: #0284c7; }

        .emg-notes-alert {
          font-size: 0.78rem;
          color: #991b1b;
          background: #fee2e2;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .emg-actions-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .eta-badge {
          font-size: 0.8rem;
          color: #0f172a;
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        /* AI Grid */
        .ai-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .ai-stat-card {
          background: #ffffff;
          padding: 18px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .ai-stat-card.red { border-color: #fca5a5; background: #fff1f2; }
        .ai-stat-card .lbl { font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
        .ai-stat-card .sub { font-size: 0.72rem; color: #64748b; display: block; margin-top: 4px; }

        .keyword-chip-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .keyword-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        /* Roles & Settings Grid */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .role-card-admin {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
        }

        .permissions-chip-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .perm-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #0f172a;
          background: #f1f5f9;
          padding: 2px 7px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .settings-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 20px;
        }

        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 4px;
        }

        .admin-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.82rem;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
        }

        .admin-input:focus { border-color: #0284c7; }

        .admin-textarea {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1.5px solid #cbd5e1;
          font-size: 0.82rem;
          color: #0f172a;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .admin-textarea:focus { border-color: #0284c7; }

        /* Notification Template Card */
        .notification-tpl-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
        }

        /* Toast */
        .admin-toast-banner {
          position: fixed;
          top: 76px;
          right: 24px;
          z-index: 9999;
          padding: 12px 18px;
          border-radius: 10px;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .admin-toast-banner.error { background: #dc2626; }
        .admin-toast-banner button { background: none; border: none; color: #ffffff; cursor: pointer; }

        /* Modals */
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(6px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .admin-modal-box {
          background: #ffffff;
          border-radius: 18px;
          width: 100%;
          max-width: 460px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          border: 1px solid #e2e8f0;
        }

        .admin-modal-box.large {
          max-width: 600px;
        }

        .modal-top {
          padding: 16px 20px;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-top h3 { margin: 0; font-size: 1rem; font-weight: 800; color: #ffffff; }
        .modal-top button { background: none; border: none; color: #ffffff; cursor: pointer; }

        .dossier-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .dossier-grid .lbl { font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; }
        .dossier-grid .val { font-size: 0.85rem; color: #0f172a; }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
          .overview-split-grid {
            grid-template-columns: 1fr;
          }
          .header-search-bar {
            display: none;
          }
          .mobile-menu-toggle {
            display: block;
          }
          .admin-sidebar {
            position: fixed;
            top: 64px;
            bottom: 0;
            left: -260px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          }
          .admin-sidebar.mobile-open {
            left: 0;
          }
        }

        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
          .admin-viewport {
            padding: 14px 12px 80px;
          }
          .stat-value {
            font-size: 1.4rem;
          }
          .hospitals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
