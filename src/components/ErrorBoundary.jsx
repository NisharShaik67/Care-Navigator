import React from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Care Navigator ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleResetToHome = () => {
    try {
      localStorage.setItem('cn_currentScreen', 'dashboard');
      window.location.hash = '#dashboard';
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleClearCacheAndReset = () => {
    try {
      localStorage.removeItem('cn_currentScreen');
      localStorage.removeItem('cn_screenHistory');
      localStorage.removeItem('cn_appointments');
      localStorage.removeItem('cn_records');
      window.location.hash = '#dashboard';
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="error-boundary-fallback"
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #071a35 0%, #0c2b52 100%)',
            color: '#ffffff',
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}
        >
          <div 
            style={{
              maxWidth: '540px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.98)',
              color: '#0f172a',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.25)'
              }}
            >
              <AlertTriangle size={36} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0 0 8px', color: '#0f172a' }}>
              Dashboard View Recovery
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b', margin: '0 0 20px', lineHeight: '1.5' }}>
              Care Navigator detected a display synchronization issue while loading the dashboard. Don't worry, your health data and credentials are safe.
            </p>

            {this.state.error && (
              <div 
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.8rem',
                  color: '#991b1b',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  marginBottom: '24px',
                  wordBreak: 'break-word'
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={this.handleResetToHome}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Home size={18} />
                <span>Open Patient Dashboard</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={this.handleReload}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleClearCacheAndReset}
                  style={{
                    background: '#fef2f2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Reset Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
