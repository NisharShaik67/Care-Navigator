import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  Sparkles
} from 'lucide-react';

export const AdminLockGate = ({ onUnlock, onCancel }) => {
  const { returnToPatientPortal } = useApp();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDigits, setShowDigits] = useState(false);
  const inputRefs = useRef([]);

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else if (typeof returnToPatientPortal === 'function') {
      returnToPatientPortal();
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const verifyPin = (enteredPin) => {
    if (enteredPin === '000111') {
      setIsSuccess(true);
      setErrorMsg('');
      setTimeout(() => {
        if (typeof onUnlock === 'function') {
          onUnlock();
        }
      }, 500);
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect Security PIN. Access Denied.');
      setTimeout(() => {
        setPin(['', '', '', '', '', '']);
        setIsShaking(false);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 600);
    }
  };

  const handleDigitChange = (val, idx) => {
    setErrorMsg('');
    const cleanDigits = val.replace(/\D/g, '');

    // Handle Paste event through change
    if (cleanDigits.length > 1) {
      const pasted = cleanDigits.slice(0, 6).split('');
      const updated = ['', '', '', '', '', ''];
      pasted.forEach((d, i) => {
        updated[i] = d;
      });
      setPin(updated);
      if (updated.filter(Boolean).length === 6) {
        verifyPin(updated.join(''));
      } else {
        const nextIdx = Math.min(pasted.length, 5);
        if (inputRefs.current[nextIdx]) {
          inputRefs.current[nextIdx].focus();
        }
      }
      return;
    }

    const single = cleanDigits.slice(-1);
    const newPin = [...pin];
    newPin[idx] = single;
    setPin(newPin);

    if (single && idx < 5) {
      if (inputRefs.current[idx + 1]) {
        inputRefs.current[idx + 1].focus();
      }
    }

    // When 6th digit entered, auto verify
    if (single && idx === 5) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!pin[idx] && idx > 0) {
        const newPin = [...pin];
        newPin[idx - 1] = '';
        setPin(newPin);
        if (inputRefs.current[idx - 1]) {
          inputRefs.current[idx - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      if (inputRefs.current[idx - 1]) inputRefs.current[idx - 1].focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      if (inputRefs.current[idx + 1]) inputRefs.current[idx + 1].focus();
    } else if (e.key === 'Enter') {
      const fullPin = pin.join('');
      if (fullPin.length === 6) {
        verifyPin(fullPin);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text') || '';
    const cleanDigits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!cleanDigits) return;

    const updated = ['', '', '', '', '', ''];
    cleanDigits.split('').forEach((d, i) => {
      updated[i] = d;
    });
    setPin(updated);

    if (cleanDigits.length === 6) {
      verifyPin(cleanDigits);
    } else {
      const nextIdx = Math.min(cleanDigits.length, 5);
      if (inputRefs.current[nextIdx]) {
        inputRefs.current[nextIdx].focus();
      }
    }
  };

  return (
    <div className="admin-lock-backdrop fade-in">
      <div className={`admin-lock-card glass-panel ${isShaking ? 'shake-animation' : ''} ${isSuccess ? 'success-glow' : ''}`}>
        {/* Top Header Badge */}
        <div className="lock-icon-wrapper">
          <div className="lock-icon-halo">
            {isSuccess ? (
              <CheckCircle2 size={36} color="#10b981" />
            ) : (
              <Lock size={36} color="#00B8D9" />
            )}
          </div>
        </div>

        <div className="lock-title-block">
          <div className="lock-mini-tag">
            <ShieldCheck size={14} color="#00B8D9" />
            <span>CENTRAL COMMAND AUTHORIZATION</span>
          </div>
          <h2 className="lock-main-title">Admin Console Security Gate</h2>
          <p className="lock-sub-text">
            Enter the <strong>6-digit security PIN</strong> to access statewide healthcare management, hospital beds, and system telemetry.
          </p>
        </div>

        {errorMsg && (
          <div className="lock-error-banner fade-in">
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="lock-success-banner fade-in">
            <Sparkles size={18} color="#059669" style={{ flexShrink: 0 }} />
            <span>Security PIN Verified! Opening Central Admin Console...</span>
          </div>
        )}

        {/* 6-Digit PIN Boxes */}
        <div className="pin-boxes-container" onPaste={handlePaste}>
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={el => (inputRefs.current[idx] = el)}
              type={showDigits ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className={`pin-box ${digit ? 'filled' : ''} ${errorMsg ? 'error-border' : ''} ${isSuccess ? 'success-border' : ''}`}
              autoComplete="off"
              disabled={isSuccess}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="lock-controls-row">
          <button 
            type="button" 
            className="btn-toggle-peek" 
            onClick={() => setShowDigits(!showDigits)}
            title={showDigits ? "Hide PIN" : "Show PIN"}
          >
            {showDigits ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showDigits ? "Hide PIN" : "Show PIN"}</span>
          </button>

          <span className="pin-length-indicator">
            {pin.filter(Boolean).length} / 6 Digits
          </span>
        </div>

        {/* Bottom Action Buttons */}
        <div className="lock-actions-footer">
          <button 
            type="button" 
            className="btn btn-unlock-submit"
            onClick={() => verifyPin(pin.join(''))}
            disabled={pin.filter(Boolean).length < 6 || isSuccess}
          >
            <KeyRound size={16} />
            <span>{isSuccess ? 'Authorized • Opening...' : 'Verify PIN & Unlock'}</span>
          </button>

          <button 
            type="button" 
            className="btn-back-cancel" 
            onClick={handleCancel}
            disabled={isSuccess}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="lock-watermark">
          🔒 Protected by Care Navigator Role-Based Access Control • PIN Authorization
        </div>
      </div>

      <style>{`
        .admin-lock-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: radial-gradient(circle at center, #0a2548 0%, #051429 100%);
          backdrop-filter: blur(12px);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-lock-card {
          width: 100%;
          max-width: 480px;
          background: rgba(13, 31, 56, 0.95);
          border: 1.5px solid rgba(0, 184, 217, 0.35);
          border-radius: 24px;
          padding: 36px 30px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 184, 217, 0.15);
          color: #ffffff;
          text-align: center;
          position: relative;
        }

        .lock-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .lock-icon-halo {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: rgba(0, 184, 217, 0.12);
          border: 2px solid rgba(0, 184, 217, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(0, 184, 217, 0.3);
          transition: all 0.3s ease;
        }

        .lock-mini-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(0, 184, 217, 0.12);
          border: 1px solid rgba(0, 184, 217, 0.3);
          color: #38bdf8;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .lock-main-title {
          font-size: 1.55rem;
          font-weight: 800;
          margin: 0 0 8px;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        .lock-sub-text {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 22px;
        }

        .lock-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(220, 38, 38, 0.15);
          border: 1.5px solid #ef4444;
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: left;
        }

        .lock-success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 185, 129, 0.18);
          border: 1.5px solid #10b981;
          color: #6ee7b7;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.84rem;
          font-weight: 700;
          margin-bottom: 20px;
          text-align: left;
        }

        .pin-boxes-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .pin-box {
          width: 52px;
          height: 60px;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.75);
          border: 2px solid rgba(148, 163, 184, 0.3);
          color: #38bdf8;
          font-size: 1.6rem;
          font-weight: 800;
          text-align: center;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .pin-box:focus {
          border-color: #00B8D9;
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 0 0 3px rgba(0, 184, 217, 0.25), inset 0 2px 6px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }

        .pin-box.filled {
          border-color: #38bdf8;
          background: rgba(7, 30, 58, 0.9);
        }

        .pin-box.error-border {
          border-color: #ef4444 !important;
          background: rgba(69, 10, 10, 0.3) !important;
          color: #f87171 !important;
        }

        .pin-box.success-border {
          border-color: #10b981 !important;
          background: rgba(6, 78, 59, 0.3) !important;
          color: #34d399 !important;
        }

        .lock-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          padding: 0 4px;
        }

        .btn-toggle-peek {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 4px 6px;
        }

        .btn-toggle-peek:hover {
          color: #38bdf8;
        }

        .pin-length-indicator {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 700;
        }

        .lock-actions-footer {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-unlock-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 20px;
          background: linear-gradient(135deg, #0284c7 0%, #00B8D9 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0, 184, 217, 0.35);
          transition: all 0.2s ease;
        }

        .btn-unlock-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 184, 217, 0.5);
        }

        .btn-unlock-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-back-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .btn-back-cancel:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .lock-watermark {
          margin-top: 22px;
          font-size: 0.72rem;
          color: #475569;
          letter-spacing: 0.2px;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }

        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        .success-glow {
          border-color: #10b981 !important;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.35) !important;
        }

        @media (max-width: 480px) {
          .pin-box {
            width: 44px;
            height: 52px;
            font-size: 1.35rem;
          }
          .admin-lock-card {
            padding: 28px 20px;
          }
        }
      `}</style>
    </div>
  );
};
