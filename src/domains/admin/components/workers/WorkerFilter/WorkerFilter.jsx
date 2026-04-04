import React, { useEffect, useState } from "react";
import { getWorkerStatuses } from "../../../api/meta.api";
import { getRegions } from "../../../api/meta.api";
import useloader from "../../../../../context/Loader/useLoader";

import styles from "./WorkerFilter.module.css";

const WorkerFilter = ({ filters, onFilterChange, onClear }) => {
  const { showLoader, hideLoader } = useloader();

  const [statuses, setStatuses] = useState([]);
  const [regions, setRegions] = useState([]);

  // Fetch statuses and regions for filters
  useEffect(() => {
    let mounted = true;

    const fetchMeta = async () => {
      showLoader();
      try {
        const response = await getWorkerStatuses();
        const statusData = response?.data || [];
        const regionResponse = await getRegions();
        const regionData = regionResponse?.data || [];

        if (!mounted) return;

        setStatuses(statusData);
        setRegions(regionData);
      } catch {
        console.error("Failed to fetch worker statuses or regions:");
        setStatuses([]);
        setRegions([]);
      } finally {
        hideLoader();
      }
    };

    fetchMeta();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || undefined });
  };

  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search */}
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

          {/* Status */}
          <div className="col-md-3">
            <select
              name="status_id"
              className={`form-select ${styles.input}`}
              value={filters.status_id || ""}
              onChange={handleChange}
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div className="col-md-3">
            <select
              name="region_id"
              className={`form-select ${styles.input}`}
              value={filters.region_id || ""}
              onChange={handleChange}
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
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

export default WorkerFilter;
