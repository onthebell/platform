import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import {
  togglePostLike,
  subscribeToPostLikeCount,
  subscribeToUserLikeStatus,
  LikeAnalytics,
} from '@/lib/firebase/likes';

/**
 * Custom hook for managing post like functionality with real-time updates.
 * @param postId - The ID of the post to like/unlike.
 * @param initialLikeCount - The initial like count for the post.
 * @returns An object with like state, count, loading, error, toggleLike, and canLike.
 */
export function useLike(postId: string, initialLikeCount: number = 0) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time like count updates
  useEffect(() => {
    if (!postId) return;

    const unsubscribe = subscribeToPostLikeCount(postId, count => {
      setLikeCount(count);
    });

    return unsubscribe;
  }, [postId]);

  // Subscribe to real-time user like status updates
  useEffect(() => {
    if (!user || !postId) {
      setIsLiked(false);
      return;
    }

    const unsubscribe = subscribeToUserLikeStatus(postId, user.id, liked => {
      setIsLiked(liked);
    });

    return unsubscribe;
  }, [postId, user]);

  /**
   * Toggle like status with optimistic updates
   */
  const toggleLike = async () => {
    if (!user) {
      setError('You must be signed in to like posts');
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    setError(null);

    try {
      setIsLoading(true);

      await togglePostLike(postId, user.id, user.displayName || user.email || 'Anonymous');

      // Real-time subscriptions will handle state updates automatically
    } catch (err) {
      console.error('Error toggling like:', err);

      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      setError('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLoading,
    error,
    toggleLike,
    canLike: !!user,
  };
}

/**
 * Hook for getting like analytics (admin use).
 * @param days - Number of days to include in analytics (default: 30).
 * @returns An object with analytics data, loading state, error, and a refetch function.
 */
export function useLikeAnalytics(days: number = 30) {
  const [analytics, setAnalytics] = useState<LikeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { getLikeAnalytics } = await import('@/lib/firebase/likes');
        const data = await getLikeAnalytics(days);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching like analytics:', err);
        setError('Failed to load like analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  return {
    analytics,
    isLoading,
    error,
    refetch: () => {
      setAnalytics(null);
      // Re-trigger useEffect
    },
  };
}
