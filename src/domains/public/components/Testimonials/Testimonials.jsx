import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
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
  return (
    <section id="testimonials" className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <span className={styles.kicker}>Client stories</span>
          <h2 className={styles.title}>Discover What Our Clients Say</h2>
          <p className={styles.subtitle}>
            Trust and success are our greatest pride. Here's what candidates
            we've placed abroad have to say about working with us.
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
            modules={[Autoplay, Pagination]}
            loop={true}
            speed={700}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={24}
            pagination={{
              clickable: true,
              el: `.${styles.swiperPagination}`,
            }}
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
                      <span className={styles.authorRole}>
                        {item.position}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className={styles.swiperPagination}></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
