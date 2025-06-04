'use client';

import { useState, useEffect } from 'react';
import { getPostCommentCount } from '@/lib/firebase/comments';

/**
 * Custom hook for fetching the comment count for a post.
 * @param postId - The ID of the post to fetch comment count for.
 * @returns An object with count and loading state.
 */

export function useCommentCount(postId: string) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const commentCount = await getPostCommentCount(postId);
        setCount(commentCount);
      } catch (error) {
        console.error('Error loading comment count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadCount();
  }, [postId]);

  return { count, loading };
}
