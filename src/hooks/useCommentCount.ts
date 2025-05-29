'use client';

import { useState, useEffect } from 'react';
import { getPostCommentCount } from '@/lib/firebase/comments';

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
