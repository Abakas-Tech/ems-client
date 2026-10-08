import { motion as Motion } from "framer-motion";
import { Scale, Handshake, HeartHandshake, Briefcase, Sparkles, Award } from "lucide-react";

import { useTranslation } from "react-i18next";
import { CORE_VALUES as VALUE_KEYS } from "../../data/content";
import SectionHeading from "../ui/SectionHeading";
import styles from "./CoreValues.module.css";

const ICONS = {
  integrity: Scale,
  trust: Handshake,
  people: HeartHandshake,
  professionalism: Briefcase,
  opportunity: Sparkles,
  excellence: Award,
};
const ease = [0.22, 1, 0.36, 1];

function CoreValues() {
  const { t, i18n } = useTranslation();
  const itemsText = t("values.items");
  const CORE_VALUES = VALUE_KEYS.map((v, i) => ({ ...v, ...itemsText[i] }));
  /* The Amharic sub-label is redundant when the whole page is in Amharic */
  const showAmharic = i18n.resolvedLanguage !== "am";
  return (
    <section className={`vx-section ${styles.section}`} aria-labelledby="values-title">
      <div className="vx-container">
        <SectionHeading
          id="values-title"
          ns="values"
        />

        <div className={styles.grid}>
          {CORE_VALUES.map((value, i) => {
            const Icon = ICONS[value.key];
            return (
              <Motion.article
                key={value.key}
                className={styles.card}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease }}
              >
                <div className={styles.head}>
                  <span className={styles.icon}>
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  {showAmharic && (
                    <span className={styles.amharic} lang="am">
                      {value.amharic}
                    </span>
                  )}
                </div>
                <h3 className={styles.title}>{value.title}</h3>
                <p className={styles.desc}>{value.desc}</p>
              </Motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CoreValues;
