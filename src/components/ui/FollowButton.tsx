'use client';

import { useState } from 'react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/lib/firebase/auth';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { UserPlusIcon as UserPlusSolid } from '@heroicons/react/24/solid';

interface FollowButtonProps {
  entityId: string;
  entityType: 'user' | 'business';
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  entityId,
  entityType,
  variant = 'default',
  className = '',
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, loading, follow, unfollow } = useFollow(entityId, entityType);
  const [actionLoading, setActionLoading] = useState(false);

  // Don't show follow button for own profile/business
  if (!user || user.id === entityId) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (actionLoading || loading) return;

    try {
      setActionLoading(true);
      if (isFollowing) {
        await unfollow();
        onFollowChange?.(false);
      } else {
        await follow();
        onFollowChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const isLoading = loading || actionLoading;

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors ${
          isFollowing
            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={isFollowing ? `Unfollow ${entityType}` : `Follow ${entityType}`}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isFollowing ? (
          <UserMinusIcon className="h-5 w-5" />
        ) : (
          <UserPlusIcon className="h-5 w-5" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          isFollowing
            ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            : 'text-white bg-blue-600 hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : (
          <>
            {isFollowing ? (
              <UserMinusIcon className="h-4 w-4 mr-1.5" />
            ) : (
              <UserPlusIcon className="h-4 w-4 mr-1.5" />
            )}
          </>
        )}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isFollowing
          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300'
          : 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-600'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : (
        <>
          {isFollowing ? (
            <UserMinusIcon className="h-4 w-4 mr-2" />
          ) : (
            <UserPlusSolid className="h-4 w-4 mr-2" />
          )}
        </>
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
