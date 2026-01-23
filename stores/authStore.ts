import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthService } from '@/services/AuthService';
import type { User, RegisterData, ProfileUpdateData, AuthResponse } from '@/types/auth';

const isWeb = Platform.OS === 'web';

// ==================== Types ====================

/**
 * Authentication Store State
 */
interface AuthState {
  // ========== State ==========

  /** Current authenticated user or null if not logged in */
  user: User | null;

  /** Loading state for async operations */
  loading: boolean;

  /** Internal flag to track if store has been rehydrated from storage */
  _hasHydrated: boolean;

  // ========== Actions ==========

  /** Authenticate user and fetch profile */
  login: (username: string, password: string) => Promise<AuthResponse>;

  /** Log out current user and clear state */
  logout: () => Promise<void>;

  /** Fetch and update current user's profile */
  getUserProfile: () => Promise<void>;

  /** Change user's password (triggers logout) */
  setPassword: (newPassword: string, currentPassword: string) => Promise<void>;

  /** Register a new user account */
  register: (data: RegisterData) => Promise<AuthResponse>;

  /** Update current user's profile information */
  updateProfile: (data: ProfileUpdateData) => Promise<AuthResponse>;

  /** Check if user belongs to a specific group */
  isGroupX: (groupName: string) => boolean;

  /** Set hydration status (used internally by persist middleware) */
  setHasHydrated: (value: boolean) => void;

  // ========== Internal Actions ==========

  /** Manually set user state (use with caution) */
  _setUser: (user: User | null) => void;

  /** Manually set loading state (use with caution) */
  _setLoading: (loading: boolean) => void;
}

// ==================== Storage Configuration ====================

/**
 * Platform-agnostic secure storage adapter
 * Uses localStorage on web and SecureStore on native platforms
 */
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isWeb) {
      // Check if localStorage is available (might not be during SSR or initial load)
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
      }
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};

// ==================== Helper Functions ====================

/**
 * Convert error to user-friendly message
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

// ==================== Store ====================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      loading: false,
      _hasHydrated: false,

      // ==================== Actions ====================

      login: async (username, password) => {
        set({ loading: true });
        try {
          await AuthService.login(username, password);
          await get().getUserProfile();
          return { status: true };
        } catch (error) {
          return { status: false, errorMsg: getErrorMessage(error, 'Login failed') };
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await AuthService.logout();
        } catch (error) {
          // Even if logout fails, we still want to clear local state
          console.error('Logout error:', error);
        } finally {
          set({ user: null, loading: false });
        }
      },

      getUserProfile: async () => {
        try {
          const userProfile = await AuthService.getUserProfile();
          set({ user: userProfile });
        } catch (error) {
          set({ user: null });
          throw error;
        }
      },

      setPassword: async (newPassword, currentPassword) => {
        set({ loading: true });
        try {
          await AuthService.setPassword(newPassword, currentPassword);
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          await AuthService.register(data);
          return { status: true };
        } catch (error) {
          return { status: false, errorMsg: getErrorMessage(error, 'Registration failed') };
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (data) => {
        set({ loading: true });
        try {
          const updatedUser = await AuthService.updateProfile(data);
          set({ user: updatedUser });
          return { status: true };
        } catch (error) {
          return { status: false, errorMsg: getErrorMessage(error, 'Profile update failed') };
        } finally {
          set({ loading: false });
        }
      },

      isGroupX: (groupName) => {
        return get().user?.groups?.some((group) => group.name === groupName) ?? false;
      },

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      // Internal actions
      _setUser: (user) => set({ user }),
      _setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => secureStorage),

      // Only persist user state, not loading or hydration status
      partialize: (state) => ({
        user: state.user,
      }),

      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Failed to rehydrate auth store:', error);
          }
          state?.setHasHydrated(true);
        };
      },
    }
  )
);

// ==================== Selectors ====================

/**
 * Basic selectors
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsLogin = (state: AuthState) => state.user !== null;
export const selectIsStaff = (state: AuthState) => state.user?.is_staff ?? false;
export const selectLoading = (state: AuthState) => state.loading;
export const selectHasHydrated = (state: AuthState) => state._hasHydrated;

/**
 * Derived selectors
 */
export const selectUserGroups = (state: AuthState) => state.user?.groups ?? [];
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectUsername = (state: AuthState) => state.user?.username;
export const selectUserEmail = (state: AuthState) => state.user?.email;
export const selectUserId = (state: AuthState) => state.user?.id;

/**
 * Permission selectors
 */
export const selectIsAdmin = (state: AuthState) =>
  state.user?.role?.role_type === 'ADMIN' || state.user?.is_staff;

export const selectHasGroup = (groupName: string) => (state: AuthState) =>
  state.user?.groups?.some((group) => group.name === groupName) ?? false;
