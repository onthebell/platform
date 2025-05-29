import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostsGrid from '../PostsGrid';
import { CommunityPost } from '@/types';

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Link component to simulate navigation
jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
    [key: string]: unknown;
  }) => (
    <a
      href={href}
      {...props}
      onClick={e => {
        e.preventDefault();
        if (onClick) onClick(e);
        mockPush(href);
      }}
    >
      {children}
    </a>
  );
});

// Mock auth
jest.mock('@/lib/firebase/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

describe('PostsGrid Component', () => {
  const mockPosts: CommunityPost[] = [
    {
      id: 'post-1',
      title: 'First Post',
      description: 'Description for first post',
      category: 'marketplace' as const,
      type: 'sale' as const,
      authorId: 'user-1',
      authorName: 'User One',
      createdAt: new Date('2023-12-15T10:00:00Z'),
      updatedAt: new Date('2023-12-15T10:00:00Z'),
      status: 'active' as const,
      visibility: 'public' as const,
      tags: [],
    },
    {
      id: 'post-2',
      title: 'Second Post',
      description: 'Description for second post',
      category: 'events' as const,
      type: 'event' as const,
      authorId: 'user-2',
      authorName: 'User Two',
      createdAt: new Date('2023-12-16T10:00:00Z'),
      updatedAt: new Date('2023-12-16T10:00:00Z'),
      status: 'active' as const,
      visibility: 'public' as const,
      tags: [],
    },
    {
      id: 'post-3',
      title: 'Free Item',
      description: 'Free item description',
      category: 'free_items' as const,
      type: 'free' as const,
      authorId: 'user-3',
      authorName: 'User Three',
      createdAt: new Date('2023-12-17T10:00:00Z'),
      updatedAt: new Date('2023-12-17T10:00:00Z'),
      status: 'active' as const,
      visibility: 'public' as const,
      tags: [],
    },
  ];

  const defaultProps = {
    posts: mockPosts,
    title: 'Test Posts',
    showFilters: true,
    showCreateButton: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders posts grid with title', () => {
    render(<PostsGrid {...defaultProps} />);

    expect(screen.getByText('Test Posts')).toBeInTheDocument();
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('Free Item')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    render(<PostsGrid posts={mockPosts} />);

    expect(screen.queryByText('Test Posts')).not.toBeInTheDocument();
    expect(screen.getByText('First Post')).toBeInTheDocument();
  });

  it('shows create button when showCreateButton is true', () => {
    render(<PostsGrid {...defaultProps} />);

    const createButton = screen.getByText('Create Post');
    expect(createButton).toBeInTheDocument();
  });

  it('hides create button when showCreateButton is false', () => {
    render(<PostsGrid {...defaultProps} showCreateButton={false} />);

    expect(screen.queryByText('Create Post')).not.toBeInTheDocument();
  });

  it('shows filters when showFilters is true', () => {
    render(<PostsGrid {...defaultProps} />);

    expect(screen.getByPlaceholderText(/search posts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
  });

  it('hides filters when showFilters is false', () => {
    render(<PostsGrid {...defaultProps} showFilters={false} />);

    expect(screen.queryByPlaceholderText(/search posts/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/filter by category/i)).not.toBeInTheDocument();
  });

  it('filters posts by search term', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'First');

    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.queryByText('Second Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Free Item')).not.toBeInTheDocument();
  });

  it('filters posts by category', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const categorySelect = screen.getByLabelText(/filter by category/i);
    await user.selectOptions(categorySelect, 'events');

    expect(screen.queryByText('First Post')).not.toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.queryByText('Free Item')).not.toBeInTheDocument();
  });

  it('shows all posts when "All Categories" is selected', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const categorySelect = screen.getByLabelText(/filter by category/i);
    await user.selectOptions(categorySelect, 'events');
    await user.selectOptions(categorySelect, 'all');

    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('Free Item')).toBeInTheDocument();
  });

  it('combines search and category filters', async () => {
    const user = userEvent.setup();
    const postsWithSimilarTitles = [
      ...mockPosts,
      {
        id: 'post-4',
        title: 'First Event',
        description: 'Event description',
        category: 'events' as const,
        type: 'event' as const,
        authorId: 'user-4',
        authorName: 'User Four',
        createdAt: new Date('2023-12-18T10:00:00Z'),
        updatedAt: new Date('2023-12-18T10:00:00Z'),
        status: 'active' as const,
        visibility: 'public' as const,
        tags: [],
      },
    ];

    render(<PostsGrid {...defaultProps} posts={postsWithSimilarTitles} />);

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    const categorySelect = screen.getByLabelText(/filter by category/i);

    await user.type(searchInput, 'First');
    await user.selectOptions(categorySelect, 'events');

    expect(screen.queryByText('First Post')).not.toBeInTheDocument();
    expect(screen.getByText('First Event')).toBeInTheDocument();
    expect(screen.queryByText('Second Post')).not.toBeInTheDocument();
  });

  it('shows no posts message when no posts match filters', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'NonexistentPost');

    expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
  });

  it('shows empty state when no posts provided', () => {
    render(<PostsGrid posts={[]} title="Empty Posts" />);

    expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search posts/i);
    await user.type(searchInput, 'First');

    expect(searchInput).toHaveValue('First');

    // Simulate clear button click (usually an X icon)
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(searchInput).toHaveValue('');
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  it('navigates to create post when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<PostsGrid {...defaultProps} />);

    const createButton = screen.getByText('Create Post');
    await user.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/community/create');
  });

  it('renders posts in responsive grid layout', () => {
    render(<PostsGrid {...defaultProps} />);

    const gridContainer = screen.getByTestId('posts-grid');
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('handles posts with different categories correctly', () => {
    render(<PostsGrid {...defaultProps} />);

    // Check that all different categories are displayed
    expect(screen.getByText('First Post')).toBeInTheDocument(); // marketplace
    expect(screen.getByText('Second Post')).toBeInTheDocument(); // events
    expect(screen.getByText('Free Item')).toBeInTheDocument(); // free_items
  });
});
