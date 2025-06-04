'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types';
import { FollowList } from '@/components/ui/FollowList';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.userId as string;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Get user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          setError('User not found');
          return;
        }

        const userData = userDoc.data() as User;
        setTargetUser({ ...userData, id: userDoc.id });

        // Check privacy settings
        if (userData.privacySettings?.profileVisibility === 'private') {
          setError('This profile is private');
          return;
        }

        // If profile is for verified users only, check if current user is verified
        if (
          userData.privacySettings?.profileVisibility === 'verified_only' &&
          (!currentUser || !currentUser.isVerified)
        ) {
          setError('This profile is only visible to verified residents');
          return;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser]);

  // Redirect to own profile if viewing self
  useEffect(() => {
    if (currentUser && currentUser.id === userId) {
      router.replace('/profile/following');
    }
  }, [currentUser, userId, router]);

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

  if (error || !targetUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The user profile you're looking for doesn't exist."}
            </p>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Community
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
            href={`/profile/${userId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Profile
          </Link>

          <div className="flex items-center space-x-4">
            {targetUser.photoURL ? (
              <img
                src={targetUser.photoURL}
                alt={targetUser.displayName || 'User'}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {targetUser.displayName || 'Anonymous User'}
              </h1>
              <p className="text-gray-600">Following</p>
            </div>
          </div>
        </div>

        {/* Following List */}
        <FollowList entityId={userId} entityType="user" listType="following" />
      </div>
    </div>
  );
}
