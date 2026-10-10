import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";

import logoLight from "../../../../assets/img/site/logo-light.png";
import { useTranslation } from "react-i18next";
import { NAV_IDS } from "../../data/content";
import { useSiteInfo } from "../../context/SiteInfo";
import { scrollToSection } from "../../utils/scroll";
import SocialIcon from "../ui/SocialIcon";
import styles from "./SiteFooter.module.css";

function SiteFooter() {
  const { t } = useTranslation();
  const brand = t("brand");
  const { phone, email, location, socials } = useSiteInfo();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const goTo = (id) => (e) => {
    e.preventDefault();
    if (pathname === "/") scrollToSection(id);
    else {
      navigate("/");
      setTimeout(() => scrollToSection(id), 150);
    }
  };

  const toTop = () => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />
      <div className="vx-container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <img
              src={logoLight}
              alt={brand}
              className={styles.logo}
              width="623"
              height="394"
              loading="lazy"
            />
            <p className={styles.about}>
              {t("footer.about")}
            </p>
            {socials.length > 0 && (
              <ul className={styles.socials} aria-label={t("footer.social")}>
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                    >
                      <SocialIcon name={s.key} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className={styles.col} aria-label={t("footer.nav")}>
            <h2 className={styles.colTitle}>{t("footer.explore")}</h2>
            <ul className={styles.links}>
              {NAV_IDS.filter((id) => id !== "home").map((id) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={goTo(id)}>
                    {t(`nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h2 className={styles.colTitle}>{t("footer.contact")}</h2>
            <ul className={styles.contact}>
              <li>
                <MapPin size={16} />
                <span>{location.address}</span>
              </li>
              {phone && (
                <li>
                  <Phone size={16} />
                  <a href={`tel:${phone}`} dir="ltr">{phone}</a>
                </li>
              )}
              {email && (
                <li>
                  <Mail size={16} />
                  <a href={`mailto:${email}`} dir="ltr">{email}</a>
                </li>
              )}
            </ul>
          </div>

          <div className={`${styles.col} ${styles.ctaCol}`}>
            <h2 className={styles.colTitle}>{t("footer.ready")}</h2>
            <p className={styles.ctaText}>
              {t("footer.readyText")}
            </p>
            <a
              href="#contact"
              onClick={goTo("contact")}
              className="vx-btn vx-btn--primary vx-btn--sm"
            >
              {t("footer.apply")} <ArrowUpRight size={16} className="vx-flip" />
            </a>
          </div>
        </div>

        <div className={styles.wordmark} aria-hidden="true">
          AL-KHEDEMAT
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} {t("footer.legalName", { name: brand })}{" "}
            <span className={styles.sep}>|</span> {t("footer.developedBy")}{" "}
            <a
              href="https://abakastech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.credit}
            >
              Abakas Technologies
            </a>{" "}
            <span className={styles.sep}>|</span> {t("footer.rights")}
          </p>
          <button type="button" className={styles.toTop} onClick={toTop}>
            {t("footer.backToTop")} <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
