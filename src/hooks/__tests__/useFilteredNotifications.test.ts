import { renderHook } from '@testing-library/react';
import { filterNotificationsByPreferences } from '../useFilteredNotifications';
import { Notification, User } from '@/types';

// Mock user with specific preferences
const mockUser: User = {
  id: 'user1',
  email: 'user1@example.com',
  displayName: 'User 1',
  photoURL: null,
  isVerified: true,
  verificationStatus: 'approved',
  joinedAt: new Date(),
  lastActive: new Date(),
  role: 'user',
  permissions: [],
  notificationPreferences: {
    newPosts: {
      deals: true,
      events: true,
      marketplace: false, // User doesn't want marketplace notifications
      free_items: true,
      help_requests: false, // User doesn't want help request notifications
      community: true,
      food: true,
      services: false, // User doesn't want services notifications
    },
    likes: true,
    comments: true,
    follows: false, // User doesn't want follow notifications
  },
};

// Mock notifications of different types
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'New Deal',
    message: 'New deal posted',
    type: 'new_post',
    isRead: false,
    createdAt: new Date(),
    actorId: 'poster1',
    actorName: 'Poster 1',
    postId: 'post1',
    postTitle: 'Great Deal',
    postCategory: 'deals',
  },
  {
    id: '2',
    userId: 'user1',
    title: 'New Marketplace Item',
    message: 'New marketplace item posted',
    type: 'new_post',
    isRead: false,
    createdAt: new Date(),
    actorId: 'poster2',
    actorName: 'Poster 2',
    postId: 'post2',
    postTitle: 'Selling Bike',
    postCategory: 'marketplace',
  },
  {
    id: '3',
    userId: 'user1',
    title: 'New Follow',
    message: 'Someone followed you',
    type: 'follow',
    isRead: false,
    createdAt: new Date(),
    actorId: 'follower1',
    actorName: 'Follower 1',
  },
  {
    id: '4',
    userId: 'user1',
    title: 'New Like',
    message: 'Someone liked your post',
    type: 'like',
    isRead: false,
    createdAt: new Date(),
    actorId: 'liker1',
    actorName: 'Liker 1',
    postId: 'post3',
  },
];

describe('useFilteredNotifications', () => {
  describe('filterNotificationsByPreferences', () => {
    it('should filter notifications based on user preferences', () => {
      // Filter notifications using our function
      const filteredNotifications = filterNotificationsByPreferences(
        mockNotifications,
        mockUser.notificationPreferences
      );

      // Should include deals notification (id: 1)
      // Should exclude marketplace notification (id: 2)
      // Should exclude follow notification (id: 3)
      // Should include like notification (id: 4)
      expect(filteredNotifications).toHaveLength(2);
      expect(filteredNotifications.map(n => n.id)).toContain('1');
      expect(filteredNotifications.map(n => n.id)).not.toContain('2');
      expect(filteredNotifications.map(n => n.id)).not.toContain('3');
      expect(filteredNotifications.map(n => n.id)).toContain('4');
    });

    it('should return all notifications if user has no preferences', () => {
      const userWithoutPrefs = { ...mockUser, notificationPreferences: undefined };

      const filteredNotifications = filterNotificationsByPreferences(
        mockNotifications,
        userWithoutPrefs.notificationPreferences
      );

      // Should include all notifications when no preferences are set
      expect(filteredNotifications).toHaveLength(4);
    });

    it('should handle empty notification list', () => {
      const filteredNotifications = filterNotificationsByPreferences(
        [],
        mockUser.notificationPreferences
      );

      expect(filteredNotifications).toHaveLength(0);
    });
  });
});
