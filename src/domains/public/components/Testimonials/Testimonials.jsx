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

  // Manual, self-driving autoplay loop. This bypasses Swiper's built-in
  // Autoplay module entirely — with only 4 slides and up to 3 visible per
  // view, that module's internal "last slide" bookkeeping was stalling
  // instead of continuing past the wrap-around. slideNext() + loop={true}
  // always wraps back to the first slide on its own, and a plain interval
  // never enters a "stopped" state the way Autoplay's internal state can.
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

  // Jump to a specific testimonial and restart the timer from zero, so the
  // next automatic tick doesn't land right on top of a manual click.
  const goToSlide = (index) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    swiper.slideToLoop(index);
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
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            loop={true}
            loopAdditionalSlides={testimonialData.length * 3}
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
            {testimonialData.map((item, index) => (
              <button
                key={item.name}
                type="button"
                style={{ border: "none", padding: 0, cursor: "pointer" }}
                className={`swiper-pagination-bullet${
                  activeIndex === index
                    ? " swiper-pagination-bullet-active"
                    : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={activeIndex === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
