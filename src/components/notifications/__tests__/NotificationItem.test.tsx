import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from '../NotificationItem';
import { Notification } from '@/types';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}));

describe('NotificationItem', () => {
  const mockOnMarkAsRead = jest.fn();

  const baseNotification: Notification = {
    id: '1',
    title: 'Test Notification',
    message: 'This is a test notification message',
    type: 'info',
    isRead: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    userId: 'user1',
  };

  beforeEach(() => {
    mockOnMarkAsRead.mockClear();
  });

  it('renders notification with all information', () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('shows unread indicator for unread notifications', () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    // Check for blue dot indicator (unread notification)
    const unreadIndicator = document.querySelector('.bg-blue-600.rounded-full');
    expect(unreadIndicator).toBeInTheDocument();
  });

  it('does not show unread indicator for read notifications', () => {
    const readNotification: Notification = {
      ...baseNotification,
      isRead: true,
    };

    render(<NotificationItem notification={readNotification} onMarkAsRead={mockOnMarkAsRead} />);

    // Should not have unread indicator
    const unreadIndicator = document.querySelector('.bg-blue-600.rounded-full');
    expect(unreadIndicator).not.toBeInTheDocument();
  });

  it('applies different styles for unread notifications', () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const container = screen.getByTestId('notification-item');
    expect(container).toHaveClass('bg-blue-50');

    const title = screen.getByText('Test Notification');
    expect(title).toHaveClass('font-semibold');
  });

  it('applies normal styles for read notifications', () => {
    const readNotification: Notification = {
      ...baseNotification,
      isRead: true,
    };

    render(<NotificationItem notification={readNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const container = screen.getByTestId('notification-item');
    expect(container).not.toHaveClass('bg-blue-50');
  });

  it('calls onMarkAsRead when clicked and notification is unread', async () => {
    const user = userEvent.setup();

    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const notificationElement = screen.getByTestId('notification-item');
    await user.click(notificationElement);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('does not call onMarkAsRead when clicked and notification is already read', async () => {
    const user = userEvent.setup();
    const readNotification: Notification = {
      ...baseNotification,
      isRead: true,
    };

    render(<NotificationItem notification={readNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const notificationElement = screen.getByTestId('notification-item');
    await user.click(notificationElement);

    expect(mockOnMarkAsRead).not.toHaveBeenCalled();
  });

  it('renders as link when actionUrl is provided', () => {
    const notificationWithAction: Notification = {
      ...baseNotification,
      actionUrl: '/test-link',
    };

    render(
      <NotificationItem notification={notificationWithAction} onMarkAsRead={mockOnMarkAsRead} />
    );

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/test-link');
  });

  it('renders different notification types with correct icons', () => {
    const notificationTypes = ['info', 'success', 'warning', 'error'] as const;

    notificationTypes.forEach(type => {
      const notification: Notification = {
        ...baseNotification,
        type,
        id: `test-${type}`,
      };

      const { container } = render(
        <NotificationItem notification={notification} onMarkAsRead={mockOnMarkAsRead} />
      );

      // Check that an icon is rendered (SVG element)
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  it('has mobile-responsive classes', () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const container = screen.getByTestId('notification-item');
    expect(container).toHaveClass('space-x-2', 'sm:space-x-3', 'p-3', 'sm:p-4', 'touch-target');

    // Check the combined title and message paragraph has responsive text classes
    const textContent = container.querySelector('p');
    expect(textContent).toHaveClass('text-xs', 'sm:text-sm');

    // Check that the title span has font-semibold class
    const title = screen.getByText('Test Notification');
    expect(title).toHaveClass('font-semibold');
  });

  it('handles long notification messages gracefully', () => {
    const longNotification: Notification = {
      ...baseNotification,
      message:
        'This is a very long notification message that should wrap properly and not break the layout of the notification item component when displayed on mobile devices',
    };

    render(<NotificationItem notification={longNotification} onMarkAsRead={mockOnMarkAsRead} />);

    const message = screen.getByText(/This is a very long notification message/);
    expect(message).toHaveClass('leading-relaxed');
  });

  it('handles notifications without action URL', () => {
    render(<NotificationItem notification={baseNotification} onMarkAsRead={mockOnMarkAsRead} />);

    // Should not render as a link
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // Should still render the notification content
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });
});
