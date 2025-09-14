import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for maintenance mode
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' && pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // Handle common error redirects
  if (pathname === '/404') {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  if (pathname === '/500') {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
