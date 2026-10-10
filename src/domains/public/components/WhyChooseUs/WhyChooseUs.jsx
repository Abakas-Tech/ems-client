import { motion as Motion } from "framer-motion";
import { Check } from "lucide-react";

import { useTranslation } from "react-i18next";
import SectionHeading from "../ui/SectionHeading";
import styles from "./WhyChooseUs.module.css";

const ease = [0.22, 1, 0.36, 1];

function WhyChooseUs() {
  const { t } = useTranslation();
  const WHY_CHOOSE = t("why.items");
  const PROMISES = t("why.promises");
  return (
    <section className={`vx-section ${styles.section}`} aria-labelledby="why-title">
      <div className="vx-container">
        <div className={styles.layout}>
          <div className={styles.left}>
            <SectionHeading
              id="why-title"
              ns="why"
              align="left"
              className={styles.heading}
            />

            <ul className={styles.why}>
              {WHY_CHOOSE.map((item, i) => (
                <Motion.li
                  key={i}
                  className={styles.whyItem}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease }}
                >
                  <span className={styles.check}>
                    <Check size={16} strokeWidth={3} />
                  </span>
                  <div>
                    <h3 className={styles.whyTitle}>{item.title}</h3>
                    <p className={styles.whyDesc}>{item.desc}</p>
                  </div>
                </Motion.li>
              ))}
            </ul>
          </div>

          <Motion.div
            className={styles.promise}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.9, ease }}
          >
            <div className={styles.promiseGlow} aria-hidden="true" />
            <span className={styles.promiseEyebrow}>{t("why.promiseEyebrow")}</span>
            <ol className={styles.promiseList}>
              {PROMISES.map((item, i) => (
                <li key={i} className={styles.promiseItem}>
                  <span className={styles.promiseNum}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={styles.promiseTitle}>{item.title}</h3>
                    <p className={styles.promiseDesc}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
