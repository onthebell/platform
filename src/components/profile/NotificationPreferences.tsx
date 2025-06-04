'use client';

import { useState } from 'react';
import { User, PostCategory } from '@/types';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

interface NotificationPreferencesProps {
  initialPreferences: User['notificationPreferences'];
  onSave: (preferences: User['notificationPreferences']) => Promise<void>;
}

const CATEGORY_LABELS: Record<PostCategory, string> = {
  deals: 'Local Deals & Discounts',
  events: 'Events & Gatherings',
  marketplace: 'Marketplace Items',
  free_items: 'Free Items',
  help_requests: 'Help Requests',
  community: 'Community Posts',
  food: 'Food & Dining',
  services: 'Local Services',
  jobs: 'Job Opportunities',
  offers: 'Special Offers',
  announcements: 'Announcements',
  sales: 'Sales',
};

// Helper for all post categories
const ALL_POST_CATEGORIES: PostCategory[] = [
  'deals',
  'events',
  'marketplace',
  'free_items',
  'help_requests',
  'community',
  'food',
  'services',
  'jobs',
  'offers',
  'announcements',
  'sales',
];

export default function NotificationPreferences({
  initialPreferences,
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<User['notificationPreferences']>(
    initialPreferences || {
      newPosts: Object.fromEntries(ALL_POST_CATEGORIES.map(cat => [cat, true])) as Record<
        PostCategory,
        boolean
      >,
      likes: true,
      comments: true,
      follows: true,
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
  }>({
    type: null,
    text: '',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(preferences);
      setSaveMessage({ type: 'success', text: 'Notification preferences updated successfully' });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to update notification preferences',
      });
    } finally {
      setIsSaving(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveMessage({ type: null, text: '' });
      }, 5000);
    }
  };

  const handleToggleAll = (section: 'newPosts', value: boolean) => {
    if (section === 'newPosts') {
      setPreferences(prev => ({
        newPosts: Object.fromEntries(ALL_POST_CATEGORIES.map(cat => [cat, value])) as Record<
          PostCategory,
          boolean
        >,
        likes: prev?.likes ?? true,
        comments: prev?.comments ?? true,
        follows: prev?.follows ?? true,
      }));
    }
  };

  const toggleCategory = (category: PostCategory) => {
    setPreferences(prev => {
      const current = prev ?? {
        newPosts: Object.fromEntries(ALL_POST_CATEGORIES.map(cat => [cat, true])) as Record<
          PostCategory,
          boolean
        >,
        likes: true,
        comments: true,
        follows: true,
      };
      return {
        ...current,
        newPosts: {
          ...ALL_POST_CATEGORIES.reduce(
            (acc, cat) => {
              acc[cat] = current.newPosts[cat] ?? true;
              return acc;
            },
            {} as Record<PostCategory, boolean>
          ),
          [category]: !current.newPosts[category],
        },
      };
    });
  };

  const togglePreference = (key: 'likes' | 'comments' | 'follows') => {
    setPreferences(prev => {
      const current = prev ?? {
        newPosts: Object.fromEntries(ALL_POST_CATEGORIES.map(cat => [cat, true])) as Record<
          PostCategory,
          boolean
        >,
        likes: true,
        comments: true,
        follows: true,
      };
      return {
        ...current,
        [key]: !current[key],
      };
    });
  };

  // Check if all post categories are enabled or disabled
  const allPostsEnabled = preferences?.newPosts
    ? Object.values(preferences.newPosts).every(value => value === true)
    : true;

  const allPostsDisabled = preferences?.newPosts
    ? Object.values(preferences.newPosts).every(value => value === false)
    : false;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
        <BellIcon className="h-6 w-6 mr-2 text-blue-500" />
        Notification Preferences
      </h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">Choose which notifications you want to receive</p>

        {saveMessage.type && (
          <div
            className={`mb-4 p-3 rounded ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {saveMessage.text}
          </div>
        )}
      </div>

      {/* New Posts Notifications */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg text-gray-900">New Post Notifications</h3>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => handleToggleAll('newPosts', true)}
              disabled={allPostsEnabled}
              className={`px-2 py-1 text-xs rounded-md ${
                allPostsEnabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => handleToggleAll('newPosts', false)}
              disabled={allPostsDisabled}
              className={`px-2 py-1 text-xs rounded-md ${
                allPostsDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Disable All
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3">
          Get notified when new posts are created in these categories
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <div
              key={category}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span className="text-gray-700">{label}</span>
              <button
                type="button"
                onClick={() => toggleCategory(category as PostCategory)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  (preferences?.newPosts?.[category as PostCategory] ?? true)
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full transform transition-transform duration-300 ${
                    (preferences?.newPosts?.[category as PostCategory] ?? true)
                      ? 'translate-x-4'
                      : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Notifications */}
      <div className="mb-6">
        <h3 className="font-medium text-lg mb-2 text-gray-900">Interaction Notifications</h3>
        <p className="text-gray-500 text-sm mb-3">
          Get notified when others interact with your content
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">When someone likes your post</span>
            <button
              type="button"
              onClick={() => togglePreference('likes')}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                (preferences?.likes ?? true) ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full transform transition-transform duration-300 ${
                  (preferences?.likes ?? true) ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">When someone comments on your post</span>
            <button
              type="button"
              onClick={() => togglePreference('comments')}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                (preferences?.comments ?? true) ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full transform transition-transform duration-300 ${
                  (preferences?.comments ?? true) ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-gray-700">When someone follows you</span>
            <button
              type="button"
              onClick={() => togglePreference('follows')}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                (preferences?.follows ?? true) ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full transform transition-transform duration-300 ${
                  (preferences?.follows ?? true) ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
