import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listWorkers,
  getWorkerProfile,
  deleteWorker,
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

const ActiveWorkers = () => {
  const navigate = useNavigate();
  const { openModal } = useConfirmDelete();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});

  // pagination (inputs)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // pagination (response)
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

      setWorkers(res?.items || []);
      setTotalItems(res?.meta?.total_items || 0);
    } catch (err) {
      addMessage(false, err.message || "Failed to load workers");
    } finally {
      hideLoader();
    }
  }, [filters, page, limit]);

  // Initial fetch + refetch on change
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  // Clear filters
  const handleClear = () => {
    setFilters({});
    setPage(1);
  };

  // View worker
  const handleView = async (id) => {
    showLoader();
    try {
      const workerProfile = await getWorkerProfile(id);
      navigate(`/admin/workers/active/${id}`, { state: workerProfile });
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
    } finally {
      hideLoader();
    }
  };

  // Archive worker
  const handleArchive = (id) => {
    openModal(
      async () => {
        try {
          await deleteWorker(id, false);
          addMessage(true, "Worker archived successfully");
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message || "Failed to archive worker");
        }
      },
      {
        title: "Are you sure you want to archive this worker?",
        confirmText: "Archive",
      },
    );
  };

  // Permanent delete
  const handleDelete = (id) => {
    openModal(
      async () => {
        try {
          await deleteWorker(id, true);
          addMessage(true, "Worker deleted permanently");
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message || "Failed to delete worker");
        }
      },
      {
        title: "Are you sure you want to delete this worker?",
        confirmText: "Delete",
      },
    );
  };

  console.log("render ActiveWorkers");

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
          {
            type: "view",
            onClick: (row) => handleView(row.id),
          },
          {
            type: "archive",
            onClick: (row) => handleArchive(row.id),
          },
          {
            type: "delete",
            onClick: (row) => handleDelete(row.id),
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
