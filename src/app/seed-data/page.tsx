'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { CommunityPost, ContentReport, User } from '@/types';

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const samplePosts: Partial<CommunityPost>[] = [
    {
      title: 'Free Piano - Must Go This Week!',
      description:
        'Moving house and need to give away our upright piano. Works perfectly, just needs tuning.',
      content:
        "Hi everyone! We're moving interstate next week and unfortunately can't take our beautiful upright piano with us.",
      category: 'free_items',
      type: 'offer',
      authorId: 'sample-user-1',
      authorName: 'Emma Wilson',
      location: {
        lat: -38.2667,
        lng: 144.5167,
        address: 'Ocean Grove, VIC 3226',
      },
      status: 'active',
      visibility: 'verified_only',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['piano', 'free', 'furniture', 'music'],
      isHidden: false,
      isDeleted: false,
      likes: 15,
      commentCount: 8,
      views: 142,
    },
    {
      title: 'INAPPROPRIATE CONTENT - SHOULD BE HIDDEN',
      description: 'This post contains inappropriate content that violates community guidelines.',
      content: 'This is inappropriate content that should be hidden by moderators.',
      category: 'community',
      type: 'announcement',
      authorId: 'problem-user-1',
      authorName: 'Problem User',
      status: 'active',
      visibility: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      tags: ['inappropriate'],
      isHidden: true,
      isDeleted: false,
      moderationReason: 'Inappropriate content violating community guidelines',
      moderatedBy: 'admin-user-1',
      moderatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likes: 0,
      commentCount: 2,
      views: 25,
    },
    {
      title: 'Local Farmers Market - Every Saturday',
      description: "Don't miss the weekly farmers market at Drysdale with fresh local produce!",
      content: 'Come down to the Drysdale Farmers Market every Saturday from 8 AM to 2 PM!',
      category: 'events',
      type: 'event',
      authorId: 'sample-user-2',
      authorName: 'John Smith',
      location: {
        lat: -38.1833,
        lng: 144.6,
        address: 'Drysdale Community Centre, VIC 3222',
      },
      status: 'active',
      visibility: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      tags: ['farmers market', 'local', 'fresh produce', 'community'],
      isHidden: false,
      isDeleted: false,
      likes: 45,
      commentCount: 15,
      views: 320,
    },
  ];

  const sampleReports: Partial<ContentReport>[] = [
    {
      contentId: 'post-inappropriate',
      contentType: 'post',
      reporterId: 'sample-user-1',
      reporterName: 'John Smith',
      reason: 'inappropriate_content',
      description: 'This post contains offensive language and inappropriate content.',
      status: 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      contentAuthorId: 'sample-user-3',
    },
    {
      contentId: 'post-spam',
      contentType: 'post',
      reporterId: 'sample-user-2',
      reporterName: 'Emma Wilson',
      reason: 'spam',
      description: 'This looks like spam content trying to sell products.',
      status: 'resolved',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      reviewedBy: 'admin-user-1',
      action: 'content_removed',
      moderatorNotes: 'Post deleted as confirmed spam',
      contentAuthorId: 'sample-user-4',
    },
  ];

  const sampleUsers: Partial<User>[] = [
    {
      email: 'john.smith@email.com',
      displayName: 'John Smith',
      photoURL: null,
      isVerified: true,
      verificationStatus: 'approved',
      address: {
        street: '789 Bellarine Highway',
        suburb: 'Drysdale',
        postcode: '3222',
        state: 'VIC',
        country: 'Australia',
        coordinates: { lat: -38.1833, lng: 144.6 },
      },
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      role: 'user',
      permissions: [],
      isSuspended: false,
    },
    {
      email: 'emma.wilson@email.com',
      displayName: 'Emma Wilson',
      photoURL: null,
      isVerified: true,
      verificationStatus: 'approved',
      address: {
        street: '321 Ocean Road',
        suburb: 'Ocean Grove',
        postcode: '3226',
        state: 'VIC',
        country: 'Australia',
        coordinates: { lat: -38.2667, lng: 144.5167 },
      },
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      role: 'user',
      permissions: [],
      isSuspended: false,
    },
    {
      email: 'troublemaker@email.com',
      displayName: 'Problem User',
      photoURL: null,
      isVerified: true,
      verificationStatus: 'approved',
      address: {
        street: '999 Trouble Street',
        suburb: 'Portarlington',
        postcode: '3223',
        state: 'VIC',
        country: 'Australia',
        coordinates: { lat: -38.1, lng: 144.65 },
      },
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      role: 'user',
      permissions: [],
      isSuspended: true,
      suspensionReason: 'Repeated violations of community guidelines',
      suspensionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
    },
  ];

  const seedData = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Add sample users
      for (let i = 0; i < sampleUsers.length; i++) {
        const user = sampleUsers[i];
        const userId = `sample-user-${i + 1}`;
        await setDoc(doc(db, 'users', userId), { id: userId, ...user });
      }

      // Add sample posts
      for (const post of samplePosts) {
        await addDoc(collection(db, 'communityPosts'), post);
      }

      // Add sample reports
      for (const report of sampleReports) {
        await addDoc(collection(db, 'contentReports'), report);
      }

      setMessage('Sample data created successfully! You can now test the admin panel.');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to seed data'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seed Sample Data</h1>
          <p className="text-gray-600 mt-2">Create sample posts, users, and reports for testing</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Create Test Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will create sample community posts, users, and content reports to test the admin
            portal functionality.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-900 mb-2">What will be created:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 3 sample users (including 1 suspended user)</li>
                <li>• 3 community posts (including 1 hidden post)</li>
                <li>• 2 content reports (1 pending, 1 resolved)</li>
              </ul>
            </div>

            <button
              onClick={seedData}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Sample Data...' : 'Create Sample Data'}
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

        <div className="mt-8 text-center space-x-4">
          <a href="/create-admin" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Create Admin User
          </a>
          <a href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
}
