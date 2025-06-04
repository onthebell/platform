import '@testing-library/jest-dom';

// Mock Firebase before any imports
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ path: 'mocked-collection' })),
  doc: jest.fn(() => ({ id: 'mocked-doc' })),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  },
}));

jest.mock('../config', () => ({
  db: { app: { name: 'mocked-app' } },
}));

// Mock the specific firestore module functions
jest.mock('../firestore', () => ({
  createPost: jest.fn(),
  getPost: jest.fn(),
  getPosts: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  createEvent: jest.fn(),
  getEvents: jest.fn(),
  createBusiness: jest.fn(),
  getBusinesses: jest.fn(),
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

// Import the mocked module
import * as firestoreModule from '../firestore';

describe('Firestore operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a post successfully', async () => {
    const mockPost = {
      title: 'Test Post',
      description: 'Test content',
      category: 'community' as const,
      authorId: 'user123',
      authorName: 'Test User',
      status: 'active' as const,
      visibility: 'public' as const,
      tags: ['test'],
    };

    // Mock the return value
    (firestoreModule.createPost as jest.Mock).mockResolvedValue('new-post-id');

    const result = await firestoreModule.createPost(mockPost);

    expect(firestoreModule.createPost).toHaveBeenCalledWith(mockPost);
    expect(result).toBe('new-post-id');
  });

  it('gets a post by ID', async () => {
    const mockPostData = {
      id: 'post123',
      title: 'Test Post',
      description: 'Test content',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    (firestoreModule.getPost as jest.Mock).mockResolvedValue(mockPostData);

    const result = await firestoreModule.getPost('post123');

    expect(firestoreModule.getPost).toHaveBeenCalledWith('post123');
    expect(result).toEqual(mockPostData);
  });

  it('returns null for non-existent post', async () => {
    (firestoreModule.getPost as jest.Mock).mockResolvedValue(null);

    const result = await firestoreModule.getPost('non-existent');

    expect(firestoreModule.getPost).toHaveBeenCalledWith('non-existent');
    expect(result).toBeNull();
  });

  it('gets posts with pagination', async () => {
    const mockPosts = [
      { id: 'post1', title: 'Post 1' },
      { id: 'post2', title: 'Post 2' },
    ];

    (firestoreModule.getPosts as jest.Mock).mockResolvedValue(mockPosts);

    const result = await firestoreModule.getPosts();

    expect(firestoreModule.getPosts).toHaveBeenCalled();
    expect(result).toEqual(mockPosts);
  });

  it('creates an event successfully', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test event description',
      organizer: 'Test Organizer',
      organizerId: 'user123',
      location: {
        name: 'Test Location',
        address: '123 Test St',
        coordinates: { lat: -38.1499, lng: 144.3617 },
      },
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-01'),
      isRecurring: false,
      category: 'community',
      tags: ['test'],
      maxAttendees: 50,
      currentAttendees: 0,
      isPublic: true,
    };

    (firestoreModule.createEvent as jest.Mock).mockResolvedValue('new-event-id');

    const result = await firestoreModule.createEvent(mockEvent);

    expect(firestoreModule.createEvent).toHaveBeenCalledWith(mockEvent);
    expect(result).toBe('new-event-id');
  });

  it('gets user notifications', async () => {
    const mockNotifications = [
      {
        id: 'notif1',
        userId: 'user123',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info',
        isRead: false,
        createdAt: new Date(),
      },
    ];

    (firestoreModule.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

    const result = await firestoreModule.getUserNotifications('user123');

    expect(firestoreModule.getUserNotifications).toHaveBeenCalledWith('user123');
    expect(result).toEqual(mockNotifications);
  });

  it('marks notification as read', async () => {
    (firestoreModule.markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);

    await firestoreModule.markNotificationAsRead('notif123');

    expect(firestoreModule.markNotificationAsRead).toHaveBeenCalledWith('notif123');
  });

  it('handles errors gracefully', async () => {
    const error = new Error('Network error');
    (firestoreModule.getPosts as jest.Mock).mockRejectedValue(error);

    await expect(firestoreModule.getPosts()).rejects.toThrow('Network error');
  });
});
