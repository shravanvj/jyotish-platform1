import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const features = [
  {
    name: 'Birth Chart Analysis',
    description: 'Get your complete Vedic birth chart with planetary positions, houses, and detailed interpretations using Lahiri ayanamsa.',
    icon: '🪐',
    href: '/chart',
  },
  {
    name: 'Kundali Matching',
    description: 'Traditional matchmaking with Ashtakoota (36 Guna) and Dashakuta (10 Porutham) compatibility systems.',
    icon: '💑',
    href: '/matchmaking',
  },
  {
    name: 'Daily Panchang',
    description: 'Accurate panchang with tithi, nakshatra, yoga, karana, and all essential daily astrological information.',
    icon: '📅',
    href: '/panchang',
  },
  {
    name: 'Muhurat Finder',
    description: 'Find auspicious times for important events like marriage, business ventures, travel, and more.',
    icon: '⏰',
    href: '/muhurat',
  },
  {
    name: 'Daily Horoscope',
    description: 'Personalized daily, weekly, monthly, and yearly predictions based on your moon sign (rashi).',
    icon: '✨',
    href: '/horoscope',
  },
  {
    name: 'API Access',
    description: 'Integrate authentic Vedic calculations into your applications with our comprehensive REST API.',
    icon: '🔗',
    href: '/docs',
  },
];

const stats = [
  { label: 'Calculations Daily', value: '100K+' },
  { label: 'Active Users', value: '50K+' },
  { label: 'API Calls', value: '1M+' },
  { label: 'Accuracy', value: '99.9%' },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-primary-50/50 dark:to-primary-950/20">
          <div className="mandala-bg absolute inset-0 opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover Your{' '}
                <span className="text-gradient">Cosmic Blueprint</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Authentic Vedic astrology calculations powered by Swiss Ephemeris. 
                Get accurate birth charts, Kundali matching, panchang, muhurat, 
                and personalized predictions.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/chart"
                  className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-700 transition-all hover:shadow-xl glow-primary"
                >
                  Generate Birth Chart
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center rounded-lg border-2 border-primary-300 px-6 py-3 text-base font-semibold text-primary-700 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-primary-950 transition-colors"
                >
                  View API Docs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-primary-200 bg-surface dark:border-primary-800 dark:bg-surface-dark">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Comprehensive Vedic Astrology Tools
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Everything you need for authentic Jyotish calculations and predictions
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="group card-vedic p-6 transition-all hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-600"
                >
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Start Your Cosmic Journey Today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                Create a free account to save your charts, access personalized predictions, 
                and unlock premium features.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-colors"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-lg border-2 border-white/50 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Get your Vedic astrology readings in three simple steps
              </p>
            </div>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  1
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                  Enter Birth Details
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Provide your date, time, and place of birth for accurate calculations
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  2
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                  Generate Chart
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our Swiss Ephemeris-powered engine calculates your precise planetary positions
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  3
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                  Get Insights
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Receive detailed interpretations, predictions, and personalized guidance
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
