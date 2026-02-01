'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Jyotish AI',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '10 birth chart calculations/month',
      '5 kundli matching reports/month',
      'Basic planetary positions',
      'Daily panchang access',
      'Daily horoscope',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Great for personal use',
    priceMonthly: 9.99,
    priceYearly: 99,
    features: [
      '50 birth chart calculations/month',
      '25 kundli matching reports/month',
      'Detailed chart analysis',
      'Nakshatra predictions',
      'Muhurat finder',
      'PDF report downloads',
      'Email support',
      '1,000 API calls/month',
    ],
    cta: 'Subscribe',
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For astrology practitioners',
    priceMonthly: 29.99,
    priceYearly: 299,
    features: [
      'Unlimited birth charts',
      'Unlimited kundli matching',
      'Advanced Dasha analysis',
      'Transit predictions',
      'Varshaphala (annual charts)',
      'Custom report branding',
      'Priority support',
      '10,000 API calls/month',
      'Webhook notifications',
    ],
    highlighted: true,
    cta: 'Subscribe',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations & platforms',
    priceMonthly: -1, // Custom pricing
    priceYearly: -1,
    features: [
      'Everything in Professional',
      'Unlimited API calls',
      'Custom integrations',
      'White-label options',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
      'Custom feature development',
    ],
    cta: 'Contact Sales',
  },
];

const faqs = [
  {
    question: 'Can I switch plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remaining time. When downgrading, the new rate takes effect at the next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), UPI, net banking, and PayPal. For Enterprise plans, we also support invoicing.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start. You can explore all features before committing.',
  },
  {
    question: 'What happens when I reach my monthly limit?',
    answer: 'When you reach your monthly limit, you can either upgrade your plan or wait for the next billing cycle. We\'ll notify you when you\'re approaching your limit.',
  },
  {
    question: 'Can I use the API for commercial purposes?',
    answer: 'Yes, all paid plans allow commercial use of the API. The Free plan is for personal, non-commercial use only.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a full refund within the first 30 days if you\'re not satisfied. After that, you can cancel anytime but no refunds will be issued for the current billing period.',
  },
];

const comparisons = [
  { feature: 'Birth Chart Calculations', free: '10/month', basic: '50/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Kundli Matching', free: '5/month', basic: '25/month', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Planetary Positions', free: 'Basic', basic: 'Detailed', pro: 'Advanced', enterprise: 'Advanced' },
  { feature: 'Dasha Analysis', free: '❌', basic: 'Basic', pro: 'Full', enterprise: 'Full' },
  { feature: 'Transit Predictions', free: '❌', basic: '❌', pro: '✓', enterprise: '✓' },
  { feature: 'Varshaphala', free: '❌', basic: '❌', pro: '✓', enterprise: '✓' },
  { feature: 'PDF Reports', free: '❌', basic: '✓', pro: '✓', enterprise: '✓' },
  { feature: 'Custom Branding', free: '❌', basic: '❌', pro: '✓', enterprise: '✓' },
  { feature: 'API Access', free: '100 calls', basic: '1,000 calls', pro: '10,000 calls', enterprise: 'Unlimited' },
  { feature: 'Support', free: 'Community', basic: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
  { feature: 'SLA', free: '❌', basic: '❌', pro: '❌', enterprise: '99.9%' },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (plan: Plan) => {
    if (plan.priceMonthly === -1) return 'Custom';
    const price = billingPeriod === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getPeriodLabel = (plan: Plan) => {
    if (plan.priceMonthly === -1 || plan.priceMonthly === 0) return '';
    return billingPeriod === 'yearly' ? '/year' : '/month';
  };

  const getSavings = (plan: Plan) => {
    if (plan.priceMonthly <= 0) return null;
    const yearlyCost = plan.priceYearly;
    const monthlyCost = plan.priceMonthly * 12;
    const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
    return savings > 0 ? savings : null;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your astrology needs. All plans include our core features with no hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={cn(
                'text-sm font-medium transition-colors',
                billingPeriod === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 rounded-full bg-primary-600 transition-colors"
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform',
                    billingPeriod === 'yearly' ? 'left-8' : 'left-1'
                  )}
                />
              </button>
              <span className={cn(
                'text-sm font-medium transition-colors',
                billingPeriod === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                Yearly
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Save up to 17%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => {
              const savings = getSavings(plan);
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'card-vedic p-6 flex flex-col relative',
                    plan.highlighted && 'ring-2 ring-primary-500 shadow-xl'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-600 text-white">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-foreground">{getPrice(plan)}</span>
                      <span className="ml-1 text-muted-foreground">{getPeriodLabel(plan)}</span>
                    </div>
                    {billingPeriod === 'yearly' && savings && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Save {savings}% compared to monthly
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.id === 'enterprise' ? '/contact' : '/register'}
                    className={cn(
                      'w-full py-3 text-center text-sm font-medium rounded-lg transition-colors',
                      plan.highlighted
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Compare Plans
            </h2>
            <div className="card-vedic overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Feature</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Free</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Basic</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-primary-600 dark:text-primary-400">Professional</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm text-foreground">{row.feature}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{row.free}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{row.basic}</td>
                      <td className="py-3 px-4 text-sm text-center text-foreground bg-primary-50/50 dark:bg-primary-950/50">{row.pro}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQs */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="card-vedic">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-foreground">{faq.question}</span>
                    <span className={cn(
                      'text-xl transition-transform',
                      expandedFaq === idx && 'rotate-180'
                    )}>
                      ▼
                    </span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <div className="card-vedic p-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Ready to unlock the wisdom of the stars?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Start with our free plan and upgrade when you're ready. No credit card required.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">50,000+</p>
              <p className="text-sm text-muted-foreground">Happy Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">1M+</p>
              <p className="text-sm text-muted-foreground">Charts Generated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">99.9%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">4.9/5</p>
              <p className="text-sm text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
