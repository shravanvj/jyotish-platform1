'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-lg">
          {/* Decorative element */}
          <div className="mb-8">
            <div className="text-8xl mb-4">⚠️</div>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Something Went Wrong
          </h1>
          
          <p className="text-lg text-muted-foreground mb-4">
            The celestial calculations encountered an unexpected disturbance. 
            Our cosmic engineers have been notified.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-left">
              <p className="text-sm font-mono text-red-700 dark:text-red-300 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-red-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Report Issue
            </Link>
          </div>

          {/* Error details for support */}
          {error.digest && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                If you contact support, please provide this error ID:{' '}
                <code className="px-2 py-1 bg-muted rounded text-foreground font-mono">
                  {error.digest}
                </code>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
