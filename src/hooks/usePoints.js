import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const initialPointsHistory = [
  { id: 'p_1', action_type: 'reported_found_item', points: 10, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'p_2', action_type: 'campus_feed_post', points: 5, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'p_3', action_type: 'campus_feed_like_received', points: 1, created_at: new Date(Date.now() - 172800000).toISOString() }
];

export function usePoints(userId, setProfile, showToast) {
  const [pointsHistory, setPointsHistory] = useState(initialPointsHistory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pendingLikesRef = useRef(0);
  const likesTimeoutRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setPointsHistory(initialPointsHistory);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (err) {
        console.warn('Could not fetch points ledger (using fallback):', err.message);
        setPointsHistory(initialPointsHistory);
        setError(err);
      } else {
        setPointsHistory(data || []);
      }

      // Also ensure profile total_points is up to date
      const { data: profData } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      if (profData && setProfile) {
        setProfile(prev => ({ ...prev, totalPoints: profData.total_points || 0 }));
      }
    } catch (err) {
      console.error('Error fetching points:', err);
      setPointsHistory(initialPointsHistory);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId, setProfile]);

  const handleNewPointRow = useCallback((row) => {
    const action = row.action_type;
    const pts = row.points || 0;

    // Trigger debounced notification for likes
    if (action === 'campus_feed_like_received') {
      pendingLikesRef.current += pts;
      if (!likesTimeoutRef.current) {
        likesTimeoutRef.current = setTimeout(() => {
          const totalLikePts = pendingLikesRef.current;
          pendingLikesRef.current = 0;
          likesTimeoutRef.current = null;
          if (totalLikePts === 1) {
            if (showToast) showToast('+1 point — someone liked your Campus Feed post!', 'success');
          } else if (totalLikePts > 1) {
            if (showToast) showToast(`+${totalLikePts} points from likes!`, 'success');
          }
        }, 2000);
      }
    } else if (action === 'reported_found_item') {
      if (showToast) showToast('+10 points — thanks for reporting a found item!', 'success');
    } else if (action === 'item_claimed') {
      if (showToast) showToast('+25 points — item successfully returned!', 'success');
    } else if (action === 'campus_feed_post') {
      if (showToast) showToast('+5 points — thanks for posting to Campus Feed!', 'success');
    } else {
      if (showToast) showToast(`+${pts} points earned!`, 'success');
    }

    // Sync latest total_points from profile table
    if (userId && setProfile) {
      supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(prev => ({ ...prev, totalPoints: data.total_points || 0 }));
          }
        });
    }
  }, [userId, setProfile, showToast]);

  useEffect(() => {
    fetchHistory();

    if (!userId) return;

    // Realtime subscription on points_ledger
    const ledgerChannel = supabase
      .channel(`public:points_ledger:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'points_ledger', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.new) {
            setPointsHistory(prev => [payload.new, ...prev.slice(0, 19)]);
            handleNewPointRow(payload.new);
          }
        }
      )
      .subscribe();

    // Realtime subscription on profiles for total_points updates
    const profileChannel = supabase
      .channel(`public:profiles_points:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new && payload.new.total_points !== undefined && setProfile) {
            setProfile(prev => ({ ...prev, totalPoints: payload.new.total_points || 0 }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ledgerChannel);
      supabase.removeChannel(profileChannel);
      if (likesTimeoutRef.current) {
        clearTimeout(likesTimeoutRef.current);
      }
    };
  }, [userId, fetchHistory, handleNewPointRow, setProfile]);

  return { pointsHistory, loading, error, refetch: fetchHistory };
}
