import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Star, AlertTriangle, CheckCircle2, Info, Bell, Sparkles, X, ChevronsUpDown } from 'lucide-react';

export const NotificationSwipeItem = ({ notification, onDelete, onToggleImportant }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const SWIPE_THRESHOLD = 65; // px distance to trigger swipe action

  // Touch Handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    // Clamp diff to -130px ... 130px
    const clampedDiff = Math.max(-130, Math.min(130, diff));
    setOffsetX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;

    if (diff > SWIPE_THRESHOLD) {
      // Swiped Right -> Delete
      setIsRemoving(true);
      setTimeout(() => {
        onDelete(notification.id);
      }, 250);
    } else if (diff < -SWIPE_THRESHOLD) {
      // Swiped Left -> Mark as Important
      onToggleImportant(notification.id);
      setOffsetX(0);
    } else {
      // Reset
      setOffsetX(0);
    }
  };

  // Global Mouse Listener for Drag
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e) => {
      currentXRef.current = e.clientX;
      const diff = currentXRef.current - startXRef.current;
      const clampedDiff = Math.max(-130, Math.min(130, diff));
      setOffsetX(clampedDiff);
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      const diff = currentXRef.current - startXRef.current;

      if (diff > SWIPE_THRESHOLD) {
        setIsRemoving(true);
        setTimeout(() => {
          onDelete(notification.id);
        }, 250);
      } else if (diff < -SWIPE_THRESHOLD) {
        onToggleImportant(notification.id);
        setOffsetX(0);
      } else {
        setOffsetX(0);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, notification.id, onDelete, onToggleImportant]);

  // Mouse Handlers (For Desktop responsive testing)
  const handleMouseDown = (e) => {
    // Only handle primary left click
    if (e.button !== 0) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const diff = currentXRef.current - startXRef.current;
    const clampedDiff = Math.max(-130, Math.min(130, diff));
    setOffsetX(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentXRef.current - startXRef.current;

    if (diff > SWIPE_THRESHOLD) {
      setIsRemoving(true);
      setTimeout(() => {
        onDelete(notification.id);
      }, 250);
    } else if (diff < -SWIPE_THRESHOLD) {
      onToggleImportant(notification.id);
      setOffsetX(0);
    } else {
      setOffsetX(0);
    }
  };

  const isImportant = notification.important || notification.urgent;

  return (
    <div 
      className={`notif-swipe-container ${isRemoving ? 'removing' : ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        marginBottom: '10px',
        userSelect: 'none',
        transition: isRemoving ? 'all 0.3s ease' : 'none',
        maxHeight: isRemoving ? '0px' : '180px',
        opacity: isRemoving ? 0 : 1
      }}
    >
      {/* Background Swipe Actions Layer */}
      <div 
        className="notif-swipe-background"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          borderRadius: '12px',
          background: offsetX > 0 ? '#ef4444' : offsetX < 0 ? '#f59e0b' : '#f1f5f9',
          transition: 'background 0.2s ease'
        }}
      >
        {/* Swipe Right Action (Delete) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.8rem',
            opacity: offsetX > 15 ? Math.min(1, offsetX / 50) : 0
          }}
        >
          <Trash2 size={18} />
          <span>Deleting...</span>
        </div>

        {/* Swipe Left Action (Mark Important) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ffffff',
            fontWeight: '700',
            fontSize: '0.8rem',
            opacity: offsetX < -15 ? Math.min(1, Math.abs(offsetX) / 50) : 0
          }}
        >
          <span>{notification.important ? 'Unmark' : 'Important'}</span>
          <Star size={18} fill="#ffffff" />
        </div>
      </div>

      {/* Foreground Interactive Card */}
      <div
        className={`notif-swipe-card ${notification.important ? 'is-important' : ''} ${notification.urgent ? 'is-urgent' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'relative',
          zIndex: 2,
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          background: notification.urgent 
            ? '#fff5f5' 
            : notification.important 
              ? '#fffdf0' 
              : '#ffffff',
          border: notification.urgent 
            ? '1.5px solid #fca5a5' 
            : notification.important 
              ? '1.5px solid #f59e0b' 
              : '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: notification.important ? '0 4px 12px rgba(245, 158, 11, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y'
        }}
      >
        <div className="notif-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {notification.urgent ? (
              <span className="badge notif-badge-urgent" style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} /> CRITICAL
              </span>
            ) : notification.important ? (
              <span className="badge notif-badge-important" style={{ background: '#f59e0b', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} fill="#ffffff" /> IMPORTANT
              </span>
            ) : null}
            <strong className="notif-title" style={{ fontSize: '0.98rem', color: '#0f172a', fontWeight: '700' }}>{notification.title}</strong>
            {isScrollEnabled && (
              <span className="scroll-active-pill" style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.68rem', padding: '2px 7px', borderRadius: '12px', fontWeight: '700', border: '1px solid #bae6fd' }}>
                📜 Scroll Mode
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="notif-time" style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap', fontWeight: '500' }}>{notification.time}</span>
            
            {/* Scroll Option Button for chosen notification */}
            <button
              className={`notif-action-btn notif-scroll-btn ${isScrollEnabled ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsScrollEnabled(!isScrollEnabled);
              }}
              style={{
                background: isScrollEnabled ? '#0284c7' : '#f1f5f9',
                border: isScrollEnabled ? '1px solid #0284c7' : '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isScrollEnabled ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title={isScrollEnabled ? 'Disable Scroll Option for this Notification' : 'Enable Scroll Option for this Notification'}
            >
              <ChevronsUpDown size={14} />
            </button>

            {/* Star Symbol */}
            <button
              className="notif-action-btn notif-star-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleImportant(notification.id);
              }}
              style={{
                background: notification.important ? '#fef3c7' : '#f1f5f9',
                border: notification.important ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: notification.important ? '#d97706' : '#64748b',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title={notification.important ? 'Unmark Important' : 'Mark as Important'}
            >
              <Star size={14} fill={notification.important ? "#d97706" : "none"} />
            </button>

            {/* Cross Symbol (X) */}
            <button
              className="notif-action-btn notif-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsRemoving(true);
                setTimeout(() => onDelete(notification.id), 250);
              }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ef4444',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title="Delete Notification"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Notification Text Box with Optional Scroll Mode */}
        <div
          className={`notif-scroll-box ${isScrollEnabled ? 'active-scroll' : ''}`}
          style={{
            maxHeight: isScrollEnabled ? '75px' : 'none',
            overflowY: isScrollEnabled ? 'auto' : 'visible',
            paddingRight: isScrollEnabled ? '6px' : '0',
            background: isScrollEnabled ? '#f8fafc' : 'transparent',
            border: isScrollEnabled ? '1px solid #cbd5e1' : 'none',
            borderRadius: isScrollEnabled ? '8px' : '0',
            padding: isScrollEnabled ? '8px 10px' : '0',
            marginTop: isScrollEnabled ? '6px' : '0',
            transition: 'all 0.25s ease'
          }}
        >
          <p className="notif-text" style={{ fontSize: '0.86rem', color: '#334155', margin: 0, lineHeight: '1.5', fontWeight: '400' }}>
            {notification.text}
          </p>
        </div>
      </div>
    </div>
  );
};
