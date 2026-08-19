import React from "react";
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
    <section id="testimonials" className="testimonials section pb-0">
      {/* Section Title */}
      <div className="container text-center mb-5" data-aos="fade-up">
        <h2>Testimonials</h2>
        <p>
          Hear from our successful candidates who achieved their overseas career
          goals through our agency.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row">
          {/* Left Sidebar */}
          <div className="col-lg-4" data-aos="fade-right" data-aos-delay="150">
            <div className="testimonials-sidebar">
              <div className="avatar-stack">
                <img src={person1} alt="Happy Client" className="avatar" />
                <img src={person2} alt="Happy Client" className="avatar" />
                <img src={person3} alt="Happy Client" className="avatar" />
                <img src={person4} alt="Happy Client" className="avatar" />
                <span className="avatar-count">+2.5k</span>
              </div>
              <div className="sidebar-content">
                <span className="satisfied-badge">
                  <i className="bi bi-heart-fill"></i> Satisfied Clients
                </span>
                <h3>Discover What Our Clients Say About Us</h3>
                <p>
                  Trust and success are our greatest pride. Read the experiences
                  of those we've helped.
                </p>
              </div>
            </div>
          </div>

          {/* Right Testimonials Slider */}
          <div className="col-lg-8" data-aos="fade-left" data-aos-delay="200">
            <Swiper
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
                        <span>{item.position}</span>
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
