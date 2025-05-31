import { renderHook, waitFor, act } from '@testing-library/react';
import { useComments } from '../useComments';
import * as commentsModule from '@/lib/firebase/comments';
import { Comment } from '@/types';

// Mock the entire Firebase comments module
jest.mock('@/lib/firebase/comments', () => ({
  getPostComments: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  getPostCommentCount: jest.fn(),
  subscribeToPostComments: jest.fn(),
  subscribeToPostCommentCount: jest.fn(),
}));

const mockGetPostComments = commentsModule.getPostComments as jest.MockedFunction<
  typeof commentsModule.getPostComments
>;
const mockAddComment = commentsModule.addComment as jest.MockedFunction<
  typeof commentsModule.addComment
>;
const mockDeleteComment = commentsModule.deleteComment as jest.MockedFunction<
  typeof commentsModule.deleteComment
>;
const mockGetPostCommentCount = commentsModule.getPostCommentCount as jest.MockedFunction<
  typeof commentsModule.getPostCommentCount
>;
const mockSubscribeToPostComments = commentsModule.subscribeToPostComments as jest.MockedFunction<
  typeof commentsModule.subscribeToPostComments
>;
const mockSubscribeToPostCommentCount =
  commentsModule.subscribeToPostCommentCount as jest.MockedFunction<
    typeof commentsModule.subscribeToPostCommentCount
  >;

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'test-post-id',
    authorId: 'user-1',
    authorName: 'John Doe',
    content: 'First comment',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    isEdited: false,
  },
  {
    id: 'comment-2',
    postId: 'test-post-id',
    authorId: 'user-2',
    authorName: 'Jane Smith',
    content: 'Second comment',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    isEdited: false,
  },
];

describe('useComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup subscription mocks to simulate real-time behavior
    mockSubscribeToPostComments.mockImplementation((postId, callback) => {
      // Simulate immediate callback with mock data
      setTimeout(() => {
        callback(mockComments);
      }, 0);
      // Return unsubscribe function
      return jest.fn();
    });

    mockSubscribeToPostCommentCount.mockImplementation((postId, callback) => {
      // Simulate immediate callback with mock count
      setTimeout(() => {
        callback(mockComments.length);
      }, 0);
      // Return unsubscribe function
      return jest.fn();
    });
  });

  it('returns initial loading state', () => {
    mockGetPostComments.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useComments('test-post-id'));

    expect(result.current.comments).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('loads comments successfully', async () => {
    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(mockComments);
    expect(mockSubscribeToPostComments).toHaveBeenCalledWith('test-post-id', expect.any(Function));
    expect(mockSubscribeToPostCommentCount).toHaveBeenCalledWith(
      'test-post-id',
      expect.any(Function)
    );
  });

  it('handles loading error', async () => {
    // Override the subscription mock to simulate an error
    mockSubscribeToPostComments.mockImplementation((postId, callback) => {
      // Simulate subscription error by not calling the callback
      // The hook should handle this gracefully
      return jest.fn();
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('test-post-id'));

    // Since the subscription doesn't call the callback, loading should remain true
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    expect(result.current.comments).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('adds comment successfully', async () => {
    mockAddComment.mockResolvedValueOnce('new-comment-id');

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add comment
    await act(async () => {
      await result.current.addComment('New comment', 'user-3', 'Bob Johnson');
    });

    expect(mockAddComment).toHaveBeenCalledWith(
      'test-post-id',
      'user-3',
      'Bob Johnson',
      'New comment'
    );

    // In real-time system, the subscription would handle the update
    // We just verify the addComment was called correctly
    expect(mockSubscribeToPostComments).toHaveBeenCalledWith('test-post-id', expect.any(Function));
  });

  it('handles add comment error', async () => {
    mockGetPostComments.mockResolvedValueOnce(mockComments);
    mockGetPostCommentCount.mockResolvedValueOnce(2);
    mockAddComment.mockRejectedValueOnce(new Error('Add failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.addComment('New comment', 'user-3', 'Bob Johnson')
      ).rejects.toThrow('Add failed');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error adding comment:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('deletes comment successfully', async () => {
    mockDeleteComment.mockResolvedValueOnce();

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Delete comment
    await act(async () => {
      await result.current.deleteComment('comment-1');
    });

    expect(mockDeleteComment).toHaveBeenCalledWith('comment-1');

    // In real-time system, the subscription would handle the update
    // We just verify the deleteComment was called correctly
    expect(mockSubscribeToPostComments).toHaveBeenCalledWith('test-post-id', expect.any(Function));
  });

  it('handles delete comment error', async () => {
    mockGetPostComments.mockResolvedValueOnce(mockComments);
    mockGetPostCommentCount.mockResolvedValueOnce(2);
    mockDeleteComment.mockRejectedValueOnce(new Error('Delete failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteComment('comment-1')).rejects.toThrow('Delete failed');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error deleting comment:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('refetches when postId changes', async () => {
    const post1Comments = [mockComments[0]];
    const post2Comments = [mockComments[1]];

    // Clear all mocks first to ensure clean state
    jest.clearAllMocks();

    // Setup subscription mocks for different postIds
    mockSubscribeToPostComments.mockImplementation((postId, callback) => {
      setTimeout(() => {
        if (postId === 'post-1') {
          callback(post1Comments);
        } else if (postId === 'post-2') {
          callback(post2Comments);
        }
      }, 0);
      return jest.fn();
    });

    mockSubscribeToPostCommentCount.mockImplementation((postId, callback) => {
      setTimeout(() => {
        callback(1);
      }, 0);
      return jest.fn();
    });

    const { result, rerender } = renderHook(({ postId }) => useComments(postId), {
      initialProps: { postId: 'post-1' },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(post1Comments);

    // Change postId
    rerender({ postId: 'post-2' });

    await waitFor(() => {
      expect(result.current.comments).toEqual(post2Comments);
    });

    // Verify subscriptions were called for both postIds
    expect(mockSubscribeToPostComments).toHaveBeenCalledWith('post-1', expect.any(Function));
    expect(mockSubscribeToPostComments).toHaveBeenCalledWith('post-2', expect.any(Function));
  });
});
