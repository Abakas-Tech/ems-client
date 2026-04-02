import { useState, useEffect } from "react";
import styles from "./Gallery.module.css";
import getGalleryItems from "../../api/gallery.api";
import useLoader from "../../../../context/Loader/useLoader";

const Gallery = () => {
  const { showLoader, hideLoader } = useLoader();

  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchGalleryItems = async () => {
    showLoader();
    try {
      const res = await getGalleryItems();
      setGalleryItems(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchGalleryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth < 768 ? 3 : 6);
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, galleryItems]);

  const openModal = (index) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);

  const navigate = (direction) => {
    setSelectedIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? galleryItems.length - 1 : prev - 1;
      }
      return prev === galleryItems.length - 1 ? 0 : prev + 1;
    });
  };

  const selectedItem =
    selectedIndex !== null ? galleryItems[selectedIndex] : null;

  return (
    <section
      id="gallery"
      style={{ padding: "100px 0" }}
      className="pb-0"
      aria-labelledby="gallery-title"
    >
      <div className="container">
        {/* Header */}
        <div className="row mb-5 justify-content-center">
          <div className="col-lg-7 col-md-10 text-center">
            <div className="sec-heading-center">
              <h2 id="gallery-title" className="fw-bold">
                Capturing Memorable Moments
              </h2>
              <p>
                Explore our gallery of professional photographs capturing
                Ethiopian workers, events, and milestones—preserving memories of
                every special occasion.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="row g-4">
          {galleryItems.slice(0, visibleCount).map((item, index) => (
            <div
              key={item.id}
              className="col-12 col-md-4"
              aria-label={`Gallery item: ${item.title}`}
            >
              <div
                className={`card border-0 shadow-sm ${styles["gallery-card"]}`}
                onClick={() => openModal(index)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") openModal(index);
                }}
              >
                <div className={styles["image-wrapper"]}>
                  <img
                    src={item.image_url}
                    alt={item.title || "Gallery Image"}
                    loading="lazy"
                    className={`card-img-top ${styles["gallery-image"]}`}
                  />
                </div>
                <div
                  className={`card-img-overlay d-flex align-items-end ${styles.overlay}`}
                >
                  <h5 className="text-white">{item.title}</h5>
                </div>
              </div>
            </div>
          ))}

          {galleryItems.length === 0 && (
            <div className="col-12 text-center text-muted ">
              <p>No gallery items available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div
          className={styles["modal-overlay"]}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={styles["modal-wrapper"]}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles["close-button"]}
              onClick={closeModal}
              aria-label="Close gallery modal"
            >
              &times;
            </button>

            <div className={styles["image-container"]}>
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title || "Gallery Image"}
                loading="lazy"
                className={styles["modal-image"]}
              />
            </div>

            <div className={styles["modal-info"]}>
              <h4 id="modal-title">{selectedItem.title}</h4>
              <p>{selectedItem.description}</p>
            </div>

            <button
              className={`${styles["nav-button"]} ${styles.left}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate("prev");
              }}
              aria-label="Previous image"
            >
              &#10094;
            </button>

            <button
              className={`${styles["nav-button"]} ${styles.right}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate("next");
              }}
              aria-label="Next image"
            >
              &#10095;
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
