'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const stats = [
  { label: 'Charts Generated', value: '1M+' },
  { label: 'Happy Users', value: '50K+' },
  { label: 'API Calls Daily', value: '100K+' },
  { label: 'Accuracy Rate', value: '99.9%' },
];

const team = [
  {
    name: 'Dr. Arun Sharma',
    role: 'Founder & Chief Astrologer',
    image: '👨‍🔬',
    bio: '30+ years in Vedic astrology. Ph.D. in Jyotish Shastra from BHU.',
  },
  {
    name: 'Priya Iyer',
    role: 'CTO',
    image: '👩‍💻',
    bio: 'Former Google engineer. Expert in astronomical algorithms.',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Head of Product',
    image: '👨‍💼',
    bio: 'Product veteran with experience at top tech companies.',
  },
  {
    name: 'Dr. Meena Patel',
    role: 'Research Lead',
    image: '👩‍🔬',
    bio: 'Combines traditional texts with modern computational methods.',
  },
];

const timeline = [
  {
    year: '2020',
    title: 'The Beginning',
    description: 'Started as a passion project to digitize ancient Vedic calculations.',
  },
  {
    year: '2021',
    title: 'First Launch',
    description: 'Released our beta platform with basic birth chart calculations.',
  },
  {
    year: '2022',
    title: 'API Launch',
    description: 'Opened our API to developers, enabling integrations worldwide.',
  },
  {
    year: '2023',
    title: 'Major Milestone',
    description: 'Crossed 1 million chart calculations and 50,000 users.',
  },
  {
    year: '2024',
    title: 'Global Expansion',
    description: 'Launched enterprise solutions and expanded to 20+ countries.',
  },
];

const values = [
  {
    icon: '📚',
    title: 'Authenticity',
    description: 'We stay true to traditional Vedic texts and methodologies while leveraging modern technology.',
  },
  {
    icon: '🎯',
    title: 'Accuracy',
    description: 'Our calculations are verified against Swiss Ephemeris and traditional panchang sources.',
  },
  {
    icon: '🌐',
    title: 'Accessibility',
    description: 'Making ancient wisdom accessible to everyone, regardless of their background.',
  },
  {
    icon: '🔒',
    title: 'Privacy',
    description: 'Your birth data is sacred. We never share or sell personal information.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-primary-50 to-background dark:from-primary-950 dark:to-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
              Bridging Ancient Wisdom
              <br />
              <span className="text-primary-600 dark:text-primary-400">with Modern Technology</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Jyotish AI is on a mission to make authentic Vedic astrology accessible to everyone through cutting-edge technology and APIs.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  Our Story
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
                  <p>
                    Jyotish AI was born from a simple observation: while Vedic astrology has guided millions for thousands of years, accessing accurate calculations traditionally required years of training or expensive consultations.
                  </p>
                  <p>
                    Our founder, Dr. Arun Sharma, spent decades mastering traditional Jyotish Shastra. When he met Priya Iyer, a software engineer with a passion for astronomy, they realized they could combine their expertise to democratize this ancient science.
                  </p>
                  <p>
                    Today, Jyotish AI powers astrology applications around the world, from individual practitioners to major platforms. We're proud to make authentic Vedic calculations accessible to everyone.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="card-vedic p-8 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
                  <div className="text-center">
                    <div className="text-8xl mb-4">ॐ</div>
                    <p className="text-lg font-medium text-foreground">
                      "Jyotish is the eye of the Vedas, illuminating the path of life."
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">— Lagadha, Vedanga Jyotisha</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-foreground text-center sm:text-4xl mb-12">
              Our Journey
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary-200 dark:bg-primary-800" />
              
              <div className="space-y-8">
                {timeline.map((item, idx) => (
                  <div
                    key={item.year}
                    className={`relative flex items-center gap-8 ${
                      idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                      <div className="card-vedic p-6 inline-block">
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {item.year}
                        </p>
                        <h3 className="text-lg font-semibold text-foreground mt-1">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mt-2">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Circle marker */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                    
                    <div className="flex-1 hidden md:block" />
                    
                    {/* Mobile layout */}
                    <div className="ml-12 md:hidden card-vedic p-4">
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {item.year}
                      </p>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-foreground text-center sm:text-4xl mb-12">
              Our Values
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="card-vedic p-6 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-foreground text-center sm:text-4xl mb-4">
              Meet Our Team
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A unique blend of traditional astrologers and modern technologists working together.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.name} className="card-vedic p-6 text-center">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="card-vedic p-8 sm:p-12 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Ready to explore the stars?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who trust Jyotish AI for accurate Vedic astrological calculations.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/api-docs"
                  className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Explore API
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
