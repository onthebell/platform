import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/utils/auth';
import { isAdmin, hasPermission } from '@/lib/admin';
import { CommunityPost } from '@/types';
import type { Query, CollectionReference, DocumentData } from 'firebase-admin/firestore';

// GET /api/admin/posts - Get all posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check authentication and admin permissions
    const user = await requireAuth(request);
    if (!isAdmin(user)) {
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

    const db = getAdminFirestore();
    let query: Query<DocumentData> | CollectionReference<DocumentData> = db.collection('posts');

    // Add filters
    if (status && status !== 'all') {
      if (status === 'active') {
        query = query.where('isHidden', '==', false).where('isDeleted', '==', false);
      } else if (status === 'hidden') {
        query = query.where('isHidden', '==', true);
      } else if (status === 'deleted') {
        query = query.where('isDeleted', '==', true);
      }
    }

    if (authorId) {
      query = query.where('authorId', '==', authorId);
    }

    // Order and limit
    query = query.orderBy('createdAt', 'desc').limit(pageSize);

    // Handle pagination
    if (startAfterId) {
      const startAfterDoc = await db.collection('posts').doc(startAfterId).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
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

// POST /api/admin/posts - Moderate a post (hide/show/delete/restore)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, postId, reason } = body;

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action are required' }, { status: 400 });
    }

    // Check authentication and admin permissions
    const user = await requireAuth(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_posts')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updates: any = {
      moderatedAt: new Date(),
      moderatedBy: user.id,
    };

    if (reason) {
      updates.moderationReason = reason;
    }

    switch (action) {
      case 'hide':
        updates.isHidden = true;
        break;
      case 'show':
        updates.isHidden = false;
        break;
      case 'delete':
        updates.isDeleted = true;
        break;
      case 'restore':
        updates.isDeleted = false;
        updates.isHidden = false;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await postRef.update(updates);

    return NextResponse.json({ success: true, message: `Post ${action}d successfully` });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error moderating post:', error);
    return NextResponse.json({ error: 'Failed to moderate post' }, { status: 500 });
  }
}

// DELETE /api/admin/posts - Permanently delete a post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check authentication and admin permissions
    const user = await requireAuth(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_posts')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const db = getAdminFirestore();
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await postRef.delete();

    return NextResponse.json({ success: true, message: 'Post deleted permanently' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
