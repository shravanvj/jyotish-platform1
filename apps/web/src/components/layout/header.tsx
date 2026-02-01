'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navigation = [
  { name: 'Birth Chart', href: '/chart' },
  { name: 'Matchmaking', href: '/matchmaking' },
  { name: 'Panchang', href: '/panchang' },
  { name: 'Muhurat', href: '/muhurat' },
  { name: 'Horoscope', href: '/horoscope' },
];

const userMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'My Reports', href: '/reports', icon: '📄' },
  { name: 'Profile Settings', href: '/profile', icon: '👤' },
  { name: 'API Documentation', href: '/api-docs', icon: '🔑' },
  { name: 'Pricing', href: '/pricing', icon: '💰' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Toggle this for testing
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-primary-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600">
            <span className="text-lg font-bold text-white">ॐ</span>
          </div>
          <span className="font-display text-xl font-semibold text-primary-900 dark:text-primary-100">
            Jyotish
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side - Theme toggle + Auth */}
        <div className="hidden md:flex md:items-center md:space-x-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            /* User Menu Dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
                  U
                </div>
                <svg
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-surface border border-border shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">User</p>
                    <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => {
                        setIsAuthenticated(false);
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth Buttons */
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-200 dark:border-primary-800">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium rounded-md',
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-primary-200 dark:border-primary-800 pt-3 mt-3">
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase">Account</p>
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-muted rounded-md"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-primary-200 dark:border-primary-800 pt-3 mt-3">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block mt-2 px-3 py-2 text-base font-medium text-center rounded-md bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
