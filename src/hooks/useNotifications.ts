'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth';
import { getUserNotifications, markNotificationAsRead } from '@/lib/firebase/firestore';
import { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);

      const unread = userNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh notifications every 30 seconds when user is authenticated
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
