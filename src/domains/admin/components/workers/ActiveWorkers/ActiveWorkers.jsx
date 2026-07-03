import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listWorkers,
  getWorkerProfile,
  deleteWorker,
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkerFilter/WorkerFilter";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import useProfile from "../../../../../context/Profile/useProfile";
import { generateVisaApplicationPdf } from "../../Application/visaApplicationPdfGenerator";

const ActiveWorkers = () => {
  const navigate = useNavigate();
  const { openModal, openDynamicModal } = useDelete();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});
  const { profile } = useProfile();
  const role = profile?.role_id;

  // --- Selection Mode States ---
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch Workers
  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const params = {
        ...filters,
        page,
        limit,
      };

      const res = await listWorkers(params);

      setWorkers(res?.data.items || []);
      setTotalItems(res?.data.meta?.total_items || 0);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Record Transaction Handler
  const handleRecordTransaction = (row) => {
    navigate("/admin/finances", {
      state: {
        userId: row.id,
        userName: row.full_name,
        userRole: "employee",
      },
    });
  };
  // --- Selection Handlers ---
  const handleRowDoubleClick = (row) => {
    if (profile.role_id !== 1 && profile.role_id !== 2) return;
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedWorkerIds([row.id]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedWorkerIds(workers.map((w) => w.id));
    } else {
      setSelectedWorkerIds([]);
    }
  };

  const handleNotify = (row = null) => {
    let idsToNotify = [];
    let full_name = "";
    const roleType = "worker"; // Hardcoded for this specific worker page

    if (row && row.id) {
      // Single worker click from action icon
      idsToNotify = [row.id];
      full_name = row.full_name || "";
    } else {
      // Bulk action click from top floating bar
      idsToNotify = selectedWorkerIds;

      if (idsToNotify.length === 1) {
        const selectedWorker = workers.find((w) => w.id === idsToNotify[0]);
        full_name = selectedWorker?.full_name || "";
      } else if (idsToNotify.length > 1) {
        full_name = "Multiple Workers";
      }
    }

    if (idsToNotify.length === 0) return;

    navigate("/admin/notifications", {
      state: {
        bulkIds: idsToNotify,
        bulkType: roleType,
        bulkName: full_name,
      },
    });
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedWorkerIds([]);
  };

  // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  const handleClear = () => {
    setFilters({});
    setPage(1);
  };

  // View, Archive, Delete handlers (existing logic)
  const handleView = async (id) => {
    showLoader();
    try {
      const workerProfile = await getWorkerProfile(id);

      // role based navigation
      if (role === 3) {
        // Partner
        navigate(`/partner/active-employees/${id}`, {
          state: workerProfile,
        });
      } else if (role === 5) {
        navigate(`/employer/my-employees/${id}`, {
          state: workerProfile,
        });
      } else {
        // Admin / Employee
        navigate(`/admin/employees/active/${id}`, {
          state: workerProfile,
        });
      }
    } catch {
      console.error("Failed to fetch worker profile:");
    } finally {
      hideLoader();
    }
  };

  const handleArchive = (id) => {
    openModal(
      async () => {
        try {
          const response = await deleteWorker(id, false);
          addMessage(
            response?.success,
            response?.message || "Employee archived successfully",
          );
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to archive this employee?",
        confirmText: "Archive",
      },
    );
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        try {
          const response = await deleteWorker(id, true);
          addMessage(
            response?.success,
            response?.message || "Employee deleted successfully",
          );
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to delete this employee?",
        confirmText: "Delete",
      },
    );
  };

  // Generate the embassy visa-application PDF for a worker, then show a
  // success modal letting the user Download it or Share it via WhatsApp.
  const handleDownloadVisaApplication = async (id) => {
    showLoader();
    try {
      const result = await generateVisaApplicationPdf(id, {
        autoDownload: false,
      });
      hideLoader();

      if (!result?.url) {
        addMessage(false, "Failed to generate visa application");
        return;
      }

      const { blob, url, fileName, fullName } = result;

      const triggerDownload = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // Tries to hand the actual PDF file to the OS share sheet (so
      // WhatsApp receives the real attachment, not just a filename in a
      // text message). Falls back to the old wa.me text-only link on
      // browsers that don't support the Web Share API's file sharing
      // (e.g. desktop Chrome/Firefox on most platforms).
      const shareOnWhatsapp = async () => {
        try {
          const file = new File([blob], fileName, {
            type: "application/pdf",
          });

          if (
            navigator.canShare &&
            navigator.canShare({ files: [file] }) &&
            navigator.share
          ) {
            await navigator.share({
              files: [file],
              title: "Visa Application",
              text: `Visa application for ${fullName}`,
            });
            return;
          }
        } catch (err) {
          // AbortError just means the user cancelled the native share
          // sheet — not a real failure, so don't fall back in that case.
          if (err?.name === "AbortError") return;
          console.warn(
            "Native file share failed, falling back to WhatsApp text link:",
            err,
          );
        }

        // Fallback: text-only WhatsApp link (wa.me cannot attach files).
        const message = `Visa application for ${fullName} is ready: ${fileName}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
      };

      openDynamicModal({
        title: "Visa Application Generated",
        body: (
          <p style={{ margin: 0, color: "#555" }}>
            Download it now or share it directly to a candidate.
          </p>
        ),
        actions: [
          {
            label: "Download",
            closeOnClick: false,
            onClick: triggerDownload,
          },
          {
            label: "Share",
            closeOnClick: false,
            onClick: shareOnWhatsapp,
          },
          {
            label: "Close",
            variant: "primary",
            closeOnClick: true,
            onClick: () => URL.revokeObjectURL(url),
          },
        ],
      });
    } catch (err) {
      hideLoader();
      console.error("Failed to generate visa application PDF:", err);
      addMessage(false, err.message || "Failed to generate visa application");
    }
  };

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className={`mb-${role === 5 ? "0" : "4"}`}>
          {role !== 3 && role !== 5 && <BackButton onClick={goBack} />}

          <h2 className="fw-bold text-dark mb-2">
            {" "}
            {role == 5 ? "My Employees" : "Active Employees"}
          </h2>
          <p className="text-muted mb-0">
            {role === 5
              ? "View the employees assigned to you and access their profiles."
              : role === 3
                ? "View active employees and access their profiles."
                : "View and manage active employees, access detailed profiles, archive records, or remove employees when needed."}
          </p>
        </div>
      </div>

      {/* Floating Selection Bar */}
      {isSelectionMode && (
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-center shadow-lg border rounded-4 mb-4 animate__animated animate__fadeInDown sticky-top px-3 px-md-4 py-3"
          style={{
            zIndex: 1050,
            top: window.innerWidth < 768 ? "10px" : "20px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(var(--maincolor-rgb), 0.15)",
            maxWidth: "1100px",
            margin: "0 auto",
            width: "95%",
            transition: "all 0.3s ease",
          }}
        >
          {/* Left Side: Status Info */}
          <div className="d-flex align-items-center mb-3 mb-md-0 w-100 w-md-auto justify-content-start">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
              style={{
                minWidth: "45px",
                height: "45px",
                backgroundColor: "rgba(var(--maincolor-rgb), 0.1)",
                color: "var(--maincolor)",
              }}
            >
              <i className="bi bi-person-check-fill fs-5"></i>
            </div>
            <div>
              <h6
                className="mb-0 fw-bold text-dark"
                style={{ fontSize: "1rem" }}
              >
                Bulk Action Mode
              </h6>
              <p className="mb-0 text-muted small fw-medium">
                <span className="fw-bold" style={{ color: "var(--maincolor)" }}>
                  {selectedWorkerIds.length}
                </span>{" "}
                {selectedWorkerIds.length === 1 ? "employee" : "employees"}{" "}
                selected for notification
              </p>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="gap-2 d-flex w-100 w-md-auto justify-content-between justify-content-md-end">
            <button
              className="btn btn-main btn-sm text-white px-4 fw-bold flex-grow-1 flex-md-grow-0 py-2 py-md-1"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleNotify}
            >
              Send Bulk Alert
            </button>

            <button
              className="btn btn-outline-secondary btn-sm border flex-grow-1 flex-md-grow-0 py-2 py-md-1"
              onClick={handleExitSelection}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <ListingComponent
        showAvater={true}
        // Selection Props
        isSelectionMode={isSelectionMode}
        selectedIds={selectedWorkerIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onRowDoubleClick={handleRowDoubleClick}
        filtersComponent={
          role !== 5 ? (
            <ActiveWorkersFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClear}
            />
          ) : null
        }
        data={workers}
        columns={[
          {
            header: "Name",
            accessor: "full_name",
            render: (row) => <span className="fw-bold">{row.full_name}</span>,
          },
          { header: "Phone Number", accessor: "phone_number" },
          { header: "Current Status", accessor: "status" },
        ]}
        actions={[
          { type: "view", onClick: (row) => handleView(row.id) },
          { type: "notify", onClick: (row) => handleNotify(row) },
          {
            type: "transaction",
            onClick: (row) => handleRecordTransaction(row),
          },
          { type: "archive", onClick: (row) => handleArchive(row.id) },
          { type: "delete", onClick: (row) => handleDelete(row.id) },
          {
            type: "addModule",
            onClick: (row) =>
              navigate(`/admin/employees/modules/${row.id}/add`),
          },
          {
            type: "viewCV",
            onClick: (row) =>
              window.open(row.cv_url, "_blank", "noopener,noreferrer"),
            showOn: (row) => row.cv_url,
          },
          {
            type: "downloadVisa",
            onClick: (row) => handleDownloadVisaApplication(row.id),
          },
        ]}
        emptyState={{
          title:
            role === 5
              ? "No employees is assigned to you yet"
              : "No Active employees found",
        }}
        pagination={{
          page,
          limit,
          total: totalItems,
        }}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActiveWorkers;