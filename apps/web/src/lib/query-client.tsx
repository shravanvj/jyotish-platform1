'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

// Default query options
const defaultQueryOptions = {
  queries: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: defaultQueryOptions,
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// Export query keys for consistent cache management
export const queryKeys = {
  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    apiKeys: () => [...queryKeys.user.all, 'apiKeys'] as const,
  },
  
  // Birth chart queries
  chart: {
    all: ['chart'] as const,
    detail: (id: string) => [...queryKeys.chart.all, id] as const,
    saved: () => [...queryKeys.chart.all, 'saved'] as const,
    generate: (params: any) => [...queryKeys.chart.all, 'generate', params] as const,
  },
  
  // Panchang queries
  panchang: {
    all: ['panchang'] as const,
    date: (date: string, location?: string) => [...queryKeys.panchang.all, date, location] as const,
  },
  
  // Horoscope queries
  horoscope: {
    all: ['horoscope'] as const,
    daily: (sign: string, date?: string) => [...queryKeys.horoscope.all, 'daily', sign, date] as const,
    weekly: (sign: string) => [...queryKeys.horoscope.all, 'weekly', sign] as const,
    monthly: (sign: string) => [...queryKeys.horoscope.all, 'monthly', sign] as const,
    yearly: (sign: string) => [...queryKeys.horoscope.all, 'yearly', sign] as const,
  },
  
  // Matchmaking queries
  matchmaking: {
    all: ['matchmaking'] as const,
    detail: (id: string) => [...queryKeys.matchmaking.all, id] as const,
    saved: () => [...queryKeys.matchmaking.all, 'saved'] as const,
    calculate: (params: any) => [...queryKeys.matchmaking.all, 'calculate', params] as const,
  },
  
  // Muhurat queries
  muhurat: {
    all: ['muhurat'] as const,
    find: (params: any) => [...queryKeys.muhurat.all, 'find', params] as const,
    types: () => [...queryKeys.muhurat.all, 'types'] as const,
  },
  
  // Reports queries
  reports: {
    all: ['reports'] as const,
    list: (params?: any) => [...queryKeys.reports.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.reports.all, id] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
  },
};

// Custom hook for creating query client
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}
