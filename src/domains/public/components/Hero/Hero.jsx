import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { HERO_SLIDES, DESTINATIONS, AGENCY_NAME } from "../../data/content";
import { scrollToSection } from "../../utils/scroll";
import styles from "./Hero.module.css";

const SLIDE_MS = 6500;

function Hero() {
  const [{ current, previous }, setState] = useState({
    current: 0,
    previous: null,
  });
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef(null);
  const total = HERO_SLIDES.length;

  const goTo = useCallback(
    (index) =>
      setState((s) => {
        const next = ((index % total) + total) % total;
        return next === s.current ? s : { current: next, previous: s.current };
      }),
    [total],
  );

  /* Autoplay — restarts whenever the slide changes, so manual
     navigation always gets a full interval. */
  useEffect(() => {
    if (reduceMotion || paused) return undefined;
    timer.current = setTimeout(() => goTo(current + 1), SLIDE_MS);
    return () => clearTimeout(timer.current);
  }, [current, paused, reduceMotion, goTo]);

  /* Don't advance while the tab is in the background */
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const jump = (id) => (e) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <section
      id="home"
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Highlights"
    >
      {/* Background imagery */}
      <div className={styles.media} aria-hidden="true">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.image}
            srcSet={`${slide.imageSm} 1000w, ${slide.image} 2200w`}
            sizes="100vw"
            alt=""
            className={`${styles.layer} ${i === current ? styles.layerOn : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        ))}
        <div className={styles.shadeSide} />
        <div className={styles.shadeBottom} />
        <div className={styles.glow} />
        <div className={styles.grain} />
      </div>

      <div className={`vx-container ${styles.inner}`}>
        <h1 className={styles.srOnly}>
          {AGENCY_NAME} — licensed overseas employment agency connecting
          Ethiopian workers with verified employers abroad
        </h1>

        {/* All slides share one grid cell, so the block is always as tall
            as the longest slide and nothing below it shifts. */}
        <div className={styles.copy}>
          {HERO_SLIDES.map((slide, i) => {
            const on = i === current;
            const out = i === previous;
            return (
              <div
                key={slide.id}
                className={`${styles.slide} ${on ? styles.slideOn : ""} ${
                  out ? styles.slideOut : ""
                }`}
                aria-hidden={!on}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
              >
                <span className={styles.eyebrow}>
                  <span className={styles.pulse} aria-hidden="true" />
                  {slide.eyebrow}
                </span>
                <p className={styles.heading}>
                  <span className={styles.lineMask}>
                    <span className={styles.line}>{slide.heading[0]}</span>
                  </span>
                  <span className={styles.lineMask}>
                    <span className={`${styles.line} ${styles.lineAccent}`}>
                      {slide.heading[1]}
                    </span>
                  </span>
                </p>
                <p className={styles.sub}>{slide.sub}</p>
              </div>
            );
          })}
        </div>

        <div className={styles.ctas}>
          <a
            href="#contact"
            onClick={jump("contact")}
            className="vx-btn vx-btn--primary"
          >
            Apply Now <ArrowRight size={18} strokeWidth={2.2} />
          </a>
          <a href="#about" onClick={jump("about")} className="vx-btn vx-btn--glass">
            About Us
          </a>
        </div>
      </div>

      {/* Bottom rail: destinations + slide controls */}
      <div className={`vx-container ${styles.rail}`}>
        <div className={styles.destinations}>
          <span className={styles.destLabel}>Placing talent in</span>
          <ul className={styles.destList}>
            {DESTINATIONS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>

        <div className={styles.controls}>
          <span className={styles.counter}>
            <strong>{String(current + 1).padStart(2, "0")}</strong>
            <span> / {String(total).padStart(2, "0")}</span>
          </span>
          <div className={styles.segments}>
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`${styles.segment} ${
                  i === current ? styles.segmentOn : ""
                } ${i < current ? styles.segmentDone : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current}
              >
                <span
                  key={i === current ? `on-${current}` : "off"}
                  className={styles.segmentFill}
                  style={{
                    animationDuration: `${SLIDE_MS}ms`,
                    animationPlayState:
                      paused || reduceMotion ? "paused" : "running",
                  }}
                />
              </button>
            ))}
          </div>
          <div className={styles.arrows}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current - 1)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => goTo(current + 1)}
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
