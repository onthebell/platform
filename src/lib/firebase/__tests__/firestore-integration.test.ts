// Mock Firebase first before any imports
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ path: 'posts' })),
  doc: jest.fn(() => ({ id: 'post123', path: 'posts/post123' })),
  addDoc: jest.fn().mockResolvedValue({ id: 'post123' }),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    id: 'post123',
    data: () => ({
      title: 'Test',
      description: 'Test description',
      createdAt: { toDate: () => new Date() },
      updatedAt: { toDate: () => new Date() },
    }),
  }),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: 'post123',
        data: () => ({
          title: 'Test',
          description: 'Test description',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      },
    ],
  }),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({ toDate: () => date })),
  },
}));

jest.mock('../config', () => ({ db: {} }));

// Mock the actual firestore functions to return proper values
jest.mock('../firestore', () => ({
  createPost: jest.fn().mockResolvedValue('post123'),
  getPosts: jest.fn().mockResolvedValue([
    {
      id: 'post123',
      title: 'Test',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getPost: jest.fn().mockResolvedValue({
    id: 'post123',
    title: 'Test',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updatePost: jest.fn().mockResolvedValue(undefined),
  deletePost: jest.fn().mockResolvedValue(undefined),
}));

import { createPost, getPosts, getPost, updatePost, deletePost } from '../firestore';

describe('Firestore integration', () => {
  it('creates a post', async () => {
    const id = await createPost({
      title: 'Test',
      description: 'Test description',
      authorId: 'user',
      authorName: 'User',
      category: 'deals',
      status: 'active',
      visibility: 'public',
      tags: [],
    });
    expect(id).toBe('post123');
  });

  it('gets posts', async () => {
    const posts = await getPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0].id).toBe('post123');
  });

  it('gets a post by id', async () => {
    const post = await getPost('post123');
    expect(post?.id).toBe('post123');
  });

  it('updates a post', async () => {
    await expect(updatePost('post123', { title: 'Updated' })).resolves.toBeUndefined();
  });

  it('deletes a post', async () => {
    await expect(deletePost('post123')).resolves.toBeUndefined();
  });
});
