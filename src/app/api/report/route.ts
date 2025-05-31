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
    // Get user ID from header (consistent with other API endpoints)
    const userHeader = request.headers.get('x-user-id');
    if (!userHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    // Create the report data (without timestamps initially)
    const reportData: any = {
      reporterId: user.id,
      reporterName: user.displayName || user.email,
      contentType,
      contentId,
      contentAuthorId,
      reason,
      status: 'pending',
    };

    // Only include optional fields if they have values
    if (reason === 'other' && customReason?.trim()) {
      reportData.customReason = customReason.trim();
    }
    if (description?.trim()) {
      reportData.description = description.trim();
    }

    // Add timestamps using serverTimestamp()
    reportData.createdAt = serverTimestamp();
    reportData.updatedAt = serverTimestamp();

    const reportRef = await addDoc(collection(db, 'contentReports'), reportData);

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
