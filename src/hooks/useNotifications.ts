'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { markNotificationAsRead, subscribeToUserNotifications } from '@/lib/firebase/firestore';
import { Notification } from '@/types';

/**
 * Custom hook for real-time user notifications.
 * @returns An object with notifications, loading state, unread count, markAsRead, markAllAsRead, and refetch.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);

      // Mark all unread notifications as read
      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const refreshNotifications = () => {
    // No need to manually refresh - real-time listeners handle this
  };

  // Set up real-time listener
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToUserNotifications(user.id, userNotifications => {
      setNotifications(userNotifications);

      const unread = userNotifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);

      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: refreshNotifications,
  };
}
