import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled for development - API routes handle their own auth
  // In production, this would verify Firebase ID tokens at the middleware level

  // Only apply to API admin routes for now
  // Client-side admin routes will handle their own authentication
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // For development, we'll let the API routes handle authentication
    // In production, uncomment below to verify Firebase ID tokens:
    /*
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    */
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
