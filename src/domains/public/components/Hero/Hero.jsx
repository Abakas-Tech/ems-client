import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import bg1 from "../../../../assets/img/banner/hero-1.jpg";
import bg2 from "../../../../assets/img/banner/hero-2.jpg";
// import bg3 from "../../../../assets/img/banner/hero-3.jpg"; 


const slides = [
  {
    
    id: 1,
    bg: bg1,
    eyebrow: "Your trusted partner in overseas employment",
    heading: "Your Future\nStarts Here.",
    sub: "Ethiopia's leading licensed recruitment agency connecting skilled workers with top employers across Saudi Arabia, UAE, Kuwait, Qatar, and beyond.",
  },
  {
    id: 2,
    bg: bg2,
    eyebrow: "Legal. Safe. Transparent.",
    heading: "Work Abroad\nWith Confidence.",
    sub: "We handle every step — documentation, visa processing, pre-departure training, and on-ground support — so you and your family have peace of mind.",
  },
  {
    id: 3,
    bg: "/assets/hero-3.jpg",
    eyebrow: "Thousands placed. Countless lives changed.",
    heading: "Build a Better\nLife Abroad.",
    sub: "Join the thousands of Ethiopian workers who have built successful careers in the Middle East through our trusted placement programs.",
  },
  // Add more slides here — just follow the same shape:
  // { id: 4, bg: "/assets/hero-4.jpg", eyebrow: "...", heading: "...\n...", sub: "..." },
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
      {/* bg image is driven by the current slide */}
      <div
        className={styles["hero-bg"]}
        style={{ backgroundImage: `url(${slide.bg})` }}
      />
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
          <button className={styles["btn-primary"]}>Apply Now</button>
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
