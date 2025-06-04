'use client';

import { useFollowStats } from '@/hooks/useFollow';
import Link from 'next/link';

interface FollowStatsProps {
  entityId: string;
  entityType: 'user' | 'business';
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'compact';
}

/**
 * FollowStats displays follower and following counts for a user or business.
 * @param entityId - The ID of the user or business
 * @param entityType - 'user' or 'business'
 * @param className - Optional CSS class for styling
 * @param showLabels - Whether to show text labels
 * @param variant - 'default' or 'compact' style
 */

export function FollowStats({
  entityId,
  entityType,
  className = '',
  showLabels = true,
  variant = 'default',
}: FollowStatsProps) {
  const { stats, loading } = useFollowStats(entityId);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const baseClasses = variant === 'compact' ? 'text-sm' : 'text-base';

  return (
    <div className={`flex space-x-4 ${baseClasses} ${className}`}>
      <Link
        href={`/profile/${entityId}/followers`}
        className="hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-900">{stats.followersCount}</span>
        {showLabels && (
          <span className="text-gray-600 ml-1">
            {stats.followersCount === 1 ? 'Follower' : 'Followers'}
          </span>
        )}
      </Link>

      <Link
        href={`/profile/${entityId}/following`}
        className="hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-900">{stats.followingCount}</span>
        {showLabels && <span className="text-gray-600 ml-1">Following</span>}
      </Link>
    </div>
  );
}
