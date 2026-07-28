import React, { useState, useEffect } from 'react';
import { Cpu, Play, Pause, RotateCcw, Zap, Volume2, VolumeX, Headphones } from 'lucide-react';
import { ambientSoundscapes } from '../data/mockData';

export default function BrainBrew({ profile, onUpdateEnergy, showToast, triggerConfetti }) {
  const [energy, setEnergy] = useState(profile.energyLevel || 'Balanced');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeSound, setActiveSound] = useState('lofi');
  const [isPlayingSound, setIsPlayingSound] = useState(true);


  const handleEnergySelect = (level) => {
    setEnergy(level); onUpdateEnergy(level); setIsActive(false);
    let newMins = level === 'Energized' ? 45 : level === 'Balanced' ? 25 : 15;
    setActiveSound(level === 'Energized' ? 'lofi' : level === 'Balanced' ? 'rain' : 'fire');
    setDurationMinutes(newMins); setTimeLeft(newMins * 60);
    showToast(`Focus mode: ${level}, ${newMins} min timer.`, 'success');
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) { interval = setInterval(() => setTimeLeft(p => p - 1), 1000); }
    else if (timeLeft === 0 && isActive) {
      setIsActive(false); triggerConfetti();

      showToast('Focus session complete. Take a break.', 'success');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, triggerConfetti, showToast]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const totalSeconds = durationMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const energyOptions = [
    { id: 'Energized', label: 'High Energy', sub: '45 min • Lo-Fi', icon: Zap },
    { id: 'Balanced', label: 'Balanced', sub: '25 min • Rain', icon: Cpu },
    { id: 'Tired', label: 'Fatigued', sub: '15 min • Ambient', icon: Headphones },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Focus Studio</h1>
      </div>

      {/* Energy Selection */}
      <div className="glass-panel" style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>1. Focus State</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {energyOptions.map((opt) => {
            const isSelected = energy === opt.id;
            return (
              <button key={opt.id} onClick={() => handleEnergySelect(opt.id)}
                style={{
                  padding: '14px', borderRadius: '12px', textAlign: 'center',
                  background: isSelected ? 'var(--accent-dim)' : 'var(--glass)',
                  border: isSelected ? '1px solid var(--accent-border)' : '1px solid var(--border-glass)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif'
                }}>
                <opt.icon size={18} color={isSelected ? 'var(--accent)' : 'var(--text-secondary)'} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer & Soundscapes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {/* Timer */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx="100" cy="100" r={radius} stroke="var(--border-glass)" strokeWidth="6" fill="transparent" />
              <circle cx="100" cy="100" r={radius} stroke="var(--accent)" strokeWidth="6" fill="transparent"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease', opacity: 0.8 }} />
            </svg>
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{formatTime(timeLeft)}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase' }}>{energy}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
            <button onClick={() => { const n = Math.max(5, durationMinutes-5); setDurationMinutes(n); setTimeLeft(n*60); }}
              className="btn-touch btn-secondary" style={{ padding: '4px 10px', minHeight: '32px', fontSize: '0.78rem' }} disabled={isActive}>-5m</button>
            <button onClick={() => { setIsActive(!isActive); if (!isActive) showToast('Focus session started.', 'info'); }}
              className={`btn-touch ${isActive ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '8px 24px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
              {isActive ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start</>}
            </button>
            <button onClick={() => { setIsActive(false); setTimeLeft(durationMinutes*60); }}
              className="btn-icon" style={{ width: '32px', height: '32px' }}><RotateCcw size={14} /></button>
            <button onClick={() => { const n = Math.min(120, durationMinutes+5); setDurationMinutes(n); setTimeLeft(n*60); }}
              className="btn-touch btn-secondary" style={{ padding: '4px 10px', minHeight: '32px', fontSize: '0.78rem' }} disabled={isActive}>+5m</button>
          </div>
        </div>

        {/* Soundscapes */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0 }}>2. Soundscape</h3>
            <button onClick={() => { setIsPlayingSound(!isPlayingSound); showToast(isPlayingSound ? 'Audio muted.' : 'Audio on.', 'info'); }}
              className="btn-touch btn-secondary" style={{ padding: '3px 8px', fontSize: '0.7rem', minHeight: '26px', borderRadius: '6px' }}>
              {isPlayingSound ? <><Volume2 size={12} /> On</> : <><VolumeX size={12} /> Off</>}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {ambientSoundscapes.map((s) => {
              const isSel = activeSound === s.id;
              return (
                <button key={s.id}
                  onClick={() => { setActiveSound(s.id); setIsPlayingSound(true); showToast(`Playing: ${s.name}`, 'info'); }}
                  style={{
                    padding: '10px 12px', borderRadius: '10px', textAlign: 'left', width: '100%',
                    background: isSel ? 'var(--accent-dim)' : 'var(--glass)',
                    border: isSel ? '1px solid var(--accent-border)' : '1px solid var(--border-glass)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease'
                  }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{s.desc}</div>
                  </div>
                  {isSel && isPlayingSound && <span className="badge badge-violet" style={{ fontSize: '0.58rem' }}>Playing</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
