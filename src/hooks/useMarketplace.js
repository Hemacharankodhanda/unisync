import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const initialMarketplaceItems = [
  {
    id: 'm_1',
    title: 'Calculus: Early Transcendentals (8th Ed)',
    price: 45,
    category: 'Textbooks',
    condition: 'Like New',
    description: 'Barely used for MAT101. No highlights or tears. Includes online code.',
    contact_info: 'sarah.m@vitapstudent.ac.in',
    seller_email: 'sarah.m@vitapstudent.ac.in',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    date: '2h ago'
  },
  {
    id: 'm_2',
    title: 'Apple iPad Air (4th Gen) + Pencil',
    price: 380,
    category: 'Electronics',
    condition: 'Good',
    description: '64GB Wi-Fi Sky Blue. Perfect for notes. Battery life is excellent.',
    contact_info: 'rahul.k@vitapstudent.ac.in',
    seller_email: 'rahul.k@vitapstudent.ac.in',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    date: '5h ago'
  },
  {
    id: 'm_3',
    title: 'Mini Fridge 50L (Dorm Cleanout)',
    price: 65,
    category: 'Dorm Essentials',
    condition: 'Good',
    description: 'Works great, super quiet. Moving out of MH block so selling cheap.',
    contact_info: 'ananya.p@vitapstudent.ac.in',
    seller_email: 'ananya.p@vitapstudent.ac.in',
    image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    date: '1d ago'
  },
  {
    id: 'm_4',
    title: 'Hero Sprint 21-Speed Mountain Bike',
    price: 95,
    category: 'Vehicles',
    condition: 'Fair',
    description: 'Serviced last month. Great for getting between academic blocks and hostels.',
    contact_info: 'vikram.r@vitapstudent.ac.in',
    seller_email: 'vikram.r@vitapstudent.ac.in',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    date: '2d ago'
  }
];

export function useMarketplace(userId, userEmail, showToast) {
  // Start with initialMarketplaceItems so the grid is never empty or stuck loading!
  const [items, setItems] = useState(initialMarketplaceItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('marketplace_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        // Fallback to local items if table is missing or query fails
        console.warn('Marketplace fetch error (using fallback items):', err.message);
        setItems(prev => prev.length > 0 ? prev : initialMarketplaceItems);
        setError(err);
      } else if (!data || data.length === 0) {
        setItems(prev => prev.length > 0 ? prev : initialMarketplaceItems);
      } else {
        const formatted = data.map(item => ({
          ...item,
          date: new Date(item.created_at).toLocaleDateString() === new Date().toLocaleDateString()
            ? 'Today' : new Date(item.created_at).toLocaleDateString()
        }));
        setItems(formatted);
      }
    } catch (err) {
      console.error('Error fetching marketplace items:', err);
      setItems(prev => prev.length > 0 ? prev : initialMarketplaceItems);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel('public:marketplace_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const getCategoryImage = (cat) => {
    switch (cat) {
      case 'Textbooks':
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
      case 'Electronics':
        return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80';
      case 'Dorm Essentials':
        return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
      case 'Vehicles':
        return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';
      case 'Clothing':
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';
      default:
        return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';
    }
  };

  const addItem = async (newItem) => {
    const priceVal = parseFloat(String(newItem.price).replace(/[^0-9.]/g, '')) || 0;
    const imgUrl = newItem.image_url || getCategoryImage(newItem.category);

    const optimisticItem = {
      id: 'm_' + Date.now(),
      seller_id: userId || 'local_user',
      seller_email: userEmail || 'student@vitapstudent.ac.in',
      title: newItem.title,
      price: priceVal,
      category: newItem.category || 'Other',
      condition: newItem.condition || 'Good',
      description: newItem.description || 'No details provided.',
      contact_info: newItem.contact_info || userEmail || 'student@vitapstudent.ac.in',
      image_url: imgUrl,
      status: 'Available',
      date: 'Just now'
    };

    // Optimistically add to React state instantly so it ALWAYS lists immediately on screen!
    setItems(prev => [optimisticItem, ...prev]);

    if (!userId) {
      if (showToast) showToast('Listed locally in demo mode.', 'warning');
      return { error: null };
    }

    try {
      const { error: err } = await supabase.from('marketplace_items').insert({
        seller_id: userId,
        seller_email: userEmail || 'student@vitapstudent.ac.in',
        title: newItem.title,
        price: priceVal,
        category: newItem.category || 'Other',
        condition: newItem.condition || 'Good',
        description: newItem.description || 'No details provided.',
        contact_info: newItem.contact_info || userEmail || 'student@vitapstudent.ac.in',
        image_url: imgUrl,
        status: 'Available'
      });

      if (err) {
        console.warn('Could not save to Supabase (using local item):', err.message);
        if (showToast) showToast(`Listed locally (DB: ${err.message})`, 'info');
      } else {
        fetchItems();
      }
      return { error: null };
    } catch (err) {
      console.error('Error adding marketplace item:', err);
      return { error: null };
    }
  };

  const markAsSold = async (itemId) => {
    // Optimistic UI update
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'Sold' } : item));

    if (!userId) return;
    try {
      const { error: err } = await supabase
        .from('marketplace_items')
        .update({ status: 'Sold' })
        .eq('id', itemId);

      if (err) throw err;
      if (showToast) showToast('Item marked as Sold!', 'success');
      fetchItems();
    } catch (err) {
      console.error('Error marking item sold:', err);
      if (showToast) showToast('Could not update status in database.', 'error');
    }
  };

  const removeItem = async (itemId) => {
    // Optimistic UI update
    setItems(prev => prev.filter(item => item.id !== itemId));

    if (!userId) return;
    try {
      const { error: err } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', itemId);

      if (err) throw err;
      if (showToast) showToast('Item removed.', 'success');
      fetchItems();
    } catch (err) {
      console.error('Error removing item:', err);
      if (showToast) showToast('Could not delete item from database.', 'error');
    }
  };

  return { items, loading, error, addItem, markAsSold, removeItem, refetch: fetchItems };
}
