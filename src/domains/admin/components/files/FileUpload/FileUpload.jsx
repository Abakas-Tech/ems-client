import { useState, useEffect } from "react";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../context/Response/useResponse";
import useProfile from "../../../../../context/Profile/useProfile";
const FileUpload = ({
  isEditMode = false,
  initialData = null,
  onSuccess,
  onCancel,
}) => {
  const { addMessage } = useResponse();
  const { profile } = useProfile();

  const [formData, setFormData] = useState({
    file_name: "",
    category: "",
    description: "",
    is_private: 0,
    worker_id: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const extractDescription = (description) => {
    if (!description || typeof description !== "string") return "";
    return description
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, "")
      .replace(/\\\\/g, "\\");
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        file_name: initialData.file_name || initialData.filename || "",
        category: initialData.category || "",
        description: extractDescription(initialData.description) || "",
        is_private: initialData.is_private || 0,
        worker_id: initialData.worker_id || "",
      });
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? (checked ? 1 : 0) : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate File Size (20MB limit matching backend)
      if (file.size > 20 * 1024 * 1024) {
        addMessage(false, "File size exceeds 20MB limit");
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      // Auto-fill file name if empty
      if (!formData.file_name) {
        setFormData((prev) => ({ ...prev, file_name: file.name }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validation (Matching Backend Joi & Multer Schemas)
    if (!isEditMode && !selectedFile) {
      return addMessage(false, "Please select a file to upload");
    }
    if (!formData.category) {
      return addMessage(false, "Category is required");
    }
    if (formData.file_name && formData.file_name.length > 255) {
      return addMessage(false, "File name cannot exceed 255 characters");
    }
    if (formData.description && formData.description.length > 500) {
      return addMessage(false, "Description cannot exceed 500 characters");
    }

    setSubmitLoading(true);

    try {
      // Prepare payload for parent handler
      const payload = {
        ...formData,
        file: selectedFile,
      };
      if (isEditMode) {
        delete payload.file;
      }

      // In your File.jsx logic, handle the actual API call
      await onSuccess(payload);
    } catch (err) {
      addMessage(false, err.message || "Failed to process file");
    } finally {
      setSubmitLoading(false);
    }
  };
  return (
    <form className="form-submit" onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark fw-bold">{isEditMode ? "Update File Details" : "Upload New File"}</h2>
        <BackButton onClick={onCancel} />
      </div>

      <div className="submit-section">
        <div className="row">
          {/* Visibility Toggle */}
          {profile?.role_id <= 2 && !formData.worker_id && (
            <div className="form-group col-md-12 mb-3">
              <div className="form-check form-switch rounded-3 d-inline-flex align-items-center ">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="is_private"
                  id="isPrivateToggle"
                  checked={formData.is_private === 1}
                  onChange={handleChange}
                  style={{ cursor: "pointer", width: "3em", height: "1.5em" }}
                />
                <label
                  className="form-check-label ms-3  fw-semibold "
                  htmlFor="isPrivateToggle"
                  style={{ cursor: "pointer", height: "1em" }}
                >
                  {formData.is_private ? (
                    <span className="text-danger pt-5">
                      <i className="bi bi-lock-fill me-1"></i> Private
                    </span>
                  ) : (
                    <span className="text-success">
                      <i className="bi bi-globe me-1"></i> Public
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}
          <div className="form-group col-md-6">
            <label>
              File Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="file_name"
              className="form-control"
              value={formData.file_name}
              onChange={handleChange}
              placeholder="Enter file name"
              required
            />
          </div>
          <div className="form-group col-md-6">
            <label>
              Category <span className="text-danger">*</span>
            </label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="License">License</option>
              <option value="Agreement">Agreement</option>
              <option value="Report">Report</option>
              <option value="Policy">Policy</option>
              <option value="CV">CVs</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className={`form-group col-md-6 ${isEditMode && "col-md-12"}`}>
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              placeholder="Briefly describe the document contents"
              value={formData.description}
              onChange={handleChange}
              style={{ height: "150px" }}
            ></textarea>
          </div>

          {!isEditMode && (
            <div className="form-group col-md-6">
              <label>
                Select File <span className="text-danger">*</span>
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
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                />
                <div className="dz-message">
                  <i
                    className="bi bi-cloud-arrow-up fs-1"
                    style={{ color: "var(--maincolor)" }}
                  ></i>
                  <h5 className="mt-2">Click or Drag File Here</h5>
                  <p className="text-muted small mb-0">
                    {selectedFile ? (
                      <strong className="text-success">
                        {selectedFile.name}
                      </strong>
                    ) : (
                      "PDF, JPG, PNG or DOCX (Max 20MB)"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="submit-section mt-4">
        <div className="form-group col-lg-12 col-md-12">
          <button
            className="btn btn-main px-4 rounded fw-bold"
            type="submit"
            disabled={submitLoading}
          >
            {isEditMode ? "Update Details" : "Start Upload"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FileUpload;
