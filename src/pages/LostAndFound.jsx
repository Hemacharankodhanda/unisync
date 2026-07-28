import React, { useState } from 'react';
import { Search, Plus, MapPin, Clock, Tag, Mail, Award, Filter, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function LostAndFound({ items, onAddItem, searchQuery, setSearchQuery, showToast }) {
  const [filter, setFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [title, setTitle] = useState(''); const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState(''); const [status, setStatus] = useState('Lost');
  const [description, setDescription] = useState(''); const [reward, setReward] = useState('');
  const [contact, setContact] = useState('');

  const categories = ['All', 'Electronics', 'Accessories', 'Books', 'ID Cards', 'Clothing'];

  const filteredItems = items.filter(item => {
    const s = filter === 'All' || item.status === filter;
    const c = categoryFilter === 'All' || item.category === categoryFilter;
    const q = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return s && c && q;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !location || !contact) { showToast('Title, Location, and Contact Info required.', 'error'); return; }
    const newItem = {
      id: 'l_' + Date.now(), title, category, location, date: 'Just now', status,
      description: description || 'No details.', contact: contact.trim(),
      image: category === 'Electronics' ? "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
      reward: reward ? (reward.startsWith('$') ? reward : `$${reward}`) : null,
      tags: [category, status]
    };
    onAddItem(newItem); setIsReportOpen(false); showToast(`Reported: "${title}"`, 'success');
    setTitle(''); setLocation(''); setDescription(''); setReward(''); setContact('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Lost & Found</h1>
        <button onClick={() => setIsReportOpen(true)} className="btn-touch btn-primary" style={{ borderRadius: '8px', fontSize: '0.825rem' }}>
          <Plus size={15} /> Report Item
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--glass)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          {['All', 'Lost', 'Found', 'Claimed'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className="btn-touch"
              style={{ padding: '5px 12px', minHeight: '30px', borderRadius: '8px', fontSize: '0.78rem',
                background: filter === tab ? 'var(--accent)' : 'transparent',
                color: filter === tab ? '#fff' : 'var(--text-secondary)', fontWeight: filter === tab ? 600 : 400 }}>
              {tab}
            </button>
          ))}
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-touch"
          style={{ width: 'auto', minHeight: '32px', padding: '4px 24px 4px 10px', fontSize: '0.78rem' }}>
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Search size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 10px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>No items found</h3>
          <button onClick={() => { setFilter('All'); setCategoryFilter('All'); setSearchQuery(''); }} className="btn-touch btn-secondary">Reset</button>
        </div>
      ) : (
        <div className="grid-bento">
          {filteredItems.map(item => (
            <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className={`badge ${item.status === 'Lost' ? 'badge-rose' : item.status === 'Claimed' ? 'badge-emerald' : 'badge-cyan'}`}
                  style={{ position: 'absolute', top: '8px', left: '8px', background: item.status === 'Lost' ? 'rgba(248,113,113,0.85)' :
                    item.status === 'Claimed' ? 'rgba(74,222,128,0.85)' : 'rgba(56,189,248,0.85)', color: '#fff', border: 'none' }}>
                  {item.status}
                </span>
                {item.reward && (
                  <span className="badge badge-amber" style={{ position: 'absolute', bottom: '8px', right: '8px',
                    background: 'rgba(251,191,36,0.9)', color: '#000', border: 'none', fontWeight: 600 }}>
                    <Award size={11} /> {item.reward}
                  </span>
                )}
              </div>
              <div style={{ padding: '14px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  <span><Tag size={10} /> {item.category}</span>
                  <span><Clock size={10} /> {item.date}</span>
                </div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>{item.description}</p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {item.location}
                </div>
              </div>
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{item.contact}</span>
                <button onClick={() => showToast(item.status === 'Claimed' ? 'Already resolved.' : `Contacting ${item.contact}`, item.status === 'Claimed' ? 'info' : 'success')}
                  className={`btn-touch ${item.status === 'Claimed' ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '3px 10px', minHeight: '28px', fontSize: '0.72rem', borderRadius: '6px' }} disabled={item.status === 'Claimed'}>
                  <Mail size={11} /> {item.status === 'Claimed' ? 'Resolved' : 'Contact'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Report Item">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Item name" className="input-touch" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-touch">
                <option value="Lost">Lost</option><option value="Found">Found</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-touch">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Location *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Where on campus" className="input-touch" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." className="input-touch" style={{ minHeight: '70px', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Reward</label>
              <input type="text" value={reward} onChange={e => setReward(e.target.value)} placeholder="$20" className="input-touch" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Contact Info *</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="email or phone" className="input-touch" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setIsReportOpen(false)} className="btn-touch btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-touch btn-primary" style={{ flex: 2 }}>Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
