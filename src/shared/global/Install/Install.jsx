import { useEffect, useState } from "react";
import {
  MdDownloadForOffline,
  MdInstallMobile,
  MdOpenInNew,
  MdClose,
  MdCheckCircle,
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
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  /* ── Bootstrap on mount ── */
  useEffect(() => {
    // Already running as the installed app → render nothing at all
    if (isRunningAsApp()) return;

    const ignored = localStorage.getItem("installIgnored") === "true";
    const alreadyInstalled = localStorage.getItem("pwaInstalled") === "true";

    if (alreadyInstalled) {
      // Installed but user opened the browser instead of the app
      setInstalled(true);
      setVisible(true);
      return;
    }

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
     We only mark installed + hide the prompt here.
     The PWA will launch itself in a new standalone window automatically.
     We do NOT call setVisible(true) here — the prompt should disappear,
     not switch to "Open in app" mode while the browser still has focus. ── */
  useEffect(() => {
    const handler = () => {
      localStorage.setItem("pwaInstalled", "true");
      // Hide prompt entirely; the OS/browser opens the PWA on its own
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
      // Hide immediately; browser/OS will open the PWA itself
      setVisible(false);
      setCardOpen(false);
    }

    setDeferredPrompt(null);
  };

  /* ── Open the installed PWA from the browser ──
     Strategy: navigate to the app's start_url with a query flag.
     The browser recognises the PWA is installed and opens it in
     standalone mode instead of a new browser tab.
     Adjust START_URL to match your manifest's "start_url". ── */
  const handleOpenApp = () => {
    const START_URL = "/"; // ← change this to your manifest start_url if different

    // Add a timestamp to bust any browser cache that might keep it in-tab
    const url = new URL(START_URL, window.location.origin);
    url.searchParams.set("source", "install-prompt");

    // window.open with _blank triggers the installed PWA on Chrome/Edge/Samsung
    // instead of opening a browser tab when the PWA is installed
    window.open(url.toString(), "_blank", "noopener");
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
        className={`${styles.fab} ${installed ? styles.fabInstalled : styles.fabDefault}`}
        onClick={() => setCardOpen((prev) => !prev)}
        aria-label={installed ? "Open App" : "Install App"}
        title={installed ? "Open App" : "Install App"}
      >
        <span className={styles.fabIcon}>
          {installed ? <MdInstallMobile /> : <MdDownloadForOffline />}
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
            <p className={styles.appTitle}>
              {installed ? "App Installed" : "Install MMH Jobs"}
            </p>
            <p className={styles.appSubtitle}>
              {installed
                ? "You already have the app"
                : "Get quick access from your home screen"}
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

        {/* Installed badge */}
        {installed && (
          <div className={styles.installedBadge}>
            <MdCheckCircle />
            Installed
          </div>
        )}

        {/* Body */}
        <div className={styles.cardBody}>
          <p className={styles.description}>
            {installed
              ? "Open the app for the best experience."
              : "Install this app on your device for a faster, app-like experience."}
          </p>

          {/* Feature pills — only shown before install */}
          {!installed && (
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
          )}
        </div>

        <div className={styles.divider} />

        {/* Actions */}
        <div className={styles.btnRow}>
          {installed ? (
            <button className={styles.btnOpen} onClick={handleOpenApp}>
              <MdOpenInNew />
              Open App
            </button>
          ) : (
            <>
              <button className={styles.btnInstall} onClick={handleInstall}>
                <MdDownloadForOffline />
                Install
              </button>

              <button className={styles.btnIgnore} onClick={handleIgnore}>
                Not Now
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
