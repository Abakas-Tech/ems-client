import { motion as Motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import portrait from "../../../../assets/img/site/about-portrait.jpg";
import logo from "../../../../assets/img/site/logo.png";
import { useTranslation } from "react-i18next";
import Reveal from "../ui/Reveal";
import styles from "./AboutSnippet.module.css";

const ease = [0.22, 1, 0.36, 1];

function AboutSnippet() {
  const { t } = useTranslation();
  const name = t("brand");
  const paragraphs = t("about.paragraphs", { name });
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
                alt={t("about.imageAlt")}
                className={styles.photo}
                loading="lazy"
              />
              <div className={styles.photoShade} aria-hidden="true" />
              <span className={styles.badge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {t("about.badge")}
              </span>
            </div>

            <Motion.div
              className={styles.logoCard}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
            >
              <img src={logo} alt={name} className={styles.logo} />
              <span className={styles.logoNote}>
                <ShieldCheck size={16} /> {t("about.note")}
              </span>
            </Motion.div>
            <div className={styles.ring} aria-hidden="true" />
          </Motion.div>

          {/* Copy */}
          <div className={styles.copy}>
            <Reveal>
              <span className={styles.eyebrow}>{t("about.eyebrow", { name })}</span>
              <h2 id="about-title" className={styles.title}>
                {t("about.titleA")}{" "}
                <span className="vx-serif vx-grad-text">{t("about.accent")}</span>{" "}
                {t("about.titleB")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={styles.lead}>
                <strong>{name}</strong> {t("about.lead")}
              </p>
            </Reveal>
            <Reveal delay={0.15} className={styles.paras}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}

export default AboutSnippet;
