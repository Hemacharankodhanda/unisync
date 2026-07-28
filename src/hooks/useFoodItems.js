import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFoodItems(userId, showToast) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const { data: rows, error: err } = await supabase
        .from('food_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (err) throw err;

      const mapped = (rows || []).map(row => {
        let cafeteriaName = row.venue;
        if (row.venue === 'Main Campus') cafeteriaName = 'Main Campus Dining Hall';
        else if (row.venue === 'Student Center') cafeteriaName = 'West Campus Student Center';
        else if (row.venue === 'North Piazza') cafeteriaName = 'North Piazza Bistro';
        else if (row.venue === 'Juice Bar') cafeteriaName = 'Recreation Center Juice Bar';

        let statusText = 'In Stock';
        if (row.stock_status === 'sold_out') statusText = 'Sold Out';
        else if (row.stock_status === 'running_low') statusText = 'Running Low';

        return {
          id: row.id,
          title: row.name,
          cafeteria: cafeteriaName,
          venue: row.venue,
          status: statusText,
          crowdLevel: 'Moderate',
          calories: '520 kcal',
          price: row.price != null ? `$${Number(row.price).toFixed(2)}` : '$8.50',
          dietary: row.dietary_tags && row.dietary_tags.length > 0 ? row.dietary_tags : ['Fresh 🥗'],
          image: row.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
          upvotes: row.upvotes || 0,
          downvotes: row.downvotes || 0,
          lastUpdated: new Date(row.updated_at || row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

      setData(mapped);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError(err);
      if (showToast) showToast('Failed to load food tracker data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('public:food_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const addItem = async (newItem) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to add menu items.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      const priceVal = newItem.price ? parseFloat(String(newItem.price).replace(/[^0-9.]/g, '')) || 0 : 8.50;
      
      let venueVal = 'Main Campus';
      const inputVenue = newItem.cafeteria || newItem.venue || '';
      if (inputVenue.includes('Student') || inputVenue.includes('West')) venueVal = 'Student Center';
      else if (inputVenue.includes('Piazza') || inputVenue.includes('North') || inputVenue.includes('Bistro')) venueVal = 'North Piazza';
      else if (inputVenue.includes('Juice') || inputVenue.includes('Recreation')) venueVal = 'Juice Bar';
      else venueVal = 'Main Campus';

      const { error: err } = await supabase.from('food_items').insert({
        name: newItem.title || newItem.name || 'New Dish',
        venue: venueVal,
        dietary_tags: newItem.dietary || ['Fresh 🥗'],
        price: priceVal,
        stock_status: 'in_stock',
        image_url: newItem.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'
      });

      if (err) throw err;
      return { error: null };
    } catch (err) {
      console.error('Error adding food item:', err);
      if (showToast) showToast(`Error adding item: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const vote = async (itemId, isUpvote) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to vote.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      const isUp = isUpvote === true || isUpvote === 'up';
      const { error: err } = await supabase.rpc('vote_food_item', {
        item_id: itemId,
        is_upvote: isUp
      });

      if (err) throw err;
      if (showToast) showToast('Vote recorded', 'success');
      return { error: null };
    } catch (err) {
      console.error('Error voting on food item:', err);
      if (showToast) showToast(`Error recording vote: ${err.message}`, 'error');
      return { error: err };
    }
  };

  return { data, loading, error, addItem, vote, refetch: fetchItems };
}
