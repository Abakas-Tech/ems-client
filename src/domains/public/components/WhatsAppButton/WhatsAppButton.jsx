import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import { MdClose, MdArrowOutward } from "react-icons/md";

import styles from "./WhatsAppButton.module.css";

const WHATSAPP_NUMBERS = [
  {
    key: "number1",
    label: "whatsapp.number1Label",
    number: "+251973009003",
    display: "+251 973 009 003",
  },
  {
    key: "number2",
    label: "whatsapp.number2Label",
    number: "+251976032303",
    display: "+251 976 032 303",
  },
];

const RTL_LANGS = ["ar", "he", "fa", "ur"];

export default function WhatsAppButton() {
  const { t, i18n } = useTranslation();
  const [cardOpen, setCardOpen] = useState(false);

  const isRTL = RTL_LANGS.includes(i18n.language?.split("-")[0]);

  /* ── Close on Escape ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && cardOpen) setCardOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cardOpen]);

  const handleOpen = (number) => {
    const clean = number.replace(/\D/g, "");
    window.open(`https://wa.me/${clean}`, "_blank", "noopener");
  };

  return (
    <>
      {/* ── FAB ── */}
      <button
        className={styles.fab}
        onClick={() => setCardOpen((prev) => !prev)}
        aria-label={t("whatsapp.fabLabel", "Chat on WhatsApp")}
        title={t("whatsapp.fabLabel", "Chat on WhatsApp")}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <span className={styles.fabIcon}>
          <FaWhatsapp />
        </span>
      </button>

      {/* ── Card ── */}
      <div
        className={`${styles.card} ${cardOpen ? styles.cardOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("whatsapp.cardTitle", "Contact us on WhatsApp")}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.appIconWrap}>
            <span className={styles.appIcon}>
              <FaWhatsapp />
            </span>
          </div>

          <div className={styles.headerText}>
            <p className={styles.appTitle}>
              {t("whatsapp.cardTitle", "WhatsApp")}
            </p>
            <p className={styles.appSubtitle}>
              {t("whatsapp.cardSubtitle", "Typically replies instantly")}
            </p>
          </div>

          <button
            className={styles.closeBtn}
            onClick={() => setCardOpen(false)}
            aria-label={t("whatsapp.close", "Close")}
          >
            <MdClose />
          </button>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <p className={styles.description}>
            {t(
              "whatsapp.description",
              "Choose a number to start a conversation with our team.",
            )}
          </p>
        </div>

        <div className={styles.divider} />

        {/* Number buttons */}
        <div className={styles.btnRow}>
          {WHATSAPP_NUMBERS.map((item) => (
            <button
              key={item.key}
              className={styles.numberBtn}
              onClick={() => handleOpen(item.number)}
            >
              <FaWhatsapp />
              <span className={styles.numberInfo}>
                <span className={styles.numberLabel}></span>
                <span className={styles.numberDisplay}>{item.display}</span>
              </span>
              <MdArrowOutward className={styles.numberArrow} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
