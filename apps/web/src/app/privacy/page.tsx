import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Privacy Policy | Jyotish AI',
  description: 'Privacy Policy for Jyotish AI Vedic Astrology Platform',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card-vedic p-8 sm:p-12">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 1, 2025
            </p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  At Jyotish AI ("we", "our", or "us"), we respect your privacy and are committed 
                  to protecting your personal data. This privacy policy explains how we collect, 
                  use, store, and protect your information when you use our Vedic astrology 
                  platform and services.
                </p>
                <p className="text-muted-foreground mb-4">
                  We understand that birth data is sensitive personal information, and we take 
                  special care to protect it. This policy is designed to be transparent about 
                  our data practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Information We Collect</h2>
                
                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Personal Information</h3>
                <p className="text-muted-foreground mb-4">
                  We may collect the following personal information when you use our services:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                  <li><strong>Birth Data:</strong> Date, time, and place of birth for astrological calculations</li>
                  <li><strong>Profile Information:</strong> Timezone preferences, ayanamsa preferences</li>
                  <li><strong>Payment Information:</strong> Billing address, payment method (processed by secure third-party providers)</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Usage Information</h3>
                <p className="text-muted-foreground mb-4">
                  We automatically collect certain information about your use of our services:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and approximate location</li>
                  <li>Pages visited and features used</li>
                  <li>API usage statistics</li>
                  <li>Error logs and performance data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Service Delivery:</strong> To calculate birth charts, horoscopes, and other astrological data</li>
                  <li><strong>Account Management:</strong> To create and manage your account</li>
                  <li><strong>Communication:</strong> To send service updates, newsletters (with consent), and support responses</li>
                  <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                  <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Data Storage and Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement robust security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li><strong>Access Controls:</strong> Strict access controls limit who can access your data</li>
                  <li><strong>Secure Infrastructure:</strong> Our servers are hosted in SOC 2 compliant data centers</li>
                  <li><strong>Regular Audits:</strong> We conduct regular security audits and penetration testing</li>
                  <li><strong>Password Security:</strong> Passwords are hashed using industry-standard algorithms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Data Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal data. We may share your information only in these circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Service Providers:</strong> With trusted partners who help operate our services (hosting, payment processing, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your data</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent for optional data processing</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, please contact us at privacy@jyotish.ai or through your account settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the service to function (authentication, preferences)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our service</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You can manage cookie preferences through your browser settings. Note that disabling 
                  essential cookies may affect service functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  We retain your data for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Account Data:</strong> Retained while your account is active, deleted within 30 days of account deletion</li>
                  <li><strong>Birth Charts:</strong> Stored for your convenience; can be deleted anytime from your account</li>
                  <li><strong>Transaction Records:</strong> Retained for 7 years for legal and tax purposes</li>
                  <li><strong>Usage Logs:</strong> Automatically deleted after 90 days</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">International Data Transfers</h2>
                <p className="text-muted-foreground mb-4">
                  Our servers are located in India. If you access our services from outside India, 
                  your data may be transferred to and processed in India. We ensure appropriate 
                  safeguards are in place for international data transfers in compliance with 
                  applicable data protection laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Our services are not intended for children under 13 years of age. We do not 
                  knowingly collect personal information from children under 13. If you are a 
                  parent or guardian and believe your child has provided us with personal 
                  information, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this privacy policy from time to time. We will notify you of any 
                  material changes by posting the new policy on this page and updating the 
                  "Last updated" date. For significant changes, we may also send you an email 
                  notification.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-none text-muted-foreground space-y-1">
                  <li><strong>Email:</strong> privacy@jyotish.ai</li>
                  <li><strong>Data Protection Officer:</strong> dpo@jyotish.ai</li>
                  <li><strong>Address:</strong> 123 Tech Hub, Bangalore, Karnataka, India 560001</li>
                </ul>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-4">
              <Link
                href="/terms"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Terms of Service →
              </Link>
              <Link
                href="/contact"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
