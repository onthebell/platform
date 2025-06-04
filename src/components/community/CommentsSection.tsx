'use client';

import { useAuth } from '@/lib/firebase/auth';
import { useComments } from '@/hooks/useComments';
import { Comment } from './Comment';
import { CommentForm } from './CommentForm';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface CommentsSectionProps {
  postId: string;
  className?: string;
}

/**
 * CommentsSection displays a list of comments and a form for adding new comments.
 * @param postId - The ID of the post to show comments for
 * @param className - Optional CSS class for styling
 */

export function CommentsSection({ postId, className = '' }: CommentsSectionProps) {
  const { user } = useAuth();
  const { comments, commentCount, loading, error, addComment, updateComment, deleteComment } =
    useComments(postId);

  const handleAddComment = async (content: string) => {
    if (!user?.displayName) return;
    await addComment(content, user.id, user.displayName);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comments header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Comments ({commentCount})</h3>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Comment form */}
      <CommentForm onSubmit={handleAddComment} />

      {/* Comments list */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                onUpdate={updateComment}
                onDelete={deleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
