import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware
 *
 * Protects all routes under /dashboard by checking for a valid auth token,
 * and all routes under /admin (the real clan command panel) by checking for
 * a valid admin_session cookie. Unauthenticated users are redirected to the
 * matching login page.
 *
 * Note: In a real app, replace the token check with NextAuth session validation
 *       or your own JWT verification logic.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies
  const token = request.cookies.get('token')?.value;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect the admin command panel (super admin + clan masters).
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session')?.value;
    if (!adminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (request.cookies.get('admin_session')?.value && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Only run middleware on these paths.
   * Excludes static files and internal Next.js routes.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
