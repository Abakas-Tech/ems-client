import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const UploadFile = ({
  isEditMode = false,
  initialData = null,
  onSuccess, // This is the handleFormSubmit from File.jsx
  onCancel,
}) => {
  const { addMessage } = useResponse();

  const {
    register,
    handleSubmit: validateForm, // Rename the library function to avoid confusion
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const selectedFile = watch("file");

  const extractDescription = (description) => {
    if (!description || typeof description !== "string") return "";
    return description
      .replace(/^"|"$/g, "")
      .replace(/\\"/g, "")
      .replace(/\\\\/g, "\\");
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        file_name: initialData.file_name || initialData.filename || "",
        category: initialData.category || "",
        description: extractDescription(initialData.description) || "",
      });
    } else {
      reset({
        file_name: "",
        category: "",
        description: "",
      });
    }
  }, [isEditMode, initialData, reset]);

  // This is the actual logic that runs when validation passes
  const handleActualSubmit = async (data) => {
    const payload = { ...data };

    if (payload.file && payload.file.length > 0) {
      payload.file = payload.file[0];
    } else if (!isEditMode) {
      addMessage("error", "Please select a file to upload");
      return;
    }

    // Pass the cleaned data to the parent's handleFormSubmit
    onSuccess(payload);
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Update File Details" : "Upload New File"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Modify metadata."
                : "Upload documents to the repository."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="border rounded-circle d-flex align-items-center justify-content-center btn btn-light shadow-sm"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "var(--maincolor)",
              color: "#fff",
            }}
          >
            ←
          </button>
        </div>

        {/* Use validateForm(handleActualSubmit) */}
        <form onSubmit={validateForm(handleActualSubmit)}>
          <div className="submit-section bg-white p-4 rounded shadow-sm">
            <div className="row">
              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">File Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.file_name ? "is-invalid" : ""}`}
                  {...register("file_name", {
                    required: "File name is required",
                  })}
                />
                {errors.file_name && (
                  <small className="text-danger">
                    {errors.file_name.message}
                  </small>
                )}
              </div>

              <div className="form-group col-md-6 mb-3">
                <label className="fw-bold mb-1">Category</label>
                <select
                  className={`form-control ${errors.category ? "is-invalid" : ""}`}
                  {...register("category", {
                    required: "Category is required",
                  })}
                >
                  <option value="">Select Category</option>
                  <option value="License">License</option>
                  <option value="Agreement">Agreement</option>
                  <option value="Report">Report</option>
                  <option value="Policy">Policy</option>
                  <option value="Circular">Circular</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <small className="text-danger">
                    {errors.category.message}
                  </small>
                )}
              </div>

              <div className="form-group col-md-12 mb-3">
                <label className="fw-bold mb-1">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  {...register("description")}
                ></textarea>
              </div>

              {!isEditMode && (
                <div className="form-group col-md-12 mb-3">
                  <label className="fw-bold mb-1">Upload File</label>
                  <div
                    className="primary-dropzone p-5 border rounded-3 text-center position-relative"
                    style={{
                      backgroundColor: "#EDF1FB",
                      border: "2px dashed #dee2e6",
                    }}
                  >
                    <input
                      type="file"
                      className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                      style={{ cursor: "pointer" }}
                      {...register("file", {
                        required: !isEditMode && "File is required",
                      })}
                    />
                    <div className="dz-message">
                      <i
                        className="bi bi-cloud-plus-fill fs-1"
                        style={{ color: "var(--maincolor)" }}
                      ></i>
                      <h5 className="mt-2">Drag & Drop or Click</h5>
                      <span className="text-muted small">
                        {selectedFile?.[0]?.name || "Select a file..."}
                      </span>
                    </div>
                  </div>
                  {errors.file && (
                    <small className="text-danger">{errors.file.message}</small>
                  )}
                </div>
              )}

              <div className="form-group col-lg-12 text-start mt-4">
                <button
                  type="submit"
                  className="btn px-5 py-2 rounded fw-bold text-white"
                  style={{ backgroundColor: "var(--maincolor)" }}
                >
                  {isEditMode ? "Update Details" : "Upload File"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-3 px-4 py-2"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadFile;
