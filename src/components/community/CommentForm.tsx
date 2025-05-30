'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { useContentModeration } from '@/hooks/useContentModeration';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export function CommentForm({ onSubmit, placeholder = 'Write your comment...' }: CommentFormProps) {
  const { user } = useAuth();
  const { moderateContent, isLoading: isModerating } = useContentModeration();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Only verified users can comment
  const canComment = user?.isVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !canComment) return;

    try {
      setIsSubmitting(true);
      setModerationError(null);

      // Moderate content before submitting
      const moderationResult = await moderateContent(content);

      if (!moderationResult.safe) {
        setModerationError(moderationResult.message);
        return;
      }

      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setModerationError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">
          <span className="font-medium">Sign in</span> to join the conversation
        </p>
      </div>
    );
  }

  if (!canComment) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">
          Only <span className="font-medium">verified residents</span> can comment on posts.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Comment input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => {
              setContent(e.target.value);
              // Clear moderation error when user starts typing
              if (moderationError) {
                setModerationError(null);
              }
            }}
            placeholder={placeholder}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            disabled={isSubmitting || isModerating}
          />
        </div>
      </div>

      {/* Moderation error message */}
      {moderationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{moderationError}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isModerating || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : isModerating ? 'Checking...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
