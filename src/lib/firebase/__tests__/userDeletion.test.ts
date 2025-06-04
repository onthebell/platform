import { deleteUserData } from '../userDeletion';
import { collection, query, where, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';

// Mock Firebase services
jest.mock('../config', () => ({
  db: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  writeBatch: jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
  deleteDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  listAll: jest.fn(),
  deleteObject: jest.fn(),
}));

describe('userDeletion', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock empty snapshots for Firestore queries by default
    (getDocs as jest.Mock).mockResolvedValue({
      forEach: jest.fn(),
      docs: [],
      empty: true,
    });

    // Mock empty result for Storage listAll by default
    (listAll as jest.Mock).mockResolvedValue({
      items: [],
      prefixes: [],
    });

    // Mock deleteObject to resolve successfully
    (deleteObject as jest.Mock).mockResolvedValue(undefined);
  });

  test('should delete user profile document', async () => {
    // Setup
    const mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (writeBatch as jest.Mock).mockReturnValue(mockBatch);
    (doc as jest.Mock).mockReturnValue({ id: mockUserId });

    // Execute
    await deleteUserData(mockUserId);

    // Verify user document reference was created and deleted
    expect(doc).toHaveBeenCalledWith(db, 'users', mockUserId);
    expect(mockBatch.delete).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  test('should query and delete user posts', async () => {
    // Setup
    const mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
    };
    (writeBatch as jest.Mock).mockReturnValue(mockBatch);

    const mockPostDocs = [
      { id: 'post-1', ref: { id: 'post-1' } },
      { id: 'post-2', ref: { id: 'post-2' } },
    ];

    const mockPostsSnapshot = {
      forEach: jest.fn(callback => mockPostDocs.forEach(callback)),
      docs: mockPostDocs,
      empty: false,
    };

    (collection as jest.Mock).mockReturnValueOnce('posts-collection');
    (query as jest.Mock).mockReturnValueOnce('posts-query');
    (where as jest.Mock).mockReturnValueOnce('author-condition');
    (getDocs as jest.Mock).mockResolvedValueOnce(mockPostsSnapshot);

    // Execute
    await deleteUserData(mockUserId);

    // Verify
    expect(collection).toHaveBeenCalledWith(db, 'posts');
    expect(query).toHaveBeenCalledWith('posts-collection', 'author-condition');
    expect(where).toHaveBeenCalledWith('authorId', '==', mockUserId);
    expect(mockPostsSnapshot.forEach).toHaveBeenCalled();
  });

  test('should handle error during deletion', async () => {
    // Setup
    const mockError = new Error('Deletion error');
    const mockBatch = {
      delete: jest.fn(),
      commit: jest.fn().mockRejectedValue(mockError),
    };
    (writeBatch as jest.Mock).mockReturnValue(mockBatch);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Execute & Verify
    await expect(deleteUserData(mockUserId)).rejects.toThrow('Failed to delete user data');
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting user data:', mockError);

    // Clean up
    consoleSpy.mockRestore();
  });
});
