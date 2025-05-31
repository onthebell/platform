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

export interface LikeNotification {
  id?: string;
  type: 'like';
  recipientId: string; // Post author
  actorId: string; // User who liked
  actorName: string;
  postId: string;
  postTitle?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Create a notification when a post is liked
 */
export async function createLikeNotification(
  postAuthorId: string,
  likerUserId: string,
  likerName: string,
  postId: string,
  postTitle?: string
): Promise<void> {
  try {
    // Don't create notification if user likes their own post
    if (postAuthorId === likerUserId) {
      return;
    }

    // Check if a recent notification exists for this like (prevent spam)
    const recentNotificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'like'),
      where('recipientId', '==', postAuthorId),
      where('actorId', '==', likerUserId),
      where('postId', '==', postId),
      where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 60000))), // Last minute
      limit(1)
    );

    const recentNotifications = await getDocs(recentNotificationQuery);

    if (!recentNotifications.empty) {
      // Recent notification exists, don't create another
      return;
    }

    const notification: Omit<LikeNotification, 'id'> = {
      type: 'like',
      recipientId: postAuthorId,
      actorId: likerUserId,
      actorName: likerName,
      postId,
      postTitle,
      message: `${likerName} liked your post${postTitle ? ` "${postTitle}"` : ''}`,
      isRead: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notification,
      createdAt: Timestamp.fromDate(notification.createdAt),
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Create a notification when a post is unliked (optional - usually not needed)
 */
export async function removeLikeNotification(
  postAuthorId: string,
  likerUserId: string,
  postId: string
): Promise<void> {
  try {
    // Find and remove the like notification
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'like'),
      where('recipientId', '==', postAuthorId),
      where('actorId', '==', likerUserId),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const notifications = await getDocs(notificationQuery);

    if (!notifications.empty) {
      // Remove the most recent like notification
      const notificationDoc = notifications.docs[0];
      await deleteDoc(notificationDoc.ref);
    }
  } catch (error) {
    console.error('Error removing like notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Get like notifications for a user
 */
export async function getUserLikeNotifications(
  userId: string,
  limitCount: number = 20
): Promise<LikeNotification[]> {
  try {
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'like'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const notifications = await getDocs(notificationQuery);

    return notifications.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as LikeNotification[];
  } catch (error) {
    console.error('Error fetching like notifications:', error);
    return [];
  }
}
