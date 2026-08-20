import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import bg1 from "../../../../assets/img/banner/hero-1.jpg";
import bg2 from "../../../../assets/img/banner/hero-2.jpg";
import bg3 from "../../../../assets/img/banner/hero-3.jpg";
import bg4 from "../../../../assets/img/banner/hero-4.jpg";
import bg5 from "../../../../assets/img/banner/hero-5.jpg";

const slides = [
  {
    id: 1,
    bg: bg1,
    eyebrow: "Your trusted partner in overseas employment",
    heading: "Your Future\nStarts Here.",
    sub: "Ethiopia's leading agency connecting skilled workers with top employers in Saudi Arabi and Jordan.",
  },
  {
    id: 2,
    bg: bg2,
    eyebrow: "Legal. Safe. Transparent.",
    heading: "Your Safe\nPath Abroad.",
    sub: "From documents to departure — we handle everything so you and your family have peace of mind.",
  },
  {
    id: 3,
    bg: bg3,
    eyebrow: "Thousands placed. Countless lives changed.",
    heading: "Build a Better\nLife Abroad.",
    sub: "Thousands of Ethiopians have built successful careers in the Middle East — your story starts here.",
  },
  {
    id: 4,
    bg: bg4,
    eyebrow: "Your gateway to the Gulf",
    heading: "Opportunity\nAwaits You.",
    sub: "From Addis Ababa to Dubai, Riyadh, and Kuwait City — we open doors to life-changing careers for hardworking Ethiopians.",
  },
  {
    id: 5,
    bg: bg5,
    eyebrow: "Start your journey today",
    heading: "Apply Once.\nChange Everything.",
    sub: "Our simple application process gets you in front of verified employers fast. No hidden fees. No middlemen. Just results.",
  },
];

// The company's verified primary tagline, in both languages. This is
// deliberately static across all five slides rather than translated
// per-slide — the client's company profile only provides an approved
// Amharic version of this one core tagline, not of the five different
// rotating marketing headlines, so making up translations for those risks
// shipping wording the client never signed off on.
const TAGLINE_EN =
  "Connecting People. Creating Opportunities. Building Better Futures.";
const TAGLINE_AM = "ሰዎችን እናገናኛለን። ዕድሎችን እንፈጥራለን። የተሻለ ወደፊት እንገነባለን።";

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
    <section className={styles["hero"]} id="home">
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

        {/* Static bilingual tagline — same on every slide, see note above. */}
        <p
          title={TAGLINE_EN}
          style={{
            fontSize: "15px",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.8)",
            fontStyle: "italic",
            letterSpacing: "0.2px",
            margin: "-4px 0 20px",
            maxWidth: "560px",
          }}
        >
          {TAGLINE_AM}
        </p>

        <div className={styles["hero-actions"]}>
          <div className={styles["hero-actions"]}>
            <a href="#contact" className={styles["btn-primary"]}>
              Apply Now
            </a>
            <a href="#about" className={styles["btn-secondary"]}>
              About Us
            </a>
          </div>
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
