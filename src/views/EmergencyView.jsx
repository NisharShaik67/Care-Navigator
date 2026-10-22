import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AmbulanceRouteMap } from '../components/AmbulanceRouteMap';
import { ResponderHomeView } from './ResponderHomeView';
import { 
  PhoneCall, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertOctagon, 
  HeartPulse, 
  Stethoscope, 
  ChevronDown, 
  Truck,
  UserCheck,
  Star,
  ShieldCheck,
  CalendarCheck,
  Activity,
  ArrowRight,
  X,
  Radio
} from 'lucide-react';

const FIRST_AID_GUIDES = [
  {
    title: "Cardiopulmonary Resuscitation (CPR)",
    category: "Cardiac Emergency",
    steps: [
      "Check if person is conscious and breathing.",
      "Call Emergency 108 / 112 immediately.",
      "Push hard and fast in center of chest (100-120 compressions per minute).",
      "Allow chest to recoil completely between compressions."
    ]
  },
  {
    title: "Severe Bleeding & Hemorrhage Control",
    category: "Trauma Emergency",
    steps: [
      "Apply firm, direct pressure on the wound using a clean cloth or bandage.",
      "Maintain pressure without lifting cloth to check wound.",
      "Elevate the injured limb above heart level if possible.",
      "Keep patient warm and calm until medical help arrives."
    ]
  },
  {
    title: "Choking Relief (Heimlich Maneuver)",
    category: "Airway Emergency",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand and place it just above the navel.",
      "Grasp your fist with your other hand and give quick upward thrusts.",
      "Repeat until airway object is dislodged or help arrives."
    ]
  }
];

export { ResponderHomeView };

export const EmergencyView = () => {
  const { user, navigateTo, bookOPToken, logout } = useApp();

  // Check if current logged in user is Ambulance Driver / Responder
  const isDriver = user?.role === 'Responder' || user?.role === 'Driver';

  if (isDriver) {
    return <ResponderHomeView />;
  }

  const [openGuide, setOpenGuide] = useState(0);
  const [alertedContacts, setAlertedContacts] = useState({});
  const [alertNotification, setAlertNotification] = useState('');
  
  // OP Token Booking Modal state inside Ambulance View
  const [showOpModal, setShowOpModal] = useState(false);
  const [opHospital, setOpHospital] = useState('Government General Hospital (GGH), Guntur');
  const [opDept, setOpDept] = useState('Emergency Trauma & Critical Care');
  const [opDoctor, setOpDoctor] = useState('Dr. K. Srinivas Rao (MD Cardiology)');
  const [opSuccessMsg, setOpSuccessMsg] = useState('');

  // Driver Action States
  const [driverActionMsg, setDriverActionMsg] = useState('');
  const [isPatientTransporting, setIsPatientTransporting] = useState(false);

  // Simulated Telemetry State
  const [sosState, setSosState] = useState({
    ambulanceProgress: 48,
    distanceKm: 2.8,
    ambulanceEta: 4,
    currentStreet: 'Hospital Express Highway • Sector 4',
    location: user?.location || 'Narasaraopet Main Rd, AP'
  });

  const handleAlertContact = (contact) => {
    setAlertedContacts(prev => ({ ...prev, [contact.id]: true }));
    setAlertNotification(`🚨 Emergency Alert Sent & Call Initiated to ${contact.name} (${contact.phone})`);
    
    setTimeout(() => {
      setAlertNotification('');
    }, 4500);

    const cleanPhone = contact.phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.location.href = `tel:${cleanPhone}`;
    }
  };

  const handleConfirmOpBooking = (e) => {
    e.preventDefault();
    const tokenNo = Math.floor(Math.random() * 20 + 5);
    
    bookOPToken({
      hospitalName: opHospital,
      department: opDept,
      doctorName: opDoctor,
      patientName: user?.name || 'Patient',
      tokenNumber: `#${tokenNo}`,
      queueAhead: 3,
      status: 'ACTIVE'
    });

    setOpSuccessMsg(`🎉 OP Token #${tokenNo} Booked Successfully for ${opHospital}! Queue ahead: 3.`);
    setShowOpModal(false);

    setTimeout(() => {
      setOpSuccessMsg('');
    }, 6000);
  };

  const handleDriverArrived = () => {
    setSosState(prev => ({
      ...prev,
      ambulanceProgress: 100,
      distanceKm: 0.0,
      ambulanceEta: 0,
      currentStreet: 'Arrived at Patient Location (Narasaraopet Main Rd)'
    }));
    setDriverActionMsg('✅ Patient Location Reached. EMT Team On Site & Vitals Synchronized.');
    setTimeout(() => setDriverActionMsg(''), 5000);
  };

  const handleStartTransport = () => {
    setIsPatientTransporting(true);
    setSosState(prev => ({
      ...prev,
      ambulanceProgress: 60,
      distanceKm: 6.2,
      ambulanceEta: 8,
      currentStreet: 'En Route to Destination Hospital (GGH Guntur ER Room)'
    }));
    setDriverActionMsg('🚑 Transporting Patient to GGH Guntur Emergency ER Hub. ER Doctor Notified.');
    setTimeout(() => setDriverActionMsg(''), 5000);
  };

  return (
    <div className="emergency-view-container fade-in">
      {/* Driver Command Banner / Helpline Header */}
      <div className="sos-status-card glass-panel" style={{
        background: '#ffffff',
        color: '#0f172a',
        border: '1.5px solid #0284c7'
      }}>
        <div className="sos-status-top">
          <div className="status-indicator" style={{ color: isDriver ? '#38bdf8' : '#dc2626' }}>
            <div className="status-dot dot-green"></div>
            <span>
              {isDriver 
                ? 'AMBULANCE DRIVER TELEMETRY CONSOLE • DISPATCH MISSION ACTIVE' 
                : 'EMERGENCY AMBULANCE DISPATCH • DIAL 108'}
            </span>
          </div>
          {isDriver && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-bullish" style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981' }}>
                Unit #04 • ALS Fleet
              </span>
              <button 
                onClick={logout} 
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px', color: '#f87171', borderColor: '#7f1d1d', background: 'rgba(239, 68, 68, 0.15)', cursor: 'pointer' }}
                title="Logout from Driver Console"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {isDriver ? (
          <div style={{ marginTop: '12px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
              Driver Command Console: {user?.name || 'K. Rambabu'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
              Vehicle: <strong style={{ color: '#38bdf8' }}>{user?.vehicleNo || 'AP 07 TE 1084 (ALS ICU Unit)'}</strong> • Base Station: {user?.baseStation || 'GGH Guntur Fleet'} • Driver Phone: <strong style={{ color: '#38bdf8' }}>{user?.phone || '+91 98765 10800'}</strong>
            </p>
          </div>
        ) : (
          <div className="sos-trigger-box">
            <a href="tel:108" className="btn btn-emergency btn-block" style={{ textDecoration: 'none', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <PhoneCall size={24} />
              <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>CALL 108 AMBULANCE HELPLINE</span>
            </a>
            <p className="sos-disclaimer">
              24/7 National Emergency Medical Response Service. Direct helpline for immediate medical assistance and hospital ambulance dispatch.
            </p>
          </div>
        )}
      </div>

      {/* Driver Notification Message Toast */}
      {driverActionMsg && (
        <div className="alert-toast-banner fade-in" style={{
          background: '#f0fdf4',
          border: '1.5px solid #16a34a',
          color: '#15803d',
          padding: '12px 18px',
          borderRadius: '14px',
          fontSize: '0.9rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{driverActionMsg}</span>
        </div>
      )}

      {/* Live Route Telemetry Map */}
      <AmbulanceRouteMap 
        sosState={sosState} 
        onSpeedChange={(spd) => {
          setSosState(prev => ({
            ...prev,
            ambulanceProgress: Math.min(100, prev.ambulanceProgress + spd * 5)
          }));
        }} 
      />

      {/* DRIVER SPECIFIC VIEW: PATIENT DETAILS & DISPATCH SPECS */}
      {isDriver ? (
        <div className="driver-patient-command-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {/* Card 1: Patient Emergency Details for Driver */}
          <div className="glass-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1.5px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={22} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Patient Emergency Details
                </h3>
              </div>
              <span className="badge badge-bearish" style={{ fontSize: '0.72rem' }}>
                SOS Target Patient
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontWeight: '800', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                AR
              </div>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Alex Rivera (SOS Emergency Patient)</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Age: <strong>28</strong> • Gender: <strong>MALE</strong> • Blood: <strong style={{ color: '#dc2626' }}>O+</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#fff1f2', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fecdd3' }}>
                <MapPin size={16} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: '800', display: 'block' }}>PICKUP EMERGENCY ADDRESS</span>
                  <strong style={{ color: '#9f1239' }}>House 14, Collectorate Colony, Main Road, Narasaraopet, AP</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Patient Phone:</span>
                <strong style={{ color: '#0284c7' }}>+91 98765 43210</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>ABHA Health ID:</span>
                <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>ABHA-5892-4103-7621</strong>
              </div>

              <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: '10px', border: '1px solid #fde68a' }}>
                <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: '800', display: 'block', marginBottom: '2px' }}>
                  ⚠️ KNOWN MEDICAL ALLERGIES & PRECAUTIONS
                </span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', fontWeight: '600' }}>
                  Allergies: Penicillin, Dust. Patient has mild gastritis and high uric acid history. Avoid NSAID pain relievers.
                </p>
              </div>
            </div>

            {/* Driver Call Patient Button */}
            <a 
              href="tel:9876543210" 
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px', 
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '800'
              }}
            >
              <PhoneCall size={18} />
              <span>Call Patient Immediately (+91 98765 43210)</span>
            </a>
          </div>

          {/* Card 2: Driver Mission Control & Vehicle Telemetry */}
          <div className="glass-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1.5px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={22} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                  Ambulance Vehicle Telemetry & Actions
                </h3>
              </div>
              <span className="badge badge-bullish" style={{ fontSize: '0.72rem' }}>
                Reg: AP 07 TE 1084
              </span>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.5px' }}>AMBULANCE CLASS</span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>ALS ICU UNIT #04</span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>
                Advanced Life Support Cardiac Unit
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
                Target ER Hub: <strong>Government General Hospital (GGH) Guntur</strong>
              </p>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155', marginBottom: '10px', textTransform: 'uppercase' }}>
              Driver Mission Actions
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={handleDriverArrived}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  borderColor: '#10b981',
                  color: '#047857',
                  fontWeight: '800',
                  background: '#f0fdf4'
                }}
              >
                <CheckCircle2 size={18} color="#10b981" />
                <span>Mark Arrived at Patient Location</span>
              </button>

              <button
                onClick={handleStartTransport}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                }}
              >
                <Truck size={18} />
                <span>{isPatientTransporting ? 'Patient In Transit (En Route to GGH ER)' : 'Start Transport to Hospital ER Hub'}</span>
              </button>

              <a
                href="tel:108"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '700'
                }}
              >
                <Radio size={16} color="#0284c7" />
                <span>Contact 108 Hospital ER Control Room</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* PATIENT VIEW: DRIVER SPECS & VEHICLE SPECS */
        <div className="driver-vehicle-section-grid">
          {/* Card 1: Assigned Driver Details */}
          <div className="glass-card driver-card" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>Assigned EMT Driver</h3>
              </div>
              <span className="badge badge-bullish" style={{ fontSize: '0.7rem' }}>
                On Duty • En Route
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #0284c7',
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.25)',
                flexShrink: 0
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300" 
                  alt="Driver K. Rambabu" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>K. Rambabu</h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.82rem', color: '#0284c7', fontWeight: '700' }}>
                  Senior EMT & Emergency Response Pilot
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d97706', fontWeight: '700' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" /> 4.9 (1,240+ Dispatches)
                  </span>
                  <span>• 8+ Yrs Exp</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>EMT License No:</span>
                <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>AP-07-2018-0049281</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Driver Contact:</span>
                <strong style={{ color: '#0284c7' }}>+91 98765 10800</strong>
              </div>
            </div>

            <a 
              href="tel:9876510800" 
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px', 
                borderRadius: '12px',
                textDecoration: 'none'
              }}
            >
              <PhoneCall size={18} />
              <span>Call Driver K. Rambabu (+91 98765 10800)</span>
            </a>
          </div>

          {/* Card 2: Ambulance Vehicle & Equipment Details */}
          <div className="glass-card vehicle-card" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>Ambulance Vehicle & Life Support</h3>
              </div>
              <span className="badge badge-bearish" style={{ fontSize: '0.7rem' }}>
                Reg: AP 07 TE 1084
              </span>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(3, 105, 161, 0.04) 100%)', border: '1px solid rgba(2, 132, 199, 0.2)', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>VEHICLE CATEGORY</span>
                <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '800' }}>ALS ICU FLEET</span>
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0369a1' }}>
                Advanced Life Support (ALS) Cardiac ICU Unit
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Base Station: Government General Hospital (GGH) Guntur Emergency Station
              </p>
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Onboard Medical Equipment & Tech
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#059669" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Oxygen & Ventilator</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>High Flow Cylinder</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={16} color="#dc2626" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Cardiac Defibrillator</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Automated AED</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={16} color="#0284c7" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>Trauma Kit & IV Fluids</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Full Emergency Meds</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#d97706" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a' }}>GPS & Vital Telemetry</strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Live ER Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner when OP Token Booked */}
      {opSuccessMsg && (
        <div className="alert-toast-banner fade-in" style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1.5px solid #10b981',
          color: '#047857',
          padding: '14px 18px',
          borderRadius: '16px',
          fontSize: '0.92rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>{opSuccessMsg}</span>
          </div>
          <button 
            onClick={() => navigateTo('appointments')}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            View OP Token
          </button>
        </div>
      )}

      {/* INSTANT OP TOKEN APPOINTMENT BOOKING BANNER */}
      {!isDriver && (
        <div className="glass-panel op-booking-banner-card" style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1.5px solid rgba(2, 132, 199, 0.3)',
          padding: '24px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ flex: '1 1 320px' }}>
            <div className="greeting-pill" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
              <CalendarCheck size={14} color="#0284c7" />
              <span>SKIP HOSPITAL QUEUE WHILE EN ROUTE</span>
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Book Priority OP Token Appointment
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.4 }}>
              Reserve an Out-Patient digital consultation token for your destination hospital so doctor OPD registration is ready immediately upon ambulance arrival.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowOpModal(true)}
              className="btn btn-primary"
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CalendarCheck size={18} />
              <span>Book OP Token Now</span>
            </button>

            <button
              onClick={() => navigateTo('op-booking')}
              className="btn btn-secondary"
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.9rem'
              }}
            >
              <span>Full OP Booking Page</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contacts Directory */}
      <div className="contacts-notif-card glass-panel">
        <div className="card-title-row">
          <Users size={20} color="#0284c7" />
          <h3>Emergency Contacts Directory</h3>
        </div>

        {alertNotification && (
          <div className="alert-toast-banner fade-in" style={{
            background: '#ecfdf5',
            border: '1.5px solid #10b981',
            color: '#047857',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px'
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{alertNotification}</span>
          </div>
        )}

        <div className="contacts-list">
          {(user?.emergencyContacts || []).map(contact => {
            const isNotified = alertedContacts[contact.id];
            return (
              <div key={contact.id} className="contact-item">
                <div className="contact-info">
                  <span className="c-name">{contact.name}</span>
                  <span className="c-rel">{contact.relation} • {contact.phone}</span>
                </div>
                <div className="c-status">
                  <button 
                    type="button"
                    onClick={() => handleAlertContact(contact)}
                    className={`status-tag ${isNotified ? 'tag-sent' : 'tag-ready'} active-contact-btn`}
                    title={`Click to call & send SOS alert to ${contact.name}`}
                    style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                  >
                    {isNotified ? (
                      <>
                        <CheckCircle2 size={13} color="#059669" />
                        <span>Alerted (Call)</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall size={13} color="#0284c7" />
                        <span>Ready (Click to Call)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive First Aid Guide Accordion */}
      <div className="first-aid-card glass-panel">
        <div className="card-title-row">
          <AlertOctagon size={20} color="#f59e0b" />
          <h3>Emergency First-Aid Quick Guides</h3>
        </div>

        <div className="guides-accordion">
          {FIRST_AID_GUIDES.map((guide, idx) => (
            <div key={idx} className="accordion-item glass-card">
              <div className="accordion-header" onClick={() => setOpenGuide(openGuide === idx ? null : idx)}>
                <div>
                  <h4>{guide.title}</h4>
                  <span className="guide-cat">{guide.category}</span>
                </div>
                <ChevronDown size={18} className={`arrow ${openGuide === idx ? 'rotated' : ''}`} />
              </div>

              {openGuide === idx && (
                <div className="accordion-body fade-in">
                  <ol className="steps-list">
                    {guide.steps.map((step, sIdx) => (
                      <li key={sIdx}>
                        <span className="step-num">{sIdx + 1}</span>
                        <span className="step-txt">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: INSTANT OP TOKEN APPOINTMENT BOOKING */}
      {showOpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '16px'
        }}>
          <div className="glass-panel modal-content fade-in-scale" style={{
            background: '#ffffff',
            maxWidth: '520px',
            width: '100%',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck size={22} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                    Book Instant OP Token
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Emergency Hospital Out-Patient Queue Token</span>
                </div>
              </div>

              <button 
                onClick={() => setShowOpModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpBooking}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Destination Emergency Hospital
                </label>
                <select
                  value={opHospital}
                  onChange={e => setOpHospital(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', background: '#f8fafc' }}
                >
                  <option value="Government General Hospital (GGH), Guntur">Government General Hospital (GGH), Guntur</option>
                  <option value="NRI General Hospital & Trauma Center, Guntur">NRI General Hospital & Trauma Center, Guntur</option>
                  <option value="KIMS Saveera Hospital, Narasaraopet">KIMS Saveera Hospital, Narasaraopet</option>
                  <option value="Ramesh Hospitals Emergency OPD, Guntur">Ramesh Hospitals Emergency OPD, Guntur</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Medical Specialty / OPD Department
                </label>
                <select
                  value={opDept}
                  onChange={e => setOpDept(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', background: '#f8fafc' }}
                >
                  <option value="Emergency Trauma & Critical Care">Emergency Trauma & Critical Care</option>
                  <option value="Cardiology & Chest Pain OPD">Cardiology & Chest Pain OPD</option>
                  <option value="General Medicine OPD">General Medicine OPD</option>
                  <option value="Orthopedics & Fracture Care">Orthopedics & Fracture Care</option>
                  <option value="Neurology & Stroke Emergency">Neurology & Stroke Emergency</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Duty Specialist Doctor
                </label>
                <select
                  value={opDoctor}
                  onChange={e => setOpDoctor(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', background: '#f8fafc' }}
                >
                  <option value="Dr. K. Srinivas Rao (MD Cardiology)">Dr. K. Srinivas Rao (MD Cardiology)</option>
                  <option value="Dr. A. V. S. Sarma (Emergency Chief)">Dr. A. V. S. Sarma (Emergency Chief)</option>
                  <option value="Dr. M. Lakshmi Prasanna (Trauma Specialist)">Dr. M. Lakshmi Prasanna (Trauma Specialist)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px', background: '#f0f9ff', padding: '12px', borderRadius: '12px', border: '1px solid #7dd3fc', fontSize: '0.82rem', color: '#0369a1' }}>
                <span style={{ fontWeight: '700' }}>Patient: {user?.name || 'Patient'}</span> • Phone: {user?.phone || 'Not Specified'}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowOpModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, justifyContent: 'center', padding: '12px', borderRadius: '12px', fontWeight: '800' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Confirm & Issue OP Token</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .emergency-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        .driver-vehicle-section-grid,
        .driver-patient-command-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .driver-vehicle-section-grid,
          .driver-patient-command-grid {
            grid-template-columns: 1fr;
          }
        }

        .sos-status-card {
          padding: 24px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid var(--border-light);
        }

        .sos-status-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #dc2626;
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-green {
          background: var(--color-positive);
          box-shadow: 0 0 10px var(--color-positive);
        }

        .btn-emergency {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          font-size: 1.1rem;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
        }

        .btn-emergency:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.4);
        }

        .sos-disclaimer {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 12px;
        }

        .contacts-notif-card,
        .first-aid-card {
          padding: 24px;
          border-radius: var(--radius-xl);
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .card-title-row h3 {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .c-name {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .c-rel {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .status-tag {
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tag-sent {
          background: var(--color-positive-bg);
          color: var(--color-positive);
        }

        .tag-ready {
          background: rgba(2, 132, 199, 0.1);
          color: var(--accent-cyan);
        }

        .guides-accordion {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .accordion-item {
          padding: 16px;
          border-radius: var(--radius-md);
        }

        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .accordion-header h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .guide-cat {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .arrow {
          transition: transform 0.2s ease;
        }

        .arrow.rotated {
          transform: rotate(180deg);
        }

        .accordion-body {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-light);
        }

        .steps-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .steps-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-cyan-subtle);
          color: var(--accent-cyan);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .step-txt {
          font-size: 0.85rem;
          color: var(--text-sub);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
