import { useState, useEffect } from "react";
import { FaFolderPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../../context/Delete/useDelete";
import {
  getGalleryItems,
  deleteGalleryItem,
  deleteAllGalleryItems,
} from "../../../../api/gallery.api.js";
import GalleryCard from "../GalleryCard/GalleryCard.jsx";

const GalleryList = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const navigate = useNavigate();

  const [galleryItems, setGalleryItems] = useState([]);

  // Fetch all gallery items
  const fetchGalleryItems = async () => {
    showLoader();
    try {
      const response = await getGalleryItems();
      setGalleryItems(response.data || []);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Navigate to create page
  const handleAddNew = () => {
    navigate("/admin/public-gallery/create");
  };

  // Navigate to edit page
  const handleEdit = (item) => {
    navigate(`/admin/public-gallery/edit/${item.id}`);
  };

  // Delete single item
  const handleDelete = (itemId, title) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteGalleryItem(itemId);
          addMessage(true, `"${title}" deleted successfully`);
          fetchGalleryItems();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Confirm Deletion",
        message: `Are you sure you want to delete "${title}"?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      },
    );
  };

  // Delete all items
  const handleDeleteAll = () => {
    if (galleryItems.length === 0) return;

    openModal(
      async () => {
        showLoader();
        try {
          await deleteAllGalleryItems();
          addMessage(true, "All gallery items deleted successfully");
          fetchGalleryItems();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Confirm Deletion",
        message: "Are you sure you want to delete ALL gallery items?",
        confirmText: "Delete All",
        cancelText: "Cancel",
      },
    );
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gallery Management</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-main px-5 rounded"
            onClick={handleAddNew}
            disabled={galleryItems.length >= 10}
          >
            <FaFolderPlus className="me-1" /> Add New
          </button>
          <button
            className="btn btn-main px-5 rounded btn-outline-danger"
            onClick={handleDeleteAll}
            disabled={galleryItems.length === 0}
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Gallery Cards */}
      <div className="row g-3 mt-4">
        {galleryItems.length === 0 && (
          <p className="text-muted">No gallery items available.</p>
        )}

        {galleryItems.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id, item.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryList;
