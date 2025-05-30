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
  getDoc,
  startAfter,
} from 'firebase/firestore';
import { getAuthUser } from '@/lib/firebase/admin';
import { isAdmin, hasPermission } from '@/lib/admin';
import { ContentReport, ReportStatus, ModerationAction, User } from '@/types';

// GET /api/admin/reports - Get all reports with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userHeader = request.headers.get('x-user-id');

    if (!userHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await getAuthUser(userHeader);
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

    // Build query
    let reportsQuery = query(
      collection(db, 'contentReports'),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (contentType) {
      reportsQuery = query(
        collection(db, 'contentReports'),
        where('status', '==', status),
        where('contentType', '==', contentType),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }

    if (startAfterId) {
      const startAfterDoc = await getDoc(doc(db, 'contentReports', startAfterId));
      if (startAfterDoc.exists()) {
        reportsQuery = query(
          collection(db, 'contentReports'),
          where('status', '==', status),
          orderBy('createdAt', 'desc'),
          startAfter(startAfterDoc),
          limit(pageSize)
        );
      }
    }

    const querySnapshot = await getDocs(reportsQuery);
    const reports: ContentReport[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reviewedAt: data.reviewedAt?.toDate(),
      } as ContentReport);
    });

    const hasMore = querySnapshot.size === pageSize;

    return NextResponse.json({
      reports,
      hasMore,
      lastId: reports.length > 0 ? reports[reports.length - 1].id : null,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// PUT /api/admin/reports - Update report status and take moderation action
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

    if (!hasPermission(user, 'manage_reports')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { reportId, action, reason, notes } = await request.json();

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Report ID and action are required' }, { status: 400 });
    }

    // Real Firebase operations
    const reportRef = doc(db, 'contentReports', reportId);
    const reportDoc = await getDoc(reportRef);

    if (!reportDoc.exists()) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const report = reportDoc.data() as ContentReport;

    // Update report status
    const updates: any = {
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      reviewedBy: user.id,
      reviewedAt: new Date(),
      action: action as ModerationAction,
      moderatorNotes: notes,
      updatedAt: new Date(),
    };

    await updateDoc(reportRef, updates);

    return NextResponse.json({
      success: true,
      message: `Report ${action === 'dismiss' ? 'dismissed' : 'resolved'} successfully`,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
