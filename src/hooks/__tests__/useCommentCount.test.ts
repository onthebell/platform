import { renderHook, waitFor } from '@testing-library/react';
import { useCommentCount } from '../useCommentCount';
import * as commentsModule from '@/lib/firebase/comments';

// Mock the entire Firebase comments module
jest.mock('@/lib/firebase/comments', () => ({
  getPostComments: jest.fn(),
  addComment: jest.fn(),
  deleteComment: jest.fn(),
  getPostCommentCount: jest.fn(),
}));

const mockGetPostCommentCount = commentsModule.getPostCommentCount as jest.MockedFunction<
  typeof commentsModule.getPostCommentCount
>;

describe('useCommentCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial loading state', () => {
    mockGetPostCommentCount.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCommentCount('test-post-id'));

    expect(result.current.count).toBe(0);
    expect(result.current.loading).toBe(true);
  });

  it('returns comment count when successful', async () => {
    mockGetPostCommentCount.mockResolvedValueOnce(5);

    const { result } = renderHook(() => useCommentCount('test-post-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(5);
    expect(mockGetPostCommentCount).toHaveBeenCalledWith('test-post-id');
  });
});
