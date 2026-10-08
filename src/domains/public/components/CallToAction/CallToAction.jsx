import { ArrowRight, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import bg from "../../../../assets/img/site/cta-bg.jpg";
import { useSiteInfo } from "../../context/SiteInfo";
import { scrollToSection } from "../../utils/scroll";
import Reveal from "../ui/Reveal";
import styles from "./CallToAction.module.css";

function CallToAction() {
  const { whatsapp, phone } = useSiteInfo();
  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <section className={styles.wrap} aria-labelledby="cta-title">
      <div className="vx-container">
        <Reveal className={styles.card}>
          <img src={bg} alt="" className={styles.bg} loading="lazy" />
          <div className={styles.shade} aria-hidden="true" />
          <div className={styles.content}>
            <span className={styles.eyebrow}>Start your journey today</span>
            <h2 id="cta-title" className={styles.title}>
              Apply once. <span className="vx-serif">Change everything.</span>
            </h2>
            <p className={styles.text}>
              Our simple application process gets you in front of verified
              employers fast. No hidden fees. No middlemen. Just results.
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
                Apply Now <ArrowRight size={18} />
              </a>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vx-btn vx-btn--glass"
                >
                  <FaWhatsapp size={18} /> Chat on WhatsApp
                </a>
              ) : (
                phone && (
                  <a href={`tel:${phone}`} className="vx-btn vx-btn--glass">
                    <Phone size={17} /> Call us
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
