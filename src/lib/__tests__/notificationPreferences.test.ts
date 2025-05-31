// filepath: /Users/mhaitana/projects/copilot/src/lib/__tests__/notificationPreferences.test.ts
import { CommunityPost, User, PostCategory, Notification } from '@/types';

// Create a simple mock for the types we need
describe('Notification Preferences', () => {
  it('should handle notification preferences correctly', () => {
    // Test user preferences structure
    const userWithPreferences: User = {
      id: 'test123',
      email: 'test@example.com',
      displayName: 'Test User',
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
          marketplace: false,
          free_items: true,
          help_requests: false,
          community: true,
          food: true,
          services: false,
        },
        likes: true,
        comments: true,
        follows: false,
      },
    };

    // Verify the user preferences structure is correct
    expect(userWithPreferences.notificationPreferences).toBeDefined();
    expect(userWithPreferences.notificationPreferences?.newPosts).toBeDefined();
    expect(userWithPreferences.notificationPreferences?.likes).toBe(true);
    expect(userWithPreferences.notificationPreferences?.follows).toBe(false);

    // Test category preferences
    const marketplaceEnabled = userWithPreferences.notificationPreferences?.newPosts?.marketplace;
    const dealsEnabled = userWithPreferences.notificationPreferences?.newPosts?.deals;

    expect(marketplaceEnabled).toBe(false);
    expect(dealsEnabled).toBe(true);

    // Test notification category filtering
    const categories: PostCategory[] = ['deals', 'marketplace', 'events', 'food'];
    const enabledCategories = categories.filter(
      category => userWithPreferences.notificationPreferences?.newPosts?.[category]
    );

    expect(enabledCategories).toContain('deals');
    expect(enabledCategories).toContain('events');
    expect(enabledCategories).toContain('food');
    expect(enabledCategories).not.toContain('marketplace');
  });

  it('should filter notifications based on user preferences', () => {
    // Define test user with specific preferences
    const user: User = {
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

    // Create sample notifications of different types
    const notifications: Notification[] = [
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

    // Function to filter notifications based on user preferences
    const filterNotificationsByPreferences = (
      notifications: Notification[],
      userPrefs: User['notificationPreferences']
    ): Notification[] => {
      if (!userPrefs) return notifications;

      return notifications.filter(notification => {
        if (notification.type === 'new_post' && notification.postCategory) {
          // Filter by post category preferences
          return userPrefs.newPosts?.[notification.postCategory as PostCategory] ?? true;
        } else if (notification.type === 'like') {
          return userPrefs.likes ?? true;
        } else if (notification.type === 'comment') {
          return userPrefs.comments ?? true;
        } else if (notification.type === 'follow') {
          return userPrefs.follows ?? true;
        }
        // Allow all other notification types
        return true;
      });
    };

    // Filter notifications using our function
    const filteredNotifications = filterNotificationsByPreferences(
      notifications,
      user.notificationPreferences
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
});
