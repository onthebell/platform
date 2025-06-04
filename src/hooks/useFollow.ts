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

/**
 * Custom hook for following/unfollowing a user or business and tracking follow state in real-time.
 * @param entityId - The ID of the user or business to follow.
 * @param entityType - The type of entity ('user' or 'business').
 * @returns An object with follow state, loading, error, and follow/unfollow/toggle functions.
 */
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

/**
 * Custom hook for fetching real-time follower/following stats for a user or business.
 * @param entityId - The ID of the user or business.
 * @returns An object with stats, loading, and error.
 */
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

/**
 * Custom hook for fetching followers for a user or business.
 * @param entityId - The ID of the user or business.
 * @param entityType - The type of entity ('user' or 'business').
 * @returns An object with followers, loading, error, and refetch function.
 */
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

/**
 * Custom hook for fetching entities a user is following.
 * @param userId - The ID of the user.
 * @param entityType - Optional type of entity ('user' or 'business').
 * @returns An object with following, loading, error, and refetch function.
 */
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

/**
 * Custom hook for fetching suggested users to follow for the current user.
 * @returns An object with suggested users, loading, and error.
 */
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

/**
 * Custom hook for fetching mutual followers between two users.
 * @param userId1 - The first user ID.
 * @param userId2 - The second user ID.
 * @returns An object with mutual followers, loading, and error.
 */
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
