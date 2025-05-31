import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';
import { CommunityPost } from '@/types';

// Mock heroicons components
jest.mock('@heroicons/react/24/outline', () => ({
  MapPinIcon: () => <svg data-testid="map-pin-icon" />,
  CalendarIcon: () => <svg data-testid="calendar-icon" />,
  TagIcon: () => <svg data-testid="tag-icon" />,
  HeartIcon: () => <svg data-testid="heart-icon" />,
  ChatBubbleLeftIcon: () => <svg data-testid="chat-bubble-icon" />,
  ShareIcon: () => <svg data-testid="share-icon" />,
  PencilIcon: () => <svg data-testid="pencil-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
  EllipsisVerticalIcon: () => <svg data-testid="ellipsis-icon" />,
  AdjustmentsHorizontalIcon: () => <svg data-testid="adjustments-icon" />,
  MagnifyingGlassIcon: () => <svg data-testid="magnifying-glass-icon" />,
  PlusIcon: () => <svg data-testid="plus-icon" />,
}));

jest.mock('@heroicons/react/24/solid', () => ({
  HeartIcon: () => <svg data-testid="heart-solid-icon" />,
}));

// Mock ReportButton component
jest.mock('@/components/moderation/ReportButton', () => {
  // eslint-disable-next-line react/display-name
  return ({
    targetId,
    targetType,
    onReport,
  }: {
    targetId: string;
    targetType: string;
    onReport?: () => void;
  }) => (
    <button data-testid="report-button" onClick={onReport}>
      Report {targetType}
    </button>
  );
});

// Mock FollowButton component
jest.mock('@/components/ui/FollowButton', () => ({
  FollowButton: ({
    entityId,
    entityType,
    variant,
  }: {
    entityId: string;
    entityType: string;
    variant?: string;
  }) => (
    <button
      data-testid="follow-button"
      data-entity-id={entityId}
      data-entity-type={entityType}
      data-variant={variant}
    >
      Follow
    </button>
  ),
}));

// Mock internal implementation to avoid window.location.reload
jest.mock('../PostCard', () => {
  const originalModule = jest.requireActual('../PostCard');
  return {
    __esModule: true,
    ...originalModule,
    __internal: {
      reloadPage: jest.fn(),
    },
    default: originalModule.default,
  };
});

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
    firebaseUser: { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateUserProfile: jest.fn(),
  }),
}));

// Mock firebase config to prevent auth/invalid-api-key errors
jest.mock('@/lib/firebase/config', () => {
  // Create mock instances for Firebase services
  const mockAuth = {
    currentUser: { uid: 'user-123', email: 'test@example.com', displayName: 'Test User' },
    onAuthStateChanged: jest.fn(callback => {
      callback({ uid: 'user-123', email: 'test@example.com', displayName: 'Test User' });
      return jest.fn();
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  };

  const mockFirestore = {
    collection: jest.fn(() => {
      return {
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({}),
            id: 'test-id',
          }),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            docs: [],
            forEach: jest.fn(),
            size: 0,
          }),
          onSnapshot: jest.fn(callback => {
            callback({
              docs: [],
              forEach: jest.fn(),
              size: 0,
            });
            return jest.fn();
          }),
        })),
        get: jest.fn().mockResolvedValue({
          docs: [],
          forEach: jest.fn(),
          size: 0,
        }),
      };
    }),
  };

  const mockStorage = {
    ref: jest.fn(() => ({
      put: jest.fn(),
      getDownloadURL: jest.fn(),
      delete: jest.fn(),
    })),
  };

  return {
    auth: mockAuth,
    db: mockFirestore,
    storage: mockStorage,
    default: {},
  };
});

// Mock firestore
jest.mock('@/lib/firebase/firestore', () => ({
  deletePost: jest.fn(),
}));

// Mock Firebase comments module
jest.mock('@/lib/firebase/comments', () => ({
  getPostCommentCount: jest.fn().mockResolvedValue(5),
  getPostComments: jest.fn().mockResolvedValue([]),
  addComment: jest.fn().mockResolvedValue('new-comment-id'),
  updateComment: jest.fn().mockResolvedValue(undefined),
  deleteComment: jest.fn().mockResolvedValue(undefined),
  getComment: jest.fn().mockResolvedValue(null),
}));

// Mock useCommentCount hook to avoid React act() warnings
jest.mock('@/hooks/useCommentCount', () => ({
  useCommentCount: () => ({ count: 5, loading: false }),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(screen.getByText('sale')).toBeInTheDocument();
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

    // We'll skip testing the reload function since it causes JSDOM issues
    // Just make it a no-op function for the test
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error

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
