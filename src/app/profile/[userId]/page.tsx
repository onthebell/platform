'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPosts } from '@/lib/firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CommunityPost, User } from '@/types';
import PostCard from '@/components/community/PostCard';
import UserLikedPosts from '@/components/community/UserLikedPosts';
import { formatDate, toDate } from '@/lib/utils';
import { FollowButton } from '@/components/ui/FollowButton';
import { FollowStats } from '@/components/ui/FollowStats';
import { canViewUserProfile } from '@/lib/utils/privacy';
import {
  UserIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');

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

        // Get user's posts
        const posts = await getPosts(
          {
            authorId: userId,
          },
          50
        );
        setUserPosts(posts);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser]);

  // Redirect current user to their own profile page
  useEffect(() => {
    if (currentUser && userId === currentUser.id) {
      router.replace('/profile');
    }
  }, [currentUser, userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-300 rounded w-48"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !targetUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "The user profile you're looking for doesn't exist."}
            </p>
            <Link
              href="/community"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Back to Community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                {targetUser.photoURL ? (
                  <img
                    src={targetUser.photoURL}
                    alt={targetUser.displayName || targetUser.email}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {targetUser.displayName || targetUser.email}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Member since {formatDate(toDate(targetUser.joinedAt))}</span>
                  {targetUser.verificationStatus === 'approved' && (
                    <div className="flex items-center text-green-600">
                      <CheckBadgeIcon className="h-4 w-4 mr-1" />
                      <span>Verified Resident</span>
                    </div>
                  )}
                  {targetUser.verificationStatus === 'pending' && (
                    <div className="flex items-center text-yellow-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span>Verification Pending</span>
                    </div>
                  )}
                </div>

                {/* Follow Stats */}
                <div className="mt-3">
                  <FollowStats entityId={targetUser.id} entityType="user" className="text-sm" />
                </div>
                {targetUser.address && targetUser.verificationStatus === 'approved' && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>
                      {targetUser.address.suburb}, {targetUser.address.postcode}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <FollowButton entityId={targetUser.id} entityType="user" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'liked'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Liked Posts
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div>
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {targetUser.displayName || 'This user'} hasn't shared anything with the
                    community yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            <UserLikedPosts userId={userId} showTitle={false} />
          </div>
        )}
      </div>
    </div>
  );
}
