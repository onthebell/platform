'use client';

import { useState } from 'react';
import { Comment as CommentType } from '@/types';
import { useAuth } from '@/lib/firebase/auth';
import { formatRelativeTime } from '@/lib/utils';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CommentProps {
  comment: CommentType;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function Comment({ comment, onUpdate, onDelete }: CommentProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canModify = user?.id === comment.authorId;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsUpdating(true);
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-3 py-4">
      {/* Avatar placeholder */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {comment.authorName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
              {comment.isEdited && <span className="ml-1 text-gray-400">(edited)</span>}
            </span>
          </div>

          {/* Action buttons for comment author */}
          {canModify && !isEditing && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Edit comment"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                title="Delete comment"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Comment content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              rows={3}
              placeholder="Write your comment..."
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
                className="px-3 py-1 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</div>
        )}
      </div>
    </div>
  );
}
