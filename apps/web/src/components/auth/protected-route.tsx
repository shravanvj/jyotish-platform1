'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { SkeletonDashboard } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}

/**
 * ProtectedRoute Component
 * Wraps content that requires authentication
 * Automatically redirects to login if not authenticated
 */
export function ProtectedRoute({
  children,
  requiredRoles = [],
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Show loading state
  if (isLoading) {
    return fallback || <SkeletonDashboard />;
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated) {
    return fallback || <SkeletonDashboard />;
  }

  // Check role requirements (if any)
  // This can be extended based on your role system
  if (requiredRoles.length > 0) {
    // For now, we'll just check if the user has a subscription tier
    // In a real app, you'd check against user.roles
    const hasAccess = true; // Implement your role check logic
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-vedic-bg">
          <div className="card-vedic p-8 text-center max-w-md">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-vedic-primary mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  // Authenticated and authorized
  return <>{children}</>;
}

/**
 * withAuth HOC
 * Higher-order component version of ProtectedRoute
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRoles?: string[];
    fallback?: ReactNode;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute
        requiredRoles={options?.requiredRoles}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * GuestRoute Component
 * For pages that should only be accessible to non-authenticated users
 * (e.g., login, register)
 */
export function GuestRoute({
  children,
  redirectTo = '/dashboard',
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const { status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vedic-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-vedic-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * useAuthGuard Hook
 * For programmatic auth checks within components
 */
export function useAuthGuard(redirectTo = '/login') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, redirectTo, router]);

  return {
    session,
    isLoading,
    isAuthenticated,
    user: session?.user,
  };
}
