import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryConstraint,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { CommunityPost, Event, Business, User, Notification, PostCategory } from '@/types';

// Posts operations
export const postsCollection = collection(db, 'posts');

// Test Firebase connection
console.log('Firebase DB initialized:', !!db);
console.log('Posts collection reference:', postsCollection.path);

export async function createPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();

  // Filter out undefined values to prevent Firestore errors
  const cleanPost = Object.fromEntries(
    Object.entries(post).filter(([, value]) => value !== undefined)
  );

  const postData = {
    ...cleanPost,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(postsCollection, postData);
  const postId = docRef.id;

  // After successfully creating the post, create post notifications
  // We'll do this in a try/catch to avoid blocking the post creation if notification fails
  try {
    // Import here to avoid circular dependencies
    const { createPostNotifications } = await import('./postNotifications');

    // Get the full post with ID to pass to the notification function
    const newPost: CommunityPost = {
      id: postId,
      ...cleanPost,
      createdAt: now,
      updatedAt: now,
    } as CommunityPost;

    // Fetch the author profile to get the display name
    const author = await getUserProfile(post.authorId);
    if (author) {
      // Create notifications for interested users
      await createPostNotifications(post.authorId, author.displayName || 'Anonymous', newPost);
    }
  } catch (error) {
    console.error('Failed to create post notifications:', error);
    // Continue even if notifications fail
  }

  return postId;
}

export async function getPosts(
  filters: {
    category?: string;
    status?: string;
    visibility?: string;
    authorId?: string;
  } = {},
  limitCount: number = 20,
  lastDoc?: unknown
) {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    } else {
      constraints.push(where('status', '==', 'active'));
    }

    if (filters.visibility) {
      constraints.push(where('visibility', '==', filters.visibility));
    }

    if (filters.authorId) {
      constraints.push(where('authorId', '==', filters.authorId));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(postsCollection, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }) as CommunityPost
    );
  } catch (error) {
    console.error('Error in getPosts:', error);
    console.error('Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      code: (error as { code?: string })?.code,
      stack: (error as Error)?.stack,
    });
    throw error;
  }
}

export async function getPost(id: string) {
  const docRef = doc(db, 'posts', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CommunityPost;
  }

  return null;
}

// Alias for consistency with component imports
export const getPostById = getPost;

export async function updatePost(id: string, updates: Partial<CommunityPost>) {
  const docRef = doc(db, 'posts', id);

  // Filter out undefined and NaN values to prevent Firestore errors
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined && !Number.isNaN(value))
  );

  const updateData = {
    ...cleanUpdates,
    updatedAt: Timestamp.fromDate(new Date()),
  };

  await updateDoc(docRef, updateData);
}

// Delete a post
export async function deletePost(postId: string) {
  // Remove all likes for this post first
  try {
    const { removePostLikes } = await import('./likes');
    await removePostLikes(postId);
  } catch (error) {
    console.warn('Failed to remove post likes:', error);
    // Continue with post deletion even if like cleanup fails
  }

  const docRef = doc(db, 'posts', postId);
  await deleteDoc(docRef);
}

// Events operations
export const eventsCollection = collection(db, 'events');

export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const eventData = {
    ...event,
    startDate: Timestamp.fromDate(event.startDate),
    endDate: Timestamp.fromDate(event.endDate),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(eventsCollection, eventData);
  return docRef.id;
}

export async function getEvents(
  filters: {
    status?: string;
    visibility?: string;
    organizerId?: string;
    category?: string;
  } = {},
  limitCount: number = 20
) {
  const constraints: QueryConstraint[] = [];

  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  } else {
    constraints.push(where('status', '==', 'active'));
  }

  if (filters.visibility) {
    constraints.push(where('visibility', '==', filters.visibility));
  }

  if (filters.organizerId) {
    constraints.push(where('organizerId', '==', filters.organizerId));
  }

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  constraints.push(orderBy('startDate', 'asc'));
  constraints.push(limit(limitCount));

  const q = query(eventsCollection, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    doc =>
      ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }) as Event
  );
}

// Businesses operations
export const businessesCollection = collection(db, 'businesses');

export async function createBusiness(business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const businessData = {
    ...business,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(businessesCollection, businessData);
  return docRef.id;
}

export async function getBusinesses(
  filters: {
    category?: string;
    isVerified?: boolean;
    location?: { lat: number; lng: number; radius: number };
  } = {},
  limitCount: number = 50
) {
  const constraints: QueryConstraint[] = [];

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  if (filters.isVerified !== undefined) {
    constraints.push(where('isVerified', '==', filters.isVerified));
  }

  constraints.push(orderBy('name', 'asc'));
  constraints.push(limit(limitCount));

  const q = query(businessesCollection, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    doc =>
      ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }) as Business
  );
}

export async function getBusiness(id: string) {
  const docRef = doc(db, 'businesses', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Business;
  }

  return null;
}

// Users operations
export async function getUserProfile(userId: string) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
    } as User;
  }

  return null;
}

/**
 * Get users who have enabled notifications for a specific post category
 */
export async function getUsersByPreference(category: PostCategory): Promise<User[]> {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'users'),
      where(`notificationPreferences.newPosts.${category}`, '==', true)
    )
  );

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      lastActive: data.lastActive?.toDate() || new Date(),
    } as User;
  });
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const docRef = doc(db, 'users', userId);

  // Filter out undefined and NaN values to prevent Firestore errors
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined && !Number.isNaN(value))
  );

  const updateData = {
    ...cleanUpdates,
    lastActive: Timestamp.fromDate(new Date()),
  };

  await updateDoc(docRef, updateData);
}

// Notifications operations
export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  const notificationData = {
    ...notification,
    createdAt: Timestamp.fromDate(new Date()),
  };

  const docRef = await addDoc(collection(db, 'notifications'), notificationData);
  return docRef.id;
}

export async function getUserNotifications(userId: string, limitCount: number = 20) {
  // Query for notifications using both userId (legacy) and recipientId (new)
  // This ensures we get all notifications regardless of how they were created
  const q1 = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const q2 = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  // Combine results and remove duplicates
  const allNotifications = [
    ...snapshot1.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })),
    ...snapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })),
  ];

  // Remove duplicates by id and sort by createdAt descending
  const uniqueNotifications = allNotifications
    .filter((notification, index, self) => self.findIndex(n => n.id === notification.id) === index)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limitCount);

  return uniqueNotifications as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, { isRead: true });
}

// Address verification operations
export async function submitAddressVerification(
  userId: string,
  address: string,
  supportingDocuments?: string[]
) {
  const verificationData = {
    userId,
    address,
    supportingDocuments: supportingDocuments || [],
    status: 'pending',
    submittedAt: Timestamp.fromDate(new Date()),
  };

  const docRef = await addDoc(collection(db, 'verifications'), verificationData);
  return docRef.id;
}

// Search functionality
export async function searchPosts(searchTerm: string, category?: string) {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(20),
  ];

  if (category) {
    constraints.push(where('category', '==', category));
  }

  const q = query(postsCollection, ...constraints);
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map(
    doc =>
      ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }) as CommunityPost
  );

  // Client-side filtering for search term (Firestore doesn't support full-text search)
  if (searchTerm) {
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  return posts;
}

/**
 * Subscribe to real-time notification updates for a user
 */
export function subscribeToUserNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 20
): () => void {
  // Query for notifications using both userId (legacy) and recipientId (new)
  const q1 = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const q2 = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  let notifications1: Notification[] = [];
  let notifications2: Notification[] = [];

  const combineAndCallback = () => {
    // Combine results and remove duplicates
    const allNotifications = [...notifications1, ...notifications2];

    // Remove duplicates by id and sort by createdAt descending
    const uniqueNotifications = allNotifications
      .filter(
        (notification, index, self) => self.findIndex(n => n.id === notification.id) === index
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limitCount);

    callback(uniqueNotifications);
  };

  // Subscribe to legacy notifications
  const unsubscribe1 = onSnapshot(
    q1,
    snapshot => {
      notifications1 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
      combineAndCallback();
    },
    error => {
      console.error('Error in legacy notifications subscription:', error);
    }
  );

  // Subscribe to new notifications
  const unsubscribe2 = onSnapshot(
    q2,
    snapshot => {
      notifications2 = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
      combineAndCallback();
    },
    error => {
      console.error('Error in new notifications subscription:', error);
    }
  );

  // Return cleanup function
  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}

/**
 * Subscribe to real-time post updates
 */
export function subscribeToPosts(
  callback: (posts: CommunityPost[]) => void,
  filters: {
    category?: string;
    status?: string;
    visibility?: string;
    authorId?: string;
  } = {},
  limitCount: number = 20
): () => void {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(limitCount)];

  // Add filters
  if (filters.category) {
    constraints.unshift(where('category', '==', filters.category));
  }
  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }
  if (filters.visibility) {
    constraints.unshift(where('visibility', '==', filters.visibility));
  }
  if (filters.authorId) {
    constraints.unshift(where('authorId', '==', filters.authorId));
  }

  const q = query(postsCollection, ...constraints);

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const posts = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }) as CommunityPost
      );
      callback(posts);
    },
    error => {
      console.error('Error in posts subscription:', error);
    }
  );

  return unsubscribe;
}

// Job saving operations
export const savedJobsCollection = collection(db, 'savedJobs');

/**
 * Save a job post for a user
 */
export async function saveJob(
  userId: string,
  postId: string,
  postTitle: string,
  postCategory: PostCategory
) {
  const now = new Date();

  // Check if already saved
  const existingQuery = query(
    savedJobsCollection,
    where('userId', '==', userId),
    where('postId', '==', postId)
  );

  const existingDocs = await getDocs(existingQuery);
  if (!existingDocs.empty) {
    throw new Error('Job already saved');
  }

  const savedJobData = {
    userId,
    postId,
    postTitle,
    postCategory,
    savedAt: Timestamp.fromDate(now),
  };

  const docRef = await addDoc(savedJobsCollection, savedJobData);
  return docRef.id;
}

/**
 * Unsave a job post for a user
 */
export async function unsaveJob(userId: string, postId: string) {
  const q = query(
    savedJobsCollection,
    where('userId', '==', userId),
    where('postId', '==', postId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('Saved job not found');
  }

  // Delete all matching documents (there should only be one)
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

/**
 * Get saved jobs for a user
 */
export async function getSavedJobs(userId: string) {
  const q = query(savedJobsCollection, where('userId', '==', userId), orderBy('savedAt', 'desc'));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    savedAt: doc.data().savedAt?.toDate() || new Date(),
  }));
}

/**
 * Check if a job is saved by a user
 */
export async function isJobSaved(userId: string, postId: string): Promise<boolean> {
  const q = query(
    savedJobsCollection,
    where('userId', '==', userId),
    where('postId', '==', postId)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}
