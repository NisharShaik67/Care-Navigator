import React, { useState, useMemo } from 'react';
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
  MapPin,
  Phone,
  Search,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export const OPBookingView = () => {
  const { hospitals, user, bookOPToken, updateDoctorAvatar } = useApp();

  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [bookingModalDoc, setBookingModalDoc] = useState(null); // When non-null, modal opens

  // Compute filtered doctors list for selected hospital
  const filteredDoctors = useMemo(() => {
    if (!selectedHospital || !selectedHospital.doctors) return [];
    if (!docSearchQuery.trim()) return selectedHospital.doctors;
    const q = docSearchQuery.toLowerCase();
    return selectedHospital.doctors.filter(d => 
      d.name.toLowerCase().includes(q) || 
      (d.specialty && d.specialty.toLowerCase().includes(q)) ||
      (d.title && d.title.toLowerCase().includes(q))
    );
  }, [selectedHospital, docSearchQuery]);

  // Booking Form State
  const [patientType, setPatientType] = useState('self'); // 'self' | 'other'
  const [otherPatientName, setOtherPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState(user.phone || '+91 9876543210');
  
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
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const newAvatarUrl = uploadEvent.target.result;
      updateDoctorAvatar(docId, newAvatarUrl);
      if (bookingModalDoc && bookingModalDoc.id === docId) {
        setBookingModalDoc(prev => ({ ...prev, avatar: newAvatarUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinalSubmitBooking = (e) => {
    e.preventDefault();
    if (!bookingModalDoc) return;

    const patientNameFinal = patientType === 'self' ? user.name : (otherPatientName || 'Patient');
    const tokenData = {
      patientName: patientNameFinal,
      patientPhone: patientPhone,
      hospitalName: selectedHospital ? selectedHospital.name : 'Hospital',
      doctorName: bookingModalDoc.name,
      specialty: bookingModalDoc.specialty,
      date: bookingDate,
      timeSlot: selectedTimeSlot,
      reason: symptomsReason,
      fee: bookingModalDoc.fee || '₹300',
      paymentMode: paymentMode.toUpperCase(),
      paymentStatus: paymentMode === 'cash' ? 'PAY AT COUNTER' : 'PAID ONLINE'
    };

    bookOPToken(tokenData);
    setBookingModalDoc(null);
  };

  return (
    <div className="op-booking-view-container fade-in">
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
                const hosp = hospitals.find(h => h.id === e.target.value);
                if (hosp) setSelectedHospital(hosp);
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
            <span className="info-chip dist">
              <MapPin size={13} /> {selectedHospital.distance} away
            </span>
            <span className="info-chip star">
              <Star size={13} fill="#eab308" color="#eab308" /> {selectedHospital.rating} Rating
            </span>
            <span className="info-chip queue">
              ⚡ {selectedHospital.opQueueCount} in OP Queue
            </span>
            <span className="info-chip phone">
              <Phone size={12} /> {selectedHospital.phone}
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


      {/* Booking Form Modal triggered on Doctor Click */}
      {bookingModalDoc && (
        <div className="modal-backdrop fade-in" onClick={() => setBookingModalDoc(null)}>
          <div className="modal-content glass-panel booking-modal fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="m-title">
                <Stethoscope size={22} color="#0284c7" />
                <div>
                  <h3>Book OP Token Pass</h3>
                  <p className="sub">{selectedHospital.name}</p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setBookingModalDoc(null)}>
                <XCircle size={20} />
              </button>
            </div>

            {/* Selected Doctor Summary Header */}
            <div className="modal-doc-summary-chip glass-card">
              <img src={bookingModalDoc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"} alt="Doc" className="mini-doc-img" />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>{bookingModalDoc.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#0284c7', fontWeight: '600' }}>{bookingModalDoc.specialty}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Room: {bookingModalDoc.roomNo} • Fee: {bookingModalDoc.fee || '₹300'}</p>
              </div>
            </div>

            <form onSubmit={handleFinalSubmitBooking} className="op-booking-form">
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
                    <span>I am the Patient ({user.name})</span>
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

              {/* Total Fee & Submit Button */}
              <div className="form-footer-action-row">
                <div className="fee-summary">
                  <span className="lbl">Total OPD Fee</span>
                  <span className="amount text-emerald">{bookingModalDoc.fee || '₹300'}</span>
                </div>
                <button type="submit" className="btn btn-primary btn-lg">
                  <CreditCard size={18} />
                  <span>Pay & Complete OP Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .op-booking-view-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          gap: 8px;
          flex-wrap: wrap;
        }

        .info-chip {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
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
          background: #f1f5f9;
          color: #334155;
        }

        .info-chip.phone {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
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
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .doc-card {
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
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
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
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
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .booking-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 20px;
          background: #ffffff;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .m-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .m-title h3 {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0;
        }

        .m-title .sub {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .modal-doc-summary-chip {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .mini-doc-img {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
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

        .form-footer-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
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
      `}</style>
    </div>
  );
};
