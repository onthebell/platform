import { renderHook, act, waitFor } from '@testing-library/react';
import { useLike } from '../useLike';
import { useAuth } from '@/lib/firebase/auth';
import * as likesModule from '@/lib/firebase/likes';

// Mock the auth hook
jest.mock('@/lib/firebase/auth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the likes module
jest.mock('@/lib/firebase/likes');
const mockTogglePostLike = likesModule.togglePostLike as jest.MockedFunction<
  typeof likesModule.togglePostLike
>;
const mockHasUserLikedPost = likesModule.hasUserLikedPost as jest.MockedFunction<
  typeof likesModule.hasUserLikedPost
>;
const mockGetPostLikeCount = likesModule.getPostLikeCount as jest.MockedFunction<
  typeof likesModule.getPostLikeCount
>;

const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  isVerified: false,
  verificationStatus: 'none' as const,
  joinedAt: new Date(),
  lastActive: new Date(),
  role: 'user' as const,
  permissions: [],
  isSuspended: false,
};

describe('useLike hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    mockHasUserLikedPost.mockResolvedValue(false);
    mockGetPostLikeCount.mockResolvedValue(5);

    const { result } = renderHook(() => useLike('post123', 3));

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.canLike).toBe(true);
  });

  it('should load like data when user and postId are provided', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    mockHasUserLikedPost.mockResolvedValue(true);
    mockGetPostLikeCount.mockResolvedValue(10);

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for the useEffect to complete
    await waitFor(() => {
      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(10);
    });

    expect(mockHasUserLikedPost).toHaveBeenCalledWith('post123', 'user123');
    expect(mockGetPostLikeCount).toHaveBeenCalledWith('post123');
  });

  it('should handle like toggle with optimistic updates', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    mockHasUserLikedPost.mockResolvedValue(false);
    mockGetPostLikeCount.mockResolvedValue(5);
    mockTogglePostLike.mockResolvedValue(true);

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
    });

    // Toggle like
    await act(async () => {
      await result.current.toggleLike();
    });

    expect(mockTogglePostLike).toHaveBeenCalledWith('post123', 'user123', 'Test User');

    // Check that like count was updated
    await waitFor(() => {
      expect(result.current.isLiked).toBe(true);
    });
  });

  it('should handle errors during like toggle', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    mockHasUserLikedPost.mockResolvedValue(false);
    mockGetPostLikeCount.mockResolvedValue(5);
    mockTogglePostLike.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
    });

    // Toggle like (should fail)
    await act(async () => {
      await result.current.toggleLike();
    });

    // Should revert optimistic update and show error
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to update like status');
      expect(result.current.isLiked).toBe(false); // Reverted
      expect(result.current.likeCount).toBe(5); // Reverted
    });
  });

  it('should not allow liking when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    const { result } = renderHook(() => useLike('post123', 5));

    expect(result.current.canLike).toBe(false);

    // Should set error when trying to like without authentication
    act(() => {
      result.current.toggleLike();
    });

    expect(result.current.error).toBe('You must be signed in to like posts');
  });

  it('should handle loading states correctly', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    // Make the API calls take some time
    mockHasUserLikedPost.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(false), 100))
    );
    mockGetPostLikeCount.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(5), 100))
    );

    const { result } = renderHook(() => useLike('post123', 0));

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
