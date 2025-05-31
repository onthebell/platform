import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Comment } from '@/types';
import { createCommentNotification, removeCommentNotification } from './commentNotifications';
import { getPost } from './firestore';

const COMMENTS_COLLECTION = 'comments';

/**
 * Add a new comment to a post
 */
export async function addComment(
  postId: string,
  authorId: string,
  authorName: string,
  content: string
): Promise<string> {
  try {
    const commentData = {
      postId,
      authorId,
      authorName,
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);

    // Create notification for the post author (async, non-blocking)
    try {
      const post = await getPost(postId);
      if (post && post.authorId !== authorId) {
        await createCommentNotification(
          post.authorId,
          authorId,
          authorName,
          postId,
          docRef.id,
          content.trim(),
          post.title
        );
      }
    } catch (notificationError) {
      console.warn('Failed to create comment notification:', notificationError);
      // Don't fail the comment creation if notification fails
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

/**
 * Get all comments for a specific post
 */
export async function getPostComments(postId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(commentsRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        postId: data.postId,
        authorId: data.authorId,
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isEdited: data.isEdited || false,
      });
    });

    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(commentId: string, content: string): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      content: content.trim(),
      updatedAt: serverTimestamp(),
      isEdited: true,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('Failed to update comment');
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);

    // Get comment data before deletion for notification cleanup
    const commentDoc = await getDoc(commentRef);
    let commentData = null;
    if (commentDoc.exists()) {
      commentData = commentDoc.data();
    }

    await deleteDoc(commentRef);

    // Remove comment notification if we have the comment data
    if (commentData) {
      try {
        const post = await getPost(commentData.postId);
        if (post && post.authorId !== commentData.authorId) {
          await removeCommentNotification(
            post.authorId,
            commentData.authorId,
            commentData.postId,
            commentId
          );
        }
      } catch (notificationError) {
        console.warn('Failed to remove comment notification:', notificationError);
        // Don't fail the comment deletion if notification cleanup fails
      }
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}

/**
 * Get a specific comment by ID
 */
export async function getComment(commentId: string): Promise<Comment | null> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      return null;
    }

    const data = commentSnap.data();
    return {
      id: commentSnap.id,
      postId: data.postId,
      authorId: data.authorId,
      authorName: data.authorName,
      content: data.content,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      isEdited: data.isEdited || false,
    };
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw new Error('Failed to fetch comment');
  }
}

/**
 * Get comment count for a post
 */
export async function getPostCommentCount(postId: string): Promise<number> {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(commentsRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }
}

/**
 * Subscribe to real-time comment updates for a post
 */
export function subscribeToPostComments(
  postId: string,
  callback: (comments: Comment[]) => void
): () => void {
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const q = query(commentsRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const comments: Comment[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          postId: data.postId,
          authorId: data.authorId,
          authorName: data.authorName,
          content: data.content,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isEdited: data.isEdited || false,
        });
      });
      callback(comments);
    },
    error => {
      console.error('Error in comments subscription:', error);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time comment count updates for a post
 */
export function subscribeToPostCommentCount(
  postId: string,
  callback: (count: number) => void
): () => void {
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const q = query(commentsRef, where('postId', '==', postId));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const count = snapshot.size;
      callback(count);
    },
    error => {
      console.error('Error in comment count subscription:', error);
    }
  );

  return unsubscribe;
}
