'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getPosts } from '@/lib/firebase/firestore';
import { db } from '@/lib/firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';
import { CommunityPost } from '@/types';
import PostCard from '@/components/community/PostCard';
import UserLikedPosts from '@/components/community/UserLikedPosts';
import PrivacySettings from '@/components/profile/PrivacySettings';
import NotificationPreferences from '@/components/profile/NotificationPreferences';
import { FollowStats } from '@/components/ui/FollowStats';
import { formatDate, toDate } from '@/lib/utils';
import {
  UserIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, signOut, updateUserProfile } = useAuth();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'liked' | 'settings' | 'privacy' | 'notifications'
  >('posts');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({ type: null, text: '' });

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;

      try {
        const posts = await getPosts(
          {
            authorId: user.id,
          },
          50
        );
        setUserPosts(posts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  // Initialize display name when user data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  // Clear save message after 5 seconds
  useEffect(() => {
    if (saveMessage.type) {
      const timer = setTimeout(() => {
        setSaveMessage({ type: null, text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleDeletePost = async (postId: string) => {
    if (!user || !confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(postId);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setUserPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Clear any previous messages
    setSaveMessage({ type: null, text: '' });

    // Check if there are any changes
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName === (user.displayName || '')) {
      setSaveMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: trimmedDisplayName || null,
      });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.displayName || user.email}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Member since {formatDate(toDate(user.joinedAt))}</span>
                  {user.verificationStatus === 'approved' && (
                    <div className="flex items-center text-green-600">
                      <CheckBadgeIcon className="h-4 w-4 mr-1" />
                      <span>Verified Resident</span>
                    </div>
                  )}
                  {user.verificationStatus === 'pending' && (
                    <div className="flex items-center text-yellow-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span>Verification Pending</span>
                    </div>
                  )}
                </div>

                {/* Follow Stats */}
                <div className="mt-3">
                  <FollowStats entityId={user.id} entityType="user" className="text-sm" />
                </div>
                {user.address && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>
                      {user.address.street}, {user.address.suburb}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/community/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Post
              </Link>
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
              My Posts ({userPosts.length})
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
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your posts...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map(post => (
                  <div key={post.id} className="relative">
                    <PostCard post={post} />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Link
                        href={`/community/create?edit=${post.id}`}
                        className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-white"
                        title="Edit post"
                      >
                        <PencilIcon className="h-4 w-4 text-gray-600" />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={isDeleting === post.id}
                        className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-white disabled:opacity-50"
                        title="Delete post"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    Share something with the Bellarine Peninsula community!
                  </p>
                  <Link
                    href="/community/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Your First Post
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'liked' && (
          <div>
            <UserLikedPosts userId={user.id} />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <PrivacySettings
              initialSettings={user.privacySettings}
              onSave={async settings => {
                try {
                  await updateUserProfile({
                    privacySettings: settings,
                  });
                  return Promise.resolve();
                } catch (error) {
                  return Promise.reject(error);
                }
              }}
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <NotificationPreferences
              initialPreferences={user.notificationPreferences}
              onSave={async preferences => {
                try {
                  await updateUserProfile({
                    notificationPreferences: preferences,
                  });
                  return Promise.resolve();
                } catch (error) {
                  return Promise.reject(error);
                }
              }}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                    placeholder="Enter your display name"
                    style={{ color: 'black', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-medium"
                    style={{ color: '#222', fontWeight: 500 }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Save Message */}
                {saveMessage.type && (
                  <div
                    className={`p-3 rounded-md ${
                      saveMessage.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Address Verification */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Verification</h2>
              {user.verificationStatus === 'approved' ? (
                <div className="flex items-center text-green-600">
                  <CheckBadgeIcon className="h-5 w-5 mr-2" />
                  <span>Your address has been verified as a Bellarine Peninsula resident</span>
                </div>
              ) : user.verificationStatus === 'pending' ? (
                <div className="text-yellow-600">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <span>Address verification is pending review</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your verification request is being reviewed. You'll receive an email once it's
                    processed.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Verify your Bellarine Peninsula address to access exclusive local content and
                    features.
                  </p>
                  <Link
                    href="/auth/verify-address"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Start Verification
                  </Link>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-6">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sign Out</h3>
                  <p className="text-gray-600 mb-4">Sign out of your account on this device.</p>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
                  <p className="text-gray-600 mb-4">
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                  </p>
                  <button
                    onClick={() =>
                      alert(
                        'Account deletion feature will be implemented with proper confirmation flow'
                      )
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
