'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Redirect to login with success message
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-primary-50/50 dark:to-primary-950/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600">
            <span className="text-2xl font-bold text-white">ॐ</span>
          </div>
          <span className="font-display text-2xl font-semibold text-primary-900 dark:text-primary-100">
            Jyotish
          </span>
        </Link>

        {/* Card */}
        <div className="card-vedic p-8">
          <h1 className="text-2xl font-display font-semibold text-center text-foreground mb-2">
            Create Your Account
          </h1>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Start your cosmic journey with free birth charts and predictions
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                autoComplete="name"
                placeholder="John Doe"
                className={cn(
                  'block w-full rounded-md border px-4 py-2.5 text-sm',
                  'border-input bg-background placeholder:text-muted-foreground',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.name && 'border-destructive'
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={cn(
                  'block w-full rounded-md border px-4 py-2.5 text-sm',
                  'border-input bg-background placeholder:text-muted-foreground',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.email && 'border-destructive'
                )}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={cn(
                  'block w-full rounded-md border px-4 py-2.5 text-sm',
                  'border-input bg-background placeholder:text-muted-foreground',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.password && 'border-destructive'
                )}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                className={cn(
                  'block w-full rounded-md border px-4 py-2.5 text-sm',
                  'border-input bg-background placeholder:text-muted-foreground',
                  'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
                  errors.confirmPassword && 'border-destructive'
                )}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                id="acceptTerms"
                className="mt-0.5 h-4 w-4 rounded border-input text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white',
                'bg-primary-600 hover:bg-primary-700 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-200 dark:border-primary-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-4 text-muted-foreground dark:bg-surface-dark">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <button
            type="button"
            className={cn(
              'w-full flex items-center justify-center gap-3 rounded-md border px-4 py-2.5 text-sm font-medium',
              'border-input bg-background text-foreground',
              'hover:bg-muted transition-colors'
            )}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign in link */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
