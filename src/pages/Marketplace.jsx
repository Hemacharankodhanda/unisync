import React, { useState } from 'react';
import { Search, Plus, ShoppingBag, Mail, Tag, CheckCircle2, Trash2, DollarSign, Filter } from 'lucide-react';
import Modal from '../components/Modal';

export default function Marketplace({ items, onAddItem, onMarkSold, onRemoveItem, profile, showToast }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellOpen, setIsSellOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState('Good');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState(profile?.email || '');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['All', 'Textbooks', 'Electronics', 'Dorm Essentials', 'Vehicles', 'Clothing', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price || !contactInfo) {
      showToast('Title, Price, and Contact Info are required.', 'error');
      return;
    }

    onAddItem({
      title,
      price,
      category,
      condition,
      description,
      contact_info: contactInfo.trim(),
      image_url: imageUrl.trim()
    });

    setIsSellOpen(false);
    showToast(`Listed "${title}" for $${price}!`, 'success');
    setTitle('');
    setPrice('');
    setDescription('');
    setImageUrl('');
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'New': return 'badge-emerald';
      case 'Like New': return 'badge-cyan';
      case 'Good': return 'badge-violet';
      default: return 'badge-amber';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: '14px', borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(124, 110, 240, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '1px solid var(--border-glass-strong)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 4px 12px rgba(124, 110, 240, 0.35)'
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Campus Marketplace</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Buy, sell, and trade textbooks, tech, and dorm essentials with VIT-AP students
            </p>
          </div>
        </div>

        <button onClick={() => { setContactInfo(profile?.email || ''); setIsSellOpen(true); }}
          className="btn-touch btn-primary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.88rem' }}>
          <Plus size={16} /> List Item for Sale
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'var(--glass)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className="btn-touch"
              style={{
                padding: '6px 12px', minHeight: '32px', borderRadius: '8px', fontSize: '0.78rem',
                background: categoryFilter === cat ? 'var(--accent)' : 'transparent',
                color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
                fontWeight: categoryFilter === cat ? 600 : 400
              }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, tech, dorm..." className="input-touch"
            style={{ paddingLeft: '36px', borderRadius: '10px', fontSize: '0.82rem' }} />
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <ShoppingBag size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>No items found</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            {searchQuery || categoryFilter !== 'All' ? 'Try adjusting your search filters.' : 'Be the first to list something for sale on campus!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredItems.map(item => {
            const isOwner = item.seller_email === profile?.email || item.seller_id === profile?.id;
            const isSold = item.status === 'Sold';

            return (
              <div key={item.id} className="glass-card" style={{
                padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                opacity: isSold ? 0.75 : 1, position: 'relative'
              }}>
                {/* Image header */}
                <div style={{ height: '180px', width: '100%', position: 'relative', background: 'var(--bg-secondary)' }}>
                  <img src={item.image_url} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'; }} />
                  
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span className="badge badge-violet" style={{ background: 'rgba(15, 15, 26, 0.85)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', fontWeight: 700, fontSize: '0.85rem', padding: '4px 10px' }}>
                      ${item.price}
                    </span>
                    <span className={`badge ${getConditionColor(item.condition)}`} style={{ backdropFilter: 'blur(10px)' }}>
                      {item.condition}
                    </span>
                  </div>

                  {isSold && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      fontWeight: 700, fontSize: '1.2rem', letterSpacing: '1px'
                    }}>
                      SOLD OUT
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.category} • {item.date}
                  </div>
                </div>

                {/* Card content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, flex: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                      👤 {item.contact_info}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isOwner ? (
                        <>
                          {!isSold && (
                            <button onClick={() => onMarkSold(item.id)} className="btn-touch btn-secondary"
                              style={{ padding: '4px 10px', minHeight: '30px', fontSize: '0.75rem', borderRadius: '6px', color: 'var(--success)' }}>
                              <CheckCircle2 size={13} /> Mark Sold
                            </button>
                          )}
                          <button onClick={() => onRemoveItem(item.id)} className="btn-icon"
                            style={{ width: '30px', height: '30px', color: 'var(--danger)' }} aria-label="Delete listing">
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => {
                          showToast(`Contacting seller: ${item.contact_info}`, 'info');
                          if (item.contact_info.includes('@')) window.location.href = `mailto:${item.contact_info}?subject=UniSync Marketplace: ${item.title}`;
                        }} disabled={isSold} className={`btn-touch ${isSold ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '5px 12px', minHeight: '30px', fontSize: '0.76rem', borderRadius: '6px' }}>
                          <Mail size={13} /> {isSold ? 'Sold' : 'Contact'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sell Item Modal */}
      <Modal isOpen={isSellOpen} onClose={() => setIsSellOpen(false)} title="List Item for Sale">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Engineering Mathematics Textbook" className="input-touch" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Price ($) *</label>
              <input type="number" step="any" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="45" className="input-touch" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-touch">
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="input-touch">
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Contact Info *</label>
              <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="email / phone" className="input-touch" required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add condition details, pickup location, or reason for selling..." className="input-touch" style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, marginBottom: '4px' }}>Image URL (Optional)</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="input-touch" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Leave empty for an automatic category image.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={() => setIsSellOpen(false)} className="btn-touch btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-touch btn-primary" style={{ flex: 2 }}>List Item</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
