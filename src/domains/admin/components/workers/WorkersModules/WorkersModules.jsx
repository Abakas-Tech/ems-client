import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaUsers, FaUserSlash, FaFolderPlus } from "react-icons/fa";
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

const WorkersModules = () => {
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
  }, []);

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
      // const id = workerProfile.data.id;
      console.log(`"worker profile is :" ${workerProfile}`);

      // Navigate to worker's page
      navigate(`/admin/workers/modules/${id}/add`);
    } catch (err) {
      addMessage(false, err.message || "Failed to load worker profile");
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
                          className="btn btn-md btn-outline-info"
                          onClick={() => handleView(w.id)}
                          title="Add Module"
                          aria-label="View worker"
                        >
                          <FaFolderPlus />
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

export default WorkersModules;
