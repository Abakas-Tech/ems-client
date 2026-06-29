import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./FileSearch.module.css";
import { fetchFiles, uploadFile, deleteFile } from "../../../api/file.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";

// ─── helpers ──────────────────────────────────────────────────────────────────

const FILE_ICONS = {
  pdf: "bi-file-earmark-pdf",
  txt: "bi-file-earmark-text",
  doc: "bi-file-earmark-word",
  docx: "bi-file-earmark-word",
  csv: "bi-file-earmark-spreadsheet",
  json: "bi-file-earmark-code",
  md: "bi-markdown",
  default: "bi-file-earmark",
};

function getIcon(fileType = "") {
  return FILE_ICONS[fileType.toLowerCase()] ?? FILE_ICONS.default;
}

function getIconColor(fileType = "") {
  const colors = {
    pdf: "text-danger",
    doc: "text-primary",
    docx: "text-primary",
    csv: "text-success",
    json: "text-warning",
    md: "text-secondary",
    txt: "text-info",
  };
  return colors[fileType.toLowerCase()] ?? "text-info";
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FileSearch = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [files, setFiles] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Fetch on mount ──
  const loadFiles = useCallback(async () => {
    showLoader();
    try {
      const response = await fetchFiles({ category: "Manual", limit: 100 });
      setFiles(response?.data?.files || []);
    } catch (err) {
      addMessage(false, err.message || "Failed to load files.");
    } finally {
      hideLoader();
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // ── Pick file → show modal ──
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowUploadModal(true);
    e.target.value = "";
  };

  // ── Confirm upload ──
  const handleConfirmUpload = async (inputValues) => {
    if (!pendingFile) return;

    const title = inputValues.title?.trim();

    const duplicate = files.some(
      (f) => f.file_name.toLowerCase() === title.toLowerCase(),
    );
    if (duplicate) {
      addMessage(false, "A file with this name already exists.");
      return;
    }

    setUploading(true);
    showLoader();
    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("file_name", title);
      formData.append("category", "Manual");
      formData.append("description", "");
      formData.append("is_private", "0");

      const response = await uploadFile(formData);
      addMessage(
        response.success,
        response.Message || "File uploaded successfully!",
      );
      setShowUploadModal(false);
      setPendingFile(null);
      await loadFiles();
    } catch (err) {
      addMessage(false, err.message || "Upload failed.");
    } finally {
      setUploading(false);
      hideLoader();
    }
  };

  // ── Delete ──
  const handleDelete = (file) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteFile(file.id);
          addMessage(response.success, response.Message || "File deleted!");
          setFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err) {
          addMessage(false, err.message || "Delete failed.");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this file?",
        confirmText: "Delete",
      },
    );
  };

  // ── Upload modal fields ──
 const uploadFields = [
   {
     name: "title",
     label: "File Title",
     type: "custom",
     initialValue: pendingFile?.name.replace(/\.[^.]+$/, "") ?? "",
   },
 ];

  const renderCustomField = (field, inputValues, handleChange) => (
    <>
      {pendingFile && (
        <p className="text-muted small mb-2">
          <i
            className={`bi ${getIcon(pendingFile.name.split(".").pop())} me-1 ${getIconColor(pendingFile.name.split(".").pop())}`}
          />
          {pendingFile.name}
        </p>
      )}
      <input
        type="text"
        className="form-control"
        value={inputValues[field.name] || ""}
        onChange={(e) => handleChange(field.name, e.target.value)}
        placeholder="Give this file a title…"
        required
        style={{ backgroundColor: "#EDF1FB" }}
      />
    </>
  );

  return (
    <div className="dashboard-wraper">
      <CreateModal
        show={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setPendingFile(null);
        }}
        onCreate={handleConfirmUpload}
        fields={uploadFields}
        title="Upload File"
        btnLabel={uploading ? "Uploading…" : "Upload"}
        renderCustomField={renderCustomField}
      />

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-2">Documents</h2>
          <p className="text-muted mb-0">
            Upload and access your files. Click a card to open.
          </p>
        </div>

        {files.length > 0 && (
          <button
            className={`btn btn-info text-white d-flex align-items-center gap-2 ${styles.uploadBtn}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-upload" />
            Upload File
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
          className="d-none"
          onChange={handleFilePicked}
        />
      </div>

      {/* Empty state */}
      {files.length === 0 && (
        <div className={styles.emptyState}>
          <i className="bi bi-folder2-open fs-1 text-muted mb-3 d-block" />
          <p className="text-muted">No files yet. Upload one to get started.</p>
          <button
            className="btn btn-outline-info mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-upload me-2" />
            Upload your first file
          </button>
        </div>
      )}

      {/* File cards */}
      {files.length > 0 && (
        <div className="row g-3">
          {files.map((file) => (
            <div key={file.id} className="col-12 col-md-6 col-lg-4">
              <div
                className={`w-100 p-4 border rounded-4 bg-white ${styles.fileCard}`}
              >
                <div className="d-flex align-items-center">
                  {/* Clickable area → opens in new tab */}
                  <div
                    className="d-flex align-items-center overflow-hidden flex-grow-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => window.open(file.file_url, "_blank")}
                  >
                    <i
                      className={`bi ${getIcon(file.file_type)} fs-3 me-3 flex-shrink-0 ${getIconColor(file.file_type)}`}
                    />
                    <div className="overflow-hidden">
                      <h6 className="mb-1 fw-bold text-truncate">
                        {file.file_name}
                      </h6>
                      <small className="text-muted">
                        {file.file_type?.toUpperCase()}
                      </small>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    className={`btn btn-link text-danger p-0 ms-3 flex-shrink-0 ${styles.removeBtn}`}
                    onClick={() => handleDelete(file)}
                    title="Delete file"
                  >
                    <i className="bi bi-trash3 fs-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSearch;
