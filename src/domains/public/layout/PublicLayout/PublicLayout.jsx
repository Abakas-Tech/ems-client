import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { I18nextProvider, useTranslation } from "react-i18next";

import SiteHeader from "../../components/SiteHeader/SiteHeader";
import SiteFooter from "../../components/SiteFooter/SiteFooter";
import { SiteInfoProvider } from "../../context/SiteInfo";
import publicI18n, { languageDir } from "../../i18n";
import "../../styles/site.css";

/* Latin display fonts plus Arabic and Ethiopic families. Google Fonts
   serves per-script subsets, so a visitor only downloads the scripts
   the page actually uses. */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Amiri:wght@400;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700;800&family=Noto+Serif+Ethiopic:wght@400;600&display=swap";

/* Load the public site's web fonts only when the public site is shown,
   so the dashboards are unaffected. */
const useWebFonts = () => {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const pre1 = Object.assign(document.createElement("link"), {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    });
    const pre2 = Object.assign(document.createElement("link"), {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    });
    const css = Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: FONT_HREF,
    });
    document.head.append(pre1, pre2, css);
  }, []);
};

/* Mirror the active language onto <html lang> while the public site is
   mounted (screen readers, search engines, hyphenation), and restore
   the previous value when leaving it. */
const useDocumentLanguage = (lang) => {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("lang");
    html.setAttribute("lang", lang);
    return () => {
      if (prev) html.setAttribute("lang", prev);
      else html.removeAttribute("lang");
    };
  }, [lang]);
};

function PublicShell() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const dir = languageDir(lang);

  useWebFonts();
  useDocumentLanguage(lang);

  return (
    <div className="vx-site" lang={lang} dir={dir}>
      <a href="#main" className="vx-skip">
        {t("nav.skip")}
      </a>
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function PublicLayout() {
  return (
    <I18nextProvider i18n={publicI18n}>
      <MotionConfig reducedMotion="user">
        <SiteInfoProvider>
          <PublicShell />
        </SiteInfoProvider>
      </MotionConfig>
    </I18nextProvider>
  );
}

export default PublicLayout;
