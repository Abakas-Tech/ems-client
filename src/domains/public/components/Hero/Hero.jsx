import React from "react";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section
      className={styles["hero-banner"]}
      id="home"
      aria-labelledby="hero-title"
    >
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-9 col-md-12">
            <div className={styles["hero-content"]}>
              <h1 className={styles["brand-name"]}> <span>Global</span> Trust</h1>
              <h2 className={styles["agency-type"]}>
                Overseas Employment Agent PLC
              </h2>

              <div className={styles["slogan-wrapper"]}>
                <h2 className={styles["slogan-main"]}>Build Your Future</h2>
                <h3 className={styles["slogan-sub"]}>Beyond Borders</h3>
              </div>

              <button
                className={styles.ctaButton}
                onClick={() => {
                  const section = document.getElementById("contact");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                aria-label="Scroll to contact section to get started with Global Trust Overseas"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
