import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/community',
}));

// Mock auth with variable state
const mockSignOut = jest.fn();
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  isVerified: true,
};

const mockAuthState: {
  user: typeof mockUser | null;
  signOut: jest.Mock;
} = {
  user: mockUser,
  signOut: mockSignOut,
};

jest.mock('@/lib/firebase/auth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock NotificationDropdown
jest.mock('@/components/notifications', () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown">Notifications</div>,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state to logged in user
    mockAuthState.user = mockUser;
  });

  it('renders navbar with logo and main navigation', () => {
    render(<Navbar />);

    expect(screen.getByText('OnTheBell')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('shows user menu when user is logged in', () => {
    render(<Navbar />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const mobileMenuButton = screen.getByLabelText(/open main menu/i);
    expect(mobileMenuButton).toBeInTheDocument();

    await user.click(mobileMenuButton);
    // Mobile menu should be visible
  });

  it('navigates to correct pages when nav links are clicked', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(screen.getByText('Home'));
    expect(mockPush).toHaveBeenCalledWith('/');

    await user.click(screen.getByText('Community'));
    expect(mockPush).toHaveBeenCalledWith('/community');

    await user.click(screen.getByText('Events'));
    expect(mockPush).toHaveBeenCalledWith('/events');

    await user.click(screen.getByText('Marketplace'));
    expect(mockPush).toHaveBeenCalledWith('/marketplace');

    await user.click(screen.getByText('Deals'));
    expect(mockPush).toHaveBeenCalledWith('/deals');
  });

  it('handles user menu interactions', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const userButton = screen.getByText('Test User');
    await user.click(userButton);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('handles sign out', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const userButton = screen.getByText('Test User');
    await user.click(userButton);

    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('has responsive design classes', () => {
    render(<Navbar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'shadow-sm');
  });

  it('shows active page in navigation', () => {
    render(<Navbar />);

    // Should highlight current page based on pathname (/community)
    const communityButton = screen.getByText('Community');
    expect(communityButton.closest('button')).toHaveClass('text-blue-600');
  });

  it('has proper accessibility attributes', () => {
    render(<Navbar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    const mobileMenuButton = screen.getByLabelText(/open main menu/i);
    expect(mobileMenuButton).toHaveAttribute('aria-expanded');
  });

  it('shows sign in button when user is not logged in', () => {
    // Set auth state to signed out
    mockAuthState.user = null;

    render(<Navbar />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Join OnTheBell')).toBeInTheDocument();
  });
});
