import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route protection and role-based access control middleware
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Crisis routes are always accessible (including anonymous access)
    if (pathname.startsWith('/crisis') || pathname.startsWith('/safety')) {
      return NextResponse.next();
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/error',
      '/auth/verify-request',
      '/wellness',
      '/demo',
      '/self-help',
      '/ai-therapy',
      '/dashboard',
      '/mood',
      '/mood-gamified',
      '/gamification-demo',
      '/testing', // Zero-Defect Testing Dashboard
      '/api/auth',
      '/api/health',
      '/api/self-help',
      '/api/ai-therapy',
      '/api/mood',
      '/api/crisis/anonymous' // Allow anonymous crisis access
    ];

    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route)
    );

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Protected volunteer routes
    if (pathname.startsWith('/volunteer')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check if user is a volunteer or therapist
      if (!token.isVolunteer && !token.isTherapist && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    // Protected therapist routes
    if (pathname.startsWith('/therapist')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (!token.isTherapist && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    // Protected admin routes
    if (pathname.startsWith('/admin')) {
      if (!token) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }

    // API routes protection
    if (pathname.startsWith('/api/')) {
      // Crisis API endpoints are open for emergency access
      if (pathname.startsWith('/api/crisis/emergency') || 
          pathname.startsWith('/api/crisis/anonymous')) {
        return NextResponse.next();
      }

      // Volunteer API endpoints
      if (pathname.startsWith('/api/volunteer')) {
        if (!token || (!token.isVolunteer && !token.isTherapist && token.role !== 'ADMIN')) {
          return NextResponse.json(
            { error: 'Unauthorized: Volunteer access required' },
            { status: 401 }
          );
        }
      }

      // Admin API endpoints
      if (pathname.startsWith('/api/admin')) {
        if (!token || token.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Unauthorized: Admin access required' },
            { status: 401 }
          );
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Always allow access to crisis and safety routes (emergency access)
        if (pathname.startsWith('/crisis') || pathname.startsWith('/safety')) {
          return true;
        }

        // Allow public routes
        const publicRoutes = [
          '/',
          '/auth/signin',
          '/auth/signup',
          '/auth/error',
          '/auth/verify-request',
          '/wellness',
          '/demo',
          '/self-help',
          '/ai-therapy',
          '/dashboard',
          '/mood',
          '/mood-gamified',
          '/gamification-demo',
          '/testing', // Zero-Defect Testing Dashboard
          '/api/auth',
          '/api/health',
          '/api/self-help',
          '/api/ai-therapy',
          '/api/mood',
          '/api/crisis/anonymous'
        ];

        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|sounds|fonts).*)',
  ],
};