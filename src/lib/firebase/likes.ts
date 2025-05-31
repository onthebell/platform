import {
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import {
  getCachedLikeCount,
  cacheLikeCount,
  getCachedUserLikeStatus,
  cacheUserLikeStatus,
  invalidatePostCache,
} from './likeCache';
import { createLikeNotification, removeLikeNotification } from './likeNotifications';

const LIKES_COLLECTION = 'likes';
const POSTS_COLLECTION = 'posts';

export interface Like {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  createdAt: Date;
}

/**
 * Toggle like status for a post by a user
 * Returns the new like status (true if liked, false if unliked)
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  userDisplayName: string
): Promise<boolean> {
  try {
    return await runTransaction(db, async transaction => {
      // Get post data for notifications
      const postRef = doc(db, POSTS_COLLECTION, postId);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data();
      const postAuthorId = postData.authorId;
      const postTitle = postData.title;

      // Check if user has already liked the post
      const likesRef = collection(db, LIKES_COLLECTION);
      const existingLikeQuery = query(
        likesRef,
        where('postId', '==', postId),
        where('userId', '==', userId)
      );

      const existingLikeSnapshot = await getDocs(existingLikeQuery);

      if (!existingLikeSnapshot.empty) {
        // User has already liked, so unlike
        const likeDoc = existingLikeSnapshot.docs[0];
        transaction.delete(doc(db, LIKES_COLLECTION, likeDoc.id));

        // Decrement like count on post
        transaction.update(postRef, {
          likeCount: increment(-1),
        });

        // Invalidate cache
        invalidatePostCache(postId);

        // Remove like notification (optional)
        await removeLikeNotification(postAuthorId, userId, postId);

        return false; // Unliked
      } else {
        // User hasn't liked, so add like
        const newLikeRef = doc(collection(db, LIKES_COLLECTION));
        transaction.set(newLikeRef, {
          postId,
          userId,
          userDisplayName,
          createdAt: Timestamp.fromDate(new Date()),
        });

        // Increment like count on post
        transaction.update(postRef, {
          likeCount: increment(1),
        });

        // Invalidate cache
        invalidatePostCache(postId);

        // Create like notification
        await createLikeNotification(postAuthorId, userId, userDisplayName, postId, postTitle);

        return true; // Liked
      }
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw new Error('Failed to toggle like');
  }
}

/**
 * Check if a user has liked a post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  try {
    // Check cache first
    const cached = getCachedUserLikeStatus(postId, userId);
    if (cached !== null) {
      return cached;
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('postId', '==', postId),
      where('userId', '==', userId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    const liked = !querySnapshot.empty;

    // Cache the result
    cacheUserLikeStatus(postId, userId, liked);

    return liked;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
}

/**
 * Get the like count for a post
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  try {
    // Check cache first
    const cached = getCachedLikeCount(postId);
    if (cached !== null) {
      return cached;
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(likesRef, where('postId', '==', postId));

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    // Cache the result
    cacheLikeCount(postId, count);

    return count;
  } catch (error) {
    console.error('Error fetching post like count:', error);
    return 0;
  }
}

/**
 * Get all likes for a post with user details
 */
export async function getPostLikes(postId: string, limitCount: number = 50): Promise<Like[]> {
  try {
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userDisplayName: data.userDisplayName,
        createdAt: data.createdAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching post likes:', error);
    return [];
  }
}

/**
 * Get posts that a user has liked
 */
export async function getUserLikedPosts(userId: string, limitCount: number = 50): Promise<Like[]> {
  try {
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userDisplayName: data.userDisplayName,
        createdAt: data.createdAt.toDate(),
      };
    });
  } catch (error) {
    console.error('Error fetching user liked posts:', error);
    return [];
  }
}

/**
 * Remove all likes for a post (used when deleting posts)
 */
export async function removePostLikes(postId: string): Promise<void> {
  try {
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(likesRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);

    // Delete all likes for this post
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

    await Promise.all(deletePromises);

    // Invalidate cache
    invalidatePostCache(postId);
  } catch (error) {
    console.error('Error removing post likes:', error);
    throw new Error('Failed to remove post likes');
  }
}

/**
 * Subscribe to real-time like count updates for a post
 */
export function subscribeToPostLikeCount(
  postId: string,
  callback: (count: number) => void
): () => void {
  const likesRef = collection(db, LIKES_COLLECTION);
  const q = query(likesRef, where('postId', '==', postId));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const count = snapshot.size;
      // Update cache
      cacheLikeCount(postId, count);
      callback(count);
    },
    error => {
      console.error('Error in like count subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time user like status for a post
 */
export function subscribeToUserLikeStatus(
  postId: string,
  userId: string,
  callback: (isLiked: boolean) => void
): () => void {
  const likesRef = collection(db, LIKES_COLLECTION);
  const q = query(likesRef, where('postId', '==', postId), where('userId', '==', userId));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const isLiked = !snapshot.empty;
      // Update cache
      cacheUserLikeStatus(postId, userId, isLiked);
      callback(isLiked);
    },
    error => {
      console.error('Error in user like status subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time user liked posts updates
 */
export function subscribeToUserLikedPosts(
  userId: string,
  callback: (likedPostIds: string[]) => void
): () => void {
  const likesRef = collection(db, LIKES_COLLECTION);
  const q = query(likesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const postIds = snapshot.docs.map(doc => doc.data().postId);
      callback(postIds);
    },
    error => {
      console.error('Error in user liked posts subscription:', error);
    }
  );

  return unsubscribe;
}

// Analytics types
export interface LikeAnalytics {
  totalLikes: number;
  likesInPeriod: number;
  topLikedPosts: Array<{
    postId: string;
    postTitle: string;
    likeCount: number;
  }>;
  mostActiveLikers: Array<{
    userId: string;
    userDisplayName: string;
    likeCount: number;
  }>;
  dailyLikeCounts: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Get like analytics for admin dashboard
 */
export async function getLikeAnalytics(days: number = 30): Promise<LikeAnalytics> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const likesRef = collection(db, LIKES_COLLECTION);

    // Get total likes
    const totalLikesQuery = query(likesRef);
    const totalLikesSnapshot = await getDocs(totalLikesQuery);
    const totalLikes = totalLikesSnapshot.size;

    // Get likes in the specified period
    const periodLikesQuery = query(
      likesRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );
    const periodLikesSnapshot = await getDocs(periodLikesQuery);
    const likesInPeriod = periodLikesSnapshot.size;

    // Get most active likers
    const likerCounts = new Map<string, { name: string; count: number }>();
    periodLikesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const current = likerCounts.get(data.userId) || { name: data.userDisplayName, count: 0 };
      likerCounts.set(data.userId, { ...current, count: current.count + 1 });
    });

    const mostActiveLikers = Array.from(likerCounts.entries())
      .map(([userId, data]) => ({
        userId,
        userDisplayName: data.name,
        likeCount: data.count,
      }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10);

    // Get top liked posts
    const postLikeCounts = new Map<string, number>();
    periodLikesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      postLikeCounts.set(data.postId, (postLikeCounts.get(data.postId) || 0) + 1);
    });

    // Get post details for top liked posts
    const topPostIds = Array.from(postLikeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([postId]) => postId);

    const topLikedPosts = await Promise.all(
      topPostIds.map(async postId => {
        try {
          const postDoc = await getDoc(doc(db, POSTS_COLLECTION, postId));
          return {
            postId,
            postTitle: postDoc.exists() ? postDoc.data().title : 'Unknown Post',
            likeCount: postLikeCounts.get(postId) || 0,
          };
        } catch (error) {
          return {
            postId,
            postTitle: 'Unknown Post',
            likeCount: postLikeCounts.get(postId) || 0,
          };
        }
      })
    );

    // Calculate daily like counts
    const dailyLikeCounts = new Map<string, number>();
    periodLikesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
      dailyLikeCounts.set(dateStr, (dailyLikeCounts.get(dateStr) || 0) + 1);
    });

    const dailyLikeCountsArray = Array.from(dailyLikeCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalLikes,
      likesInPeriod,
      topLikedPosts,
      mostActiveLikers,
      dailyLikeCounts: dailyLikeCountsArray,
    };
  } catch (error) {
    console.error('Error fetching like analytics:', error);
    throw new Error('Failed to fetch like analytics');
  }
}
