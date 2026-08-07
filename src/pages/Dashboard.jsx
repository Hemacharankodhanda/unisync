import React from 'react';
import { Search, ShoppingBag, Users, Cpu, ArrowRight, Award } from 'lucide-react';

export default function Dashboard({ profile, lostItems, studyGroups, marketplaceItems = [], setCurrentTab }) {
  const activeLostCount = (lostItems || []).filter(i => i.status === 'Lost').length;
  const myGroupsCount = (studyGroups || []).filter(g => g.joined).length;
  const activeMarketCount = (marketplaceItems || []).filter(i => i.status === 'Available').length;

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Welcome */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
          Hey, {profile?.name?.split(' ')[0] || 'Student'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Here's your campus overview.
        </p>
      </div>

      {/* Modules */}
      <div className="grid-bento">
        {[
          { id: 'profile', icon: Award, title: 'Rewards & Points', badge: `${profile?.totalPoints || profile?.total_points || 0} pts earned` },
          { id: 'marketplace', icon: ShoppingBag, title: 'Marketplace', badge: `${activeMarketCount} listed` },
          { id: 'lostAndFound', icon: Search, title: 'Lost & Found', badge: `${activeLostCount} active` },
          { id: 'studyGroups', icon: Users, title: 'Study Groups', badge: `${myGroupsCount} joined` },
          { id: 'brainbrew', icon: Cpu, title: 'Focus Studio', badge: `${profile?.streak || 1} day streak` },
        ].map((mod) => (
          <div key={mod.id} onClick={() => setCurrentTab(mod.id)} className="glass-card"
            style={{ padding: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--glass-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <mod.icon size={18} color="var(--text-secondary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>{mod.title}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{mod.badge}</span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-tertiary)" />
          </div>
        ))}
      </div>
    </div>
  );
}
