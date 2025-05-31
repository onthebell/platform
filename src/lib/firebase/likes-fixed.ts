import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  increment,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import {
  getCachedLikeCount,
  cacheLikeCount,
  getCachedUserLikeStatus,
  cacheUserLikeStatus,
  invalidatePostCache,
} from './likeCache';

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
      // Check if user has already liked the post
      const likesRef = collection(db, LIKES_COLLECTION);
      const existingLikeQuery = query(
        likesRef,
        where('postId', '==', postId),
        where('userId', '==', userId)
      );

      const existingLikeSnapshot = await getDocs(existingLikeQuery);
      const postRef = doc(db, POSTS_COLLECTION, postId);

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

        return true; // Liked
      }
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    throw new Error('Failed to toggle like');
  }
}

/**
 * Check if a user has liked a specific post (with caching)
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  try {
    // Check cache first
    const cached = getCachedUserLikeStatus(userId, postId);
    if (cached !== null) {
      return cached;
    }

    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(likesRef, where('postId', '==', postId), where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const isLiked = !querySnapshot.empty;

    // Cache the result
    cacheUserLikeStatus(userId, postId, isLiked);

    return isLiked;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    throw new Error('Failed to check like status');
  }
}

/**
 * Get like count for a specific post (with caching)
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  try {
    // Check cache first
    const cachedCount = getCachedLikeCount(postId);
    if (cachedCount !== null) {
      return cachedCount;
    }

    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const data = postDoc.data();
      const likeCount = data.likeCount || 0;

      // Cache the like count
      cacheLikeCount(postId, likeCount);

      return likeCount;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching post like count:', error);
    return 0;
  }
}

/**
 * Get users who liked a specific post
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
    const likes: Like[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      likes.push({
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userDisplayName: data.userDisplayName,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return likes;
  } catch (error) {
    console.error('Error fetching post likes:', error);
    throw new Error('Failed to fetch post likes');
  }
}

/**
 * Get posts liked by a specific user
 */
export async function getUserLikedPosts(
  userId: string,
  limitCount: number = 50
): Promise<string[]> {
  try {
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(
      likesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const likedPostIds: string[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      likedPostIds.push(data.postId);
    });

    return likedPostIds;
  } catch (error) {
    console.error('Error fetching user liked posts:', error);
    throw new Error('Failed to fetch user liked posts');
  }
}

/**
 * Get like analytics for admin dashboard
 */
export async function getLikeAnalytics(days: number = 30): Promise<{
  totalLikes: number;
  likesInPeriod: number;
  topLikedPosts: Array<{ postId: string; likeCount: number; title?: string }>;
  mostActiveLikers: Array<{ userId: string; displayName: string; likeCount: number }>;
}> {
  try {
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const likesRef = collection(db, LIKES_COLLECTION);

    // Get all likes
    const allLikesQuery = query(likesRef);
    const allLikesSnapshot = await getDocs(allLikesQuery);
    const totalLikes = allLikesSnapshot.size;

    // Get likes in period
    const periodQuery = query(likesRef, where('createdAt', '>=', Timestamp.fromDate(periodStart)));
    const periodSnapshot = await getDocs(periodQuery);
    const likesInPeriod = periodSnapshot.size;

    // Aggregate data for analytics
    const postLikeCounts: { [postId: string]: number } = {};
    const userLikeCounts: { [userId: string]: { count: number; displayName: string } } = {};

    allLikesSnapshot.forEach(doc => {
      const data = doc.data();
      const postId = data.postId;
      const userId = data.userId;
      const displayName = data.userDisplayName;

      // Count likes per post
      postLikeCounts[postId] = (postLikeCounts[postId] || 0) + 1;

      // Count likes per user
      if (!userLikeCounts[userId]) {
        userLikeCounts[userId] = { count: 0, displayName };
      }
      userLikeCounts[userId].count++;
    });

    // Get top liked posts
    const topLikedPosts = Object.entries(postLikeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([postId, likeCount]) => ({ postId, likeCount }));

    // Get most active likers
    const mostActiveLikers = Object.entries(userLikeCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([userId, { count, displayName }]) => ({
        userId,
        displayName,
        likeCount: count,
      }));

    return {
      totalLikes,
      likesInPeriod,
      topLikedPosts,
      mostActiveLikers,
    };
  } catch (error) {
    console.error('Error fetching like analytics:', error);
    throw new Error('Failed to fetch like analytics');
  }
}

/**
 * Remove all likes for a specific post (used when deleting posts)
 */
export async function removePostLikes(postId: string): Promise<void> {
  try {
    const likesRef = collection(db, LIKES_COLLECTION);
    const q = query(likesRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);

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
  const postRef = doc(db, POSTS_COLLECTION, postId);

  return onSnapshot(
    postRef,
    (doc: DocumentSnapshot) => {
      if (doc.exists()) {
        const data = doc.data();
        const count = data?.likeCount || 0;

        // Update cache
        cacheLikeCount(postId, count);

        callback(count);
      } else {
        callback(0);
      }
    },
    error => {
      console.error('Error subscribing to post like count:', error);
      callback(0);
    }
  );
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

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot) => {
      const isLiked = !snapshot.empty;

      // Update cache
      cacheUserLikeStatus(userId, postId, isLiked);

      callback(isLiked);
    },
    error => {
      console.error('Error subscribing to user like status:', error);
      callback(false);
    }
  );
}

/**
 * Subscribe to real-time updates of likes for a specific post
 */
export function subscribeToPostLikes(
  postId: string,
  onSnapshotCallback: (likes: Like[]) => void
): () => void {
  const likesRef = collection(db, LIKES_COLLECTION);
  const q = query(likesRef, where('postId', '==', postId), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
    const likes: Like[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      likes.push({
        id: doc.id,
        postId: data.postId,
        userId: data.userId,
        userDisplayName: data.userDisplayName,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    onSnapshotCallback(likes);
  });

  return unsubscribe;
}

/**
 * Subscribe to real-time updates of posts liked by a user
 */
export function subscribeToUserLikedPosts(
  userId: string,
  onSnapshotCallback: (postIds: string[]) => void
): () => void {
  const likesRef = collection(db, LIKES_COLLECTION);
  const q = query(likesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot) => {
    const likedPostIds: string[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      likedPostIds.push(data.postId);
    });

    onSnapshotCallback(likedPostIds);
  });

  return unsubscribe;
}
