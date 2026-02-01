/**
 * API Client for Jyotish Platform
 * Handles all HTTP requests to the backend API
 */

import { AuthTokens, ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'jyotish_access_token';
const REFRESH_TOKEN_KEY = 'jyotish_refresh_token';

// ============================================
// Token Management
// ============================================

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

// ============================================
// Error Handling
// ============================================

export class ApiException extends Error {
  status: number;
  code?: string;
  field?: string;

  constructor(message: string, status: number, code?: string, field?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    throw new ApiException(
      errorData.detail || 'An error occurred',
      response.status,
      errorData.code,
      errorData.field
    );
  }
  
  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  
  return JSON.parse(text) as T;
}

// ============================================
// Request Helpers
// ============================================

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const tokens = await response.json();
      tokenManager.setTokens(tokens);
      return true;
    }
  } catch {
    // Refresh failed
  }

  tokenManager.clearTokens();
  return false;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    params,
  } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make request
  let response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 - try refresh
  if (response.status === 401 && auth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const newToken = tokenManager.getAccessToken();
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
    }
  }

  return handleResponse<T>(response);
}

// ============================================
// API Methods
// ============================================

export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; full_name?: string }) =>
      request<{ user: unknown; tokens: AuthTokens }>('/auth/register', {
        method: 'POST',
        body: data,
        auth: false,
      }),

    login: (email: string, password: string) =>
      request<AuthTokens>('/auth/login', {
        method: 'POST',
        body: { username: email, password },
        auth: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then((tokens) => {
        tokenManager.setTokens(tokens);
        return tokens;
      }),

    logout: () => {
      tokenManager.clearTokens();
      return Promise.resolve();
    },

    me: () => request<{ id: string; email: string; full_name?: string; subscription_tier: string }>('/auth/me'),

    refresh: () =>
      request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        body: { refresh_token: tokenManager.getRefreshToken() },
        auth: false,
      }).then((tokens) => {
        tokenManager.setTokens(tokens);
        return tokens;
      }),
  },

  // Birth Chart
  birthChart: {
    calculate: (data: {
      birth_datetime: string;
      latitude: number;
      longitude: number;
      timezone_offset: number;
      ayanamsa?: string;
    }) =>
      request<unknown>('/birth-chart/calculate', {
        method: 'POST',
        body: data,
      }),

    divisional: (data: {
      birth_datetime: string;
      latitude: number;
      longitude: number;
      timezone_offset: number;
      chart_type: string;
    }) =>
      request<unknown>('/birth-chart/divisional', {
        method: 'POST',
        body: data,
      }),
  },

  // Panchang
  panchang: {
    daily: (params: { date: string; latitude: number; longitude: number; timezone?: string }) =>
      request<unknown>('/panchang/daily', { params }),

    monthly: (params: { year: number; month: number; latitude: number; longitude: number }) =>
      request<unknown>('/panchang/monthly', { params }),
  },

  // Matchmaking
  matchmaking: {
    calculate: (data: {
      male_birth_datetime: string;
      male_latitude: number;
      male_longitude: number;
      male_timezone_offset: number;
      female_birth_datetime: string;
      female_latitude: number;
      female_longitude: number;
      female_timezone_offset: number;
      system?: string;
    }) =>
      request<unknown>('/matchmaking/calculate', {
        method: 'POST',
        body: data,
      }),
  },

  // Muhurat
  muhurat: {
    search: (data: {
      event_type: string;
      start_date: string;
      end_date: string;
      latitude: number;
      longitude: number;
      timezone_offset: number;
      min_quality?: string;
    }) =>
      request<unknown>('/muhurat/search', {
        method: 'POST',
        body: data,
      }),

    eventTypes: () => request<unknown>('/muhurat/event-types'),

    choghadiya: (params: { date: string; latitude: number; longitude: number; timezone_offset: number }) =>
      request<unknown>('/muhurat/choghadiya', { params }),

    hora: (params: { date: string; latitude: number; longitude: number; timezone_offset: number }) =>
      request<unknown>('/muhurat/hora', { params }),

    today: (params: { latitude: number; longitude: number; timezone_offset: number }) =>
      request<unknown>('/muhurat/today', { params }),
  },

  // Horoscope
  horoscope: {
    rashis: () => request<unknown>('/horoscope/rashis'),

    daily: (rashi: string, params?: { date?: string }) =>
      request<unknown>(`/horoscope/daily/${rashi}`, { params }),

    weekly: (rashi: string, params?: { start_date?: string }) =>
      request<unknown>(`/horoscope/weekly/${rashi}`, { params }),

    monthly: (rashi: string, params?: { year?: number; month?: number }) =>
      request<unknown>(`/horoscope/monthly/${rashi}`, { params }),

    yearly: (rashi: string, params?: { year?: number }) =>
      request<unknown>(`/horoscope/yearly/${rashi}`, { params }),

    today: () => request<unknown>('/horoscope/today'),
  },

  // Profiles
  profiles: {
    list: (params?: { page?: number; size?: number; relationship?: string }) =>
      request<unknown>('/profiles/', { params }),

    create: (data: {
      name: string;
      relationship?: string;
      birth_datetime: string;
      latitude: number;
      longitude: number;
      location_name?: string;
      timezone_offset: number;
    }) =>
      request<unknown>('/profiles/', {
        method: 'POST',
        body: data,
      }),

    get: (profileId: string) => request<unknown>(`/profiles/${profileId}`),

    update: (profileId: string, data: Partial<{
      name: string;
      relationship: string;
      birth_datetime: string;
      latitude: number;
      longitude: number;
      location_name: string;
      timezone_offset: number;
    }>) =>
      request<unknown>(`/profiles/${profileId}`, {
        method: 'PUT',
        body: data,
      }),

    delete: (profileId: string) =>
      request<void>(`/profiles/${profileId}`, { method: 'DELETE' }),

    setPrimary: (profileId: string) =>
      request<unknown>(`/profiles/${profileId}/set-primary`, { method: 'POST' }),

    getChart: (profileId: string, params?: { ayanamsa?: string }) =>
      request<unknown>(`/profiles/${profileId}/chart`, { params }),
  },

  // Reports
  reports: {
    types: () => request<unknown>('/reports/types'),

    list: (params?: { page?: number; size?: number; report_type?: string; status?: string }) =>
      request<unknown>('/reports/', { params }),

    create: (data: {
      report_type: string;
      profile_id: string;
      partner_profile_id?: string;
      include_remedies?: boolean;
      include_gemstones?: boolean;
      include_mantras?: boolean;
      language?: string;
    }) =>
      request<unknown>('/reports/', {
        method: 'POST',
        body: data,
      }),

    get: (reportId: string) => request<unknown>(`/reports/${reportId}`),

    delete: (reportId: string) =>
      request<void>(`/reports/${reportId}`, { method: 'DELETE' }),

    download: async (reportId: string): Promise<Blob> => {
      const token = tokenManager.getAccessToken();
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new ApiException('Failed to download report', response.status);
      }
      return response.blob();
    },

    regenerate: (reportId: string) =>
      request<unknown>(`/reports/${reportId}/regenerate`, { method: 'POST' }),
  },

  // API Keys
  apiKeys: {
    scopes: () => request<unknown>('/api-keys/scopes'),

    limits: () => request<unknown>('/api-keys/limits'),

    list: () => request<unknown>('/api-keys/'),

    create: (data: { name: string; scopes: string[] }) =>
      request<unknown>('/api-keys/', {
        method: 'POST',
        body: data,
      }),

    get: (keyId: string) => request<unknown>(`/api-keys/${keyId}`),

    update: (keyId: string, data: { name?: string; scopes?: string[]; is_active?: boolean }) =>
      request<unknown>(`/api-keys/${keyId}`, {
        method: 'PUT',
        body: data,
      }),

    delete: (keyId: string) =>
      request<void>(`/api-keys/${keyId}`, { method: 'DELETE' }),

    regenerate: (keyId: string) =>
      request<unknown>(`/api-keys/${keyId}/regenerate`, { method: 'POST' }),

    usage: (keyId: string, params?: { start_date?: string; end_date?: string }) =>
      request<unknown>(`/api-keys/${keyId}/usage`, { params }),
  },
};

export default api;
