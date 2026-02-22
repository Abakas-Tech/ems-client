import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import { listWorkers } from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkersFilter/WorkersFilter";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";


const WorkersModules = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});
  const [meta, setMeta] = useState({ page: 1, limit: 10, total_items: 0 });

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

 // Action handler for adding a module to a worker
  const handleAddModule = (id) => {
    showLoader();
    try {
      navigate(`/admin/workers/modules/${id}/add`);
    } catch (err) {
      addMessage(false, err.message || "Failed to navigate to modules");
    } finally {
      hideLoader();
    }
  };

// Action configuration for buttons, including icons and styles
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
        { type: "addModule", onClick: (row) => handleAddModule(row.id) },
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

export default WorkersModules;
