import { useState, useEffect } from "react";
import styles from "./Hero.module.css";

const slides = [
  {
    id: 1,
    eyebrow: "Welcome to the future",
    heading: "Build something\nremarkable.",
    sub: "We craft digital experiences that push boundaries and define the next generation of the web.",
  },
  {
    id: 2,
    eyebrow: "Our mission",
    heading: "Design with\npurpose.",
    sub: "Every pixel is intentional. Every interaction considered. We obsess over the details so you don't have to.",
  },
  {
    id: 3,
    eyebrow: "Join the movement",
    heading: "Grow beyond\nlimits.",
    sub: "Scale your product with a team that's built for velocity, clarity, and lasting impact.",
  },
];

function Hero() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [current]);

  function goTo(index) {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 400);
  }

  const slide = slides[current];

  return (
    <section className={styles["hero"]}>
      <div className={styles["hero-bg"]} />
      <div className={styles["hero-overlay"]} />

      <div className={styles["hero-content"]}>
        <p
          className={`${styles["hero-eyebrow"]} ${animating ? styles["fade-out"] : styles["fade-in"]}`}
        >
          {slide.eyebrow}
        </p>
        <h1
          className={`${styles["hero-heading"]} ${animating ? styles["slide-out"] : styles["slide-in"]}`}
        >
          {slide.heading.split("\n").map((line, i) => (
            <span key={i} className={styles["heading-line"]}>
              {line}
            </span>
          ))}
        </h1>
        <p
          className={`${styles["hero-sub"]} ${animating ? styles["fade-out"] : styles["fade-in"]}`}
        >
          {slide.sub}
        </p>

        <div className={styles["hero-actions"]}>
          <button className={styles["btn-primary"]}>Get Started</button>
          <button className={styles["btn-secondary"]}>About Us</button>
        </div>
      </div>

      <div className={styles["carousel-controls"]}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles["dot"]} ${i === current ? styles["dot-active"] : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      <div className={styles["progress-bar"]}>
        <div key={current} className={styles["progress-fill"]} />
      </div>
    </section>
  );
}

export default Hero;
