import React, { useState, useEffect } from "react";
import { fetchWorkerFolders } from "../../../api/file.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import Badge from "../../../../../shared/components/Badge/Badge";

const WorkerFolderGrid = ({ onSelectWorker }) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [folders, setFolders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    name: "",
    passport: "",
    labourId: "",
  });

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const fetchData = async () => {
    showLoader();
    try {
      const params = {
        page,
        limit,
        ...filters,
      };
      const res = await fetchWorkerFolders(params);
      setFolders(res?.data?.data || []);
      setTotalItems(res?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
      addMessage(false, "Could not load worker folders");
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClear = () => {
    setFilters({ name: "", passport: "", labourId: "" });
    setPage(1);
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div>
      {/* Filters - matching your FileFilters style */}
      <div className={`card shadow-sm mb-4`}>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Search by Name"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="passport"
                className="form-control"
                placeholder="Search by Passport"
                value={filters.passport}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="labourId"
                className="form-control"
                placeholder="Search by Labour ID"
                value={filters.labourId}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary"
                onClick={handleClear}
                disabled={
                  !filters.name && !filters.passport && !filters.labourId
                }
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {folders.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-folder-x text-muted"
            style={{ fontSize: "3rem" }}
          ></i>
          <h5 className="mt-3 text-muted fw-semibold">No workers found</h5>
          <p className="text-muted small">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {folders.map((folder) => (
              <div className="col" key={folder.worker_id}>
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => onSelectWorker(folder.worker_id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.08)";
                  }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      {/* 3x4 Photo */}
                      <div className="me-3 flex-shrink-0">
                        {folder.photo_3x4_url ? (
                          <img
                            src={folder.photo_3x4_url}
                            alt={folder.full_name}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "65px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex align-items-center justify-content-center"
                            style={{
                              width: "50px",
                              height: "65px",
                              borderRadius: "4px",
                            }}
                          >
                            <i className="bi bi-person text-muted"></i>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow-1 min-width-0">
                        <h6
                          className="mb-1 fw-bold text-truncate"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {folder.full_name}
                        </h6>
                        <p
                          className="mb-0 text-muted text-truncate"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {folder.passport_number || "No passport"}
                        </p>
                        {folder.labour_id && (
                          <p
                            className="mb-0 text-muted text-truncate"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {folder.labour_id}
                          </p>
                        )}
                      </div>

                      {/* Doc count */}
                      <div className="flex-shrink-0 text-end ms-2">
                        <Badge
                          content={`${folder.doc_count}`}
                          color="primary"
                          className="rounded-pill"
                        />
                      </div>
                    </div>

                    {/* Open button - full width border on hover */}
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm w-100"
                        style={{ borderRadius: "6px" }}
                      >
                        Open Folder{" "}
                        <i className="bi bi-arrow-right-short ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 1 && p <= page + 1),
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      <li className={`page-item ${page === p ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      </li>
                    </React.Fragment>
                  ))}
                <li
                  className={`page-item ${page === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default WorkerFolderGrid;
