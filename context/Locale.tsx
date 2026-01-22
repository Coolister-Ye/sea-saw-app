import React, { createContext, useContext, ReactNode, useEffect } from "react";
import i18n from "@/locale/i18n";
import { useLocaleStore } from "@/stores/localeStore";

interface LocaleContextType {
  locale: string;
  i18n: typeof i18n;
  changeLocale: (newLocale: string) => void;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useLocaleStore();

  useEffect(() => {
    store.initialize();
  }, []);

  return (
    <LocaleContext.Provider
      value={{
        locale: store.locale,
        i18n,
        changeLocale: store.changeLocale,
        isLoading: store.isLoading,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

// Export store for new code
export { useLocaleStore };
