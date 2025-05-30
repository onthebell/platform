'use client';

/**
 * Quick Admin User Creator
 *
 * This is a temporary utility to create admin users for testing.
 * In production, admin users should be created through a secure process.
 */

import { useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '@/types';

export default function CreateAdminUser() {
  const [email, setEmail] = useState('admin@onthebell.com');
  const [password, setPassword] = useState('admin123456');
  const [displayName, setDisplayName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      await updateProfile(result.user, { displayName });

      // Create admin user profile in Firestore
      const adminUser: User = {
        id: result.user.uid,
        email: result.user.email!,
        displayName,
        photoURL: null,
        isVerified: true,
        verificationStatus: 'approved',
        address: {
          street: '123 Admin Street',
          suburb: 'Geelong',
          postcode: '3220',
          state: 'VIC',
          country: 'Australia',
          coordinates: { lat: -38.1499, lng: 144.3617 },
        },
        joinedAt: new Date(),
        lastActive: new Date(),
        role: 'super_admin',
        permissions: [
          'manage_posts',
          'manage_users',
          'manage_reports',
          'manage_events',
          'manage_businesses',
          'view_analytics',
          'manage_moderators',
        ],
        isSuspended: false,
      };

      await setDoc(doc(db, 'users', result.user.uid), adminUser);

      setMessage('Admin user created successfully! You can now sign in.');
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : 'Failed to create admin user'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Admin User</h2>
      <p className="text-sm text-gray-600 mb-4">
        This is for development testing only. In production, admin users should be created securely.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
