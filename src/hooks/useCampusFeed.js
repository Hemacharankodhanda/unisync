import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useCampusFeed(userId, showToast) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async () => {
    try {
      setError(null);
      const { data: rows, error: err } = await supabase
        .from('campus_feed')
        .select(`
          *,
          author:profiles!author_id(id, full_name, major, avatar_url, is_verified),
          likes:campus_feed_likes(user_id)
        `)
        .order('created_at', { ascending: false });

      if (err) {
        console.warn('Supabase fetch failed:', err.message);
        setLoading(false);
        throw err;
      }

      if (!rows || rows.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      const emojiMap = {
        'Campus Pulse': 'Campus Pulse 📢',
        'Hackathon': 'Hackathon 💻',
        'Study Tip': 'Study Tip 🧠',
        'Club Event': 'Club Event 📅'
      };

      const mapped = (rows || []).map(row => {
        const likedByMe = (row.likes || []).some(l => l.user_id === userId);
        const catText = emojiMap[row.category] || row.category || 'Campus Pulse 📢';

        return {
          id: row.id,
          author: {
            name: row.author?.full_name || 'Campus Student',
            role: row.author?.major || 'Student',
            avatar: row.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.author_id}`,
            verified: row.author?.is_verified ?? true
          },
          time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: catText,
          content: row.content,
          likes: row.like_count || (row.likes ? row.likes.length : 0),
          comments: row.comment_count || 0,
          likedByMe: likedByMe,
          image: row.image_url || null
        };
      });

      setData(mapped);
    } catch (err) {
      console.error('Error fetching campus feed:', err);
      setData([]);
      setError(err);
      if (showToast) showToast('Failed to load campus feed.', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchFeed();

    const channel1 = supabase
      .channel('public:campus_feed_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_feed' }, () => {
        fetchFeed();
      })
      .subscribe();

    const channel2 = supabase
      .channel('public:campus_feed_likes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_feed_likes' }, () => {
        fetchFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [fetchFeed]);

  const createPost = async (newPost) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to post on the feed.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      let cleanCat = (newPost.category || 'Campus Pulse').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
      if (!['Campus Pulse', 'Hackathon', 'Study Tip', 'Club Event'].includes(cleanCat)) {
        if (cleanCat.includes('Hackathon')) cleanCat = 'Hackathon';
        else if (cleanCat.includes('Study')) cleanCat = 'Study Tip';
        else if (cleanCat.includes('Club') || cleanCat.includes('Event')) cleanCat = 'Club Event';
        else cleanCat = 'Campus Pulse';
      }

      const emojiMap = {
        'Campus Pulse': 'Campus Pulse 📢',
        'Hackathon': 'Hackathon 💻',
        'Study Tip': 'Study Tip 🧠',
        'Club Event': 'Club Event 📅'
      };
      const catText = emojiMap[cleanCat] || 'Campus Pulse 📢';

      // Optimistic update
      const optimisticPost = {
        id: newPost.id || 'c_' + Date.now(),
        author: newPost.author || { name: 'You', role: 'Student', avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`, verified: true },
        time: 'Just now',
        category: catText,
        content: newPost.content,
        likes: 0,
        comments: 0,
        likedByMe: false,
        image: newPost.image || null
      };

      setData(prev => [optimisticPost, ...prev]);

      const { data: result, error: err } = await supabase.from('campus_feed').insert({
        author_id: userId,
        content: newPost.content,
        category: cleanCat,
        image_url: newPost.image || null
      }).select();

      console.log('Insert Result:', result, 'Error:', err);

      if (err) {
        console.warn('Could not save to Supabase:', err);
        alert(`Database Error: ${err.message}\nHint: ${err.hint || 'No hint'}\nDetails: ${err.details || 'No details'}`);
        if (showToast) showToast(`Failed to post: ${err.message}`, 'error');
      } else {
        fetchFeed();
      }
      return { error: null };
    } catch (err) {
      console.error('Error creating post:', err);
      if (showToast) showToast(`Error publishing post: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const toggleLike = async (postId) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to like posts.', 'error');
      return { error: new Error('Not signed in') };
    }

    const post = data.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.likedByMe) {
        const { error: err } = await supabase
          .from('campus_feed_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('campus_feed_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });
        if (err) throw err;
      }
      return { error: null };
    } catch (err) {
      console.error('Error toggling like:', err);
      if (showToast) showToast(`Error updating like: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data: comments, error: err } = await supabase
        .from('campus_feed_comments')
        .select(`
          id, content, created_at,
          author:profiles!author_id(id, full_name, avatar_url, major)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (err) throw err;
      return { comments: comments || [], error: null };
    } catch (err) {
      console.error('Error fetching comments:', err);
      return { comments: [], error: err };
    }
  };

  const addComment = async (postId, content) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to comment.', 'error');
      return { error: new Error('Not signed in') };
    }
    
    try {
      const { error: err } = await supabase
        .from('campus_feed_comments')
        .insert({
          post_id: postId,
          author_id: userId,
          content: content
        });

      if (err) throw err;
      return { error: null };
    } catch (err) {
      console.error('Error adding comment:', err);
      if (showToast) showToast(`Error adding comment: ${err.message}`, 'error');
      return { error: err };
    }
  };

  return { data, loading, error, createPost, toggleLike, fetchComments, addComment, refetch: fetchFeed };
}
