import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Password is required to confirm deletion');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(password);
      // If successful, the user will be signed out and redirected
    } catch (error) {
      let errorMessage = 'Failed to delete account';
      if (error instanceof Error) {
        // Handle Firebase auth errors
        if (
          error.message.includes('auth/wrong-password') ||
          error.message.includes('auth/invalid-credential')
        ) {
          errorMessage = 'Incorrect password';
        } else if (error.message.includes('auth/too-many-requests')) {
          errorMessage = 'Too many attempts. Try again later';
        } else if (error.message.includes('auth/requires-recent-login')) {
          errorMessage =
            'For security, please sign out and sign in again before deleting your account';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPassword('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-red-700 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-600" />
              Delete Account
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This action <span className="font-bold">permanently deletes</span> your account and
              all associated data including:
            </p>
            <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
              <li>Your profile information</li>
              <li>All posts you've created</li>
              <li>All comments you've made</li>
              <li>Your verification status and documents</li>
              <li>Your follows and followers</li>
              <li>Your notification preferences</li>
            </ul>
            <p className="text-red-600 font-medium">This action cannot be undone.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Your password"
                disabled={isSubmitting}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
