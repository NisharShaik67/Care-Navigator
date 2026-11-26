import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AmbulanceRouteMap } from '../components/AmbulanceRouteMap';
import { 
  PhoneCall, 
  Truck,
  UserCheck,
  Star,
  Activity,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  MapPin,
  Clock,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  LifeBuoy,
  XCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Copy,
  Zap,
  PhoneOff,
  Volume1,
  X,
  ExternalLink
} from 'lucide-react';

export const EmergencyView = () => {
  const { user } = useApp();

  // Responder & Driver Profile Details (dynamic or standard assigned unit)
  const driverName = (user?.role === 'Responder' || user?.role === 'Driver') ? (user?.name || 'K. Rambabu') : 'K. Rambabu';
  const vehicleNumber = user?.vehicleNo || 'AP 07 TE 1084';
  const driverContact = (user?.role === 'Responder' || user?.role === 'Driver') ? (user?.phone || '+91 98765 10800') : '+91 98765 10800';

  // Live Simulated Telemetry State
  const [sosState, setSosState] = useState({
    ambulanceProgress: 45,
    distanceKm: 2.8,
    ambulanceEta: 4,
    currentStreet: 'Hospital Express Highway • Sector 4',
    location: 'Narasaraopet Main Rd, AP'
  });

  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isCancelled, setIsCancelled] = useState(false);

  // Siren Audio & Strobe State
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const sirenOscRef = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenTimerRef = useRef(null);

  // Interactive UI Modals & Live Calling State
  const [callingState, setCallingState] = useState(null); // null | '108' | 'driver'
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [activeFirstAidTab, setActiveFirstAidTab] = useState('cpr');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  };

  // Play gentle UI audio chimes
  const playBeepTone = (freq = 600, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Live Real-Time Ambulance Movement Interval
  useEffect(() => {
    if (!isLiveTracking || isCancelled) return;

    const interval = setInterval(() => {
      setSosState(prev => {
        if (prev.ambulanceProgress >= 100) {
          return {
            ...prev,
            ambulanceProgress: 100,
            distanceKm: 0,
            ambulanceEta: 0,
            currentStreet: 'Narasaraopet Main Rd • Arrived at Doorstep!'
          };
        }

        const step = 0.6 * speedMultiplier;
        const nextProgress = Math.min(100, prev.ambulanceProgress + step);
        const nextDist = Math.max(0, +(4.5 * (1 - nextProgress / 100)).toFixed(1));
        const nextEta = Math.max(0, Math.ceil(7 * (1 - nextProgress / 100)));

        let street = prev.currentStreet;
        if (nextProgress < 20) {
          street = 'Government General Hospital Hub • Exit Gate';
        } else if (nextProgress < 50) {
          street = 'Hospital Express Highway • Sector 4';
        } else if (nextProgress < 75) {
          street = 'Prakasham Main Corridor • Overbridge Flyover';
        } else if (nextProgress < 96) {
          street = 'Bypass Ring Junction • Approaching Patient Vicinity';
        } else {
          street = 'Narasaraopet Main Rd • Arrived at Doorstep!';
        }

        if (nextProgress >= 100 && prev.ambulanceProgress < 100) {
          playBeepTone(880, 0.4);
          showToast('🚨 108 ALS Ambulance #04 has arrived at your location!', 'success');
        }

        return {
          ...prev,
          ambulanceProgress: nextProgress,
          distanceKm: nextDist,
          ambulanceEta: nextEta,
          currentStreet: street
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveTracking, isCancelled, speedMultiplier]);

  // Live Call Duration Counter
  useEffect(() => {
    let timer = null;
    if (callingState) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callingState]);

  // Emergency Siren Sound Synthesizer (dual-tone 650Hz / 900Hz warble)
  const stopSiren = () => {
    if (sirenTimerRef.current) clearInterval(sirenTimerRef.current);
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch {}
      sirenOscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsSirenActive(false);
  };

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      sirenOscRef.current = osc;
      sirenGainRef.current = gain;

      let high = false;
      sirenTimerRef.current = setInterval(() => {
        if (!sirenOscRef.current) return;
        high = !high;
        sirenOscRef.current.frequency.setValueAtTime(high ? 900 : 650, ctx.currentTime);
      }, 350);

      setIsSirenActive(true);
      showToast('🔊 Emergency Audio Siren & Beacon Activated!', 'emergency');
    } catch {
      setIsSirenActive(true);
    }
  };

  const toggleSiren = () => {
    playBeepTone();
    if (isSirenActive) {
      stopSiren();
      showToast('Siren Muted.', 'info');
    } else {
      startSiren();
    }
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  // Format Call Duration Seconds into MM:SS
  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Share Live GPS Location Action
  const handleShareLocation = async () => {
    playBeepTone(750, 0.15);
    const lat = '16.2359';
    const lng = '80.0499';
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const textMsg = `EMERGENCY 108 SOS ALERT: Immediate ambulance required at Narasaraopet Main Rd. Live GPS coordinates: ${mapsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 108 Emergency Ambulance GPS Location',
          text: textMsg,
          url: mapsUrl
        });
        showToast('📍 Live GPS coordinates shared successfully!');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fall through to clipboard
        }
      }
    }

    try {
      await navigator.clipboard.writeText(mapsUrl);
      showToast('📍 GPS location link copied to clipboard!');
    } catch {
      showToast('📍 GPS Location: 16.2359° N, 80.0499° E');
    }
  };

  // Restart Ambulance Dispatch Simulation
  const handleRestartSimulation = () => {
    playBeepTone(800, 0.15);
    setIsCancelled(false);
    setIsLiveTracking(true);
    setSosState({
      ambulanceProgress: 0,
      distanceKm: 4.8,
      ambulanceEta: 7,
      currentStreet: 'Government General Hospital Hub • Exit Gate',
      location: 'Narasaraopet Main Rd, AP'
    });
    showToast('🔄 Ambulance dispatch route reset to start.');
  };

  // Cancel Dispatch Confirmation
  const handleConfirmCancelDispatch = () => {
    playBeepTone(400, 0.2);
    setIsCancelled(true);
    setIsLiveTracking(false);
    stopSiren();
    setShowCancelModal(false);
    showToast('⚠️ Ambulance dispatch cancelled by user.', 'info');
  };

  // Re-activate Dispatch
  const handleReactivateDispatch = () => {
    playBeepTone(880, 0.2);
    setIsCancelled(false);
    setIsLiveTracking(true);
    showToast('🚨 108 Ambulance Dispatch Re-activated!');
  };

  return (
    <div className="emergency-view-container fade-in">
      {/* Dynamic Toast Feedback */}
      {toast && (
        <div className={`live-emergency-toast ${toast.type}`}>
          <CheckCircle2 size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 24/7 Helpline Header Card with Live Status */}
      <div className="sos-status-card glass-panel" style={{
        background: '#ffffff',
        color: '#0f172a',
        border: isCancelled ? '1.5px solid #cbd5e1' : (isSirenActive ? '2px solid #ef4444' : '1px solid #e2e8f0'),
        boxShadow: isSirenActive ? '0 0 25px rgba(239, 68, 68, 0.25)' : 'none'
      }}>
        <div className="sos-status-top">
          <div className="status-indicator" style={{ color: isCancelled ? '#64748b' : '#dc2626' }}>
            <div className={`status-dot ${isCancelled ? 'dot-gray' : (sosState.ambulanceProgress >= 100 ? 'dot-green' : 'dot-red-pulse')}`}></div>
            <span>
              {isCancelled 
                ? 'AMBULANCE DISPATCH SUSPENDED' 
                : (sosState.ambulanceProgress >= 100 
                    ? 'ALS AMBULANCE ARRIVED AT YOUR LOCATION' 
                    : 'EMERGENCY AMBULANCE DISPATCH • DIAL 108')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isSirenActive && (
              <span className="beacon-badge flash-siren">
                <Volume2 size={13} /> SIREN ACTIVE
              </span>
            )}
            <span className="badge" style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              background: isCancelled ? '#f1f5f9' : (sosState.ambulanceProgress >= 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)'),
              color: isCancelled ? '#64748b' : (sosState.ambulanceProgress >= 100 ? '#10b981' : '#dc2626'),
              border: `1px solid ${isCancelled ? '#cbd5e1' : (sosState.ambulanceProgress >= 100 ? '#10b981' : '#f87171')}`
            }}>
              {isCancelled ? 'Status: Cancelled' : (sosState.ambulanceProgress >= 100 ? 'ALS Unit #04 • Arrived' : 'ALS Unit #04 • En Route')}
            </span>
          </div>
        </div>

        {/* Big Emergency Call Button */}
        <div className="sos-trigger-box">
          <a 
            href="tel:108" 
            onClick={(e) => {
              playBeepTone(880, 0.2);
              setCallingState('108');
            }}
            className="btn btn-emergency btn-block" 
            style={{ 
              textDecoration: 'none', 
              padding: '16px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <PhoneCall size={24} />
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>CALL 108 AMBULANCE HELPLINE</span>
          </a>
          <p className="sos-disclaimer">
            24/7 National Emergency Medical Response Service • Direct helpline for immediate emergency dispatch
          </p>
        </div>

        {/* Live Quick Emergency Command Buttons Bar */}
        <div className="emergency-actions-command-bar">
          <button 
            type="button"
            className="action-cmd-btn"
            onClick={handleShareLocation}
            title="Share GPS Location via WhatsApp / SMS"
          >
            <Share2 size={16} color="#0284c7" />
            <span>Share GPS Location</span>
          </button>

          <button 
            type="button"
            className={`action-cmd-btn ${isSirenActive ? 'active-siren-btn' : ''}`}
            onClick={toggleSiren}
            title="Sound Loud Audio Siren so Driver Can Locate You"
          >
            {isSirenActive ? <VolumeX size={16} color="#ffffff" /> : <Volume2 size={16} color="#dc2626" />}
            <span>{isSirenActive ? 'Mute Siren' : 'Audio Siren & Flash'}</span>
          </button>

          <button 
            type="button"
            className="action-cmd-btn"
            onClick={() => {
              playBeepTone();
              setShowFirstAidModal(true);
            }}
            title="Emergency First-Aid Steps While Waiting"
          >
            <LifeBuoy size={16} color="#059669" />
            <span>First-Aid Guide</span>
          </button>

          {isCancelled ? (
            <button 
              type="button"
              className="action-cmd-btn reactivate-btn"
              onClick={handleReactivateDispatch}
              title="Re-activate Ambulance Dispatch"
            >
              <RotateCcw size={16} color="#166534" />
              <span>Re-activate 108</span>
            </button>
          ) : (
            <button 
              type="button"
              className="action-cmd-btn cancel-btn"
              onClick={() => {
                playBeepTone();
                setShowCancelModal(true);
              }}
              title="Cancel Ambulance Dispatch"
            >
              <XCircle size={16} color="#64748b" />
              <span>Cancel Ambulance</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Route Telemetry Map */}
      <AmbulanceRouteMap 
        sosState={sosState} 
        isLiveTracking={isLiveTracking && !isCancelled}
        onToggleLiveTracking={() => {
          playBeepTone();
          setIsLiveTracking(prev => !prev);
          showToast(isLiveTracking ? 'Live tracking paused.' : 'Live tracking resumed.');
        }}
        onRestartSimulation={handleRestartSimulation}
        onSpeedChange={(spd) => {
          setSpeedMultiplier(spd);
          showToast(`Simulation speed set to ${spd}x`);
        }} 
      />

      {/* Live Quick Location & Street Summary HUD */}
      <div className="glass-card" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color="#0284c7" />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
              Current Ambulance Location & Street
            </span>
            <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
              {sosState.currentStreet}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={16} color="#0284c7" />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Distance:</span>
            <strong style={{ fontSize: '0.92rem', color: '#0284c7' }}>
              {sosState.distanceKm > 0 ? `${sosState.distanceKm} km` : 'Arrived'}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#dc2626" />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>ETA:</span>
            <strong style={{ fontSize: '0.92rem', color: '#dc2626' }}>
              {sosState.ambulanceEta > 0 ? `${sosState.ambulanceEta} mins` : 'At Location'}
            </strong>
          </div>
          {sosState.ambulanceProgress >= 100 && (
            <button
              type="button"
              onClick={handleRestartSimulation}
              className="btn btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Restart Route</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Driver Details & Ambulance Details */}
      <div className="driver-vehicle-section-grid">
        {/* Card 1: Assigned Driver Details (Driver Name & Contact Number) */}
        <div className="glass-card driver-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#0f172a' }}>Assigned EMT Driver</h3>
            </div>
            <span className="badge badge-bullish" style={{ fontSize: '0.72rem' }}>
              {sosState.ambulanceProgress >= 100 ? 'At Scene' : 'On Duty • En Route'}
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
                alt={`Driver ${driverName}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '1.18rem', fontWeight: '800', color: '#0f172a' }}>{driverName}</h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.84rem', color: '#0284c7', fontWeight: '700' }}>
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

          <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>EMT License No:</span>
              <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>AP-07-2018-0049281</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '600' }}>Driver Contact Number:</span>
              <strong style={{ color: '#0284c7', fontSize: '1.02rem', fontWeight: '800' }}>{driverContact}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a 
              href={`tel:${driverContact.replace(/\D/g, '')}`} 
              onClick={(e) => {
                playBeepTone(880, 0.2);
                setCallingState('driver');
              }}
              className="btn btn-primary"
              style={{ 
                flex: 1,
                minWidth: '200px',
                justifyContent: 'center', 
                padding: '14px', 
                borderRadius: '14px', 
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <PhoneCall size={20} />
              <span>Call Driver {driverName}</span>
            </a>

            <button
              type="button"
              onClick={handleShareLocation}
              className="btn btn-secondary"
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              title="Send GPS Directions to Driver"
            >
              <Share2 size={18} color="#0284c7" />
              <span>Send GPS</span>
            </button>
          </div>
        </div>

        {/* Card 2: Ambulance Vehicle & Equipment Details */}
        <div className="glass-card vehicle-card" style={{ padding: '22px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="#dc2626" />
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#0f172a' }}>Ambulance Vehicle & Life Support</h3>
            </div>
            <span className="badge badge-bearish" style={{ fontSize: '0.72rem' }}>
              Reg: {vehicleNumber}
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

          <div className="onboard-equipment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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

      {/* MODAL 1: LIVE CALLING HUD (Calling 108 or Driver) */}
      {callingState && (
        <div className="emergency-modal-overlay fade-in" onClick={() => setCallingState(null)}>
          <div className="emergency-call-card fade-in" onClick={e => e.stopPropagation()}>
            <div className="call-avatar-circle">
              {callingState === '108' ? (
                <Truck size={42} color="#ffffff" />
              ) : (
                <PhoneCall size={42} color="#ffffff" />
              )}
            </div>

            <h3 style={{ margin: '14px 0 4px', fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>
              {callingState === '108' ? '108 Emergency Control Center' : `EMT Driver: ${driverName}`}
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
              {callingState === '108' ? 'Dialing National Emergency Toll-Free 108' : `Direct Band: ${driverContact}`}
            </p>

            <div className="call-status-pill">
              <span className="live-call-dot"></span>
              <span>{callDuration > 2 ? `Call Connected • ${formatDuration(callDuration)}` : 'Connecting to Radio Terminal...'}</span>
            </div>

            <div className="call-controls-row">
              <button
                type="button"
                className={`call-ctrl-btn ${isSpeakerOn ? 'speaker-active' : ''}`}
                onClick={() => {
                  playBeepTone();
                  setIsSpeakerOn(prev => !prev);
                }}
                title="Toggle Speakerphone"
              >
                {isSpeakerOn ? <Volume2 size={22} /> : <Volume1 size={22} />}
                <span>{isSpeakerOn ? 'Speaker On' : 'Speaker Off'}</span>
              </button>

              <button
                type="button"
                className="call-ctrl-btn hangup-btn"
                onClick={() => {
                  playBeepTone(400, 0.15);
                  setCallingState(null);
                  showToast('Call ended.', 'info');
                }}
                title="End Call"
              >
                <PhoneOff size={24} />
                <span>End Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FIRST AID GUIDE WHILE WAITING */}
      {showFirstAidModal && (
        <div className="emergency-modal-overlay fade-in" onClick={() => setShowFirstAidModal(false)}>
          <div className="firstaid-modal-content glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <div className="firstaid-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LifeBuoy size={24} color="#059669" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Emergency First-Aid Guide</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Life-saving actions while waiting for 108 Ambulance</p>
                </div>
              </div>
              <button 
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFirstAidModal(false)}
                title="Close Guide"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="firstaid-tabs-row">
              <button
                type="button"
                className={`fa-tab-btn ${activeFirstAidTab === 'cpr' ? 'active' : ''}`}
                onClick={() => setActiveFirstAidTab('cpr')}
              >
                🫀 CPR Steps
              </button>
              <button
                type="button"
                className={`fa-tab-btn ${activeFirstAidTab === 'bleeding' ? 'active' : ''}`}
                onClick={() => setActiveFirstAidTab('bleeding')}
              >
                🩸 Severe Bleeding
              </button>
              <button
                type="button"
                className={`fa-tab-btn ${activeFirstAidTab === 'cardiac' ? 'active' : ''}`}
                onClick={() => setActiveFirstAidTab('cardiac')}
              >
                ⚡ Chest Pain
              </button>
              <button
                type="button"
                className={`fa-tab-btn ${activeFirstAidTab === 'choking' ? 'active' : ''}`}
                onClick={() => setActiveFirstAidTab('choking')}
              >
                🗣️ Choking
              </button>
            </div>

            {/* Tab Details Content */}
            <div className="firstaid-body">
              {activeFirstAidTab === 'cpr' && (
                <div className="fa-content-pane">
                  <h4>Cardiopulmonary Resuscitation (CPR) Protocol</h4>
                  <ol>
                    <li><strong>Check Responsiveness:</strong> Tap shoulders and ask loudly, "Are you okay?". If no response, begin immediately.</li>
                    <li><strong>Hand Placement:</strong> Place the heel of one hand in the center of the chest (between nipples). Interlock fingers of your second hand.</li>
                    <li><strong>Compress Hard & Fast:</strong> Push down at least 2 inches (5 cm) at a rate of 100–120 compressions/minute (to the beat of "Stayin' Alive").</li>
                    <li><strong>30 Compressions & 2 Breaths:</strong> Deliver 30 firm compressions followed by 2 gentle rescue breaths (tilt head back, lift chin).</li>
                    <li><strong>Do Not Stop:</strong> Continue until the EMT ambulance crew arrives or the patient begins breathing normally.</li>
                  </ol>
                </div>
              )}

              {activeFirstAidTab === 'bleeding' && (
                <div className="fa-content-pane">
                  <h4>Controlling Severe Blood Loss</h4>
                  <ol>
                    <li><strong>Apply Direct Pressure:</strong> Place a clean cloth, gauze, or towel directly over the wound and press firmly with both hands.</li>
                    <li><strong>Maintain Continuous Pressure:</strong> Do NOT lift the cloth to check. If blood soaks through, add another cloth on top.</li>
                    <li><strong>Elevate Wound:</strong> If on an arm or leg, elevate the injured limb above heart level while maintaining firm pressure.</li>
                    <li><strong>Keep Patient Warm:</strong> Cover the patient with a blanket or jacket to prevent hypothermia and medical shock.</li>
                  </ol>
                </div>
              )}

              {activeFirstAidTab === 'cardiac' && (
                <div className="fa-content-pane">
                  <h4>Suspected Heart Attack / Acute Chest Pain</h4>
                  <ol>
                    <li><strong>Rest in Seated Position:</strong> Sit the patient down on the floor or couch with knees bent and back supported (W-position).</li>
                    <li><strong>Loosen Tight Clothing:</strong> Unbutton collar, belt, or tight garments to ease breathing.</li>
                    <li><strong>Calm & Reassure:</strong> Keep the patient calm. Do not allow them to walk or exert physical effort.</li>
                    <li><strong>Aspirin (If Advised):</strong> If conscious and not allergic, 300mg of chewable Aspirin may be taken as directed by emergency triage.</li>
                  </ol>
                </div>
              )}

              {activeFirstAidTab === 'choking' && (
                <div className="fa-content-pane">
                  <h4>Severe Airway Obstruction (Choking)</h4>
                  <ol>
                    <li><strong>Encourage Coughing:</strong> If patient can speak or cough, encourage them to cough forcefully.</li>
                    <li><strong>5 Back Blows:</strong> Stand behind, lean them forward, and deliver 5 firm blows between shoulder blades with the heel of your hand.</li>
                    <li><strong>5 Abdominal Thrusts (Heimlich):</strong> Place a fist just above the navel, grasp with your other hand, and pull inward and upward sharply.</li>
                    <li><strong>Alternate 5 & 5:</strong> Repeat until the blockage is dislodged or EMT team arrives.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="firstaid-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowFirstAidModal(false)}
                style={{ width: '100%', borderRadius: '12px', padding: '12px' }}
              >
                Understood • Return to Live Dispatch Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL DISPATCH CONFIRMATION */}
      {showCancelModal && (
        <div className="emergency-modal-overlay fade-in" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-confirm-card glass-panel fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <AlertTriangle size={28} color="#dc2626" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', textAlign: 'center' }}>
              Cancel 108 Ambulance Dispatch?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: '#64748b', textAlign: 'center', lineHeight: 1.45 }}>
              Are you sure you want to cancel the ALS Unit #04 dispatch? Only cancel if the emergency is resolved or reported by mistake.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
              >
                Keep Active
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmCancelDispatch}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#dc2626', color: '#ffffff', fontWeight: '700' }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .emergency-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px 28px 80px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .live-emergency-toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2000;
          padding: 12px 24px;
          border-radius: 999px;
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          animation: slideDown 0.25s ease-out;
        }

        .live-emergency-toast.emergency {
          background: #dc2626;
        }

        .live-emergency-toast.info {
          background: #0369a1;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .sos-status-card {
          padding: 24px;
          border-radius: var(--radius-xl, 24px);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid var(--border-light, #e2e8f0);
          transition: all 0.3s ease;
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
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-green {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .dot-gray {
          background: #94a3b8;
        }

        .dot-red-pulse {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          animation: redPulse 1.2s infinite ease-in-out;
        }

        @keyframes redPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .beacon-badge {
          background: #dc2626;
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .flash-siren {
          animation: flashColor 0.6s infinite alternate;
        }

        @keyframes flashColor {
          from { background: #dc2626; box-shadow: 0 0 12px rgba(220, 38, 38, 0.7); }
          to { background: #0284c7; box-shadow: 0 0 12px rgba(2, 132, 199, 0.7); }
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
          color: var(--text-muted, #64748b);
          text-align: center;
          margin-top: 12px;
        }

        .emergency-actions-command-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .action-cmd-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          color: #1e293b;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .action-cmd-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .action-cmd-btn.active-siren-btn {
          background: #dc2626;
          color: #ffffff;
          border-color: #b91c1c;
          animation: flashColor 0.6s infinite alternate;
        }

        .action-cmd-btn.reactivate-btn {
          background: #ecfdf5;
          color: #065f46;
          border-color: #a7f3d0;
        }

        .driver-vehicle-section-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        /* Modal Backdrop */
        .emergency-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1500;
          padding: 16px;
        }

        /* Live Call Card */
        .emergency-call-card {
          width: 100%;
          max-width: 400px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          padding: 36px 24px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .call-avatar-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.5);
          animation: callRing 1.5s infinite ease-out;
        }

        @keyframes callRing {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .call-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 14px;
          border-radius: 20px;
          color: #38bdf8;
          font-size: 0.82rem;
          font-weight: 700;
          margin: 18px 0 28px;
        }

        .live-call-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }

        .call-controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          width: 100%;
        }

        .call-ctrl-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.12);
          border: none;
          color: #ffffff;
          padding: 12px 18px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 0.76rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .call-ctrl-btn:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        .call-ctrl-btn.speaker-active {
          background: #0284c7;
        }

        .call-ctrl-btn.hangup-btn {
          background: #dc2626;
          padding: 12px 24px;
        }

        .call-ctrl-btn.hangup-btn:hover {
          background: #b91c1c;
        }

        /* First Aid Modal Content */
        .firstaid-modal-content {
          width: 100%;
          max-width: 580px;
          max-height: 88vh;
          max-height: 88dvh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .firstaid-header {
          padding: 18px 22px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
        }

        .modal-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
        }

        .firstaid-tabs-row {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .fa-tab-btn {
          padding: 8px 14px;
          border-radius: 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .fa-tab-btn.active {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
        }

        .firstaid-body {
          padding: 20px 22px;
          overflow-y: auto;
          flex: 1;
        }

        .fa-content-pane h4 {
          margin: 0 0 12px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }

        .fa-content-pane ol {
          margin: 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 0.88rem;
          color: #334155;
          line-height: 1.5;
        }

        .firstaid-footer {
          padding: 14px 22px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        /* Cancel Confirmation Card */
        .cancel-confirm-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border-radius: 24px;
          padding: 28px 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          .driver-vehicle-section-grid {
            grid-template-columns: 1fr;
          }

          .emergency-actions-command-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .emergency-view-container {
            padding: 14px 12px 80px;
            gap: 14px;
          }

          .sos-status-card {
            padding: 16px;
            border-radius: 18px;
          }

          .sos-status-top {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }

          .status-indicator {
            font-size: clamp(0.72rem, 2.8vw, 0.85rem) !important;
          }

          .emergency-actions-command-bar {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .action-cmd-btn {
            padding: 9px 10px;
            font-size: 0.78rem;
          }
        }

        @media (max-width: 480px) {
          .onboard-equipment-grid {
            grid-template-columns: 1fr !important;
          }

          .emergency-actions-command-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
