import { ArrowRight, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa6";

import bg from "../../../../assets/img/site/cta-bg.jpg";
import { useSiteInfo } from "../../context/SiteInfo";
import { scrollToSection } from "../../utils/scroll";
import Reveal from "../ui/Reveal";
import styles from "./CallToAction.module.css";

function CallToAction() {
  const { t } = useTranslation();
  const { whatsapp, phone } = useSiteInfo();
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <section className={styles.wrap} aria-labelledby="cta-title">
      <div className="vx-container">
        <Reveal className={styles.card}>
          <img src={bg} alt="" className={styles.bg} loading="lazy" />
          <div className={styles.shade} aria-hidden="true" />
          <div className={styles.content}>
            <span className={styles.eyebrow}>{t("cta.eyebrow")}</span>
            <h2 id="cta-title" className={`${styles.title} vx-display`}>
              {t("cta.title")} <span className="vx-serif">{t("cta.accent")}</span>
            </h2>
            <p className={styles.text}>
              {t("cta.text")}
            </p>
            <div className={styles.actions}>
              <a
                href="#contact"
                className="vx-btn vx-btn--primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
              >
                {t("cta.apply")} <ArrowRight size={18} className="vx-flip" />
              </a>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vx-btn vx-btn--glass"
                >
                  <FaWhatsapp size={18} /> {t("cta.whatsapp")}
                </a>
              ) : (
                phone && (
                  <a href={`tel:${phone}`} className="vx-btn vx-btn--glass">
                    <Phone size={17} /> {t("cta.call")}
                  </a>
                )
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default CallToAction;
