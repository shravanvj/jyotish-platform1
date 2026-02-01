import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jyotish - Vedic Astrology Platform',
    template: '%s | Jyotish',
  },
  description:
    'Comprehensive Vedic astrology platform with birth charts, matchmaking, panchang, muhurat, and personalized horoscopes.',
  keywords: [
    'vedic astrology',
    'jyotish',
    'birth chart',
    'kundli',
    'matchmaking',
    'gun milan',
    'panchang',
    'muhurat',
    'horoscope',
    'rashi',
    'nakshatra',
  ],
  authors: [{ name: 'Jyotish Platform' }],
  creator: 'Jyotish Platform',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://jyotish.app',
    siteName: 'Jyotish',
    title: 'Jyotish - Vedic Astrology Platform',
    description:
      'Comprehensive Vedic astrology platform with birth charts, matchmaking, panchang, and personalized horoscopes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jyotish - Vedic Astrology Platform',
    description:
      'Comprehensive Vedic astrology platform with birth charts, matchmaking, panchang, and personalized horoscopes.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1612' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
