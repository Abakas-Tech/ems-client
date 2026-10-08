import { motion as Motion } from "framer-motion";
import { Compass, Target } from "lucide-react";

import { VISION_MISSION } from "../../data/content";
import SectionHeading from "../ui/SectionHeading";
import styles from "./VisionMission.module.css";

const ICONS = { vision: Compass, mission: Target };
const ease = [0.22, 1, 0.36, 1];

function VisionMission() {
  return (
    <section className={`vx-section ${styles.section}`} aria-labelledby="vm-title">
      <div className="vx-container">
        <SectionHeading
          id="vm-title"
          eyebrow="Who we are"
          title={
            <>
              Vision <span className="vx-serif">&amp;</span> Mission
            </>
          }
          lead="The vision and mission driving every placement we make for workers and employers through every step."
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
