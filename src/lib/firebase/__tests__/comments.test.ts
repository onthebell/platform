import { addComment, getPostComments, getPostCommentCount, deleteComment } from '../comments';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../config', () => ({
  db: 'mock-db',
}));

// Mock notification functions
jest.mock('../commentNotifications', () => ({
  createCommentNotification: jest.fn(),
  removeCommentNotification: jest.fn(),
}));

// Mock firestore functions
jest.mock('../firestore', () => ({
  getPost: jest.fn(),
}));

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

// Import the mocked functions
import { createCommentNotification, removeCommentNotification } from '../commentNotifications';
import { getPost } from '../firestore';

// Cast imported functions as Jest mocks
const mockCreateCommentNotification = createCommentNotification as jest.MockedFunction<
  typeof createCommentNotification
>;
const mockRemoveCommentNotification = removeCommentNotification as jest.MockedFunction<
  typeof removeCommentNotification
>;
const mockGetPost = getPost as jest.MockedFunction<typeof getPost>;

describe('Comments Firebase Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock notification functions
    mockCreateCommentNotification.mockResolvedValue(undefined);
    mockRemoveCommentNotification.mockResolvedValue(undefined);

    // Mock getPost function
    mockGetPost.mockResolvedValue({
      id: 'test-post-id',
      title: 'Test Post',
      description: 'Test post description',
      content: 'Test post content',
      category: 'community',
      type: 'announcement',
      authorId: 'post-author-id',
      authorName: 'Test Author',
      status: 'active',
      visibility: 'public',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      likes: 0,
      commentCount: 0,
      views: 0,
    });
  });

  describe('addComment', () => {
    it('should add a comment successfully', async () => {
      const mockDocRef = { id: 'new-comment-id' };
      mockAddDoc.mockResolvedValueOnce(mockDocRef as any);
      mockServerTimestamp.mockReturnValue('mock-timestamp' as any);
      mockCollection.mockReturnValue('mock-collection' as any);

      const result = await addComment('post-123', 'user-456', 'John Doe', 'This is a test comment');

      expect(result).toBe('new-comment-id');
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', {
        postId: 'post-123',
        authorId: 'user-456',
        authorName: 'John Doe',
        content: 'This is a test comment',
        createdAt: 'mock-timestamp',
        updatedAt: 'mock-timestamp',
        isEdited: false,
      });
      expect(mockCollection).toHaveBeenCalledWith(db, 'comments');
    });

    it('should trim whitespace from content', async () => {
      const mockDocRef = { id: 'new-comment-id' };
      mockAddDoc.mockResolvedValueOnce(mockDocRef as any);
      mockServerTimestamp.mockReturnValue('mock-timestamp' as any);
      mockCollection.mockReturnValue('mock-collection' as any);

      await addComment('post-123', 'user-456', 'John Doe', '  Whitespace comment  ');

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          content: 'Whitespace comment',
        })
      );
    });

    it('should throw error when addDoc fails', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore error'));
      mockCollection.mockReturnValue('mock-collection' as any);

      await expect(addComment('post-123', 'user-456', 'John Doe', 'Test comment')).rejects.toThrow(
        'Failed to add comment'
      );
    });
  });

  describe('getPostComments', () => {
    it('should retrieve comments for a post', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          data: () => ({
            postId: 'post-123',
            authorId: 'user-1',
            authorName: 'User One',
            content: 'First comment',
            createdAt: { toDate: () => new Date('2023-01-01') },
            updatedAt: { toDate: () => new Date('2023-01-01') },
            isEdited: false,
          }),
        },
        {
          id: 'comment-2',
          data: () => ({
            postId: 'post-123',
            authorId: 'user-2',
            authorName: 'User Two',
            content: 'Second comment',
            createdAt: { toDate: () => new Date('2023-01-02') },
            updatedAt: { toDate: () => new Date('2023-01-02') },
            isEdited: false,
          }),
        },
      ];

      const mockQuerySnapshot = {
        docs: mockComments,
        forEach: jest.fn(callback => {
          mockComments.forEach(callback);
        }),
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockCollection.mockReturnValue('mock-collection' as any);
      mockWhere.mockReturnValue('mock-where' as any);
      mockOrderBy.mockReturnValue('mock-order-by' as any);

      const result = await getPostComments('post-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'comment-1',
        postId: 'post-123',
        authorId: 'user-1',
        authorName: 'User One',
        content: 'First comment',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        isEdited: false,
      });

      expect(mockQuery).toHaveBeenCalledWith('mock-collection', 'mock-where', 'mock-order-by');
      expect(mockWhere).toHaveBeenCalledWith('postId', '==', 'post-123');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'asc');
    });

    it('should return empty array when no comments found', async () => {
      const mockQuerySnapshot = {
        docs: [],
        forEach: jest.fn(callback => {
          [].forEach(callback);
        }),
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await getPostComments('post-123');

      expect(result).toEqual([]);
    });

    it('should throw error when getDocs fails', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(getPostComments('post-123')).rejects.toThrow('Failed to fetch comments');
    });
  });

  describe('getPostCommentCount', () => {
    it('should return comment count for a post', async () => {
      const mockQuerySnapshot = { size: 5 };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);
      mockCollection.mockReturnValue('mock-collection' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);

      const result = await getPostCommentCount('post-123');

      expect(result).toBe(5);
      expect(mockCollection).toHaveBeenCalledWith(db, 'comments');
      expect(mockWhere).toHaveBeenCalledWith('postId', '==', 'post-123');
    });

    it('should return 0 when no comments found', async () => {
      const mockQuerySnapshot = { size: 0 };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);
      mockCollection.mockReturnValue('mock-collection' as any);
      mockQuery.mockReturnValue('mock-query' as any);
      mockWhere.mockReturnValue('mock-where' as any);

      const result = await getPostCommentCount('post-123');

      expect(result).toBe(0);
    });

    it('should return 0 when getDocs fails', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'));

      const result = await getPostCommentCount('post-123');

      expect(result).toBe(0);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      // Mock getDoc to return comment data
      const mockCommentDoc = {
        exists: () => true,
        data: () => ({
          id: 'comment-123',
          postId: 'test-post-id',
          authorId: 'comment-author-id',
          content: 'Test comment',
        }),
      };
      mockGetDoc.mockResolvedValueOnce(mockCommentDoc as any);
      mockDeleteDoc.mockResolvedValueOnce(undefined);
      mockDoc.mockReturnValue('mock-doc-ref' as any);

      await deleteComment('comment-123');

      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
      expect(mockDoc).toHaveBeenCalledWith(db, 'comments', 'comment-123');
    });

    it('should throw error when deleteDoc fails', async () => {
      // Mock getDoc to return comment data first
      const mockCommentDoc = {
        exists: () => true,
        data: () => ({
          id: 'comment-123',
          postId: 'test-post-id',
          authorId: 'comment-author-id',
          content: 'Test comment',
        }),
      };
      mockGetDoc.mockResolvedValueOnce(mockCommentDoc as any);
      mockDeleteDoc.mockRejectedValueOnce(new Error('Firestore error'));
      mockDoc.mockReturnValue('mock-doc-ref' as any);

      await expect(deleteComment('comment-123')).rejects.toThrow('Failed to delete comment');
    });
  });
});
