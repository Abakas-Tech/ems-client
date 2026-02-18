import React, { useEffect, useState, useCallback } from "react";
import { listWorkers } from "../../../api/worker.api";
import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";

const ActiveWorkers = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});
  const [meta, setMeta] = useState({ page: 1, limit: 10 });

  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listWorkers({
        ...filters,
        page: meta.page,
        limit: meta.limit,
      });

      setWorkers(res?.items || []);
      setMeta((prev) => ({ ...prev, ...(res?.meta || {}) }));
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

  const handleView = (id) => {
    addMessage(true, `Viewing worker ${id} (implement navigation)`);
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this worker?")) return;

    showLoader();
    try {
      // await archiveWorker(id);
      addMessage(true, "Worker archived successfully");
      fetchWorkers();
    } catch {
      addMessage(false, "Failed to archive worker");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this worker permanently?")) return;

    showLoader();
    try {
      // await deleteWorker(id);
      addMessage(true, "Worker deleted successfully");
      fetchWorkers();
    } catch {
      addMessage(false, "Failed to delete worker");
    } finally {
      hideLoader();
    }
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
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(w.id)}
                          title="View worker"
                          aria-label="View worker"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>

                        {/* Archive */}
                        <button
                          className="btn btn-sm btn-outline-warning  "
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
          </div>
        )}
      </div>
    </section>
  );
};

export default ActiveWorkers;
