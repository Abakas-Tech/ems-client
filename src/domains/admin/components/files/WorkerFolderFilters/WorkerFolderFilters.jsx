import React from "react";
import styles from "../FileFilters/FileFilters.module.css";

const WorkerFolderFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Name search */}
          <div className="col-md-4">
            <input
              type="text"
              name="name"
              className={`form-control ${styles.input}`}
              placeholder="Search by Name"
              value={filters.name}
              onChange={onFilterChange}
            />
          </div>

          {/* Passport search */}
          <div className="col-md-3">
            <input
              type="text"
              name="passport"
              className={`form-control ${styles.input}`}
              placeholder="Search by Passport"
              value={filters.passport}
              onChange={onFilterChange}
            />
          </div>

          {/* Labour ID search */}
          <div className="col-md-3">
            <input
              type="text"
              name="labourId"
              className={`form-control ${styles.input}`}
              placeholder="Search by Labour ID"
              value={filters.labourId}
              onChange={onFilterChange}
            />
          </div>

          {/* Clear button */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
              disabled={!filters.name && !filters.passport && !filters.labourId}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerFolderFilters;
