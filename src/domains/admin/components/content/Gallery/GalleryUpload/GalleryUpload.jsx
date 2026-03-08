import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../../context/Response/useResponse";
import useLoader from "../../../../../../context/Loader/useLoader";
import {
  createGalleryItem,
  getGalleryItem,
  updateGalleryItem,
} from "../../../../api/gallery.api.js";

const GalleryUpload = () => {
  const { id } = useParams(); // id is undefined in create mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addMessage } = useResponse();
  const { showLoader, hideLoader } = useLoader();

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const extractDescription = (description) => {
    if (!description || typeof description !== "string") return "";
    return description
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, "")
      .replace(/\\\\/g, "\\");
  };

  // Fetch gallery item if editing
  useEffect(() => {
    if (isEditMode) {
      showLoader();
      getGalleryItem(id)
        .then((res) => {
          const item = res.data;
          setFormData({
            title: item.title || "",
            description: extractDescription(item.description) || "",
          });
        })
        .catch((err) => addMessage(false, err.message))
        .finally(hideLoader);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      addMessage(false, "Only JPG, JPEG, PNG, and WEBP images are allowed");
      e.target.value = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addMessage(false, "Image size exceeds 5MB limit");
      e.target.value = null;
      return;
    }

    setSelectedFile(file);

    if (!formData.title) {
      setFormData((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && !selectedFile) {
      return addMessage(false, "Please select an image");
    }

    if (!formData.title) return addMessage(false, "Title is required");
    if (formData.title.length < 2 || formData.title.length > 50)
      return addMessage(false, "Title must be between 2 and 50 characters");
    if (formData.description && formData.description.length > 200)
      return addMessage(false, "Description cannot exceed 200 characters");

    setSubmitLoading(true);

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      if (selectedFile) payload.append("file", selectedFile);

      if (isEditMode) {
        await updateGalleryItem(id, payload);
        addMessage(true, "Gallery item updated successfully");
      } else {
        await createGalleryItem(payload);
        addMessage(true, "Gallery item created successfully");
      }

      navigate("/admin/gallery"); // back to gallery list
    } catch (err) {
      addMessage(false, err.message || "Failed to process gallery item");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="dashboard-wraper">
      {/* Page Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>
              {isEditMode ? "Update Gallery Item" : "Create Gallery Item"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Edit the gallery item details below and optionally replace the image."
                : "Fill in the details to add a new gallery item."}
            </p>
          </div>
          <BackButton onClick={() => navigate("/admin/gallery")} />
        </div>
      </div>

      {/* Form */}
      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-12">
              <label>
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Company Building"
                required
              />
            </div>

            <div className="form-group col-md-12">
              <label>Description (Optional)</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Example: Main office building entrance"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group col-md-12">
              <label>
                Select Image {isEditMode ? "(Optional to replace)" : "*"}
              </label>
              <div
                className="primary-dropzone p-4 border rounded-3 text-center position-relative"
                style={{
                  backgroundColor: "#DAEDFE",
                  border: "2px dashed #dee2e6",
                }}
              >
                <input
                  type="file"
                  className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                  style={{ cursor: "pointer" }}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp"
                />
                <div className="dz-message">
                  <i
                    className="bi bi-images fs-1"
                    style={{ color: "var(--maincolor)" }}
                  ></i>
                  <h5 className="mt-2">Click or Drag Image Here</h5>
                  <p className="text-muted small mb-0">
                    {selectedFile ? (
                      <strong className="text-success">
                        {selectedFile.name}
                      </strong>
                    ) : isEditMode ? (
                      "Leave empty to keep existing image"
                    ) : (
                      "JPG, PNG, WEBP (Max 5MB)"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="submit-section mt-4">
          <div className="form-group col-lg-12 col-md-12">
            <button
              className="btn btn-main px-5 rounded fw-bold text-white"
              type="submit"
              disabled={submitLoading}
              style={{ backgroundColor: "var(--maincolor)" }}
            >
              {submitLoading
                ? "Processing..."
                : isEditMode
                  ? "Update Gallery Item"
                  : "Create Gallery Item"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary ms-2 px-4 rounded"
              onClick={() => navigate("/admin/gallery")}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GalleryUpload;
