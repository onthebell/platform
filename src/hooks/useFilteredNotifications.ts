'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, PostCategory } from '@/types';

/**
 * Hook to get filtered notifications based on user preferences
 */
export function useFilteredNotifications() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filteredUnreadCount, setFilteredUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || loading) {
      setFilteredNotifications([]);
      setFilteredUnreadCount(0);
      return;
    }

    // Filter notifications based on user preferences
    const filtered = filterNotificationsByPreferences(notifications, user.notificationPreferences);
    setFilteredNotifications(filtered);

    // Count unread filtered notifications
    const unreadFiltered = filtered.filter(notification => !notification.isRead).length;
    setFilteredUnreadCount(unreadFiltered);
  }, [notifications, user, loading]);

  return {
    notifications: filteredNotifications,
    loading,
    unreadCount: filteredUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Filter notifications based on user notification preferences
 */
import { User } from '@/types'; // Make sure User type is imported if not already

export function filterNotificationsByPreferences(
  notifications: Notification[],
  userPrefs: User['notificationPreferences'] | undefined
): Notification[] {
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
}
