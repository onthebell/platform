import { render, screen } from '@testing-library/react';
import CommunityPage from '../page';

// Mock the firestore module to prevent data fetching during tests
jest.mock('../../../../lib/firebase/firestore', () => ({
  getPosts: jest.fn().mockResolvedValue([]),
}));

// Mock Firebase comments module
jest.mock('../../../../lib/firebase/comments', () => ({
  getPostCommentCount: jest.fn().mockResolvedValue(5),
  getPostComments: jest.fn().mockResolvedValue([]),
  addComment: jest.fn().mockResolvedValue('new-comment-id'),
  updateComment: jest.fn().mockResolvedValue(undefined),
  deleteComment: jest.fn().mockResolvedValue(undefined),
  getComment: jest.fn().mockResolvedValue(null),
}));

// Mock useCommentCount hook to avoid React act() warnings
jest.mock('../../../../hooks/useCommentCount', () => ({
  useCommentCount: () => ({ count: 5, loading: false }),
}));

// Mock Firebase auth
jest.mock('../../../../lib/firebase/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    firebaseUser: { uid: 'user-123', email: 'test@example.com' },
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    updateUserProfile: jest.fn(),
  }),
}));

// Mock firebase config to prevent auth/invalid-api-key errors
jest.mock('../../../../lib/firebase/config', () => {
  // Create mock instances for Firebase services
  const mockAuth = {
    currentUser: { uid: 'user-123', email: 'test@example.com' },
    onAuthStateChanged: jest.fn(callback => {
      callback({ uid: 'user-123', email: 'test@example.com' });
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

describe('Community Page', () => {
  it('renders community heading', () => {
    render(<CommunityPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Community');
  });
});
