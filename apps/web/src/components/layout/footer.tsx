import Link from 'next/link';

const footerLinks = {
  features: [
    { name: 'Birth Chart', href: '/chart' },
    { name: 'Matchmaking', href: '/matchmaking' },
    { name: 'Panchang', href: '/panchang' },
    { name: 'Muhurat', href: '/muhurat' },
    { name: 'Horoscope', href: '/horoscope' },
  ],
  resources: [
    { name: 'API Documentation', href: '/api-docs' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Reports', href: '/reports' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-primary-200 bg-background dark:border-primary-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600">
                <span className="text-base font-bold text-white">ॐ</span>
              </div>
              <span className="font-display text-lg font-semibold text-primary-900 dark:text-primary-100">
                Jyotish
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Authentic Vedic astrology calculations powered by Swiss Ephemeris. 
              Get accurate birth charts, Kundali matching, and personalized predictions.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Features</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-200 pt-8 dark:border-primary-800">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Jyotish Platform. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with 🕉️ for the cosmic seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
