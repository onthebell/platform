'use client';

/**
 * PrivacySummary displays a summary of a user's privacy settings.
 * @param settings - The user's privacy settings object.
 * @param className - Optional CSS class for styling.
 * @returns A summary UI for privacy settings.
 */

import { User } from '@/types';
import {
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PrivacySummaryProps {
  settings: User['privacySettings'];
  className?: string;
}

export default function PrivacySummary({ settings, className = '' }: PrivacySummaryProps) {
  const defaultSettings = {
    profileVisibility: 'public',
    allowFollowing: true,
    showInDiscovery: true,
  };

  const privacySettings = settings || defaultSettings;

  const getProfileVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return {
          text: 'Only you can see your profile',
          icon: EyeSlashIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'verified_only':
        return {
          text: 'Only verified residents can see your profile',
          icon: ShieldCheckIcon,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'public':
      default:
        return {
          text: 'Anyone can see your profile',
          icon: EyeIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
    }
  };

  const profileVis = getProfileVisibilityDescription(privacySettings.profileVisibility);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-gray-500" />
          Your Current Privacy Settings
        </h4>

        <div className="space-y-3">
          {/* Profile Visibility */}
          <div className={`p-3 rounded-md border ${profileVis.bgColor} ${profileVis.borderColor}`}>
            <div className="flex items-start">
              <profileVis.icon
                className={`h-5 w-5 ${profileVis.color} mt-0.5 mr-3 flex-shrink-0`}
              />
              <div>
                <p className={`font-medium ${profileVis.color}`}>Profile Visibility</p>
                <p className="text-sm text-gray-600 mt-1">{profileVis.text}</p>
              </div>
            </div>
          </div>

          {/* Following Settings */}
          <div
            className={`p-3 rounded-md border ${
              privacySettings.allowFollowing
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              <UserGroupIcon
                className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                  privacySettings.allowFollowing ? 'text-green-600' : 'text-red-600'
                }`}
              />
              <div>
                <p
                  className={`font-medium ${
                    privacySettings.allowFollowing ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Following
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {privacySettings.allowFollowing
                    ? 'Other users can follow you'
                    : 'No one can follow you'}
                </p>
              </div>
            </div>
          </div>

          {/* Discovery Settings */}
          <div
            className={`p-3 rounded-md border ${
              privacySettings.showInDiscovery
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start">
              <EyeIcon
                className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                  privacySettings.showInDiscovery ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
              <div>
                <p
                  className={`font-medium ${
                    privacySettings.showInDiscovery ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Discoverability
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {privacySettings.showInDiscovery
                    ? 'You appear in user suggestions and discovery'
                    : "You won't appear in user suggestions"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These settings only affect your profile visibility and
            discoverability. Your posts and comments in public areas will still be visible according
            to community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
