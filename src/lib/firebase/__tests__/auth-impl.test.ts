import { deleteAccount } from '../auth-impl';
import { deleteUserData } from '../userDeletion';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  deleteUser: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn().mockReturnValue('mock-credential'),
  },
}));

// Mock userDeletion module
jest.mock('../userDeletion', () => ({
  deleteUserData: jest.fn(),
}));

describe('Account Deletion Implementation', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockFirebaseUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful reauthentication
    (reauthenticateWithCredential as jest.Mock).mockResolvedValue(undefined);

    // Mock successful user data deletion
    (deleteUserData as jest.Mock).mockResolvedValue(undefined);

    // Mock successful user deletion
    (deleteUser as jest.Mock).mockResolvedValue(undefined);
  });

  test('should reauth user, delete data, and delete Firebase account', async () => {
    // Execute
    await deleteAccount(mockFirebaseUser as any, mockUser as any, 'test-password');

    // Verify flow
    expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
      mockFirebaseUser.email,
      'test-password'
    );
    expect(reauthenticateWithCredential).toHaveBeenCalledWith(mockFirebaseUser, 'mock-credential');
    expect(deleteUserData).toHaveBeenCalledWith(mockUser.id);
    expect(deleteUser).toHaveBeenCalledWith(mockFirebaseUser);
  });

  test('should throw error when reauthentication fails', async () => {
    // Setup
    const authError = new Error('auth/wrong-password');
    (reauthenticateWithCredential as jest.Mock).mockRejectedValue(authError);

    // Execute & Verify
    await expect(
      deleteAccount(mockFirebaseUser as any, mockUser as any, 'wrong-password')
    ).rejects.toThrow('auth/wrong-password');

    // Ensure subsequent steps were not called
    expect(deleteUserData).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  test('should throw error when data deletion fails', async () => {
    // Setup
    const dataError = new Error('Failed to delete user data');
    (deleteUserData as jest.Mock).mockRejectedValue(dataError);

    // Execute & Verify
    await expect(
      deleteAccount(mockFirebaseUser as any, mockUser as any, 'test-password')
    ).rejects.toThrow('Failed to delete user data');

    // Ensure auth was attempted but user deletion was not
    expect(reauthenticateWithCredential).toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  test('should throw error when Firebase user deletion fails', async () => {
    // Setup
    const deleteError = new Error('Failed to delete user');
    (deleteUser as jest.Mock).mockRejectedValue(deleteError);

    // Execute & Verify
    await expect(
      deleteAccount(mockFirebaseUser as any, mockUser as any, 'test-password')
    ).rejects.toThrow('Failed to delete user');

    // Ensure previous steps were attempted
    expect(reauthenticateWithCredential).toHaveBeenCalled();
    expect(deleteUserData).toHaveBeenCalledWith(mockUser.id);
  });

  test('should throw error when no user or firebase user is provided', async () => {
    // Execute & Verify
    await expect(deleteAccount(null as any, mockUser as any, 'test-password')).rejects.toThrow(
      'You must be logged in to delete your account'
    );

    await expect(
      deleteAccount(mockFirebaseUser as any, null as any, 'test-password')
    ).rejects.toThrow('You must be logged in to delete your account');

    // Ensure no steps were attempted
    expect(reauthenticateWithCredential).not.toHaveBeenCalled();
    expect(deleteUserData).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });
});
