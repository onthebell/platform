import { collection, query, where, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Delete all user data from Firestore and Storage
 * This includes user profile, posts, comments, likes, follows, notifications, etc.
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    // Create a batch to handle Firestore deletions
    const batch = writeBatch(db);

    // 1. Delete user profile
    const userRef = doc(db, 'users', userId);
    batch.delete(userRef);

    // 2. Delete user's posts
    const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userId));
    const postsSnapshot = await getDocs(postsQuery);

    const postIds: string[] = [];
    postsSnapshot.forEach(postDoc => {
      postIds.push(postDoc.id);
      batch.delete(postDoc.ref);
    });

    // 3. Delete user's comments
    const commentsQuery = query(collection(db, 'comments'), where('authorId', '==', userId));
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach(commentDoc => {
      batch.delete(commentDoc.ref);
    });

    // 4. Delete user's likes
    const likesQuery = query(collection(db, 'likes'), where('userId', '==', userId));
    const likesSnapshot = await getDocs(likesQuery);
    likesSnapshot.forEach(likeDoc => {
      batch.delete(likeDoc.ref);
    });

    // 5. Delete follow relationships where user is following or being followed
    const followingQuery = query(collection(db, 'follows'), where('followerId', '==', userId));
    const followingSnapshot = await getDocs(followingQuery);
    followingSnapshot.forEach(followDoc => {
      batch.delete(followDoc.ref);
    });

    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId),
      where('followingType', '==', 'user')
    );
    const followersSnapshot = await getDocs(followersQuery);
    followersSnapshot.forEach(followDoc => {
      batch.delete(followDoc.ref);
    });

    // 6. Delete follow stats
    const followStatsRef = doc(db, 'followStats', userId);
    batch.delete(followStatsRef);

    // 7. Delete user's notifications
    // Notifications they received
    const receivedNotificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId)
    );
    const receivedNotificationsSnapshot = await getDocs(receivedNotificationsQuery);
    receivedNotificationsSnapshot.forEach(notificationDoc => {
      batch.delete(notificationDoc.ref);
    });

    // Notifications they triggered
    const triggeredNotificationsQuery = query(
      collection(db, 'notifications'),
      where('actorId', '==', userId)
    );
    const triggeredNotificationsSnapshot = await getDocs(triggeredNotificationsQuery);
    triggeredNotificationsSnapshot.forEach(notificationDoc => {
      batch.delete(notificationDoc.ref);
    });

    // 8. Delete saved jobs
    const savedJobsQuery = query(collection(db, 'savedJobs'), where('userId', '==', userId));
    const savedJobsSnapshot = await getDocs(savedJobsQuery);
    savedJobsSnapshot.forEach(savedJobDoc => {
      batch.delete(savedJobDoc.ref);
    });

    // 9. Delete address verification requests
    const verificationsQuery = query(
      collection(db, 'verifications'),
      where('userId', '==', userId)
    );
    const verificationsSnapshot = await getDocs(verificationsQuery);
    verificationsSnapshot.forEach(verificationDoc => {
      batch.delete(verificationDoc.ref);
    });

    // 10. Delete content reports made by the user
    const reportsQuery = query(collection(db, 'contentReports'), where('reporterId', '==', userId));
    const reportsSnapshot = await getDocs(reportsQuery);
    reportsSnapshot.forEach(reportDoc => {
      batch.delete(reportDoc.ref);
    });

    // Commit batch Firestore deletions
    await batch.commit();

    // 11. Delete user's storage files
    // User profile images
    const profileImagesRef = ref(storage, `users/${userId}`);
    try {
      const profileImagesResult = await listAll(profileImagesRef);
      await Promise.all(profileImagesResult.items.map(itemRef => deleteObject(itemRef)));
    } catch (storageError) {
      console.warn('No profile images found or error deleting:', storageError);
      // Continue with deletion process
    }

    // Post images
    for (const postId of postIds) {
      const postImagesRef = ref(storage, `posts/${postId}`);
      try {
        const postImagesResult = await listAll(postImagesRef);
        await Promise.all(postImagesResult.items.map(itemRef => deleteObject(itemRef)));
      } catch (storageError) {
        console.warn(`No images found or error deleting for post ${postId}:`, storageError);
        // Continue with deletion process
      }
    }

    // Verification documents
    const verificationDocsRef = ref(storage, `verifications/${userId}`);
    try {
      const verificationDocsResult = await listAll(verificationDocsRef);
      await Promise.all(verificationDocsResult.items.map(itemRef => deleteObject(itemRef)));
    } catch (storageError) {
      console.warn('No verification documents found or error deleting:', storageError);
      // Continue with deletion process
    }

    console.log(`Successfully deleted all data for user ${userId}`);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data');
  }
}
