import { togglePostLike, hasUserLikedPost, getPostLikeCount, removePostLikes } from '../likes';
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
  runTransaction,
  limit,
  orderBy,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  runTransaction: jest.fn(),
  increment: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(() => ({
      toDate: () => new Date(),
    })),
  },
}));

// Mock cache functions
jest.mock('../likeCache', () => ({
  getCachedLikeCount: jest.fn(),
  cacheLikeCount: jest.fn(),
  getCachedUserLikeStatus: jest.fn(),
  cacheUserLikeStatus: jest.fn(),
  invalidatePostCache: jest.fn(),
}));

// Mock notification functions
jest.mock('../likeNotifications', () => ({
  createLikeNotification: jest.fn(),
  removeLikeNotification: jest.fn(),
}));

jest.mock('../config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockRunTransaction = runTransaction as jest.MockedFunction<typeof runTransaction>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;

describe('likes module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('togglePostLike', () => {
    it('should add like when user has not liked the post', async () => {
      const mockTransaction = {
        get: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        set: jest.fn(),
      };

      // Mock post document
      const mockPostDoc = {
        exists: () => true,
        data: () => ({
          authorId: 'author123',
          title: 'Test Post',
        }),
      };

      // Mock empty query result (user hasn't liked)
      const mockEmptySnapshot = {
        empty: true,
        docs: [],
      };

      mockTransaction.get.mockResolvedValue(mockPostDoc);
      mockGetDocs.mockResolvedValue(mockEmptySnapshot as any);

      mockRunTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction as any);
      });

      const result = await togglePostLike('post123', 'user123', 'Test User');

      expect(result).toBe(true);
      expect(mockTransaction.set).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should remove like when user has already liked the post', async () => {
      const mockTransaction = {
        get: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        set: jest.fn(),
      };

      // Mock post document
      const mockPostDoc = {
        exists: () => true,
        data: () => ({
          authorId: 'author123',
          title: 'Test Post',
        }),
      };

      // Mock non-empty query result (user has liked)
      const mockNonEmptySnapshot = {
        empty: false,
        docs: [{ id: 'like123' }],
      };

      mockTransaction.get.mockResolvedValue(mockPostDoc);
      mockGetDocs.mockResolvedValue(mockNonEmptySnapshot as any);

      mockRunTransaction.mockImplementation(async (db, callback) => {
        return await callback(mockTransaction as any);
      });

      const result = await togglePostLike('post123', 'user123', 'Test User');

      expect(result).toBe(false);
      expect(mockTransaction.delete).toHaveBeenCalled();
      expect(mockTransaction.update).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRunTransaction.mockRejectedValue(new Error('Database error'));

      await expect(togglePostLike('post123', 'user123', 'Test User')).rejects.toThrow(
        'Failed to toggle like'
      );
    });
  });

  describe('hasUserLikedPost', () => {
    it('should return true when user has liked the post', async () => {
      // Mock cache to return null so we hit the database
      const { getCachedUserLikeStatus } = jest.requireMock('../likeCache');
      getCachedUserLikeStatus.mockReturnValue(null);

      const mockSnapshot = {
        empty: false,
      };

      mockCollection.mockReturnValue('mock-collection' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockLimit.mockReturnValue('mock-limit' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await hasUserLikedPost('post123', 'user123');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('postId', '==', 'post123');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user123');
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should return false when user has not liked the post', async () => {
      // Mock cache to return null so we hit the database
      const { getCachedUserLikeStatus } = jest.requireMock('../likeCache');
      getCachedUserLikeStatus.mockReturnValue(null);

      const mockSnapshot = {
        empty: true,
      };

      mockCollection.mockReturnValue('mock-collection' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockLimit.mockReturnValue('mock-limit' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await hasUserLikedPost('post123', 'user123');

      expect(result).toBe(false);
    });

    it('should return cached value when available', async () => {
      // Mock cache to return a value
      const { getCachedUserLikeStatus } = jest.requireMock('../likeCache');
      getCachedUserLikeStatus.mockReturnValue(true);

      const result = await hasUserLikedPost('post123', 'user123');

      expect(result).toBe(true);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      // Mock cache to return null so we hit the database
      const { getCachedUserLikeStatus } = jest.requireMock('../likeCache');
      getCachedUserLikeStatus.mockReturnValue(null);

      mockCollection.mockReturnValue('mock-collection' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockLimit.mockReturnValue('mock-limit' as any);
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await hasUserLikedPost('post123', 'user123');

      expect(result).toBe(false);
    });
  });

  describe('getPostLikeCount', () => {
    it('should return like count from query snapshot', async () => {
      const mockSnapshot = {
        size: 5,
      };

      // Mock cache to return null so we hit the database
      const { getCachedLikeCount } = jest.requireMock('../likeCache');
      getCachedLikeCount.mockReturnValue(null);

      mockGetDocs.mockResolvedValue(mockSnapshot as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockCollection.mockReturnValue('mock-collection' as any);

      const result = await getPostLikeCount('post123');

      expect(result).toBe(5);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('postId', '==', 'post123');
    });

    it('should return cached value when available', async () => {
      const { getCachedLikeCount } = jest.requireMock('../likeCache');
      getCachedLikeCount.mockReturnValue(10);

      const result = await getPostLikeCount('post123');

      expect(result).toBe(10);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should return 0 on error', async () => {
      const { getCachedLikeCount } = jest.requireMock('../likeCache');
      getCachedLikeCount.mockReturnValue(null);

      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const result = await getPostLikeCount('post123');

      expect(result).toBe(0);
    });
  });

  describe('removePostLikes', () => {
    it('should delete all likes for a post', async () => {
      const mockSnapshot = {
        docs: [{ ref: 'like1' }, { ref: 'like2' }, { ref: 'like3' }],
      };

      mockGetDocs.mockResolvedValue(mockSnapshot as any);
      mockDeleteDoc.mockResolvedValue(undefined as any);

      await removePostLikes('post123');

      expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('postId', '==', 'post123');
    });

    it('should handle errors when deleting likes', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      await expect(removePostLikes('post123')).rejects.toThrow('Failed to remove post likes');
    });
  });
});
