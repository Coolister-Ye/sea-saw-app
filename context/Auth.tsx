import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "./Toast";

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
  const { showToast } = useToast();

  // Initialize on mount
  useEffect(() => {
    store.initialize();
  }, []);

  // Wrap login to match old API and add error handling
  const login = async ({ username, password }: { username: string; password: string }) => {
    try {
      return await store.login(username, password);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      showToast({ message: errMessage, variant: "error" });
      return { status: false };
    }
  };

  // Wrap logout with error handling
  const logout = async () => {
    try {
      await store.logout();
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      showToast({ message: errMessage, variant: "error" });
    }
  };

  // Wrap setPasswd to match old API
  const setPasswd = async ({ new_password, current_password }: { new_password: string; current_password: string }) => {
    try {
      await store.setPassword(new_password, current_password);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      showToast({ message: errMessage, variant: "error" });
    }
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
