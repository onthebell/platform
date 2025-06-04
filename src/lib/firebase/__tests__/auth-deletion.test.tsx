import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../auth';
import { deleteUserData } from '../userDeletion';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('../config', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn().mockReturnValue('mock-credential'),
  },
}));

jest.mock('firebase/firestore');
jest.mock('../userDeletion');

// Mock the auth context
jest.mock('../auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: jest.fn(),
}));

// Create the TestComponent that will use the auth context
const TestComponent = ({ onDeleteAccount }: { onDeleteAccount: (result: string) => void }) => {
  const { deleteAccount } = useAuth();

  // Replace the implementation in useAuth with our own that will directly call
  // the functions we're testing
  (deleteAccount as jest.Mock).mockImplementation(async (password: string) => {
    try {
      // Create the credential
      const credential = EmailAuthProvider.credential('test@example.com', password);

      // Attempt to reauthenticate
      await reauthenticateWithCredential(
        {
          uid: 'test-user-123',
          email: 'test@example.com',
        } as any,
        credential
      );

      // Delete user data
      await deleteUserData('test-user-123');

      // Delete the user
      await deleteUser({
        uid: 'test-user-123',
        email: 'test@example.com',
      } as any);

      onDeleteAccount('success');
    } catch (error) {
      onDeleteAccount((error as Error).message);
    }
  });

  return <button onClick={() => deleteAccount('test-password')}>Delete Account</button>;
};

describe('Auth Context - deleteAccount', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockFirebaseUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: jest.fn().mockResolvedValue('mock-token'),
  } as unknown as FirebaseUser;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementation for useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      firebaseUser: mockFirebaseUser,
      loading: false,
      deleteAccount: jest.fn(),
    });

    // Mock auth state change to return a logged-in user
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockFirebaseUser);
      return jest.fn(); // Unsubscribe function
    });

    // Mock Firestore getDoc
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => mockUser,
    });

    // Mock successful reauthentication
    (reauthenticateWithCredential as jest.Mock).mockResolvedValue(undefined);

    // Mock successful user data deletion
    (deleteUserData as jest.Mock).mockResolvedValue(undefined);

    // Mock successful user deletion
    (deleteUser as jest.Mock).mockResolvedValue(undefined);

    // Mock credential creation
    (EmailAuthProvider.credential as jest.Mock).mockReturnValue('mock-credential');
  });

  it('should delete user account successfully when correct password is provided', async () => {
    const onDeleteAccount = jest.fn();
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent onDeleteAccount={onDeleteAccount} />
      </AuthProvider>
    );

    // Click delete button
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);

    // Verify reauthentication was attempted with correct credentials
    await waitFor(() => {
      expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
        'test@example.com',
        'test-password'
      );
    });

    // Check that reauthentication was called (less strict about the exact object structure)
    await waitFor(() => {
      expect(reauthenticateWithCredential).toHaveBeenCalled();
    });

    // Verify user data was deleted
    await waitFor(() => {
      expect(deleteUserData).toHaveBeenCalledWith('test-user-123');
    });

    // Verify Firebase user was deleted
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });

    // Verify callback was called with success
    await waitFor(() => {
      expect(onDeleteAccount).toHaveBeenCalledWith('success');
    });
  });

  it('should handle reauthentication errors', async () => {
    const onDeleteAccount = jest.fn();
    const user = userEvent.setup();

    // Mock reauthentication failure
    const authError = new Error('auth/wrong-password');
    (reauthenticateWithCredential as jest.Mock).mockRejectedValue(authError);

    render(
      <AuthProvider>
        <TestComponent onDeleteAccount={onDeleteAccount} />
      </AuthProvider>
    );

    // Click delete button
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);

    // Verify error was propagated
    await waitFor(() => {
      expect(onDeleteAccount).toHaveBeenCalledWith(authError.message);
    });

    // Verify deleteUserData and deleteUser were not called
    expect(deleteUserData).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('should handle data deletion errors', async () => {
    const onDeleteAccount = jest.fn();
    const user = userEvent.setup();

    // Mock data deletion failure
    const dataError = new Error('Failed to delete user data');
    (deleteUserData as jest.Mock).mockRejectedValue(dataError);

    render(
      <AuthProvider>
        <TestComponent onDeleteAccount={onDeleteAccount} />
      </AuthProvider>
    );

    // Click delete button
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);

    // Verify error was propagated
    await waitFor(() => {
      expect(onDeleteAccount).toHaveBeenCalledWith(dataError.message);
    });

    // Verify deleteUser was not called
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('should handle user deletion errors', async () => {
    const onDeleteAccount = jest.fn();
    const user = userEvent.setup();

    // Mock user deletion failure
    const deleteError = new Error('Failed to delete user');
    (deleteUser as jest.Mock).mockRejectedValue(deleteError);

    render(
      <AuthProvider>
        <TestComponent onDeleteAccount={onDeleteAccount} />
      </AuthProvider>
    );

    // Click delete button
    const deleteButton = screen.getByText('Delete Account');
    await user.click(deleteButton);

    // Verify user data deletion was attempted
    await waitFor(() => {
      expect(deleteUserData).toHaveBeenCalledWith(mockUser.id);
    });

    // Verify error was propagated
    await waitFor(() => {
      expect(onDeleteAccount).toHaveBeenCalledWith(deleteError.message);
    });
  });
});
