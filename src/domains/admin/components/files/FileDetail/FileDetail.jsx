import React from "react";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const FileDetail = ({ file, onBack }) => {
  if (!file) return null;

  const fileType = file.file_type?.toLowerCase();
  const fileUrl = file.file_url;

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType);

  // Robust check: checks file_type OR if the URL ends/contains .pdf
  const isPDF = fileType === "pdf" || fileUrl?.toLowerCase().includes(".pdf");

  //   https://res.cloudinary.com/drbwjh79j/raw/upload/v1773218396/test.pdf

  // Helper to generate the preview URL
  // We use Google Docs viewer as a proxy to ensure the PDF renders instead of downloading
  const getPdfPreviewUrl = (url) => {
    return `https://docs.google.com{encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Header with Back Button */}\
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>File Preview</h3>
        <BackButton onClick={onBack} />
      </div>
      {/* Preview Container */}
      <div
        className="bg-white rounded-4 shadow-sm border overflow-hidden d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh", position: "relative" }}
      >
        {isImage ? (
          <img
            src={fileUrl}
            alt={file.file_name}
            className="img-fluid"
            style={{ maxHeight: "80vh", objectFit: "contain" }}
          />
        ) : isPDF ? (
          <iframe
            src={getPdfPreviewUrl(fileUrl)}
            title={file.file_name}
            width="100%"
            height="700px"
            style={{ border: "none", backgroundColor: "#f8f9fa" }}
          />
        ) : (
          <div className="text-center p-5">
            <div className="mb-3">
              <i
                className="bi bi-file-earmark-arrow-down"
                style={{ fontSize: "4rem", color: "var(--maincolor)" }}
              ></i>
            </div>
            <h5>Preview not available for this file type</h5>
            <p className="text-muted">
              Please download the file to view its content.
            </p>
            <a
              href={fileUrl}
              className="btn btn-main text-white"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetail;
