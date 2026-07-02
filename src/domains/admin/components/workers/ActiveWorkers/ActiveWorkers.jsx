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

const ActiveWorkers = () => {
  const navigate = useNavigate();

  const { openModal } = useDelete();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const { profile } = useProfile();
  const role = profile?.role_id;

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});

  // --- Selection Mode States ---
  // Used for BOTH:
  // 1. Bulk notifications
  // 2. Autofill queue preparation
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  // Pagination
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

      setWorkers(res?.data?.items || []);
      setTotalItems(res?.data?.meta?.total_items || 0);
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
  // Edit Handler
  const handleEdit = (row) => {
    navigate(`/admin/employees/edit/${row.id}`, { state: row });
  };

  // --- Selection Handlers ---

  const canUseBulkSelection = role === 1 || role === 2;

  const handleRowDoubleClick = (row) => {
    if (!canUseBulkSelection) return;
    if (!row?.id) return;

    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedWorkerIds([row.id]);
    }
  };

  const handleSelectRow = (id) => {
    if (!id) return;

    setSelectedWorkerIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }

      return [...prev, id];
    });
  };

  const handleSelectAll = (checked) => {
    const currentPageIds = workers
      .map((worker) => worker.id)
      .filter((id) => id !== undefined && id !== null);

    setSelectedWorkerIds((prev) => {
      if (checked) {
        // Add current page IDs without removing selections from previous pages
        return Array.from(new Set([...prev, ...currentPageIds]));
      }

      // Remove only current page IDs, keep other page selections
      return prev.filter((selectedId) => !currentPageIds.includes(selectedId));
    });
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedWorkerIds([]);
  };

  // Notification flow — unchanged, but now supports selected IDs across pages
  const handleNotify = (row = null) => {
    let idsToNotify = [];
    let full_name = "";

    const roleType = "worker";

    if (row?.id) {
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

  // Autofill flow — new
  // This does NOT send to the extension yet.
  // It only carries the selected worker IDs to the next page where we will build:
  // 4 cards: Wafid / Tasheer / Insurance / Musaned
  const handleAutofillSelected = () => {
    if (selectedWorkerIds.length === 0) return;

    navigate("/admin/autofill", {
      state: {
        workerIds: selectedWorkerIds,
        source: "active-workers",
      },
    });
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

  // View, Archive, Delete handlers
  const handleView = async (id) => {
    showLoader();

    try {
      const workerProfile = await getWorkerProfile(id);

      if (role === 3) {
        // Partner
        navigate(`/partner/active-employees/${id}`, {
          state: workerProfile,
        });
      } else if (role === 5) {
        // Employer
        navigate(`/employer/my-employees/${id}`, {
          state: workerProfile,
        });
      } else {
        // Admin / Employee
        navigate(`/admin/employees/active/${id}`, {
          state: workerProfile,
        });
      }
    } catch (err) {
      console.error("Failed to fetch worker profile:", err);
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

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className={`mb-${role === 5 ? "0" : "4"}`}>
          {role !== 3 && role !== 5 && <BackButton onClick={goBack} />}

          <h2 className="fw-bold text-dark mb-2">
            {role === 5 ? "My Employees" : "Active Employees"}
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
            top: "15px", // Removed window.innerWidth logic to prevent server/hydration mismatches
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
                selected
              </p>
            </div>
          </div>
          {/* Right Side: Actions (Stacked on mobile, side-by-side on desktop) */}
          <div
            className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto justify-content-md-end align-items-stretch align-items-md-center"
            style={{ fontSize: "13px" }}
          >
            <button
              className="btn btn-main  text-white  px-md-4 fw-bold  order-1"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleNotify}
              style={{
                borderRadius: "10px",
                whiteSpace: "nowrap",
                width: "100%", // Full width on mobile
              }}
            >
              Alert
            </button>

            <button
              className="btn btn-primary  text-white  px-md-4 fw-bold  order-2"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleAutofillSelected}
              style={{
                borderRadius: "10px",
                whiteSpace: "nowrap",
                width: "100%", // Full width on mobile
              }}
            >
              Autofill
            </button>

            <button
              className="btn btn-outline-secondary   px-md-4 fw-bold order-3"
              onClick={handleExitSelection}
              style={{
                borderRadius: "10px",
                fontWeight: "600",
                width: "100%", // Full width on mobile
              }}
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
          {
            header: "Phone Number",
            accessor: "phone_number",
          },
          {
            header: "Current Status",
            accessor: "status",
          },
        ]}
        actions={[
          {
            type: "view",
            onClick: (row) => handleView(row.id),
          },

          { type: "edit", onClick: (row) => handleEdit(row) },
          {
            type: "notify",
            onClick: (row) => handleNotify(row),
          },
          {
            type: "transaction",
            onClick: (row) => handleRecordTransaction(row),
          },
          {
            type: "files",
            onClick: (row) =>
              navigate("/admin/files", {
                state: {
                  workerId: row.id,
                  tab: "workers",
                },
              }),
          },
          {
            type: "archive",
            onClick: (row) => handleArchive(row.id),
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row.id),
          },
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
