import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { CommunityPost, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const samplePosts: Partial<CommunityPost>[] = [
      {
        title: 'Free Piano - Must Go This Week!',
        description:
          'Moving house and need to give away our upright piano. Works perfectly, just needs tuning.',
        content:
          "Hi everyone! We're moving interstate next week and unfortunately can't take our beautiful upright piano with us.",
        category: 'free_items',
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
        title: 'Local Farmers Market - Every Saturday',
        description: "Don't miss the weekly farmers market at Drysdale with fresh local produce!",
        content: 'Come down to the Drysdale Farmers Market every Saturday from 8 AM to 2 PM!',
        category: 'events',
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
      {
        title: 'Community BBQ at Queenscliff Beach',
        description: 'Join us for a fun community BBQ this Sunday!',
        content: 'Bring your family and friends for a great day at the beach with food and fun.',
        category: 'events',
        authorId: 'sample-user-3',
        authorName: 'Sarah Johnson',
        location: {
          lat: -38.2667,
          lng: 144.65,
          address: 'Queenscliff Beach, VIC 3225',
        },
        status: 'active',
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['bbq', 'community', 'beach', 'family'],
        isHidden: false,
        isDeleted: false,
        likes: 32,
        commentCount: 12,
        views: 180,
      },
      {
        title: 'Looking for a Local Handyman',
        description: 'Need help with some home repairs in Portarlington.',
        content: 'I need someone reliable to help fix a leaky faucet and repair some deck boards.',
        category: 'help_requests',
        authorId: 'sample-user-4',
        authorName: 'Mike Wilson',
        location: {
          lat: -38.1,
          lng: 144.65,
          address: 'Portarlington, VIC 3223',
        },
        status: 'active',
        visibility: 'verified_only',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['handyman', 'repairs', 'help'],
        isHidden: false,
        isDeleted: false,
        likes: 8,
        commentCount: 5,
        views: 95,
      },
      {
        title: 'Fresh Fish for Sale - Direct from Boat',
        description: 'Daily fresh catch available at Portarlington Pier.',
        content: 'I sell fresh fish caught daily from my boat. Best prices on the peninsula!',
        category: 'marketplace',
        authorId: 'sample-user-5',
        authorName: 'Captain Bob',
        location: {
          lat: -38.1,
          lng: 144.65,
          address: 'Portarlington Pier, VIC 3223',
        },
        status: 'active',
        visibility: 'public',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['fish', 'fresh', 'seafood', 'pier'],
        isHidden: false,
        isDeleted: false,
        likes: 28,
        commentCount: 10,
        views: 210,
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
        email: 'sarah.johnson@email.com',
        displayName: 'Sarah Johnson',
        photoURL: null,
        isVerified: true,
        verificationStatus: 'approved',
        address: {
          street: '456 Point Lonsdale Road',
          suburb: 'Queenscliff',
          postcode: '3225',
          state: 'VIC',
          country: 'Australia',
          coordinates: { lat: -38.2667, lng: 144.65 },
        },
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
        lastActive: new Date(),
        role: 'user',
        permissions: [],
        isSuspended: false,
      },
      {
        email: 'mike.wilson@email.com',
        displayName: 'Mike Wilson',
        photoURL: null,
        isVerified: true,
        verificationStatus: 'approved',
        address: {
          street: '123 Pier Street',
          suburb: 'Portarlington',
          postcode: '3223',
          state: 'VIC',
          country: 'Australia',
          coordinates: { lat: -38.1, lng: 144.65 },
        },
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        role: 'user',
        permissions: [],
        isSuspended: false,
      },
      {
        email: 'captain.bob@email.com',
        displayName: 'Captain Bob',
        photoURL: null,
        isVerified: true,
        verificationStatus: 'approved',
        address: {
          street: '789 Marine Parade',
          suburb: 'Portarlington',
          postcode: '3223',
          state: 'VIC',
          country: 'Australia',
          coordinates: { lat: -38.1, lng: 144.65 },
        },
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        role: 'user',
        permissions: [],
        isSuspended: false,
      },
    ];

    // Add sample users
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      const userId = `sample-user-${i + 1}`;
      await setDoc(doc(db, 'users', userId), { id: userId, ...user });
    }

    // Add sample posts
    for (const post of samplePosts) {
      await addDoc(collection(db, 'posts'), post);
    }

    return NextResponse.json({
      message: 'Seed data created successfully!',
      data: {
        users: sampleUsers.length,
        posts: samplePosts.length,
      },
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to create seed data' }, { status: 500 });
  }
}
