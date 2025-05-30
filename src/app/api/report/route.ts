import { NextRequest, NextResponse } from 'next/server';
import { doc, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ContentReport, ReportReason } from '@/types';
import { getAuthUser } from '@/lib/firebase/admin';

interface ReportRequest {
  contentType: 'post' | 'comment' | 'user';
  contentId: string;
  reason: ReportReason;
  customReason?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    // In a real implementation, you would verify the Firebase ID token
    // For now, we'll assume the token contains the user ID
    // TODO: Implement proper token verification

    // For development, we'll extract user from request differently
    // In production, verify the Firebase ID token and get uid
    const userHeader = request.headers.get('x-user-id');
    if (!userHeader) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const user = await getAuthUser(userHeader);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body: ReportRequest = await request.json();
    const { contentType, contentId, reason, customReason, description } = body;

    // Validate required fields
    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: 'Content type, content ID, and reason are required' },
        { status: 400 }
      );
    }

    // Validate content exists and get author info
    let contentAuthorId: string;

    try {
      if (contentType === 'post') {
        const postDoc = await getDoc(doc(db, 'posts', contentId));
        if (!postDoc.exists()) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        contentAuthorId = postDoc.data().authorId;
      } else if (contentType === 'comment') {
        const commentDoc = await getDoc(doc(db, 'comments', contentId));
        if (!commentDoc.exists()) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }
        contentAuthorId = commentDoc.data().authorId;
      } else if (contentType === 'user') {
        const userDoc = await getDoc(doc(db, 'users', contentId));
        if (!userDoc.exists()) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        contentAuthorId = contentId; // For user reports, the user is the "author"
      } else {
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error validating content:', error);
      return NextResponse.json({ error: 'Failed to validate content' }, { status: 500 });
    }

    // Prevent users from reporting their own content
    if (contentAuthorId === user.id && contentType !== 'user') {
      return NextResponse.json({ error: 'Cannot report your own content' }, { status: 400 });
    }

    // Create the report
    const reportData: Omit<ContentReport, 'id'> = {
      reporterId: user.id,
      reporterName: user.displayName || user.email,
      contentType,
      contentId,
      contentAuthorId,
      reason,
      customReason: reason === 'other' ? customReason : undefined,
      description,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const reportRef = await addDoc(collection(db, 'contentReports'), {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      reportId: reportRef.id,
      message: 'Report submitted successfully. Our moderation team will review it shortly.',
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
