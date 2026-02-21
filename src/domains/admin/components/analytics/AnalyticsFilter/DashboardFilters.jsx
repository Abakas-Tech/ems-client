import React from "react";
import styles from "../../files/FileFilters/FileFilters.module.css"; // Reuse your existing styling

const DashboardFilters = ({ filters, onFilterChange, onClear, months }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* View Type dropdown */}
          <div className="col-md-4">
            <select
              name="period"
              className={`form-select ${styles.input}`}
              value={filters.period}
              onChange={onFilterChange}
            >
              <option value="yearly">Yearly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </div>

          {/* Select Month - Only shows if period is monthly */}
          <div className="col-md-4">
            <select
              name="month"
              className={`form-select ${styles.input}`}
              disabled={filters.period !== "monthly"}
              value={filters.month}
              onChange={onFilterChange}
              style={{ opacity: filters.period !== "monthly" ? 0.5 : 1 }}
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div className="col-md-3">
            <input
              type="number"
              name="year"
              className={`form-control ${styles.input}`}
              placeholder="Year"
              value={filters.year}
              onChange={onFilterChange}
            />
          </div>

          {/* Clear button */}
          <div className="col-md-1 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles.clearBtn}`}
              onClick={onClear}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
