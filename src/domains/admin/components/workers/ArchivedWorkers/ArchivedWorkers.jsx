import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  listArchivedWorkers,
  deleteArchivedWorker,
  restoreWorker,
  getArchivedWorkerProfile,
} from "../../../api/worker.api";
import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import BottomPagination from "../../../../../shared/components/BottomPagination/BottomPagination";
import { useConfirmDelete } from "../../../../../context/Delete/useDelete";

const ArchivedWorkers = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ status: "archived" });
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_items: 0 });

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
  }, [filters, meta.page, meta.limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setFilters({ status: "archived" });
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleView = async (id) => {
    showLoader();
    try {
      const workerProfile = await getArchivedWorkerProfile(id);

      //   console.log("Worker profile:", workerProfile);

      // Navigate to worker's page
      navigate(`/admin/workers/archived/${id}`, { state: workerProfile });
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
    } finally {
      hideLoader();
    }
  };

  // Restore deleted workers
  const handleRestore = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await restoreWorker(id);
          addMessage(true, "Worker restored successfully");

          // Remove the restored worker from the list instantly
          setWorkers((prev) => prev.filter((w) => w.id !== id));

          // Refresh pagination metadata
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
        type: "archive",
      },
    );
  };

  // Hard delete
  const handleDelete = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          await deleteArchivedWorker(id);
          addMessage(true, "Worker deleted permanently");

          // Remove the worker from state immediately
          setWorkers((prev) => prev.filter((w) => w.id !== id));

          // Update total_items in meta
          setMeta((prev) => ({
            ...prev,
            total_items: prev.total_items - 1,
          }));
        } catch (err) {
          addMessage(false, err.message || "Failed to delete worker");
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this worker permanently?",
        confirmText: "Delete",
        type: "delete",
      },
    );
  };

  return (
    <section>
      <div className="container">
        <ActiveWorkersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClear}
        />

        {workers.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted">No archived workers found</p>
          </div>
        ) : (
          <div className="table-responsive mt-4">
            <table className="table border-bottom">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td>{w.full_name || "—"}</td>
                    <td>{w.phone_number || "—"}</td>
                    <td>{w.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* View */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(w.id)}
                          title="View worker"
                          aria-label="View worker"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        {/* Restore */}
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleRestore(w.id)}
                          title="Restore worker"
                        >
                          <i className="fa-solid fa-rotate-left"></i>
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(w.id)}
                          title="Delete permanently"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {meta.total_items > meta.limit && (
              <BottomPagination
                pagination={{
                  page: meta.page,
                  limit: meta.limit,
                  total: meta.total_items,
                }}
                onPageChange={(page) => setMeta((prev) => ({ ...prev, page }))}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ArchivedWorkers;
