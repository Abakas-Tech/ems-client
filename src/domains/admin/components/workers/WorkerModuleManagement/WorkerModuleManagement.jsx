import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listWorkers } from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkerFilter/WorkerFilter";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const WorkerModuleManagement = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});

  // Pagination separated from API metadata
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch workers safely
  const fetchWorkers = useCallback(async () => {
    showLoader();
    try {
      const res = await listWorkers({
        ...filters,
        page,
        limit,
      });

      setWorkers(res?.data.items || []);
      setTotalItems(res?.data?.meta?.total_items || 0);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
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

  // Action handler for adding a module to a worker
  const handleAddModule = (id) => {
    navigate(`/admin/workers/modules/${id}/add`);
  };

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">Add Worker Modules</h2>
          <p className="text-muted mb-0">
            View the list of workers and assign or manage modules for each
            profile.
          </p>
        </div>
      </div>
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
          { type: "addModule", onClick: (row) => handleAddModule(row.id) },
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

export default WorkerModuleManagement;
