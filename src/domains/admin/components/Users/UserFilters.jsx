import React from "react";
import styles from "./UserFilters.module.css";

const UserFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search (name, email, phone) */}
          <div className="col-md-4">
            <input
              type="text"
              name="search"
              className={`form-control ${styles.input}`}
              placeholder="Search name, email or phone"
              value={filters.search}
              onChange={onFilterChange}
            />
          </div>

          {/* Role dropdown */}
          <div className="col-md-3">
            <select
              name="role_id"
              className={`form-select ${styles.input}`}
              value={filters.role_id}
              onChange={onFilterChange}
            >
              <option value="">All Roles</option>
              <option value="2">Employee</option>
              <option value="3">Partner</option>
            </select>
          </div>

          {/* Status dropdown */}
          <div className="col-md-3">
            <select
              name="is_active"
              className={`form-select ${styles.input}`}
              value={filters.is_active}
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

export default UserFilters;
