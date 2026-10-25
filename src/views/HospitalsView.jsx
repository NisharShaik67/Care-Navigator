import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Star, 
  Phone, 
  MapPin, 
  Clock, 
  Bed, 
  HeartPulse, 
  Stethoscope, 
  X, 
  Activity, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  PhoneCall,
  Printer
} from 'lucide-react';

const SPECIALTY_FILTERS = ['All', 'Emergency', 'Cardiology', 'ICU', 'Pediatrics', 'Orthopedics', 'General'];

// Helper to generate dynamic ICU bed details for a hospital
const getHospitalIcuData = (hosp) => {
  const icuCount = hosp?.icuBeds !== undefined ? hosp.icuBeds : (hosp?.icuAvailable || 2);
  const totalIcuBeds = hosp?.totalIcuBeds || (icuCount + 3);
  const ventilators = hosp?.ventilators !== undefined ? hosp.ventilators : Math.max(1, Math.floor(icuCount * 0.7));
  
  const beds = [
    { id: 1, name: 'ICU Bed #01', type: 'Cardiac Care (CCU)', status: 'Available', equip: 'Hamilton-C3 Invasive Ventilator & Multi-para Monitor', o2: 'High-Flow LMO Pipeline', nurse: 'Sr. Staff Nurse Preethi' },
    { id: 2, name: 'ICU Bed #02', type: 'Trauma & Emergency (TICU)', status: 'Available', equip: 'Draeger Evita Ventilator + Syringe Infusion Pumps (x4)', o2: 'Central Pipeline O2', nurse: 'Staff Nurse Rajesh' },
    { id: 3, name: 'ICU Bed #03', type: 'Medical Critical Care (MICU)', status: 'Occupied', equip: 'Ventilator Active • Post-CABG Cardiac Monitoring', o2: 'Continuous Liquid O2', nurse: 'Staff Nurse Mary' },
    { id: 4, name: 'ICU Bed #04', type: 'High Dependency Unit (HDU)', status: 'Available', equip: 'Non-Invasive BiPAP + Defibrillator & Crash Cart Ready', o2: 'Central O2 Pipeline', nurse: 'Staff Nurse Anjali' },
    { id: 5, name: 'ICU Bed #05', type: 'Neuro & Stroke ICU', status: 'Reserved', equip: 'Inbound 108 ALS Ambulance Transfer Reserved', o2: 'Central O2 Pipeline', nurse: 'Sr. Staff Nurse Vamsi' },
    { id: 6, name: 'ICU Bed #06', type: 'Surgical ICU (SICU)', status: 'Available', equip: 'Invasive Ventilator & Arterial Line Monitor', o2: 'Central Pipeline O2', nurse: 'Staff Nurse Divya' },
    { id: 7, name: 'ICU Bed #07', type: 'Isolation / Airborne ICU', status: 'Sanitizing', equip: 'Negative Pressure Chamber & HEPA Air Filtration', o2: 'High-Flow Pipeline', nurse: 'Sanitization EMT' },
    { id: 8, name: 'ICU Bed #08', type: 'Pediatric / Neonatal (NICU)', status: 'Available', equip: 'Baby Warmers, Neonatal Ventilator & Phototherapy', o2: 'Micro-Blender O2', nurse: 'Sr. NICU Nurse Lakshmi' }
  ];

  return {
    availableBeds: icuCount,
    totalBeds: totalIcuBeds,
    ventilators: ventilators,
    oxygenStatus: '100% Liquid Medical Oxygen (LMO) Online (15,000L Bulk Tank)',
    intensivist: hosp?.intensivist || 'Dr. K. Srinivas Rao, MD (Critical Care & Anesthesia)',
    nurseRatio: '1:1 Dedicated for Ventilated • 1:2 Stepdown',
    specialties: ['Cardiac CCU', 'Trauma TICU', 'Surgical SICU', 'Neonatal NICU', 'CRRT Bedside Hemodialysis', '24/7 ABG Lab'],
    directHelpline: hosp?.phone || '0863 2234567',
    beds: beds.slice(0, Math.max(4, totalIcuBeds))
  };
};

export const HospitalsView = ({ initialFilter = 'All' }) => {
  const { hospitals, navigateTo, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'All');
  
  useEffect(() => {
    if (initialFilter) {
      setSelectedFilter(initialFilter);
    }
  }, [initialFilter]);
  
  // ICU Specific Interactive States
  const [selectedIcuHospital, setSelectedIcuHospital] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [icuCategoryFilter, setIcuCategoryFilter] = useState('all');

  const filteredHospitals = (hospitals || []).filter(hosp => {
    const q = (searchTerm || '').toLowerCase().trim();
    const hospName = (hosp.name || '').toLowerCase();
    const hospAddr = (hosp.address || hosp.location || '').toLowerCase();
    const hospType = (hosp.type || '').toLowerCase();
    const hospSpecs = (hosp.specialties || []).map(s => (s || '').toLowerCase());

    const matchesSearch = !q ||
                          hospName.includes(q) ||
                          hospAddr.includes(q) ||
                          hospType.includes(q) ||
                          hospSpecs.some(s => s.includes(q));

    let matchesFilter = true;
    if (selectedFilter !== 'All') {
      const f = selectedFilter.toLowerCase();
      if (f === 'icu') {
        const icuBeds = hosp.icuBeds !== undefined ? hosp.icuBeds : (hosp.icuAvailable || 0);
        matchesFilter = (icuBeds > 0) || 
                        (hosp.ventilators > 0) ||
                        hospSpecs.some(s => s.includes('icu') || s.includes('critical')) ||
                        hospType.includes('icu') ||
                        hospType.includes('super specialty') ||
                        hospType.includes('hospital');
      } else if (f === 'emergency') {
        matchesFilter = (hosp.emergencyBeds > 0) ||
                        hospSpecs.some(s => s.includes('emergency') || s.includes('trauma')) ||
                        hospType.includes('emergency');
      } else if (f === 'cardiology') {
        matchesFilter = hospSpecs.some(s => s.includes('cardio') || s.includes('cardiac'));
      } else if (f === 'pediatrics') {
        matchesFilter = hospSpecs.some(s => s.includes('pediatric') || s.includes('child') || s.includes('neonat'));
      } else if (f === 'orthopedics') {
        matchesFilter = hospSpecs.some(s => s.includes('ortho') || s.includes('bone'));
      } else if (f === 'general') {
        matchesFilter = hospSpecs.some(s => s.includes('general') || s.includes('checkup'));
      } else {
        matchesFilter = hospSpecs.some(s => s.includes(f));
      }
    }

    if (selectedFilter === 'ICU' && icuCategoryFilter !== 'all') {
      if (icuCategoryFilter === 'ventilator') {
        matchesFilter = matchesFilter && (hosp.ventilators > 2);
      } else if (icuCategoryFilter === 'govt') {
        matchesFilter = matchesFilter && (hospName.includes('govt') || hospName.includes('ggh') || hospName.includes('area'));
      } else if (icuCategoryFilter === 'cardiac') {
        matchesFilter = matchesFilter && (hospSpecs.some(s => s.includes('cardio') || s.includes('cardiac')) || hospName.includes('cardiac') || hospName.includes('ramesh'));
      }
    }

    return matchesSearch && matchesFilter;
  });

  const handleOpenIcuDetails = (hosp) => {
    const icuData = getHospitalIcuData(hosp);
    setSelectedIcuHospital({ ...hosp, icuData });
  };

  const handleConfirmBedReservation = (bed) => {
    const token = `ICU-${Math.floor(1000 + Math.random() * 9000)}`;
    const pass = {
      token,
      bedName: bed.name,
      bedType: bed.type,
      hospitalName: selectedIcuHospital?.name || 'Government General Hospital (GGH)',
      address: selectedIcuHospital?.address || 'Collectorate Road, Guntur',
      patientName: user?.name || 'Emergency Patient',
      patientPhone: user?.phone || '+91 98765 43210',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      triagePriority: 'PRIORITY 1 - IMMEDIATE ADMISSION (RED)',
      equipment: bed.equip,
      helpline: selectedIcuHospital?.phone || '0863 2234567'
    };

    setReservationSuccess(pass);
    setReservingBed(null);
  };

  return (
    <div className="hospitals-view-container fade-in">
      {/* Search & Filter Header */}
      <div className="search-filter-bar glass-panel">
        <div className="search-input-group" style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search hospitals by name, area, or ICU critical care facility..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-chips-row">
          <Filter size={16} color="#94a3b8" />
          {SPECIALTY_FILTERS.map(filter => (
            <button
              key={filter}
              className={`filter-pill ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => {
                setSelectedFilter(filter);
                setIcuCategoryFilter('all');
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* DEDICATED ICU NETWORK COMMAND BANNER WHEN ICU IS SELECTED */}
      {selectedFilter === 'ICU' && (
        <div className="icu-command-banner glass-panel fade-in" style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)',
          color: '#ffffff',
          borderRadius: '18px',
          padding: '22px 24px',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.18)', padding: '5px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '10px' }}>
                <span className="live-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                LIVE ICU CRITICAL CARE MATRIX • GUNTUR & PALNADU
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                Intensive Care Units & Ventilator Bed Availability
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#e0f2fe', lineHeight: 1.5 }}>
                Real-time tracking of invasive ventilators, cardiac CCU, trauma resuscitation bays, and 24/7 intensivist coverage. Instant direct bed reservation enabled.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#bae6fd', display: 'block', fontWeight: '700' }}>TOTAL ICU UNITS</span>
                <strong style={{ fontSize: '1.4rem', fontWeight: '900' }}>68 Units</strong>
              </div>
              <div style={{ background: 'rgba(34, 197, 94, 0.2)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '12px', border: '1px solid #4ade80', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#dcfce7', display: 'block', fontWeight: '700' }}>VACANT & READY</span>
                <strong style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4ade80' }}>29 Ready</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#bae6fd', display: 'block', fontWeight: '700' }}>VENTILATORS</span>
                <strong style={{ fontSize: '1.4rem', fontWeight: '900' }}>34 Online</strong>
              </div>
              <a 
                href="tel:108"
                style={{ 
                  background: '#ef4444', 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  padding: '10px 18px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>24/7 HELPLINE</span>
                <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PhoneCall size={16} /> DIAL 108
                </span>
              </a>
            </div>
          </div>

          {/* Sub-Filters inside ICU view */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.78rem', color: '#bae6fd', fontWeight: '700', whiteSpace: 'nowrap' }}>Filter Units:</span>
            {[
              { id: 'all', label: 'All ICU Facilities' },
              { id: 'ventilator', label: '🫁 Ventilator Support (>2 Units)' },
              { id: 'cardiac', label: '❤️ Cardiac Care (CCU)' },
              { id: 'govt', label: '🏛️ Govt Apex / Area Hospitals' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setIcuCategoryFilter(sub.id)}
                style={{
                  background: icuCategoryFilter === sub.id ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  color: icuCategoryFilter === sub.id ? '#0369a1' : '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hospitals Cards Grid */}
      <div className="hospitals-grid">
        {filteredHospitals.length > 0 ? (
          filteredHospitals.map(hosp => {
            const emergencyCount = hosp.emergencyBeds !== undefined ? hosp.emergencyBeds : (hosp.bedsAvailable || 6);
            const icuCount = hosp.icuBeds !== undefined ? hosp.icuBeds : (hosp.icuAvailable || 2);
            const addressText = hosp.address || hosp.location || 'Narasaraopet, AP';
            const reviewCount = hosp.reviews || Math.floor((hosp.rating || 4.5) * 46);
            const queueText = hosp.emergencyQueue || (hosp.opQueueCount ? `${hosp.opQueueCount} Waiting` : '4-6 min triage');
            const icuData = getHospitalIcuData(hosp);

            return (
              <div 
                key={hosp.id} 
                className="hospital-card glass-panel fade-in"
              >
                <div className="hosp-card-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h3 className="hosp-title" style={{ margin: 0 }}>{hosp.name}</h3>
                      {selectedFilter === 'ICU' && (
                        <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          ICU Verified
                        </span>
                      )}
                    </div>
                    <p className="hosp-address">
                      <MapPin size={14} color="#94a3b8" />
                      <span>{addressText} • <strong>{hosp.distance}</strong></span>
                    </p>
                  </div>
                  <div className="rating-box">
                    <Star size={14} color="#eab308" fill="#eab308" />
                    <span>{hosp.rating || '4.6'}</span>
                    <span className="reviews">({reviewCount})</span>
                  </div>
                </div>

                {/* Vitals Row */}
                <div className="hosp-vitals-row">
                  <div className="vital-tag tag-emerald">
                    <Bed size={15} />
                    <span>{emergencyCount} Emergency Beds</span>
                  </div>
                  <div 
                    className="vital-tag tag-sky" 
                    onClick={() => handleOpenIcuDetails(hosp)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view detailed ICU bed matrix & equipment"
                  >
                    <HeartPulse size={15} color="#0284c7" />
                    <span><strong>{icuCount} {icuCount === 1 ? 'ICU Bed' : 'ICU Beds'} Ready</strong></span>
                  </div>
                  <div className="vital-tag tag-amber">
                    <Clock size={15} />
                    <span>{queueText}</span>
                  </div>
                </div>

                {/* DEDICATED ICU DETAILS SECTION (ALWAYS FULLY EXPANDED WHEN ICU IS SELECTED) */}
                {selectedFilter === 'ICU' && (
                  <div className="icu-details-card-box" style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={15} color="#0284c7" />
                        CRITICAL CARE CAPACITY & METRICS
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                        ● {icuData.availableBeds} of {icuData.totalBeds} Beds Vacant
                      </span>
                    </div>

                    {/* Progress Bar of ICU Occupancy */}
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.round((icuData.availableBeds / icuData.totalBeds) * 100)}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #10b981 0%, #0284c7 100%)',
                          borderRadius: '999px' 
                        }} 
                      />
                    </div>

                    {/* Grid of Key ICU Specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>VENTILATOR UNITS</span>
                        <strong style={{ color: '#0f172a' }}>🫁 {icuData.ventilators} Invasive / NIV</strong>
                      </div>
                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>OXYGEN SUPPLY</span>
                        <strong style={{ color: '#16a34a' }}>🟢 100% LMO Online</strong>
                      </div>
                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>LEAD INTENSIVIST ON-DUTY</span>
                        <strong style={{ color: '#0369a1' }}>🩺 {icuData.intensivist}</strong>
                      </div>
                    </div>

                    {/* ICU Sub-Specialty Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {icuData.specialties.map((spec, idx) => (
                        <span 
                          key={idx}
                          style={{
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Quick Button to Open Bed-by-Bed Matrix */}
                    <button
                      onClick={() => handleOpenIcuDetails(hosp)}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '4px',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                      }}
                    >
                      <Activity size={14} />
                      <span>View Live Bed Matrix & Equipment Breakdown</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Specialties Tags (When Not in ICU mode) */}
                {selectedFilter !== 'ICU' && (
                  <div className="specialties-tags">
                    {(hosp.specialties || []).map((spec, i) => (
                      <span key={i} className="spec-badge">
                        {spec}
                      </span>
                    ))}
                    {hosp.ventilators > 0 && (
                      <span className="spec-badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>
                        {hosp.ventilators} Ventilators
                      </span>
                    )}
                  </div>
                )}

                <div className="hosp-card-footer">
                  <a href={`tel:${hosp.phone}`} className="btn btn-secondary btn-sm">
                    <Phone size={14} />
                    <span>Call Helpline</span>
                  </a>
                  {selectedFilter === 'ICU' ? (
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => handleOpenIcuDetails(hosp)}
                    >
                      <Zap size={14} />
                      <span>Reserve ICU Bed</span>
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => navigateTo('op-booking')}
                    >
                      <Stethoscope size={14} />
                      <span>Book OP Token</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', background: '#ffffff', borderRadius: '18px' }}>
            <HeartPulse size={44} color="#0284c7" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              No Hospitals Found for "{selectedFilter}"
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
              Try selecting "All" or resetting filter criteria.
            </p>
            <button className="btn btn-primary" onClick={() => setSelectedFilter('All')}>
              View All Facilities
            </button>
          </div>
        )}
      </div>

      {/* DETAILED INTERACTIVE ICU BED MATRIX & EQUIPMENT MODAL */}
      {selectedIcuHospital && (
        <div className="modal-backdrop fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div className="modal-content glass-panel" style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '980px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #cbd5e1'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
                  <Activity size={14} /> LIVE ICU BED MATRIX & CRITICAL CARE SUITE
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {selectedIcuHospital.name}
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  <span>{selectedIcuHospital.address || selectedIcuHospital.location} • <strong>{selectedIcuHospital.distance}</strong></span>
                </p>
              </div>

              <button 
                onClick={() => setSelectedIcuHospital(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>VACANT ICU BEDS</span>
                <strong style={{ fontSize: '1.3rem', color: '#16a34a', fontWeight: '900' }}>
                  {selectedIcuHospital.icuData.availableBeds} Ready
                </strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>TOTAL ICU CAPACITY</span>
                <strong style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '900' }}>
                  {selectedIcuHospital.icuData.totalBeds} Beds
                </strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>ACTIVE VENTILATORS</span>
                <strong style={{ fontSize: '1.3rem', color: '#0284c7', fontWeight: '900' }}>
                  {selectedIcuHospital.icuData.ventilators} Units
                </strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700' }}>OXYGEN CAPACITY</span>
                <strong style={{ fontSize: '1.1rem', color: '#16a34a', fontWeight: '900' }}>
                  100% LMO
                </strong>
              </div>
            </div>

            {/* Intensivist Team & Care Protocol Banner */}
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '14px 18px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#15803d', display: 'block' }}>24/7 CRITICAL CARE TEAM ON-SITE</span>
                <strong style={{ fontSize: '0.95rem', color: '#166534' }}>
                  {selectedIcuHospital.icuData.intensivist}
                </strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                  Nursing Protocol: 1:1 for Mechanical Ventilator Patients • Bedside Hemodialysis (CRRT) Available
                </p>
              </div>

              <a 
                href={`tel:${selectedIcuHospital.phone}`}
                className="btn btn-secondary btn-sm"
                style={{ background: '#ffffff', borderColor: '#86efac', color: '#166534', fontWeight: '800' }}
              >
                <PhoneCall size={14} />
                <span>Call ICU Ward: {selectedIcuHospital.phone}</span>
              </a>
            </div>

            {/* BED-BY-BED REAL-TIME MATRIX */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bed size={18} color="#0284c7" />
                  Live ICU Bed Allocation Status
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Select an available bed to reserve for emergency intake
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {selectedIcuHospital.icuData.beds.map(bed => {
                  const isAvailable = bed.status === 'Available';
                  const isReserved = bed.status === 'Reserved';
                  const isOccupied = bed.status === 'Occupied';
                  const isSanitizing = bed.status === 'Sanitizing';

                  return (
                    <div 
                      key={bed.id}
                      style={{
                        background: isAvailable ? '#ffffff' : '#f8fafc',
                        border: isAvailable ? '1.5px solid #10b981' : isOccupied ? '1.5px solid #f87171' : '1.5px solid #cbd5e1',
                        borderRadius: '14px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        boxShadow: isAvailable ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{bed.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bed.type}</span>
                        </div>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isAvailable ? '#dcfce7' : isOccupied ? '#fee2e2' : isReserved ? '#fef3c7' : '#f1f5f9',
                          color: isAvailable ? '#15803d' : isOccupied ? '#b91c1c' : isReserved ? '#b45309' : '#475569'
                        }}>
                          ● {bed.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#475569', background: isAvailable ? '#f0fdf4' : '#f1f5f9', padding: '8px 10px', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '700', marginBottom: '2px', color: '#0f172a' }}>Equipment:</div>
                        <div>{bed.equip}</div>
                        <div style={{ marginTop: '4px', color: '#0369a1', fontWeight: '600' }}>💨 {bed.o2}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Nurse: {bed.nurse}</span>
                        {isAvailable ? (
                          <button
                            onClick={() => handleConfirmBedReservation(bed)}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Zap size={13} />
                            Reserve Bed
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            {isOccupied ? 'Occupied' : isReserved ? 'Reserved' : isSanitizing ? 'Sterilizing & Sanitizing' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Covered under Dr. YSR Aarogyasri & Emergency Triage Protocol (Free ICU Admission)
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={`tel:${selectedIcuHospital.phone}`} 
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <PhoneCall size={16} />
                  <span>Call Hospital Triage</span>
                </a>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setSelectedIcuHospital(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY BED RESERVATION CONFIRMATION MODAL */}
      {reservationSuccess && (
        <div className="modal-backdrop fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '2px solid #10b981'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={36} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#15803d', background: '#dcfce7', padding: '4px 12px', borderRadius: '999px' }}>
                EMERGENCY ICU BED RESERVED
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0f172a', margin: '10px 0 4px 0' }}>
                Reservation Token #{reservationSuccess.token}
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Bed is held active for 45 minutes for emergency transit.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Reserved Unit:</span>
                <strong style={{ color: '#0284c7' }}>{reservationSuccess.bedName} ({reservationSuccess.bedType})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Destination Hospital:</span>
                <strong style={{ color: '#0f172a' }}>{reservationSuccess.hospitalName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Equipment Prepped:</span>
                <span style={{ color: '#166534', fontWeight: '700', textAlign: 'right' }}>{reservationSuccess.equipment}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Patient Name:</span>
                <strong style={{ color: '#0f172a' }}>{reservationSuccess.patientName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Triage Priority:</span>
                <strong style={{ color: '#dc2626' }}>{reservationSuccess.triagePriority}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print Pass</span>
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: '#10b981', borderColor: '#10b981' }}
                onClick={() => {
                  setReservationSuccess(null);
                  setSelectedIcuHospital(null);
                }}
              >
                <span>Acknowledge & Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hospitals-view-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        .search-filter-bar {
          padding: 16px 24px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-radius: 16px;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          border-radius: 14px;
          padding: 10px 16px;
          flex: 1;
          max-width: 480px;
        }

        .search-input-group input {
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          width: 100%;
        }

        .filter-chips-row {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .search-filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .search-input-group {
            max-width: 100%;
          }
        }

        .filter-pill {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-pill:hover {
          background: #e2e8f0;
          color: #0f172a;
          border-color: #94a3b8;
        }

        .filter-pill.active {
          background: #0284c7 !important;
          border-color: #0284c7 !important;
          color: #ffffff !important;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
        }

        .hospitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
          width: 100%;
        }

        @media (min-width: 1200px) {
          .hospitals-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .hospital-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          transition: all 0.25s ease;
          height: 100%;
        }

        .hospital-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .hosp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .hosp-title {
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 4px;
          color: var(--text-main);
        }

        .hosp-address {
          font-size: 0.82rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rating-box {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          font-weight: 800;
          color: #eab308;
          white-space: nowrap;
        }

        .rating-box .reviews {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .hosp-vitals-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .vital-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 700;
          flex: 1;
          min-width: 95px;
          justify-content: center;
        }

        .tag-emerald {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .tag-sky {
          background: rgba(2, 132, 199, 0.12);
          color: #0284c7;
          border: 1px solid rgba(2, 132, 199, 0.3);
        }

        .tag-amber {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .specialties-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .spec-badge {
          background: #f8fafc;
          border: 1px solid var(--border-dark);
          color: var(--text-sub);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .hosp-card-footer {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .hosp-card-footer .btn {
          flex: 1;
        }

        /* Mobile & Small Screen Responsive Adjustments */
        @media (max-width: 768px) {
          .hospitals-view-container {
            padding: 14px 12px;
            gap: 14px;
          }

          .hospitals-grid {
            display: flex;
            flex-direction: column;
            gap: 14px;
            width: 100%;
          }

          .hospital-card {
            width: 100%;
            padding: 18px 16px;
            gap: 14px;
          }

          .hosp-card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }

          .hosp-title {
            font-size: 1.05rem;
          }

          .hosp-vitals-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
          }

          .vital-tag {
            width: 100%;
            justify-content: flex-start;
            padding: 8px 12px;
          }

          .hosp-card-footer {
            flex-direction: column;
            gap: 8px;
            width: 100%;
          }

          .hosp-card-footer .btn {
            width: 100%;
            justify-content: center;
          }
        }

      `}</style>
    </div>
  );
};
