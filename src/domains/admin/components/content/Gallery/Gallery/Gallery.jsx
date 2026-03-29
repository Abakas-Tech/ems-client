import { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import { FaArrowLeft, FaArrowRight, FaFolderPlus } from "react-icons/fa";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../../context/Delete/useDelete";
import {
  getGalleryItems,
  deleteGalleryItem,
  deleteAllGalleryItems,
} from "../../../../api/gallery.api.js";
import ActionButtons from "../../../../../../shared/components/ActionButtons/ActionButtons";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

import "keen-slider/keen-slider.min.css";

const Gallery = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const navigate = useNavigate();

  const [galleryItems, setGalleryItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [sliderRef, slider] = useKeenSlider({
    initial: 0,
    slides: { perView: 1 },
    loop: galleryItems.length > 1,
    slideChanged(s) {
      setCurrentIndex(s.track.details.rel);
    },
  });

  const fetchGalleryItems = async () => {
    showLoader();
    try {
      const response = await getGalleryItems();
      setGalleryItems(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchGalleryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const goBack = () => navigate(-1);

  const handleAddNew = () => navigate("/admin/public-content/gallery/create");

  const handleEdit = (item) =>
    navigate(`/admin/public-content/gallery/edit/${item.id}`);

  const handleDelete = (itemId) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteGalleryItem(itemId);
          addMessage(response?.success, response?.message);
          fetchGalleryItems();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: `Are you sure you want to delete this item`,
        confirmText: "Delete",
      },
    );
  };

  const handleDeleteAll = () => {
    if (!galleryItems.length) return;
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteAllGalleryItems();
          addMessage(response?.success, response?.message);
          fetchGalleryItems();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete ALL gallery items?",
        confirmText: "Delete All",
      },
    );
  };

  return (
    <section id="gallery" className="py-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <BackButton onClick={goBack} />
          <h2>Gallery Management</h2>
          <p className="text-muted ">Manage gallery items efficiently</p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className="btn btn-main px-4"
          onClick={handleAddNew}
          disabled={galleryItems.length >= 10}
        >
          Add Gallery
        </button>
        {galleryItems.length > 0 && (
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteAll}
            disabled={galleryItems.length === 0}
          >
            Delete All
          </button>
        )}
      </div>

      {galleryItems.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="fs-5">No gallery items available.</p>
        </div>
      ) : (
        <div className="row g-4 align-items-center">
          {/* Left Panel */}
          <div className="col-12 col-lg-4">
            <h3>{galleryItems[currentIndex]?.title}</h3>
            <p className="text-muted">
              {galleryItems[currentIndex]?.description}
            </p>
            <div className="mt-2">
              <ActionButtons
                actions={[
                  {
                    type: "edit",
                    onClick: () => handleEdit(galleryItems[currentIndex]),
                  },
                  {
                    type: "delete",
                    onClick: () =>
                      handleDelete(
                        galleryItems[currentIndex].id,
                        galleryItems[currentIndex].title,
                      ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-12 col-lg-8 d-flex justify-content-center align-items-center gap-3">
            <ActionButtons
              actions={[
                {
                  type: "leftArrow",
                  onClick: () => slider && slider.current?.prev(),
                },
              ]}
            />

            <div
              ref={sliderRef}
              className="keen-slider"
              style={{ width: "400px", height: "220px" }}
            >
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="keen-slider__slide d-flex justify-content-center align-items-center"
                  style={{ width: "400px", height: "200px" }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>

            <ActionButtons
              actions={[
                {
                  type: "rightArrow",
                  onClick: () => slider && slider.current?.next(),
                },
              ]}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
