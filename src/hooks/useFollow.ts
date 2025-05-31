import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import {
  followEntity,
  unfollowEntity,
  isFollowing,
  getFollowStats,
  getFollowersWithData,
  getFollowingWithData,
  getSuggestedUsersWithData,
  getMutualFollowersWithData,
  subscribeToFollowStatus,
  subscribeToFollowStats,
  subscribeToFollowers,
  subscribeToFollowing,
} from '@/lib/firebase/follows';
import { FollowStats, User, Business } from '@/types';

export function useFollow(entityId: string, entityType: 'user' | 'business') {
  const { user } = useAuth();
  const [isFollowingEntity, setIsFollowingEntity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to follow status changes
  useEffect(() => {
    if (!user || !entityId) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToFollowStatus(
      user.id,
      entityId,
      entityType,
      isFollowingEntity => {
        setIsFollowingEntity(isFollowingEntity);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, entityId, entityType]);

  const follow = useCallback(async () => {
    if (!user || !entityId || loading) return;

    try {
      setLoading(true);
      setError(null);
      await followEntity(user.id, entityId, entityType);
      // Real-time subscription will update the state
    } catch (err) {
      console.error('Error following entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to follow');
    } finally {
      setLoading(false);
    }
  }, [user, entityId, entityType, loading]);

  const unfollow = useCallback(async () => {
    if (!user || !entityId || loading) return;

    try {
      setLoading(true);
      setError(null);
      await unfollowEntity(user.id, entityId, entityType);
      // Real-time subscription will update the state
    } catch (err) {
      console.error('Error unfollowing entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to unfollow');
    } finally {
      setLoading(false);
    }
  }, [user, entityId, entityType, loading]);

  const toggle = useCallback(() => {
    if (isFollowingEntity) {
      unfollow();
    } else {
      follow();
    }
  }, [isFollowingEntity, follow, unfollow]);

  return {
    isFollowing: isFollowingEntity,
    loading,
    error,
    follow,
    unfollow,
    toggle,
  };
}

export function useFollowStats(entityId: string) {
  const [stats, setStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToFollowStats(entityId, followStats => {
      setStats(followStats || { followersCount: 0, followingCount: 0 });
      setLoading(false);
    });

    return unsubscribe;
  }, [entityId]);

  return { stats, loading, error };
}

export function useFollowers(entityId: string, entityType: 'user' | 'business') {
  const [followers, setFollowers] = useState<(User | Business)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    if (!entityId) return;

    try {
      setLoading(true);
      setError(null);
      const followersList = await getFollowersWithData(entityId, entityType);
      setFollowers(followersList);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch followers');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  return { followers, loading, error, refetch: fetchFollowers };
}

export function useFollowing(userId: string, entityType?: 'user' | 'business') {
  const [following, setFollowing] = useState<(User | Business)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowing = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const followingList = await getFollowingWithData(userId, entityType);
      setFollowing(followingList);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch following');
    } finally {
      setLoading(false);
    }
  }, [userId, entityType]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  return { following, loading, error, refetch: fetchFollowing };
}

export function useSuggestedUsers() {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const suggestions = await getSuggestedUsersWithData(user.id);
        setSuggestedUsers(suggestions);
      } catch (err) {
        console.error('Error fetching suggested users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  return { suggestedUsers, loading, error };
}

export function useMutualFollowers(userId1: string, userId2: string) {
  const [mutualFollowers, setMutualFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId1 || !userId2) return;

    const fetchMutualFollowers = async () => {
      try {
        setLoading(true);
        setError(null);
        const mutual = await getMutualFollowersWithData(userId1, userId2);
        setMutualFollowers(mutual);
      } catch (err) {
        console.error('Error fetching mutual followers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch mutual followers');
      } finally {
        setLoading(false);
      }
    };

    fetchMutualFollowers();
  }, [userId1, userId2]);

  return { mutualFollowers, loading, error };
}
