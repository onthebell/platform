import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/admin';
import { getUserProfile } from '../lib/firebase/firestore';

export async function adminMiddleware(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from Firestore to check admin role
    // This would require getting the user from Firestore
    // For now, we'll use a temporary header-based approach
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // TODO: Replace this with actual Firestore user lookup
    const user = await getUserProfile(userIdHeader);
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For now, allow if user ID is provided (temporary)
    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Middleware matcher for admin routes
export const config = {
  matcher: '/api/admin/:path*',
};
