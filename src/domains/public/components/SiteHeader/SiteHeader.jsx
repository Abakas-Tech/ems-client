import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Menu, X, Mail, Phone } from "lucide-react";

import logo from "../../../../assets/img/site/logo.png";
import logoLight from "../../../../assets/img/site/logo-light.png";
import useProfile from "../../../../context/Profile/useProfile";
import { hasAccessToken } from "../../../../utils/axios";
import { NAV_IDS, ROLE_DASHBOARD } from "../../data/content";
import { scrollToSection } from "../../utils/scroll";
import { useSiteInfo } from "../../context/SiteInfo";
import SocialIcon from "../ui/SocialIcon";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import styles from "./SiteHeader.module.css";

function SiteHeader() {
  const { t } = useTranslation();
  const brand = t("brand");
  const { profile, checkingAuth } = useProfile();
  const { phone, email, socials } = useSiteInfo();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  /* Sign In / Dashboard — same rules as before the redesign */
  const isAuth = hasAccessToken() || profile;
  let dashboardLink = "/auth/login";
  let dashboardText = t("nav.signIn");
  if (!checkingAuth && isAuth && profile) {
    dashboardLink = ROLE_DASHBOARD[profile.role_id] || "/admin/dashboard";
    dashboardText = t("nav.dashboard");
  }

  const onHome = location.pathname === "/";
  const solid = scrolled || !onHome || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight the nav item for the section currently in view */
  useEffect(() => {
    if (!onHome) return undefined;
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  /* Lock page scroll while the mobile menu is open */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* Close the menu when the viewport grows into the desktop layout */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const goTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (onHome) {
      scrollToSection(id);
    } else {
      navigate("/");
      setTimeout(() => scrollToSection(id), 150);
    }
  };

  return (
    <>
      <header
        className={`${styles.header} ${solid ? `${styles.solid} vx-header-solid` : ""} ${
          menuOpen ? styles.menuOpen : ""
        }`}
      >
        <div className={styles.bar}>
          <a
            href="#home"
            onClick={goTo("home")}
            className={styles.brand}
            aria-label={t("nav.homeLabel", { name: brand })}
          >
            <img
              src={logoLight}
              alt=""
              className={`${styles.logo} ${styles.logoLight}`}
              width="620"
              height="391"
            />
            <img
              src={logo}
              alt={brand}
              className={`${styles.logo} ${styles.logoDark}`}
              width="620"
              height="391"
            />
          </a>

          <nav className={styles.nav} aria-label={t("nav.primary")}>
            <ul className={styles.navList}>
              {NAV_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={goTo(id)}
                    className={`${styles.navLink} ${
                      active === id ? styles.navLinkActive : ""
                    }`}
                    aria-current={active === id ? "true" : undefined}
                  >
                    {t(`nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <div className={styles.lang}>
              <LanguageSwitcher />
            </div>
            <Link to={dashboardLink} className={styles.signIn}>
              {dashboardText}
            </Link>
            <a
              href="#contact"
              onClick={goTo("contact")}
              className={`vx-btn vx-btn--primary vx-btn--sm ${styles.apply}`}
            >
              {t("nav.apply")}
              <ArrowUpRight size={16} strokeWidth={2.4} className="vx-flip" />
            </a>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="vx-mobile-menu"
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <Motion.div
            id="vx-mobile-menu"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.siteMenu")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.sheetGlow} aria-hidden="true" />
            <nav className={styles.sheetNav} aria-label={t("nav.mobile")}>
              {NAV_IDS.map((id, i) => (
                <Motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={goTo(id)}
                  className={`${styles.sheetLink} ${
                    active === id ? styles.sheetLinkActive : ""
                  }`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 + i * 0.04,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <span className={styles.sheetIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t(`nav.${id}`)}
                </Motion.a>
              ))}
            </nav>

            <Motion.div
              className={styles.sheetFoot}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <LanguageSwitcher variant="inline" />
              <div className={styles.sheetCtas}>
                <a
                  href="#contact"
                  onClick={goTo("contact")}
                  className="vx-btn vx-btn--primary"
                >
                  {t("nav.apply")} <ArrowUpRight size={18} className="vx-flip" />
                </a>
                <Link
                  to={dashboardLink}
                  className="vx-btn vx-btn--glass"
                  onClick={() => setMenuOpen(false)}
                >
                  {dashboardText}
                </Link>
              </div>
              {(phone || email) && (
                <div className={styles.sheetContact}>
                  {phone && (
                    <a href={`tel:${phone}`}>
                      <Phone size={15} /> <bdi dir="ltr">{phone}</bdi>
                    </a>
                  )}
                  {email && (
                    <a href={`mailto:${email}`}>
                      <Mail size={15} /> <bdi dir="ltr">{email}</bdi>
                    </a>
                  )}
                </div>
              )}
              {socials.length > 0 && (
                <div className={styles.sheetSocials}>
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                    >
                      <SocialIcon name={s.key} />
                    </a>
                  ))}
                </div>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SiteHeader;
