import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listWorkers,
  getWorkerProfile,
  deleteWorker,
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkerFilter/WorkerFilter";

import useloader from "../../../../../context/loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const ActiveWorkers = () => {
  const navigate = useNavigate();
  const { openModal } = useDelete();
  const { showloader, hideloader } = useloader();
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
    showloader();
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
      hideloader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    showloader();
    try {
      const workerProfile = await getWorkerProfile(id);
      navigate(`/admin/workers/active/${id}`, { state: workerProfile });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideloader();
    }
  };

  // Archive worker
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

  // Permanent delete
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

  // Action handler for adding a module to a worker
  const handleAddModule = (id) => {
    navigate(`/admin/workers/modules/${id}/add`);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">Active Workers</h2>
          <p className="text-muted mb-0">
            View and manage active workers, access detailed profiles, archive
            records, or remove workers when needed.
          </p>
        </div>
      </div>

      <ListingComponent
        showAvater={true}
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

          {
            type: "addModule",
            onClick: (row) => handleAddModule(row.id),
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
