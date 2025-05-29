import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Comment } from '../Comment';
import { useAuth } from '@/lib/firebase/auth';
import type { Comment as CommentType, User } from '@/types';

// Mock Firebase auth
jest.mock('@/lib/firebase/auth', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockComment: CommentType = {
  id: 'comment-1',
  postId: 'post-1',
  authorId: 'user-1',
  authorName: 'John Doe',
  content: 'This is a test comment',
  createdAt: new Date('2023-01-01T10:00:00Z'),
  updatedAt: new Date('2023-01-01T10:00:00Z'),
  isEdited: false,
};

const mockOnDelete = jest.fn();
const mockOnUpdate = jest.fn();

const createMockUser = (id: string): User => ({
  id,
  email: `${id}@example.com`,
  displayName: 'Test User',
  photoURL: null,
  isVerified: false,
  verificationStatus: 'none',
  joinedAt: new Date(),
  lastActive: new Date(),
});

describe('Comment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });
  });

  it('renders comment content and author', () => {
    render(<Comment comment={mockComment} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows delete button for comment author', () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser('user-1'),
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    render(<Comment comment={mockComment} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('hides delete button for other users', () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser('user-2'),
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    render(<Comment comment={mockComment} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: createMockUser('user-1'),
      firebaseUser: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    render(<Comment comment={mockComment} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('comment-1');
    });
  });

  it('shows edited indicator when comment is edited', () => {
    const editedComment: CommentType = {
      ...mockComment,
      isEdited: true,
      updatedAt: new Date('2023-01-01T11:00:00Z'),
    };

    render(<Comment comment={editedComment} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);

    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });
});
