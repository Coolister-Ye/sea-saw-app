import { create } from 'zustand';
import { AuthService } from '@/services/AuthService';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  groups: Array<{ name: string }>;
}

interface AuthState {
  // State
  user: User | null;
  isInitialized: boolean;
  loading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (username: string, password: string) => Promise<{ status: boolean; errorMsg?: string }>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  setPassword: (newPassword: string, currentPassword: string) => Promise<void>;
  isGroupX: (groupName: string) => boolean;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isInitialized: false,
  loading: false,

  // Actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (isInitialized) => set({ isInitialized }),

  getUserProfile: async () => {
    try {
      const userProfile = await AuthService.getUserProfile();
      set({ user: userProfile });
    } catch (error) {
      set({ user: null });
      throw error;
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const response = await AuthService.login(username, password);
      if (response.status) {
        await get().getUserProfile();
      }
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Login failed";
      return { status: false, errorMsg };
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await AuthService.logout();
      set({ user: null });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setPassword: async (newPassword, currentPassword) => {
    set({ loading: true });
    try {
      await AuthService.setPassword(newPassword, currentPassword);
      set({ user: null });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  isGroupX: (groupName) => {
    const user = get().user;
    return user?.groups?.some(group => group.name === groupName) ?? false;
  },

  initialize: async () => {
    try {
      const loggedIn = await AuthService.isLogin();
      if (loggedIn) {
        await get().getUserProfile();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isInitialized: true });
    }
  },
}));

// Computed selectors
export const selectIsLogin = (state: AuthState) => state.user !== null;
export const selectIsStaff = (state: AuthState) => state.user?.is_staff ?? false;
export const selectUser = (state: AuthState) => state.user;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
export const selectLoading = (state: AuthState) => state.loading;
