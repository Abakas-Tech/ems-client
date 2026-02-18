import React from "react";
import styles from "./EmployerFilters.module.css";

const EmployerFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search (name or phone) */}
          <div className="col-md-4">
            <input
              type="text"
              name="search"
              className={`form-control ${styles.input}`}
              placeholder="Search name or phone"
              value={filters.search || ""}
              onChange={onFilterChange}
            />
          </div>

          {/* Country dropdown */}
          <div className="col-md-3">
            <select
              name="country"
              className={`form-select ${styles.input}`}
              value={filters.country || ""}
              onChange={onFilterChange}
            >
              <option value="">All Countries</option>
              {/* You can dynamically generate country options */}
              <option value="USA">USA</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="India">India</option>
            </select>
          </div>

          {/* Status dropdown */}
          <div className="col-md-3">
            <select
              name="is_active"
              className={`form-select ${styles.input}`}
              value={filters.is_active || ""}
              onChange={onFilterChange}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Clear button */}
          <div className="col-md-2 d-grid">
            <button
              type="button"
              className={`btn btn-outline-secondary ${styles.clearBtn}`}
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerFilters;
