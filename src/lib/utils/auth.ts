import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getAuthUser } from '@/lib/firebase/admin';
import { User } from '@/types';

/**
 * Extract and verify Firebase ID token from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return null;
    }

    // Get user from Firestore using the decoded token's UID
    const user = await getAuthUser(decodedToken.uid);
    return user;
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    return null;
  }
}

/**
 * Require authentication middleware for API routes
 * Returns the authenticated user or throws a NextResponse error
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Helper function to handle authentication errors in API routes
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }
  return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
}
