import React, { useRef, useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Assuming these are your local assets
import person1 from "../../../../assets/img/testimonials/image-1.png";
import person2 from "../../../../assets/img/testimonials/image-2.png";
import person3 from "../../../../assets/img/testimonials/image-3.png";
import person4 from "../../../../assets/img/testimonials/image-1.png";

import styles from "./Testimonials.module.css";

const AUTOPLAY_DELAY = 4000;

const BREAKPOINTS = [
  { minWidth: 1200, slidesPerView: 3 },
  { minWidth: 768, slidesPerView: 2 },
  { minWidth: 0, slidesPerView: 1 },
];

const getSlidesPerView = () => {
  if (typeof window === "undefined") return 1;
  const width = window.innerWidth;
  return BREAKPOINTS.find((bp) => width >= bp.minWidth)?.slidesPerView || 1;
};

const testimonialData = [
  {
    name: "Sophia Anderson",
    position: "Marketing Director",
    image: person1,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
  {
    name: "Marcus Webb",
    position: "Tech Lead",
    image: person2,
    quote:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  },
  {
    name: "Elena Rodriguez",
    position: "Startup Founder",
    image: person3,
    quote:
      "Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
  {
    name: "Oliver Thompson",
    position: "Product Designer",
    image: person4,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
];

const Testimonials = () => {
  const swiperRef = useRef(null);
  const intervalRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // How many slides are visible at once right now — recalculated on
  // resize so the dot count/behavior stays correct across breakpoints.
  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView);

  useEffect(() => {
    const handleResize = () => setSlidesPerView(getSlidesPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, testimonialData.length - slidesPerView);
  const dotCount = maxIndex + 1;

  const startAutoplay = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      swiperRef.current?.slideNext();
    }, AUTOPLAY_DELAY);
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(intervalRef.current);
  }, [startAutoplay]);
  const goToSlide = (index) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.slideTo(Math.min(index, maxIndex));
    startAutoplay();
  };

  return (
    <section id="testimonials" className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className={styles.kicker}>Client stories</span>
          <h2 className={styles.title}>Discover What Our Clients Say</h2>
          <p className={styles.subtitle}>
            Real stories from candidates we have placed abroad about working
            with our team from start to finish.
          </p>

          <div className={styles.trustRow}>
            <span className={styles.trustStars}>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
            </span>
            <span className={styles.trustText}>
              Rated by over 2,500 candidates
            </span>
          </div>
        </div>

        <div className={styles.carouselWrap}>
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            rewind={true}
            speed={700}
            spaceBetween={24}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            className={styles.carousel}
          >
            {testimonialData.map((item, index) => (
              <SwiperSlide key={index} className={styles.slide}>
                <div className={styles.card}>
                  <FaQuoteLeft className={styles.quoteMark} />
                  <p className={styles.text}>{item.quote}</p>
                  <div className={styles.author}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.authorImg}
                      loading="lazy"
                    />
                    <div>
                      <h5 className={styles.authorName}>{item.name}</h5>
                      <span className={styles.authorRole}>{item.position}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className={styles.swiperPagination}>
            {Array.from({ length: dotCount }, (_, index) => (
              <button
                key={index}
                type="button"
                style={{ border: "none", padding: 0, cursor: "pointer" }}
                className={`swiper-pagination-bullet${
                  Math.min(activeIndex, maxIndex) === index
                    ? " swiper-pagination-bullet-active"
                    : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial group ${index + 1}`}
                aria-current={Math.min(activeIndex, maxIndex) === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
