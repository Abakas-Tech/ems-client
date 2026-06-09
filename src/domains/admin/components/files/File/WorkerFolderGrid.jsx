import React, { useState, useEffect } from "react";
import { fetchWorkerFolders } from "../../../api/file.api";
import WorkerFolderFilters from "../WorkerFolderFilters/WorkerFolderFilters";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import Badge from "../../../../../shared/components/Badge/Badge";
import BottomPagination from "../../../../../shared/components/BottomPagination/BottomPagination";

const WorkerFolderGrid = ({ onSelectWorker }) => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [folders, setFolders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState(null);
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
      setPagination(res?.data?.meta || null);
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

  const onPageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {/* Filters - matching your FileFilters style */}
      <WorkerFolderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

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
                      {/* Info */}
                      <div className="flex-grow-1 min-width-0 d-flex align-items-center justify-content-between">
                        <div className="min-width-0 flex-grow-1">
                          <h6
                            className="mb-1 fw-bold text-truncate"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {folder.full_name}
                          </h6>
                          <div className="d-flex flex-column">
                            <p
                              className="mb-0 text-muted text-truncate"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {folder.passport_number || "No passport"}
                            </p>
                            <p
                              className="mb-0 text-muted text-truncate"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {folder.labour_id || "No Labour ID"}
                            </p>
                            <p
                              className="mb-0 text-muted text-truncate"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {folder.doc_count}{" "}
                              {folder.doc_count === 1 ? "File" : "Files"}
                            </p>
                          </div>
                        </div>

                        {/* Doc count - Now centered vertically next to the IDs */}
                      </div>

                      {/* Doc count */}
                    </div>
                    {/* Open button - full width border on hover */}
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-main btn-sm w-100"
                        style={{ borderRadius: "6px" }}
                      >
                        Open Folder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          {pagination && pagination.total > pagination.limit && (
            <BottomPagination
              pagination={{
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
              }}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkerFolderGrid;
