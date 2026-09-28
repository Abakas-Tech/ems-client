import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { BsTranslate } from "react-icons/bs";
import LANGUAGES from "../../../config/language.config";
import { useLanguage } from "../../../i18n/useLanguage";
import styles from "./LanguageSwitcher.module.css";

// Language selector for the public website (same behavior as the
// agency-public LanguageSwitcher). `inDrawer` makes the menu open inline,
// for the mobile navigation drawer.
export default function LanguageSwitcher({ inDrawer = false }) {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current =
    LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className={`${styles.switcher} ${inDrawer ? styles.inDrawer : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.select")}
        title={t("language.select")}
      >
        <BsTranslate size={14} />
        <span className={styles.label}>{current.label}</span>
        <FiChevronDown size={13} className={open ? styles.rotated : ""} />
      </button>
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === currentLanguage}
                lang={lang.code}
                className={`${styles.option} ${
                  lang.code === currentLanguage ? styles.active : ""
                }`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setOpen(false);
                }}
              >
                <span>{lang.label}</span>
                {lang.code === currentLanguage && (
                  <FiCheck size={14} className={styles.check} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
