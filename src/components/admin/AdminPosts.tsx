import { useState, useEffect } from 'react';
import { useAdminPosts } from '@/hooks/useAdmin';
import { CommunityPost } from '@/types';
import {
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: CommunityPost;
  onUpdate: (id: string, action: string, reason?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleAction = async (action: string) => {
    setActionLoading(true);
    const success = await onUpdate(post.id, action, reason || undefined);
    if (success) {
      setShowActions(false);
      setReason('');
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;

    setActionLoading(true);
    const success = await onDelete(post.id);
    setActionLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {post.authorName?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {post.authorName || 'Unknown Author'}
              </h3>
              <p className="text-xs text-gray-500">
                {(() => {
                  if (!post.createdAt) return 'Unknown';
                  try {
                    const date =
                      post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
                    if (isNaN(date.getTime())) return 'Unknown';
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'Unknown';
                  }
                })()}
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center space-x-2">
            {post.isHidden && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Hidden
              </span>
            )}
            {post.isDeleted && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Deleted
              </span>
            )}
            {!post.isHidden && !post.isDeleted && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h4>
          <p className="text-gray-700 text-sm line-clamp-3">{post.content}</p>
          {post.category && (
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {post.category}
            </span>
          )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{post.likes || 0} likes</span>
            <span>{post.commentCount || 0} comments</span>
            <span>{post.views || 0} views</span>
          </div>
          <span>ID: {post.id?.slice(-6) || 'Unknown'}</span>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4">
          {!showActions ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowActions(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Moderate Post
              </button>
              <div className="flex items-center space-x-2">
                {!post.isHidden && !post.isDeleted && (
                  <button
                    onClick={() => handleAction('hide')}
                    disabled={actionLoading}
                    className="p-2 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
                    title="Hide post"
                  >
                    <EyeSlashIcon className="w-4 h-4" />
                  </button>
                )}
                {(post.isHidden || post.isDeleted) && (
                  <button
                    onClick={() => handleAction('restore')}
                    disabled={actionLoading}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                    title="Restore post"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete permanently"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Reason for moderation action..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowActions(false)}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <div className="flex items-center space-x-2">
                  {!post.isHidden && !post.isDeleted && (
                    <button
                      onClick={() => handleAction('hide')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Hide
                    </button>
                  )}
                  {!post.isDeleted && (
                    <button
                      onClick={() => handleAction('delete')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  {(post.isHidden || post.isDeleted) && (
                    <button
                      onClick={() => handleAction('restore')}
                      disabled={actionLoading}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPosts() {
  const { posts, loading, error, hasMore, fetchPosts, updatePost, deletePost, loadMore } =
    useAdminPosts();
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('');

  useEffect(() => {
    fetchPosts({
      status: statusFilter,
      authorId: authorFilter || undefined,
      reset: true,
    });
  }, [statusFilter, authorFilter]);

  const handleFilterChange = () => {
    fetchPosts({
      status: statusFilter,
      authorId: authorFilter || undefined,
      reset: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and moderate community posts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Posts</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="deleted">Deleted</option>
          </select>

          <input
            type="text"
            placeholder="Author ID..."
            value={authorFilter}
            onChange={e => setAuthorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-48"
          />

          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onUpdate={updatePost} onDelete={deletePost} />
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all'
                ? `No ${statusFilter} posts match your criteria.`
                : 'No posts have been created yet.'}
            </p>
          </div>
        )}

        {/* Load More */}
        {hasMore && posts.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading...' : 'Load More Posts'}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && posts.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
