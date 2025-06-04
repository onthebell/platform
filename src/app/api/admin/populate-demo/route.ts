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

// Helper to get a random date between now and 30 days ago
function randomRecentDate() {
  const now = Date.now();
  const daysAgo = 30 * 24 * 60 * 60 * 1000;
  const randomTime = now - Math.floor(Math.random() * daysAgo);
  return new Date(randomTime);
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

  // Get a random userId from Firestore (excluding the current user)
  const usersSnapshot = await db.collection('users').get();
  const userIds = usersSnapshot.docs.map(doc => doc.id).filter(id => id !== userId);

  // Create demo posts with type-specific fields
  for (let i = 0; i < 50; i++) {
    const randomAuthorId =
      userIds.length > 0 ? userIds[Math.floor(Math.random() * userIds.length)] : userId;
    const category = faker.helpers.arrayElement([
      'deals',
      'events',
      'marketplace',
      'free_items',
      'help_requests',
      'food',
    ]);
    const fakePost: any = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      category,
      authorId: randomAuthorId,
      authorName: faker.person.fullName(),
      location: {
        lat: faker.number.float({ min: -38.28, max: -38.11, fractionDigits: 4 }),
        lng: faker.number.float({ min: 144.47, max: 144.7, fractionDigits: 4 }),
        address: faker.location.streetAddress(),
      },
      images: [faker.image.url()],
      status: 'active',
      visibility: faker.helpers.arrayElement(['public', 'verified_only']),
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
      tags: faker.lorem.words(3).split(' '),
    };
    // Add type-specific fields
    switch (category) {
      case 'deals':
        fakePost.discount = faker.number.int({ min: 5, max: 50 });
        fakePost.dealType = faker.helpers.arrayElement(['percentage', 'fixed']);
        fakePost.expiry = faker.date.future();
        break;
      case 'marketplace':
        fakePost.price = faker.commerce.price();
        fakePost.condition = faker.helpers.arrayElement(['new', 'used', 'good', 'fair']);
        fakePost.itemType = faker.commerce.product();
        break;
      case 'free_items':
        fakePost.price = null;
        fakePost.itemType = faker.commerce.product();
        fakePost.pickupInstructions = faker.lorem.sentence();
        break;
      case 'help_requests':
        fakePost.requestType = faker.helpers.arrayElement([
          'moving',
          'pet care',
          'gardening',
          'shopping',
        ]);
        fakePost.urgency = faker.helpers.arrayElement(['low', 'medium', 'high']);
        fakePost.details = faker.lorem.sentences(2);
        break;
      case 'food':
        fakePost.foodType = faker.helpers.arrayElement([
          'produce',
          'baked goods',
          'meals',
          'pantry',
        ]);
        fakePost.expiry = faker.date.future();
        break;
      case 'events':
        fakePost.eventDate = faker.date.future();
        fakePost.venue = faker.location.streetAddress();
        break;
      default:
        break;
    }
    await db.collection('posts').add(fakePost);
  }

  const postsSnapshot = await db.collection('posts').get();
  const postIds = postsSnapshot.docs.map(doc => doc.id);

  // Create demo comments
  for (let i = 0; i < 50; i++) {
    const randomPostId =
      postIds.length > 0 ? postIds[Math.floor(Math.random() * postIds.length)] : null;
    const randomCommentAuthorId =
      userIds.length > 0 ? userIds[Math.floor(Math.random() * userIds.length)] : userId;
    const fakeComment = {
      postId: randomPostId,
      authorId: randomCommentAuthorId,
      authorName: faker.person.fullName(),
      content: faker.lorem.sentences(2),
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
    };
    await db.collection('comments').add(fakeComment);
  }

  // Create demo events
  for (let i = 0; i < 25; i++) {
    const fakeEvent = {
      title: faker.lorem.words(4),
      description: faker.lorem.paragraph(),
      location: {
        coordinates: {
          lat: faker.number.float({ min: -38.28, max: -38.11, fractionDigits: 4 }),
          lng: faker.number.float({ min: 144.47, max: 144.7, fractionDigits: 4 }),
        },
        address: faker.location.streetAddress(),
      },
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      organizer: faker.person.fullName(),
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
    };
    await db.collection('events').add(fakeEvent);
  }

  // Create demo businesses
  for (let i = 0; i < 15; i++) {
    const fakeBusiness = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      address: faker.location.streetAddress(),
      coordinates: {
        lat: faker.number.float({ min: -38.28, max: -38.11, fractionDigits: 4 }),
        lng: faker.number.float({ min: 144.47, max: 144.7, fractionDigits: 4 }),
      },
      contact: {
        phone: faker.phone.number(),
        email: faker.internet.email(),
      },
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
    };
    await db.collection('businesses').add(fakeBusiness);
  }

  // Create demo job posts in posts collection
  for (let i = 0; i < 20; i++) {
    const randomAuthorId =
      userIds.length > 0 ? userIds[Math.floor(Math.random() * userIds.length)] : userId;
    const bellarineSuburbs = [
      'Barwon Heads',
      'Ocean Grove',
      'Point Lonsdale',
      'Queenscliff',
      'Drysdale',
      'Clifton Springs',
      'Portarlington',
      'Indented Head',
      'St Leonards',
      'Curlewis',
      'Wallington',
    ];
    const suburb = faker.helpers.arrayElement(bellarineSuburbs);
    const fakeJobPost = {
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraph(),
      category: 'jobs',
      authorId: randomAuthorId,
      authorName: faker.person.fullName(),
      location: {
        lat: faker.number.float({ min: -38.28, max: -38.11, fractionDigits: 4 }),
        lng: faker.number.float({ min: 144.47, max: 144.7, fractionDigits: 4 }),
        address: `${suburb}, VIC`,
      },
      images: [faker.image.url()],
      status: 'active',
      visibility: faker.helpers.arrayElement(['public', 'verified_only']),
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
      tags: faker.lorem.words(3).split(' '),
      // Job-specific fields
      jobType: faker.helpers.arrayElement([
        'full_time',
        'part_time',
        'casual',
        'contract',
        'volunteer',
        'one_off',
      ]),
      industry: faker.helpers.arrayElement([
        'Hospitality',
        'Retail',
        'Construction',
        'Healthcare',
        'Education',
        'IT',
        'Other',
      ]),
      employerType: faker.helpers.arrayElement(['business', 'person']),
      workType: faker.helpers.arrayElement(['onsite', 'remote', 'hybrid']),
      salary: faker.helpers.arrayElement([
        `$${faker.number.int({ min: 25, max: 60 })}/hr`,
        `$${faker.number.int({ min: 50000, max: 120000 })} p.a.`,
        'Negotiable',
      ]),
      startDate: faker.date.future(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
    };
    await db.collection('posts').add(fakeJobPost);
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
      createdAt: randomRecentDate(),
      updatedAt: randomRecentDate(),
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
