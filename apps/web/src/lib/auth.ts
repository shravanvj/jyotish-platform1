// NextAuth Configuration for Jyotish Platform
import { NextAuthOptions, Session, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      accessToken?: string;
      refreshToken?: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to refresh access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Invalid credentials');
          }

          const data = await response.json();

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.avatar,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),

    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),
  ],

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/register',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        if (account.provider === 'credentials') {
          return {
            ...token,
            id: user.id,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            accessTokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour
          };
        }

        // For OAuth providers, exchange the token with our backend
        if (account.provider === 'google') {
          try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/oauth/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: account.access_token,
                id_token: account.id_token,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              return {
                ...token,
                id: data.user.id,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                accessTokenExpires: Date.now() + data.expires_in * 1000,
              };
            }
          } catch (error) {
            console.error('OAuth token exchange failed:', error);
          }
        }
      }

      // Return previous token if the access token has not expired
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.accessToken = token.accessToken;
        
        if (token.error) {
          // Force sign out if token refresh failed
          session.accessToken = undefined;
        }
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // You can add additional checks here
      // For example, checking if the user is allowed to sign in
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign-in events for analytics
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
    async signOut({ token }) {
      // Optionally invalidate the token on the backend
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error('Logout notification failed:', error);
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get the server session
export { getServerSession } from 'next-auth';

// Helper to check if user is authenticated
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user && !!session?.accessToken;
}
