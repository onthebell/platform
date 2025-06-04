# Account Deletion Feature

This document outlines the account deletion functionality implemented in the
OnTheBell platform.

## Overview

The account deletion feature allows users to permanently delete their account
along with all associated data from Firebase Auth, Firestore, and Storage. This
feature includes a security layer requiring password verification to prevent
unauthorized account deletion.

## Implementation Details

### 1. Auth Context - `deleteAccount` Function

Located in `src/lib/firebase/auth.tsx`, this function:

- Requires password re-authentication for security
- Calls the data deletion utility to remove Firestore/Storage data
- Deletes the Firebase Auth user account
- Handles various error scenarios

```typescript
const deleteAccount = async (password: string): Promise<void> => {
  if (!user || !firebaseUser) {
    throw new Error('You must be logged in to delete your account');
  }

  setLoading(true);
  try {
    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(
      firebaseUser.email!,
      password
    );
    await reauthenticateWithCredential(firebaseUser, credential);

    // Delete user data from Firestore
    await deleteUserData(user.id);

    // Delete Firebase Auth user
    await deleteUser(firebaseUser);
  } catch (error) {
    setLoading(false);
    throw error;
  }
};
```

### 2. User Data Deletion Utility

Located in `src/lib/firebase/userDeletion.ts`, this utility function:

- Removes all user-related Firestore documents
  - User profile data
  - User's posts and related comments
  - User's likes and follows
  - Notifications (received and triggered)
  - Verification requests and documents
- Deletes user's Storage files
  - Profile images
  - Post images
  - Verification documents

### 3. Delete Account Modal Component

Located in `src/components/profile/DeleteAccountModal.tsx`, this component:

- Provides a confirmation dialog with clear warning about data loss
- Requires password entry for security
- Displays appropriate error messages
- Shows loading state during deletion process

### 4. Integration with Profile Page

Located in `src/app/profile/page.tsx`, the deletion functionality is:

- Available in the "Danger Zone" section
- Triggered via the Delete Account button
- Handles user redirection after successful deletion

## Error Handling

The account deletion process handles various error scenarios:

- Invalid credentials
- Recent login required
- Network errors
- Permission errors
- Firestore/Storage deletion failures

## Testing

The account deletion functionality is tested with:

- Unit tests for `deleteUserData` function
- Component tests for `DeleteAccountModal`
- Integration tests for auth context's `deleteAccount` function
- Error scenario tests

## Security Considerations

1. Password re-authentication ensures only the account owner can delete their
   account
2. Clear warnings about permanent data loss
3. Comprehensive data cleanup to ensure no orphaned data remains
