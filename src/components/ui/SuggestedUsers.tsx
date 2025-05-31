'use client';

import { useSuggestedUsers } from '@/hooks/useFollow';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FollowButton } from './FollowButton';

interface SuggestedUsersProps {
  className?: string;
  limit?: number;
}

export function SuggestedUsers({ className = '', limit = 5 }: SuggestedUsersProps) {
  const { suggestedUsers, loading, error } = useSuggestedUsers();

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Suggested Users</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-14"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !suggestedUsers || suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Users</h3>
      <div className="space-y-3">
        {suggestedUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <Link href={`/profile/${user.id}`} className="flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/profile/${user.id}`} className="block">
                <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {user.displayName || 'Anonymous User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.isVerified ? 'Verified Member' : 'Member'}
                </p>
              </Link>
            </div>

            <div className="flex-shrink-0">
              <FollowButton entityId={user.id} entityType="user" variant="compact" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
