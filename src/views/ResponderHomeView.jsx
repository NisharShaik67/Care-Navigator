import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Ambulance, 
  PhoneCall, 
  Navigation2, 
  MapPin, 
  Bell, 
  Menu, 
  X, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  Map as MapIcon, 
  History, 
  User, 
  ExternalLink, 
  Info, 
  LogOut, 
  Compass,
  RotateCcw
} from 'lucide-react';
import { 
  saveEmergencyDispatchToFirestore, 
  updateEmergencyDispatchInFirestore, 
  subscribeEmergenciesFromFirestore 
} from '../firebase/firestoreService';

export const ResponderHomeView = () => {
  const { user, logout, navigateTo, returnToPatientPortal } = useApp();

  // Active Bottom Navigation Tab: 'home', 'history', 'map', 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Drawer & Modal States
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);
  const [viewAllCallsModal, setViewAllCallsModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');


  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Device GPS Location State
  const [gpsActive, setGpsActive] = useState(false);
  const [_gpsError, setGpsError] = useState('');
  const [_userCoords, setUserCoords] = useState({ lat: 16.1519, lng: 80.0494 });

  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsActive(true);
        showToast(`📍 Live GPS Locked: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`);
      },
      (_error) => {
        setGpsError('GPS permission denied or unavailable. Using base station coordinates.');
        showToast('⚠️ GPS location permission denied. Using station coordinates.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // New Incoming Emergency Request State
  const [incomingRequest, setIncomingRequest] = useState({
    id: 'EMG-2026-9481',
    type: 'Severe Cardiac Arrest & Respiratory Distress',
    severity: 'CODE RED • IMMEDIATE CRITICAL',
    distance: '1.8 km',
    eta: '3 mins',
    callerName: 'Rajesh M. (Bystander)',
    callerPhone: '+91 98765 11223',
    patientName: 'K. Somasekhar',
    patientAge: '58',
    patientGender: 'MALE',
    patientBlood: 'B+',
    address: 'Near Clock Tower Junction, Main Bazaar, Narasaraopet, AP',
    symptoms: 'Sudden collapse, severe chest clutching, unresponsive, breathing labored.',
    instructions: 'Bystander initiating chest compressions. Dispatch ALS defibrillator unit immediately.',
    timestamp: 'Just now (1 min ago)'
  });

  // Current Active Emergency State
  const [currentEmergency, setCurrentEmergency] = useState({
    id: 'EMG-2026-042',
    type: 'Severe Road Traffic Accident & Multiple Trauma',
    severity: 'HIGH PRIORITY • IMMEDIATE DISPATCH',
    status: 'ACTIVE', // 'ACTIVE', 'ARRIVED', 'TRANSPORTING', 'COMPLETED'
    distanceKm: 2.4,
    etaMinutes: 4,
    ambulanceProgress: 52,
    patientName: 'Alex Rivera',
    patientAge: '28',
    patientGender: 'MALE',
    patientBlood: 'O+',
    patientPhone: '+91 98765 43210',
    pickupAddress: 'House 14, Collectorate Road, Near RTC Bus Terminal, Narasaraopet, Palnadu Dist, AP - 522601',
    coordinates: { lat: 16.151944, lng: 80.049444 },
    allergies: 'Penicillin, Dust',
    precautions: 'Patient has mild gastritis history. Avoid NSAID analgesics. Maintain oxygen saturation above 95%.',
    targetHospital: 'Government General Hospital (GGH), Guntur - Trauma ICU',
    handoverDoctor: 'Dr. K. Srinivas Rao, MD (Cardiology/Trauma)',
    reportedTime: '10:14 AM'
  });

  // Today's Emergency Calls List
  const [emergencyCalls, setEmergencyCalls] = useState([
    {
      id: 'EMG-2026-042',
      type: 'Severe Road Traffic Accident & Multiple Trauma',
      distance: '2.4 km',
      status: 'Active',
      time: '10:14 AM',
      patientName: 'Alex Rivera',
      hospital: 'GGH Guntur Trauma ER'
    },
    {
      id: 'EMG-2026-039',
      type: 'Motorcycle Collision with Head Injury',
      distance: '3.2 km',
      status: 'En Route',
      time: '09:30 AM',
      patientName: 'S. Venkat Rao',
      hospital: 'Area Hospital Narasaraopet'
    },
    {
      id: 'EMG-2026-035',
      type: 'Acute Respiratory Distress & Asthma Attack',
      distance: '2.1 km',
      status: 'Arrived',
      time: '08:45 AM',
      patientName: 'M. Lakshmi Devi',
      hospital: 'GGH Guntur Pulmonary ER'
    },
    {
      id: 'EMG-2026-028',
      type: 'Senior Citizen Fall Injury & Hip Fracture',
      distance: '4.5 km',
      status: 'Completed',
      time: '07:15 AM',
      patientName: 'B. Appa Rao (72 yrs)',
      hospital: 'Area Hospital Narasaraopet'
    },
    {
      id: 'EMG-2026-021',
      type: 'Pediatric High Febrile Seizure',
      distance: '1.5 km',
      status: 'Completed',
      time: '06:10 AM',
      patientName: 'Baby Ananya (3 yrs)',
      hospital: 'GGH Guntur Pediatric ER'
    }
  ]);

  // Notifications List
  const [notifications] = useState([
    {
      id: 'notif-1',
      title: '🚨 High Priority Dispatch Assigned',
      desc: 'Severe Cardiac Emergency reported at Main Bazaar. Request ID: EMG-2026-9481.',
      time: '1m ago',
      urgent: true
    },
    {
      id: 'notif-2',
      title: '🏥 GGH Guntur Trauma ER Standby',
      desc: 'Trauma ICU Bed #03 reserved with Dr. Srinivas Rao ready for arrival.',
      time: '12m ago',
      urgent: false
    },
    {
      id: 'notif-3',
      title: '🚦 Traffic Alert: Express Highway',
      desc: 'Sector 4 flyover experiencing light congestion. Alternate via Ring Road.',
      time: '35m ago',
      urgent: false
    }
  ]);

  // Subscribe to real-time Cloud Firestore emergency dispatches
  useEffect(() => {
    const unsub = subscribeEmergenciesFromFirestore((list) => {
      if (list && list.length > 0) {
        setEmergencyCalls(prev => {
          const callMap = {};
          (list || []).forEach(item => {
            if (item && item.id) callMap[item.id] = item;
          });
          (prev || []).forEach(item => {
            if (item && item.id && !callMap[item.id]) callMap[item.id] = item;
          });
          return Object.values(callMap);
        });
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Actions
  const handleAcceptNewRequest = () => {
    if (!incomingRequest) return;
    const acceptedData = {
      id: incomingRequest.id,
      type: incomingRequest.type,
      severity: incomingRequest.severity,
      status: 'ACTIVE',
      distanceKm: 1.8,
      etaMinutes: 3,
      ambulanceProgress: 20,
      patientName: incomingRequest.patientName,
      patientAge: incomingRequest.patientAge,
      patientGender: incomingRequest.patientGender,
      patientBlood: incomingRequest.patientBlood,
      patientPhone: incomingRequest.callerPhone,
      pickupAddress: incomingRequest.address,
      coordinates: { lat: 16.1550, lng: 80.0520 },
      allergies: 'None reported',
      precautions: incomingRequest.symptoms,
      targetHospital: 'Government General Hospital (GGH), Guntur',
      handoverDoctor: 'Duty Medical Officer, GGH ER',
      reportedTime: 'Just Now'
    };
    setCurrentEmergency(acceptedData);

    // Save to Cloud Firestore
    try {
      saveEmergencyDispatchToFirestore({
        ...acceptedData,
        driverName: user?.name || 'Ravi Kumar',
        vehicleNo: user?.vehicleNo || 'AP 07 TE 1084'
      });
    } catch (e) {
      console.warn('[Firestore] Failed to save dispatch:', e);
    }

    // Update today's calls list
    setEmergencyCalls(prev => [
      {
        id: incomingRequest.id,
        type: incomingRequest.type,
        distance: incomingRequest.distance,
        status: 'Active',
        time: 'Just Now',
        patientName: incomingRequest.patientName,
        hospital: 'GGH Guntur Trauma ER'
      },
      ...prev
    ]);

    setIncomingRequest(null);
    showToast(`✅ Dispatch Accepted! En route to ${incomingRequest.patientName} (${incomingRequest.id}).`);
  };

  const handleMarkArrived = () => {
    setCurrentEmergency(prev => ({
      ...prev,
      status: 'ARRIVED',
      distanceKm: 0.0,
      etaMinutes: 0,
      ambulanceProgress: 100
    }));
    setEmergencyCalls(prev => prev.map(c => c.id === currentEmergency?.id ? { ...c, status: 'Arrived' } : c));
    showToast('📍 Arrived at Patient Location. Paramedic EMT Team on site.');

    if (currentEmergency?.id) {
      try {
        updateEmergencyDispatchInFirestore(currentEmergency.id, { status: 'ARRIVED' });
      } catch {}
    }
  };

  const handleStartTransport = () => {
    setCurrentEmergency(prev => ({
      ...prev,
      status: 'TRANSPORTING',
      distanceKm: 5.6,
      etaMinutes: 7,
      ambulanceProgress: 60
    }));
    setEmergencyCalls(prev => prev.map(c => c.id === currentEmergency?.id ? { ...c, status: 'En Route' } : c));
    showToast('🚑 Transporting patient to GGH Guntur Emergency Trauma Hub.');

    if (currentEmergency?.id) {
      try {
        updateEmergencyDispatchInFirestore(currentEmergency.id, { status: 'TRANSPORTING' });
      } catch {}
    }
  };

  const handleCompleteMission = () => {
    const emgId = currentEmergency?.id;
    setEmergencyCalls(prev => prev.map(c => c.id === emgId ? { ...c, status: 'Completed' } : c));
    showToast(`🎉 Mission ${emgId || ''} Completed! Handover finalized at hospital.`);
    setCurrentEmergency(null);

    if (emgId) {
      try {
        updateEmergencyDispatchInFirestore(emgId, { status: 'COMPLETED' });
      } catch {}
    }
  };

  // Google Maps Directions Launcher
  const handleOpenGoogleMaps = () => {
    if (!currentEmergency) return;
    const dest = `${currentEmergency.coordinates.lat},${currentEmergency.coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Phone Call Launcher
  const _handleCallPatient = (phone) => {
    const clean = String(phone || '').replace(/\D/g, '');
    if (clean) {
      window.location.href = `tel:${clean}`;
    }
  };

  // Helper for Status Badge Color
  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'active') {
      return { bg: '#fef2f2', color: '#dc2626', border: '#f87171', label: 'ACTIVE' };
    }
    if (s === 'en route' || s === 'transporting') {
      return { bg: '#fff7ed', color: '#ea580c', border: '#fdba74', label: 'EN ROUTE' };
    }
    if (s === 'arrived') {
      return { bg: '#f0f9ff', color: '#0284c7', border: '#7dd3fc', label: 'ARRIVED' };
    }
    return { bg: '#f0fdf4', color: '#16a34a', border: '#86efac', label: 'COMPLETED' };
  };

  const driverName = user?.name || 'Ravi Kumar';
  const vehicleNumber = user?.vehicleNo || 'AP 07 TE 1084';
  const baseStation = user?.baseStation || 'GGH Guntur Fleet Hub';

  return (
    <div className="responder-dashboard-root">
      {/* 2. Care Navigator Header */}
      <header className="responder-header">
        <div className="header-inner">
          <div className="header-left">
            <button 
              className="icon-btn-hamburger" 
              onClick={() => setMenuOpen(true)}
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <Menu size={24} color="#0f172a" />
            </button>
            <div className="header-brand" onClick={() => setActiveTab('home')}>
              <div className="brand-title-row">
                <span className="brand-name">Care Navigator</span>
                <span className="status-live-pill">
                  <span className="live-dot-pulse"></span>
                  108 DISPATCH
                </span>
              </div>
              <span className="brand-tagline">“Guiding Every Life to Safety”</span>
            </div>
          </div>

          <div className="header-right">
            <button 
              className="icon-btn-utility notification-btn"
              onClick={() => setNotificationsOpen(true)}
              title="Emergency Notifications"
            >
              <Bell size={20} color="#0f172a" />
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Toast Notification */}
      {toastMsg && (
        <div className="responder-toast-banner fade-in">
          <Info size={18} color="#0284c7" />
          <span>{toastMsg}</span>
          <button className="toast-close" onClick={() => setToastMsg('')}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Viewport Content based on active bottom navigation tab */}
      <main className="responder-main-viewport">
        {activeTab === 'home' && (
          <div className="tab-pane-content fade-in">
            {/* 3. Driver Profile Section */}
            <section className="driver-profile-card">
              <div className="driver-profile-top">
                <div className="driver-avatar-box">
                  <div className="driver-avatar">
                    <Ambulance size={28} color="#0284c7" />
                  </div>
                  <div className="driver-identity">
                    <div className="driver-name-row">
                      <h2 className="driver-name">{driverName}</h2>
                      <span className="badge-available">
                        <span className="green-pulse-dot"></span>
                        AVAILABLE • ACTIVE DISPATCH
                      </span>
                    </div>
                    <p className="driver-role">Ambulance Driver / Responder</p>
                    <p className="driver-vehicle-info">
                      Ambulance: <strong className="highlight-text">{vehicleNumber}</strong> • {baseStation}
                    </p>
                  </div>
                </div>

                <div className="driver-station-badge">
                  <span className="station-pill">UNIT ALS #04</span>
                  <span className="station-name">24/7 108 FLEET HUB</span>
                </div>
              </div>

              {/* Real-time Fleet Metrics Bar */}
              <div className="fleet-metrics-strip">
                <div className="metric-item">
                  <Clock size={16} color="#0284c7" />
                  <div>
                    <span className="metric-val">3.8 mins</span>
                    <span className="metric-lbl">Avg Response</span>
                  </div>
                </div>
                <div className="metric-item">
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <span className="metric-val">5 / 5</span>
                    <span className="metric-lbl">Calls Handled</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. New Emergency Request Section (Prominent Red Alert Card) */}
            {incomingRequest ? (
              <section className="new-emergency-alert-card">
                <div className="alert-header">
                  <div className="alert-pulse-tag">
                    <span className="siren-flash-icon">🚨</span>
                    <span className="alert-tag-text">NEW EMERGENCY REQUEST • HIGH PRIORITY</span>
                  </div>
                  <span className="alert-time-tag">{incomingRequest.timestamp}</span>
                </div>

                <div className="alert-body">
                  <div className="alert-main-info">
                    <h3 className="alert-type">{incomingRequest.type}</h3>
                    <p className="alert-address">
                      <MapPin size={16} color="#dc2626" className="inline-icon" />
                      {incomingRequest.address}
                    </p>
                  </div>

                  <div className="alert-metrics-grid">
                    <div className="alert-metric-box">
                      <span className="metric-title">REQUEST ID</span>
                      <strong className="metric-strong font-mono">{incomingRequest.id}</strong>
                    </div>
                    <div className="alert-metric-box">
                      <span className="metric-title">DISTANCE</span>
                      <strong className="metric-strong text-red">{incomingRequest.distance}</strong>
                    </div>
                    <div className="alert-metric-box">
                      <span className="metric-title">ESTIMATED ETA</span>
                      <strong className="metric-strong text-red">{incomingRequest.eta}</strong>
                    </div>
                    <div className="alert-metric-box">
                      <span className="metric-title">CALLER</span>
                      <strong className="metric-strong">{incomingRequest.callerName}</strong>
                    </div>
                  </div>

                  <div className="alert-action-buttons">
                    <button 
                      className="btn-alert-secondary" 
                      onClick={() => setViewDetailsModal(incomingRequest)}
                    >
                      <Info size={18} />
                      <span>View Details</span>
                    </button>
                    <button 
                      className="btn-alert-primary" 
                      onClick={handleAcceptNewRequest}
                    >
                      <CheckCircle2 size={18} />
                      <span>Accept Dispatch Mission</span>
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="standby-notice-box">
                <div className="standby-inner">
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#065f46' }}>
                      All New Dispatches Cleared
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#047857' }}>
                      Standby at station or en route to assigned patient. Next incoming emergency will notify here instantly.
                    </p>
                  </div>
                </div>
                <button 
                  className="btn-simulate-sos"
                  onClick={() => {
                    setIncomingRequest({
                      id: `EMG-2026-${Math.floor(Math.random() * 8000 + 1000)}`,
                      type: 'Acute Trauma & Multi-Vehicle Collision',
                      severity: 'CODE RED • CRITICAL TRIAGE',
                      distance: '2.1 km',
                      eta: '4 mins',
                      callerName: 'Traffic Police Inspector G. Reddy',
                      callerPhone: '+91 98765 22446',
                      patientName: 'R. Koteswara Rao (42 yrs)',
                      patientAge: '42',
                      patientGender: 'MALE',
                      patientBlood: 'A+',
                      address: 'Near Vinukonda Road Bypass Overbridge, Narasaraopet, AP',
                      symptoms: 'Blunt thoracic trauma, open fracture, active bleeding, GCS score 11.',
                      instructions: 'Spinal immobilization and pressure dressing required before transit.',
                      timestamp: 'Just now'
                    });
                    showToast('🚨 Incoming Emergency Dispatch Triggered!');
                  }}
                  title="Simulate incoming dispatch request"
                >
                  <RefreshCw size={14} />
                  <span>Simulate New Call</span>
                </button>
              </section>
            )}

            {/* 5. Current Emergency Section */}
            {currentEmergency && (
              <section className="current-emergency-card">
                <div className="card-header-row">
                  <div className="section-title-box">
                    <span className="live-status-badge">CURRENT ACTIVE EMERGENCY</span>
                    <h3 className="emergency-title">{currentEmergency.type}</h3>
                  </div>
                  <div className="status-badge-container">
                    {(() => {
                      const badge = getStatusBadge(currentEmergency.status);
                      return (
                        <span 
                          className="status-pill" 
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                        >
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Patient Live GPS Location on Google Maps Interactive View */}
                <div className="map-telemetry-container">
                  <div className="map-view-box">
                    <div className="map-header-bar">
                      <div className="gps-live-tag">
                        <span className="gps-indicator-dot"></span>
                        <span>LIVE SATELLITE GPS TELEMETRY</span>
                      </div>
                      <button 
                        className={`btn-gps-sync ${gpsActive ? 'gps-synced' : ''}`}
                        onClick={requestGpsLocation}
                        title="Sync Device Hardware GPS"
                      >
                        <Compass size={14} />
                        <span>{gpsActive ? 'Device GPS Active' : 'Enable Device GPS'}</span>
                      </button>
                    </div>

                    {/* Visual Interactive Map Screen */}
                    <div className="simulated-map-display">
                      <div className="map-grid-overlay"></div>
                      
                      {/* Ambulance Pin */}
                      <div 
                        className="map-pin-ambulance" 
                        style={{ left: `${Math.min(88, currentEmergency.ambulanceProgress)}%` }}
                        title="Ambulance Current Position"
                      >
                        <div className="pin-pulse-wave"></div>
                        <div className="ambulance-pin-icon">
                          <Ambulance size={18} color="#ffffff" />
                        </div>
                        <span className="pin-tag">AP 07 TE 1084</span>
                      </div>

                      {/* Patient Target Pin */}
                      <div className="map-pin-patient" title="Patient Emergency Pickup Point">
                        <div className="patient-pin-icon">
                          <MapPin size={22} color="#dc2626" />
                        </div>
                        <span className="patient-pin-tag">{currentEmergency.patientName}</span>
                      </div>

                      {/* Route Line Progress */}
                      <div className="route-trajectory-track">
                        <div 
                          className="route-trajectory-fill" 
                          style={{ width: `${currentEmergency.ambulanceProgress}%` }}
                        ></div>
                      </div>

                      {/* Distance & ETA Floating Pill */}
                      <div className="map-metrics-pill">
                        <span className="pill-item">
                          <Navigation2 size={13} color="#0284c7" />
                          Distance: <strong>{currentEmergency.distanceKm.toFixed(1)} km</strong>
                        </span>
                        <span className="pill-divider">•</span>
                        <span className="pill-item">
                          <Clock size={13} color="#dc2626" />
                          ETA: <strong>{currentEmergency.etaMinutes} mins</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambulance Dispatch & Telemetry Details */}
                <div className="patient-triage-details-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Ambulance size={22} color="#0284c7" />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          Ambulance Unit #04 • ALS Cardiac ICU
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Vehicle Reg: <strong>AP 07 TE 1084</strong></span>
                      </div>
                    </div>
                    <span className="badge badge-bullish" style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981' }}>
                      Active Dispatch
                    </span>
                  </div>

                  <div className="triage-info-grid">
                    <div className="triage-info-item full-width">
                      <span className="triage-lbl">AMBULANCE LOCATION & ROUTE</span>
                      <p className="triage-val-address">
                        <MapPin size={15} color="#0284c7" className="inline-icon" />
                        {currentEmergency.pickupAddress || 'Hospital Express Highway • Sector 4'}
                      </p>
                    </div>

                    <div className="triage-info-item">
                      <span className="triage-lbl">DRIVER NAME</span>
                      <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{user?.name || 'K. Rambabu'}</strong>
                    </div>

                    <div className="triage-info-item">
                      <span className="triage-lbl">CONTACT NUMBER</span>
                      <strong className="triage-val-phone" style={{ color: '#0284c7', fontSize: '0.92rem' }}>{user?.phone || '+91 98765 10800'}</strong>
                    </div>

                    <div className="triage-info-item full-width">
                      <span className="triage-lbl">DESTINATION ER TRAUMA HUB</span>
                      <strong className="triage-val-hospital">{currentEmergency.targetHospital || 'Government General Hospital (GGH) Guntur'}</strong>
                    </div>
                  </div>

                  {/* Two Main Functional Action Buttons: Navigate & Call Ambulance Control */}
                  <div className="dual-action-buttons-grid" style={{ marginTop: '16px' }}>
                    <button 
                      className="btn-action-navigate"
                      onClick={handleOpenGoogleMaps}
                      title="Open Google Maps turn-by-turn directions"
                    >
                      <Navigation2 size={20} />
                      <div className="btn-text-col">
                        <span className="btn-main-label">NAVIGATE VIA GOOGLE MAPS</span>
                        <span className="btn-sub-label">Open GPS Turn-by-Turn Route</span>
                      </div>
                      <ExternalLink size={18} className="btn-arrow-icon" />
                    </button>

                    <a 
                      href="tel:108"
                      className="btn-action-call"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Direct call to 108 Emergency Control"
                    >
                      <PhoneCall size={20} />
                      <div className="btn-text-col">
                        <span className="btn-main-label">CALL 108 HELPLINE</span>
                        <span className="btn-sub-label">24/7 Emergency Dispatch</span>
                      </div>
                    </a>
                  </div>

                  {/* Driver Mission Flow Action Progression */}
                  <div className="driver-mission-stepper">
                    <span className="stepper-title">MISSION ACTION WORKFLOW</span>
                    <div className="stepper-buttons-row">
                      {currentEmergency.status === 'ACTIVE' && (
                        <button className="btn-step-action btn-step-arrived" onClick={handleMarkArrived}>
                          <CheckCircle2 size={18} />
                          <span>Mark Arrived at Patient Location</span>
                        </button>
                      )}

                      {currentEmergency.status === 'ARRIVED' && (
                        <button className="btn-step-action btn-step-transport" onClick={handleStartTransport}>
                          <Ambulance size={18} />
                          <span>Start Transport to Hospital (GGH ER)</span>
                        </button>
                      )}

                      {currentEmergency.status === 'TRANSPORTING' && (
                        <button className="btn-step-action btn-step-complete" onClick={handleCompleteMission}>
                          <CheckCircle2 size={18} />
                          <span>Mark Mission Completed & Handover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 6. Today's Emergency Calls Section */}
            <section className="todays-calls-section">
              <div className="section-header-bar">
                <div className="section-title-col">
                  <h3 className="section-heading">Today’s Emergency Calls</h3>
                  <span className="section-subheading">Assigned emergency dispatch log for active shift</span>
                </div>
                <button 
                  className="btn-view-all" 
                  onClick={() => setViewAllCallsModal(true)}
                >
                  <span>View All ({emergencyCalls.length})</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="calls-list-container">
                {emergencyCalls.slice(0, 4).map((call) => {
                  const badge = getStatusBadge(call.status);
                  return (
                    <div 
                      key={call.id} 
                      className="call-item-card"
                      onClick={() => setViewDetailsModal(call)}
                    >
                      <div className="call-item-left">
                        <div className="call-badge-indicator" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          <Ambulance size={16} />
                        </div>
                        <div className="call-info">
                          <div className="call-id-row">
                            <span className="call-id font-mono">{call.id}</span>
                            <span className="call-time">{call.time}</span>
                          </div>
                          <h4 className="call-type">{call.type}</h4>
                          <p className="call-patient-sub">
                            Patient: <strong>{call.patientName}</strong> • Target: {call.hospital}
                          </p>
                        </div>
                      </div>

                      <div className="call-item-right">
                        <span 
                          className="call-status-pill" 
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                        >
                          {call.status}
                        </span>
                        <span className="call-distance">{call.distance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: History (Dispatch History Log) */}
        {activeTab === 'history' && (
          <div className="tab-pane-content fade-in">
            <div className="history-header-card">
              <div className="history-title-box">
                <History size={24} color="#0284c7" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Shift Emergency Dispatch History
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Comprehensive timeline of completed ambulance calls & hospital handovers
                  </p>
                </div>
              </div>

              <div className="history-stats-grid">
                <div className="hist-stat-box">
                  <span className="hist-stat-num">5</span>
                  <span className="hist-stat-lbl">Total Dispatches</span>
                </div>
                <div className="hist-stat-box">
                  <span className="hist-stat-num">32.4 km</span>
                  <span className="hist-stat-lbl">Distance Covered</span>
                </div>
                <div className="hist-stat-box">
                  <span className="hist-stat-num">4.1 mins</span>
                  <span className="hist-stat-lbl">Average Response</span>
                </div>
                <div className="hist-stat-box">
                  <span className="hist-stat-num">100%</span>
                  <span className="hist-stat-lbl">On-Time Handover</span>
                </div>
              </div>
            </div>

            <div className="calls-list-container" style={{ marginTop: '16px' }}>
              {emergencyCalls.map(call => {
                const badge = getStatusBadge(call.status);
                return (
                  <div key={call.id} className="call-item-card" onClick={() => setViewDetailsModal(call)}>
                    <div className="call-item-left">
                      <div className="call-badge-indicator" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="call-info">
                        <div className="call-id-row">
                          <span className="call-id font-mono">{call.id}</span>
                          <span className="call-time">{call.time}</span>
                        </div>
                        <h4 className="call-type">{call.type}</h4>
                        <p className="call-patient-sub">Patient: {call.patientName} • {call.hospital}</p>
                      </div>
                    </div>
                    <div className="call-item-right">
                      <span className="call-status-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {call.status}
                      </span>
                      <span className="call-distance">{call.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Map (Full GPS Navigation & Hospital Emergency Bed Matrix) */}
        {activeTab === 'map' && (
          <div className="tab-pane-content fade-in">
            <div className="map-page-card">
              <div className="map-page-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Regional GPS Navigation & Hospital Bed Matrix
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Real-time traffic route to GGH Guntur and live regional emergency ICU bed matrix
                  </p>
                </div>
                <button className="btn-action-navigate" style={{ padding: '8px 14px' }} onClick={handleOpenGoogleMaps}>
                  <Navigation2 size={16} />
                  <span>Launch Google Maps App</span>
                </button>
              </div>

              {/* Live Route Telemetry Viewer */}
              <div className="simulated-map-display" style={{ height: '320px', marginTop: '14px' }}>
                <div className="map-grid-overlay"></div>
                <div className="map-pin-ambulance" style={{ left: '50%' }}>
                  <div className="pin-pulse-wave"></div>
                  <div className="ambulance-pin-icon"><Ambulance size={20} color="#fff" /></div>
                  <span className="pin-tag">{vehicleNumber}</span>
                </div>
                <div className="map-pin-patient" style={{ right: '15%', top: '35%' }}>
                  <div className="patient-pin-icon"><MapPin size={26} color="#dc2626" /></div>
                  <span className="patient-pin-tag">Emergency Destination</span>
                </div>
              </div>

              {/* Live Hospital Emergency Bed Matrix */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                  Nearby Hospitals Live Bed Availability (AP State Health Grid)
                </h4>
                <div className="hospitals-bed-grid">
                  <div className="hospital-bed-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                        Government General Hospital (GGH), Guntur
                      </h5>
                      <span className="badge-available">Base Station</span>
                    </div>
                    <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', color: '#64748b' }}>
                      Main Emergency Trauma Center • Distance: 5.8 km
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem' }}>
                      <span className="stat-pill-green">ICU Beds: <strong>4 Available</strong></span>
                      <span className="stat-pill-blue">Emergency Beds: <strong>6 Available</strong></span>
                      <span className="stat-pill-amber">Ventilators: <strong>2 Free</strong></span>
                    </div>
                  </div>

                  <div className="hospital-bed-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                        Area Hospital, Narasaraopet
                      </h5>
                      <span className="badge-available">Open 24/7</span>
                    </div>
                    <p style={{ margin: '4px 0 10px', fontSize: '0.82rem', color: '#64748b' }}>
                      Secondary Care & Trauma Unit • Distance: 1.2 km
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem' }}>
                      <span className="stat-pill-green">ICU Beds: <strong>2 Available</strong></span>
                      <span className="stat-pill-blue">Emergency Beds: <strong>3 Available</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Profile (Driver & Ambulance Profile) */}
        {activeTab === 'profile' && (
          <div className="tab-pane-content fade-in">
            <div className="driver-full-profile-card">
              <div className="profile-hero-section">
                <div className="profile-avatar-large">
                  <Ambulance size={42} color="#ffffff" />
                </div>
                <div className="profile-hero-text">
                  <h3 className="profile-driver-name">{driverName}</h3>
                  <p className="profile-driver-role">Ambulance Driver / Senior Paramedic Responder</p>
                  <span className="badge-license">EMT License: AP-07-2024-8841</span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-field-box">
                  <span className="field-lbl">ASSIGNED AMBULANCE VEHICLE</span>
                  <strong className="field-val highlight-text">{vehicleNumber}</strong>
                </div>
                <div className="profile-field-box">
                  <span className="field-lbl">FLEET CLASS</span>
                  <strong className="field-val">Advanced Cardiac Life Support (ALS ICU Unit #04)</strong>
                </div>
                <div className="profile-field-box">
                  <span className="field-lbl">DISPATCH BASE STATION</span>
                  <strong className="field-val">{baseStation}</strong>
                </div>
                <div className="profile-field-box">
                  <span className="field-lbl">DRIVER MOBILE CONTACT</span>
                  <strong className="field-val">{user?.phone || '+91 98765 10800'}</strong>
                </div>
                <div className="profile-field-box">
                  <span className="field-lbl">CURRENT DUTY SHIFT</span>
                  <strong className="field-val">08:00 AM - 08:00 PM (Active Shift)</strong>
                </div>
                <div className="profile-field-box">
                  <span className="field-lbl">AVAILABILITY STATUS</span>
                  <strong className="field-val" style={{ color: '#10b981' }}>
                    ● AVAILABLE FOR DISPATCH (ACTIVE 24/7)
                  </strong>
                </div>
              </div>

              <div className="profile-action-rows" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <button 
                  className="btn-driver-logout" 
                  onClick={logout}
                  title="Logout from driver session"
                >
                  <LogOut size={15} />
                  <span>Logout from 108 Console</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 7. Bottom Navigation (Home, History, Map, Profile) */}
      <nav className="responder-bottom-nav">
        <button 
          className={`nav-item-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Ambulance size={20} />
          <span>Home</span>
        </button>

        <button 
          className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={20} />
          <span>History</span>
        </button>

        <button 
          className={`nav-item-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <MapIcon size={20} />
          <span>Map</span>
        </button>

        <button 
          className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>

      {/* Hamburger Slide-Out Drawer */}
      {menuOpen && (
        <div className="drawer-overlay fade-in" onClick={() => setMenuOpen(false)}>
          <div className="drawer-panel slide-in-left" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-box">
                <Ambulance size={24} color="#0284c7" />
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: 800 }}>
                  Care Navigator
                </h3>
              </div>
              <button className="drawer-close-btn" onClick={() => setMenuOpen(false)}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div className="drawer-driver-card">
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>{driverName}</h4>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Ambulance: <strong style={{ color: '#0284c7' }}>{vehicleNumber}</strong>
              </p>
              <div style={{ marginTop: '10px' }}>
                <span className="badge-available">
                  ● AVAILABLE • 108 FLEET
                </span>
              </div>
            </div>

            <div className="drawer-menu-links">
              <button className="drawer-link-btn" onClick={() => { setActiveTab('home'); setMenuOpen(false); }}>
                <Ambulance size={18} color="#0284c7" />
                <span>Driver Emergency Home</span>
              </button>
              <button className="drawer-link-btn" onClick={() => { setActiveTab('history'); setMenuOpen(false); }}>
                <History size={18} color="#0284c7" />
                <span>Shift Dispatch History</span>
              </button>
              <button className="drawer-link-btn" onClick={() => { setActiveTab('map'); setMenuOpen(false); }}>
                <MapIcon size={18} color="#0284c7" />
                <span>GPS Route & Hospital Beds</span>
              </button>
              <button className="drawer-link-btn" onClick={() => { setActiveTab('profile'); setMenuOpen(false); }}>
                <User size={18} color="#0284c7" />
                <span>Driver Profile & Vehicle Specs</span>
              </button>
              <button className="drawer-link-btn" onClick={() => { setMenuOpen(false); setNotificationsOpen(true); }}>
                <Bell size={18} color="#f59e0b" />
                <span>Emergency Notifications</span>
              </button>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="drawer-logout-btn"
                style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                onClick={() => { setDrawerOpen(false); if (typeof returnToPatientPortal === 'function') returnToPatientPortal(); else navigateTo('dashboard'); }}
              >
                <RotateCcw size={18} />
                <span>Return to Patient Portal</span>
              </button>
              <button className="drawer-logout-btn" onClick={logout}>
                <LogOut size={18} />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal / Drawer */}
      {notificationsOpen && (
        <div className="modal-overlay fade-in" onClick={() => setNotificationsOpen(false)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Emergency Dispatch Notifications
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setNotificationsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="notifications-list">
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.urgent ? 'notif-urgent' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: n.urgent ? '#dc2626' : '#0f172a' }}>
                      {n.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>{n.desc}</p>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-secondary btn-block" 
              style={{ marginTop: '16px' }}
              onClick={() => setNotificationsOpen(false)}
            >
              Close Notifications
            </button>
          </div>
        </div>
      )}

      {/* View Emergency Details Modal */}
      {viewDetailsModal && (
        <div className="modal-overlay fade-in" onClick={() => setViewDetailsModal(null)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Emergency Triage Record: {viewDetailsModal.id}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setViewDetailsModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecdd3', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 800, display: 'block' }}>
                  EMERGENCY INCIDENT TYPE
                </span>
                <strong style={{ fontSize: '1.05rem', color: '#991b1b' }}>{viewDetailsModal.type}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Patient Name</span>
                  <strong>{viewDetailsModal.patientName || 'Emergency Patient'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Distance</span>
                  <strong style={{ color: '#dc2626' }}>{viewDetailsModal.distance}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Status</span>
                  <strong>{viewDetailsModal.status || 'Active'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Hospital</span>
                  <strong>{viewDetailsModal.hospital || 'GGH Guntur'}</strong>
                </div>
              </div>

              {viewDetailsModal.symptoms && (
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', border: '1px solid #fde68a', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#b45309', fontWeight: 800, display: 'block', fontSize: '0.75rem' }}>
                    REPORTED CLINICAL SYMPTOMS & TRIAGE
                  </span>
                  <p style={{ margin: '4px 0 0', color: '#92400e' }}>{viewDetailsModal.symptoms}</p>
                </div>
              )}

              {viewDetailsModal.instructions && (
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #86efac', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#166534', fontWeight: 800, display: 'block', fontSize: '0.75rem' }}>
                    DISPATCHER INSTRUCTIONS
                  </span>
                  <p style={{ margin: '4px 0 0', color: '#15803d' }}>{viewDetailsModal.instructions}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setViewDetailsModal(null);
                    handleAcceptNewRequest();
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>Accept Dispatch</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setViewDetailsModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Today's Calls Modal */}
      {viewAllCallsModal && (
        <div className="modal-overlay fade-in" onClick={() => setViewAllCallsModal(false)}>
          <div className="modal-panel-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Today's Emergency Calls ({emergencyCalls.length})
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setViewAllCallsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="calls-list-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {emergencyCalls.map(c => {
                const badge = getStatusBadge(c.status);
                return (
                  <div key={c.id} className="call-item-card" onClick={() => { setViewAllCallsModal(false); setViewDetailsModal(c); }}>
                    <div className="call-item-left">
                      <div className="call-badge-indicator" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        <Ambulance size={16} />
                      </div>
                      <div className="call-info">
                        <div className="call-id-row">
                          <span className="call-id font-mono">{c.id}</span>
                          <span className="call-time">{c.time}</span>
                        </div>
                        <h4 className="call-type">{c.type}</h4>
                        <p className="call-patient-sub">Patient: {c.patientName} • {c.hospital}</p>
                      </div>
                    </div>
                    <div className="call-item-right">
                      <span className="call-status-pill" style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {c.status}
                      </span>
                      <span className="call-distance">{c.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-secondary btn-block" 
              style={{ marginTop: '16px' }}
              onClick={() => setViewAllCallsModal(false)}
            >
              Close All Calls
            </button>
          </div>
        </div>
      )}

      {/* Pure Component CSS Styling */}
      <style>{`
        .responder-dashboard-root {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background: #ffffff;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          font-family: var(--font-main, 'Inter', -apple-system, sans-serif);
          position: relative;
        }

        /* 2. Care Navigator Header */
        .responder-header {
          background: #ffffff;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        .header-inner {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .icon-btn-hamburger {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn-hamburger:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .header-brand {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .status-live-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .live-dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseRed 1.5s infinite;
        }

        @keyframes pulseRed {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .brand-tagline {
          font-size: 0.76rem;
          color: #0284c7;
          font-weight: 700;
          letter-spacing: 0.2px;
          margin-top: 1px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-btn-utility {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .icon-btn-utility:hover {
          background: #e2e8f0;
        }

        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
        }

        /* Toast Banner */
        .responder-toast-banner {
          position: fixed;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 150;
          background: #ffffff;
          border: 1.5px solid #0284c7;
          box-shadow: 0 10px 30px rgba(2, 132, 199, 0.2);
          color: #0f172a;
          padding: 10px 18px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.86rem;
          font-weight: 600;
          max-width: 90%;
        }

        .toast-close {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }

        /* Main Viewport Container - Full Screen Width */
        .responder-main-viewport {
          flex: 1;
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 20px 24px 88px;
          box-sizing: border-box;
        }

        /* 3. Driver Profile Section (Light-Blue Card) */
        .driver-profile-card {
          background: #f0f9ff;
          border: 1.5px solid #bae6fd;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(2, 132, 199, 0.08);
        }

        .driver-profile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .driver-avatar-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .driver-avatar {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: #ffffff;
          border: 2px solid #38bdf8;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .driver-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .driver-name {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
        }

        .badge-available {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          color: #059669;
          border: 1.5px solid #6ee7b7;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .green-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: pulseGreen 1.6s infinite;
        }

        @keyframes pulseGreen {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .driver-role {
          margin: 3px 0;
          font-size: 0.86rem;
          font-weight: 700;
          color: #0284c7;
        }

        .driver-vehicle-info {
          margin: 0;
          font-size: 0.82rem;
          color: #475569;
        }

        .highlight-text {
          color: #0369a1;
          font-weight: 800;
        }

        .driver-station-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .station-pill {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 8px;
          letter-spacing: 0.5px;
        }

        .station-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
        }

        .fleet-metrics-strip {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px dashed #bae6fd;
        }

        @media (max-width: 480px) {
          .fleet-metrics-strip {
            grid-template-columns: 1fr;
          }
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #e0f2fe;
        }

        .metric-val {
          display: block;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }

        .metric-lbl {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }

        /* 4. Prominent Red Emergency Alert Card */
        .new-emergency-alert-card {
          background: #fef2f2;
          border: 2px solid #ef4444;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.2);
          animation: redGlowPulse 2.5s infinite;
        }

        @keyframes redGlowPulse {
          0% { box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15); }
          50% { box-shadow: 0 12px 36px rgba(239, 68, 68, 0.35); }
          100% { box-shadow: 0 8px 24px rgba(239, 68, 68, 0.15); }
        }

        .alert-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .alert-pulse-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #dc2626;
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .alert-time-tag {
          font-size: 0.78rem;
          font-weight: 700;
          color: #991b1b;
        }

        .alert-type {
          margin: 0 0 6px 0;
          font-size: 1.35rem;
          font-weight: 900;
          color: #991b1b;
        }

        .alert-address {
          margin: 0 0 16px 0;
          font-size: 0.9rem;
          color: #7f1d1d;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .alert-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        @media (max-width: 600px) {
          .alert-metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .alert-metric-box {
          background: #ffffff;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          padding: 10px 12px;
        }

        .metric-title {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #9f1239;
          letter-spacing: 0.4px;
        }

        .metric-strong {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .text-red {
          color: #dc2626;
        }

        .alert-action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-alert-primary {
          flex: 2;
          min-width: 200px;
          background: #dc2626;
          color: #ffffff;
          border: none;
          padding: 14px 20px;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
          transition: all 0.2s ease;
        }

        .btn-alert-primary:hover {
          background: #b91c1c;
          transform: translateY(-2px);
        }

        .btn-alert-secondary {
          flex: 1;
          min-width: 140px;
          background: #ffffff;
          color: #991b1b;
          border: 1.5px solid #fca5a5;
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-alert-secondary:hover {
          background: #fee2e2;
        }

        /* Standby Notice Box */
        .standby-notice-box {
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 18px;
          padding: 14px 18px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .standby-inner {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-simulate-sos {
          background: #ffffff;
          border: 1px solid #86efac;
          color: #166534;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        /* 5. Current Emergency Section */
        .current-emergency-card {
          background: #ffffff;
          border: 1.5px solid #bae6fd;
          border-radius: 24px;
          padding: 22px;
          margin-bottom: 24px;
          box-shadow: 0 6px 24px rgba(2, 132, 199, 0.08);
        }

        .card-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .live-status-badge {
          font-size: 0.72rem;
          font-weight: 800;
          color: #0284c7;
          letter-spacing: 0.6px;
          display: block;
          margin-bottom: 4px;
        }

        .emergency-title {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 800;
          color: #0f172a;
        }

        .status-pill {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        /* Map Telemetry Container */
        .map-telemetry-container {
          margin-bottom: 20px;
        }

        .map-view-box {
          border-radius: 18px;
          overflow: hidden;
          border: 1.5px solid #cbd5e1;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
        }

        .map-header-bar {
          background: #f0f9ff;
          color: #0369a1;
          border-bottom: 1.5px solid #bae6fd;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gps-live-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0284c7;
          letter-spacing: 0.4px;
        }

        .gps-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0284c7;
          box-shadow: 0 0 6px #0284c7;
        }

        .btn-gps-sync {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-gps-sync.gps-synced {
          background: #ecfdf5;
          border-color: #10b981;
          color: #047857;
        }

        .simulated-map-display {
          height: 240px;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #bae6fd;
        }

        .map-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(rgba(2, 132, 199, 0.2) 1px, transparent 1px),
            linear-gradient(to right, rgba(2, 132, 199, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(2, 132, 199, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .map-pin-ambulance {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
          transition: left 0.4s ease;
        }

        .pin-pulse-wave {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(2, 132, 199, 0.3);
          animation: pulseWave 1.8s infinite;
        }

        @keyframes pulseWave {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .ambulance-pin-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #0284c7;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .pin-tag {
          background: #ffffff;
          color: #0284c7;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          margin-top: 4px;
          white-space: nowrap;
          border: 1.5px solid #0284c7;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .map-pin-patient {
          position: absolute;
          right: 12%;
          top: 48%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
        }

        .patient-pin-icon {
          filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.6));
        }

        .patient-pin-tag {
          background: #dc2626;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          margin-top: 2px;
          white-space: nowrap;
        }

        .route-trajectory-track {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 6px;
          background: #cbd5e1;
          border-radius: 4px;
          z-index: 5;
        }

        .route-trajectory-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #0284c7 100%);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.4);
        }

        .map-metrics-pill {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 6px 14px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0f172a;
          font-size: 0.78rem;
          font-weight: 700;
          z-index: 15;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .pill-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pill-divider {
          color: #64748b;
        }

        /* Patient Triage Card */
        .patient-triage-details-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 18px;
        }

        .patient-summary-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .patient-avatar-initials {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #0284c7;
          color: #ffffff;
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .patient-name {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .patient-submeta {
          margin: 2px 0 0;
          font-size: 0.82rem;
          color: #64748b;
        }

        .verified-ehr-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 4px;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .triage-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .triage-info-grid {
            grid-template-columns: 1fr;
          }
        }

        .triage-info-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
        }

        .triage-info-item.full-width {
          grid-column: 1 / -1;
        }

        .triage-lbl {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .triage-val-address {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .triage-val-phone {
          font-size: 1rem;
          font-weight: 800;
          color: #0284c7;
        }

        .triage-val-hospital {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
        }

        .alert-box-yellow {
          background: #fffbeb;
          border-color: #fde68a;
        }

        .text-amber {
          color: #b45309;
        }

        .triage-val-warning {
          margin: 0;
          font-size: 0.84rem;
          color: #92400e;
        }

        /* Dual Action Buttons: Navigate & Call Patient */
        .dual-action-buttons-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .dual-action-buttons-grid {
            grid-template-columns: 1fr;
          }
        }

        .btn-action-navigate {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          border: none;
          padding: 16px 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(2, 132, 199, 0.25);
          transition: all 0.2s ease;
          text-align: left;
        }

        .btn-action-navigate:hover {
          background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
          transform: translateY(-2px);
        }

        .btn-action-call {
          background: #ffffff;
          color: #0284c7;
          border: 2px solid #0284c7;
          padding: 16px 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .btn-action-call:hover {
          background: #f0f9ff;
          transform: translateY(-2px);
        }

        .btn-text-col {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .btn-main-label {
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .btn-sub-label {
          font-size: 0.74rem;
          opacity: 0.85;
          font-weight: 600;
        }

        .btn-arrow-icon {
          margin-left: auto;
        }

        /* Stepper Workflow */
        .driver-mission-stepper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
        }

        .stepper-title {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .btn-step-action {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-step-arrived {
          background: #ecfdf5;
          color: #047857;
          border: 1.5px solid #10b981;
        }

        .btn-step-transport {
          background: #0284c7;
          color: #ffffff;
        }

        .btn-step-complete {
          background: #16a34a;
          color: #ffffff;
        }

        /* 6. Today's Emergency Calls List */
        .todays-calls-section {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }

        .section-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-heading {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
        }

        .section-subheading {
          font-size: 0.78rem;
          color: #64748b;
        }

        .btn-view-all {
          background: none;
          border: none;
          color: #0284c7;
          font-size: 0.82rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .btn-view-all:hover {
          background: #f0f9ff;
        }

        .calls-list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .call-item-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .call-item-card:hover {
          border-color: #0284c7;
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08);
        }

        .call-item-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .call-badge-indicator {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .call-id-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .call-id {
          font-size: 0.76rem;
          font-weight: 800;
          color: #0284c7;
        }

        .call-time {
          font-size: 0.74rem;
          color: #94a3b8;
        }

        .call-type {
          margin: 2px 0;
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
        }

        .call-patient-sub {
          margin: 0;
          font-size: 0.78rem;
          color: #64748b;
        }

        .call-item-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .call-status-pill {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .call-distance {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
        }

        /* 7. Bottom Navigation */
        .responder-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 8px 12px;
          z-index: 100;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
        }

        .nav-item-btn {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          padding: 6px 14px;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .nav-item-btn.active {
          color: #0284c7;
          background: #f0f9ff;
        }

        /* History & Profile Cards */
        .history-header-card, .map-page-card, .driver-full-profile-card {
          background: #ffffff;
          border: 1.5px solid #bae6fd;
          border-radius: 20px;
          padding: 22px;
        }

        .history-title-box, .map-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
        }

        .history-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        @media (max-width: 600px) {
          .history-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .hist-stat-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          text-align: center;
        }

        .hist-stat-num {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          color: #0284c7;
        }

        .hist-stat-lbl {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .profile-hero-section {
          display: flex;
          align-items: center;
          gap: 18px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        .profile-avatar-large {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-driver-name {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }

        .profile-driver-role {
          margin: 2px 0 6px;
          font-size: 0.88rem;
          color: #0284c7;
          font-weight: 700;
        }

        .badge-license {
          display: inline-block;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .profile-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        @media (max-width: 600px) {
          .profile-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .profile-field-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
        }

        .field-lbl {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #64748b;
          margin-bottom: 4px;
        }

        .field-val {
          font-size: 0.95rem;
          color: #0f172a;
        }

        .btn-toggle-large {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        .btn-driver-logout {
          width: auto;
          min-width: 160px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.08);
        }

        .btn-driver-logout:hover {
          background: #fee2e2;
          border-color: #ef4444;
          transform: translateY(-1px);
        }

        /* Hospital Bed Matrix Cards */
        .hospitals-bed-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hospital-bed-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }

        .stat-pill-green {
          color: #047857;
          background: #ecfdf5;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 600;
        }

        .stat-pill-blue {
          color: #0369a1;
          background: #f0f9ff;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 600;
        }

        .stat-pill-amber {
          color: #b45309;
          background: #fffbeb;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 600;
        }

        /* Drawer and Modals */
        .drawer-overlay, .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .drawer-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 320px;
          max-width: 85%;
          background: #ffffff;
          color: #0f172a;
          border-right: 1px solid #e2e8f0;
          z-index: 210;
          display: flex;
          flex-direction: column;
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.08);
        }

        .drawer-header {
          padding: 18px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
        }

        .drawer-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .drawer-driver-card {
          margin: 16px;
          padding: 14px;
          background: #f0f9ff;
          border-radius: 14px;
          border: 1.5px solid #bae6fd;
        }

        .drawer-menu-links {
          flex: 1;
          padding: 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .drawer-link-btn {
          background: none;
          border: none;
          color: #334155;
          font-size: 0.92rem;
          font-weight: 700;
          padding: 12px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .drawer-link-btn:hover {
          background: #f0f9ff;
          color: #0284c7;
        }

        .drawer-footer {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .drawer-logout-btn {
          width: 100%;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }

        .modal-panel-card {
          background: #ffffff;
          border-radius: 20px;
          max-width: 520px;
          width: 100%;
          padding: 22px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }

        .modal-close-btn {
          background: #f1f5f9;
          border: none;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .notif-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 10px;
        }

        .notif-item.notif-urgent {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        /* Animations */
        .fade-in {
          animation: fadeIn 0.25s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in-left {
          animation: slideLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
