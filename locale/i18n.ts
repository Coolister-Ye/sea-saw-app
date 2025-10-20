import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

// Import your localization files
import en from "./en.json";
import zh from "./zh.json";

const i18n = new I18n({
  en,
  zh,
});

i18n.defaultLocale = "zh";
i18n.enableFallback = true;
i18n.defaultSeparator = "`";

// Set the locale once at the beginning of your app.
i18n.locale = getLocales()[0]?.languageCode ?? "zh";

export default i18n;
