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

export interface CommentNotification {
  id?: string;
  type: 'comment';
  recipientId: string; // Post author
  actorId: string; // User who commented
  actorName: string;
  postId: string;
  postTitle?: string;
  commentId: string;
  commentPreview: string; // First 50 chars of comment
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Create a notification when someone comments on a post
 */
export async function createCommentNotification(
  postAuthorId: string,
  commenterUserId: string,
  commenterName: string,
  postId: string,
  commentId: string,
  commentContent: string,
  postTitle?: string
): Promise<void> {
  try {
    // Don't create notification if user comments on their own post
    if (postAuthorId === commenterUserId) {
      return;
    }

    // Check if a recent notification exists for this comment (prevent spam)
    const recentNotificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'comment'),
      where('recipientId', '==', postAuthorId),
      where('actorId', '==', commenterUserId),
      where('postId', '==', postId),
      where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 300000))), // Last 5 minutes
      limit(1)
    );

    const recentNotifications = await getDocs(recentNotificationQuery);

    if (!recentNotifications.empty) {
      // Recent notification exists, don't create another
      return;
    }

    const commentPreview =
      commentContent.length > 50 ? commentContent.substring(0, 50) + '...' : commentContent;

    const notification: Omit<CommentNotification, 'id'> = {
      type: 'comment',
      recipientId: postAuthorId,
      actorId: commenterUserId,
      actorName: commenterName,
      postId,
      postTitle,
      commentId,
      commentPreview,
      message: `${commenterName} commented on your post${postTitle ? ` "${postTitle}"` : ''}: "${commentPreview}"`,
      isRead: false,
      createdAt: new Date(),
    };

    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notification,
      createdAt: Timestamp.fromDate(notification.createdAt),
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Remove comment notification when a comment is deleted
 */
export async function removeCommentNotification(
  postAuthorId: string,
  commenterUserId: string,
  postId: string,
  commentId: string
): Promise<void> {
  try {
    // Find and remove the comment notification
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'comment'),
      where('recipientId', '==', postAuthorId),
      where('actorId', '==', commenterUserId),
      where('postId', '==', postId),
      where('commentId', '==', commentId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const notifications = await getDocs(notificationQuery);

    if (!notifications.empty) {
      // Remove the notification
      const notificationDoc = notifications.docs[0];
      await deleteDoc(notificationDoc.ref);
    }
  } catch (error) {
    console.error('Error removing comment notification:', error);
    // Don't throw error - notifications are non-critical
  }
}

/**
 * Get comment notifications for a user
 */
export async function getUserCommentNotifications(
  userId: string,
  limitCount: number = 20
): Promise<CommentNotification[]> {
  try {
    const notificationQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('type', '==', 'comment'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const notifications = await getDocs(notificationQuery);

    return notifications.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as CommentNotification[];
  } catch (error) {
    console.error('Error fetching comment notifications:', error);
    return [];
  }
}
