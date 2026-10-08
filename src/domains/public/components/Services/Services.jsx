import { motion as Motion } from "framer-motion";
import {
  Briefcase,
  UserCheck,
  Building2,
  LifeBuoy,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

import { SERVICES } from "../../data/content";
import SectionHeading from "../ui/SectionHeading";
import { scrollToSection } from "../../utils/scroll";
import featuredBg from "../../../../assets/img/site/hero-4-sm.jpg";
import styles from "./Services.module.css";

const ICONS = {
  recruitment: Briefcase,
  placement: UserCheck,
  employer: Building2,
  support: LifeBuoy,
  documentation: FileCheck2,
};

const ease = [0.22, 1, 0.36, 1];

/* Feed the pointer position to CSS for the soft spotlight on hover */
const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

function Services() {
  const [featured, ...rest] = SERVICES;
  const FeaturedIcon = ICONS[featured.key];

  return (
    <section id="services" className={`vx-section ${styles.section}`}>
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />

      <div className="vx-container">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Our <span className="vx-serif">services</span>
            </>
          }
          lead="A wide range of recruitment services built for Ethiopian workers and international employers always."
          tone="dark"
        />

        <div className={styles.grid}>
          <Motion.article
            className={`${styles.card} ${styles.featured}`}
            onPointerMove={trackPointer}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.9, ease }}
          >
            <img src={featuredBg} alt="" className={styles.featuredImg} loading="lazy" />
            <div className={styles.featuredShade} aria-hidden="true" />
            <span className={styles.index}>01</span>
            <div className={styles.featuredBody}>
              <span className={`${styles.icon} ${styles.iconLg}`}>
                <FeaturedIcon size={26} strokeWidth={1.7} />
              </span>
              <h3 className={`${styles.title} ${styles.featuredTitle}`}>
                {featured.title}
              </h3>
              <p className={styles.desc}>{featured.description}</p>
              <a
                href="#contact"
                className={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
              >
                Start your application <ArrowRight size={16} />
              </a>
            </div>
          </Motion.article>

          {rest.map((service, i) => {
            const Icon = ICONS[service.key];
            return (
              <Motion.article
                key={service.key}
                className={styles.card}
                onPointerMove={trackPointer}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.8, delay: 0.08 * (i + 1), ease }}
              >
                <span className={styles.index}>
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className={styles.icon}>
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <h3 className={styles.title}>{service.title}</h3>
                <p className={styles.desc}>{service.description}</p>
              </Motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Services;
