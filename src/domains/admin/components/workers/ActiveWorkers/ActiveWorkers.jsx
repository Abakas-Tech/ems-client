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
      const res = await listWorkers({
        ...filters,
        page,
        limit,
      });

      setWorkers(res?.data.items || []);
      setTotalItems(res?.data.meta?.total_items || 0);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // --- Selection Handlers ---
  const handleRowDoubleClick = (row) => {
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

  const handleBulkNotify = () => {
    navigate("/admin/notifications", {
      state: {
        bulkIds: selectedWorkerIds,
        bulkType: "worker", // Hardcoded for this page
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
        navigate(`/partner/active-workers/${id}`, {
          state: workerProfile,
        });
      } else {
        // Admin / Employee
        navigate(`/admin/workers/active/${id}`, {
          state: workerProfile,
        });
      }
    } catch (err) {
      addMessage(false, err.message);
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
            response?.message || "Worker archived successfully",
          );
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to archive this worker?",
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
            response?.message || "Worker deleted successfully",
          );
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to delete this worker?",
        confirmText: "Delete",
      },
    );
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
            {role == 5 ? "My workers" : "Active Workers"}
          </h2>
          <p className="text-muted mb-0">
            {role === 5
              ? "View the workers assigned to you and access their profiles."
              : role === 3
                ? "View active workers and access their profiles."
                : "View and manage active workers, access detailed profiles, archive records, or remove workers when needed."}
          </p>
        </div>
      </div>

      {/* Floating Selection Bar */}
      {isSelectionMode && (
        <div
          className="d-flex justify-content-between align-items-center shadow-lg border-0 rounded-4 mb-4 animate__animated animate__fadeInDown sticky-top px-4 py-3"
          style={{
            zIndex: 1000,
            top: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.95)", // Glass effect
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            maxWidth: "900px",
            margin: "0 auto",
            width: "95%", // Ensures padding on mobile
          }}
        >
          {/* Left Side: Status Info */}
          <div className="d-flex align-items-center">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center me-3"
              style={{
                width: "45px",
                height: "45px",
                backgroundColor: "rgba(var(--maincolor-rgb), 0.1)", // Light version of your main color
                color: "var(--maincolor)",
              }}
            >
              <i className="bi bi-person-check-fill fs-4"></i>
            </div>
            <div>
              <h6
                className="mb-0 fw-bold text-dark"
                style={{ letterSpacing: "-0.3px" }}
              >
                Bulk Action Mode
              </h6>
              <p className="mb-0 text-muted small fw-medium">
                <span style={{ color: "var(--maincolor)" }}>
                  {selectedWorkerIds.length}
                </span>{" "}
                workers ready for notification
              </p>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="gap-2 d-flex">
            <button
              className="btn btn-main btn-sm text-white px-3 fw-bold"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleBulkNotify}
            >
              {" "}
              Send Bulk Alert
            </button>
            <button
              className="btn btn-light btn-sm border"
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
          { type: "archive", onClick: (row) => handleArchive(row.id) },
          { type: "delete", onClick: (row) => handleDelete(row.id) },
          {
            type: "addModule",
            onClick: (row) => navigate(`/admin/workers/modules/${row.id}/add`),
          },
        ]}
        emptyState={{
          title: "No active workers found",
          subtitle: "Try adjusting the filters above or check back later.",
        }}
        pagination={{
          page,
          limit,
          total: totalItems,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};

export default ActiveWorkers;
