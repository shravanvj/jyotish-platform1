/**
 * Global State Store using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Profile, BirthChart } from '@/types';
import { api, tokenManager } from '@/lib/api';

// ============================================
// Auth Store
// ============================================

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      await api.auth.login(email, password);
      await get().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, fullName?: string) => {
    set({ isLoading: true });
    try {
      const result = await api.auth.register({ email, password, full_name: fullName });
      tokenManager.setTokens(result.tokens);
      await get().fetchUser();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    api.auth.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    if (!tokenManager.isAuthenticated()) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await api.auth.me() as User;
      set({ user, isAuthenticated: true });
    } catch {
      tokenManager.clearTokens();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));

// ============================================
// Profile Store
// ============================================

interface ProfileState {
  profiles: Profile[];
  selectedProfile: Profile | null;
  isLoading: boolean;
  
  // Actions
  fetchProfiles: () => Promise<void>;
  selectProfile: (profileId: string) => void;
  createProfile: (data: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Profile>;
  updateProfile: (profileId: string, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  setPrimaryProfile: (profileId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  selectedProfile: null,
  isLoading: false,

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const result = await api.profiles.list({ size: 50 }) as { items: Profile[] };
      set({ profiles: result.items });
      
      // Auto-select primary profile
      const primary = result.items.find((p) => p.is_primary);
      if (primary && !get().selectedProfile) {
        set({ selectedProfile: primary });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  selectProfile: (profileId: string) => {
    const profile = get().profiles.find((p) => p.id === profileId);
    set({ selectedProfile: profile || null });
  },

  createProfile: async (data) => {
    const profile = await api.profiles.create(data as Parameters<typeof api.profiles.create>[0]) as Profile;
    set((state) => ({ profiles: [...state.profiles, profile] }));
    return profile;
  },

  updateProfile: async (profileId: string, data: Partial<Profile>) => {
    await api.profiles.update(profileId, data);
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, ...data } : p
      ),
      selectedProfile:
        state.selectedProfile?.id === profileId
          ? { ...state.selectedProfile, ...data }
          : state.selectedProfile,
    }));
  },

  deleteProfile: async (profileId: string) => {
    await api.profiles.delete(profileId);
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== profileId),
      selectedProfile:
        state.selectedProfile?.id === profileId ? null : state.selectedProfile,
    }));
  },

  setPrimaryProfile: async (profileId: string) => {
    await api.profiles.setPrimary(profileId);
    set((state) => ({
      profiles: state.profiles.map((p) => ({
        ...p,
        is_primary: p.id === profileId,
      })),
    }));
  },
}));

// ============================================
// Chart Store
// ============================================

interface ChartState {
  currentChart: BirthChart | null;
  chartHistory: BirthChart[];
  isLoading: boolean;
  
  // Actions
  calculateChart: (data: {
    birth_datetime: string;
    latitude: number;
    longitude: number;
    timezone_offset: number;
    ayanamsa?: string;
  }) => Promise<BirthChart>;
  loadProfileChart: (profileId: string) => Promise<BirthChart>;
  clearChart: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  currentChart: null,
  chartHistory: [],
  isLoading: false,

  calculateChart: async (data) => {
    set({ isLoading: true });
    try {
      const chart = await api.birthChart.calculate(data) as BirthChart;
      set((state) => ({
        currentChart: chart,
        chartHistory: [chart, ...state.chartHistory.slice(0, 9)],
      }));
      return chart;
    } finally {
      set({ isLoading: false });
    }
  },

  loadProfileChart: async (profileId: string) => {
    set({ isLoading: true });
    try {
      const chart = await api.profiles.getChart(profileId) as BirthChart;
      set({ currentChart: chart });
      return chart;
    } finally {
      set({ isLoading: false });
    }
  },

  clearChart: () => {
    set({ currentChart: null });
  },
}));

// ============================================
// Settings Store (persisted)
// ============================================

interface SettingsState {
  // Display preferences
  chartStyle: 'south_indian' | 'north_indian' | 'western';
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'ta' | 'te';
  
  // Calculation preferences
  ayanamsa: 'lahiri' | 'raman' | 'krishnamurti' | 'true_chitrapaksha';
  houseSystem: 'whole_sign' | 'placidus' | 'equal';
  
  // Location defaults
  defaultLatitude: number;
  defaultLongitude: number;
  defaultTimezone: string;
  defaultLocationName: string;
  
  // Actions
  setChartStyle: (style: SettingsState['chartStyle']) => void;
  setTheme: (theme: SettingsState['theme']) => void;
  setLanguage: (language: SettingsState['language']) => void;
  setAyanamsa: (ayanamsa: SettingsState['ayanamsa']) => void;
  setHouseSystem: (system: SettingsState['houseSystem']) => void;
  setDefaultLocation: (location: {
    latitude: number;
    longitude: number;
    timezone: string;
    name: string;
  }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      chartStyle: 'south_indian',
      theme: 'system',
      language: 'en',
      ayanamsa: 'lahiri',
      houseSystem: 'whole_sign',
      defaultLatitude: 28.6139, // Delhi
      defaultLongitude: 77.209,
      defaultTimezone: 'Asia/Kolkata',
      defaultLocationName: 'New Delhi, India',

      // Actions
      setChartStyle: (chartStyle) => set({ chartStyle }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setAyanamsa: (ayanamsa) => set({ ayanamsa }),
      setHouseSystem: (houseSystem) => set({ houseSystem }),
      setDefaultLocation: (location) =>
        set({
          defaultLatitude: location.latitude,
          defaultLongitude: location.longitude,
          defaultTimezone: location.timezone,
          defaultLocationName: location.name,
        }),
    }),
    {
      name: 'jyotish-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// UI Store
// ============================================

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto-remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  
  removeToast: (id) => set((state) => ({ 
    toasts: state.toasts.filter((t) => t.id !== id) 
  })),
}));
