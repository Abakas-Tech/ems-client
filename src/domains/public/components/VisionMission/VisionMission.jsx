import { motion as Motion } from "framer-motion";
import { Compass, Target } from "lucide-react";

import { useTranslation } from "react-i18next";
import SectionHeading from "../ui/SectionHeading";
import styles from "./VisionMission.module.css";

const ICONS = { vision: Compass, mission: Target };
const ease = [0.22, 1, 0.36, 1];

function VisionMission() {
  const { t } = useTranslation();
  const VISION_MISSION = ["vision", "mission"].map((key) => ({ key, ...t(`vm.${key}`) }));
  return (
    <section className={`vx-section ${styles.section}`} aria-labelledby="vm-title">
      <div className="vx-container">
        <SectionHeading
          id="vm-title"
          ns="vm"
          title={
            <>
              {t("vm.titleA")} <span className="vx-serif">{t("vm.amp")}</span>{" "}
              {t("vm.titleB")}
            </>
          }
        />

        <div className={styles.grid}>
          {VISION_MISSION.map((item, i) => {
            const Icon = ICONS[item.key];
            return (
              <Motion.article
                key={item.key}
                className={`${styles.card} ${styles[item.key]}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.9, delay: i * 0.12, ease }}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>
                    <Icon size={24} strokeWidth={1.7} />
                  </span>
                  <span className={styles.label}>{item.label}</span>
                </div>
                <blockquote className={styles.quote}>
                  <span className={styles.mark} aria-hidden="true">
                    “
                  </span>
                  {item.text}
                </blockquote>
              </Motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default VisionMission;
