import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Follow, FollowStats, User, Business } from '@/types';
import { createFollowNotification, removeFollowNotification } from './followNotifications';

// Collections
export const followsCollection = collection(db, 'follows');
export const followStatsCollection = collection(db, 'followStats');
export const usersCollection = collection(db, 'users');
export const businessesCollection = collection(db, 'businesses');

/**
 * Follow a user or business
 */
export async function followEntity(
  followerId: string,
  followingId: string,
  followingType: 'user' | 'business'
): Promise<string> {
  // Check if already following
  const existingFollow = await getFollowRelation(followerId, followingId, followingType);
  if (existingFollow) {
    throw new Error('Already following this entity');
  }

  // Check if the entity allows following
  if (followingType === 'user') {
    const userDoc = await getDoc(doc(usersCollection, followingId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      // Check if user allows following
      if (userData.privacySettings?.allowFollowing === false) {
        throw new Error('This user does not allow following');
      }
    }
  }

  const batch = writeBatch(db);

  // Create follow document
  const followRef = doc(followsCollection);
  const followData: Omit<Follow, 'id'> = {
    followerId,
    followingId,
    followingType,
    createdAt: new Date(),
  };

  batch.set(followRef, {
    ...followData,
    createdAt: Timestamp.fromDate(followData.createdAt),
  });

  // Update follower's following count
  const followerStatsRef = doc(followStatsCollection, followerId);
  batch.set(
    followerStatsRef,
    {
      followingCount: increment(1),
    },
    { merge: true }
  );

  // Update following entity's followers count
  const followingStatsRef = doc(followStatsCollection, followingId);
  batch.set(
    followingStatsRef,
    {
      followersCount: increment(1),
    },
    { merge: true }
  );

  await batch.commit();

  // Create follow notification (async, non-blocking)
  if (followingType === 'user') {
    try {
      const followerDoc = await getDoc(doc(usersCollection, followerId));
      if (followerDoc.exists()) {
        const followerData = followerDoc.data() as User;
        const followerName = followerData.displayName || 'Someone';

        await createFollowNotification(followingId, followerId, followerName, followingType);
      }
    } catch (notificationError) {
      console.warn('Failed to create follow notification:', notificationError);
      // Don't fail the follow action if notification fails
    }
  }

  return followRef.id;
}

/**
 * Unfollow a user or business
 */
export async function unfollowEntity(
  followerId: string,
  followingId: string,
  followingType: 'user' | 'business'
): Promise<void> {
  const existingFollow = await getFollowRelation(followerId, followingId, followingType);
  if (!existingFollow) {
    throw new Error('Not following this entity');
  }

  const batch = writeBatch(db);

  // Delete follow document
  const followRef = doc(followsCollection, existingFollow.id);
  batch.delete(followRef);

  // Update follower's following count
  const followerStatsRef = doc(followStatsCollection, followerId);
  batch.set(
    followerStatsRef,
    {
      followingCount: increment(-1),
    },
    { merge: true }
  );

  // Update following entity's followers count
  const followingStatsRef = doc(followStatsCollection, followingId);
  batch.set(
    followingStatsRef,
    {
      followersCount: increment(-1),
    },
    { merge: true }
  );

  await batch.commit();

  // Remove follow notification (async, non-blocking)
  if (followingType === 'user') {
    try {
      await removeFollowNotification(followingId, followerId);
    } catch (notificationError) {
      console.warn('Failed to remove follow notification:', notificationError);
      // Don't fail the unfollow action if notification removal fails
    }
  }
}

/**
 * Get follow relation between two entities
 */
export async function getFollowRelation(
  followerId: string,
  followingId: string,
  followingType: 'user' | 'business'
): Promise<Follow | null> {
  const q = query(
    followsCollection,
    where('followerId', '==', followerId),
    where('followingId', '==', followingId),
    where('followingType', '==', followingType)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as Follow;
}

/**
 * Check if user is following an entity
 */
export async function isFollowing(
  followerId: string,
  followingId: string,
  followingType: 'user' | 'business'
): Promise<boolean> {
  const follow = await getFollowRelation(followerId, followingId, followingType);
  return follow !== null;
}

/**
 * Get follow stats for an entity
 */
export async function getFollowStats(entityId: string): Promise<FollowStats> {
  const statsDoc = await getDoc(doc(followStatsCollection, entityId));

  if (statsDoc.exists()) {
    const data = statsDoc.data();
    return {
      followersCount: data.followersCount || 0,
      followingCount: data.followingCount || 0,
    };
  }

  return {
    followersCount: 0,
    followingCount: 0,
  };
}

/**
 * Get followers of an entity
 */
export async function getFollowers(
  entityId: string,
  entityType: 'user' | 'business',
  limitCount: number = 20
): Promise<Follow[]> {
  const q = query(
    followsCollection,
    where('followingId', '==', entityId),
    where('followingType', '==', entityType),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Follow[];
}

/**
 * Get entities that a user is following
 */
export async function getFollowing(
  followerId: string,
  followingType?: 'user' | 'business',
  limitCount: number = 20
): Promise<Follow[]> {
  const constraints = [
    where('followerId', '==', followerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (followingType) {
    constraints.unshift(where('followingType', '==', followingType));
  }

  const q = query(followsCollection, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Follow[];
}

/**
 * Get suggested users to follow (users with most followers)
 */
export async function getSuggestedUsers(
  currentUserId: string,
  limitCount: number = 10
): Promise<string[]> {
  try {
    // Get users the current user is already following
    const followingDocs = await getDocs(
      query(
        followsCollection,
        where('followerId', '==', currentUserId),
        where('followingType', '==', 'user')
      )
    );
    const followingIds = followingDocs.docs.map(doc => doc.data().followingId);

    // Don't include the user themselves
    const excludeIds = [...followingIds, currentUserId];

    // Get all users and filter client-side to avoid Firestore query limitations
    const usersQuery = query(
      usersCollection,
      orderBy('createdAt', 'desc'),
      limit(100) // Get more users to filter from
    );

    const suggestedUserDocs = await getDocs(usersQuery);
    const filteredUsers = suggestedUserDocs.docs
      .map(doc => ({ id: doc.id, data: doc.data() as User }))
      .filter(
        ({ id, data }) =>
          // Exclude already following and current user
          !excludeIds.includes(id) &&
          // Only include users who allow discovery
          data.privacySettings?.showInDiscovery !== false &&
          // Only include users who allow their profile to be viewed
          data.privacySettings?.profileVisibility !== 'private'
      )
      .slice(0, limitCount) // Limit the final results
      .map(({ id }) => id);

    return filteredUsers;
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
}

/**
 * Get mutual followers between two users
 */
export async function getMutualFollowers(userId1: string, userId2: string): Promise<string[]> {
  // Get followers of both users
  const [followers1, followers2] = await Promise.all([
    getFollowers(userId1, 'user'),
    getFollowers(userId2, 'user'),
  ]);

  const followerIds1 = new Set(followers1.map(f => f.followerId));
  const followerIds2 = new Set(followers2.map(f => f.followerId));

  // Find intersection
  const mutualFollowers = Array.from(followerIds1).filter(id => followerIds2.has(id));
  return mutualFollowers;
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(usersCollection, userId));
  if (userDoc.exists()) {
    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  }
  return null;
}

/**
 * Get business details by ID
 */
export async function getBusinessById(businessId: string): Promise<Business | null> {
  const businessDoc = await getDoc(doc(businessesCollection, businessId));
  if (businessDoc.exists()) {
    return {
      id: businessDoc.id,
      ...businessDoc.data(),
    } as Business;
  }
  return null;
}

// Helper functions to convert Firebase document data to typed entities
function convertDocToUser(userDoc: DocumentSnapshot): User | null {
  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    id: userDoc.id,
    email: data?.email || '',
    displayName: data?.displayName || null,
    photoURL: data?.photoURL || null,
    isVerified: data?.isVerified || false,
    verificationStatus: data?.verificationStatus || 'none',
    address: data?.address,
    joinedAt: data?.joinedAt?.toDate() || new Date(),
    lastActive: data?.lastActive?.toDate() || new Date(),
    role: data?.role || 'user',
    permissions: data?.permissions || [],
    isSuspended: data?.isSuspended,
    suspensionReason: data?.suspensionReason,
    suspensionExpiresAt: data?.suspensionExpiresAt?.toDate(),
  } as User;
}

function convertDocToBusiness(businessDoc: DocumentSnapshot): Business | null {
  if (!businessDoc.exists()) return null;

  const data = businessDoc.data();
  return {
    id: businessDoc.id,
    name: data?.name || '',
    description: data?.description || '',
    category: data?.category || '',
    address: data?.address || '',
    coordinates: data?.coordinates || { lat: 0, lng: 0 },
    contact: data?.contact || {},
    hours: data?.hours || {},
    images: data?.images || [],
    ownerId: data?.ownerId || '',
    isVerified: data?.isVerified || false,
    rating: data?.rating || 0,
    reviewCount: data?.reviewCount || 0,
    createdAt: data?.createdAt?.toDate() || new Date(),
    updatedAt: data?.updatedAt?.toDate() || new Date(),
  } as Business;
}

/**
 * Get followers of an entity with resolved user/business data
 */
export async function getFollowersWithData(
  entityId: string,
  entityType: 'user' | 'business',
  limitCount: number = 20
): Promise<(User | Business)[]> {
  const follows = await getFollowers(entityId, entityType, limitCount);

  if (follows.length === 0) {
    return [];
  }

  // Group by entity type for batch fetching
  const userIds = follows.filter(f => f.followingType === 'user').map(f => f.followerId);
  const businessIds = follows.filter(f => f.followingType === 'business').map(f => f.followerId);

  const results: (User | Business)[] = [];

  // Fetch users
  if (userIds.length > 0) {
    const userPromises = userIds.map(id => getDoc(doc(usersCollection, id)));
    const userDocs = await Promise.all(userPromises);

    userDocs.forEach(userDoc => {
      const user = convertDocToUser(userDoc);
      if (user) {
        // Only include users who haven't set their profile to private
        if (user.privacySettings?.profileVisibility !== 'private') {
          results.push(user);
        }
      }
    });
  }

  // Fetch businesses
  if (businessIds.length > 0) {
    const businessPromises = businessIds.map(id => getDoc(doc(businessesCollection, id)));
    const businessDocs = await Promise.all(businessPromises);

    businessDocs.forEach(businessDoc => {
      const business = convertDocToBusiness(businessDoc);
      if (business) {
        results.push(business);
      }
    });
  }

  // Sort by original follow order (most recent first)
  const followOrder = follows.map(f => f.followerId);
  return results.sort((a, b) => {
    const aIndex = followOrder.indexOf(a.id);
    const bIndex = followOrder.indexOf(b.id);
    return aIndex - bIndex;
  });
}

/**
 * Get entities that a user is following with resolved user/business data
 */
export async function getFollowingWithData(
  followerId: string,
  followingType?: 'user' | 'business',
  limitCount: number = 20
): Promise<(User | Business)[]> {
  const follows = await getFollowing(followerId, followingType, limitCount);

  if (follows.length === 0) {
    return [];
  }

  // Group by entity type for batch fetching
  const userIds = follows.filter(f => f.followingType === 'user').map(f => f.followingId);
  const businessIds = follows.filter(f => f.followingType === 'business').map(f => f.followingId);

  const results: (User | Business)[] = [];

  // Fetch users
  if (userIds.length > 0) {
    const userPromises = userIds.map(id => getDoc(doc(usersCollection, id)));
    const userDocs = await Promise.all(userPromises);

    userDocs.forEach(userDoc => {
      const user = convertDocToUser(userDoc);
      if (user) {
        // Only include users who haven't set their profile to private
        if (user.privacySettings?.profileVisibility !== 'private') {
          results.push(user);
        }
      }
    });
  }

  // Fetch businesses
  if (businessIds.length > 0) {
    const businessPromises = businessIds.map(id => getDoc(doc(businessesCollection, id)));
    const businessDocs = await Promise.all(businessPromises);

    businessDocs.forEach(businessDoc => {
      const business = convertDocToBusiness(businessDoc);
      if (business) {
        results.push(business);
      }
    });
  }

  // Sort by original follow order (most recent first)
  const followOrder = follows.map(f => f.followingId);
  return results.sort((a, b) => {
    const aIndex = followOrder.indexOf(a.id);
    const bIndex = followOrder.indexOf(b.id);
    return aIndex - bIndex;
  });
}

/**
 * Get suggested users to follow with resolved user data
 */
export async function getSuggestedUsersWithData(
  currentUserId: string,
  limitCount: number = 10
): Promise<User[]> {
  try {
    // First, get users that the current user is already following
    const followingQuery = query(
      followsCollection,
      where('followerId', '==', currentUserId),
      where('followingType', '==', 'user')
    );
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);

    // Add current user to the exclusion list
    const excludeIds = [...followingIds, currentUserId];

    // Get all users first, then filter client-side to avoid Firestore query limitations
    const usersQuery = query(
      usersCollection,
      orderBy('createdAt', 'desc'),
      limit(100) // Get more users to filter from
    );

    const usersSnapshot = await getDocs(usersQuery);
    const allUsers = usersSnapshot.docs
      .map(doc => convertDocToUser(doc))
      .filter((user): user is User => user !== null)
      .filter(
        user =>
          // Exclude already following and current user
          !excludeIds.includes(user.id) &&
          // Only include users who allow discovery
          user.privacySettings?.showInDiscovery !== false &&
          // Only include users who allow their profile to be viewed
          user.privacySettings?.profileVisibility !== 'private'
      )
      .slice(0, limitCount); // Limit the final results

    return allUsers;
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
}

/**
 * Get mutual followers with resolved user data
 */
export async function getMutualFollowersWithData(
  userId1: string,
  userId2: string
): Promise<User[]> {
  const mutualFollowerIds = await getMutualFollowers(userId1, userId2);

  if (mutualFollowerIds.length === 0) {
    return [];
  }

  const userPromises = mutualFollowerIds.map(id => getDoc(doc(usersCollection, id)));
  const userDocs = await Promise.all(userPromises);

  const users: User[] = [];
  userDocs.forEach(userDoc => {
    const user = convertDocToUser(userDoc);
    if (user) {
      // Only include users who haven't set their profile to private
      if (user.privacySettings?.profileVisibility !== 'private') {
        users.push(user);
      }
    }
  });

  return users;
}
