import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth';
import { isAdmin } from '@/lib/admin';
import { faker } from '@faker-js/faker';

// Helper to delete all docs in a collection except for a specific user
async function deleteAllExceptUser(db: FirebaseFirestore.Firestore, userId: string) {
  const collections = [
    'users',
    'posts',
    'comments',
    'contentReports',
    'events',
    'businesses',
    'notifications',
  ];
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      if (!(col === 'users' && doc.id === userId)) {
        batch.delete(doc.ref);
      }
    });
    await batch.commit();
  }
}

// Helper to create demo data
async function createDemoData(db: FirebaseFirestore.Firestore, userId: string) {
  // Create demo users (except the logged-in user)
  for (let i = 0; i < 10; i++) {
    const fakeUser = {
      email: faker.internet.email(),
      displayName: faker.person.fullName(),
      photoURL: faker.image.avatar(),
      isVerified: faker.datatype.boolean(),
      verificationStatus: faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'none']),
      joinedAt: faker.date.past(),
      lastActive: new Date(),
      role: 'user',
      permissions: [],
    };
    await db.collection('users').add(fakeUser);
  }

  // Create demo posts
  for (let i = 0; i < 30; i++) {
    const fakePost = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      category: faker.helpers.arrayElement([
        'deals',
        'events',
        'marketplace',
        'free_items',
        'help_requests',
        'food',
      ]),
      authorId: userId,
      authorName: faker.person.fullName(),
      location: {
        lat: faker.number.float({ min: -38.3, max: -38.1, fractionDigits: 4 }),
        lng: faker.number.float({ min: 144.4, max: 144.7, fractionDigits: 4 }),
        address: faker.location.streetAddress(),
      },
      images: [faker.image.url()],
      price: faker.commerce.price(),
      status: 'active',
      visibility: faker.helpers.arrayElement(['public', 'verified_only']),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: faker.lorem.words(3).split(' '),
    };
    await db.collection('posts').add(fakePost);
  }

  // Create demo comments
  for (let i = 0; i < 50; i++) {
    const fakeComment = {
      postId: faker.string.uuid(),
      authorId: userId,
      authorName: faker.person.fullName(),
      content: faker.lorem.sentences(2),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('comments').add(fakeComment);
  }

  // Create demo events
  for (let i = 0; i < 10; i++) {
    const fakeEvent = {
      title: faker.lorem.words(4),
      description: faker.lorem.paragraph(),
      location: {
        coordinates: {
          lat: faker.number.float({ min: -38.3, max: -38.1, fractionDigits: 4 }),
          lng: faker.number.float({ min: 144.4, max: 144.7, fractionDigits: 4 }),
        },
        address: faker.location.streetAddress(),
      },
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      organizer: faker.person.fullName(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('events').add(fakeEvent);
  }

  // Create demo businesses
  for (let i = 0; i < 10; i++) {
    const fakeBusiness = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      address: faker.location.streetAddress(),
      coordinates: {
        lat: faker.number.float({ min: -38.3, max: -38.1, fractionDigits: 4 }),
        lng: faker.number.float({ min: 144.4, max: 144.7, fractionDigits: 4 }),
      },
      contact: {
        phone: faker.phone.number(),
        email: faker.internet.email(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('businesses').add(fakeBusiness);
  }

  // Create demo content reports
  for (let i = 0; i < 10; i++) {
    const fakeReport = {
      reporterId: userId,
      reporterName: faker.person.fullName(),
      contentType: faker.helpers.arrayElement(['post', 'comment', 'user']),
      contentId: faker.string.uuid(),
      contentAuthorId: faker.string.uuid(),
      reason: faker.lorem.word(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('contentReports').add(fakeReport);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const db = getAdminFirestore();
    // Delete everything except the logged-in user
    await deleteAllExceptUser(db, user.id);
    // Populate demo data
    await createDemoData(db, user.id);
    return NextResponse.json({ success: true, message: 'Demo data populated.' });
  } catch (error) {
    console.error('Error populating demo data:', error);
    return NextResponse.json({ error: 'Failed to populate demo data' }, { status: 500 });
  }
}
