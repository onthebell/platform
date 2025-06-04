'use client';

import { useAuth } from '@/lib/firebase/auth';
import { FollowList } from '@/components/ui/FollowList';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MyFollowersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to view your followers.</p>
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>

          <div className="flex items-center space-x-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName || 'Anonymous User'}
              </h1>
              <p className="text-gray-600">Your Followers</p>
            </div>
          </div>
        </div>

        {/* Followers List */}
        <FollowList entityId={user.id} entityType="user" listType="followers" />
      </div>
    </div>
  );
}
