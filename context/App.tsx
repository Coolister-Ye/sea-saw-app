import React, { ReactNode } from "react";
import { AuthProvider } from "./Auth";
import { LocaleProvider } from "./Locale";
import { ToastProvider } from "./Toast";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";

// Simplified provider composition
export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ToastProvider>
      <LocaleProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LocaleProvider>
    </ToastProvider>
  );
};

// Backward compatible hook using selectors
export const useAppContext = () => {
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isLoading = useLocaleStore(state => state.isLoading);

  return {
    isAppReady: isInitialized && !isLoading,
  };
};
