import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Terms of Service | Jyotish AI',
  description: 'Terms of Service for using Jyotish AI Vedic Astrology Platform',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="card-vedic p-8 sm:p-12">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: January 1, 2025
            </p>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing and using Jyotish AI ("the Service"), you accept and agree to be bound by 
                  the terms and provisions of this agreement. If you do not agree to abide by these terms, 
                  please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  Jyotish AI provides Vedic astrology calculations, birth chart generation, horoscope 
                  predictions, matchmaking analysis, and related astrological services through web 
                  interfaces and APIs. Our services are based on traditional Vedic astrological methods 
                  combined with modern astronomical calculations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  To access certain features of the Service, you may be required to create an account. 
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You must be at least 13 years old to create an account</li>
                  <li>You are responsible for all activity that occurs under your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">4. API Usage</h2>
                <p className="text-muted-foreground mb-4">
                  If you use our API services, you agree to the following additional terms:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>API keys are for your use only and should not be shared</li>
                  <li>You will comply with rate limits and usage quotas for your plan</li>
                  <li>You will not attempt to circumvent security measures or rate limits</li>
                  <li>You will not use the API for any illegal or harmful purposes</li>
                  <li>We reserve the right to revoke API access for violations of these terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Disclaimer</h2>
                <p className="text-muted-foreground mb-4">
                  <strong>Important:</strong> Jyotish AI provides astrological information for 
                  entertainment and educational purposes only. Our services should not be used as 
                  a substitute for professional advice in medical, legal, financial, or other matters.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Astrological predictions are based on traditional methods and are not guaranteed</li>
                  <li>We do not claim that our predictions will be accurate or come true</li>
                  <li>You should not make important life decisions solely based on astrological readings</li>
                  <li>Consult qualified professionals for medical, legal, or financial advice</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  All content, features, and functionality of the Service, including but not limited 
                  to text, graphics, logos, icons, images, and software, are the exclusive property 
                  of Jyotish AI and are protected by international copyright, trademark, and other 
                  intellectual property laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">7. User Content</h2>
                <p className="text-muted-foreground mb-4">
                  By submitting birth data or other information to the Service, you grant us a 
                  non-exclusive license to use this information for the purpose of providing the 
                  Service. We will handle your data in accordance with our Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Prohibited Uses</h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to use the Service:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>For any unlawful purpose or in violation of any laws</li>
                  <li>To harm, threaten, or harass others</li>
                  <li>To impersonate any person or entity</li>
                  <li>To interfere with or disrupt the Service</li>
                  <li>To attempt to gain unauthorized access to any systems</li>
                  <li>To collect user data without consent</li>
                  <li>To distribute spam, malware, or harmful content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Payment Terms</h2>
                <p className="text-muted-foreground mb-4">
                  For paid services:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                  <li>All fees are non-refundable unless otherwise stated</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>Failure to pay may result in service suspension</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  To the fullest extent permitted by law, Jyotish AI shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, or any loss of 
                  profits or revenues, whether incurred directly or indirectly, or any loss of data, 
                  use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of 
                  any material changes by posting the new terms on this page and updating the 
                  "Last updated" date. Your continued use of the Service after such modifications 
                  constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none text-muted-foreground space-y-1">
                  <li>Email: legal@jyotish.ai</li>
                  <li>Address: 123 Tech Hub, Bangalore, Karnataka, India 560001</li>
                </ul>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-4">
              <Link
                href="/privacy"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Privacy Policy →
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
