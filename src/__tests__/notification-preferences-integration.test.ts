// Integration test for notification preferences system
import { filterNotificationsByPreferences } from '@/hooks/useFilteredNotifications';
import { User, Notification, PostCategory } from '@/types';

describe('Notification Preferences Integration', () => {
  const createMockUser = (
    notificationPreferences?: Partial<User['notificationPreferences']>
  ): User => ({
    id: 'test-user',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    isVerified: true,
    verificationStatus: 'approved',
    joinedAt: new Date(),
    lastActive: new Date(),
    role: 'user',
    permissions: [],
    notificationPreferences: notificationPreferences
      ? {
          newPosts: {
            deals: true,
            events: true,
            marketplace: true,
            free_items: true,
            help_requests: true,
            community: true,
            food: true,
            services: true,
            jobs: true,
            ...notificationPreferences.newPosts,
          },
          likes: notificationPreferences.likes ?? true,
          comments: notificationPreferences.comments ?? true,
          follows: notificationPreferences.follows ?? true,
        }
      : undefined,
  });

  const createMockNotifications = (): Notification[] => [
    {
      id: '1',
      userId: 'test-user',
      title: 'New Deal Available',
      message: 'Check out this amazing deal!',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster1',
      actorName: 'Deal Poster',
      postId: 'post1',
      postTitle: 'Amazing Deal on Electronics',
      postCategory: 'deals',
    },
    {
      id: '2',
      userId: 'test-user',
      title: 'New Event',
      message: 'Community event happening soon',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster2',
      actorName: 'Event Organizer',
      postId: 'post2',
      postTitle: 'Community BBQ',
      postCategory: 'events',
    },
    {
      id: '3',
      userId: 'test-user',
      title: 'Marketplace Item',
      message: 'Someone posted an item for sale',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster3',
      actorName: 'Seller',
      postId: 'post3',
      postTitle: 'Bicycle for Sale',
      postCategory: 'marketplace',
    },
    {
      id: '4',
      userId: 'test-user',
      title: 'Free Item Available',
      message: 'Someone is giving away a free item',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster4',
      actorName: 'Giver',
      postId: 'post4',
      postTitle: 'Free Books',
      postCategory: 'free_items',
    },
    {
      id: '5',
      userId: 'test-user',
      title: 'Help Request',
      message: 'Someone needs help in the community',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster5',
      actorName: 'Helper Seeker',
      postId: 'post5',
      postTitle: 'Need Help Moving',
      postCategory: 'help_requests',
    },
    {
      id: '6',
      userId: 'test-user',
      title: 'Community Discussion',
      message: 'New community discussion started',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster6',
      actorName: 'Community Member',
      postId: 'post6',
      postTitle: 'Local Park Cleanup',
      postCategory: 'community',
    },
    {
      id: '7',
      userId: 'test-user',
      title: 'Food Related Post',
      message: 'New food-related post',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster7',
      actorName: 'Foodie',
      postId: 'post7',
      postTitle: 'Restaurant Recommendation',
      postCategory: 'food',
    },
    {
      id: '8',
      userId: 'test-user',
      title: 'Service Offered',
      message: 'Someone is offering a service',
      type: 'new_post',
      isRead: false,
      createdAt: new Date(),
      actorId: 'poster8',
      actorName: 'Service Provider',
      postId: 'post8',
      postTitle: 'Gardening Services',
      postCategory: 'services',
    },
    {
      id: '9',
      userId: 'test-user',
      title: 'Someone liked your post',
      message: 'Your post received a like',
      type: 'like',
      isRead: false,
      createdAt: new Date(),
      actorId: 'liker1',
      actorName: 'Post Liker',
      postId: 'post9',
    },
    {
      id: '10',
      userId: 'test-user',
      title: 'Someone commented on your post',
      message: 'Your post received a comment',
      type: 'comment',
      isRead: false,
      createdAt: new Date(),
      actorId: 'commenter1',
      actorName: 'Commenter',
      postId: 'post10',
      commentId: 'comment1',
    },
    {
      id: '11',
      userId: 'test-user',
      title: 'New Follower',
      message: 'Someone started following you',
      type: 'follow',
      isRead: false,
      createdAt: new Date(),
      actorId: 'follower1',
      actorName: 'New Follower',
    },
  ];

  describe('Default behavior (no preferences set)', () => {
    test('should show all notifications when user has no preferences', () => {
      const user = createMockUser(); // No preferences
      const notifications = createMockNotifications();

      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      expect(filtered).toHaveLength(11);
      expect(filtered.map(n => n.id)).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
      ]);
    });
  });

  describe('Selective preferences', () => {
    test('should filter notifications based on specific preferences', () => {
      const user = createMockUser({
        newPosts: {
          deals: true,
          events: true,
          marketplace: false, // Disabled
          free_items: true,
          help_requests: false, // Disabled
          community: true,
          food: false, // Disabled
          services: false, // Disabled
          jobs: true,
        },
        likes: true,
        comments: false, // Disabled
        follows: true,
      });

      const notifications = createMockNotifications();
      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should include: deals(1), events(2), free_items(4), community(6), like(9), follow(11)
      // Should exclude: marketplace(3), help_requests(5), food(7), services(8), comment(10)
      expect(filtered).toHaveLength(6);
      expect(filtered.map(n => n.id)).toEqual(['1', '2', '4', '6', '9', '11']);
    });

    test('should handle partial preferences (only some categories specified)', () => {
      const user = createMockUser({
        newPosts: {
          deals: false, // Only this one disabled
          events: true,
          marketplace: true,
          free_items: true,
          help_requests: true,
          community: true,
          food: true,
          services: true,
          jobs: true,
        },
        // likes, comments, follows not specified - should default to true
      });

      const notifications = createMockNotifications();
      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should exclude only deals(1)
      expect(filtered).toHaveLength(10);
      expect(filtered.map(n => n.id)).toEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
    });

    test('should handle all notifications disabled', () => {
      const user = createMockUser({
        newPosts: {
          deals: false,
          events: false,
          marketplace: false,
          free_items: false,
          help_requests: false,
          community: false,
          food: false,
          services: false,
          jobs: false,
        },
        likes: false,
        comments: false,
        follows: false,
      });

      const notifications = createMockNotifications();
      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should filter out all notifications
      expect(filtered).toHaveLength(0);
    });

    test('should handle edge cases with undefined post categories', () => {
      const user = createMockUser({
        newPosts: {
          deals: false,
          events: true,
          marketplace: true,
          free_items: true,
          help_requests: true,
          community: true,
          food: true,
          services: true,
          jobs: true,
        },
        likes: true,
        comments: true,
        follows: true,
      });

      const notifications: Notification[] = [
        {
          id: '1',
          userId: 'test-user',
          title: 'Post without category',
          message: 'This is a new post notification without a category',
          type: 'new_post',
          isRead: false,
          createdAt: new Date(),
          actorId: 'poster1',
          actorName: 'Poster',
          postId: 'post1',
          postTitle: 'Uncategorized Post',
          // postCategory intentionally undefined
        },
        {
          id: '2',
          userId: 'test-user',
          title: 'System notification',
          message: 'This is a system notification',
          type: 'info',
          isRead: false,
          createdAt: new Date(),
        },
      ];

      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should include both - undefined category defaults to true, and system notifications are always shown
      expect(filtered).toHaveLength(2);
      expect(filtered.map(n => n.id)).toEqual(['1', '2']);
    });
  });

  describe('Real-world scenarios', () => {
    test('should work for a user who only wants marketplace and event notifications', () => {
      const user = createMockUser({
        newPosts: {
          deals: false,
          events: true,
          marketplace: true,
          free_items: false,
          help_requests: false,
          community: false,
          food: false,
          services: false,
          jobs: false,
        },
        likes: false,
        comments: false,
        follows: false,
      });

      const notifications = createMockNotifications();
      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should only include events(2) and marketplace(3)
      expect(filtered).toHaveLength(2);
      expect(filtered.map(n => n.id)).toEqual(['2', '3']);
      expect(filtered.every(n => n.type === 'new_post')).toBe(true);
      expect(filtered.every(n => ['events', 'marketplace'].includes(n.postCategory!))).toBe(true);
    });

    test('should work for a user who wants social interactions but no new posts', () => {
      const user = createMockUser({
        newPosts: {
          deals: false,
          events: false,
          marketplace: false,
          free_items: false,
          help_requests: false,
          community: false,
          food: false,
          services: false,
          jobs: false,
        },
        likes: true,
        comments: true,
        follows: true,
      });

      const notifications = createMockNotifications();
      const filtered = filterNotificationsByPreferences(
        notifications,
        user.notificationPreferences
      );

      // Should only include like(9), comment(10), follow(11)
      expect(filtered).toHaveLength(3);
      expect(filtered.map(n => n.id)).toEqual(['9', '10', '11']);
      expect(filtered.every(n => ['like', 'comment', 'follow'].includes(n.type))).toBe(true);
    });
  });
});
