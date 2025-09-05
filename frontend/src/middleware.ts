import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the current pathname
  const pathname = request.nextUrl.pathname;

  // Allow requests to static assets, API routes, and favicon
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if the request has a Referer header (indicating it came from a link or UI navigation)
  const referer = request.headers.get('referer');
  const currentHost = request.nextUrl.origin;

  // If there's no referer or the referer is from a different origin, prevent path change
  if (!referer || !referer.startsWith(currentHost)) {
    // Rewrite to the homepage or current path to prevent direct URL changes
    return NextResponse.rewrite(new URL('/', request.url));
  }

  // Allow navigation through UI (e.g., clicking links)
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};