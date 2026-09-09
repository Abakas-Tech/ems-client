import React from "react";
import styles from "./Services.module.css";

const services = [
  {
    title: "Foreign Employment Recruitment",
    description:
      "We connect qualified Ethiopian workers with suitable employment opportunities in international markets.",
    icon: "bi bi-briefcase",
  },
  {
    title: "Workforce Selection & Placement",
    description:
      "We identify, screen, assess, and place candidates according to employer requirements and applicable regulations.",
    icon: "bi bi-person-check",
  },
  {
    title: "Employer Recruitment Services",
    description:
      "We support international employers in sourcing suitable, qualified, and dependable workers.",
    icon: "bi bi-building",
  },
  {
    title: "Candidate Support",
    description:
      "We guide candidates throughout the recruitment and placement process and provide the necessary information and assistance.",
    icon: "bi bi-life-preserver",
  },
  {
    title: "Documentation & Processing Support",
    description:
      "We assist with the necessary recruitment, employment, and travel documentation in accordance with applicable requirements.",
    icon: "bi bi-file-earmark-check",
  },
];

const Services = () => {
  return (
    <section id="services" className={styles.section}>
      <div className="container">
        <div className={styles.headRow}>
          <div className={styles.headCol}>
            <span className={styles.kicker}>What we do</span>
            <h2 className={styles.title}>Our Services</h2>
            <p className={styles.description}>
              We provide a wide range of services to support foreign employment
              opportunities for Ethiopian workers and international employers.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`${styles.card} ${
                index === 0
                  ? `${styles.cardFeatured} ${styles.cardNoHover}`
                  : ""
              }`}
            >
              <span className={styles.cardIndex}>0{index + 1}</span>
              <div className={styles.iconWrap}>
                <i className={service.icon}></i>
              </div>
              <h4 className={styles.cardTitle}>{service.title}</h4>
              <p className={styles.cardDesc}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
