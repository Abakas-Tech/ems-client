import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import image1 from "./img/image-1.png";
import image2 from "./img/image-2.png";
import image3 from "./img/image-3.png";

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
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="gray-bg">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading center">
              <h2>Good Reviews by Customers</h2>
              <p>
                Hear from my satisfied clients who found their dream homes and
                profitable investments with me. Their trust is my greatest
                reward.
              </p>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-12 col-md-12">
            <Slider {...settings} className="smart-textimonials smart-center">
              {testimonialData.map((item, index) => (
                <div className="item" key={index}>
                  <div className="item-box">
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
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
