import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/admin';
import { getUserProfile } from '../lib/firebase/firestore';

// Middleware for protecting admin API routes with Firebase Auth and admin role check
export async function adminMiddleware(request: NextRequest) {
  try {
    // Require Authorization header with Bearer token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and verify Firebase ID token
    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user profile from Firestore and check admin role
    const user = await getUserProfile(decodedToken.uid);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // Log and return generic error
    console.error('Admin middleware error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Middleware matcher for admin routes
export const config = {
  matcher: '/api/admin/:path*',
};
