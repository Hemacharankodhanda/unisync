import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)', zIndex: 9999,
        display: 'flex', overflowY: 'auto', padding: '32px 20px',
        animation: 'fadeIn 0.2s ease forwards'
      }}>
      <div onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          margin: 'auto', width: '100%', maxWidth, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto',
          background: 'var(--glass-strong)', backdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid var(--border-glass-strong)',
          borderRadius: 'var(--radius-xl)', padding: '28px',
          boxShadow: 'var(--shadow-lg)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
