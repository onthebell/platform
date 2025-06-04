import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Show coming soon page for all routes in production except /coming-soon and static assets
  if (process.env.VERCEL_ENV === 'production') {
    const { pathname } = request.nextUrl;
    const isComingSoon = pathname.startsWith('/coming-soon');
    const isStatic =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon.ico');
    if (!isComingSoon && !isStatic) {
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }
  }

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
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
