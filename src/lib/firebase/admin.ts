import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { db } from './config'; // Client SDK
import { doc, getDoc } from 'firebase/firestore';
import { User } from '../../types';

let adminApp: App;

// Initialize Firebase Admin (optional for development)
const initializeFirebaseAdmin = () => {
  if (!adminApp && getApps().length === 0) {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          };

      // Only initialize if we have proper credentials
      if (serviceAccount.privateKey && serviceAccount.clientEmail) {
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    } catch (error) {
      console.warn('Firebase Admin SDK not properly configured, using client SDK fallback:', error);
    }
  } else if (!adminApp) {
    adminApp = getApps()[0];
  }

  return adminApp;
};

// Get Firebase Admin Auth
export const getAdminAuth = () => {
  const app = initializeFirebaseAdmin();
  return getAuth(app);
};

// Get Firebase Admin Firestore
export const getAdminFirestore = () => {
  const app = initializeFirebaseAdmin();
  return getFirestore(app);
};

/**
 * Verify Firebase ID token using admin privileges
 */
export async function verifyIdToken(token: string) {
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Failed to verify ID token:', error);
    return null;
  }
}

/**
 * Get user data from Firebase Auth using admin privileges or client SDK fallback
 */
export async function getAuthUser(uid: string): Promise<User | null> {
  try {
    // Try admin SDK first
    if (adminApp) {
      const adminAuth = getAdminAuth();
      const adminDb = getAdminFirestore();

      // Get user from Firebase Auth
      const authUser = await adminAuth.getUser(uid);

      // Get user profile from Firestore
      const userDoc = await adminDb.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();

      return {
        id: authUser.uid,
        email: authUser.email!,
        displayName: authUser.displayName || userData?.displayName,
        photoURL: authUser.photoURL || userData?.photoURL,
        isVerified: userData?.isVerified || false,
        verificationStatus: userData?.verificationStatus || 'none',
        joinedAt: userData?.joinedAt?.toDate() || new Date(authUser.metadata.creationTime),
        lastActive: userData?.lastActive?.toDate() || new Date(),
        // Admin fields with defaults
        role: userData?.role || 'user',
        permissions: userData?.permissions || [],
        isSuspended: userData?.isSuspended || false,
        suspensionReason: userData?.suspensionReason,
        suspensionExpiresAt: userData?.suspensionExpiresAt?.toDate(),
        ...userData,
      } as User;
    } else {
      // Fallback to client SDK for development
      console.warn('Using client SDK fallback for user lookup');
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();

      return {
        id: uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        isVerified: userData.isVerified || false,
        verificationStatus: userData.verificationStatus || 'none',
        joinedAt: userData.joinedAt?.toDate() || new Date(),
        lastActive: userData.lastActive?.toDate() || new Date(),
        // Admin fields with defaults
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        isSuspended: userData.isSuspended || false,
        suspensionReason: userData.suspensionReason,
        suspensionExpiresAt: userData.suspensionExpiresAt?.toDate(),
        address: userData.address,
      } as User;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Update user data in Firestore using admin privileges
 */
export async function updateUserAsAdmin(uid: string, updates: Partial<User>): Promise<void> {
  try {
    const adminDb = getAdminFirestore();

    await adminDb
      .collection('users')
      .doc(uid)
      .update({
        ...updates,
        lastActive: new Date(),
      });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users with admin privileges
 */
export async function getAllUsers(
  limit = 100,
  nextPageToken?: string
): Promise<{
  users: User[];
  nextPageToken?: string;
}> {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    // Get users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(limit, nextPageToken);

    // Get user profiles from Firestore
    const userIds = listUsersResult.users.map(user => user.uid);
    const userDocs = await Promise.all(
      userIds.map(id => adminDb.collection('users').doc(id).get())
    );

    const users: User[] = [];

    for (let i = 0; i < listUsersResult.users.length; i++) {
      const authUser = listUsersResult.users[i];
      const userDoc = userDocs[i];
      const userData = userDoc.exists ? userDoc.data() : {};

      users.push({
        id: authUser.uid,
        email: authUser.email!,
        displayName: authUser.displayName || userData?.displayName,
        photoURL: authUser.photoURL || userData?.photoURL,
        isVerified: userData?.isVerified || false,
        verificationStatus: userData?.verificationStatus || 'none',
        joinedAt: userData?.joinedAt?.toDate() || new Date(authUser.metadata.creationTime),
        lastActive: userData?.lastActive?.toDate() || new Date(),
        // Admin fields with defaults
        role: userData?.role || 'user',
        permissions: userData?.permissions || [],
        isSuspended: userData?.isSuspended || false,
        suspensionReason: userData?.suspensionReason,
        suspensionExpiresAt: userData?.suspensionExpiresAt?.toDate(),
        ...userData,
      } as User);
    }

    return {
      users,
      nextPageToken: listUsersResult.pageToken,
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Delete user using admin privileges
 */
export async function deleteUserAsAdmin(uid: string): Promise<void> {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminFirestore();

    // Delete user from Firebase Auth
    await adminAuth.deleteUser(uid);

    // Delete user profile from Firestore
    await adminDb.collection('users').doc(uid).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
