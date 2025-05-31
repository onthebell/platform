import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

const NOTIFICATIONS_COLLECTION = 'notifications';

export interface FollowNotification {
  id?: string;
  type: 'follow';
  recipientId: string; // User being followed
  actorId: string; // User who followed
  actorName: string;
  followingType: 'user' | 'business';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Create a notification when someone follows a user
 */
export async function createFollowNotification(
  followedUserId: string,
  followerUserId: string,
  followerName: string,
  followingType: 'user' | 'business' = 'user'
): Promise<void> {
  try {
    // Don't create notification if user follows themselves
    if (followedUserId === followerUserId) {
      return;
    }

    // Check if a recent notification exists for this follow (prevent spam)
    const recentNotificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'follow'),
      where('recipientId', '==', followedUserId),
      where('actorId', '==', followerUserId),
      where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 60000))), // Last minute
      limit(1)
    );

    const recentNotifications = await getDocs(recentNotificationQuery);

    if (!recentNotifications.empty) {
      // Recent notification exists, don't create another
      return;
    }

    const notification: Omit<FollowNotification, 'id'> = {
      type: 'follow',
      recipientId: followedUserId,
      actorId: followerUserId,
      actorName: followerName,
      followingType,
      message: `${followerName} started following you`,
      isRead: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notification,
      createdAt: Timestamp.fromDate(notification.createdAt),
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Remove follow notification when someone unfollows a user
 */
export async function removeFollowNotification(
  followedUserId: string,
  followerUserId: string
): Promise<void> {
  try {
    // Find and remove the follow notification
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'follow'),
      where('recipientId', '==', followedUserId),
      where('actorId', '==', followerUserId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const notifications = await getDocs(notificationQuery);

    if (!notifications.empty) {
      // Remove the most recent follow notification
      const notificationDoc = notifications.docs[0];
      await deleteDoc(notificationDoc.ref);
    }
  } catch (error) {
    console.error('Error removing follow notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Get follow notifications for a user
 */
export async function getUserFollowNotifications(
  userId: string,
  limitCount: number = 20
): Promise<FollowNotification[]> {
  try {
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'follow'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const notifications = await getDocs(notificationQuery);

    return notifications.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FollowNotification[];
  } catch (error) {
    console.error('Error fetching follow notifications:', error);
    return [];
  }
}
