/**
 * Helper function to check if a user can view another user's profile based on privacy settings
 */
export function canViewUserProfile(
  viewer: { id: string; isVerified?: boolean } | null,
  targetUser: {
    id: string;
    privacySettings?: { profileVisibility: 'public' | 'verified_only' | 'private' };
  }
): { canView: boolean; reason?: string } {
  // Always allow users to view their own profile
  if (viewer && viewer.id === targetUser.id) {
    return { canView: true };
  }

  // Check profile visibility settings
  if (!targetUser.privacySettings) {
    // Default to public if no privacy settings
    return { canView: true };
  }

  switch (targetUser.privacySettings.profileVisibility) {
    case 'private':
      return { canView: false, reason: 'This profile is private' };

    case 'verified_only':
      if (!viewer || !viewer.isVerified) {
        return { canView: false, reason: 'This profile is only visible to verified residents' };
      }
      return { canView: true };

    case 'public':
    default:
      return { canView: true };
  }
}
