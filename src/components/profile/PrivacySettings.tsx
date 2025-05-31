'use client';

import { useState } from 'react';
import { User } from '@/types';
import { useAuth } from '@/lib/firebase/auth';
import PrivacySummary from './PrivacySummary';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface PrivacySettingsProps {
  initialSettings: User['privacySettings'];
  onSave: (settings: User['privacySettings']) => Promise<void>;
}

export default function PrivacySettings({ initialSettings, onSave }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<User['privacySettings']>(
    initialSettings || {
      profileVisibility: 'public',
      allowFollowing: true,
      showInDiscovery: true,
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
      await onSave(settings);
      setSaveMessage({ type: 'success', text: 'Privacy settings updated successfully' });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to update privacy settings',
      });
    } finally {
      setIsSaving(false);

      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveMessage({ type: null, text: '' });
      }, 5000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="font-medium text-gray-700 block mb-2">Profile Visibility</label>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="public"
                checked={settings?.profileVisibility === 'public'}
                onChange={() =>
                  setSettings({
                    profileVisibility: 'public',
                    allowFollowing: settings?.allowFollowing ?? true,
                    showInDiscovery: settings?.showInDiscovery ?? true,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>Public (visible to everyone)</span>
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="verified_only"
                checked={settings?.profileVisibility === 'verified_only'}
                onChange={() =>
                  setSettings({
                    profileVisibility: 'verified_only',
                    allowFollowing: settings?.allowFollowing ?? true,
                    showInDiscovery: settings?.showInDiscovery ?? true,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center">
                <UserGroupIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>Verified Only (visible only to verified Bell residents)</span>
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="private"
                checked={settings?.profileVisibility === 'private'}
                onChange={() =>
                  setSettings({
                    profileVisibility: 'private',
                    allowFollowing: settings?.allowFollowing ?? true,
                    showInDiscovery: settings?.showInDiscovery ?? true,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 flex items-center">
                <EyeSlashIcon className="h-5 w-5 text-gray-500 mr-1" />
                <span>Private (visible only to you)</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="font-medium text-gray-700 flex items-center">
            <input
              type="checkbox"
              checked={settings?.allowFollowing ?? true}
              onChange={e =>
                setSettings(prev =>
                  prev
                    ? { ...prev, allowFollowing: e.target.checked }
                    : {
                        profileVisibility: 'public',
                        allowFollowing: e.target.checked,
                        showInDiscovery: true,
                      }
                )
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
            />
            <span className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-500 mr-1" />
              <span>Allow other users to follow me</span>
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-6">
            When disabled, users won't be able to follow you
          </p>
        </div>

        <div>
          <label className="font-medium text-gray-700 flex items-center">
            <input
              type="checkbox"
              checked={settings?.showInDiscovery ?? true}
              onChange={e =>
                setSettings(prev =>
                  prev
                    ? { ...prev, showInDiscovery: e.target.checked }
                    : {
                        profileVisibility: 'public',
                        allowFollowing: true,
                        showInDiscovery: e.target.checked,
                      }
                )
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
            />
            <span className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-500 mr-1" />
              <span>Show me in user discovery</span>
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-6">
            When enabled, you may appear in suggested users and discovery pages
          </p>
        </div>

        {/* Privacy Summary */}
        <PrivacySummary settings={settings} className="mt-6" />

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {saveMessage.type && (
              <p
                className={`text-sm ${
                  saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {saveMessage.text}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
