import React, { useState, useEffect } from "react";
import { fetchWorkerDossier, deleteFile } from "../../../api/file.api";
import FileUpload from "../FileUpload/FileUpload";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

const WorkerDossier = ({ workerId, onBack }) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [dossier, setDossier] = useState(null);
  const [activeTab, setActiveTab] = useState("core"); // "core" | "misc"
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (workerId) {
      loadDossier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const loadDossier = async () => {
    showLoader();
    try {
      const res = await fetchWorkerDossier(workerId);
      setDossier(res.data);
    } catch (err) {
      addMessage(false, "Failed to load worker dossier");
      onBack(); // go back if it fails
    } finally {
      hideLoader();
    }
  };

  const handleDeleteMiscFile = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteFile(id);
          addMessage(true, "File deleted successfully!");
          loadDossier(); // Refresh list
        } catch (err) {
          addMessage(false, err.message);
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

  const handleDownload = async (file) => {
    if (!file.file_url) return;
    window.open(file.file_url, "_blank");
  };

  // If we are uploading a new misc file, reuse your FileUpload component
  if (showUpload) {
    return (
      <div className="card border-0 shadow-sm p-4">
        <FileUpload
          isEditMode={false}
          workerId={workerId} // Auto-injects worker ID!
          onSuccess={async () => {
            setShowUpload(false);
            addMessage(true, "File uploaded successfully!");
            await loadDossier(); // refresh data
          }}
          onCancel={() => setShowUpload(false)}
        />
      </div>
    );
  }

  if (!dossier) return null; // loading state handled by global loader

  const { worker, core_slots, misc_files } = dossier;

  const checkIsImage = (url) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  };
  return (
    <div>
      {/* 1. Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4">
        <div>
          <BackButton onClick={onBack} />
          <div className="d-flex align-items-center mt-3">
            <div
              className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-person-fill text-muted fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold text-dark mb-1">{worker.full_name}</h3>
              <div className="d-flex gap-2 flex-wrap">
                {worker.labour_id && (
                  <Badge
                    content={worker.labour_id}
                    color="info"
                    icon="bi-person-badge"
                  />
                )}
                {worker.passport_number && (
                  <Badge
                    content={worker.passport_number}
                    color="secondary"
                    icon="bi-journal-bookmark"
                  />
                )}
                {worker.national_id_number && (
                  <Badge
                    content={`Nat ID: ${worker.national_id_number}`}
                    color="warning"
                    icon="bi-card-heading"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === "core" ? "active" : "text-muted"}`}
            onClick={() => setActiveTab("core")}
          >
            <i className="bi bi-shield-check me-2"></i>
            Core Documents
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === "misc" ? "active" : "text-muted"}`}
            onClick={() => setActiveTab("misc")}
          >
            <i className="bi bi-archive me-2"></i>
            Additional Files ({misc_files.length})
          </button>
        </li>
      </ul>

      {/* 3. Tab Content: CORE DOCUMENTS */}
      {activeTab === "core" && (
        <div className="row g-4">
          {[
            {
              key: "standing_photo",
              label: "Standing Photo",
              icon: "bi-person-bounding-box",
            },
            {
              key: "passport_scan",
              label: "Passport Scan",
              icon: "bi-journal-text",
            },
            {
              key: "guarantor_id",
              label: "Guarantor ID",
              icon: "bi-person-vcard",
            },
            {
              key: "national_id",
              label: "National ID",
              icon: "bi-card-checklist",
            },
            {
              key: "cv",
              label: "Curriculum Vitae",
              icon: "bi-file-earmark-text",
            },
          ].map((slot) => {
            const data = core_slots[slot.key];
            const isUploaded = !!(data && data.url);

            return (
              <div className="col-md-6 col-lg-3" key={slot.key}>
                <div
                  className={`card h-100 border-0 shadow-sm ${isUploaded ? "" : "bg-light"}`}
                  style={{ borderRadius: "12px" }}
                >
                  <div className="card-body text-center d-flex flex-column justify-content-center p-4">
                    {/* Check if file is uploaded and also its image or not */}

                    {isUploaded && checkIsImage(data.url) ? (
                      <img
                        src={data.url}
                        alt={slot.label}
                        className="mb-3"
                        style={{
                          width: "100px",
                          height: "120px",
                          objectFit: "cover",
                          alignSelf: "center",
                        }}
                      />
                    ) : (
                      <i
                        className={`bi ${slot.icon} display-4 mb-3 ${isUploaded ? "text-success" : "text-muted"}`}
                      ></i>
                    )}
                    <h6 className="fw-bold mb-2">{slot.label}</h6>

                    {isUploaded ? (
                      <>
                        <button
                          className="btn btn-outline-primary btn-sm w-100 mt-auto"
                          onClick={() => window.open(data.url, "_blank")}
                        >
                          <i className="bi bi-eye me-1"></i> View File
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline-secondary w-100 mt-auto"
                          disabled
                        >
                          Upload via Profile
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Tab Content: ADDITIONAL FILES */}
      {activeTab === "misc" && (
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "12px" }}
        >
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <h5 className="fw-bold mb-0">Worker Files</h5>
              <button
                className="btn btn-main btn-sm"
                onClick={() => setShowUpload(true)}
              >
                <i className="bi bi-plus-lg me-1"></i> Upload File
              </button>
            </div>

            <ListingComponent
              data={misc_files}
              columns={[
                { header: "Name", accessor: "file_name" },
                { header: "Category", accessor: "category" },
                { header: "Type", accessor: "file_type" },
                {
                  header: "Uploaded",
                  render: (row) =>
                    new Date(row.created_at).toLocaleDateString(),
                },
              ]}
              actions={[
                { type: "view", onClick: (row) => handleDownload(row) },
                {
                  type: "delete",
                  onClick: (row) => handleDeleteMiscFile(row.id),
                  bypassRole: true,
                },
              ]}
              emptyState={{
                title: "No additional files found",
                subtitle:
                  "Click 'Upload File' to add contracts, CVs, or reports for this worker.",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDossier;
