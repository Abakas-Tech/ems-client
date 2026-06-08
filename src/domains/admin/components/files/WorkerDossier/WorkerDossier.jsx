import React, { useState, useEffect, useMemo } from "react";
import {
  fetchWorkerDossier,
  uploadFile,
  updateFile,
  deleteFile,
} from "../../../api/file.api";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import FileUpload from "../FileUpload/FileUpload";
import FileFilters from "../FileFilters/FileFilters";

// ─────────────────────────────────────────────────────────────────
// SECTION A — Core Documents Grid
// ─────────────────────────────────────────────────────────────────
const CORE_SLOTS = [
  {
    key: "standing_photo",
    label: "Standing Photo",
    icon: "bi-person-bounding-box",
  },
  { key: "passport_scan", label: "Passport Scan", icon: "bi-passport" },
  { key: "guarantor_id", label: "Guarantor ID", icon: "bi-person-vcard" },
  { key: "national_id", label: "National ID", icon: "bi-credit-card-2-front" },
  { key: "cv", label: "Curriculum Vitae", icon: "bi-file-earmark-text" },
];

const CoreSlotsGrid = ({ coreSlots = {} }) => {
  const checkIsImage = (url) => url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div className="row g-3">
      {CORE_SLOTS.map((slot) => {
        const data = coreSlots[slot.key];
        const hasFile = !!data?.url;
        const isImage = hasFile && checkIsImage(data.url);

        return (
          <div key={slot.key} className="col-6 col-lg-3">
            <div
              className="card h-100 border-0"
              style={{
                borderRadius: "12px",
                boxShadow: hasFile
                  ? "0 2px 12px rgba(16,185,129,0.10)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "3px",
                  background: hasFile
                    ? "linear-gradient(90deg,#10b981,#34d399)"
                    : "linear-gradient(90deg,#e2e8f0,#cbd5e1)",
                }}
              />
              <div className="card-body p-3 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: hasFile ? "#d1fae5" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`bi ${slot.icon}`}
                        style={{
                          fontSize: "14px",
                          color: hasFile ? "#10b981" : "#94a3b8",
                        }}
                      />
                    </span>
                    <span
                      className="fw-semibold"
                      style={{ fontSize: "12px", lineHeight: 1.3 }}
                    >
                      {slot.label}
                    </span>
                  </div>
                  {hasFile ? (
                    <span
                      style={{
                        fontSize: "10px",
                        background: "#d1fae5",
                        color: "#065f46",
                        padding: "1px 7px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      ✓ OK
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "10px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "1px 7px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      Missing
                    </span>
                  )}
                </div>
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#f8fafc",
                    border: hasFile
                      ? "1px solid #e2e8f0"
                      : "1px dashed #e2e8f0",
                    minHeight: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {hasFile && isImage ? (
                    <img
                      src={data.url}
                      alt={slot.label}
                      style={{
                        width: "100%",
                        maxHeight: "110px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : hasFile ? (
                    <div className="text-center py-3">
                      <i
                        className="bi bi-file-earmark-text"
                        style={{ fontSize: "32px", color: "#64748b" }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        Document file
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <i
                        className="bi bi-file-earmark-x"
                        style={{ fontSize: "28px", color: "#cbd5e1" }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          marginTop: "4px",
                        }}
                      >
                        Not uploaded
                      </div>
                    </div>
                  )}
                </div>
                {hasFile ? (
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary w-100"
                    style={{ fontSize: "11px", borderRadius: "6px" }}
                  >
                    <i className="bi bi-eye me-1" />
                    View
                  </a>
                ) : (
                  <button
                    className="btn btn-sm btn-light w-100"
                    disabled
                    style={{
                      fontSize: "11px",
                      borderRadius: "6px",
                      color: "#94a3b8",
                    }}
                  >
                    Upload via Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// SECTION B — Additional Files with Filters, Upload & Edit
// ─────────────────────────────────────────────────────────────────
const MiscFilesSection = ({
  workerId,
  miscFiles = [],
  onRefresh,
  showUploadForm,
  setShowUploadForm,
  editingFile,
  setEditingFile,
}) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  // Filters
  const [filters, setFilters] = useState({
    fileName: "",
    category: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ fileName: "", category: "" });
  };

  const filteredFiles = useMemo(() => {
    return miscFiles.filter((file) => {
      const matchesName = file.file_name
        .toLowerCase()
        .includes(filters.fileName.toLowerCase());
      const matchesCategory =
        filters.category === "" || file.category === filters.category;
      return matchesName && matchesCategory;
    });
  }, [miscFiles, filters]);

  // Upload: receive form data payload, call uploadFile API
  const handleUploadSuccess = async (payload) => {
    showLoader();
    try {
      const fd = new FormData();
      if (payload.file) fd.append("file", payload.file);
      fd.append("file_name", payload.file_name);
      fd.append("category", payload.category);
      if (payload.description) fd.append("description", payload.description);
      fd.append("is_private", payload.is_private ?? 0);
      fd.append("worker_id", workerId); // always use the dossier's worker

      const res = await uploadFile(fd);
      if (res?.success) {
        addMessage(true, res.message || "File uploaded successfully");
        setShowUploadForm(false);
        onRefresh();
      } else {
        addMessage(false, res?.message || "Upload failed");
      }
    } catch (err) {
      addMessage(false, err.message || "Upload failed");
    } finally {
      hideLoader();
    }
  };

  // Edit: receive form data payload, call updateFile API
  const handleEditSuccess = async (payload) => {
    showLoader();
    try {
      // The edit mode does not include a file input, so payload is a plain metadata object
      const res = await updateFile(editingFile.id, payload);
      if (res?.success) {
        addMessage(true, res.message || "File updated successfully");
        setEditingFile(null);
        onRefresh();
      } else {
        addMessage(false, res?.message || "Update failed");
      }
    } catch (err) {
      addMessage(false, err.message || "Update failed");
    } finally {
      hideLoader();
    }
  };

  const handleDownload = (file) => {
    if (!file?.file_url) return;
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name || "download";
    link.target = "_blank";
    link.click();
  };

  const handleDelete = (file) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteFile(file.id);
          addMessage(true, "File deleted");
          onRefresh();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: `Are you sure you want to delete this file?`,
        confirmText: "Delete",
      },
    );
  };

  const FILE_ICON = (type) => {
    if (!type) return "bi-file-earmark";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(type))
      return "bi-file-earmark-image";
    if (type === "pdf") return "bi-file-earmark-pdf";
    if (["doc", "docx"].includes(type)) return "bi-file-earmark-word";
    return "bi-file-earmark";
  };

  // Render conditional views
  if (showUploadForm) {
    return (
      <div
        className="card border-0 shadow-sm p-4"
        style={{ borderRadius: "12px" }}
      >
        <FileUpload
          isEditMode={false}
          workerId={workerId}
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      </div>
    );
  }

  if (editingFile) {
    return (
      <div
        className="card border-0 shadow-sm p-4"
        style={{ borderRadius: "12px" }}
      >
        <FileUpload
          isEditMode={true}
          initialData={editingFile}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingFile(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <FileFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {filteredFiles.length === 0 ? (
        <div
          className="text-center py-4"
          style={{ color: "#94a3b8", fontSize: "13px" }}
        >
          <i
            className="bi bi-folder2 d-block mb-1"
            style={{ fontSize: "28px" }}
          />
          No matching files found
        </div>
      ) : (
        <ListingComponent
          data={filteredFiles}
          columns={[
            {
              header: "File Name",
              accessor: "file_name",
              render: (row) => (
                <div className="d-flex align-items-center gap-2">
                  <i
                    className={`bi ${FILE_ICON(row.file_type)}`}
                    style={{
                      fontSize: "20px",
                      color:
                        row.file_type === "pdf"
                          ? "#ef4444"
                          : ["doc", "docx"].includes(row.file_type)
                            ? "#3b82f6"
                            : "#10b981",
                    }}
                  />
                  <span className="fw-semibold" style={{ fontSize: "13px" }}>
                    {row.file_name}
                  </span>
                </div>
              ),
            },
            {
              header: "Category",
              accessor: "category",
              render: (row) => (
                <Badge
                  content={row.category}
                  color="secondary"
                  className="rounded-pill"
                />
              ),
            },
            { header: "Type", accessor: "file_type" },
            {
              header: "Uploaded",
              render: (row) =>
                new Date(row.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
            },
          ]}
          actions={[
            {
              type: "view",
              onClick: (row) => window.open(row.file_url, "_blank"),
            },
            {
              type: "edit",
              onClick: (row) => setEditingFile(row),
              bypassRole: true,
            },
            {
              type: "download",
              onClick: (row) => handleDownload(row),
            },
            {
              type: "delete",
              onClick: (row) => handleDelete(row),
              bypassRole: true,
            },
          ]}
          emptyState={{
            title: "No files found",
            subtitle: "Try adjusting your filters or upload a new file.",
          }}
          pagination={{
            page: 1,
            limit: 10,
            total: filteredFiles.length,
            onPageChange: () => {},
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// MAIN WorkerDossier
// ─────────────────────────────────────────────────────────────────
const WorkerDossier = ({ workerId, onBack }) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const [dossier, setDossier] = useState(null);

  // Lifted state for upload and edit visibility
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    if (workerId) loadDossier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const loadDossier = async () => {
    showLoader();
    try {
      const res = await fetchWorkerDossier(workerId);
      setDossier(res.data);
    } catch {
      addMessage(false, "Failed to load worker dossier");
      onBack();
    } finally {
      hideLoader();
    }
  };

  if (!dossier) return null;

  const { worker, core_slots, misc_files } = dossier;
  const filled = Object.values(core_slots).filter(Boolean).length;

  return (
    <div>
      {/* Worker Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <BackButton onClick={onBack} />
          <div>
            <h4 className="fw-bold text-dark mb-2">{worker.full_name}</h4>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              {worker.passport_number && (
                <span
                  style={{
                    fontSize: "12px",
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontWeight: 500,
                  }}
                >
                  <i className="bi bi-passport me-1" />
                  {worker.passport_number}
                </span>
              )}
              {worker.labour_id && (
                <span
                  style={{
                    fontSize: "12px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontWeight: 500,
                  }}
                >
                  <i className="bi bi-person-badge me-1" />
                  {worker.labour_id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Core Legal Documents */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <span
            style={{
              width: "3px",
              height: "20px",
              background: "var(--maincolor)",
              borderRadius: "2px",
              display: "inline-block",
            }}
          />
          <h5 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
            Core Legal Documents
          </h5>
        </div>
        <CoreSlotsGrid coreSlots={core_slots} />
      </div>

      <hr style={{ borderColor: "#f1f5f9", margin: "28px 0" }} />

      {/* Additional Files with header including upload button */}
      <div>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: "3px",
                  height: "20px",
                  background: "#f59e0b",
                  borderRadius: "2px",
                  display: "inline-block",
                }}
              />
              <h4 className="fw-bold text-dark mb-2">Additional Files</h4>
              {misc_files.length > 0 && (
                <span
                  style={{
                    fontSize: "11px",
                    background: "#fef9c3",
                    color: "#92400e",
                    padding: "1px 8px",
                    borderRadius: "20px",
                    fontWeight: 600,
                  }}
                >
                  {misc_files.length} file{misc_files.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-muted mb-0 " style={{ fontSize: "15px" }}>
              Manage contracts, reports and other documents for this worker.
            </p>
          </div>
          <button
            className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload File
          </button>
        </div>
        <MiscFilesSection
          workerId={workerId}
          miscFiles={misc_files}
          onRefresh={loadDossier}
          showUploadForm={showUploadForm}
          setShowUploadForm={setShowUploadForm}
          editingFile={editingFile}
          setEditingFile={setEditingFile}
        />
      </div>
    </div>
  );
};

export default WorkerDossier;
