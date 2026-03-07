import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listWorkers,
  getWorkerProfile,
  deleteWorker,
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkerFilter/WorkerFilter";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const ActiveWorkers = () => {
  const navigate = useNavigate();
  const { openModal } = useDelete();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});

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
      navigate(`/admin/workers/active/${id}`, { state: workerProfile });
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

  return (
    <div className="dashboard-wraper position-relative">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={() => navigate(-1)} />
          <h2 className="fw-bold text-dark mb-2">Active Workers</h2>
          <p className="text-muted mb-0">
            View and manage active workers. <strong>Double-click a row</strong>{" "}
            to start bulk selection.
          </p>
        </div>
      </div>

      {/* Floating Selection Bar */}
      {isSelectionMode && (
        <div
          className="alert alert-primary d-flex justify-content-between align-items-center shadow-lg border-0 rounded-4 mb-4 animate__animated animate__fadeInDown sticky-top"
          style={{ zIndex: 1000, top: "10px" }}
        >
          <div>
            <i className="bi bi-check2-all me-2 fs-5"></i>
            <span className="fw-bold">{selectedWorkerIds.length}</span> Workers
            Selected
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-main btn-sm text-white px-3 fw-bold"
              disabled={selectedWorkerIds.length === 0}
              onClick={handleBulkNotify}
            >
              <i className="bi bi-megaphone me-1"></i> Send Bulk Alert
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
          <ActiveWorkersFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
          />
        }
        data={workers}
        columns={[
          { header: "Name", accessor: "full_name" },
          { header: "Phone Number", accessor: "phone_number" },
          { header: "Status", accessor: "status" },
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
