import React, { useEffect, useState } from "react";
import { listWorkers } from "../../../api/worker.api";
// import { archiveWorker, deleteWorker } from "../../../api/worker.api"; // ← add these when ready
import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";

const ActiveWorkers = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});
  const [meta, setMeta] = useState({ page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    showLoader();

    try {
      const res = await listWorkers({
        ...filters,
        page: meta.page,
        limit: meta.limit,
      });
      setWorkers(res?.items || []);
      setMeta(res?.meta || meta);
    } catch (err) {
      addMessage(false, err.message || "Failed to load workers");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [filters, meta.page, meta.limit]);

  const handleFilterChange = (f) => {
    setFilters((p) => ({ ...p, ...f }));
    setMeta((p) => ({ ...p, page: 1 }));
  };

  const handleClear = () => {
    setFilters({});
    setMeta((p) => ({ ...p, page: 1 }));
  };

  // Action handlers (implement these with your API calls)
  const handleView = (workerId) => {
    // Example: navigate to detail page
    // navigate(`/workers/${workerId}`);
    addMessage(true, `Viewing worker ${workerId} (implement navigation)`);
  };

  const handleArchive = async (workerId) => {
    if (!window.confirm("Archive this worker?")) return;

    showLoader();
    try {
      // await archiveWorker(workerId); // ← your API call
      addMessage(true, "Worker archived successfully");
      fetchWorkers(); // refresh list
    } catch (err) {
      addMessage(false, "Failed to archive worker");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm("Delete this worker permanently?")) return;

    showLoader();
    try {
      // await deleteWorker(workerId); // ← your API call (hard delete)
      addMessage(true, "Worker deleted successfully");
      fetchWorkers(); // refresh list
    } catch (err) {
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
        {loading ? (
          <div className="text-center mt-5">
            <p className="text-muted">Loading active workers...</p>
          </div>
        ) : workers.length === 0 ? (
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
                  <th scope="col">Name</th>
                  <th scope="col">Phone Number</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>{worker.full_name || "—"}</td>
                    <td>{worker.phone_number || "—"}</td>
                    <td>{worker.status || "Unknown"}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleView(worker.id)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleArchive(worker.id)}
                        >
                          Archive
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(worker.id)}
                        >
                          Delete
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
