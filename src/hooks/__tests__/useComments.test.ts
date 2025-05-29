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
  });

  it('returns initial loading state', () => {
    mockGetPostComments.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useComments('test-post-id'));

    expect(result.current.comments).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('loads comments successfully', async () => {
    mockGetPostComments.mockResolvedValueOnce(mockComments);
    mockGetPostCommentCount.mockResolvedValueOnce(2);

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(mockComments);
    expect(mockGetPostComments).toHaveBeenCalledWith('test-post-id');
  });

  it('handles loading error', async () => {
    mockGetPostComments.mockRejectedValueOnce(new Error('Firebase error'));
    mockGetPostCommentCount.mockRejectedValueOnce(new Error('Firebase error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useComments('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error loading comments:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('adds comment successfully', async () => {
    mockGetPostComments.mockResolvedValueOnce(mockComments);
    mockGetPostCommentCount.mockResolvedValueOnce(2);
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
    expect(mockGetPostComments).toHaveBeenCalledTimes(1); // Only initial load
    // Check that comment was added to local state
    expect(result.current.comments).toHaveLength(3);
    expect(result.current.comments[2]).toEqual(
      expect.objectContaining({
        id: 'new-comment-id',
        content: 'New comment',
        authorName: 'Bob Johnson',
      })
    );
    expect(result.current.commentCount).toBe(3);
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
    mockGetPostComments.mockResolvedValueOnce(mockComments);
    mockGetPostCommentCount.mockResolvedValueOnce(2);
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
    expect(mockGetPostComments).toHaveBeenCalledTimes(1); // Only initial load
    // Check that comment was removed from local state
    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments.find(c => c.id === 'comment-1')).toBeUndefined();
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

    // Setup mocks for first postId
    mockGetPostComments.mockResolvedValueOnce(post1Comments);
    mockGetPostCommentCount.mockResolvedValueOnce(1);

    const { result, rerender } = renderHook(({ postId }) => useComments(postId), {
      initialProps: { postId: 'post-1' },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(post1Comments);

    // Setup mocks for second postId
    mockGetPostComments.mockResolvedValueOnce(post2Comments);
    mockGetPostCommentCount.mockResolvedValueOnce(1);

    // Change postId
    rerender({ postId: 'post-2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual(post2Comments);
    expect(mockGetPostComments).toHaveBeenCalledTimes(2);
    expect(mockGetPostComments).toHaveBeenNthCalledWith(1, 'post-1');
    expect(mockGetPostComments).toHaveBeenNthCalledWith(2, 'post-2');
  });
});
