import React, { useState } from "react";
import Slider from "react-slick";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const PropertyGallery = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const NextArrow = ({ onClick }) => (
    <button
      className="slick-next"
      onClick={onClick}
      style={{
        right: "10px",
        zIndex: 5,
        background: "#767373ff",
        // borderRadius: "50%",
        width: "40px",
        height: "40px",
        // border: "none",
      }}
    >
      ❯
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      className="slick-prev"
      onClick={onClick}
      style={{
        left: "10px",
        zIndex: 5,
        background: "#767373ff",
        // borderRadius: "50%",
        width: "40px",
        height: "40px",
        // border: "none",
      }}
    >
      ❮
    </button>
  );

  // Slick slider settings (2 images per slide like template)
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="featured_slick_gallery gray">
      <Slider {...settings} className="featured_slick_gallery-slide">
        {images.map((image, i) => (
          <div
            key={i}
            className="featured_slick_padd"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <a href="#!" className="mfp-gallery">
              <img
                src={image.image_url}
                alt={`property-${i}`}
                className="img-fluid mx-auto mt-2"
                style={{ cursor: "pointer" }}
              />
            </a>
          </div>
        ))}
      </Slider>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((img) => ({ src: img.image_url }))}
        plugins={[Thumbnails]}
      />

      {/* Button */}
      <a
        href="#!"
        className="btn-view-pic top"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
      >
        View photos
      </a>
    </div>
  );
};

export default PropertyGallery;
