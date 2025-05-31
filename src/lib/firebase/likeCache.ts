// Cache for like counts and user like status
interface LikeCache {
  count: number;
  timestamp: number;
}

interface UserLikeCache {
  [postId: string]: {
    isLiked: boolean;
    timestamp: number;
  };
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache storage
const likeCountCache = new Map<string, LikeCache>();
const userLikeCache = new Map<string, UserLikeCache>();

/**
 * Get cached like count for a post
 */
export function getCachedLikeCount(postId: string): number | null {
  const cached = likeCountCache.get(postId);

  if (!cached) return null;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    likeCountCache.delete(postId);
    return null;
  }

  return cached.count;
}

/**
 * Cache like count for a post
 */
export function cacheLikeCount(postId: string, count: number): void {
  likeCountCache.set(postId, {
    count,
    timestamp: Date.now(),
  });
}

/**
 * Get cached user like status for a post
 */
export function getCachedUserLikeStatus(userId: string, postId: string): boolean | null {
  const userCache = userLikeCache.get(userId);

  if (!userCache || !userCache[postId]) return null;

  const cached = userCache[postId];

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    delete userCache[postId];
    return null;
  }

  return cached.isLiked;
}

/**
 * Cache user like status for a post
 */
export function cacheUserLikeStatus(userId: string, postId: string, isLiked: boolean): void {
  if (!userLikeCache.has(userId)) {
    userLikeCache.set(userId, {});
  }

  const userCache = userLikeCache.get(userId)!;
  userCache[postId] = {
    isLiked,
    timestamp: Date.now(),
  };
}

/**
 * Invalidate cache for a specific post
 */
export function invalidatePostCache(postId: string): void {
  likeCountCache.delete(postId);

  // Remove from all user caches
  for (const userCache of userLikeCache.values()) {
    delete userCache[postId];
  }
}

/**
 * Invalidate cache for a specific user
 */
export function invalidateUserCache(userId: string): void {
  userLikeCache.delete(userId);
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  likeCountCache.clear();
  userLikeCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  likeCountCacheSize: number;
  userLikeCacheSize: number;
  totalUserCacheEntries: number;
} {
  let totalUserCacheEntries = 0;
  for (const userCache of userLikeCache.values()) {
    totalUserCacheEntries += Object.keys(userCache).length;
  }

  return {
    likeCountCacheSize: likeCountCache.size,
    userLikeCacheSize: userLikeCache.size,
    totalUserCacheEntries,
  };
}
