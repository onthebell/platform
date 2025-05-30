import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
  startAfter,
} from 'firebase/firestore';
import { getAuthUser } from '@/lib/firebase/admin';
import { isAdmin, hasPermission } from '@/lib/admin';
import { CommunityPost } from '@/types';

// GET /api/admin/posts - Get all posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check authentication and admin permissions
    const userHeader = request.headers.get('x-user-id');
    if (!userHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getAuthUser(userHeader);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_posts')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // all, active, hidden, deleted
    const authorId = searchParams.get('authorId');
    const startAfterId = searchParams.get('startAfter');

    // Build query
    let postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(pageSize));

    // Add filters
    if (status && status !== 'all') {
      if (status === 'active') {
        postsQuery = query(
          collection(db, 'posts'),
          where('isHidden', '==', false),
          where('isDeleted', '==', false),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      } else if (status === 'hidden') {
        postsQuery = query(
          collection(db, 'posts'),
          where('isHidden', '==', true),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      } else if (status === 'deleted') {
        postsQuery = query(
          collection(db, 'posts'),
          where('isDeleted', '==', true),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
    }

    if (authorId) {
      postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', authorId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }

    // Handle pagination
    if (startAfterId) {
      const startAfterDoc = await getDoc(doc(db, 'posts', startAfterId));
      if (startAfterDoc.exists()) {
        postsQuery = query(postsQuery, startAfter(startAfterDoc));
      }
    }

    const snapshot = await getDocs(postsQuery);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as CommunityPost[];

    return NextResponse.json({
      posts,
      hasMore: snapshot.docs.length === pageSize,
      lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// PUT /api/admin/posts - Update post (hide, restore, etc.)
export async function PUT(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-id');
    if (!userHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getAuthUser(userHeader);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_posts')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { postId, action, reason } = await request.json();

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action are required' }, { status: 400 });
    }

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date(),
      moderatedBy: user.id,
      moderatedAt: new Date(),
    };

    if (reason) {
      updates.moderationReason = reason;
    }

    switch (action) {
      case 'hide':
        updates.isHidden = true;
        break;
      case 'restore':
        updates.isHidden = false;
        updates.isDeleted = false;
        break;
      case 'delete':
        updates.isDeleted = true;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await updateDoc(postRef, updates);

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/admin/posts - Permanently delete post
export async function DELETE(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-id');
    if (!userHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getAuthUser(userHeader);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_posts')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'posts', postId));

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
