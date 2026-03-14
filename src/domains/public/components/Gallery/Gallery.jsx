import { useState, useEffect } from "react";
import styles from "./Gallery.module.css";
import getGalleryItems from "../../api/gallery.api";
import useLoader from "../../../../context/Loader/useLoader";

const Gallery = () => {
  const { showLoader, hideLoader } = useLoader();

  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

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
    <section id="gallery" className="border-top my-5 py-5">
      <div className="container">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h2 className="fw-bold">Capturing memorable moments</h2>
            <p className="">
              Explore our gallery of stunning photographs that tell stories,
              evoke emotions, and preserve memories from every special occasion.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="row g-4">
          {galleryItems.map((item, index) => (
            <div key={item.id} className="col-md-4">
              <div
                className={`card border-0 shadow-sm $styles["gallery-card"]`}
                onClick={() => openModal(index)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className={`card-img-top ${styles.galleryImage}`}
                />

                <div
                  className={`card-img-overlay d-flex align-items-end ${styles.overlay}`}
                >
                  <h5 className="text-white">{item.title}</h5>
                </div>
              </div>
            </div>
          ))}

          {galleryItems.length === 0 && (
            <div className="col-12 text-center text-muted py-5">
              <p>No gallery items available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button fixed to modal */}
            <button className={styles.closeButton} onClick={closeModal}>
              &times;
            </button>

            {/* Image */}
            <div className={styles.imageContainer}>
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className={styles.modalImage}
              />
            </div>

            {/* Modal Info */}
            <div className={styles.modalInfo}>
              <h4>{selectedItem.title}</h4>
              <p>{selectedItem.description}</p>
            </div>

            {/* Navigation */}
            <button
              className={`${styles.navButton} ${styles.left}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate("prev");
              }}
            >
              &#10094;
            </button>

            <button
              className={`${styles.navButton} ${styles.right}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate("next");
              }}
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
