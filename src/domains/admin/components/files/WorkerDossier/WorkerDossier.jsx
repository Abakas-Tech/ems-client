import React, { useEffect, useMemo, useState } from "react";

import {
  fetchWorkerDossier,
  fetchFiles,
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
import CvSelection from "../CvSelection/CvSelection";
import useProfile from "../../../../../context/Profile/useProfile";

/* ─────────────────────────────────────────────────────────────────
 * Section A — Core documents grid
 * ───────────────────────────────────────────────────────────────── */

const CORE_SLOTS = [
  {
    key: "standing_photo",
    label: "Standing Photo",
    icon: "bi-person-bounding-box",
  },
  {
    key: "passport_scan",
    label: "Passport Scan",
    icon: "bi-passport",
  },
  {
    key: "guarantor_id",
    label: "Guarantor ID",
    icon: "bi-person-vcard",
  },
  {
    key: "national_id",
    label: "National ID",
    icon: "bi-credit-card-2-front",
  },
  {
    key: "cv",
    label: "Curriculum Vitae",
    icon: "bi-file-earmark-text",
  },
];

const idsMatch = (firstId, secondId) => {
  if (firstId == null || secondId == null) return false;

  return String(firstId) === String(secondId);
};

const canProfileSeeCv = (cv, profile) => {
  if (!cv || !profile) return false;

  const isPartner = Number(profile.role_id) === 3;

  // Admins and internal employees can see every CV returned by the API.
  if (!isPartner) return true;

  const profilePartnerId =
    profile.partner_id ?? profile.partner?.id ?? profile.partnerId ?? null;

  if (profilePartnerId != null) {
    return idsMatch(cv.partner_id, profilePartnerId);
  }

  const profileUserId = profile.id ?? profile.user_id ?? null;

  return idsMatch(cv.partner_user_id, profileUserId);
};

const CoreSlotsGrid = ({ coreSlots = {}, onCvClick }) => {
  const checkIsImage = (url) =>
    Boolean(url && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url));

  const generatedCvs = Array.isArray(coreSlots.generated_cvs)
    ? coreSlots.generated_cvs
    : [];
  return (
    <div className="row g-3">
      {CORE_SLOTS.map((slot) => {
        const isCvSlot = slot.key === "cv";

        const data = isCvSlot
          ? generatedCvs[0] || null
          : coreSlots[slot.key] || null;

        const hasFile = isCvSlot ? generatedCvs.length > 0 : Boolean(data?.url);

        const isImage = hasFile && !isCvSlot && checkIsImage(data?.url);

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
                        {isCvSlot
                          ? `${generatedCvs.length} generated ${
                              generatedCvs.length === 1 ? "CV" : "CVs"
                            }`
                          : "Document file"}
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

                {isCvSlot ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    style={{
                      fontSize: "11px",
                      borderRadius: "6px",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onCvClick?.();
                    }}
                  >
                    <i className="bi bi-eye me-1" />

                    {generatedCvs.length > 0
                      ? `View CVs (${generatedCvs.length})`
                      : "Select CV"}
                  </button>
                ) : hasFile ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    style={{
                      fontSize: "11px",
                      borderRadius: "6px",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(data.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <i className="bi bi-eye me-1" />
                    View File
                  </button>
                ) : (
                  <button
                    type="button"
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

/* ─────────────────────────────────────────────────────────────────
 * Section B — Additional files with filters, upload and edit
 * ───────────────────────────────────────────────────────────────── */

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
  const { profile } = useProfile();

  const loggedInUserId = profile?.id ?? profile?.user_id ?? null;
  const admin = Number(profile?.role_id) === 1;

  const [filesData, setFilesData] = useState({
    files: Array.isArray(miscFiles) ? miscFiles : [],
    total: Array.isArray(miscFiles) ? miscFiles.length : 0,
    pagination: {},
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    fileName: "",
    category: "",
    file_type: "",
  });

  useEffect(() => {
    fetchWorkerMiscFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId, filters]);

  const fetchWorkerMiscFiles = async () => {
    if (!workerId) return;

    showLoader();

    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.fileName,
        category: filters.category,
        file_type: filters.file_type,
        worker_id: workerId,
        exclude_category: ["CV_ONE", "CV_TWO", "CV_THREE"],
      };

      const response = await fetchFiles(params);

      setFilesData({
        files: response?.data?.files || [],
        total: response?.data?.pagination?.total || 0,
        pagination: response?.data?.pagination || {},
      });
    } catch (error) {
      console.error("Failed to fetch worker files:", error);
      addMessage(false, "Failed to load worker files");
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 5,
      fileName: "",
      category: "",
      file_type: "",
    });
  };

  const handleUploadSuccess = async (payload) => {
    showLoader();

    try {
      const formData = new FormData();

      if (payload.file) {
        formData.append("file", payload.file);
      }

      formData.append("file_name", payload.file_name);
      formData.append("category", payload.category);
      formData.append("description", payload.description || "");
      formData.append("is_private", payload.is_private ?? 0);
      formData.append("worker_id", workerId);

      const response = await uploadFile(formData);

      if (response?.success) {
        addMessage(true, response.message || "File uploaded successfully");

        setShowUploadForm(false);

        await fetchWorkerMiscFiles();
        if (onRefresh) await onRefresh();
      } else {
        addMessage(false, response?.message || "Upload failed");
      }
    } catch (error) {
      addMessage(false, error.message || "Upload failed");
    } finally {
      hideLoader();
    }
  };

  const handleEditSuccess = async (payload) => {
    if (!editingFile?.id) return;

    showLoader();

    try {
      const cleanPayload = {
        file_name: payload.file_name,
        category: payload.category,
        description: payload.description || "",
        is_private: payload.is_private ?? 0,
        worker_id: workerId,
      };

      const response = await updateFile(editingFile.id, cleanPayload);

      if (response?.success) {
        addMessage(true, response.message || "File updated successfully");

        setEditingFile(null);

        await fetchWorkerMiscFiles();
        if (onRefresh) await onRefresh();
      } else {
        addMessage(false, response?.message || "Update failed");
      }
    } catch (error) {
      addMessage(false, error.message || "Update failed");
    } finally {
      hideLoader();
    }
  };

  const handleDownload = async (file) => {
    if (!file?.file_url) return;

    try {
      const response = await fetch(file.file_url);

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = localUrl;
      link.download = file.file_name || "download";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(localUrl);
    } catch (error) {
      console.error("Download failed, falling back to open:", error);
      window.open(file.file_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = (file) => {
    if (!file?.id) return;

    openModal(
      async () => {
        showLoader();

        try {
          const response = await deleteFile(file.id);

          addMessage(
            response?.success ?? true,
            response?.message || "File deleted",
          );

          await fetchWorkerMiscFiles();
          if (onRefresh) await onRefresh();
        } catch (error) {
          addMessage(false, error.message || "Delete failed");
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

  const fileIcon = (type) => {
    const normalizedType = String(type || "").toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(normalizedType) ||
      normalizedType.startsWith("image/")
    ) {
      return "bi-file-earmark-image";
    }

    if (normalizedType === "pdf" || normalizedType.includes("pdf")) {
      return "bi-file-earmark-pdf";
    }

    if (
      ["doc", "docx"].includes(normalizedType) ||
      normalizedType.includes("word")
    ) {
      return "bi-file-earmark-word";
    }

    return "bi-file-earmark";
  };

  const fileIconColor = (type) => {
    const normalizedType = String(type || "").toLowerCase();

    if (normalizedType === "pdf" || normalizedType.includes("pdf")) {
      return "#ef4444";
    }

    if (
      ["doc", "docx"].includes(normalizedType) ||
      normalizedType.includes("word")
    ) {
      return "#3b82f6";
    }

    return "#10b981";
  };

  if (showUploadForm) {
    return (
      <div
        className="card border-0 shadow-sm p-4"
        style={{ borderRadius: "12px" }}
      >
        <FileUpload
          isEditMode={false}
          initialData={{ worker_id: workerId }}
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

      <ListingComponent
        data={filesData.files}
        columns={[
          {
            header: "File Name",
            accessor: "file_name",
            render: (row) => (
              <div className="d-flex align-items-center gap-2">
                <i
                  className={`bi ${fileIcon(row.file_type)}`}
                  style={{
                    fontSize: "20px",
                    color: fileIconColor(row.file_type),
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
          {
            header: "Type",
            accessor: "file_type",
          },
          {
            header: "Uploaded",
            render: (row) => {
              if (!row.created_at) return "—";

              return new Date(row.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            },
          },
        ]}
        actions={[
          {
            type: "view",
            onClick: (row) => {
              if (row.file_url) {
                window.open(row.file_url, "_blank", "noopener,noreferrer");
              }
            },
          },
          {
            type: "edit",
            onClick: (row) => setEditingFile(row),
            bypassRole: true,
            showOn: (row) => idsMatch(row.uploaded_by, loggedInUserId) || admin,
          },
          {
            type: "download",
            onClick: (row) => handleDownload(row),
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row),
            bypassRole: true,
            showOn: (row) => idsMatch(row.uploaded_by, loggedInUserId) || admin,
          },
        ]}
        emptyState={{
          title: "No files found",
          subtitle: "Try adjusting your filters or upload a new file.",
        }}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: filesData.total,
          onPageChange: (page) =>
            setFilters((previous) => ({
              ...previous,
              page,
            })),
        }}
        onPageChange={(page) =>
          setFilters((previous) => ({
            ...previous,
            page,
          }))
        }
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
 * Main WorkerDossier component
 * ───────────────────────────────────────────────────────────────── */

const WorkerDossier = ({ workerId, onBack }) => {
  const { profile } = useProfile();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [dossier, setDossier] = useState(null);
  const [showCvSelection, setShowCvSelection] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  /*
   * All hooks must run before any conditional return. The previous
   * component returned early before calling these useMemo hooks, which
   * broke React's Rules of Hooks and also referenced the variables before
   * they had been declared.
   */
  const visibleGeneratedCvs = useMemo(() => {
    const generatedCvs = dossier?.core_slots?.generated_cvs;

    if (!Array.isArray(generatedCvs) || !profile) {
      return [];
    }

    return generatedCvs.filter((cv) => canProfileSeeCv(cv, profile));
  }, [dossier, profile]);

  const visibleCoreSlots = useMemo(() => {
    if (!dossier?.core_slots) {
      return {};
    }

    return {
      ...dossier.core_slots,
      generated_cvs: visibleGeneratedCvs,
    };
  }, [dossier, visibleGeneratedCvs]);

  const latestVisibleCvByCategory = useMemo(
    () => ({
      CV_ONE:
        visibleGeneratedCvs.find((cv) => cv.category === "CV_ONE") || null,
      CV_TWO:
        visibleGeneratedCvs.find((cv) => cv.category === "CV_TWO") || null,
      CV_THREE:
        visibleGeneratedCvs.find((cv) => cv.category === "CV_THREE") || null,
    }),
    [visibleGeneratedCvs],
  );

  useEffect(() => {
    if (workerId) {
      loadDossier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const loadDossier = async () => {
    if (!workerId) return;

    showLoader();

    try {
      const response = await fetchWorkerDossier(workerId);

      /*
       * Supports these common API helper shapes:
       * 1. Axios response:       response.data.data
       * 2. Unwrapped API result: response.data
       * 3. Dossier object:       response
       */
      const payload = response?.data?.data ?? response?.data ?? response;

      if (!payload?.worker || !payload?.core_slots) {
        throw new Error("The worker dossier response has an invalid shape");
      }

      setDossier({
        ...payload,
        misc_files: Array.isArray(payload.misc_files) ? payload.misc_files : [],
        core_slots: {
          ...(payload.core_slots || {}),
          generated_cvs: Array.isArray(payload.core_slots?.generated_cvs)
            ? payload.core_slots.generated_cvs
            : [],
        },
      });
    } catch (error) {
      console.error("Failed to load worker dossier:", error);
      addMessage(
        false,
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load worker dossier",
      );

      onBack?.();
    } finally {
      hideLoader();
    }
  };

  if (!dossier) {
    return null;
  }

  if (showCvSelection) {
    return (
      <CvSelection
        workerId={workerId}
        worker={dossier.worker}
        generatedCvs={visibleGeneratedCvs}
        cvFileOne={latestVisibleCvByCategory.CV_ONE}
        cvFileTwo={latestVisibleCvByCategory.CV_TWO}
        cvFileThree={latestVisibleCvByCategory.CV_THREE}
        onBack={() => setShowCvSelection(false)}
      />
    );
  }

  const worker = dossier.worker || {};
  const miscFiles = Array.isArray(dossier.misc_files) ? dossier.misc_files : [];

  return (
    <div>
      {/* Worker header */}
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          {profile.role_id <= 2 && <BackButton onClick={onBack} />}

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

      {/* Core legal documents */}
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

        <CoreSlotsGrid
          coreSlots={visibleCoreSlots}
          onCvClick={() => setShowCvSelection(true)}
        />
      </div>

      <hr style={{ borderColor: "#f1f5f9", margin: "28px 0" }} />

      {/* Additional files */}
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

              {miscFiles.length > 0 && (
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
                  {miscFiles.length} file
                  {miscFiles.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
              Manage contracts, reports and other documents for this worker.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
            onClick={() => setShowUploadForm(true)}
          >
            Upload File
          </button>
        </div>

        <MiscFilesSection
          workerId={workerId}
          miscFiles={miscFiles}
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
