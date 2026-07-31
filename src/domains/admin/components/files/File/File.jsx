import React, { useEffect, useState } from "react";
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
import WorkerDossier from "../WorkerDossier/WorkerDossier";

/* Replace this with the real route used by your Active Employees page. */
const ACTIVE_EMPLOYEES_PATH = "/partner/active-employees";

const File = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const searchParams = new URLSearchParams(location.search);
  const workerIdFromUrl = searchParams.get("workerId");
  const initialWorkerId = location.state?.workerId || workerIdFromUrl || null;

  const [tab, setTab] = useState(location.state?.tab || "workers");
  const [view, setView] = useState(
    initialWorkerId ? "dossier" : location.state?.view || "list",
  );
  const [activeWorker, setActiveWorker] = useState(
    initialWorkerId ? { id: initialWorkerId } : null,
  );

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

  const roleId = Number(profile?.role_id);
  const isPartner = roleId === 3;
  const isInternalUser = roleId === 1 || roleId === 2;

  /*
   * Convert the temporary location.state worker ID into a URL query parameter.
   * The URL survives refresh, while location.state may be cleared or lost.
   */
  useEffect(() => {
    const stateWorkerId = location.state?.workerId;

    if (!stateWorkerId) return;

    setActiveWorker({ id: stateWorkerId });
    setTab("workers");
    setView("dossier");

    const params = new URLSearchParams(location.search);
    params.set("workerId", String(stateWorkerId));
    params.set("view", "dossier");

    navigate(
      {
        pathname: location.pathname,
        search: `?${params.toString()}`,
      },
      {
        replace: true,
        state: {},
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Partners cannot open the File Manager list directly. */
  useEffect(() => {
    if (!profile) return;

    if (isPartner && !activeWorker) {
      addMessage(false, "Open a worker dossier from Active Employees.");
      navigate(ACTIVE_EMPLOYEES_PATH, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (isInternalUser && tab === "company" && view === "list" && profile) {
      fetchCompanyFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, view, filters, profile, isInternalUser]);

  const fetchCompanyFiles = async () => {
    if (!profile || !isInternalUser) return;

    showLoader();

    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        file_type: filters.file_type,
        category: filters.category,
        search: filters.fileName,
        scope: "company",
      };

      const response = await fetchFiles(cleanFilters);

      setFilesData({
        files: response?.data?.files || [],
        total: response?.data?.pagination?.total || 0,
        pagination: response?.data?.pagination || {},
      });
    } catch (error) {
      console.error("Failed to fetch company files:", error);
    } finally {
      hideLoader();
    }
  };

  const handleSelectWorker = (workerId) => {
    if (!isInternalUser) return;

    setActiveWorker({ id: workerId });
    setTab("workers");
    setView("dossier");

    const params = new URLSearchParams();
    params.set("workerId", String(workerId));
    params.set("view", "dossier");

    navigate({
      pathname: location.pathname,
      search: `?${params.toString()}`,
    });
  };

  const handleDossierBack = () => {
    if (isPartner) {
      navigate(ACTIVE_EMPLOYEES_PATH);
      return;
    }

    setActiveWorker(null);
    setView("list");

    navigate(
      {
        pathname: location.pathname,
        search: "",
      },
      { replace: true },
    );
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value, page: 1 }));
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
    if (!isInternalUser) return;

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
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  const handleDownload = async (file) => {
    if (!file.file_url) return;

    try {
      const response = await fetch(file.file_url);
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

  const handleViewDetail = (file) => {
    if (!file.file_url) return;
    window.open(file.file_url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = (id) => {
    if (!isInternalUser) return;

    openModal(
      async () => {
        showLoader();

        try {
          const response = await deleteFile(id);
          addMessage(response.success, response.Message || "File deleted!");
          fetchCompanyFiles();
        } catch (error) {
          addMessage(false, error.message);
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

  const isWorkerDossierView =
    tab === "workers" && view === "dossier" && Boolean(activeWorker);

  if (!profile) return null;

  if (isPartner && !activeWorker) return null;

  if (
    isInternalUser &&
    tab === "company" &&
    (view === "create" || view === "edit")
  ) {
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
      {!isWorkerDossierView && isInternalUser && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="mb-3 mb-md-0">
            <h2 className="fw-bold text-dark mb-2">File Manager</h2>
            <p className="text-muted mb-0">
              {tab === "workers"
                ? "Browse worker document folders — view, track, and manage individual employee files."
                : "Manage organization-wide documents — licenses, agreements, reports, and policies."}
            </p>
          </div>

          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
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
                  navigate({ pathname: location.pathname, search: "" });
                }}
                style={{ borderRadius: "8px 0 0 8px" }}
              >
                <i className="bi bi-people-fill me-1" />
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
                  navigate({ pathname: location.pathname, search: "" });
                }}
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                <i className="bi bi-building me-1" />
                Company
              </button>
            </div>

            {tab === "company" && (
              <button
                className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
                onClick={() => {
                  setEditingFile(null);
                  setView("create");
                }}
              >
                Upload File
              </button>
            )}
          </div>
        </div>
      )}

      {isInternalUser && tab === "workers" && view === "list" && (
        <WorkerFolderGrid onSelectWorker={handleSelectWorker} />
      )}

      {tab === "workers" && view === "dossier" && activeWorker && (
        <WorkerDossier workerId={activeWorker.id} onBack={handleDossierBack} />
      )}

      {isInternalUser && tab === "company" && view === "list" && (
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
              {
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
            ]}
            actions={[
              { type: "view", onClick: (row) => handleViewDetail(row) },
              {
                type: "edit",
                onClick: (row) => {
                  setEditingFile(row);
                  setView("edit");
                },
              },
              { type: "download", onClick: (row) => handleDownload(row) },
              {
                type: "delete",
                onClick: (row) => handleDelete(row.id),
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
              onPageChange: (page) =>
                setFilters((previous) => ({ ...previous, page })),
            }}
            onPageChange={(newPage) =>
              setFilters((previous) => ({ ...previous, page: newPage }))
            }
          />
        </>
      )}
    </div>
  );
};

export default File;
