import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { requireAuth, handleAuthError } from '@/lib/utils/auth';
import { isAdmin, hasPermission } from '@/lib/admin';
import { ContentReport, ReportStatus, ModerationAction, User, CommunityPost } from '@/types';
import type { Query, CollectionReference, DocumentData } from 'firebase-admin/firestore';

// GET /api/admin/reports - Get all reports with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const user = await requireAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_reports')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const status = (searchParams.get('status') as ReportStatus) || 'pending';
    const contentType = searchParams.get('contentType');
    const startAfterId = searchParams.get('startAfter');

    const db = getAdminFirestore();
    let query: Query<DocumentData> | CollectionReference<DocumentData> =
      db.collection('contentReports');

    // Build query
    query = query.where('status', '==', status);

    if (contentType) {
      query = query.where('contentType', '==', contentType);
    }

    query = query.orderBy('createdAt', 'desc').limit(pageSize);

    // Handle pagination
    if (startAfterId) {
      const startAfterDoc = await db.collection('contentReports').doc(startAfterId).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ContentReport[];

    return NextResponse.json({
      reports,
      hasMore: snapshot.docs.length === pageSize,
      lastId: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
    });
  } catch (error) {
    return (
      handleAuthError(error) ||
      NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    );
  }
}

// POST /api/admin/reports - Update report status and take moderation action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, action, moderationReason } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Report ID and action are required' }, { status: 400 });
    }

    const user = await requireAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!hasPermission(user, 'manage_reports')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const db = getAdminFirestore();
    const reportRef = db.collection('contentReports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = reportDoc.data() as ContentReport;

    // Update report status
    const updates: Partial<ContentReport> = {
      status: action === 'approve' ? 'resolved' : action === 'reject' ? 'dismissed' : 'resolved',
      moderatedAt: new Date(),
      moderatedBy: user.id,
      moderationAction: action as ModerationAction,
    };

    if (moderationReason) {
      updates.moderationReason = moderationReason;
    }

    await reportRef.update(updates);

    // Take action on the reported content if approved
    if (action === 'content_hidden' || action === 'content_removed') {
      const contentRef = db.collection('posts').doc(reportData.contentId);
      const contentDoc = await contentRef.get();

      if (contentDoc.exists) {
        const contentUpdates: Partial<CommunityPost> = {
          moderatedAt: new Date(),
          moderatedBy: user.id,
        };

        if (action === 'content_hidden') {
          contentUpdates.isHidden = true;
        } else if (action === 'content_removed') {
          contentUpdates.isDeleted = true;
        }

        if (moderationReason) {
          contentUpdates.moderationReason = moderationReason;
        }

        await contentRef.update(contentUpdates);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Report ${updates.status} and action taken successfully`,
    });
  } catch (error) {
    return (
      handleAuthError(error) ||
      NextResponse.json({ error: 'Failed to process report' }, { status: 500 })
    );
  }
}
