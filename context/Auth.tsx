import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

interface AuthContextType {
  isLogin: boolean;
  user: any;
  loading: boolean;
  isInitialized: boolean;
  login: (params: { username: string; password: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isGroupX: (groupName: string) => boolean;
  isStaff: boolean;
  setPasswd: (params: { new_password: string; current_password: string }) => Promise<void>;
}

interface AuthResponse {
  status: boolean;
  errorMsg?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const store = useAuthStore();

  // Initialize on mount
  useEffect(() => {
    store.initialize();
  }, []);

  // Wrap login to match old API - errors are returned, not thrown
  const login = async ({ username, password }: { username: string; password: string }) => {
    return await store.login(username, password);
  };

  // Wrap logout - errors are thrown for caller to handle
  const logout = async () => {
    await store.logout();
  };

  // Wrap setPasswd to match old API - errors are thrown for caller to handle
  const setPasswd = async ({ new_password, current_password }: { new_password: string; current_password: string }) => {
    await store.setPassword(new_password, current_password);
  };

  return (
    <AuthContext.Provider
      value={{
        isLogin: store.user !== null,
        user: store.user,
        loading: store.loading,
        isInitialized: store.isInitialized,
        login,
        logout,
        isGroupX: store.isGroupX,
        isStaff: store.user?.is_staff ?? false,
        setPasswd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export store for new code
export { useAuthStore };
