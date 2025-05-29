import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';
import { CommunityPost } from '@/types';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

jest.mock('@/lib/firebase/auth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock firestore
jest.mock('@/lib/firebase/firestore', () => ({
  deletePost: jest.fn(),
}));

// Get the mocked function after the mock is created
import { deletePost as mockDeletePost } from '@/lib/firebase/firestore';
const mockedDeletePost = jest.mocked(mockDeletePost);

// Mock utils
jest.mock('@/lib/utils', () => ({
  formatRelativeTime: jest.fn(() => '2 hours ago'),
  formatShortDate: jest.fn(() => 'Dec 15'),
}));

describe('PostCard Component', () => {
  const mockPost: CommunityPost = {
    id: 'post-123',
    title: 'Test Post Title',
    description: 'This is a test post description',
    category: 'marketplace',
    type: 'sale',
    authorId: 'user-123',
    authorName: 'Test Author',
    createdAt: new Date('2023-12-15T10:00:00Z'),
    updatedAt: new Date('2023-12-15T10:00:00Z'),
    images: ['https://example.com/image1.jpg'],
    price: 100,
    currency: 'AUD',
    tags: ['electronics', 'laptop'],
    location: {
      address: '123 Test Street, Test Suburb VIC 3000',
      lat: -38.0,
      lng: 144.0,
    },
    status: 'active',
    visibility: 'public',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post card with all basic information', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test post description')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('$100 AUD')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<PostCard post={mockPost} isCompact />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    // Should still show basic information in compact mode
  });

  it('displays category and type badges', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('marketplace')).toBeInTheDocument();
    expect(screen.getByText('sell')).toBeInTheDocument();
  });

  it('shows images when available', () => {
    render(<PostCard post={mockPost} />);

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('displays tags', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('laptop')).toBeInTheDocument();
  });

  it('shows location information', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('123 Test Street, Test Suburb VIC 3000')).toBeInTheDocument();
  });

  it('handles like button click', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const likeButton = screen.getByLabelText(/like post/i);
    await user.click(likeButton);

    // Should toggle like state
    expect(likeButton).toBeInTheDocument();
  });

  it('handles share button click', async () => {
    // Mock navigator.share
    Object.assign(navigator, {
      share: jest.fn().mockResolvedValue(undefined),
    });

    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const shareButton = screen.getByLabelText(/share post/i);
    await user.click(shareButton);

    expect(navigator.share).toHaveBeenCalled();
  });

  it('shows options menu for post owner', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const optionsButton = screen.getByLabelText(/post options/i);
    await user.click(optionsButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles edit action', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const optionsButton = screen.getByLabelText(/post options/i);
    await user.click(optionsButton);

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/community/edit/post-123');
  });

  it('handles delete action with confirmation', async () => {
    const user = userEvent.setup();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
    mockedDeletePost.mockResolvedValue(undefined);

    render(<PostCard post={mockPost} />);

    const optionsButton = screen.getByLabelText(/post options/i);
    await user.click(optionsButton);

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this post?');
    await waitFor(() => {
      expect(mockedDeletePost).toHaveBeenCalledWith('post-123');
    });
  });

  it('does not show options menu for non-owner', () => {
    const nonOwnerPost = { ...mockPost, authorId: 'different-user' };
    render(<PostCard post={nonOwnerPost} />);

    expect(screen.queryByLabelText(/post options/i)).not.toBeInTheDocument();
  });

  it('navigates to post detail when clicked', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const postTitle = screen.getByText('Test Post Title');
    await user.click(postTitle);

    expect(mockPush).toHaveBeenCalledWith('/community/post-123');
  });

  it('handles post without images', () => {
    const postWithoutImages = { ...mockPost, images: [] };
    render(<PostCard post={postWithoutImages} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles post without price', () => {
    const postWithoutPrice = { ...mockPost, price: undefined };
    render(<PostCard post={postWithoutPrice} />);

    expect(screen.queryByText(/\$100/)).not.toBeInTheDocument();
  });

  it('handles post without location', () => {
    const postWithoutLocation = { ...mockPost, location: undefined };
    render(<PostCard post={postWithoutLocation} />);

    expect(screen.queryByText(/123 Test Street/)).not.toBeInTheDocument();
  });

  it('closes options menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<PostCard post={mockPost} />);

    const optionsButton = screen.getByLabelText(/post options/i);
    await user.click(optionsButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });
  });
});
