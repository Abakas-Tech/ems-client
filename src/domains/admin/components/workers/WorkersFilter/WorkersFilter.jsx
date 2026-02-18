// src/components/workers/ActiveWorkersFilters.jsx
import React, { useState, useEffect } from "react";
import { getWorkerStatuses } from "../../../api/worker.api";
import styles from "./WorkersFilter.module.css";

const WorkersFilter = ({ filters, onFilterChange, onClear }) => {
  const [statuses, setStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await getWorkerStatuses();
        setStatuses(data || []);
      } catch (err) {
        console.error("Failed to load statuses:", err);
        setStatuses([]);
      } finally {
        setLoadingStatuses(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search by name or phone */}
          <div className="col-md-4">
            <input
              type="text"
              name="search"
              className={`form-control ${styles.input}`}
              placeholder="Search by name or phone"
              value={filters.search || ""}
              onChange={handleChange}
            />
          </div>

          {/* Status dropdown */}
          <div className="col-md-3">
            {loadingStatuses ? (
              <div className={`form-control ${styles.input} text-muted`}>
                Loading statuses...
              </div>
            ) : (
              <select
                name="status_id"
                className={`form-select ${styles.input}`}
                value={filters.status_id || ""}
                onChange={handleChange}
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Region dropdown (placeholder – expand later) */}
          <div className="col-md-3">
            <select
              name="region_id"
              className={`form-select ${styles.input}`}
              value={filters.region_id || ""}
              onChange={handleChange}
            >
              <option value="">All Regions</option>
              <option value="1">Addis Ababa</option>
              <option value="2">Oromia</option>
              <option value="3">Amhara</option>
              {/* Fetch real regions dynamically in future */}
            </select>
          </div>

          {/* Clear button */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={handleClear}
              disabled={Object.values(filters).every((v) => !v)}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkersFilter;
