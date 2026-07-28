import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useLostItems(userId, userEmail, showToast) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const { data: rows, error: err } = await supabase
        .from('lost_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped = (rows || []).map(row => ({
        id: row.id,
        title: row.title,
        category: row.category,
        location: row.location || 'Unknown location',
        date: new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Lost',
        description: row.description || 'No details.',
        contact: row.contact_email || 'no-contact@unisync.edu',
        image: row.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
        reward: row.reward && Number(row.reward) > 0 ? `$${row.reward} Reward` : null,
        tags: row.ai_tags && row.ai_tags.length > 0 ? row.ai_tags : [row.category, row.status || 'Lost']
      }));

      setData(mapped);
    } catch (err) {
      console.error('Error fetching lost items:', err);
      setError(err);
      if (showToast) showToast('Failed to load lost items.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('public:lost_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const addItem = async (newItem) => {
    if (!userId) {
      if (showToast) showToast('You must be signed in to report an item.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      const rewardVal = newItem.reward ? parseFloat(String(newItem.reward).replace(/[^0-9.]/g, '')) || 0 : 0;
      const statusVal = newItem.status ? newItem.status.toLowerCase() : 'lost';

      const { error: err } = await supabase.from('lost_items').insert({
        reporter_id: userId,
        title: newItem.title,
        description: newItem.description,
        status: ['lost', 'found', 'claimed'].includes(statusVal) ? statusVal : 'lost',
        category: newItem.category || 'Other',
        location: newItem.location,
        reward: rewardVal,
        contact_email: newItem.contact || userEmail,
        ai_tags: newItem.tags || [newItem.category || 'Other'],
        image_url: newItem.image || null
      });

      if (err) throw err;
      return { error: null };
    } catch (err) {
      console.error('Error adding lost item:', err);
      if (showToast) showToast(`Error reporting item: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    try {
      const statusVal = newStatus ? newStatus.toLowerCase() : 'lost';
      const { error: err } = await supabase
        .from('lost_items')
        .update({ status: statusVal })
        .eq('id', itemId);

      if (err) throw err;
      if (showToast) showToast(`Item status updated to ${newStatus}`, 'success');
      return { error: null };
    } catch (err) {
      console.error('Error updating status:', err);
      if (showToast) showToast(`Error updating status: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const { error: err } = await supabase
        .from('lost_items')
        .delete()
        .eq('id', itemId);

      if (err) throw err;
      if (showToast) showToast('Item deleted.', 'success');
      return { error: null };
    } catch (err) {
      console.error('Error deleting item:', err);
      if (showToast) showToast(`Error deleting item: ${err.message}`, 'error');
      return { error: err };
    }
  };

  return { data, loading, error, addItem, updateStatus, deleteItem, refetch: fetchItems };
}
