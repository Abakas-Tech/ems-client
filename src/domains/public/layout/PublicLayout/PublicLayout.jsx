import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MotionConfig } from "framer-motion";

import SiteHeader from "../../components/SiteHeader/SiteHeader";
import SiteFooter from "../../components/SiteFooter/SiteFooter";
import { SiteInfoProvider } from "../../context/SiteInfo";
import "../../styles/site.css";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

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

function PublicLayout() {
  useWebFonts();

  return (
    <MotionConfig reducedMotion="user">
      <SiteInfoProvider>
        <div className="vx-site">
          <a href="#main" className="vx-skip">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </SiteInfoProvider>
    </MotionConfig>
  );
}

export default PublicLayout;
