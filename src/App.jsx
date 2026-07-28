import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import { useLostItems } from './hooks/useLostItems';
import { useFoodItems } from './hooks/useFoodItems';
import { useStudyGroups } from './hooks/useStudyGroups';
import { useCampusFeed } from './hooks/useCampusFeed';
import { useMarketplace } from './hooks/useMarketplace';
import { usePoints } from './hooks/usePoints';
import { initialProfile } from './data/mockData';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import Dashboard from './pages/Dashboard';
import LostAndFound from './pages/LostAndFound';
import Marketplace from './pages/Marketplace';
import FoodTracker from './pages/FoodTracker';
import StudyGroups from './pages/StudyGroups';
import BrainBrew from './pages/BrainBrew';
import CampusFeed from './pages/CampusFeed';
import { CheckCircle2, AlertCircle, Info, Loader2, Award } from 'lucide-react';

function GlassSkeleton() {
  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ padding: '24px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Loader2 size={20} className="animate-spin" color="var(--accent)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Syncing real-time campus data...</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card" style={{ padding: '20px', height: '140px', borderRadius: '16px', opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  
  // Auth state
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(initialProfile);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800);
  };

  const fetchProfile = async (user) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          name: data.full_name || user.email.split('@')[0],
          email: user.email,
          major: data.major || 'Computer Science & AI',
          year: 'Senior (Class of \'27)',
          avatar: data.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`,
          streak: data.focus_streak_days || 1,
          energyLevel: data.energy_state === 'high' ? 'Energized' : data.energy_state === 'fatigued' ? 'Tired' : 'Balanced',
          totalPoints: data.total_points || 0
        });
      } else {
        setProfile({
          id: user.id,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
          major: user.user_metadata?.major || 'Campus Student',
          year: 'Senior (Class of \'27)',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`,
          streak: 1,
          energyLevel: 'Balanced',
          totalPoints: 0
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const validateAndHandleSession = async (session) => {
    if (!session?.user) {
      setSession(null);
      setProfile(initialProfile);
      setAuthLoading(false);
      return;
    }

    const email = session.user.email || '';
    if (!email.toLowerCase().endsWith('@vitapstudent.ac.in')) {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(initialProfile);
      setAuthLoading(false);
      showToast('Please sign in with your VIT-AP student email (@vitapstudent.ac.in)', 'error');
      return;
    }

    setSession(session);
    await fetchProfile(session.user);
  };

  useEffect(() => {
    // Check for OAuth or DB trigger errors in URL upon redirect return
    const params = new URLSearchParams(
      window.location.hash ? window.location.hash.substring(1) : window.location.search.substring(1)
    );
    const errorParam = params.get('error') || params.get('error_code');
    const errorDesc = params.get('error_description');

    if (errorParam || errorDesc) {
      window.history.replaceState(null, '', window.location.pathname);
      supabase.auth.signOut();
      setSession(null);
      setProfile(initialProfile);
      setAuthLoading(false);
      showToast('Please sign in with your VIT-AP student email (@vitapstudent.ac.in)', 'error');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      validateAndHandleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateAndHandleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id || null;
  const userEmail = session?.user?.email || null;

  // Realtime Supabase hooks
  const {
    data: lostItems,
    loading: lostLoading,
    error: lostError,
    addItem: addLostItem
  } = useLostItems(userId, userEmail, showToast);

  const {
    data: foodItems,
    loading: foodLoading,
    error: foodError,
    addItem: addFoodItem,
    vote: voteFoodItem
  } = useFoodItems(userId, showToast);

  const {
    data: studyGroups,
    loading: studyLoading,
    error: studyError,
    createGroup: addStudyGroup,
    toggleJoin: toggleJoinGroup
  } = useStudyGroups(userId, profile, showToast);

  const {
    data: campusFeed,
    loading: feedLoading,
    error: feedError,
    createPost: addFeedPost,
    toggleLike: toggleLikeFeed
  } = useCampusFeed(userId, showToast);

  const {
    items: marketplaceItems,
    loading: marketLoading,
    addItem: addMarketItem,
    markAsSold: markMarketSold,
    removeItem: removeMarketItem
  } = useMarketplace(userId, userEmail, showToast);

  const { pointsHistory } = usePoints(userId, setProfile, showToast);

  const triggerConfetti = () => {
    try { confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 }, colors: ['#7c6ef0', '#4ade80', '#fbbf24'] }); } catch {}
  };

  const handleToggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n);
    showToast(`${n === 'dark' ? 'Dark' : 'Light'} theme.`, 'info');
  };

  const handleUpdateEnergy = async (e) => {
    setProfile(p => ({ ...p, energyLevel: e }));
    if (session?.user) {
      const dbVal = e === 'Energized' ? 'high' : e === 'Tired' ? 'fatigued' : 'balanced';
      await supabase.from('profiles').update({ energy_state: dbVal }).eq('id', session.user.id);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="glass-panel" style={{ padding: '24px 40px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={22} className="animate-spin" color="var(--accent)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Connecting to UniSync...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Auth showToast={showToast} />
        {toast.visible && (
          <div className="glass-panel animate-fade-in" style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 200,
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.82rem', fontWeight: 500, backdropFilter: 'blur(20px)'
          }}>
            {toast.type === 'success' && <CheckCircle2 size={15} color="var(--success)" />}
            {toast.type === 'error' && <AlertCircle size={15} color="var(--danger)" />}
            {toast.type === 'info' && <Info size={15} color="var(--accent)" />}
            {toast.type === 'warning' && <AlertCircle size={15} color="var(--warning)" />}
            <span>{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  const renderContent = () => {
    if (currentTab === 'profile') {
      return (
        <div className="animate-fade-in" style={{ padding: '0 16px', maxWidth: '600px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
              <img src={profile.avatar} alt={profile.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-border)' }} />
              <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-primary)' }} />
            </div>
            <h1 style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{profile.name}</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--accent)', margin: '0 0 4px' }}>{profile.major} • {profile.year}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0 0 18px' }}>{profile.email}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '18px' }}>
              {[
                { label: 'Points', value: `${profile.totalPoints || 0} pts` },
                { label: 'Streak', value: `${profile.streak} days` },
                { label: 'Focus', value: profile.energyLevel },
                { label: 'Status', value: 'Active' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '2px' }}>{s.value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); showToast('Signed out.', 'info'); }}
              className="btn-touch"
              style={{ marginTop: '24px', padding: '8px 20px', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)', border: '1px solid rgba(248, 113, 113, 0.3)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Sign Out
            </button>
          </div>

          {/* Points History Section */}
          <div className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={18} color="var(--warning)" />
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Points History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!pointsHistory || pointsHistory.length === 0) ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
                  No recent points earned. Report found items or post on campus feed!
                </div>
              ) : (
                pointsHistory.map((item) => {
                  let label = item.action_type;
                  if (item.action_type === 'reported_found_item') label = 'Reported a found item (+10)';
                  else if (item.action_type === 'item_claimed') label = 'Item successfully returned (+25)';
                  else if (item.action_type === 'campus_feed_post') label = 'Posted to Campus Feed (+5)';
                  else if (item.action_type === 'campus_feed_like_received') label = 'Received a like (+1)';
                  else label = `${item.action_type} (+${item.points || 0})`;

                  return (
                    <div key={item.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning)' }}>
                        +{item.points || 0}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        if (lostLoading || foodLoading || studyLoading || feedLoading || marketLoading) return <GlassSkeleton />;
        return <Dashboard profile={profile} lostItems={lostItems} foodItems={foodItems} studyGroups={studyGroups} marketplaceItems={marketplaceItems} setCurrentTab={setCurrentTab} />;
      case 'marketplace':
        if (marketLoading) return <GlassSkeleton />;
        return <Marketplace items={marketplaceItems} onAddItem={async (item) => { const res = await addMarketItem(item); if (!res.error) triggerConfetti(); }} onMarkSold={markMarketSold} onRemoveItem={removeMarketItem} profile={profile} showToast={showToast} />;
      case 'lostAndFound':
        if (lostLoading) return <GlassSkeleton />;
        return <LostAndFound items={lostItems} onAddItem={async (item) => { const res = await addLostItem(item); if (!res.error) triggerConfetti(); }} searchQuery={searchQuery} setSearchQuery={setSearchQuery} showToast={showToast} />;
      case 'foodTracker':
        if (foodLoading) return <GlassSkeleton />;
        return <FoodTracker items={foodItems} onAddItem={async (item) => { const res = await addFoodItem(item); if (!res.error) triggerConfetti(); }} onVoteItem={voteFoodItem} showToast={showToast} />;
      case 'studyGroups':
        if (studyLoading) return <GlassSkeleton />;
        return <StudyGroups groups={studyGroups} onAddGroup={async (group) => { const res = await addStudyGroup(group); if (!res.error) triggerConfetti(); }} onToggleJoin={async (id) => { const group = studyGroups.find(g => g.id === id); const wasJoined = group?.joined; await toggleJoinGroup(id); if (!wasJoined) triggerConfetti(); }} profile={profile} showToast={showToast} triggerConfetti={triggerConfetti} />;
      case 'brainbrew':
        return <BrainBrew profile={profile} onUpdateEnergy={handleUpdateEnergy} showToast={showToast} triggerConfetti={triggerConfetti} />;
      case 'campusFeed':
        if (feedLoading) return <GlassSkeleton />;
        return <CampusFeed feed={campusFeed} onAddPost={async (post) => { const res = await addFeedPost(post); if (!res.error) triggerConfetti(); }} onToggleLike={toggleLikeFeed} profile={profile} showToast={showToast} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} theme={theme} toggleTheme={handleToggleTheme}
        profile={profile} onOpenQuickAction={() => setIsQuickActionOpen(true)} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main style={{ flex: 1, paddingTop: '6px', paddingBottom: '80px', width: '100%' }} className="main-content-layout">
          {renderContent()}
        </main>
      </div>
      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Quick Actions */}
      <Modal isOpen={isQuickActionOpen} onClose={() => setIsQuickActionOpen(false)} title="New Entry">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { id: 'marketplace', label: 'Sell Item', desc: 'List textbook or tech', color: 'var(--warning)', action: () => { setIsQuickActionOpen(false); setCurrentTab('marketplace'); } },
            { id: 'lostAndFound', label: 'Report Item', desc: 'Lost or found on campus', color: 'var(--accent)', action: () => { setIsQuickActionOpen(false); setCurrentTab('lostAndFound'); } },
            { id: 'foodTracker', label: 'Add Menu Item', desc: 'Dining hall update', color: 'var(--success)', action: () => { setIsQuickActionOpen(false); setCurrentTab('foodTracker'); } },
            { id: 'studyGroups', label: 'Create Group', desc: 'Study room for a course', color: 'var(--accent)', action: () => { setIsQuickActionOpen(false); setCurrentTab('studyGroups'); } },
            { id: 'campusFeed', label: 'Post Update', desc: 'Announce to campus', color: 'var(--accent)', action: () => { setIsQuickActionOpen(false); setCurrentTab('campusFeed'); } },
          ].map((a) => (
            <button key={a.id} onClick={a.action}
              className="glass-card btn-touch" style={{ padding: '14px', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', borderLeft: `3px solid ${a.color}` }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{a.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Toast */}
      {toast.visible && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 200,
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '0.82rem', fontWeight: 500, backdropFilter: 'blur(20px)'
        }}>
          {toast.type === 'success' && <CheckCircle2 size={15} color="var(--success)" />}
          {toast.type === 'error' && <AlertCircle size={15} color="var(--danger)" />}
          {toast.type === 'info' && <Info size={15} color="var(--accent)" />}
          {toast.type === 'warning' && <AlertCircle size={15} color="var(--warning)" />}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (min-width: 1024px) {
          .main-content-layout { margin-left: 240px !important; padding-right: 16px !important; padding-bottom: 24px !important; }
        }
      `}</style>
    </div>
  );
}
