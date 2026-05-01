import React from "react";
import styles from "../../workers/WorkerFilter/WorkerFilter.module.css";

const DeployedWorkerFilters = ({
  filters,
  partners,
  onFilterChange,
  onClear,
}) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Partner Dropdown */}
          <div className="col-md-4">
            <select
              name="partnerId"
              className={`form-select ${styles.input}`}
              value={filters.partnerId}
              onChange={onFilterChange}
            >
              <option value="">All Partners</option>
              {partners.map((p) => (
                <option key={p.id} value={p.partner_id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="col-md-3">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                Start
              </span>
              <input
                type="date"
                name="start_date"
                className="form-control"
                value={filters.start_date}
                onChange={onFilterChange}
              />
            </div>
          </div>

          <div className="col-md-3">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                End
              </span>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={filters.end_date}
                onChange={onFilterChange}
              />
            </div>
          </div>

          <div className="col-md-2 d-grid">
            <button
              className="btn btn-outline-secondary"
              onClick={onClear}
              disabled={
                !filters.partnerId && !filters.start_date && !filters.end_date
              }
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployedWorkerFilters;
