import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationDropdown } from '../NotificationDropdown';
import { useFilteredNotifications } from '@/hooks/useFilteredNotifications';

// Mock the useFilteredNotifications hook
jest.mock('@/hooks/useFilteredNotifications', () => ({
  useFilteredNotifications: jest.fn(),
}));

// Mock Headless UI components
jest.mock('@headlessui/react', () => {
  const MockPopover = ({ children }: any) => <div data-testid="popover">{children()}</div>;
  MockPopover.displayName = 'MockPopover';
  MockPopover.Panel = ({ children, className }: any) => (
    <div data-testid="popover-panel" className={className}>
      {children}
    </div>
  );
  // @ts-expect-error nested components are not typed
  MockPopover.Panel.displayName = 'MockPopoverPanel';

  return {
    Popover: MockPopover,
    PopoverButton: ({ children, className, onClick }: any) => (
      <button data-testid="popover-button" className={className} onClick={onClick}>
        {children}
      </button>
    ),
    Transition: ({ children }: any) => <div data-testid="transition">{children}</div>,
    Fragment: ({ children }: any) => <>{children}</>,
  };
});

const mockUseFilteredNotifications = useFilteredNotifications as jest.MockedFunction<
  typeof useFilteredNotifications
>;

describe('NotificationDropdown', () => {
  const mockMarkAsRead = jest.fn();
  const mockMarkAllAsRead = jest.fn();

  beforeEach(() => {
    mockMarkAsRead.mockClear();
    mockMarkAllAsRead.mockClear();
  });

  it('renders with no notifications', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.getByTestId('popover-button')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
  });

  it('renders with unread notifications', () => {
    const mockNotifications = [
      {
        id: '1',
        title: 'Test Notification 1',
        message: 'Test message 1',
        type: 'info' as const,
        isRead: false,
        createdAt: new Date('2024-01-01'),
        userId: 'user1',
      },
      {
        id: '2',
        title: 'Test Notification 2',
        message: 'Test message 2',
        type: 'success' as const,
        isRead: true,
        createdAt: new Date('2024-01-02'),
        userId: 'user1',
      },
    ];

    mockUseFilteredNotifications.mockReturnValue({
      notifications: mockNotifications,
      loading: false,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
    expect(screen.getByText('You have 1 unread notification')).toBeInTheDocument();
    expect(screen.getByText('View all notifications')).toBeInTheDocument();
  });

  it('shows correct unread count in badge', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 5,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    const button = screen.getByTestId('popover-button');
    expect(button.textContent).toContain('5');
  });

  it('shows 99+ for unread count over 99', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 150,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    const button = screen.getByTestId('popover-button');
    expect(button.textContent).toContain('99+');
  });

  it('calls markAllAsRead when button is clicked', async () => {
    const user = userEvent.setup();

    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 3,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    const markAllButton = screen.getByText('Mark all read');
    await user.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: true,
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('handles plural notifications text correctly', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 2,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.getByText('You have 2 unread notifications')).toBeInTheDocument();
  });

  it('has mobile-responsive classes', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    const button = screen.getByTestId('popover-button');
    expect(button).toHaveClass('touch-target');
  });

  it('does not show mark all read button when no unread notifications', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [
        {
          id: '1',
          title: 'Read Notification',
          message: 'This is read',
          type: 'info' as const,
          isRead: true,
          createdAt: new Date(),
          userId: 'user1',
        },
      ],
      loading: false,
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
    expect(screen.queryByText(/You have .* unread/)).not.toBeInTheDocument();
  });

  it('does not show view all button when no notifications', () => {
    mockUseFilteredNotifications.mockReturnValue({
      notifications: [],
      loading: false,
      unreadCount: 0,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationDropdown />);

    expect(screen.queryByText('View all notifications')).not.toBeInTheDocument();
  });
});
