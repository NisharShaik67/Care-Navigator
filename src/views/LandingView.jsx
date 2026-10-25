import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Bot, 
  CalendarCheck, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Stethoscope,
  Ambulance, 
  Building2, 
  ShieldCheck, 
  Zap, 
  Lock,
  Clock,
  Menu,
  X
} from 'lucide-react';

export const LandingView = () => {
  const { navigateTo } = useApp();
  const [activeRoleTab, setActiveRoleTab] = useState('User');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoClicksRef = useRef({ count: 0, timer: null });

  const handleLaunchPortal = (role = 'Patient') => {
    try {
      sessionStorage.setItem('cn_selected_auth_role', role);
    } catch {}
    navigateTo('onboarding');
  };

  const handleLogoTripleClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    logoClicksRef.current.count += 1;
    if (logoClicksRef.current.timer) {
      clearTimeout(logoClicksRef.current.timer);
    }

    if (logoClicksRef.current.count >= 3) {
      logoClicksRef.current.count = 0;
      try {
        sessionStorage.removeItem('cn_admin_unlocked');
      } catch {}
      navigateTo('admin');
      return;
    }

    logoClicksRef.current.timer = setTimeout(() => {
      logoClicksRef.current.count = 0;
    }, 950);
  };

  return (
    <div className="landing-page-container fade-in">
      {/* Navigation Header */}
      <nav className="landing-navbar glass-panel">
        <div className="landing-nav-inner">
          <div 
            className="landing-brand" 
            onClick={handleLogoTripleClick} 
            title="Care Navigator (Click 3 times to open Admin Page)"
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <div className="brand-icon-box">
              <img src="/Logo.jpeg" alt="Care Navigator Logo" className="brand-logo-img" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Care Navigator</span>
              <span className="brand-badge">Aadhaar Health Platform</span>
            </div>
          </div>

          <div className={`landing-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#overview" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Overview</a>
            <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#roles" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Role Portals</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#impact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Live Impact</a>
            
            <div className="mobile-login-actions" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Staff & Patient Portals:</span>
              <button 
                type="button"
                className="btn btn-sm" 
                onClick={() => { setMobileMenuOpen(false); handleLaunchPortal('Doctor'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#f0f9ff',
                  border: '1.5px solid #7dd3fc',
                  color: '#0369a1',
                  fontWeight: 800,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <Stethoscope size={18} color="#0284c7" />
                <span>Doctor Portal Login</span>
              </button>

              <button 
                type="button"
                className="btn btn-sm" 
                onClick={() => { setMobileMenuOpen(false); handleLaunchPortal('Receptionist'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  color: '#b45309',
                  fontWeight: 800,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={18} color="#f59e0b" />
                <span>Receptionist Login</span>
              </button>

              <button 
                type="button"
                className="btn btn-primary btn-sm mobile-nav-signin" 
                onClick={() => { setMobileMenuOpen(false); handleLaunchPortal('Patient'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '12px'
                }}
              >
                <UserCheck size={18} />
                <span>Patient Sign In with Aadhaar</span>
              </button>
            </div>
          </div>

          <div className="landing-nav-actions desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button"
              className="btn btn-outline btn-sm doctor-nav-btn" 
              onClick={() => handleLaunchPortal('Doctor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0f9ff',
                border: '1.5px solid #7dd3fc',
                color: '#0369a1',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '7px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Stethoscope size={16} color="#0284c7" />
              <span>Doctor Login</span>
            </button>

            <button 
              type="button"
              className="btn btn-outline btn-sm receptionist-nav-btn" 
              onClick={() => handleLaunchPortal('Receptionist')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                color: '#b45309',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '7px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Building2 size={16} color="#f59e0b" />
              <span>Receptionist Login</span>
            </button>

            <button 
              type="button"
              className="btn btn-primary btn-sm" 
              onClick={() => handleLaunchPortal('Patient')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px',
                padding: '7px 14px'
              }}
            >
              <UserCheck size={16} />
              <span>Sign In with Aadhaar</span>
            </button>
          </div>

          <button 
            type="button"
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} color="#0f172a" /> : <Menu size={22} color="#0f172a" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="overview" className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-headline">
            Universal Aadhaar Healthcare <br />
            <span className="text-gradient">& Digital Queue Triage</span>
          </h1>

          <p className="hero-subtext">
            Instant OPD queue token tracking, digital health vault, and universal Electronic Health Records (EHR) linked directly to your 12-digit Aadhaar Card.
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary btn-hero" onClick={() => handleLaunchPortal('Patient')}>
              <CheckCircle2 size={20} />
              <span>Sign In with Aadhaar Number</span>
              <ArrowRight size={18} />
            </button>

            <button 
              type="button"
              className="btn btn-hero hero-doctor-btn" 
              onClick={() => handleLaunchPortal('Doctor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '2px solid #0284c7',
                color: '#0369a1',
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)',
                transition: 'all 0.2s ease'
              }}
            >
              <Stethoscope size={20} color="#0284c7" />
              <span>Doctor Login</span>
            </button>

            <button 
              type="button"
              className="btn btn-hero hero-receptionist-btn" 
              onClick={() => handleLaunchPortal('Receptionist')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '2px solid #f59e0b',
                color: '#b45309',
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)',
                transition: 'all 0.2s ease'
              }}
            >
              <Building2 size={20} color="#f59e0b" />
              <span>Receptionist Login</span>
            </button>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item">
              <ShieldCheck size={16} color="#10b981" />
              <span>UIDAI Health ID Linked</span>
            </div>
            <div className="trust-item">
              <Zap size={16} color="#0284c7" />
              <span>Real-Time OP Queue</span>
            </div>
            <div className="trust-item">
              <Lock size={16} color="#f59e0b" />
              <span>ABHA EHR Encrypted</span>
            </div>
          </div>
        </div>

        <div className="hero-visual-card glass-panel">
          <div className="visual-header">
            <div className="header-status-pill">
              <span className="status-dot green"></span>
              <span>Live System Telemetry • AP State Health Grid</span>
            </div>
          </div>
          <img 
            src="/hero_preview.jpg" 
            alt="Care Navigator Platform Dashboard Mockup" 
            className="hero-preview-img"
          />
        </div>
      </section>

      {/* Live Impact Stats Section */}
      <section id="impact" className="landing-stats-section">
        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon-box bg-emerald">
              <ShieldCheck size={26} color="#10b981" />
            </div>
            <div className="stat-number">50,000+</div>
            <div className="stat-label">Aadhaar Health IDs Linked</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-box bg-rose">
              <Ambulance size={26} color="#ef4444" />
            </div>
            <div className="stat-number">&lt; 4 Mins</div>
            <div className="stat-label">Average 108 Emergency Dispatch</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-box bg-sky">
              <Building2 size={26} color="#0284c7" />
            </div>
            <div className="stat-number">120+</div>
            <div className="stat-label">Government & Area Hospitals</div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-box bg-amber">
              <Clock size={26} color="#f59e0b" />
            </div>
            <div className="stat-number">99.8%</div>
            <div className="stat-label">OPD Queue Efficiency Rate</div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="landing-features-section">
        <div className="section-header text-center">
          <span className="section-tag">PLATFORM CAPABILITIES</span>
          <h2 className="section-title">Built for Patients, Doctors & Emergency Teams</h2>
          <p className="section-desc">Unified digital healthcare infrastructure designed for rapid triage, zero-wait OPDs, and life-saving response times.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon red-glow">
              <ShieldAlert size={28} color="#ef4444" />
            </div>
            <h3>24/7 Emergency Helpline (108)</h3>
            <p>Direct 108 helpline integration with instant contact details, emergency responder guide, and hospital triage dispatch.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon emerald-glow">
              <ShieldCheck size={28} color="#10b981" />
            </div>
            <h3>Aadhaar Digital Health Vault</h3>
            <p>12-digit Aadhaar ID lookup retrieves permanent EHR history, allergies, previous prescriptions, and lab diagnostic reports instantly.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon sky-glow">
              <Bot size={28} color="#0284c7" />
            </div>
            <h3>AI Medical Symptom Triage</h3>
            <p>Conversational AI symptom checker calculates medical urgency risk scores, provides initial triage guidance, and recommends specialists.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon amber-glow">
              <CalendarCheck size={28} color="#f59e0b" />
            </div>
            <h3>Live OP Queue & Token Tracker</h3>
            <p>Book virtual OPD tokens remotely. Track your real-time queue position and arrive at the doctor’s office right when your token is called.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon purple-glow">
              <Building2 size={28} color="#8b5cf6" />
            </div>
            <h3>Real-Time Hospital Bed Matrix</h3>
            <p>Live occupancy dashboard showing available Emergency Beds, ICU units, and Ventilators across GGH and regional area hospitals.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon cyan-glow">
              <UserCheck size={28} color="#06b6d4" />
            </div>
            <h3>Multi-Role Unified Portal</h3>
            <p>Tailored interfaces for Patients, Duty Doctors, Receptionists, and Ambulance Responders with role-specific access controls.</p>
          </div>
        </div>
      </section>

      {/* Role Showcase Tabs */}
      <section id="roles" className="landing-roles-section">
        <div className="section-header text-center">
          <span className="section-tag">ROLE-BASED PORTALS OVERVIEW</span>
          <h2 className="section-title">Designed for Every Stakeholder in Healthcare</h2>
          <p className="section-desc">Unified digital healthcare infrastructure tailored for patients, doctors, receptionists, 108 first responders, and central health administration.</p>
        </div>

        <div className="role-tabs-container">
          <div className="role-tabs-header">
            <button 
              type="button"
              className={`role-tab-btn ${activeRoleTab === 'User' || activeRoleTab === 'Patient' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('User')}
            >
              <UserCheck size={18} />
              <span>Patient</span>
            </button>
            <button 
              type="button"
              className={`role-tab-btn ${activeRoleTab === 'Doctor' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('Doctor')}
            >
              <Stethoscope size={18} />
              <span>Doctor</span>
            </button>
            <button 
              type="button"
              className={`role-tab-btn ${activeRoleTab === 'Receptionist' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('Receptionist')}
            >
              <Building2 size={18} />
              <span>Receptionist</span>
            </button>
            <button 
              type="button"
              className={`role-tab-btn ${activeRoleTab === 'Responder' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('Responder')}
            >
              <Ambulance size={18} />
              <span><span className="mobile-hide">First </span>Responder</span>
            </button>
            <button 
              type="button"
              className={`role-tab-btn ${activeRoleTab === 'Admin' ? 'active' : ''}`}
              onClick={() => setActiveRoleTab('Admin')}
            >
              <ShieldAlert size={18} />
              <span>Admin</span>
            </button>
          </div>

          <div className="role-tab-content glass-card fade-in">
            {(activeRoleTab === 'User' || activeRoleTab === 'Patient') && (
              <div className="role-content-body">
                <div className="role-text">
                  <span className="role-badge green">Patient Portal</span>
                  <h3>Complete Control Over Your Personal Health Journey</h3>
                  <ul>
                    <li><CheckCircle2 size={16} color="#10b981" /> 1-Tap Aadhaar Login with auto-filled profile and ABHA health ID.</li>
                    <li><CheckCircle2 size={16} color="#10b981" /> Book OP tokens and monitor live doctor queue numbers from home.</li>
                    <li><CheckCircle2 size={16} color="#10b981" /> Store lifetime medical records, prescriptions, and allergy alerts.</li>
                    <li><CheckCircle2 size={16} color="#10b981" /> Instant 108 Ambulance helpline and emergency responder guidelines.</li>
                  </ul>
                  <button className="btn btn-primary" onClick={() => handleLaunchPortal('Patient')}>
                    <span>Enter Patient Portal</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="role-preview-card glass-panel">
                  <UserCheck size={48} color="#10b981" />
                  <h4>Patient Dashboard</h4>
                  <p>Aadhaar ID: 5892 4103 7621</p>
                  <div className="mini-badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>Active Token #14 • GGH Cardiology</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'Doctor' && (
              <div className="role-content-body">
                <div className="role-text">
                  <span className="role-badge sky">Doctor Consultation Portal</span>
                  <h3>Effortless Patient Consultations & Digital Prescriptions</h3>
                  <ul>
                    <li><CheckCircle2 size={16} color="#0284c7" /> Instant access to patient EHR history via Aadhaar scan.</li>
                    <li><CheckCircle2 size={16} color="#0284c7" /> Real-time OPD patient queue manager and next token caller.</li>
                    <li><CheckCircle2 size={16} color="#0284c7" /> AI triage recommendations & allergy warning indicators.</li>
                    <li><CheckCircle2 size={16} color="#0284c7" /> Digital e-prescription generation with automatic pharmacy sync.</li>
                  </ul>
                  <button className="btn btn-primary" onClick={() => handleLaunchPortal('Doctor')}>
                    <span>Enter Doctor Portal</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="role-preview-card glass-panel">
                  <Stethoscope size={48} color="#0284c7" />
                  <h4>Doctor Queue Desk</h4>
                  <p>Dr. K. Srinivas Rao, MD</p>
                  <div className="mini-badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' }}>3 Patients Waiting in Queue</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'Receptionist' && (
              <div className="role-content-body">
                <div className="role-text">
                  <span className="role-badge amber">Receptionist Desk</span>
                  <h3>Rapid Patient Lookup & OPD Token Generation</h3>
                  <ul>
                    <li><CheckCircle2 size={16} color="#f59e0b" /> Search patient by 12-digit Aadhaar number or phone for 2-second check-in.</li>
                    <li><CheckCircle2 size={16} color="#f59e0b" /> Issue instant OP tokens for General Triage or Specialty departments.</li>
                    <li><CheckCircle2 size={16} color="#f59e0b" /> Monitor live Emergency, ICU, and Ventilator bed availability.</li>
                    <li><CheckCircle2 size={16} color="#f59e0b" /> Handle emergency walk-ins with priority triage routing.</li>
                  </ul>
                  <button className="btn btn-primary" onClick={() => handleLaunchPortal('Receptionist')}>
                    <span>Enter Receptionist Desk</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="role-preview-card glass-panel">
                  <Building2 size={48} color="#f59e0b" />
                  <h4>Receptionist Desk</h4>
                  <p>Government General Hospital Desk #1</p>
                  <div className="mini-badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}>14 Emergency Beds Available</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'Responder' && (
              <div className="role-content-body">
                <div className="role-text">
                  <span className="role-badge red">108 Responder Console</span>
                  <h3>Live Emergency Telemetry & Dispatch Management</h3>
                  <ul>
                    <li><CheckCircle2 size={16} color="#ef4444" /> Real-time GPS navigation to victim location with optimal hospital routing.</li>
                    <li><CheckCircle2 size={16} color="#ef4444" /> Pre-fetch patient blood group, allergies, and emergency contacts via Aadhaar.</li>
                    <li><CheckCircle2 size={16} color="#ef4444" /> Transmit pre-hospital vital telemetry to receiving trauma center.</li>
                    <li><CheckCircle2 size={16} color="#ef4444" /> Direct 1-tap phone communication with victim and emergency room.</li>
                  </ul>
                  <button className="btn btn-primary" onClick={() => handleLaunchPortal('Responder')}>
                    <span>Enter Responder Console</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="role-preview-card glass-panel">
                  <Ambulance size={48} color="#ef4444" />
                  <h4>108 Ambulance Unit</h4>
                  <p>Vehicle: AP 07 AP 1082</p>
                  <div className="mini-badge" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>En Route • ETA 5 Mins</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'Admin' && (
              <div className="role-content-body">
                <div className="role-text">
                  <span className="role-badge purple" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#7c3aed' }}>Central Command Admin</span>
                  <h3>State Healthcare Oversight & Multi-Facility Control</h3>
                  <ul>
                    <li><CheckCircle2 size={16} color="#8b5cf6" /> Live monitoring of statewide OPD queues, hospitals, and ambulances.</li>
                    <li><CheckCircle2 size={16} color="#8b5cf6" /> Real-time Cloud Firestore synchronization and diagnostic audits.</li>
                    <li><CheckCircle2 size={16} color="#8b5cf6" /> Role management, hospital bed matrix allocations, and alert broadcasts.</li>
                    <li><CheckCircle2 size={16} color="#8b5cf6" /> Analytics telemetry across GGH and district area health networks.</li>
                  </ul>
                  <button className="btn btn-primary" onClick={() => navigateTo('admin')}>
                    <span>Open Admin Dashboard</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="role-preview-card glass-panel">
                  <ShieldAlert size={48} color="#8b5cf6" />
                  <h4>Command Center</h4>
                  <p>Director of Health & Emergency Control</p>
                  <div className="mini-badge" style={{ background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd' }}>AP State Command Live</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="landing-how-section">
        <div className="section-header text-center">
          <span className="section-tag">SIMPLIFIED WORKFLOW</span>
          <h2 className="section-title">How Care Navigator Works</h2>
        </div>

        <div className="steps-container">
          <div className="step-card glass-card">
            <div className="step-number">01</div>
            <h4>Enter Mobile or Aadhaar Number</h4>
            <p>Enter your 10-digit Mobile Number or 12-digit Aadhaar Card Number and 4-Digit Security PIN to instantly link your digital health vault.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">02</div>
            <h4>Book OP Token Appointment</h4>
            <p>Select your hospital to issue a live OPD queue token from home without waiting in long registration queues.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">03</div>
            <h4>Seamless Care Delivery</h4>
            <p>Doctors and receptionists access your unified EHR history, minimizing paperwork and eliminating hospital wait times.</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="landing-cta-banner glass-panel">
        <div className="cta-banner-content">
          <h2>Transforming Healthcare Access Across Andhra Pradesh</h2>
          <p>Join thousands of patients, doctors, and emergency response teams using Care Navigator.</p>
          <div className="cta-banner-buttons">
            <button className="btn btn-primary btn-hero" onClick={() => handleLaunchPortal('Patient')}>
              <CheckCircle2 size={20} />
              <span>Get Started with Security PIN</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div 
            className="footer-brand" 
            onClick={handleLogoTripleClick} 
            style={{ cursor: 'pointer', userSelect: 'none' }} 
            title="Care Navigator"
          >
            <div className="brand-icon-box">
              <img src="/Logo.jpeg" alt="Care Navigator Logo" className="brand-logo-img" />
            </div>
            <span className="brand-name">Care Navigator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <p className="footer-copy" style={{ margin: 0 }}>
              © 2026 Ranbidge Solutions Private Limited.
            </p>
          </div>
        </div>
      </footer>

      {/* Embedded CSS */}
      <style>{`
        .landing-page-container {
          min-height: 100vh;
          background: #ffffff;
          color: #0f172a;
          display: flex;
          flex-direction: column;
        }

        .landing-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 24px;
        }

        .landing-nav-inner {
          max-width: 1720px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          
          gap: 12px;
          cursor: pointer;
        }

        .brand-icon-box {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #ffffff;
          border: 1.5px solid #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 3px;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
        }

        .brand-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 10px;
        }

        .hero-cover-logo-wrapper {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .hero-cover-logo {
          height: 76px;
          width: auto;
          max-width: 260px;
          object-fit: contain;
          border-radius: 18px;
          box-shadow: 0 12px 30px -6px rgba(2, 132, 199, 0.3), 0 0 20px rgba(16, 185, 129, 0.25);
          border: 2px solid #ffffff;
          background: #ffffff;
          padding: 6px 14px;
          transition: transform 0.3s ease;
        }

        .hero-cover-logo:hover {
          transform: scale(1.04);
        }

        .brand-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          display: block;
        }

        .brand-badge {
          font-size: 0.72rem;
          color: #0284c7;
          font-weight: 600;
          display: block;
        }

        .landing-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .mobile-menu-toggle {
          display: none;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-nav-signin {
          display: none;
        }

        @media (max-width: 860px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .landing-nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid #e2e8f0;
            padding: 20px 24px;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          }

          .landing-nav-links.mobile-open {
            display: flex;
          }

          .mobile-nav-signin {
            display: inline-flex;
            width: 100%;
            justify-content: center;
            margin-top: 8px;
          }
        }

        .nav-link {
          color: #475569;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #0284c7;
        }

        .landing-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 0.85rem;
        }

        /* Hero Section */
        .landing-hero {
          max-width: 1720px;
          margin: 0 auto;
          padding: 54px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        @media (max-width: 992px) {
          .landing-hero {
            grid-template-columns: 1fr;
            text-align: center;
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(2, 132, 199, 0.08);
          border: 1px solid rgba(2, 132, 199, 0.25);
          color: #0284c7;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .hero-headline {
          font-size: 2.8rem;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #0f172a;
          margin-bottom: 18px;
        }

        @media (max-width: 640px) {
          .hero-headline {
            font-size: 2.1rem;
          }
        }

        .text-gradient {
          background: linear-gradient(135deg, #0284c7 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtext {
          font-size: 1.08rem;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 720px;
        }

        @media (max-width: 992px) {
          .hero-subtext {
            margin-left: auto;
            margin-right: auto;
          }
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        @media (max-width: 992px) {
          .hero-cta-group {
            justify-content: center;
          }
        }

        .btn-hero {
          padding: 14px 28px;
          font-size: 1rem;
          border-radius: 14px;
        }

        .btn-sos-hero {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 1rem;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
        }

        .btn-sos-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.45);
        }

        .hero-trust-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (max-width: 992px) {
          .hero-trust-row {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .hero-trust-row {
            display: none !important;
          }
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #475569;
        }

        /* Hero Visual Preview */
        .hero-visual-card {
          padding: 16px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .visual-header {
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #047857;
        }

        .status-dot.green {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .hero-preview-img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          display: block;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }

        /* Stats Section */
        .landing-stats-section {
          max-width: 1720px;
          margin: 0 auto 60px;
          padding: 0 32px;
          width: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 860px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .stat-card {
            padding: 18px 12px;
          }

          .stat-icon-box {
            width: 46px;
            height: 46px;
            margin-bottom: 8px;
          }

          .stat-number {
            font-size: 1.35rem;
          }

          .stat-label {
            font-size: 0.75rem;
          }
        }


        .stat-card {
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .bg-emerald { background: rgba(16, 185, 129, 0.12); }
        .bg-rose { background: rgba(239, 68, 68, 0.12); }
        .bg-sky { background: rgba(2, 132, 199, 0.12); }
        .bg-amber { background: rgba(245, 158, 11, 0.12); }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #64748b;
        }

        /* Section Commons */
        .section-header {
          margin-bottom: 44px;
          padding: 0 20px;
        }

        .text-center { text-align: center; }

        .section-tag {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #0284c7;
          display: block;
          margin-bottom: 8px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }

        .section-desc {
          font-size: 0.98rem;
          color: #64748b;
          max-width: 620px;
          margin: 0 auto;
        }

        /* Features Grid */
        .landing-features-section {
          max-width: 1720px;
          margin: 0 auto 80px;
          padding: 0 32px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .feature-card {
            padding: 20px 16px;
          }
        }

        @media (max-width: 640px) {
          .landing-features-section {
            padding: 0 14px;
            margin-bottom: 50px;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .feature-card {
            padding: 16px 12px;
            border-radius: 16px;
          }

          .feature-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            margin-bottom: 12px;
          }

          .feature-card h3 {
            font-size: 0.95rem;
            margin-bottom: 6px;
            line-height: 1.3;
          }

          .feature-card p {
            font-size: 0.78rem;
            line-height: 1.45;
          }
        }

        .feature-card {
          padding: 30px 24px;
          border-radius: 20px;
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .red-glow { background: rgba(239, 68, 68, 0.1); }
        .emerald-glow { background: rgba(16, 185, 129, 0.1); }
        .sky-glow { background: rgba(2, 132, 199, 0.1); }
        .amber-glow { background: rgba(245, 158, 11, 0.1); }
        .purple-glow { background: rgba(139, 92, 246, 0.1); }
        .cyan-glow { background: rgba(6, 182, 212, 0.1); }

        .feature-card h3 {
          font-size: 1.18rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Role Showcase */
        .landing-roles-section {
          max-width: 1100px;
          margin: 0 auto 80px;
          padding: 0 24px;
        }

        .role-tabs-header {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .landing-roles-section {
            padding: 0 10px;
            margin-bottom: 50px;
          }

          .role-tabs-header {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 4px !important;
            width: 100% !important;
            margin-bottom: 16px !important;
            padding-bottom: 0 !important;
            overflow-x: visible !important;
          }

          .role-tab-btn {
            padding: 8px 4px !important;
            font-size: 0.72rem !important;
            gap: 4px !important;
            justify-content: center !important;
            border-radius: 10px !important;
            width: 100% !important;
            min-width: 0 !important;
            white-space: nowrap !important;
          }

          .role-tab-btn svg {
            width: 14px !important;
            height: 14px !important;
            flex-shrink: 0 !important;
          }

          .mobile-hide {
            display: none !important;
          }
        }

        @media (max-width: 400px) {
          .role-tab-btn {
            padding: 7px 2px !important;
            font-size: 0.68rem !important;
            gap: 3px !important;
          }
        }

        .role-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-weight: 700;
          font-size: 0.9rem;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-tab-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .role-tab-btn.active {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 6px 18px rgba(2, 132, 199, 0.25);
        }

        .role-tab-content {
          padding: 36px;
          border-radius: 24px;
        }

        .role-content-body {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 36px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .role-content-body {
            grid-template-columns: 1fr;
          }
        }

        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .role-badge.green { background: rgba(16, 185, 129, 0.15); color: #047857; }
        .role-badge.sky { background: rgba(2, 132, 199, 0.15); color: #0369a1; }
        .role-badge.amber { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .role-badge.red { background: rgba(239, 68, 68, 0.15); color: #b91c1c; }

        .role-text h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 16px;
        }

        .role-text ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }

        .role-text li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          color: #334155;
          font-weight: 600;
        }

        .role-preview-card {
          padding: 32px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .role-preview-card h4 {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 12px 0 4px;
        }

        .role-preview-card p {
          font-size: 0.82rem;
          color: #64748b;
          margin-bottom: 16px;
        }

        .mini-badge {
          background: rgba(16, 185, 129, 0.15);
          color: #047857;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .mini-badge.sky { background: rgba(2, 132, 199, 0.15); color: #0369a1; }
        .mini-badge.amber { background: rgba(245, 158, 11, 0.15); color: #b45309; }
        .mini-badge.red { background: rgba(239, 68, 68, 0.15); color: #b91c1c; }

        /* How It Works */
        .landing-how-section {
          max-width: 1720px;
          margin: 0 auto 80px;
          padding: 0 32px;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 768px) {
          .steps-container {
            grid-template-columns: 1fr;
          }
        }

        .step-card {
          padding: 32px 24px;
          border-radius: 20px;
          position: relative;
        }

        .step-number {
          font-size: 2.2rem;
          font-weight: 900;
          color: rgba(2, 132, 199, 0.2);
          margin-bottom: 12px;
        }

        .step-card h4 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .step-card p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Banner CTA */
        .landing-cta-banner {
          max-width: 1720px;
          margin: 0 auto 80px;
          padding: 50px 32px;
          border-radius: 28px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          text-align: center;
        }

        .cta-banner-content h2 {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .cta-banner-content p {
          font-size: 1.05rem;
          opacity: 0.9;
          margin-bottom: 28px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-banner-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Footer */
        .landing-footer {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 24px;
          margin-top: auto;
        }

        .footer-inner {
          max-width: 1720px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-copy {
          font-size: 0.82rem;
          color: #64748b;
        }

        .footer-emergency {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #dc2626;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
