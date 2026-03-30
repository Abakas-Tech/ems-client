import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import image1 from "../../../../assets/img/testimonials/image-1.png";
import image2 from "../../../../assets/img/testimonials/image-2.png";
import image3 from "../../../../assets/img/testimonials/image-3.png";

const testimonialData = [
  {
    name: "Adam Williams",
    position: "CEO Of Microwoft",
    image: image1,
    quote:
      "Cicero famously orated against his political opponent Lucius Sergius Catilina. Occasionally the first Oration against Catiline is taken specimens.",
    color: "bg-main",
  },
  {
    name: "Retha Deowalim",
    position: "CEO Of Apple",
    image: image2,
    quote:
      "Cicero famously orated against his political opponent Lucius Sergius Catilina. Occasionally the first Oration against Catiline is taken specimens.",
    color: "bg-green",
  },
  {
    name: "Sam J. Wasim",
    position: "Pio Founder",
    image: image3,
    quote:
      "Cicero famously orated against his political opponent Lucius Sergius Catilina. Occasionally the first Oration against Catiline is taken specimens.",
    color: "bg-red",
  },
  {
    name: "Usan Gulwarm",
    position: "CEO Of Facewarm",
    image: image1,
    quote:
      "Cicero famously orated against his political opponent Lucius Sergius Catilina. Occasionally the first Oration against Catiline is taken specimens.",
    color: "bg-primary",
  },
  {
    name: "Shilpa Shethy",
    position: "CEO Of Zapple",
    image: image3,
    quote:
      "Cicero famously orated against his political opponent Lucius Sergius Catilina. Occasionally the first Oration against Catiline is taken specimens.",
    color: "bg-warning",
  },
];

const Testimonials = () => {
  return (
    <section className="pb-0" id="testimonials" style={{ padding: "100px 0" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2 className="fw-bold">Good Reviews by Customers</h2>
              <p>
                Hear from our satisfied clients who found their dream homes and
                profitable investments with us. Their trust is our greatest
                reward.
              </p>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-12 col-md-12">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              autoplay={{ delay: 4000 }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
              }}
              className="smart-textimonials smart-center"
            >
              {testimonialData.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="item-box bg-light">
                    <div className="smart-tes-author">
                      <div className="st-author-box">
                        <div className="st-author-thumb">
                          <div className={`quotes ${item.color}`}>
                            <i className="fa-solid fa-quote-left"></i>
                          </div>
                          <img
                            src={item.image}
                            className="img-fluid"
                            alt={item.name}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="smart-tes-content">
                      <p>{item.quote}</p>
                    </div>

                    <div className="st-author-info">
                      <h4 className="st-author-title">{item.name}</h4>
                      <span className="st-author-subtitle">
                        {item.position}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
