/**
 * Convenience hook for accessing auth store
 *
 * This hook provides a cleaner API for components that use the auth store directly
 * (without using the AuthProvider context).
 *
 * Usage:
 * ```typescript
 * import { useAuth } from '@/hooks/useAuth';
 *
 * function MyComponent() {
 *   const { user, isLogin, login, logout } = useAuth();
 *
 *   const handleLogin = async () => {
 *     const result = await login('username', 'password');
 *     if (result.status) {
 *       console.log('Logged in!');
 *     }
 *   };
 * }
 * ```
 */
import {
  useAuthStore,
  selectUser,
  selectIsLogin,
  selectIsStaff,
  selectLoading,
  selectHasHydrated,
  selectUserGroups,
  selectUserRole,
  selectIsAdmin,
} from '@/stores/authStore';

export function useAuthFromStore() {
  const user = useAuthStore(selectUser);
  const isLogin = useAuthStore(selectIsLogin);
  const isStaff = useAuthStore(selectIsStaff);
  const isAdmin = useAuthStore(selectIsAdmin);
  const loading = useAuthStore(selectLoading);
  const hasHydrated = useAuthStore(selectHasHydrated);
  const userGroups = useAuthStore(selectUserGroups);
  const userRole = useAuthStore(selectUserRole);

  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const getUserProfile = useAuthStore(state => state.getUserProfile);
  const setPassword = useAuthStore(state => state.setPassword);
  const isGroupX = useAuthStore(state => state.isGroupX);

  return {
    // State
    user,
    isLogin,
    isStaff,
    isAdmin,
    loading,
    hasHydrated,
    userGroups,
    userRole,

    // Actions
    login,
    logout,
    getUserProfile,
    setPassword,
    isGroupX,
  };
}
