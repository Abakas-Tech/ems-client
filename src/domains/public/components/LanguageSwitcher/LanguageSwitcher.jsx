import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronDown } from "lucide-react";

import { LANGUAGES, rememberLanguage } from "../../i18n";
import styles from "./LanguageSwitcher.module.css";

/* variant "menu": compact globe button + dropdown (header bar)
   variant "inline": segmented row (mobile sheet) */
function LanguageSwitcher({ variant = "menu", onChange }) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language;
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  const choose = (code) => {
    if (code !== current) {
      i18n.changeLanguage(code);
      rememberLanguage(code);
    }
    setOpen(false);
    onChange?.(code);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <div className={styles.inline} role="group" aria-label={t("nav.language")}>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            className={`${styles.seg} ${l.code === current ? styles.segOn : ""}`}
            aria-pressed={l.code === current}
            onClick={() => choose(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div className={styles.menuRoot} ref={root}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t("nav.language")}: ${active.label}`}
      >
        <Globe size={16} />
        <span lang={active.code}>{active.short}</span>
        <ChevronDown size={14} className={styles.caret} />
      </button>
      {open && (
        <ul className={styles.menu}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                lang={l.code}
                className={`${styles.option} ${l.code === current ? styles.optionOn : ""}`}
                onClick={() => choose(l.code)}
                aria-current={l.code === current}
              >
                <span>{l.label}</span>
                {l.code === current && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcher;
