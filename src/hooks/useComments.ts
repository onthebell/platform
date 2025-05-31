'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import {
  addComment as addCommentService,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
  subscribeToPostComments,
  subscribeToPostCommentCount,
} from '@/lib/firebase/comments';

interface UseCommentsReturn {
  comments: Comment[];
  commentCount: number;
  loading: boolean;
  error: string | null;
  addComment: (content: string, authorId: string, authorName: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export function useComments(postId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (content: string, authorId: string, authorName: string) => {
    try {
      setError(null);
      await addCommentService(postId, authorId, authorName, content);
      // Real-time listener will update the state automatically
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
      throw err;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      setError(null);
      await updateCommentService(commentId, content);
      // Real-time listener will update the state automatically
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setError(null);
      await deleteCommentService(commentId);
      // Real-time listener will update the state automatically
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
      throw err;
    }
  };

  const refreshComments = async () => {
    // No need to manually refresh - real-time listeners handle this
  };

  // Set up real-time listeners
  useEffect(() => {
    if (!postId) return;

    setLoading(true);

    // Subscribe to comments
    const unsubscribeComments = subscribeToPostComments(postId, commentsData => {
      setComments(commentsData);
      setLoading(false);
      setError(null);
    });

    // Subscribe to comment count
    const unsubscribeCount = subscribeToPostCommentCount(postId, count => {
      setCommentCount(count);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeComments();
      unsubscribeCount();
    };
  }, [postId]);

  return {
    comments,
    commentCount,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refreshComments,
  };
}
