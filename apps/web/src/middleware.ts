// Middleware for route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/reports',
  '/chart/saved',
  '/matchmaking/saved',
  '/settings',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/v1/profiles',
  '/api/v1/reports',
  '/api/v1/api-keys',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route)
  );

  // Check if the route is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if it's a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(
    (route) => pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Return 401 for protected API routes without authentication
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Add user info to headers for API routes
  if (isAuthenticated && pathname.startsWith('/api')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
