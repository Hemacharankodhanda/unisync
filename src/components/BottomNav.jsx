import React from 'react';
import { LayoutDashboard, Search, ShoppingBag, Users, Cpu } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Shop', icon: ShoppingBag },
    { id: 'lostAndFound', label: 'Lost', icon: Search },
    { id: 'studyGroups', label: 'Study', icon: Users },
    { id: 'brainbrew', label: 'Focus', icon: Cpu }
  ];

  return (
    <nav className="glass-panel mobile-bottom-nav" style={{
      position: 'fixed', bottom: '10px', left: '10px', right: '10px',
      height: '56px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-around', padding: '0 4px', zIndex: 50
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button key={tab.id} onClick={() => setCurrentTab(tab.id)}
            className="btn-touch"
            style={{
              flexDirection: 'column', gap: '2px', padding: '4px 6px',
              minWidth: '40px', minHeight: '42px', borderRadius: 'var(--radius-sm)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
              border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent'
            }}>
            <Icon size={18} />
            <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}

      <style>{`
        @media (min-width: 1024px) { .mobile-bottom-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
