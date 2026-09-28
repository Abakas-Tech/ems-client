import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import am from "../locales/am.json";
import ar from "../locales/ar.json";
import LANGUAGES, {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from "../config/language.config";

// Public-website translations (English / Amharic / Arabic). Same setup as
// the agency-public project: the chosen language is remembered in
// localStorage and English is the default and the fallback for any
// missing key.
const readSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return LANGUAGES.some((l) => l.code === saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    am: { translation: am },
    ar: { translation: ar },
  },
  lng: readSavedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

// NOTE: the page direction (dir="rtl" for Arabic) is applied only while a
// public page is shown — see usePageDirection in ./useLanguage.js — so the
// admin/partner/worker dashboards always stay left-to-right.

export default i18n;
