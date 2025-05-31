import { renderHook, act, waitFor } from '@testing-library/react';
import { useLike } from '../useLike';
import { useAuth } from '@/lib/firebase/auth';
import * as likesModule from '@/lib/firebase/likes';

// Mock the auth hook
jest.mock('@/lib/firebase/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock the likes module
jest.mock('@/lib/firebase/likes', () => ({
  togglePostLike: jest.fn(),
  hasUserLikedPost: jest.fn(),
  getPostLikeCount: jest.fn(),
  subscribeToPostLikeCount: jest.fn(() => jest.fn()),
  subscribeToUserLikeStatus: jest.fn(() => jest.fn()),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockTogglePostLike = likesModule.togglePostLike as jest.MockedFunction<
  typeof likesModule.togglePostLike
>;
const mockSubscribeToPostLikeCount = likesModule.subscribeToPostLikeCount as jest.MockedFunction<
  typeof likesModule.subscribeToPostLikeCount
>;
const mockSubscribeToUserLikeStatus = likesModule.subscribeToUserLikeStatus as jest.MockedFunction<
  typeof likesModule.subscribeToUserLikeStatus
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

    // Set up subscription mocks but don't call callbacks immediately
    mockSubscribeToPostLikeCount.mockImplementation(() => jest.fn());
    mockSubscribeToUserLikeStatus.mockImplementation(() => jest.fn());

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

    // Set up subscription mocks for both like count and like status
    mockSubscribeToPostLikeCount.mockImplementation((postId, callback) => {
      // Immediately call callback with value
      callback(10);
      return jest.fn(); // Return unsubscribe function
    });

    mockSubscribeToUserLikeStatus.mockImplementation((postId, userId, callback) => {
      // Immediately call callback with value
      callback(true);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for the useEffect to complete
    await waitFor(() => {
      expect(result.current.isLiked).toBe(true);
      expect(result.current.likeCount).toBe(10);
    });

    expect(mockSubscribeToPostLikeCount).toHaveBeenCalledWith('post123', expect.any(Function));
    expect(mockSubscribeToUserLikeStatus).toHaveBeenCalledWith(
      'post123',
      'user123',
      expect.any(Function)
    );
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

    // Set up subscription mocks for both like count and like status
    mockSubscribeToPostLikeCount.mockImplementation((postId, callback) => {
      // Immediately call callback with initial value
      callback(5);
      return jest.fn(); // Return unsubscribe function
    });

    mockSubscribeToUserLikeStatus.mockImplementation((postId, userId, callback) => {
      // Immediately call callback with initial value
      callback(false);
      return jest.fn(); // Return unsubscribe function
    });

    mockTogglePostLike.mockResolvedValue(true); // Will be true after toggling from false

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
      expect(result.current.isLiked).toBe(false);
    });

    // Toggle like
    await act(async () => {
      await result.current.toggleLike();
    });

    expect(mockTogglePostLike).toHaveBeenCalledWith('post123', 'user123', 'Test User');

    // Check optimistic update
    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(6);
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

    // Set up subscription mocks for both like count and like status
    mockSubscribeToPostLikeCount.mockImplementation((postId, callback) => {
      // Immediately call callback with initial value
      callback(5);
      return jest.fn(); // Return unsubscribe function
    });

    mockSubscribeToUserLikeStatus.mockImplementation((postId, userId, callback) => {
      // Immediately call callback with initial value
      callback(false);
      return jest.fn(); // Return unsubscribe function
    });

    mockTogglePostLike.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLike('post123', 5));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.likeCount).toBe(5);
      expect(result.current.isLiked).toBe(false);
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

    // Delay the subscription callbacks
    mockSubscribeToPostLikeCount.mockImplementation((postId, callback) => {
      setTimeout(() => callback(5), 100);
      return jest.fn();
    });

    mockSubscribeToUserLikeStatus.mockImplementation((postId, userId, callback) => {
      setTimeout(() => callback(false), 100);
      return jest.fn();
    });

    const { result } = renderHook(() => useLike('post123', 0));

    // Initially, we'll have the default values
    expect(result.current.likeCount).toBe(0);

    // Wait for loading to complete (subscriptions to fire)
    await waitFor(
      () => {
        expect(result.current.likeCount).toBe(5);
      },
      { timeout: 200 }
    );
  });
});
