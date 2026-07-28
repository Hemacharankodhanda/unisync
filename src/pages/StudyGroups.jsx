import React, { useState } from 'react';
import { Users, Plus, Calendar, MapPin, ExternalLink, BookOpen, UserCheck, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function StudyGroups({ groups, onAddGroup, onToggleJoin, profile, showToast, triggerConfetti }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [courseCode, setCourseCode] = useState(''); const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState(''); const [location, setLocation] = useState('');
  const [type, setType] = useState('In-Person'); const [date, setDate] = useState('Today, 7:00 PM');
  const [maxMembers, setMaxMembers] = useState(6); const [resourcesLink, setResourcesLink] = useState('');

  const filtered = groups.filter(g => {
    const t = typeFilter === 'All' || g.type === typeFilter;
    const s = !search || g.courseCode.toLowerCase().includes(search.toLowerCase()) || g.courseName.toLowerCase().includes(search.toLowerCase());
    return t && s;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!courseCode || !courseName || !topic) { showToast('Fill required fields.', 'error'); return; }
    onAddGroup({
      id: 's_' + Date.now(), courseCode: courseCode.toUpperCase(), courseName, topic,
      location: location || 'Student Union', type, date,
      host: { name: profile.name, avatar: profile.avatar },
      members: [{ id: profile.id, name: profile.name, avatar: profile.avatar }],
      maxMembers: Number(maxMembers) || 5, resourcesLink: resourcesLink || '', joined: true
    });
    setIsCreateOpen(false); showToast(`Group "${courseCode}" created.`, 'success'); triggerConfetti();
    setCourseCode(''); setCourseName(''); setTopic(''); setLocation(''); setResourcesLink('');
  };

  const handleJoin = (g) => {
    if (!g.joined && g.members.length >= g.maxMembers) { showToast('Room full.', 'error'); return; }
    onToggleJoin(g.id);
    if (!g.joined) { triggerConfetti(); showToast(`Joined ${g.courseCode}.`, 'success'); }
    else showToast(`Left ${g.courseCode}.`, 'info');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Study Groups</h1>
        <button onClick={() => setIsCreateOpen(true)} className="btn-touch btn-primary" style={{ borderRadius: '8px', fontSize: '0.825rem' }}>
          <Plus size={15} /> Create
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--glass)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          {['All', 'In-Person', 'Virtual', 'Hybrid'].map(tab => (
            <button key={tab} onClick={() => setTypeFilter(tab)} className="btn-touch"
              style={{ padding: '5px 12px', minHeight: '30px', borderRadius: '8px', fontSize: '0.78rem',
                background: typeFilter === tab ? 'var(--accent)' : 'transparent',
                color: typeFilter === tab ? '#fff' : 'var(--text-secondary)', fontWeight: typeFilter === tab ? 600 : 400 }}>
              {tab}
            </button>
          ))}
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
          className="input-touch" style={{ flex: 1, maxWidth: '260px', minHeight: '34px', fontSize: '0.78rem' }} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Users size={28} color="var(--text-tertiary)" style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>No groups found</h3>
          <button onClick={() => setIsCreateOpen(true)} className="btn-touch btn-primary"><Plus size={14} /> Create</button>
        </div>
      ) : (
        <div className="grid-bento">
          {filtered.map(g => {
            const full = g.members.length >= g.maxMembers;
            return (
              <div key={g.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: g.joined ? '1px solid var(--accent-border)' : '1px solid var(--border-glass)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="badge badge-violet"><BookOpen size={11} /> {g.courseCode}</span>
                    <span className={`badge ${g.type === 'Virtual' ? 'badge-cyan' : g.type === 'Hybrid' ? 'badge-amber' : 'badge-emerald'}`}>{g.type}</span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '3px' }}>{g.courseName}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.3 }}>{g.topic}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '8px 10px',
                    borderRadius: '8px', background: 'var(--glass)', border: '1px solid var(--border-glass)', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {g.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} /> {g.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={g.host.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{g.host.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {g.members.slice(0, 3).map((m, i) => (
                        <img key={m.id} src={m.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover',
                          marginLeft: i > 0 ? '-5px' : 0, border: '1px solid var(--bg-primary)' }} />
                      ))}
                      <span style={{ fontSize: '0.62rem', marginLeft: '4px', color: full ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                        {g.members.length}/{g.maxMembers}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                  {g.resourcesLink && (
                    <a href={g.resourcesLink} target="_blank" rel="noopener noreferrer" className="btn-touch btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', minHeight: '30px', borderRadius: '6px' }}>
                      <ExternalLink size={12} /> Notes
                    </a>
                  )}
                  <button onClick={() => handleJoin(g)}
                    className={`btn-touch ${g.joined ? 'btn-secondary' : full ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ flex: 1, fontSize: '0.78rem', minHeight: '30px', borderRadius: '6px',
                      border: g.joined ? '1px solid var(--accent-border)' : undefined }}
                    disabled={!g.joined && full}>
                    {g.joined ? <><CheckCircle2 size={13} /> Joined</> : full ? 'Full' : <><UserCheck size={13} /> Join</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Study Group">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Code *</label>
              <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="CS 301" className="input-touch" required /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Name *</label>
              <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Data Structures" className="input-touch" required /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Topic *</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Midterm review" className="input-touch" required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-touch">
                <option value="In-Person">In-Person</option><option value="Virtual">Virtual</option><option value="Hybrid">Hybrid</option></select></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Capacity</label>
              <input type="number" value={maxMembers} onChange={e => setMaxMembers(e.target.value)} min="2" max="20" className="input-touch" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>When</label>
              <input type="text" value={date} onChange={e => setDate(e.target.value)} className="input-touch" /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Where</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Room" className="input-touch" /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-touch btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-touch btn-primary" style={{ flex: 2 }}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
