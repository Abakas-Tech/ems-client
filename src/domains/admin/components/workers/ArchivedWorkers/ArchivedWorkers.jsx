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
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_items: 0 });

// Fetch archived workers with API call, handles loading and error states
  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listArchivedWorkers({
        ...filters,
        page: meta.page,
        limit: meta.limit,
      });

      const { items, meta: apiMeta } = res;
      setWorkers(items || []);
      setMeta((prev) => ({ ...prev, ...(apiMeta || {}) }));
    } catch (err) {
      addMessage(false, err.message || "Failed to load archived workers");
    } finally {
      hideLoader();
    }
  }, [filters, meta.page, meta.limit, showLoader, hideLoader, addMessage]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

 // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setFilters({ status: "archived" });
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

 // Action handlers for view, restore, and delete operations
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

  // Restore worker with confirmation modal
  const handleRestore = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await restoreWorker(id);
          addMessage(true, "Worker restored successfully");
          setWorkers((prev) => prev.filter((w) => w.id !== id));
          setMeta((prev) => ({ ...prev, total_items: prev.total_items - 1 }));
        } catch (err) {
          addMessage(false, err.message || "Failed to restore worker");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to restore this worker?",
        confirmText: "Restore",
      },
    );
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteArchivedWorker(id);
          addMessage(true, "Worker deleted permanently");
          setWorkers((prev) => prev.filter((w) => w.id !== id));
          setMeta((prev) => ({ ...prev, total_items: prev.total_items - 1 }));
        } catch (err) {
          addMessage(false, err.message || "Failed to delete worker");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this worker permanently?",
        confirmText: "Delete",
      },
    );
  };

 // Render ListingComponent with filters, data, columns, actions, and pagination
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
        { type: "view", onClick: (row) => handleView(row.id) },
        { type: "restore", onClick: (row) => handleRestore(row.id) },
        { type: "delete", onClick: (row) => handleDelete(row.id) },
      ]}
      emptyState={{
        title: "No archived workers found",
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

export default ArchivedWorkers;
