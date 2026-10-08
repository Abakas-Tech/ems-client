/* ------------------------------------------------------------------
   Translations for the public website only.

   A dedicated i18next instance, provided only by PublicLayout through
   <I18nextProvider>, so the dashboards are unaffected. The choice is remembered per browser.
   ------------------------------------------------------------------ */
import i18next from "i18next";

import en from "./locales/en";
import am from "./locales/am";
import ar from "./locales/ar";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "am", label: "አማርኛ", short: "አማ", dir: "ltr" },
  { code: "ar", label: "العربية", short: "ع", dir: "rtl" },
];

const STORAGE_KEY = "vx-lang";

const storedLanguage = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === v) ? v : null;
  } catch {
    return null;
  }
};

export const rememberLanguage = (code) => {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* storage unavailable — choice simply isn't remembered */
  }
};

export const languageDir = (code) =>
  LANGUAGES.find((l) => l.code === code)?.dir || "ltr";

const publicI18n = i18next.createInstance();

publicI18n.init({
  resources: {
    en: { translation: en },
    am: { translation: am },
    ar: { translation: ar },
  },
  lng: storedLanguage() || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnObjects: true,
  react: { useSuspense: false },
});

export default publicI18n;
