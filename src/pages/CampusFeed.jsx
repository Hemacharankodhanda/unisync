import React, { useState } from 'react';
import { Radio, Heart, MessageSquare, Share2, CheckCircle2, Send, Loader2 } from 'lucide-react';

export default function CampusFeed({ feed, onAddPost, onToggleLike, fetchComments, addComment, profile, showToast }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Campus Pulse');
  const categories = ['All', 'Campus Pulse', 'Hackathon', 'Study Tip', 'Club Event'];
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentInput, setCommentInput] = useState('');

  const filtered = feed.filter(p => categoryFilter === 'All' || p.category.includes(categoryFilter));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { showToast('Write something first.', 'warning'); return; }
    const res = await onAddPost({
      id: 'c_' + Date.now(),
      author: { name: profile.name, role: profile.major, avatar: profile.avatar, verified: true },
      time: 'Just now', category, content, likes: 0, comments: 0, likedByMe: false, image: null
    });
    if (res && res.error) return;
    showToast('Post published.', 'success'); 
    showToast('Post published.', 'success'); 
    setContent('');
  };

  const handleToggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);
    
    if (!commentsMap[postId]) {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      const { comments } = await fetchComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    
    const res = await addComment(postId, commentInput);
    if (res && res.error) return;
    
    setCommentInput('');
    showToast('Comment added.', 'success');
    
    // Refresh comments
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    const { comments } = await fetchComments(postId);
    setCommentsMap(prev => ({ ...prev, [postId]: comments }));
    setCommentsLoading(prev => ({ ...prev, [postId]: false }));
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Campus Feed</h1>
      </div>

      {/* Compose */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <img src={profile.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={`Share an update, ${profile.name.split(' ')[0]}...`}
              className="input-touch" style={{ flex: 1, minHeight: '60px', resize: 'vertical', fontSize: '0.82rem' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-glass)' }}>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-touch"
              style={{ width: 'auto', minHeight: '30px', padding: '3px 20px 3px 8px', fontSize: '0.72rem' }}>
              {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn-touch btn-primary" style={{ padding: '5px 14px', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)', minHeight: '30px' }}>
              <Send size={13} /> Post
            </button>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} className="btn-touch"
            style={{ padding: '5px 12px', minHeight: '30px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', whiteSpace: 'nowrap',
              background: categoryFilter === cat ? 'var(--accent)' : 'var(--glass)',
              color: categoryFilter === cat ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${categoryFilter === cat ? 'transparent' : 'var(--border-glass)'}` }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(post => (
          <div key={post.id} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={post.author.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {post.author.name} {post.author.verified && <CheckCircle2 size={12} color="var(--accent)" />}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{post.author.role} • {post.time}</div>
                </div>
              </div>
              <span className="badge">{post.category.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()}</span>
            </div>
            <p style={{ fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{post.content}</p>
            {post.image && (
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border-glass)' }}>
                <img src={post.image} alt="" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
              <button onClick={() => { onToggleLike(post.id); showToast(post.likedByMe ? 'Unliked.' : 'Liked.', 'info'); }}
                className="btn-touch" style={{ padding: '3px 8px', minHeight: '28px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
                  background: post.likedByMe ? 'rgba(248,113,113,0.1)' : 'transparent',
                  color: post.likedByMe ? 'var(--danger)' : 'var(--text-secondary)',
                  border: post.likedByMe ? '1px solid rgba(248,113,113,0.2)' : '1px solid transparent' }}>
                <Heart size={12} fill={post.likedByMe ? 'var(--danger)' : 'none'} /> {post.likes}
              </button>
              <button onClick={() => handleToggleComments(post.id)} className="btn-touch"
                style={{ padding: '3px 8px', minHeight: '28px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <MessageSquare size={12} /> {post.comments}
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); showToast('Link copied.', 'success'); }}
                className="btn-touch" style={{ padding: '3px 8px', minHeight: '28px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                <Share2 size={12} /> Share
              </button>
            </div>
            
            {expandedPostId === post.id && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '12px' }}>Comments</h4>
                
                {commentsLoading[post.id] ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                    <Loader2 size={16} className="animate-spin" color="var(--accent)" />
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {(!commentsMap[post.id] || commentsMap[post.id].length === 0) ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>No comments yet. Be the first!</div>
                    ) : (
                      commentsMap[post.id].map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '8px' }}>
                          <img src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author_id}`} alt="" 
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ background: 'var(--glass-hover)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{comment.author?.full_name || 'Student'}</span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', margin: 0 }}>{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                <form onSubmit={(e) => handleAddComment(e, post.id)} style={{ display: 'flex', gap: '8px' }}>
                  <img src={profile.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                  <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)}
                    placeholder="Write a comment..." className="input-touch" 
                    style={{ flex: 1, minHeight: '36px', padding: '8px 12px', fontSize: '0.8rem' }} />
                  <button type="submit" disabled={!commentInput.trim()} className="btn-touch btn-primary" 
                    style={{ padding: '4px 12px', minHeight: '36px', fontSize: '0.75rem' }}>
                    Post
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
