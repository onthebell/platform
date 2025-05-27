import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';
import { CommunityPost, Event, Business, User, Notification } from '@/types';

// Posts operations
export const postsCollection = collection(db, 'posts');

export async function createPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date();
  const postData = {
    ...post,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };
  
  const docRef = await addDoc(postsCollection, postData);
  return docRef.id;
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
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as CommunityPost));
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
  const updateData = {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  
  await updateDoc(docRef, updateData);
}

// Delete a post
export async function deletePost(postId: string) {
  const docRef = doc(db, 'posts', postId);
  await updateDoc(docRef, {
    status: 'deleted',
    updatedAt: Timestamp.fromDate(new Date()),
  });
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
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate() || new Date(),
    endDate: doc.data().endDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Event));
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
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Business));
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

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const docRef = doc(db, 'users', userId);
  const updateData = {
    ...updates,
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
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as Notification));
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
    limit(20)
  ];
  
  if (category) {
    constraints.push(where('category', '==', category));
  }

  const q = query(postsCollection, ...constraints);
  const snapshot = await getDocs(q);
  
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as CommunityPost));

  // Client-side filtering for search term (Firestore doesn't support full-text search)
  if (searchTerm) {
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  return posts;
}
