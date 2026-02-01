'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProtectedRoute } from '@/components/auth';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SavedChart {
  id: string;
  name: string;
  dateTime: string;
  location: string;
  ascendant: string;
  moonSign: string;
  createdAt: string;
}

interface RecentActivity {
  id: string;
  type: 'chart' | 'match' | 'panchang' | 'muhurat' | 'horoscope';
  title: string;
  description: string;
  timestamp: string;
}

// Mock data
const mockSavedCharts: SavedChart[] = [
  {
    id: '1',
    name: 'My Birth Chart',
    dateTime: '1990-05-15 14:30',
    location: 'New Delhi, India',
    ascendant: 'Leo',
    moonSign: 'Taurus',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Father',
    dateTime: '1960-08-22 06:15',
    location: 'Mumbai, India',
    ascendant: 'Cancer',
    moonSign: 'Pisces',
    createdAt: '2024-01-08',
  },
  {
    id: '3',
    name: 'Mother',
    dateTime: '1965-12-03 09:45',
    location: 'Chennai, India',
    ascendant: 'Libra',
    moonSign: 'Scorpio',
    createdAt: '2024-01-08',
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'chart',
    title: 'Generated Birth Chart',
    description: 'Created chart for "My Birth Chart"',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    type: 'panchang',
    title: 'Viewed Panchang',
    description: 'Checked panchang for Delhi',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    type: 'match',
    title: 'Kundli Matching',
    description: 'Compared charts - 28/36 Gunas',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    type: 'muhurat',
    title: 'Muhurat Search',
    description: 'Found muhurats for Griha Pravesh',
    timestamp: '2 days ago',
  },
  {
    id: '5',
    type: 'horoscope',
    title: 'Viewed Horoscope',
    description: 'Daily horoscope for Taurus',
    timestamp: '2 days ago',
  },
];

const quickActions = [
  { name: 'New Birth Chart', href: '/chart', icon: '🌟', color: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' },
  { name: 'Kundli Matching', href: '/matchmaking', icon: '💍', color: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' },
  { name: 'Today\'s Panchang', href: '/panchang', icon: '📅', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  { name: 'Find Muhurat', href: '/muhurat', icon: '🕐', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
  { name: 'Daily Horoscope', href: '/horoscope', icon: '🔮', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  { name: 'API Access', href: '/api-docs', icon: '🔑', color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
];

const activityIcons: Record<string, string> = {
  chart: '🌟',
  match: '💍',
  panchang: '📅',
  muhurat: '🕐',
  horoscope: '🔮',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [savedCharts] = useState<SavedChart[]>(mockSavedCharts);
  const [recentActivity] = useState<RecentActivity[]>(mockRecentActivity);

  // User data from session with fallback
  const user = {
    name: session?.user?.name || 'User',
    email: session?.user?.email || 'user@example.com',
    plan: 'Free',
    chartsRemaining: 5,
    totalCharts: 10,
  };

  return (
    <ProtectedRoute fallback={<SkeletonDashboard />}>
      <Header />
      <main className="min-h-screen py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Welcome back, {user.name}! 🙏
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here's your astrology dashboard overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium">
                {user.plan} Plan
              </span>
              <span className="text-sm text-muted-foreground">
                {user.chartsRemaining}/{user.totalCharts} charts remaining
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={cn(
                    'card-vedic p-4 text-center hover:shadow-lg transition-all group',
                    action.color
                  )}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {action.icon}
                  </div>
                  <div className="text-sm font-medium">{action.name}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Saved Charts */}
            <div className="lg:col-span-2">
              <div className="card-vedic">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Saved Charts</h2>
                  <Link
                    href="/chart"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    + New Chart
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {savedCharts.length > 0 ? (
                    savedCharts.map((chart) => (
                      <div key={chart.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                              🌟
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{chart.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {chart.location} • {chart.dateTime}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {chart.ascendant} Asc
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Moon in {chart.moonSign}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                            View Chart
                          </button>
                          <button className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                            Download PDF
                          </button>
                          <button className="text-xs px-3 py-1 rounded bg-muted hover:bg-muted/80 text-foreground transition-colors">
                            Share
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-muted-foreground">No saved charts yet</p>
                      <Link
                        href="/chart"
                        className="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Create your first chart →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="card-vedic">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{activityIcons[activity.type]}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="card-vedic mt-6 p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Usage This Month</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Charts Generated</span>
                      <span className="font-medium text-foreground">5 / 10</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Kundli Matches</span>
                      <span className="font-medium text-foreground">2 / 5</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">API Calls</span>
                      <span className="font-medium text-foreground">150 / 1000</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="mt-4 block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Upgrade for unlimited access →
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Highlight */}
          <div className="mt-8 card-vedic p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Today's Panchang Highlight</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong>Tithi:</strong> Shukla Dashami • <strong>Nakshatra:</strong> Rohini • <strong>Yoga:</strong> Siddhi
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Today is favorable for starting new ventures, educational activities, and spiritual practices.
                </p>
              </div>
              <Link
                href="/panchang"
                className="shrink-0 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                View Full Panchang
              </Link>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-vedic p-4 text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">3</p>
              <p className="text-sm text-muted-foreground">Saved Charts</p>
            </div>
            <div className="card-vedic p-4 text-center">
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">1</p>
              <p className="text-sm text-muted-foreground">Match Reports</p>
            </div>
            <div className="card-vedic p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">15</p>
              <p className="text-sm text-muted-foreground">Panchang Views</p>
            </div>
            <div className="card-vedic p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">7</p>
              <p className="text-sm text-muted-foreground">Muhurats Found</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}
