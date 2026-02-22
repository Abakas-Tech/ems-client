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
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total_items: 0,
  });

// Fetch Workers with API call, handles loading and error states
  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listWorkers({
        ...filters,
        page: meta.page,
        limit: meta.limit,
      });

      const { items, meta: apiMeta } = res;

      setWorkers(items || []);
      setMeta((prev) => ({ ...prev, ...(apiMeta || {}) }));
    } catch (err) {
      addMessage(false, err.message || "Failed to load workers");
    } finally {
      hideLoader();
    }
  }, [filters, meta.page, meta.limit, showLoader, hideLoader, addMessage]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setFilters({});
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

 //Action handlers
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
        showLoader();
        try {
          await deleteWorker(id, false);
          addMessage(true, "Worker archived successfully");
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message || "Failed to archive worker");
        } finally {
          hideLoader();
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
        showLoader();
        try {
          await deleteWorker(id, true);
          addMessage(true, "Worker deleted permanently");
          fetchWorkers();
        } catch (err) {
          addMessage(false, err.message || "Failed to delete worker");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this worker?",
        confirmText: "Delete",
      },
    );
  };

// Rendering
  return (
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
        page: meta.page,
        limit: meta.limit,
        total: meta.total_items,
        onPageChange: (page) => setMeta((prev) => ({ ...prev, page })),
      }}
    />
  );
};

export default ActiveWorkers;
