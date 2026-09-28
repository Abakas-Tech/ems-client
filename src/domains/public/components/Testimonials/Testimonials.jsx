import React from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// Assuming these are your local assets
import person1 from "../../../../assets/img/testimonials/image-1.png";
import person2 from "../../../../assets/img/testimonials/image-2.png";
import person3 from "../../../../assets/img/testimonials/image-3.png";
import person4 from "../../../../assets/img/testimonials/image-1.png";

// Names are shown as written; positions are translation keys
// (testimonials.positions.*). The quotes are the existing placeholder text.
const testimonialData = [
  {
    name: "Sophia Anderson",
    positionKey: "testimonials.positions.marketingDirector",
    image: person1,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
  {
    name: "Marcus Webb",
    positionKey: "testimonials.positions.techLead",
    image: person2,
    quote:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  },
  {
    name: "Elena Rodriguez",
    positionKey: "testimonials.positions.startupFounder",
    image: person3,
    quote:
      "Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  },
  {
    name: "Oliver Thompson",
    positionKey: "testimonials.positions.productDesigner",
    image: person4,
    quote:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  },
];

const Testimonials = () => {
  const { t, i18n } = useTranslation();

  return (
    <section id="testimonials" className="testimonials section pb-0">
      {/* Section Title */}
      <div className="container text-center mb-5" data-aos="fade-up">
        <h2>{t("testimonials.title")}</h2>
        <p>{t("testimonials.description")}</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row">
          {/* Left Sidebar */}
          <div className="col-lg-4" data-aos="fade-right" data-aos-delay="150">
            <div className="testimonials-sidebar">
              <div className="avatar-stack">
                <img src={person1} alt={t("testimonials.happyClient")} className="avatar" />
                <img src={person2} alt={t("testimonials.happyClient")} className="avatar" />
                <img src={person3} alt={t("testimonials.happyClient")} className="avatar" />
                <img src={person4} alt={t("testimonials.happyClient")} className="avatar" />
                <span className="avatar-count">+2.5k</span>
              </div>
              <div className="sidebar-content">
                <span className="satisfied-badge">
                  <i className="bi bi-heart-fill"></i>{" "}
                  {t("testimonials.satisfiedClients")}
                </span>
                <h3>{t("testimonials.sidebarTitle")}</h3>
                <p>{t("testimonials.sidebarText")}</p>
              </div>
            </div>
          </div>

          {/* Right Testimonials Slider */}
          <div className="col-lg-8" data-aos="fade-left" data-aos-delay="200">
            <Swiper
              // Re-created when the language (and so the direction) changes,
              // so the slider lays itself out for LTR or RTL correctly.
              key={i18n.language}
              dir={i18n.dir()}
              modules={[Autoplay, Pagination]}
              loop={true}
              speed={700}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false, // CRITICAL: Keeps it moving after you click/touch
                pauseOnMouseEnter: true, // Optional: Pause when mouse is over
              }}
              spaceBetween={24}
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
              }}
              className="testimonials-carousel"
            >
              {testimonialData.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="testimonial-card">
                    <div className="card-top">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="bi bi-star-fill"></i>
                        ))}
                      </div>
                      <span className="quote-mark">
                        <i className="bi bi-quote"></i>
                      </span>
                    </div>
                    <p className="testimonial-text">{item.quote}</p>
                    <div className="author-info">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="author-img"
                        loading="lazy"
                      />
                      <div className="author-details">
                        <h5>{item.name}</h5>
                        <span>{t(item.positionKey)}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              {/* Pagination element must be inside or linked to the Swiper */}
              <div className="swiper-pagination"></div>
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
