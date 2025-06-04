import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { getUserLikedPosts, subscribeToUserLikedPosts } from '@/lib/firebase/likes';
import { HeartIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface UserLikedPostsProps {
  userId?: string;
  showTitle?: boolean;
}

/**
 * UserLikedPosts displays a list of posts liked by a user.
 * @param userId - Optional user ID to show likes for (defaults to current user)
 * @param showTitle - Whether to show the section title
 */
export default function UserLikedPosts({ userId, showTitle = true }: UserLikedPostsProps) {
  const { user } = useAuth();
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  // Subscribe to real-time updates of user's liked posts
  useEffect(() => {
    if (!targetUserId) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserLikedPosts(targetUserId, postIds => {
      setLikedPostIds(postIds);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [targetUserId]);

  if (!targetUserId) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Please sign in to view liked posts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        {showTitle && (
          <div className="flex items-center mb-4">
            <HeartIconSolid className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Liked Posts</h3>
          </div>
        )}
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        {showTitle && (
          <div className="flex items-center mb-4">
            <HeartIconSolid className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Liked Posts</h3>
          </div>
        )}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <HeartIconSolid className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Liked Posts</h3>
          </div>
          <span className="text-sm text-gray-500">
            {likedPostIds.length} {likedPostIds.length === 1 ? 'post' : 'posts'}
          </span>
        </div>
      )}

      {likedPostIds.length === 0 ? (
        <div className="text-center py-8">
          <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {userId && userId !== user?.id
              ? "This user hasn't liked any posts yet."
              : "You haven't liked any posts yet."}
          </p>
          {(!userId || userId === user?.id) && (
            <p className="text-sm text-gray-400 mt-2">
              Start exploring the community and like posts that interest you!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {likedPostIds.slice(0, 10).map((postId, index) => (
            <Link key={postId} href={`/community/${postId}`} className="block group">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      Post #{postId.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">Click to view details</p>
                  </div>
                </div>
                <HeartIconSolid className="h-4 w-4 text-red-500" />
              </div>
            </Link>
          ))}

          {likedPostIds.length > 10 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                And {likedPostIds.length - 10} more posts...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
