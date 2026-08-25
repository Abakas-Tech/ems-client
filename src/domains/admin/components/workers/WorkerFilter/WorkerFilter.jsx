import React, { useEffect, useState } from "react";
import { getWorkerStatuses } from "../../../api/meta.api";
import useloader from "../../../../../context/Loader/useLoader";

import styles from "./WorkerFilter.module.css";

const WorkerFilter = ({ filters, onFilterChange, onClear }) => {
  const { showLoader, hideLoader } = useloader();

  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchMeta = async () => {
      showLoader();
      try {
        const response = await getWorkerStatuses();
        const statusData = response?.data || [];

        if (!mounted) return;

        setStatuses(statusData);
      } catch {
        console.error("Failed to fetch employee statuses:");
        setStatuses([]);
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
    <div className={`card shadow-sm my-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search — REMOVED: passport_number and labour_id inputs below.
              The query layer now matches search against name, phone,
              labour_id, and passport_number all in one field, so a
              separate input for each is redundant. Widened this column
              and updated the placeholder to reflect the wider match. */}
          <div className="col-12 col-sm-6 col-lg-5">
            <input
              type="text"
              name="search"
              className={`form-control ${styles.input}`}
              placeholder="Search by name, phone, passport, or labour ID"
              value={filters.search || ""}
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div className="col-6 col-sm-3 col-lg-3">
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

          {/* Active / Inactive — doubles as the Active/Archived toggle now
              that the archived page has been folded into this list. */}
          <div className="col-6 col-sm-3 col-lg-2">
            <select
              name="is_active"
              className={`form-select ${styles.input}`}
              value={filters.is_active || ""}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Archived</option>
            </select>
          </div>

          {/* Clear */}
          <div className="col-12 col-sm-4 col-lg-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
              disabled={Object.values(filters).every((v) => !v)}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerFilter;
