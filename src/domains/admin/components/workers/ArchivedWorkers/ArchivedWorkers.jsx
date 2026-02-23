import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listArchivedWorkers,
  deleteArchivedWorker,
  restoreWorker,
  getArchivedWorkerProfile,
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../../context/Delete/useDelete";

const ArchivedWorkers = () => {
  const navigate = useNavigate();
  const { openModal } = useConfirmDelete();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ status: "archived" });

  // Pagination inputs separated from API response metadata
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch archived workers safely
  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listArchivedWorkers({
        ...filters,
        page,
        limit,
      });

      setWorkers(res?.items || []);
      setTotalItems(res?.meta?.total_items || 0);
    } catch (err) {
      addMessage(false, err.message || "Failed to load archived workers");
    } finally {
      hideLoader();
    }
  }, [filters, page, limit]); 

  // Initial fetch + refetch on filters/page change
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  const handleClear = () => {
    setFilters({ status: "archived" });
    setPage(1);
  };

  // Action handlers
  const handleView = async (id) => {
    showLoader();
    try {
      const workerProfile = await getArchivedWorkerProfile(id);
      navigate(`/admin/workers/archived/${id}`, { state: workerProfile });
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
    } finally {
      hideLoader();
    }
  };

  // Restore archived worker
  const handleRestore = (id) => {
    openModal(
      async () => {
        try {
          await restoreWorker(id);
          addMessage(true, "Worker restored successfully");
          setWorkers((prev) => prev.filter((w) => w.id !== id));
          setTotalItems((prev) => prev - 1);
        } catch (err) {
          addMessage(false, err.message || "Failed to restore worker");
        }
      },
      {
        title: "Are you sure you want to restore this worker?",
        confirmText: "Restore",
      },
    );
  };

  // Permanent delete handler
  const handleDelete = (id) => {
    openModal(
      async () => {
        try {
          await deleteArchivedWorker(id);
          addMessage(true, "Worker deleted permanently");
          setWorkers((prev) => prev.filter((w) => w.id !== id));
          setTotalItems((prev) => prev - 1);
        } catch (err) {
          addMessage(false, err.message || "Failed to delete worker");
        }
      },
      {
        title: "Are you sure you want to delete this worker permanently?",
        confirmText: "Delete",
      },
    );
  };

  return (
    <div className="dashboard-wrapper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            File Manager
          </h2>
          <p className="text-muted mb-0">
            Organize and manage your files — upload, update, rename, delete, or
            download.
          </p>
        </div>
      </div>

      <ListingComponent
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
          { type: "restore", onClick: (row) => handleRestore(row.id) },
          { type: "delete", onClick: (row) => handleDelete(row.id) },
        ]}
        emptyState={{
          title: "No archived workers found",
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

export default ArchivedWorkers;
