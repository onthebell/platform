import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  writeBatch,
  DocumentReference,
  doc,
} from 'firebase/firestore';
import { db } from './config';
import { CommunityPost, PostCategory, User } from '@/types';
import { getUsersByPreference } from './firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export interface PostNotification {
  id?: string;
  type: 'new_post';
  recipientId: string; // User to be notified
  actorId: string; // Post author
  actorName: string;
  postId: string;
  postTitle: string;
  postCategory: PostCategory;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Local type for notification payload
interface NewPostNotification {
  type: 'new_post';
  recipientId: string;
  actorId: string;
  actorName: string;
  postId: string;
  postTitle: string;
  postCategory: PostCategory;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

/**
 * Create notifications for users who have enabled notifications for specific post categories
 */
export async function createPostNotifications(
  authorId: string,
  authorName: string,
  post: CommunityPost
): Promise<void> {
  try {
    // Skip if post doesn't have a valid category
    if (!post.category) {
      console.warn('Post has no category, skipping notifications');
      return;
    }

    // Get users who have enabled notifications for this post category
    const interestedUsers = await getUsersByPreference(post.category);

    // Skip if no users are interested
    if (interestedUsers.length === 0) {
      return;
    }

    // Create batch for better performance with multiple notifications
    const batch = writeBatch(db);
    const notificationsToCreate: { ref: DocumentReference; data: NewPostNotification }[] = [];

    // Create a notification for each interested user
    for (const user of interestedUsers) {
      // Don't notify the author about their own post
      if (user.id === authorId) {
        continue;
      }

      // Check user's verification status if the post is for verified users only
      if (post.visibility === 'verified_only' && !user.isVerified) {
        continue;
      }

      const notification: NewPostNotification = {
        type: 'new_post',
        recipientId: user.id,
        actorId: authorId,
        actorName: authorName,
        postId: post.id,
        postTitle: post.title,
        postCategory: post.category,
        message: `${authorName} posted a new ${post.category} post: ${post.title}`,
        isRead: false,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const notificationRef = doc(collection(db, NOTIFICATIONS_COLLECTION));
      notificationsToCreate.push({ ref: notificationRef, data: notification });

      // Firestore has a limit of 500 operations per batch
      if (notificationsToCreate.length >= 450) {
        // Add all notifications to the batch
        notificationsToCreate.forEach(item => {
          batch.set(item.ref, item.data);
        });

        // Commit the batch
        await batch.commit();

        // Reset for next batch
        notificationsToCreate.length = 0;
      }
    }

    // Commit any remaining notifications
    if (notificationsToCreate.length > 0) {
      notificationsToCreate.forEach(item => {
        batch.set(item.ref, item.data);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error creating post notifications:', error);
  }
}

/**
 * Get users who have enabled notifications for a specific post category
 */
export async function getUsersInterestedInCategory(category: PostCategory): Promise<User[]> {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'users'),
      where(`notificationPreferences.newPosts.${category}`, '==', true)
    )
  );

  return querySnapshot.docs.map(
    doc =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as User
  );
}
