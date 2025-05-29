import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { useAuth } from '@/lib/firebase/auth';
import { getUserNotifications, markNotificationAsRead } from '@/lib/firebase/firestore';
import { Notification } from '@/types';

// Mock dependencies
jest.mock('@/lib/firebase/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/lib/firebase/firestore', () => ({
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetUserNotifications = getUserNotifications as jest.MockedFunction<
  typeof getUserNotifications
>;
const mockMarkNotificationAsRead = markNotificationAsRead as jest.MockedFunction<
  typeof markNotificationAsRead
>;

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user123',
    title: 'New Message',
    message: 'You have a new message',
    type: 'info',
    isRead: false,
    createdAt: new Date('2025-05-29T10:00:00Z'),
  },
  {
    id: 'notif2',
    userId: 'user123',
    title: 'Post Liked',
    message: 'Someone liked your post',
    type: 'success',
    isRead: true,
    createdAt: new Date('2025-05-28T15:30:00Z'),
  },
  {
    id: 'notif3',
    userId: 'user123',
    title: 'New Comment',
    message: 'Someone commented on your post',
    type: 'info',
    isRead: false,
    createdAt: new Date('2025-05-27T09:15:00Z'),
  },
];

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    } as any);
  });

  it('initializes with loading state', () => {
    mockGetUserNotifications.mockResolvedValue([]);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('fetches notifications for authenticated user', async () => {
    mockGetUserNotifications.mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserNotifications).toHaveBeenCalledWith('user123');
    expect(result.current.notifications).toEqual(mockNotifications);
    expect(result.current.unreadCount).toBe(2); // Two unread notifications
  });

  it('handles no user state', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    } as any);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserNotifications).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('handles user without ID', async () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com' }, // User without ID
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    } as any);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserNotifications).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('marks notification as read and updates state', async () => {
    mockGetUserNotifications.mockResolvedValue(mockNotifications);
    mockMarkNotificationAsRead.mockResolvedValue();

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(2);

    await act(async () => {
      await result.current.markAsRead('notif1');
    });

    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('notif1');
    expect(result.current.unreadCount).toBe(1); // One less unread

    // Check that the notification is marked as read in local state
    const updatedNotification = result.current.notifications.find(n => n.id === 'notif1');
    expect(updatedNotification?.isRead).toBe(true);
  });

  it('refreshes notifications when called', async () => {
    mockGetUserNotifications.mockResolvedValueOnce(mockNotifications).mockResolvedValueOnce([
      ...mockNotifications,
      {
        id: 'notif4',
        userId: 'user123',
        title: 'New Notification',
        message: 'A new notification',
        type: 'message',
        isRead: false,
        createdAt: new Date(),
      },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(3);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.notifications).toHaveLength(4);
    expect(mockGetUserNotifications).toHaveBeenCalledTimes(2);
  });

  it('handles fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetUserNotifications.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching notifications:',
      expect.any(Error)
    );
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);

    consoleErrorSpy.mockRestore();
  });

  it('handles mark as read error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetUserNotifications.mockResolvedValue(mockNotifications);
    mockMarkNotificationAsRead.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('notif1');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error marking notification as read:',
      expect.any(Error)
    );
    // State should remain unchanged on error
    expect(result.current.unreadCount).toBe(2);

    consoleErrorSpy.mockRestore();
  });

  it('updates state when user changes', async () => {
    const { result, rerender } = renderHook(() => useNotifications());

    // Initially with user
    mockGetUserNotifications.mockResolvedValue(mockNotifications);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.notifications).toHaveLength(3);

    // Change to no user
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    } as any);

    rerender();

    await waitFor(() => {
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it('calculates unread count correctly with all read notifications', async () => {
    const allReadNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
    mockGetUserNotifications.mockResolvedValue(allReadNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('calculates unread count correctly with all unread notifications', async () => {
    const allUnreadNotifications = mockNotifications.map(n => ({ ...n, isRead: false }));
    mockGetUserNotifications.mockResolvedValue(allUnreadNotifications);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(3);
  });
});
