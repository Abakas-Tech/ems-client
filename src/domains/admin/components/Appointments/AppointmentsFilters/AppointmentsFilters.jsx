import React from "react";
import styles from "./AppointmentsFilters.module.css";

const AppointmentsFilters = ({ filters, onChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search by title */}
          <div className="col-md-4">
            <input
              type="text"
              name="title"
              className={`form-control ${styles.input}`}
              placeholder="🔍 Search by Title"
              value={filters.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </div>

          {/* Status dropdown */}
          <div className="col-md-3">
            <select
              name="status"
              className={`form-select ${styles.input}`}
              value={filters.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start date */}
          <div className="col-md-2">
            <input
              type="date"
              name="startDate"
              className={`form-control ${styles.input}`}
              value={filters.startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="col-md-2">
            <input
              type="date"
              name="endDate"
              className={`form-control ${styles.input}`}
              value={filters.endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
            />
          </div>

          {/* Clear button */}
          <div className="col-md-1 d-grid">
            <button
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

export default AppointmentsFilters;
