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

      if (err) throw err;

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

      const { error: err } = await supabase.from('campus_feed').insert({
        author_id: userId,
        content: newPost.content,
        category: cleanCat,
        image_url: newPost.image || null
      });

      if (err) throw err;
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

  return { data, loading, error, createPost, toggleLike, refetch: fetchFeed };
}
