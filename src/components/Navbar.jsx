import React from 'react';
import { Sun, Moon, Plus, Layers, Award } from 'lucide-react';

export default function Navbar({ 
  currentTab, setCurrentTab, theme, toggleTheme, 
  profile, onOpenQuickAction 
}) {
  return (
    <header className="glass-panel" style={{
      position: 'sticky', top: 0, zIndex: 50,
      margin: '12px 16px', padding: '10px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px'
    }}>
      <div onClick={() => setCurrentTab('dashboard')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px',
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Layers size={18} />
        </div>
        <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>UniSync</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div onClick={() => setCurrentTab('profile')} className="btn-touch"
          style={{ 
            padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
            background: 'rgba(251, 191, 36, 0.12)', color: 'var(--warning)',
            border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '0.8rem', fontWeight: 600, minHeight: '34px'
          }}>
          <Award size={15} />
          <span>{profile?.totalPoints || profile?.total_points || 0}</span>
        </div>

        <button onClick={onOpenQuickAction} className="btn-touch btn-primary"
          style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.825rem', minHeight: '34px' }}>
          <Plus size={15} />
          <span className="hide-mobile">New</span>
        </button>

        <button onClick={toggleTheme} className="btn-icon" style={{ width: '34px', height: '34px' }}
          aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div onClick={() => setCurrentTab('profile')} 
          style={{ padding: '4px', borderRadius: '10px', border: '1px solid var(--border-glass)',
            cursor: 'pointer', background: currentTab === 'profile' ? 'var(--glass-hover)' : 'transparent' }}>
          <img src={profile.avatar} alt={profile.name} 
            style={{ width: '26px', height: '26px', borderRadius: '8px', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .hide-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
