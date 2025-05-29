'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import {
  getPostComments,
  addComment as addCommentService,
  updateComment as updateCommentService,
  deleteComment as deleteCommentService,
  getPostCommentCount,
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

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [commentsData, count] = await Promise.all([
        getPostComments(postId),
        getPostCommentCount(postId),
      ]);
      setComments(commentsData);
      setCommentCount(count);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = async (content: string, authorId: string, authorName: string) => {
    try {
      setError(null);
      const commentId = await addCommentService(postId, authorId, authorName, content);

      // Add the new comment to the local state
      const newComment: Comment = {
        id: commentId,
        postId,
        authorId,
        authorName,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
      };

      setComments(prev => [...prev, newComment]);
      setCommentCount(prev => prev + 1);
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

      // Update the comment in local state
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, content, updatedAt: new Date(), isEdited: true }
            : comment
        )
      );
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

      // Remove the comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
      throw err;
    }
  };

  const refreshComments = async () => {
    await loadComments();
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId, loadComments]);

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
