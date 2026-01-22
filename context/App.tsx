import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { AuthProvider, useAuth } from "./Auth";
import { LocaleProvider, useLocale } from "./Locale";
import { ToastProvider, useToast } from "./Toast";

// 定义 AppContext 类型
interface AppContextType {
  auth: ReturnType<typeof useAuth>;
  locale: ReturnType<typeof useLocale>;
  toast: ReturnType<typeof useToast>;
  isAppReady: boolean;
}

// 创建 AppContext，并提供默认值
const AppContext = createContext<AppContextType | undefined>(undefined);

// 统一的 AppProvider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ToastProvider>
      <LocaleProvider>
        <AuthProvider>
          <AppContext.Provider value={undefined}>
            {children}
          </AppContext.Provider>
        </AuthProvider>
      </LocaleProvider>
    </ToastProvider>
  );
};

// 自定义 Hook 供全局访问
export const useAppContext = (): AppContextType => {
  const auth = useAuth();
  const locale = useLocale();
  const toast = useToast();

  // 确保 auth 和 locale 初始化完成
  const isAppReady = useMemo(
    () => auth.isInitialized && !locale.isLoading,
    [auth.isInitialized, locale.isLoading],
  );

  return { auth, locale, toast, isAppReady };
};
