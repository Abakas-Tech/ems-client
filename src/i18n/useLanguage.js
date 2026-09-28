import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  RTL_LANGUAGES,
} from "../config/language.config";

const baseCode = (lang) => (lang || DEFAULT_LANGUAGE).split("-")[0];

// Current language + a setter that also remembers the choice.
export function useLanguage() {
  const { i18n } = useTranslation();
  const currentLanguage = baseCode(i18n.language);
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // storage unavailable (private mode) — the choice just isn't remembered
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
    dir: isRTL ? "rtl" : "ltr",
  };
}

// Applies the current language's lang/dir to the page while the calling
// component (the public layout) is mounted, and restores the defaults when
// it unmounts, so right-to-left never leaks into the dashboards.
export function usePageDirection() {
  const { currentLanguage, dir } = useLanguage();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = currentLanguage;
    root.dir = dir;
  }, [currentLanguage, dir]);

  useEffect(
    () => () => {
      const root = document.documentElement;
      root.lang = DEFAULT_LANGUAGE;
      root.dir = "ltr";
    },
    [],
  );
}
