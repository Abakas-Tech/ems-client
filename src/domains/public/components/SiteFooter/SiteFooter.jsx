import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";

import logoLight from "../../../../assets/img/site/logo-light.png";
import { NAV_ITEMS, AGENCY_NAME, AGENCY_LEGAL_NAME } from "../../data/content";
import { useSiteInfo } from "../../context/SiteInfo";
import { scrollToSection } from "../../utils/scroll";
import SocialIcon from "../ui/SocialIcon";
import styles from "./SiteFooter.module.css";

function SiteFooter() {
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
              alt={AGENCY_NAME}
              className={styles.logo}
              width="520"
              height="252"
              loading="lazy"
            />
            <p className={styles.about}>
              A professional foreign employment and workforce placement agency
              connecting qualified Ethiopian workers with legitimate
              employment opportunities abroad.
            </p>
            {socials.length > 0 && (
              <ul className={styles.socials} aria-label="Social media">
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

          <nav className={styles.col} aria-label="Footer">
            <h2 className={styles.colTitle}>Explore</h2>
            <ul className={styles.links}>
              {NAV_ITEMS.filter((i) => i.id !== "home").map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={goTo(item.id)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <h2 className={styles.colTitle}>Contact</h2>
            <ul className={styles.contact}>
              <li>
                <MapPin size={16} />
                <span>{location.address}</span>
              </li>
              {phone && (
                <li>
                  <Phone size={16} />
                  <a href={`tel:${phone}`}>{phone}</a>
                </li>
              )}
              {email && (
                <li>
                  <Mail size={16} />
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
            </ul>
          </div>

          <div className={`${styles.col} ${styles.ctaCol}`}>
            <h2 className={styles.colTitle}>Ready to begin?</h2>
            <p className={styles.ctaText}>
              Apply once — we guide you from documents to departure.
            </p>
            <a
              href="#contact"
              onClick={goTo("contact")}
              className="vx-btn vx-btn--primary vx-btn--sm"
            >
              Apply Now <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className={styles.wordmark} aria-hidden="true">
          VISION
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} {AGENCY_LEGAL_NAME} <span className={styles.sep}>|</span>{" "}
            Developed by{" "}
            <a
              href="https://abakastech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.credit}
            >
              Abakas Technologies
            </a>{" "}
            <span className={styles.sep}>|</span> All Rights Reserved.
          </p>
          <button type="button" className={styles.toTop} onClick={toTop}>
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
