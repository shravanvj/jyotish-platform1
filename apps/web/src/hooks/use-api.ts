'use client';

/**
 * React Query Hooks for Jyotish Platform API
 * Provides type-safe hooks for all API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api, ApiException } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

// ============================================
// Types
// ============================================

export interface BirthChartInput {
  birth_datetime: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  ayanamsa?: string;
}

export interface PanchangInput {
  date: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface MatchmakingInput {
  male_birth_datetime: string;
  male_latitude: number;
  male_longitude: number;
  male_timezone_offset: number;
  female_birth_datetime: string;
  female_latitude: number;
  female_longitude: number;
  female_timezone_offset: number;
  system?: string;
}

export interface MuhuratSearchInput {
  event_type: string;
  start_date: string;
  end_date: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  min_quality?: string;
}

export interface ProfileInput {
  name: string;
  relationship?: string;
  birth_datetime: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  timezone_offset: number;
}

export interface ReportInput {
  report_type: string;
  profile_id: string;
  partner_profile_id?: string;
  include_remedies?: boolean;
  include_gemstones?: boolean;
  include_mantras?: boolean;
  language?: string;
}

export interface ApiKeyInput {
  name: string;
  scopes: string[];
}

// ============================================
// Helper Hook - Authentication Check
// ============================================

function useAuthenticatedQuery<T>(
  key: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiException>, 'queryKey' | 'queryFn'>
) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return useQuery<T, ApiException>({
    queryKey: key,
    queryFn,
    enabled: isAuthenticated && (options?.enabled !== false),
    ...options,
  });
}

// ============================================
// User Profile Hooks
// ============================================

export function useUserProfile() {
  return useAuthenticatedQuery(
    queryKeys.user.profile(),
    () => api.auth.me()
  );
}

// ============================================
// Birth Chart Hooks
// ============================================

export function useBirthChartCalculation(
  options?: Omit<UseMutationOptions<unknown, ApiException, BirthChartInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, BirthChartInput>({
    mutationFn: (data) => api.birthChart.calculate(data),
    onSuccess: (data, variables) => {
      // Cache the result
      queryClient.setQueryData(
        queryKeys.chart.generate(variables),
        data
      );
    },
    ...options,
  });
}

export function useDivisionalChart(
  options?: Omit<
    UseMutationOptions<
      unknown,
      ApiException,
      BirthChartInput & { chart_type: string }
    >,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: (data: BirthChartInput & { chart_type: string }) =>
      api.birthChart.divisional(data),
    ...options,
  });
}

// ============================================
// Panchang Hooks
// ============================================

export function useDailyPanchang(
  params: PanchangInput | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: queryKeys.panchang.date(params?.date || '', params?.latitude?.toString()),
    queryFn: () => api.panchang.daily(params!),
    enabled: !!params && !!params.date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useMonthlyPanchang(
  params: { year: number; month: number; latitude: number; longitude: number } | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: ['panchang', 'monthly', params?.year, params?.month, params?.latitude],
    queryFn: () => api.panchang.monthly(params!),
    enabled: !!params,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

// ============================================
// Horoscope Hooks
// ============================================

export function useRashis() {
  return useQuery({
    queryKey: ['horoscope', 'rashis'],
    queryFn: () => api.horoscope.rashis(),
    staleTime: Infinity, // Rashis don't change
  });
}

export function useDailyHoroscope(
  rashi: string | null,
  date?: string,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: queryKeys.horoscope.daily(rashi || '', date),
    queryFn: () => api.horoscope.daily(rashi!, { date }),
    enabled: !!rashi,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

export function useWeeklyHoroscope(
  rashi: string | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: queryKeys.horoscope.weekly(rashi || ''),
    queryFn: () => api.horoscope.weekly(rashi!),
    enabled: !!rashi,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

export function useMonthlyHoroscope(
  rashi: string | null,
  year?: number,
  month?: number,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: queryKeys.horoscope.monthly(rashi || ''),
    queryFn: () => api.horoscope.monthly(rashi!, { year, month }),
    enabled: !!rashi,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    ...options,
  });
}

export function useYearlyHoroscope(
  rashi: string | null,
  year?: number,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: queryKeys.horoscope.yearly(rashi || ''),
    queryFn: () => api.horoscope.yearly(rashi!, { year }),
    enabled: !!rashi,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    ...options,
  });
}

export function useTodayHoroscopes() {
  return useQuery({
    queryKey: ['horoscope', 'today'],
    queryFn: () => api.horoscope.today(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// ============================================
// Matchmaking Hooks
// ============================================

export function useMatchmakingCalculation(
  options?: Omit<UseMutationOptions<unknown, ApiException, MatchmakingInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, MatchmakingInput>({
    mutationFn: (data) => api.matchmaking.calculate(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.matchmaking.calculate(variables),
        data
      );
    },
    ...options,
  });
}

// ============================================
// Muhurat Hooks
// ============================================

export function useMuhuratEventTypes() {
  return useQuery({
    queryKey: queryKeys.muhurat.types(),
    queryFn: () => api.muhurat.eventTypes(),
    staleTime: Infinity,
  });
}

export function useMuhuratSearch(
  options?: Omit<UseMutationOptions<unknown, ApiException, MuhuratSearchInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, MuhuratSearchInput>({
    mutationFn: (data) => api.muhurat.search(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.muhurat.find(variables),
        data
      );
    },
    ...options,
  });
}

export function useChoghadiya(
  params: { date: string; latitude: number; longitude: number; timezone_offset: number } | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: ['muhurat', 'choghadiya', params?.date, params?.latitude],
    queryFn: () => api.muhurat.choghadiya(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useHora(
  params: { date: string; latitude: number; longitude: number; timezone_offset: number } | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: ['muhurat', 'hora', params?.date, params?.latitude],
    queryFn: () => api.muhurat.hora(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useTodayMuhurats(
  params: { latitude: number; longitude: number; timezone_offset: number } | null,
  options?: Omit<UseQueryOptions<unknown, ApiException>, 'queryKey' | 'queryFn'>
) {
  return useQuery<unknown, ApiException>({
    queryKey: ['muhurat', 'today', params?.latitude, params?.longitude],
    queryFn: () => api.muhurat.today(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ============================================
// Profiles Hooks
// ============================================

export function useProfiles(
  params?: { page?: number; size?: number; relationship?: string }
) {
  return useAuthenticatedQuery(
    ['profiles', 'list', params],
    () => api.profiles.list(params)
  );
}

export function useProfile(profileId: string | null) {
  return useAuthenticatedQuery(
    ['profiles', profileId],
    () => api.profiles.get(profileId!),
    { enabled: !!profileId }
  );
}

export function useCreateProfile(
  options?: Omit<UseMutationOptions<unknown, ApiException, ProfileInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, ProfileInput>({
    mutationFn: (data) => api.profiles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    ...options,
  });
}

export function useUpdateProfile(
  options?: Omit<
    UseMutationOptions<unknown, ApiException, { id: string; data: Partial<ProfileInput> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, { id: string; data: Partial<ProfileInput> }>({
    mutationFn: ({ id, data }) => api.profiles.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['profiles', id] });
      queryClient.invalidateQueries({ queryKey: ['profiles', 'list'] });
    },
    ...options,
  });
}

export function useDeleteProfile(
  options?: Omit<UseMutationOptions<void, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiException, string>({
    mutationFn: (id) => api.profiles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    ...options,
  });
}

export function useSetPrimaryProfile(
  options?: Omit<UseMutationOptions<unknown, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, string>({
    mutationFn: (id) => api.profiles.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    ...options,
  });
}

export function useProfileChart(profileId: string | null, ayanamsa?: string) {
  return useAuthenticatedQuery(
    ['profiles', profileId, 'chart', ayanamsa],
    () => api.profiles.getChart(profileId!, { ayanamsa }),
    { enabled: !!profileId }
  );
}

// ============================================
// Reports Hooks
// ============================================

export function useReportTypes() {
  return useQuery({
    queryKey: ['reports', 'types'],
    queryFn: () => api.reports.types(),
    staleTime: Infinity,
  });
}

export function useReports(
  params?: { page?: number; size?: number; report_type?: string; status?: string }
) {
  return useAuthenticatedQuery(
    queryKeys.reports.list(params),
    () => api.reports.list(params)
  );
}

export function useReport(reportId: string | null) {
  return useAuthenticatedQuery(
    queryKeys.reports.detail(reportId || ''),
    () => api.reports.get(reportId!),
    { enabled: !!reportId }
  );
}

export function useCreateReport(
  options?: Omit<UseMutationOptions<unknown, ApiException, ReportInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, ReportInput>({
    mutationFn: (data) => api.reports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    ...options,
  });
}

export function useDeleteReport(
  options?: Omit<UseMutationOptions<void, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiException, string>({
    mutationFn: (id) => api.reports.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    ...options,
  });
}

export function useDownloadReport() {
  return useMutation<Blob, ApiException, string>({
    mutationFn: (id) => api.reports.download(id),
  });
}

export function useRegenerateReport(
  options?: Omit<UseMutationOptions<unknown, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, string>({
    mutationFn: (id) => api.reports.regenerate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['reports', 'list'] });
    },
    ...options,
  });
}

// ============================================
// API Keys Hooks
// ============================================

export function useApiKeyScopes() {
  return useQuery({
    queryKey: ['apiKeys', 'scopes'],
    queryFn: () => api.apiKeys.scopes(),
    staleTime: Infinity,
  });
}

export function useApiKeyLimits() {
  return useAuthenticatedQuery(
    ['apiKeys', 'limits'],
    () => api.apiKeys.limits()
  );
}

export function useApiKeys() {
  return useAuthenticatedQuery(
    queryKeys.user.apiKeys(),
    () => api.apiKeys.list()
  );
}

export function useApiKey(keyId: string | null) {
  return useAuthenticatedQuery(
    ['apiKeys', keyId],
    () => api.apiKeys.get(keyId!),
    { enabled: !!keyId }
  );
}

export function useCreateApiKey(
  options?: Omit<UseMutationOptions<unknown, ApiException, ApiKeyInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, ApiKeyInput>({
    mutationFn: (data) => api.apiKeys.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    ...options,
  });
}

export function useUpdateApiKey(
  options?: Omit<
    UseMutationOptions<
      unknown,
      ApiException,
      { id: string; data: { name?: string; scopes?: string[]; is_active?: boolean } }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; scopes?: string[]; is_active?: boolean } }) =>
      api.apiKeys.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.apiKeys() });
    },
    ...options,
  });
}

export function useDeleteApiKey(
  options?: Omit<UseMutationOptions<void, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiException, string>({
    mutationFn: (id) => api.apiKeys.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    ...options,
  });
}

export function useRegenerateApiKey(
  options?: Omit<UseMutationOptions<unknown, ApiException, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiException, string>({
    mutationFn: (id) => api.apiKeys.regenerate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys', id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.apiKeys() });
    },
    ...options,
  });
}

export function useApiKeyUsage(
  keyId: string | null,
  params?: { start_date?: string; end_date?: string }
) {
  return useAuthenticatedQuery(
    ['apiKeys', keyId, 'usage', params],
    () => api.apiKeys.usage(keyId!, params),
    { enabled: !!keyId }
  );
}
