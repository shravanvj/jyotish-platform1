/**
 * Custom React Hooks for Jyotish Platform
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api, ApiException } from '@/lib/api';
import { useAuthStore, useSettingsStore, useUIStore } from '@/store';
import type {
  BirthChart,
  Panchang,
  CompatibilityResult,
  DailyHoroscope,
  Profile,
  Report,
  Muhurat,
} from '@/types';

// ============================================
// Auth Hooks
// ============================================

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, logout, register, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };
}

// ============================================
// Birth Chart Hooks
// ============================================

export function useBirthChart(
  data: {
    birth_datetime: string;
    latitude: number;
    longitude: number;
    timezone_offset: number;
    ayanamsa?: string;
  } | null,
  options?: Omit<UseQueryOptions<BirthChart, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['birth-chart', data],
    queryFn: () => api.birthChart.calculate(data!) as Promise<BirthChart>,
    enabled: !!data,
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
}

export function useProfileChart(profileId: string | null) {
  return useQuery({
    queryKey: ['profile-chart', profileId],
    queryFn: () => api.profiles.getChart(profileId!) as Promise<BirthChart>,
    enabled: !!profileId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ============================================
// Panchang Hooks
// ============================================

export function usePanchang(
  params: {
    date: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  } | null
) {
  return useQuery({
    queryKey: ['panchang', params],
    queryFn: () => api.panchang.daily(params!) as Promise<Panchang>,
    enabled: !!params,
    staleTime: 1000 * 60 * 60, // 1 hour (panchang changes daily)
  });
}

export function useTodayPanchang() {
  const { defaultLatitude, defaultLongitude, defaultTimezone } = useSettingsStore();
  const today = new Date().toISOString().split('T')[0];

  return usePanchang({
    date: today,
    latitude: defaultLatitude,
    longitude: defaultLongitude,
    timezone: defaultTimezone,
  });
}

// ============================================
// Matchmaking Hooks
// ============================================

export function useMatchmaking() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.matchmaking.calculate>[0]) =>
      api.matchmaking.calculate(data) as Promise<CompatibilityResult>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compatibility'] });
    },
    onError: (error: ApiException) => {
      addToast({
        type: 'error',
        message: error.message || 'Failed to calculate compatibility',
      });
    },
  });
}

// ============================================
// Horoscope Hooks
// ============================================

export function useDailyHoroscope(rashi: string | null, date?: string) {
  return useQuery({
    queryKey: ['horoscope', 'daily', rashi, date],
    queryFn: () => api.horoscope.daily(rashi!, { date }) as Promise<DailyHoroscope>,
    enabled: !!rashi,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
}

export function useAllDailyHoroscopes() {
  return useQuery({
    queryKey: ['horoscope', 'today'],
    queryFn: () => api.horoscope.today() as Promise<Record<string, DailyHoroscope>>,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
}

// ============================================
// Muhurat Hooks
// ============================================

export function useMuhuratSearch(
  params: Parameters<typeof api.muhurat.search>[0] | null
) {
  return useQuery({
    queryKey: ['muhurat', 'search', params],
    queryFn: () => api.muhurat.search(params!) as Promise<{ muhurats: Muhurat[] }>,
    enabled: !!params,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTodayMuhurat() {
  const { defaultLatitude, defaultLongitude } = useSettingsStore();
  const timezoneOffset = -(new Date().getTimezoneOffset() / 60);

  return useQuery({
    queryKey: ['muhurat', 'today', defaultLatitude, defaultLongitude],
    queryFn: () =>
      api.muhurat.today({
        latitude: defaultLatitude,
        longitude: defaultLongitude,
        timezone_offset: timezoneOffset,
      }),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================
// Profile Hooks
// ============================================

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list({ size: 50 }) as Promise<{ items: Profile[] }>,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProfile(profileId: string | null) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.profiles.get(profileId!) as Promise<Profile>,
    enabled: !!profileId,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.profiles.create>[0]) =>
      api.profiles.create(data) as Promise<Profile>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      addToast({ type: 'success', message: 'Profile created successfully' });
    },
    onError: (error: ApiException) => {
      addToast({ type: 'error', message: error.message || 'Failed to create profile' });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (profileId: string) => api.profiles.delete(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      addToast({ type: 'success', message: 'Profile deleted' });
    },
    onError: (error: ApiException) => {
      addToast({ type: 'error', message: error.message || 'Failed to delete profile' });
    },
  });
}

// ============================================
// Report Hooks
// ============================================

export function useReports(params?: { page?: number; report_type?: string; status?: string }) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: () => api.reports.list(params) as Promise<{ items: Report[] }>,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => api.reports.get(reportId!) as Promise<Report>,
    enabled: !!reportId,
    refetchInterval: (query) => {
      // Poll while processing
      const data = query.state.data as Report | undefined;
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 5000; // 5 seconds
      }
      return false;
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof api.reports.create>[0]) =>
      api.reports.create(data) as Promise<Report>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      addToast({ type: 'success', message: 'Report generation started' });
    },
    onError: (error: ApiException) => {
      addToast({ type: 'error', message: error.message || 'Failed to create report' });
    },
  });
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Local storage hook
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(newValue));
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * Media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Check if mobile viewport
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Geolocation hook
 */
export function useGeolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { location, error, loading, getLocation };
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Click outside hook
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Keyboard shortcut hook
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        !!event.ctrlKey === !!modifiers.ctrl &&
        !!event.shiftKey === !!modifiers.shift &&
        !!event.altKey === !!modifiers.alt
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
}

// Re-export all React Query API hooks
export * from './use-api';
