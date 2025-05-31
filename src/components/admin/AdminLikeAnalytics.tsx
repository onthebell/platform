import { useState } from 'react';
import { useLikeAnalytics } from '@/hooks/useLike';
import { HeartIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function AdminLikeAnalytics() {
  const [timePeriod, setTimePeriod] = useState(30);
  const { analytics, isLoading, error } = useLikeAnalytics(timePeriod);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Like Analytics</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error || 'Failed to load like analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Period Selector */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <HeartIconSolid className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Like Analytics</h3>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="timePeriod" className="text-sm font-medium text-gray-700">
              Time Period:
            </label>
            <select
              id="timePeriod"
              value={timePeriod}
              onChange={e => setTimePeriod(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Likes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analytics.totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <HeartIconSolid className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">
                  Likes in Last {timePeriod} Days
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {analytics.likesInPeriod.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Avg per Day</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(analytics.likesInPeriod / timePeriod).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Liked Posts */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Liked Posts</h4>
        {analytics.topLikedPosts.length > 0 ? (
          <div className="space-y-3">
            {analytics.topLikedPosts.map((post, index) => (
              <div
                key={post.postId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Post ID: {post.postId.slice(-8)}
                    </p>
                    {post.postTitle && (
                      <p className="text-xs text-gray-500 truncate max-w-md">{post.postTitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <HeartIconSolid className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{post.likeCount}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No liked posts found.</p>
        )}
      </div>

      {/* Most Active Likers */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Active Likers</h4>
        {analytics.mostActiveLikers.length > 0 ? (
          <div className="space-y-3">
            {analytics.mostActiveLikers.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.userDisplayName}</p>
                      <p className="text-xs text-gray-500">{user.userId.slice(-8)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <HeartIconSolid className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{user.likeCount}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No active likers found.</p>
        )}
      </div>
    </div>
  );
}
