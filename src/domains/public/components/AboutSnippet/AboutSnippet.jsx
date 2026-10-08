import { motion as Motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import portrait from "../../../../assets/img/site/about-portrait.jpg";
import logo from "../../../../assets/img/site/logo.png";
import { ABOUT_PARAGRAPHS, AGENCY_NAME } from "../../data/content";
import Reveal from "../ui/Reveal";
import styles from "./AboutSnippet.module.css";

const ease = [0.22, 1, 0.36, 1];

function AboutSnippet() {
  return (
    <section
      id="about"
      className={`vx-section ${styles.section}`}
      aria-labelledby="about-title"
    >
      <div className="vx-container">
        <div className={styles.layout}>
          {/* Visual */}
          <Motion.div
            className={styles.visual}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1, ease }}
          >
            <div className={styles.frame}>
              <img
                src={portrait}
                alt="City skyline at dusk — destinations for overseas employment"
                className={styles.photo}
                loading="lazy"
              />
              <div className={styles.photoShade} aria-hidden="true" />
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                Trusted Overseas Recruitment
              </span>
            </div>

            <Motion.div
              className={styles.logoCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
            >
              <img src={logo} alt={AGENCY_NAME} className={styles.logo} />
              <span className={styles.logoNote}>
                <ShieldCheck size={16} /> Legal. Safe. Transparent.
              </span>
            </Motion.div>
            <div className={styles.ring} aria-hidden="true" />
          </Motion.div>

          {/* Copy */}
          <div className={styles.copy}>
            <Reveal>
              <span className={styles.eyebrow}>About {AGENCY_NAME}</span>
              <h2 id="about-title" className={styles.title}>
                A trusted bridge to{" "}
                <span className="vx-serif vx-grad-text">opportunity</span>{" "}
                abroad.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={styles.lead}>
                <strong>{AGENCY_NAME}</strong> is a professional foreign
                employment and workforce placement agency committed to
                connecting qualified Ethiopian workers with legitimate
                employment opportunities abroad.
              </p>
            </Reveal>
            <Reveal delay={0.15} className={styles.paras}>
              {ABOUT_PARAGRAPHS.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}

export default AboutSnippet;
