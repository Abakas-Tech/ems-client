import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa6";
import { X } from "lucide-react";

import styles from "./WhatsAppButton.module.css";

/* Agency WhatsApp line for the floating chat button */
export const WHATSAPP_NUMBER = "+251911368146";
const BUBBLE_KEY = "vx-wa-bubble-dismissed";

const bubbleDismissed = () => {
  try {
    return sessionStorage.getItem(BUBBLE_KEY) === "1";
  } catch {
    return false;
  }
};

/* Floating WhatsApp chat button. Sits bottom-left so it never collides
   with the app-wide "Install app" button, which lives bottom-right. */
function WhatsAppButton() {
  const { t } = useTranslation();
  const [bubble, setBubble] = useState(false);
  const [visible, setVisible] = useState(false);

  // Appear once the visitor scrolls past the hero, so the first screen
  // (and the hero's bottom rail) stays clean
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Show the greeting once per visit, a few seconds after the button appears
  useEffect(() => {
    if (!visible || bubbleDismissed()) return undefined;
    const timer = setTimeout(() => setBubble(true), 3500);
    return () => clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    setBubble(false);
    try {
      sessionStorage.setItem(BUBBLE_KEY, "1");
    } catch {
      /* storage unavailable — bubble simply shows again next visit */
    }
  };

  const href = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
    t("whatsapp.greeting", { name: t("brand") }),
  )}`;

  return (
    <div
      className={`${styles.root} ${visible ? styles.visible : ""}`}
      dir="ltr"
      aria-hidden={!visible}
    >
      {bubble && visible && (
        <div className={styles.bubble} role="status">
          <button type="button" className={styles.close} onClick={dismiss} aria-label={t("whatsapp.close")}>
            <X size={14} />
          </button>
          <strong dir="auto">{t("whatsapp.bubbleTitle")}</strong>
          <span dir="auto">{t("whatsapp.bubbleText")}</span>
        </div>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fab}
        aria-label={`${t("whatsapp.label")} — ${WHATSAPP_NUMBER}`}
        onClick={dismiss}
        tabIndex={visible ? 0 : -1}
      >
        <span className={styles.ring} aria-hidden="true" />
        <span className={styles.icon}>
          <FaWhatsapp size={28} />
        </span>
        <span className={styles.label} dir="auto">
          {t("whatsapp.label")}
        </span>
      </a>
    </div>
  );
}

export default WhatsAppButton;
