import React, { useState } from "react";
import Slider from "react-slick";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import styles from "./PropertyGallery.module.css";

const PropertyGallery = ({ images = [] }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const NextArrow = ({ onClick }) => (
    <button
      type="button"
      aria-label="Next"
      className={styles.arrow + " " + styles.next}
      onClick={onClick}
    >
      ❯
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button
      type="button"
      aria-label="Previous"
      className={styles.arrow + " " + styles.prev}
      onClick={onClick}
    >
      ❮
    </button>
  );

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

  const openLightbox = (i) => {
    setIndex(i);
    setOpen(true);
  };

  const onKeyOpen = (e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(i);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Slider {...settings} className={styles.slider}>
        {images.map((image, i) => (
          <div
            key={i}
            className={styles.slide}
            role="button"
            tabIndex={0}
            onClick={() => openLightbox(i)}
            onKeyDown={(e) => onKeyOpen(e, i)}
            aria-label={image.alt_text || `Open photo ${i + 1}`}
          >
            <img
              src={image.image_url}
              alt={image.alt_text || `photo-${i}`}
              className={styles.img}
              loading="lazy"
            />

            {image.alt_text && (
              <div className={styles.overlay} aria-hidden="true">
                {image.alt_text}
              </div>
            )}
          </div>
        ))}
      </Slider>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((img) => ({
          src: img.image_url,
          description: img.alt_text || "",
        }))}
        plugins={[Thumbnails]}
      />
      {images.length > 0 && (
        <button
          type="button"
          className={`${styles.viewBtn} btn-view-pic top`}
          onClick={() => {
            setIndex(0);
            setOpen(true);
          }}
        >
          View photos
        </button>
      )}
    </div>
  );
};

export default PropertyGallery;
