import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useStudyGroups(userId, profile, showToast) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      setError(null);
      const { data: rows, error: err } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:profiles!creator_id(id, full_name, avatar_url),
          members:study_group_members(
            user_id,
            joined_at,
            profile:profiles(id, full_name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (err) throw err;

      const mapped = (rows || []).map(row => {
        const memberList = (row.members || []).map(m => ({
          id: m.user_id,
          name: m.profile?.full_name || 'Member',
          avatar: m.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.user_id}`
        }));

        const isJoined = memberList.some(m => m.id === userId);

        // Extract topic if appended to course_name
        let cName = row.course_name || '';
        let topicStr = 'Exam Review & Practice';
        if (cName.includes(' - ')) {
          const parts = cName.split(' - ');
          cName = parts[0];
          topicStr = parts.slice(1).join(' - ');
        }

        return {
          id: row.id,
          courseCode: row.course_code,
          courseName: cName,
          topic: topicStr,
          location: row.location_or_link || 'Student Union',
          type: row.meeting_type || 'In-Person',
          date: new Date(row.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
          host: {
            name: row.creator?.full_name || 'Host',
            avatar: row.creator?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.creator_id}`
          },
          members: memberList,
          maxMembers: row.capacity || 6,
          resourcesLink: (row.resource_links && row.resource_links[0]) || '',
          joined: isJoined
        };
      });

      setData(mapped);
    } catch (err) {
      console.error('Error fetching study groups:', err);
      setError(err);
      if (showToast) showToast('Failed to load study groups.', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchGroups();

    const channel1 = supabase
      .channel('public:study_groups_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_groups' }, () => {
        fetchGroups();
      })
      .subscribe();

    const channel2 = supabase
      .channel('public:study_group_members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_group_members' }, () => {
        fetchGroups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [fetchGroups]);

  const createGroup = async (newGroup) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to create a study group.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      const typeVal = ['In-Person', 'Virtual', 'Hybrid'].includes(newGroup.type) ? newGroup.type : 'In-Person';
      const cNameWithTopic = newGroup.courseName + (newGroup.topic ? ` - ${newGroup.topic}` : '');

      const { data: created, error: err } = await supabase
        .from('study_groups')
        .insert({
          creator_id: userId,
          course_code: newGroup.courseCode || 'CS 101',
          course_name: cNameWithTopic,
          meeting_type: typeVal,
          location_or_link: newGroup.location || 'Campus Library',
          capacity: Number(newGroup.maxMembers) || 6,
          resource_links: newGroup.resourcesLink ? [newGroup.resourcesLink] : []
        })
        .select()
        .single();

      if (err) throw err;

      // Automatically join the creator to their new group
      if (created) {
        await supabase.from('study_group_members').insert({
          group_id: created.id,
          user_id: userId
        });
      }

      return { error: null };
    } catch (err) {
      console.error('Error creating group:', err);
      if (showToast) showToast(`Error creating group: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const joinGroup = async (groupId) => {
    if (!userId) {
      if (showToast) showToast('Please sign in to join groups.', 'error');
      return { error: new Error('Not signed in') };
    }

    try {
      const { error: err } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: userId
        });

      if (err) throw err;
      return { error: null };
    } catch (err) {
      console.error('Error joining group:', err);
      // Surface Postgres exception from capacity trigger as a user-facing toast
      if (err.message && (err.message.includes('full') || err.message.includes('Study group is full') || err.code === 'P0001')) {
        if (showToast) showToast('Study group is full', 'error');
      } else {
        if (showToast) showToast(`Could not join group: ${err.message}`, 'error');
      }
      return { error: err };
    }
  };

  const leaveGroup = async (groupId) => {
    if (!userId) return { error: new Error('Not signed in') };

    try {
      const { error: err } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (err) throw err;
      return { error: null };
    } catch (err) {
      console.error('Error leaving group:', err);
      if (showToast) showToast(`Error leaving group: ${err.message}`, 'error');
      return { error: err };
    }
  };

  const toggleJoin = async (groupId) => {
    const target = data.find(g => g.id === groupId);
    if (!target) return;

    if (target.joined) {
      await leaveGroup(groupId);
    } else {
      await joinGroup(groupId);
    }
  };

  return { data, loading, error, createGroup, joinGroup, leaveGroup, toggleJoin, refetch: fetchGroups };
}
