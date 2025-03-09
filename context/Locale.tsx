import i18n from "@/locale/i18n";
import { createContext, useContext, ReactNode } from "react";
import useStorageState from "@/hooks/useStorageState"; // 使用封装好的 storage hook

// 定义 constants
const DEFAULT_LOCALE = "zh-CN";
const LOCALE_KEY = "locale";

// 定义 Context 类型
interface LocaleContextType {
  locale: string;
  i18n: typeof i18n;
  changeLocale: (newLocale: string) => void;
  isLoading: boolean;
}

// 创建 Context
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// 定义 Provider 的 props 类型
interface LocaleProviderProps {
  children: ReactNode;
}

// LocaleProvider 组件
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  // 使用 useStorageState 管理 locale
  const {
    state: locale,
    setValue: setLocale,
    loading: isLoading,
  } = useStorageState<string>(LOCALE_KEY);

  // 确保 i18n.locale 及时更新
  i18n.locale = locale || DEFAULT_LOCALE;

  // 切换语言的函数
  const changeLocale = (newLocale: string) => {
    i18n.locale = newLocale;
    setLocale(newLocale);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale: locale || DEFAULT_LOCALE,
        i18n,
        changeLocale,
        isLoading,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

// 自定义 Hook
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
