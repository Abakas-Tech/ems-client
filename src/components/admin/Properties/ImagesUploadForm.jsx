import React from "react";
import { useDropzone } from "react-dropzone";
import { FaTimes } from "react-icons/fa";

const ImagesUploadForm = ({
  propertyId,
  files,
  setFiles,
  altTexts,
  setAltTexts,
  onSubmit,
  onCancel,
  isSubmitting,
  setError,
}) => {
  const maxFiles = 10;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = {
    "image/jpeg": [],
    "image/png": [],
    "image/gif": [],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: allowedMimeTypes,
    maxFiles,
    maxSize: maxFileSize,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const message =
          fileRejections[0].errors[0].code === "file-too-large"
            ? "Each file must be less than 5MB."
            : "Only JPEG, PNG, and GIF images are allowed.";
        setError(message);
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

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setAltTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const result = await onSubmit();
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div>
      {/* Gallery */}
      <div className="form-submit">
        <h3>Upload Images for Property #{propertyId}</h3>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-12">
              <label>Upload Gallery</label>
              <div
                {...getRootProps()}
                className="dropzone dz-clickable primary-dropzone"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className="dz-default dz-message">
                    <span>Drop the images here...</span>
                  </div>
                ) : (
                  <div className="dz-default dz-message">
                    <i className="bi bi-cloud-plus-fill text-main"></i>
                    <span>Drag & Drop Images Here</span>
                  </div>
                )}
              </div>
              {files.length > 0 && (
                <div className="mt-3">
                  <h4>Uploaded Images</h4>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center mb-2 gap-2"
                    >
                      <span className="me-2">{file.name}</span>
                      <input
                        type="text"
                        placeholder="Alt text (optional)"
                        value={altTexts[index]}
                        onChange={(e) =>
                          handleAltTextChange(index, e.target.value)
                        }
                        className="form-control flex-grow-1"
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveImage(index)}
                        title="Remove image"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-group col-lg-12 col-md-12 d-flex gap-3">
        <button
          type="button"
          className="btn btn-main fw-medium px-5"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Images"}
        </button>
        <button
          type="button"
          className="btn btn-secondary fw-medium px-5"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImagesUploadForm;
