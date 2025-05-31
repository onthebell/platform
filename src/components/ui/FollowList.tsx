'use client';

import { useFollowers, useFollowing } from '@/hooks/useFollow';
import { User, Business } from '@/types';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FollowButton } from './FollowButton';

interface FollowListProps {
  entityId: string;
  entityType: 'user' | 'business';
  listType: 'followers' | 'following';
  className?: string;
}

export function FollowList({ entityId, entityType, listType, className = '' }: FollowListProps) {
  const followersQuery = useFollowers(entityId, entityType);
  const followingQuery = useFollowing(entityId);

  const { data, loading, error } =
    listType === 'followers'
      ? {
          data: followersQuery.followers,
          loading: followersQuery.loading,
          error: followersQuery.error,
        }
      : {
          data: followingQuery.following,
          loading: followingQuery.loading,
          error: followingQuery.error,
        };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Error loading {listType}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <UserCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map(item => {
        const isUser = 'displayName' in item;
        const name = isUser ? item.displayName || 'Anonymous User' : item.name;
        const subtitle = isUser
          ? item.isVerified
            ? 'Verified Member'
            : 'Member'
          : item.category || 'Business';
        const profileUrl = isUser ? `/profile/${item.id}` : `/business/${item.id}`;
        const followEntityType = isUser ? 'user' : 'business';

        // Get the appropriate image URL based on entity type
        const imageUrl = isUser ? (item as User).photoURL : (item as Business).images?.[0];

        return (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <Link href={profileUrl} className="flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={profileUrl} className="block">
                <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {name}
                </p>
                <p className="text-xs text-gray-500 truncate">{subtitle}</p>
              </Link>
            </div>

            <div className="flex-shrink-0">
              <FollowButton entityId={item.id} entityType={followEntityType} variant="compact" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
