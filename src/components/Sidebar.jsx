import React from 'react';
import { LayoutDashboard, Search, ShoppingBag, Users, Cpu, Radio } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'lostAndFound', label: 'Lost & Found', icon: Search },
    { id: 'studyGroups', label: 'Study Groups', icon: Users },
    { id: 'brainbrew', label: 'Focus Studio', icon: Cpu },
    { id: 'campusFeed', label: 'Campus Feed', icon: Radio }
  ];

  return (
    <aside className="glass-panel desktop-sidebar" style={{
      position: 'fixed', top: '80px', left: '16px', bottom: '16px',
      width: '210px', padding: '14px 10px', display: 'none',
      flexDirection: 'column', overflowY: 'auto', zIndex: 40
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400, fontSize: '0.85rem',
                cursor: 'pointer', transition: 'all 0.15s ease',
                textAlign: 'left', width: '100%', fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--glass-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 1024px) { .desktop-sidebar { display: flex !important; } }
      `}</style>
    </aside>
  );
}
