'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  type: 'sales' | 'support' | 'partnership' | 'other';
}

const contactTypes = [
  { value: 'sales', label: 'Sales Inquiry', icon: '💼' },
  { value: 'support', label: 'Technical Support', icon: '🔧' },
  { value: 'partnership', label: 'Partnership', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📩' },
];

const faqs = [
  {
    question: 'How quickly will I get a response?',
    answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please indicate so in your message.',
  },
  {
    question: 'Do you offer custom solutions?',
    answer: 'Yes! We work with enterprises to create custom integrations, white-label solutions, and tailored features. Contact our sales team to discuss your needs.',
  },
  {
    question: 'Can I schedule a demo?',
    answer: 'Absolutely! Select "Sales Inquiry" and mention that you\'d like to schedule a demo. We\'ll reach out with available time slots.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    type: 'sales',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen py-12 bg-background">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="card-vedic p-12">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl mb-4">
                Message Sent Successfully!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for reaching out. We've received your message and will get back to you within 24 hours.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      company: '',
                      phone: '',
                      subject: '',
                      message: '',
                      type: 'sales',
                    });
                  }}
                  className="px-6 py-3 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our platform? Want to explore enterprise solutions? We're here to help.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="card-vedic p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">Send us a message</h2>

                {/* Contact Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {contactTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange('type', type.value)}
                        className={cn(
                          'p-3 rounded-lg border text-center transition-colors',
                          formData.type === type.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                            : 'border-border hover:border-primary-300 hover:bg-muted'
                        )}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-xs font-medium text-foreground">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Doe"
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.name ? 'border-red-500' : 'border-border'
                        )}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className={cn(
                          'w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500',
                          errors.email ? 'border-red-500' : 'border-border'
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Your company name"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="How can we help?"
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500',
                        errors.subject ? 'border-red-500' : 'border-border'
                      )}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us more about your needs..."
                      rows={5}
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none',
                        errors.message ? 'border-red-500' : 'border-border'
                      )}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="card-vedic p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:support@jyotish.ai" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        support@jyotish.ai
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💼</span>
                    <div>
                      <p className="font-medium text-foreground">Sales</p>
                      <a href="mailto:sales@jyotish.ai" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        sales@jyotish.ai
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-medium text-foreground">Office</p>
                      <p className="text-sm text-muted-foreground">
                        123 Tech Hub, Bangalore<br />
                        Karnataka, India 560001
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="card-vedic p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="p-3 rounded-lg bg-muted hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="p-3 rounded-lg bg-muted hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                    aria-label="GitHub"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="p-3 rounded-lg bg-muted hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* FAQs */}
              <div className="card-vedic p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick FAQ</h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx}>
                      <h4 className="text-sm font-medium text-foreground">{faq.question}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/pricing"
                  className="mt-4 inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View full FAQ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
