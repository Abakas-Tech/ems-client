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
import BottomPagination from "../../../../../shared/components/BottomPagination/BottomPagination";
import { useConfirmDelete } from "../../../../../context/Delete/useDelete";

const ActiveWorkers = () => {
  const navigate = useNavigate();
  const { openModal } = useConfirmDelete();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_items: 0 });

  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listWorkers({
        ...filters,
        page: meta.page,
        limit: meta.limit,
      });

      // Extract items and meta from API response
      const { items, meta: apiMeta } = res;

      setWorkers(items || []);
      setMeta((prev) => ({ ...prev, ...(apiMeta || {}) }));
    } catch (err) {
      addMessage(false, err.message || "Failed to load workers");
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
    setFilters({});
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleView = async (id) => {
    showLoader();
    try {
      const workerProfile = await getWorkerProfile(id);

      // Navigate to worker's page
      navigate(`/admin/workers/active/${id}`, { state: workerProfile });
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
    } finally {
      hideLoader();
    }
  };

  const handleArchive = (id) => {
    openModal(
      async () => {
        showLoader();
        await deleteWorker(id, false);
        addMessage(true, "Worker archived successfully");
        fetchWorkers();
        hideLoader();
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

  return (
    <section>
      <div className="container">
        {/* Filters */}
        <ActiveWorkersFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClear}
        />

        {/* Table */}
        {workers.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted">No active workers found</p>
            <p className="text-muted small">
              Try adjusting the filters above or check back later.
            </p>
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
                    <td>{w.status || "Unknown"}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-start">
                        {/* View */}
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleView(w.id)}
                          title="View worker"
                          aria-label="View worker"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>

                        {/* Archive */}
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleArchive(w.id)}
                          title="Archive worker"
                          aria-label="Archive worker"
                        >
                          <i className="fa-solid fa-folder-open"></i>
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(w.id)}
                          title="Delete worker"
                          aria-label="Delete worker"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta.total_items > meta.limit && (
              <BottomPagination
                pagination={{
                  page: meta.page,
                  limit: meta.limit,
                  total: meta.total_items,
                }}
                onPageChange={(newPage) =>
                  setMeta((prev) => ({ ...prev, page: newPage }))
                }
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveWorkers;
