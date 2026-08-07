import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Layers, AlertCircle, Loader2 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });

      if (error) throw error;
    } catch (err) {
      console.error('OAuth error:', err);
      setErrorMsg(err.message || 'Failed to initiate Google sign-in.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-primary)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '36px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--glass-strong)',
        border: '1px solid var(--border-glass-strong)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff',
            marginBottom: '14px', boxShadow: '0 8px 20px rgba(124, 110, 240, 0.4)'
          }}>
            <Layers size={28} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '6px' }}>UniSync</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sign in to your campus portal
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-touch btn-primary"
          style={{
            width: '100%',
            minHeight: '50px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 4px 16px rgba(124, 110, 240, 0.35)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.85 : 1
          }}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Redirecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.1 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7c-.8 1.6-1.3 3.5-1.3 5.3s.5 3.7 1.3 5.3l3.7-2.8z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.2L1.6 15.9C3.5 19.7 7.4 23 12 23z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        {/* Domain restriction notice */}
        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--glass)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          🔒 Access restricted to <strong>@vitapstudent.ac.in</strong> student accounts.
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          By continuing, you agree to UniSync's Campus Terms of Service & Privacy Policy.
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
