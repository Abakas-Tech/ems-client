import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WorkerFolderGrid from "./WorkerFolderGrid";
import FileUpload from "../FileUpload/FileUpload";
import FileFilters from "../FileFilters/FileFilters";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge";
import {
  fetchFiles,
  uploadFile,
  updateFile,
  deleteFile,
} from "../../../api/file.api";
import useProfile from "../../../../../context/Profile/useProfile";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import WorkerDossier from "../WorkerDossier/WorkerDossier";

const File = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  // State machine
  const [tab, setTab] = useState(location.state?.tab || "workers");
  const [view, setView] = useState(location.state?.view || "list");
  const [activeWorker, setActiveWorker] = useState(
    location.state?.workerId ? { id: location.state.workerId } : null,
  );

  // Company files state
  const [filesData, setFilesData] = useState({
    files: [],
    total: 0,
    pagination: {},
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    fileName: "",
    category: "",
    file_type: "",
  });
  const [editingFile, setEditingFile] = useState(null);

  // Handle navigation state from ActiveWorkers page
  useEffect(() => {
    if (location.state?.workerId) {
      setActiveWorker({ id: location.state.workerId });
      setView(location.state.view || "dossier");
    }
    // Clear location state after consuming
    navigate("/admin/files", { replace: true });
  }, [location.state, navigate]);

  // Fetch company files when tab = company and view = list
  useEffect(() => {
    if (tab === "company" && view === "list" && profile) {
      fetchCompanyFiles();
    }
  }, [tab, view, filters, profile]);

  const fetchCompanyFiles = async () => {
    if (!profile) return;
    showLoader();
    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        file_type: filters.file_type,
        category: filters.category,
        search: filters.fileName,
        scope: "company", // only worker_id IS NULL
      };
      const response = await fetchFiles(cleanFilters);
      setFilesData({
        files: response?.data?.files || [],
        total: response?.data?.pagination?.total || 0,
        pagination: response?.data?.pagination || {},
      });
    } catch (err) {
      console.error("Failed to fetch company files:", err);
    } finally {
      hideLoader();
    }
  };

  const handleSelectWorker = (workerId) => {
    setActiveWorker({ id: workerId });
    setView("dossier");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      fileName: "",
      category: "",
      file_type: "",
    });
  };

  const handleFormSubmit = async (formData) => {
    showLoader();
    try {
      let response;
      if (view === "edit") {
        response = await updateFile(editingFile.id, formData);
        addMessage(
          response.success,
          response.Message || "File updated successfully!",
        );
      } else {
        response = await uploadFile(formData);
        addMessage(
          response.success,
          response.Message || "File uploaded successfully!",
        );
      }
      setView("list");
      setEditingFile(null);
      fetchCompanyFiles();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDownload = async (file) => {
    if (!file.file_url) return;
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name || "download";
    link.target = "_blank";
    link.click();
  };

  const handleViewDetail = (file) => {
    if (!file.file_url) return;
    window.open(file.file_url, "_blank");
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteFile(id);
          addMessage(response.success, response.Message || "File deleted!");
          fetchCompanyFiles();
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

  const isInternalUser = profile?.role_id <= 2;

  // Check if we're in worker dossier view (to hide parent header)
  const isWorkerDossierView =
    tab === "workers" && view === "dossier" && activeWorker;

  // Upload/Edit views (for company files only)
  if (tab === "company" && (view === "create" || view === "edit")) {
    return (
      <div className="dashboard-wraper">
        <FileUpload
          isEditMode={view === "edit"}
          initialData={editingFile}
          onSuccess={handleFormSubmit}
          onCancel={() => {
            setView("list");
            setEditingFile(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-wraper">
      {/* 
        Only show header if NOT in worker dossier view.
        When viewing a worker dossier, the WorkerDossier component 
        has its own back button and no parent header is needed.
      */}
      {!isWorkerDossierView && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="mb-3 mb-md-0">
            <h2 className="fw-bold text-dark mb-2">File Manager</h2>
            <p className="text-muted mb-0">
              {tab === "workers"
                ? "Browse worker document folders — view, track, and manage individual employee files."
                : "Manage organization-wide documents — licenses, agreements, reports, and policies."}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Tab Switcher */}
            <div
              className="btn-group shadow-sm"
              role="group"
              style={{ borderRadius: "8px", overflow: "hidden" }}
            >
              <button
                className={`btn btn-sm px-3 py-2 fw-semibold ${
                  tab === "workers"
                    ? "btn-main text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  setTab("workers");
                  setView("list");
                  setActiveWorker(null);
                }}
                style={{ borderRadius: "8px 0 0 8px" }}
              >
                <i className="bi bi-people-fill me-1"></i>
                Workers
              </button>
              <button
                className={`btn btn-sm px-3 py-2 fw-semibold ${
                  tab === "company"
                    ? "btn-main text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  setTab("company");
                  setView("list");
                  setActiveWorker(null);
                }}
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                <i className="bi bi-building me-1"></i>
                Company
              </button>
            </div>

            {/* Upload button (company tab only) */}
            {tab === "company" && (
              <button
                className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
                onClick={() => {
                  setEditingFile(null);
                  setView("create");
                }}
              >
                + Upload File
              </button>
            )}
          </div>
        </div>
      )}

      {/* Worker Folders Tab */}
      {tab === "workers" && view === "list" && (
        <WorkerFolderGrid onSelectWorker={handleSelectWorker} />
      )}

      {/* Worker Dossier Tab - renders without parent header */}
      {tab === "workers" && view === "dossier" && activeWorker && (
        <WorkerDossier
          workerId={activeWorker.id}
          onBack={() => {
            setActiveWorker(null);
            setView("list");
          }}
        />
      )}

      {/* Company Files Tab */}
      {tab === "company" && view === "list" && (
        <>
          <FileFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />

          <ListingComponent
            data={filesData.files}
            columns={[
              { header: "Name", accessor: "file_name" },
              isInternalUser && {
                header: "Visibility",
                render: (row) =>
                  row.is_private ? (
                    <Badge content="Private" color="red" icon="bi-lock-fill" />
                  ) : (
                    <Badge content="Public" color="blue" icon="bi-globe" />
                  ),
              },
              { header: "Type", accessor: "file_type" },
              {
                header: "Uploaded",
                render: (row) => new Date(row.created_at).toLocaleDateString(),
              },
              { header: "Category", accessor: "category" },
            ].filter(Boolean)}
            actions={[
              { type: "view", onClick: (row) => handleViewDetail(row) },
              {
                type: "edit",
                onClick: (row) => {
                  setEditingFile(row);
                  setView("edit");
                },
                showOn: true,
                bypassRole: true,
              },
              { type: "download", onClick: (row) => handleDownload(row) },
              {
                type: "delete",
                onClick: (row) => handleDelete(row.id),
                showOn: true,
                bypassRole: true,
              },
            ]}
            emptyState={{
              title: "No company files found",
              subtitle: "Try adjusting the filters above or upload a new file.",
            }}
            pagination={{
              page: filters.page,
              limit: filters.limit,
              total: filesData.total,
              onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
            }}
            onPageChange={(newPage) =>
              setFilters((prev) => ({ ...prev, page: newPage }))
            }
          />
        </>
      )}
    </div>
  );
};

export default File;
