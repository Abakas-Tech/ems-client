import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y, Keyboard } from "swiper/modules";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import "swiper/css";

import { useTranslation } from "react-i18next";
import { TESTIMONIALS } from "../../data/content";
import Reveal from "../ui/Reveal";
import styles from "./Testimonials.module.css";

function Stars({ size = 15 }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

function Testimonials() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir(i18n.resolvedLanguage);
  const swiperRef = useRef(null);
  const [active, setActive] = useState(0);

  return (
    <section
      id="testimonials"
      className={`vx-section ${styles.section}`}
      aria-labelledby="testimonials-title"
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className="vx-container">
        <div className={styles.layout}>
          <Reveal className={styles.intro}>
            <span className={styles.eyebrow}>{t("testimonials.eyebrow")}</span>
            <h2 id="testimonials-title" className={styles.title}>
              {t("testimonials.title")}{" "}
              <span className="vx-serif">{t("testimonials.accent")}</span>
            </h2>
            <p className={styles.lead}>
              {t("testimonials.lead")}
            </p>

            <div className={styles.rating}>
              <Stars size={18} />
              <span>{t("testimonials.rating")}</span>
            </div>

            <div className={styles.nav}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label={t("testimonials.prev")}
              >
                <ArrowLeft size={18} className="vx-flip" />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => swiperRef.current?.slideNext()}
                aria-label={t("testimonials.next")}
              >
                <ArrowRight size={18} className="vx-flip" />
              </button>
              <span className={styles.progress} aria-hidden="true">
                <span
                  className={styles.progressFill}
                  style={{
                    width: `${((active + 1) / TESTIMONIALS.length) * 100}%`,
                  }}
                />
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.1} className={styles.sliderWrap}>
            <Swiper
              key={dir}
              dir={dir}
              modules={[Autoplay, A11y, Keyboard]}
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => setActive(s.realIndex)}
              loop
              speed={800}
              spaceBetween={20}
              slidesPerView={1.06}
              keyboard={{ enabled: true, onlyInViewport: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              breakpoints={{
                640: { slidesPerView: 1.35, spaceBetween: 20 },
                1000: { slidesPerView: 1.6, spaceBetween: 24 },
              }}
              className={styles.swiper}
            >
              {TESTIMONIALS.map((item, i) => (
                <SwiperSlide key={`${item.name}-${i}`} className={styles.slide}>
                  <figure className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.quoteMark} aria-hidden="true">
                        “
                      </span>
                      <Stars />
                    </div>
                    <blockquote className={styles.quote} dir="auto">{item.quote}</blockquote>
                    <figcaption className={styles.author} dir="auto">
                      <img
                        src={item.image}
                        alt=""
                        className={styles.avatar}
                        loading="lazy"
                        width="52"
                        height="52"
                      />
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.position}</small>
                      </span>
                    </figcaption>
                  </figure>
                </SwiperSlide>
              ))}
            </Swiper>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
