import { motion as Motion } from "framer-motion";
import { UserPlus, BadgeCheck, Handshake, Plane, Route } from "lucide-react";

import { useTranslation } from "react-i18next";
import { PROCESS_KEYS } from "../../data/content";
import SectionHeading from "../ui/SectionHeading";
import styles from "./HowItWorks.module.css";

const ICONS = {
  registration: UserPlus,
  qualification: BadgeCheck,
  placement: Handshake,
  deployment: Plane,
};

const ease = [0.22, 1, 0.36, 1];

function HowItWorks() {
  const { t } = useTranslation();
  const stepsText = t("process.steps");
  const PROCESS_STEPS = PROCESS_KEYS.map((key, i) => ({ key, ...stepsText[i] }));
  return (
    <section id="how" className={`vx-section ${styles.section}`}>
      <div className="vx-container">
        <div className={styles.top}>
          <SectionHeading
            ns="process"
            align="left"
            className={styles.heading}
          />
          <Motion.div
            className={styles.summary}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <span className={styles.summaryIcon}>
              <Route size={22} />
            </span>
            <span>
              <strong>{t("process.summaryTitle")}</strong>
              <small>{t("process.summarySteps", { count: PROCESS_STEPS.length })}</small>
            </span>
          </Motion.div>
        </div>

        <ol className={styles.steps}>
          <Motion.span
            className={styles.rail}
            aria-hidden="true"
            initial={{ scaleX: 0, scaleY: 0 }}
            whileInView={{ scaleX: 1, scaleY: 1 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }}
            transition={{ duration: 1.6, ease }}
          />
          {PROCESS_STEPS.map((step, i) => {
            const Icon = ICONS[step.key];
            return (
              <Motion.li
                key={step.key}
                className={styles.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.8, delay: 0.12 * i, ease }}
              >
                <span className={styles.node}>
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <div className={styles.card}>
                  <span className={styles.num}>
                    {t("process.step", { n: String(i + 1).padStart(2, "0") })}
                  </span>
                  <h3 className={styles.title}>{step.title}</h3>
                  <p className={styles.desc}>{step.description}</p>
                </div>
              </Motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
