// src/components/workers/ActiveWorkersFilters.jsx
import React, { useEffect, useState } from "react";
import { getWorkerStatuses } from "../../../api/meta.api";
import { getRegions } from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";
import styles from "./WorkersFilter.module.css";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

const WorkersFilter = ({ filters, onFilterChange, onClear }) => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [statuses, setStatuses] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchMeta = async () => {
      showLoader();
      try {
        const [statusData, regionData] = await Promise.all([
          getWorkerStatuses(),
          getRegions(),
        ]);

        if (!mounted) return;

        setStatuses(Array.isArray(statusData) ? statusData : []);
        setRegions(Array.isArray(regionData) ? regionData : []);
      } catch (err) {
        addMessage(false, "Failed to load filters data");
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
  }, [showLoader, hideLoader, addMessage]);

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

export default WorkersFilter;
