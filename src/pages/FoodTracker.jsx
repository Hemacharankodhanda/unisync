import React, { useState } from 'react';
import { Utensils, Plus, ThumbsUp, ThumbsDown, Clock, MapPin, Filter } from 'lucide-react';
import Modal from '../components/Modal';

export default function FoodTracker({ items, onAddItem, onVoteItem, showToast }) {
  const [venueFilter, setVenueFilter] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState(''); const [cafeteria, setCafeteria] = useState('Main Campus Dining Hall');
  const [venue, setVenue] = useState('Pacific Rim Station'); const [price, setPrice] = useState('');
  const [calories, setCalories] = useState(''); const [dietary, setDietary] = useState('High Protein');

  const venues = ['All', 'Main Campus Dining Hall', 'West Campus Student Center', 'North Piazza Bistro', 'Recreation Center Juice Bar'];
  const dietaryOptions = ['All', 'High Protein', 'Vegan', 'Vegetarian', 'Halal', 'Gluten-Free'];

  const filteredItems = items.filter(item => {
    const v = venueFilter === 'All' || item.cafeteria === venueFilter;
    const d = dietaryFilter === 'All' || item.dietary.some(x => x.includes(dietaryFilter));
    return v && d;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) { showToast('Title and Price required.', 'error'); return; }
    onAddItem({
      id: 'f_' + Date.now(), title, cafeteria, venue, status: 'In Stock', crowdLevel: 'Moderate',
      calories: calories ? `${calories} kcal` : '500 kcal', price: price.startsWith('$') ? price : `$${price}`,
      dietary: [dietary, 'Fresh'], image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      upvotes: 1, downvotes: 0, lastUpdated: 'Just now'
    });
    setIsAddOpen(false); showToast(`Added: "${title}"`, 'success'); setTitle(''); setPrice(''); setCalories('');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Food Tracker</h1>
        <button onClick={() => setIsAddOpen(true)} className="btn-touch btn-primary" style={{ borderRadius: '8px', fontSize: '0.825rem' }}>
          <Plus size={15} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="input-touch"
          style={{ width: 'auto', minHeight: '32px', padding: '4px 24px 4px 10px', fontSize: '0.78rem' }}>
          {venues.map(v => <option key={v} value={v}>{v === 'All' ? 'All Venues' : v}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {dietaryOptions.map(opt => (
            <button key={opt} onClick={() => setDietaryFilter(opt)} className="btn-touch"
              style={{ padding: '4px 10px', minHeight: '28px', borderRadius: '6px', fontSize: '0.72rem',
                background: dietaryFilter === opt ? 'var(--accent)' : 'var(--glass)',
                color: dietaryFilter === opt ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${dietaryFilter === opt ? 'transparent' : 'var(--border-glass)'}` }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Food grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Utensils size={28} color="var(--text-tertiary)" style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1rem' }}>No items match</h3>
          <button onClick={() => { setVenueFilter('All'); setDietaryFilter('All'); }} className="btn-touch btn-secondary" style={{ marginTop: '8px' }}>Reset</button>
        </div>
      ) : (
        <div className="grid-bento">
          {filteredItems.map(item => {
            const isSoldOut = item.status === 'Sold Out';
            return (
              <div key={item.id} className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '130px', overflow: 'hidden' }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSoldOut ? 'grayscale(70%)' : 'none' }} />
                  <span className={`badge ${item.status === 'In Stock' ? 'badge-emerald' : isSoldOut ? 'badge-rose' : 'badge-amber'}`}
                    style={{ position: 'absolute', top: '8px', left: '8px', border: 'none',
                      background: item.status === 'In Stock' ? 'rgba(74,222,128,0.85)' : isSoldOut ? 'rgba(248,113,113,0.85)' : 'rgba(251,191,36,0.85)', color: '#fff' }}>
                    {item.status}
                  </span>
                  <span style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
                    {item.price}
                  </span>
                </div>
                <div style={{ padding: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    <span><MapPin size={10} /> {item.cafeteria}</span>
                    <span><Clock size={10} /> {item.lastUpdated}</span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '3px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>{item.venue} • {item.calories}</p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {item.dietary.map((d, i) => (
                      <span key={i} style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '4px',
                        background: 'var(--glass)', color: 'var(--text-tertiary)', border: '1px solid var(--border-glass)' }}>
                        {d.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Verify</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => onVoteItem(item.id, 'up')} className="btn-touch btn-secondary"
                      style={{ padding: '3px 8px', minHeight: '26px', fontSize: '0.7rem', borderRadius: '6px' }}>
                      <ThumbsUp size={11} color="var(--success)" /> {item.upvotes}
                    </button>
                    <button onClick={() => onVoteItem(item.id, 'down')} className="btn-touch btn-secondary"
                      style={{ padding: '3px 8px', minHeight: '26px', fontSize: '0.7rem', borderRadius: '6px' }}>
                      <ThumbsDown size={11} color="var(--danger)" /> {item.downvotes}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Menu Item">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Item *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Name" className="input-touch" required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Cafeteria</label>
              <select value={cafeteria} onChange={e => setCafeteria(e.target.value)} className="input-touch">
                {venues.filter(v => v !== 'All').map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Station</label>
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className="input-touch" required /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Price *</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="$7.50" className="input-touch" required /></div>
            <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Calories</label>
              <input type="text" value={calories} onChange={e => setCalories(e.target.value)} placeholder="580" className="input-touch" /></div>
          </div>
          <div><label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Dietary</label>
            <select value={dietary} onChange={e => setDietary(e.target.value)} className="input-touch">
              {dietaryOptions.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn-touch btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-touch btn-primary" style={{ flex: 2 }}>Add Item</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
