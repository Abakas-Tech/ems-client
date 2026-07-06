import { useEffect, useState } from "react";
import {
  MdDownloadForOffline,
  MdClose,
  MdBolt,
  MdWifiOff,
  MdSpeed,
} from "react-icons/md";

import styles from "./Install.module.css";

/** True when already running inside the installed PWA (standalone mode) */
const isRunningAsApp = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  /* ── Bootstrap on mount ── */
  useEffect(() => {
    // Already running as the installed app → render nothing at all
    if (isRunningAsApp()) return;

    const ignored = localStorage.getItem("installIgnored") === "true";
    const alreadyInstalled = localStorage.getItem("pwaInstalled") === "true";

    // Already installed → nothing left to prompt, render nothing
    if (alreadyInstalled) return;

    if (ignored) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setVisible(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  /* ── appinstalled fires in the BROWSER tab, not inside the PWA ──
     Mark installed + hide the prompt. The OS/browser opens the PWA on its own. ── */
  useEffect(() => {
    const handler = () => {
      localStorage.setItem("pwaInstalled", "true");
      setVisible(false);
      setCardOpen(false);
    };

    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  /* ── Close card on Escape ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && cardOpen) setCardOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [cardOpen]);

  /* ── Install action ── */
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("pwaInstalled", "true");
      setVisible(false);
      setCardOpen(false);
    }

    setDeferredPrompt(null);
  };

  /* ── Ignore / dismiss ── */
  const handleIgnore = () => {
    localStorage.setItem("installIgnored", "true");
    setCardOpen(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* ── FAB ── */}
      <button
        className={`${styles.fab} ${styles.fabDefault}`}
        onClick={() => setCardOpen((prev) => !prev)}
        aria-label="Install App"
        title="Install App"
      >
        <span className={styles.fabIcon}>
          <MdDownloadForOffline />
        </span>
      </button>

      {/* ── Prompt Card ── */}
      <div
        className={`${styles.card} ${cardOpen ? styles.cardOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Install App"
      >
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.appIconWrap}>
            <span className={styles.appIcon}>
              <MdBolt />
            </span>
          </div>

          <div className={styles.headerText}>
            <p className={styles.appTitle}>Install MMH Jobs</p>
            <p className={styles.appSubtitle}>
              Get quick access from your home screen
            </p>
          </div>

          <button
            className={styles.closeBtn}
            onClick={() => setCardOpen(false)}
            aria-label="Close"
          >
            <MdClose />
          </button>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <p className={styles.description}>
            Install this app on your device for a faster, app-like experience.
          </p>

          <div className={styles.features}>
            <span className={styles.pill}>
              <MdWifiOff />
              Works Offline
            </span>
            <span className={styles.pill}>
              <MdSpeed />
              Fast & Lightweight
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Actions */}
        <div className={styles.btnRow}>
          <button className={styles.btnInstall} onClick={handleInstall}>
            <MdDownloadForOffline />
            Install
          </button>

          <button className={styles.btnIgnore} onClick={handleIgnore}>
            Not Now
          </button>
        </div>
      </div>
    </>
  );
}
