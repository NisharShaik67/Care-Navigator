import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Stethoscope, 
  Clock, 
  ArrowRight, 
  Camera, 
  Star,
  Sparkles,
  CreditCard,
  XCircle,
  Phone,
  Search,
  Zap
} from 'lucide-react';

export const OPBookingView = () => {
  const { hospitals, user, bookOPToken, updateDoctorAvatar } = useApp();

  const [selectedHospitalId, setSelectedHospitalId] = useState(() => hospitals?.[0]?.id || 'hosp-4');
  const [toastMsg, setToastMsg] = useState('');

  // Dynamically derive current selected hospital from hospitals state
  const selectedHospital = useMemo(() => {
    return (hospitals || []).find(h => h.id === selectedHospitalId) || hospitals?.[0] || null;
  }, [hospitals, selectedHospitalId]);

  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [bookingModalDoc, setBookingModalDoc] = useState(null); // When non-null, modal opens

  // Lock body scroll when modal is open so background never scrolls
  useEffect(() => {
    if (bookingModalDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [bookingModalDoc]);

  // Close booking modal on ESC key press
  useEffect(() => {
    if (!bookingModalDoc) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setBookingModalDoc(null);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [bookingModalDoc]);

  // Compute filtered doctors list for selected hospital
  const filteredDoctors = useMemo(() => {
    if (!selectedHospital || !selectedHospital.doctors) return [];
    const q = (docSearchQuery || '').toLowerCase().trim();
    if (!q) return selectedHospital.doctors;
    return selectedHospital.doctors.filter(d => 
      (d.name || '').toLowerCase().includes(q) || 
      (d.specialty || '').toLowerCase().includes(q) ||
      (d.title || '').toLowerCase().includes(q) ||
      (d.qualification || '').toLowerCase().includes(q) ||
      (d.roomNo || '').toLowerCase().includes(q)
    );
  }, [selectedHospital, docSearchQuery]);

  // Booking Form State
  const [patientType, setPatientType] = useState('self'); // 'self' | 'other'
  const [otherPatientName, setOtherPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '+91 9876543210');
  
  // Date picker (defaults to today's date formatted YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('11:00 AM');
  const [symptomsReason, setSymptomsReason] = useState('General health checkup & medical consultation');
  const [paymentMode, setPaymentMode] = useState('upi'); // 'upi' | 'abha' | 'cash'

  const TIME_SLOTS = ['09:30 AM', '11:00 AM', '02:15 PM', '04:30 PM', '05:45 PM', '07:00 PM'];

  const handleOpenDoctorBooking = (doc) => {
    setBookingModalDoc(doc);
  };

  const handleImageUpload = (e, docId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const newAvatarUrl = uploadEvent.target.result;
      updateDoctorAvatar(docId, newAvatarUrl);
      if (bookingModalDoc && bookingModalDoc.id === docId) {
        setBookingModalDoc(prev => ({ ...prev, avatar: newAvatarUrl }));
      }
      setToastMsg('Doctor photo updated successfully!');
      setTimeout(() => setToastMsg(''), 3500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleFinalSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingModalDoc) return;

    const patientNameFinal = patientType === 'self' ? (user?.name || user?.fullName || 'Alex Morgan') : (otherPatientName || 'Patient');
    const tokenData = {
      patientName: patientNameFinal,
      patientPhone: patientPhone || user?.phone || '+91 98765 43210',
      hospitalName: selectedHospital ? selectedHospital.name : 'Hospital',
      doctorName: bookingModalDoc.name,
      specialty: bookingModalDoc.specialty,
      date: bookingDate,
      timeSlot: selectedTimeSlot,
      reason: symptomsReason,
      age: patientType === 'self' ? (user?.age || 28) : 32,
      gender: patientType === 'self' ? (user?.gender || 'Male') : 'Male',
      fee: bookingModalDoc.fee || '₹300',
      paymentMode: paymentMode.toUpperCase(),
      paymentStatus: paymentMode === 'cash' ? 'PAY AT COUNTER' : 'PAID ONLINE'
    };

    bookOPToken(tokenData);
    setBookingModalDoc(null);
  };

  return (
    <div className="op-booking-view-container fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '0.9rem',
          border: '1.5px solid rgba(255, 255, 255, 0.3)'
        }} className="fade-in">
          <Sparkles size={18} color="#ffffff" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sleek Hospital Selector Bar */}
      <div className="compact-hosp-header-bar glass-panel fade-in">
        <div className="hosp-select-left">
          <div className="hosp-icon-badge">
            <Building2 size={22} color="#0284c7" />
          </div>
          <div className="hosp-select-wrapper">
            <label className="hosp-select-label">Select Hospital / Clinic Facility:</label>
            <select 
              className="hosp-dropdown-select"
              value={selectedHospital ? selectedHospital.id : ''}
              onChange={(e) => {
                setSelectedHospitalId(e.target.value);
              }}
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} — ({h.distance}) • ⭐ {h.rating} Rating
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedHospital && (
          <div className="hosp-quick-info-pills">
            <span className="info-chip queue">
              <span style={{
                background: '#f59e0b',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
                flexShrink: 0
              }}>
                <Zap size={13} color="#ffffff" fill="#ffffff" />
              </span>
              <strong style={{ color: '#000000', fontSize: '0.88rem' }}>{selectedHospital.opQueueCount} in OP Queue</strong>
            </span>
            <span className="info-chip phone">
              <span style={{
                background: '#16a34a',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                flexShrink: 0
              }}>
                <Phone size={13} color="#ffffff" fill="#ffffff" />
              </span>
              <strong style={{ color: '#000000', fontSize: '0.88rem' }}>{selectedHospital.phone?.replace(/^0/, '')}</strong>
            </span>
          </div>
        )}
      </div>


      {/* Available Doctors List Section */}
      <div className="doctors-list-section">
        <div className="section-header-row">
          <div>
            <h3>Available Doctors at {selectedHospital ? selectedHospital.name : ''}</h3>
            <p className="sub">Tap on any doctor to book your OP consultation token immediately</p>
          </div>

          <div className="doc-search-box">
            <Search size={16} color="#64748b" />
            <input 
              type="text"
              placeholder="Filter doctor or specialty..."
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
            />
            {docSearchQuery && (
              <button className="clear-btn" onClick={() => setDocSearchQuery('')}>×</button>
            )}
          </div>
        </div>

        <div className="doctor-cards-grid">
          {filteredDoctors.length === 0 ? (
            <div className="no-docs-found">
              <p>No doctors found matching "{docSearchQuery}".</p>
            </div>
          ) : (
            filteredDoctors.map(doc => (
              <div
                key={doc.id}
                className={`doc-card glass-card ${doc.isCommonDoctor ? 'common-doctor-highlight' : ''}`}
                onClick={() => handleOpenDoctorBooking(doc)}
              >
                {doc.isCommonDoctor && (
                  <div className="common-doc-ribbon">
                    <Sparkles size={14} color="#ffffff" />
                    <span>RECOMMENDED FOR GENERAL CHECKUP & REFERRAL</span>
                  </div>
                )}
                <div className="doc-card-inner">
                  <div className="doc-avatar-container">
                    <img 
                      src={doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"} 
                      alt={doc.name} 
                      className="doc-avatar-img" 
                    />
                    <span className="live-dot" title="Available Today"></span>
                    <label 
                      className="photo-upload-overlay" 
                      title="Upload / Change Doctor Picture" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Camera size={13} color="#ffffff" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleImageUpload(e, doc.id)}
                      />
                    </label>
                  </div>

                  <div className="doc-details">
                    <div className="doc-title-row">
                      <h4>{doc.name}</h4>
                      {doc.rating && (
                        <span className="rating-tag">
                          <Star size={12} color="#eab308" fill="#eab308" />
                          {doc.rating} Rating
                        </span>
                      )}
                    </div>

                    {doc.title && <p className="doc-qualification">{doc.title}</p>}
                    <p className="doc-specialty-txt">{doc.specialty}</p>
                    <p className="doc-room-txt">Room: {doc.roomNo}</p>

                    <div className="doc-meta-row">
                      <span className="chip chip-exp">{doc.experience} Exp</span>
                      <span className="chip chip-fee">{doc.fee || '₹300'} OPD</span>
                      <span className="chip chip-avail">{doc.available}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-sm tap-to-book-btn">
                    <span>Book OP</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


      {/* Booking Form Modal triggered on Doctor Click - Rendered into body via Portal */}
      {bookingModalDoc && typeof document !== 'undefined' && createPortal(
        <div className="modal-backdrop op-modal-portal fade-in" onClick={() => setBookingModalDoc(null)}>
          <div className="modal-content glass-panel booking-modal fade-in" onClick={e => e.stopPropagation()}>
            {/* 1. Modal Top Fixed Header */}
            <div className="modal-header-section">
              <div className="modal-header">
                <div className="m-title">
                  <Stethoscope size={22} color="#0284c7" />
                  <div>
                    <h3>Book OP Token Pass</h3>
                    <p className="sub">{selectedHospital ? selectedHospital.name : 'Hospital'}</p>
                  </div>
                </div>
                <button className="btn-close" onClick={() => setBookingModalDoc(null)} aria-label="Close modal">
                  <XCircle size={22} />
                </button>
              </div>

              {/* Selected Doctor Summary Header */}
              <div className="modal-doc-summary-chip glass-card">
                <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
                  <img 
                    src={bookingModalDoc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"} 
                    alt="Doc" 
                    className="mini-doc-img" 
                    style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
                  />
                  <label 
                    className="photo-upload-overlay" 
                    title="Upload / Change Doctor Picture"
                    style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '22px', height: '22px' }}
                  >
                    <Camera size={11} color="#ffffff" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleImageUpload(e, bookingModalDoc.id)}
                    />
                  </label>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bookingModalDoc.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#0284c7', fontWeight: '600' }}>{bookingModalDoc.specialty}</p>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>Room: {bookingModalDoc.roomNo} • Fee: {bookingModalDoc.fee || '₹300'}</p>
                </div>
              </div>
            </div>

            {/* 2. Scrollable Body with all booking inputs */}
            <div className="modal-scrollable-body">
              <form id="op-booking-form-id" onSubmit={handleFinalSubmitBooking} className="op-booking-form">
                {/* Patient Type Selection */}
                <div className="form-group">
                  <label className="form-label">Booking OP Token For:</label>
                  <div className="patient-type-toggle">
                    <label className={`toggle-option ${patientType === 'self' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="ptype" 
                        checked={patientType === 'self'} 
                        onChange={() => setPatientType('self')} 
                      />
                      <span>I am the Patient ({user?.name || 'Self'})</span>
                    </label>

                    <label className={`toggle-option ${patientType === 'other' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="ptype" 
                        checked={patientType === 'other'} 
                        onChange={() => setPatientType('other')} 
                      />
                      <span>Another Person</span>
                    </label>
                  </div>
                </div>

                {/* Blank Patient Name Input if Another Person */}
                {patientType === 'other' && (
                  <div className="form-group fade-in">
                    <label className="form-label">Enter Patient Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter patient full name..."
                      value={otherPatientName}
                      onChange={e => setOtherPatientName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Phone Number */}
                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Date of Booking OP */}
                <div className="form-group">
                  <label className="form-label">Date of Booking OP *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingDate}
                    min={todayStr}
                    onChange={e => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                {/* Available Time Slots for Selected Date */}
                <div className="form-group">
                  <label className="form-label">Available Time Slots for {bookingDate} *</label>
                  <div className="modal-time-slots-grid">
                    {TIME_SLOTS.map((slot, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`slot-chip ${selectedTimeSlot === slot ? 'active' : ''}`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        <Clock size={13} />
                        <span>{slot}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health Problem / Symptoms */}
                <div className="form-group">
                  <label className="form-label">Health Problem / Symptoms (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. General checkup, fever, stomach pain, weakness..."
                    value={symptomsReason}
                    onChange={e => setSymptomsReason(e.target.value)}
                  />
                </div>

                {/* Payment Mode Selection */}
                <div className="form-group">
                  <label className="form-label">Select Payment Mode *</label>
                  <div className="payment-options-grid">
                    <label className={`pay-card ${paymentMode === 'upi' ? 'selected' : ''}`}>
                      <input type="radio" name="paym" checked={paymentMode === 'upi'} onChange={() => setPaymentMode('upi')} />
                      <div>
                        <strong>UPI / GPay / PhonePe</strong>
                        <p>Instant Digital OP Pass</p>
                      </div>
                    </label>

                    <label className={`pay-card ${paymentMode === 'abha' ? 'selected' : ''}`}>
                      <input type="radio" name="paym" checked={paymentMode === 'abha'} onChange={() => setPaymentMode('abha')} />
                      <div>
                        <strong>ABHA / Aadhaar Card</strong>
                        <p>Govt Health ID Payment</p>
                      </div>
                    </label>

                    <label className={`pay-card ${paymentMode === 'cash' ? 'selected' : ''}`}>
                      <input type="radio" name="paym" checked={paymentMode === 'cash'} onChange={() => setPaymentMode('cash')} />
                      <div>
                        <strong>Pay at Counter</strong>
                        <p>Pay Cash at OP Desk</p>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* 3. Sticky Bottom Action Row - Always visible & tappable */}
            <div className="modal-sticky-footer">
              <div className="fee-summary">
                <span className="lbl">Total OPD Fee</span>
                <span className="amount text-emerald">{bookingModalDoc.fee || '₹300'}</span>
              </div>
              <button type="submit" form="op-booking-form-id" className="btn btn-primary btn-lg pay-submit-btn">
                <CreditCard size={18} />
                <span>Pay & Complete OP Booking</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .op-booking-view-container {
          padding: 24px 32px 80px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hospitals-section-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .compact-hosp-header-bar {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
        }

        .hosp-select-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 280px;
        }

        .hosp-icon-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(2, 132, 199, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hosp-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .hosp-select-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .hosp-dropdown-select {
          background: #f8fafc;
          border: 1.5px solid #0284c7;
          color: #0f172a;
          font-size: 0.98rem;
          font-weight: 700;
          padding: 9px 14px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
        }

        .hosp-dropdown-select:focus {
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2);
        }

        .hosp-quick-info-pills {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-right: 12px;
        }

        .info-chip {
          font-size: 0.82rem;
          font-weight: 800;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-chip.dist {
          background: #e0f2fe;
          color: #0369a1;
        }

        .info-chip.star {
          background: #fef9c3;
          color: #854d0e;
          border: 1px solid #fef08a;
        }

        .info-chip.queue {
          background: transparent;
          color: #0f172a;
          border: none;
          padding: 4px 8px;
        }

        .info-chip.phone {
          background: transparent;
          color: #000000;
          border: none;
          padding: 4px 8px;
        }


        .doc-qualification {
          font-size: 0.78rem;
          color: #64748b;
          margin: 1px 0 3px 0;
          font-weight: 500;
        }

        .doc-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 10px;
          min-width: 220px;
        }

        .doc-search-box input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.82rem;
          width: 100%;
          color: #1e293b;
        }

        .no-docs-found {
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          grid-column: 1 / -1;
        }

        .common-doctor-help-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 132, 199, 0.08) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .banner-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .banner-content h4 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #047857;
          margin: 0 0 4px 0;
        }

        .banner-content p {
          font-size: 0.88rem;
          color: #334155;
          line-height: 1.5;
          margin: 0;
        }

        .section-header-row h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .section-header-row .sub {
          font-size: 0.85rem;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .doctor-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 1100px) {
          .doctor-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .doc-card {
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .doc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }

        .common-doctor-highlight {
          border: 2px solid #10b981 !important;
          background: linear-gradient(135deg, #ffffff 0%, rgba(16, 185, 129, 0.04) 100%) !important;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15) !important;
        }

        .common-doc-ribbon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 8px 8px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: -20px -20px 16px -20px;
        }

        .doc-card-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .doc-avatar-container {
          position: relative;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
        }

        .doc-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .live-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
        }

        .photo-upload-overlay {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0284c7;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease, background 0.2s ease;
          z-index: 5;
        }

        .photo-upload-overlay:hover {
          background: #0369a1;
          transform: scale(1.1);
        }

        .doc-details {
          flex: 1;
        }

        .doc-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .doc-title-row h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .rating-tag {
          background: transparent;
          color: #eab308;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .doc-specialty-txt {
          font-size: 0.88rem;
          color: #0284c7;
          font-weight: 700;
          margin: 2px 0;
        }

        .doc-room-txt {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 8px 0;
        }

        .doc-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 8px;
        }

        .chip-exp { background: #f1f5f9; color: #475569; }
        .chip-fee { background: rgba(16, 185, 129, 0.12); color: #047857; font-weight: 800; }
        .chip-avail { background: rgba(2, 132, 199, 0.12); color: #0369a1; }

        .tap-to-book-btn {
          margin-left: auto;
        }

        /* Modal Styles */
        .modal-backdrop.op-modal-portal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .booking-modal {
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          max-height: 90dvh;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          box-sizing: border-box;
          border: 1px solid #e2e8f0;
          padding: 0;
        }

        .modal-header-section {
          flex-shrink: 0;
          padding: 20px 24px 0 24px;
          background: #ffffff;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .m-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .m-title h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #0f172a;
        }

        .m-title .sub {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        .modal-doc-summary-chip {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .mini-doc-img {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          object-fit: cover;
        }

        .modal-scrollable-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 4px 24px 20px 24px;
        }

        .op-booking-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .patient-type-toggle {
          display: flex;
          gap: 12px;
        }

        .toggle-option {
          flex: 1;
          border: 1px solid #cbd5e1;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 600;
          background: #ffffff;
        }

        .toggle-option.selected {
          border-color: #0284c7;
          background: rgba(2, 132, 199, 0.08);
          color: #0284c7;
        }

        .modal-time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        }

        .slot-chip {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }

        .slot-chip.active {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
        }

        .payment-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
        }

        .pay-card {
          border: 1px solid #cbd5e1;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          background: #ffffff;
        }

        .pay-card.selected {
          border-color: #059669;
          background: rgba(16, 185, 129, 0.08);
        }

        .pay-card strong {
          display: block;
          font-size: 0.85rem;
          color: #0f172a;
        }

        .pay-card p {
          font-size: 0.72rem;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .modal-sticky-footer {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px calc(14px + env(safe-area-inset-bottom, 0px));
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
        }

        .fee-summary {
          display: flex;
          flex-direction: column;
        }

        .fee-summary .lbl {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 700;
        }

        .fee-summary .amount {
          font-size: 1.4rem;
          font-weight: 900;
        }

        .pay-submit-btn {
          padding: 12px 22px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 0.92rem;
          font-family: inherit;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        @media (max-width: 768px) {
          .op-booking-view-container {
            padding: 12px 12px 105px;
            gap: 14px;
            box-sizing: border-box;
            max-width: 100vw;
            overflow-x: hidden;
          }

          .compact-hosp-header-bar {
            padding: 12px 14px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            border-radius: 14px;
          }

          .hosp-select-left {
            min-width: 0;
            width: 100%;
            gap: 10px;
          }

          .hosp-select-wrapper {
            min-width: 0;
            flex: 1;
            width: 100%;
          }

          .hosp-icon-badge {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }

          .hosp-select-label {
            font-size: 0.72rem;
          }

          .hosp-dropdown-select {
            font-size: 0.85rem;
            padding: 8px 10px;
            border-radius: 8px;
            max-width: 100%;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }

          .hosp-quick-info-pills {
            width: 100%;
            justify-content: space-between;
            gap: 8px;
            margin: 0;
            padding-top: 8px;
            border-top: 1px dashed #e2e8f0;
          }

          .info-chip {
            font-size: 0.75rem;
            padding: 2px 4px;
          }

          .section-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .section-header-row h3 {
            font-size: 1.05rem;
          }

          .section-header-row .sub {
            font-size: 0.78rem;
          }

          .doc-search-box {
            width: 100%;
            padding: 8px 12px;
            box-sizing: border-box;
          }

          .doctor-cards-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .doc-card {
            padding: 14px;
            border-radius: 14px;
          }

          .common-doc-ribbon {
            font-size: 0.68rem;
            padding: 4px 10px;
            margin: -14px -14px 12px -14px;
            border-radius: 12px 12px 0 0;
          }

          .doc-card-inner {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            gap: 12px;
            flex-wrap: wrap;
          }

          .doc-avatar-container {
            width: 58px;
            height: 58px;
          }

          .doc-details {
            flex: 1;
            min-width: 170px;
          }

          .doc-title-row {
            flex-wrap: wrap;
            gap: 4px;
            justify-content: space-between;
          }

          .doc-title-row h4 {
            font-size: 0.98rem;
          }

          .doc-specialty-txt {
            font-size: 0.82rem;
          }

          .doc-room-txt {
            font-size: 0.75rem;
            margin-bottom: 6px;
          }

          .doc-meta-row {
            gap: 6px;
          }

          .chip {
            font-size: 0.68rem;
            padding: 2px 8px;
          }

          .tap-to-book-btn {
            width: 100%;
            margin: 10px 0 0 0;
            padding: 10px 14px;
            font-size: 0.88rem;
            font-weight: 700;
            justify-content: center;
            display: flex;
          }

          /* Modal on Mobile: Responsive Bottom Sheet with Fixed Header & Sticky Footer */
          .modal-backdrop.op-modal-portal {
            padding: 0;
            align-items: flex-end;
            justify-content: flex-end;
          }

          .booking-modal {
            max-width: 100vw;
            width: 100%;
            height: 92vh;
            height: 92dvh;
            max-height: 92dvh;
            border-radius: 22px 22px 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.35);
          }

          .modal-header-section {
            padding: 14px 16px 0 16px;
          }

          .modal-header {
            margin-bottom: 10px;
          }

          .m-title h3 {
            font-size: 1.05rem;
          }

          .modal-doc-summary-chip {
            padding: 8px 12px;
            margin-bottom: 10px;
            gap: 10px;
          }

          .modal-scrollable-body {
            padding: 4px 16px 16px 16px;
            flex: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .patient-type-toggle {
            flex-direction: column;
            gap: 8px;
          }

          .toggle-option {
            padding: 10px 12px;
            font-size: 0.82rem;
          }

          .modal-time-slots-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }

          .slot-chip {
            padding: 8px 4px;
            font-size: 0.72rem;
            gap: 4px;
          }

          .payment-options-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .pay-card {
            padding: 10px 12px;
          }

          .pay-card strong {
            font-size: 0.82rem;
          }

          .pay-card p {
            font-size: 0.7rem;
          }

          .modal-sticky-footer {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px max(16px, env(safe-area-inset-bottom, 16px));
            gap: 12px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
          }

          .fee-summary {
            flex-direction: column;
            align-items: flex-start;
          }

          .fee-summary .lbl {
            font-size: 0.68rem;
          }

          .fee-summary .amount {
            font-size: 1.25rem;
          }

          .pay-submit-btn {
            flex: 1;
            padding: 12px 14px;
            font-size: 0.88rem;
            font-weight: 800;
            justify-content: center;
          }
        }

        @media (max-width: 360px) {
          .modal-time-slots-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .op-booking-view-container {
            padding: 8px 8px 105px;
          }
          .pay-submit-btn {
            font-size: 0.82rem;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};
