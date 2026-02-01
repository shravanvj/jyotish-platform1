'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-lg">
          {/* Decorative element */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary-200 dark:text-primary-900">
              404
            </div>
            <div className="relative -mt-16">
              <span className="text-6xl">🔭</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            The cosmic coordinates you're looking for don't exist in our universe. 
            Perhaps the stars have different plans for you.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/chart"
              className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Generate Birth Chart
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-sm font-medium text-foreground mb-4">
              Popular Destinations
            </h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="/panchang" className="text-primary-600 dark:text-primary-400 hover:underline">
                Today's Panchang
              </Link>
              <Link href="/horoscope" className="text-primary-600 dark:text-primary-400 hover:underline">
                Daily Horoscope
              </Link>
              <Link href="/matchmaking" className="text-primary-600 dark:text-primary-400 hover:underline">
                Kundli Matching
              </Link>
              <Link href="/muhurat" className="text-primary-600 dark:text-primary-400 hover:underline">
                Muhurat Finder
              </Link>
              <Link href="/api-docs" className="text-primary-600 dark:text-primary-400 hover:underline">
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
