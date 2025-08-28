import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, RefreshCw, Trash2 } from "lucide-react";
import useResponse from "./../../../context/response/UseResponse";

const ImagesUploadForm = ({
  propertyTitle,
  propertyId,
  files,
  setFiles,
  altTexts,
  setAltTexts,
  existingImages,
  setExistingImages,
  onSubmit,
  onCancel,
  isEditMode = false,
  onDeleteImage,
  fetchPropertyImages, // new
}) => {
  const { addMessage } = useResponse();
  const maxFiles = 10;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = {
    "image/jpeg": [],
    "image/png": [],
    "image/gif": [],
  };

  //  refetch on mount
  useEffect(() => {
    if (propertyId && typeof fetchPropertyImages === "function") {
      fetchPropertyImages();
    }
  }, [propertyId, fetchPropertyImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: allowedMimeTypes,
    maxFiles,
    maxSize: maxFileSize,
    onDrop: (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length === 0) return;
      if (fileRejections.length > 0) {
        const message =
          fileRejections[0].errors[0].code === "file-too-large"
            ? "Each file must be less than 5MB."
            : "Only JPEG, PNG, and GIF images are allowed.";
        addMessage("error", message);
        return;
      }
      setFiles((prev) => [...prev, ...acceptedFiles]);
      setAltTexts((prev) => [...prev, ...acceptedFiles.map(() => "")]);
    },
  });

  const handleAltTextChange = (index, value) => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value.slice(0, 255);
    setAltTexts(newAltTexts);
  };

  const handleExistingAltTextChange = (index, value) => {
    const newExisting = [...existingImages];
    newExisting[index].altText = value.slice(0, 255);
    setExistingImages(newExisting);
  };

  const handleReplaceImage = (index, file) => {
    if (!file) return;
    if (file.size > maxFileSize) {
      addMessage("error", "File must be less than 5MB.");
      return;
    }
    if (!Object.keys(allowedMimeTypes).includes(file.type)) {
      addMessage("error", "Only JPEG, PNG, and GIF images are allowed.");
      return;
    }
    const newExisting = [...existingImages];
    newExisting[index].file = file;
    setExistingImages(newExisting);
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setAltTexts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container my-4">
      <h3 className="mb-4">
        {isEditMode ? "Update Images" : "Upload Images"} for {""}
        {propertyTitle}
      </h3>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3">Existing Images</h4>
          <div className="row g-3">
            {existingImages.map((img, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div className="card shadow-sm position-relative">
                  <img
                    src={img.file ? URL.createObjectURL(img.file) : img.url}
                    alt={img.altText || "Existing image"}
                    className="card-img-top img-fluid"
                    style={{ height: "150px", objectFit: "cover" }}
                  />

                  {/* Replace + Delete icons */}
                  <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
                    {/* Replace */}
                    <label
                      className="p-1 d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        borderRadius: "50%",
                        background: "white",
                        cursor: "pointer",
                      }}
                      title="Replace Image"
                    >
                      <RefreshCw size={18} />
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          handleReplaceImage(index, e.target.files[0])
                        }
                      />
                    </label>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDeleteImage?.(img.id)}
                      className="p-1 d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        borderRadius: "50%",
                        background: "white",
                        cursor: "pointer",
                      }}
                      title="Delete Image"
                    >
                      <Trash2 size={18} color="red" />
                    </button>
                  </div>

                  <div className="card-body p-2">
                    <input
                      type="text"
                      placeholder="Image title"
                      value={img.altText}
                      onChange={(e) =>
                        handleExistingAltTextChange(index, e.target.value)
                      }
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dropzone for new images */}
      <div className="card mb-4 shadow-sm">
        <div
          {...getRootProps()}
          className={`card-body text-center p-4 border border-2 border-dashed rounded-3 ${
            isDragActive ? "border-primary bg-light" : "border-secondary"
          }`}
        >
          <input {...getInputProps()} />
          <i className="bi bi-cloud-upload fs-3 text-primary"></i>
          <p className="mb-0">
            {isDragActive
              ? "Drop the images here..."
              : "Drag & Drop Images Here or Click to Upload"}
          </p>
          {!isDragActive && (
            <small className="text-muted">
              Supports JPEG, PNG, GIF (Max 5MB, up to 10 images)
            </small>
          )}
        </div>
      </div>

      {/* New Uploaded Images */}
      {files.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3">New Uploaded Images</h4>
          <div className="row g-3">
            {files.map((file, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div className="card shadow-sm position-relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={altTexts[index] || file.name}
                    className="card-img-top img-fluid"
                    style={{ height: "150px", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    title="Remove image"
                    className="p-1 shadow-sm position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center"
                    style={{
                      borderRadius: "50%",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <X size={18} color="red" />
                  </button>
                  <div className="card-body p-2">
                    <input
                      type="text"
                      placeholder="Image title"
                      value={altTexts[index]}
                      onChange={(e) =>
                        handleAltTextChange(index, e.target.value)
                      }
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-3">
        <button
          type="button"
          className="btn btn-primary fw-medium px-4"
          onClick={onSubmit}
        >
          {isEditMode ? "Update Images" : "Submit Images"}
        </button>
        <button
          type="button"
          className="btn btn-dark fw-medium px-4"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImagesUploadForm;
