'use client';

import { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  const user: User | null = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      image: session.user.image || undefined,
    };
  }, [session]);

  const accessToken = session?.accessToken || null;

  // Email/Password login
  const login = useCallback(
    async (email: string, password: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          return { success: false, error: result.error };
        }

        if (result?.ok) {
          router.push(redirectTo || '/dashboard');
          router.refresh();
          return { success: true };
        }

        return { success: false, error: 'Login failed' };
      } catch (error: any) {
        return { success: false, error: error.message || 'An unexpected error occurred' };
      }
    },
    [router]
  );

  // Google OAuth login
  const loginWithGoogle = useCallback(
    async (redirectTo?: string) => {
      await signIn('google', {
        callbackUrl: redirectTo || '/dashboard',
      });
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
    router.refresh();
  }, [router]);

  // Register new user
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.error || 'Registration failed' };
        }

        // Auto-login after registration
        const loginResult = await login(email, password, '/dashboard');
        return loginResult;
      } catch (error: any) {
        return { success: false, error: error.message || 'Registration failed' };
      }
    },
    [login]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      accessToken,
      login,
      loginWithGoogle,
      logout,
      register,
    }),
    [user, isAuthenticated, isLoading, accessToken, login, loginWithGoogle, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for requiring authentication (redirects if not authenticated)
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const redirect = currentPath ? `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}` : redirectTo;
    router.push(redirect);
  }

  return { isAuthenticated, isLoading };
}

// Hook for getting the current user (throws if not authenticated)
export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    throw new Error('User is not authenticated');
  }

  return { user, isLoading };
}
