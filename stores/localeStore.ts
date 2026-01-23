import { create } from 'zustand';
import i18n from '@/locale/i18n';
import { getLocalData, setLocalData } from '@/utils';

const DEFAULT_LOCALE = 'zh-CN';
const LOCALE_KEY = 'locale';

interface LocaleState {
  locale: string;
  isLoading: boolean;

  setLocale: (locale: string) => void;
  setLoading: (loading: boolean) => void;
  changeLocale: (newLocale: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: DEFAULT_LOCALE,
  isLoading: true,

  setLocale: (locale) => {
    i18n.locale = locale;
    set({ locale });
  },

  setLoading: (isLoading) => set({ isLoading }),

  changeLocale: async (newLocale) => {
    i18n.locale = newLocale;
    set({ locale: newLocale });
    try {
      await setLocalData(LOCALE_KEY, newLocale);
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  },

  initialize: async () => {
    try {
      const savedLocale = await getLocalData<string>(LOCALE_KEY);
      const locale = savedLocale || DEFAULT_LOCALE;
      i18n.locale = locale;
      set({ locale, isLoading: false });
    } catch (error) {
      console.error('Error loading locale:', error);
      set({ locale: DEFAULT_LOCALE, isLoading: false });
    }
  },
}));

// Selectors
export const selectLocale = (state: LocaleState) => state.locale;
export const selectIsLoading = (state: LocaleState) => state.isLoading;

// Convenience hook for components that only need i18n
export const useI18n = () => i18n;
