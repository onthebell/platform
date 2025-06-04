import {
  User as FirebaseUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth';
import { User } from '../../types';
import { deleteUserData } from './userDeletion';

/**
 * Core implementation of the account deletion functionality
 * This is extracted to allow direct testing without the React context
 */
export async function deleteAccount(
  firebaseUser: FirebaseUser,
  user: User,
  password: string
): Promise<void> {
  if (!user || !firebaseUser) {
    throw new Error('You must be logged in to delete your account');
  }

  try {
    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(firebaseUser.email!, password);
    await reauthenticateWithCredential(firebaseUser, credential);

    // Delete user data from Firestore
    await deleteUserData(user.id);

    // Delete Firebase Auth user
    await deleteUser(firebaseUser);
  } catch (error) {
    throw error;
  }
}
